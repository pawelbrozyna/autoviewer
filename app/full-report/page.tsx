import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ReportComparison } from "@/components/vehicle/ReportComparison";
import { VehicleThumbnail } from "@/components/vehicle/VehicleThumbnail";
import { getMockVehicle } from "@/lib/api/mock";
import { FULL_REPORT_PRICE } from "@/lib/full-report";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  formatRegistrationDisplay,
  isValidRegistrationFormat,
  normalizeRegistration,
} from "@/lib/vehicle/registration";

export const metadata: Metadata = buildPageMetadata({
  title: "AutoViewer Full Report",
  description:
    "Learn about the planned AutoViewer Full Report and its premium vehicle-history checks.",
  path: "/full-report",
  noIndex: true,
});

type PageProps = {
  searchParams: Promise<{ registration?: string | string[] }>;
};

const fullReportIncludes = [
  { label: "Finance check", icon: "pound" },
  { label: "Write-off history", icon: "warning" },
  { label: "Stolen check", icon: "shield-check" },
  { label: "Previous keepers", icon: "user" },
  { label: "Keeper changes", icon: "history" },
  { label: "Recall check", icon: "clipboard" },
] as const;

export default async function FullReportPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const rawRegistration = Array.isArray(params.registration)
    ? params.registration[0]
    : params.registration;
  const normalized = normalizeRegistration(rawRegistration ?? "");
  const hasRegistration = isValidRegistrationFormat(normalized);
  const displayRegistration = hasRegistration
    ? formatRegistrationDisplay(normalized)
    : "Your vehicle";
  const demoVehicle =
    normalized === "AV19SWF" ? getMockVehicle(normalized) : null;
  const hasImage = Boolean(demoVehicle?.summary.imageSrc);

  return (
    <main className="bg-surface-soft">
      <section className="border-b border-border bg-white py-5 md:py-7">
        <Container>
          <Link
            href={
              hasRegistration
                ? `/vehicle/${encodeURIComponent(normalized)}`
                : "/check-a-vehicle"
            }
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-navy hover:text-blue"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to free report
          </Link>

          <div
            className={`mt-4 grid gap-5 lg:items-center ${
              hasImage
                ? "lg:grid-cols-[minmax(0,1fr)_minmax(300px,420px)]"
                : "lg:grid-cols-[minmax(0,1fr)_320px]"
            }`}
          >
            <div>
              <p className="eyebrow">AutoViewer Full Report</p>
              <h1 className="mt-2 text-[34px] font-bold leading-tight tracking-tight text-navy md:text-[46px]">
                Know more before you buy.
              </h1>
              <p className="body-copy mt-3 max-w-2xl">
                Additional vehicle-history checks in one clear report. Full
                Reports are not available yet.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="inline-flex rounded-[7px] bg-[#FACC35] px-4 py-2 text-[23px] font-extrabold tracking-[0.06em] text-black">
                  {displayRegistration}
                </span>
                <span className="rounded-full border border-[#E7D7B5] bg-[#FFF9ED] px-3 py-1.5 text-[12px] font-bold uppercase tracking-[0.08em] text-[#88631E]">
                  Coming soon
                </span>
              </div>

              {demoVehicle ? (
                <div className="mt-3">
                  <p className="text-[20px] font-bold text-navy">
                    {demoVehicle.summary.make} {demoVehicle.summary.model}
                  </p>
                  <p className="mt-1 text-[14px] text-muted">
                    {demoVehicle.summary.year ?? "Year unavailable"}
                  </p>
                </div>
              ) : null}

              {hasImage ? (
                <div className="mt-5 max-w-md">
                  <PurchaseCard />
                </div>
              ) : null}
            </div>

            {hasImage && demoVehicle?.summary.imageSrc ? (
              <VehicleThumbnail
                label={`${demoVehicle.summary.make} ${demoVehicle.summary.model}`}
                src={demoVehicle.summary.imageSrc}
                variant="bare"
                priority
                className="aspect-[5/4] min-h-[220px] md:min-h-[260px]"
                imageClassName="object-contain object-center p-0 scale-[1.06]"
              />
            ) : (
              <PurchaseCard />
            )}
          </div>
        </Container>
      </section>

      <section className="py-6 md:py-8">
        <Container className="space-y-8 md:space-y-9">
          <section aria-labelledby="full-report-includes">
            <div className="max-w-2xl">
              <p className="eyebrow">Planned checks</p>
              <h2 id="full-report-includes" className="heading-section mt-2">
                What the Full Report will include
              </h2>
              <p className="body-copy mt-2">
                Extra history context beyond the free report, once premium data
                integrations go live.
              </p>
            </div>
            <ul className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {fullReportIncludes.map((item) => (
                <li
                  key={item.label}
                  className="flex min-h-[48px] items-center gap-2.5 rounded-[9px] border border-border bg-white px-3.5 py-2.5"
                >
                  <Image
                    src={`/report-icons/${item.icon}.png`}
                    alt=""
                    width={18}
                    height={18}
                    className="h-[18px] w-[18px] shrink-0 object-contain"
                    unoptimized
                  />
                  <span className="text-[15px] font-semibold text-navy">
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <ReportComparison />
        </Container>
      </section>
    </main>
  );
}

function PurchaseCard() {
  return (
    <div className="rounded-[12px] border border-[#E7D7B5] bg-[#FFF9ED] p-5">
      <div className="flex items-center gap-2">
        <LockKeyhole className="h-5 w-5 text-[#88631E]" aria-hidden />
        <h2 className="text-[18px] font-bold text-navy">Full Report</h2>
      </div>
      <p className="mt-3 text-[34px] font-extrabold text-navy">
        {FULL_REPORT_PRICE}
      </p>
      <p className="mt-1 text-[12px] font-bold uppercase tracking-[0.08em] text-[#88631E]">
        Coming soon
      </p>
      <p className="mt-3 text-[14px] leading-relaxed text-muted">
        Free vehicle reports are available now while Full Reports are being
        prepared.
      </p>
      <button
        type="button"
        disabled
        className="mt-4 inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center rounded-[9px] bg-navy/55 px-4 text-[15px] font-semibold text-white"
      >
        Coming Soon
      </button>
    </div>
  );
}
