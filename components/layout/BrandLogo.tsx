import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Proportionally trimmed transparent AutoViewer wordmark. */
export function BrandLogo({
  className,
  href = "/",
  size = "default",
  align = "left",
  onNavigate,
}: {
  className?: string;
  href?: string;
  size?: "default" | "header";
  /** Image alignment inside the logo box. Use center on standalone/hero placements. */
  align?: "left" | "center";
  onNavigate?: () => void;
}) {
  const sizeClass =
    size === "header"
      ? "h-[26px] w-[119px] md:h-8 md:w-[149px] lg:h-[29px] lg:w-[136px]"
      : "h-[18px] w-[87px] md:h-[23px] md:w-[109px]";

  return (
    <Link
      href={href}
      className={cn("relative inline-block", sizeClass, className)}
      aria-label="AutoViewer home"
      onClick={onNavigate}
    >
      <Image
        src="/autoviewer-mark-optimized.png"
        alt="AutoViewer"
        fill
        quality={100}
        className={cn(
          "object-contain",
          align === "center" ? "object-center" : "object-left",
        )}
        sizes={
          size === "header"
            ? "(min-width: 1024px) 136px, (min-width: 768px) 149px, 119px"
            : "(min-width: 768px) 109px, 87px"
        }
        priority
      />
    </Link>
  );
}
