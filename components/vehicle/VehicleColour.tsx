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

export function vehicleColourSwatch(colour?: string | null): string {
  const key = colour?.trim().toLowerCase() ?? "";
  return VEHICLE_COLOUR_SWATCHES[key] ?? FALLBACK_SWATCH;
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
        style={{ backgroundColor: vehicleColourSwatch(colour) }}
        aria-hidden
      />
      <span>{label}</span>
    </span>
  );
}
