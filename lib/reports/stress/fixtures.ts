import { calculateBuyerScore } from "@/lib/vehicle/score";
import {
  formatRegistrationDisplay,
  normalizeRegistration,
} from "@/lib/vehicle/registration";
import type {
  MileagePoint,
  MotDefect,
  MotTest,
  RecallStatus,
  VehicleDetails,
  VehicleRecord,
  VehicleSummary,
} from "@/types/vehicle";

export type PremiumMockStatus = "CLEAR" | "RECORD FOUND" | "NO RECORD";

export interface PremiumKeeperEvent {
  year: string;
  label: string;
}

export interface PremiumMockData {
  finance: { status: "CLEAR" | "RECORD FOUND"; detail: string };
  writeOff: {
    status: "NO RECORD" | "CATEGORY N" | "CATEGORY S";
    detail: string;
    date?: string;
  };
  stolen: { status: PremiumMockStatus; detail: string };
  keepers: { count: number; timeline: PremiumKeeperEvent[] };
  mileageConsistency: { status: "Consistent" | "Needs review"; detail: string };
}

export interface PaidReportFixture {
  id: string;
  label: string;
  vehicle: VehicleRecord;
  premium: PremiumMockData;
}

function mot(
  date: string,
  result: MotTest["testResult"],
  mileage: number,
  defects: MotDefect[] = [],
  number = `9${date.replace(/-/g, "").slice(2)}001`,
): MotTest {
  return {
    completedDate: date,
    expiryDate: `${Number(date.slice(0, 4)) + 1}${date.slice(4)}`,
    testResult: result,
    odometerValue: mileage,
    odometerUnit: "mi",
    motTestNumber: number,
    defects,
  };
}

function mileageFromTests(tests: MotTest[]): MileagePoint[] {
  return tests
    .filter((test) => test.odometerValue != null)
    .map((test) => ({
      date: test.completedDate,
      mileage: test.odometerValue as number,
      source: "MOT" as const,
    }));
}

function record(input: {
  registration: string;
  make: string;
  model: string;
  year?: number | null;
  colour?: string | null;
  fuelType?: string | null;
  transmission?: string | null;
  engineCapacity?: number | null;
  powerBhp?: number | null;
  firstRegistered?: string | null;
  co2?: number | null;
  euro?: string | null;
  wheelplan?: string | null;
  typeApproval?: string | null;
  latestMileage?: number | null;
  imageSrc?: string | null;
  motTests: MotTest[];
  recalls?: RecallStatus;
  notes?: string[];
  extraDetails?: Partial<VehicleDetails>;
}): VehicleRecord {
  const registration = normalizeRegistration(input.registration);
  const motTests = input.motTests;
  const mileageHistory = mileageFromTests(motTests);
  const recalls: RecallStatus = input.recalls ?? {
    dataAvailable: true,
    hasOpenRecalls: false,
    count: 0,
    items: [],
  };
  const buyerScore = calculateBuyerScore({
    yearOfManufacture: input.year,
    motTests,
    mileageHistory,
    recalls,
  });
  const summary: VehicleSummary = {
    registration,
    displayRegistration: formatRegistrationDisplay(registration),
    make: input.make,
    model: input.model,
    year: input.year ?? null,
    fuelType: input.fuelType ?? null,
    colour: input.colour ?? null,
    transmission: input.transmission ?? null,
    engineCapacity: input.engineCapacity ?? null,
    powerBhp: input.powerBhp ?? null,
    latestMileage: input.latestMileage ?? motTests[0]?.odometerValue ?? null,
    tax: { status: "Taxed", dueDate: "2026-08-01" },
    motStatus: {
      status: "Valid",
      expiryDate: motTests[0]?.expiryDate ?? "2026-02-11",
    },
    recalls,
    isDemo: true,
    imageSrc: input.imageSrc ?? null,
  };
  const details: VehicleDetails = {
    registration,
    make: input.make,
    model: input.model,
    colour: input.colour ?? null,
    fuelType: input.fuelType ?? null,
    engineCapacity: input.engineCapacity ?? null,
    yearOfManufacture: input.year ?? null,
    monthOfFirstRegistration: input.firstRegistered ?? null,
    co2Emissions: input.co2 ?? null,
    euroStatus: input.euro ?? null,
    transmission: input.transmission ?? null,
    wheelplan: input.wheelplan ?? null,
    typeApproval: input.typeApproval ?? null,
    ...input.extraDetails,
  };
  return {
    summary,
    details,
    motTests,
    mileageHistory,
    recalls,
    buyerScore,
    dataQuality: {
      sources: ["MOCK"],
      notes: input.notes ?? [
        "Synthetic stress-test data for PDF layout only.",
      ],
    },
  };
}

