import type { MotDefect, MotDefectType, MotResult, MotTest } from "@/types/vehicle";
import { normalizeRegistration } from "@/lib/vehicle/registration";

/**
 * Current DVSA MOT History API adapter.
 * Docs: https://documentation.history.mot.api.gov.uk/
 *
 * Auth: OAuth 2.0 client credentials + X-API-Key.
 * Lookup: GET /v1/trade/vehicles/registration/{registration}
 */

const DEFAULT_BASE = "https://history.mot.api.gov.uk";

export interface DvsaMotDefect {
  type?: string;
  text?: string;
  dangerous?: boolean;
}

export interface DvsaMotTest {
  completedDate?: string;
  expiryDate?: string;
  testResult?: string;
  odometerValue?: number | string;
  odometerUnit?: string;
  motTestNumber?: string;
  defects?: DvsaMotDefect[];
}

export interface DvsaVehicleResponse {
  registration?: string;
  make?: string;
  model?: string;
  firstUsedDate?: string;
  fuelType?: string;
  primaryColour?: string;
  registrationDate?: string;
  manufactureDate?: string;
  engineSize?: number | string;
  hasOutstandingRecall?: string;
  motTests?: DvsaMotTest[];
}

export class DvsaApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: "NOT_FOUND" | "RATE_LIMITED" | "UNAVAILABLE" | "UNKNOWN",
  ) {
    super(message);
    this.name = "DvsaApiError";
  }
}

let cachedToken: { value: string; expiresAt: number } | null = null;

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

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const clientId = process.env.DVSA_MOT_CLIENT_ID;
  const clientSecret = process.env.DVSA_MOT_CLIENT_SECRET;
  const tenantId = process.env.DVSA_MOT_TENANT_ID;
  const scope = process.env.DVSA_MOT_SCOPE || "https://tapi.dvsa.gov.uk/.default";

  if (!clientId || !clientSecret || !tenantId) {
    throw new DvsaApiError("DVSA credentials are not configured", 503, "UNAVAILABLE");
  }

  const tokenUrl = `https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    const res = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: controller.signal,
      cache: "no-store",
    });

    if (!res.ok) {
      throw new DvsaApiError("Failed to authenticate with DVSA", 503, "UNAVAILABLE");
    }

    const json = (await res.json()) as {
      access_token?: string;
      expires_in?: number;
    };

    if (!json.access_token) {
      throw new DvsaApiError("Missing DVSA access token", 503, "UNAVAILABLE");
    }

    cachedToken = {
      value: json.access_token,
      expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000,
    };

    return json.access_token;
  } catch (err) {
    if (err instanceof DvsaApiError) throw err;
    throw new DvsaApiError("DVSA authentication failed", 503, "UNAVAILABLE");
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchDvsaVehicleByRegistration(
  registration: string,
): Promise<DvsaVehicleResponse> {
  const apiKey = process.env.DVSA_MOT_API_KEY;
  if (!apiKey) {
    throw new DvsaApiError("DVSA API key is not configured", 503, "UNAVAILABLE");
  }

  const token = await getAccessToken();
  const base = process.env.DVSA_MOT_API_URL || DEFAULT_BASE;
  const reg = encodeURIComponent(normalizeRegistration(registration));
  const url = `${base}/v1/trade/vehicles/registration/${reg}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-API-Key": apiKey,
        Accept: "application/json",
      },
      signal: controller.signal,
      cache: "no-store",
    });

    if (res.status === 404) {
      throw new DvsaApiError("Vehicle not found", 404, "NOT_FOUND");
    }
    if (res.status === 429) {
      throw new DvsaApiError("Rate limited", 429, "RATE_LIMITED");
    }
    if (!res.ok) {
      throw new DvsaApiError("DVSA unavailable", res.status, "UNAVAILABLE");
    }

    return (await res.json()) as DvsaVehicleResponse;
  } catch (err) {
    if (err instanceof DvsaApiError) throw err;
    throw new DvsaApiError("DVSA request failed", 503, "UNAVAILABLE");
  } finally {
    clearTimeout(timeout);
  }
}

export function isDvsaConfigured(): boolean {
  return Boolean(
    process.env.DVSA_MOT_API_KEY &&
      process.env.DVSA_MOT_CLIENT_ID &&
      process.env.DVSA_MOT_CLIENT_SECRET &&
      process.env.DVSA_MOT_TENANT_ID,
  );
}
