import { AlertTriangle, Check } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";

/** Static DEMO illustration for the About page: not a live vehicle score. */
export function AboutBuyerScoreExample() {
  return (
    <aside className="rounded-[12px] border border-border bg-white p-4 md:p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <StatusBadge tone="info">Example only</StatusBadge>
        <span className="text-[12px] font-medium text-muted md:text-[13px]">
          Demo illustration: not a real vehicle
        </span>
      </div>

      <p className="text-[12px] font-semibold uppercase tracking-[0.07em] text-muted md:text-[13px]">
        Buyer score
      </p>
      <div className="mt-1 flex flex-wrap items-baseline gap-2">
        <span className="text-[1.45rem] font-extrabold tracking-tight text-navy md:text-[1.6rem]">
          88/100
        </span>
        <span className="text-[14px] font-semibold text-navy/80 md:text-[15px]">
          Good history
        </span>
      </div>

      <ul className="mt-3.5 space-y-2">
        <li className="flex items-start gap-2 text-[14px] text-navy md:text-[15px]">
          <Check
            className="mt-0.5 h-4 w-4 shrink-0 text-success"
            aria-hidden
            strokeWidth={2.25}
          />
          <span>Consistent mileage history</span>
        </li>
        <li className="flex items-start gap-2 text-[14px] text-navy md:text-[15px]">
          <Check
            className="mt-0.5 h-4 w-4 shrink-0 text-success"
            aria-hidden
            strokeWidth={2.25}
          />
          <span>No recent MOT failures</span>
        </li>
        <li className="flex items-start gap-2 text-[14px] text-navy md:text-[15px]">
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0 text-warning"
            aria-hidden
            strokeWidth={2.25}
          />
          <span>One open safety recall</span>
        </li>
      </ul>
    </aside>
  );
}
