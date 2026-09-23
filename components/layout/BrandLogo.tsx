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
      ? "h-8 w-[149px] lg:h-[29px] lg:w-[136px]"
      : "h-[23px] w-[109px]";

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
        sizes={size === "header" ? "(min-width: 1024px) 136px, 149px" : "109px"}
        priority
      />
    </Link>
  );
}
