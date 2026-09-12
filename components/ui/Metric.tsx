import { cn } from "@/lib/utils";

export function Metric({
  label,
  value,
  hint,
  icon,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[10px] border border-border bg-surface px-4 py-3.5",
        className,
      )}
    >
      <div className="mb-1.5 flex items-center gap-2 text-muted">
        {icon}
        <span className="text-[12px] font-semibold uppercase tracking-wide md:text-[13px]">
          {label}
        </span>
      </div>
      <div className="whitespace-nowrap text-[1.35rem] font-bold tracking-tight text-navy md:text-[1.45rem]">
        {value}
      </div>
      {hint ? <p className="meta-copy mt-0.5">{hint}</p> : null}
    </div>
  );
}
