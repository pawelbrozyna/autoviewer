import {
  AlertTriangle,
  Calendar,
  Check,
  CircleDollarSign,
  Fuel,
  Gauge,
  Landmark,
  Leaf,
  Settings2,
  ShieldAlert,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";
import { InfoTip } from "@/components/ui/InfoTip";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { VehicleImageCaption } from "@/components/vehicle/VehicleImageCaption";
import { VehicleThumbnail } from "@/components/vehicle/VehicleThumbnail";
import { VehicleComparisonMobile } from "@/components/vehicle/VehicleComparisonMobile";
import { formatEngineCc, formatEngineLitres } from "@/lib/vehicle/engine";
import { formatMileage } from "@/lib/vehicle/mileage";
import {
  DEFAULT_ANNUAL_MILEAGE,
  DEFAULT_FUEL_PRICE_PER_LITRE_GBP,
  calculateAnnualFuelCost,
  formatAnnualFuelCost,
} from "@/lib/vehicle/running-costs";
import { buyerScoreDisclaimer } from "@/lib/vehicle/score";
import { cn } from "@/lib/utils";
import type { VehicleRecord } from "@/types/vehicle";

type CellTone = "success" | "warning" | "danger" | "neutral";

type CompareRow = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  labelExtra?: React.ReactNode;
  left: React.ReactNode;
  right: React.ReactNode;
  leftTone?: CellTone;
  rightTone?: CellTone;
  summaryPhrase?: string;
};

type SummaryPoint = {
  text: string;
  tone: "success" | "warning";
};

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

function toneClass(tone?: CellTone) {
  if (tone === "success") return "bg-[#E8F6EE]";
  if (tone === "warning") return "bg-warning-bg/70";
  if (tone === "danger") return "bg-danger-bg/50";
  return "";
}

function displayOrDash(value: React.ReactNode): React.ReactNode {
  if (value == null || value === "") return "-";
  return value;
}

function shortName(record: VehicleRecord) {
  const first = record.summary.model.trim().split(/\s+/)[0] ?? "";
  return `${record.summary.make} ${first}`.trim();
}

function cardSubtitle(record: VehicleRecord) {
  const modelTail = record.summary.model.trim().split(/\s+/).slice(1).join(" ");
  const power =
    record.summary.powerBhp != null ? `${record.summary.powerBhp} bhp` : null;
  const year =
    record.summary.year != null ? `(${record.summary.year})` : null;
  return [modelTail || null, power, year].filter(Boolean).join(" ");
}

function countAdvisories(record: VehicleRecord): number {
  const latest = [...record.motTests].sort(
    (a, b) =>
      new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime(),
  )[0];
  return latest?.defects.filter((d) => d.type === "ADVISORY").length ?? 0;
}

function winnerTone(
  leftWins: boolean,
  rightWins: boolean,
): { leftTone: CellTone; rightTone: CellTone } {
  return {
    leftTone: leftWins ? "success" : "neutral",
    rightTone: rightWins ? "success" : "neutral",
  };
}

function EngineCell({ cc }: { cc?: number | null }) {
  const litres = formatEngineLitres(cc);
  const raw = formatEngineCc(cc);
  if (!litres) return "-";
  return (
    <span className="inline-flex flex-col leading-tight">
      <span>{litres}</span>
      {raw ? (
        <span className="text-[12px] font-medium text-muted">{raw}</span>
      ) : null}
    </span>
  );
}

function FuelCostCell({ mpg }: { mpg?: number | null }) {
  const amount = calculateAnnualFuelCost({
    annualMileage: DEFAULT_ANNUAL_MILEAGE,
    mpg,
    fuelPricePerLitre: DEFAULT_FUEL_PRICE_PER_LITRE_GBP,
  });
  if (amount == null) return "-";
  return (
    <span className="inline-flex flex-col leading-tight">
      <span>{formatAnnualFuelCost(amount)}</span>
      <span className="text-[12px] font-medium text-muted">
        Based on {DEFAULT_ANNUAL_MILEAGE.toLocaleString("en-GB")} miles
      </span>
    </span>
  );
}

