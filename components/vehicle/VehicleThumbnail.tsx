"use client";

import { useState } from "react";
import Image from "next/image";
import { Car } from "lucide-react";
import { cn } from "@/lib/utils";

export function VehicleThumbnail({
  label,
  src,
  className,
  showIllustrationLabel = false,
  light = false,
  variant = "framed",
  imageClassName,
}: {
  label?: string;
  /** Catalogue image path (e.g. `/cars/volkswagen-golf-mk7-5-2017-2020.webp`). Falls back to icon placeholder. */
  src?: string | null;
  className?: string;
  showIllustrationLabel?: boolean;
  light?: boolean;
  /** `bare` = floating catalogue cutout (no frame/bg), for mobile summary. */
  variant?: "framed" | "bare";
  imageClassName?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const hasImage = Boolean(src) && src !== failedSrc;
  const bare = variant === "bare";

  return (
    <div
      className={cn(
        "relative flex w-full items-center justify-center",
        bare
          ? "aspect-[4/3] overflow-visible bg-transparent"
          : "aspect-[4/3] overflow-hidden rounded-[12px] border border-border",
        !bare &&
          (light
            ? "bg-white"
            : "bg-gradient-to-b from-[#eef2f7] to-[#dbe3ee]"),
        className,
      )}
      role="img"
      aria-label={
        label
          ? hasImage
            ? label
            : `Illustration for ${label}`
          : hasImage
            ? "Vehicle"
            : "Vehicle illustration"
      }
    >
      {hasImage && src ? (
        <Image
          src={src}
          alt={label ? label : "Vehicle"}
          fill
          sizes="(max-width: 768px) 185px, 240px"
          className={cn(
            "object-contain",
            bare ? "object-right object-center" : "object-center p-1",
            imageClassName,
          )}
          priority={false}
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <Car
          className={cn(
            "text-navy/30",
            light || bare ? "h-10 w-10" : "h-12 w-12",
          )}
          strokeWidth={1.2}
        />
      )}
      {showIllustrationLabel && !hasImage ? (
        <span className="absolute bottom-2 left-2 rounded bg-white/90 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
          Illustration
        </span>
      ) : null}
    </div>
  );
}
