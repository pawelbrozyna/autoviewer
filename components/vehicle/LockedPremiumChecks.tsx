import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";
import {
  FULL_REPORT_PRICE,
  PLANNED_FULL_REPORT_FEATURES,
  fullReportHref,
} from "@/lib/full-report";

export function LockedPremiumChecks({
  registration,
}: {
  registration?: string | null;
}) {
  const href = fullReportHref(registration);

  return (
    <section className="rounded-[12px] border border-[#E7D7B5] bg-[#FFF9ED] p-5 md:p-6">
      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#88631E]">
            Planned premium checks
          </p>
          <h2 className="mt-2 text-[22px] font-bold tracking-tight text-navy md:text-[25px]">
            Unlock the Full Report
          </h2>
          <p className="mt-2 text-[28px] font-extrabold text-navy">
            {FULL_REPORT_PRICE}
          </p>
          <p className="mt-2 max-w-md text-[14px] leading-relaxed text-muted">
            Full Reports are not live yet. We are finishing the premium-data
            integrations before launch.
          </p>
        </div>

        <div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {PLANNED_FULL_REPORT_FEATURES.map((feature) => (
              <li key={feature}>
                <Link
                  href={href}
                  className="flex min-h-11 items-center gap-2.5 rounded-[9px] border border-[#E7D7B5] bg-white/75 px-3 py-2 text-[14px] font-semibold text-navy transition hover:border-navy/25 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue"
                >
                  <LockKeyhole
                    className="h-4 w-4 shrink-0 text-[#88631E]"
                    aria-hidden
                  />
                  {feature}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={href}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[9px] bg-navy px-4 py-2.5 text-[15px] font-semibold !text-white transition hover:bg-navy-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 sm:w-auto"
          >
            Unlock Full Report - {FULL_REPORT_PRICE}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
