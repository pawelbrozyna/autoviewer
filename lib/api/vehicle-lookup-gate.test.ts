/**
 * Sparse external lookup gate.
 * Run: npx tsx lib/api/vehicle-lookup-gate.test.ts
 */
import assert from "node:assert/strict";
import { canContinueVehicleLookup } from "@/lib/api/vehicle-lookup-gate";
import { lookupLocalRegistrationKnowledge } from "@/lib/vehicle/vehicle-resolution";
import { resolveVehicleImageByPriority } from "@/lib/vehicle/vehicle-resolution";

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`PASS  ${name}`);
  } catch (error) {
    console.error(`FAIL  ${name}`);
    throw error;
  }
}

run("UNKNOWN make with no DVLA/MOT and no local knowledge aborts", () => {
  assert.equal(
    canContinueVehicleLookup({
      hasDvlaDetails: false,
      motTestCount: 0,
      make: "Unknown",
      hasLocalRegistrationKnowledge: false,
    }),
    false,
  );
});

run("UNKNOWN make with Sheffield/local knowledge continues", () => {
  for (const registration of [
    "YX70 EYF",
    "YJ07 VEU",
    "YX21 FUT",
    "YX24 DZL",
    "FJ23 DVX",
  ]) {
    const local = lookupLocalRegistrationKnowledge(registration);
    assert.ok(local, registration);
    assert.equal(
      canContinueVehicleLookup({
        hasDvlaDetails: false,
        motTestCount: 0,
        make: "Unknown",
        hasLocalRegistrationKnowledge: true,
      }),
      true,
      registration,
    );
  }
});

run("Sheffield plates keep exact images when API model is UNKNOWN", () => {
  const cases: Array<[string, string]> = [
    ["YX70 EYF", "/cars/toro-ltf3000-2010-2026.webp"],
    ["YJ07 VEU", "/cars/john-deere-3320-2005-2014.webp"],
    ["YX21 FUT", "/cars/toro-lt3340-2010-2026.webp"],
    ["YX24 DZL", "/cars/amazone-profi-ph1500-2005-2026.webp"],
    ["FJ23 DVX", "/cars/ventrac-compact-articulated-2005-2026.webp"],
  ];
  for (const [registration, src] of cases) {
    const image = resolveVehicleImageByPriority(registration, {
      make: "UNKNOWN",
      model: "UNKNOWN",
      year: null,
    });
    assert.equal(image.imageSrc, src, registration);
    assert.equal(image.imageMatch, "exact", registration);
    assert.match(image.imageMatchReason, /Sheffield Council fleet/, registration);
  }
});

console.log("All vehicle-lookup-gate tests passed.");
