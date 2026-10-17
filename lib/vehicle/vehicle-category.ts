/**
 * Trusted local/fleet vehicle category for Full Report eligibility.
 *
 * Only high-confidence exact-registration or structured fleet mappings set
 * public_service / specialist. Generic make/model, UNKNOWN API data, or
 * commercial body type alone must stay "standard".
 */

export type VehicleCategory = "standard" | "public_service" | "specialist";

export const FULL_REPORT_UNAVAILABLE_BUTTON =
  "Full report unavailable for this vehicle";

export const FULL_REPORT_UNAVAILABLE_REASON =
  "This vehicle is part of a specialist or public-service fleet, so a standard buyer report isn't available.";

/** Categories that use the disabled Full Report CTA (no Stripe / no price). */
const FULL_REPORT_INELIGIBLE: ReadonlySet<VehicleCategory> = new Set([
  "public_service",
  "specialist",
]);

export function isFullReportEligible(
  category: VehicleCategory | null | undefined,
): boolean {
  if (!category) return true;
  return !FULL_REPORT_INELIGIBLE.has(category);
}

/**
 * Resolve category from a trusted local knowledge tier plus an optional
 * explicit category on an exact-registration mapping (fire, ambulance, etc.).
 */
export function resolveVehicleCategory(input: {
  tier?: "exact" | "fleet-tfl" | "fleet-sheffield" | null;
  /** Explicit mark on exact-registration special-vehicle data. */
  exactCategory?: VehicleCategory | null;
}): VehicleCategory {
  const { tier, exactCategory } = input;
  if (tier === "fleet-sheffield" || tier === "fleet-tfl") {
    return "public_service";
  }
  if (tier === "exact") {
    if (exactCategory === "public_service" || exactCategory === "specialist") {
      return exactCategory;
    }
    // Exact special-vehicle map entries are specialist/public by dataset purpose.
    return "specialist";
  }
  return "standard";
}
