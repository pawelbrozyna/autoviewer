import { cn } from "@/lib/utils";
import type { VehicleSummary } from "@/types/vehicle";

export function VehicleImageCaption({
  summary,
  className,
}: {
  summary: VehicleSummary;
  className?: string;
  /** @deprecated Kept for call-site compat. */
  stackColourOnMobile?: boolean;
}) {
  if (!summary.imageSrc) return null;

  const colour = summary.colour?.trim() || "Not available";

  return (
    <p
      className={cn(
        "text-center text-[10px] leading-snug text-muted md:text-[11px]",
        className,
      )}
    >
      Illustrative image. Registered colour:{" "}
      <strong className="font-bold text-navy">{colour}</strong>.
    </p>
  );
}
