import "server-only";

import { existsSync } from "node:fs";
import path from "node:path";
import specialVehicleRegistrations from "@/data/special-vehicle-registrations.json";
import vehicleImagesLibrary from "@/data/vehicle-images.json";
import type { resolveImageFieldsForVehicle } from "@/lib/vehicle/images";
import { normalizeRegistration } from "@/lib/vehicle/registration";

/**
 * Exact registration image selection for special and fleet vehicles.
 * Only chooses the representative image; never changes DVSA/DVLA facts.
 * Returns null when the plate is not mapped, so TfL, Sheffield and the
 * generic make/model matcher can run afterwards.
 * Make and model text never select a mapping.
 */

type VehicleImageFields = ReturnType<typeof resolveImageFieldsForVehicle>;

export type SpecialVehicleRegistration = {
  registration: string;
  make: string;
  model: string;
  body: string;
  imageRecordId: number;
  source: string;
};

type CatalogueImage = {
  priority: number;
  filename: string;
};

const catalogueById = new Map<number, CatalogueImage>(
  (vehicleImagesLibrary.vehicles as CatalogueImage[]).map((record) => [
    record.priority,
    record,
  ]),
);

const byRegistration = new Map<string, SpecialVehicleRegistration>();
for (const vehicle of specialVehicleRegistrations.vehicles as SpecialVehicleRegistration[]) {
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

export function findSpecialVehicleRegistration(
  registration: string | null | undefined,
): SpecialVehicleRegistration | null {
  if (!registration) return null;
  return byRegistration.get(normalizeRegistration(registration)) ?? null;
}

export function resolveSpecialVehicleImageFields(
  registration: string | null | undefined,
): VehicleImageFields | null {
  const vehicle = findSpecialVehicleRegistration(registration);
  if (!vehicle) return null;

  const label = `${vehicle.source}: ${vehicle.make} ${vehicle.model} (${vehicle.body})`;
  const record = catalogueById.get(vehicle.imageRecordId);
  const filename = record?.filename?.trim() || null;
  if (!record || !filename) {
    return placeholderFields(
      `${label}. Catalogue record ${vehicle.imageRecordId} is not available.`,
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
