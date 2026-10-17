import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

const VEHICLE_COLOUR_SWATCHES: Record<string, string> = {
  beige: "#D8C3A5",
  black: "#111827",
  blue: "#2563EB",
  bronze: "#A97142",
  brown: "#7C4A2D",
  gold: "#D4AF37",
  green: "#16803A",
  grey: "#6B7280",
  gray: "#6B7280",
  maroon: "#7F1D1D",
  orange: "#EA580C",
  purple: "#7E22CE",
  red: "#DC2626",
  silver: "#C5CBD3",
  turquoise: "#0D9488",
  white: "#FFFFFF",
  yellow: "#FACC15",
};

const FALLBACK_SWATCH = "#CBD5E1";

/** Red / yellow / green / blue segments for MULTICOLOUR registered colours. */
export const MULTICOLOUR_SWATCH_BACKGROUND =
  "conic-gradient(from 45deg, #DC2626 0deg 90deg, #FACC15 90deg 180deg, #16803A 180deg 270deg, #2563EB 270deg 360deg)";

function colourKey(colour?: string | null): string {
  return colour?.trim().toLowerCase() ?? "";
}

/** True for MULTICOLOUR / Multi-colour / Multicolor (DVSA variants). */
export function isMulticolourVehicleColour(colour?: string | null): boolean {
  const compact = colourKey(colour).replace(/[\s_-]+/g, "");
  return compact === "multicolour" || compact === "multicolor";
}

/** Swatch for a recognised solid registered colour, or null when unknown. */
export function knownVehicleColourSwatch(colour?: string | null): string | null {
  if (isMulticolourVehicleColour(colour)) return null;
  return VEHICLE_COLOUR_SWATCHES[colourKey(colour)] ?? null;
}

export function vehicleColourSwatch(colour?: string | null): string {
  if (isMulticolourVehicleColour(colour)) return FALLBACK_SWATCH;
  return knownVehicleColourSwatch(colour) ?? FALLBACK_SWATCH;
}

/** Inline style for a colour swatch circle (solid or multicolour conic-gradient). */
export function vehicleColourSwatchStyle(
  colour?: string | null,
): CSSProperties {
  if (isMulticolourVehicleColour(colour)) {
    return { background: MULTICOLOUR_SWATCH_BACKGROUND };
  }
  return { backgroundColor: vehicleColourSwatch(colour) };
}

/** Whether the UI should render a swatch for this colour name. */
export function hasVehicleColourSwatch(colour?: string | null): boolean {
  return (
    isMulticolourVehicleColour(colour) || knownVehicleColourSwatch(colour) != null
  );
}

export function VehicleColour({
  colour,
  className,
  unavailableLabel = "Not available",
}: {
  colour?: string | null;
  className?: string;
  unavailableLabel?: string;
}) {
  const label = colour?.trim() || unavailableLabel;

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className="h-3 w-3 shrink-0 rounded-full border border-slate-400/70"
        style={vehicleColourSwatchStyle(colour)}
        aria-hidden
      />
      <span>{label}</span>
    </span>
  );
}
