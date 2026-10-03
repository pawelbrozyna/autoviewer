"use client";

import {
  AlertTriangle,
  Calendar,
  Check,
  CircleDollarSign,
  Fuel,
  Gauge,
  Landmark,
  Settings2,
  ShieldAlert,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";
import { InfoTip } from "@/components/ui/InfoTip";
import { VehicleImageCaption } from "@/components/vehicle/VehicleImageCaption";
import { VehicleThumbnail } from "@/components/vehicle/VehicleThumbnail";
import { formatEngineLitres } from "@/lib/vehicle/engine";
import {
  DEFAULT_ANNUAL_MILEAGE,
  DEFAULT_FUEL_PRICE_PER_LITRE_GBP,
  calculateAnnualFuelCost,
  formatFuelPricePencePerLitre,
} from "@/lib/vehicle/running-costs";
import { buyerScoreDisclaimer } from "@/lib/vehicle/score";
import { cn } from "@/lib/utils";
import { NA, compactValue } from "@/lib/vehicle/missing-data";
import type { VehicleRecord } from "@/types/vehicle";

/** Classic dashboard “check engine” / MIL silhouette. */
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
      {/* Side-view engine block (dashboard MIL style) */}
      <path d="M7 9h2l1.2-1.8h4.6L16 9h2v2h1.5a1 1 0 0 1 1 1v2.5a1 1 0 0 1-1 1H18v1.5a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 7 17V15H5.5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1H7V9Z" />
      <path d="M9.5 7.2V5.5A1 1 0 0 1 10.5 4.5H13" />
      <path d="M13 4.5h2.5" />
      <path d="M4.5 12H3" />
      <path d="M4.5 14H3" />
    </svg>
  );
}

type Winner = "left" | "right" | "tie" | "none";

type MobileRow = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  leftValue: string;
  rightValue: string;
  winner: Winner;
  leftWarning?: boolean;
  rightWarning?: boolean;
};

function shortName(record: VehicleRecord) {
  const first = record.summary.model.trim().split(/\s+/)[0] ?? "";
  return `${record.summary.make} ${first}`.trim();
}

function trimLine(record: VehicleRecord) {
  const parts = record.summary.model.trim().split(/\s+/).slice(1);
  return parts.join(" ") || null;
}

function countAdvisories(record: VehicleRecord): number {
  const latest = [...record.motTests].sort(
    (a, b) =>
      new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime(),
  )[0];
  return latest?.defects.filter((d) => d.type === "ADVISORY").length ?? 0;
}

function scoreChoiceLabel(score: number | null | undefined) {
  if (score == null) return "Limited data";
  if (score >= 85) return "Great choice";
  if (score >= 75) return "Good choice";
  if (score >= 65) return "Fair choice";
  return "Needs care";
}

function betterHigher(
  left: number | null | undefined,
  right: number | null | undefined,
): Winner {
  if (left == null || right == null) return "none";
  if (left === right) return "tie";
  return left > right ? "left" : "right";
}

function betterLower(
  left: number | null | undefined,
  right: number | null | undefined,
): Winner {
  if (left == null || right == null) return "none";
  if (left === right) return "tie";
  return left < right ? "left" : "right";
}

