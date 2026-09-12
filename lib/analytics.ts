import { isAnalyticsExcluded } from "@/lib/analytics-exclusion";

type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Lightweight analytics abstraction. Safe when GA is absent or excluded.
 * GA4 is loaded only when NEXT_PUBLIC_GA_ID is set (cookieless consent defaults).
 * Never send registration numbers.
 */
export function trackEvent(event: string, payload: AnalyticsPayload = {}): void {
  if (typeof window === "undefined") return;
  if (isAnalyticsExcluded()) return;

  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", event, payload);
      return;
    }
    // Queue until gtag is available (or no-op if GA is not configured)
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...payload });
  } catch {
    // Never throw from analytics
  }
}

export type CheckSource =
  | "home"
  | "check-a-vehicle"
  | "mot-history"
  | "car-tax-check"
  | "mileage-check"
  | "tax-mileage"
  | "recall-check"
  | "vehicle-details"
  | "about"
  | "running-costs"
  | "guides"
  | "unknown";

export const analytics = {
  vehicleCheckStarted: (checkSource: CheckSource = "unknown") =>
    trackEvent("vehicle_check_started", { check_source: checkSource }),
  vehicleCheckSuccess: (checkSource: CheckSource = "unknown") =>
    trackEvent("vehicle_check_success", { check_source: checkSource }),
  vehicleCheckFailed: (checkSource: CheckSource = "unknown", reason: string) =>
    trackEvent("vehicle_check_failed", { check_source: checkSource, reason }),
  compareStarted: () => trackEvent("compare_started"),
  runningCostsCalculated: (totalYearly: number) =>
    trackEvent("running_costs_calculated", { totalYearly }),
};
