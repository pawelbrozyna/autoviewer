/** Compact fields (spec rows, stat tiles, comparison cells). */
export const NA = "N/A";
/** Important user-facing fields such as tax or MOT status. */
export const NOT_AVAILABLE = "Not available";
/** The source itself cannot give a reliable answer, e.g. recall status. */
export const DATA_NOT_AVAILABLE = "Data not available";

function isMissing(value?: string | null): boolean {
  return !value || value.trim() === "" || value === "Unknown";
}

/** Display text for tax or MOT status, never "Unknown". */
export function statusLabel(status?: string | null): string {
  return isMissing(status) ? NOT_AVAILABLE : (status as string);
}

/** Display text for a compact field, never "Unknown" or an empty cell. */
export function compactValue(value?: string | number | null): string {
  if (value == null) return NA;
  const text = String(value);
  return isMissing(text) ? NA : text;
}
