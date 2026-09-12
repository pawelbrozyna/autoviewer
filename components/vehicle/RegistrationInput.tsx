"use client";

import { useId, useState } from "react";
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
}) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;
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
    onSubmitValid?.(normalized);
  }

  return (
    <div className={cn("w-full lg:w-fit lg:max-w-full", className)}>
      <label htmlFor={inputId} className="sr-only">
        UK vehicle registration
      </label>
      <div className="flex w-full flex-col gap-2 lg:w-fit lg:max-w-full lg:flex-row lg:items-stretch">
        <div
          className={cn(
            "flex min-h-[54px] w-full overflow-hidden rounded-[10px] border border-border bg-white shadow-[var(--shadow-card)] lg:min-h-[49px] lg:w-[340px] lg:shrink-0",
            error && "border-danger",
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
          <input
            id={inputId}
            name={name}
            type="text"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            maxLength={10}
            placeholder="AB12 CDE"
            disabled={disabled}
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
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              "w-full border-0 bg-transparent px-3.5 text-[1.125rem] font-medium tracking-[0.08em] text-navy placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:outline-none lg:text-[1.05rem]",
              variant === "compact" && "text-[1.05rem] lg:text-[1rem]",
            )}
          />
        </div>
        {showButton ? (
          <button
            type="button"
            disabled={disabled}
            onClick={validateAndSubmit}
            className={cn(
              "inline-flex min-h-[54px] shrink-0 items-center justify-center rounded-[10px] bg-navy px-5 text-[19px] font-semibold text-white transition-all duration-150 hover:bg-navy-soft hover:shadow-md hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-none disabled:hover:brightness-100 sm:min-h-[54px] lg:min-h-[49px] lg:px-4.5 lg:text-[17.5px]",
              variant === "compact" &&
                "min-h-[48px] px-4 text-[17px] lg:min-h-[44px] lg:text-[15.5px]",
            )}
          >
            {buttonLabel}
          </button>
        ) : null}
      </div>
      {error || showButton ? (
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
    </div>
  );
}
