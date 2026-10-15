/**
 * Vehicle Card data fixtures.
 * Run: npx tsx lib/vehicle/vehicle-card.test.ts
 */
import assert from "node:assert/strict";
import { getMockVehicle } from "@/lib/api/mock";
import { buildVehicleCardData, VEHICLE_CARD_MAX_STATS } from "@/lib/vehicle/vehicle-card";
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

const demo = getMockVehicle("AV19SWF")!;

/** Shape of a DVSA-only live lookup: no transmission, power, CO2, Euro or tax status. */
function dvsaOnly(): VehicleRecord {
  return {
    ...demo,
    summary: {
      ...demo.summary,
      transmission: null,
      powerBhp: null,
      tax: { status: "Unknown" },
      isDemo: false,
    },
    details: {
      ...demo.details,
      transmission: null,
      co2Emissions: null,
      euroStatus: null,
    },
  };
}

run("demo vehicle fills nine tiles in priority order, mileage ahead of year", () => {
  const card = buildVehicleCardData(demo);
  assert.equal(card.stats.length, VEHICLE_CARD_MAX_STATS);
  assert.deepEqual(
    card.stats.map((item) => item.key),
    ["fuel", "engine", "transmission", "mileage", "firstRegistered", "co2", "euro", "mot", "tax"],
  );
  assert.deepEqual(
    card.stats.map((item) => item.value).slice(0, 8),
    ["Petrol", "1,242 cc", "Manual", "48,320 mi", "Mar 2019", "111 g/km", "Euro 6", "Valid"],
  );
});

run("power is never shown", () => {
  assert.ok(!buildVehicleCardData(demo).stats.some((item) => item.value.includes("bhp")));
});

run("missing fields are omitted, never padded or inferred", () => {
  const card = buildVehicleCardData(dvsaOnly());
  assert.deepEqual(
    card.stats.map((item) => item.key),
    ["fuel", "engine", "mileage", "firstRegistered", "mot", "year"],
  );
  assert.ok(card.stats.every((item) => !/not available|unknown/i.test(item.value)));
});

run("mileage keeps the unit recorded at the MOT and is omitted when absent", () => {
  const vehicle = dvsaOnly();
  const latest = vehicle.summary.latestMileage!;
  vehicle.motTests = [
    { ...vehicle.motTests[0], odometerValue: latest, odometerUnit: "km" },
    ...vehicle.motTests.slice(1),
  ];
  const mileage = buildVehicleCardData(vehicle).stats.find((item) => item.key === "mileage");
  assert.equal(mileage?.value, `${latest.toLocaleString("en-GB")} km`);

  vehicle.summary.latestMileage = null;
  assert.ok(!buildVehicleCardData(vehicle).stats.some((item) => item.key === "mileage"));
});

run("unknown MOT status is left out", () => {
  const vehicle = dvsaOnly();
  vehicle.summary.motStatus = { status: "Unknown" };
  assert.ok(!buildVehicleCardData(vehicle).stats.some((item) => item.key === "mot"));
});

run("September uses the three-letter short month", () => {
  const vehicle = dvsaOnly();
  vehicle.details.monthOfFirstRegistration = "2025-09";
  const registered = buildVehicleCardData(vehicle).stats.find((item) => item.key === "firstRegistered");
  assert.equal(registered?.value, "Sep 2025");
});

run("disclaimer carries the registered colour only when known", () => {
  assert.equal(
    buildVehicleCardData(demo).disclaimer,
    "Illustrative image. Actual vehicle may differ. Registered colour: Yellow",
  );
  const vehicle = dvsaOnly();
  vehicle.summary.colour = null;
  vehicle.details.colour = null;
  const card = buildVehicleCardData(vehicle);
  assert.equal(card.colour, null);
  assert.equal(card.disclaimer, "Illustrative image. Actual vehicle may differ.");
});
