const UPPERCASE_WORDS = new Set([
  "AMG", "AWD", "BMW", "CDI", "CNG", "CVT", "DCI", "DS", "DSG", "EV", "FWD",
  "GL", "GLX", "GT", "GTD", "GTE", "GTI", "GTS", "HDI", "HEV", "HSE", "ID",
  "ISG", "JCW", "LE", "LPG", "LWB", "MG", "MHEV", "MINI", "PHEV", "RS", "RWD",
  "SE", "SEAT", "SR", "SRI", "ST", "SUV", "SWB", "SX", "SXI", "TCE", "TDCI",
  "TDI", "TFSI", "TSI", "VW", "XR",
]);

const WORD_OVERRIDES: Record<string, string> = {
  ECOBLUE: "EcoBlue",
  ECOBOOST: "EcoBoost",
  MCLAREN: "McLaren",
  SDRIVE: "sDrive",
  XCEED: "XCeed",
  XDRIVE: "xDrive",
};

function formatWordPart(part: string): string {
  if (!/[A-Z]/.test(part)) return part;
  const override = WORD_OVERRIDES[part];
  if (override) return override;
  if (/\d/.test(part) || UPPERCASE_WORDS.has(part)) return part;
  const letters = part.replace(/[^A-Z]/g, "");
  if (letters.length <= 1 || !/[AEIOUY]/.test(letters)) return part;
  return part.toLowerCase().replace(/[a-z]/, (c) => c.toUpperCase());
}

/**
 * Title-cases all-caps text from government APIs ("VAUXHALL ASTRA" to "Vauxhall Astra")
 * while keeping acronyms, codes and trims like BMW, XC90, ISG or 6X2/2 intact.
 * Mixed-case input is returned unchanged.
 */
export function formatVehicleText(value: string): string;
export function formatVehicleText(value: string | null): string | null;
export function formatVehicleText(value: string | null): string | null {
  if (!value || value !== value.toUpperCase() || !/[A-Z]/.test(value)) {
    return value;
  }
  return value
    .trim()
    .split(/(\s+|-|\/)/)
    .map(formatWordPart)
    .join("");
}
