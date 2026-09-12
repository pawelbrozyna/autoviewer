import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Shared mobile hero wash (no photo). Used on home + all subpage heroes.
 */
export function HeroMobileGradient({ className }: { className?: string }) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 md:hidden", className)}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[linear-gradient(165deg,#eef3f8_0%,#f4f6f9_38%,#f9fbfe_72%,#ffffff_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_100%_0%,rgba(23,105,224,0.08)_0%,transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_0%_100%,rgba(7,26,61,0.04)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(244,246,249,0.95)_0%,rgba(249,251,254,0.55)_28%,transparent_55%)]" />
    </div>
  );
}

/**
 * Shared decorative hero backdrop.
 * Mobile: gradient only. Desktop: header.png + washes.
 */
export function ToolHeroBackdrop({
  intensity = "subtle",
}: {
  intensity?: "subtle" | "home";
}) {
  const isHome = intensity === "home";

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        isHome ? "bg-[#f4f6f9]" : "bg-white",
      )}
      aria-hidden="true"
    >
      <HeroMobileGradient />

      <div className="absolute inset-0 hidden md:block">
        <div
          className={cn(
            "absolute -bottom-[24%] right-0 h-[185%] w-full",
            !isHome && "opacity-[0.25]",
          )}
        >
          <Image
            src="/header.png"
            alt=""
            fill
            sizes="70vw"
            className="object-contain object-right-bottom"
            priority={false}
          />
        </div>

        {isHome ? (
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/88 to-transparent" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-white/[0.93] via-white/40 to-white/15" />
        )}
      </div>
    </div>
  );
}
