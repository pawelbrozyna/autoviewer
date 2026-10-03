import "server-only";
import { normalizeRegistration } from "@/lib/vehicle/registration";

/**
 * Server-only client for the DVSA MOT History API.
 * Docs: https://documentation.history.mot.api.gov.uk/
 *
 * Auth: OAuth 2.0 client_credentials (bearer token) plus X-API-Key on every call.
 * Credentials and tokens must never reach the browser.
 */

const API_BASE_URL = "https://history.mot.api.gov.uk";
const TOKEN_REFRESH_MARGIN_MS = 60_000;
const TOKEN_TIMEOUT_MS = 12_000;
const API_TIMEOUT_MS = 15_000;

export type DvsaErrorCode =
  | "NOT_CONFIGURED"
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "UNAVAILABLE"
  | "UNKNOWN";

export class DvsaApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: DvsaErrorCode,
    public retryAfterSeconds: number | null = null,
  ) {
    super(message);
    this.name = "DvsaApiError";
  }
}

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
  odometerResultType?: string;
  motTestNumber?: string;
  dataSource?: string;
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
  motTestDueDate?: string;
  engineSize?: number | string;
  hasOutstandingRecall?: string;
  motTests?: DvsaMotTest[];
}

type DvsaConfig = {
  clientId: string;
  clientSecret: string;
  apiKey: string;
  scope: string;
  tokenUrl: string;
};

const REQUIRED_ENV = [
  "DVSA_CLIENT_ID",
  "DVSA_CLIENT_SECRET",
  "DVSA_API_KEY",
  "DVSA_SCOPE_URL",
  "DVSA_TOKEN_URL",
] as const;

function readConfig(): DvsaConfig {
  const missing = REQUIRED_ENV.filter((name) => !process.env[name]?.trim());
  if (missing.length > 0) {
    throw new DvsaApiError(
      `DVSA is not configured. Missing: ${missing.join(", ")}`,
      503,
      "NOT_CONFIGURED",
    );
  }
  return {
    clientId: process.env.DVSA_CLIENT_ID!.trim(),
    clientSecret: process.env.DVSA_CLIENT_SECRET!.trim(),
    apiKey: process.env.DVSA_API_KEY!.trim(),
    scope: process.env.DVSA_SCOPE_URL!.trim(),
    tokenUrl: process.env.DVSA_TOKEN_URL!.trim(),
  };
}

export function isDvsaConfigured(): boolean {
  return REQUIRED_ENV.every((name) => Boolean(process.env[name]?.trim()));
}

let cachedToken: { value: string; expiresAt: number } | null = null;
let pendingToken: Promise<string> | null = null;

function clearCachedToken() {
  cachedToken = null;
}

async function requestAccessToken(config: DvsaConfig): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TOKEN_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(config.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: config.clientId,
        client_secret: config.clientSecret,
        scope: config.scope,
      }),
      signal: controller.signal,
      cache: "no-store",
    });
  } catch {
    throw new DvsaApiError(
      "DVSA token service could not be reached",
      503,
      "UNAVAILABLE",
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    // Only surface the OAuth error code (e.g. invalid_client), never the request body.
    const oauthError = await res
      .json()
      .then((json: { error?: string }) => json.error ?? null)
      .catch(() => null);
    const detail = oauthError ? ` (${oauthError})` : "";
    if (res.status >= 500) {
      throw new DvsaApiError(
        `DVSA token service error ${res.status}${detail}`,
        503,
        "UNAVAILABLE",
      );
    }
    throw new DvsaApiError(
      `DVSA token request rejected with ${res.status}${detail}. Check DVSA_CLIENT_ID, DVSA_CLIENT_SECRET and DVSA_SCOPE_URL.`,
      401,
      "UNAUTHORIZED",
    );
  }

  const json = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    expires_in?: number | string;
  };
  if (!json.access_token) {
    throw new DvsaApiError(
      "DVSA token response did not include an access token",
      503,
      "UNAVAILABLE",
    );
  }

  const expiresInSeconds = Number(json.expires_in) || 3600;
  cachedToken = {
    value: json.access_token,
    expiresAt: Date.now() + expiresInSeconds * 1000,
  };
  return json.access_token;
}

async function getAccessToken(config: DvsaConfig): Promise<string> {
  if (
    cachedToken &&
    cachedToken.expiresAt - TOKEN_REFRESH_MARGIN_MS > Date.now()
  ) {
    return cachedToken.value;
  }
  // Concurrent callers share one token request instead of each hitting the token endpoint.
  pendingToken ??= requestAccessToken(config).finally(() => {
    pendingToken = null;
  });
  return pendingToken;
}

function parseRetryAfter(header: string | null): number | null {
  if (!header) return null;
  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds;
  const date = Date.parse(header);
  if (Number.isNaN(date)) return null;
  return Math.max(0, Math.round((date - Date.now()) / 1000));
}

async function dvsaGet(path: string, config: DvsaConfig): Promise<Response> {
  const token = await getAccessToken(config);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  try {
    return await fetch(`${API_BASE_URL}${path}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-API-Key": config.apiKey,
        Accept: "application/json",
      },
      signal: controller.signal,
      cache: "no-store",
    });
  } catch {
    throw new DvsaApiError("DVSA MOT History API could not be reached", 503, "UNAVAILABLE");
  } finally {
    clearTimeout(timeout);
  }
}

/** Fetch vehicle details and full MOT history for one UK registration. */
export async function fetchMotHistory(
  registration: string,
): Promise<DvsaVehicleResponse> {
  const reg = normalizeRegistration(registration);
  if (!reg) {
    throw new DvsaApiError("Registration is required", 400, "BAD_REQUEST");
  }

  const config = readConfig();
  const path = `/v1/trade/vehicles/registration/${encodeURIComponent(reg)}`;

  let res = await dvsaGet(path, config);
  if (res.status === 401) {
    // The cached token may have been revoked early; retry once with a fresh one.
    clearCachedToken();
    res = await dvsaGet(path, config);
  }

  if (res.ok) {
    return (await res.json()) as DvsaVehicleResponse;
  }

  switch (res.status) {
    case 400:
      throw new DvsaApiError(`Invalid registration: ${reg}`, 400, "BAD_REQUEST");
    case 401:
      clearCachedToken();
      throw new DvsaApiError(
        "DVSA rejected the access token. Check DVSA_CLIENT_ID, DVSA_CLIENT_SECRET and DVSA_SCOPE_URL.",
        401,
        "UNAUTHORIZED",
      );
    case 403:
      throw new DvsaApiError(
        "DVSA refused access. Check DVSA_API_KEY and that the app is approved for the MOT History API.",
        403,
        "FORBIDDEN",
      );
    case 404:
      throw new DvsaApiError(`No MOT record found for ${reg}`, 404, "NOT_FOUND");
    case 429:
      throw new DvsaApiError(
        "DVSA rate limit reached",
        429,
        "RATE_LIMITED",
        parseRetryAfter(res.headers.get("retry-after")),
      );
    default:
      if (res.status >= 500) {
        throw new DvsaApiError(
          `DVSA MOT History API is unavailable (${res.status})`,
          503,
          "UNAVAILABLE",
        );
      }
      throw new DvsaApiError(
        `Unexpected DVSA response ${res.status}`,
        res.status,
        "UNKNOWN",
      );
  }
}
