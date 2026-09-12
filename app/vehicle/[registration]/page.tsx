import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Gauge,
  Landmark,
  ShieldAlert,
} from "lucide-react";
import { BuyerScore } from "@/components/vehicle/BuyerScore";
import { MileageHistory } from "@/components/vehicle/MileageHistory";
import { MotTimeline } from "@/components/vehicle/MotTimeline";
import { MotResultBadge, TaxStatusBadge } from "@/components/vehicle/StatusBadges";
import { VehicleSummaryMobile } from "@/components/vehicle/VehicleSummaryMobile";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Container } from "@/components/ui/Container";
import { ErrorState } from "@/components/ui/EmptyState";
import { lookupVehicle } from "@/lib/api/vehicle-service";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { formatDateUk } from "@/lib/utils";
import { formatMileage } from "@/lib/vehicle/mileage";
import {
  formatRegistrationDisplay,
  isValidRegistrationFormat,
  normalizeRegistration,
} from "@/lib/vehicle/registration";

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

  const result = await lookupVehicle(normalized);

  if (!result.ok) {
    return (
      <Container className="section-y space-y-5">
        <BackLink />
        <ErrorState title={result.error.message} />
      </Container>
    );
  }

  const vehicle = result.data;
  const { summary } = vehicle;

  return (
    <div className="bg-[#F9FBFE] pb-12 md:bg-surface-soft md:pb-14">
      <Container className="py-7 md:py-9">
        <BackLink />

        <div className="mt-5">
          <VehicleSummaryMobile vehicle={vehicle} className="md:hidden" />

          <div className="hidden card-surface p-4 md:block md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[15px] font-semibold tracking-[0.06em] text-navy">
                    {summary.displayRegistration}
                  </p>
                  {summary.isDemo ? (
                    <StatusBadge tone="info">Demo data</StatusBadge>
                  ) : (
                    <StatusBadge tone="neutral">Vehicle information</StatusBadge>
                  )}
                </div>
                <h1 className="mt-2 text-[1.75rem] font-bold tracking-tight text-navy md:text-[2.15rem]">
                  {summary.make} {summary.model}
                </h1>
                <p className="support-copy mt-2">
                  {[summary.year, summary.fuelType, summary.colour, summary.transmission]
                    .filter(Boolean)
                    .join(" · ")}
                  {summary.engineCapacity
                    ? ` · ${summary.engineCapacity.toLocaleString("en-GB")} cc`
                    : ""}
                </p>
              </div>
              <div className="md:min-w-[180px] md:rounded-[10px] md:border md:border-border md:bg-surface-soft md:p-4">
                <BuyerScore result={vehicle.buyerScore} />
              </div>
            </div>

            <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              <StatusCard
                icon={<Landmark className="h-4 w-4" />}
                label="Tax"
                value={<TaxStatusBadge status={summary.tax.status} />}
                hint={
                  summary.tax.dueDate
                    ? `Due ${formatDateUk(summary.tax.dueDate)}`
                    : undefined
                }
              />
              <StatusCard
                icon={<ClipboardList className="h-4 w-4" />}
                label="MOT"
                value={
                  <StatusBadge
                    tone={
                      summary.motStatus.status === "Valid"
                        ? "success"
                        : summary.motStatus.status === "Expired"
                          ? "danger"
                          : "neutral"
                    }
                    icon={
                      summary.motStatus.status === "Valid" ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5" />
                      )
                    }
                  >
                    {summary.motStatus.status}
                  </StatusBadge>
                }
                hint={
                  summary.motStatus.expiryDate
                    ? `Expires ${formatDateUk(summary.motStatus.expiryDate)}`
                    : undefined
                }
              />
              <StatusCard
                icon={<Gauge className="h-4 w-4" />}
                label="Mileage"
                value={
                  <span className="text-base font-bold text-navy">
                    {formatMileage(summary.latestMileage)}
                  </span>
                }
                hint="Latest recorded reading"
              />
              <StatusCard
                icon={<ShieldAlert className="h-4 w-4" />}
                label="Recalls"
                value={
                  summary.recalls.hasOpenRecalls ? (
                    <StatusBadge
                      tone="warning"
                      icon={<AlertTriangle className="h-3.5 w-3.5" />}
                    >
                      {summary.recalls.count} recall
                      {summary.recalls.count === 1 ? "" : "s"}
                    </StatusBadge>
                  ) : (
                    <StatusBadge
                      tone="success"
                      icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                    >
                      None indicated
                    </StatusBadge>
                  )
                }
              />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <SectionCard title="Vehicle overview">
              <dl className="grid gap-3 sm:grid-cols-2">
                <OverviewItem label="Make" value={vehicle.details.make} />
                <OverviewItem label="Model" value={vehicle.details.model} />
                <OverviewItem
                  label="Year"
                  value={vehicle.details.yearOfManufacture?.toString() ?? "-"}
                />
                <OverviewItem
                  label="Fuel"
                  value={vehicle.details.fuelType ?? "-"}
                />
                <OverviewItem
                  label="Colour"
                  value={vehicle.details.colour ?? "-"}
                />
                <OverviewItem
                  label="Engine"
                  value={
                    vehicle.details.engineCapacity
                      ? `${vehicle.details.engineCapacity.toLocaleString("en-GB")} cc`
                      : "-"
                  }
                />
              </dl>
            </SectionCard>

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

            <SectionCard title="Technical details">
              <dl className="grid gap-3 sm:grid-cols-2">
                <OverviewItem
                  label="Euro status"
                  value={vehicle.details.euroStatus ?? "-"}
                />
                <OverviewItem
                  label="CO₂"
                  value={
                    vehicle.details.co2Emissions != null
                      ? `${vehicle.details.co2Emissions} g/km`
                      : "-"
                  }
                />
                <OverviewItem
                  label="First registered"
                  value={vehicle.details.monthOfFirstRegistration ?? "-"}
                />
                <OverviewItem
                  label="Transmission"
                  value={vehicle.details.transmission ?? "-"}
                />
              </dl>
            </SectionCard>

            <SectionCard title="Buyer insights">
              <BuyerScore result={vehicle.buyerScore} />
              {vehicle.buyerScore?.reasons?.length ? (
                <ul className="mt-4 list-disc space-y-1 pl-5 support-copy">
                  {vehicle.buyerScore.reasons
                    .filter((item) => item.impact !== 0 || item.type === "insufficient-history")
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
          </div>

          <aside className="space-y-4">
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
                  <Link href="/mot-history" className="text-blue hover:text-blue-hover">
                    MOT history checker
                  </Link>
                </li>
                <li>
                  <Link href="/tax-mileage" className="text-blue hover:text-blue-hover">
                    Tax &amp; mileage check
                  </Link>
                </li>
                <li>
                  <Link href="/compare-cars" className="text-blue hover:text-blue-hover">
                    Compare cars
                  </Link>
                </li>
                <li>
                  <Link href="/running-costs" className="text-blue hover:text-blue-hover">
                    Running costs
                  </Link>
                </li>
              </ul>
            </div>
            <div className="rounded-[12px] border border-border bg-white p-4">
              <p className="meta-copy leading-relaxed">
                Outstanding finance, stolen status and write-off categories are not
                provided by DVLA/DVSA free vehicle data and are not shown here.
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/check-a-vehicle"
      className="inline-flex items-center gap-2 text-[15px] font-semibold text-navy hover:text-blue"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to search
    </Link>
  );
}

function SectionCard({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
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

function OverviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-border px-3.5 py-2.5">
      <dt className="text-[12px] font-semibold uppercase tracking-wide text-muted md:text-[13px]">
        {label}
      </dt>
      <dd className="mt-1 text-[15px] font-semibold text-navy">{value}</dd>
    </div>
  );
}

function StatusCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-[10px] border border-border bg-surface-soft px-3.5 py-2.5">
      <div className="mb-1.5 flex items-center gap-2 text-muted">
        {icon}
        <span className="text-[12px] font-semibold uppercase tracking-wide md:text-[13px]">
          {label}
        </span>
      </div>
      <div>{value}</div>
      {hint ? <p className="meta-copy mt-1">{hint}</p> : null}
    </div>
  );
}
