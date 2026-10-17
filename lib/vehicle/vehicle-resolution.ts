import "server-only";

import {
  findSheffieldCouncilVehicle,
  resolveSheffieldCouncilImageFields,
} from "@/lib/vehicle/sheffield-council-fleet";
import {
  findSpecialVehicleRegistration,
  isMissingVehicleIdentity,
  resolveSpecialVehicleImageFields,
  type FleetDisplayFields,
} from "@/lib/vehicle/special-vehicle-fleet";
import { modelTitleFields } from "@/lib/vehicle/model-title";
import { normalizeRegistration } from "@/lib/vehicle/registration";
import {
  resolveImageFieldsForVehicle,
  type VehicleImageInput,
} from "@/lib/vehicle/images";
import { findTflBusType, resolveTflBusImageFields } from "@/lib/vehicle/tfl-bus-fleet";
import {
  resolveVehicleCategory,
  type VehicleCategory,
} from "@/lib/vehicle/vehicle-category";

/**
 * Shared vehicle resolution for reports, cards and images.
 *
 * A. Normalize registration
 * B. Exact-registration local knowledge (special-vehicle map)
 * C. Trusted structured fleet maps (TfL, Sheffield)
 * D. External DVSA/DVLA values fill gaps only
 * E. Image: exact-registration → TfL → Sheffield → generic matcher → placeholder
 *
 * Local verified identity always wins over UNKNOWN / null / empty external values.
 * Local exact-registration make/model/body also wins over a broader external value.
 */

export type IdentityFieldSource =
  | "local-exact"
  | "fleet-tfl"
  | "fleet-sheffield"
  | "external"
  | "derived";

export type LocalRegistrationKnowledge = {
  registration: string;
  make: string | null;
  model: string | null;
  body: string | null;
  /** Catalogue priority when the mapping points at vehicle-images.json. */
  imageRecordId: number | null;
  source: string;
  tier: "exact" | "fleet-tfl" | "fleet-sheffield";
  /** Trusted category for Full Report eligibility. */
  category: VehicleCategory;
};

export type MergedVehicleIdentity = FleetDisplayFields & {
  body: string | null;
  sources: {
    make: IdentityFieldSource;
    model: IdentityFieldSource;
    body: IdentityFieldSource;
  };
  local: LocalRegistrationKnowledge | null;
};

type ImageFields = ReturnType<typeof resolveImageFieldsForVehicle>;

