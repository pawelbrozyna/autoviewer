/**
 * Builds data/tfl-bus-fleet.json from the TfL fleet annual audit XLSX.
 * Unzip the XLSX first (it is a zip archive), then run:
 *   node scripts/build-tfl-bus-fleet.mjs <unzipped-xlsx-dir>
 *
 * Only image-selection fields are kept. Mappings are conservative: a type
 * without a reviewed entry in IMAGE_BY_TYPE gets image null and the app
 * falls through to the normal image matcher.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SOURCE_FILE = "fleet-list-annual-audit-report-31-march-2026.xlsx";
const SNAPSHOT = "2026-03-31";

/** "chassis|body|deck" -> catalogue filename, or "placeholder" when no image is accurate yet. */
const ENVIRO400_MMC = "alexander-dennis-enviro400-mmc-2014-2026.webp";
const ENVIRO400_CITY = "alexander-dennis-enviro400-city-2015-2026.webp";
const ENVIRO200_MMC = "alexander-dennis-enviro200-mmc-2014-2026.webp";
const GEMINI_2 = "wrightbus-eclipse-gemini-2-2009-2017.webp";
const GEMINI_3 = "wrightbus-eclipse-gemini-3-2013-2026.webp";
const STREETDECK = "wrightbus-streetdeck-mk1-2014-2026.webp";
const STREETLITE = "wrightbus-streetlite-2010-2026.webp";
const EVOSETI = "mcv-evoseti-double-deck-2015-2026.webp";

const IMAGE_BY_TYPE = {
  "Wrightbus GB Kite Electroliner|Wrightbus|single": "wrightbus-gb-kite-electroliner-2021-2026.webp",
  "BYD B11EO2|BYD|double": "byd-bd11-2024-2026.webp",
  "BYD B12E04|BYD|single": "byd-b12-2024-2026.webp",
  "Wrightbus NRM|Wrightbus NRM|double": "wrightbus-new-routemaster-2012-2026.webp",
  "Volvo B5LH|Wrightbus Eclipse Gemini 3|double": GEMINI_3,
  "Volvo B5TL|Wrightbus Eclipse Gemini 3|double": GEMINI_3,
  "Volvo B9TL|Wrightbus Eclipse Gemini 2|double": GEMINI_2,
  "Volvo B5LH|Wrightbus Eclipse Gemini 2|double": GEMINI_2,
  "VDL DB300|Wrightbus Gemini 2|double": GEMINI_2,
  "ADL Enviro 400H|ADL Enviro 400H MMC|double": ENVIRO400_MMC,
  "ADL Enviro 400H Ultra-Cap|ADL Enviro 400H MMC|double": ENVIRO400_MMC,
  "ADL Enviro 400 48v|ADL Enviro 400 MMC|double": ENVIRO400_MMC,
  "ADL Enviro 400|ADL Enviro 400 MMC|double": ENVIRO400_MMC,
  "Volvo B5LH|ADL Enviro 400H MMC|double": ENVIRO400_MMC,
  "ADL Enviro 400H Zeus|ADL Enviro 400H MMC Zeus|double": ENVIRO400_MMC,
  "BYD D8UR-DD|ADL Enviro 400EV City|double": ENVIRO400_CITY,
  "BYD DD|ADL Enviro 400EV City|double": ENVIRO400_CITY,
  "BYD DD EV O/H|ADL Enviro 400EV City|double": ENVIRO400_CITY,
  "BYD D8UR-DD DC|ADL Enviro 400EV City|double": ENVIRO400_CITY,
  "BYD D8UR-DD O/C|ADL Enviro 400EV City|double": ENVIRO400_CITY,
  "ADL Enviro 400H|ADL Enviro 400H City|double": ENVIRO400_CITY,
  "ADL Enviro 400H Ultra-Cap|ADL Enviro 400H City|double": ENVIRO400_CITY,
  "ADL Enviro 400|ADL Enviro 400|double": "alexander-dennis-enviro400-mk1-2005-2015.webp",
  "ADL Enviro 400H|ADL Enviro 400H|double": "alexander-dennis-enviro400-mk1-2005-2015.webp",
  "ADL Enviro 400EV|ADL|double": "alexander-dennis-enviro400ev-2025-2026.webp",
  "ADL Enviro 200|ADL Enviro 200 MMC|single": ENVIRO200_MMC,
  "BYD D8UR|ADL Enviro 200 MMC (EV)|single": ENVIRO200_MMC,
  "BYD D9UR|ADL Enviro 200 MMC (EV)|single": ENVIRO200_MMC,
  "ADL Enviro 200|ADL Enviro 200|single": "alexander-dennis-enviro200-2006-2016.webp",
  "ADL Enviro 100EV|ADL|single": "alexander-dennis-enviro100ev-2023-2026.webp",
  "Volvo B5LH|MCV EvoSeti|double": EVOSETI,
  "Volvo BZL|MCV|double": EVOSETI,
  "Volvo BZL|MCV|single": "mcv-volvo-bzl-single-deck-2022-2026.webp",
  "Wrightbus Streetlite|Wrightbus Streetlite DF|single": STREETLITE,
  "Wrightbus Streetlite|Wrightbus Streetlite WF|single": STREETLITE,
  "Wrightbus Streetlite Max|Wrightbus Streetlite DF|single": STREETLITE,
  "Wrightbus Streetlite MH|Wrightbus Streetlite DF|single": STREETLITE,
  "Wrightbus Electroliner|Wrightbus|double": STREETDECK,
  "Wrightbus Streetdeck Electroliner|Wrightbus|double": STREETDECK,
  "Wrightbus Streetdeck HEV96|Wrightbus Streetdeck|double": STREETDECK,
  "Wrightbus Streetdeck FCEV|Wrightbus Streetdeck FCEV|double": STREETDECK,
  "Optare MetroDecker EV|Optare MetroDecker EV|double": "optare-metrodecker-ev-2018-2026.webp",
  "Switch Metrocity EV|Optare|single": "optare-solo-sr-2012-2020.webp",
  "Mercedes Citaro|Mercedes Citaro K|single": "mercedes-benz-citaro-c2-2011-2026.webp",
};

