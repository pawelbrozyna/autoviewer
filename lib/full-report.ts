import { normalizeRegistration } from "@/lib/vehicle/registration";

export const FULL_REPORT_PRICE = "£7.99";
export const FULL_REPORT_AMOUNT_PENCE = 799;
export const FULL_REPORT_CURRENCY = "gbp";
export const FULL_REPORT_PRODUCT_NAME = "AutoViewer Full Vehicle Report";
export const FULL_REPORT_CHECKOUT_PATH = "/api/checkout/full-report";

export const CHECKOUT_SOURCES = ["vehicle", "example", "full-report", "home"] as const;
export type CheckoutSource = (typeof CHECKOUT_SOURCES)[number];

export function parseCheckoutSource(value: unknown): CheckoutSource | null {
  return CHECKOUT_SOURCES.find((source) => source === value) ?? null;
}

const REPORT_ID_PATTERN = /^AV-[A-Z0-9]{2,8}-\d{8}$/;

export function sanitizeReportId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().toUpperCase();
  return REPORT_ID_PATTERN.test(trimmed) ? trimmed : null;
}

export const FREE_REPORT_FEATURES = [
  "Vehicle details",
  "Tax status",
  "MOT status",
  "MOT history",
  "Mileage history",
  "MOT advisories",
  "Basic specification",
  "Available recall information",
] as const;

export const PLANNED_FULL_REPORT_FEATURES = [
  "Outstanding finance",
  "Write-off history",
  "Stolen vehicle check",
  "Previous owners and keepers",
  "Keeper change history",
  "Manufacturer recall information",
] as const;

export function fullReportHref(registration?: string | null): string {
  const normalized = normalizeRegistration(registration ?? "");
  return normalized
    ? `/full-report?registration=${encodeURIComponent(normalized)}`
    : "/full-report";
}
