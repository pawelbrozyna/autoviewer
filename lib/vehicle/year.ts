import { normalizeRegistration } from "@/lib/vehicle/registration";

/**
 * Registration and manufacture years for AutoViewer.
 *
 * A year from 1900 through the current year + 1 is kept as recorded, including
 * historic vehicles. DVSA sometimes stores a 2000s date with the thousands
 * digit changed from 2 to 1, such as "1012-07-01" for July 2012. That one
 * pattern can be repaired only when the shifted year is itself inside the
 * valid window and an independent source agrees: another field that already
 * has that year, or a current-style UK plate age identifier whose issue window
 * contains it. Adding 1000 to every invalid year is intentionally not done.
 * Anything else below 1900, or too far in the future, becomes null.
 */

export const MIN_VEHICLE_YEAR = 1900;

export type VehicleYearEvidence = {
  registration?: string | null;
  /** Registration, manufacture, or first-used dates from the source record. */
  dates?: Array<string | null | undefined>;
  /** Years from other fields. A valid one can confirm a repair. */
  corroboratingYears?: Array<number | string | null | undefined>;
};

export type VehicleYearInput = VehicleYearEvidence & {
  year?: number | string | null;
};

export type NormalizedVehicleYear = {
  year: number | null;
  /** Source year before repair. Null when the source had no year. */
  rawYear: number | null;
};

type PlateAge = {
  years: number[];
  monthsByYear: ReadonlyMap<number, readonly number[]>;
};

export function maximumVehicleYear(now: Date = new Date()): number {
  return now.getFullYear() + 1;
}

export function isPlausibleVehicleYear(year: number, now: Date = new Date()): boolean {
  return Number.isInteger(year) && year >= MIN_VEHICLE_YEAR && year <= maximumVehicleYear(now);
}

export function parseVehicleYear(value: number | string | null | undefined): number | null {
  if (typeof value === "number") return Number.isInteger(value) ? value : null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const year = Number.parseInt(trimmed, 10);
  return Number.isInteger(year) ? year : null;
}

/** Leading year of a source date. Does not repair impossible years. */
export function yearFromVehicleDate(value?: string | null): number | null {
  const match = value?.trim().match(/^(\d{4})(?!\d)/);
  if (!match) return null;
  const year = Number.parseInt(match[1], 10);
  return Number.isInteger(year) ? year : null;
}

function monthFromVehicleDate(value?: string | null): number | null {
  const match = value?.trim().match(/^\d{4}[-./](\d{1,2})(?!\d)/);
  if (!match) return null;
  const month = Number.parseInt(match[1], 10);
  return month >= 1 && month <= 12 ? month : null;
}

/**
 * Current-style plates (two letters, two age digits, three letters).
 * 01-49 are March-August of that year. 51-99 are September of that year
 * through February of the next. 00 and 50 were not issued.
 */
function currentStylePlateAge(registration?: string | null): PlateAge | null {
  const normalized = normalizeRegistration(registration ?? "");
  const match = normalized.match(/^[A-Z]{2}(\d{2})[A-Z]{3}$/);
  if (!match) return null;
  const ageId = Number.parseInt(match[1], 10);
  if (ageId >= 1 && ageId <= 49) {
    const year = 2000 + ageId;
    return { years: [year], monthsByYear: new Map([[year, [3, 4, 5, 6, 7, 8]]]) };
  }
  if (ageId >= 51 && ageId <= 99) {
    const startYear = 2000 + (ageId - 50);
    return {
      years: [startYear, startYear + 1],
      monthsByYear: new Map([
        [startYear, [9, 10, 11, 12]],
        [startYear + 1, [1, 2]],
      ]),
    };
  }
  return null;
}

function monthsRecordedForYear(
  dates: Array<string | null | undefined> | undefined,
  rawYear: number,
): number[] {
  const months: number[] = [];
  for (const date of dates ?? []) {
    if (yearFromVehicleDate(date) !== rawYear) continue;
    const month = monthFromVehicleDate(date);
    if (month != null) months.push(month);
  }
  return months;
}

