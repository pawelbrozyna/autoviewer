import type { MotDefect, MotDefectType, MotResult, MotTest } from "@/types/vehicle";
import type { DvsaMotTest } from "@/lib/server/dvsa-client";

/**
 * Maps DVSA MOT History API responses onto AutoViewer types.
 * Transport and auth live in the server-only client.
 */
export {
  DvsaApiError,
  fetchMotHistory as fetchDvsaVehicleByRegistration,
  isDvsaConfigured,
} from "@/lib/server/dvsa-client";
export type {
  DvsaErrorCode,
  DvsaMotDefect,
  DvsaMotTest,
  DvsaVehicleResponse,
} from "@/lib/server/dvsa-client";

function mapDefectType(raw?: string): MotDefectType {
  const v = (raw ?? "").toUpperCase();
  if (v.includes("DANGEROUS")) return "DANGEROUS";
  if (v.includes("MAJOR")) return "MAJOR";
  if (v.includes("MINOR")) return "MINOR";
  if (v.includes("ADVISORY")) return "ADVISORY";
  if (v.includes("PRS")) return "PRS";
  return "OTHER";
}

function mapResult(raw?: string): MotResult {
  const v = (raw ?? "").toUpperCase();
  if (v.includes("PASS")) return "PASS";
  if (v.includes("FAIL")) return "FAIL";
  return "UNKNOWN";
}

export function mapDvsaMotTests(tests: DvsaMotTest[] = []): MotTest[] {
  return tests.map((t) => {
    const odometer =
      typeof t.odometerValue === "string"
        ? Number.parseInt(t.odometerValue, 10)
        : t.odometerValue;

    const defects: MotDefect[] = (t.defects ?? []).map((d) => ({
      type: mapDefectType(d.type),
      text: d.text ?? "Defect recorded",
      dangerous: Boolean(d.dangerous),
    }));

    return {
      completedDate: t.completedDate ?? "",
      expiryDate: t.expiryDate ?? null,
      testResult: mapResult(t.testResult),
      odometerValue: Number.isFinite(odometer as number) ? (odometer as number) : null,
      odometerUnit: (t.odometerUnit ?? "mi").toLowerCase().startsWith("k")
        ? "km"
        : "mi",
      motTestNumber: t.motTestNumber ?? null,
      defects,
    };
  });
}
