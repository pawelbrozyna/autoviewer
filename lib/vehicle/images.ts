import vehicleImagesLibrary from "@/data/vehicle-images.json";

export type VehicleImageMatchKind = "exact" | "nearest-generation" | "placeholder";
export type VehicleImageConfidence = "high" | "medium" | "low";

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
  record: VehicleImageEntry | null;
  confidence: VehicleImageConfidence;
  reason: string;
  matchedFields: string[];
  fallbackUsed: boolean;
  ambiguous: boolean;
  alternatives: VehicleImageEntry[];
  /** True when a same-model nearest generation was used instead of an exact year match. */
  isRepresentative: boolean;
  generation: string | null;
  yearFrom: number | null;
  yearTo: number | null;
  filename: string | null;
};

export type VehicleImageInput = {
  registration?: string | null;
  make?: string | null;
  model?: string | null;
  derivative?: string | null;
  fuelType?: string | null;
  bodyType?: string | null;
  year?: number | null;
  firstRegistrationDate?: string | null;
  colour?: string | null;
  engineCapacity?: number | null;
  wheelplan?: string | null;
  vehicleType?: string | null;
};

const CARS_PUBLIC_DIR = "/cars";
const MAX_NEAREST_GENERATION_DISTANCE_YEARS = 3;

/** Used when no same-model image exists. Components fall back to the generic icon. */
export const GENERIC_VEHICLE_IMAGE_SRC: string | null = null;

/** Minimal make aliases applied after normalizeKey. Full catalogue makes still match as-is. */
const MAKE_ALIASES: Record<string, string> = {
  vw: "volkswagen",
  "v w": "volkswagen",
  mercedes: "mercedes benz",
  mercedesbenz: "mercedes benz",
  "mercedes benz cars": "mercedes benz",
  opel: "vauxhall",
  "vauxhall motors": "vauxhall",
  "vauxhall motors limited": "vauxhall",
  landrover: "land rover",
  "range rover": "land rover",
  "volkswagen commercial vehicles": "volkswagen",
  "ssang yong": "ssangyong",
  "kg mobility": "kgm",
};

const libraryEntries = (vehicleImagesLibrary.vehicles ?? []) as VehicleImageEntry[];

function normalizeKey(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\+/g, " plus ")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

/** Normalize make and map short aliases (VW, MERCEDES) onto catalogue forms. */
function canonicalizeMake(make: string): string {
  const key = normalizeKey(make);
  return MAKE_ALIASES[key] ?? key;
}

function publicPathFor(filename: string): string {
  return `${CARS_PUBLIC_DIR}/${filename}`;
}

function yearDistance(year: number, from: number, to: number): number {
  if (year >= from && year <= to) return 0;
  if (year < from) return from - year;
  return year - to;
}

function compactKey(value: string): string {
  return normalizeKey(value).replace(/\s+/g, "");
}

function stripLeadingMake(model: string, make: string): string {
  const modelKey = normalizeKey(model);
  const makeKey = canonicalizeMake(make);
  const makeForms = new Set([
    makeKey,
    normalizeKey(make),
    ...Object.entries(MAKE_ALIASES)
      .filter(([, canonical]) => canonical === makeKey)
      .map(([alias]) => alias),
  ]);

  for (const makeForm of [...makeForms].sort((a, b) => b.length - a.length)) {
    if (modelKey.startsWith(`${makeForm} `)) {
      return modelKey.slice(makeForm.length + 1);
    }
  }
  return modelKey;
}

function catalogModelsForMake(
  make: string,
  entries: VehicleImageEntry[],
): string[] {
  const makeKey = canonicalizeMake(make);
  return [
    ...new Set(
      entries
        .filter((entry) => canonicalizeMake(entry.make) === makeKey)
        .map((entry) => entry.model),
    ),
  ];
}

type ModelMatch = {
  model: string;
  method: "exact" | "prefix" | "compact" | "alias" | "electric-prefix";
  score: number;
};

