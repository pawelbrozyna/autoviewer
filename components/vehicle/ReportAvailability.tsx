import { CheckCircle2 } from "lucide-react";
import type { VehicleRecord } from "@/types/vehicle";

export function ReportAvailability({ vehicle }: { vehicle: VehicleRecord }) {
  const { summary } = vehicle;
  const available = [
    summary.make && summary.make !== "Unknown"
      ? "Vehicle identity basics"
      : null,
    summary.tax.status !== "Unknown" ? "Tax status" : null,
    summary.motStatus.status !== "Unknown" ? "MOT status" : null,
    vehicle.motTests.length > 0 ? "MOT history and advisories" : null,
    vehicle.mileageHistory.length > 0 ? "Recorded mileage history" : null,
    vehicle.dataQuality.sources.includes("DVLA")
      ? "DVLA registration details"
      : null,
  ].filter((item): item is string => Boolean(item));

  if (available.length === 0) return null;

  return (
    <section className="rounded-[12px] border border-border bg-white p-4 md:p-5">
      <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-blue">
        Available and checked
      </p>
      <ul className="mt-3 grid gap-x-5 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
        {available.map((item) => (
          <li
            key={item}
            className="flex items-center gap-2 text-[14px] font-medium text-navy"
          >
            <CheckCircle2
              className="h-4 w-4 shrink-0 text-success"
              aria-hidden
            />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
