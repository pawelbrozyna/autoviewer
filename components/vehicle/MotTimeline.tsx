import Link from "next/link";
import { MotResultBadge } from "@/components/vehicle/StatusBadges";
import { cn, formatDateUk } from "@/lib/utils";
import { formatMileage } from "@/lib/vehicle/mileage";
import type { MotTest } from "@/types/vehicle";

export function MotTimeline({
  tests,
  limit,
  viewAllHref,
  compact = false,
  title = "MOT history",
  className,
}: {
  tests: MotTest[];
  limit?: number;
  viewAllHref?: string;
  compact?: boolean;
  title?: string;
  className?: string;
}) {
  const sorted = [...tests].sort(
    (a, b) =>
      new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime(),
  );
  const visible = typeof limit === "number" ? sorted.slice(0, limit) : sorted;

  return (
    <div
      className={cn(
        "rounded-[10px] border border-border bg-white",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between border-b border-border",
          compact ? "px-2.5 py-1.5" : "px-3.5 py-2",
        )}
      >
        <h3
          className={cn(
            "font-semibold text-navy",
            compact ? "text-[12px]" : "text-[15px]",
          )}
        >
          {title}
        </h3>
        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className={cn(
              "font-semibold text-blue hover:text-blue-hover",
              compact ? "text-[11px]" : "text-[13px] md:text-[14px]",
            )}
          >
            View full history →
          </Link>
        ) : null}
      </div>
      <ul className="divide-y divide-border">
        {visible.length === 0 ? (
          <li className="support-copy px-3 py-4">No MOT tests recorded.</li>
        ) : (
          visible.map((test) => (
            <li
              key={`${test.completedDate}-${test.motTestNumber ?? test.odometerValue}`}
              className={cn(
                "flex items-center justify-between gap-2",
                compact ? "min-h-[40px] px-2.5 py-1" : "px-3.5 py-2",
              )}
            >
              <div>
                <div
                  className={cn(
                    "font-semibold text-navy",
                    compact ? "text-[12px]" : "text-[14px] md:text-[15px]",
                  )}
                >
                  {formatDateUk(test.completedDate)}
                </div>
                <div
                  className={cn(
                    "text-muted",
                    compact ? "text-[11px]" : "text-[13px]",
                  )}
                >
                  {formatMileage(test.odometerValue, test.odometerUnit ?? "mi")}
                </div>
              </div>
              <MotResultBadge result={test.testResult} />
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
