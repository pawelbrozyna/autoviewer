/**
 * Deterministic Buyer Score fixtures.
 * Run: npx tsx lib/vehicle/score.test.ts
 */
import assert from "node:assert/strict";
import {
  calculateBuyerScore,
  getBuyerScoreBreakdown,
  buyerScoreBandLabel,
} from "@/lib/vehicle/score";
import type { BuyerScoreInput, MotTest } from "@/types/vehicle";

const NOW = new Date("2026-09-12T12:00:00.000Z");

function mot(
  partial: Partial<MotTest> & Pick<MotTest, "completedDate" | "testResult">,
): MotTest {
  return {
    expiryDate: null,
    odometerValue: null,
    odometerUnit: "mi",
    motTestNumber: null,
    defects: [],
    ...partial,
  };
}

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`PASS  ${name}`);
  } catch (error) {
    console.error(`FAIL  ${name}`);
    throw error;
  }
}

function scoreOf(input: BuyerScoreInput) {
  return calculateBuyerScore(input, { now: NOW });
}

// A. Strong clean history
run("A. Strong clean history", () => {
  const result = scoreOf({
    yearOfManufacture: 2018,
    motTests: [
      mot({
        completedDate: "2026-01-10",
        testResult: "PASS",
        odometerValue: 40000,
      }),
      mot({
        completedDate: "2025-01-12",
        testResult: "PASS",
        odometerValue: 32000,
      }),
      mot({
        completedDate: "2024-01-14",
        testResult: "PASS",
        odometerValue: 24000,
      }),
      mot({
        completedDate: "2023-01-16",
        testResult: "PASS",
        odometerValue: 16000,
      }),
      mot({
        completedDate: "2022-01-18",
        testResult: "PASS",
        odometerValue: 9000,
      }),
    ],
    mileageHistory: [
      { date: "2026-01-10", mileage: 40000, source: "MOT" },
      { date: "2025-01-12", mileage: 32000, source: "MOT" },
      { date: "2024-01-14", mileage: 24000, source: "MOT" },
      { date: "2023-01-16", mileage: 16000, source: "MOT" },
      { date: "2022-01-18", mileage: 9000, source: "MOT" },
    ],
    recalls: { hasOpenRecalls: false, count: 0, items: [] },
  });
  assert.equal(result.confidence, "high");
  assert.ok(result.score != null && result.score >= 94 && result.score <= 96);
  assert.equal(result.band, "excellent-history");
  console.log(`      score=${result.score} band=${result.band}`);
});

// B. Recent FAIL then next-day PASS
run("B. Recent FAIL followed by next-day PASS", () => {
  const result = scoreOf({
    yearOfManufacture: 2019,
    motTests: [
      mot({
        completedDate: "2026-06-02",
        testResult: "PASS",
        odometerValue: 51000,
      }),
      mot({
        completedDate: "2026-06-01",
        testResult: "FAIL",
        odometerValue: 50990,
        defects: [{ type: "MAJOR", text: "Brake imbalance" }],
      }),
      mot({
        completedDate: "2025-06-01",
        testResult: "PASS",
        odometerValue: 42000,
      }),
    ],
    mileageHistory: [
      { date: "2026-06-02", mileage: 51000, source: "MOT" },
      { date: "2026-06-01", mileage: 50990, source: "MOT" },
      { date: "2025-06-01", mileage: 42000, source: "MOT" },
    ],
  });
  assert.ok(result.score != null);
  const failReason = result.reasons.find((r) => r.type === "mot-fail-resolved");
  assert.ok(failReason);
  assert.ok(failReason!.impact > -10 && failReason!.impact < 0);
  console.log(`      score=${result.score} failImpact=${failReason!.impact}`);
});

