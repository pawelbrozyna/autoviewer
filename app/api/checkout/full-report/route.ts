import { NextResponse } from "next/server";
import { parseCheckoutSource, sanitizeReportId } from "@/lib/full-report";
import { createFullReportCheckoutSession } from "@/lib/server/stripe";
import {
  isValidRegistrationFormat,
  normalizeRegistration,
} from "@/lib/vehicle/registration";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function redirectTo(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), 303);
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return redirectTo(request, "/full-report?checkout=error");
  }

  const source = parseCheckoutSource(form.get("source")) ?? "vehicle";
  const registrationRaw = form.get("registration");
  const normalized = normalizeRegistration(
    typeof registrationRaw === "string" ? registrationRaw : "",
  );
  const isGeneric = source === "example" || source === "home";
  const registration =
    !isGeneric && isValidRegistrationFormat(normalized) ? normalized : null;

  if (source === "vehicle" && !registration) {
    return redirectTo(request, "/full-report?checkout=error");
  }

  const errorPath =
    source === "home"
      ? "/?checkout=error"
      : source === "example"
      ? "/example-report?checkout=error"
      : registration
        ? `/full-report?registration=${encodeURIComponent(registration)}&checkout=error`
        : "/full-report?checkout=error";

  try {
    const checkoutUrl = await createFullReportCheckoutSession({
      source,
      registration,
      reportId: isGeneric ? null : sanitizeReportId(form.get("reportId")),
      origin: new URL(request.url).origin,
    });
    return NextResponse.redirect(checkoutUrl, 303);
  } catch (error) {
    console.error("[stripe] checkout session creation failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return redirectTo(request, errorPath);
  }
}
