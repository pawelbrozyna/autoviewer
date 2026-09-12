import { cn } from "@/lib/utils";

export function LoadingState({
  message = "Checking vehicle…",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-[12px] border border-border bg-surface px-6 py-12 text-center",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-blue"
        aria-hidden="true"
      />
      <p className="text-[15px] font-semibold text-navy">{message}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[12px] border border-dashed border-border bg-surface-soft px-6 py-10 text-center",
        className,
      )}
    >
      <h3 className="heading-card">{title}</h3>
      {description ? (
        <p className="support-copy mx-auto mt-2 max-w-md">{description}</p>
      ) : null}
    </div>
  );
}

export function ErrorState({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[12px] border border-danger/20 bg-danger-bg px-6 py-8 text-center",
        className,
      )}
      role="alert"
    >
      <h3 className="heading-card text-danger">{title}</h3>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-[15px] text-danger/90">{description}</p>
      ) : null}
    </div>
  );
}
