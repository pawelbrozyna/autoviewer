import "server-only";
import { lookupLocalRegistrationKnowledge } from "@/lib/vehicle/vehicle-resolution";
import { estimateValuation, noEstimate } from "./engine";
import type { ValuationInput, ValuationResult } from "./types";

/** Public server entry point: trusted registration knowledge wins over caller/API category. */
export function valuateVehicle(input: ValuationInput, now: Date = new Date()): ValuationResult {
  const local = lookupLocalRegistrationKnowledge(input.registration);
  if (local?.category === "public_service" || local?.category === "specialist" || input.vehicleCategory === "public_service" || input.vehicleCategory === "specialist") return noEstimate("specialist_or_public_service");
  return estimateValuation(input, { now });
}

export type { ValuationInput, ValuationResult } from "./types";
