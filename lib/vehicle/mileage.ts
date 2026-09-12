import type { MileagePoint } from "@/types/vehicle";

export function detectMileageAnomaly(points: MileagePoint[]): {
  hasAnomaly: boolean;
  message: string | null;
} {
  if (points.length < 2) {
    return { hasAnomaly: false, message: null };
  }

  const sorted = [...points].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    if (curr.mileage + 500 < prev.mileage) {
      return {
        hasAnomaly: true,
        message:
          "Possible mileage inconsistency: a later reading is materially lower than an earlier reading.",
      };
    }
  }

  return { hasAnomaly: false, message: null };
}

export function formatMileage(value?: number | null, unit: "mi" | "km" = "mi"): string {
  if (value == null || Number.isNaN(value)) return "-";
  return `${value.toLocaleString("en-GB")} ${unit === "mi" ? "miles" : "km"}`;
}
