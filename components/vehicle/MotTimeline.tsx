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
  className,
}: {
  tests: MotTest[];
  limit?: number;
  viewAllHref?: string;
  compact?: boolean;
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
        "rounded-[12px] border border-border bg-white",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between border-b border-border",
          compact ? "px-3.5 py-2" : "px-4 py-2.5",
        )}
      >
        <h3 className="text-[15px] font-semibold text-navy">MOT history</h3>
        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="text-[13px] font-semibold text-blue hover:text-blue-hover md:text-[14px]"
          >
            View full history →
          </Link>
        ) : null}
      </div>
      <ul className="divide-y divide-border">
        {visible.length === 0 ? (
          <li className="support-copy px-4 py-5">No MOT tests recorded.</li>
        ) : (
          visible.map((test) => (
            <li
              key={`${test.completedDate}-${test.motTestNumber ?? test.odometerValue}`}
              className={cn(
                "flex items-center justify-between gap-3",
                compact ? "min-h-[48px] px-3.5 py-1.5" : "px-4 py-2.5",
              )}
            >
              <div>
                <div className="text-[14px] font-semibold text-navy md:text-[15px]">
                  {formatDateUk(test.completedDate)}
                </div>
                <div className="text-[13px] text-muted">
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
