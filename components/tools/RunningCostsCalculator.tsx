"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Fuel,
  Shield,
  Wrench,
  FileText,
  CreditCard,
  type LucideIcon,
} from "lucide-react";
import { analytics } from "@/lib/analytics";
import { cn, formatGbp } from "@/lib/utils";

type FuelType = "Petrol" | "Diesel" | "Hybrid";

const MILEAGE_PRESETS = [5000, 8000, 10000, 12000] as const;

const FUEL_TYPES: FuelType[] = ["Petrol", "Diesel", "Hybrid"];

const BREAKDOWN_ICONS: Record<string, LucideIcon> = {
  fuel: Fuel,
  insurance: Shield,
  maintenance: Wrench,
  tax: FileText,
  finance: CreditCard,
};

const labelClass = "mb-2 block text-[15px] font-semibold text-navy md:text-[16px]";

const fieldClass =
  "w-full min-h-[52px] rounded-[10px] border border-border bg-white px-3.5 text-[16px] font-medium text-navy tabular-nums shadow-[var(--shadow-card)] placeholder:font-normal placeholder:text-slate-400 focus:border-blue/40 focus:outline-none focus:ring-2 focus:ring-blue/15 md:text-[17px]";

function parseNonNegative(raw: string): number {
  if (raw.trim() === "" || raw === ".") return 0;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

function formatPerMile(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "0p";
  if (value < 1) return `${Math.round(value * 100)}p`;
  return formatGbp(value);
}

export function RunningCostsCalculator() {
  const [fuelType, setFuelType] = useState<FuelType>("Petrol");
  const [annualMileage, setAnnualMileage] = useState("8000");
  const [mpg, setMpg] = useState("45");
  const [fuelPrice, setFuelPrice] = useState("1.45");
  const [roadTax, setRoadTax] = useState("195");
  const [insurance, setInsurance] = useState("650");
  const [maintenance, setMaintenance] = useState("400");
  const [financeEnabled, setFinanceEnabled] = useState(false);
  const [financeMonthly, setFinanceMonthly] = useState("0");

  const mileageN = parseNonNegative(annualMileage);
  const mpgN = parseNonNegative(mpg);
  const fuelPriceN = parseNonNegative(fuelPrice);
  const roadTaxN = parseNonNegative(roadTax);
  const insuranceN = parseNonNegative(insurance);
  const maintenanceN = parseNonNegative(maintenance);
  const financeMonthlyN = financeEnabled ? parseNonNegative(financeMonthly) : 0;

  const results = useMemo(() => {
    const gallons = mpgN > 0 ? mileageN / mpgN : 0;
    const litres = gallons * 4.54609;
    const fuelYear = litres * fuelPriceN;
    const financeYear = financeMonthlyN * 12;
    const total =
      fuelYear + roadTaxN + insuranceN + maintenanceN + financeYear;
    const monthly = total / 12;
    const perMile = mileageN > 0 ? total / mileageN : 0;

    const parts = [
      {
        key: "fuel",
        label: "Fuel",
        short: "Fuel",
        value: fuelYear,
        color: "bg-blue",
        swatch: "bg-blue",
      },
      {
        key: "insurance",
        label: "Insurance",
        short: "Insurance",
        value: insuranceN,
        color: "bg-[#5B9FE8]",
        swatch: "bg-[#5B9FE8]",
      },
      {
        key: "maintenance",
        label: "Servicing & maintenance",
        short: "Maintenance",
        value: maintenanceN,
        color: "bg-[#E8A35C]",
        swatch: "bg-[#E8A35C]",
      },
      {
        key: "tax",
        label: "Road tax",
        short: "Road tax",
        value: roadTaxN,
        color: "bg-[#3BA67A]",
        swatch: "bg-[#3BA67A]",
      },
    ] as const;

    const withFinance =
      financeEnabled || financeYear > 0
        ? [
            ...parts,
            {
              key: "finance",
              label: "Finance",
              short: "Finance",
              value: financeYear,
              color: "bg-slate-400",
              swatch: "bg-slate-400",
            } as const,
          ]
        : [...parts];

    const breakdown = withFinance.map((item) => ({
      ...item,
      pct: total > 0 ? Math.round((item.value / total) * 100) : 0,
    }));

    return {
      fuelYear,
      financeYear,
      total,
      monthly,
      perMile,
      breakdown,
    };
  }, [
    mileageN,
    mpgN,
    fuelPriceN,
    roadTaxN,
    insuranceN,
    maintenanceN,
    financeMonthlyN,
    financeEnabled,
  ]);

  const analyticsReady = useRef(false);
  useEffect(() => {
    if (!analyticsReady.current) {
      analyticsReady.current = true;
      return;
    }
    const timer = window.setTimeout(() => {
      analytics.runningCostsCalculated(Math.round(results.total));
    }, 900);
    return () => window.clearTimeout(timer);
  }, [results.total]);

  return (
    <div className="overflow-hidden rounded-t-[12px] border border-border bg-white">
      <div className="grid gap-0 lg:grid-cols-[3fr_2fr] lg:gap-0">
        {/* Left: inputs */}
        <div className="border-b border-border p-7 md:p-8 lg:border-b-0 lg:border-r lg:p-8">
          <h2 className="text-[22px] font-bold tracking-tight text-navy md:text-[24px]">
            Your car & usage
          </h2>
          <p className="mt-2.5 text-[15px] leading-relaxed text-muted md:text-[16px]">
            Adjust the figures below to see how your running costs change.
          </p>
          <p className="mt-2.5 text-[15px] leading-snug text-muted">
            Using example assumptions. Adjust them to match your car.
          </p>

          <div className="mt-7 space-y-5">
            <fieldset>
              <legend className={labelClass}>Fuel type</legend>
              <div
                className="grid grid-cols-3 gap-1.5 rounded-[10px] border border-border bg-surface-soft p-1"
                role="group"
                aria-label="Fuel type"
              >
                {FUEL_TYPES.map((type) => {
                  const active = fuelType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFuelType(type)}
                      className={cn(
                        "min-h-[44px] rounded-[8px] px-2 text-[15px] font-semibold transition-colors md:text-[16px]",
                        active
                          ? "bg-white text-navy shadow-sm"
                          : "text-muted hover:text-navy",
                      )}
                      aria-pressed={active}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div>
              <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
                <label htmlFor="rc-mileage" className={labelClass + " mb-0"}>
                  Annual mileage
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {MILEAGE_PRESETS.map((preset) => {
                    const active = mileageN === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAnnualMileage(String(preset))}
                        className={cn(
                          "rounded-md border px-2.5 py-1 text-[14px] font-semibold tabular-nums transition-colors",
                          active
                            ? "border-navy/25 bg-navy text-white"
                            : "border-border bg-white text-muted hover:border-navy/20 hover:text-navy",
                        )}
                      >
                        {preset.toLocaleString("en-GB")}
                      </button>
                    );
                  })}
                </div>
              </div>
              <input
                id="rc-mileage"
                className={fieldClass}
                type="text"
                inputMode="numeric"
                value={annualMileage}
                onFocus={(e) => e.target.select()}
                onChange={(e) =>
                  setAnnualMileage(e.target.value.replace(/[^\d.]/g, ""))
                }
              />
            </div>

            <div className="grid gap-[17px] sm:grid-cols-2 sm:gap-x-5 sm:gap-y-[17px]">
              <NumberField
                id="rc-mpg"
                label="Fuel economy (mpg)"
                value={mpg}
                onChange={setMpg}
              />
              <NumberField
                id="rc-fuel-price"
                label="Fuel price (£ / litre)"
                value={fuelPrice}
                onChange={setFuelPrice}
              />
              <NumberField
                id="rc-tax"
                label="Annual road tax (£)"
                value={roadTax}
                onChange={setRoadTax}
              />
              <NumberField
                id="rc-insurance"
                label="Insurance (£ / year)"
                value={insurance}
                onChange={setInsurance}
              />
              <NumberField
                id="rc-maintenance"
                label="Servicing & maintenance (£ / year)"
                value={maintenance}
                onChange={setMaintenance}
                className="sm:col-span-2"
              />
            </div>

            {financeEnabled ? (
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label htmlFor="rc-finance" className={labelClass + " mb-0"}>
                    Finance payment (£ / month)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setFinanceEnabled(false);
                      setFinanceMonthly("0");
                    }}
                    className="text-[15px] font-semibold text-muted underline-offset-2 hover:text-navy hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <input
                  id="rc-finance"
                  className={fieldClass}
                  type="text"
                  inputMode="decimal"
                  value={financeMonthly}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) =>
                    setFinanceMonthly(e.target.value.replace(/[^\d.]/g, ""))
                  }
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setFinanceEnabled(true);
                  if (financeMonthly === "0") setFinanceMonthly("");
                }}
                className="text-[16px] font-semibold text-blue hover:text-blue-hover"
              >
                + Add finance
              </button>
            )}
          </div>
        </div>

        {/* Right: results */}
        <div className="bg-white p-5 md:p-6">
          <h2 className="text-[18px] font-bold tracking-tight text-navy md:text-[20px]">
            Estimated running costs
          </h2>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-[12px] bg-surface-soft px-3 py-5 text-center">
              <p className="text-[34px] font-extrabold leading-none tracking-tight text-navy tabular-nums md:text-[36px]">
                {formatGbp(Math.round(results.monthly))}
              </p>
              <p className="mt-2 text-[15px] font-medium text-navy/65">
                / month
              </p>
            </div>
            <div className="rounded-[12px] bg-navy px-3 py-5 text-center">
              <p className="text-[34px] font-extrabold leading-none tracking-tight text-white tabular-nums md:text-[36px]">
                {formatGbp(Math.round(results.total))}
              </p>
              <p className="mt-2 text-[15px] font-medium text-white/80">
                / year
              </p>
            </div>
          </div>

          <p className="mt-4 text-center text-[16px] font-semibold text-navy">
            {formatPerMile(results.perMile)} per mile
          </p>

          <dl className="mt-6 space-y-0 border-t border-border">
            {results.breakdown.map((row) => {
              const Icon = BREAKDOWN_ICONS[row.key] ?? FileText;
              return (
                <div
                  key={row.key}
                  className="flex items-center justify-between gap-3 border-b border-border py-3.5 text-[15px] md:text-[16px]"
                >
                  <dt className="flex min-w-0 items-center gap-2.5 text-navy">
                    <Icon
                      className="h-[18px] w-[18px] shrink-0 text-navy/75"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                    <span className="truncate">{row.label}</span>
                  </dt>
                  <dd className="whitespace-nowrap font-bold tabular-nums text-navy">
                    {formatGbp(Math.round(row.value))}
                  </dd>
                </div>
              );
            })}
          </dl>

          {results.total > 0 ? (
            <div className="mt-6">
              <div
                className="flex h-2.5 overflow-hidden rounded-full bg-surface-soft"
                role="img"
                aria-label="Annual cost distribution"
              >
                {results.breakdown
                  .filter((s) => s.value > 0)
                  .map((segment) => (
                    <div
                      key={segment.key}
                      className={cn("h-full min-w-0", segment.color)}
                      style={{
                        width: `${Math.max((segment.value / results.total) * 100, 0)}%`,
                      }}
                      title={`${segment.short} ${segment.pct}%`}
                    />
                  ))}
              </div>
              <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
                {results.breakdown.map((segment) => (
                  <li
                    key={segment.key}
                    className="flex items-center gap-2 text-[14px] text-navy/75"
                  >
                    <span
                      className={cn(
                        "h-2.5 w-2.5 shrink-0 rounded-full",
                        segment.swatch,
                      )}
                      aria-hidden
                    />
                    <span>
                      {segment.short} {segment.pct}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="mt-6 text-[14px] leading-relaxed text-muted">
            Estimates only. Fuel price and insurance are assumptions you enter,
            not live market data.
          </p>
        </div>
      </div>
    </div>
  );
}

function NumberField({
  id,
  label,
  value,
  onChange,
  className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        className={fieldClass}
        type="text"
        inputMode="decimal"
        value={value}
        onFocus={(e) => e.target.select()}
        onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ""))}
      />
    </div>
  );
}
