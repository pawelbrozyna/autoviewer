import { isMissingVehicleIdentity } from "@/lib/vehicle/special-vehicle-fleet";

/**
 * Whether external APIs alone gave enough to continue a lookup.
 * Local exact-registration / fleet knowledge can still salvage UNKNOWN identity.
 */
export function canContinueVehicleLookup(input: {
  hasDvlaDetails: boolean;
  motTestCount: number;
  make: string | null | undefined;
  hasLocalRegistrationKnowledge: boolean;
}): boolean {
  if (input.hasDvlaDetails || input.motTestCount > 0) return true;
  if (!isMissingVehicleIdentity(input.make)) return true;
  return input.hasLocalRegistrationKnowledge;
}
