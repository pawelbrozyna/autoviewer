import Link from "next/link";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { href: string; label: string };
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-5 flex flex-col gap-2 md:mb-6",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-2",
          action && "md:flex-row md:items-end md:justify-between md:gap-6",
        )}
      >
        <div className={cn(align === "center" && "mx-auto max-w-2xl")}>
          {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
          <h2 className="heading-section">{title}</h2>
          {description ? (
            <p className="body-copy mt-2.5 max-w-2xl">{description}</p>
          ) : null}
        </div>
        {action ? (
          <Link
            href={action.href}
            className="shrink-0 text-[15px] font-semibold text-blue hover:text-blue-hover"
          >
            {action.label}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
