"use client";

import { useState } from "react";
import { Download, LoaderCircle } from "lucide-react";
import { downloadVehicleReportPdf } from "@/lib/reports/pdf";
import type { VehicleRecord } from "@/types/vehicle";

export function FreeReportActions({
  vehicle,
  ownersLabel,
}: {
  vehicle: VehicleRecord;
  ownersLabel?: string | null;
}) {
  const [downloading, setDownloading] = useState(false);

  async function download() {
    setDownloading(true);
    try {
      await downloadVehicleReportPdf(vehicle, { ownersLabel });
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-[13px] font-semibold text-success">
        Free report available online
      </span>
      <button
        type="button"
        onClick={download}
        disabled={downloading}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[9px] border border-border bg-white px-3.5 text-[14px] font-semibold text-navy transition hover:border-navy/30 hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
      >
        {downloading ? (
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Download className="h-4 w-4" aria-hidden />
        )}
        {downloading ? "Generating PDF..." : "Download PDF"}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {downloading ? "Generating PDF" : ""}
      </span>
    </div>
  );
}
