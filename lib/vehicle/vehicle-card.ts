import { reportVehicleTitle } from "@/lib/vehicle/report-title";
import type { VehicleRecord } from "@/types/vehicle";

export type VehicleCardStatKey =
  | "fuel"
  | "engine"
  | "transmission"
  | "power"
  | "mileage"
  | "firstRegistered"
  | "co2"
  | "euro"
  | "mot"
  | "tax"
  | "year";

export type VehicleCardStat = {
  key: VehicleCardStatKey;
  label: string;
  value: string;
};

export const VEHICLE_CARD_MAX_STATS = 9;

export const VEHICLE_CARD_DISCLAIMER = "Illustrative image. Actual vehicle may differ.";

/**
 * Presentation data for the Vehicle Card, built only from fields already in the report.
 * Unavailable fields are left out rather than guessed, so a future 1080x1350 share image
 * can render from the same object.
 */
export type VehicleCardData = {
  registration: string;
  title: string;
  variant: string | null;
  colour: string | null;
  imageSrc: string | null;
  imageAlt: string;
  disclaimer: string;
  /** "90 bhp · 1.2L · Manual", only when power, engine size and gearbox are all known. */
  performanceLine: string | null;
  /** Up to nine facts in priority order. */
  stats: VehicleCardStat[];
  isDemo: boolean;
};

function formatShortMonthYear(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value.length === 7 ? `${value}-01T12:00:00Z` : value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(date)
    .replace(/^Sept\b/, "Sep");
}

function formatEuroStatus(value?: string | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.replace(/^euro\s*/i, "Euro ");
}

function latestMileage(vehicle: VehicleRecord): string | null {
  const mileage = vehicle.summary.latestMileage;
  if (mileage == null || mileage <= 0) return null;
  const latestTest = vehicle.motTests
    .filter((test) => test.odometerValue === mileage)
    .sort((a, b) => b.completedDate.localeCompare(a.completedDate))[0];
  const unit = latestTest?.odometerUnit === "km" ? "km" : "mi";
  return `${mileage.toLocaleString("en-GB")} ${unit}`;
}

function stat(
  key: VehicleCardStatKey,
  label: string,
  value: string | null | undefined,
): VehicleCardStat | null {
  const trimmed = value?.trim();
  return trimmed ? { key, label, value: trimmed } : null;
}

export function buildVehicleCardData(vehicle: VehicleRecord): VehicleCardData {
  const { summary, details } = vehicle;
  const { title, variant } = reportVehicleTitle(summary);
  const colour = summary.colour?.trim() || details.colour?.trim() || null;
  const engineCapacity = summary.engineCapacity ?? details.engineCapacity ?? null;
  const year = details.yearOfManufacture ?? summary.year ?? null;
  const motStatus = summary.motStatus.status;
  const taxStatus = summary.tax.status;
  const hasEngine = engineCapacity != null && engineCapacity > 0;
  const transmission = (summary.transmission || details.transmission)?.trim() || null;
  const power = summary.powerBhp != null && summary.powerBhp > 0 ? `${summary.powerBhp} bhp` : null;

  // Body type and drive type sit between MOT and tax in priority once a source provides them.
  const stats = [
    stat("fuel", "Fuel", summary.fuelType || details.fuelType),
    stat("engine", "Engine", hasEngine ? `${engineCapacity.toLocaleString("en-GB")} cc` : null),
    stat("transmission", "Gearbox", transmission),
    stat("power", "Power", power),
    stat("mileage", "Mileage", latestMileage(vehicle)),
    stat("firstRegistered", "Registered", formatShortMonthYear(details.monthOfFirstRegistration)),
    stat("co2", "CO₂", details.co2Emissions != null ? `${details.co2Emissions} g/km` : null),
    stat("euro", "Euro", formatEuroStatus(details.euroStatus)),
    stat("mot", "MOT", motStatus !== "Unknown" ? motStatus : null),
    stat("tax", "Tax", taxStatus !== "Unknown" ? taxStatus : null),
    stat("year", "Year", year != null ? String(year) : null),
  ]
    .filter((item): item is VehicleCardStat => item !== null)
    .slice(0, VEHICLE_CARD_MAX_STATS);

  const performanceLine =
    power && hasEngine && transmission
      ? `${power} · ${(engineCapacity / 1000).toFixed(1)}L · ${transmission}`
      : null;

  return {
    registration: summary.displayRegistration,
    title,
    variant,
    colour,
    imageSrc: summary.imageSrc ?? null,
    imageAlt: `Illustrative image of a ${title}`,
    disclaimer: colour
      ? `${VEHICLE_CARD_DISCLAIMER} Registered colour: ${colour}`
      : VEHICLE_CARD_DISCLAIMER,
    performanceLine,
    stats,
    isDemo: summary.isDemo,
  };
}
