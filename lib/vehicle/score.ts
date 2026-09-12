import type {
  BuyerScoreBand,
  BuyerScoreBreakdown,
  BuyerScoreInput,
  BuyerScoreReason,
  BuyerScoreResult,
  MileagePoint,
  MotTest,
} from "@/types/vehicle";

/**
 * AutoViewer Buyer Score
 * -----------------------------------------------------------------------------
 * Single source of truth for homepage, vehicle page, and compare.
 *
 * Philosophy
 * - Interpretation of available history only - not a mechanical inspection.
 * - Baseline 90: “nothing bad found” is good, not perfect.
 * - Age never deducts points (may only inform confidence/context later).
 * - Missing optional data never deducts; sparse history returns score: null.
 *
 * Eligibility
 * - MEDIUM confidence minimum to produce a score:
 *   >= 2 MOT tests AND >= 2 mileage readings.
 * - Otherwise confidence LOW → score null.
 *
 * Baseline
 * - START = 90
 *
 * Recency weights (failures / serious defects)
 * - < 12 months: 100%
 * - 12-36 months: 50%
 * - > 36 months: 25%
 *
 * MOT FAIL
 * - Base −10 × recency weight
 * - If a PASS follows within 14 days: keep ~30% of that penalty (≈70% reduction)
 *
 * Dangerous / major defects
 * - Dangerous base −12 × weight (resolved via quick PASS: ×0.3)
 * - Major base −6 × weight (resolved via quick PASS: ×0.3)
 * - Minor: no direct deduction
 * - Advisories: no per-item deduction; only repeated category patterns
 *
 * Repeated advisory patterns (keyword categories)
 * - Same category on 2 tests: −4
 * - Same category on 3+ tests: −7
 * - Categories: tyre, brake, suspension, lights, corrosion, leak, exhaust
 *
 * Mileage
 * - Drop > 500 mi: −15
 * - Drop > 5,000 mi: −25
 *
 * Open recalls
 * - 1: −8; 2: −14; 3+: −20 (closed recalls ignored)
 *
 * Positive signals (combined cap +6)
 * - 3+ consecutive PASSes: +2; 5+: +4 total
 * - Consistent mileage across 3+ readings: +2
 * - No major/dangerous in last 3 years: +2
 *
 * Clamp final score to [1, 100].
 *
 * Bands
 * - 90-100 excellent-history
 * - 80-89  good-history
 * - 65-79  mixed-history
 * - <65    needs-attention
 *
 * Confidence
 * - high:   >= 4 MOT AND >= 3 mileage
 * - medium: >= 2 MOT AND >= 2 mileage
 * - low:    otherwise
 * -----------------------------------------------------------------------------
 */

export const BUYER_SCORE_BASE = 90;
export const BUYER_SCORE_POSITIVE_CAP = 6;

const MS_DAY = 24 * 60 * 60 * 1000;
const MS_YEAR = 365.25 * MS_DAY;

const ADVISORY_CATEGORIES: Array<{ id: string; label: string; patterns: RegExp[] }> = [
  {
    id: "tyre",
    label: "tyre wear",
    patterns: [/tyre/, /tire/, /tread/],
  },
  {
    id: "brake",
    label: "brake wear",
    patterns: [/brake/, /disc/, /pad/],
  },
  {
    id: "suspension",
    label: "suspension wear",
    patterns: [/suspension/, /bush/, /shock/, /spring/, /wishbone/, /ball joint/],
  },
  {
    id: "lights",
    label: "lighting issues",
    patterns: [/lamp/, /light/, /bulb/, /headlamp/, /indicator/],
  },
  {
    id: "corrosion",
    label: "corrosion",
    patterns: [/corrosion/, /rust/, /corroded/],
  },
  {
    id: "leak",
    label: "fluid leaks",
    patterns: [/leak/, /oil/, /seepage/],
  },
  {
    id: "exhaust",
    label: "exhaust issues",
    patterns: [/exhaust/, /silencer/, /emissions/],
  },
];

function daysBetween(a: string, b: string): number {
  return Math.abs(new Date(b).getTime() - new Date(a).getTime()) / MS_DAY;
}

function ageYears(dateIso: string, now: Date): number {
  return (now.getTime() - new Date(dateIso).getTime()) / MS_YEAR;
}

function recencyWeight(dateIso: string, now: Date): number {
  const years = ageYears(dateIso, now);
  if (years < 1) return 1;
  if (years <= 3) return 0.5;
  return 0.25;
}

function sortTestsNewestFirst(tests: MotTest[]): MotTest[] {
  return [...tests].sort(
    (a, b) =>
      new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime(),
  );
}

function sortTestsOldestFirst(tests: MotTest[]): MotTest[] {
  return [...tests].sort(
    (a, b) =>
      new Date(a.completedDate).getTime() - new Date(b.completedDate).getTime(),
  );
}

