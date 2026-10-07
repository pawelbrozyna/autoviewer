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
  "mercedes amg": "mercedes benz",
  opel: "vauxhall",
  "vauxhall motors": "vauxhall",
  "vauxhall motors limited": "vauxhall",
  landrover: "land rover",
  "range rover": "land rover",
  "volkswagen commercial vehicles": "volkswagen",
  "ssang yong": "ssangyong",
  "kg mobility": "kgm",
  "mg motor uk": "mg",
  "smart mcc": "smart",
  "london ev company": "levc",
  "london ev company limited": "levc",
  "london ev company ltd": "levc",
  "london taxis int": "lti",
  "london taxis international": "lti",
  "london taxi company": "lti",
  "the london taxi company": "lti",
  "alexander dennis ltd": "alexander dennis",
  "alexander dennis limited": "alexander dennis",
  adl: "alexander dennis",
  wright: "wrightbus",
  "wrightbus ltd": "wrightbus",
};

/**
 * Catalogue models that are one vehicle sold under several names (DVSA often drops
 * the suffix). Members match each other and share year ranges.
 */
const MODEL_FAMILIES: Record<string, string[][]> = {
  vauxhall: [
    ["Crossland", "Crossland X"],
    ["Grandland", "Grandland X"],
  ],
  fiat: [["Grande Punto", "Punto Evo", "Punto"]],
};

/**
 * Inputs that belong to a specific catalogue model. When that model is missing the
 * result is a placeholder, never a shorter same-make prefix ("C4 Picasso" is not "C4").
 */
const STRICT_MODEL_ALIASES: Record<
  string,
  Array<{
    pattern: RegExp;
    model: string | ((match: RegExpMatchArray) => string);
  }>
> = {
  citroen: [
    {
      pattern: /^(grand )?c4 (grand )?(picasso|spacetourer)\b/,
      model: "C4 Picasso",
    },
    { pattern: /^c3 picasso\b/, model: "C3 Picasso" },
  ],
  ford: [
    { pattern: /^grand c max\b/, model: "C-Max" },
    { pattern: /^focus c max\b/, model: "Focus C-Max" },
  ],
  renault: [
    { pattern: /^grand scenic\b/, model: "Scenic" },
    { pattern: /^grand modus\b/, model: "Modus" },
    { pattern: /^megane e tech\b/, model: "Megane E-Tech" },
    { pattern: /^scenic e tech\b/, model: "Scenic E-Tech" },
  ],
  suzuki: [{ pattern: /^sx4 s cross\b/, model: "S-Cross" }],
  kia: [{ pattern: /^pro cee ?d\b/, model: "Ceed" }],
  mazda: [{ pattern: /^([235])\b/, model: (match) => `Mazda${match[1]}` }],
  toyota: [
    { pattern: /^corolla cross\b/, model: "Corolla Cross" },
    { pattern: /^prius plus\b/, model: "Prius+" },
  ],
  volkswagen: [
    { pattern: /^golf plus\b/, model: "Golf Plus" },
    { pattern: /^golf sv\b/, model: "Golf SV" },
    { pattern: /^passat cc\b/, model: "Passat CC" },
  ],
  bmw: [
    {
      pattern: /^(?:2 series|2\d{2}[a-z]{0,2})\b.*\bgran (coupe|tourer)\b/,
      model: (match) =>
        match[1] === "coupe" ? "2 Series Gran Coupe" : "2 Series Gran Tourer",
    },
  ],
  mini: [
    { pattern: /\bcountryman\b/, model: "Countryman" },
    { pattern: /\bclubman\b/, model: "Clubman" },
    { pattern: /\bpaceman\b/, model: "Paceman" },
    { pattern: /\b(convertible|cabrio|cabriolet)\b/, model: "Convertible" },
    { pattern: /\bcoupe\b/, model: "Coupe" },
    { pattern: /\broadster\b/, model: "Roadster" },
    { pattern: /^(cooper|one|electric)\b/, model: "Hatch" },
  ],
  "mercedes benz": [
    { pattern: /^s(?:\s*\d{2,3}[a-z]?| class)?(?: |$)/, model: "S-Class" },
  ],
  mg: [{ pattern: /^zs\s*ev\b/, model: "ZS EV" }],
};

/**
 * Names whose catalogue model depends on the year. The 2016-2019 Zafira Tourer
 * facelift was sold as plain "Zafira"; earlier plain "Zafira" is the Zafira B.
 */
const YEAR_MODEL_ALIASES: Record<
  string,
  Array<{ pattern: RegExp; fromYear: number; toYear: number; model: string }>
> = {
  vauxhall: [
    {
      pattern: /^zafira(?! (?:tourer|life|e life)\b)(?: |$)/,
      fromYear: 2016,
      toYear: 2019,
      model: "Zafira Tourer",
    },
  ],
};

