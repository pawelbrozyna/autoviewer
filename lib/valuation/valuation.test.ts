import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import test from "node:test";
import { estimateValuation, findValuationProfile, mileageAdjustment, valuationDatabase, valueProfile } from "./engine";
import { constrainRange, validateDatabase, validateProfile } from "./profiles";
import { valuateVehicle } from "./vehicle-valuation";
import type { ValuationDatabase, ValuationInput, ValuationProfile } from "./types";

const now = new Date("2026-10-17T12:00:00Z");
// All prices and coefficients in fixtures are synthetic test data, never production market evidence.
function fixture(patch: Partial<ValuationProfile> = {}): ValuationProfile {
  return {
    id: "fixture", inventoryProfileIds: [], parentId: null, scope: "catalogue", make: "Test", model: "Example", matchModels: ["Example"],
    generation: "G1", yearFrom: 2000, yearTo: 2026, body: null, fuel: null, variant: null, classification: "normal",
    valuationType: "manual_market", confidence: "high", marketDate: "2026-10", centralEstimate: 10000,
    displayRange: { low: 9500, high: 11000 }, researchDisplayRange: { low: 9500, high: 11000 }, marketAnchor: null, algorithm: null,
    needsMarketAnchor: false, needsCalibration: false, unresolvedDerivativeIdentification: false,
    requiredTokenGroups: [], excludedTokens: [], allowModelFallback: false, requireExplicitBody: false,
    requiresStandardExample: false, performanceTokens: [], research: [{ file: "synthetic", recordIndex: 0, status: "researched", key: null, profileId: null }], reason: "test", notes: [], ...patch,
  };
}
const input: ValuationInput = { make: "Test", model: "Example", generation: "G1", year: 2020 };
const db = (...profiles: ValuationProfile[]): ValuationDatabase => ({ ...valuationDatabase, profiles });
const estimate = (p: ValuationProfile, v: ValuationInput = input) => estimateValuation(v, { now, database: db(p) });
const algo = () => fixture({ valuationType: "algorithmic", centralEstimate: null, displayRange: null,
  confidence: "medium", researchDisplayRange: { low: 9000, high: 11000 },
  marketAnchor: { value: 10000, marketDate: "2026-10", referenceVehicleYear: 2020, referenceMileage: 48000 },
  algorithm: { expectedAnnualMileage: 8000, ageAdjustment: { kind: "exponential", annualRate: 0.1 }, mileageAdjustment: { kind: "tanh", maxAdjustment: 0.2, response: 0.2 }, derivativeModifiers: [] },
});

