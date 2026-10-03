import type { VehicleRecord } from "@/types/vehicle";

/** "What we checked" entries, limited to checks the available data actually supports. */
export function checkedItems(
  vehicle: VehicleRecord,
): Array<{ title: string; detail: string }> {
  const { summary } = vehicle;
  return [
    vehicle.dataQuality.sources.includes("DVLA") ||
    vehicle.dataQuality.sources.includes("MOCK")
      ? {
          title: "DVLA registration details",
          detail: "Make, model, colour and status",
        }
      : null,
    summary.motStatus.status !== "Unknown"
      ? { title: "MOT status", detail: "Current status and history" }
      : null,
    summary.tax.status !== "Unknown"
      ? { title: "Tax status", detail: "Vehicle tax and due date" }
      : null,
    vehicle.mileageHistory.length > 1
      ? { title: "Mileage consistency", detail: "Checked for irregularities" }
      : null,
    summary.make && summary.make !== "Unknown"
      ? {
          title: "Vehicle identity basics",
          detail: "Make, model and engine details",
        }
      : null,
    vehicle.motTests.length > 0
      ? { title: "MOT advisories", detail: "Notable advisories from past tests" }
      : null,
  ].filter(
    (item): item is { title: string; detail: string } => Boolean(item),
  );
}
