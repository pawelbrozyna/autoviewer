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
  assert.equal(peugeot.src, "/cars/peugeot-208-p21-2019-2026.webp");

  const opel = resolveVehicleImage({
    make: "Opel",
    model: "Corsa-e Ultimate",
    year: 2022,
  });
  assert.equal(opel.src, "/cars/vauxhall-corsa-f-2019-2026.webp");
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
  assert.equal(transitCustom.match, "nearest-generation");
  assert.equal(transitCustom.generation, "Mk1 facelift");
});

run("nearest-generation fallback never crosses into a different generation", () => {
  const cases: Array<[string, string, number]> = [
    ["Volkswagen", "Golf", 1995],
    ["BMW", "1 SERIES", 2008],
    ["BMW", "3 SERIES", 2002],
    ["BMW", "X5", 2015],
    ["BMW", "5 SERIES", 2024],
    ["MERCEDES-BENZ", "E 220", 2006],
    ["FORD", "KA", 2005],
    ["RENAULT", "CLIO", 2003],
    ["VAUXHALL", "VIVARO", 2016],
    ["AUDI", "A4", 2006],
    ["SKODA", "KODIAQ", 2025],
    ["CITROEN", "C3", 2025],
    ["HONDA", "CR-V", 2024],
    ["LAND ROVER", "RANGE ROVER SPORT", 2024],
    ["MG", "ZS", 2025],
    ["TESLA", "MODEL Y", 2025],
  ];
  for (const [make, model, year] of cases) {
    const result = resolveVehicleImage({ make, model, year });
    assert.equal(result.match, "placeholder", `${make} ${model} ${year}`);
    assert.equal(result.src, null, `${make} ${model} ${year}`);
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

run("every catalogue record has its WebP file and no file is orphaned", () => {
  const files = new Set(readdirSync(join(process.cwd(), "public", "cars")));
  const missing = vehicles.filter((v) => !files.has(v.filename));
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
