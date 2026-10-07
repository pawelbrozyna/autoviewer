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
    ["Volkswagen", "Golf", 1995],
    ["BMW", "1 SERIES", 2008],
    ["BMW", "3 SERIES", 2002],
    ["BMW", "X5", 2015],
    ["MERCEDES-BENZ", "E 220", 2006],
    ["FORD", "KA", 2005],
    ["RENAULT", "CLIO", 2003],
    ["AUDI", "A4", 2006],
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
    year: 1990,
  });
  assert.equal(result.match, "placeholder");
  assert.equal(result.record, null);
  assert.match(result.reason, /safe 3-year fallback limit/i);
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
    ["VOLKSWAGEN", "PASSAT CC", 2010],
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

run("short DVSA name matches a single longer catalogue model", () => {
  assert.equal(matchCatalogModel("Vauxhall", "COMBO"), "Combo Cargo");
  assert.equal(matchCatalogModel("Vauxhall", "COMBO 2300 DYNAMIC TD"), "Combo Cargo");
  const combo = resolveVehicleImage({ make: "VAUXHALL", model: "COMBO 2300 DYNAMIC TD", year: 2020 });
  assert.equal(combo.src, "/cars/vauxhall-combo-cargo-e-2018-2026.webp");
  assert.equal(combo.confidence, "medium");
  assert.equal(
    resolveVehicleImage({ make: "VAUXHALL", model: "COMBO", year: 2016 }).src,
    "/cars/vauxhall-combo-cargo-d-2012-2018.webp",
  );
  assert.equal(
    resolveVehicleImage({ make: "VAUXHALL", model: "COMBO", year: 2010 }).match,
    "placeholder",
    "Combo C predates every Combo Cargo generation",
  );
});

run("short names never guess when unsafe or ambiguous", () => {
  assert.equal(matchCatalogModel("Land Rover", "RANGE"), null);
  assert.equal(matchCatalogModel("Land Rover", "RANGE ROVER"), "Range Rover");
  assert.equal(matchCatalogModel("Vauxhall", "COMBO LIFE ENERGY"), null);
  assert.equal(matchCatalogModel("Yamaha", "TRACER 9"), null);
  assert.equal(matchCatalogModel("Kawasaki", "VERSYS 1000"), null);
  assert.equal(matchCatalogModel("Ford", "MUSTANG"), null);
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
      assert.equal(result.match, "placeholder", `${model} ${year}`);
      assert.notEqual(result.src, "/cars/mg-zs-mk2-2024-2026.webp", `${model} ${year}`);
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

run("Lexus IS numbers without a space resolve to IS", () => {
  for (const model of ["IS200", "IS250", "IS300", "IS350", "IS300H F SPORT", "IS 300"]) {
    assert.equal(matchCatalogModel("LEXUS", model), "IS", model);
  }
  assert.equal(matchCatalogModel("LEXUS", "IS220D"), null);
  assert.equal(matchCatalogModel("LEXUS", "IS F"), "IS");
  assert.equal(matchCatalogModel("LEXUS", "NX 300H"), "NX");
});

const FIRST_PENDING_IMAGE_PRIORITY = 601;

run("every catalogue record has its WebP file and no file is orphaned", () => {
  const files = new Set(readdirSync(join(process.cwd(), "public", "cars")));
  const missing = vehicles.filter(
    (v) => !files.has(v.filename) && v.priority < FIRST_PENDING_IMAGE_PRIORITY,
  );
  assert.deepEqual(
    missing.map((v) => v.filename),
    [],
    "catalogue filenames missing from public/cars",
  );
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
      v.filename.endsWith(`-${v.yearFrom}-${v.yearTo}.webp`),
      v.filename,
    );
    const key = `${v.make}|${v.model}|${v.generation}`.toLowerCase();
    assert.ok(!keys.has(key), `duplicate make/model/generation: ${key}`);
    keys.add(key);
  }
});

run("every record is reachable by make, model and a year in its range", () => {
  const unreachable: string[] = [];
  for (const v of vehicles) {
    let reached = false;
    for (let year = v.yearFrom; year <= v.yearTo && !reached; year++) {
      for (const firstRegistrationDate of [undefined, `${year}-02-01`, `${year}-10-01`]) {
        const result = resolveVehicleImage({
          make: v.make,
          model: v.model,
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