/** Short names that are a different vehicle from the longer catalogue model they prefix. */
const STANDALONE_SHORT_MODELS: Record<string, string[]> = {
  ford: ["mustang"],
  byd: ["seal", "dolphin"],
};

const LEADING_GENERIC_WORDS = /^(?:all )?new (?=\S)/;

const libraryEntries = (vehicleImagesLibrary.vehicles ?? []) as VehicleImageEntry[];

function modelFamily(makeKey: string, model: string): string[] | null {
  const modelKey = normalizeKey(model);
  return (
    MODEL_FAMILIES[makeKey]?.find((family) =>
      family.some((member) => normalizeKey(member) === modelKey),
    ) ?? null
  );
}

function strictModelAlias(
  makeKey: string,
  modelKey: string,
  year?: number | null,
): string | null {
  if (year != null) {
    for (const alias of YEAR_MODEL_ALIASES[makeKey] ?? []) {
      if (
        year >= alias.fromYear &&
        year <= alias.toYear &&
        alias.pattern.test(modelKey)
      ) {
        return alias.model;
      }
    }
  }
  for (const { pattern, model } of STRICT_MODEL_ALIASES[makeKey] ?? []) {
    const match = modelKey.match(pattern);
    if (match) return typeof model === "string" ? model : model(match);
  }
  return null;
}