function buildMobileRows(left: VehicleRecord, right: VehicleRecord): MobileRow[] {
  const leftFuel = calculateAnnualFuelCost({
    annualMileage: DEFAULT_ANNUAL_MILEAGE,
    mpg: left.summary.combinedMpg,
    fuelPricePerLitre: DEFAULT_FUEL_PRICE_PER_LITRE_GBP,
  });
  const rightFuel = calculateAnnualFuelCost({
    annualMileage: DEFAULT_ANNUAL_MILEAGE,
    mpg: right.summary.combinedMpg,
    fuelPricePerLitre: DEFAULT_FUEL_PRICE_PER_LITRE_GBP,
  });
  const leftAdv = countAdvisories(left);
  const rightAdv = countAdvisories(right);
  const recallCount = (record: VehicleRecord) =>
    record.recalls.dataAvailable === false
      ? null
      : record.recalls.hasOpenRecalls
        ? record.recalls.count
        : 0;
  const recallValue = (count: number | null) =>
    count == null ? NA : count > 0 ? `${count} open` : "None";
  const leftRecalls = recallCount(left);
  const rightRecalls = recallCount(right);

  return [
    {
      key: "year",
      label: "Year",
      icon: Calendar,
      leftValue: left.summary.year != null ? String(left.summary.year) : NA,
      rightValue: right.summary.year != null ? String(right.summary.year) : NA,
      winner: betterHigher(left.summary.year, right.summary.year),
    },
    {
      key: "engine",
      label: "Engine size",
      icon: EngineIcon,
      leftValue: formatEngineLitres(left.summary.engineCapacity) ?? NA,
      rightValue: formatEngineLitres(right.summary.engineCapacity) ?? NA,
      winner: betterHigher(
        left.summary.engineCapacity,
        right.summary.engineCapacity,
      ),
    },
    {
      key: "power",
      label: "Power",
      icon: Zap,
      leftValue:
        left.summary.powerBhp != null ? `${left.summary.powerBhp} bhp` : NA,
      rightValue:
        right.summary.powerBhp != null ? `${right.summary.powerBhp} bhp` : NA,
      winner: betterHigher(left.summary.powerBhp, right.summary.powerBhp),
    },
    {
      key: "fuel",
      label: "Fuel",
      icon: Fuel,
      leftValue: left.summary.fuelType ?? NA,
      rightValue: right.summary.fuelType ?? NA,
      winner: "none",
    },
    {
      key: "transmission",
      label: "Transmission",
      icon: Settings2,
      leftValue: left.summary.transmission ?? NA,
      rightValue: right.summary.transmission ?? NA,
      winner: "none",
    },
    {
      key: "mileage",
      label: "Mileage",
      icon: Gauge,
      leftValue:
        left.summary.latestMileage != null
          ? `${left.summary.latestMileage.toLocaleString("en-GB")} mi`
          : NA,
      rightValue:
        right.summary.latestMileage != null
          ? `${right.summary.latestMileage.toLocaleString("en-GB")} mi`
          : NA,
      winner: betterLower(
        left.summary.latestMileage,
        right.summary.latestMileage,
      ),
    },
    {
      key: "tax",
      label: "Road tax",
      icon: Landmark,
      leftValue:
        left.summary.annualRoadTaxGbp != null
          ? `£${left.summary.annualRoadTaxGbp.toLocaleString("en-GB")} /yr`
          : compactValue(left.summary.tax.status),
      rightValue:
        right.summary.annualRoadTaxGbp != null
          ? `£${right.summary.annualRoadTaxGbp.toLocaleString("en-GB")} /yr`
          : compactValue(right.summary.tax.status),
      winner: betterLower(
        left.summary.annualRoadTaxGbp,
        right.summary.annualRoadTaxGbp,
      ),
    },
    {
      key: "mpg",
      label: "MPG",
      icon: Fuel,
      leftValue:
        left.summary.combinedMpg != null
          ? `${left.summary.combinedMpg} mpg`
          : NA,
      rightValue:
        right.summary.combinedMpg != null
          ? `${right.summary.combinedMpg} mpg`
          : NA,
      winner: betterHigher(left.summary.combinedMpg, right.summary.combinedMpg),
    },
    {
      key: "fuel-cost",
      label: "Fuel cost",
      icon: CircleDollarSign,
      leftValue:
        leftFuel != null
          ? `£${leftFuel.toLocaleString("en-GB")}`
          : NA,
      rightValue:
        rightFuel != null
          ? `£${rightFuel.toLocaleString("en-GB")}`
          : NA,
      winner: betterLower(leftFuel, rightFuel),
    },
    {
      key: "advisories",
      label: "MOT advisories",
      icon: Wrench,
      leftValue: leftAdv === 0 ? "None" : String(leftAdv),
      rightValue: rightAdv === 0 ? "None" : String(rightAdv),
      winner: betterLower(leftAdv, rightAdv),
    },
    {
      key: "recalls",
      label: "Recalls",
      icon: ShieldAlert,
      leftValue: recallValue(leftRecalls),
      rightValue: recallValue(rightRecalls),
      winner: betterLower(leftRecalls, rightRecalls),
      leftWarning: (leftRecalls ?? 0) > 0,
      rightWarning: (rightRecalls ?? 0) > 0,
    },
    {
      key: "score",
      label: "Buyer Score",
      icon: Sparkles,
      leftValue:
        left.buyerScore?.score != null
          ? `${left.buyerScore.score}/100`
          : NA,
      rightValue:
        right.buyerScore?.score != null
          ? `${right.buyerScore.score}/100`
          : NA,
      winner: betterHigher(left.buyerScore?.score, right.buyerScore?.score),
    },
  ];
}

