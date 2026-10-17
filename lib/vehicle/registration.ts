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
 * Best-effort display formatting for common UK plate styles.
 * Examples: AB12CDE -> AB12 CDE, A123BCD -> A123 BCD, 934HRR -> 934 HRR.
 * Falls back to the normalised string when the pattern is unknown.
 */
export function formatRegistrationDisplay(input: string): string {
  const n = normalizeRegistration(input);
  // Current (2001+): AB12 CDE
  if (/^[A-Z]{2}\d{2}[A-Z]{3}$/.test(n)) {
    return `${n.slice(0, 4)} ${n.slice(4)}`;
  }
  // Prefix (1983-2001): A123 BCD
  if (/^[A-Z]\d{1,3}[A-Z]{3}$/.test(n)) {
    const letters = n.match(/[A-Z]+$/)?.[0] ?? "";
    const prefix = n.slice(0, n.length - letters.length);
    return `${prefix} ${letters}`;
  }
  // Suffix (1963-1983): ABC 123A
  if (/^[A-Z]{3}\d{1,3}[A-Z]$/.test(n)) {
    return `${n.slice(0, 3)} ${n.slice(3)}`;
  }
  // Dateless, numbers then letters: 934 HRR, 1234 AB
  if (/^\d{1,4}[A-Z]{1,3}$/.test(n)) {
    const letters = n.match(/[A-Z]+$/)?.[0] ?? "";
    return `${n.slice(0, n.length - letters.length)} ${letters}`;
  }
  // Dateless, letters then numbers: ABC 123, AB 1234
  if (/^[A-Z]{1,3}\d{1,4}$/.test(n)) {
    const digits = n.match(/\d+$/)?.[0] ?? "";
    return `${n.slice(0, n.length - digits.length)} ${digits}`;
  }
  return n;
}

export function registrationToSlug(input: string): string {
  return normalizeRegistration(input);
}
