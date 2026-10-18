/**
 * Shared vehicle resolution precedence.
 * Run: node --conditions=react-server --import tsx lib/vehicle/vehicle-resolution.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { resolveVehicleImage } from "@/lib/vehicle/images";
import {
  findSpecialVehicleRegistration,
  fleetDisplayFields,
  resolveSpecialVehicleImageFields,
} from "@/lib/vehicle/special-vehicle-fleet";
import {
  lookupLocalRegistrationKnowledge,
  mergeVehicleIdentity,
  resolveDisplayIdentity,
  resolveRegistrationScopedImageFields,
  resolveVehicleImageByPriority,
} from "@/lib/vehicle/vehicle-resolution";
import { resolveSheffieldCouncilImageFields } from "@/lib/vehicle/sheffield-council-fleet";
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

run("1. exact registration model+image wins over external UNKNOWN", () => {
  const merged = mergeVehicleIdentity({
    registration: "WX69 ZBC",
    make: "Mercedes",
    model: "UNKNOWN",
  });
  assert.equal(merged.make, "Mercedes-Benz");
  assert.equal(merged.model, "Atego 1327F");
  assert.equal(merged.modelVariant, "Pumping Appliance");
  assert.equal(merged.sources.model, "local-exact");

  const image = resolveVehicleImageByPriority("WX69 ZBC", {
    make: "Mercedes",
    model: "UNKNOWN",
    year: 2019,
  });
  assert.equal(image.imageSrc, `/cars/${PUMP}`);
  assert.equal(image.imageMatch, "exact");
  assert.equal(image.imageConfidence, "high");
});

run("2. exact registration keeps local model/body; external engine is separate", () => {
  const merged = mergeVehicleIdentity({
    registration: "WX17 YCK",
    make: "Mercedes",
    model: "Unknown",
  });
  assert.equal(merged.model, "Atego 1327F");
  assert.equal(merged.body, "Pumping Appliance");
  // Engine is not part of identity merge; callers keep external engineCapacity as-is.
  assert.equal(merged.local?.imageRecordId, 1074);
});

run("3. exact registration image mapping works with no other useful metadata", () => {
  const image = resolveSpecialVehicleImageFields("wx69zbc");
  assert.equal(image?.imageSrc, `/cars/${PUMP}`);
  assert.equal(image?.imageMatch, "exact");

  // Even when the generic matcher receives empty/UNKNOWN identity, registration wins.
  const viaPriority = resolveVehicleImageByPriority("WX69ZBC", {
    make: "UNKNOWN",
    model: "UNKNOWN",
    year: null,
  });
  assert.equal(viaPriority.imageSrc, `/cars/${PUMP}`);
});

run("4. no exact registration mapping keeps fleet/generic fallback", () => {
  assert.equal(findSpecialVehicleRegistration("LV73 FET"), null);
  assert.ok(resolveTflBusImageFields("LV73 FET")?.imageSrc);
  assert.equal(resolveRegistrationScopedImageFields("LV73 FET")?.imageSrc, resolveTflBusImageFields("LV73 FET")?.imageSrc);

  assert.equal(findSpecialVehicleRegistration("YT64 EAY"), null);
  assert.equal(
    resolveSheffieldCouncilImageFields("YT64 EAY")?.imageSrc,
    "/cars/daf-lf-euro6-tipper-crane-2013-2021.webp",
  );

  const generic = resolveVehicleImageByPriority("AB12 CDE", {
    make: "VOLKSWAGEN",
    model: "GOLF",
    year: 2019,
  });
  assert.ok(generic.imageSrc?.includes("volkswagen-golf"));
  assert.notEqual(generic.imageSrc, `/cars/${PUMP}`);
});

run("5. generic Mercedes UNKNOWN must not become a fire appliance", () => {
  assert.equal(resolveSpecialVehicleImageFields("AB12 CDE"), null);
  assert.equal(lookupLocalRegistrationKnowledge("AB12 CDE"), null);

  const unknown = resolveVehicleImage({
    make: "MERCEDES",
    model: "UNKNOWN",
    year: 2019,
  });
  assert.equal(unknown.match, "placeholder");
  assert.equal(unknown.filename, null);

  const viaPriority = resolveVehicleImageByPriority("AB12 CDE", {
    make: "MERCEDES",
    model: "UNKNOWN",
    year: 2019,
  });
  assert.equal(viaPriority.imageSrc, null);
  assert.notEqual(viaPriority.imageSrc, `/cars/${PUMP}`);
});

run("6. 934 HRR uses local exact-registration identity and image", () => {
  const local = lookupLocalRegistrationKnowledge("934 HRR");
  assert.ok(local);
  assert.equal(local?.tier, "exact");
  assert.equal(local?.make, "Massey Ferguson");
  assert.equal(local?.imageRecordId, 1089);
  assert.ok(local?.model && local.model !== "Unknown");

  const merged = mergeVehicleIdentity({
    registration: "934HRR",
    make: "MASSEY FERGUSON",
    model: "UNKNOWN",
  });
  assert.equal(merged.make, "Massey Ferguson");
  assert.equal(merged.model, local!.model);
  assert.equal(merged.sources.model, "local-exact");
  assert.notEqual(merged.modelTitle.toLowerCase(), "unknown");

  const display = resolveDisplayIdentity({
    registration: "934 HRR",
    make: "Massey Ferguson",
    model: "Unknown",
  });
  assert.equal(display.make, "Massey Ferguson");
  assert.equal(display.model, local!.model);

  const image = resolveVehicleImageByPriority("934 HRR", {
    make: "MASSEY FERGUSON",
    model: "UNKNOWN",
    year: 1960,
  });
  assert.equal(image.imageSrc, "/cars/massey-ferguson-35-1960.webp");
  assert.equal(image.imageMatch, "exact");
  assert.equal(image.imageConfidence, "high");
  assert.equal(image.imageFallbackUsed, false);
});

run("exact registration with valid image mapping wins over UNKNOWN API model", () => {
  for (const registration of ["934 HRR", "WX69 ZBC"]) {
    const mapped = findSpecialVehicleRegistration(registration);
    assert.ok(mapped?.imageRecordId != null || mapped?.imageFilename, registration);

    const image = resolveVehicleImageByPriority(registration, {
      make: mapped!.make,
      model: "UNKNOWN",
      year: null,
    });
    assert.ok(image.imageSrc, registration);
    assert.equal(image.imageMatch, "exact", registration);
    assert.equal(image.imageConfidence, "high", registration);
    assert.equal(image.imageFallbackUsed, false, registration);

    // Generic matcher alone would not produce this exact-registration image.
    const generic = resolveVehicleImage({
      make: mapped!.make,
      model: "UNKNOWN",
      year: 1960,
    });
    assert.notEqual(generic.src, image.imageSrc, registration);
  }
});

run("7. WX69 ZBC, WX17 YCK and WX17 YCL use exact fire-appliance mapping", () => {
  for (const registration of [
    "WX69 ZBC",
    "WX17 YCK",
    "WX17 YCL",
    "wx69zbc",
    "wx17yck",
    "wx17ycl",
  ]) {
    const image = resolveVehicleImageByPriority(registration, {
      make: "MERCEDES",
      model: "UNKNOWN",
      year: registration.toUpperCase().includes("69") ? 2019 : 2017,
    });
    assert.equal(image.imageSrc, `/cars/${PUMP}`, registration);
    assert.match(image.imageMatchReason, /London Fire Brigade/, registration);

    const display = fleetDisplayFields({
      registration,
      make: "Mercedes",
      model: "UNKNOWN",
    });
    assert.equal(display.make, "Mercedes-Benz", registration);
    assert.equal(display.model, "Atego 1327F", registration);
    assert.equal(display.modelVariant, "Pumping Appliance", registration);
  }
});

run("8. normal passenger car generic matching is unchanged", () => {
  const cases: Array<[string, string, number, string]> = [
    ["VAUXHALL", "ASTRA", 2018, "vauxhall-astra"],
    ["FORD", "FIESTA", 2015, "ford-fiesta"],
    ["BMW", "320D", 2020, "bmw-3-series"],
    ["VOLKSWAGEN", "GOLF 1.5 TSI", 2019, "volkswagen-golf"],
  ];
  for (const [make, model, year, needle] of cases) {
    const direct = resolveVehicleImage({ make, model, year });
    const viaPriority = resolveVehicleImageByPriority("AB12 CDE", {
      make,
      model,
      year,
    });
    assert.ok(direct.filename?.includes(needle), `${make} ${model}`);
    assert.equal(viaPriority.imageSrc, direct.src, `${make} ${model}`);
    assert.equal(viaPriority.imageMatch, direct.match, `${make} ${model}`);
  }
});

run("exact local model wins over a broader external model", () => {
  const merged = mergeVehicleIdentity({
    registration: "WX69ZBC",
    make: "Mercedes-Benz",
    model: "Atego 1327",
  });
  assert.equal(merged.model, "Atego 1327F");
  assert.equal(merged.sources.model, "local-exact");
});

run("Sheffield fleet identity fills UNKNOWN API model", () => {
  const merged = mergeVehicleIdentity({
    registration: "YT64 EAY",
    make: "DAF",
    model: "UNKNOWN",
  });
  assert.equal(merged.sources.model, "fleet-sheffield");
  assert.ok(merged.model && !/unknown/i.test(merged.model));
  assert.ok(merged.body);
});

run("shared image resolver order is exact then TfL then Sheffield then generic", () => {
  const source = readFileSync(
    join(process.cwd(), "lib", "vehicle", "vehicle-resolution.ts"),
    "utf8",
  );
  const special = source.indexOf("resolveSpecialVehicleImageFields(registration)");
  const tfl = source.indexOf("resolveTflBusImageFields(registration)");
  const sheffield = source.indexOf("resolveSheffieldCouncilImageFields(registration)");
  assert.ok(special !== -1 && special < tfl);
  assert.ok(tfl < sheffield);

  const service = readFileSync(
    join(process.cwd(), "lib", "api", "vehicle-service.ts"),
    "utf8",
  );
  assert.match(service, /resolveVehicleImageByPriority/);
  assert.match(service, /mergeVehicleIdentity/);
  assert.match(service, /lookupLocalRegistrationKnowledge/);
});

console.log("All vehicle-resolution tests passed.");
