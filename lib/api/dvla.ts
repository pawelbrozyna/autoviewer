import type { VehicleDetails, TaxStatus } from "@/types/vehicle";
import { normalizeRegistration } from "@/lib/vehicle/registration";

const DEFAULT_URL =
  "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles";

export interface DvlaVehicleResponse {
  registrationNumber: string;
  taxStatus?: string;
  taxDueDate?: string;
  motStatus?: string;
  motExpiryDate?: string;
  make?: string;
  yearOfManufacture?: number;
  engineCapacity?: number;
  co2Emissions?: number;
  fuelType?: string;
  markedForExport?: boolean;
  colour?: string;
  typeApproval?: string;
  wheelplan?: string;
  revenueWeight?: number;
  dateOfLastV5CIssued?: string;
  euroStatus?: string;
  realDrivingEmissions?: string;
  monthOfFirstRegistration?: string;
}

export class DvlaApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: "NOT_FOUND" | "RATE_LIMITED" | "BAD_REQUEST" | "UNAVAILABLE" | "UNKNOWN",
  ) {
    super(message);
    this.name = "DvlaApiError";
  }
}

function mapTaxStatus(raw?: string): TaxStatus {
  const value = (raw ?? "").toLowerCase();
  if (value.includes("sorn")) return { status: "SORN", dueDate: null };
  if (value.includes("taxed")) return { status: "Taxed" };
  if (value.includes("untaxed") || value.includes("not taxed"))
    return { status: "Untaxed" };
  return { status: "Unknown" };
}

export function mapDvlaToDetails(data: DvlaVehicleResponse): {
  details: VehicleDetails;
  tax: TaxStatus;
  motExpiryDate?: string | null;
  motStatusRaw?: string | null;
} {
  const registration = normalizeRegistration(data.registrationNumber);
  const tax = mapTaxStatus(data.taxStatus);
  tax.dueDate = data.taxDueDate ?? null;
  tax.markedForExport = data.markedForExport;

  return {
    details: {
      registration,
      make: data.make ?? "Unknown",
      model: "",
      colour: data.colour ?? null,
      fuelType: data.fuelType ?? null,
      engineCapacity: data.engineCapacity ?? null,
      yearOfManufacture: data.yearOfManufacture ?? null,
      monthOfFirstRegistration: data.monthOfFirstRegistration ?? null,
      co2Emissions: data.co2Emissions ?? null,
      euroStatus: data.euroStatus ?? null,
      wheelplan: data.wheelplan ?? null,
      typeApproval: data.typeApproval ?? null,
      revenueWeight: data.revenueWeight ?? null,
      markedForExport: data.markedForExport,
    },
    tax,
    motExpiryDate: data.motExpiryDate ?? null,
    motStatusRaw: data.motStatus ?? null,
  };
}

/**
 * DVLA Vehicle Enquiry Service adapter.
 * Keys stay server-side only. See .env.example.
 */
export async function fetchDvlaVehicle(
  registration: string,
): Promise<DvlaVehicleResponse> {
  const apiKey = process.env.DVLA_API_KEY;
  if (!apiKey) {
    throw new DvlaApiError("DVLA API key is not configured", 503, "UNAVAILABLE");
  }

  const url = process.env.DVLA_API_URL || DEFAULT_URL;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        registrationNumber: normalizeRegistration(registration),
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (res.status === 404) {
      throw new DvlaApiError("Vehicle not found", 404, "NOT_FOUND");
    }
    if (res.status === 429) {
      throw new DvlaApiError("Rate limited", 429, "RATE_LIMITED");
    }
    if (res.status === 400) {
      throw new DvlaApiError("Bad request", 400, "BAD_REQUEST");
    }
    if (!res.ok) {
      throw new DvlaApiError("DVLA unavailable", res.status, "UNAVAILABLE");
    }

    return (await res.json()) as DvlaVehicleResponse;
  } catch (err) {
    if (err instanceof DvlaApiError) throw err;
    throw new DvlaApiError("DVLA request failed", 503, "UNAVAILABLE");
  } finally {
    clearTimeout(timeout);
  }
}

export function isDvlaConfigured(): boolean {
  return Boolean(process.env.DVLA_API_KEY);
}
