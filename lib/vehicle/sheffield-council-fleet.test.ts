/**
 * Sheffield Council fleet image lookup.
 * Run: npx tsx --conditions=react-server lib/vehicle/sheffield-council-fleet.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import sheffieldCouncilFleet from "@/data/sheffield-council-fleet.json";
import { normalizeRegistration } from "@/lib/vehicle/registration";
import { resolveTflBusImageFields } from "@/lib/vehicle/tfl-bus-fleet";
import {
  findSheffieldCouncilVehicle,
  resolveSheffieldCouncilImageFields,
} from "@/lib/vehicle/sheffield-council-fleet";

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
const imageExists = (filename: string) =>
  existsSync(join(ROOT, "public", "cars", filename));

const vehicles = sheffieldCouncilFleet.vehicles as Array<{
  registration: string;
  make: string;
  model: string;
  type: string;
  bodyManufacturer: string;
  imageFilename: string | null;
}>;

run("dataset holds every registration once with the expected fields", () => {
  assert.equal(vehicles.length, sheffieldCouncilFleet.count);
  assert.equal(sheffieldCouncilFleet.count, 1002);
  const seen = new Set<string>();
  for (const vehicle of vehicles) {
    const registration = normalizeRegistration(vehicle.registration);
    assert.match(registration, /^[A-Z0-9]{2,8}$/);
    assert.equal(registration, vehicle.registration);
    assert.ok(!seen.has(registration), `duplicate ${registration}`);
    seen.add(registration);
    assert.equal(typeof vehicle.make, "string");
    assert.equal(typeof vehicle.model, "string");
    assert.equal(typeof vehicle.type, "string");
    assert.equal(typeof vehicle.bodyManufacturer, "string");
    assert.ok("imageFilename" in vehicle);
  }
  assert.equal(seen.size, 1002);
});

run("exact registration lookup is case and spacing insensitive", () => {
  const sample = vehicles[0];
  assert.ok(sample);
  const spaced = `${sample.registration.slice(0, 4)} ${sample.registration.slice(4)}`;
  assert.equal(
    findSheffieldCouncilVehicle(spaced)?.registration,
    sample.registration,
  );
  assert.equal(
    findSheffieldCouncilVehicle(sample.registration.toLowerCase())?.registration,
    sample.registration,
  );
});

run("mapped image files resolve when present, otherwise placeholder", () => {
  const withFile = vehicles.find(
    (v) => v.imageFilename && imageExists(v.imageFilename),
  );
  const withoutFile = vehicles.find(
    (v) => v.imageFilename && !imageExists(v.imageFilename),
  );
  assert.ok(withFile, "expected at least one mapped file on disk");

  const ok = resolveSheffieldCouncilImageFields(withFile.registration);
  assert.equal(ok?.imageSrc, `/cars/${withFile.imageFilename}`);
  assert.equal(ok?.imageMatch, "exact");
  assert.equal(ok?.imageConfidence, "high");
  assert.match(ok?.imageMatchReason ?? "", /Sheffield Council fleet/);

  if (!withoutFile) return;

  const pending = resolveSheffieldCouncilImageFields(withoutFile.registration);
  assert.equal(pending?.imageSrc, null);
  assert.equal(pending?.imageMatch, "placeholder");
  assert.match(pending?.imageMatchReason ?? "", /not available yet/);
});

run("known Sheffield tipper/crane and beavertail plates use fleet images", () => {
  const tipper = resolveSheffieldCouncilImageFields("YT64EAY");
  assert.equal(tipper?.imageSrc, "/cars/daf-lf-euro6-tipper-crane-2013-2021.webp");
  assert.equal(findSheffieldCouncilVehicle("YT64 EAY")?.type, "TIPPER / CRANE");

  const beavertail = resolveSheffieldCouncilImageFields("lt23dyb");
  assert.equal(
    beavertail?.imageSrc,
    "/cars/isuzu-n75-n-series-2023-beavertail-2023-2026.webp",
  );
});

run("Sheffield mower/tractor plates resolve their exact imageFilename mappings", () => {
  const cases: Array<[string, string, string]> = [
    ["YX70 EYF", "toro-ltf3000-2010-2026.webp", "TORO LTF3000"],
    ["YJ07 VEU", "john-deere-3320-2005-2014.webp", "3320"],
    ["YX21 FUT", "toro-lt3340-2010-2026.webp", "TORO LT3340"],
    ["YX24 DZL", "amazone-profi-ph1500-2005-2026.webp", "AMAZONE PROFI -  PH1500"],
    ["FJ23 DVX", "ventrac-compact-articulated-2005-2026.webp", "VENTRAC"],
  ];
  for (const [registration, filename, model] of cases) {
    const vehicle = findSheffieldCouncilVehicle(registration);
    assert.ok(vehicle, registration);
    assert.equal(vehicle?.model, model, registration);
    assert.equal(vehicle?.imageFilename, filename, registration);

    const image = resolveSheffieldCouncilImageFields(registration);
    assert.equal(image?.imageSrc, `/cars/${filename}`, registration);
    assert.equal(image?.imageMatch, "exact", registration);
    assert.equal(image?.imageConfidence, "high", registration);
    assert.equal(image?.imageFallbackUsed, false, registration);
  }
});

run("non-Sheffield registrations fall through to the normal matcher", () => {
  for (const registration of ["SA23YZK", "AB12CDE", "LV73FET", "", null, undefined]) {
    assert.equal(
      resolveSheffieldCouncilImageFields(registration),
      null,
      String(registration),
    );
  }
});

run("TfL behaviour is unchanged for London bus plates", () => {
  assert.ok(resolveTflBusImageFields("LV73 FET"));
  assert.equal(resolveSheffieldCouncilImageFields("LV73 FET"), null);
});

run("dataset and resolver are server-only and never imported by client code", () => {
  const resolverSource = readFileSync(
    join(ROOT, "lib", "vehicle", "sheffield-council-fleet.ts"),
    "utf8",
  );
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
      const importsData = /sheffield-council-fleet\.json/.test(source);
      const importsResolver = /@\/lib\/vehicle\/sheffield-council-fleet["']/.test(
        source,
      );
      if (
        importsData &&
        relative !== "lib/vehicle/sheffield-council-fleet.ts"
      ) {
        offenders.push(`${relative} imports the dataset`);
      }
      if (importsResolver && /^\s*["']use client["']/.test(source)) {
        offenders.push(`${relative} is a client module`);
      }
    }
  };
  for (const dir of ["app", "components", "lib", "hooks"]) {
    if (existsSync(join(ROOT, dir))) walk(join(ROOT, dir));
  }
  assert.deepEqual(offenders, []);
  assert.ok(!existsSync(join(ROOT, "public", "sheffield-council-fleet.json")));
});

console.log("All Sheffield Council fleet tests passed.");