function knownModelAlias(
  makeKey: string,
  modelKey: string,
  candidates: string[],
): string | null {
  if (makeKey === "bmw") {
    const match = modelKey.match(/^([1-5])\s*\d{2}[a-z]?\b/);
    if (match) {
      const candidate = `${match[1]} Series`;
      if (candidates.includes(candidate)) return candidate;
    }
  }

  if (makeKey === "mercedes benz") {
    const classMatch = modelKey.match(/^([abce])\s*\d{3}[a-z]?\b/);
    if (classMatch) {
      const candidate = `${classMatch[1].toUpperCase()}-Class`;
      if (candidates.includes(candidate)) return candidate;
    }
    const rangeMatch = modelKey.match(/^(gla|glc|cla)\s*\d{3}[a-z]?\b/);
    if (rangeMatch) {
      const candidate = rangeMatch[1].toUpperCase();
      if (candidates.includes(candidate)) return candidate;
    }
  }

  if (makeKey === "land rover" && modelKey.startsWith("r rover ")) {
    const expanded = `range rover ${modelKey.slice("r rover ".length)}`;
    const candidate = candidates.find((item) =>
      expanded.startsWith(normalizeKey(item)),
    );
    if (candidate) return candidate;
  }

  if (makeKey === "mg") {
    const electricModel = modelKey.match(/^mg\s*(4|5)(?:\s+ev)?\b/);
    if (electricModel) {
      const candidate = `MG${electricModel[1]} EV`;
      if (candidates.includes(candidate)) return candidate;
    }
  }

  if (
    makeKey === "fiat" &&
    /^(500\s*e|500\s+electric)\b/.test(modelKey) &&
    candidates.includes("500e")
  ) {
    return "500e";
  }

  return null;
}

function findCatalogModel(
  make: string,
  model: string,
  derivative: string,
  entries: VehicleImageEntry[],
): ModelMatch | null {
  const candidates = catalogModelsForMake(make, entries);
  if (candidates.length === 0) return null;

  const rawText = [model, derivative].filter(Boolean).join(" ");
  const modelKey = stripLeadingMake(rawText, make);
  if (!modelKey) return null;
  const modelCompact = compactKey(modelKey);
  const alias = knownModelAlias(canonicalizeMake(make), modelKey, candidates);

  const matches: ModelMatch[] = [];
  for (const candidate of candidates) {
    const candidateKey = normalizeKey(candidate);
    const candidateCompact = compactKey(candidate);
    let match: ModelMatch | null = null;

    if (modelKey === candidateKey) {
      match = { model: candidate, method: "exact", score: 100 };
    } else if (modelKey.startsWith(`${candidateKey} `)) {
      match = { model: candidate, method: "prefix", score: 95 };
    } else if (
      modelKey === `e ${candidateKey}` ||
      modelKey.startsWith(`e ${candidateKey} `) ||
      modelCompact === `e${candidateCompact}` ||
      modelCompact.startsWith(`e${candidateCompact}`)
    ) {
      match = { model: candidate, method: "electric-prefix", score: 92 };
    } else if (
      modelCompact === candidateCompact ||
      (candidateCompact.length >= 4 &&
        modelCompact.startsWith(candidateCompact))
    ) {
      match = { model: candidate, method: "compact", score: 88 };
    }

    if (alias === candidate) {
      match = { model: candidate, method: "alias", score: 98 };
    }
    if (match) matches.push(match);
  }

  return (
    matches.sort(
      (a, b) =>
        b.score - a.score ||
        normalizeKey(b.model).length - normalizeKey(a.model).length ||
        a.model.localeCompare(b.model),
    )[0] ?? null
  );
}

function parseRegistrationDate(value?: string | null): {
  year: number | null;
  month: number | null;
} {
  const match = value?.trim().match(/^(\d{4})(?:-(\d{1,2}))?/);
  if (!match) return { year: null, month: null };
  const year = Number.parseInt(match[1], 10);
  const month = match[2] ? Number.parseInt(match[2], 10) : null;
  return {
    year: Number.isInteger(year) ? year : null,
    month: month != null && month >= 1 && month <= 12 ? month : null,
  };
}

function generationClueScore(
  entry: VehicleImageEntry,
  sourceText: string,
): number {
  const text = normalizeKey(sourceText);
  if (!text) return 0;
  const textCompact = compactKey(text);
  const generationKey = normalizeKey(entry.generation);
  const generationCompact = compactKey(entry.generation);
  const variants = entry.generation
    .split("/")
    .map((part) => normalizeKey(part))
    .filter(Boolean);
  let score = 0;

  if (
    (generationKey.length >= 2 && text.includes(generationKey)) ||
    (generationCompact.length >= 3 && textCompact.includes(generationCompact))
  ) {
    score = 120;
  } else if (
    variants.some(
      (variant) =>
        variant.length >= 2 &&
        (text.includes(variant) ||
          textCompact.includes(variant.replace(/\s+/g, ""))),
    )
  ) {
    score = 100;
  }

  const faceliftInput =
    /\b(facelift|face lift|lci|phase 2|updated)\b/.test(text);
  const preFaceliftInput = /\b(pre facelift|pre face lift|phase 1)\b/.test(text);
  const faceliftEntry = /\b(facelift|lci|phase 2)\b/.test(generationKey);

  if (faceliftInput) score += faceliftEntry ? 100 : -80;
  if (preFaceliftInput) score += faceliftEntry ? -100 : 80;
  return score;
}

