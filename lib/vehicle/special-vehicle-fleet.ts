import "server-only";

import { existsSync } from "node:fs";
import path from "node:path";
import specialVehicleRegistrations from "@/data/special-vehicle-registrations.json";
import vehicleImagesLibrary from "@/data/vehicle-images.json";
import type { resolveImageFieldsForVehicle } from "@/lib/vehicle/images";
import { modelTitleFields } from "@/lib/vehicle/model-title";
import { normalizeRegistration } from "@/lib/vehicle/registration";

/**
 * Exact registration image selection for special and fleet vehicles.
 * Image choice never uses make or model text. Display identity from the
 * verified mapping wins over UNKNOWN/null/empty and over broader external
 * make/model values for the same plate. Engine, gearbox, MOT, tax and
 * similar facts are left untouched.
 * Returns null when the plate is not mapped, or when it is identity-only
 * with no imageRecordId/imageFilename, so TfL, Sheffield and the generic
 * matcher can run. A valid image mapping never falls through to the generic
 * matcher, even when DVSA/DVLA model is UNKNOWN.
 */

type VehicleImageFields = ReturnType<typeof resolveImageFieldsForVehicle>;

export type SpecialVehicleRegistration = {
  registration: string;
  make: string;
  model: string;
  body: string;
  /** Catalogue priority. Null/omitted means no catalogue id mapping. */
  imageRecordId?: number | null;
  /**
   * Optional direct filename under /public/cars. Used when set, or as a
   * fallback when imageRecordId is absent. Wins before any generic matcher.
   */
  imageFilename?: string | null;
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

function compactIdentity(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Blank, UNKNOWN, and the generic "Vehicle" fallback are not a real identity. */
export function isMissingVehicleIdentity(value: string | null | undefined): boolean {
  const trimmed = value?.trim() ?? "";
  return trimmed.length === 0 || /^(unknown|vehicle)$/i.test(trimmed);
}

/**
 * The API often shortens a make ("Mercedes" for "Mercedes-Benz").
 * A different manufacturer is left as the API sent it.
 */
function fleetMakeCompletesApiMake(apiMake: string, fleetMake: string): boolean {
  const api = compactIdentity(apiMake);
  const fleet = compactIdentity(fleetMake);
  if (!api || !fleet || api === fleet) return false;
  return fleet.startsWith(api) || api.startsWith(fleet);
}

export type FleetDisplayFields = {
  make: string;
  model: string;
  modelTitle: string;
  modelVariant: string | null;
};

/**
 * Fill display identity from an exact registration mapping.
 * Verified local make/model/body win over UNKNOWN/null/empty and over a
 * broader external model for the same mapped plate. No technical fields
 * (engine, MOT, tax) are inferred here.
 */
export function fleetDisplayFields(input: {
  registration: string | null | undefined;
  make: string;
  model: string;
}): FleetDisplayFields {
  const fleet = findSpecialVehicleRegistration(input.registration);
  let make = input.make;
  let model = input.model;
  if (fleet) {
    // Exact-registration verified identity wins over external UNKNOWN/broader values.
    if (fleet.make && !isMissingVehicleIdentity(fleet.make)) make = fleet.make;
    else if (fleetMakeCompletesApiMake(make, fleet.make)) make = fleet.make;
    if (fleet.model && !isMissingVehicleIdentity(fleet.model)) model = fleet.model;
    return {
      make,
      model,
      modelTitle: fleet.model,
      modelVariant: fleet.body,
    };
  }

  const titles = modelTitleFields(make, model);
  return {
    make,
    model,
    modelTitle: titles.modelTitle,
    modelVariant: titles.modelVariant,
  };
}

export function findSpecialVehicleRegistration(
  registration: string | null | undefined,
): SpecialVehicleRegistration | null {
  if (!registration) return null;
  return byRegistration.get(normalizeRegistration(registration)) ?? null;
}

/** Resolve the representative filename for an exact-registration mapping. */
export function resolveSpecialVehicleImageFilename(
  vehicle: SpecialVehicleRegistration,
): { filename: string | null; reason: string | null } {
  const label = `${vehicle.source}: ${vehicle.make} ${vehicle.model} (${vehicle.body})`;
  const direct = vehicle.imageFilename?.trim() || null;

  if (vehicle.imageRecordId != null) {
    const record = catalogueById.get(vehicle.imageRecordId);
    const fromCatalogue = record?.filename?.trim() || null;
    if (!fromCatalogue) {
      // Direct filename can still satisfy a catalogue id that is temporarily missing.
      if (direct) return { filename: direct, reason: null };
      return {
        filename: null,
        reason: `${label}. Catalogue record ${vehicle.imageRecordId} is not available.`,
      };
    }
    return { filename: fromCatalogue, reason: null };
  }

  if (direct) return { filename: direct, reason: null };
  return { filename: null, reason: null };
}

export function resolveSpecialVehicleImageFields(
  registration: string | null | undefined,
): VehicleImageFields | null {
  const vehicle = findSpecialVehicleRegistration(registration);
  if (!vehicle) return null;

  const label = `${vehicle.source}: ${vehicle.make} ${vehicle.model} (${vehicle.body})`;
  const resolved = resolveSpecialVehicleImageFilename(vehicle);

  // Identity-only mappings leave image resolution to fleet/generic fallthrough.
  if (!resolved.filename && !resolved.reason) return null;

  if (!resolved.filename) {
    return placeholderFields(resolved.reason ?? `${label}. No image mapping.`);
  }

  if (imageFileIsMissing(resolved.filename)) {
    return placeholderFields(
      `${label}. The mapped image ${resolved.filename} is not available yet.`,
    );
  }

  return {
    imageSrc: `/cars/${resolved.filename}`,
    imageIsRepresentative: false,
    imageMatch: "exact",
    imageConfidence: "high",
    imageMatchReason: `${label}.`,
    imageFallbackUsed: false,
    imageMatchAmbiguous: false,
  };
}
