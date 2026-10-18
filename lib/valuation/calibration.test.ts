import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { estimateCalibratedValuation, calibratedValuationDatabase } from "./calibrated-valuation";
import { estimateValuation, valuationDatabase } from "./engine";
import { validateDatabase } from "./profiles";
import { fitMedianAgeCurve, chooseAgeCurve, safeCurveRecipient } from "./calibration-policy";
import { integrateApprovedCalibrations, valuationSummary } from "./integrate-calibration";
import type { CalibrationSource } from "./integrate-calibration";
import type { Confidence, ValuationInput, ValuationProfile } from "./types";

const now = new Date("2026-10-17T12:00:00Z");
const calibration = JSON.parse(readFileSync("data/valuation-algorithmic-calibration-v1.json", "utf8")) as {
  approval: { expectedUsableProfileCount: number; unchangedNonAlgorithmicProfilesSha256: string; unchangedUnavailableAlgorithmicProfilesSha256: string };
  summary: { usableAlgorithmicProfiles: number; unusableAlgorithmicProfiles: number; profilesMissingAnchors: number; previousAnchorsPromoted: number };
  profiles: Array<{ profileId: string; usable: boolean; available: boolean; ageCurveLevel: string; needsMarketAnchor: boolean }>;
  outputExamples: Array<{ input: ValuationInput }>;
  cohorts: Array<{ profileId: string; rows: Array<{ askingPrice: number }> }>;
};
const usable = calibratedValuationDatabase.profiles.filter(p => p.valuationType === "algorithmic" && !p.needsCalibration);
const pInput = (p: ValuationProfile): ValuationInput => ({
  make: p.make!, model: p.model, generation: p.generation, bodyType: p.body, fuelType: p.fuel,
  derivative: p.requiredTokenGroups.map(g => g[0]).join(" "), year: p.marketAnchor!.referenceVehicleYear,
  mileage: p.marketAnchor!.referenceMileage,
});

test("canonical candidate validates, compatibility copy is exact, only approved profiles are enabled", () => {
  assert.deepEqual(validateDatabase(calibratedValuationDatabase), []);
  assert.equal(calibratedValuationDatabase.profiles.length, valuationDatabase.profiles.length);
  assert.equal(usable.length, calibration.summary.usableAlgorithmicProfiles);
  assert.equal(calibration.summary.usableAlgorithmicProfiles + calibration.summary.unusableAlgorithmicProfiles, 967);
  assert.equal(calibration.profiles.filter(p => p.needsMarketAnchor).length, calibration.summary.profilesMissingAnchors);
  assert.equal(calibration.summary.previousAnchorsPromoted, 10);
  assert.equal(calibratedValuationDatabase, valuationDatabase);
  assert(readFileSync("data/autoviewer-valuations-v1.json").equals(readFileSync("data/autoviewer-valuations-v1-calibrated.json")));
  const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
  assert.equal(hash(valuationDatabase.profiles.filter(p => p.valuationType !== "algorithmic")), calibration.approval.unchangedNonAlgorithmicProfilesSha256);
  const approved = new Set(calibration.profiles.filter(p => p.usable === true).map(p => p.profileId));
  assert.equal(approved.size, 36);
  assert.deepEqual(usable.map(p => p.id).sort(), [...approved].sort());
  assert.equal(hash(valuationDatabase.profiles.filter(p => p.valuationType === "algorithmic" && !approved.has(p.id))), calibration.approval.unchangedUnavailableAlgorithmicProfilesSha256);
  const main = JSON.parse(readFileSync("data/autoviewer-valuations-v1.json", "utf8"));
  for (const [key, value] of Object.entries(valuationSummary(valuationDatabase))) assert.deepEqual(main.summary[key], value);
  assert.equal(main.summary.priceCapableProfiles, 80);
  assert.equal(main.canonicalDatabase, "data/autoviewer-valuations-v1.json");
  assert.equal(createHash("sha256").update(readFileSync("data/valuation-algorithmic-calibration-v1.json")).digest("hex"), main.provenance.calibrationSha256);
});