function normalizeBodyHints(input: VehicleImageInput): string[] {
  const text = normalizeKey(
    [input.bodyType, input.vehicleType, input.wheelplan]
      .filter(Boolean)
      .join(" "),
  );
  const hints: string[] = [];
  const rules: Array<[string, RegExp]> = [
    ["van", /\b(van|cargo|commercial|panel van|minibus)\b/],
    ["pickup", /\b(pickup|pick up)\b/],
    ["motorcycle", /\b(motorcycle|motorbike|bike)\b/],
    ["scooter", /\b(scooter|moped)\b/],
    ["mpv", /\b(mpv|people carrier)\b/],
    ["estate", /\b(estate|touring|wagon)\b/],
    ["saloon", /\b(saloon|sedan)\b/],
    ["hatchback", /\b(hatchback|hatch)\b/],
    ["suv", /\b(suv|4x4|off road)\b/],
    ["crossover", /\bcrossover\b/],
    ["coupe", /\b(coupe|convertible|cabriolet|roadster)\b/],
  ];
  for (const [bodyType, pattern] of rules) {
    if (pattern.test(text)) hints.push(bodyType);
  }
  return hints;
}

function bodyHintMatches(entry: VehicleImageEntry, hints: string[]): boolean {
  const entryBody = normalizeKey(entry.bodyType);
  return hints.some((hint) => entryBody.includes(hint));
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
  return findCatalogModel(make, model, "", entries)?.model ?? null;
}

function entriesForModel(
  make: string,
  catalogModel: string,
  entries: VehicleImageEntry[],
): VehicleImageEntry[] {
  const makeKey = canonicalizeMake(make);
  const modelKey = normalizeKey(catalogModel);
  return entries.filter(
    (entry) =>
      canonicalizeMake(entry.make) === makeKey &&
      normalizeKey(entry.model) === modelKey,
  );
}

