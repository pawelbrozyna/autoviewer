import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Calendar,
  CalendarDays,
  Car,
  CheckCircle2,
  Fuel,
  Leaf,
  Palette,
  Settings2,
  Tag,
} from "lucide-react";
import { InfoTip } from "@/components/ui/InfoTip";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ScoreGauge } from "@/components/vehicle/ScoreGauge";
import { VehicleThumbnail } from "@/components/vehicle/VehicleThumbnail";
import {
  buyerScoreBandLabel,
  buyerScoreInsufficientMessage,
} from "@/lib/vehicle/score";
import { cn } from "@/lib/utils";
import type { VehicleRecord } from "@/types/vehicle";

function EngineIcon({
  className,
  strokeWidth = 2,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M7 9h2l1.2-1.8h4.6L16 9h2v2h1.5a1 1 0 0 1 1 1v2.5a1 1 0 0 1-1 1H18v1.5a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 7 17V15H5.5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1H7V9Z" />
      <path d="M9.5 7.2V5.5A1 1 0 0 1 10.5 4.5H13" />
      <path d="M13 4.5h2.5" />
      <path d="M4.5 12H3" />
      <path d="M4.5 14H3" />
    </svg>
  );
}

export function VehicleReportSummary({
  vehicle,
  eyebrow = "Vehicle report",
  ownersLabel = "-",
  footer,
  className,
}: {
  vehicle: VehicleRecord;
  eyebrow?: string;
  /** Keep "-" when keeper count is not available from live data. */
  ownersLabel?: string;
  footer?: ReactNode;
  className?: string;
}) {
  const { summary, details, buyerScore } = vehicle;
  const scoreValue =
    buyerScore?.score != null ? `${buyerScore.score}/100` : "-";
  const scoreHint =
    buyerScore?.score != null
      ? (buyerScore.label ?? buyerScoreBandLabel(buyerScore.band))
      : buyerScoreInsufficientMessage();
  const scoreHintTone =
    buyerScore?.band === "excellent-history" ||
    buyerScore?.band === "good-history"
      ? ("success" as const)
      : buyerScore?.band === "mixed-history"
        ? ("warning" as const)
        : buyerScore?.band === "needs-attention"
          ? ("danger" as const)
          : undefined;
  const mileageValue =
    summary.latestMileage != null
      ? summary.latestMileage.toLocaleString("en-GB")
      : "-";
  const roadTaxValue =
    summary.annualRoadTaxGbp != null
      ? `£${summary.annualRoadTaxGbp}`
      : "-";
  const engineValue =
    details.engineCapacity != null
      ? `${details.engineCapacity.toLocaleString("en-GB")} cc`
      : "-";

  const metrics = [
    {
      key: "mileage",
      label: "Mileage",
      value: mileageValue,
      hint: "miles" as string | undefined,
      hintTone: undefined as "success" | "warning" | "danger" | undefined,
      withInfo: false,
    },
    {
      key: "owners",
      label: "Owners",
      value: ownersLabel,
      hint: undefined as string | undefined,
      hintTone: undefined as "success" | "warning" | "danger" | undefined,
      withInfo: false,
    },
    {
      key: "tax",
      label: "Road tax",
      value: roadTaxValue,
      hint: summary.annualRoadTaxGbp != null ? "per year" : undefined,
      hintTone: undefined as "success" | "warning" | "danger" | undefined,
      withInfo: false,
    },
    {
      key: "score",
      label: "Buyer score",
      value: scoreValue,
      hint: scoreHint,
      hintTone: scoreHintTone,
      withInfo: true,
    },
  ];

  const detailFacts: Array<{
    key: string;
    label: string;
    value: string;
    icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  }> = [
    {
      key: "make",
      label: "Make",
      value: details.make || summary.make || "-",
      icon: Car,
    },
    {
      key: "model",
      label: "Model",
      value: details.model || summary.model || "-",
      icon: Tag,
    },
    {
      key: "year",
      label: "Year",
      value: details.yearOfManufacture?.toString() ?? summary.year?.toString() ?? "-",
      icon: Calendar,
    },
    {
      key: "fuel",
      label: "Fuel",
      value: details.fuelType ?? summary.fuelType ?? "-",
      icon: Fuel,
    },
    {
      key: "colour",
      label: "Colour",
      value: details.colour ?? summary.colour ?? "-",
      icon: Palette,
    },
    {
      key: "engine",
      label: "Engine",
      value: engineValue,
      icon: EngineIcon,
    },
    {
      key: "transmission",
      label: "Gearbox",
      value: details.transmission ?? summary.transmission ?? "-",
      icon: Settings2,
    },
    {
      key: "first-registered",
      label: "First registered",
      value: details.monthOfFirstRegistration ?? "-",
      icon: CalendarDays,
    },
    {
      key: "euro",
      label: "Euro status",
      value: details.euroStatus ?? "-",
      icon: BadgeCheck,
    },
    {
      key: "co2",
      label: "CO₂",
      value:
        details.co2Emissions != null
          ? `${details.co2Emissions} g/km`
          : "-",
      icon: Leaf,
    },
  ];

  const taxTone =
    summary.tax.status === "Taxed"
      ? ("success" as const)
      : summary.tax.status === "SORN"
        ? ("warning" as const)
        : summary.tax.status === "Untaxed"
          ? ("danger" as const)
          : ("neutral" as const);
  const motTone =
    summary.motStatus.status === "Valid"
      ? ("success" as const)
      : summary.motStatus.status === "Expired"
        ? ("danger" as const)
        : ("neutral" as const);
  const motLabel =
    summary.motStatus.status === "Valid"
      ? "MOT valid"
      : summary.motStatus.status === "Expired"
        ? "MOT expired"
        : summary.motStatus.status === "No MOT"
          ? "No MOT"
          : "MOT unknown";
  const recallCount = summary.recalls.count ?? 0;
  const hasRecalls = summary.recalls.hasOpenRecalls && recallCount > 0;

  return (
    <div
      className={cn(
        "card-surface overflow-hidden p-5 pb-3.5 md:p-6 md:pb-4 lg:p-5.5 lg:pb-3.5",
        className,
      )}
    >
      <div className="mb-3.5 flex flex-wrap items-center gap-2.5 lg:mb-3">
        <p className="eyebrow mb-0">{eyebrow}</p>
        {summary.isDemo ? (
          <StatusBadge tone="info">Demo data</StatusBadge>
        ) : null}
      </div>

      <div className="mb-4 flex flex-wrap items-start justify-between gap-x-6 gap-y-2 lg:mb-3.5 lg:gap-x-5">
        <div className="min-w-0">
          <h1 className="text-[1.35rem] font-bold tracking-tight text-navy md:text-[1.55rem] lg:text-[1.4rem]">
            {summary.make} {summary.model}
          </h1>
          <p className="mt-1 text-[14px] text-muted md:text-[15px]">
            {[
              summary.displayRegistration,
              summary.year,
              summary.fuelType,
              summary.transmission,
            ]
              .filter(Boolean)
              .join(" | ")}
          </p>
        </div>
        <ScoreGauge result={buyerScore} className="-mt-2.5" />
      </div>

      <div className="grid gap-4 sm:grid-cols-[minmax(280px,360px)_minmax(0,1fr)] sm:items-stretch sm:gap-5 lg:gap-6">
        <div className="w-full sm:max-w-[360px]">
          <VehicleThumbnail
            label={`${summary.make} ${summary.model}`}
            src={summary.imageSrc}
            variant="hero"
            showIllustrationLabel
            priority
            className="w-full"
          />
        </div>

        <div className="flex h-full flex-col rounded-[12px] border border-border bg-white px-2 pb-2.5 pt-2.5 md:px-3 md:pb-2.5 md:pt-3">
          <div className="grid grid-cols-2 content-start lg:grid-cols-[1.1fr_0.6fr_minmax(5.5rem,1.15fr)_1.3fr]">
            {metrics.map((metric, index) => (
              <div
                key={metric.key}
                className={cn(
                  "px-2.5 py-1 text-center md:px-3 md:py-0",
                  metric.key === "owners" && "px-1.5 md:px-2",
                  index % 2 === 1 && "border-l border-border",
                  index >= 2 && "border-t border-border lg:border-t-0",
                  index > 0 && "lg:border-l lg:border-border",
                )}
              >
                <div className="mb-1 flex items-center justify-center gap-1 text-[12px] font-semibold uppercase tracking-[0.04em] text-muted md:text-[13px]">
                  <span className="whitespace-nowrap">{metric.label}</span>
                  {metric.withInfo ? (
                    <InfoTip
                      label="About Buyer score"
                      text="Buyer Score is an AutoViewer interpretation of available vehicle history. It is not a mechanical inspection or guarantee of vehicle condition."
                    />
                  ) : null}
                </div>
                <div
                  className={cn(
                    "tracking-tight text-navy",
                    metric.key === "score"
                      ? "text-[22px] font-extrabold md:text-[24px]"
                      : "text-[22px] font-bold md:text-[24px]",
                  )}
                >
                  {metric.value}
                </div>
                {metric.hint ? (
                  <p
                    className={cn(
                      "mt-0.5 text-[13px]",
                      metric.hintTone === "success"
                        ? "font-semibold text-success"
                        : metric.hintTone === "warning"
                          ? "font-semibold text-warning"
                          : metric.hintTone === "danger"
                            ? "font-semibold text-danger"
                            : "text-muted",
                    )}
                  >
                    {metric.hint}
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3 sm:grid-cols-3 lg:grid-cols-5">
            {detailFacts.map((fact) => {
              const Icon = fact.icon;
              return (
                <div
                  key={fact.key}
                  className="rounded-[10px] border border-border bg-[#FBFCFE] px-2.5 py-2 text-center"
                >
                  <div className="mb-1 flex items-center justify-center gap-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-muted">
                    <Icon className="h-3.5 w-3.5 shrink-0 text-navy/65" strokeWidth={2} />
                    <span className="whitespace-nowrap">{fact.label}</span>
                  </div>
                  <div className="truncate text-[14px] font-semibold text-navy md:text-[15px]">
                    {fact.value}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 border-t border-border pt-2">
            <StatusBadge
              tone={taxTone}
              icon={
                taxTone === "success" ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5" />
                )
              }
            >
              {summary.tax.status === "Taxed"
                ? "Taxed"
                : summary.tax.status}
            </StatusBadge>
            <StatusBadge
              tone={motTone}
              icon={
                motTone === "success" ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5" />
                )
              }
            >
              {motLabel}
            </StatusBadge>
            {hasRecalls ? (
              <StatusBadge
                tone="warning"
                icon={<AlertTriangle className="h-3.5 w-3.5" />}
              >
                {recallCount} recall{recallCount === 1 ? "" : "s"}
              </StatusBadge>
            ) : (
              <StatusBadge
                tone="success"
                icon={<CheckCircle2 className="h-3.5 w-3.5" />}
              >
                No recalls
              </StatusBadge>
            )}
          </div>
        </div>
      </div>

      {footer ? (
        <div className="mt-2 text-[15px] text-muted md:text-[16px]">
          {footer}
        </div>
      ) : null}
    </div>
  );
}

/** Homepage example footer link. */
export function ExampleReportFooter() {
  return (
    <>
      Example data -{" "}
      <Link
        href="/check-a-vehicle"
        className="font-semibold text-blue hover:text-blue-hover"
      >
        check a real registration →
      </Link>
    </>
  );
}
