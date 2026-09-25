/**
 * One-off: generate a single Full Vehicle Report PDF for AV14 FUL demo stress data.
 * PDF only. No PNG.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { PDFDocument } from "pdf-lib";
import { generateFullReportPdf } from "@/lib/reports/full-pdf";
import type { PremiumMockData } from "@/lib/reports/stress/fixtures";
import { calculateBuyerScore } from "@/lib/vehicle/score";
import {
  formatRegistrationDisplay,
  normalizeRegistration,
} from "@/lib/vehicle/registration";
import type { MotTest, VehicleRecord } from "@/types/vehicle";

const OUTPUT_DIR = path.join(process.cwd(), "test-output");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "AV14FUL-Full-Vehicle-Report.pdf");
const ICON_DIR = path.join(process.cwd(), "public", "report-icons");
const FONT_PATH = path.join(
  process.cwd(),
  "public",
  "fonts",
  "BarlowCondensed-SemiBold.ttf",
);
const IMAGE_SRC = "/cars/bmw-5-series-f10-facelift-2013-2017.webp";

const ICON_NAMES = [
  "check",
  "warning",
  "lock",
  "lock-white",
  "calendar",
  "mileage",
  "engine",
  "co2",
  "leaf",
  "fuel",
  "car",
  "shield-check",
  "clipboard",
  "document",
  "user",
  "wrench",
  "pound",
  "history",
  "info",
] as const;

function mot(
  date: string,
  result: MotTest["testResult"],
  mileage: number,
  defects: MotTest["defects"] = [],
): MotTest {
  return {
    completedDate: date,
    expiryDate: `${Number(date.slice(0, 4)) + 1}${date.slice(4)}`,
    testResult: result,
    odometerValue: mileage,
    odometerUnit: "mi",
    motTestNumber: `9${date.replace(/-/g, "").slice(2)}001`,
    defects,
  };
}

function buildVehicle(): VehicleRecord {
  const registration = normalizeRegistration("AV14 FUL");
  const motTests: MotTest[] = [
    mot("2026-05-22", "PASS", 125810, [
      { type: "ADVISORY", text: "Nearside front tyre worn close to legal limit" },
      {
        type: "ADVISORY",
        text: "Offside rear brake disc worn, pitted or scored",
      },
      { type: "ADVISORY", text: "Slight oil leak, but not excessive" },
    ]),
    mot("2025-05-22", "PASS", 126944, [
      {
        type: "ADVISORY",
        text: "Nearside rear suspension arm pin or bush worn but not resulting in excessive movement",
      },
      {
        type: "ADVISORY",
        text: "Front brake discs worn but not seriously weakened",
      },
    ]),
    mot("2024-05-21", "PASS", 119602),
    mot("2023-05-22", "PASS", 108420, [
      { type: "ADVISORY", text: "Offside front tyre slightly damaged/cracking" },
      {
        type: "ADVISORY",
        text: "Nearside rear tyre worn close to legal limit",
      },
    ]),
    mot("2022-05-23", "PASS", 96842, [
      {
        type: "ADVISORY",
        text: "Brake pipe corroded, covered in grease or other material",
      },
      {
        type: "ADVISORY",
        text: "Slight play in nearside front suspension ball joint",
      },
    ]),
    mot("2021-05-24", "PASS", 82114),
    mot("2020-05-18", "PASS", 68941, [
      { type: "ADVISORY", text: "Rear brake pads wearing thin" },
      {
        type: "ADVISORY",
        text: "Underbody covers fitted restricting inspection",
      },
    ]),
    mot("2019-05-20", "PASS", 59773),
    mot("2018-05-22", "PASS", 46224, [
      { type: "ADVISORY", text: "Front brake pads wearing thin" },
    ]),
    mot("2018-05-21", "FAIL", 46201, [
      { type: "MAJOR", text: "Offside front headlamp aim too low" },
      {
        type: "MAJOR",
        text: "Nearside rear tyre below legal tread depth",
      },
      { type: "ADVISORY", text: "Front brake pads wearing thin" },
    ]),
    mot("2017-05-19", "PASS", 31884),
  ];

  const mileageHistory = [
    { date: "2014-06-18", mileage: 12, source: "OTHER" as const },
    { date: "2017-05-19", mileage: 31884, source: "MOT" as const },
    { date: "2018-05-21", mileage: 46201, source: "MOT" as const },
    { date: "2018-05-22", mileage: 46224, source: "MOT" as const },
    { date: "2019-05-20", mileage: 59773, source: "MOT" as const },
    { date: "2020-05-18", mileage: 68941, source: "MOT" as const },
    { date: "2021-05-24", mileage: 82114, source: "MOT" as const },
    { date: "2022-05-23", mileage: 96842, source: "MOT" as const },
    { date: "2023-05-22", mileage: 108420, source: "MOT" as const },
    { date: "2024-05-21", mileage: 119602, source: "MOT" as const },
    { date: "2025-05-22", mileage: 126944, source: "MOT" as const },
    { date: "2026-05-22", mileage: 125810, source: "MOT" as const },
    { date: "2026-09-24", mileage: 128764, source: "OTHER" as const },
  ];

  const recalls = {
    dataAvailable: true,
    hasOpenRecalls: true,
    count: 2,
    items: [
      {
        title: "EGR cooler inspection",
        description:
          "The EGR cooler may develop an internal leak. Inspection and replacement may be required.",
        date: "2024-03-14",
        status: "OPEN",
      },
      {
        title: "Driver airbag inspection",
        description:
          "Driver airbag components require inspection and possible replacement.",
        date: "2025-10-02",
        status: "OPEN",
      },
      {
        title: "Battery cable inspection",
        description: "Completed 04 September 2018.",
        date: "2018-07-11",
        status: "COMPLETED",
      },
    ],
  };

  const buyerScore = calculateBuyerScore({
    yearOfManufacture: 2014,
    motTests,
    mileageHistory,
    recalls,
  });

  return {
    summary: {
      registration,
      displayRegistration: formatRegistrationDisplay(registration),
      make: "BMW",
      model: "5 Series 520d M Sport",
      year: 2014,
      fuelType: "Diesel",
      colour: "Black",
      transmission: "Automatic",
      engineCapacity: 1995,
      powerBhp: 184,
      latestMileage: 128764,
      tax: { status: "Taxed", dueDate: "2027-02-01" },
      motStatus: { status: "Valid", expiryDate: "2027-05-22" },
      recalls,
      isDemo: true,
      imageSrc: IMAGE_SRC,
    },
    details: {
      registration,
      make: "BMW",
      model: "5 Series 520d M Sport",
      colour: "Black",
      fuelType: "Diesel",
      engineCapacity: 1995,
      yearOfManufacture: 2014,
      monthOfFirstRegistration: "2014-06-18",
      co2Emissions: 129,
      euroStatus: "EURO 5",
      transmission: "Automatic",
      wheelplan: "2 Axle Rigid Body",
      typeApproval: "Saloon",
    },
    motTests,
    mileageHistory,
    recalls,
    buyerScore,
    dataQuality: {
      sources: ["MOCK"],
      notes: ["DEMO / STRESS TEST DATA only."],
    },
  };
}

function buildPremium(): PremiumMockData {
  return {
    finance: {
      status: "RECORD FOUND",
      detail:
        "BMW Financial Services Hire Purchase settled (21 Jun 2014, DEMO-BMW-2014-001). Black Horse Finance PCP outstanding (14 Aug 2018, DEMO-BHF-2018-882). Outstanding finance should be cleared before purchase.",
    },
    writeOff: {
      status: "CATEGORY N",
      detail:
        "Category N non-structural damage, front nearside. Insurer status: repaired and returned to road. Ask for repair invoices and evidence of repair quality.",
      date: "2021-11-17",
    },
    stolen: {
      status: "NO RECORD",
      detail: "No stolen record found in available data.",
    },
    keepers: {
      count: 7,
      timeline: [
        { year: "2014", label: "Keeper 1: 18 Jun 2014 - 02 Sep 2016" },
        { year: "2016", label: "Keeper 2: 02 Sep 2016 - 11 Mar 2018" },
        { year: "2018", label: "Keeper 3: 11 Mar 2018 - 14 Aug 2018" },
        { year: "2018", label: "Keeper 4: 14 Aug 2018 - 09 Jan 2021" },
        { year: "2021", label: "Keeper 5: 09 Jan 2021 - 04 Dec 2021" },
        { year: "2021", label: "Keeper 6: 04 Dec 2021 - 27 Jul 2024" },
        { year: "2024", label: "Keeper 7: 27 Jul 2024 - Present" },
      ],
    },
    mileageConsistency: {
      status: "Needs review",
      detail:
        "The 2026 MOT mileage is 1,134 miles lower than the 2025 recorded mileage. This may be a recording error or may require further investigation.",
    },
  };
}

async function loadAssets() {
  const iconPngs: Partial<Record<(typeof ICON_NAMES)[number], Uint8Array>> = {};
  for (const name of ICON_NAMES) {
    try {
      iconPngs[name] = new Uint8Array(
        await fs.readFile(path.join(ICON_DIR, `${name}.png`)),
      );
    } catch {
      // optional
    }
  }
  let plateFontBytes: Uint8Array | null = null;
  try {
    plateFontBytes = new Uint8Array(await fs.readFile(FONT_PATH));
  } catch {
    plateFontBytes = null;
  }
  let imagePng: Uint8Array | null = null;
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      IMAGE_SRC.replace(/^\//, ""),
    );
    const sharp = (await import("sharp")).default;
    imagePng = new Uint8Array(
      await sharp(filePath).trim({ background: "#ffffff" }).png().toBuffer(),
    );
  } catch {
    imagePng = null;
  }
  return { iconPngs, plateFontBytes, imagePng };
}

async function main() {
  const vehicle = buildVehicle();
  const premium = buildPremium();
  const assets = await loadAssets();

  const bytes = await generateFullReportPdf(vehicle, {
    premium,
    iconPngs: assets.iconPngs,
    plateFontBytes: assets.plateFontBytes,
    imagePng: assets.imagePng,
    generatedAt: new Date("2026-09-24T12:00:00Z"),
    baseUrl: "https://autoviewer.co.uk",
  });

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(OUTPUT_FILE, bytes);

  const doc = await PDFDocument.load(bytes);
  console.log(
    JSON.stringify(
      {
        filePath: OUTPUT_FILE,
        pages: doc.getPageCount(),
        motTests: vehicle.motTests.length,
        mileagePoints: vehicle.mileageHistory.length,
        advisories: vehicle.motTests.reduce((n, t) => n + t.defects.length, 0),
        keepers: premium.keepers.timeline.length,
        recalls: vehicle.recalls.items.length,
        truncation: "none (Full Report includes all rows; free report still truncates)",
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
