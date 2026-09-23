import { FreeReportHtml } from "@/components/reports/FreeReportHtml";
import type { VehicleRecord } from "@/types/vehicle";

/** Homepage crop of the free report HTML (page 1 preview + fade CTA). */
export function SampleReportPreview({ vehicle }: { vehicle: VehicleRecord }) {
  return <FreeReportHtml vehicle={vehicle} mode="preview" />;
}
