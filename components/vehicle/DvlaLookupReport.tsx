"use client";

import { Container } from "@/components/ui/Container";
import { useDvlaLookup } from "@/components/vehicle/DvlaLookupContext";
import { VehicleFullReport } from "@/components/vehicle/VehicleFullReport";
import type { DvlaVehicleResponse } from "@/lib/api/dvla";
import { formatRegistrationDisplay } from "@/lib/vehicle/registration";
import type {
  TaxStatus,
  VehicleRecord,
  VehicleSummary,
} from "@/types/vehicle";

function mapTaxStatus(data: DvlaVehicleResponse): TaxStatus {
  const raw = data.taxStatus?.toLowerCase() ?? "";
  const status = raw.includes("sorn")
    ? "SORN"
    : raw.includes("untaxed") || raw.includes("not taxed")
      ? "Untaxed"
      : raw.includes("taxed")
        ? "Taxed"
        : "Unknown";

  return {
    status,
    dueDate: data.taxDueDate ?? null,
    markedForExport: data.markedForExport,
  };
}

function mapMotStatus(
  data: DvlaVehicleResponse,
): VehicleSummary["motStatus"] {
  const raw = data.motStatus?.toLowerCase() ?? "";
  const status =
    raw.includes("not valid") || raw.includes("expired")
      ? "Expired"
      : raw.includes("valid")
        ? "Valid"
        : raw.includes("no details")
          ? "No MOT"
          : "Unknown";

  return { status, expiryDate: data.motExpiryDate ?? null };
}

function toVehicleRecord(data: DvlaVehicleResponse): VehicleRecord {
  const registration = data.registrationNumber;
  const recalls = {
    dataAvailable: false,
    hasOpenRecalls: false,
    count: 0,
    items: [],
    sourceNote: "Recall data is not provided by DVLA Vehicle Enquiry.",
  };

  return {
    summary: {
      registration,
      displayRegistration: formatRegistrationDisplay(registration),
      make: data.make ?? "Not available",
      model: "",
      year: data.yearOfManufacture ?? null,
      fuelType: data.fuelType ?? null,
      colour: data.colour ?? null,
      transmission: null,
      engineCapacity: data.engineCapacity ?? null,
      powerBhp: null,
      combinedMpg: null,
      annualRoadTaxGbp: null,
      latestMileage: null,
      tax: mapTaxStatus(data),
      motStatus: mapMotStatus(data),
      recalls,
      isDemo: false,
      imageSrc: null,
      imageIsRepresentative: false,
    },
    details: {
      registration,
      make: data.make ?? "Not available",
      model: "",
      colour: data.colour ?? null,
      fuelType: data.fuelType ?? null,
      engineCapacity: data.engineCapacity ?? null,
      yearOfManufacture: data.yearOfManufacture ?? null,
      monthOfFirstRegistration: data.monthOfFirstRegistration ?? null,
      co2Emissions: data.co2Emissions ?? null,
      euroStatus: data.euroStatus ?? null,
      transmission: null,
      wheelplan: data.wheelplan ?? null,
      typeApproval: data.typeApproval ?? null,
      revenueWeight: data.revenueWeight ?? null,
      markedForExport: data.markedForExport,
      dateOfLastV5CIssued: data.dateOfLastV5CIssued ?? null,
      realDrivingEmissions: data.realDrivingEmissions ?? null,
    },
    motTests: [],
    mileageHistory: [],
    recalls,
    buyerScore: null,
    dataQuality: {
      sources: ["DVLA"],
      notes: [
        "DVLA Vehicle Enquiry does not provide model, transmission, mileage history or recall history.",
        "Unavailable fields are not inferred.",
      ],
    },
  };
}

export function DvlaLookupReport() {
  const lookup = useDvlaLookup();
  if (!lookup?.vehicle) return null;

  const vehicle = toVehicleRecord(lookup.vehicle);

  return (
    <section className="border-b border-border bg-surface-soft py-5 md:py-7">
      <Container>
        <h2 className="heading-section mb-4 md:mb-5">
          Vehicle report for {vehicle.summary.displayRegistration}
        </h2>

        <VehicleFullReport
          vehicle={vehicle}
          ownersLabel="-"
          showExtendedDetails
          showUnavailableStats
        />
      </Container>
    </section>
  );
}