test("every saved display band and reachable calibrated output respects confidence caps and <=25%", () => {
  const caps: Record<Confidence, number> = { high: 1.18, medium: 1.22, low: 1.25 };
  for (const p of usable) {
    assert(p.researchDisplayRange!.high <= p.researchDisplayRange!.low * caps[p.confidence] + 1e-8);
    for (const year of new Set([p.yearFrom!, p.marketAnchor!.referenceVehicleYear!, p.yearTo!])) {
      for (const mileage of [null, 0, p.marketAnchor!.referenceMileage!, p.marketAnchor!.referenceMileage! * 2]) {
        const result = estimateCalibratedValuation({ ...pInput(p), year, mileage }, now);
        assert(result.estimatedValue, `${p.id}, ${year}, ${mileage}: ${result.reason}`);
        assert(result.estimatedValue.low <= result.estimatedValue.mid);
        assert(result.estimatedValue.mid <= result.estimatedValue.high);
        assert(result.estimatedValue.high <= result.estimatedValue.low * 1.25);
        assert(result.estimatedValue.high <= result.estimatedValue.low * caps[result.confidence as Confidence] + 1e-8);
      }
    }
  }
  for (const p of calibratedValuationDatabase.profiles) if (p.displayRange) assert(p.displayRange.high <= p.displayRange.low * 1.25);
});

test("ordinary lookups use model-family and segment age curves without a different-model identity fallback", () => {
  for (const level of ["model_family", "segment"]) {
    const rows = calibration.profiles.filter(p => p.available && p.ageCurveLevel === level);
    assert(rows.length > 0, level);
    for (const row of rows) {
      const p = usable.find(p => p.id === row.profileId)!;
      assert(estimateCalibratedValuation(pInput(p), now).estimatedValue);
      assert.equal(estimateCalibratedValuation({ ...pInput(p), model: "Unresearched Example" }, now).estimatedValue, null);
      assert.equal(estimateCalibratedValuation({ ...pInput(p), generation: "Wrong generation" }, now).estimatedValue, null);
    }
  }
});

test("all calibrated ordinary scopes reject performance/special identities, including decorated badge suffixes", () => {
  for (const p of usable) {
    for (const badge of ["ST", "RS", "M3", "M5", "M340i", "C63", "RS3", "GTI", "Nismo", "VXR", "GTD", "GTE", "R32", "Clubsport", "Brabus", "limited edition", "special edition", "final edition", "modified"]) {
      assert.equal(estimateCalibratedValuation({ ...pInput(p), derivative: `${pInput(p).derivative} ${badge}` }, now).estimatedValue, null, `${p.id}: ${badge}`);
    }
    if (p.model === "Golf") assert.equal(estimateCalibratedValuation({ ...pInput(p), derivative: `${pInput(p).derivative} R DSG` }, now).estimatedValue, null);
  }
});

test("ordinary appearance trims can share the same monetary anchor", () => {
  const p = usable.find(p => p.model === "Fiesta")!;
  const input = pInput(p);
  const zetec = estimateCalibratedValuation({ ...input, derivative: `${input.derivative} Zetec` }, now);
  const titanium = estimateCalibratedValuation({ ...input, derivative: `${input.derivative} Titanium` }, now);
  assert(zetec.estimatedValue);
  assert.deepEqual(zetec.estimatedValue, titanium.estimatedValue);
  assert(estimateCalibratedValuation({ ...input, derivative: `${input.derivative} ST-Line` }, now).estimatedValue);
});

test("missing mileage returns an estimate and lowers medium/high confidence to low", () => {
  const p = usable.find(p => p.confidence === "high")!;
  assert(p);
  const known = estimateCalibratedValuation(pInput(p), now);
  const missing = estimateCalibratedValuation({ ...pInput(p), mileage: null }, now);
  assert(known.estimatedValue && missing.estimatedValue);
  assert.equal(known.confidence, "high");
  assert.equal(missing.confidence, "low");
  assert.equal(estimateCalibratedValuation({ ...pInput(p), mileage: -1 }, now).estimatedValue, null);
});

