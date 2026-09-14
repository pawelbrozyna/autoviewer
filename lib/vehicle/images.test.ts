/**
 * Vehicle image resolver fixtures.
 * Run: npx tsx lib/vehicle/images.test.ts
 */
import assert from "node:assert/strict";
import vehicleImagesLibrary from "@/data/vehicle-images.json";
import {
  matchCatalogModel,
  resolveVehicleImage,
} from "@/lib/vehicle/images";
import { getMockVehicle } from "@/lib/api/mock";

type VehicleImageRow = {
  priority: number;
  make: string;
  model: string;
  generation: string;
  yearFrom: number;
  yearTo: number;
  bodyType: string;
  filename: string;
};

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`PASS  ${name}`);
  } catch (error) {
    console.error(`FAIL  ${name}`);
    throw error;
  }
}

const vehicles = vehicleImagesLibrary.vehicles as VehicleImageRow[];

run("catalogue count matches vehicles.length", () => {
  assert.equal(vehicleImagesLibrary.count, vehicles.length);
});

run("all catalogue filenames are unique WebP paths", () => {
  const filenames = vehicles.map((v) => v.filename);
  for (const filename of filenames) {
    assert.match(filename, /\.webp$/i, `expected .webp: ${filename}`);
    assert.doesNotMatch(filename, /\.png$/i, `unexpected .png: ${filename}`);
  }
  assert.equal(new Set(filenames).size, filenames.length);
});

run("catalogue priorities are unique across 1..n", () => {
  const priorities = vehicles.map((v) => v.priority);
  assert.equal(new Set(priorities).size, priorities.length);
  const sorted = [...priorities].sort((a, b) => a - b);
  assert.deepEqual(
    sorted,
    Array.from({ length: vehicles.length }, (_, i) => i + 1),
  );
});

run("catalogue year ranges are valid", () => {
  for (const v of vehicles) {
    assert.ok(
      Number.isInteger(v.yearFrom) && Number.isInteger(v.yearTo),
      `${v.filename} years must be integers`,
    );
    assert.ok(
      v.yearFrom <= v.yearTo,
      `${v.filename} yearFrom must be <= yearTo`,
    );
  }
});

run("matches Golf / Focus model names from trim strings", () => {
  assert.equal(matchCatalogModel("Volkswagen", "Golf 1.5 TSI EVO Match"), "Golf");
  assert.equal(
    matchCatalogModel("Ford", "Focus 1.0 EcoBoost Titanium"),
    "Focus",
  );
});

run("never matches a different model from the same make", () => {
  assert.equal(matchCatalogModel("Ford", "Fiesta Titanium"), "Fiesta");
  assert.notEqual(matchCatalogModel("Ford", "Fiesta Titanium"), "Focus");
  assert.equal(matchCatalogModel("Volkswagen", "Polo SE"), "Polo");
  assert.notEqual(matchCatalogModel("Volkswagen", "Polo SE"), "Golf");
});

run("make aliases: VW and MERCEDES resolve like full catalogue names", () => {
  assert.equal(matchCatalogModel("VW", "Golf"), "Golf");
  assert.equal(matchCatalogModel("VOLKSWAGEN", "Golf"), "Golf");
  assert.equal(matchCatalogModel("MERCEDES", "GLA"), "GLA");
  assert.equal(matchCatalogModel("MERCEDES-BENZ", "GLA"), "GLA");

  const vw = resolveVehicleImage({ make: "VW", model: "Golf", year: 2019 });
  assert.equal(vw.match, "exact");
  assert.equal(vw.src, "/cars/volkswagen-golf-mk7-5-2017-2020.webp");

  const vwFull = resolveVehicleImage({
    make: "VOLKSWAGEN",
    model: "Golf",
    year: 2019,
  });
  assert.equal(vwFull.src, vw.src);

  const mercedes = resolveVehicleImage({
    make: "MERCEDES",
    model: "GLA",
    year: 2021,
  });
  assert.equal(mercedes.match, "exact");
  assert.equal(mercedes.src, "/cars/mercedes-benz-gla-h247-2020-2026.webp");

  const mercedesBenz = resolveVehicleImage({
    make: "MERCEDES-BENZ",
    model: "GLA",
    year: 2021,
  });
  assert.equal(mercedesBenz.src, mercedes.src);
});

