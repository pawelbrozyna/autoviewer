import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  Calendar,
  CalendarCheck,
  Gauge,
  Globe2,
  Landmark,
  Leaf,
  Palette,
  Settings2,
  Users,
  Zap,
} from "lucide-react";
import { BuyerScore } from "@/components/vehicle/BuyerScore";
import { MileageHistory } from "@/components/vehicle/MileageHistory";
import { MotTimeline } from "@/components/vehicle/MotTimeline";
import { MotResultBadge, TaxStatusBadge } from "@/components/vehicle/StatusBadges";
import { VehicleReportDesktop } from "@/components/vehicle/VehicleReportDesktop";
import { VehicleSummaryMobile } from "@/components/vehicle/VehicleSummaryMobile";
import { Container } from "@/components/ui/Container";
import { ErrorState } from "@/components/ui/EmptyState";
import { getMockVehicle } from "@/lib/api/mock";
import { lookupVehicle } from "@/lib/api/vehicle-service";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { formatDateUk } from "@/lib/utils";
import {
  formatRegistrationDisplay,
  isValidRegistrationFormat,
  normalizeRegistration,
} from "@/lib/vehicle/registration";
import type { VehicleRecord } from "@/types/vehicle";

type PageProps = {
  params: Promise<{ registration: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { registration } = await params;
  const normalized = normalizeRegistration(registration);
  const display = formatRegistrationDisplay(normalized);
  return buildPageMetadata({
    title: `Vehicle check for ${display}`,
    description: `Vehicle history overview for ${display} including MOT, tax, mileage and available recall information.`,
    path: `/vehicle/${normalized}`,
    noIndex: true,
  });
}

export default async function VehicleResultPage({ params }: PageProps) {
  const { registration } = await params;
  const normalized = normalizeRegistration(registration);

  if (!isValidRegistrationFormat(normalized)) {
    return (
      <Container className="section-y">
        <ErrorState
          title="Enter a valid UK registration number."
          description="Registrations should be 2-8 letters and numbers after removing spaces."
        />
      </Container>
    );
  }

  const requestedResult = await lookupVehicle(normalized);
  const result =
    requestedResult.ok &&
    requestedResult.data.summary.registration === "CD34EFG"
      ? { ok: true as const, data: getMockVehicle("AV19SWF")! }
      : requestedResult;

  if (!result.ok) {
    return (
      <Container className="space-y-2.5 pb-8 pt-2 md:space-y-5 md:py-10 lg:py-9">
        <BackLink />
        <ErrorState title={result.error.message} />
      </Container>
    );
  }

  const vehicle = result.data;
  const { summary } = vehicle;

  return (
    <div className="bg-[#F9FBFE] pb-3 md:bg-surface-soft md:pb-14">
      <Container className="pb-4 pt-2 md:py-9">
        <BackLink />

        {/* Mobile: preserve existing result layout */}
        <div className="mt-2 md:hidden">
          <VehicleSummaryMobile
            vehicle={vehicle}
            largerImage
            showDerivative
          />
          <MobileVehicleDetails vehicle={vehicle} />

          <div className="mt-6 space-y-5">
            <SectionCard id="mot-history" title="MOT history">
              <MotTimeline tests={vehicle.motTests} />
              <div className="mt-4 space-y-3">
                {vehicle.motTests.slice(0, 3).map((test) =>
                  test.defects.length > 0 ? (
                    <div
                      key={`${test.completedDate}-defects`}
                      className="rounded-[10px] border border-border bg-surface-soft p-4"
                    >
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="text-[15px] font-semibold text-navy">
                          {formatDateUk(test.completedDate)}
                        </span>
                        <MotResultBadge result={test.testResult} />
                      </div>
                      <ul className="space-y-2">
                        {test.defects.map((defect) => (
                          <li
                            key={`${defect.type}-${defect.text}`}
                            className="support-copy"
                          >
                            <span className="font-semibold text-navy">
                              {defect.type}
                            </span>
                            {" - "}
                            {defect.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null,
                )}
              </div>
            </SectionCard>

            <SectionCard id="mileage-history" title="Mileage history">
              <MileageHistory points={vehicle.mileageHistory} />
            </SectionCard>

            <SectionCard id="tax-information" title="Tax information">
              <div className="flex flex-wrap items-center gap-3">
                <TaxStatusBadge status={summary.tax.status} />
                {summary.tax.dueDate ? (
                  <span className="support-copy">
                    Due date: {formatDateUk(summary.tax.dueDate)}
                  </span>
                ) : null}
              </div>
              <p className="support-copy mt-3">
                Tax and SORN status can change. Confirm before driving or buying.
              </p>
            </SectionCard>

            <SectionCard id="recall-information" title="Recall information">
              {vehicle.recalls.items.length > 0 ? (
                <ul className="space-y-3">
                  {vehicle.recalls.items.map((item) => (
                    <li
                      key={item.title}
                      className="rounded-[10px] border border-warning/20 bg-warning-bg p-4"
                    >
                      <div className="font-semibold text-navy">{item.title}</div>
                      {item.description ? (
                        <p className="support-copy mt-1">{item.description}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="support-copy">
                  No outstanding recalls indicated in available data.
                </p>
              )}
              {vehicle.recalls.sourceNote ? (
                <p className="meta-copy mt-3">{vehicle.recalls.sourceNote}</p>
              ) : null}
            </SectionCard>

            <SectionCard title="Buyer insights">
              <BuyerScore result={vehicle.buyerScore} />
              {vehicle.buyerScore?.reasons?.length ? (
                <ul className="mt-4 list-disc space-y-1 pl-5 support-copy">
                  {vehicle.buyerScore.reasons
                    .filter(
                      (item) =>
                        item.impact !== 0 ||
                        item.type === "insufficient-history",
                    )
                    .map((item) => (
                      <li key={`${item.type}-${item.label}`}>
                        {item.impact !== 0
                          ? `${item.label} (${item.impact > 0 ? "+" : ""}${item.impact})`
                          : item.label}
                      </li>
                    ))}
                </ul>
              ) : null}
              <p className="meta-copy mt-4">
                Buyer Score is an AutoViewer interpretation of available vehicle
                history. It is not a mechanical inspection or guarantee of vehicle
                condition.
              </p>
            </SectionCard>

            <div className="card-surface p-4">
              <h2 className="heading-card">Data notes</h2>
              <ul className="mt-3 space-y-2 support-copy">
                {vehicle.dataQuality.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
              <p className="meta-copy mt-3">
                Sources: {vehicle.dataQuality.sources.join(", ")}
              </p>
            </div>

            <div className="card-surface p-4">
              <h2 className="heading-card">Related checks</h2>
              <ul className="mt-3 space-y-2 text-[15px]">
                <li>
                  <Link
                    href="/mot-history"
                    className="text-blue hover:text-blue-hover"
                  >
                    MOT history checker
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tax-mileage"
                    className="text-blue hover:text-blue-hover"
                  >
                    Tax &amp; mileage check
                  </Link>
                </li>
                <li>
                  <Link
                    href="/compare-cars"
                    className="text-blue hover:text-blue-hover"
                  >
                    Compare cars
                  </Link>
                </li>
                <li>
                  <Link
                    href="/running-costs"
                    className="text-blue hover:text-blue-hover"
                  >
                    Running costs
                  </Link>
                </li>
              </ul>
            </div>

            <div className="rounded-[12px] border border-border bg-white p-4">
              <p className="meta-copy leading-relaxed">
                Outstanding finance, stolen status and write-off categories are
                not provided by DVLA/DVSA free vehicle data and are not shown
                here.
              </p>
            </div>
          </div>
        </div>

        {/* Desktop / tablet-desktop redesign */}
        <div className="mt-5 hidden md:block">
          <VehicleReportDesktop
            vehicle={vehicle}
            ownersLabel={summary.isDemo ? "2" : null}
          />
        </div>
      </Container>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/check-a-vehicle"
      className="inline-flex items-center gap-2 text-[14px] font-semibold text-navy hover:text-blue md:text-[13px]"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to search
    </Link>
  );
}

function MobileVehicleDetails({ vehicle }: { vehicle: VehicleRecord }) {
  const { summary, details } = vehicle;
  const unavailable = "—";
  const fields = [
    {
      label: "Year",
      icon: Calendar,
      value:
        summary.year?.toString() ??
        details.yearOfManufacture?.toString() ??
        unavailable,
    },
    { label: "Colour", icon: Palette, value: details.colour ?? unavailable },
    {
      label: "Engine",
      icon: Gauge,
      value:
        details.engineCapacity != null
          ? `${details.engineCapacity.toLocaleString("en-GB")} cc`
          : unavailable,
    },
    {
      label: "Transmission",
      icon: Settings2,
      value: details.transmission ?? unavailable,
    },
    { label: "Owners", icon: Users, value: unavailable },
    {
      label: "Road tax",
      icon: Landmark,
      value:
        summary.annualRoadTaxGbp != null
          ? `£${summary.annualRoadTaxGbp.toLocaleString("en-GB")} / year`
          : unavailable,
    },
    {
      label: "First registered",
      icon: CalendarCheck,
      value: details.monthOfFirstRegistration ?? unavailable,
    },
    {
      label: "Euro status",
      icon: Globe2,
      value: details.euroStatus ?? unavailable,
    },
    {
      label: "CO₂ emissions",
      icon: Leaf,
      value:
        details.co2Emissions != null
          ? `${details.co2Emissions} g/km`
          : unavailable,
    },
    {
      label: "Power",
      icon: Zap,
      value:
        summary.powerBhp != null ? `${summary.powerBhp} bhp` : unavailable,
    },
  ];

  return (
    <section className="card-surface mt-3.5 p-4">
      <h2 className="text-[1.15rem] font-bold text-navy">Vehicle details</h2>
      <dl className="mt-3 grid grid-cols-2 gap-x-4">
        {fields.map((field, index) => {
          const Icon = field.icon;
          return (
            <div
              key={field.label}
              className={`text-center ${
                index < 2 ? "pb-2.5" : "border-t border-border py-2.5"
              }`}
            >
              <dt className="flex items-center justify-center gap-1 text-[12px] font-medium text-muted">
                <Icon
                  className="h-3.5 w-3.5 shrink-0 text-navy/45"
                  aria-hidden
                />
                {field.label}
              </dt>
              <dd className="mt-0.5 text-[16px] font-semibold text-navy">
                {field.value}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}

function SectionCard({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="card-surface scroll-mt-24 p-4 md:p-5">
      <h2 className="mb-3.5 text-[1.15rem] font-bold text-navy md:text-[1.25rem]">
        {title}
      </h2>
      {children}
    </section>
  );
}
