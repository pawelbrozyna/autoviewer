import { NextResponse } from "next/server";
import { getMockVehicle } from "@/lib/api/mock";
import {
  buildReportMessage,
  normalizeEmail,
} from "@/lib/mail/messages";
import {
  FREE_EMAIL_LIMIT_MESSAGE,
  getRequestIp,
  tryConsumeFreeReportEmail,
} from "@/lib/server/free-email-limits";
import {
  getMailConfig,
  logMailError,
  MailConfigurationError,
  sendMail,
} from "@/lib/server/mail";
import { lookupVehicle } from "@/lib/api/vehicle-service";
import {
  isValidRegistrationFormat,
  normalizeRegistration,
  registrationToSlug,
} from "@/lib/vehicle/registration";
import type { VehicleRecord } from "@/types/vehicle";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { email?: unknown; registration?: unknown };
  try {
    body = (await request.json()) as {
      email?: unknown;
      registration?: unknown;
    };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = normalizeEmail(body.email);
  if (!email) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  const requestedRegistration =
    typeof body.registration === "string"
      ? normalizeRegistration(body.registration)
      : "";

  let vehicle: VehicleRecord | null;
  let reportPath: string;
  if (requestedRegistration) {
    if (!isValidRegistrationFormat(requestedRegistration)) {
      return NextResponse.json(
        { error: "Enter a valid UK registration number." },
        { status: 400 },
      );
    }
    const result = await lookupVehicle(requestedRegistration);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.code === "NOT_FOUND" ? 404 : 502 },
      );
    }
    vehicle = result.data;
    reportPath = `/vehicle/${registrationToSlug(vehicle.summary.registration)}`;
  } else {
    vehicle = getMockVehicle("AV19SWF");
    reportPath = "/example-report";
    if (
      !vehicle ||
      !isValidRegistrationFormat(vehicle.summary.registration)
    ) {
      console.error("Example report vehicle configuration is invalid.");
      return NextResponse.json(
        { error: "Failed to prepare report." },
        { status: 500 },
      );
    }
  }

  const allowed = await tryConsumeFreeReportEmail({
    ip: getRequestIp(request),
    email,
    registration: vehicle.summary.registration,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: FREE_EMAIL_LIMIT_MESSAGE },
      { status: 429 },
    );
  }

  const reportUrl = new URL(
    reportPath,
    process.env.NEXT_PUBLIC_SITE_URL || request.url,
  ).toString();

  try {
    const config = getMailConfig();
    await sendMail(
      config,
      buildReportMessage(config, {
        recipient: email,
        vehicle,
        reportUrl,
      }),
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    logMailError("Example report email delivery failed.", error);
    return NextResponse.json(
      {
        error:
          error instanceof MailConfigurationError
            ? "Email delivery is not configured."
            : "Failed to send report.",
      },
      { status: error instanceof MailConfigurationError ? 503 : 502 },
    );
  }
}