function BuyerScoreCell({ record }: { record: VehicleRecord }) {
  const score = record.buyerScore?.score;
  const label = record.buyerScore?.label;
  if (score == null) return "-";
  return (
    <span className="inline-flex flex-col leading-tight">
      <span className="font-extrabold tabular-nums">{score}/100</span>
      {label ? (
        <span className="text-[12px] font-medium text-muted">{label}</span>
      ) : null}
    </span>
  );
}

function RoadTaxCell({ record }: { record: VehicleRecord }) {
  if (record.summary.annualRoadTaxGbp != null) {
    return `£${record.summary.annualRoadTaxGbp.toLocaleString("en-GB")} / year`;
  }
  return record.summary.tax.status || "-";
}

function OpenRecallsCell({ record }: { record: VehicleRecord }) {
  if (!record.recalls.hasOpenRecalls || record.recalls.count <= 0) {
    return "None indicated";
  }
  return `${record.recalls.count} open`;
}

function WinMark({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#23A05C] text-white">
      <Check className="h-2.5 w-2.5" strokeWidth={3} aria-hidden />
    </span>
  );
}

function buildRows(left: VehicleRecord, right: VehicleRecord): CompareRow[] {
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

  const leftScore = left.buyerScore?.score ?? null;
  const rightScore = right.buyerScore?.score ?? null;
  const leftAdv = countAdvisories(left);
  const rightAdv = countAdvisories(right);
  const leftTax = left.summary.annualRoadTaxGbp;
  const rightTax = right.summary.annualRoadTaxGbp;
  const leftCo2 = left.details.co2Emissions;
  const rightCo2 = right.details.co2Emissions;
  const leftMpg = left.summary.combinedMpg;
  const rightMpg = right.summary.combinedMpg;
  const leftMiles = left.summary.latestMileage;
  const rightMiles = right.summary.latestMileage;

  const mileageTone = winnerTone(
    leftMiles != null && rightMiles != null && leftMiles < rightMiles,
    leftMiles != null && rightMiles != null && rightMiles < leftMiles,
  );
  const taxTone = winnerTone(
    leftTax != null && rightTax != null && leftTax < rightTax,
    leftTax != null && rightTax != null && rightTax < leftTax,
  );
  const mpgTone = winnerTone(
    leftMpg != null && rightMpg != null && leftMpg > rightMpg,
    leftMpg != null && rightMpg != null && rightMpg > leftMpg,
  );
  const fuelTone = winnerTone(
    leftFuel != null && rightFuel != null && leftFuel < rightFuel,
    leftFuel != null && rightFuel != null && rightFuel < leftFuel,
  );
  const co2Tone = winnerTone(
    leftCo2 != null && rightCo2 != null && leftCo2 < rightCo2,
    leftCo2 != null && rightCo2 != null && rightCo2 < leftCo2,
  );
  const advTone = winnerTone(leftAdv < rightAdv, rightAdv < leftAdv);
  const scoreTonePair = winnerTone(
    leftScore != null && rightScore != null && leftScore > rightScore,
    leftScore != null && rightScore != null && rightScore > leftScore,
  );

  return [
    {
      key: "year",
      label: "Year",
      icon: Calendar,
      left: displayOrDash(left.summary.year),
      right: displayOrDash(right.summary.year),
      // Year shown for context only - not treated as automatically better
      leftTone: "neutral",
      rightTone: "neutral",
    },
    {
      key: "engine",
      label: "Engine size",
      icon: EngineIcon,
      left: <EngineCell cc={left.summary.engineCapacity} />,
      right: <EngineCell cc={right.summary.engineCapacity} />,
    },
    {
      key: "power",
      label: "Power",
      icon: Zap,
      left:
        left.summary.powerBhp != null ? `${left.summary.powerBhp} bhp` : "-",
      right:
        right.summary.powerBhp != null ? `${right.summary.powerBhp} bhp` : "-",
    },
    {
      key: "fuel",
      label: "Fuel",
      icon: Fuel,
      left: displayOrDash(left.summary.fuelType),
      right: displayOrDash(right.summary.fuelType),
    },
    {
      key: "transmission",
      label: "Transmission",
      icon: Settings2,
      left: displayOrDash(left.summary.transmission),
      right: displayOrDash(right.summary.transmission),
    },
    {
      key: "mileage",
      label: "Mileage",
      icon: Gauge,
      left: formatMileage(left.summary.latestMileage),
      right: formatMileage(right.summary.latestMileage),
      ...mileageTone,
      summaryPhrase: "Lower mileage",
    },
    {
      key: "tax",
      label: "Road tax",
      icon: Landmark,
      left: <RoadTaxCell record={left} />,
      right: <RoadTaxCell record={right} />,
      ...taxTone,
      summaryPhrase: "Lower road tax",
    },
    {
      key: "mpg",
      label: "Combined MPG",
      icon: Leaf,
      left:
        left.summary.combinedMpg != null
          ? `${left.summary.combinedMpg} mpg`
          : "-",
      right:
        right.summary.combinedMpg != null
          ? `${right.summary.combinedMpg} mpg`
          : "-",
      ...mpgTone,
      summaryPhrase: "Better fuel economy",
    },
    {
      key: "fuel-cost",
      label: "Estimated fuel cost / year",
      icon: CircleDollarSign,
      labelExtra: (
        <InfoTip
          label="About estimated fuel cost"
          text={`Estimate using ${DEFAULT_ANNUAL_MILEAGE.toLocaleString("en-GB")} miles/year, combined MPG when available, and £${DEFAULT_FUEL_PRICE_PER_LITRE_GBP.toFixed(2)}/litre. Not a live fuel-price quote.`}
        />
      ),
      left: <FuelCostCell mpg={left.summary.combinedMpg} />,
      right: <FuelCostCell mpg={right.summary.combinedMpg} />,
      ...fuelTone,
      summaryPhrase: "Lower estimated fuel cost",
    },
    {
      key: "co2",
      label: "CO₂ emissions",
      icon: Leaf,
      left:
        left.details.co2Emissions != null
          ? `${left.details.co2Emissions} g/km`
          : "-",
      right:
        right.details.co2Emissions != null
          ? `${right.details.co2Emissions} g/km`
          : "-",
      ...co2Tone,
      summaryPhrase: "Lower CO₂",
    },
    {
      key: "advisories",
      label: "Latest MOT advisories",
      icon: Wrench,
      left: leftAdv === 0 ? "None" : String(leftAdv),
      right: rightAdv === 0 ? "None" : String(rightAdv),
      ...advTone,
      summaryPhrase: "Fewer MOT advisories",
    },
    {
      key: "recalls",
      label: "Open recalls",
      icon: ShieldAlert,
      left: <OpenRecallsCell record={left} />,
      right: <OpenRecallsCell record={right} />,
      leftTone:
        left.recalls.hasOpenRecalls && left.recalls.count > 0
          ? "warning"
          : "neutral",
      rightTone:
        right.recalls.hasOpenRecalls && right.recalls.count > 0
          ? "warning"
          : "neutral",
      summaryPhrase: "No open recalls",
    },
    {
      key: "score",
      label: "Buyer Score",
      icon: Sparkles,
      left: <BuyerScoreCell record={left} />,
      right: <BuyerScoreCell record={right} />,
      ...scoreTonePair,
      summaryPhrase: "Higher Buyer Score",
    },
  ];
}

