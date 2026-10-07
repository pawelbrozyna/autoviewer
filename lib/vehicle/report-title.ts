import type { VehicleSummary } from "@/types/vehicle";

/**
 * Report heading ("2022 Vauxhall Combo") and the variant moved out of it.
 * Records stored before `modelTitle` existed keep the full model in the heading.
 */
export function reportVehicleTitle(
  summary: Pick<VehicleSummary, "year" | "make" | "model" | "modelTitle" | "modelVariant">,
): { title: string; variant: string | null } {
  const cleanModel = summary.modelTitle?.trim();
  return {
    title: [summary.year, summary.make, cleanModel || summary.model]
      .filter(Boolean)
      .join(" "),
    variant: cleanModel ? summary.modelVariant?.trim() || null : null,
  };
}