test("stale anchors downgrade after six months and expire after twelve", () => {
  const p = usable.find(p => p.confidence === "high")!;
  assert.equal(estimateCalibratedValuation(pInput(p), new Date("2027-05-17T12:00:00Z")).confidence, "medium");
  const expired = estimateCalibratedValuation(pInput(p), new Date("2027-11-17T12:00:00Z"));
  assert.equal(expired.estimatedValue, null);
  assert.equal(expired.reason, "market_anchor_stale_or_invalid");
  assert.equal(estimateCalibratedValuation(pInput(p), new Date("2026-09-17T12:00:00Z")).estimatedValue, null);
});

test("EV anchor requires the researched 40 kWh N-Connecta spec, never another battery/trim", () => {
  const p = usable.find(p => p.model === "Leaf")!;
  assert(estimateCalibratedValuation(pInput(p), now).estimatedValue);
  for (const derivative of ["62kWh N-Connecta", "39kWh N-Connecta", "40kWh Tekna", "N-Connecta", "40kWh N-Connecta e+", "40kWh N-Connecta battery lease"]) {
    assert.equal(estimateCalibratedValuation({ ...pInput(p), derivative }, now).estimatedValue, null, derivative);
  }
});

test("material engine, body and fuel mismatch cannot inherit a priced scope", () => {
  const p = usable.find(p => p.model === "Fiesta")!;
  assert.equal(estimateCalibratedValuation({ ...pInput(p), derivative: "1.0 Zetec" }, now).estimatedValue, null);
  assert.equal(estimateCalibratedValuation({ ...pInput(p), engineCapacity: 999 }, now).estimatedValue, null);
  assert.equal(estimateCalibratedValuation({ ...pInput(p), fuelType: "diesel" }, now).estimatedValue, null);
  assert.equal(estimateCalibratedValuation({ ...pInput(p), bodyType: "estate" }, now).estimatedValue, null);
  const yaris = usable.find(p => p.model === "Yaris")!;
  assert.equal(estimateCalibratedValuation({ ...pInput(yaris), derivative: "1.8 hybrid" }, now).estimatedValue, null);
});

test("explicit and trusted-registration specialist/public-service inputs never receive an estimate", () => {
  const input = pInput(usable[0]);
  for (const vehicleCategory of ["specialist", "public_service"] as const) assert.equal(estimateCalibratedValuation({ ...input, vehicleCategory }, now).estimatedValue, null);
  const tfl = Object.keys(JSON.parse(readFileSync("data/tfl-bus-fleet.json", "utf8")).vehicles)[0];
  assert(tfl);
  assert.equal(estimateCalibratedValuation({ ...input, registration: tfl, vehicleCategory: "standard" }, now).estimatedValue, null);
  for (const suffix of ["taxi", "ambulance", "police", "fire engine"]) assert.equal(estimateCalibratedValuation({ ...input, derivative: `${input.derivative} ${suffix}` }, now).estimatedValue, null);
});

test("median fitting tolerates wide individual listing spreads and rejects implausible age trends", () => {
  const good = fitMedianAgeCurve("test", [{ year: 2016, medianPrice: 4000, medianMileage: 80000, count: 3 }, { year: 2017, medianPrice: 4500, medianMileage: 72000, count: 3 }]);
  assert(good.curve);
  assert(Math.abs(good.curve.annualRate - (1 - 4000 / 4500)) < 0.000001);
  assert.equal(fitMedianAgeCurve("test", [{ year: 2016, medianPrice: 8000, medianMileage: 80000, count: 5 }, { year: 2017, medianPrice: 4000, medianMileage: 72000, count: 5 }]).curve, null);
  const curve = good.curve;
  for (const classification of ["performance", "collector_stable", "classic_appreciating", "specialist_no_estimate"]) {
    const safe = safeCurveRecipient({ classification, scope: "catalogue", body: "hatchback", yearFrom: 2010, unresolvedDerivativeIdentification: false });
    assert.equal(safe, false);
    assert.equal(chooseAgeCurve(null, null, curve, safe, false), null);
    assert.equal(chooseAgeCurve(null, curve, null, safe, false), null);
  }
  assert.equal(chooseAgeCurve(null, null, curve, true, true), null);
  assert.equal(safeCurveRecipient({ make: "Bentley", classification: "premium", scope: "catalogue", body: "suv", yearFrom: 2016, unresolvedDerivativeIdentification: false }), false);
});

