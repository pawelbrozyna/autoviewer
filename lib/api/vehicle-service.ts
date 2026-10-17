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
import { formatVehicleText } from "@/lib/vehicle/display-text";
import { canContinueVehicleLookup } from "@/lib/api/vehicle-lookup-gate";
import { isMissingVehicleIdentity } from "@/lib/vehicle/special-vehicle-fleet";
import {
  lookupLocalRegistrationKnowledge,
  mergeVehicleIdentity,
  resolveVehicleImageByPriority,
} from "@/lib/vehicle/vehicle-resolution";
import { calculateBuyerScore } from "@/lib/vehicle/score";
import {
  resolveVehicleYear,
  rewriteVehicleDateYear,
  yearFromVehicleDate,
} from "@/lib/vehicle/year";

/** Demo records must never answer a real lookup in production. */
function isMockModeEnabled(): boolean {
  return (
    process.env.USE_MOCK_DATA === "true" &&
    process.env.NODE_ENV !== "production"
  );
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

function mapFirstMotStatus(
  dueDate: string,
): VehicleRecord["summary"]["motStatus"] {
  const due = new Date(dueDate).getTime();
  if (Number.isNaN(due)) return { status: "Unknown", expiryDate: null };
  return {
    status: due >= Date.now() ? "First MOT due" : "No MOT",
    expiryDate: dueDate,
  };
}

const DVLA_REJECTION_RETRY_MS = 60 * 60 * 1000;
let dvlaKeyRejectedAt: number | null = null;

/** Skips DVLA for a while after it rejects the key, as long as DVSA can still serve the report. */
function shouldCallDvla(): boolean {
  if (!isDvlaConfigured()) return false;
  if (dvlaKeyRejectedAt === null || !isDvsaConfigured()) return true;
  return Date.now() - dvlaKeyRejectedAt >= DVLA_REJECTION_RETRY_MS;
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
    let firstRegistrationDate: string | null = null;
    let manufactureDate: string | null = null;
    let dvsaRegistrationDate: string | null = null;
    let firstUsedDate: string | null = null;
    let hasOutstandingRecall = false;
    let recallDataAvailable = false;
    let firstMotDueDate: string | null = null;
    const sources: VehicleRecord["dataQuality"]["sources"] = [];

    let dvla: Awaited<ReturnType<typeof fetchDvlaVehicle>> | null = null;
    if (shouldCallDvla()) {
      try {
        dvla = await fetchDvlaVehicle(registration);
      } catch (err) {
        if (!(err instanceof DvlaApiError) || !isDvsaConfigured()) throw err;
        if (err.status === 401 || err.status === 403) {
          dvlaKeyRejectedAt = Date.now();
          console.warn(
            "DVLA rejected the configured API key. Using DVSA only and retrying DVLA in 1 hour.",
            { status: err.status },
          );
        } else {
          console.warn("DVLA lookup failed, continuing with DVSA only.", {
            code: err.code,
            status: err.status,
          });
        }
      }
    }

    if (dvla) {
      detailsPart = mapDvlaToDetails(dvla);
      make = detailsPart.details.make;
      colour = detailsPart.details.colour ?? null;
      fuelType = detailsPart.details.fuelType ?? null;
      year = detailsPart.details.yearOfManufacture ?? null;
      engineCapacity = detailsPart.details.engineCapacity ?? null;
      firstRegistrationDate =
        detailsPart.details.monthOfFirstRegistration ?? null;
      sources.push("DVLA");
    }

    if (isDvsaConfigured()) {
      const dvsa = await fetchDvsaVehicleByRegistration(registration);
      motTests = mapDvsaMotTests(dvsa.motTests ?? []);
      // UNKNOWN/empty DVSA identity must not wipe a better DVLA value.
      if (dvsa.make && !isMissingVehicleIdentity(dvsa.make)) make = dvsa.make;
      if (dvsa.model && !isMissingVehicleIdentity(dvsa.model)) model = dvsa.model;
      colour = dvsa.primaryColour || colour;
      fuelType = dvsa.fuelType || fuelType;
      if (dvsa.engineSize) {
        engineCapacity =
          typeof dvsa.engineSize === "string"
            ? Number.parseInt(dvsa.engineSize, 10)
            : dvsa.engineSize;
      }
      manufactureDate = dvsa.manufactureDate ?? null;
      dvsaRegistrationDate = dvsa.registrationDate ?? null;
      firstUsedDate = dvsa.firstUsedDate ?? null;
      firstRegistrationDate =
        dvsaRegistrationDate || firstUsedDate || firstRegistrationDate;
      const recallFlag = (dvsa.hasOutstandingRecall ?? "").toLowerCase();
      hasOutstandingRecall = recallFlag === "yes";
      recallDataAvailable = recallFlag === "yes" || recallFlag === "no";
      if (motTests.length === 0) firstMotDueDate = dvsa.motTestDueDate ?? null;
      sources.push("DVSA");
    }

    make = formatVehicleText(make);
    model = formatVehicleText(model);
    colour = formatVehicleText(colour);
    fuelType = formatVehicleText(fuelType);

    // Local exact-registration / fleet knowledge must still produce a report when
    // DVSA only returns UNKNOWN and DVLA/MOT data is absent.
    const localKnowledge = lookupLocalRegistrationKnowledge(registration);
    if (
      !canContinueVehicleLookup({
        hasDvlaDetails: Boolean(detailsPart),
        motTestCount: motTests.length,
        make,
        hasLocalRegistrationKnowledge: Boolean(localKnowledge),
      })
    ) {
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
      dataAvailable: recallDataAvailable,
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
    const motStatus = firstMotDueDate
      ? mapFirstMotStatus(firstMotDueDate)
      : mapMotStatus(
          detailsPart?.motExpiryDate ?? latestPass?.expiryDate,
          detailsPart?.motStatusRaw,
        );

    const yearEvidence = {
      registration,
      dates: [
        detailsPart?.details.monthOfFirstRegistration,
        manufactureDate,
        dvsaRegistrationDate,
        firstUsedDate,
        firstRegistrationDate,
      ],
      corroboratingYears: [
        year,
        yearFromVehicleDate(manufactureDate),
        yearFromVehicleDate(dvsaRegistrationDate),
        yearFromVehicleDate(firstUsedDate),
      ],
    };
    const resolvedYear = resolveVehicleYear(
      [
        year,
        yearFromVehicleDate(manufactureDate),
        yearFromVehicleDate(dvsaRegistrationDate),
        yearFromVehicleDate(firstUsedDate),
      ],
      yearEvidence,
    );
    if (resolvedYear.rawYear != null && resolvedYear.year !== resolvedYear.rawYear) {
      console.warn("Normalised an invalid vehicle year.", {
        registration,
        rawYear: resolvedYear.rawYear,
        year: resolvedYear.year,
      });
    }
    year = resolvedYear.year;
    firstRegistrationDate = rewriteVehicleDateYear(firstRegistrationDate, yearEvidence);
    const monthOfFirstRegistration =
      rewriteVehicleDateYear(detailsPart?.details.monthOfFirstRegistration, yearEvidence)?.match(
        /^\d{4}-\d{2}/,
      )?.[0] ??
      firstRegistrationDate?.match(/^\d{4}-\d{2}/)?.[0] ??
      null;

    const buyerScore = calculateBuyerScore({
      yearOfManufacture: year,
      motTests,
      mileageHistory,
      recalls,
    });

    const externalModel =
      model ||
      (detailsPart?.details.model &&
      !isMissingVehicleIdentity(detailsPart.details.model)
        ? detailsPart.details.model
        : "") ||
      "Vehicle";

    const identity = mergeVehicleIdentity({
      registration,
      make,
      model: externalModel,
      local: localKnowledge,
    });

    // Image uses merged identity so local make/model can drive the generic
    // matcher when no registration-scoped image mapping exists.
    const image = resolveVehicleImageByPriority(registration, {
      registration,
      make: identity.make,
      model: identity.model,
      year,
      firstRegistrationDate,
      fuelType,
      engineCapacity,
      wheelplan: detailsPart?.details.wheelplan,
      bodyType: identity.modelVariant,
    });
    if (image.imageMatchAmbiguous) {
      console.warn("Ambiguous vehicle image match.", {
        registration,
        make: identity.make,
        model: identity.model,
        year,
        reason: image.imageMatchReason,
      });
    }

    const notes = [
      "Vehicle information from official UK data sources where configured.",
      "AutoViewer is independent and not affiliated with DVLA or DVSA.",
    ];
    if (localKnowledge) {
      notes.push(
        `Identity fields enriched from local ${localKnowledge.source} mapping where verified.`,
      );
    }

    const record: VehicleRecord = {
      summary: {
        registration,
        displayRegistration: formatRegistrationDisplay(registration),
        make: identity.make,
        model: identity.model,
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
        imageMatchConfidence: image.imageConfidence,
        imageMatchReason: image.imageMatchReason,
        imageFallbackUsed: image.imageFallbackUsed,
        imageMatchAmbiguous: image.imageMatchAmbiguous,
        modelTitle: identity.modelTitle,
        modelVariant: identity.modelVariant,
        vehicleCategory: localKnowledge?.category ?? "standard",
      },
      details: {
        registration,
        make: identity.make,
        model: identity.model,
        colour,
        fuelType,
        engineCapacity,
        yearOfManufacture: year,
        monthOfFirstRegistration,
        co2Emissions: detailsPart?.details.co2Emissions ?? null,
        euroStatus: detailsPart?.details.euroStatus ?? null,
        transmission: detailsPart?.details.transmission ?? null,
        wheelplan: detailsPart?.details.wheelplan ?? null,
        typeApproval: detailsPart?.details.typeApproval ?? null,
        revenueWeight: detailsPart?.details.revenueWeight ?? null,
        markedForExport: detailsPart?.details.markedForExport,
        dateOfLastV5CIssued:
          detailsPart?.details.dateOfLastV5CIssued ?? null,
        realDrivingEmissions:
          detailsPart?.details.realDrivingEmissions ?? null,
      },
      motTests,
      mileageHistory,
      recalls,
      buyerScore,
      dataQuality: {
        sources,
        notes,
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