function compactIdentity(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** API make is a shortened form of the verified local make ("Mercedes" vs "Mercedes-Benz"). */
function localMakeCompletesExternal(externalMake: string, localMake: string): boolean {
  const external = compactIdentity(externalMake);
  const local = compactIdentity(localMake);
  if (!external || !local || external === local) return false;
  return local.startsWith(external) || external.startsWith(local);
}

/**
 * Look up verified local knowledge for a plate.
 * Exact special-vehicle mappings beat structured fleet lists.
 */
export function lookupLocalRegistrationKnowledge(
  registration: string | null | undefined,
): LocalRegistrationKnowledge | null {
  if (!registration) return null;
  const normalized = normalizeRegistration(registration);

  const special = findSpecialVehicleRegistration(normalized);
  if (special) {
    return {
      registration: normalized,
      make: special.make?.trim() || null,
      model: special.model?.trim() || null,
      body: special.body?.trim() || null,
      imageRecordId:
        typeof special.imageRecordId === "number" ? special.imageRecordId : null,
      source: special.source,
      tier: "exact",
      category: resolveVehicleCategory({
        tier: "exact",
        exactCategory: special.category ?? null,
      }),
    };
  }

  const sheffield = findSheffieldCouncilVehicle(normalized);
  if (sheffield) {
    return {
      registration: normalized,
      make: sheffield.make?.trim() || null,
      model: sheffield.model?.trim() || null,
      body: sheffield.type?.trim() || null,
      imageRecordId: null,
      source: "Sheffield Council fleet",
      tier: "fleet-sheffield",
      category: resolveVehicleCategory({ tier: "fleet-sheffield" }),
    };
  }

  const tfl = findTflBusType(normalized);
  if (tfl) {
    return {
      registration: normalized,
      make: null,
      model: tfl.chassis?.trim() || null,
      body:
        [tfl.body, tfl.deck ? `${tfl.deck} deck` : null]
          .filter(Boolean)
          .join(", ") || null,
      imageRecordId: null,
      source: "TfL fleet data",
      tier: "fleet-tfl",
      category: resolveVehicleCategory({ tier: "fleet-tfl" }),
    };
  }

  return null;
}

/** Category for a plate from trusted local/fleet knowledge only. */
export function resolveRegistrationVehicleCategory(
  registration: string | null | undefined,
): VehicleCategory {
  return lookupLocalRegistrationKnowledge(registration)?.category ?? "standard";
}

type PreferResult = {
  value: string;
  fromLocal: boolean;
};

function preferLocalIdentityValue(
  localValue: string | null | undefined,
  externalValue: string | null | undefined,
  options: { alwaysPreferLocal: boolean; allowMakeCompletion?: boolean },
): PreferResult {
  const local = localValue?.trim() || "";
  const external = externalValue?.trim() || "";
  const localMissing = !local || isMissingVehicleIdentity(local);
  const externalMissing = !external || isMissingVehicleIdentity(external);

  if (!localMissing && (options.alwaysPreferLocal || externalMissing)) {
    return { value: local, fromLocal: true };
  }
  if (
    options.allowMakeCompletion &&
    !localMissing &&
    !externalMissing &&
    localMakeCompletesExternal(external, local)
  ) {
    return { value: local, fromLocal: true };
  }
  if (!externalMissing) {
    return { value: external, fromLocal: false };
  }
  if (!localMissing) {
    return { value: local, fromLocal: true };
  }
  return { value: external || local || "", fromLocal: false };
}

function tierToSource(tier: LocalRegistrationKnowledge["tier"]): IdentityFieldSource {
  if (tier === "exact") return "local-exact";
  if (tier === "fleet-tfl") return "fleet-tfl";
  return "fleet-sheffield";
}

/**
 * Merge local exact/fleet identity with external DVSA/DVLA values.
 * Verified local fields win over UNKNOWN/null/empty, and exact-registration
 * make/model/body win over a broader external value for the same plate.
 */
export function mergeVehicleIdentity(input: {
  registration: string | null | undefined;
  make: string;
  model: string;
  local?: LocalRegistrationKnowledge | null;
}): MergedVehicleIdentity {
  const local =
    input.local === undefined
      ? lookupLocalRegistrationKnowledge(input.registration)
      : input.local;
  const exact = local?.tier === "exact";
  const sheffield = local?.tier === "fleet-sheffield";

  const makePick = preferLocalIdentityValue(local?.make, input.make, {
    alwaysPreferLocal: Boolean(exact),
    allowMakeCompletion: true,
  });
  const modelPick = preferLocalIdentityValue(local?.model, input.model, {
    alwaysPreferLocal: Boolean(exact || sheffield),
  });
  const bodyPick = preferLocalIdentityValue(local?.body, null, {
    alwaysPreferLocal: true,
  });

  const makeSource: IdentityFieldSource = makePick.fromLocal && local
    ? tierToSource(local.tier)
    : "external";
  const modelSource: IdentityFieldSource = modelPick.fromLocal && local
    ? tierToSource(local.tier)
    : "external";
  const bodySource: IdentityFieldSource =
    bodyPick.value && bodyPick.fromLocal && local
      ? tierToSource(local.tier)
      : "derived";

  if (local && modelPick.fromLocal && local.model) {
    return {
      make: makePick.value,
      model: modelPick.value,
      body: bodyPick.value || null,
      modelTitle: local.model,
      modelVariant: local.body,
      sources: { make: makeSource, model: modelSource, body: bodySource },
      local,
    };
  }

  const titles = modelTitleFields(makePick.value, modelPick.value);
  return {
    make: makePick.value,
    model: modelPick.value,
    body: bodyPick.value || null,
    modelTitle: titles.modelTitle,
    modelVariant: titles.modelVariant ?? local?.body ?? null,
    sources: { make: makeSource, model: modelSource, body: bodySource },
    local,
  };
}

/**
 * Registration-scoped image resolvers only. Returns null so the caller can
 * fall through to the generic make/model matcher.
 */
export function resolveRegistrationScopedImageFields(
  registration: string | null | undefined,
): ImageFields | null {
  return (
    resolveSpecialVehicleImageFields(registration) ??
    resolveTflBusImageFields(registration) ??
    resolveSheffieldCouncilImageFields(registration)
  );
}

/**
 * Full image priority used by the vehicle service and cards:
 * 1. exact-registration image mapping
 * 2. TfL fleet mapping
 * 3. Sheffield fleet mapping
 * 4. generic make/model/generation matcher
 * 5. placeholder (via the generic matcher)
 */
export function resolveVehicleImageByPriority(
  registration: string | null | undefined,
  genericInput: VehicleImageInput,
): ImageFields {
  return (
    resolveRegistrationScopedImageFields(registration) ??
    resolveImageFieldsForVehicle(genericInput)
  );
}

/** Display identity helper used by the vehicle service after external APIs return. */
export function resolveDisplayIdentity(input: {
  registration: string | null | undefined;
  make: string;
  model: string;
}): FleetDisplayFields {
  const merged = mergeVehicleIdentity(input);
  return {
    make: merged.make,
    model: merged.model,
    modelTitle: merged.modelTitle,
    modelVariant: merged.modelVariant,
  };
}
