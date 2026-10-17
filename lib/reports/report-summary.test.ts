/**
 * Free-report summary banner by vehicleCategory.
 * Run: npx tsx lib/reports/report-summary.test.ts
 */
import assert from "node:assert/strict";
import { getMockVehicle } from "@/lib/api/mock";
import {
  LIMITED_PUBLIC_DATA_DETAIL,
  LIMITED_PUBLIC_DATA_TITLE,
  freeReportSummary,
} from "@/lib/reports/report-summary";
import type { VehicleRecord } from "@/types/vehicle";

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`PASS  ${name}`);
  } catch (error) {
    console.error(`FAIL  ${name}`);
    throw error;
  }
}

function withCategory(
  vehicle: VehicleRecord,
  vehicleCategory: VehicleRecord["summary"]["vehicleCategory"],
): VehicleRecord {
  return {
    ...vehicle,
    summary: {
      ...vehicle.summary,
      vehicleCategory,
    },
  };
}

const base = getMockVehicle("AV19SWF");
assert.ok(base);

run('public_service -> neutral "Limited public data available"', () => {
  const state = freeReportSummary(withCategory(base, "public_service"));
  assert.equal(state.tone, "info");
  assert.equal(state.icon, "info");
  assert.equal(state.title, LIMITED_PUBLIC_DATA_TITLE);
  assert.equal(state.detail, LIMITED_PUBLIC_DATA_DETAIL);
});

run("specialist -> same neutral state", () => {
  const state = freeReportSummary(withCategory(base, "specialist"));
  assert.equal(state.tone, "info");
  assert.equal(state.icon, "info");
  assert.equal(state.title, LIMITED_PUBLIC_DATA_TITLE);
  assert.equal(state.detail, LIMITED_PUBLIC_DATA_DETAIL);
});

run("standard vehicle -> existing summary logic unchanged", () => {
  const cleanRecalls = {
    hasOpenRecalls: false,
    count: 0,
    items: [] as [],
    sourceNote: "No open recalls.",
    dataAvailable: true as const,
  };
  const clean = freeReportSummary({
    ...base,
    summary: {
      ...base.summary,
      vehicleCategory: "standard",
      recalls: cleanRecalls,
    },
    recalls: cleanRecalls,
  });
  assert.equal(clean.tone, "positive");
  assert.equal(clean.icon, "check");
  assert.equal(clean.title, "No immediate issues indicated");
  assert.match(clean.detail, /free public/);

  const withRecall = freeReportSummary(withCategory(base, "standard"));
  assert.equal(withRecall.tone, "attention");
  assert.equal(withRecall.icon, "warning");
  assert.equal(withRecall.title, "Items need attention");
});

run("public_service overrides green even when recalls are clean", () => {
  const state = freeReportSummary({
    ...base,
    summary: {
      ...base.summary,
      vehicleCategory: "public_service",
      recalls: {
        ...base.summary.recalls,
        hasOpenRecalls: false,
      },
    },
  });
  assert.equal(state.tone, "info");
  assert.equal(state.title, LIMITED_PUBLIC_DATA_TITLE);
});

console.log("All report-summary tests passed.");
