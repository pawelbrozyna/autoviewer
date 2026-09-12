export type MotResult = "PASS" | "FAIL" | "UNKNOWN";

export type MotDefectType =
  | "DANGEROUS"
  | "MAJOR"
  | "MINOR"
  | "ADVISORY"
  | "PRS"
  | "OTHER";

export type TaxStatusValue =
  | "Taxed"
  | "Untaxed"
  | "SORN"
  | "Unknown";

export interface MotDefect {
  type: MotDefectType;
  text: string;
  dangerous?: boolean;
}

export interface MotTest {
  completedDate: string;
  expiryDate?: string | null;
  testResult: MotResult;
  odometerValue?: number | null;
  odometerUnit?: "mi" | "km" | null;
  motTestNumber?: string | null;
  defects: MotDefect[];
}

export interface MileagePoint {
  date: string;
  mileage: number;
  source: "MOT" | "OTHER";
}

export interface TaxStatus {
  status: TaxStatusValue;
  dueDate?: string | null;
  markedForExport?: boolean;
}

export interface RecallStatus {
  hasOpenRecalls: boolean;
  count: number;
  items: Array<{
    title: string;
    description?: string;
    date?: string;
    status?: string;
  }>;
  sourceNote?: string;
}

export interface VehicleDetails {
  registration: string;
  make: string;
  model: string;
  colour?: string | null;
  fuelType?: string | null;
  engineCapacity?: number | null;
  yearOfManufacture?: number | null;
  monthOfFirstRegistration?: string | null;
  co2Emissions?: number | null;
  euroStatus?: string | null;
  transmission?: string | null;
  wheelplan?: string | null;
  typeApproval?: string | null;
  revenueWeight?: number | null;
  markedForExport?: boolean;
}

export interface VehicleSummary {
  registration: string;
  displayRegistration: string;
  make: string;
  model: string;
  year?: number | null;
  fuelType?: string | null;
  colour?: string | null;
  transmission?: string | null;
  engineCapacity?: number | null;
  /** Optional BHP from a future specification provider - not from DVLA VES. */
  powerBhp?: number | null;
  /** Optional combined MPG from a future specification dataset. */
  combinedMpg?: number | null;
  /** Optional annual road tax amount when known (mock/demo or future source). */
  annualRoadTaxGbp?: number | null;
  latestMileage?: number | null;
  tax: TaxStatus;
  motStatus: {
    status: "Valid" | "Expired" | "No MOT" | "Unknown";
    expiryDate?: string | null;
  };
  recalls: RecallStatus;
  isDemo: boolean;
  /** Catalogue image path under /public/cars when resolved from the image library. */
  imageSrc?: string | null;
  /** True when the image is the nearest same-model generation, not an exact year match. */
  imageIsRepresentative?: boolean;
}

export interface VehicleRecord {
  summary: VehicleSummary;
  details: VehicleDetails;
  motTests: MotTest[];
  mileageHistory: MileagePoint[];
  recalls: RecallStatus;
  buyerScore: BuyerScoreResult | null;
  dataQuality: {
    sources: Array<"DVLA" | "DVSA" | "MOCK" | "DERIVED">;
    notes: string[];
  };
}

export type BuyerScoreBand =
  | "excellent-history"
  | "good-history"
  | "mixed-history"
  | "needs-attention";

export type BuyerScoreReasonSeverity =
  | "positive"
  | "info"
  | "warning"
  | "negative";

export interface BuyerScoreReason {
  type: string;
  label: string;
  impact: number;
  severity: BuyerScoreReasonSeverity;
}

export interface BuyerScoreInput {
  yearOfManufacture?: number | null;
  motTests: MotTest[];
  mileageHistory: MileagePoint[];
  recalls?: RecallStatus | null;
}

export interface BuyerScoreResult {
  score: number | null;
  band: BuyerScoreBand | null;
  label: string | null;
  reasons: BuyerScoreReason[];
  confidence: "low" | "medium" | "high";
}

export interface BuyerScoreBreakdown {
  startingScore: number;
  lines: Array<{ label: string; impact: number }>;
  finalScore: number | null;
  band: BuyerScoreBand | null;
  label: string | null;
}

/** Future commercial provenance - not provided by DVLA/DVSA. */
export interface VehicleProvenance {
  registration: string;
  outstandingFinance?: boolean | null;
  writtenOff?: boolean | null;
  writeOffCategory?: string | null;
  stolen?: boolean | null;
  keeperChanges?: number | null;
  imported?: boolean | null;
  exported?: boolean | null;
  provider: string;
  retrievedAt: string;
}

export interface VehicleProvenanceProvider {
  lookup(registration: string): Promise<VehicleProvenance | null>;
}

export type LookupErrorCode =
  | "INVALID_REGISTRATION"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "UNAVAILABLE"
  | "UNKNOWN";

export interface LookupError {
  code: LookupErrorCode;
  message: string;
}

export type VehicleLookupResult =
  | { ok: true; data: VehicleRecord }
  | { ok: false; error: LookupError };
