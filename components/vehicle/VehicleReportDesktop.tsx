import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import {
  AlertTriangle,
  BarChart3,
  Car,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Gauge,
  Landmark,
  Lightbulb,
  List,
  Settings2,
  ShieldAlert,
} from "lucide-react";
import { BuyerScore } from "@/components/vehicle/BuyerScore";
import { MileageHistory } from "@/components/vehicle/MileageHistory";
import { MotTimeline } from "@/components/vehicle/MotTimeline";
import { MotResultBadge, TaxStatusBadge } from "@/components/vehicle/StatusBadges";
import { ScoreGauge } from "@/components/vehicle/ScoreGauge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { VehicleColour } from "@/components/vehicle/VehicleColour";
import { VehicleImageCaption } from "@/components/vehicle/VehicleImageCaption";
import { VehicleThumbnail } from "@/components/vehicle/VehicleThumbnail";
import { formatDateUk, cn } from "@/lib/utils";
import {
  buyerScoreBandLabel,
  buyerScoreInsufficientMessage,
} from "@/lib/vehicle/score";
import type { VehicleRecord } from "@/types/vehicle";

function CardShell({
  id,
  title,
  icon: Icon,
  action,
  children,
  className,
}: {
  id?: string;
  title: string;
  icon?: ComponentType<{ className?: string; strokeWidth?: number }>;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "card-surface scroll-mt-24 p-3",
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-[14px] font-bold text-navy md:text-[15px]">
          {Icon ? (
            <Icon className="h-3.5 w-3.5 shrink-0 text-blue" strokeWidth={2} />
          ) : null}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border py-1.5 last:border-b-0">
      <dt className="shrink-0 text-[13px] text-muted">{label}</dt>
      <dd className="min-w-0 text-right text-[14px] font-semibold text-navy">
        {value}
      </dd>
    </div>
  );
}

