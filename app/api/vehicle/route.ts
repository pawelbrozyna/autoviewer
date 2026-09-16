import { NextResponse } from "next/server";
import { DvlaApiError, fetchDvlaVehicle } from "@/lib/api/dvla";
import { lookupVehicle } from "@/lib/api/vehicle-service";
import {
  isValidRegistrationFormat,
  normalizeRegistration,
} from "@/lib/vehicle/registration";

export const dynamic = "force-dynamic";

const DVLA_UAT_URL =
  "https://uat.driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles";

export async function POST(request: Request) {
  let body: { registrationNumber?: unknown };

  try {
    body = (await request.json()) as { registrationNumber?: unknown };
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const raw =
    typeof body.registrationNumber === "string"
      ? body.registrationNumber
      : "";
  const registrationNumber = normalizeRegistration(raw);

  if (!registrationNumber) {
    return NextResponse.json(
      { error: "Registration number is required." },
      { status: 400 },
    );
  }

  if (!isValidRegistrationFormat(registrationNumber)) {
    return NextResponse.json(
      { error: "Enter a valid UK registration number." },
      { status: 400 },
    );
  }

  if (!process.env.DVLA_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "DVLA API is not configured." },
      { status: 503 },
    );
  }

  try {
    const vehicle = await fetchDvlaVehicle(registrationNumber, DVLA_UAT_URL);
    return NextResponse.json(vehicle, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof DvlaApiError) {
      const status =
        error.code === "NOT_FOUND"
          ? 404
          : error.code === "RATE_LIMITED"
            ? 429
            : error.code === "BAD_REQUEST"
              ? 400
              : 502;
      const message =
        error.code === "NOT_FOUND"
          ? "Vehicle not found."
          : error.code === "RATE_LIMITED"
            ? "DVLA request limit reached. Please try again shortly."
            : error.code === "BAD_REQUEST"
              ? "DVLA rejected the registration number."
              : "DVLA service is currently unavailable.";

      return NextResponse.json({ error: message }, { status });
    }

    console.error("Unexpected DVLA lookup failure:", error);
    return NextResponse.json(
      { error: "Unable to contact DVLA." },
      { status: 502 },
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("registration") ?? "";
  const registration = normalizeRegistration(raw);

  if (!isValidRegistrationFormat(registration)) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INVALID_REGISTRATION",
          message: "Enter a valid UK registration number.",
        },
      },
      { status: 400 },
    );
  }

  const result = await lookupVehicle(registration);

  if (!result.ok) {
    const status =
      result.error.code === "NOT_FOUND"
        ? 404
        : result.error.code === "RATE_LIMITED"
          ? 429
          : result.error.code === "INVALID_REGISTRATION"
            ? 400
            : 503;

    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result, {
    status: 200,
    headers: {
      "Cache-Control": "private, max-age=60",
    },
  });
}
