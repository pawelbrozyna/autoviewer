"use client";

import { LiveVehicleReportSection } from "@/components/reports/VehicleReportSection";
import { useDvlaLookup } from "@/components/vehicle/DvlaLookupContext";

export function DvlaLookupReport() {
  const lookup = useDvlaLookup();
  if (!lookup?.vehicle) return null;

  return (
    <LiveVehicleReportSection
      vehicle={lookup.vehicle}
      headingLevel="h2"
      className="border-b border-border"
    />
  );
}