function familyModelAlias(
  makeKey: string,
  modelKey: string,
  candidates: string[],
): string | null {
  for (const family of MODEL_FAMILIES[makeKey] ?? []) {
    const named = family
      .filter((member) => {
        const memberKey = normalizeKey(member);
        return modelKey === memberKey || modelKey.startsWith(`${memberKey} `);
      })
      .sort((a, b) => normalizeKey(b).length - normalizeKey(a).length);
    if (named.length === 0) continue;
    const present =
      named.find((member) => candidates.includes(member)) ??
      family.find((member) => candidates.includes(member));
    if (present) return present;
  }
  return null;
}

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
  method:
    | "exact"
    | "prefix"
    | "compact"
    | "alias"
    | "electric-prefix"
    | "reverse-prefix";
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
    const classMatch =
      modelKey.match(/^([abce])\s*\d{2,3}[a-z]?\b/) ??
      modelKey.match(/^([abce])(?: class)?(?: |$)/);
    if (classMatch) {
      const candidate = `${classMatch[1].toUpperCase()}-Class`;
      if (candidates.includes(candidate)) return candidate;
    }
    if (/^ml\s*\d{0,3}[a-z]?\b/.test(modelKey) && candidates.includes("M-Class")) {
      return "M-Class";
    }
    if (/^o\s*530\b/.test(modelKey) && candidates.includes("Citaro")) {
      return "Citaro";
    }
    const rangeMatch = modelKey.match(/^(gla|glc|cla)\s*\d{3}[a-z]?\b/);
    if (rangeMatch) {
      const candidate = rangeMatch[1].toUpperCase();
      if (candidates.includes(candidate)) return candidate;
    }
  }

  if (makeKey === "lexus" && /^is\s*(?:200|250|300|350)[a-z]?\b/.test(modelKey)) {
    if (candidates.includes("IS")) return "IS";
  }

  if (makeKey === "alexander dennis") {
    const candidate = /^e20d\b/.test(modelKey)
      ? "Enviro200"
      : /^e40[dh]\b/.test(modelKey)
        ? "Enviro400"
        : null;
    if (candidate && candidates.includes(candidate)) return candidate;
  }

  if (makeKey === "land rover" && modelKey.startsWith("r rover ")) {
    const expanded = `range rover ${modelKey.slice("r rover ".length)}`;
    const candidate = candidates.find((item) =>
      expanded.startsWith(normalizeKey(item)),
    );
    if (candidate) return candidate;
  }

  if (makeKey === "mg") {
    const numberedModel = modelKey.match(/^(?:mg\s*)?([345])(?:\s+ev)?\b/);
    if (numberedModel) {
      const candidate =
        numberedModel[1] === "3" ? "MG3" : `MG${numberedModel[1]} EV`;
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
  year?: number | null,
): ModelMatch | null {
  const candidates = catalogModelsForMake(make, entries);
  if (candidates.length === 0) return null;

  const rawText = [model, derivative].filter(Boolean).join(" ");
  // Make aliases can also be model prefixes ("Range Rover Sport"), so try the unstripped text too.
  const strippedKey = stripLeadingMake(rawText, make);
  const modelKeys = [
    ...new Set([
      strippedKey,
      normalizeKey(rawText),
      strippedKey.replace(LEADING_GENERIC_WORDS, ""),
    ]),
  ].filter(Boolean);

  const matches: ModelMatch[] = [];
  for (const modelKey of modelKeys) {
    matches.push(...matchModelKey(make, modelKey, candidates, year));
  }
  if (matches.length === 0) {
    for (const modelKey of modelKeys) {
      const reverse = reversePrefixMatch(make, modelKey, candidates, year);
      if (reverse) return reverse;
    }
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

function matchModelKey(
  make: string,
  modelKey: string,
  candidates: string[],
  year?: number | null,
): ModelMatch[] {
  const makeKey = canonicalizeMake(make);
  const strict = strictModelAlias(makeKey, modelKey, year);
  if (strict) {
    return candidates.includes(strict)
      ? [{ model: strict, method: "alias", score: 99 }]
      : [];
  }

  const modelCompact = compactKey(modelKey);
  const alias =
    knownModelAlias(makeKey, modelKey, candidates) ??
    familyModelAlias(makeKey, modelKey, candidates);

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
  return matches;
}

/**
 * DVSA name shorter than the catalogue name ("COMBO" for "Combo Cargo"). Only used
 * when nothing else matched, exactly one catalogue model extends the base word, and
 * neither side carries a number that could denote a different model ("Tracer 9").
 */
function reversePrefixMatch(
  make: string,
  modelKey: string,
  candidates: string[],
  year?: number | null,
): ModelMatch | null {
  const makeKey = canonicalizeMake(make);
  if (strictModelAlias(makeKey, modelKey, year)) return null;

  const [base, next] = modelKey.split(" ");
  if (!base || !/^[a-z]{3,}$/.test(base)) return null;
  if (next && !/^\d/.test(next)) return null;
  if (STANDALONE_SHORT_MODELS[makeKey]?.includes(base)) return null;

  const extending = candidates.filter((candidate) =>
    normalizeKey(candidate).startsWith(`${base} `),
  );
  if (extending.length !== 1) return null;
  const suffix = normalizeKey(extending[0]).slice(base.length + 1);
  if (/\d/.test(suffix)) return null;

  return { model: extending[0], method: "reverse-prefix", score: 80 };
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
  const modelKeys = new Set(
    (modelFamily(makeKey, catalogModel) ?? [catalogModel]).map(normalizeKey),
  );
  return entries.filter(
    (entry) =>
      canonicalizeMake(entry.make) === makeKey &&
      modelKeys.has(normalizeKey(entry.model)),
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

const FACELIFT_MARKER = /\b(facelift|face lift|lci|phase \d)\b/;

function isFaceliftEntry(entry: VehicleImageEntry): boolean {
  return FACELIFT_MARKER.test(normalizeKey(entry.generation));
}

/** "Mk2 facelift" and "Mk2" share base generation "mk2". */
function baseGeneration(entry: VehicleImageEntry): string {
  const key = normalizeKey(entry.generation);
  const marker = key.search(FACELIFT_MARKER);
  return (marker === -1 ? key : key.slice(0, marker)).trim();
}

/**
 * Entries that are provably the same generation as the vehicle year: the facelift
 * that follows a pre-facelift year, or both sides of a gap within one generation.
 * Anything else may be a different-looking generation, so it is never offered.
 */
function sameGenerationCandidates(
  candidates: VehicleImageEntry[],
  year: number,
): VehicleImageEntry[] {
  const later = candidates
    .filter((entry) => entry.yearFrom > year)
    .sort((a, b) => a.yearFrom - b.yearFrom);
  const earlier = candidates
    .filter((entry) => entry.yearTo < year)
    .sort((a, b) => b.yearTo - a.yearTo);
  const next = later[0];
  const previous = earlier[0];
  const allowed: VehicleImageEntry[] = [];

  if (next && previous && baseGeneration(next) === baseGeneration(previous)) {
    allowed.push(previous, next);
  } else if (next && isFaceliftEntry(next)) {
    allowed.push(next);
  }
  return allowed;
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
    year,
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
        modelMatch.method === "compact" ||
        modelMatch.method === "reverse-prefix"
          ? "medium"
          : "high",
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

  const closest = pickNearestEntry(modelEntries, year);
  if (!closest) {
    return placeholderResult("No same-model generation was available.");
  }
  const closestDistance = yearDistance(
    year,
    closest.yearFrom,
    closest.yearTo,
  );
  if (closestDistance > MAX_NEAREST_GENERATION_DISTANCE_YEARS) {
    return placeholderResult(
      `The nearest same-model generation is ${closestDistance} years away, beyond the safe ${MAX_NEAREST_GENERATION_DISTANCE_YEARS}-year fallback limit.`,
    );
  }
  const nearest = pickNearestEntry(
    sameGenerationCandidates(modelEntries, year),
    year,
  );
  if (
    !nearest ||
    yearDistance(year, nearest.yearFrom, nearest.yearTo) >
      MAX_NEAREST_GENERATION_DISTANCE_YEARS
  ) {
    return placeholderResult(
      "No catalogue image covers this year within the same generation; a different generation would be misleading.",
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
