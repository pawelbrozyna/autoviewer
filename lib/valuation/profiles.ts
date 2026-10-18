import type { Confidence, Range, ValuationDatabase, ValuationProfile } from "./types";

export const SPREAD_LIMITS: Record<Confidence, number> = { high: 0.18, medium: 0.22, low: 0.25 };
export const normalize = (s: string | null | undefined): string => (s ?? "")
  .normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
  .replace(/\+/g, " plus ").replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");

export function validMarketDate(date: unknown): date is string {
  return typeof date === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(date);
}

export function validRange(range: Range | null, mid: number | null, confidence: Confidence): boolean {
  if (!range || !Number.isFinite(mid) || !Number.isFinite(range.low) || !Number.isFinite(range.high)) return false;
  return range.low > 0 && range.low <= (mid as number) && (mid as number) <= range.high &&
    range.high <= range.low * (1 + SPREAD_LIMITS[confidence]) + 1e-8 && range.high <= range.low * 1.25;
}

/** Intersect with the confidence cap; never manufacture a range from observed asking extremes. */
export function constrainRange(range: Range, mid: number, confidence: Confidence): Range | null {
  if (![range.low, range.high, mid].every(Number.isFinite) || range.low <= 0 || range.high < range.low) return null;
  const result = { low: range.low, high: Math.min(range.high, Math.floor(range.low * (1 + SPREAD_LIMITS[confidence]))) };
  return validRange(result, mid, confidence) ? result : null;
}

export function validateProfile(p: ValuationProfile): string[] {
  const errors: string[] = [];
  if (!p.id || !p.model || !Array.isArray(p.matchModels) || p.matchModels.length === 0) errors.push("missing_identity");
  if (!["algorithmic", "manual_market", "no_estimate"].includes(p.valuationType)) errors.push("invalid_valuation_type");
  if (!["high", "medium", "low"].includes(p.confidence)) errors.push("invalid_confidence");
  if (p.yearFrom !== null && (!Number.isInteger(p.yearFrom) || p.yearFrom < 1900)) errors.push("invalid_year_from");
  if (p.yearTo !== null && (!Number.isInteger(p.yearTo) || p.yearTo < 1900)) errors.push("invalid_year_to");
  if (p.yearFrom !== null && p.yearTo !== null && p.yearFrom > p.yearTo) errors.push("reversed_years");
  if (p.marketDate !== null && !validMarketDate(p.marketDate)) errors.push("invalid_market_date");
  if (p.displayRange && !validRange(p.displayRange, p.centralEstimate, p.confidence)) errors.push("invalid_display_range");
  if (p.researchDisplayRange && p.displayRange && (p.displayRange.low < p.researchDisplayRange.low || p.displayRange.high > p.researchDisplayRange.high)) errors.push("range_exceeds_research");
  if (p.valuationType === "manual_market" && (!validRange(p.displayRange, p.centralEstimate, p.confidence) || !validMarketDate(p.marketDate) || !p.research.length)) errors.push("manual_market_missing_evidence");
  if (p.valuationType === "no_estimate" && (p.displayRange || p.centralEstimate !== null)) errors.push("no_estimate_has_price");
  if (p.marketAnchor && (!(p.marketAnchor.value > 0) || !Number.isFinite(p.marketAnchor.value) || !validMarketDate(p.marketAnchor.marketDate))) errors.push("invalid_anchor");
  if (p.valuationType === "algorithmic" && (!p.algorithm || p.needsMarketAnchor !== !p.marketAnchor)) errors.push("invalid_algorithmic_state");
  if (p.algorithm) {
    const a = p.algorithm;
    if (!(a.expectedAnnualMileage > 0) || !Number.isFinite(a.expectedAnnualMileage) || a.mileageAdjustment.maxAdjustment < 0 || a.mileageAdjustment.maxAdjustment > 0.2 || !Number.isFinite(a.mileageAdjustment.maxAdjustment) || !(a.mileageAdjustment.response > 0) || !Number.isFinite(a.mileageAdjustment.response)) errors.push("invalid_mileage_policy");
    if (a.ageAdjustment.annualRate !== null && (!Number.isFinite(a.ageAdjustment.annualRate) || a.ageAdjustment.annualRate < 0 || a.ageAdjustment.annualRate >= 1)) errors.push("invalid_age_policy");
    if (a.derivativeModifiers.some(m => !m.tokens.length || !Number.isFinite(m.multiplier) || m.multiplier <= 0) || (a.derivativeModifiers.length > 0 && !p.research.length)) errors.push("invalid_derivative_modifier");
  }
  if (p.scope !== "catalogue" && p.scope !== "material_alias" && p.valuationType !== "no_estimate") errors.push("unsafe_scope");
  if (p.classification === "specialist_no_estimate" && p.valuationType !== "no_estimate") errors.push("specialist_has_valuation");
  return errors;
}

export function validateDatabase(db: ValuationDatabase): string[] {
  const errors: string[] = [];
  if (db.schemaVersion !== 1 || db.currency !== "GBP" || !validMarketDate(db.marketDate)) errors.push("invalid_database_metadata");
  if (!Number.isInteger(db.freshness.downgradeAfterMonths) || !Number.isInteger(db.freshness.expireAfterMonths) || db.freshness.downgradeAfterMonths < 0 || db.freshness.expireAfterMonths <= db.freshness.downgradeAfterMonths) errors.push("invalid_freshness_policy");
  const ids = new Set<string>();
  for (const p of db.profiles) {
    if (ids.has(p.id)) errors.push(`${p.id}:duplicate_id`);
    ids.add(p.id);
    errors.push(...validateProfile(p).map(e => `${p.id}:${e}`));
  }
  for (const p of db.profiles) if (p.parentId && !ids.has(p.parentId)) errors.push(`${p.id}:missing_parent`);
  return errors;
}

/** Detect valuation-sensitive identities before any lossy image-model aliasing. */
export function performanceTokens(text: string): string[] {
  const n = normalize(text).replace(/\b(?:st|rs|amg) line\b/g, "");
  const result: string[] = n.match(/\b(?:m[1-8]|m\d{3}[a-z]*|m635csi|(?:c|e|s|g|a|cla|gla|glc|gle) ?(?:35|43|45|53|55|63|65)|rs ?[1-8]|s[3-8]|rs\d{3,4}|xr4i|xr4x4|cosworth|lotus|mexico|twin cam|type r|gt r|gtr|gt[234]|gt[34]rs|turbo|speciale|pista|nismo|sti|wrx|cooper s|v spec|m spec|nur|spirit r|competition|reborn|anniversary|limited edition|chapron|vitesse|firenza|6r4|hsr|rallye|gti|vts|st|rs)\b/g) ?? [];
  const compact = n.replace(/ /g, "");
  const joined: Array<[RegExp, string]> = [
    [/fiestast(?!line)|focusst(?!line)/, "st"], [/focusrs/, "rs"], [/golfgti/, "gti"], [/golfr(?:$|\d)/, "golfr"],
    [/civictyper|integratyper/, "typer"], [/coopers(?:$|\d)/, "coopers"], [/911turbo/, "turbo"],
    [/458speciale/, "speciale"], [/488pista/, "pista"], [/skylinegtr/, "gtr"], [/vivagt(?:$|\d)/, "vivagt"],
  ];
  for (const [pattern, token] of joined) if (pattern.test(compact)) result.push(token);
  return [...new Set(result.map(x => x.replace(/ /g, "")))];
}
