"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  buyerScoreBandLabel,
  buyerScoreDisclaimer,
  buyerScoreInsufficientMessage,
} from "@/lib/vehicle/score";
import type { BuyerScoreResult } from "@/types/vehicle";

export function BuyerScore({
  result,
  compact = false,
  className,
}: {
  result: BuyerScoreResult | null;
  compact?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const score = result?.score ?? null;
  const bandLabel = result?.label ?? buyerScoreBandLabel(result?.band ?? null);

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-muted md:text-[13px]">
            AutoViewer Buyer Score
            <button
              type="button"
              className="text-muted hover:text-blue"
              aria-label="About AutoViewer Buyer Score"
              onClick={() => setOpen((v) => !v)}
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </div>
          {score == null ? (
            <p className="text-[14px] font-medium leading-snug text-muted md:text-[15px]">
              {buyerScoreInsufficientMessage()}
            </p>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-[1.35rem] font-extrabold text-navy md:text-[1.45rem]">
                {score}/100
              </span>
              {!compact ? (
                <span className="text-[13px] font-semibold text-navy/80">
                  {bandLabel}
                </span>
              ) : null}
            </div>
          )}
          {compact && score != null ? (
            <p className="meta-copy">{bandLabel}</p>
          ) : null}
        </div>
      </div>
      {open ? (
        <div
          role="tooltip"
          className="absolute left-0 top-full z-20 mt-2 w-64 rounded-md border border-border bg-white p-3 text-[13px] leading-relaxed text-muted shadow-sm"
        >
          {buyerScoreDisclaimer()}
        </div>
      ) : null}
    </div>
  );
}
