"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  buyerScoreBandLabel,
  buyerScoreInsufficientMessage,
} from "@/lib/vehicle/score";
import type { BuyerScoreBand, BuyerScoreResult } from "@/types/vehicle";

function bandColor(band: BuyerScoreBand | null): string {
  if (band === "excellent-history") return "#1F7A4D";
  if (band === "good-history") return "#2F6FED";
  if (band === "mixed-history") return "#CA8A04";
  if (band === "needs-attention") return "#DC2626";
  return "#64748B";
}

export function ScoreGauge({
  result,
  className,
}: {
  result: BuyerScoreResult | null;
  className?: string;
  score?: number | null;
  size?: number;
}) {
  const [ready, setReady] = useState(false);
  const value =
    result?.score == null ? null : Math.max(0, Math.min(100, result.score));
  const band = result?.band ?? null;
  const bandLabel = result?.label ?? buyerScoreBandLabel(band);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={cn(
        "flex w-full max-w-[220px] shrink-0 flex-col gap-1 sm:max-w-[240px]",
        className,
      )}
      role="img"
      aria-label={
        value == null
          ? buyerScoreInsufficientMessage()
          : `Buyer score ${value} out of 100, ${bandLabel}`
      }
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted">
          Buyer score
        </span>
        <span className="flex items-baseline gap-1.5">
          <span className="text-[18px] font-extrabold tabular-nums leading-none text-navy">
            {value == null ? "-" : value}
          </span>
          <span className="text-[12px] font-medium text-muted">/100</span>
        </span>
      </div>

      <div className="relative h-3 rounded-full border border-border bg-[#EEF2F7] p-[2px]">
        <div
          className="pointer-events-none absolute inset-x-2 top-1/2 h-px -translate-y-1/2 opacity-40"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0 10%, #94A3B8 10% 11%)",
          }}
          aria-hidden
        />

        <div
          className="relative h-full overflow-hidden rounded-full"
          style={{
            background:
              "linear-gradient(90deg, #DC2626 0%, #F59E0B 42%, #84CC16 72%, #16A34A 100%)",
          }}
        >
          <div
            className="absolute inset-y-0 right-0 bg-[#EEF2F7]/85 transition-[left] duration-700 ease-out"
            style={{ left: ready && value != null ? `${value}%` : "0%" }}
          />
        </div>

        {value != null ? (
          <span
            className="absolute top-1/2 z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[2px] border-white bg-navy shadow-sm transition-[left] duration-700 ease-out"
            style={{
              left: ready
                ? `calc(2px + (100% - 4px) * ${value / 100})`
                : "2px",
            }}
          />
        ) : null}
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted">
        <span>0</span>
        {value != null && band ? (
          <span className="font-semibold" style={{ color: bandColor(band) }}>
            {bandLabel}
          </span>
        ) : (
          <span className="max-w-[70%] truncate text-center font-medium">
            Insufficient history
          </span>
        )}
        <span>100</span>
      </div>
    </div>
  );
}
