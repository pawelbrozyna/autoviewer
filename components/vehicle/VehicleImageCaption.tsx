import { cn } from "@/lib/utils";
import type { VehicleSummary } from "@/types/vehicle";

export function VehicleImageCaption({
  summary,
  className,
  stackColourOnMobile = false,
}: {
  summary: VehicleSummary;
  className?: string;
  stackColourOnMobile?: boolean;
}) {
  if (!summary.imageSrc) return null;

  const colour = summary.colour?.trim() || "Not available";
  const colourLabel = summary.isDemo
    ? "Recorded colour:"
    : "DVLA recorded colour:";

  return (
    <p
      className={cn(
        "text-[11px] leading-snug text-muted md:text-[12px]",
        className,
      )}
    >
      Illustrative image - colour and specification may differ.{" "}
      <span
        className={cn(
          "text-navy/75",
          stackColourOnMobile && "block md:inline",
        )}
      >
        {colourLabel} <strong className="font-bold text-navy">{colour}</strong>.
      </span>
    </p>
  );
}
