import type { MileagePoint } from "@/types/vehicle";

export function MileageChart({ points }: { points: MileagePoint[] }) {
  if (points.length < 2) {
    return (
      <div className="rounded-[12px] border border-border bg-surface-soft px-4 py-8 text-center text-sm text-muted">
        Not enough mileage readings for a chart.
      </div>
    );
  }

  const sorted = [...points].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const values = sorted.map((p) => p.mileage);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const width = 560;
  const height = 180;
  const padX = 24;
  const padY = 20;

  const coords = sorted.map((point, index) => {
    const x =
      padX + (index / Math.max(sorted.length - 1, 1)) * (width - padX * 2);
    const y =
      height - padY - ((point.mileage - min) / range) * (height - padY * 2);
    return { x, y, point };
  });

  const path = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");

  return (
    <div className="rounded-[12px] border border-border bg-white p-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Mileage history chart"
        className="h-auto w-full"
      >
        <title>Mileage history</title>
        <path
          d={path}
          fill="none"
          stroke="#1769E0"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {coords.map((c) => (
          <circle
            key={`${c.point.date}-${c.point.mileage}`}
            cx={c.x}
            cy={c.y}
            r="4"
            fill="#071A3D"
          />
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-xs text-muted">
        <span>{sorted[0].mileage.toLocaleString("en-GB")} miles</span>
        <span>{sorted[sorted.length - 1].mileage.toLocaleString("en-GB")} miles</span>
      </div>
    </div>
  );
}
