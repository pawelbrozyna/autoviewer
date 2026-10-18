import { validateDatabase, validateProfile, validRange } from "./profiles";
import type { Confidence, Range, ValuationDatabase, ValuationProfile } from "./types";

const patchFields = ["fuel", "requiredTokenGroups", "excludedTokens", "confidence", "marketDate", "marketAnchor", "algorithm", "needsMarketAnchor", "needsCalibration", "researchDisplayRange", "reason", "notes", "calibration"] as const;
type CalibrationPatch = Pick<ValuationProfile, typeof patchFields[number]>;
export interface ApprovedCalibration {
  profileId: string;
  usable: boolean;
  sourceIdentity: Pick<ValuationProfile, "make" | "model" | "generation" | "yearFrom" | "yearTo" | "body" | "fuel">;
  valuationPatch?: CalibrationPatch;
  marketAnchor: { marketDate: string | null; referenceVehicleYear: number | null; referenceMileage: number | null; medianValue: number | null };
  ageAdjustment: { annualRate: number | null };
  mileage: { expectedAnnualMileage: number; maxAdjustmentPercent: number; response: number };
  confidence: Confidence | "none";
  researchDisplayRange: Range | null;
}
export interface CalibrationSource {
  approval: { expectedUsableProfileCount: number };
  profiles: ApprovedCalibration[];
}

export function valuationSummary(db: ValuationDatabase) {
  const algorithmic = db.profiles.filter(p => p.valuationType === "algorithmic");
  const usable = algorithmic.filter(p => !p.needsCalibration && !p.needsMarketAnchor);
  const manual = db.profiles.filter(p => p.valuationType === "manual_market").length;
  return {
    totalProfiles: db.profiles.length, finalProfileCount: db.profiles.length,
    algorithmicProfiles: algorithmic.length, usableAlgorithmicProfiles: usable.length,
    unavailableAlgorithmicProfiles: algorithmic.length - usable.length,
    manual_market: manual, no_estimate: db.profiles.filter(p => p.valuationType === "no_estimate").length,
    byValuationType: Object.fromEntries(["algorithmic", "manual_market", "no_estimate"].map(t => [t, db.profiles.filter(p => p.valuationType === t).length])),
    calibratedConfidence: Object.fromEntries(["high", "medium", "low"].map(c => [c, usable.filter(p => p.confidence === c).length])),
    remainingMissingAnchors: algorithmic.filter(p => p.needsMarketAnchor).length,
    remainingMissingCalibration: algorithmic.filter(p => p.needsCalibration).length,
    algorithmicMissingMarketAnchor: algorithmic.filter(p => p.needsMarketAnchor).length,
    needsMarketAnchor: db.profiles.filter(p => p.needsMarketAnchor).length,
    needsCalibration: db.profiles.filter(p => p.needsCalibration).length,
    priceCapableProfiles: usable.length + manual,
  };
}

