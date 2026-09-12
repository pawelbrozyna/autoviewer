/**
 * Format DVLA/DVSA engine capacity (cc) for display.
 * 1498 → "1.5 L", 999 → "1.0 L", 1968 → "2.0 L"
 */
export function formatEngineLitres(cc: number | null | undefined): string | null {
  if (cc == null || !Number.isFinite(cc) || cc <= 0) return null;
  const litres = Math.round(cc / 100) / 10;
  return `${litres.toFixed(1)} L`;
}

export function formatEngineCc(cc: number | null | undefined): string | null {
  if (cc == null || !Number.isFinite(cc) || cc <= 0) return null;
  return `${Math.round(cc).toLocaleString("en-GB")} cc`;
}
