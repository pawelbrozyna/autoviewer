export type ValuationType = "algorithmic" | "manual_market" | "no_estimate";
export type Confidence = "high" | "medium" | "low";
export type Range = { low: number; high: number };

export interface ResearchReference {
  file: string;
  recordIndex: number;
  status: string;
  key: string | null;
  profileId: string | null;
}

export interface ValuationProfile {
  id: string;
  inventoryProfileIds: string[];
  parentId: string | null;
  scope: string;
  make: string | null;
  model: string;
  matchModels: string[];
  generation: string | null;
  yearFrom: number | null;
  yearTo: number | null;
  body: string | null;
  fuel: string | null;
  variant: string | null;
  classification: string;
  valuationType: ValuationType;
  confidence: Confidence;
  marketDate: string | null;
  centralEstimate: number | null;
  displayRange: Range | null;
  researchDisplayRange: Range | null;
  marketAnchor: {
    value: number;
    marketDate: string;
    referenceVehicleYear: number | null;
    referenceMileage: number | null;
  } | null;
  algorithm: {
    expectedAnnualMileage: number;
    ageAdjustment: { kind: "exponential"; annualRate: number | null };
    mileageAdjustment: { kind: "tanh"; maxAdjustment: number; response: number };
    derivativeModifiers: Array<{ tokens: string[]; multiplier: number }>;
  } | null;
  needsMarketAnchor: boolean;
  needsCalibration: boolean;
  unresolvedDerivativeIdentification: boolean;
  requiredTokenGroups: string[][];
  excludedTokens: string[];
  allowModelFallback: boolean;
  requireExplicitBody: boolean;
  requiresStandardExample: boolean;
  performanceTokens: string[];
  research: ResearchReference[];
  reason: string;
  notes: string[];
  calibration?: {
    cohortId: string;
    sourceProfileId: string;
    curveId: string;
    curveLevel: string;
    engineLitres: number | null;
    batteryKWh: number | null;
    transmission: string | null;
    anchorEvidenceConfidence: Confidence;
    anchorSampleSize: number;
    rangeBasis: string;
    ordinaryComparableAssumption: string;
  };
}

export interface ValuationDatabase {
  schemaVersion: number;
  marketDate: string;
  currency: "GBP";
  makeAliases: Record<string, string>;
  freshness: { downgradeAfterMonths: number; expireAfterMonths: number };
  profiles: ValuationProfile[];
}

/** Values must describe the actual vehicle, not a representative image. Mileage is in miles. */
export interface ValuationInput {
  registration?: string | null;
  make: string;
  model: string;
  derivative?: string | null;
  generation?: string | null;
  year?: number | null;
  bodyType?: string | null;
  fuelType?: string | null;
  transmission?: string | null;
  engineCapacity?: number | null;
  mileage?: number | null;
  vehicleCategory?: "standard" | "public_service" | "specialist";
  /** Explicit caller attestation to the ordinary, usable comparable-example condition. */
  standardExampleConfirmed?: boolean;
}

export interface ValuationResult {
  estimatedValue: { low: number; high: number; mid: number; currency: "GBP" } | null;
  confidence: Confidence | "none";
  valuationType: ValuationType;
  marketDate?: string;
  profileId?: string;
  reason: string;
}
