/**
 * Regenerates the homepage sample-report preview from the live free PDF.
 *
 * Usage: npm run pdf:sample-preview
 *
 * Output: public/example-report-preview.webp
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { getMockVehicle } from "@/lib/api/mock";
import { generateVehicleReportPdf } from "@/lib/reports/pdf";

const SAMPLE_REGISTRATION = "AV19SWF";
const OUTPUT_WEBP = path.join(
  process.cwd(),
  "public",
  "example-report-preview.webp",
);
const OUTPUT_PNG = path.join(
  process.cwd(),
  "public",
  "example-report-preview.png",
);
const ICON_DIR = path.join(process.cwd(), "public", "report-icons");
const FONT_PATH = path.join(
  process.cwd(),
  "public",
  "fonts",
  "BarlowCondensed-SemiBold.ttf",
);
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

async function loadAssets() {
  const iconPngs: Partial<Record<(typeof ICON_NAMES)[number], Uint8Array>> = {};
  for (const name of ICON_NAMES) {
    try {
      iconPngs[name] = new Uint8Array(
        await fs.readFile(path.join(ICON_DIR, `${name}.png`)),
      );
    } catch {
      // Optional.
    }
  }
  let plateFontBytes: Uint8Array | null = null;
  try {
    plateFontBytes = new Uint8Array(await fs.readFile(FONT_PATH));
  } catch {
    plateFontBytes = null;
  }
  return { iconPngs, plateFontBytes };
}

async function loadVehicleImagePng(imageSrc?: string | null) {
  if (!imageSrc) return null;
  const filePath = path.join(process.cwd(), "public", imageSrc.replace(/^\//, ""));
  try {
    const sharp = (await import("sharp")).default;
    return new Uint8Array(
      await sharp(filePath).trim({ background: "#ffffff" }).png().toBuffer(),
    );
  } catch {
    return null;
  }
}

async function renderFirstPagePng(pdfBytes: Uint8Array) {
  const tempDir = path.join(process.cwd(), "test-output", "sample-preview");
  await fs.mkdir(tempDir, { recursive: true });
  const pdfPath = path.join(tempDir, "sample-report.pdf");
  await fs.writeFile(pdfPath, pdfBytes);

  const { pdf } = await import("pdf-to-img");
  const document = await pdf(pdfPath, { scale: 3 });
  for await (const image of document) {
    return Buffer.from(image);
  }
  throw new Error("pdf-to-img returned no pages.");
}

async function run() {
  const vehicle = getMockVehicle(SAMPLE_REGISTRATION);
  if (!vehicle) {
    throw new Error(`Missing mock vehicle ${SAMPLE_REGISTRATION}`);
  }

  const { iconPngs, plateFontBytes } = await loadAssets();
  const imagePng = await loadVehicleImagePng(vehicle.summary.imageSrc);
  const pdfBytes = await generateVehicleReportPdf(vehicle, {
    ownersLabel: "2",
    imagePng,
    iconPngs,
    plateFontBytes,
    generatedAt: new Date("2026-09-20T12:00:00Z"),
    baseUrl: "https://autoviewer.co.uk",
  });

  const page1Png = await renderFirstPagePng(pdfBytes);
  const sharp = (await import("sharp")).default;
  // High quality: text-heavy preview softens badly at lower WebP settings.
  const webp = await sharp(page1Png).webp({ quality: 95, effort: 5 }).toBuffer();
  const meta = await sharp(page1Png).metadata();

  await fs.writeFile(OUTPUT_PNG, page1Png);
  await fs.writeFile(OUTPUT_WEBP, webp);

  console.log(`Wrote ${OUTPUT_WEBP} (${meta.width}x${meta.height})`);
  console.log(`Wrote ${OUTPUT_PNG}`);
}

void run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