function buildQuickSummary(
  left: VehicleRecord,
  right: VehicleRecord,
  rows: MobileRow[],
) {
  const leftWins: string[] = [];
  const rightWins: string[] = [];
  const labelMap: Record<string, string> = {
    mileage: "lower mileage",
    score: "higher Buyer Score",
    tax: "lower road tax",
    mpg: "better fuel economy",
    "fuel-cost": "lower fuel cost",
    year: "newer year",
    power: "more power",
    engine: "larger engine",
    advisories: "fewer MOT advisories",
    recalls: "fewer recalls",
  };

  for (const row of rows) {
    const phrase = labelMap[row.key];
    if (!phrase) continue;
    if (row.winner === "left") leftWins.push(phrase);
    if (row.winner === "right") rightWins.push(phrase);
  }

  return {
    left: leftWins.slice(0, 3),
    right: rightWins.slice(0, 3),
    leftName: shortName(left).split(" ").slice(-1)[0] ?? shortName(left),
    rightName: shortName(right).split(" ").slice(-1)[0] ?? shortName(right),
  };
}

function VehicleCompareCard({
  record,
  isLeader,
  showImageCaption = false,
}: {
  record: VehicleRecord;
  isLeader: boolean;
  showImageCaption?: boolean;
}) {
  const score = record.buyerScore?.score ?? null;
  const name = shortName(record);
  const trim = trimLine(record);
  const choice = scoreChoiceLabel(score);
  const specs = [
    {
      icon: Calendar,
      value: record.summary.year != null ? String(record.summary.year) : NA,
    },
    {
      icon: EngineIcon,
      value: formatEngineLitres(record.summary.engineCapacity) ?? NA,
    },
    {
      icon: Zap,
      value:
        record.summary.powerBhp != null
          ? `${record.summary.powerBhp} bhp`
          : NA,
    },
    {
      icon: Fuel,
      value: record.summary.fuelType ?? NA,
    },
  ];

  return (
    <div className="flex h-full min-w-0 w-full flex-col overflow-hidden rounded-[14px] border border-border bg-white">
      <div className="px-1.5 pt-1">
        <VehicleThumbnail
          label={name}
          src={record.summary.imageSrc}
          variant="bare"
          className="aspect-[3/2]"
          imageClassName="object-center"
        />
        {showImageCaption ? (
          <VehicleImageCaption
            summary={record.summary}
            className="relative z-10 -mt-1 min-h-[1.5em] text-center text-[8px] leading-tight"
          />
        ) : (
          <div className="min-h-[1.5em]" aria-hidden />
        )}
      </div>

      <div className="flex flex-1 flex-col px-2 pb-2 pt-1">
        <div className="mx-auto inline-flex max-w-full items-center rounded-[5px] bg-[#FACC35] px-1.5 py-[3px]">
          <span className="truncate text-[11px] font-bold tracking-[0.04em] text-black">
            {record.summary.displayRegistration}
          </span>
        </div>

        <div className="mt-2 w-full">
          <h3 className="line-clamp-2 h-[1.875rem] w-full text-center text-[13px] font-bold leading-[1.15] text-[#012046]">
            {name}
          </h3>
          <p className="mt-0.5 h-4 w-full truncate text-center text-[11px] leading-4 text-[#64748B]">
            {trim || "\u00a0"}
          </p>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-x-1 gap-y-1.5">
          {specs.map((spec, index) => {
            const Icon = spec.icon;
            const isRightCol = index % 2 === 1;
            return (
              <div
                key={`${index}-${spec.value}`}
                className={cn(
                  "flex min-w-0 items-center gap-0.5 text-[10.5px] font-medium leading-none text-[#475569]",
                  isRightCol && "pl-2.5",
                )}
              >
                <Icon
                  className="block h-3 w-3 shrink-0"
                  strokeWidth={2}
                />
                <span className="truncate leading-none tabular-nums">
                  {spec.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className={cn(
          "mt-auto border-t border-border px-2.5 py-2",
          isLeader ? "bg-[#E8F6EE]" : "bg-[#F3F6FA]",
        )}
      >
        <div className="flex items-start justify-between gap-1">
          <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#64748B]">
            Buyer Score
            <InfoTip
              label="About Buyer Score"
              text={buyerScoreDisclaimer()}
              className="-translate-y-[2px]"
            />
          </div>
          <p
            className={cn(
              "flex flex-col items-center gap-0.5 pt-0.5 text-center text-[11px] font-semibold leading-none",
              isLeader ? "text-[#157A45]" : "text-[#64748B]",
            )}
          >
            {choice.split(" ").map((word, index) => (
              <span key={`${word}-${index}`} className="block">
                {word}
              </span>
            ))}
          </p>
        </div>
        <div
          className={cn(
            "mt-1 text-center text-[26px] font-extrabold leading-none tabular-nums",
            isLeader ? "text-[#157A45]" : "text-[#012046]",
          )}
        >
          {score == null ? NA : score}
          {score != null ? (
            <span className="text-[13px] font-semibold text-[#64748B]">
              /100
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function CompareValueCell({
  carLabel,
  value,
  win,
  warning,
}: {
  carLabel: string;
  value: string;
  win: boolean;
  warning?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col items-center justify-center px-1.5 py-1 text-center",
        win && "rounded-[8px] bg-[#E8F6EE]",
        warning && !win && "rounded-[8px] bg-[#FFF4E5]",
      )}
    >
      <p className="w-full truncate text-[10px] font-medium leading-none text-[#94A3B8]">
        {carLabel}
      </p>
      <div className="mt-0.5 flex max-w-full items-center justify-center gap-1">
        <p
          className={cn(
            "min-w-0 truncate text-[13px] font-semibold leading-tight text-[#012046]",
            warning && "text-[#B45309]",
          )}
        >
          {value}
        </p>
        {win ? (
          <span className="inline-flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-[#23A05C] text-white">
            <Check className="h-1.5 w-1.5" strokeWidth={3.5} aria-hidden />
          </span>
        ) : null}
        {warning ? (
          <AlertTriangle
            className="h-3.5 w-3.5 shrink-0 text-[#B45309]"
            strokeWidth={2.25}
            aria-hidden
          />
        ) : null}
      </div>
    </div>
  );
}

export function VehicleComparisonMobile({
  left,
  right,
  showImageCaption = false,
}: {
  left: VehicleRecord;
  right: VehicleRecord;
  showImageCaption?: boolean;
}) {
  const rows = buildMobileRows(left, right);
  const leftScore = left.buyerScore?.score ?? -1;
  const rightScore = right.buyerScore?.score ?? -1;
  const leftLeads = leftScore >= rightScore;
  const rightLeads = rightScore > leftScore;
  const leftLabel = shortName(left);
  const rightLabel = shortName(right);
  const summary = buildQuickSummary(left, right, rows);

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-2 items-stretch gap-1.5 [&>*]:min-w-0">
        <VehicleCompareCard
          record={left}
          isLeader={leftLeads}
          showImageCaption={showImageCaption}
        />
        <VehicleCompareCard
          record={right}
          isLeader={rightLeads}
          showImageCaption={showImageCaption}
        />
      </div>

      <div className="space-y-1">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <div
              key={row.key}
              className="grid grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_minmax(0,1fr)] items-center rounded-[10px] border border-border bg-white px-1 py-1"
            >
              <div className="flex min-w-0 items-center gap-1 border-r border-border pl-1 pr-1.5">
                <Icon
                  className="h-4 w-4 shrink-0 text-[#012046]"
                  strokeWidth={2}
                  aria-hidden
                />
                <p className="truncate text-[11px] font-semibold leading-snug text-[#012046]">
                  {row.label}
                </p>
              </div>

              <div className="border-r border-border px-0.5">
                <CompareValueCell
                  carLabel={leftLabel}
                  value={row.leftValue}
                  win={row.winner === "left"}
                  warning={row.leftWarning}
                />
              </div>
              <div className="px-0.5">
                <CompareValueCell
                  carLabel={rightLabel}
                  value={row.rightValue}
                  win={row.winner === "right"}
                  warning={row.rightWarning}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="px-0.5 text-[11px] leading-snug text-[#64748B]">
        Fuel cost estimate: {DEFAULT_ANNUAL_MILEAGE.toLocaleString("en-GB")}{" "}
        miles/year at {formatFuelPricePencePerLitre()}/litre.
      </p>

      <div className="rounded-[12px] border border-border bg-white px-3 py-2.5">
        <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">
          Quick summary
        </p>
        <ul className="mt-1.5 space-y-1.5 text-[14px] leading-snug text-[#012046]">
          <li>
            <span className="font-semibold">{summary.leftName}</span>
            {" - "}
            {summary.left.length > 0
              ? summary.left.join(", ")
              : "solid overall balance"}
          </li>
          <li>
            <span className="font-semibold">{summary.rightName}</span>
            {" - "}
            {summary.right.length > 0
              ? summary.right.join(", ")
              : "solid overall balance"}
          </li>
        </ul>
      </div>
    </div>
  );
}
