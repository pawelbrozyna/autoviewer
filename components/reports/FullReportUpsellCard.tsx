import Image from "next/image";
import {
  BadgePoundSterling,
  CarFront,
  ShieldAlert,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { FULL_REPORT_CHECKOUT_PATH, FULL_REPORT_PRICE } from "@/lib/full-report";

const benefits: Array<{ label: string; icon: LucideIcon }> = [
  { label: "Outstanding finance", icon: BadgePoundSterling },
  { label: "Insurance write-off", icon: CarFront },
  { label: "Stolen vehicle", icon: ShieldAlert },
  { label: "Keeper history", icon: Users },
];

export function FullReportUpsellCard({
  registration,
  reportId = null,
  genericSource = "example",
  className = "",
}: {
  /** Null for example/demo reports, so checkout returns to the example page. */
  registration: string | null;
  reportId?: string | null;
  /** Where checkout returns on cancel when there is no registration. */
  genericSource?: "example" | "home";
  className?: string;
}) {
  return (
    <section
      aria-label="Full vehicle report"
      className={`relative overflow-hidden rounded-[18px] border border-[#cfe2f8] bg-[linear-gradient(160deg,#eef6ff_0%,#dcecfe_55%,#c9e2fd_100%)] shadow-[0_10px_30px_rgba(7,26,61,0.08)] ${className}`.trim()}
    >
      <Image
        src="/promo/full-report-banner-desktop.webp"
        alt=""
        fill
        sizes="(min-width: 1024px) 1100px, 1px"
        className="hidden origin-[100%_55%] scale-[1.375] object-contain object-right [mask-image:linear-gradient(to_right,transparent_20%,black_40%)] lg:block"
      />
      <div className="pointer-events-none absolute inset-y-0 left-[25%] right-0 md:hidden">
        <Image
          src="/promo/full-report-banner-mobile.webp"
          alt=""
          fill
          sizes="(max-width: 767px) 75vw, 1px"
          className="origin-[0%_50%] -translate-x-[15px] translate-y-[12px] scale-[1.27] object-cover object-left [mask-image:linear-gradient(to_right,transparent,black_30%)]"
        />
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-1 px-4 pb-2.5 pt-3.5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-x-6 md:px-7 md:pb-5 md:pt-5 lg:pb-3 lg:pt-3">
        <div className="relative z-10 col-span-2 md:col-span-1">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white bg-white/80 px-2.5 py-0.5 text-[12px] font-semibold text-blue md:py-1 lg:py-0">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            Before you buy
          </span>
          <h2
            className="mt-2.5 text-[29px] font-black leading-[1.1] tracking-tight text-navy md:text-[30px] md:font-extrabold lg:mt-1 lg:text-[31px] lg:font-black"
          >
            <span className="hidden md:inline lg:hidden">Get the full car check</span>
            <span className="md:hidden lg:inline">Know before you buy</span>
          </h2>
          <p className="mt-1 text-[15px] leading-snug text-[#3b4a63] lg:mt-0.5">
            <span className="hidden md:inline lg:hidden">A smart final check before buying a used car.</span>
            <span className="md:hidden lg:inline">Finance. Write-offs. Theft. Ownership.</span>
          </p>
        </div>

        <ul className="relative z-10 mt-3 space-y-1 self-center md:col-start-1 md:space-y-2 md:mt-3.5 lg:mt-2 lg:grid lg:w-max lg:grid-cols-2 lg:gap-x-6 lg:gap-y-1.5 lg:space-y-0">
          {benefits.map(({ label, icon: Icon }) => (
            <li key={label} className="flex items-center gap-2 md:gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-blue shadow-[0_1px_2px_rgba(7,26,61,0.08)] md:h-7 md:w-7 lg:h-6 lg:w-6">
                <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" strokeWidth={2} aria-hidden />
              </span>
              <span className="whitespace-nowrap text-[13px] font-semibold leading-tight text-navy min-[400px]:text-[14px] md:text-[15px]">
                {label}
              </span>
            </li>
          ))}
        </ul>

        <div className={`relative -mr-4 mt-3 translate-x-[-6px] max-md:hidden translate-y-[11px] self-center md:absolute md:inset-y-0 md:self-stretch md:right-0 md:mr-0 md:mt-0 md:w-[50%] lg:hidden md:translate-x-0 md:translate-y-0`}>
          <Image
            src="/promo/full-report-upsell-car.webp"
            alt=""
            width={840}
            height={507}
            sizes="(min-width: 768px) 600px, 55vw"
            className="h-auto w-full origin-[28%_50%] scale-[1.5625] md:h-full md:scale-100 md:object-contain md:object-right [mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent_4%,black_24%),linear-gradient(to_bottom,transparent,black_10%,black_88%,transparent)] md:[mask-image:linear-gradient(to_right,transparent,black_14%),linear-gradient(to_bottom,transparent_18%,black_30%,black_72%,transparent_84%)] lg:[mask-image:linear-gradient(to_right,transparent,black_14%),linear-gradient(to_bottom,transparent,black_8%,black_90%,transparent)] [-webkit-mask-composite:source-in]"
          />
        </div>

        <div className="relative z-10 col-span-2 mt-2.5 flex items-center justify-between gap-4 border-t border-white/80 pt-2.5 md:col-span-1 md:col-start-1 md:mt-4 md:justify-start md:gap-6 md:pt-3.5 lg:mt-2 lg:pt-2">
          <p className="text-[28px] font-extrabold leading-none tracking-tight text-navy">
            {FULL_REPORT_PRICE}
          </p>
          <form action={FULL_REPORT_CHECKOUT_PATH} method="post">
            <input type="hidden" name="source" value={registration ? "vehicle" : genericSource} />
            {registration ? (
              <input type="hidden" name="registration" value={registration} />
            ) : null}
            {registration && reportId ? (
              <input type="hidden" name="reportId" value={reportId} />
            ) : null}
            <button
              type="submit"
              className="inline-flex min-h-11 cursor-pointer md:min-h-12 lg:min-h-10 items-center justify-center whitespace-nowrap rounded-[10px] bg-blue px-8 text-[16px] md:px-6 lg:px-10 font-bold text-white shadow-[0_6px_16px_rgba(23,105,224,0.28)] transition hover:bg-blue-hover"
            >
              Buy Full Report
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