// C. Repeated tyre advisories
run("C. Repeated tyre advisories", () => {
  const result = scoreOf({
    yearOfManufacture: 2017,
    motTests: [
      mot({
        completedDate: "2026-03-01",
        testResult: "PASS",
        odometerValue: 70000,
        defects: [
          {
            type: "ADVISORY",
            text: "Nearside rear tyre worn close to legal limit",
          },
        ],
      }),
      mot({
        completedDate: "2025-03-01",
        testResult: "PASS",
        odometerValue: 60000,
        defects: [
          {
            type: "ADVISORY",
            text: "Offside front tyre worn close to legal limit",
          },
        ],
      }),
      mot({
        completedDate: "2024-03-01",
        testResult: "PASS",
        odometerValue: 50000,
      }),
    ],
    mileageHistory: [
      { date: "2026-03-01", mileage: 70000, source: "MOT" },
      { date: "2025-03-01", mileage: 60000, source: "MOT" },
      { date: "2024-03-01", mileage: 50000, source: "MOT" },
    ],
  });
  const repeated = result.reasons.find((r) => r.type === "repeated-advisory");
  assert.ok(repeated);
  assert.equal(repeated!.impact, -4);
  console.log(`      score=${result.score} repeated=${repeated!.label}`);
});

// D. Mileage rollback > 5000
run("D. Mileage rollback > 5,000 miles", () => {
  const result = scoreOf({
    yearOfManufacture: 2016,
    motTests: [
      mot({
        completedDate: "2026-02-01",
        testResult: "PASS",
        odometerValue: 30000,
      }),
      mot({
        completedDate: "2025-02-01",
        testResult: "PASS",
        odometerValue: 80000,
      }),
      mot({
        completedDate: "2024-02-01",
        testResult: "PASS",
        odometerValue: 70000,
      }),
    ],
    mileageHistory: [
      { date: "2024-02-01", mileage: 70000, source: "MOT" },
      { date: "2025-02-01", mileage: 80000, source: "MOT" },
      { date: "2026-02-01", mileage: 30000, source: "MOT" },
    ],
  });
  const mileage = result.reasons.find((r) => r.type === "mileage-inconsistency");
  assert.ok(mileage);
  assert.equal(mileage!.impact, -25);
  assert.ok(result.score != null && result.score < 80);
  console.log(`      score=${result.score}`);
});

// E. One open recall
run("E. One open recall", () => {
  const result = scoreOf({
    yearOfManufacture: 2019,
    motTests: [
      mot({
        completedDate: "2026-01-01",
        testResult: "PASS",
        odometerValue: 40000,
      }),
      mot({
        completedDate: "2025-01-01",
        testResult: "PASS",
        odometerValue: 30000,
      }),
      mot({
        completedDate: "2024-01-01",
        testResult: "PASS",
        odometerValue: 20000,
      }),
    ],
    mileageHistory: [
      { date: "2026-01-01", mileage: 40000, source: "MOT" },
      { date: "2025-01-01", mileage: 30000, source: "MOT" },
      { date: "2024-01-01", mileage: 20000, source: "MOT" },
    ],
    recalls: {
      hasOpenRecalls: true,
      count: 1,
      items: [{ title: "Airbag", status: "Open" }],
    },
  });
  const recall = result.reasons.find((r) => r.type === "open-recall");
  assert.ok(recall);
  assert.equal(recall!.impact, -8);
  assert.equal(recall!.label, "1 open safety recall");
  console.log(`      score=${result.score}`);
});

// F. Sparse / insufficient history
run("F. Sparse history returns null", () => {
  const result = scoreOf({
    yearOfManufacture: 2020,
    motTests: [
      mot({
        completedDate: "2026-01-01",
        testResult: "PASS",
        odometerValue: 10000,
      }),
    ],
    mileageHistory: [{ date: "2026-01-01", mileage: 10000, source: "MOT" }],
  });
  assert.equal(result.score, null);
  assert.equal(result.confidence, "low");
  assert.equal(result.band, null);
  console.log(`      score=null confidence=${result.confidence}`);
});

