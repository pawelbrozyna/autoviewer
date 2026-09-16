"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ChevronRight,
  ClipboardList,
  Gauge,
  Landmark,
  ShieldAlert,
} from "lucide-react";
import { InfoTip } from "@/components/ui/InfoTip";
import { VehicleImageCaption } from "@/components/vehicle/VehicleImageCaption";
import { VehicleThumbnail } from "@/components/vehicle/VehicleThumbnail";
import { formatEngineLitres } from "@/lib/vehicle/engine";
import {
  buyerScoreDisclaimer,
  buyerScoreInsufficientMessage,
} from "@/lib/vehicle/score";
import { cn } from "@/lib/utils";
import type { BuyerScoreBand, VehicleRecord } from "@/types/vehicle";

type StatusTone = "success" | "warning" | "danger" | "neutral";

type StatusRow = {
  id: string;
  href: string;
  label: string;
  value: string;
  tone: StatusTone;
  showAlert?: boolean;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
};

function displayVehicleName(make: string, model: string) {
  const parts = model.trim().split(/\s+/);
  const derivativeIndex = parts.findIndex(
    (part, index) => index > 0 && /^\d+(?:\.\d+)?(?:d|i)?$/i.test(part),
  );
  const modelParts =
    derivativeIndex > 0 ? parts.slice(0, derivativeIndex) : parts.slice(0, 1);
  return {
    name: `${make} ${modelParts.join(" ")}`.trim(),
    derivative:
      derivativeIndex > 0 ? parts.slice(derivativeIndex).join(" ") : null,
  };
}

function engineLine(
  model: string,
  engineCapacity?: number | null,
): string | null {
  const tsi = model.match(/(\d+(?:\.\d+)?)\s*TSI/i);
  if (tsi) return `${tsi[1]} TSI`;
  return formatEngineLitres(engineCapacity);
}

function shortBandLabel(band: BuyerScoreBand | null | undefined): string {
  if (band === "excellent-history") return "Excellent";
  if (band === "good-history") return "Good";
  if (band === "mixed-history") return "Mixed";
  if (band === "needs-attention") return "Attention";
  return "Unavailable";
}

function bandDescription(band: BuyerScoreBand | null | undefined): string {
  if (band === "excellent-history") {
    return "This vehicle looks in excellent condition based on available data.";
  }
  if (band === "good-history") {
    return "This vehicle looks in good condition based on available data.";
  }
  if (band === "mixed-history") {
    return "This vehicle has a mixed history based on available data.";
  }
  if (band === "needs-attention") {
    return "This vehicle may need closer attention based on available data.";
  }
  return buyerScoreInsufficientMessage();
}

function scoreFillColor(band: BuyerScoreBand | null | undefined): string {
  if (band === "excellent-history" || band === "good-history") return "#23A05C";
  if (band === "mixed-history") return "#CA8A04";
  if (band === "needs-attention") return "#D93025";
  return "#94A3B8";
}

function pillClasses(tone: StatusTone) {
  if (tone === "success") return "bg-[#E2F3EC] text-[#157A45]";
  if (tone === "warning") return "bg-[#FFF4E5] text-[#B45309]";
  if (tone === "danger") return "bg-[#FDE9E7] text-[#D93025]";
  return "bg-[#F1F5F9] text-[#012046]";
}

function bandPillClasses(band: BuyerScoreBand | null | undefined) {
  if (band === "needs-attention") return "bg-[#FDE9E7] text-[#D93025]";
  if (band === "mixed-history") return "bg-[#FFF4E5] text-[#B45309]";
  return "bg-[#E2F3EC] text-[#157A45]";
}

function sectionHref(basePath: string | undefined, hash: string) {
  if (!basePath) return hash;
  return `${basePath}${hash}`;
}