function buildQuickSummary(
  left: VehicleRecord,
  right: VehicleRecord,
  rows: CompareRow[],
) {
  const byKey = Object.fromEntries(rows.map((row) => [row.key, row]));
  const priority = [
    "mileage",
    "score",
    "advisories",
    "tax",
    "mpg",
    "fuel-cost",
    "co2",
  ] as const;

  const leftSuccess: SummaryPoint[] = [];
  const rightSuccess: SummaryPoint[] = [];

  for (const key of priority) {
    const row = byKey[key];
    if (!row?.summaryPhrase) continue;
    if (row.leftTone === "success") {
      leftSuccess.push({ text: row.summaryPhrase, tone: "success" });
    }
    if (row.rightTone === "success") {
      rightSuccess.push({ text: row.summaryPhrase, tone: "success" });
    }
  }

  const leftRecallCount =
    left.recalls.hasOpenRecalls && left.recalls.count > 0
      ? left.recalls.count
      : 0;
  const rightRecallCount =
    right.recalls.hasOpenRecalls && right.recalls.count > 0
      ? right.recalls.count
      : 0;

  const leftRecallPoint: SummaryPoint | null =
    leftRecallCount > 0
      ? {
          text: `${leftRecallCount} open recall${leftRecallCount === 1 ? "" : "s"}`,
          tone: "warning",
        }
      : rightRecallCount > 0
        ? { text: "No open recalls", tone: "success" }
        : null;

  const rightRecallPoint: SummaryPoint | null =
    rightRecallCount > 0
      ? {
          text: `${rightRecallCount} open recall${rightRecallCount === 1 ? "" : "s"}`,
          tone: "warning",
        }
      : leftRecallCount > 0
        ? { text: "No open recalls", tone: "success" }
        : null;

  const leftTrimmed = leftRecallPoint
    ? [...leftSuccess.slice(0, 3), leftRecallPoint]
    : leftSuccess.slice(0, 4);
  const rightTrimmed = rightRecallPoint
    ? [...rightSuccess.slice(0, 3), rightRecallPoint]
    : rightSuccess.slice(0, 4);
  const leftName = shortName(left);
  const rightName = shortName(right);
  const leftShort = leftName.split(" ").slice(-1)[0] ?? leftName;
  const rightShort = rightName.split(" ").slice(-1)[0] ?? rightName;

  const leftWins = leftTrimmed.filter((p) => p.tone === "success").length;
  const rightWins = rightTrimmed.filter((p) => p.tone === "success").length;
  const leftScore = left.buyerScore?.score;
  const rightScore = right.buyerScore?.score;

  let verdict = "Evenly matched overall. Choose by budget and preference.";
  if (leftWins >= rightWins + 2) {
    verdict = `${leftShort} looks stronger on the key numbers.`;
  } else if (rightWins >= leftWins + 2) {
    verdict = `${rightShort} looks stronger on the key numbers.`;
  } else if (
    leftScore != null &&
    rightScore != null &&
    leftScore - rightScore >= 4
  ) {
    verdict = `Slight edge to the ${leftShort} on Buyer Score.`;
  } else if (
    leftScore != null &&
    rightScore != null &&
    rightScore - leftScore >= 4
  ) {
    verdict = `Slight edge to the ${rightShort} on Buyer Score.`;
  } else if (leftWins > rightWins) {
    verdict = `Slight edge to the ${leftShort} on balance.`;
  } else if (rightWins > leftWins) {
    verdict = `Slight edge to the ${rightShort} on balance.`;
  }

  return {
    left: leftTrimmed,
    right: rightTrimmed,
    leftName,
    rightName,
    verdict,
  };
}

