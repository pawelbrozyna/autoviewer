import type { MotTest, VehicleRecord } from "@/types/vehicle";

export const FREE_PDF_PAGE_LIMIT = 2;
export const FREE_MOT_LIMIT = 6;
export const FREE_MILEAGE_LIMIT = 6;
export const FREE_ADVISORY_LIMIT = 4;
export const FREE_SPEC_LIMIT = 10;
/** Paid reports include every row; these are unused for truncation. */
export const PAID_MOT_LIMIT = Number.MAX_SAFE_INTEGER;
export const PAID_MILEAGE_LIMIT = Number.MAX_SAFE_INTEGER;
export const PAID_ADVISORY_LIMIT = Number.MAX_SAFE_INTEGER;
export const PAID_SPEC_LIMIT = Number.MAX_SAFE_INTEGER;

export interface PdfHistorySlice<T> {
  shown: T[];
  hidden: number;
  note: string | null;
}

export function sortMotNewestFirst(tests: MotTest[]): MotTest[] {
  return [...tests].sort(
    (a, b) =>
      new Date(b.completedDate).getTime() -
      new Date(a.completedDate).getTime(),
  );
}

export function sliceNewest<T>(
  items: T[],
  limit: number,
  noteForHidden: (hidden: number, shown: number) => string,
): PdfHistorySlice<T> {
  const shown = items.slice(0, limit);
  const hidden = Math.max(0, items.length - shown.length);
  return {
    shown,
    hidden,
    note: hidden > 0 ? noteForHidden(hidden, shown.length) : null,
  };
}

/** Return every row with no truncation note (Full Report). */
export function allRowsForPdf<T>(items: T[]): PdfHistorySlice<T> {
  return { shown: items, hidden: 0, note: null };
}

export function motRowsForFreePdf(tests: MotTest[]): PdfHistorySlice<MotTest> {
  return sliceNewest(
    sortMotNewestFirst(tests),
    FREE_MOT_LIMIT,
    (hidden) => `+ ${hidden} earlier MOT records available online`,
  );
}

export function motRowsForPaidPdf(tests: MotTest[]): PdfHistorySlice<MotTest> {
  return allRowsForPdf(sortMotNewestFirst(tests));
}

export function mileageRowsForPdf<T>(
  rows: T[],
  limit: number,
): PdfHistorySlice<T> {
  if (!Number.isFinite(limit) || limit >= rows.length) {
    return allRowsForPdf(rows);
  }
  return sliceNewest(
    rows,
    limit,
    (hidden) => `+ ${hidden} earlier mileage readings available online`,
  );
}

export function advisoryRowsForPdf<T>(
  rows: T[],
  limit: number,
): PdfHistorySlice<T> {
  if (!Number.isFinite(limit) || limit >= rows.length) {
    return allRowsForPdf(rows);
  }
  return sliceNewest(
    rows,
    limit,
    (hidden) =>
      `+ ${hidden} further advisories or notes in the online report`,
  );
}

export function collectAdvisories(vehicle: VehicleRecord) {
  return vehicle.motTests
    .slice()
    .sort(
      (a, b) =>
        new Date(b.completedDate).getTime() -
        new Date(a.completedDate).getTime(),
    )
    .flatMap((test) =>
      test.defects.map((defect) => ({
        date: test.completedDate,
        type: defect.type,
        text: defect.text,
        dangerous: defect.dangerous,
      })),
    );
}
