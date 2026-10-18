import databaseJson from "@/data/autoviewer-valuations-v1.json";
import { matchCatalogModel, resolveVehicleImage } from "@/lib/vehicle/images";
import { constrainRange, normalize, performanceTokens, validateDatabase, validateProfile } from "./profiles";
import type { Confidence, ValuationDatabase, ValuationInput, ValuationProfile, ValuationResult } from "./types";
import { calibratedScopeRejection } from "./calibration-safety";

export const valuationDatabase = databaseJson as unknown as ValuationDatabase;
const databaseErrors = validateDatabase(valuationDatabase);
if (databaseErrors.length) throw new Error(`Invalid valuation database: ${databaseErrors.join(", ")}`);

export function noEstimate(reason: string, profileId?: string): ValuationResult {
  return { estimatedValue: null, confidence: "none", valuationType: "no_estimate", reason, ...(profileId ? { profileId } : {}) };
}

function contains(text: string, token: string): boolean {
  return (" " + text + " ").includes(" " + normalize(token) + " ");
}

function bodyFrom(input: ValuationInput): string | null {
  const text = normalize([input.bodyType, input.model, input.derivative].filter(Boolean).join(" "));
  const forms: Array<[string, RegExp]> = [
    ["roadster", /\b(?:roadster|convertible|cabriolet|cabrio|spider|aperta|volante)\b/],
    ["estate", /\b(?:estate|touring|wagon|sportwagon)\b/], ["saloon", /\b(?:saloon|sedan)\b/],
    ["gran-coupe", /\bgran coupe\b/], ["coupe", /\b(?:coupe|italia|gtb|speciale|pista)\b/],
    ["hatchback", /\b(?:hatchback|hatch)\b/], ["suv", /\b(?:suv|4x4)\b/],
    ["crossover", /\bcrossover\b/], ["van", /\b(?:van|cargo)\b/], ["pickup", /\bpick ?up\b/],
    ["mpv", /\bmpv\b/], ["motorcycle", /\b(?:motorcycle|motorbike)\b/], ["scooter", /\b(?:scooter|moped)\b/],
  ];
  return forms.find(([, pattern]) => pattern.test(text))?.[0] ?? null;
}

function fuelFrom(value: string | null | undefined): string | null {
  const text = normalize(value);
  if (!text) return null;
  if (/plug in|phev/.test(text)) return "plug-in-hybrid";
  if (/hybrid|electric petrol|petrol electric/.test(text)) return "hybrid";
  if (/electric|bev/.test(text)) return "electric";
  return text;
}

/** Ordering is categorical first; an unavailable specific match is never skipped for a priced parent. */
function specificity(p: ValuationProfile): number[] {
  const derivative = p.requiredTokenGroups.length > 0;
  const details = !!p.body || !!p.fuel;
  const tier = derivative && !p.generation ? 7 : p.generation && derivative ? 6 : p.generation && p.body ? 5 : p.generation && p.fuel ? 4 : p.generation ? 3 : 2;
  return [tier, Number(details), p.requiredTokenGroups.length,
    p.requiredTokenGroups.flat().reduce((sum, s) => sum + normalize(s).length, 0),
    Number(!!p.body) + Number(!!p.fuel), Number(!!p.parentId)];
}
function compare(a: number[], b: number[]): number {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i];
  return 0;
}

