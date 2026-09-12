/** UK imperial gallon in litres (for MPG → litre cost conversion). */
export const LITRES_PER_IMPERIAL_GALLON = 4.54609;

/** Default assumed annual mileage for comparison fuel-cost estimates. */
export const DEFAULT_ANNUAL_MILEAGE = 8000;

/**
 * Central UK fuel price assumption (£/litre).
 * Keep this in one place - do not duplicate in UI components.
 * Update periodically; not a live market feed.
 */
export const DEFAULT_FUEL_PRICE_PER_LITRE_GBP = 1.45;

export function calculateAnnualFuelCost({
  annualMileage,
  mpg,
  fuelPricePerLitre,
}: {
  annualMileage: number;
  mpg: number | null | undefined;
  fuelPricePerLitre: number;
}): number | null {
  if (mpg == null || !Number.isFinite(mpg) || mpg <= 0) return null;
  if (!Number.isFinite(annualMileage) || annualMileage <= 0) return null;
  if (!Number.isFinite(fuelPricePerLitre) || fuelPricePerLitre <= 0) {
    return null;
  }

  const gallonsUsed = annualMileage / mpg;
  const litresUsed = gallonsUsed * LITRES_PER_IMPERIAL_GALLON;
  return Math.round(litresUsed * fuelPricePerLitre);
}

export function formatAnnualFuelCost(amount: number | null): string {
  if (amount == null) return "-";
  return `£${amount.toLocaleString("en-GB")} / year`;
}
