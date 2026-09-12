import type {
  MileagePoint,
  VehicleLookupResult,
  VehicleRecord,
} from "@/types/vehicle";
import {
  DvlaApiError,
  fetchDvlaVehicle,
  isDvlaConfigured,
  mapDvlaToDetails,
} from "@/lib/api/dvla";
import {
  DvsaApiError,
  fetchDvsaVehicleByRegistration,
  isDvsaConfigured,
  mapDvsaMotTests,
} from "@/lib/api/dvsa";
import { getMockVehicle } from "@/lib/api/mock";
import {
  formatRegistrationDisplay,
  isValidRegistrationFormat,
  normalizeRegistration,
} from "@/lib/vehicle/registration";
import { resolveImageFieldsForVehicle } from "@/lib/vehicle/images";
import { calculateBuyerScore } from "@/lib/vehicle/score";

function isMockModeEnabled(): boolean {
  if (process.env.USE_MOCK_DATA === "true") return true;
  if (process.env.USE_MOCK_DATA === "false") return false;
  return !(isDvlaConfigured() || isDvsaConfigured());
}

function mapMotStatus(
  expiry?: string | null,
  raw?: string | null,
): VehicleRecord["summary"]["motStatus"] {
  if (raw) {
    const lower = raw.toLowerCase();
    if (lower.includes("valid") || lower.includes("no details held")) {
      return { status: "Valid", expiryDate: expiry ?? null };
    }
    if (lower.includes("not valid") || lower.includes("expired")) {
      return { status: "Expired", expiryDate: expiry ?? null };
    }
  }
  if (expiry) {
    const exp = new Date(expiry).getTime();
    if (!Number.isNaN(exp)) {
      return {
        status: exp >= Date.now() ? "Valid" : "Expired",
        expiryDate: expiry,
      };
    }
  }
  return { status: "Unknown", expiryDate: expiry ?? null };
}