export function VehicleReportDesktop({
  vehicle,
  ownersLabel,
  summaryOnly = false,
  highlightRegistration = false,
  stretchMotHistory = false,
  showUnavailableStats = false,
  afterSummary,
}: {
  vehicle: VehicleRecord;
  /** Only pass when owners are known (e.g. demo). Omit / null hides the column. */
  ownersLabel?: string | null;
  summaryOnly?: boolean;
  highlightRegistration?: boolean;
  stretchMotHistory?: boolean;
  showUnavailableStats?: boolean;
  afterSummary?: ReactNode;
}) {
  const { summary, details, buyerScore, motTests, mileageHistory, recalls } =
    vehicle;

  const scoreValue =
    buyerScore?.score != null ? `${buyerScore.score}/100` : "-";
  const scoreHint =
    buyerScore?.score != null
      ? (buyerScore.label ?? buyerScoreBandLabel(buyerScore.band))
      : buyerScoreInsufficientMessage();
  const scorePositive =
    buyerScore?.band === "excellent-history" ||
    buyerScore?.band === "good-history";

  const engineLabel =
    details.engineCapacity != null
      ? `${details.engineCapacity.toLocaleString("en-GB")} cc`
      : null;

  const metaParts = [
    summary.year?.toString(),
    summary.fuelType,
    summary.colour,
    summary.transmission,
    engineLabel,
  ].filter(Boolean);

  const stats: Array<{
    key: string;
    value: string;
    label: string;
    hint?: string;
    hintClass?: string;
  }> = [
    {
      key: "mileage",
      value:
        summary.latestMileage != null
          ? summary.latestMileage.toLocaleString("en-GB")
          : "-",
      label: "miles",
    },
  ];

  if (ownersLabel) {
    stats.push({
      key: "owners",
      value: ownersLabel,
      label: "owners",
    });
  }

  if (summary.annualRoadTaxGbp != null || showUnavailableStats) {
    stats.push({
      key: "tax",
      value:
        summary.annualRoadTaxGbp != null
          ? `£${summary.annualRoadTaxGbp}`
          : "-",
      label: "road tax",
      hint:
        summary.annualRoadTaxGbp != null ? "per year" : "Not available",
    });
  }

  stats.push({
    key: "score",
    value: scoreValue,
    label: "buyer score",
    hint: scoreHint,
    hintClass: scorePositive ? "font-semibold text-success" : "text-muted",
  });

  const motValid = summary.motStatus.status === "Valid";
  const taxed = summary.tax.status === "Taxed";
  const recallsAvailable = summary.recalls.dataAvailable !== false;
  const noRecalls = recallsAvailable && !summary.recalls.hasOpenRecalls;

  const insightReasons =
    buyerScore?.reasons?.filter(
      (item) => item.impact !== 0 || item.type === "insufficient-history",
    ) ?? [];

  return (
    <div className="space-y-3">
      {/* Top summary card */}
      <div className="card-surface grid gap-3 p-3 lg:grid-cols-[minmax(320px,1.15fr)_minmax(0,1.3fr)_minmax(220px,0.75fr)] lg:items-stretch lg:gap-3 lg:p-3">
        {/* Image */}
        <div className="relative flex min-h-[260px] flex-col items-center justify-center lg:min-h-0">
          <VehicleThumbnail
            label={`${summary.make} ${summary.model}`}
            src={summary.imageSrc}
            variant="hero"
            priority
            className="!aspect-auto h-full min-h-[250px] w-full max-w-[420px] border-0 bg-white"
            imageClassName="p-0 scale-[1.06]"
          />
          <VehicleImageCaption
            summary={summary}
            className="absolute inset-x-1 bottom-[-2px] text-center"
          />
        </div>

        {/* Centre identity + stats + statuses */}
        <div className="flex min-w-0 flex-col">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center",
                highlightRegistration
                  ? "rounded-[6px] bg-[#FACC35] px-2.5 py-1 text-[15px] font-bold tracking-[0.05em] text-black lg:text-[16px]"
                  : "rounded-md border border-border px-2 py-0.5 text-[11px] font-semibold tracking-[0.04em] text-navy",
              )}
            >
              {summary.displayRegistration}
            </span>
            {summary.isDemo ? (
              <StatusBadge
                tone="info"
                className={
                  highlightRegistration
                    ? "border-0 px-2.5 py-1 text-[15px] tracking-[0.05em] lg:text-[16px]"
                    : undefined
                }
              >
                Demo data
              </StatusBadge>
            ) : null}
          </div>

          <h1 className="text-[24px] font-bold leading-[1.15] tracking-tight text-navy lg:text-[26px]">
            {summary.make} {summary.model}
          </h1>
          <p className="mt-1 text-[12px] text-muted lg:text-[13px]">
            {metaParts.join("  |  ")}
          </p>

          <div
            className={cn(
              "mt-2.5 grid rounded-[8px] border border-border bg-white",
              stats.length === 4
                ? "grid-cols-4"
                : stats.length === 3
                  ? "grid-cols-3"
                  : "grid-cols-2",
            )}
          >
            {stats.map((stat, index) => (
              <div
                key={stat.key}
                className={cn(
                  "relative top-[2px] px-1.5 py-3.5 text-center",
                  index > 0 && "border-l border-border",
                )}
              >
                <div className="text-[20px] font-bold tabular-nums leading-none text-navy lg:text-[22px]">
                  {stat.value}
                </div>
                <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.04em] text-muted lg:text-[11px]">
                  {stat.label}
                </div>
                {stat.hint ? (
                  <div
                    className={cn(
                      "mt-0.5 text-[11px]",
                      stat.hintClass ?? "text-muted",
                    )}
                  >
                    {stat.hint}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-3">
            <div
              className={cn(
                "rounded-[8px] border px-2 py-2 text-center",
                taxed
                  ? "border-success/20 bg-success-bg"
                  : "border-border bg-white",
              )}
            >
              <div className="flex items-center justify-center gap-1.5">
                {taxed ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-warning" />
                )}
                <div
                  className={cn(
                    "text-[12px] font-semibold",
                    taxed ? "text-success" : "text-navy",
                  )}
                >
                  {summary.tax.status === "Taxed" ? "Taxed" : summary.tax.status}
                </div>
              </div>
              <div className="mt-0.5 text-[11px] text-muted">
                {summary.tax.dueDate
                  ? `Due ${formatDateUk(summary.tax.dueDate)}`
                  : "Due date unknown"}
              </div>
            </div>

            <div
              className={cn(
                "rounded-[8px] border px-2 py-2 text-center",
                motValid
                  ? "border-success/20 bg-success-bg"
                  : "border-border bg-white",
              )}
            >
              <div className="flex items-center justify-center gap-1.5">
                {motValid ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-danger" />
                )}
                <div
                  className={cn(
                    "text-[12px] font-semibold",
                    motValid ? "text-success" : "text-navy",
                  )}
                >
                  {motValid
                    ? "MOT valid"
                    : summary.motStatus.status === "Expired"
                      ? "MOT expired"
                      : summary.motStatus.status}
                </div>
              </div>
              <div className="mt-0.5 text-[11px] text-muted">
                {summary.motStatus.expiryDate
                  ? `Expires ${formatDateUk(summary.motStatus.expiryDate)}`
                  : "Expiry unknown"}
              </div>
            </div>

            <div
              className={cn(
                "rounded-[8px] border px-2 py-2 text-center",
                noRecalls
                  ? "border-border bg-[#F8FAFC]"
                  : "border-warning/25 bg-warning-bg",
              )}
            >
              <div className="flex items-center justify-center gap-1.5">
                {!recallsAvailable ? (
                  <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-navy/55" />
                ) : noRecalls ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-navy/55" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-warning" />
                )}
                <div className="text-[12px] font-semibold text-navy">
                  {!recallsAvailable
                    ? "Recalls unavailable"
                    : noRecalls
                    ? "No recalls"
                    : `${summary.recalls.count} recall${summary.recalls.count === 1 ? "" : "s"}`}
                </div>
              </div>
              <div className="mt-0.5 text-[11px] text-muted">
                {!recallsAvailable
                  ? "Data not available yet"
                  : noRecalls
                    ? "None indicated"
                    : "Open recall indicated"}
              </div>
            </div>
          </div>
        </div>

        {/* Right rail */}
        <div className="flex min-w-0 flex-col gap-2">
          <div className="rounded-[8px] border border-border bg-white p-2.5">
            <ScoreGauge result={buyerScore} className="max-w-none" />
          </div>
          <MotTimeline
            tests={motTests}
            limit={3}
            viewAllHref="#mot-history"
            compact
            title="MOT history"
            className={stretchMotHistory ? "flex-1" : undefined}
          />
        </div>
      </div>

      {!summaryOnly && afterSummary ? afterSummary : null}

      {/* Main 3-column grid */}
      <div
        className={cn(
          "grid gap-3 lg:grid-cols-[1fr_1fr_0.9fr]",
          summaryOnly && "hidden",
        )}
      >
        {/* Column 1 */}
        <div className="space-y-3">
          <CardShell title="Vehicle details" icon={Car}>
            <dl>
              <DetailRow label="Make" value={details.make || "-"} />
              <DetailRow label="Model" value={details.model || "-"} />
              <DetailRow
                label="Year"
                value={details.yearOfManufacture?.toString() ?? "-"}
              />
              <DetailRow label="Fuel" value={details.fuelType ?? "-"} />
              <DetailRow
                label="Colour"
                value={
                  <VehicleColour
                    colour={details.colour}
                    unavailableLabel="-"
                  />
                }
              />
              <DetailRow
                label="Engine size"
                value={
                  details.engineCapacity != null
                    ? `${details.engineCapacity.toLocaleString("en-GB")} cc`
                    : "-"
                }
              />
              <DetailRow
                label="Transmission"
                value={details.transmission ?? "-"}
              />
              {details.typeApproval ? (
                <DetailRow label="Type approval" value={details.typeApproval} />
              ) : null}
              {details.wheelplan ? (
                <DetailRow label="Wheelplan" value={details.wheelplan} />
              ) : null}
              {details.markedForExport != null ? (
                <DetailRow
                  label="Export status"
                  value={
                    details.markedForExport
                      ? "Marked for export"
                      : "Not marked for export"
                  }
                />
              ) : null}
              {details.revenueWeight != null ? (
                <DetailRow
                  label="Revenue weight"
                  value={`${details.revenueWeight.toLocaleString("en-GB")} kg`}
                />
              ) : null}
              {details.dateOfLastV5CIssued ? (
                <DetailRow
                  label="Last V5C issued"
                  value={details.dateOfLastV5CIssued}
                />
              ) : null}
              {details.realDrivingEmissions ? (
                <DetailRow
                  label="RDE"
                  value={details.realDrivingEmissions}
                />
              ) : null}
            </dl>
          </CardShell>

          <CardShell
            id="mot-history"
            title="MOT history"
            icon={ClipboardList}
            action={
              <a
                href="#mot-history"
                className="text-[13px] font-semibold text-blue hover:text-blue-hover"
              >
                View full history →
              </a>
            }
          >
            <MotTimeline tests={motTests} />
            <div className="mt-2 space-y-2">
              {motTests.slice(0, 3).map((test) =>
                test.defects.length > 0 ? (
                  <div
                    key={`${test.completedDate}-defects`}
                    className="rounded-[8px] border border-border bg-surface-soft px-2.5 py-2"
                  >
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <span className="text-[13px] font-semibold text-navy">
                        {formatDateUk(test.completedDate)}
                      </span>
                      <MotResultBadge result={test.testResult} />
                    </div>
                    <ul className="space-y-1">
                      {test.defects.map((defect) => (
                        <li
                          key={`${defect.type}-${defect.text}`}
                          className="text-[13px] text-muted"
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
          </CardShell>
        </div>

        {/* Column 2 */}
        <div className="space-y-3">
          <CardShell
            id="mileage-history"
            title="Mileage history"
            icon={Gauge}
            action={
              <a
                href="#mileage-history"
                className="text-[13px] font-semibold text-blue hover:text-blue-hover"
              >
                View details →
              </a>
            }
          >
            <MileageHistory points={mileageHistory} />
          </CardShell>

          <CardShell title="Technical details" icon={Settings2}>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: "Euro status", value: details.euroStatus ?? "-" },
                {
                  label: "CO₂",
                  value:
                    details.co2Emissions != null
                      ? `${details.co2Emissions} g/km`
                      : "-",
                },
                {
                  label: "First registered",
                  value: details.monthOfFirstRegistration ?? "-",
                },
                {
                  label: "Transmission",
                  value: details.transmission ?? "-",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[8px] border border-border bg-white px-2 py-1.5"
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-muted">
                    {item.label}
                  </div>
                  <div className="mt-1 text-[13px] font-semibold text-navy">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </CardShell>

          <CardShell title="Buyer insights" icon={BarChart3}>
            <BuyerScore result={buyerScore} compact />
            {insightReasons.length > 0 ? (
              <ul className="mt-3 space-y-1.5 text-[13px] text-muted">
                {insightReasons.map((item) => (
                  <li key={`${item.type}-${item.label}`}>
                    <span className="text-navy">• </span>
                    {item.impact !== 0
                      ? `${item.label} (${item.impact > 0 ? "+" : ""}${item.impact})`
                      : item.label}
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="meta-copy mt-3">
              Buyer Score is an AutoViewer interpretation of available vehicle
              history. It is not a mechanical inspection or guarantee of vehicle
              condition.
            </p>
          </CardShell>
        </div>

        {/* Column 3 */}
        <div className="space-y-3">
          <CardShell id="tax-information" title="Tax information" icon={Landmark}>
            <div className="flex flex-wrap items-center gap-2">
              <TaxStatusBadge status={summary.tax.status} />
              {summary.tax.dueDate ? (
                <span className="text-[13px] text-muted">
                  Due date: {formatDateUk(summary.tax.dueDate)}
                </span>
              ) : null}
            </div>
            <p className="mt-2.5 text-[13px] text-muted">
              Tax and SORN status can change. Confirm before driving or buying.
            </p>
          </CardShell>

          <CardShell
            id="recall-information"
            title="Recall information"
            icon={ShieldAlert}
          >
            {!recallsAvailable ? (
              <p className="text-[13px] text-muted">
                Recall data is not available from DVLA Vehicle Enquiry.
              </p>
            ) : recalls.items.length > 0 ? (
              <ul className="space-y-2.5">
                {recalls.items.map((item) => (
                  <li
                    key={item.title}
                    className="rounded-[8px] border border-warning/20 bg-warning-bg px-3 py-2.5"
                  >
                    <div className="text-[13px] font-semibold text-navy">
                      {item.title}
                    </div>
                    {item.description ? (
                      <p className="mt-1 text-[13px] text-muted">
                        {item.description}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <>
                <StatusBadge
                  tone="success"
                  icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                >
                  None indicated
                </StatusBadge>
                <p className="mt-2.5 text-[13px] text-muted">
                  No outstanding recalls indicated in available data.
                </p>
              </>
            )}
            {recalls.sourceNote ? (
              <p className="meta-copy mt-2">{recalls.sourceNote}</p>
            ) : null}
          </CardShell>

          <CardShell title="Related checks" icon={List}>
            <ul className="divide-y divide-border">
              {[
                { href: "/mot-history", label: "MOT history checker" },
                { href: "/tax-mileage", label: "Tax & mileage check" },
                { href: "/compare-cars", label: "Compare cars" },
                { href: "/running-costs", label: "Running costs" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center justify-between gap-2 py-2 text-[13px] font-medium text-navy hover:text-blue"
                  >
                    {item.label}
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-2 rounded-[8px] border border-blue/15 bg-[#EEF5FF] px-2.5 py-2.5">
              <div className="flex items-start gap-1.5">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-blue" />
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-navy">
                    Thinking of buying?
                  </p>
                  <p className="mt-1 text-[12px] leading-snug text-muted">
                    Use our other tools to compare similar cars, check running
                    costs and more.
                  </p>
                  <Link
                    href="/compare-cars"
                    className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-blue hover:text-blue-hover"
                  >
                    Compare cars
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </CardShell>
        </div>
      </div>

      {/* Secondary disclaimer */}
      <div
        className={cn(
          "rounded-[8px] border border-border bg-white px-3 py-2.5",
          summaryOnly && "hidden",
        )}
      >
        {summary.isDemo ? (
          <p className="text-[12px] font-semibold uppercase tracking-[0.04em] text-muted">
            Demo data
          </p>
        ) : null}
        <ul className="mt-1 space-y-1 text-[12px] text-muted">
          {vehicle.dataQuality.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        <p className="mt-1.5 text-[12px] text-muted">
          Sources: {vehicle.dataQuality.sources.join(", ")}
        </p>
        <p className="mt-2 text-[12px] text-muted">
          Outstanding finance, stolen status and write-off categories are not
          provided by DVLA/DVSA free vehicle data and are not shown here.
        </p>
      </div>
    </div>
  );
}
