import type { Confidence, Range } from "./types";

export interface YearBucket { year: number; medianPrice: number; medianMileage: number; count: number }
export interface AgeCurve {
  id: string;
  level: "model_generation" | "model_family" | "segment";
  annualRate: number;
  confidence: Confidence;
  sourceCurveIds: string[];
  supportedYears: number[];
  bucketCount: number;
  maximumMedianResidual: number;
}
export const median = (values: number[]): number => {
  if (!values.length) throw new Error("Cannot take an empty median");
  const a = [...values].sort((a, b) => a - b);
  return (a[(a.length - 1) >> 1] + a[a.length >> 1]) / 2;
};
export const confidenceRank: Record<Confidence, number> = { low: 0, medium: 1, high: 2 };
export function lowerConfidence(a: Confidence, b: Confidence): Confidence {
  return confidenceRank[a] < confidenceRank[b] ? a : b;
}
export function anchorConfidence(count: number): Confidence {
  return count >= 10 ? "high" : count >= 5 ? "medium" : "low";
}

/** Cross-sectional yearly medians, not individual-advert residuals or a sales-price forecast. */
export function fitMedianAgeCurve(id: string, buckets: YearBucket[], electric = false): { curve: AgeCurve | null; reason: string } {
  const b = buckets.filter(b => b.count >= 3 && b.medianPrice > 0).sort((a, b) => a.year - b.year);
  if (b.length < 2) return { curve: null, reason: "fewer_than_two_year_buckets_with_three_comparables" };
  const x0 = b[0].year;
  const xMean = b.reduce((s, b) => s + b.year - x0, 0) / b.length;
  const yMean = b.reduce((s, b) => s + Math.log(b.medianPrice), 0) / b.length;
  const slope = b.reduce((s, b) => s + (b.year - x0 - xMean) * (Math.log(b.medianPrice) - yMean), 0) /
    b.reduce((s, b) => s + (b.year - x0 - xMean) ** 2, 0);
  const rate = 1 - Math.exp(-slope);
  // Plausibility bounds screen rather than clip an unsupported rate into a usable fit.
  if (!Number.isFinite(rate) || rate < 0.01 || rate > (electric ? 0.35 : 0.25)) return { curve: null, reason: "annual_rate_outside_plausibility_bounds" };
  const maxResidual = Math.max(...b.map(p => Math.abs(p.medianPrice / Math.exp(yMean + slope * (p.year - x0 - xMean)) - 1)));
  if (maxResidual > 0.25 || b.some((p, i) => i > 0 && p.medianPrice < b[i - 1].medianPrice * 0.8)) return { curve: null, reason: "unstable_year_medians" };
  const confidence: Confidence = b.length >= 3 && b.every(p => p.count >= 5) && maxResidual <= 0.08 ? "high" : "medium";
  return { curve: { id, level: "model_generation", annualRate: +rate.toFixed(6), confidence, sourceCurveIds: [], supportedYears: b.map(b => b.year), bucketCount: b.length, maximumMedianResidual: +maxResidual.toFixed(6) }, reason: "year_bucket_medians_supported" };
}

export function safeCurveRecipient(p: { make?: string | null; classification: string; scope: string; body: string | null; yearFrom: number | null; unresolvedDerivativeIdentification: boolean }): boolean {
  const bespokeMakes = ["Aston Martin", "Bentley", "Bugatti", "Ferrari", "Lamborghini", "Lotus", "McLaren", "Maserati", "Rolls-Royce", "Porsche", "Pagani", "Koenigsegg", "Caterham", "Morgan", "TVR", "Noble"];
  if (p.make && bespokeMakes.includes(p.make)) return false;
  return ["normal", "premium"].includes(p.classification) && p.scope === "catalogue" && !p.unresolvedDerivativeIdentification &&
    p.yearFrom !== null && p.yearFrom >= 2005 && ["hatchback", "saloon", "estate", "crossover", "suv"].includes(p.body ?? "");
}

/** Priority changes curve reuse only; identity/anchor matching never falls back to a different model. */
export function chooseAgeCurve(own: AgeCurve | null, family: AgeCurve | null, segment: AgeCurve | null, safeOrdinary: boolean, electric: boolean): AgeCurve | null {
  if (own) return own;
  if (family && (safeOrdinary || electric && family.id.includes("battery-40"))) return family;
  return safeOrdinary && !electric ? segment : null;
}

/** This is a product uncertainty band, not an observed min/max or a statistical prediction interval. */
export function policyDisplayRange(value: number, confidence: Confidence): Range {
  if (!(value > 0) || !Number.isFinite(value)) throw new Error("Invalid anchor value");
  const spread = { high: 0.18, medium: 0.22, low: 0.25 }[confidence];
  const low = Math.ceil(value / (1 + spread / 2));
  return { low, high: Math.min(Math.floor(value * (1 + spread) / (1 + spread / 2)), Math.floor(low * (1 + spread))) };
}
