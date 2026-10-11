import assert from "node:assert/strict";
import { mapDvsaMotTests } from "@/lib/api/dvsa";
import { collectAdvisories } from "@/lib/reports/pdf-limits";
import type { VehicleRecord } from "@/types/vehicle";

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`PASS  ${name}`);
  } catch (error) {
    console.error(`FAIL  ${name}`);
    throw error;
  }
}

const vehicleWith = (motTests: VehicleRecord["motTests"]) =>
  ({ motTests }) as VehicleRecord;

run("DVSA advisory text passes through unchanged", () => {
  const [test] = mapDvsaMotTests([
    {
      completedDate: "2026-05-21T09:44:46.000Z",
      testResult: "PASSED",
      defects: [
        {
          type: "ADVISORY",
          dangerous: false,
          text: "Nearside Front Tyre worn close to legal limit/worn on edge (5.2.3 (e))",
        },
      ],
    },
  ]);
  assert.deepEqual(collectAdvisories(vehicleWith([test])), [
    {
      date: "2026-05-21T09:44:46.000Z",
      type: "ADVISORY",
      text: "Nearside Front Tyre worn close to legal limit/worn on edge (5.2.3 (e))",
      dangerous: false,
    },
  ]);
});

run("missing DVSA text is never replaced with invented wording", () => {
  const [test] = mapDvsaMotTests([
    {
      completedDate: "2025-05-29T10:47:22.000Z",
      testResult: "PASSED",
      defects: [{ type: "ADVISORY" }, { type: "ADVISORY", text: "  " }, { type: "MAJOR" }],
    },
  ]);
  assert.deepEqual(
    test.defects.map((d) => d.text),
    [null, null, null],
  );
  assert.deepEqual(collectAdvisories(vehicleWith([test])), [
    { date: "2025-05-29T10:47:22.000Z", type: "ADVISORY", text: "2 items recorded", dangerous: false },
    { date: "2025-05-29T10:47:22.000Z", type: "MAJOR", text: "1 item recorded", dangerous: false },
  ]);
});

run("tests without defects add no advisory rows", () => {
  const tests = mapDvsaMotTests([
    { completedDate: "2024-06-03T14:19:54.000Z", testResult: "PASSED", defects: [] },
  ]);
  assert.deepEqual(collectAdvisories(vehicleWith(tests)), []);
});
