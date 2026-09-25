import Link from "next/link";
import { cn } from "@/lib/utils";

export function Breadcrumbs({
  items,
  className,
}: {
  items: Array<{ label: string; href?: string }>;
  className?: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex h-full items-center",
        className == null && "mb-5 md:mb-6",
        className,
      )}
    >
      <ol className="eyebrow mb-0 flex h-full flex-nowrap items-center gap-1.5 leading-none">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li
              key={`${item.label}-${index}`}
              className="flex items-center gap-1.5 leading-none"
            >
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              {item.href && !isLast ? (
                <Link href={item.href} className="leading-none hover:text-navy">
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn("leading-none", isLast && "text-navy")}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
