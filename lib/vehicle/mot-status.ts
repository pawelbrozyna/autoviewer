import type { VehicleSummary } from "@/types/vehicle";

type MotStatus = VehicleSummary["motStatus"]["status"];

/** Label for the MOT date row: an expiry date normally, a due date before the first MOT. */
export function motDateLabel(status: MotStatus, expiryLabel: string): string {
  return status === "First MOT due" ? "MOT due date" : expiryLabel;
}