run("overlapping year ranges prefer highest yearFrom", () => {
  const xc60 = resolveVehicleImage({
    make: "Volvo",
    model: "XC60",
    year: 2017,
  });
  assert.equal(xc60.match, "exact");
  assert.equal(xc60.generation, "Mk2");
  assert.equal(xc60.yearFrom, 2017);
  assert.equal(xc60.src, "/cars/volvo-xc60-mk2-2017-2026.webp");

  const gla = resolveVehicleImage({
    make: "Mercedes-Benz",
    model: "GLA",
    year: 2020,
  });
  assert.equal(gla.match, "exact");
  assert.equal(gla.generation, "H247");
  assert.equal(gla.yearFrom, 2020);
  assert.equal(gla.src, "/cars/mercedes-benz-gla-h247-2020-2026.webp");
});

run("missing model still returns placeholder (no make-only fallback)", () => {
  const result = resolveVehicleImage({
    make: "Ford",
    model: "",
    year: 2019,
  });
  assert.equal(result.match, "placeholder");
  assert.equal(result.src, null);
});

run("Golf 2019 resolves exact Mk7.5 WebP image", () => {
  const result = resolveVehicleImage({
    make: "Volkswagen",
    model: "Golf 1.5 TSI EVO Match",
    year: 2019,
  });
  assert.equal(result.match, "exact");
  assert.equal(result.isRepresentative, false);
  assert.equal(result.generation, "Mk7.5");
  assert.equal(result.src, "/cars/volkswagen-golf-mk7-5-2017-2020.webp");
});

run("Focus 2018 resolves exact Mk4 WebP image", () => {
  const result = resolveVehicleImage({
    make: "Ford",
    model: "Focus 1.0 EcoBoost Titanium",
    year: 2018,
  });
  assert.equal(result.match, "exact");
  assert.equal(result.isRepresentative, false);
  assert.equal(result.generation, "Mk4");
  assert.equal(result.src, "/cars/ford-focus-mk4-2018-2025.webp");
});

run("Mondeo resolves Mk5 WebP image", () => {
  const result = resolveVehicleImage({
    make: "Ford",
    model: "Mondeo Titanium",
    year: 2018,
  });
  assert.equal(result.match, "exact");
  assert.equal(result.src, "/cars/ford-mondeo-mk5-2014-2020.webp");
});

run("nearest same-model generation is marked representative", () => {
  const result = resolveVehicleImage({
    make: "Volkswagen",
    model: "Golf",
    year: 2002,
  });
  assert.equal(result.match, "nearest-generation");
  assert.equal(result.isRepresentative, true);
  assert.equal(result.generation, "Mk5");
  assert.equal(result.src, "/cars/volkswagen-golf-mk5-2004-2008.webp");
});

run("unknown model uses placeholder, not another brand model", () => {
  const result = resolveVehicleImage({
    make: "Ford",
    model: "Mustang",
    year: 2018,
  });
  assert.equal(result.match, "placeholder");
  assert.equal(result.src, null);
  assert.equal(result.isRepresentative, false);
});

run("demo records use expected WebP resolver paths", () => {
  const swift = getMockVehicle("AV19SWF");
  const focus = getMockVehicle("CD34EFG");
  const glc = getMockVehicle("AV23GLC");
  const q5 = getMockVehicle("AV20Q5X");
  assert.ok(swift);
  assert.ok(focus);
  assert.ok(glc);
  assert.ok(q5);
  assert.equal(
    swift!.summary.imageSrc,
    "/cars/suzuki-swift-a2l-2017-2023.webp",
  );
  assert.equal(swift!.summary.imageIsRepresentative, false);
  assert.equal(focus!.summary.imageSrc, "/cars/ford-focus-mk4-2018-2025.webp");
  assert.equal(focus!.summary.imageIsRepresentative, false);
  assert.equal(
    glc!.summary.imageSrc,
    "/cars/mercedes-benz-glc-x254-2022-2026.webp",
  );
  assert.equal(glc!.summary.imageIsRepresentative, false);
  assert.equal(q5!.summary.imageSrc, "/cars/audi-q5-fy-2017-2024.webp");
  assert.equal(q5!.summary.imageIsRepresentative, false);
  assert.equal(glc!.buyerScore?.score, 90);
  assert.equal(q5!.buyerScore?.score, 83);
});

console.log("\nAll vehicle image resolver tests passed.");
