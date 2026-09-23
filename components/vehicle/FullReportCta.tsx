import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { FULL_REPORT_PRICE, fullReportHref } from "@/lib/full-report";
import { cn } from "@/lib/utils";

export function FullReportCta({
  registration,
  compact = false,
  className,
}: {
  registration?: string | null;
  compact?: boolean;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "rounded-[12px] border border-[#E7D7B5] bg-[#FFF9ED]",
        compact ? "p-4" : "p-5 md:p-6",
        className,
      )}
      aria-label="Full Report upgrade"
    >
      <div
        className={cn(
          "grid gap-4",
          !compact && "md:grid-cols-[minmax(0,1fr)_auto] md:items-center",
        )}
      >
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-navy" aria-hidden />
            <h2 className="text-[18px] font-bold text-navy md:text-[20px]">
              Want the complete vehicle history?
            </h2>
          </div>
          <p className="mt-2 text-[14px] leading-relaxed text-muted md:text-[15px]">
            Full Report is coming soon with planned finance, write-off, stolen,
            keeper and recall checks.
          </p>
        </div>
        <Link
          href={fullReportHref(registration)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[9px] bg-navy px-4 py-2.5 text-[15px] font-semibold !text-white transition hover:bg-navy-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2"
        >
          Unlock Full Report - {FULL_REPORT_PRICE}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </aside>
  );
}
