import type { VehicleRecord } from "@/types/vehicle";
import { formatRegistrationDisplay, normalizeRegistration } from "@/lib/vehicle/registration";
import { resolveImageFieldsForVehicle } from "@/lib/vehicle/images";
import { calculateBuyerScore } from "@/lib/vehicle/score";

function withResolvedImage(
  record: VehicleRecord,
): VehicleRecord {
  const image = resolveImageFieldsForVehicle({
    make: record.summary.make,
    model: record.summary.model,
    year: record.summary.year,
  });
  return {
    ...record,
    summary: {
      ...record.summary,
      imageSrc: image.imageSrc,
      imageIsRepresentative: image.imageIsRepresentative,
    },
  };
}

function buildGolf(): VehicleRecord {
  const registration = "AB12CDE";
  const motTests = [
    {
      completedDate: "2025-02-12",
      expiryDate: "2026-02-11",
      testResult: "PASS" as const,
      odometerValue: 65732,
      odometerUnit: "mi" as const,
      motTestNumber: "123456789012",
      defects: [
        {
          type: "ADVISORY" as const,
          text: "Nearside rear tyre worn close to legal limit",
        },
      ],
    },
    {
      completedDate: "2024-02-14",
      expiryDate: "2025-02-13",
      testResult: "PASS" as const,
      odometerValue: 54013,
      odometerUnit: "mi" as const,
      motTestNumber: "123456789013",
      defects: [],
    },
    {
      completedDate: "2023-02-16",
      expiryDate: "2024-02-15",
      testResult: "PASS" as const,
      odometerValue: 43290,
      odometerUnit: "mi" as const,
      motTestNumber: "123456789014",
      defects: [
        {
          type: "ADVISORY" as const,
          text: "Front brake disc worn, pitted or scored, but not seriously weakened",
        },
      ],
    },
  ];

  const mileageHistory = motTests
    .filter((t) => t.odometerValue != null)
    .map((t) => ({
      date: t.completedDate,
      mileage: t.odometerValue as number,
      source: "MOT" as const,
    }));

  const recalls = {
    hasOpenRecalls: true,
    count: 1,
    items: [
      {
        title: "Takata airbag inflator inspection",
        description:
          "Manufacturer safety recall - check with a franchised dealer for status.",
        date: "2024-06-01",
        status: "Open",
      },
    ],
    sourceNote: "Demo recall data for illustration only.",
  };

  const buyerScore = calculateBuyerScore({
    yearOfManufacture: 2019,
    motTests,
    mileageHistory,
    recalls,
  });

  return {
    summary: {
      registration,
      displayRegistration: formatRegistrationDisplay(registration),
      make: "Volkswagen",
      model: "Golf 1.5 TSI EVO Match",
      year: 2019,
      fuelType: "Petrol",
      colour: "White",
      transmission: "Manual",
      engineCapacity: 1498,
      powerBhp: 150,
      combinedMpg: 47.9,
      annualRoadTaxGbp: 195,
      latestMileage: 67420,
      tax: { status: "Taxed", dueDate: "2026-08-01" },
      motStatus: { status: "Valid", expiryDate: "2026-02-11" },
      recalls,
      isDemo: true,
    },
    details: {
      registration,
      make: "Volkswagen",
      model: "Golf 1.5 TSI EVO Match",
      colour: "White",
      fuelType: "Petrol",
      engineCapacity: 1498,
      yearOfManufacture: 2019,
      monthOfFirstRegistration: "2019-03",
      co2Emissions: 113,
      euroStatus: "EURO 6",
      transmission: "Manual",
    },
    motTests,
    mileageHistory,
    recalls,
    buyerScore,
    dataQuality: {
      sources: ["MOCK"],
      notes: [
        "This is demo / sample data for local development and design preview.",
        "It is not live government vehicle information.",
      ],
    },
  };
}

function buildFocus(): VehicleRecord {
  const registration = "CD34EFG";
  const motTests = [
    {
      completedDate: "2025-01-20",
      expiryDate: "2026-01-19",
      testResult: "PASS" as const,
      odometerValue: 81200,
      odometerUnit: "mi" as const,
      defects: [
        { type: "ADVISORY" as const, text: "Offside front tyre close to limit" },
        { type: "ADVISORY" as const, text: "Rear exhaust mount corroded" },
      ],
    },
    {
      completedDate: "2024-01-18",
      expiryDate: "2025-01-17",
      testResult: "FAIL" as const,
      odometerValue: 72410,
      odometerUnit: "mi" as const,
      defects: [
        {
          type: "MAJOR" as const,
          text: "Nearside headlamp aim too high",
        },
      ],
    },
    {
      completedDate: "2024-01-18",
      expiryDate: "2025-01-17",
      testResult: "PASS" as const,
      odometerValue: 72410,
      odometerUnit: "mi" as const,
      defects: [],
    },
  ];

  const mileageHistory = [
    { date: "2025-01-20", mileage: 81200, source: "MOT" as const },
    { date: "2024-01-18", mileage: 72410, source: "MOT" as const },
    { date: "2023-01-12", mileage: 63110, source: "MOT" as const },
  ];

  const recalls = {
    hasOpenRecalls: false,
    count: 0,
    items: [],
  };

  const buyerScore = calculateBuyerScore({
    yearOfManufacture: 2018,
    motTests,
    mileageHistory,
    recalls,
  });

  return {
    summary: {
      registration,
      displayRegistration: formatRegistrationDisplay(registration),
      make: "Ford",
      model: "Focus 1.0 EcoBoost Titanium",
      year: 2018,
      fuelType: "Petrol",
      colour: "Blue",
      transmission: "Manual",
      engineCapacity: 999,
      powerBhp: 125,
      combinedMpg: 51.4,
      annualRoadTaxGbp: 180,
      latestMileage: 81200,
      tax: { status: "Taxed", dueDate: "2026-05-12" },
      motStatus: { status: "Valid", expiryDate: "2026-01-19" },
      recalls,
      isDemo: true,
    },
    details: {
      registration,
      make: "Ford",
      model: "Focus 1.0 EcoBoost Titanium",
      colour: "Blue",
      fuelType: "Petrol",
      engineCapacity: 999,
      yearOfManufacture: 2018,
      monthOfFirstRegistration: "2018-06",
      co2Emissions: 108,
      euroStatus: "EURO 6",
      transmission: "Manual",
    },
    motTests,
    mileageHistory,
    recalls,
    buyerScore,
    dataQuality: {
      sources: ["MOCK"],
      notes: [
        "This is demo / sample data for local development and design preview.",
        "It is not live government vehicle information.",
      ],
    },
  };
}

const MOCK_VEHICLES: Record<string, () => VehicleRecord> = {
  AB12CDE: buildGolf,
  CD34EFG: buildFocus,
};

export function getMockVehicle(registration: string): VehicleRecord | null {
  const key = normalizeRegistration(registration);
  const factory = MOCK_VEHICLES[key];
  return factory ? withResolvedImage(factory()) : null;
}

export function listMockRegistrations(): string[] {
  return Object.keys(MOCK_VEHICLES);
}