/** Applies explicit approvals only. A competing database is never an input to this operation. */
export function integrateApprovedCalibrations(db: ValuationDatabase, source: CalibrationSource, now = new Date()): ValuationDatabase {
  const records = new Map(source.profiles.map(r => [r.profileId, r]));
  if (records.size !== source.profiles.length) throw new Error("Duplicate calibration profile IDs");
  const approved = source.profiles.filter(r => r.usable === true);
  if (approved.length !== source.approval.expectedUsableProfileCount) throw new Error("Approval count mismatch");
  for (const r of approved) if (!db.profiles.some(p => p.id === r.profileId && p.valuationType === "algorithmic")) throw new Error(`Approval does not name an algorithmic profile: ${r.profileId}`);
  const profiles = db.profiles.map(original => {
    const r = records.get(original.id);
    if (r?.usable !== true) {
      if (original.valuationType === "algorithmic" && !original.needsCalibration) throw new Error(`Unapproved algorithmic profile already enabled: ${original.id}`);
      return original;
    }
    if (original.valuationType !== "algorithmic" || !["normal", "premium", "ev"].includes(original.classification) || original.scope !== "catalogue" || original.unresolvedDerivativeIdentification) throw new Error(`Unsafe approved identity: ${original.id}`);
    for (const key of ["make", "model", "generation", "yearFrom", "yearTo", "body"] as const) if (original[key] !== r.sourceIdentity[key]) throw new Error(`Calibration identity conflict: ${original.id}/${key}`);
    const patch = r.valuationPatch;
    if (!patch || Object.keys(patch).some(k => !(patchFields as readonly string[]).includes(k))) throw new Error(`Missing or unsafe valuation patch: ${original.id}`);
    const p = { ...original, ...structuredClone(patch) };
    if (p.needsCalibration || p.needsMarketAnchor || !p.calibration || !p.marketAnchor || !p.algorithm || !p.body || !p.generation || !p.fuel) throw new Error(`Incomplete usable calibration: ${p.id}`);
    if (p.calibration.sourceProfileId !== p.id || p.calibration.anchorSampleSize < 3) throw new Error(`Invalid calibration provenance: ${p.id}`);
    const anchor = r.marketAnchor;
    if (p.marketAnchor.value !== anchor.medianValue || p.marketAnchor.marketDate !== anchor.marketDate || p.marketAnchor.referenceVehicleYear !== anchor.referenceVehicleYear || p.marketAnchor.referenceMileage !== anchor.referenceMileage || p.algorithm.ageAdjustment.annualRate !== r.ageAdjustment.annualRate || p.algorithm.expectedAnnualMileage !== r.mileage.expectedAnnualMileage || p.algorithm.mileageAdjustment.maxAdjustment * 100 !== r.mileage.maxAdjustmentPercent || p.algorithm.mileageAdjustment.response !== r.mileage.response || p.confidence !== r.confidence || JSON.stringify(p.researchDisplayRange) !== JSON.stringify(r.researchDisplayRange)) throw new Error(`Approval payload differs from researched calibration: ${p.id}`);
    if (original.fuel && original.fuel !== p.fuel) throw new Error(`Calibration fuel conflict: ${p.id}`);
    if (original.requiredTokenGroups.some(g => !p.requiredTokenGroups.some(h => JSON.stringify(h) === JSON.stringify(g))) || original.excludedTokens.some(t => !p.excludedTokens.includes(t))) throw new Error(`Weakened identity protections: ${p.id}`);
    if (p.marketAnchor.referenceVehicleYear === null || p.marketAnchor.referenceMileage === null || !Number.isInteger(p.marketAnchor.referenceVehicleYear) || p.marketAnchor.referenceVehicleYear < (p.yearFrom ?? 1900) || p.marketAnchor.referenceVehicleYear > (p.yearTo ?? 9999) || !Number.isFinite(p.marketAnchor.referenceMileage) || p.marketAnchor.referenceMileage < 0 || p.algorithm.ageAdjustment.annualRate === null) throw new Error(`Missing reference calibration: ${p.id}`);
    if (!validRange(p.researchDisplayRange, p.marketAnchor.value, p.confidence)) throw new Error(`Invalid calibrated display band: ${p.id}`);
    const [year, month] = p.marketAnchor.marketDate.split("-").map(Number);
    const ageMonths = (now.getUTCFullYear() - year) * 12 + now.getUTCMonth() + 1 - month;
    if (!Number.isFinite(now.getTime()) || !Number.isFinite(ageMonths) || ageMonths < 0 || ageMonths > db.freshness.downgradeAfterMonths) throw new Error(`Approved anchor is not fresh: ${p.id}`);
    const errors = validateProfile(p);
    if (errors.length) throw new Error(`${p.id}: ${errors.join(", ")}`);
    return p;
  });
  const result = { ...db, profiles };
  const errors = validateDatabase(result);
  if (errors.length) throw new Error(errors.join(", "));
  return result;
}