const cleanPremium = (): PremiumMockData => ({
  finance: { status: "CLEAR", detail: "No outstanding finance recorded." },
  writeOff: { status: "NO RECORD", detail: "No insurance write-off recorded." },
  stolen: { status: "NO RECORD", detail: "No stolen vehicle record found." },
  keepers: {
    count: 2,
    timeline: [
      { year: "2019", label: "First registered" },
      { year: "2022", label: "Keeper change" },
    ],
  },
  mileageConsistency: {
    status: "Consistent",
    detail: "Mileage readings increase in a consistent pattern.",
  },
});

export const freeStressCases: Array<{
  id: string;
  label: string;
  vehicle: VehicleRecord;
}> = [
  {
    id: "normal",
    label: "Normal car",
    vehicle: record({
      registration: "AV19NRM",
      make: "Suzuki",
      model: "Swift 1.2 Dualjet SZ5",
      year: 2019,
      colour: "Yellow",
      fuelType: "Petrol",
      transmission: "Manual",
      engineCapacity: 1242,
      powerBhp: 90,
      firstRegistered: "2019-03",
      co2: 111,
      euro: "EURO 6",
      imageSrc: "/cars/suzuki-swift-a2l-2017-2023.webp",
      motTests: [
        mot("2025-02-12", "PASS", 46980),
        mot("2024-02-14", "PASS", 38420),
        mot("2023-02-16", "PASS", 29760),
      ],
    }),
  },
  {
    id: "long-title",
    label: "Long vehicle name",
    vehicle: record({
      registration: "AV21LNG",
      make: "Mercedes-Benz",
      model:
        "C-Class C220d AMG Line Premium Plus Night Edition Executive",
      year: 2021,
      colour: "Obsidian Black",
      fuelType: "Diesel",
      transmission: "Automatic",
      engineCapacity: 1993,
      powerBhp: 194,
      firstRegistered: "2021-06",
      co2: 127,
      euro: "EURO 6",
      imageSrc: "/cars/mercedes-c-class-w206-2021-2026.webp",
      motTests: [
        mot("2026-05-18", "PASS", 28410),
        mot("2025-05-20", "PASS", 19640),
      ],
    }),
  },
  {
    id: "many-mot",
    label: "Many MOT records",
    vehicle: record({
      registration: "AV12MOT",
      make: "Ford",
      model: "Focus 1.0 EcoBoost Zetec",
      year: 2012,
      colour: "Silver",
      fuelType: "Petrol",
      transmission: "Manual",
      engineCapacity: 998,
      firstRegistered: "2012-04",
      co2: 114,
      euro: "EURO 5",
      imageSrc: "/cars/ford-focus-mk3-2011-2014.webp",
      latestMileage: 118420,
      motTests: [
        mot("2026-03-04", "PASS", 118420),
        mot("2025-03-06", "PASS", 109880),
        mot("2024-03-08", "PASS", 101240),
        mot("2023-03-10", "PASS", 92410),
        mot("2022-03-12", "PASS", 84110),
        mot("2021-03-14", "PASS", 76320),
        mot("2020-03-16", "PASS", 68440),
        mot("2019-03-18", "PASS", 59870),
        mot("2018-03-20", "PASS", 51220),
        mot("2017-03-22", "PASS", 43110),
        mot("2016-03-24", "PASS", 35240),
        mot("2015-03-26", "PASS", 27480),
      ],
    }),
  },
  {
    id: "many-advisories",
    label: "Many advisories",
    vehicle: record({
      registration: "AV16ADV",
      make: "Volkswagen",
      model: "Golf 1.4 TSI SE",
      year: 2016,
      colour: "White",
      fuelType: "Petrol",
      transmission: "Manual",
      engineCapacity: 1395,
      firstRegistered: "2016-08",
      co2: 116,
      euro: "EURO 6",
      imageSrc: "/cars/volkswagen-golf-mk7-5-2017-2020.webp",
      motTests: [
        mot("2026-01-11", "PASS", 81220, [
          {
            type: "ADVISORY",
            text: "Nearside rear tyre close to legal limit and wearing on inner edge",
          },
          {
            type: "ADVISORY",
            text: "Front brake pads wearing thin, replacement recommended soon",
          },
          {
            type: "MINOR",
            text: "Windscreen damaged but not affecting driver's view",
          },
        ]),
        mot("2025-01-13", "PASS", 73410, [
          {
            type: "ADVISORY",
            text: "Offside front coil spring corroded at lower seat",
          },
          {
            type: "ADVISORY",
            text: "Rear exhaust mount slightly deteriorated but still supporting the system",
          },
        ]),
        mot("2024-01-15", "PASS", 65880, [
          {
            type: "ADVISORY",
            text: "Both rear shock absorbers have light seepage of oil",
          },
          {
            type: "ADVISORY",
            text: "Parking brake travel slightly high but still within limits",
          },
          {
            type: "ADVISORY",
            text: "Headlamp aim just within limits, may need adjustment at next service",
          },
        ]),
      ],
    }),
  },
  {
    id: "fail-case",
    label: "MOT fail case",
    vehicle: record({
      registration: "AV18FAL",
      make: "Vauxhall",
      model: "Corsa 1.4 SE",
      year: 2018,
      colour: "Red",
      fuelType: "Petrol",
      transmission: "Manual",
      engineCapacity: 1398,
      firstRegistered: "2018-05",
      co2: 128,
      euro: "EURO 6",
      imageSrc: "/cars/vauxhall-corsa-e-2014-2019.webp",
      motTests: [
        mot("2026-04-02", "PASS", 54110),
        mot("2026-03-28", "FAIL", 54080, [
          {
            type: "MAJOR",
            text: "Nearside front headlamp aim too high",
          },
          {
            type: "DANGEROUS",
            text: "Offside rear brake disc excessively worn",
            dangerous: true,
          },
        ]),
        mot("2025-03-30", "PASS", 46220, [
          { type: "ADVISORY", text: "Front discs worn but not yet below limit" },
        ]),
      ],
    }),
  },
  {
    id: "many-recalls",
    label: "Many recalls and notes",
    vehicle: record({
      registration: "AV20RCL",
      make: "Honda",
      model: "Civic 1.0 VTEC Turbo SE",
      year: 2020,
      colour: "Grey",
      fuelType: "Petrol",
      transmission: "Manual",
      engineCapacity: 988,
      firstRegistered: "2020-02",
      co2: 110,
      euro: "EURO 6",
      imageSrc: "/cars/honda-civic-mk10-2017-2021.webp",
      motTests: [mot("2026-02-09", "PASS", 32110), mot("2025-02-11", "PASS", 24880)],
      recalls: {
        dataAvailable: true,
        hasOpenRecalls: true,
        count: 3,
        items: [
          {
            title: "Fuel pump inspection and possible replacement",
            date: "2025-11-04",
            status: "Open",
          },
          {
            title: "Camera calibration software update",
            date: "2024-06-18",
            status: "Open",
          },
          {
            title: "Passenger airbag wiring inspection",
            date: "2023-09-12",
            status: "Open",
          },
        ],
      },
      notes: [
        "Multiple manufacturer safety actions are shown in this sample.",
        "Confirm recall completion with a franchised dealer before buying.",
      ],
    }),
  },
  {
    id: "missing-data",
    label: "Missing data",
    vehicle: record({
      registration: "AV99MIS",
      make: "Unknown",
      model: "Not available",
      year: null,
      colour: null,
      fuelType: null,
      transmission: null,
      engineCapacity: null,
      firstRegistered: null,
      imageSrc: null,
      motTests: [],
      recalls: {
        dataAvailable: false,
        hasOpenRecalls: false,
        count: 0,
        items: [],
        sourceNote: "Recall data is not available from the connected source.",
      },
      notes: ["Several vehicle fields were not supplied by the data source."],
      extraDetails: {
        make: "Unknown",
        model: "Not available",
      },
    }),
  },
  {
    id: "ev",
    label: "Electric vehicle",
    vehicle: record({
      registration: "AV24ELC",
      make: "Tesla",
      model: "Model 3",
      year: 2024,
      colour: "White",
      fuelType: "Electric",
      transmission: "Automatic",
      engineCapacity: null,
      firstRegistered: "2024-03",
      co2: 0,
      euro: null,
      imageSrc: "/cars/tesla-model-3-highland-2024-2026.webp",
      motTests: [mot("2026-03-12", "PASS", 18420)],
    }),
  },
  {
    id: "van",
    label: "Van",
    vehicle: record({
      registration: "AV22VAN",
      make: "Ford",
      model: "Transit Custom 320 L2 H1 2.0 EcoBlue",
      year: 2022,
      colour: "White",
      fuelType: "Diesel",
      transmission: "Manual",
      engineCapacity: 1995,
      firstRegistered: "2022-07",
      co2: 168,
      euro: "EURO 6",
      wheelplan: "2 AXLE RIGID BODY",
      typeApproval: "N1",
      imageSrc: "/cars/ford-transit-custom-mk2-2023-2026.webp",
      motTests: [
        mot("2026-06-04", "PASS", 41220),
        mot("2025-06-06", "PASS", 29840),
      ],
    }),
  },
  {
    id: "motorcycle",
    label: "Motorcycle",
    vehicle: record({
      registration: "AV23PTW",
      make: "Honda",
      model: "CB125R",
      year: 2023,
      colour: "Black",
      fuelType: "Petrol",
      transmission: "Manual",
      engineCapacity: 125,
      firstRegistered: "2023-04",
      co2: 67,
      euro: "EURO 5",
      wheelplan: "2 WHEEL",
      imageSrc: "/cars/honda-cb125r-2018-generation-2018-2023.webp",
      motTests: [mot("2026-04-08", "PASS", 6120)],
    }),
  },
  {
    id: "high-mileage",
    label: "Very high mileage",
    vehicle: record({
      registration: "AV10HIM",
      make: "Toyota",
      model: "Avensis 2.0 D-4D",
      year: 2010,
      colour: "Blue",
      fuelType: "Diesel",
      transmission: "Manual",
      engineCapacity: 1998,
      firstRegistered: "2010-09",
      latestMileage: 187654,
      imageSrc: "/cars/toyota-avensis-t27-facelift-2015-2018.webp",
      motTests: [
        mot("2026-01-20", "PASS", 187654),
        mot("2025-01-22", "PASS", 176210),
        mot("2024-01-24", "PASS", 164880),
      ],
    }),
  },
  {
    id: "worst-case",
    label: "Extreme combination",
    vehicle: record({
      registration: "AV08WRS",
      make: "Mercedes-Benz",
      model:
        "E-Class E220d AMG Line Night Edition Premium Plus Executive",
      year: 2018,
      colour: "Selenite Grey Metallic",
      fuelType: "Diesel",
      transmission: null,
      engineCapacity: 1950,
      firstRegistered: "2018-11",
      co2: 139,
      euro: "EURO 6",
      latestMileage: 164880,
      imageSrc: "/cars/mercedes-e-class-w213-2016-2023.webp",
      notes: [
        "Synthetic worst-case layout sample with mixed missing and long values.",
      ],
      recalls: {
        dataAvailable: true,
        hasOpenRecalls: true,
        count: 2,
        items: [
          {
            title: "Takata airbag inflator inspection",
            date: "2025-08-14",
            status: "Open",
          },
          {
            title: "Diesel exhaust fluid heater software update",
            date: "2024-02-02",
            status: "Open",
          },
        ],
      },
      motTests: [
        mot("2026-07-01", "PASS", 164880, [
          {
            type: "ADVISORY",
            text: "Nearside rear tyre worn close to legal limit on inner shoulder",
          },
        ]),
        mot("2026-06-20", "FAIL", 164740, [
          {
            type: "DANGEROUS",
            text: "Offside front brake hose excessively deteriorated and leaking",
            dangerous: true,
          },
          {
            type: "MAJOR",
            text: "Registration plate lamp inoperative",
          },
        ]),
        mot("2025-07-03", "PASS", 151220, [
          {
            type: "ADVISORY",
            text: "Front suspension arm bushes starting to perish",
          },
        ]),
        mot("2024-07-05", "PASS", 138410),
        mot("2023-07-07", "PASS", 125880, [
          {
            type: "ADVISORY",
            text: "Rear brake pads wearing thin and discs slightly lipped",
          },
        ]),
        mot("2022-07-09", "PASS", 112440),
        mot("2021-07-11", "PASS", 98610),
        mot("2020-07-13", "PASS", 84120),
        mot("2019-07-15", "PASS", 69880),
        mot("2018-12-02", "PASS", 12410, [
          {
            type: "ADVISORY",
            text: "Undertrays fitted preventing full inspection of some components",
          },
        ]),
        mot("2018-11-20", "FAIL", 12380, [
          {
            type: "MAJOR",
            text: "Windscreen washer provides insufficient fluid to the windscreen",
          },
        ]),
        mot("2018-11-10", "PASS", 12110),
      ],
    }),
  },
];