export async function lookupVehicle(
  registrationInput: string,
): Promise<VehicleLookupResult> {
  if (!isValidRegistrationFormat(registrationInput)) {
    return {
      ok: false,
      error: {
        code: "INVALID_REGISTRATION",
        message: "Enter a valid UK registration number.",
      },
    };
  }

  const registration = normalizeRegistration(registrationInput);

  if (isMockModeEnabled()) {
    const mock = getMockVehicle(registration);
    if (!mock) {
      return {
        ok: false,
        error: {
          code: "NOT_FOUND",
          message:
            "We couldn't find that registration in demo mode. Try AB12 CDE or CD34 EFG.",
        },
      };
    }
    return { ok: true, data: mock };
  }

  try {
    let detailsPart: ReturnType<typeof mapDvlaToDetails> | null = null;
    let motTests = mapDvsaMotTests([]);
    let make = "Unknown";
    let model = "";
    let colour: string | null = null;
    let fuelType: string | null = null;
    let year: number | null = null;
    let engineCapacity: number | null = null;
    let hasOutstandingRecall = false;
    const sources: VehicleRecord["dataQuality"]["sources"] = [];

    if (isDvlaConfigured()) {
      const dvla = await fetchDvlaVehicle(registration);
      detailsPart = mapDvlaToDetails(dvla);
      make = detailsPart.details.make;
      colour = detailsPart.details.colour ?? null;
      fuelType = detailsPart.details.fuelType ?? null;
      year = detailsPart.details.yearOfManufacture ?? null;
      engineCapacity = detailsPart.details.engineCapacity ?? null;
      sources.push("DVLA");
    }

    if (isDvsaConfigured()) {
      const dvsa = await fetchDvsaVehicleByRegistration(registration);
      motTests = mapDvsaMotTests(dvsa.motTests ?? []);
      make = dvsa.make || make;
      model = dvsa.model || model;
      colour = dvsa.primaryColour || colour;
      fuelType = dvsa.fuelType || fuelType;
      if (dvsa.engineSize) {
        engineCapacity =
          typeof dvsa.engineSize === "string"
            ? Number.parseInt(dvsa.engineSize, 10)
            : dvsa.engineSize;
      }
      hasOutstandingRecall =
        (dvsa.hasOutstandingRecall ?? "").toLowerCase() === "yes";
      sources.push("DVSA");
    }

    if (!detailsPart && motTests.length === 0 && make === "Unknown") {
      return {
        ok: false,
        error: {
          code: "UNAVAILABLE",
          message: "Vehicle data is temporarily unavailable. Please try again.",
        },
      };
    }

    const mileageHistory: MileagePoint[] = motTests
      .filter((t) => t.odometerValue != null)
      .map((t) => ({
        date: t.completedDate,
        mileage: t.odometerValue as number,
        source: "MOT",
      }));

    const latestMileage =
      mileageHistory.length > 0
        ? [...mileageHistory].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          )[0].mileage
        : null;

    const latestPass = [...motTests]
      .filter((t) => t.testResult === "PASS" && t.expiryDate)
      .sort(
        (a, b) =>
          new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime(),
      )[0];

    const recalls = {
      hasOpenRecalls: hasOutstandingRecall,
      count: hasOutstandingRecall ? 1 : 0,
      items: hasOutstandingRecall
        ? [
            {
              title: "Outstanding manufacturer recall indicated",
              description:
                "Check with the manufacturer or a franchised dealer for full recall details.",
              status: "Open",
            },
          ]
        : [],
      sourceNote: hasOutstandingRecall
        ? "Recall flag provided by MOT History API where available."
        : undefined,
    };

    const tax = detailsPart?.tax ?? { status: "Unknown" as const };
    const motStatus = mapMotStatus(
      detailsPart?.motExpiryDate ?? latestPass?.expiryDate,
      detailsPart?.motStatusRaw,
    );

    const buyerScore = calculateBuyerScore({
      yearOfManufacture: year,
      motTests,
      mileageHistory,
      recalls,
    });

    const image = resolveImageFieldsForVehicle({
      make,
      model: model || detailsPart?.details.model || "Vehicle",
      year,
    });

    const record: VehicleRecord = {
      summary: {
        registration,
        displayRegistration: formatRegistrationDisplay(registration),
        make,
        model: model || detailsPart?.details.model || "Vehicle",
        year,
        fuelType,
        colour,
        transmission: detailsPart?.details.transmission ?? null,
        engineCapacity,
        powerBhp: null,
        combinedMpg: null,
        annualRoadTaxGbp: null,
        latestMileage,
        tax,
        motStatus,
        recalls,
        isDemo: false,
        imageSrc: image.imageSrc,
        imageIsRepresentative: image.imageIsRepresentative,
      },
      details: {
        registration,
        make,
        model: model || detailsPart?.details.model || "Vehicle",
        colour,
        fuelType,
        engineCapacity,
        yearOfManufacture: year,
        monthOfFirstRegistration:
          detailsPart?.details.monthOfFirstRegistration ?? null,
        co2Emissions: detailsPart?.details.co2Emissions ?? null,
        euroStatus: detailsPart?.details.euroStatus ?? null,
        transmission: detailsPart?.details.transmission ?? null,
        wheelplan: detailsPart?.details.wheelplan ?? null,
        typeApproval: detailsPart?.details.typeApproval ?? null,
        revenueWeight: detailsPart?.details.revenueWeight ?? null,
        markedForExport: detailsPart?.details.markedForExport,
      },
      motTests,
      mileageHistory,
      recalls,
      buyerScore,
      dataQuality: {
        sources,
        notes: [
          "Vehicle information from official UK data sources where configured.",
          "AutoViewer is independent and not affiliated with DVLA or DVSA.",
        ],
      },
    };

    return { ok: true, data: record };
  } catch (err) {
    if (err instanceof DvlaApiError || err instanceof DvsaApiError) {
      if (err.code === "NOT_FOUND") {
        return {
          ok: false,
          error: {
            code: "NOT_FOUND",
            message: "We couldn't find that registration.",
          },
        };
      }
      if (err.code === "RATE_LIMITED") {
        return {
          ok: false,
          error: {
            code: "RATE_LIMITED",
            message:
              "Too many requests right now. Please wait a moment and try again.",
          },
        };
      }
      return {
        ok: false,
        error: {
          code: "UNAVAILABLE",
          message: "Vehicle data is temporarily unavailable. Please try again.",
        },
      };
    }

    return {
      ok: false,
      error: {
        code: "UNKNOWN",
        message: "Vehicle data is temporarily unavailable. Please try again.",
      },
    };
  }
}