// G. Old vehicle with excellent history - age must not deduct
run("G. Old vehicle excellent history (no age penalty)", () => {
  const young = scoreOf({
    yearOfManufacture: 2021,
    motTests: [
      mot({
        completedDate: "2026-02-01",
        testResult: "PASS",
        odometerValue: 30000,
      }),
      mot({
        completedDate: "2025-02-01",
        testResult: "PASS",
        odometerValue: 22000,
      }),
      mot({
        completedDate: "2024-02-01",
        testResult: "PASS",
        odometerValue: 14000,
      }),
      mot({
        completedDate: "2023-02-01",
        testResult: "PASS",
        odometerValue: 8000,
      }),
    ],
    mileageHistory: [
      { date: "2026-02-01", mileage: 30000, source: "MOT" },
      { date: "2025-02-01", mileage: 22000, source: "MOT" },
      { date: "2024-02-01", mileage: 14000, source: "MOT" },
      { date: "2023-02-01", mileage: 8000, source: "MOT" },
    ],
  });
  const old = scoreOf({
    yearOfManufacture: 2005,
    motTests: young.score != null ? [
      mot({
        completedDate: "2026-02-01",
        testResult: "PASS",
        odometerValue: 110000,
      }),
      mot({
        completedDate: "2025-02-01",
        testResult: "PASS",
        odometerValue: 102000,
      }),
      mot({
        completedDate: "2024-02-01",
        testResult: "PASS",
        odometerValue: 94000,
      }),
      mot({
        completedDate: "2023-02-01",
        testResult: "PASS",
        odometerValue: 86000,
      }),
    ] : [],
    mileageHistory: [
      { date: "2026-02-01", mileage: 110000, source: "MOT" },
      { date: "2025-02-01", mileage: 102000, source: "MOT" },
      { date: "2024-02-01", mileage: 94000, source: "MOT" },
      { date: "2023-02-01", mileage: 86000, source: "MOT" },
    ],
  });
  assert.equal(young.score, old.score);
  assert.ok(!old.reasons.some((r) => /vehicle age|years\)/i.test(r.label)));
  console.log(`      young=${young.score} old=${old.score}`);
});

// Golf demo (mock-equivalent)
run("Golf demo mock-equivalent lands ~86-90", () => {
  const result = scoreOf({
    yearOfManufacture: 2019,
    motTests: [
      mot({
        completedDate: "2025-02-12",
        testResult: "PASS",
        odometerValue: 65732,
        defects: [
          {
            type: "ADVISORY",
            text: "Nearside rear tyre worn close to legal limit",
          },
        ],
      }),
      mot({
        completedDate: "2024-02-14",
        testResult: "PASS",
        odometerValue: 54013,
      }),
      mot({
        completedDate: "2023-02-16",
        testResult: "PASS",
        odometerValue: 43290,
        defects: [
          {
            type: "ADVISORY",
            text: "Front brake disc worn, pitted or scored, but not seriously weakened",
          },
        ],
      }),
    ],
    mileageHistory: [
      { date: "2025-02-12", mileage: 65732, source: "MOT" },
      { date: "2024-02-14", mileage: 54013, source: "MOT" },
      { date: "2023-02-16", mileage: 43290, source: "MOT" },
    ],
    recalls: {
      hasOpenRecalls: true,
      count: 1,
      items: [{ title: "Takata", status: "Open" }],
    },
  });

  assert.ok(result.score != null);
  assert.ok(result.score >= 86 && result.score <= 90);
  assert.equal(result.label, buyerScoreBandLabel(result.band));
  const breakdown = getBuyerScoreBreakdown(result);
  const summed =
    breakdown.startingScore +
    breakdown.lines.reduce((sum, line) => sum + line.impact, 0);
  assert.equal(Math.round(summed), result.score);
  console.log(`      score=${result.score} label=${result.label}`);
  console.log(`      breakdown start=${breakdown.startingScore}`);
  for (const line of breakdown.lines) {
    console.log(
      `        ${line.impact > 0 ? "+" : ""}${line.impact} ${line.label}`,
    );
  }
});

console.log("\nAll Buyer Score tests passed.");