function buildStatusRows(
  vehicle: VehicleRecord,
  basePath?: string,
): StatusRow[] {
  const { summary, buyerScore } = vehicle;
  const reasons = buyerScore?.reasons ?? [];

  const mot =
    summary.motStatus.status === "Valid"
      ? { value: "Good", tone: "success" as const }
      : summary.motStatus.status === "Expired"
        ? { value: "Expired", tone: "danger" as const }
        : summary.motStatus.status === "No MOT"
          ? { value: "No MOT", tone: "warning" as const }
          : { value: "Unknown", tone: "neutral" as const };

  const hasMileageIssue = reasons.some(
    (r) => r.type === "mileage-inconsistency" || r.type === "mileage-drop",
  );
  const hasMileageOk = reasons.some((r) => r.type === "mileage-consistency");
  const mileage = hasMileageIssue
    ? { value: "Check", tone: "warning" as const }
    : hasMileageOk || (vehicle.mileageHistory?.length ?? 0) >= 2
      ? { value: "Consistent", tone: "success" as const }
      : { value: "Limited", tone: "neutral" as const };

  const taxStatus = summary.tax.status?.toLowerCase() ?? "";
  const tax =
    taxStatus === "taxed"
      ? { value: "Taxed", tone: "success" as const }
      : taxStatus === "sorn"
        ? { value: "SORN", tone: "warning" as const }
        : taxStatus.includes("untax") || taxStatus === "not taxed"
          ? { value: summary.tax.status || "Untaxed", tone: "danger" as const }
          : {
              value: summary.tax.status || "Unknown",
              tone: "neutral" as const,
            };

  const recalls =
    summary.recalls.dataAvailable === false
      ? {
          value: "Not available",
          tone: "neutral" as const,
          showAlert: false,
        }
      : summary.recalls.hasOpenRecalls && summary.recalls.count > 0
      ? {
          value: `${summary.recalls.count} open`,
          tone: "danger" as const,
          showAlert: true,
        }
      : { value: "None", tone: "success" as const, showAlert: false };

  return [
    {
      id: "mot",
      href: sectionHref(basePath, "#mot-history"),
      label: "MOT",
      value: mot.value,
      tone: mot.tone,
      icon: ClipboardList,
    },
    {
      id: "mileage",
      href: sectionHref(basePath, "#mileage-history"),
      label: "Mileage",
      value: mileage.value,
      tone: mileage.tone,
      icon: Gauge,
    },
    {
      id: "tax",
      href: sectionHref(basePath, "#tax-information"),
      label: "Tax",
      value: tax.value,
      tone: tax.tone,
      icon: Landmark,
    },
    {
      id: "recalls",
      href: sectionHref(basePath, "#recall-information"),
      label: "Recalls",
      value: recalls.value,
      tone: recalls.tone,
      showAlert: recalls.showAlert,
      icon: ShieldAlert,
    },
  ];
}