/** Nearest generation when no year range contains the vehicle year. */
function pickNearestEntry(
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

function placeholderResult(reason: string): VehicleImageResolution {
  return {
    src: GENERIC_VEHICLE_IMAGE_SRC,
    match: "placeholder",
    record: null,
    confidence: "low",
    reason,
    matchedFields: [],
    fallbackUsed: true,
    ambiguous: false,
    alternatives: [],
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
  details: {
    confidence: VehicleImageConfidence;
    reason: string;
    matchedFields: string[];
    fallbackUsed: boolean;
    ambiguous?: boolean;
    alternatives?: VehicleImageEntry[];
  },
): VehicleImageResolution {
  return {
    src: publicPathFor(entry.filename),
    match,
    record: entry,
    confidence: details.confidence,
    reason: details.reason,
    matchedFields: details.matchedFields,
    fallbackUsed: details.fallbackUsed,
    ambiguous: details.ambiguous ?? false,
    alternatives: details.alternatives ?? [],
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
export function resolveVehicleImage(
  input: VehicleImageInput,
): VehicleImageResolution {
  const make = input.make?.trim() ?? "";
  const model = input.model?.trim() ?? "";
  const derivative = input.derivative?.trim() ?? "";
  const registrationDate = parseRegistrationDate(input.firstRegistrationDate);
  const year =
    input.year != null && Number.isFinite(input.year)
      ? Math.round(input.year)
      : registrationDate.year;

  if (!make) {
    return placeholderResult("Make is unavailable; make-only fallback is unsafe.");
  }
  if (!model) {
    return placeholderResult(
      "Model is unavailable; the matcher never falls back to another model from the same make.",
    );
  }

  const modelMatch = findCatalogModel(
    make,
    model,
    derivative,
    libraryEntries,
  );
  if (!modelMatch) {
    return placeholderResult(
      `No catalogue model matched ${make} ${model}`.trim(),
    );
  }

  const modelEntries = entriesForModel(
    make,
    modelMatch.model,
    libraryEntries,
  );
  if (modelEntries.length === 0) {
    return placeholderResult("The matched model has no catalogue image records.");
  }

  const makeExact = normalizeKey(make) === canonicalizeMake(make);
  const matchedFields = [
    makeExact ? "make:exact" : "make:alias",
    `model:${modelMatch.method}`,
  ];
  const bodyHints = normalizeBodyHints(input);
  const bodyMatched = modelEntries.some((entry) =>
    bodyHintMatches(entry, bodyHints),
  );
  if (bodyMatched) matchedFields.push("bodyType:hint");
  if (year != null) {
    matchedFields.push(
      input.year != null ? "year:manufacture" : "year:firstRegistration",
    );
  }

  if (year == null) {
    const chosen = [...modelEntries].sort(
      (a, b) => a.priority - b.priority || b.yearFrom - a.yearFrom,
    )[0];
    return toResolution(chosen, "nearest-generation", {
      confidence: "low",
      reason:
        "Year is unavailable; selected the model's highest-priority representative generation.",
      matchedFields,
      fallbackUsed: true,
      ambiguous: modelEntries.length > 1,
      alternatives: modelEntries.filter((entry) => entry !== chosen),
    });
  }

  const exact = modelEntries.filter(
    (entry) => year >= entry.yearFrom && year <= entry.yearTo,
  );
  if (exact.length === 1) {
    return toResolution(exact[0], "exact", {
      confidence:
        modelMatch.method === "compact" ? "medium" : "high",
      reason: "Matched make, model and year to one catalogue generation.",
      matchedFields: [...matchedFields, "year:single-range"],
      fallbackUsed: false,
    });
  }

  if (exact.length > 1) {
    const sourceText = [model, derivative].filter(Boolean).join(" ");
    const scored = exact
      .map((entry) => ({
        entry,
        clueScore: generationClueScore(entry, sourceText),
      }))
      .sort(
        (a, b) =>
          b.clueScore - a.clueScore ||
          b.entry.yearFrom - a.entry.yearFrom ||
          a.entry.priority - b.entry.priority,
      );
    const bestClue = scored[0];
    const nextClue = scored[1];

    if (
      bestClue.clueScore > 0 &&
      bestClue.clueScore > (nextClue?.clueScore ?? Number.NEGATIVE_INFINITY)
    ) {
      return toResolution(bestClue.entry, "exact", {
        confidence: "high",
        reason:
          "Overlapping year ranges were resolved by an explicit generation or facelift clue.",
        matchedFields: [...matchedFields, "generation:source-clue"],
        fallbackUsed: false,
        alternatives: exact.filter((entry) => entry !== bestClue.entry),
      });
    }

    const older = [...exact].sort(
      (a, b) => a.yearFrom - b.yearFrom || a.priority - b.priority,
    )[0];
    const newer = [...exact].sort(
      (a, b) => b.yearFrom - a.yearFrom || a.priority - b.priority,
    )[0];
    if (registrationDate.month != null) {
      const month = registrationDate.month;
      const hasStrongTimingSignal = month <= 4 || month >= 9;
      const chosen = month <= 4 ? older : newer;
      return toResolution(chosen, "exact", {
        confidence: hasStrongTimingSignal ? "medium" : "low",
        reason: hasStrongTimingSignal
          ? "An overlapping boundary year was resolved with a conservative registration-timing signal: January-April older, September-December newer."
          : "The May-August registration date was not a reliable generation signal; retained the deterministic newer-generation rule and marked the result ambiguous.",
        matchedFields: [
          ...matchedFields,
          hasStrongTimingSignal
            ? "firstRegistration:boundary-period"
            : "firstRegistration:inconclusive",
        ],
        fallbackUsed: false,
        ambiguous: true,
        alternatives: exact.filter((entry) => entry !== chosen),
      });
    }

    return toResolution(newer, "exact", {
      confidence: "low",
      reason:
        "An overlapping boundary year had no generation clue or registration month; retained the deterministic newer-generation rule.",
      matchedFields: [...matchedFields, "year:boundary-overlap"],
      fallbackUsed: false,
      ambiguous: true,
      alternatives: exact.filter((entry) => entry !== newer),
    });
  }

  const nearest = pickNearestEntry(modelEntries, year);
  if (!nearest) {
    return placeholderResult("No same-model generation was available.");
  }
  const nearestDistance = yearDistance(
    year,
    nearest.yearFrom,
    nearest.yearTo,
  );
  if (nearestDistance > MAX_NEAREST_GENERATION_DISTANCE_YEARS) {
    return placeholderResult(
      `The nearest same-model generation is ${nearestDistance} years away, beyond the safe ${MAX_NEAREST_GENERATION_DISTANCE_YEARS}-year fallback limit.`,
    );
  }

  return toResolution(nearest, "nearest-generation", {
    confidence: "low",
    reason:
      "No generation covers the supplied year; selected the nearest generation of the same model.",
    matchedFields: [...matchedFields, "year:nearest-range"],
    fallbackUsed: true,
    alternatives: modelEntries.filter((entry) => entry !== nearest),
  });
}

/** Attach resolved image fields onto a vehicle summary in one place. */
export function resolveImageFieldsForVehicle(input: VehicleImageInput): {
  imageSrc: string | null;
  imageIsRepresentative: boolean;
  imageMatch: VehicleImageMatchKind;
  imageConfidence: VehicleImageConfidence;
  imageMatchReason: string;
  imageFallbackUsed: boolean;
  imageMatchAmbiguous: boolean;
} {
  const resolved = resolveVehicleImage(input);
  return {
    imageSrc: resolved.src,
    imageIsRepresentative: resolved.isRepresentative,
    imageMatch: resolved.match,
    imageConfidence: resolved.confidence,
    imageMatchReason: resolved.reason,
    imageFallbackUsed: resolved.fallbackUsed,
    imageMatchAmbiguous: resolved.ambiguous,
  };
}
