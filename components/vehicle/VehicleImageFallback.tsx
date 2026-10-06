import Image from "next/image";
import { cn } from "@/lib/utils";

/** Designed empty state for when the catalogue has no representative image. Scales with its container. */
export function VehicleImageFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "@container flex h-full w-full flex-col items-center justify-center text-center",
        className,
      )}
    >
      <Image
        src="/placeholders/vehicle-placeholder.webp"
        alt=""
        width={640}
        height={288}
        sizes="(max-width: 768px) 60vw, 420px"
        className="h-auto w-[94%] max-w-[440px] opacity-90"
      />
      <p className="mt-[clamp(2px,1.5cqw,8px)] text-[clamp(8px,4.4cqw,15px)] font-semibold leading-tight text-[#4f5f77] @max-[120px]:hidden">
        Representative image
      </p>
      <p className="mt-0.5 text-[clamp(7px,3.4cqw,12px)] leading-tight text-[#8d9bb0] @max-[120px]:hidden">
        Unavailable
      </p>
    </div>
  );
}