function SummaryPointRow({ point }: { point: SummaryPoint }) {
  const warning = point.tone === "warning";
  return (
    <li
      className={cn(
        "flex items-center gap-1.5 text-[13px] leading-snug",
        warning ? "text-[#B45309]" : "text-navy",
      )}
    >
      {warning ? (
        <AlertTriangle
          className="h-3.5 w-3.5 shrink-0 text-[#B45309]"
          strokeWidth={2.25}
          aria-hidden
        />
      ) : (
        <span className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[#23A05C] text-white">
          <Check className="h-2 w-2" strokeWidth={3} aria-hidden />
        </span>
      )}
      <span className="truncate">{point.text}</span>
    </li>
  );
}

function QuickSummaryBlock({
  left,
  right,
  rows,
}: {
  left: VehicleRecord;
  right: VehicleRecord;
  rows: CompareRow[];
}) {
  const summary = buildQuickSummary(left, right, rows);

  return (
    <div className="flex min-h-[120px] max-h-[150px] items-stretch overflow-hidden rounded-[12px] border border-border bg-white px-4 py-3.5">
      <div className="flex w-[22%] min-w-[160px] max-w-[220px] shrink-0 flex-col justify-center pr-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
          Our take
        </p>
        <p className="mt-1.5 text-[14px] font-semibold leading-snug text-navy">
          {summary.verdict}
        </p>
      </div>

      <div className="w-px shrink-0 self-stretch bg-[#E6EBF2]" aria-hidden />

      <div className="flex min-w-0 flex-1 flex-col justify-center px-4">
        <p className="text-[12px] font-semibold text-navy">
          {summary.leftName}
        </p>
        <ul className="mt-1.5 space-y-1">
          {(summary.left.length > 0
            ? summary.left
            : [{ text: "Solid overall balance", tone: "success" as const }]
          ).map((point) => (
            <SummaryPointRow key={`left-${point.text}`} point={point} />
          ))}
        </ul>
      </div>

      <div className="w-px shrink-0 self-stretch bg-[#E6EBF2]" aria-hidden />

      <div className="flex min-w-0 flex-1 flex-col justify-center pl-4">
        <p className="text-[12px] font-semibold text-navy">
          {summary.rightName}
        </p>
        <ul className="mt-1.5 space-y-1">
          {(summary.right.length > 0
            ? summary.right
            : [{ text: "Solid overall balance", tone: "success" as const }]
          ).map((point) => (
            <SummaryPointRow key={`right-${point.text}`} point={point} />
          ))}
        </ul>
      </div>
    </div>
  );
}

function DesktopVehiclePanel({
  record,
  showImageCaption = false,
}: {
  record: VehicleRecord;
  showImageCaption?: boolean;
}) {
  const name = shortName(record);
  const subtitle = cardSubtitle(record);
  const score = record.buyerScore?.score ?? null;
  const bandLabel = record.buyerScore?.label;
  const litres = formatEngineLitres(record.summary.engineCapacity);

  const specs = [
    { icon: Fuel, value: record.summary.fuelType },
    { icon: Settings2, value: record.summary.transmission },
    { icon: EngineIcon, value: litres },
  ].filter((s) => Boolean(s.value));

  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] items-center gap-2.5 px-3 py-2.5 lg:gap-3.5 lg:px-4 lg:py-3">
      <div className="min-w-0">
        <VehicleThumbnail
          label={name}
          src={record.summary.imageSrc}
          light
          className="aspect-[2.1/1] border-0 shadow-none"
          imageClassName="object-contain object-center p-0 scale-[0.95]"
        />
        {showImageCaption ? (
          <VehicleImageCaption
            summary={record.summary}
            className="relative z-10 -mt-1 text-center text-[9px] leading-tight"
          />
        ) : null}
      </div>

      <div className="min-w-0">
        <div className="inline-flex items-center rounded-[6px] bg-[#FACC35] px-2.5 py-1">
          <span className="text-[15px] font-bold tracking-[0.05em] text-black lg:text-[16px]">
            {record.summary.displayRegistration}
          </span>
        </div>
        <h3 className="mt-1.5 text-[20px] font-bold tracking-tight text-navy lg:text-[22px]">
          {name}
        </h3>
        {subtitle ? (
          <p className="mt-0.5 text-[13px] font-medium text-[#64748B]">
            {subtitle}
          </p>
        ) : null}

        <div className="mt-2 flex flex-nowrap items-center gap-x-3 overflow-hidden">
          {specs.map((spec) => {
            const Icon = spec.icon;
            return (
              <div
                key={`${spec.value}`}
                className="flex shrink-0 items-center gap-1.5 text-[12px] font-medium text-[#475569]"
              >
                <Icon
                  className="h-3.5 w-3.5 shrink-0 text-navy/70"
                  strokeWidth={2}
                />
                <span className="whitespace-nowrap">{spec.value}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-2.5 rounded-[10px] bg-[#E8F6EE] px-3 py-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">
                Buyer Score
                <InfoTip
                  label="About Buyer Score"
                  text={buyerScoreDisclaimer()}
                />
              </div>
              <div className="mt-0.5 text-[22px] font-extrabold leading-none tabular-nums text-[#157A45] lg:text-[24px]">
                {score == null ? "-" : score}
                <span className="text-[13px] font-semibold text-[#64748B]">
                  /100
                </span>
              </div>
            </div>
            {bandLabel ? (
              <p className="text-[13px] font-semibold text-[#157A45]">
                {bandLabel}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopCompareHero({
  left,
  right,
  demo = false,
}: {
  left: VehicleRecord;
  right: VehicleRecord;
  demo?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-border bg-white shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2 lg:px-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-navy">
            {demo ? "Example comparison" : "Comparison"}
          </p>
          {demo ? <StatusBadge tone="info">Demo data</StatusBadge> : null}
        </div>
        <p className="text-[13px] text-muted">
          {demo
            ? "Two premium SUVs compared side by side"
            : "Key details compared side by side"}
        </p>
      </div>

      <div className="relative grid grid-cols-2">
        <DesktopVehiclePanel record={left} showImageCaption={demo} />
        <div className="relative border-l border-border">
          <DesktopVehiclePanel record={right} showImageCaption={demo} />
        </div>
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-[#EFF4FA] text-[12px] font-bold tracking-wide text-navy shadow-[0_1px_4px_rgba(7,26,61,0.06)]">
          VS
        </div>
      </div>
    </div>
  );
}

function TableVehicleHeader({ record }: { record: VehicleRecord }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-[62px] shrink-0">
        <VehicleThumbnail
          label={shortName(record)}
          src={record.summary.imageSrc}
          light
          className="aspect-[4/3] border-0"
        />
      </div>
      <div className="min-w-0">
        <div className="truncate text-[16px] font-semibold text-navy">
          {shortName(record)}
        </div>
        <div className="truncate text-[13px] text-muted">
          {record.summary.displayRegistration}
        </div>
      </div>
    </div>
  );
}

export function VehicleComparison({
  left,
  right,
  demo = false,
}: {
  left: VehicleRecord;
  right: VehicleRecord;
  demo?: boolean;
}) {
  const rows = buildRows(left, right);

  return (
    <div>
      {/* Desktop */}
      <div className="hidden space-y-3.5 md:block">
        <DesktopCompareHero left={left} right={right} demo={demo} />

        <div className="overflow-hidden rounded-[14px] border border-border bg-white shadow-[var(--shadow-card)]">
          <table className="min-w-full table-fixed text-[15px]">
            <colgroup>
              <col className="w-[28%]" />
              <col className="w-[36%]" />
              <col className="w-[36%]" />
            </colgroup>
            <thead className="bg-white">
              <tr>
                <th className="px-4 py-3 text-left text-[16px] font-semibold text-muted">
                  Compare
                </th>
                <th className="px-4 py-3 text-left">
                  <TableVehicleHeader record={left} />
                </th>
                <th className="px-4 py-3 text-left">
                  <TableVehicleHeader record={right} />
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const Icon = row.icon;
                return (
                  <tr key={row.key} className="border-t border-border">
                    <th className="h-12 whitespace-nowrap bg-[#FBFCFE] px-4 py-2.5 text-left align-middle text-[13px] font-semibold text-[#475569]">
                      <span className="inline-flex items-center gap-2">
                        <Icon
                          className="h-4 w-4 shrink-0 text-navy/65"
                          strokeWidth={2}
                        />
                        {row.label}
                        {row.labelExtra}
                      </span>
                    </th>
                    <td
                      className={cn(
                        "h-12 px-4 py-2.5 align-middle text-[15px] font-medium text-navy md:text-[16px]",
                        toneClass(row.leftTone),
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">{row.left}</div>
                        <WinMark show={row.leftTone === "success"} />
                      </div>
                    </td>
                    <td
                      className={cn(
                        "h-12 px-4 py-2.5 align-middle text-[15px] font-medium text-navy md:text-[16px]",
                        toneClass(row.rightTone),
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">{row.right}</div>
                        <WinMark show={row.rightTone === "success"} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <QuickSummaryBlock left={left} right={right} rows={rows} />
      </div>

      {/* Mobile - unchanged */}
      <div className="md:hidden">
        {demo ? (
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <StatusBadge tone="info">Demo data</StatusBadge>
            <p className="text-[13px] text-muted">
              See how these two cars compare side by side.
            </p>
          </div>
        ) : null}
        <VehicleComparisonMobile
          left={left}
          right={right}
          showImageCaption={demo}
        />
      </div>
    </div>
  );
}