function plateConfirmsYear(
  registration: string | null | undefined,
  candidate: number,
  months: readonly number[],
): boolean {
  const age = currentStylePlateAge(registration);
  if (!age?.years.includes(candidate)) return false;
  if (months.length === 0) return true;
  const allowed = age.monthsByYear.get(candidate);
  return allowed != null && months.every((month) => allowed.includes(month));
}

function listedPlausibleYears(evidence: VehicleYearEvidence, now: Date): number[] {
  const found: number[] = [];
  const push = (year: number | null) => {
    if (year == null || !isPlausibleVehicleYear(year, now) || found.includes(year)) return;
    found.push(year);
  };
  for (const value of evidence.corroboratingYears ?? []) push(parseVehicleYear(value));
  for (const date of evidence.dates ?? []) push(yearFromVehicleDate(date));
  return found;
}

/**
 * 1xxx -> 2xxx, and only when 2xxx is a plausible vehicle year confirmed by
 * another field or by the plate age identifier. 0012, 12, 1899 and similar
 * values are not repaired.
 */
function repairMalformedYear(
  rawYear: number,
  evidence: VehicleYearEvidence,
  now: Date,
): number | null {
  if (!Number.isInteger(rawYear) || rawYear < 1000 || rawYear >= MIN_VEHICLE_YEAR) return null;
  const shifted = rawYear + 1000;
  if (!isPlausibleVehicleYear(shifted, now)) return null;
  if (listedPlausibleYears(evidence, now).includes(shifted)) return shifted;
  const months = monthsRecordedForYear(evidence.dates, rawYear);
  return plateConfirmsYear(evidence.registration, shifted, months) ? shifted : null;
}

export function normalizeVehicleYear(
  source: VehicleYearInput,
  now: Date = new Date(),
): NormalizedVehicleYear {
  const rawYear = parseVehicleYear(source.year);
  if (rawYear == null) return { year: null, rawYear: null };
  if (isPlausibleVehicleYear(rawYear, now)) return { year: rawYear, rawYear };
  return { year: repairMalformedYear(rawYear, source, now), rawYear };
}

/**
 * Prefer the first already-valid year. Otherwise repair the first malformed
 * year that other supplied years or the registration can confirm.
 */
export function resolveVehicleYear(
  candidates: Array<number | string | null | undefined>,
  evidence: VehicleYearEvidence = {},
  now: Date = new Date(),
): NormalizedVehicleYear {
  const parsed = candidates
    .map((value) => parseVehicleYear(value))
    .filter((year): year is number => year != null);
  if (parsed.length === 0) return { year: null, rawYear: null };

  const plausible = parsed.find((year) => isPlausibleVehicleYear(year, now));
  if (plausible != null) return { year: plausible, rawYear: parsed[0] };

  for (const rawYear of parsed) {
    const year = repairMalformedYear(
      rawYear,
      {
        ...evidence,
        corroboratingYears: [...(evidence.corroboratingYears ?? []), ...parsed],
      },
      now,
    );
    if (year != null) return { year, rawYear };
  }

  return { year: null, rawYear: parsed[0] };
}

/**
 * Rewrite a source date's year, or return null when that year is impossible
 * and cannot be repaired. The rest of the string, including the month, stays.
 */
export function rewriteVehicleDateYear(
  value: string | null | undefined,
  evidence: VehicleYearEvidence = {},
  now: Date = new Date(),
): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const rawYear = yearFromVehicleDate(trimmed);
  if (rawYear == null) return null;
  const normalised = normalizeVehicleYear(
    {
      year: rawYear,
      registration: evidence.registration,
      dates: [trimmed, ...(evidence.dates ?? [])],
      corroboratingYears: evidence.corroboratingYears,
    },
    now,
  );
  if (normalised.year == null) return null;
  if (normalised.year === rawYear) return trimmed;
  return trimmed.replace(/^\d{4}/, String(normalised.year));
}
