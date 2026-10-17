/**
 * Exact special-vehicle registration image lookup.
 * Run: npx tsx --conditions=react-server lib/vehicle/special-vehicle-fleet.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import vehicleImagesLibrary from "@/data/vehicle-images.json";
import { resolveVehicleImage } from "@/lib/vehicle/images";
import { resolveSheffieldCouncilImageFields } from "@/lib/vehicle/sheffield-council-fleet";
import {
  findSpecialVehicleRegistration,
  resolveSpecialVehicleImageFields,
} from "@/lib/vehicle/special-vehicle-fleet";
import { resolveTflBusImageFields } from "@/lib/vehicle/tfl-bus-fleet";

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

run("WX69 ZBC and WX17 YCK resolve to catalogue record 1074", () => {
  assertRecord1074("WX69 ZBC");
  assertRecord1074("wx69zbc");
  assertRecord1074("WX17 YCK");
  assertRecord1074("wx17yck");
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

run("special registration lookup runs before TfL, Sheffield and the generic matcher", () => {
  const source = readFileSync(join(process.cwd(), "lib", "api", "vehicle-service.ts"), "utf8");
  const special = source.indexOf("resolveSpecialVehicleImageFields(");
  const tfl = source.indexOf("resolveTflBusImageFields(");
  const sheffield = source.indexOf("resolveSheffieldCouncilImageFields(");
  const generic = source.indexOf("resolveImageFieldsForVehicle(");
  assert.ok(special !== -1 && special < tfl);
  assert.ok(tfl < sheffield && sheffield < generic);
});

console.log("All special-vehicle registration tests passed.");
