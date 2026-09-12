import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Brand wordmark from /public/autoviewer-mark.png (transparent bg). */
export function BrandLogo({
  className,
  href = "/",
  size = "default",
  onNavigate,
}: {
  className?: string;
  href?: string;
  size?: "default" | "header";
  onNavigate?: () => void;
}) {
  const sizeClass =
    size === "header"
      ? "h-[49px] w-[229px]"
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
        className="object-contain object-left"
        sizes={size === "header" ? "229px" : "168px"}
        priority
      />
    </Link>
  );
}