export function VehicleSummaryMobile({
  vehicle,
  titleAs = "h1",
  reportPath,
  className,
  largerImage = false,
  showDerivative = false,
  showCta = true,
}: {
  vehicle: VehicleRecord;
  titleAs?: "h1" | "h2";
  reportPath?: string;
  className?: string;
  largerImage?: boolean;
  showDerivative?: boolean;
  showCta?: boolean;
}) {
  const { summary, buyerScore } = vehicle;
  const [ready, setReady] = useState(false);
  const score = buyerScore?.score ?? null;
  const band = buyerScore?.band ?? null;
  const rows = buildStatusRows(vehicle, reportPath);
  const ctaHref = reportPath || "#mot-history";
  const TitleTag = titleAs;
  const { name: displayName, derivative } = displayVehicleName(
    summary.make,
    summary.model,
  );
  const engine = engineLine(summary.model, summary.engineCapacity);
  const detailParts = [
    summary.year?.toString(),
    engine,
    summary.fuelType,
  ].filter(Boolean);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <div className={cn("text-[#012046]", className)}>
      {/* Vehicle header */}
      <div className="relative flex items-start gap-1.5 overflow-visible">
        <div
          className={cn(
            "min-w-0 flex-1 pr-1",
            largerImage ? "pt-2" : "pt-9",
          )}
        >
          <div className="inline-flex items-center rounded-[6px] bg-[#FACC35] px-[10px] py-[6px]">
            <span className="text-[19px] font-bold leading-none tracking-[0.04em] text-black">
              {summary.displayRegistration}
            </span>
          </div>
          <TitleTag className="mt-3 whitespace-nowrap text-[22px] font-bold leading-[1.15] tracking-tight text-[#012046]">
            {displayName}
          </TitleTag>
          {showDerivative && derivative ? (
            <p className="mt-1 text-[14px] font-semibold leading-snug text-[#475569]">
              {derivative}
            </p>
          ) : null}
          {detailParts.length > 0 ? (
            <p className="mt-1 text-[14.5px] font-medium leading-snug text-[#64748B]">
              {detailParts.join(" · ")}
            </p>
          ) : null}
        </div>
        <div
          className={cn(
            "shrink-0 self-start",
            largerImage
              ? "mt-0 w-[194px] sm:w-[204px]"
              : "mt-6 w-[176px] sm:w-[185px]",
          )}
        >
          <VehicleThumbnail
            label={`${summary.make} ${summary.model}`.trim()}
            src={summary.imageSrc}
            variant="bare"
          />
        </div>
      </div>
      <VehicleImageCaption
        summary={summary}
        className="mt-1 text-center"
        stackColourOnMobile
      />

      {/* Buyer Score card */}
      <div className="relative z-10 mt-1.5 rounded-[15px] border border-border bg-[#F7F9FC] p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[17px] font-semibold text-[#012046]">
            Buyer Score
            <InfoTip
              label="About Buyer Score"
              text={buyerScoreDisclaimer()}
              className="[&_svg]:h-4 [&_svg]:w-4 [&_button]:text-[#64748B]"
            />
          </div>
          <div className="flex items-baseline gap-1.5 tabular-nums">
            <span className="text-[32px] font-extrabold leading-none text-[#012046]">
              {score == null ? "-" : score}
            </span>
            <span className="text-[19px] font-medium leading-none text-[#64748B]">
              / 100
            </span>
          </div>
        </div>

        <div className="mt-4 h-[10.5px] overflow-hidden rounded-full bg-[#E7EDF5]">
          <div
            className="h-full rounded-full transition-[width] duration-700 ease-out"
            style={{
              width: ready && score != null ? `${score}%` : "0%",
              backgroundColor: scoreFillColor(band),
            }}
          />
        </div>

        <div className="mt-4 flex items-start gap-3">
          {score != null && band ? (
            <>
              <span
                className={cn(
                  "inline-flex shrink-0 rounded-lg px-3 py-[7px] text-[14px] font-semibold",
                  bandPillClasses(band),
                )}
              >
                {shortBandLabel(band)}
              </span>
              <p className="min-w-0 pt-0.5 text-[14px] font-normal leading-[1.4] text-[#64748B]">
                {bandDescription(band)}
              </p>
            </>
          ) : (
            <p className="text-[14px] leading-[1.4] text-[#64748B]">
              {buyerScoreInsufficientMessage()}
            </p>
          )}
        </div>
      </div>

      {/* Status list card */}
      <div className="mt-3.5 overflow-hidden rounded-[15px] border border-border bg-[#FBFCFE]">
        <ul>
          {rows.map((row, index) => {
            const Icon = row.icon;
            const isLast = index === rows.length - 1;
            return (
              <li
                key={row.id}
                className={cn(!isLast && "border-b border-border")}
              >
                <a
                  href={row.href}
                  className="flex h-[56px] items-center px-4 outline-none transition-colors focus-visible:bg-[#F1F5F9] active:bg-[#F1F5F9]"
                >
                  <span className="flex w-7 shrink-0 items-center justify-start">
                    <Icon
                      className="h-6 w-6 text-[#012046]"
                      strokeWidth={2.15}
                      aria-hidden
                    />
                  </span>
                  <span className="ml-3 flex-1 text-[16.5px] font-semibold text-[#012046]">
                    {row.label}
                  </span>
                  <span
                    className={cn(
                      "inline-flex w-[6.75rem] shrink-0 items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[14px] font-semibold",
                      pillClasses(row.tone),
                    )}
                  >
                    {row.value}
                    {row.showAlert ? (
                      <AlertTriangle
                        className="h-3.5 w-3.5"
                        strokeWidth={2.35}
                        aria-hidden
                      />
                    ) : null}
                  </span>
                  <ChevronRight
                    className="ml-3 h-5 w-5 shrink-0 text-[#94A3B8]"
                    strokeWidth={2.25}
                    aria-hidden
                  />
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      {showCta ? (
        <a
          href={ctaHref}
          className="mt-3.5 flex h-[55px] w-full items-center justify-center rounded-[13px] bg-[#012046] text-[16.5px] font-semibold outline-none transition-colors hover:bg-[#0c2758] focus-visible:ring-2 focus-visible:ring-[#1769e0] focus-visible:ring-offset-2"
          style={{ color: "#FFFFFF" }}
        >
          <span style={{ color: "#FFFFFF" }}>View full report →</span>
        </a>
      ) : null}
    </div>
  );
}
