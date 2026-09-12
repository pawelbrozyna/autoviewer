import vehicleImagesLibrary from "@/data/vehicle-images.json";

export type VehicleImageMatchKind = "exact" | "nearest-generation" | "placeholder";

export type VehicleImageEntry = {
  priority: number;
  make: string;
  model: string;
  generation: string;
  yearFrom: number;
  yearTo: number;
  bodyType: string;
  filename: string;
};

export type VehicleImageResolution = {
  /** Public path under /public, or null for generic icon placeholder. */
  src: string | null;
  match: VehicleImageMatchKind;
  /** True when a same-model nearest generation was used instead of an exact year match. */
  isRepresentative: boolean;
  generation: string | null;
  yearFrom: number | null;
  yearTo: number | null;
  filename: string | null;
};

const CARS_PUBLIC_DIR = "/cars";

/** Used when no same-model image exists. Components fall back to the generic icon. */
export const GENERIC_VEHICLE_IMAGE_SRC: string | null = null;

const libraryEntries = (vehicleImagesLibrary.vehicles ?? []) as VehicleImageEntry[];

function normalizeKey(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function publicPathFor(filename: string): string {
  return `${CARS_PUBLIC_DIR}/${filename}`;
}

function yearDistance(year: number, from: number, to: number): number {
  if (year >= from && year <= to) return 0;
  if (year < from) return from - year;
  return year - to;
}

/**
 * Find the catalog model for this make, never crossing to a different model.
 * Prefers longer model names first ("Range Rover Evoque" before "Range").
 */
export function matchCatalogModel(
  make: string,
  model: string,
  entries: VehicleImageEntry[] = libraryEntries,
): string | null {
  const makeKey = normalizeKey(make);
  const modelKey = normalizeKey(model);
  if (!makeKey || !modelKey) return null;

  const candidates = [
    ...new Set(
      entries
        .filter((entry) => normalizeKey(entry.make) === makeKey)
        .map((entry) => entry.model),
    ),
  ].sort(
    (a, b) => normalizeKey(b).length - normalizeKey(a).length || a.localeCompare(b),
  );

  for (const candidate of candidates) {
    const candidateKey = normalizeKey(candidate);
    if (modelKey === candidateKey) return candidate;
    if (modelKey.startsWith(`${candidateKey} `)) return candidate;
  }

  return null;
}

function entriesForModel(
  make: string,
  catalogModel: string,
  entries: VehicleImageEntry[],
): VehicleImageEntry[] {
  const makeKey = normalizeKey(make);
  const modelKey = normalizeKey(catalogModel);
  return entries.filter(
    (entry) =>
      normalizeKey(entry.make) === makeKey &&
      normalizeKey(entry.model) === modelKey,
  );
}

function pickBestEntry(
  candidates: VehicleImageEntry[],
  year: number,
): VehicleImageEntry | null {
  if (candidates.length === 0) return null;

  const ranked = [...candidates].sort((a, b) => {
    const distA = yearDistance(year, a.yearFrom, a.yearTo);
    const distB = yearDistance(year, b.yearFrom, b.yearTo);
    if (distA !== distB) return distA - distB;
    return a.priority - b.priority;
  });

  return ranked[0] ?? null;
}

function placeholderResult(): VehicleImageResolution {
  return {
    src: GENERIC_VEHICLE_IMAGE_SRC,
    match: "placeholder",
    isRepresentative: false,
    generation: null,
    yearFrom: null,
    yearTo: null,
    filename: null,
  };
}

function toResolution(
  entry: VehicleImageEntry,
  match: Exclude<VehicleImageMatchKind, "placeholder">,
): VehicleImageResolution {
  return {
    src: publicPathFor(entry.filename),
    match,
    isRepresentative: match === "nearest-generation",
    generation: entry.generation,
    yearFrom: entry.yearFrom,
    yearTo: entry.yearTo,
    filename: entry.filename,
  };
}

/**
 * Resolve a catalogue image for make + model + year.
 * Order: exact generation → nearest same-model generation → generic placeholder.
 * Never falls back to a different model from the same manufacturer.
 */
export function resolveVehicleImage(input: {
  make?: string | null;
  model?: string | null;
  year?: number | null;
}): VehicleImageResolution {
  const make = input.make?.trim() ?? "";
  const model = input.model?.trim() ?? "";
  const year =
    input.year != null && Number.isFinite(input.year)
      ? Math.round(input.year)
      : null;

  if (!make || !model || year == null) {
    return placeholderResult();
  }

  const catalogModel = matchCatalogModel(make, model, libraryEntries);
  if (!catalogModel) {
    return placeholderResult();
  }

  const modelEntries = entriesForModel(make, catalogModel, libraryEntries);
  if (modelEntries.length === 0) {
    return placeholderResult();
  }

  const exact = modelEntries.filter(
    (entry) => year >= entry.yearFrom && year <= entry.yearTo,
  );
  if (exact.length > 0) {
    const chosen = pickBestEntry(exact, year);
    return chosen ? toResolution(chosen, "exact") : placeholderResult();
  }

  const nearest = pickBestEntry(modelEntries, year);
  if (!nearest) {
    return placeholderResult();
  }

  return toResolution(nearest, "nearest-generation");
}

/** Attach resolved image fields onto a vehicle summary in one place. */
export function resolveImageFieldsForVehicle(input: {
  make?: string | null;
  model?: string | null;
  year?: number | null;
}): {
  imageSrc: string | null;
  imageIsRepresentative: boolean;
  imageMatch: VehicleImageMatchKind;
} {
  const resolved = resolveVehicleImage(input);
  return {
    imageSrc: resolved.src,
    imageIsRepresentative: resolved.isRepresentative,
    imageMatch: resolved.match,
  };
}
