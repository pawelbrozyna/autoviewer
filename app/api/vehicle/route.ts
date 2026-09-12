import { NextResponse } from "next/server";
import { lookupVehicle } from "@/lib/api/vehicle-service";
import {
  isValidRegistrationFormat,
  normalizeRegistration,
} from "@/lib/vehicle/registration";

export const dynamic = "force-dynamic";

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
