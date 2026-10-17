/**
 * Vehicle image resolver fixtures.
 * Run: npx tsx lib/vehicle/images.test.ts
 */
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { join } from "node:path";
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

/** Catalogued generations whose WebP is not generated yet. Exact allowlist only. */
const PENDING_IMAGE_FILENAMES = new Set(
  ((vehicleImagesLibrary as { pendingImageFilenames?: string[] }).pendingImageFilenames ??
    []) as string[],
);

run("catalogue count matches vehicles.length", () => {
  assert.equal(vehicleImagesLibrary.count, vehicles.length);
});

// Records that intentionally share another record's image: priority -> image owner priority.
const SHARED_IMAGE_RECORDS: Record<number, number> = {
  728: 726,
  729: 727,
  911: 910,
  916: 915,
  917: 913,
};

run("all catalogue filenames are unique WebP paths", () => {
  for (const { filename } of vehicles) {
    assert.match(filename, /\.webp$/i, `expected .webp: ${filename}`);
    assert.doesNotMatch(filename, /\.png$/i, `unexpected .png: ${filename}`);
  }
  for (const [priority, ownerPriority] of Object.entries(SHARED_IMAGE_RECORDS)) {
    const record = vehicles.find((v) => v.priority === Number(priority));
    const owner = vehicles.find((v) => v.priority === ownerPriority);
    assert.equal(record?.filename, owner?.filename, `record ${priority} shares image ${ownerPriority}`);
  }
  const filenames = vehicles
    .filter((v) => !(v.priority in SHARED_IMAGE_RECORDS))
    .map((v) => v.filename);
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
  assert.equal(gla.confidence, "low");
  assert.equal(gla.ambiguous, true);
});

run("returns a selected record, confidence, reasons and fallback metadata", () => {
  const result = resolveVehicleImage({
    make: "Volkswagen",
    model: "Golf 1.5 TSI Match",
    year: 2019,
  });
  assert.equal(result.record?.generation, "Mk7.5");
  assert.equal(result.confidence, "high");
  assert.equal(result.fallbackUsed, false);
  assert.equal(result.ambiguous, false);
  assert.ok(result.matchedFields.includes("make:exact"));
  assert.ok(result.matchedFields.includes("model:prefix"));
  assert.match(result.reason, /one catalogue generation/i);
});

run("normalizes accents, punctuation, electric prefixes and make aliases", () => {
  const citroen = resolveVehicleImage({
    make: "Citroën",
    model: "C3 1.2 PureTech",
    year: 2022,
  });
  assert.equal(
    citroen.src,
    "/cars/citroen-c3-mk3-facelift-2020-2024.webp",
  );

  const peugeot = resolveVehicleImage({
    make: "PEUGEOT",
    model: "e-208 GT",
    year: 2022,
  });
  assert.equal(peugeot.src, "/cars/peugeot-208-p21-2019-2024.webp");

  const opel = resolveVehicleImage({
    make: "Opel",
    model: "Corsa-e Ultimate",
    year: 2022,
  });
  assert.equal(opel.src, "/cars/vauxhall-corsa-f-2019-2023.webp");
  assert.ok(opel.matchedFields.includes("make:alias"));

  const vauxhall = resolveVehicleImage({
    make: "Vauxhall Motors",
    model: "Astra 1.4 Turbo",
    year: 2018,
  });
  assert.equal(vauxhall.src, "/cars/vauxhall-astra-k-2015-2021.webp");

  const mg = resolveVehicleImage({
    make: "MG",
    model: "MG4 Trophy",
    year: 2023,
  });
  assert.equal(mg.src, "/cars/mg-mg4-ev-mk1-2022-2026.webp");

  const fiat = resolveVehicleImage({
    make: "Fiat",
    model: "500 Electric",
    year: 2022,
  });
  assert.equal(fiat.src, "/cars/fiat-500e-332-2021-2026.webp");
});

run("maps common BMW and Mercedes derivative-style model names", () => {
  const bmw = resolveVehicleImage({
    make: "BMW",
    model: "320d M Sport Touring",
    year: 2018,
    bodyType: "estate",
  });
  assert.equal(
    bmw.src,
    "/cars/bmw-3-series-f30-facelift-2015-2019.webp",
  );
  assert.ok(bmw.matchedFields.includes("model:alias"));
  assert.ok(bmw.matchedFields.includes("bodyType:hint"));

  const mercedes = resolveVehicleImage({
    make: "Mercedes Benz",
    model: "A 180 d AMG Line",
    year: 2021,
  });
  assert.equal(
    mercedes.src,
    "/cars/mercedes-a-class-w177-2018-2026.webp",
  );
  assert.ok(mercedes.matchedFields.includes("model:alias"));
});

run("uses explicit Yaris facelift and pre-facelift clues", () => {
  const facelift = resolveVehicleImage({
    make: "Toyota",
    model: "Yaris",
    derivative: "XP130 facelift Icon",
    year: 2014,
  });
  assert.equal(
    facelift.src,
    "/cars/toyota-yaris-xp130-facelift-2014-2020.webp",
  );
  assert.equal(facelift.confidence, "high");
  assert.equal(facelift.ambiguous, false);
  assert.ok(facelift.matchedFields.includes("generation:source-clue"));

  const preFacelift = resolveVehicleImage({
    make: "Toyota",
    model: "Yaris",
    derivative: "XP130 pre-facelift",
    year: 2014,
  });
  assert.equal(
    preFacelift.src,
    "/cars/toyota-yaris-xp130-2011-2014.webp",
  );
  assert.equal(preFacelift.confidence, "high");
});

run("uses first-registration month for unresolved boundary years", () => {
  const early = resolveVehicleImage({
    make: "Toyota",
    model: "Yaris Icon",
    year: 2014,
    firstRegistrationDate: "2014-03-18",
  });
  assert.equal(early.src, "/cars/toyota-yaris-xp130-2011-2014.webp");
  assert.equal(early.confidence, "medium");
  assert.equal(early.ambiguous, true);
  assert.ok(
    early.matchedFields.includes("firstRegistration:boundary-period"),
  );

  const late = resolveVehicleImage({
    make: "Toyota",
    model: "Yaris Icon",
    year: 2014,
    firstRegistrationDate: "2014-10-02",
  });
  assert.equal(
    late.src,
    "/cars/toyota-yaris-xp130-facelift-2014-2020.webp",
  );
  assert.equal(late.confidence, "medium");
  assert.equal(late.ambiguous, true);
});

run("retains deterministic newer-generation fallback when overlap is unresolved", () => {
  const result = resolveVehicleImage({
    make: "Toyota",
    model: "Yaris Icon",
    year: 2014,
  });
  assert.equal(
    result.src,
    "/cars/toyota-yaris-xp130-facelift-2014-2020.webp",
  );
  assert.equal(result.confidence, "low");
  assert.equal(result.ambiguous, true);
  assert.match(result.reason, /newer-generation rule/i);
});

run("matches vans, pickups, motorcycles and scooters", () => {
  const van = resolveVehicleImage({
    make: "VW",
    model: "Transporter T32 Highline",
    derivative: "T6.1 panel van",
    year: 2020,
    bodyType: "van",
  });
  assert.equal(
    van.src,
    "/cars/volkswagen-transporter-t6-1-2019-2024.webp",
  );

  const pickup = resolveVehicleImage({
    make: "Isuzu",
    model: "D MAX Utah",
    year: 2019,
    bodyType: "pick-up",
  });
  assert.equal(
    pickup.src,
    "/cars/isuzu-d-max-mk2-facelift-2017-2020.webp",
  );

  const motorcycle = resolveVehicleImage({
    make: "Honda",
    model: "CB 125 R",
    year: 2021,
    vehicleType: "motorcycle",
  });
  assert.equal(
    motorcycle.src,
    "/cars/honda-cb125r-2018-generation-2018-2023.webp",
  );

  const scooter = resolveVehicleImage({
    make: "Yamaha",
    model: "NMAX125",
    year: 2023,
    vehicleType: "scooter",
  });
  assert.equal(
    scooter.src,
    "/cars/yamaha-nmax-125-2021-generation-2021-2024.webp",
  );
});