test("serialized production dataset validates and every display range satisfies both caps", () => {
  assert.deepEqual(validateDatabase(valuationDatabase), []);
  for (const p of valuationDatabase.profiles) if (p.displayRange) {
    assert(p.displayRange.high <= p.displayRange.low * 1.25);
    assert(p.displayRange.high <= p.displayRange.low * ({ high: 1.18, medium: 1.22, low: 1.25 }[p.confidence]) + 1e-8);
    assert(p.displayRange.low >= p.researchDisplayRange!.low);
    assert(p.displayRange.high <= p.researchDisplayRange!.high);
  }
});
test("all approved manual profile outputs obey caps at every supported confidence", () => {
  for (const p of valuationDatabase.profiles.filter(p => p.valuationType === "manual_market")) {
    const result = valueProfile(p, { make: p.make!, model: p.model, year: p.yearFrom ?? 2020 }, now);
    assert(result.estimatedValue, p.id);
    assert(result.estimatedValue.high <= result.estimatedValue.low * 1.25);
    assert(result.estimatedValue.high <= result.estimatedValue.low * ({ high: 1.18, medium: 1.22, low: 1.25 }[result.confidence as "high" | "medium" | "low"]) + 1e-8);
  }
});
test("every manual profile is reachable through specific actual identity fields", () => {
  for (const p of valuationDatabase.profiles.filter(p => p.valuationType === "manual_market")) {
    const result = valuateVehicle({ make: p.make!, model: p.model, derivative: p.requiredTokenGroups.map(g => g[0]).join(" "),
      generation: p.generation, year: p.yearFrom!, bodyType: p.body, fuelType: p.fuel }, now);
    assert(result.estimatedValue, `${p.id}: ${result.reason}`);
    assert.equal(result.profileId, p.id);
  }
});
test("invalid, reversed, nonfinite and over-wide ranges fail validation", () => {
  for (const range of [{ low: 0, high: 10 }, { low: 11000, high: 9000 }, { low: 8000, high: 12000 }, { low: 9000, high: Infinity }]) assert(validateProfile(fixture({ displayRange: range })).includes("invalid_display_range"));
  assert.equal(constrainRange({ low: 100, high: 200 }, 150, "low"), null);
  assert.equal(estimate(fixture({ displayRange: { low: 8000, high: 12000 } })).estimatedValue, null);
});
test("most specific derivative wins; an unavailable child blocks a priced parent", () => {
  const generic = fixture({ body: "coupe" });
  const specific = fixture({ id: "child", parentId: generic.id, body: "coupe", requiredTokenGroups: [["edition x"]] });
  const v = { ...input, derivative: "Edition X", bodyType: "coupe" };
  assert.equal(findValuationProfile(v, db(generic, specific)).profile?.id, "child");
  const blocked = { ...specific, valuationType: "no_estimate" as const, centralEstimate: null, displayRange: null, reason: "child_unpriced" };
  const result = estimateValuation(v, { now, database: db(generic, blocked) });
  assert.equal(result.estimatedValue, null); assert.equal(result.reason, "child_unpriced");
});
test("specific generation/body/fuel outranks fuel-only, generation and explicit model fallback", () => {
  const fallback = fixture({ id: "model", generation: null, allowModelFallback: true });
  const generation = fixture({ id: "generation" });
  const fuel = fixture({ id: "fuel", fuel: "petrol" });
  const body = fixture({ id: "body", body: "coupe", fuel: "petrol" });
  assert.equal(findValuationProfile({ ...input, bodyType: "coupe", fuelType: "petrol" }, db(fallback, generation, fuel, body)).profile?.id, "body");
});
test("equally specific conflicting profiles abstain instead of picking an arbitrary price", () => {
  assert.equal(estimateValuation(input, { now, database: db(fixture(), fixture({ id: "other" })) }).reason, "ambiguous_valuation_profiles");
});
test("performance derivatives cannot use ordinary model values", () => {
  for (const [make, model, derivative] of [
    ["BMW", "3 Series", "M3"], ["BMW", "5 Series", "M5"], ["Mercedes-Benz", "C-Class", "C63"],
    ["Mercedes-Benz", "G-Class", "G63"], ["Audi", "A4", "RS4"], ["Porsche", "911", "Turbo"],
    ["Ferrari", "458", "Speciale"], ["Ford", "Escort", "RS2000"], ["Austin", "Mini", "Cooper S"],
    ["Nissan", "Skyline", "GT-R"], ["Toyota", "Supra", "Turbo"],
  ]) {
    const ordinary = fixture({ make, model, matchModels: [model] });
    assert.equal(estimate(ordinary, { ...input, make, model, derivative }).estimatedValue, null, `${make} ${derivative}`);
  }
});
test("explicitly researched performance identity can be selected with positive evidence", () => {
  const m3 = fixture({ make: "BMW", model: "3 Series", matchModels: ["3 Series", "M3"], requiredTokenGroups: [["m3"]], performanceTokens: ["m3"] });
  assert(estimate(m3, { ...input, make: "BMW", model: "M3" }).estimatedValue);
});
test("M Sport and ST-Line appearance trims do not imply the actual performance derivative", () => {
  const p = fixture({ make: "BMW", model: "3 Series", matchModels: ["3 Series"] });
  assert(estimate(p, { ...input, make: "BMW", model: "3 Series", derivative: "M Sport" }).estimatedValue);
});
test("joined performance names cannot bypass the ordinary-family guard", () => {
  for (const [make, model, joined] of [["Ford", "Fiesta", "FiestaST"], ["Ford", "Focus", "FocusRS"], ["Volkswagen", "Golf", "GolfGTI"], ["Honda", "Civic", "CivicTypeR"], ["Vauxhall", "Viva", "VivaGT"]]) {
    const p = fixture({ make, model, matchModels: [model] });
    assert.equal(estimate(p, { ...input, make, model: joined }).estimatedValue, null);
  }
});
test("no-estimate profiles always return the unavailable output shape", () => {
  const result = estimate(fixture({ valuationType: "no_estimate", centralEstimate: null, displayRange: null }));
  assert.equal(result.estimatedValue, null); assert.equal(result.confidence, "none"); assert.equal(result.valuationType, "no_estimate");
});
test("specialist category overrides an otherwise valid manual match", () => {
  assert.equal(estimate(fixture(), { ...input, vehicleCategory: "specialist" }).estimatedValue, null);
  assert.equal(estimate(fixture(), { ...input, vehicleCategory: "public_service" }).estimatedValue, null);
});
test("trusted exact, TfL and Sheffield registrations block even a misleading ordinary identity", () => {
  const tfl = JSON.parse(readFileSync("data/tfl-bus-fleet.json", "utf8")) as { vehicles: Record<string, number> };
  const council = JSON.parse(readFileSync("data/sheffield-council-fleet.json", "utf8")) as { vehicles: { registration: string }[] };
  for (const registration of ["WX69 ZBC", "934HRR", Object.keys(tfl.vehicles)[0], council.vehicles[0].registration]) {
    const result = valuateVehicle({ registration, make: "Toyota", model: "GT86", year: 2018, bodyType: "coupe", vehicleCategory: "standard" }, now);
    assert.equal(result.reason, "specialist_or_public_service"); assert.equal(result.estimatedValue, null);
  }
});
test("all specialist inventory profiles remain no-estimate", () => {
  for (const p of valuationDatabase.profiles.filter(p => p.classification === "specialist_no_estimate" || p.scope === "public_service_fleet")) {
    assert.equal(p.valuationType, "no_estimate"); assert.equal(valueProfile(p, input, now).estimatedValue, null);
  }
});
test("freshness downgrades after six months and expires after twelve without widening", () => {
  const p = fixture();
  const stale = valueProfile(p, input, new Date("2027-05-01T00:00:00Z"));
  assert.equal(stale.confidence, "medium"); assert(stale.estimatedValue!.high <= p.displayRange!.high);
  assert.equal(valueProfile(p, input, new Date("2027-11-01T00:00:00Z")).estimatedValue, null);
  assert.equal(valueProfile(p, input, new Date("2026-09-01T00:00:00Z")).estimatedValue, null);
});
test("missing anchor, bad date and missing algorithm calibration prevent estimates", () => {
  assert.equal(estimate({ ...algo(), marketAnchor: null, needsMarketAnchor: true }).estimatedValue, null);
  assert.equal(estimate({ ...algo(), needsCalibration: true }).reason, "algorithmic_calibration_missing");
  assert.equal(estimate(fixture({ marketDate: "2026-13" })).reason, "invalid_profile");
});
test("missing mileage is safe and lowers algorithmic confidence", () => {
  const result = estimate(algo()); assert(result.estimatedValue); assert.equal(result.confidence, "low");
});
test("nonlinear mileage adjustments are signed, bounded and saturate", () => {
  assert.equal(mileageAdjustment(48000, 48000, 0.2, 0.2), 0);
  assert(mileageAdjustment(0, 48000, 0.2, 0.2) > 0);
  for (const actual of [0, 10000, 48000, 100000, 1e9]) assert(Math.abs(mileageAdjustment(actual, 48000, 0.2, 0.2)) <= 0.2);
  const p = algo();
  const baseline = estimate(p, { ...input, mileage: 48000 }).estimatedValue!.mid;
  const extreme = estimate(p, { ...input, mileage: 1e9 }).estimatedValue!.mid;
  assert(extreme >= baseline * 0.8); assert(extreme < baseline);
});
test("negative and nonfinite mileage abstain", () => {
  for (const mileage of [-1, Infinity, NaN]) assert.equal(estimate(algo(), { ...input, mileage }).estimatedValue, null);
});
test("manual-market mileage adjustment is disabled", () => {
  assert.deepEqual(estimate(fixture(), { ...input, mileage: 0 }), estimate(fixture(), { ...input, mileage: 1e9 }));
});
test("calibrated age adjustment uses reference vehicle age rather than calendar forecasting", () => {
  const p = algo();
  const old = estimate(p, { ...input, year: 2019, mileage: 56000 });
  const baseline = estimate(p, { ...input, mileage: 48000 });
  assert.equal(old.estimatedValue!.mid, baseline.estimatedValue!.mid * 0.9);
});
test("commercial expected mileage is separate and influences calibrated adjustments", () => {
  const p = algo();
  const commercial = { ...p, algorithm: { ...p.algorithm!, expectedAnnualMileage: 15000 } };
  assert(estimate(commercial, { ...input, year: 2019, mileage: 63000 }).estimatedValue!.mid > estimate(p, { ...input, year: 2019, mileage: 63000 }).estimatedValue!.mid);
});
test("missing body/fuel and contradictory year/generation do not match a specific profile", () => {
  assert.equal(estimate(fixture({ body: "coupe" })).estimatedValue, null);
  assert.equal(estimate(fixture({ fuel: "electric" })).estimatedValue, null);
  assert.equal(estimate(fixture(), { ...input, year: 1999 }).estimatedValue, null);
  assert.equal(estimate(fixture(), { ...input, generation: "G2" }).estimatedValue, null);
});
test("research is completely routed; anchors and manual central estimates are copied exactly", () => {
  const r = JSON.parse(readFileSync("data/autoviewer-valuation-market-research-complete-v1.json", "utf8")) as { records: { centralEstimate?: number }[] };
  const seen = new Set(valuationDatabase.profiles.flatMap(p => p.research.map(ref => ref.recordIndex)));
  assert.equal(seen.size, r.records.length);
  const calibration = JSON.parse(readFileSync("data/valuation-algorithmic-calibration-v1.json", "utf8")) as { profiles: { profileId: string; usable: boolean; marketAnchor: { medianValue: number } }[] };
  for (const p of valuationDatabase.profiles) {
    if (p.centralEstimate !== null) assert(p.research.some(ref => r.records[ref.recordIndex].centralEstimate === p.centralEstimate));
    if (p.marketAnchor && !p.calibration) assert(p.research.some(ref => r.records[ref.recordIndex].centralEstimate === p.marketAnchor!.value));
    if (p.calibration) {
      assert(calibration.profiles.some(ref => ref.usable === true && ref.profileId === p.id && ref.marketAnchor.medianValue === p.marketAnchor!.value));
    }
    if (p.parentId) { assert.equal(p.valuationType, "no_estimate"); assert.equal(p.marketAnchor, null); }
  }
});
test("family split labels never create a child under a conflicting known generation", () => {
  for (const p of valuationDatabase.profiles.filter(p => p.parentId)) {
    const label = p.variant?.toLowerCase().match(/\b(?:mk[1-5]|type 42|type 4s|series [1-3])\b/)?.[0];
    if (label) assert.equal(p.generation?.toLowerCase(), label, p.id);
  }
  assert(!valuationDatabase.profiles.some(p => p.parentId && /^(?:M3|M5)(?: |$)/.test(p.variant ?? "") && p.body === "estate"));
});
test("identifiable child selectors are deduplicated across body siblings", () => {
  const keys = new Set<string>();
  for (const p of valuationDatabase.profiles.filter(p => p.parentId)) {
    const key = JSON.stringify([p.make, p.model, p.generation, p.body, p.fuel, p.yearFrom, p.yearTo, p.requiredTokenGroups]);
    assert(!keys.has(key), p.id); keys.add(key);
  }
});
test("safe inventory corrections remove false coupe rows and preserve their IDs", () => {
  const m = JSON.parse(readFileSync("data/valuation-master-inventory.json", "utf8")) as { profiles: { body: string; model: string; generation: string; supersededInventoryProfileIds?: string[] }[] };
  for (const [model, generation] of [["Stag", "Mk1"], ["SL", "R107"], ["SL", "R129"]]) {
    assert(!m.profiles.some(p => p.model === model && p.generation === generation && p.body === "coupe"));
    assert(m.profiles.some(p => p.model === model && p.generation === generation && p.body === "roadster" && p.supersededInventoryProfileIds?.length));
  }
});
test("vehicle lookup, image catalogue, fleet data and existing resolver source hashes are unchanged", () => {
  const m = JSON.parse(readFileSync("data/valuation-master-inventory.json", "utf8")) as { sourceManifest: { file: string; sha256: string }[] };
  for (const entry of m.sourceManifest) assert.equal(createHash("sha256").update(readFileSync(entry.file, "utf8")).digest("hex"), entry.sha256, entry.file);
});
test("real split derivatives remain blocked and material image aliases do not inherit parent prices", () => {
  const speciale = valuateVehicle({ make: "Ferrari", model: "458 Speciale", year: 2012, bodyType: "coupe" }, now);
  assert.equal(speciale.estimatedValue, null); assert(speciale.profileId?.includes("--"));
  assert.equal(valuateVehicle({ make: "McLaren", model: "600LT", year: 2019, bodyType: "coupe" }, now).estimatedValue, null);
  assert.equal(valuateVehicle({ make: "Honda", model: "Integra", year: 1998, bodyType: "coupe" }, now).estimatedValue, null);
  assert(valuateVehicle({ make: "Honda", model: "Integra Type R", year: 1998, bodyType: "coupe" }, now).estimatedValue);
});
