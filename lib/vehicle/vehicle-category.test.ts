/**
 * Full Report eligibility from trusted vehicle categories.
 * Run: node --conditions=react-server --import tsx lib/vehicle/vehicle-category.test.ts
 */
import assert from "node:assert/strict";
import { lookupLocalRegistrationKnowledge } from "@/lib/vehicle/vehicle-resolution";
import {
  isFullReportEligible,
  resolveVehicleCategory,
  type VehicleCategory,
} from "@/lib/vehicle/vehicle-category";

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`PASS  ${name}`);
  } catch (error) {
    console.error(`FAIL  ${name}`);
    throw error;
  }
}

run("known fire appliance -> paid report disabled", () => {
  const knowledge = lookupLocalRegistrationKnowledge("WX69 ZBC");
  assert.ok(knowledge);
  assert.equal(knowledge.tier, "exact");
  assert.equal(knowledge.category, "public_service");
  assert.equal(isFullReportEligible(knowledge.category), false);
});

run("Sheffield specialist/public-service vehicle -> paid report disabled", () => {
  const knowledge = lookupLocalRegistrationKnowledge("YX24 DZL");
  assert.ok(knowledge);
  assert.equal(knowledge.tier, "fleet-sheffield");
  assert.equal(knowledge.category, "public_service");
  assert.equal(isFullReportEligible(knowledge.category), false);
});

run("future specialist category can use same logic", () => {
  const ambulanceCategory = resolveVehicleCategory({
    tier: "exact",
    exactCategory: "public_service",
  });
  assert.equal(ambulanceCategory, "public_service");
  assert.equal(isFullReportEligible(ambulanceCategory), false);

  const plantCategory = resolveVehicleCategory({
    tier: "exact",
    exactCategory: "specialist",
  });
  assert.equal(plantCategory, "specialist");
  assert.equal(isFullReportEligible(plantCategory), false);

  // Exact map without explicit category still treats as specialist.
  assert.equal(
    resolveVehicleCategory({ tier: "exact", exactCategory: null }),
    "specialist",
  );
});

run("normal passenger car -> paid report remains available", () => {
  const knowledge = lookupLocalRegistrationKnowledge("AV19 SWF");
  assert.equal(knowledge, null);
  const category: VehicleCategory = "standard";
  assert.equal(isFullReportEligible(category), true);
  assert.equal(isFullReportEligible(undefined), true);
});

run("generic commercial vehicle with no trusted fleet mapping -> paid report remains available", () => {
  // Tipper/crane style make/model alone must not disable Full Report.
  const category = resolveVehicleCategory({ tier: null });
  assert.equal(category, "standard");
  assert.equal(isFullReportEligible(category), true);

  // A random plate with no local knowledge stays eligible.
  assert.equal(lookupLocalRegistrationKnowledge("AB12 CDE"), null);
  assert.equal(isFullReportEligible("standard"), true);
});

run("exact specialist tractor mapping disables Full Report", () => {
  const knowledge = lookupLocalRegistrationKnowledge("934 HRR");
  assert.ok(knowledge);
  assert.equal(knowledge.category, "specialist");
  assert.equal(isFullReportEligible(knowledge.category), false);
});

console.log("All vehicle-category tests passed.");
