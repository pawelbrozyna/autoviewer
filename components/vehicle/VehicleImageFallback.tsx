import Image from "next/image";
import { cn } from "@/lib/utils";

export const VEHICLE_PLACEHOLDER_SRC = "/placeholders/vehicle-placeholder.webp";

/** Placeholder shown when the catalogue has no representative image. Fills its container like a catalogue image. */
export function VehicleImageFallback({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-full w-full", className)}>
      <Image
        src={VEHICLE_PLACEHOLDER_SRC}
        alt="Representative image unavailable"
        fill
        sizes="(max-width: 768px) 60vw, 500px"
        className="object-contain object-center"
      />
    </div>
  );
}
