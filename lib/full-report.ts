import { normalizeRegistration } from "@/lib/vehicle/registration";

export const FULL_REPORT_PRICE = "£6.99";

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