export function findValuationProfile(input: ValuationInput, db: ValuationDatabase = valuationDatabase): { profile: ValuationProfile | null; reason: string } {
  if (!input.make.trim() || !input.model.trim()) return { profile: null, reason: "missing_identity" };
  if (input.vehicleCategory && input.vehicleCategory !== "standard") return { profile: null, reason: "specialist_or_public_service" };
  if (input.year != null && (!Number.isInteger(input.year) || input.year < 1900 || input.year > new Date().getUTCFullYear() + 1)) return { profile: null, reason: "invalid_year" };
  const make = db.makeAliases[normalize(input.make)] ?? normalize(input.make);
  const text = normalize([input.model, input.derivative, input.transmission].filter(Boolean).join(" "));
  const rawModel = normalize(input.model);
  const signature = performanceTokens(text);
  const modelAlias = matchCatalogModel(input.make, input.model);
  const image = resolveVehicleImage(input);
  let generation = input.generation ?? (image.match === "exact" && !image.ambiguous ? image.generation : null);
  // A generation clue may disambiguate an overlap; a conflicting manufacture year is still rejected below.
  if (generation) generation = normalize(generation);
  const explicitBody = bodyFrom(input);
  let body = explicitBody;
  if (!body && image.match === "exact" && !image.ambiguous && image.record && !image.record.bodyType.includes("-")) body = image.record.bodyType;
  if (!body && input.make && (normalize(input.make).startsWith("mercedes") && normalize(input.model) === "sl" || normalize(input.make) === "triumph" && normalize(input.model) === "stag")) body = "roadster";
  const fuel = fuelFrom(input.fuelType);
  let candidates = db.profiles.filter(p => {
    if (normalize(p.make) !== make || !["catalogue", "material_alias"].includes(p.scope)) return false;
    return p.matchModels.some(m => rawModel === normalize(m) || contains(text, m) && text.startsWith(normalize(m) + " ")) ||
      !!modelAlias && p.matchModels.some(m => normalize(m) === normalize(modelAlias));
  });
  // A directly named material model wins over image aliases that collapse it onto another model.
  const direct = candidates.filter(p => p.matchModels.some(m => rawModel === normalize(m) || text.startsWith(normalize(m) + " ")));
  if (direct.length) {
    const longest = Math.max(...direct.map(p => Math.max(...p.matchModels.filter(m => rawModel === normalize(m) || text.startsWith(normalize(m) + " ")).map(m => normalize(m).length))));
    candidates = direct.filter(p => p.matchModels.some(m => normalize(m).length === longest && (rawModel === normalize(m) || text.startsWith(normalize(m) + " "))));
  }
  const matches = candidates.filter(p => {
    if (p.generation && (!generation || normalize(p.generation) !== generation)) return false;
    if (!p.generation && !p.allowModelFallback && p.valuationType !== "no_estimate") return false;
    if ((p.yearFrom !== null || p.yearTo !== null) && input.year == null) return false;
    if (input.year != null && (p.yearFrom !== null && input.year < p.yearFrom || p.yearTo !== null && input.year > p.yearTo)) return false;
    if (p.body && (!body || normalize(p.body) !== normalize(body))) return false;
    // An approved model-only alias range supplies no authority for a newly stated body variant.
    if (!p.body && p.valuationType === "manual_market" && explicitBody) return false;
    if (p.requireExplicitBody && !explicitBody) return false;
    if (p.fuel && (!fuel || normalize(p.fuel) !== normalize(fuel))) return false;
    if (!p.requiredTokenGroups.every(group => group.some(t => contains(text, t)))) return false;
    if (p.excludedTokens.some(t => contains(text, t))) return false;
    if (signature.some(t => !p.performanceTokens.includes(t))) return false;
    return true;
  });
  matches.sort((a, b) => compare(specificity(b), specificity(a)) || a.id.localeCompare(b.id));
  if (!matches.length) return { profile: null, reason: signature.length ? "performance_identity_requires_specific_profile" : !generation ? "generation_missing_or_ambiguous" : "no_specific_profile" };
  if (matches[1] && compare(specificity(matches[0]), specificity(matches[1])) === 0) return { profile: null, reason: "ambiguous_valuation_profiles" };
  return { profile: matches[0], reason: "specific_profile_matched" };
}

export function mileageAdjustment(actual: number, expected: number, cap: number, response: number): number {
  if (![actual, expected, cap, response].every(Number.isFinite) || actual < 0 || expected < 0 || cap < 0 || cap > 0.2 || response <= 0) return 0;
  return cap * Math.tanh(((expected - actual) / Math.max(expected, 1)) * response / Math.max(cap, 0.000001));
}

function confidenceAtDate(confidence: Confidence, date: string, now: Date, db: ValuationDatabase): Confidence | null {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(date) || !Number.isFinite(now.getTime())) return null;
  const [year, month] = date.split("-").map(Number);
  const ageMonths = (now.getUTCFullYear() - year) * 12 + now.getUTCMonth() + 1 - month;
  if (ageMonths < 0 || ageMonths > db.freshness.expireAfterMonths) return null;
  if (ageMonths > db.freshness.downgradeAfterMonths) return confidence === "high" ? "medium" : "low";
  return confidence;
}

