import "server-only";

import { existsSync } from "node:fs";
import path from "node:path";
import sheffieldCouncilFleet from "@/data/sheffield-council-fleet.json";
import type { resolveImageFieldsForVehicle } from "@/lib/vehicle/images";
import { normalizeRegistration } from "@/lib/vehicle/registration";

/**
 * Sheffield City Council fleet image selection from the council registration list.
 * Only chooses the representative image; never changes DVSA/DVLA facts.
 * Exact registration match only. Returns null when the plate is not in the
 * database, so the caller falls through to the normal image matcher.
 */

type VehicleImageFields = ReturnType<typeof resolveImageFieldsForVehicle>;

export type SheffieldCouncilVehicle = {
  registration: string;
  make: string;
  model: string;
  type: string;
  bodyManufacturer: string;
  /** Catalogue filename, or null/empty when no family is mapped yet. */
  imageFilename: string | null;
};

const vehicles = sheffieldCouncilFleet.vehicles as SheffieldCouncilVehicle[];

const byRegistration = new Map<string, SheffieldCouncilVehicle>();
for (const vehicle of vehicles) {
  byRegistration.set(normalizeRegistration(vehicle.registration), vehicle);
}

const CARS_DIR = path.join(process.cwd(), "public", "cars");
const imagePresence = new Map<string, boolean>();

/** Deployments without public/ on disk serve images from the CDN, so only a local miss counts. */
function imageFileIsMissing(filename: string): boolean {
  let missing = imagePresence.get(filename);
  if (missing === undefined) {
    missing = existsSync(CARS_DIR) && !existsSync(path.join(CARS_DIR, filename));
    imagePresence.set(filename, missing);
  }
  return missing;
}

function placeholderFields(reason: string): VehicleImageFields {
  return {
    imageSrc: null,
    imageIsRepresentative: false,
    imageMatch: "placeholder",
    imageConfidence: "low",
    imageMatchReason: reason,
    imageFallbackUsed: true,
    imageMatchAmbiguous: false,
  };
}

export function findSheffieldCouncilVehicle(
  registration: string | null | undefined,
): SheffieldCouncilVehicle | null {
  if (!registration) return null;
  return byRegistration.get(normalizeRegistration(registration)) ?? null;
}

export function resolveSheffieldCouncilImageFields(
  registration: string | null | undefined,
): VehicleImageFields | null {
  const vehicle = findSheffieldCouncilVehicle(registration);
  if (!vehicle) return null;

  const filename = vehicle.imageFilename?.trim() || null;
  const label = `Sheffield Council fleet: ${vehicle.make} ${vehicle.model} (${vehicle.type})`;
  if (!filename || filename === "placeholder") {
    return placeholderFields(
      `${label}. No accurate representative image is available yet.`,
    );
  }
  if (imageFileIsMissing(filename)) {
    return placeholderFields(
      `${label}. The mapped image ${filename} is not available yet.`,
    );
  }
  return {
    imageSrc: `/cars/${filename}`,
    imageIsRepresentative: false,
    imageMatch: "exact",
    imageConfidence: "high",
    imageMatchReason: `${label}.`,
    imageFallbackUsed: false,
    imageMatchAmbiguous: false,
  };
}
