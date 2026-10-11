/**
 * TfL bus fleet image lookup.
 * Run: npx tsx --conditions=react-server lib/vehicle/tfl-bus-fleet.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import tflBusFleet from "@/data/tfl-bus-fleet.json";
import vehicleImagesLibrary from "@/data/vehicle-images.json";
import { resolveImageFieldsForVehicle } from "@/lib/vehicle/images";
import { findTflBusType, resolveTflBusImageFields } from "@/lib/vehicle/tfl-bus-fleet";

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`PASS  ${name}`);
  } catch (error) {
    console.error(`FAIL  ${name}`);
    throw error;
  }
}

const ROOT = process.cwd();
const imageExists = (filename: string) => existsSync(join(ROOT, "public", "cars", filename));

function expectMappedImage(registration: string, filename: string) {
  const fields = resolveTflBusImageFields(registration);
  assert.ok(fields, `${registration} should be resolved by TfL data`);
  if (imageExists(filename)) {
    assert.equal(fields.imageSrc, `/cars/${filename}`);
    assert.equal(fields.imageMatch, "exact");
  } else {
    assert.equal(fields.imageSrc, null, `${filename} is missing, so ${registration} must use the placeholder`);
    assert.equal(fields.imageMatch, "placeholder");
  }
}

run("dataset holds every registration once with a valid type", () => {
  const vehicles = tflBusFleet.vehicles as Record<string, number>;
  const registrations = Object.keys(vehicles);
  assert.equal(registrations.length, 8982);
  assert.equal(tflBusFleet.count, registrations.length);
  for (const registration of registrations) {
    assert.match(registration, /^[A-Z0-9]{2,8}$/);
    assert.ok(tflBusFleet.types[vehicles[registration]], `${registration} type`);
  }
});

run("only reviewed bus types are mapped, all to catalogue files", () => {
  const catalogue = new Set(vehicleImagesLibrary.vehicles.map((v) => v.filename));
  const unmapped = tflBusFleet.types
    .filter((type) => type.image === null)
    .map((type) => `${type.chassis}|${type.body}|${type.deck}`)
    .sort();
  assert.deepEqual(unmapped, [
    "BYD K8SR|BYD|double",
    "Caetano e.City Gold|Caetano e.City Gold|single",
    "Irizar eTram|Irizar eTram|single",
    "Optare Solo SR|Optare Solo SR|single",
    "Scania N230UD|Scania OmniCity|double",
    "Volvo B5LH|Wrightbus SRM|double",
    "Wrightbus SRM|Wrightbus SRM|double",
  ]);
  for (const type of tflBusFleet.types) {
    if (type.image && type.image !== "placeholder") assert.ok(catalogue.has(type.image), type.image);
  }
  const imageFor = (chassis: string, body: string, deck: string) =>
    tflBusFleet.types.find((t) => t.chassis === chassis && t.body === body && t.deck === deck)?.image;
  assert.equal(imageFor("Wrightbus NRM", "Wrightbus NRM", "double"), "wrightbus-new-routemaster-2012-2026.webp");
  assert.equal(imageFor("Volvo B5LH", "Wrightbus Eclipse Gemini 3", "double"), "wrightbus-eclipse-gemini-3-2013-2026.webp");
  assert.equal(imageFor("VDL DB300", "Wrightbus Gemini 2", "double"), "wrightbus-eclipse-gemini-2-2009-2017.webp");
  assert.equal(imageFor("BYD D8UR-DD", "ADL Enviro 400EV City", "double"), "alexander-dennis-enviro400-city-2015-2026.webp");
  assert.equal(imageFor("ADL Enviro 400H", "ADL Enviro 400H MMC", "double"), "alexander-dennis-enviro400-mmc-2014-2026.webp");
  assert.equal(imageFor("ADL Enviro 400H", "ADL Enviro 400H", "double"), "alexander-dennis-enviro400-mk1-2005-2015.webp");
  assert.equal(imageFor("ADL Enviro 200", "ADL Enviro 200", "single"), "alexander-dennis-enviro200-2006-2016.webp");
  assert.equal(imageFor("BYD D8UR", "ADL Enviro 200 MMC (EV)", "single"), "alexander-dennis-enviro200-mmc-2014-2026.webp");
  assert.equal(imageFor("Volvo BZL", "MCV", "double"), "mcv-evoseti-double-deck-2015-2026.webp");
  assert.equal(imageFor("Volvo BZL", "MCV", "single"), "mcv-volvo-bzl-single-deck-2022-2026.webp");
  assert.equal(imageFor("Switch Metrocity EV", "Optare", "single"), "optare-solo-sr-2012-2020.webp");
  assert.equal(imageFor("Mercedes Citaro", "Mercedes Citaro K", "single"), "mercedes-benz-citaro-c2-2011-2026.webp");
});

run("LV73 FET: StreetDeck Electroliner double-decker uses the StreetDeck image 663", () => {
  assert.deepEqual(
    { chassis: findTflBusType("LV73 FET")?.chassis, deck: findTflBusType("LV73 FET")?.deck },
    { chassis: "Wrightbus Electroliner", deck: "double" },
  );
  expectMappedImage("LV73 FET", "wrightbus-streetdeck-mk1-2014-2026.webp");
  assert.equal(resolveTflBusImageFields("LV73 FET")?.imageSrc, "/cars/wrightbus-streetdeck-mk1-2014-2026.webp");
});

run("LV73 FGU: GB Kite Electroliner single-decker uses image 676", () => {
  assert.equal(findTflBusType("lv73fgu")?.deck, "single");
  expectMappedImage("LV73 FGU", "wrightbus-gb-kite-electroliner-2021-2026.webp");
  assert.equal(resolveTflBusImageFields("LV73 FGU")?.imageSrc, "/cars/wrightbus-gb-kite-electroliner-2021-2026.webp");
});

run("LF75 OTR: BYD B11EO2 double-decker uses image 677 or the placeholder", () => {
  assert.equal(findTflBusType("LF75 OTR")?.chassis, "BYD B11EO2");
  expectMappedImage("LF75 OTR", "byd-bd11-2024-2026.webp");
});

run("LA75 ZDC: BYD B12E04 single-decker uses image 678 or the placeholder", () => {
  assert.equal(findTflBusType("LA75 ZDC")?.chassis, "BYD B12E04");
  expectMappedImage("LA75 ZDC", "byd-b12-2024-2026.webp");
});

run("non-TfL registrations fall through to the normal matcher", () => {
  for (const registration of ["SA23YZK", "AB12CDE", "", null, undefined]) {
    assert.equal(resolveTflBusImageFields(registration), null, String(registration));
  }
});

run("unreviewed TfL bus types fall through instead of guessing", () => {
  const vehicles = tflBusFleet.vehicles as Record<string, number>;
  const tramIndex = tflBusFleet.types.findIndex((type) => type.chassis === "Irizar eTram");
  const tram = Object.keys(vehicles).find((reg) => vehicles[reg] === tramIndex);
  assert.ok(tram);
  assert.equal(findTflBusType(tram)?.chassis, "Irizar eTram");
  assert.equal(resolveTflBusImageFields(tram), null);
});

run("existing matcher output is unchanged for buses", () => {
  assert.equal(
    resolveImageFieldsForVehicle({ registration: "LV73FET", make: "WRIGHTBUS", model: "ELECTROLINER", year: 2023 }).imageSrc,
    null,
  );
  assert.equal(
    resolveImageFieldsForVehicle({ registration: "LV73FGU", make: "WRIGHTBUS", model: "GB KITE ELECTROLINER", year: 2023 }).imageSrc,
    "/cars/wrightbus-gb-kite-electroliner-2021-2026.webp",
  );
  assert.equal(
    resolveImageFieldsForVehicle({ registration: "LF75OTR", make: "BYD", model: "BYD EBUS", year: 2025 }).imageSrc,
    null,
  );
});

run("dataset and resolver are server-only and never imported by client code", () => {
  const resolverSource = readFileSync(join(ROOT, "lib", "vehicle", "tfl-bus-fleet.ts"), "utf8");
  assert.match(resolverSource, /^import "server-only";/);

  const offenders: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      if (name === "node_modules" || name.startsWith(".")) continue;
      const full = join(dir, name);
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.(tsx?|jsx?|mjs)$/.test(name) || /\.test\.ts$/.test(name)) continue;
      const source = readFileSync(full, "utf8");
      const relative = full.slice(ROOT.length + 1).replace(/\\/g, "/");
      const importsData = /tfl-bus-fleet\.json/.test(source);
      const importsResolver = /@\/lib\/vehicle\/tfl-bus-fleet["']/.test(source);
      if (importsData && relative !== "lib/vehicle/tfl-bus-fleet.ts" && relative !== "scripts/build-tfl-bus-fleet.mjs") {
        offenders.push(`${relative} imports the dataset`);
      }
      if (importsResolver && /^\s*["']use client["']/.test(source)) offenders.push(`${relative} is a client module`);
    }
  };
  for (const dir of ["app", "components", "lib", "hooks"]) {
    if (existsSync(join(ROOT, dir))) walk(join(ROOT, dir));
  }
  assert.deepEqual(offenders, []);
  assert.ok(!existsSync(join(ROOT, "public", "tfl-bus-fleet.json")));
});
