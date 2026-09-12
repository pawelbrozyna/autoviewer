/**
 * UK registration helpers.
 * Normalised form is used for URLs and API queries.
 * Display form may include a space for readability.
 */

const ALPHANUM = /[^A-Z0-9]/g;

export function normalizeRegistration(input: string): string {
  return input.trim().toUpperCase().replace(ALPHANUM, "");
}

export function isValidRegistrationFormat(input: string): boolean {
  const normalized = normalizeRegistration(input);
  return normalized.length >= 2 && normalized.length <= 8;
}

/**
 * Best-effort display formatting for common current-style plates (e.g. AB12CDE -> AB12 CDE).
 * Falls back to the normalised string when pattern is unknown.
 */
export function formatRegistrationDisplay(input: string): string {
  const n = normalizeRegistration(input);
  if (/^[A-Z]{2}\d{2}[A-Z]{3}$/.test(n)) {
    return `${n.slice(0, 4)} ${n.slice(4)}`;
  }
  if (/^[A-Z]\d{1,3}[A-Z]{3}$/.test(n)) {
    const letters = n.match(/[A-Z]+$/)?.[0] ?? "";
    const prefix = n.slice(0, n.length - letters.length);
    return `${prefix} ${letters}`;
  }
  if (/^[A-Z]{3}\d{1,3}[A-Z]$/.test(n)) {
    return `${n.slice(0, 3)} ${n.slice(3)}`;
  }
  return n;
}

export function registrationToSlug(input: string): string {
  return normalizeRegistration(input);
}
