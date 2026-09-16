"use client";

import { useId, useState } from "react";
import { AlertTriangle, LoaderCircle } from "lucide-react";
import {
  formatRegistrationDisplay,
  isValidRegistrationFormat,
  normalizeRegistration,
} from "@/lib/vehicle/registration";
import { cn } from "@/lib/utils";

type Variant = "large" | "compact";

export function RegistrationInput({
  id,
  name = "registration",
  defaultValue = "",
  value,
  onChange,
  onSubmitValid,
  buttonLabel = "Check vehicle →",
  variant = "large",
  className,
  showButton = true,
  disabled = false,
  reserveErrorSpace = true,
  loading = false,
  externalError,
}: {
  id?: string;
  name?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (normalized: string, display: string) => void;
  onSubmitValid?: (normalized: string) => void;
  buttonLabel?: string;
  variant?: Variant;
  className?: string;
  showButton?: boolean;
  disabled?: boolean;
  reserveErrorSpace?: boolean;
  loading?: boolean;
  externalError?: string | null;
}) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;
  const externalErrorId = `${inputId}-external-error`;
  const [internal, setInternal] = useState(defaultValue.toUpperCase());
  const [error, setError] = useState<string | null>(null);
  const current = value ?? internal;

  function update(nextRaw: string) {
    const display = nextRaw.toUpperCase().replace(/[^A-Z0-9 ]/g, "");
    const normalized = normalizeRegistration(display);
    if (value === undefined) setInternal(display);
    onChange?.(normalized, display);
    if (error) setError(null);
  }

  function validateAndSubmit() {
    const normalized = normalizeRegistration(current);
    if (!isValidRegistrationFormat(normalized)) {
      setError("Enter a valid UK registration number.");
      return;
    }
    setError(null);
    if (value === undefined) {
      setInternal(formatRegistrationDisplay(normalized));
    }
    onSubmitValid?.(normalized);
  }

  const notFound = externalError?.toLowerCase().includes("not found") ?? false;
  const inlineErrorLabel = notFound ? "Not found" : "Try again";

  return (
    <div className={cn("w-full lg:w-fit lg:max-w-full", className)}>
      <label htmlFor={inputId} className="sr-only">
        UK vehicle registration
      </label>
      <div className="flex w-full flex-col gap-2 lg:w-fit lg:max-w-full lg:flex-row lg:items-stretch">
        <div
          className={cn(
            "flex min-h-[54px] w-full overflow-hidden rounded-[10px] border border-border bg-white shadow-[var(--shadow-card)] lg:min-h-[49px] lg:w-[340px] lg:shrink-0",
            (error || externalError) && "border-danger",
            variant === "compact" && "min-h-[48px] lg:min-h-[44px]",
          )}
        >
          <div
      className="flex w-14 shrink-0 flex-col items-center justify-center gap-0.5 bg-[#003399] font-semibold leading-none text-white"
            aria-hidden="true"
          >
            <span className="text-[16px] leading-none">🇬🇧</span>
            <span className="text-[16px] tracking-wide">GB</span>
          </div>
          <div className="relative min-w-0 flex-1">
            <input
              id={inputId}
              name={name}
              type="text"
              inputMode="text"
              autoComplete="off"
              spellCheck={false}
              maxLength={10}
              placeholder="AB12 CDE"
              disabled={disabled || loading}
              value={current}
              onChange={(e) => update(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (showButton) validateAndSubmit();
                }
              }}
              onBlur={() => {
                const normalized = normalizeRegistration(current);
                if (normalized) {
                  const pretty = formatRegistrationDisplay(normalized);
                  if (value === undefined) setInternal(pretty);
                }
              }}
              aria-invalid={Boolean(error || externalError)}
              aria-describedby={
                error
                  ? errorId
                  : externalError
                    ? externalErrorId
                    : undefined
              }
              className={cn(
                "h-full w-full border-0 bg-transparent px-3.5 text-[1.125rem] font-medium tracking-[0.08em] text-navy placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:outline-none lg:text-[1.05rem]",
                variant === "compact" && "text-[1.05rem] lg:text-[1rem]",
              )}
            />
            {externalError && current ? (
              <div
                className="pointer-events-none absolute inset-y-0 left-3.5 right-2 flex items-center overflow-hidden"
                aria-hidden
              >
                <span
                  className={cn(
                    "invisible shrink-0 whitespace-pre text-[1.125rem] font-medium tracking-[0.08em] lg:text-[1.05rem]",
                    variant === "compact" && "text-[1.05rem] lg:text-[1rem]",
                  )}
                >
                  {current}
                </span>
                <span className="ml-[89px] inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold tracking-normal text-danger md:ml-[69px]">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span className="max-[380px]:hidden">{inlineErrorLabel}</span>
                </span>
              </div>
            ) : null}
          </div>
        </div>
        {showButton ? (
          <button
            type="button"
            disabled={disabled || loading}
            onClick={validateAndSubmit}
            className={cn(
              "relative inline-flex min-h-[54px] shrink-0 items-center justify-center rounded-[10px] bg-navy px-5 text-[19px] font-semibold text-white transition-all duration-150 hover:bg-navy-soft hover:shadow-md hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-none disabled:hover:brightness-100 sm:min-h-[54px] lg:min-h-[49px] lg:px-4.5 lg:text-[17.5px]",
              variant === "compact" &&
                "min-h-[48px] px-4 text-[17px] lg:min-h-[44px] lg:text-[15.5px]",
            )}
          >
            <span className={cn(loading && "invisible")}>{buttonLabel}</span>
            {loading ? (
              <span className="absolute inset-0 flex items-center justify-center gap-2 text-[15px]">
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
                Checking...
              </span>
            ) : null}
          </button>
        ) : null}
      </div>
      {error || (showButton && reserveErrorSpace) ? (
        <p
          id={errorId}
          role="alert"
          aria-live="polite"
          className={cn(
            "mt-1.5 min-h-[1.1rem] text-[14px] text-danger md:text-[15px]",
            !error && "invisible",
          )}
        >
          {error || "placeholder"}
        </p>
      ) : null}
      {externalError ? (
        <p
          id={externalErrorId}
          role="alert"
          aria-live="polite"
          className="sr-only"
        >
          {notFound
            ? "No vehicle found. Check the registration and try again."
            : externalError}
        </p>
      ) : null}
    </div>
  );
}
