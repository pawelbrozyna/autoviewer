import { NextResponse } from "next/server";
import { getMockVehicle } from "@/lib/api/mock";
import {
  buildReportMessage,
  normalizeEmail,
} from "@/lib/mail/messages";
import {
  getMailConfig,
  logMailError,
  MailConfigurationError,
  sendMail,
} from "@/lib/server/mail";
import { isValidRegistrationFormat } from "@/lib/vehicle/registration";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { email?: unknown };
  try {
    body = (await request.json()) as { email?: unknown };
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

  const vehicle = getMockVehicle("AV19SWF");
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

  const reportUrl = new URL(
    "/example-report",
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
