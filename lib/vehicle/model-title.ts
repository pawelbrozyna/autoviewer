import { matchCatalogModel } from "@/lib/vehicle/images";

export type VehicleModelTitle = {
  /** Clean model for headings, e.g. "S-Class" or "Combo". */
  model: string;
  /** Remaining trim, engine or gearbox text, e.g. "2300 Dynamic TD". */
  variant: string | null;
};

const DERIVATIVE_MARKER =
  /^(?:\d\.\d+[a-z]*|tdi|tsi|tfsi|hdi|bluehdi|cdti|crdi|dci|tdci|d4d|vvt\w*|vtec|ecoboost|ecoblue|auto|automatic|manual|cvt|dsg|dct|edc|hev|phev|mhev|hybrid|diesel|petrol|turbo)$/;

function normalize(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function compact(value: string) {
  return normalize(value).replace(/ /g, "");
}

function result(model: string, rest: string[]): VehicleModelTitle {
  const variant = rest.join(" ").trim();
  return { model, variant: variant || null };
}

/**
 * Splits a DVSA/DVLA model string into a clean model and its variant/derivative.
 * Uses the image catalogue model name when one matches; otherwise only cuts at
 * obvious engine, fuel or gearbox words. Never returns an empty model.
 */
export function splitVehicleModel(
  make: string | null | undefined,
  model: string | null | undefined,
): VehicleModelTitle {
  const raw = model?.trim() ?? "";
  if (!raw) return { model: raw, variant: null };
  const tokens = raw.split(/\s+/);
  const catalog = make ? matchCatalogModel(make, raw) : null;

  if (catalog) {
    const catalogKey = normalize(catalog);
    for (let i = tokens.length; i >= 1; i--) {
      const prefix = tokens.slice(0, i).join(" ");
      if (normalize(prefix) === catalogKey || compact(prefix) === compact(catalog)) {
        return result(catalog, tokens.slice(i));
      }
    }
    for (let i = tokens.length - 1; i >= 1; i--) {
      const prefix = tokens.slice(0, i).join(" ");
      const prefixKey = normalize(prefix);
      if (/^[a-z]{3,}/.test(prefixKey) && catalogKey.startsWith(`${prefixKey} `)) {
        return result(prefix, tokens.slice(i));
      }
    }
    return { model: catalog, variant: compact(raw) === compact(catalog) ? null : raw };
  }

  const cut = tokens.findIndex((token, index) => index > 0 && DERIVATIVE_MARKER.test(token.toLowerCase()));
  return cut > 0 ? result(tokens.slice(0, cut).join(" "), tokens.slice(cut)) : { model: raw, variant: null };
}

/** `VehicleSummary` fields for the clean report heading. */
export function modelTitleFields(
  make: string | null | undefined,
  model: string | null | undefined,
): { modelTitle: string; modelVariant: string | null } {
  const split = splitVehicleModel(make, model);
  return { modelTitle: split.model, modelVariant: split.variant };
}
