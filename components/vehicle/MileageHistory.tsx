import { detectMileageAnomaly, formatMileage } from "@/lib/vehicle/mileage";
import { formatDateUk } from "@/lib/utils";
import type { MileagePoint } from "@/types/vehicle";
import { MileageChart } from "@/components/vehicle/MileageChart";

export function MileageHistory({ points }: { points: MileagePoint[] }) {
  const sorted = [...points].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const anomaly = detectMileageAnomaly(points);

  return (
    <div className="space-y-4">
      <MileageChart points={points} />
      {anomaly.hasAnomaly ? (
        <div
          role="status"
          className="rounded-[10px] border border-warning/25 bg-warning-bg px-4 py-3 text-[15px] text-warning"
        >
          <strong className="font-semibold">Possible mileage inconsistency.</strong>{" "}
          {anomaly.message}
        </div>
      ) : null}
      <div className="overflow-x-auto rounded-[12px] border border-border">
        <table className="min-w-full text-left text-[15px]">
          <thead className="bg-surface-soft text-[13px] font-semibold uppercase tracking-wide text-muted md:text-[14px]">
            <tr>
              <th className="whitespace-nowrap px-4 py-2.5">Date</th>
              <th className="px-4 py-2.5">Mileage</th>
              <th className="px-4 py-2.5">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.map((point) => (
              <tr key={`${point.date}-${point.mileage}`} className="h-11">
                <td className="whitespace-nowrap px-4 py-2.5 text-navy">
                  {formatDateUk(point.date)}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 font-medium text-navy">
                  {formatMileage(point.mileage)}
                </td>
                <td className="px-4 py-2.5 text-muted">{point.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
