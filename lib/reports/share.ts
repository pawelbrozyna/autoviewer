import { registrationToSlug } from "@/lib/vehicle/registration";
import type { VehicleRecord } from "@/types/vehicle";

export type ShareOutcome = "shared" | "copied" | "cancelled" | "failed";

/** Web Share API with a copy-link fallback for the vehicle's report URL. */
export async function shareVehicleReport(vehicle: VehicleRecord): Promise<ShareOutcome> {
  const isDemo = vehicle.summary.isDemo;
  const url = isDemo
    ? `${window.location.origin}/example-report`
    : `${window.location.origin}/vehicle/${registrationToSlug(vehicle.summary.registration)}`;

  try {
    if (navigator.share) {
      await navigator.share(
        isDemo
          ? {
              title: "AutoViewer Example Report",
              text: "Explore a complete AutoViewer demonstration vehicle report.",
              url,
            }
          : {
              title: `AutoViewer Vehicle Report - ${vehicle.summary.displayRegistration}`,
              text: `View the AutoViewer vehicle report for ${vehicle.summary.displayRegistration}.`,
              url,
            },
      );
      return "shared";
    }
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
    try {
      await navigator.clipboard.writeText(url);
      return "copied";
    } catch {
      return "failed";
    }
  }
}
