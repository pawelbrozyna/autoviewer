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
    firstRegistrationDate: record.details.monthOfFirstRegistration,
    fuelType: record.summary.fuelType,
    engineCapacity: record.summary.engineCapacity,
    wheelplan: record.details.wheelplan,
  });
  return {
    ...record,
    summary: {
      ...record.summary,
      imageSrc: image.imageSrc,
      imageIsRepresentative: image.imageIsRepresentative,
      imageMatchConfidence: image.imageConfidence,
      imageMatchReason: image.imageMatchReason,
      imageFallbackUsed: image.imageFallbackUsed,
      imageMatchAmbiguous: image.imageMatchAmbiguous,
    },
  };
}

function buildSwift(): VehicleRecord {
  const registration = "AV19SWF";
  const motTests = [
    {
      completedDate: "2025-02-12",
      expiryDate: "2026-02-11",
      testResult: "PASS" as const,
      odometerValue: 46980,
      odometerUnit: "mi" as const,
      motTestNumber: "123456789012",
      defects: [],
    },
    {
      completedDate: "2024-02-14",
      expiryDate: "2025-02-13",
      testResult: "PASS" as const,
      odometerValue: 38420,
      odometerUnit: "mi" as const,
      motTestNumber: "123456789013",
      defects: [],
    },
    {
      completedDate: "2023-02-16",
      expiryDate: "2024-02-15",
      testResult: "PASS" as const,
      odometerValue: 29760,
      odometerUnit: "mi" as const,
      motTestNumber: "123456789014",
      defects: [],
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
        title: "Software update for camera calibration",
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
      make: "Suzuki",
      model: "Swift 1.2 Dualjet SZ5",
      year: 2019,
      fuelType: "Petrol",
      colour: "Yellow",
      transmission: "Manual",
      engineCapacity: 1242,
      powerBhp: 90,
      combinedMpg: 56.5,
      annualRoadTaxGbp: 195,
      latestMileage: 48320,
      tax: { status: "Taxed", dueDate: "2026-08-01" },
      motStatus: { status: "Valid", expiryDate: "2026-02-11" },
      recalls,
      isDemo: true,
    },
    details: {
      registration,
      make: "Suzuki",
      model: "Swift 1.2 Dualjet SZ5",
      colour: "Yellow",
      fuelType: "Petrol",
      engineCapacity: 1242,
      yearOfManufacture: 2019,
      monthOfFirstRegistration: "2019-03",
      co2Emissions: 111,
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

function buildGlc(): VehicleRecord {
  const registration = "AV23GLC";
  const motTests = [
    {
      completedDate: "2026-09-06",
      expiryDate: "2027-09-05",
      testResult: "PASS" as const,
      odometerValue: 40780,
      odometerUnit: "mi" as const,
      motTestNumber: "423456789012",
      defects: [
        {
          type: "ADVISORY" as const,
          text: "Front brake pads wearing thin",
        },
      ],
    },
    {
      completedDate: "2025-09-08",
      expiryDate: "2026-09-07",
      testResult: "PASS" as const,
      odometerValue: 29360,
      odometerUnit: "mi" as const,
      motTestNumber: "423456789013",
      defects: [
        {
          type: "ADVISORY" as const,
          text: "Front brake pads slightly worn",
        },
      ],
    },
  ];

  const mileageHistory = [
    { date: "2026-09-06", mileage: 40780, source: "MOT" as const },
    { date: "2025-09-08", mileage: 29360, source: "MOT" as const },
    { date: "2024-09-10", mileage: 18200, source: "OTHER" as const },
  ];

  const recalls = {
    hasOpenRecalls: false,
    count: 0,
    items: [],
    sourceNote: "Demo recall data for illustration only.",
  };

  const buyerScore = calculateBuyerScore({
    yearOfManufacture: 2022,
    motTests,
    mileageHistory,
    recalls,
  });

  return {
    summary: {
      registration,
      displayRegistration: formatRegistrationDisplay(registration),
      make: "Mercedes-Benz",
      model: "GLC 220 d AMG Line",
      year: 2022,
      fuelType: "Diesel",
      colour: "Silver",
      transmission: "Automatic",
      engineCapacity: 1993,
      powerBhp: 197,
      combinedMpg: 47.9,
      annualRoadTaxGbp: 620,
      latestMileage: 42150,
      tax: { status: "Taxed", dueDate: "2027-03-01" },
      motStatus: { status: "Valid", expiryDate: "2027-09-05" },
      recalls,
      isDemo: true,
    },
    details: {
      registration,
      make: "Mercedes-Benz",
      model: "GLC 220 d AMG Line",
      colour: "Silver",
      fuelType: "Diesel",
      engineCapacity: 1993,
      yearOfManufacture: 2022,
      monthOfFirstRegistration: "2022-09",
      co2Emissions: 154,
      euroStatus: "EURO 6",
      transmission: "Automatic",
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

function buildQ5(): VehicleRecord {
  const registration = "AV20Q5X";
  const motTests = [
    {
      completedDate: "2026-08-20",
      expiryDate: "2027-08-19",
      testResult: "PASS" as const,
      odometerValue: 55240,
      odometerUnit: "mi" as const,
      motTestNumber: "523456789012",
      defects: [],
    },
    {
      completedDate: "2026-08-15",
      expiryDate: null,
      testResult: "FAIL" as const,
      odometerValue: 55210,
      odometerUnit: "mi" as const,
      motTestNumber: "523456789013",
      defects: [
        {
          type: "MAJOR" as const,
          text: "Offside front brake disc significantly worn",
        },
      ],
    },
    {
      completedDate: "2025-08-12",
      expiryDate: "2026-08-11",
      testResult: "PASS" as const,
      odometerValue: 44980,
      odometerUnit: "mi" as const,
      motTestNumber: "523456789014",
      defects: [
        {
          type: "ADVISORY" as const,
          text: "Nearside front tyre worn close to the legal limit",
        },
      ],
    },
    {
      completedDate: "2024-08-10",
      expiryDate: "2025-08-09",
      testResult: "PASS" as const,
      odometerValue: 34120,
      odometerUnit: "mi" as const,
      motTestNumber: "523456789015",
      defects: [
        {
          type: "ADVISORY" as const,
          text: "Nearside front tyre slightly worn on the inner edge",
        },
      ],
    },
    {
      completedDate: "2023-08-08",
      expiryDate: "2024-08-07",
      testResult: "PASS" as const,
      odometerValue: 24560,
      odometerUnit: "mi" as const,
      motTestNumber: "523456789016",
      defects: [],
    },
  ];

  const mileageHistory = motTests.map((test) => ({
    date: test.completedDate,
    mileage: test.odometerValue,
    source: "MOT" as const,
  }));

  const recalls = {
    hasOpenRecalls: false,
    count: 0,
    items: [],
    sourceNote: "Demo recall data for illustration only.",
  };

  const buyerScore = calculateBuyerScore({
    yearOfManufacture: 2020,
    motTests,
    mileageHistory,
    recalls,
  });

  return {
    summary: {
      registration,
      displayRegistration: formatRegistrationDisplay(registration),
      make: "Audi",
      model: "Q5 40 TDI S line quattro",
      year: 2020,
      fuelType: "Diesel",
      colour: "White",
      transmission: "Automatic",
      engineCapacity: 1968,
      powerBhp: 190,
      combinedMpg: 44.8,
      annualRoadTaxGbp: 195,
      latestMileage: 56780,
      tax: { status: "Taxed", dueDate: "2027-02-01" },
      motStatus: { status: "Valid", expiryDate: "2027-08-19" },
      recalls,
      isDemo: true,
    },
    details: {
      registration,
      make: "Audi",
      model: "Q5 40 TDI S line quattro",
      colour: "White",
      fuelType: "Diesel",
      engineCapacity: 1968,
      yearOfManufacture: 2020,
      monthOfFirstRegistration: "2020-08",
      co2Emissions: 164,
      euroStatus: "EURO 6",
      transmission: "Automatic",
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
  AV19SWF: buildSwift,
  AV23GLC: buildGlc,
  AV20Q5X: buildQ5,
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
