/**
 * Exact special-vehicle registration image lookup.
 * Run: npx tsx --conditions=react-server lib/vehicle/special-vehicle-fleet.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getMockVehicle } from "@/lib/api/mock";
import vehicleImagesLibrary from "@/data/vehicle-images.json";
import { resolveVehicleImage } from "@/lib/vehicle/images";
import { modelTitleFields } from "@/lib/vehicle/model-title";
import { resolveSheffieldCouncilImageFields } from "@/lib/vehicle/sheffield-council-fleet";
import {
  findSpecialVehicleRegistration,
  fleetDisplayFields,
  resolveSpecialVehicleImageFields,
} from "@/lib/vehicle/special-vehicle-fleet";
import { resolveTflBusImageFields } from "@/lib/vehicle/tfl-bus-fleet";
import { buildVehicleCardData } from "@/lib/vehicle/vehicle-card";

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`PASS  ${name}`);
  } catch (error) {
    console.error(`FAIL  ${name}`);
    throw error;
  }
}

const PUMP = "mercedes-benz-atego-1327f-2016-2021-pumping-appliance.webp";
const GENERIC_ATEGO = "mercedes-benz-atego-2013-2026.webp";

const catalogue = vehicleImagesLibrary.vehicles as Array<{
  priority: number;
  filename: string;
}>;

function assertRecord1074(registration: string) {
  const mapped = findSpecialVehicleRegistration(registration);
  assert.equal(mapped?.imageRecordId, 1074, registration);
  const record = catalogue.find((entry) => entry.priority === mapped?.imageRecordId);
  assert.equal(record?.filename, PUMP);
  const image = resolveSpecialVehicleImageFields(registration);
  assert.equal(image?.imageSrc, `/cars/${PUMP}`);
  assert.equal(image?.imageMatch, "exact");
  assert.equal(image?.imageConfidence, "high");
  assert.equal(image?.imageFallbackUsed, false);
}

run("WX69 ZBC, WX17 YCK and WX17 YCL resolve to catalogue record 1074", () => {
  assertRecord1074("WX69 ZBC");
  assertRecord1074("wx69zbc");
  assertRecord1074("WX17 YCK");
  assertRecord1074("wx17yck");
  assertRecord1074("WX17 YCL");
  assertRecord1074("wx17ycl");
});

run("Mercedes UNKNOWN and a generic Atego do not become a pumping appliance", () => {
  assert.equal(resolveSpecialVehicleImageFields("AB12 CDE"), null);
  assert.equal(findSpecialVehicleRegistration("MERCEDES"), null);

  const unknown = resolveVehicleImage({
    make: "MERCEDES",
    model: "UNKNOWN",
    year: 2019,
    firstRegistrationDate: "2019-11-12",
  });
  assert.equal(unknown.match, "placeholder");
  assert.equal(unknown.filename, null);
  assert.notEqual(unknown.filename, PUMP);

  for (const model of ["ATEGO", "ATEGO 1327", "ATEGO 1327F"]) {
    const generic = resolveVehicleImage({
      make: "MERCEDES",
      model,
      year: 2019,
    });
    assert.equal(generic.filename, GENERIC_ATEGO, model);
    assert.notEqual(generic.filename, PUMP, model);
  }
});

run("unmapped plates still reach TfL and Sheffield", () => {
  assert.equal(resolveSpecialVehicleImageFields("LV73 FET"), null);
  assert.ok(resolveTflBusImageFields("LV73 FET"));
  assert.equal(resolveSpecialVehicleImageFields("YT64 EAY"), null);
  assert.equal(
    resolveSheffieldCouncilImageFields("YT64 EAY")?.imageSrc,
    "/cars/daf-lf-euro6-tipper-crane-2013-2021.webp",
  );
});

function cardFor(input: {
  registration: string;
  make: string;
  model: string;
  year: number;
  colour: string | null;
  engine: number | null;
  fuel: string | null;
}) {
  const vehicle = getMockVehicle("AV19SWF");
  assert.ok(vehicle);
  const display = fleetDisplayFields({
    registration: input.registration,
    make: input.make,
    model: input.model,
  });
  vehicle.summary = {
    ...vehicle.summary,
    displayRegistration: input.registration,
    make: display.make,
    model: display.model,
    modelTitle: display.modelTitle,
    modelVariant: display.modelVariant,
    year: input.year,
    colour: input.colour,
    fuelType: input.fuel,
    engineCapacity: input.engine,
    transmission: null,
    powerBhp: null,
  };
  vehicle.details = {
    ...vehicle.details,
    make: display.make,
    model: display.model,
    colour: input.colour,
    fuelType: input.fuel,
    engineCapacity: input.engine,
    yearOfManufacture: input.year,
    transmission: null,
    co2Emissions: null,
    euroStatus: null,
  };
  return buildVehicleCardData(vehicle);
}

run("UNKNOWN API model on a verified registration shows the local model and body", () => {
  for (const [registration, year] of [
    ["WX69 ZBC", 2019],
    ["WX17 YCK", 2017],
    ["WX17 YCL", 2017],
  ] as const) {
    const card = cardFor({
      registration,
      make: "Mercedes",
      model: "Unknown",
      year,
      colour: "Red",
      engine: null,
      fuel: "Diesel",
    });
    assert.equal(card.title, `${year} Mercedes-Benz Atego 1327F`);
    assert.equal(card.variant, "Pumping Appliance");
    assert.equal(card.colour, "Red");
    assert.equal(
      card.disclaimer,
      "Illustrative image. Actual vehicle may differ. Registered colour: Red",
    );
  }
});

run("a normal vehicle keeps its API make and model", () => {
  const api = { make: "Volkswagen", model: "Golf 1.5 TSI" };
  const display = fleetDisplayFields({ registration: "AB12 CDE", ...api });
  const titles = modelTitleFields(api.make, api.model);
  assert.equal(display.make, api.make);
  assert.equal(display.model, api.model);
  assert.equal(display.modelTitle, titles.modelTitle);
  assert.equal(display.modelVariant, titles.modelVariant);

  const kept = fleetDisplayFields({
    registration: "WX69ZBC",
    make: "Mercedes-Benz",
    model: "Atego 1327",
  });
  assert.equal(kept.make, "Mercedes-Benz");
  // Exact-registration verified model wins over a broader API model.
  assert.equal(kept.model, "Atego 1327F");
});

run("missing engine stays omitted", () => {
  const card = cardFor({
    registration: "WX69 ZBC",
    make: "Mercedes",
    model: "UNKNOWN",
    year: 2019,
    colour: "Red",
    engine: null,
    fuel: "Diesel",
  });
  assert.ok(!card.stats.some((item) => item.key === "engine"));
  assert.ok(card.stats.some((item) => item.key === "fuel" && item.value === "Diesel"));
});

run("special registration lookup runs before TfL, Sheffield and the generic matcher", () => {
  const source = readFileSync(
    join(process.cwd(), "lib", "vehicle", "vehicle-resolution.ts"),
    "utf8",
  );
  const special = source.indexOf("resolveSpecialVehicleImageFields(registration)");
  const tfl = source.indexOf("resolveTflBusImageFields(registration)");
  const sheffield = source.indexOf("resolveSheffieldCouncilImageFields(registration)");
  assert.ok(special !== -1 && special < tfl);
  assert.ok(tfl < sheffield);

  const service = readFileSync(join(process.cwd(), "lib", "api", "vehicle-service.ts"), "utf8");
  assert.match(service, /resolveVehicleImageByPriority/);
  assert.match(service, /mergeVehicleIdentity/);
});

console.log("All special-vehicle registration tests passed.");
