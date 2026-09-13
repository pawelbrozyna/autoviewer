import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Brand wordmark from /public/autoviewer-mark.png (transparent bg). */
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
      ? "h-[49px] w-[229px] lg:h-[45px] lg:w-[210px]"
      : "h-9 w-[168px]";

  return (
    <Link
      href={href}
      className={cn("relative inline-block", sizeClass, className)}
      aria-label="AutoViewer home"
      onClick={onNavigate}
    >
      <Image
        src="/autoviewer-mark.png"
        alt="AutoViewer"
        fill
        className={cn(
          "object-contain",
          align === "center" ? "object-center" : "object-left",
        )}
        sizes={size === "header" ? "(min-width: 1024px) 210px, 229px" : "168px"}
        priority
      />
    </Link>
  );
}