test("a real wide-spread market cohort can price a typical example with a narrow product band", () => {
  const p = usable.find(p => p.model === "C3")!;
  const cohort = calibration.cohorts.find(c => c.profileId === p.id && c.rows.length >= 10)!;
  const prices = cohort.rows.map(r => r.askingPrice).sort((a, b) => a - b);
  assert(prices[Math.floor((prices.length - 1) * 0.9)] / prices[Math.floor((prices.length - 1) * 0.1)] > 1.25);
  const result = estimateCalibratedValuation(pInput(p), now);
  assert(result.estimatedValue);
  assert(result.estimatedValue.high <= result.estimatedValue.low * 1.25);
});

test("all 36 approved profiles return valuations through the default canonical engine and server adapter", () => {
  assert.equal(usable.length, 36);
  for (const e of calibration.outputExamples) {
    assert(estimateCalibratedValuation(e.input, now).estimatedValue);
    assert(estimateValuation(e.input, { now }).estimatedValue);
  }
});

test("direct canonical engine retains material scope, performance and specialist-text guards", () => {
  for (const p of usable) {
    const input = pInput(p);
    for (const badge of ["M3", "ST", "VXR", "limited edition", "taxi", "ambulance"]) assert.equal(estimateValuation({ ...input, derivative: `${input.derivative} ${badge}` }, { now }).estimatedValue, null);
    if (p.model === "Golf") assert.equal(estimateValuation({ ...input, derivative: `${input.derivative} R DSG` }, { now }).estimatedValue, null);
    if (p.calibration!.engineLitres !== null) assert.equal(estimateValuation({ ...input, engineCapacity: 9999 }, { now }).estimatedValue, null);
  }
});

test("integration uses usable=true only, is idempotent, and rejects unsafe or stale approvals", () => {
  const source = calibration as unknown as CalibrationSource;
  assert.deepEqual(integrateApprovedCalibrations(valuationDatabase, source, now), valuationDatabase);
  const base = structuredClone(valuationDatabase);
  for (const p of base.profiles) if (p.valuationType === "algorithmic") p.needsCalibration = true;
  const unapproved = structuredClone(source);
  for (const r of unapproved.profiles) r.usable = false; // Legacy available=true must not authorize integration.
  unapproved.approval.expectedUsableProfileCount = 0;
  assert.equal(integrateApprovedCalibrations(base, unapproved, now).profiles.filter(p => p.valuationType === "algorithmic" && !p.needsCalibration).length, 0);
  for (const mutate of [
    (r: CalibrationSource["profiles"][number]) => { r.valuationPatch!.marketAnchor!.marketDate = "2020-01"; },
    (r: CalibrationSource["profiles"][number]) => { r.valuationPatch!.fuel = null; },
    (r: CalibrationSource["profiles"][number]) => { r.valuationPatch!.researchDisplayRange = { low: 1, high: 1000000 }; },
    (r: CalibrationSource["profiles"][number]) => { Object.assign(r.valuationPatch!, { body: "estate" }); },
  ]) {
    const invalid = structuredClone(source);
    mutate(invalid.profiles.find(r => r.usable)!);
    assert.throws(() => integrateApprovedCalibrations(base, invalid, now));
  }
});