function followedByPassWithinDays(
  fail: MotTest,
  testsOldestFirst: MotTest[],
  days = 14,
): boolean {
  const failTime = new Date(fail.completedDate).getTime();
  for (const test of testsOldestFirst) {
    const t = new Date(test.completedDate).getTime();
    if (t <= failTime) continue;
    if ((t - failTime) / MS_DAY > days) break;
    if (test.testResult === "PASS") return true;
  }
  return false;
}

function consecutivePassStreak(testsNewestFirst: MotTest[]): number {
  let streak = 0;
  for (const test of testsNewestFirst) {
    if (test.testResult !== "PASS") break;
    streak += 1;
  }
  return streak;
}

function classifyAdvisory(text: string): string | null {
  const lower = text.toLowerCase();
  for (const category of ADVISORY_CATEGORIES) {
    if (category.patterns.some((re) => re.test(lower))) {
      return category.id;
    }
  }
  return null;
}

function advisoryCategoryLabel(id: string): string {
  return ADVISORY_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

function mileageDrop(points: MileagePoint[]): number {
  if (points.length < 2) return 0;
  const sorted = [...points].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  let worst = 0;
  for (let i = 1; i < sorted.length; i++) {
    const drop = sorted[i - 1].mileage - sorted[i].mileage;
    if (drop > worst) worst = drop;
  }
  return worst;
}

function hasSeriousDefectInLastYears(
  tests: MotTest[],
  now: Date,
  years = 3,
): boolean {
  const cutoff = now.getTime() - years * MS_YEAR;
  return tests.some((test) => {
    if (new Date(test.completedDate).getTime() < cutoff) return false;
    return test.defects.some(
      (d) => d.type === "DANGEROUS" || d.type === "MAJOR",
    );
  });
}

function confidenceFor(
  motCount: number,
  mileageCount: number,
): BuyerScoreResult["confidence"] {
  if (motCount >= 4 && mileageCount >= 3) return "high";
  if (motCount >= 2 && mileageCount >= 2) return "medium";
  return "low";
}

export function buyerScoreBandFromScore(score: number): BuyerScoreBand {
  if (score >= 90) return "excellent-history";
  if (score >= 80) return "good-history";
  if (score >= 65) return "mixed-history";
  return "needs-attention";
}

export function buyerScoreBandLabel(band: BuyerScoreBand | null): string {
  if (band === "excellent-history") return "Excellent history";
  if (band === "good-history") return "Good history";
  if (band === "mixed-history") return "Mixed history";
  if (band === "needs-attention") return "Needs attention";
  return "Unavailable";
}

export function buyerScoreInsufficientMessage(): string {
  return "Not enough history to calculate a Buyer Score.";
}

export function buyerScoreDisclaimer(): string {
  return "Buyer Score is an AutoViewer interpretation of available vehicle history. It is not a mechanical inspection or guarantee of vehicle condition.";
}

function roundImpact(value: number): number {
  return Math.round(value * 10) / 10 === Math.round(value)
    ? Math.round(value)
    : Math.round(value);
}

export function getBuyerScoreBreakdown(
  result: BuyerScoreResult,
): BuyerScoreBreakdown {
  if (result.score == null) {
    return {
      startingScore: BUYER_SCORE_BASE,
      lines: [],
      finalScore: null,
      band: null,
      label: null,
    };
  }

  const lines = result.reasons
    .filter((reason) => reason.impact !== 0)
    .map((reason) => ({
      label: reason.label,
      impact: reason.impact,
    }));

  return {
    startingScore: BUYER_SCORE_BASE,
    lines,
    finalScore: result.score,
    band: result.band,
    label: result.label,
  };
}

export function calculateBuyerScore(
  input: BuyerScoreInput,
  options?: { now?: Date },
): BuyerScoreResult {
  const now = options?.now ?? new Date();
  const motTests = input.motTests ?? [];
  const mileageHistory = input.mileageHistory ?? [];
  const motCount = motTests.length;
  const mileageCount = mileageHistory.length;
  const confidence = confidenceFor(motCount, mileageCount);

  if (confidence === "low") {
    return {
      score: null,
      band: null,
      label: null,
      reasons: [
        {
          type: "insufficient-history",
          label: buyerScoreInsufficientMessage(),
          impact: 0,
          severity: "info",
        },
      ],
      confidence: "low",
    };
  }

  const reasons: BuyerScoreReason[] = [];
  let positive = 0;
  let negative = 0;

  const newestFirst = sortTestsNewestFirst(motTests);
  const oldestFirst = sortTestsOldestFirst(motTests);

  // --- MOT failures ---
  for (const test of motTests) {
    if (test.testResult !== "FAIL") continue;
    const weight = recencyWeight(test.completedDate, now);
    const resolvedQuickly = followedByPassWithinDays(test, oldestFirst, 14);
    const base = 10;
    const factor = resolvedQuickly ? 0.3 : 1;
    const impact = -roundImpact(base * weight * factor);
    if (impact === 0) continue;
    negative += impact;
    reasons.push({
      type: resolvedQuickly ? "mot-fail-resolved" : "mot-fail",
      label: resolvedQuickly
        ? "MOT failure followed by a quick retest pass"
        : "MOT failure recorded",
      impact,
      severity: resolvedQuickly ? "warning" : "negative",
    });
  }

  // --- Dangerous / major defects ---
  for (const test of motTests) {
    const weight = recencyWeight(test.completedDate, now);
    const resolvedQuickly =
      test.testResult === "FAIL" &&
      followedByPassWithinDays(test, oldestFirst, 14);

    for (const defect of test.defects) {
      if (defect.type !== "DANGEROUS" && defect.type !== "MAJOR") continue;
      const base = defect.type === "DANGEROUS" ? 12 : 6;
      const factor = resolvedQuickly ? 0.3 : 1;
      const impact = -roundImpact(base * weight * factor);
      if (impact === 0) continue;
      negative += impact;
      reasons.push({
        type:
          defect.type === "DANGEROUS" ? "dangerous-defect" : "major-defect",
        label:
          defect.type === "DANGEROUS"
            ? "Dangerous MOT defect recorded"
            : "Major MOT defect recorded",
        impact,
        severity: defect.type === "DANGEROUS" ? "negative" : "warning",
      });
    }
  }

  // --- Repeated advisory patterns ---
  const categoryTests = new Map<string, Set<string>>();
  for (const test of motTests) {
    for (const defect of test.defects) {
      if (defect.type !== "ADVISORY" || !defect.text) continue;
      const category = classifyAdvisory(defect.text);
      if (!category) continue;
      const set = categoryTests.get(category) ?? new Set<string>();
      set.add(test.completedDate);
      categoryTests.set(category, set);
    }
  }

  for (const [category, dates] of categoryTests) {
    const count = dates.size;
    if (count < 2) continue;
    const impact = count >= 3 ? -7 : -4;
    negative += impact;
    reasons.push({
      type: "repeated-advisory",
      label: `Repeated ${advisoryCategoryLabel(category)} across ${count} MOT tests`,
      impact,
      severity: "warning",
    });
  }

  // --- Mileage inconsistency ---
  const drop = mileageDrop(mileageHistory);
  if (drop > 5000) {
    negative += -25;
    reasons.push({
      type: "mileage-inconsistency",
      label: "Possible mileage inconsistency detected",
      impact: -25,
      severity: "negative",
    });
  } else if (drop > 500) {
    negative += -15;
    reasons.push({
      type: "mileage-inconsistency",
      label: "Possible mileage inconsistency detected",
      impact: -15,
      severity: "warning",
    });
  }

  // --- Open recalls ---
  const openRecalls =
    input.recalls?.hasOpenRecalls && input.recalls.count > 0
      ? input.recalls.count
      : 0;
  if (openRecalls > 0) {
    const impact = openRecalls === 1 ? -8 : openRecalls === 2 ? -14 : -20;
    negative += impact;
    reasons.push({
      type: "open-recall",
      label:
        openRecalls === 1
          ? "1 open safety recall"
          : `${openRecalls} open safety recalls`,
      impact,
      severity: "warning",
    });
  }

  // --- Positive signals ---
  const passStreak = consecutivePassStreak(newestFirst);
  if (passStreak >= 5) {
    const impact = 4;
    positive += impact;
    reasons.push({
      type: "mot-pass-streak",
      label: "Five or more consecutive MOT passes",
      impact,
      severity: "positive",
    });
  } else if (passStreak >= 3) {
    const impact = 2;
    positive += impact;
    reasons.push({
      type: "mot-pass-streak",
      label: "Three or more consecutive MOT passes",
      impact,
      severity: "positive",
    });
  }

  if (mileageCount >= 3 && drop <= 500) {
    const impact = 2;
    positive += impact;
    reasons.push({
      type: "mileage-consistency",
      label: "Consistent mileage history",
      impact,
      severity: "positive",
    });
  }

  if (!hasSeriousDefectInLastYears(motTests, now, 3)) {
    const impact = 2;
    positive += impact;
    reasons.push({
      type: "no-serious-defects",
      label: "No major or dangerous defects in the last 3 years",
      impact,
      severity: "positive",
    });
  }

  const cappedPositive = Math.min(BUYER_SCORE_POSITIVE_CAP, positive);
  if (cappedPositive < positive) {
    reasons.push({
      type: "positive-cap",
      label: `Positive history bonuses capped at +${BUYER_SCORE_POSITIVE_CAP}`,
      impact: -(positive - cappedPositive),
      severity: "info",
    });
  }

  const score = Math.max(
    1,
    Math.min(100, Math.round(BUYER_SCORE_BASE + cappedPositive + negative)),
  );
  const band = buyerScoreBandFromScore(score);
  const label = buyerScoreBandLabel(band);

  return {
    score,
    band,
    label,
    reasons,
    confidence,
  };
}

/** @deprecated use daysBetween only internally; exported for tests */
export const __scoreTestUtils = {
  recencyWeight,
  followedByPassWithinDays,
  classifyAdvisory,
  mileageDrop,
  daysBetween,
  ageYears,
};
