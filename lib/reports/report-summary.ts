import { isFullReportEligible } from "@/lib/vehicle/vehicle-category";
import type { VehicleRecord } from "@/types/vehicle";

export type ReportSummaryTone = "positive" | "attention" | "info";

export type ReportSummaryState = {
  /** Text after the "Summary:" label. */
  title: string;
  detail: string;
  tone: ReportSummaryTone;
  icon: "check" | "warning" | "info";
};

export const LIMITED_PUBLIC_DATA_TITLE = "Limited public data available";

export const LIMITED_PUBLIC_DATA_DETAIL =
  "This vehicle is part of a specialist or public-service fleet, so some standard vehicle data may not be available.";

/**
 * Free-report summary banner state.
 * Specialist / public-service fleet vehicles use a neutral info state instead
 * of the green "no issues" success styling.
 */
export function freeReportSummary(vehicle: VehicleRecord): ReportSummaryState {
  const category = vehicle.summary.vehicleCategory ?? "standard";

  if (!isFullReportEligible(category)) {
    return {
      title: LIMITED_PUBLIC_DATA_TITLE,
      detail: LIMITED_PUBLIC_DATA_DETAIL,
      tone: "info",
      icon: "info",
    };
  }

  const needsAttention =
    vehicle.summary.recalls.dataAvailable !== false &&
    vehicle.summary.recalls.hasOpenRecalls;

  if (needsAttention) {
    return {
      title: "Items need attention",
      detail: "Review the available recall information below.",
      tone: "attention",
      icon: "warning",
    };
  }

  return {
    title: "No immediate issues indicated",
    detail: vehicle.summary.isDemo
      ? "Based only on the free public and demonstration data shown in this report."
      : "Based only on the free public data shown in this report.",
    tone: "positive",
    icon: "check",
  };
}