export const paidMockCases: PaidReportFixture[] = [
  {
    id: "clean",
    label: "Clean vehicle",
    vehicle: freeStressCases[0].vehicle,
    premium: cleanPremium(),
  },
  {
    id: "warning",
    label: "Warning vehicle",
    vehicle: {
      ...freeStressCases[4].vehicle,
      recalls: {
        dataAvailable: true,
        hasOpenRecalls: true,
        count: 1,
        items: [
          {
            title: "Passenger airbag wiring inspection",
            date: "2024-08-14",
            status: "Open",
          },
        ],
      },
    },
    premium: {
      finance: { status: "CLEAR", detail: "No outstanding finance recorded." },
      writeOff: {
        status: "CATEGORY N",
        detail: "Insurance write-off recorded as Category N.",
        date: "2021-09-14",
      },
      stolen: { status: "NO RECORD", detail: "No stolen vehicle record found." },
      keepers: {
        count: 5,
        timeline: [
          { year: "2018", label: "First registered" },
          { year: "2019", label: "Keeper change" },
          { year: "2021", label: "Keeper change" },
          { year: "2023", label: "Keeper change" },
          { year: "2025", label: "Keeper change" },
        ],
      },
      mileageConsistency: {
        status: "Needs review",
        detail: "Recent MOT fail and mileage pattern should be checked.",
      },
    },
  },
  {
    id: "complex",
    label: "Complex vehicle",
    vehicle: freeStressCases[11].vehicle,
    premium: {
      finance: {
        status: "RECORD FOUND",
        detail: "An outstanding finance agreement is recorded.",
      },
      writeOff: {
        status: "CATEGORY N",
        detail: "A previous insurance write-off is recorded.",
        date: "2020-03-09",
      },
      stolen: { status: "NO RECORD", detail: "No stolen vehicle record found." },
      keepers: {
        count: 7,
        timeline: [
          { year: "2018", label: "First registered" },
          { year: "2019", label: "Keeper change" },
          { year: "2020", label: "Keeper change" },
          { year: "2021", label: "Keeper change" },
          { year: "2022", label: "Keeper change" },
          { year: "2024", label: "Keeper change" },
          { year: "2026", label: "Current keeper" },
        ],
      },
      mileageConsistency: {
        status: "Needs review",
        detail: "High mileage with a failed MOT should be reviewed in full.",
      },
    },
  },
];
