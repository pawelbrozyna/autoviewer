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
  priority = false,
}: {
  label?: string;
  /** Catalogue image path (e.g. `/cars/volkswagen-golf-mk7-5-2017-2020.webp`). Falls back to icon placeholder. */
  src?: string | null;
  className?: string;
  showIllustrationLabel?: boolean;
  light?: boolean;
  /** `bare` = floating cutout. `hero` = larger staged presentation for report summary. */
  variant?: "framed" | "bare" | "hero";
  imageClassName?: string;
  priority?: boolean;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const hasImage = Boolean(src) && src !== failedSrc;
  const bare = variant === "bare";
  const hero = variant === "hero";

  return (
    <div
      className={cn(
        "relative flex w-full items-center justify-center",
        bare
          ? "aspect-[4/3] overflow-visible bg-transparent"
          : hero
            ? "aspect-[5/4] overflow-hidden rounded-[14px] border border-border bg-white"
            : "aspect-[4/3] overflow-hidden rounded-[12px] border border-border",
        !bare &&
          !hero &&
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
          alt={label ? `Illustrative image of ${label}` : "Illustrative vehicle image"}
          fill
          sizes={
            hero
              ? "(max-width: 768px) 100vw, 380px"
              : "(max-width: 768px) 185px, 240px"
          }
          className={cn(
            "object-contain",
            bare
              ? "object-right object-center"
              : hero
                ? "object-center p-3 scale-[1.02]"
                : "object-center p-1",
            imageClassName,
          )}
          priority={priority}
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <Car
          className={cn(
            "text-navy/30",
            hero ? "h-16 w-16" : light || bare ? "h-10 w-10" : "h-12 w-12",
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