export function valueProfile(p: ValuationProfile, input: ValuationInput, now: Date, db: ValuationDatabase = valuationDatabase): ValuationResult {
  if (validateProfile(p).length) return noEstimate("invalid_profile", p.id);
  if (p.valuationType === "no_estimate") return noEstimate(p.reason, p.id);
  if (input.vehicleCategory && input.vehicleCategory !== "standard") return noEstimate("specialist_or_public_service", p.id);
  const scopeRejection = calibratedScopeRejection(p, input);
  if (scopeRejection) return noEstimate(scopeRejection, p.id);
  if (input.mileage != null && (!Number.isFinite(input.mileage) || input.mileage < 0)) return noEstimate("invalid_mileage", p.id);
  if (p.requiresStandardExample && !input.standardExampleConfirmed) return noEstimate("comparable_condition_not_confirmed", p.id);
  const marketDate = p.valuationType === "algorithmic" ? p.marketAnchor?.marketDate : p.marketDate;
  if (!marketDate) return noEstimate("market_anchor_missing", p.id);
  let confidence = confidenceAtDate(p.confidence, marketDate, now, db);
  if (!confidence) return noEstimate("market_anchor_stale_or_invalid", p.id);
  let mid = p.centralEstimate;
  let range = p.displayRange;
  if (p.valuationType === "algorithmic") {
    const anchor = p.marketAnchor, algorithm = p.algorithm;
    if (!anchor || p.needsMarketAnchor) return noEstimate("market_anchor_missing", p.id);
    if (!algorithm || p.needsCalibration || anchor.referenceVehicleYear === null || anchor.referenceMileage === null || algorithm.ageAdjustment.annualRate === null || input.year == null) return noEstimate("algorithmic_calibration_missing", p.id);
    if (!Number.isInteger(anchor.referenceVehicleYear) || anchor.referenceVehicleYear < 1900 || !Number.isFinite(anchor.referenceMileage) || anchor.referenceMileage < 0) return noEstimate("invalid_anchor_calibration", p.id);
    // A snapshot anchor is not a forecast: do not compound depreciation with wall-clock time.
    // Adjust this vehicle's age against the researched reference vehicle at the same market date.
    const ageFactor = Math.pow(1 - algorithm.ageAdjustment.annualRate, anchor.referenceVehicleYear - input.year);
    const expectedMileage = Math.max(0, anchor.referenceMileage + (anchor.referenceVehicleYear - input.year) * algorithm.expectedAnnualMileage);
    const mileageFactor = input.mileage == null ? 1 : 1 + mileageAdjustment(input.mileage, expectedMileage, algorithm.mileageAdjustment.maxAdjustment, algorithm.mileageAdjustment.response);
    if (input.mileage == null) confidence = "low";
    const text = normalize([input.model, input.derivative].filter(Boolean).join(" "));
    const modifiers = algorithm.derivativeModifiers.filter(m => m.tokens.every(t => contains(text, t)));
    // Multipliers cannot be stacked accidentally; overlaps require separate calibrated profiles.
    if (modifiers.length > 1) return noEstimate("ambiguous_derivative_modifiers", p.id);
    const modifier = modifiers[0]?.multiplier ?? 1;
    mid = anchor.value * ageFactor * mileageFactor * modifier;
    if (!Number.isFinite(mid) || mid <= 0) return noEstimate("invalid_adjusted_value", p.id);
    // Ratios come solely from the approved research display range; no new uncertainty band.
    if (!p.researchDisplayRange || !p.marketAnchor) return noEstimate("approved_display_range_missing", p.id);
    range = { low: mid * p.researchDisplayRange.low / anchor.value, high: mid * p.researchDisplayRange.high / anchor.value };
  }
  if (mid === null || !range) return noEstimate("approved_display_range_missing", p.id);
  // Round inward to whole pounds; confidence changes can shrink but never widen a research band.
  const finalMid = Math.round(mid);
  const finalRange = constrainRange({ low: Math.ceil(range.low), high: Math.floor(range.high) }, finalMid, confidence);
  if (!finalRange) return noEstimate("cannot_fit_constrained_range", p.id);
  return { estimatedValue: { ...finalRange, mid: finalMid, currency: "GBP" }, confidence, valuationType: p.valuationType, marketDate, profileId: p.id, reason: "research_backed_estimate" };
}

/** Pure entry point for already classified vehicles. Use the server adapter for registrations. */
export function estimateValuation(input: ValuationInput, options: { now?: Date; database?: ValuationDatabase } = {}): ValuationResult {
  const db = options.database ?? valuationDatabase;
  const match = findValuationProfile(input, db);
  return match.profile ? valueProfile(match.profile, input, options.now ?? new Date(), db) : noEstimate(match.reason);
}
