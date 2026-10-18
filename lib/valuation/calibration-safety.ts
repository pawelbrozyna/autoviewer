import { normalize } from "./profiles";
import type { ValuationInput, ValuationProfile } from "./types";

/** The same material scope checks apply to direct engine and server-adapter calls. */
export function calibratedScopeRejection(p: ValuationProfile, input: ValuationInput): string | null {
  if (!p.calibration) return null;
  const text = normalize([input.model, input.derivative, input.bodyType].filter(Boolean).join(" "));
  if (/\b(?:ambulance|police|fire engine|fire appliance|fire tender|hearse|taxi|bus|coach|gritter|refuse|sweeper)\b/.test(text)) return "specialist_or_public_service";
  const badges = text.replace(/\b(?:r|st|amg) line\b/g, "");
  if (/\b(?:vxr|vrs|gtd|gte|r32|clubsport|cupra|brabus|nismo)\b/.test(badges) || p.model === "Golf" && /\br\b/.test(badges)) return "performance_identity_requires_specific_profile";
  if (/\b(?:cat [sncdab]|salvage|damaged|spares|non runner|modified|tuned)\b/.test(text)) return "outside_typical_comparable_condition";
  if (p.fuel === "electric" && /\b(?:battery lease|leased battery|battery rental|battery fault|degraded battery)\b/.test(text)) return "battery_condition_or_ownership_outside_anchor";
  if (p.fuel === "electric" && (/\b(?:e plus|eplus)\b/.test(text) || [...(input.derivative ?? "").matchAll(/\b(\d+)\s*kwh\b/gi)].some(m => +m[1] !== p.calibration!.batteryKWh))) return "incompatible_battery_specification";
  const engine = p.calibration.engineLitres;
  if (engine !== null) {
    if (input.engineCapacity != null && (!Number.isFinite(input.engineCapacity) || input.engineCapacity <= 0 || Math.abs(input.engineCapacity - engine * 1000) > 100)) return "engine_capacity_conflicts_with_calibrated_scope";
    const stated = [...(input.derivative ?? "").matchAll(/\b(\d\.\d{1,2})(?:[a-z]|\b)/gi)].map(m => +m[1]);
    if (stated.some(value => Math.abs(value - engine) > 0.06)) return "engine_text_conflicts_with_calibrated_scope";
  }
  return null;
}
