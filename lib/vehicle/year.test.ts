/**
 * Vehicle year normalisation.
 * Run: npx tsx lib/vehicle/year.test.ts
 */
import assert from "node:assert/strict";
import { resolveVehicleImage } from "@/lib/vehicle/images";
import { reportVehicleTitle } from "@/lib/vehicle/report-title";
import {
  normalizeVehicleYear,
  resolveVehicleYear,
  rewriteVehicleDateYear,
} from "@/lib/vehicle/year";

const NOW = new Date(2026, 9, 13);

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`PASS  ${name}`);
  } catch (error) {
    console.error(`FAIL  ${name}`);
    throw error;
  }
}

run("1012 becomes 2012 when the plate and registration month agree", () => {
  const normalised = normalizeVehicleYear(
    {
      year: 1012,
      registration: "FJ12 VUE",
      dates: ["1012-07-01"],
    },
    NOW,
  );
  assert.equal(normalised.year, 2012);
  assert.equal(normalised.rawYear, 1012);
  assert.equal(
    rewriteVehicleDateYear("1012-07-01", {
      registration: "FJ12VUE",
      dates: ["1012-07-01"],
    }, NOW),
    "2012-07-01",
  );
  assert.equal(
    rewriteVehicleDateYear("1012-07", { registration: "FJ12 VUE" }, NOW)?.slice(0, 7),
    "2012-07",
  );
});

run("1012 becomes 2012 when another date already says 2012", () => {
  assert.equal(
    normalizeVehicleYear({ year: 1012, dates: ["2012-07-01"] }, NOW).year,
    2012,
  );
  assert.equal(
    resolveVehicleYear([1012, 2012], { dates: ["1012-07-01", "2012-07-01"] }, NOW).year,
    2012,
  );
});

run("2012, 1998 and 2026 stay unchanged", () => {
  assert.equal(normalizeVehicleYear({ year: 2012 }, NOW).year, 2012);
  assert.equal(normalizeVehicleYear({ year: 1998 }, NOW).year, 1998);
  assert.equal(normalizeVehicleYear({ year: 2026 }, NOW).year, 2026);
  assert.equal(normalizeVehicleYear({ year: 1900 }, NOW).year, 1900);
  assert.equal(normalizeVehicleYear({ year: 2027 }, NOW).year, 2027);
  assert.equal(
    normalizeVehicleYear(
      { year: 1998, registration: "FJ12VUE", dates: ["1998-05-01"] },
      NOW,
    ).year,
    1998,
  );
});

run("invalid or unrecoverable years become null", () => {
  const cases: Array<number | string | null | undefined> = [
    null,
    undefined,
    "",
    "0012",
    12,
    1012,
    "1012",
    1023,
    1899,
    999,
    "abcd",
    2028,
  ];
  for (const year of cases) {
    assert.equal(normalizeVehicleYear({ year }, NOW).year, null, String(year));
  }
  assert.equal(rewriteVehicleDateYear("1012-07-01", {}, NOW), null);
  assert.equal(rewriteVehicleDateYear("0012-07-01", { registration: "FJ12VUE" }, NOW), null);
  assert.equal(
    normalizeVehicleYear({ year: 1015, registration: "FJ12VUE", dates: ["1015-07-01"] }, NOW).year,
    null,
  );
  assert.equal(
    normalizeVehicleYear({ year: 1012, registration: "FJ12VUE", dates: ["1012-01-01"] }, NOW).year,
    null,
  );
});

run("corrected year is what the title and image matcher use", () => {
  const normalised = normalizeVehicleYear(
    {
      year: 1012,
      registration: "FJ12VUE",
      dates: ["1012-07-01"],
    },
    NOW,
  );
  assert.equal(
    reportVehicleTitle({
      year: normalised.year,
      make: "Honda",
      model: "Stepwagon",
      modelTitle: "Stepwgn",
      modelVariant: null,
    }).title,
    "2012 Honda Stepwgn",
  );

  const image = resolveVehicleImage({
    registration: "FJ12VUE",
    make: "HONDA",
    model: "STEPWAGON",
    year: 1012,
    firstRegistrationDate: "1012-07-01",
  });
  assert.equal(image.filename, "honda-stepwgn-rk-2009-2015.webp");
  assert.equal(image.record?.priority, 704);
  assert.equal(image.match, "exact");

  const unrecoverable = resolveVehicleImage({
    make: "HONDA",
    model: "STEPWAGON",
    year: 1012,
    firstRegistrationDate: "1012-07-01",
  });
  assert.notEqual(unrecoverable.record?.priority, 704);
});
