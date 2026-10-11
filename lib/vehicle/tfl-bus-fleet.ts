import "server-only";

import { existsSync } from "node:fs";
import path from "node:path";
import tflBusFleet from "@/data/tfl-bus-fleet.json";
import type { resolveImageFieldsForVehicle } from "@/lib/vehicle/images";
import { normalizeRegistration } from "@/lib/vehicle/registration";

/**
 * London bus image selection from the TfL fleet annual audit.
 * Only chooses the representative image; never changes DVSA facts.
 * Returns null when the registration or its bus type is not mapped,
 * so the caller falls through to the normal image matcher.
 */

type VehicleImageFields = ReturnType<typeof resolveImageFieldsForVehicle>;

export type TflBusType = {
  chassis: string;
  body: string;
  deck: "single" | "double";
  /** Catalogue filename, "placeholder" when no accurate image exists yet, or null when unreviewed. */
  image: string | null;
};

const types = tflBusFleet.types as TflBusType[];
const vehicles = tflBusFleet.vehicles as Record<string, number>;

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

export function findTflBusType(registration: string | null | undefined): TflBusType | null {
  if (!registration) return null;
  const index = vehicles[normalizeRegistration(registration)];
  return index === undefined ? null : (types[index] ?? null);
}

export function resolveTflBusImageFields(
  registration: string | null | undefined,
): VehicleImageFields | null {
  const bus = findTflBusType(registration);
  if (!bus?.image) return null;

  const label = `TfL fleet data: ${bus.chassis} / ${bus.body}, ${bus.deck} deck`;
  if (bus.image === "placeholder") {
    return placeholderFields(`${label}. No accurate representative image is available yet.`);
  }
  if (imageFileIsMissing(bus.image)) {
    return placeholderFields(`${label}. The mapped image ${bus.image} is not available yet.`);
  }
  return {
    imageSrc: `/cars/${bus.image}`,
    imageIsRepresentative: false,
    imageMatch: "exact",
    imageConfidence: "high",
    imageMatchReason: `${label}.`,
    imageFallbackUsed: false,
    imageMatchAmbiguous: false,
  };
}