const dir = process.argv[2];
if (!dir) {
  console.error("Usage: node scripts/build-tfl-bus-fleet.mjs <unzipped-xlsx-dir>");
  process.exit(1);
}

const decode = (value) =>
  value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
const clean = (value) => decode(String(value ?? "")).replace(/\s+/g, " ").trim();

const sharedXml = readFileSync(join(dir, "xl", "sharedStrings.xml"), "utf8");
const strings = [...sharedXml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) =>
  [...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join(""),
);
const sheetXml = readFileSync(join(dir, "xl", "worksheets", "sheet1.xml"), "utf8");
const rows = [...sheetXml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)].map((row) => {
  const cells = {};
  for (const c of row[1].matchAll(/<c r="([A-Z]+)\d+"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
    const value = c[3]?.match(/<v>([\s\S]*?)<\/v>/)?.[1] ?? "";
    cells[c[1]] = /t="s"/.test(c[2]) ? strings[Number(value)] : value;
  }
  return cells;
});

const header = rows.findIndex((r) => clean(r.A) === "Registration Number");
const expected = { A: "Registration Number", H: "Double or Single Deck", J: "Chassis Make and Model", K: "Body Make and Model" };
for (const [column, name] of Object.entries(expected)) {
  if (header < 0 || clean(rows[header][column]) !== name) {
    throw new Error(`Unexpected sheet layout: column ${column} should be "${name}".`);
  }
}

const types = [];
const typeIndex = new Map();
const vehicles = {};
for (const row of rows.slice(header + 1)) {
  const registration = clean(row.A).replace(/\s/g, "").toUpperCase();
  if (!/^[A-Z0-9]{2,8}$/.test(registration)) continue;
  const chassis = clean(row.J);
  const body = clean(row.K);
  const deck = clean(row.H).toLowerCase();
  if (deck !== "single" && deck !== "double") throw new Error(`Bad deck for ${registration}: ${deck}`);
  if (registration in vehicles) throw new Error(`Duplicate registration ${registration}`);
  const key = `${chassis}|${body}|${deck}`;
  if (!typeIndex.has(key)) {
    typeIndex.set(key, types.length);
    types.push({ chassis, body, deck, image: IMAGE_BY_TYPE[key] ?? null });
  }
  vehicles[registration] = typeIndex.get(key);
}

const unusedMappings = Object.keys(IMAGE_BY_TYPE).filter((key) => !typeIndex.has(key));
if (unusedMappings.length) throw new Error(`Mappings not found in data: ${unusedMappings.join(", ")}`);

const registrations = Object.keys(vehicles).sort();
const lines = [
  "{",
  `  "source": "TfL bus fleet annual audit",`,
  `  "sourceFile": ${JSON.stringify(SOURCE_FILE)},`,
  `  "snapshot": ${JSON.stringify(SNAPSHOT)},`,
  `  "count": ${registrations.length},`,
  `  "types": [`,
  types.map((type) => `    ${JSON.stringify(type)}`).join(",\n"),
  "  ],",
  `  "vehicles": {`,
  registrations.map((reg) => `    ${JSON.stringify(reg)}: ${vehicles[reg]}`).join(",\n"),
  "  }",
  "}",
  "",
];
writeFileSync(join(process.cwd(), "data", "tfl-bus-fleet.json"), lines.join("\n"));
console.log(`Wrote ${registrations.length} registrations, ${types.length} types.`);