run("handles incomplete input without crossing to another model", () => {
  const missingModel = resolveVehicleImage({
    make: "Ford",
    model: "",
    year: 2019,
  });
  assert.equal(missingModel.match, "placeholder");
  assert.equal(missingModel.record, null);
  assert.equal(missingModel.fallbackUsed, true);

  const missingYear = resolveVehicleImage({
    make: "Volkswagen",
    model: "Golf Match",
  });
  assert.equal(missingYear.generation, "Mk8");
  assert.equal(missingYear.confidence, "low");
  assert.equal(missingYear.fallbackUsed, true);
  assert.equal(missingYear.ambiguous, true);
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
  assert.equal(result.src, "/cars/ford-focus-mk4-2018-2022.webp");
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

run("pre-facelift year falls back to the same generation's facelift, marked representative", () => {
  const result = resolveVehicleImage({
    make: "Toyota",
    model: "RAV4",
    year: 2015,
  });
  assert.equal(result.match, "nearest-generation");
  assert.equal(result.isRepresentative, true);
  assert.equal(result.generation, "XA40 facelift");
  assert.equal(result.src, "/cars/toyota-rav4-xa40-facelift-2016-2018.webp");

  const transitCustom = resolveVehicleImage({
    make: "FORD",
    model: "TRANSIT CUSTOM",
    year: 2017,
  });
  assert.equal(transitCustom.match, "exact");
  assert.equal(transitCustom.generation, "Mk1");
});

run("nearest-generation fallback never crosses into a different generation", () => {
  const cases: Array<[string, string, number]> = [
    ["BMW", "X1", 2008],
    ["BMW", "X5", 2010],
    ["MERCEDES-BENZ", "E 220", 1998],
    ["FORD", "MONDEO", 1998],
    ["AUDI", "A4", 2003],
    ["CITROEN", "C3", 2025],
  ];
  for (const [make, model, year] of cases) {
    const result = resolveVehicleImage({ make, model, year });
    assert.equal(result.match, "placeholder", `${make} ${model} ${year}`);
    assert.equal(result.src, null, `${make} ${model} ${year}`);
  }
});

run("former generation gaps resolve to their own new generation", () => {
  const cases: Array<[string, string, number, string]> = [
    ["BMW", "5 SERIES", 2024, "/cars/bmw-5-series-g60-2023-2026.webp"],
    ["VAUXHALL", "VIVARO", 2016, "/cars/vauxhall-vivaro-b-2014-2019.webp"],
    ["SKODA", "KODIAQ", 2025, "/cars/skoda-kodiaq-mk2-2024-2026.webp"],
    ["HONDA", "CR-V", 2024, "/cars/honda-cr-v-mk6-2023-2026.webp"],
    ["LAND ROVER", "RANGE ROVER SPORT", 2024, "/cars/land-rover-range-rover-sport-l461-2022-2026.webp"],
    ["MG", "ZS", 2025, "/cars/mg-zs-mk2-2024-2026.webp"],
    ["TESLA", "MODEL Y", 2026, "/cars/tesla-model-y-juniper-2025-2026.webp"],
  ];
  for (const [make, model, year, src] of cases) {
    const result = resolveVehicleImage({ make, model, year });
    assert.equal(result.match, "exact", `${make} ${model} ${year}`);
    assert.equal(result.src, src, `${make} ${model} ${year}`);
  }
});

run("rejects an implausibly distant nearest-generation fallback", () => {
  const result = resolveVehicleImage({
    make: "Volkswagen",
    model: "Golf",
    year: 1965,
  });
  assert.equal(result.match, "placeholder");
  assert.equal(result.record, null);
  assert.match(result.reason, /safe 3-year fallback limit/i);
});

run("unknown model uses placeholder, not another brand model", () => {
  const result = resolveVehicleImage({
    make: "Ford",
    model: "Mustang",
    year: 2008,
  });
  assert.equal(result.match, "placeholder");
  assert.equal(result.src, null);
  assert.equal(result.isRepresentative, false);
});

run("Crossland and Grandland resolve across X / non-X naming", () => {
  const crossland = resolveVehicleImage({
    make: "VAUXHALL",
    model: "CROSSLAND",
    year: 2020,
  });
  assert.equal(crossland.match, "exact");
  assert.equal(crossland.src, "/cars/vauxhall-crossland-x-a-2017-2021.webp");
  assert.equal(matchCatalogModel("Vauxhall", "Crossland X SE"), "Crossland X");

  const grandland = resolveVehicleImage({
    make: "VAUXHALL",
    model: "GRANDLAND",
    year: 2019,
  });
  assert.equal(grandland.match, "exact");
  assert.equal(grandland.src, "/cars/vauxhall-grandland-x-a-2018-2021.webp");
});

run("Crossland X 2020 still resolves when the Crossland facelift exists", () => {
  const facelift = resolveVehicleImage({
    make: "VAUXHALL",
    model: "CROSSLAND",
    year: 2022,
  });
  assert.equal(
    facelift.src,
    "/cars/vauxhall-crossland-a-facelift-2021-2024.webp",
  );
  const xNamed = resolveVehicleImage({
    make: "VAUXHALL",
    model: "CROSSLAND X ELITE",
    year: 2020,
  });
  assert.equal(xNamed.src, "/cars/vauxhall-crossland-x-a-2017-2021.webp");
});

run("live case: 2007 Toyota Auris resolves E150", () => {
  const result = resolveVehicleImage({
    make: "TOYOTA",
    model: "AURIS",
    year: 2007,
  });
  assert.equal(result.match, "exact");
  assert.equal(result.src, "/cars/toyota-auris-e150-2007-2009.webp");
});

run("live case: 2016 Dacia Logan and Logan MCV resolve MCV II", () => {
  for (const model of ["LOGAN", "LOGAN MCV", "LOGAN MCV LAUREATE DCI"]) {
    const result = resolveVehicleImage({ make: "DACIA", model, year: 2016 });
    assert.equal(result.match, "exact", model);
    assert.equal(result.src, "/cars/dacia-logan-mcv-ii-2013-2020.webp", model);
  }
});

run("distinct models never fall back to a shorter same-make prefix", () => {
  for (const model of ["C4 PICASSO", "GRAND C4 PICASSO", "C4 GRAND PICASSO"]) {
    const result = resolveVehicleImage({ make: "CITROEN", model, year: 2015 });
    assert.equal(
      result.src,
      "/cars/citroen-c4-picasso-mk2-2013-2018.webp",
      model,
    );
  }
  const c3Picasso = resolveVehicleImage({
    make: "CITROEN",
    model: "C3 PICASSO",
    year: 2012,
  });
  assert.equal(c3Picasso.src, "/cars/citroen-c3-picasso-mk1-2009-2017.webp");
  assert.equal(matchCatalogModel("Suzuki", "SX4 S-CROSS SZ-T"), "S-Cross");
  assert.equal(matchCatalogModel("Suzuki", "SX4 SZ4"), "SX4");
  assert.equal(matchCatalogModel("Ford", "GRAND C-MAX"), "C-Max");
  assert.equal(matchCatalogModel("Ford", "KA"), "Ka");
  assert.equal(matchCatalogModel("Ford", "KA+"), "Ka+");
  assert.equal(matchCatalogModel("Kia", "SOUL"), "Soul");
  assert.equal(matchCatalogModel("Kia", "SOUL EV"), "Soul EV");
  assert.equal(matchCatalogModel("Kia", "CEE'D"), "Ceed");
});

run("Mazda numeric DVSA models map to MazdaN", () => {
  const result = resolveVehicleImage({ make: "MAZDA", model: "2", year: 2018 });
  assert.equal(result.src, "/cars/mazda-mazda2-dj-2015-2026.webp");
  assert.equal(matchCatalogModel("Mazda", "3 SPORT NAV"), "Mazda3");
  const mazda5 = resolveVehicleImage({ make: "MAZDA", model: "5", year: 2012 });
  assert.equal(mazda5.src, "/cars/mazda-mazda5-cw-2010-2015.webp");
});

run("Mercedes bare class letters, CLASS names, AMG strings, ML and MERCEDES-AMG", () => {
  const expected: Array<[string, string, number, string]> = [
    ["MERCEDES-BENZ", "C", 2007, "/cars/mercedes-benz-c-class-w204-2007-2011.webp"],
    ["MERCEDES-BENZ", "C CLASS", 2007, "/cars/mercedes-benz-c-class-w204-2007-2011.webp"],
    ["MERCEDES-BENZ", "A", 2016, "/cars/mercedes-a-class-w176-facelift-2015-2018.webp"],
    ["MERCEDES-BENZ", "A CLASS", 2016, "/cars/mercedes-a-class-w176-facelift-2015-2018.webp"],
    ["MERCEDES-BENZ", "B", 2020, "/cars/mercedes-benz-b-class-w247-2019-2026.webp"],
    ["MERCEDES-BENZ", "B CLASS", 2020, "/cars/mercedes-benz-b-class-w247-2019-2026.webp"],
    ["MERCEDES-BENZ", "E", 2012, "/cars/mercedes-benz-e-class-w212-2009-2013.webp"],
    ["MERCEDES-BENZ", "E CLASS", 2012, "/cars/mercedes-benz-e-class-w212-2009-2013.webp"],
    ["MERCEDES-BENZ", "C63 AMG", 2010, "/cars/mercedes-benz-c-class-w204-2007-2011.webp"],
    ["MERCEDES-BENZ", "A 45 AMG", 2016, "/cars/mercedes-a-class-w176-facelift-2015-2018.webp"],
    ["MERCEDES-BENZ", "A35", 2020, "/cars/mercedes-a-class-w177-2018-2026.webp"],
    ["MERCEDES-BENZ", "E 63 AMG", 2015, "/cars/mercedes-e-class-w212-facelift-2013-2016.webp"],
    ["MERCEDES-AMG", "C 63", 2017, "/cars/mercedes-c-class-w205-2014-2021.webp"],
    ["MERCEDES-BENZ", "ML250", 2013, "/cars/mercedes-benz-m-class-w166-2012-2015.webp"],
    ["MERCEDES-BENZ", "ML", 2013, "/cars/mercedes-benz-m-class-w166-2012-2015.webp"],
  ];
  for (const [make, model, year, src] of expected) {
    assert.equal(resolveVehicleImage({ make, model, year }).src, src, `${make} ${model}`);
  }
  assert.equal(matchCatalogModel("MERCEDES-BENZ", "CLA 200"), "CLA");
  assert.equal(matchCatalogModel("MERCEDES-BENZ", "GLC 220 D"), "GLC");
});

run("MINI DVSA trims map to Hatch but keep body-specific models", () => {
  for (const model of ["COOPER", "COOPER S", "COOPER D", "COOPER SD", "ONE", "COOPER SE", "ELECTRIC"]) {
    const result = resolveVehicleImage({ make: "MINI", model, year: 2016 });
    assert.equal(result.src, "/cars/mini-hatch-f56-2014-2024.webp", model);
  }
  assert.equal(
    resolveVehicleImage({ make: "MINI", model: "COOPER SD COUNTRYMAN", year: 2016 }).src,
    "/cars/mini-countryman-r60-2010-2016.webp",
  );
  assert.equal(
    resolveVehicleImage({ make: "MINI", model: "COOPER CLUBMAN", year: 2016 }).src,
    "/cars/mini-clubman-f54-2015-2024.webp",
  );
  for (const model of ["COOPER PACEMAN", "COOPER S CONVERTIBLE", "CONVERTIBLE"]) {
    const result = resolveVehicleImage({ make: "MINI", model, year: 2016 });
    assert.equal(result.match, "placeholder", model);
  }
});

run("distinct derivative models never fall through to the base model", () => {
  const cases: Array<[string, string, number]> = [
    ["TOYOTA", "COROLLA CROSS", 2023],
    ["RENAULT", "MEGANE E-TECH", 2023],
    ["RENAULT", "SCENIC E-TECH", 2024],
    ["FORD", "FOCUS C-MAX", 2005],
    ["VOLKSWAGEN", "GOLF PLUS", 2010],
    ["VOLKSWAGEN", "GOLF SV", 2016],
    ["TOYOTA", "PRIUS+", 2015],
    ["TOYOTA", "PRIUS PLUS", 2015],
    ["BMW", "220I GRAN COUPE", 2021],
    ["BMW", "2 SERIES GRAN COUPE", 2021],
    ["BMW", "218D GRAN TOURER", 2017],
    ["BMW", "2 SERIES GRAN TOURER", 2017],
  ];
  for (const [make, model, year] of cases) {
    const result = resolveVehicleImage({ make, model, year });
    assert.equal(result.match, "placeholder", `${make} ${model}`);
  }
  assert.equal(matchCatalogModel("Toyota", "COROLLA"), "Corolla");
  assert.equal(matchCatalogModel("Volkswagen", "GOLF GTI"), "Golf");
  assert.equal(matchCatalogModel("BMW", "220I"), "2 Series");
});

run("MG bare numbers and MG MOTOR UK make", () => {
  assert.equal(
    resolveVehicleImage({ make: "MG", model: "3", year: 2020 }).src,
    "/cars/mg-mg3-mk2-facelift-2018-2024.webp",
  );
  assert.equal(
    resolveVehicleImage({ make: "MG", model: "4", year: 2023 }).src,
    "/cars/mg-mg4-ev-mk1-2022-2026.webp",
  );
  assert.equal(
    resolveVehicleImage({ make: "MG", model: "5", year: 2023 }).src,
    "/cars/mg-mg5-ev-facelift-2022-2025.webp",
  );
  assert.equal(
    resolveVehicleImage({ make: "MG MOTOR UK", model: "MG4", year: 2023 }).src,
    "/cars/mg-mg4-ev-mk1-2022-2026.webp",
  );
  assert.equal(
    resolveVehicleImage({ make: "MG MOTOR UK", model: "ZS", year: 2022 }).src,
    "/cars/mg-zs-mk1-facelift-2020-2024.webp",
  );
});

run("trim, fuel and gearbox descriptors keep the base model", () => {
  const cases: Array<[string, string, number, string]> = [
    ["MG", "HS TROPHY PHEV AUTO", 2022, "/cars/mg-hs-mk1-2019-2024.webp"],
    ["VOLVO", "XC40 INSCRIPTION PRO B4 MHEV A", 2021, "/cars/volvo-xc40-mk1-2018-2026.webp"],
    ["TOYOTA", "YARIS EXCEL HEV CVT", 2021, "/cars/toyota-yaris-xp210-2020-2026.webp"],
    ["VOLKSWAGEN", "TIGUAN ALLSPACE LIFE TSI S-A", 2022, "/cars/volkswagen-tiguan-mk2-2016-2024.webp"],
  ];
  for (const [make, model, year, src] of cases) {
    assert.equal(resolveVehicleImage({ make, model, year }).src, src, `${make} ${model}`);
  }
});

run("Combo and Combo Cargo share one family across C, D and E", () => {
  assert.equal(matchCatalogModel("Vauxhall", "COMBO"), "Combo");
  assert.equal(matchCatalogModel("Vauxhall", "COMBO CARGO 2300 L1H1"), "Combo Cargo");
  const combo = resolveVehicleImage({ make: "VAUXHALL", model: "COMBO 2300 DYNAMIC TD", year: 2020 });
  assert.equal(combo.src, "/cars/vauxhall-combo-cargo-e-2018-2026.webp");
  assert.equal(
    resolveVehicleImage({ make: "VAUXHALL", model: "COMBO", year: 2016 }).src,
    "/cars/vauxhall-combo-cargo-d-2012-2018.webp",
  );
  assert.equal(
    resolveVehicleImage({ make: "VAUXHALL", model: "COMBO 1700 CDTI", year: 2010 }).src,
    "/cars/vauxhall-combo-c-2001-2011.webp",
  );
  assert.equal(
    resolveVehicleImage({ make: "VAUXHALL", model: "COMBO CARGO 2000 CDTI", year: 2008 }).src,
    "/cars/vauxhall-combo-c-2001-2011.webp",
  );
});

run("short names never guess when unsafe or ambiguous", () => {
  assert.equal(matchCatalogModel("Land Rover", "RANGE"), null);
  assert.equal(matchCatalogModel("Land Rover", "RANGE ROVER"), "Range Rover");
  assert.equal(matchCatalogModel("Vauxhall", "COMBO LIFE ENERGY"), null);
  assert.equal(matchCatalogModel("Yamaha", "TRACER 9"), null);
  assert.equal(matchCatalogModel("Kawasaki", "VERSYS 1000"), null);
  assert.equal(matchCatalogModel("Ford", "MUSTANG"), "Mustang");
  assert.equal(matchCatalogModel("Ford", "MUSTANG MACH-E AWD"), "Mustang Mach-E");
  const entries = [
    { priority: 1, make: "Testmake", model: "Alpha Van", generation: "Mk1", yearFrom: 2018, yearTo: 2024, bodyType: "Van", filename: "a.webp" },
    { priority: 2, make: "Testmake", model: "Alpha Tourer", generation: "Mk1", yearFrom: 2018, yearTo: 2024, bodyType: "MPV", filename: "b.webp" },
  ];
  assert.equal(matchCatalogModel("Testmake", "ALPHA", entries), null);
  assert.equal(matchCatalogModel("Testmake", "ALPHA TOURER", entries), "Alpha Tourer");
});

run("leading NEW is ignored", () => {
  assert.equal(matchCatalogModel("Ford", "NEW FIESTA ZETEC"), "Fiesta");
  assert.equal(matchCatalogModel("Ford", "ALL NEW FIESTA"), "Fiesta");
  assert.equal(
    resolveVehicleImage({ make: "FORD", model: "NEW FIESTA ZETEC", year: 2019 }).src,
    "/cars/ford-fiesta-mk8-2017-2023.webp",
  );
  assert.equal(matchCatalogModel("Ford", "NEW"), null);
});

run("SMART (MCC) make maps to Smart", () => {
  for (const year of [2016, 2018]) {
    assert.equal(
      resolveVehicleImage({ make: "SMART (MCC)", model: "FORFOUR", year }).src,
      "/cars/smart-forfour-453-2015-2019.webp",
    );
  }
});

run("plain Zafira uses Zafira Tourer only for the 2016-2019 facelift years", () => {
  const zafira = (model: string, year: number) =>
    resolveVehicleImage({ make: "VAUXHALL", model, year });
  assert.equal(zafira("ZAFIRA", 2018).src, "/cars/vauxhall-zafira-tourer-c-2012-2018.webp");
  assert.equal(zafira("ZAFIRA SRI NAV", 2016).src, "/cars/vauxhall-zafira-tourer-c-2012-2018.webp");
  assert.equal(zafira("ZAFIRA", 2013).src, "/cars/vauxhall-zafira-b-2005-2014.webp");
  assert.equal(zafira("ZAFIRA", 2015).match, "placeholder");
  assert.equal(zafira("ZAFIRA", 2019).match, "placeholder");
  assert.equal(zafira("ZAFIRA LIFE", 2018).match, "placeholder");
  assert.equal(zafira("ZAFIRA TOURER", 2014).src, "/cars/vauxhall-zafira-tourer-c-2012-2018.webp");
});

run("Mercedes S-number names are recognised as S-Class and never another model", () => {
  for (const model of ["S 450 L AMG LINE PREMIUM", "S450", "S 500", "S-CLASS", "S 63 AMG"]) {
    const result = resolveVehicleImage({ make: "MERCEDES-BENZ", model, year: 2026 });
    assert.equal(result.src, "/cars/mercedes-benz-s-class-w223-2021-2026.webp", model);
  }
  assert.equal(
    resolveVehicleImage({ make: "MERCEDES-BENZ", model: "S 350 D L", year: 2016 }).src,
    "/cars/mercedes-benz-s-class-w222-2013-2020.webp",
  );
  assert.equal(matchCatalogModel("MERCEDES-BENZ", "SPRINTER 314"), "Sprinter");
  assert.equal(matchCatalogModel("MERCEDES-BENZ", "E 220 D"), "E-Class");
  const entries = [
    { priority: 1, make: "Mercedes-Benz", model: "S-Class", generation: "W223", yearFrom: 2021, yearTo: 2026, bodyType: "Saloon", filename: "s.webp" },
    { priority: 2, make: "Mercedes-Benz", model: "Sprinter", generation: "W907", yearFrom: 2018, yearTo: 2026, bodyType: "Van", filename: "sp.webp" },
  ];
  for (const model of ["S 450 L AMG LINE PREMIUM", "S450", "S 500", "S-CLASS"]) {
    assert.equal(matchCatalogModel("MERCEDES-BENZ", model, entries), "S-Class", model);
  }
  assert.equal(matchCatalogModel("MERCEDES-BENZ", "SL 500", entries), null);
});

function entry(make: string, model: string, yearFrom = 2015, yearTo = 2026) {
  return {
    priority: 1,
    make,
    model,
    generation: "Mk1",
    yearFrom,
    yearTo,
    bodyType: "suv",
    filename: `${make}-${model}.webp`.toLowerCase().replace(/[^a-z0-9.]+/g, "-"),
  };
}

run("BYD Seal and Dolphin never borrow Seal U or Dolphin Surf images", () => {
  const entries = [entry("BYD", "Seal U"), entry("BYD", "Dolphin Surf"), entry("BYD", "Sealion 7")];
  assert.equal(matchCatalogModel("BYD", "SEAL", entries), null);
  assert.equal(matchCatalogModel("BYD", "SEAL EXCELLENCE AWD", entries), null);
  assert.equal(matchCatalogModel("BYD", "DOLPHIN", entries), null);
  assert.equal(matchCatalogModel("BYD", "DOLPHIN COMFORT", entries), null);
  assert.equal(matchCatalogModel("BYD", "SEAL U DM-I BOOST", entries), "Seal U");
  assert.equal(matchCatalogModel("BYD", "DOLPHIN SURF ACTIVE", entries), "Dolphin Surf");
  assert.equal(matchCatalogModel("BYD", "SEALION 7 COMFORT", entries), "Sealion 7");
});

run("taxi maker names map to LEVC and LTI only", () => {
  for (const make of ["LONDON EV COMPANY", "London EV Company Limited", "LONDON EV COMPANY LTD", "LEVC"]) {
    assert.equal(
      resolveVehicleImage({ make, model: "VN5", year: 2022 }).src,
      "/cars/levc-vn5-mk1-2020-2026.webp",
      make,
    );
  }
  const entries = [entry("LTI", "TX4", 2007, 2017)];
  for (const make of ["LTI", "LONDON TAXIS INT", "London Taxis International", "LONDON TAXI COMPANY", "THE LONDON TAXI COMPANY"]) {
    assert.equal(matchCatalogModel(make, "TX4", entries), "TX4", make);
  }
  assert.equal(matchCatalogModel("LONDON", "TX4", entries), null);
  assert.equal(matchCatalogModel("TAXI", "TX4", entries), null);
  assert.equal(matchCatalogModel("Ford", "Fiesta Titanium"), "Fiesta");
  assert.equal(matchCatalogModel("Toyota", "PRIUS"), "Prius");
});

run("bus maker aliases never capture plain Dennis or Dennis Eagle", () => {
  const entries = [
    entry("Alexander Dennis", "Enviro200"),
    entry("Alexander Dennis", "Enviro400"),
    entry("Wrightbus", "StreetDeck"),
  ];
  for (const make of ["ALEXANDER DENNIS", "ALEXANDER DENNIS LTD", "Alexander Dennis Limited", "ADL"]) {
    assert.equal(matchCatalogModel(make, "ENVIRO400 MMC", entries), "Enviro400", make);
  }
  for (const make of ["WRIGHT", "WRIGHTBUS", "WRIGHTBUS LTD"]) {
    assert.equal(matchCatalogModel(make, "STREETDECK", entries), "StreetDeck", make);
  }
  assert.equal(matchCatalogModel("DENNIS", "E20D", entries), null);
  assert.equal(matchCatalogModel("DENNIS", "ENVIRO200", entries), null);
  assert.equal(matchCatalogModel("DENNIS EAGLE", "ELITE 6", entries), null);
  assert.equal(matchCatalogModel("DENNIS EAGLE", "ENVIRO400", entries), null);
});

run("bus chassis codes map only under the right make", () => {
  const entries = [
    entry("Alexander Dennis", "Enviro200"),
    entry("Alexander Dennis", "Enviro400"),
    entry("Mercedes-Benz", "Citaro"),
    entry("Mercedes-Benz", "Sprinter"),
  ];
  assert.equal(matchCatalogModel("ALEXANDER DENNIS", "E20D", entries), "Enviro200");
  assert.equal(matchCatalogModel("ADL", "E40D", entries), "Enviro400");
  assert.equal(matchCatalogModel("ALEXANDER DENNIS LTD", "E40H", entries), "Enviro400");
  assert.equal(matchCatalogModel("MERCEDES-BENZ", "O530", entries), "Citaro");
  assert.equal(matchCatalogModel("MERCEDES-BENZ", "O 530 G", entries), "Citaro");
  assert.equal(matchCatalogModel("VOLVO", "E40D", entries), null);
  assert.equal(matchCatalogModel("SCANIA", "O530", entries), null);
  assert.equal(matchCatalogModel("ALEXANDER DENNIS", "E50D", entries), null);
  assert.equal(matchCatalogModel("MERCEDES-BENZ", "SPRINTER 516", entries), "Sprinter");
  assert.equal(matchCatalogModel("MERCEDES-BENZ", "O530", undefined), "Citaro");
  assert.equal(matchCatalogModel("SCANIA", "O530", undefined), null);
});

run("MG ZS EV never borrows a petrol ZS image", () => {
  for (const model of ["ZS EV", "ZS EV TROPHY CONNECT LONG RANGE", "ZSEV"]) {
    for (const year of [2022, 2025]) {
      const result = resolveVehicleImage({ make: "MG", model, year });
      assert.equal(result.src, "/cars/mg-zs-ev-facelift-2021-2026.webp", `${model} ${year}`);
    }
    // The open-grille pre-facelift EV has no image and never borrows the facelift.
    for (const year of [2019, 2020]) {
      const result = resolveVehicleImage({ make: "MG", model, year });
      assert.equal(result.match, "placeholder", `${model} ${year}`);
    }
  }
  assert.equal(
    resolveVehicleImage({ make: "MG", model: "ZS", year: 2025 }).src,
    "/cars/mg-zs-mk2-2024-2026.webp",
  );
  assert.equal(
    resolveVehicleImage({ make: "MG", model: "ZS HYBRID+ TROPHY", year: 2025 }).src,
    "/cars/mg-zs-mk2-2024-2026.webp",
  );
  assert.equal(
    resolveVehicleImage({ make: "MG MOTOR UK", model: "ZS EXCLUSIVE", year: 2022 }).src,
    "/cars/mg-zs-mk1-facelift-2020-2024.webp",
  );
});

run("verified DVSA taxi and bus names resolve to their records", () => {
  assert.equal(
    resolveVehicleImage({ make: "LEVC", model: "TX", year: 2021, firstRegistrationDate: "2021-09-02" }).src,
    "/cars/levc-tx-mk1-2018-2026.webp",
  );
  assert.equal(
    resolveVehicleImage({ make: "ADL", model: "ENVIRO 400", year: 2016, firstRegistrationDate: "2016-12-12" }).src,
    "/cars/alexander-dennis-enviro400-mmc-2014-2026.webp",
  );
});

run("ambiguous Electroliner and BYD eBus names stay on the placeholder", () => {
  for (const [make, model, year, date] of [
    ["WRIGHTBUS", "Electroliner", 2023, "2023-09-15"],
    ["WRIGHTBUS", "ELECTROLINER", 2024, "2024-01-17"],
    ["BYD", "BYD EBUS", 2025, "2025-09-22"],
    ["BYD", "BYD ebus", 2025, "2025-12-04"],
    ["BYD", "EBUS", 2026, "2026-01-12"],
  ] as const) {
    const result = resolveVehicleImage({ make, model, year, firstRegistrationDate: date });
    assert.equal(result.src, null, `${make} ${model}`);
    assert.equal(result.fallbackUsed, true, `${make} ${model}`);
  }
  assert.equal(
    resolveVehicleImage({ make: "WRIGHTBUS", model: "GB Kite Electroliner", year: 2023 }).src,
    "/cars/wrightbus-gb-kite-electroliner-2021-2026.webp",
  );
  assert.equal(
    resolveVehicleImage({ make: "WRIGHTBUS", model: "STREETDECK ELECTROLINER", year: 2023 }).src,
    "/cars/wrightbus-streetdeck-mk1-2014-2026.webp",
  );
  assert.equal(matchCatalogModel("BYD", "BD11"), "BD11");
  assert.equal(matchCatalogModel("BYD", "B12"), "B12");
});

run("today's real-lookup gaps resolve to their new records", () => {
  const cases: Array<[string, string, number, string, string]> = [
    ["PEUGEOT", "RIFTER HORIZON RS PLUS AUTO", 2023, "2023-04-19", "peugeot-rifter-k9-2018-2026.webp"],
    ["PEUGEOT", "E-RIFTER ALLURE", 2022, "2022-05-01", "peugeot-rifter-k9-2018-2026.webp"],
    ["PEUGEOT", "PARTNER TEPEE OUTDOOR HDI", 2012, "2012-05-01", "peugeot-partner-tepee-ii-2008-2018.webp"],
    ["PEUGEOT", "PARTNER 850 S L1 HDI", 2012, "2012-05-01", "peugeot-partner-ii-2008-2018.webp"],
    ["SKODA", "FABIA", 2002, "2002-09-10", "skoda-fabia-mk1-1999-2007.webp"],
    ["INFINITI", "Q30", 2017, "2017-07-31", "infiniti-q30-2015-2019.webp"],
    ["INFINITI", "QX30 PREMIUM TECH", 2017, "2017-03-01", "infiniti-q30-2015-2019.webp"],
    ["SMART", "1 BRABUS EV 4X4", 2023, "2023-10-21", "smart-1-hx11-2022-2026.webp"],
    ["SMART", "#1 PREMIUM", 2024, "2024-03-01", "smart-1-hx11-2022-2026.webp"],
    ["MERCEDES-BENZ", "EQE 300 SALOON AMG LINE", 2024, "2024-02-21", "mercedes-benz-eqe-v295-2022-2026.webp"],
    ["MERCEDES-BENZ", "EQE 350 4MATIC SUV AMG LINE", 2024, "2024-02-21", "mercedes-benz-eqe-suv-x294-2023-2026.webp"],
    ["MERCEDES-BENZ", "EQE SUV 350 4MATIC", 2024, "2024-02-21", "mercedes-benz-eqe-suv-x294-2023-2026.webp"],
    ["MERCEDES", "ACTROS", 2024, "2024-11-07", "mercedes-benz-actros-mp4-mp5-2011-2026.webp"],
    ["MERCEDES-BENZ", "ACTROS 2544", 2006, "2006-05-01", "mercedes-benz-actros-mp2-mp3-2003-2011.webp"],
    ["MERCEDES-BENZ", "V 300 SPORT D AUTO", 2019, "2019-11-26", "mercedes-benz-v-class-w447-facelift-2019-2024.webp"],
  ];
  for (const [make, model, year, firstRegistrationDate, filename] of cases) {
    assert.equal(
      resolveVehicleImage({ make, model, year, firstRegistrationDate }).filename,
      filename,
      `${make} ${model}`,
    );
  }
  assert.equal(matchCatalogModel("MERCEDES-BENZ", "EQE 300 AMG LINE"), "EQE");
  assert.equal(matchCatalogModel("MERCEDES-BENZ", "VITO 116 CDI"), "Vito");
});

run("EQE without a stated body never guesses saloon or SUV", () => {
  for (const model of ["EQE 300 EXCLUSIVE LUXURY", "EQE", "EQE 350 4MATIC AMG LINE"]) {
    const result = resolveVehicleImage({
      make: "MERCEDES-BENZ",
      model,
      year: 2024,
      firstRegistrationDate: "2024-02-21",
    });
    assert.equal(result.src, null, model);
    assert.equal(result.fallbackUsed, true, model);
  }
});

run("949-958 real lookups resolve Sorento, Sharan, DAF XB, V50 and Grand Vitara", () => {
  const cases: Array<[string, string, number, string, string]> = [
    // PN24FXW, RY54DXX, YF08RRX, GJ18CUA and EF74YHJ as returned by DVSA.
    ["Daf", "XB210FA", 2024, "2024-08", "daf-xb-2023-2026.webp"],
    ["Volvo", "V50", 2004, "2004-12", "volvo-v50-2004-2012.webp"],
    ["Suzuki", "Grand Vitara", 2008, "2008-06", "suzuki-grand-vitara-mk2-2005-2015.webp"],
    ["Volkswagen", "Sharan", 2018, "2018-03", "volkswagen-sharan-mk2-2010-2022.webp"],
    // UK facelift sales began April 2024, so a 2025 build is always the facelift.
    ["Kia", "Sorento 2 PHEV AWD Auto", 2025, "2025-02", "kia-sorento-mq4-facelift-2024-2026.webp"],
    ["KIA", "SORENTO KX-2 CRDI", 2007, "2007-03-01", "kia-sorento-bl-2002-2009.webp"],
    ["KIA", "SORENTO KX-2 CRDI", 2012, "2012-03-01", "kia-sorento-xm-2009-2015.webp"],
    ["KIA", "SORENTO KX-2 ISG", 2016, "2016-03-01", "kia-sorento-um-facelift-2018-2020.webp"],
    ["KIA", "SORENTO 3 ISG", 2019, "2019-03-01", "kia-sorento-um-facelift-2018-2020.webp"],
    ["KIA", "SORENTO 3 HEV", 2022, "2022-03-01", "kia-sorento-mq4-2020-2024.webp"],
    ["KIA", "SORENTO 3 HEV", 2024, "2024-02-01", "kia-sorento-mq4-2020-2024.webp"],
    ["KIA", "SORENTO 3 HEV", 2024, "2024-10-01", "kia-sorento-mq4-facelift-2024-2026.webp"],
    ["VOLKSWAGEN", "SHARAN SE TDI", 2005, "2005-03-01", "volkswagen-sharan-mk1-1995-2010.webp"],
    ["VW", "SHARAN SE NAV TDI BLUEMOTION TECH", 2013, "2013-03-01", "volkswagen-sharan-mk2-2010-2022.webp"],
    ["DAF TRUCKS", "XB 230 FA", 2025, "2025-03-01", "daf-xb-2023-2026.webp"],
    ["VOLVO", "V50 SE LUX D", 2010, "2010-03-01", "volvo-v50-2004-2012.webp"],
    ["SUZUKI", "GRAND VITARA 2.0", 2002, "2002-03-01", "suzuki-grand-vitara-mk1-1998-2005.webp"],
    ["SUZUKI", "GRAND VITARA SZ5 DDIS", 2012, "2012-03-01", "suzuki-grand-vitara-mk2-2005-2015.webp"],
  ];
  for (const [make, model, year, firstRegistrationDate, filename] of cases) {
    assert.equal(
      resolveVehicleImage({ make, model, year, firstRegistrationDate }).filename,
      filename,
      `${make} ${model} ${year}`,
    );
  }

  // WA75RFE: DVSA does not say whether this EQE is the saloon or the SUV.
  const eqe = resolveVehicleImage({
    make: "Mercedes-Benz",
    model: "Eqe 350+ Sport Edition",
    year: 2025,
    firstRegistrationDate: "2025-09",
  });
  assert.equal(eqe.src, null);

  assert.equal(matchCatalogModel("SUZUKI", "VITARA SZ-T"), "Vitara");
  assert.equal(matchCatalogModel("SEAT", "ALHAMBRA SE TDI"), "Alhambra");
  assert.equal(matchCatalogModel("VOLVO", "V40 D2"), "V40");
  assert.equal(matchCatalogModel("DAF", "LF 45.180"), "LF");
});

run("959-1008 older generations resolve from DVSA-style names", () => {
  const cases: Array<[string, string, string, string]> = [
    // EG03JYX as returned by DVSA.
    ["TOYOTA", "YARIS", "2003-07", "toyota-yaris-xp10-1999-2005.webp"],
    ["VOLKSWAGEN", "TRANSPORTER T30 TDI", "2006-06", "volkswagen-transporter-t5-2003-2009.webp"],
    ["BMW", "118D SE", "2008-06", "bmw-1-series-e87-2004-2011.webp"],
    ["VAUXHALL", "VIVARO 2900 CDTI SWB", "2008-06", "vauxhall-vivaro-a-2001-2014.webp"],
    ["AUDI", "A4 SE TDI", "2006-06", "audi-a4-b7-2005-2008.webp"],
    ["AUDI", "Q5 SE TDI QUATTRO", "2012-06", "audi-q5-8r-2008-2016.webp"],
    ["BMW", "520D SE", "2007-06", "bmw-5-series-e60-2003-2010.webp"],
    ["AUDI", "Q3 S LINE TDI QUATTRO", "2014-06", "audi-q3-8u-2011-2018.webp"],
    ["FORD", "TRANSIT 280 SWB", "2003-06", "ford-transit-mk6-2000-2006.webp"],
    ["MERCEDES-BENZ", "C220 CDI ELEGANCE", "2004-06", "mercedes-benz-c-class-w203-2000-2007.webp"],
    ["LAND ROVER", "DISCOVERY 3 TDV6 HSE", "2007-06", "land-rover-discovery-l319-2004-2016.webp"],
    ["LAND ROVER", "DISCOVERY 4 SDV6 HSE", "2013-06", "land-rover-discovery-l319-2004-2016.webp"],
    ["LAND ROVER", "RANGE ROVER SPORT TDV6 HSE", "2009-06", "land-rover-range-rover-sport-l320-2005-2013.webp"],
    ["VAUXHALL", "ASTRA CLUB 8V", "2001-06", "vauxhall-astra-g-1998-2004.webp"],
    ["RENAULT", "TRAFIC SL27 DCI", "2009-06", "renault-trafic-ii-2001-2014.webp"],
    ["MERCEDES-BENZ", "E220 CDI AVANTGARDE", "2006-06", "mercedes-benz-e-class-w211-2002-2009.webp"],
    ["MINI", "COOPER", "2004-06", "mini-hatch-r50-2001-2006.webp"],
    ["VAUXHALL", "ZAFIRA DESIGN 16V", "2003-06", "vauxhall-zafira-a-1999-2005.webp"],
    ["FORD", "MONDEO ZETEC", "2004-06", "ford-mondeo-mk3-2000-2007.webp"],
    ["MERCEDES-BENZ", "SPRINTER 313 CDI MWB", "2004-06", "mercedes-benz-sprinter-t1n-2000-2006.webp"],
    ["FIAT", "DUCATO 35 MULTIJET LWB", "2010-06", "fiat-ducato-x250-2006-2014.webp"],
    ["BMW", "X5 XDRIVE30D SE", "2015-06", "bmw-x5-f15-2013-2018.webp"],
    ["AUDI", "A6 SE TDI", "2008-06", "audi-a6-c6-2004-2011.webp"],
    ["JAGUAR", "XF LUXURY V6 D", "2010-06", "jaguar-xf-x250-2008-2015.webp"],
    ["JAGUAR", "XF R-SPORT D", "2017-06", "jaguar-xf-x260-2015-2024.webp"],
    ["NISSAN", "NAVARA ACENTA DCI 4X4 D/C", "2010-06", "nissan-navara-d40-2005-2015.webp"],
    ["MITSUBISHI", "L200 WARRIOR DI-D 4X4", "2010-06", "mitsubishi-l200-series-4-2006-2015.webp"],
    ["VOLKSWAGEN", "PASSAT SE TDI", "2002-06", "volkswagen-passat-b5-1997-2005.webp"],
    ["FORD", "KA STYLE", "2004-06", "ford-ka-mk1-1996-2008.webp"],
    ["TOYOTA", "PRIUS T SPIRIT VVT-I", "2007-06", "toyota-prius-xw20-2004-2009.webp"],
    ["BMW", "X1 XDRIVE20D SE", "2012-06", "bmw-x1-e84-2009-2015.webp"],
    ["MERCEDES-BENZ", "VITO 111 CDI LONG", "2007-06", "mercedes-benz-vito-w639-2003-2010.webp"],
    ["AUDI", "TT TFSI", "2010-06", "audi-tt-8j-2006-2014.webp"],
    ["VOLVO", "XC90 D5 SE", "2008-06", "volvo-xc90-mk1-2002-2014.webp"],
    ["MERCEDES-BENZ", "GLE 300 D 4MATIC AMG LINE", "2021-06", "mercedes-benz-gle-w167-2019-2026.webp"],
    ["MERCEDES-BENZ", "GLE350D AMG LINE", "2021-06", "mercedes-benz-gle-w167-2019-2026.webp"],
    ["MG", "ZS EV TROPHY CONNECT", "2023-06", "mg-zs-ev-facelift-2021-2026.webp"],
    ["HONDA", "HR-V ADVANCE E:HEV", "2022-06", "honda-hr-v-mk3-2021-2026.webp"],
    ["CUPRA", "LEON VZ2 E-HYBRID", "2022-06", "cupra-leon-mk4-2020-2026.webp"],
    ["MERCEDES-BENZ", "B180 SPORT", "2015-06", "mercedes-benz-b-class-w246-2012-2018.webp"],
    ["MERCEDES-BENZ", "A150 CLASSIC SE", "2007-06", "mercedes-benz-a-class-w169-2004-2012.webp"],
    ["HYUNDAI", "SANTA FE PREMIUM CRDI", "2020-06", "hyundai-santa-fe-tm-2018-2024.webp"],
    ["VOLKSWAGEN", "TOURAN SE TDI", "2012-06", "volkswagen-touran-1t3-2010-2015.webp"],
    ["CITROEN", "DISPATCH 1000 L1H1 HDI", "2011-06", "citroen-dispatch-ii-2007-2016.webp"],
    ["VAUXHALL", "COMBO 1700 CDTI", "2006-06", "vauxhall-combo-c-2001-2011.webp"],
    ["KIA", "SPORTAGE XE CRDI", "2008-06", "kia-sportage-km-2004-2010.webp"],
    ["HYUNDAI", "TUCSON CDX CRTD", "2007-06", "hyundai-tucson-jm-2004-2010.webp"],
    ["MAZDA", "6 SPORT NAV D", "2016-06", "mazda-mazda6-gj-2013-2023.webp"],
    ["MAZDA", "MAZDA6 SE-L NAV", "2019-06", "mazda-mazda6-gj-2013-2023.webp"],
    ["PEUGEOT", "508 ACTIVE HDI", "2013-06", "peugeot-508-mk1-2011-2018.webp"],
    ["VOLVO", "V70 SE D5", "2010-06", "volvo-v70-mk3-2007-2016.webp"],
    ["MAZDA", "MX-5 SPORT TECH", "2010-06", "mazda-mx-5-nc-2005-2015.webp"],
    ["FORD", "MUSTANG GT", "2018-06", "ford-mustang-s550-2015-2023.webp"],
  ];
  const resolve = (make: string, model: string, firstRegistrationDate: string) =>
    resolveVehicleImage({
      make,
      model,
      year: Number(firstRegistrationDate.slice(0, 4)),
      firstRegistrationDate,
    }).filename;
  for (const [make, model, date, filename] of cases) {
    assert.equal(resolve(make, model, date), filename, `${make} ${model} ${date}`);
  }
  const covered = new Set(cases.map(([, , , filename]) => filename));
  const added = vehicles.filter((v) => v.priority >= 959 && v.priority <= 1008);
  assert.equal(added.length, 50);
  assert.deepEqual(added.filter((v) => !covered.has(v.filename)).map((v) => v.filename), []);
});

run("959-1008 leave neighbouring generations and other bodies alone", () => {
  const cases: Array<[string, string, string, string | null]> = [
    ["BMW", "118D SPORT", "2012-06", "bmw-1-series-f20-2011-2015.webp"],
    ["BMW", "118D SPORT", "2011-02", "bmw-1-series-e87-2004-2011.webp"],
    ["BMW", "118D SPORT", "2011-10", "bmw-1-series-f20-2011-2015.webp"],
    ["TOYOTA", "YARIS T2", "2006-06", "toyota-yaris-xp90-2006-2011.webp"],
    ["FORD", "TRANSIT 280 SWB", "2006-02", "ford-transit-mk6-2000-2006.webp"],
    ["FORD", "TRANSIT 280 SWB", "2006-10", "ford-transit-mk7-2006-2014.webp"],
    ["MINI", "COOPER", "2007-06", "mini-hatch-r56-2006-2013.webp"],
    ["MERCEDES-BENZ", "VITO 113 CDI", "2011-06", "mercedes-benz-vito-w639-facelift-2010-2014.webp"],
    ["VOLKSWAGEN", "TRANSPORTER T28 TDI", "2011-06", "volkswagen-transporter-t5-1-2010-2015.webp"],
    ["KIA", "SPORTAGE 2 CRDI", "2012-06", "kia-sportage-sl-2010-2015.webp"],
    ["MAZDA", "MX-5 SPORT NAV", "2016-06", "mazda-mx-5-nd-2015-2026.webp"],
    ["MERCEDES-BENZ", "GLE 350 D 4MATIC", "2017-06", "mercedes-benz-gle-w166-2015-2019.webp"],
    ["VAUXHALL", "COMBO 2000 L1H1 CDTI", "2015-06", "vauxhall-combo-cargo-d-2012-2018.webp"],
    // Older generations with no image of their own stay on the placeholder.
    ["MAZDA", "6 TS2", "2010-06", null],
    ["VOLVO", "V70 SE D5", "2005-06", null],
    ["HYUNDAI", "SANTA FE CDX CRTD", "2016-06", null],
    ["FORD", "MUSTANG GT", "2012-06", null],
    ["MITSUBISHI", "L200 4LIFE", "2004-06", null],
    ["MG", "ZS EV EXCLUSIVE", "2020-06", null],
    // Bodies or models the new images do not show.
    ["BMW", "120D M SPORT COUPE", "2010-06", null],
    ["BMW", "118I SE CONVERTIBLE", "2012-06", null],
    ["MERCEDES-BENZ", "C180 KOMPRESSOR SE SPORTCOUPE", "2004-06", null],
    ["MERCEDES-BENZ", "C220 CDI SPORT COUPE", "2004-06", null],
    ["MERCEDES-BENZ", "GLE 400 D 4MATIC AMG LINE PREMIUM COUPE", "2022-06", null],
    ["AUDI", "A4 CABRIOLET TDI SPORT", "2007-06", null],
    ["FORD", "MUSTANG GT CONVERTIBLE", "2018-06", null],
    ["TOYOTA", "YARIS VERSO T3", "2003-06", null],
    ["TOYOTA", "AVENSIS VERSO T2 D-4D", "2004-06", null],
    ["VAUXHALL", "COMBO LIFE ENERGY", "2019-06", null],
    ["VOLKSWAGEN", "ID. BUZZ PRO", "2023-06", null],
  ];
  for (const [make, model, date, filename] of cases) {
    const result = resolveVehicleImage({
      make,
      model,
      year: Number(date.slice(0, 4)),
      firstRegistrationDate: date,
    });
    assert.equal(result.filename, filename, `${make} ${model} ${date}`);
  }
});

const pendingVehicles = vehicleImagesLibrary.pendingVehicles as VehicleImageRow[];

const FILENAMES_WITHOUT_YEARS = new Set(["yadea-g5s.webp", "yadea-c1s.webp"]);
/** Records whose range changed after their image was named: the file keeps its original years. */
const FILENAMES_WITH_WIDENED_RANGES = new Set([
  "kia-sorento-um-facelift-2018-2020.webp",
  // The image is the 2024 facelift, the only Spring sold in the UK.
  "dacia-spring-2021-2026.webp",
  // Representative 1960 example; catalogue covers the full MF 35 run.
  "massey-ferguson-35-1960.webp",
]);
/** LFB specialist bodies keep the year(s) then a body-role suffix after them. */
const FILENAMES_WITH_SPECIALIST_BODY_SUFFIX = new Set([
  "mercedes-benz-atego-1325f-2007-pumping-appliance.webp",
  "mercedes-benz-atego-1327f-2016-2021-pumping-appliance.webp",
  "mercedes-benz-atego-1527f-2021-fire-rescue-unit.webp",
  "optare-switch-2023-command-support-unit.webp",
  "iveco-daily-2023-detection-identification-and-monitoring.webp",
  "ford-transit-custom-2018-fire-investigation-unit.webp",
  "scania-l320-2022-heavy-distribution-unit.webp",
  "mercedes-benz-atego-2010-2011-hose-layer.webp",
  "mercedes-benz-atego-1218-2004-london-resilience-lorry.webp",
  "mercedes-benz-atego-1223-1224-2007-operational-support-unit.webp",
  "scania-l360-2020-32m-turntable-ladder.webp",
  "scania-p410-2020-2021-64m-turntable-ladder.webp",
  "iveco-70c18ha8-2022-all-wheel-drive.webp",
  "volvo-fl42-2023-zepa.webp",
  "mercedes-benz-sprinter-416-2018-gp-van.webp",
  "mercedes-benz-vito-114-2019-marked-red-minibus.webp",
]);

run("1009-1013 street-test finds resolve to their own generation", () => {
  const cases: Array<[string, string, string, string]> = [
    // LK07VVL, LY25VTO, GK25JYZ, GR07FZW and T66TTP as returned by DVSA.
    ["TOYOTA", "ESTIMA", "2007-03", "toyota-estima-2006-2019.webp"],
    ["DACIA", "SPRING EXTREME EV", "2025-06", "dacia-spring-2021-2026.webp"],
    ["VOLKSWAGEN", "ID BUZZ COMMERCE", "2025-03", "volkswagen-id-buzz-cargo-2022-2026.webp"],
    ["TOYOTA", "AVENSIS", "2007-06", "toyota-avensis-t25-2003-2009.webp"],
    ["NISSAN", "SERENA", "2015-09", "nissan-serena-2010-2016.webp"],
  ];
  for (const [make, model, date, filename] of cases) {
    const result = resolveVehicleImage({
      make,
      model,
      year: Number(date.slice(0, 4)),
      firstRegistrationDate: date,
    });
    assert.equal(result.filename, filename, model);
    assert.equal(result.match, "exact", model);
  }
  assert.equal(
    resolveVehicleImage({ make: "TOYOTA", model: "AVENSIS T2 D-4D", year: 2012 }).filename,
    "toyota-avensis-t27-2009-2015.webp",
  );
});

run("pending records have no file yet and never collide with the catalogue", () => {
  const files = new Set(readdirSync(join(process.cwd(), "public", "cars")));
  const priorities = new Set(vehicles.map((v) => v.priority));
  const filenames = new Set(vehicles.map((v) => v.filename));
  const keys = new Set(vehicles.map((v) => `${v.make}|${v.model}|${v.generation}`.toLowerCase()));
  assert.equal(pendingVehicles.length, 0);
  for (const v of pendingVehicles) {
    assert.ok(!files.has(v.filename), `${v.filename} exists: move its record into vehicles`);
    assert.ok(!filenames.has(v.filename), v.filename);
    assert.ok(!priorities.has(v.priority), `pending priority ${v.priority}`);
    assert.ok(!keys.has(`${v.make}|${v.model}|${v.generation}`.toLowerCase()), v.filename);
    assert.match(v.filename, /^[a-z0-9-]+\.webp$/, v.filename);
    assert.ok(
      FILENAMES_WITH_SPECIALIST_BODY_SUFFIX.has(v.filename) ||
        v.filename.endsWith(`-${v.yearFrom}-${v.yearTo}.webp`),
      v.filename,
    );
    priorities.add(v.priority);
  }
});

run("Lexus IS numbers without a space resolve to IS", () => {
  for (const model of ["IS200", "IS250", "IS300", "IS350", "IS300H F SPORT", "IS 300"]) {
    assert.equal(matchCatalogModel("LEXUS", model), "IS", model);
  }
  assert.equal(matchCatalogModel("LEXUS", "IS220D"), null);
  assert.equal(matchCatalogModel("LEXUS", "IS F"), "IS");
  assert.equal(matchCatalogModel("LEXUS", "NX 300H"), "NX");
});

run("690-746 families resolve from typical DVSA model strings", () => {
  const cases: Array<[string, string, number, string, string]> = [
    ["JAGUAR", "X-TYPE SE", 2004, "2004-05-01", "jaguar-x-type-saloon-2001-2009.webp"],
    ["JAGUAR", "X TYPE V6 SPORT AWD", 2003, "2003-03-01", "jaguar-x-type-saloon-2001-2009.webp"],
    ["JAGUAR", "X-TYPE SE ESTATE", 2006, "2006-05-01", "jaguar-x-type-estate-2004-2009.webp"],
    ["JAGUAR", "X-TYPE S", 2008, "2008-10-01", "jaguar-x-type-facelift-2007-2009.webp"],
    ["SAAB", "93 S", 2000, "2000-05-01", "saab-9-3-gen1-1998-2002.webp"],
    ["SAAB", "9-3 VECTOR SPORT TID", 2005, "2005-05-01", "saab-9-3-gen2-2002-2007.webp"],
    ["SAAB", "9-3 AERO", 2009, "2009-05-01", "saab-9-3-gen2-facelift-2008-2011.webp"],
    ["SAAB", "9-3 VECTOR SPORTWAGON", 2007, "2007-05-01", "saab-9-3-sportwagon-2005-2011.webp"],
    ["SAAB", "9-3 LINEAR SPORT WAGON TID", 2009, "2009-05-01", "saab-9-3-sportwagon-2005-2011.webp"],
    ["CITROEN", "XSARA LX", 1999, "1999-05-01", "citroen-xsara-1997-2000.webp"],
    ["CITROEN", "XSARA DESIRE", 2002, "2002-05-01", "citroen-xsara-facelift-2000-2004.webp"],
    ["CITROEN", "XSARA LX ESTATE", 2001, "2001-05-01", "citroen-xsara-estate-1998-2004.webp"],
    ["CITROEN", "XSARA PICASSO DESIRE", 2006, "2006-05-01", "citroen-xsara-picasso-2000-2010.webp"],
    ["HONDA", "STEPWGN", 1999, "1999-05-01", "honda-stepwgn-rf1-1996-2001.webp"],
    ["HONDA", "STEP WGN", 2003, "2003-05-01", "honda-stepwgn-rf3-2001-2005.webp"],
    ["HONDA", "STEPWAGON", 2007, "2007-05-01", "honda-stepwgn-rg-2005-2009.webp"],
    ["HONDA", "STEP WGN SPADA", 2012, "2012-05-01", "honda-stepwgn-rk-2009-2015.webp"],
    ["HONDA", "STEP WAGON", 2018, "2018-05-01", "honda-stepwgn-rp-2015-2022.webp"],
    ["HONDA", "STEPWGN SPADA", 2024, "2024-05-01", "honda-stepwgn-rp6-2022-2026.webp"],
    ["YADEA", "G5S", 2023, "2023-05-01", "yadea-g5s.webp"],
    ["YADEA", "C1S", 2022, "2022-05-01", "yadea-c1s.webp"],
    ["DAF", "LF 45.180", 2004, "2004-05-01", "daf-lf-2001-2006.webp"],
    ["DAF", "LF 55.220", 2010, "2010-05-01", "daf-lf-2006-2013.webp"],
    ["DAF", "LF 180 FA", 2017, "2017-05-01", "daf-lf-euro6-2013-2021.webp"],
    ["DAF TRUCKS", "LF230", 2022, "2022-05-01", "daf-lf-2021-2023.webp"],
    ["DAF", "CF 450 FT", 2016, "2016-05-01", "daf-cf-euro6-2013-2021.webp"],
    ["DAF", "XF 460 FT", 2015, "2015-05-01", "daf-xf-euro6-2013-2017.webp"],
    ["DAF", "XF 480", 2019, "2019-05-01", "daf-xf-2017-2021.webp"],
    ["DAF", "XF 480 FT", 2023, "2023-05-01", "daf-xf-2021-2026.webp"],
    ["DAF", "XG+ 530", 2023, "2023-05-01", "daf-xg-2021-2026.webp"],
    ["DAF", "XD 450", 2024, "2024-05-01", "daf-xd-2022-2026.webp"],
    ["SCANIA", "P 280", 2010, "2010-05-01", "scania-p-series-2004-2016.webp"],
    ["SCANIA", "P280 DB", 2019, "2019-05-01", "scania-p-series-2016-2026.webp"],
    ["SCANIA", "G 410", 2014, "2014-05-01", "scania-g-series-2007-2016.webp"],
    ["SCANIA", "G410", 2020, "2020-05-01", "scania-g-series-2016-2026.webp"],
    ["SCANIA", "R 450", 2012, "2012-05-01", "scania-r-series-2004-2016.webp"],
    ["SCANIA", "R450", 2020, "2020-05-01", "scania-r-series-2016-2026.webp"],
    ["SCANIA", "S 500", 2021, "2021-05-01", "scania-s-series-2016-2026.webp"],
    ["MAN", "TGL 8.180", 2010, "2010-05-01", "man-tgl-2005-2020.webp"],
    ["MAN", "TGL 12.220 4X2 BL", 2022, "2022-05-01", "man-tgl-2020-2026.webp"],
    ["MAN", "TGM 18.290", 2015, "2015-05-01", "man-tgl-2005-2020.webp"],
    ["MAN", "TGM 18.290", 2021, "2021-05-01", "man-tgl-2020-2026.webp"],
    ["MAN", "TGS 26.440", 2012, "2012-05-01", "man-tgs-2007-2020.webp"],
    ["MAN", "TGS 26.470", 2022, "2022-05-01", "man-tgs-2020-2026.webp"],
    ["MAN", "TGX 18.510", 2023, "2023-05-01", "man-tgx-2020-2026.webp"],
    ["VOLVO", "FL 240", 2010, "2010-05-01", "volvo-fl-2006-2013.webp"],
    ["VOLVO", "FL", 2016, "2016-05-01", "volvo-fl-2013-2026.webp"],
    ["VOLVO", "FE 280", 2017, "2017-05-01", "volvo-fe-2013-2026.webp"],
    ["VOLVO", "FM 330", 2022, "2022-05-01", "volvo-fm-2020-2026.webp"],
    ["VOLVO", "FH 460", 2015, "2015-05-01", "volvo-fh-2012-2020.webp"],
    ["VOLVO TRUCKS", "FH13 500", 2023, "2023-05-01", "volvo-fh-2020-2026.webp"],
    ["IVECO", "EUROCARGO ML75E16", 2018, "2018-05-01", "iveco-eurocargo-2015-2026.webp"],
    ["IVECO", "STRALIS AS440S46", 2016, "2016-05-01", "iveco-stralis-2012-2019.webp"],
    ["IVECO", "S-WAY", 2021, "2021-05-01", "iveco-s-way-2019-2026.webp"],
    ["RENAULT TRUCKS", "D WIDE", 2018, "2018-05-01", "renault-trucks-d-2013-2026.webp"],
    ["RENAULT TRUCKS", "T 480", 2016, "2016-05-01", "renault-trucks-t-2013-2026.webp"],
    ["RENAULT TRUCKS", "T 480", 2023, "2023-05-01", "renault-trucks-t-2013-2026.webp"],
    ["RENAULT TRUCKS", "T HIGH EVOLUTION", 2023, "2023-05-01", "renault-trucks-t-evolution-2021-2026.webp"],
    ["MERCEDES-BENZ", "ATEGO 1218", 2016, "2016-05-01", "mercedes-benz-atego-2013-2026.webp"],
    ["MERCEDES", "AROCS 3240", 2018, "2018-05-01", "mercedes-benz-arocs-2013-2026.webp"],
  ];
  for (const [make, model, year, firstRegistrationDate, filename] of cases) {
    assert.equal(
      resolveVehicleImage({ make, model, year, firstRegistrationDate }).filename,
      filename,
      `${make} ${model} ${year}`,
    );
  }
});

run("MAN trucks pick the exact model and generation, with TGM reusing TGL images", () => {
  const cases: Array<[string, string, number, number, string]> = [
    ["MAN", "TGL 7.150", 2006, 726, "man-tgl-2005-2020.webp"],
    ["MAN", "TGL 12.250", 2019, 726, "man-tgl-2005-2020.webp"],
    ["MAN", "TGL 12.220", 2024, 727, "man-tgl-2020-2026.webp"],
    ["MAN", "TGM 15.250", 2008, 728, "man-tgl-2005-2020.webp"],
    ["MAN TRUCK AND BUS", "TGM 18.320", 2019, 728, "man-tgl-2005-2020.webp"],
    ["MAN", "TGM 26.320", 2023, 729, "man-tgl-2020-2026.webp"],
    ["MAN", "TGS 18.400", 2009, 730, "man-tgs-2007-2020.webp"],
    ["MAN", "TGS 26.470", 2024, 731, "man-tgs-2020-2026.webp"],
    ["MAN", "TGX 18.470", 2022, 732, "man-tgx-2020-2026.webp"],
  ];
  for (const [make, model, year, priority, filename] of cases) {
    const result = resolveVehicleImage({ make, model, year, firstRegistrationDate: `${year}-05-01` });
    assert.equal(result.filename, filename, `${make} ${model} ${year}`);
    assert.equal(result.record?.priority, priority, `${make} ${model} ${year}`);
    assert.equal(result.record?.bodyType, "truck", `${make} ${model} ${year}`);
  }

  for (const [model, year] of [["TGE 3.140", 2019], ["TGE 5.180", 2025]] as const) {
    const result = resolveVehicleImage({ make: "MAN", model, year });
    assert.equal(result.record?.bodyType, "van", `MAN ${model} ${year}`);
    assert.ok(!/^man-tg[lmsx]-/.test(result.filename ?? ""), `MAN ${model} ${year}`);
  }

  const manFiles = vehicles.filter((v) => v.make === "MAN").map((v) => v.filename);
  assert.ok(!manFiles.some((f) => f.startsWith("man-tgm-")));
});

run("690-746 families never guess unsupported generations, bodies or makes", () => {
  const cases: Array<[string, string, number]> = [
    ["SAAB", "9-3 VECTOR CONVERTIBLE", 2006],
    ["SAAB", "9-3X", 2010],
    ["SAAB", "9-3 X", 2010],
    ["DAF", "CF 85.460", 2012],
    ["DAF", "XF 105.460", 2013],
    ["DAF", "CF 450", 2009],
    ["SCANIA", "R 420", 2001],
    ["SCANIA", "N230UD", 2015],
    ["SCANIA", "PRT", 2015],
    ["MAN", "TGX 18.440", 2015],
    ["MAN", "TGA 18.410", 2005],
    ["VOLVO", "FMX 460", 2018],
    ["VOLVO", "FM 460", 2016],
    ["VOLVO", "FH 460", 2009],
    ["IVECO", "EUROCARGO", 2010],
    ["IVECO", "ML75E16", 2018],
    ["RENAULT", "T 480", 2016],
    ["RENAULT TRUCKS", "C 460", 2016],
    ["RENAULT TRUCKS", "PREMIUM 380", 2010],
    ["MERCEDES-BENZ", "ATEGO 1223", 2008],
    ["MERCEDES-BENZ", "AXOR 1840", 2010],
    ["FORD", "LF", 2015],
    ["TOYOTA", "S 500", 2018],
  ];
  for (const [make, model, year] of cases) {
    const result = resolveVehicleImage({ make, model, year });
    assert.equal(result.src, null, `${make} ${model} ${year}`);
  }
  assert.equal(
    resolveVehicleImage({ make: "MAN", model: "TGE 3.180", year: 2020 }).filename,
    "man-tge-mk1-2017-2024.webp",
  );
  assert.equal(
    resolveVehicleImage({ make: "VOLVO", model: "XC60 R-DESIGN", year: 2019 }).filename,
    "volvo-xc60-mk2-2017-2026.webp",
  );
  assert.equal(
    resolveVehicleImage({ make: "MERCEDES-BENZ", model: "ACTROS 2545", year: 2018 }).filename,
    "mercedes-benz-actros-mp4-mp5-2011-2026.webp",
  );
  assert.equal(matchCatalogModel("CITROEN", "C4 PICASSO VTR"), "C4 Picasso");
});

run("874-881 Multivan, 911 and 6 Series resolve by generation and stated body", () => {
  const file = (make: string, model: string, firstRegistrationDate: string) =>
    resolveVehicleImage({
      make,
      model,
      year: Number(firstRegistrationDate.slice(0, 4)),
      firstRegistrationDate,
    }).filename;

  assert.equal(file("VOLKSWAGEN", "Multivan Life TSI PHEV 4M Sa", "2025-09"), "volkswagen-multivan-t7-2022-2026.webp");
  assert.equal(file("VOLKSWAGEN", "TRANSPORTER", "2025-09"), "volkswagen-transporter-t7-2025-2026.webp");
  assert.equal(file("VOLKSWAGEN", "MULTIVAN HIGHLINE", "2017-06"), "volkswagen-transporter-t6-2015-2019.webp");
  assert.equal(file("VOLKSWAGEN", "CARAVELLE EXECUTIVE", "2021-06"), "volkswagen-transporter-t6-1-2019-2024.webp");
  assert.equal(file("VOLKSWAGEN", "CARAVELLE", "2012-06"), "volkswagen-transporter-t5-1-2010-2015.webp");
  assert.equal(file("VOLKSWAGEN", "CARAVELLE", "2000-06"), null);
  assert.equal(file("VOLKSWAGEN", "MULTIVAN", "2005-06"), "volkswagen-transporter-t5-2003-2009.webp");
  assert.equal(file("VOLKSWAGEN", "CARAVELLE", "2002-06"), null);

  assert.equal(file("PORSCHE", "911", "1991-06"), "porsche-911-964-1989-1994.webp");
  assert.equal(file("PORSCHE", "911", "1996-06"), "porsche-911-993-1994-1998.webp");
  assert.equal(file("PORSCHE", "911", "2003-03"), "porsche-911-996-1997-2005.webp");
  assert.equal(file("PORSCHE", "911 CARRERA 4S", "2008-06"), "porsche-911-997-2004-2012.webp");
  assert.equal(file("PORSCHE", "911 CARRERA S", "2015-06"), "porsche-911-991-2011-2019.webp");
  assert.equal(file("PORSCHE", "911 CARRERA", "2022-06"), "porsche-911-992-2019-2026.webp");

  assert.equal(file("BMW", "6 SERIES", "2007-06"), "bmw-6-series-e63-2004-2010.webp");
  assert.equal(file("BMW", "630I SE", "2005-06"), "bmw-6-series-e63-2004-2010.webp");
  assert.equal(file("BMW", "6 SERIES", "2018-10"), "bmw-6-series-f06-gran-coupe-2011-2018.webp");
  assert.equal(file("BMW", "640D M SPORT GRAN COUPE", "2015-06"), "bmw-6-series-f06-gran-coupe-2011-2018.webp");
  assert.equal(file("BMW", "640D M SPORT", "2014-06"), "bmw-6-series-f06-gran-coupe-2011-2018.webp");
  assert.equal(file("BMW", "650I CONVERTIBLE", "2013-06"), null);
  assert.equal(file("BMW", "640D M SPORT COUPE", "2013-06"), null);
  assert.equal(file("BMW", "6 SERIES GT", "2018-10"), "bmw-6-series-gt-g32-2017-2023.webp");
  assert.equal(file("BMW", "640I GRAN TURISMO M SPORT", "2019-06"), "bmw-6-series-gt-g32-2017-2023.webp");
  assert.equal(file("BMW", "6 SERIES", "2020-06"), null);
});

run("882-948 luxury, supercar and JDM names resolve safely", () => {
  const file = (make: string, model: string, year: number, firstRegistrationDate?: string) =>
    resolveVehicleImage({ make, model, year, firstRegistrationDate }).filename;

  assert.equal(file("TOYOTA", "GR SUPRA", 2020), "toyota-supra-a90-2019-2026.webp");
  assert.equal(file("TOYOTA", "SUPRA RZ", 1995), "toyota-supra-a80-1993-2002.webp");
  assert.equal(file("TOYOTA", "SUPRA", 1989), "toyota-supra-a70-1986-1993.webp");
  assert.equal(file("TOYOTA", "SUPRA", 2010), null);
  assert.equal(file("TOYOTA", "CHASER TOURER V", 1998), "toyota-chaser-jzx100-1996-2001.webp");
  assert.equal(file("TOYOTA", "GT86", 2015), "toyota-gt86-2012-2021.webp");
  assert.equal(file("TOYOTA", "GR86", 2023), "toyota-gr86-2022-2026.webp");
  assert.equal(file("TOYOTA", "SOARER", 1988), "toyota-soarer-z20-1986-1991.webp");
  assert.equal(file("TOYOTA", "SOARER", 1995), "lexus-sc-z30-1991-2000.webp");

  for (const model of ["AE86", "COROLLA AE86", "COROLLA LEVIN", "SPRINTER TRUENO", "TRUENO GT APEX"]) {
    assert.equal(file("TOYOTA", model, 1985), "toyota-ae86-1983-1987.webp", model);
  }
  assert.equal(file("TOYOTA", "COROLLA", 1985), null);
  assert.equal(file("TOYOTA", "COROLLA GL", 1986), null);
  assert.equal(file("TOYOTA", "COROLLA LEVIN", 1995), null);

  assert.equal(file("LEXUS", "SC300", 1995), "lexus-sc-z30-1991-2000.webp");
  assert.equal(file("LEXUS", "SC 400", 1993), "lexus-sc-z30-1991-2000.webp");
  assert.equal(file("LEXUS", "SC430", 2005), null);
  assert.equal(file("LEXUS", "SC430", 2000), null);
  assert.equal(file("LEXUS", "SC 430", 2003), null);

  assert.equal(file("NISSAN", "GTR PRESTIGE", 2016), "nissan-gt-r-r35-2009-2022.webp");
  assert.equal(file("NISSAN", "GT-R BLACK EDITION", 2012), "nissan-gt-r-r35-2009-2022.webp");
  assert.equal(file("NISSAN", "GTR", 1999), null);
  assert.equal(file("NISSAN", "SKYLINE GT-R V-SPEC", 1999), "nissan-skyline-r34-1998-2002.webp");
  assert.equal(file("NISSAN", "SKYLINE GTS-T", 1996), "nissan-skyline-r33-1993-1998.webp");
  assert.equal(file("NISSAN", "SILVIA S15 SPEC R", 2000), "nissan-silvia-s15-1999-2002.webp");
  assert.equal(file("NISSAN", "180SX TYPE X", 1996), "nissan-180sx-1989-1998.webp");
  assert.equal(file("NISSAN", "200 SX", 1991), "nissan-180sx-1989-1998.webp");
  assert.equal(file("NISSAN", "200SX", 1997), "nissan-silvia-s14-1993-1999.webp");
  assert.equal(file("NISSAN", "350Z GT", 2006), "nissan-350z-z33-2003-2009.webp");
  assert.equal(file("NISSAN", "370Z NISMO", 2015), "nissan-370z-z34-2009-2020.webp");

  assert.equal(file("MAZDA", "RX7 TYPE RS", 1999), "mazda-rx-7-fd-1992-2002.webp");
  assert.equal(file("MAZDA", "RX-7 TURBO II", 1988), "mazda-rx-7-fc-1985-1992.webp");
  assert.equal(file("MAZDA", "RX8 R3", 2010), "mazda-rx-8-2003-2012.webp");

  assert.equal(file("FERRARI", "430 SCUDERIA", 2008), "ferrari-f430-2004-2009.webp");
  assert.equal(file("FERRARI", "F430 SPIDER", 2006), "ferrari-f430-2004-2009.webp");
  assert.equal(file("FERRARI", "458 ITALIA", 2012), "ferrari-458-2009-2015.webp");
  assert.equal(file("FERRARI", "F8 TRIBUTO", 2021), "ferrari-f8-2019-2023.webp");
  for (const model of ["570GT", "570S", "540C", "600LT"]) {
    assert.equal(file("MCLAREN", model, 2018), "mclaren-570s-2015-2021.webp", model);
  }
  assert.equal(file("MCLAREN", "MP4-12C", 2012), "mclaren-12c-2011-2014.webp");
  assert.equal(file("MCLAREN", "12C SPIDER", 2013), "mclaren-12c-2011-2014.webp");
  assert.equal(file("MCLAREN", "650S", 2015), "mclaren-650s-2014-2017.webp");
  assert.equal(file("MCLAREN", "675LT", 2016), null);
  assert.equal(file("LAMBORGHINI", "HURACÁN EVO", 2020), "lamborghini-huracan-2014-2024.webp");
  assert.equal(file("AUDI", "R8 V10 PLUS", 2017), "audi-r8-mk2-2015-2024.webp");

  assert.equal(file("ASTON MARTIN", "V8 VANTAGE", 2008), "aston-martin-vantage-mk1-2005-2017.webp");
  assert.equal(file("ASTON MARTIN", "V12 VANTAGE S", 2014), "aston-martin-vantage-mk1-2005-2017.webp");
  assert.equal(file("ASTON MARTIN", "DBS SUPERLEGGERA", 2019), "aston-martin-dbs-superleggera-2018-2024.webp");
  assert.equal(file("ASTON MARTIN", "DBX 707", 2023), "aston-martin-dbx-2020-2026.webp");

  assert.equal(file("BENTLEY", "CONTINENTAL FLYING SPUR", 2008), "bentley-flying-spur-mk1-2005-2013.webp");
  assert.equal(file("BENTLEY", "FLYING SPUR V8", 2016), "bentley-flying-spur-mk2-2013-2019.webp");
  assert.equal(file("BENTLEY", "CONTINENTAL GT V8", 2014), "bentley-continental-gt-mk2-2011-2018.webp");
  assert.equal(file("BENTLEY", "CONTINENTAL GTC", 2014), null);
  assert.equal(file("BENTLEY", "CONTINENTAL GT CONVERTIBLE", 2020), null);
  assert.equal(file("BENTLEY", "CONTINENTAL", 2008), null);
  assert.equal(file("BENTLEY", "MULSANNE SPEED", 2016), "bentley-mulsanne-2010-2020.webp");

  assert.equal(file("ROLLS ROYCE", "PHANTOM", 2010), "rolls-royce-phantom-vii-2003-2017.webp");
  assert.equal(file("ROLLS-ROYCE", "PHANTOM DROPHEAD COUPE", 2010), null);
  assert.equal(file("ROLLS-ROYCE", "PHANTOM COUPE", 2010), null);
  assert.equal(file("ROLLS-ROYCE", "GHOST EWB", 2022), "rolls-royce-ghost-mk2-2020-2026.webp");
  assert.equal(file("ROLLS-ROYCE", "CULLINAN BLACK BADGE", 2021), "rolls-royce-cullinan-2018-2026.webp");

  assert.equal(file("MERCEDES-BENZ", "S 580 MAYBACH", 2022), "mercedes-benz-s-class-w223-2021-2026.webp");
  assert.equal(file("MERCEDES-BENZ", "MAYBACH S 680", 2023), "mercedes-benz-s-class-w223-2021-2026.webp");
  assert.equal(file("MERCEDES-MAYBACH", "S 560", 2018), "mercedes-benz-s-class-w222-2013-2020.webp");
  assert.equal(file("MAYBACH", "S 580", 2022), "mercedes-benz-s-class-w223-2021-2026.webp");
  assert.equal(file("MERCEDES-BENZ", "MAYBACH GLS 600", 2022), null);
  assert.equal(file("MERCEDES-MAYBACH", "GLS 600", 2022), null);
  assert.equal(file("MAYBACH", "GLS", 2022), null);
  assert.equal(file("MAYBACH", "62", 2005), null);

  assert.equal(file("LAND ROVER", "RANGE ROVER AUTOBIOGRAPHY", 2008), "land-rover-range-rover-l322-2002-2012.webp");
  assert.equal(file("LAND ROVER", "RANGE ROVER SV AUTOBIOGRAPHY", 2019), "land-rover-range-rover-l405-2013-2021.webp");
});

run("a first registration years after manufacture never picks the generation", () => {
  const imported = resolveVehicleImage({ make: "NISSAN", model: "SILVIA", year: 1993, firstRegistrationDate: "2008-02-01" });
  assert.notEqual(imported.matchedFields.includes("firstRegistration:boundary-period"), true);
  assert.equal(imported.filename, "nissan-silvia-s14-1993-1999.webp");
  const uk = resolveVehicleImage({ make: "NISSAN", model: "SILVIA", year: 1993, firstRegistrationDate: "1993-02-01" });
  assert.equal(uk.filename, "nissan-silvia-s13-1988-1994.webp");
});

run("every catalogue record has its WebP file and no file is orphaned", () => {
  const files = new Set(readdirSync(join(process.cwd(), "public", "cars")));
  const missing = vehicles.filter((v) => !files.has(v.filename));
  const unexpectedMissing = missing.filter((v) => !PENDING_IMAGE_FILENAMES.has(v.filename));
  assert.deepEqual(
    unexpectedMissing.map((v) => v.filename),
    [],
    "catalogue filenames missing from public/cars",
  );
  for (const filename of PENDING_IMAGE_FILENAMES) {
    assert.ok(
      vehicles.some((v) => v.filename === filename),
      `pendingImageFilenames entry not in catalogue: ${filename}`,
    );
    assert.ok(
      !files.has(filename),
      `${filename} exists: remove it from pendingImageFilenames`,
    );
  }
  const referenced = new Set(vehicles.map((v) => v.filename));
  assert.deepEqual(
    [...files].filter((file) => !referenced.has(file)),
    [],
    "public/cars files not referenced by the catalogue",
  );
});

run("catalogue filenames follow the slug and year convention", () => {
  const keys = new Set<string>();
  for (const v of vehicles) {
    assert.match(v.filename, /^[a-z0-9-]+\.webp$/, v.filename);
    assert.ok(
      FILENAMES_WITHOUT_YEARS.has(v.filename) ||
        FILENAMES_WITH_WIDENED_RANGES.has(v.filename) ||
        FILENAMES_WITH_SPECIALIST_BODY_SUFFIX.has(v.filename) ||
        v.priority in SHARED_IMAGE_RECORDS ||
        v.filename.endsWith(`-${v.yearFrom}-${v.yearTo}.webp`),
      v.filename,
    );
    const key = `${v.make}|${v.model}|${v.generation}`.toLowerCase();
    assert.ok(!keys.has(key), `duplicate make/model/generation: ${key}`);
    keys.add(key);
  }
});

const BODY_STATED_MODEL_INPUT: Record<string, string> = {
  "mercedes-benz-eqe-v295-2022-2026.webp": "EQE SALOON",
  "land-rover-defender-110-classic-1983-2016.webp": "DEFENDER 110",
};

run("every record is reachable by make, model and a year in its range", () => {
  const unreachable: string[] = [];
  for (const v of vehicles) {
    let reached = false;
    for (let year = v.yearFrom; year <= v.yearTo && !reached; year++) {
      for (const firstRegistrationDate of [undefined, `${year}-02-01`, `${year}-10-01`]) {
        const result = resolveVehicleImage({
          make: v.make,
          model: BODY_STATED_MODEL_INPUT[v.filename] ?? v.model,
          year,
          firstRegistrationDate,
        });
        if (result.filename === v.filename) {
          reached = true;
          break;
        }
      }
    }
    if (!reached) unreachable.push(v.filename);
  }
  assert.deepEqual(unreachable, []);
});

run("OV64 RYA resolves to Volkswagen CC 2012-2017", () => {
  // OV64 RYA: typical DVSA shape for a 2014 Volkswagen CC.
  const result = resolveVehicleImage({
    make: "VOLKSWAGEN",
    model: "CC",
    year: 2014,
    firstRegistrationDate: "2014-09-01",
  });
  assert.equal(result.filename, "volkswagen-cc-2012-2017.webp");
  assert.equal(matchCatalogModel("VOLKSWAGEN", "CC"), "CC");
  assert.equal(matchCatalogModel("VOLKSWAGEN", "PASSAT CC"), "Passat CC");
  assert.equal(
    resolveVehicleImage({
      make: "VOLKSWAGEN",
      model: "PASSAT CC",
      year: 2010,
      firstRegistrationDate: "2010-05-01",
    }).filename,
    "volkswagen-passat-cc-2008-2012.webp",
  );
});

run("WU18 VLY resolves to Yamaha MT-125 2014-2019", () => {
  const result = resolveVehicleImage({
    make: "YAMAHA",
    model: "MT 125 ABS",
    year: 2018,
    firstRegistrationDate: "2018-03-06",
  });
  assert.equal(result.filename, "yamaha-mt-125-2014-2019.webp");
  assert.equal(matchCatalogModel("YAMAHA", "MT 125 ABS"), "MT-125");
  assert.equal(
    resolveVehicleImage({
      make: "YAMAHA",
      model: "MT-125",
      year: 2021,
    }).filename,
    "yamaha-mt-125-2020-2024.webp",
  );
});

run("G-Class generations stay split by year", () => {
  const file = (year: number) =>
    resolveVehicleImage({
      make: "MERCEDES-BENZ",
      model: "G CLASS",
      year,
      firstRegistrationDate: `${year}-06-01`,
    }).filename;

  assert.equal(file(2005), "mercedes-benz-g-class-w463-1990-2012.webp");
  assert.equal(file(2015), "mercedes-benz-g-class-w463-2012-2018.webp");
  assert.equal(file(2020), "mercedes-benz-g-class-w463a-2018-2024.webp");
  assert.equal(file(2025), "mercedes-benz-g-class-w465-2024-2026.webp");

  for (const model of ["G-CLASS", "G CLASS", "G-WAGEN", "G WAGEN", "G"]) {
    assert.equal(matchCatalogModel("MERCEDES-BENZ", model), "G-Class", model);
  }
});

run("AMG G63 never comes from a generic G-Class string", () => {
  assert.equal(matchCatalogModel("MERCEDES-BENZ", "G 350 D"), "G-Class");
  assert.equal(matchCatalogModel("MERCEDES-BENZ", "G CLASS"), "G-Class");
  assert.equal(matchCatalogModel("MERCEDES-BENZ", "G 63"), "AMG G 63");
  assert.equal(matchCatalogModel("MERCEDES-BENZ", "AMG G63"), "AMG G 63");
  assert.equal(matchCatalogModel("MERCEDES-BENZ", "AMG G 63"), "AMG G 63");

  assert.equal(
    resolveVehicleImage({
      make: "MERCEDES-BENZ",
      model: "G 350 D",
      year: 2020,
    }).filename,
    "mercedes-benz-g-class-w463a-2018-2024.webp",
  );
  assert.equal(
    resolveVehicleImage({
      make: "MERCEDES-BENZ",
      model: "AMG G 63",
      year: 2020,
    }).filename,
    "mercedes-amg-g63-w463a-2018-2024.webp",
  );
  assert.equal(
    resolveVehicleImage({
      make: "MERCEDES-BENZ",
      model: "G 63",
      year: 2025,
    }).filename,
    "mercedes-amg-g63-w465-2024-2026.webp",
  );
});

run("G580 EQ never comes from a generic G-Class string", () => {
  assert.equal(matchCatalogModel("MERCEDES-BENZ", "G 580"), "G 580 EQ");
  assert.equal(matchCatalogModel("MERCEDES-BENZ", "G 580 EQ"), "G 580 EQ");
  assert.equal(matchCatalogModel("MERCEDES-BENZ", "G CLASS"), "G-Class");

  assert.equal(
    resolveVehicleImage({
      make: "MERCEDES-BENZ",
      model: "G 580 EQ TECHNOLOGY",
      year: 2025,
    }).filename,
    "mercedes-benz-g580-eq-2024-2026.webp",
  );
  assert.equal(
    resolveVehicleImage({
      make: "MERCEDES-BENZ",
      model: "G CLASS",
      year: 2025,
    }).filename,
    "mercedes-benz-g-class-w465-2024-2026.webp",
  );
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
  assert.equal(focus!.summary.imageSrc, "/cars/ford-focus-mk4-2018-2022.webp");
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
