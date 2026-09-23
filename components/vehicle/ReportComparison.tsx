import { Check, LockKeyhole } from "lucide-react";
import {
  FREE_REPORT_FEATURES,
  FULL_REPORT_PRICE,
  PLANNED_FULL_REPORT_FEATURES,
} from "@/lib/full-report";

export function ReportComparison() {
  return (
    <section aria-labelledby="report-comparison-title">
      <div className="text-center">
        <p className="eyebrow">Compare reports</p>
        <h2 id="report-comparison-title" className="heading-section mt-2">
          Free report or Full Report
        </h2>
        <p className="body-copy mx-auto mt-2 max-w-2xl">
          The free report stays useful. The planned Full Report adds premium
          history checks when those data integrations go live.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-[12px] border border-border bg-white p-5 md:p-6">
          <h3 className="text-[20px] font-bold text-navy">Free Report</h3>
          <p className="mt-1 text-[14px] text-muted">
            Public and available vehicle information
          </p>
          <ul className="mt-4 space-y-2.5">
            {FREE_REPORT_FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2 text-[15px] text-navy"
              >
                <Check className="h-4 w-4 shrink-0 text-success" aria-hidden />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[12px] border border-[#E7D7B5] bg-[#FFF9ED] p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-[20px] font-bold text-navy">
              Full Report - {FULL_REPORT_PRICE}
            </h3>
            <span className="rounded-full border border-[#E7D7B5] bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#88631E]">
              Coming soon
            </span>
          </div>
          <p className="mt-1 text-[14px] text-muted">
            Everything in Free, plus these planned premium checks
          </p>
          <ul className="mt-4 space-y-2.5">
            {PLANNED_FULL_REPORT_FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2 text-[15px] text-navy"
              >
                <LockKeyhole
                  className="h-4 w-4 shrink-0 text-[#88631E]"
                  aria-hidden
                />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
