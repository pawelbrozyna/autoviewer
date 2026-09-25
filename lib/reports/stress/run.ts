import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import {
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFName,
  PDFString,
} from "pdf-lib";
import { generateVehicleReportPdf } from "@/lib/reports/pdf";
import { generateFullReportPdf } from "@/lib/reports/full-pdf";
import { FREE_PDF_PAGE_LIMIT } from "@/lib/reports/pdf-limits";
import { freeStressCases, paidMockCases } from "@/lib/reports/stress/fixtures";

const execFileAsync = promisify(execFile);
const OUTPUT_ROOT = path.join(process.cwd(), "test-output", "pdf-stress");
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

type ResultRow = {
  group: "FREE" | "FULL";
  id: string;
  ok: boolean;
  pages: number;
  expected: string;
  detail: string;
};

async function loadAssets() {
  const iconPngs: Partial<Record<(typeof ICON_NAMES)[number], Uint8Array>> = {};
  for (const name of ICON_NAMES) {
    try {
      iconPngs[name] = new Uint8Array(
        await fs.readFile(path.join(ICON_DIR, `${name}.png`)),
      );
    } catch {
      // Icons are optional for the generator.
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

async function loadImagePng(imageSrc?: string | null) {
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

function pageHasLinks(document: PDFDocument, pageIndex: number) {
  const page = document.getPages()[pageIndex];
  const annots = page.node.lookupMaybe(PDFName.of("Annots"), PDFArray);
  return Boolean(annots && annots.size() > 0);
}

function firstLinkUri(document: PDFDocument) {
  const page = document.getPages()[0];
  const annots = page.node.lookup(PDFName.of("Annots"), PDFArray);
  const first = document.context.lookup(annots.get(0), PDFDict);
  const action = first.lookup(PDFName.of("A"), PDFDict);
  return action.lookup(PDFName.of("URI"), PDFString).decodeText();
}

function compactText(value: string) {
  return value.replace(/\s+/g, "").toUpperCase();
}

async function renderPdfPages(pdfPath: string, folder: string) {
  try {
    const { pdf } = await import("pdf-to-img");
    const document = await pdf(pdfPath, { scale: 2 });
    let index = 1;
    for await (const image of document) {
      await fs.writeFile(path.join(folder, `page-${index}.png`), image);
      index += 1;
    }
    if (index > 1) return;
  } catch {
    // Fall through to the CLI renderer.
  }
  await execFileAsync(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["--yes", "pdf-to-img", pdfPath, "--scale", "2"],
    { windowsHide: true, shell: process.platform === "win32", cwd: folder },
  );
  const files = (await fs.readdir(folder))
    .filter((file) => file.endsWith(".png") && !file.startsWith("page-"))
    .sort();
  await Promise.all(
    files.map((file, index) =>
      fs.rename(path.join(folder, file), path.join(folder, `page-${index + 1}.png`)),
    ),
  );
}

async function writePdfAndImages(folder: string, bytes: Uint8Array) {
  await fs.mkdir(folder, { recursive: true });
  const pdfPath = path.join(folder, "report.pdf");
  await fs.writeFile(pdfPath, bytes);
  try {
    await renderPdfPages(pdfPath, folder);
  } catch (error) {
    await fs.writeFile(
      path.join(folder, "render-warning.txt"),
      `PNG render skipped or failed: ${error instanceof Error ? error.message : String(error)}\n`,
    );
  }
}

async function assertFreePdf(bytes: Uint8Array, registration: string) {
  const document = await PDFDocument.load(bytes);
  assert.equal(document.getPageCount(), FREE_PDF_PAGE_LIMIT);
  assert.ok(pageHasLinks(document, 0), "Page 1 should contain upgrade links.");
  assert.ok(pageHasLinks(document, 1), "Page 2 should contain upgrade links.");
  const uri = firstLinkUri(document);
  assert.ok(uri.includes("/full-report"), "Upgrade URL should be present.");
  assert.ok(
    uri.toUpperCase().includes(registration.replace(/\s+/g, "")),
    "Upgrade URL should include the registration.",
  );
  const title = document.getTitle() ?? "";
  assert.ok(
    compactText(title).includes(compactText(registration)),
    "PDF title should include the registration.",
  );
  assert.ok((document.getSubject() ?? "").includes("Report ID"), "Report ID should be present in PDF metadata.");
  assert.ok(
    (document.getKeywords() ?? "").includes("Unlock Full Report"),
    "Premium CTA should be present.",
  );
  return document.getPageCount();
}

async function assertPaidPdf(bytes: Uint8Array, registration: string, expectedMin: number) {
  const document = await PDFDocument.load(bytes);
  const pages = document.getPageCount();
  assert.ok(pages >= expectedMin && pages <= 4, `Paid report pages out of range: ${pages}`);
  const title = document.getTitle() ?? "";
  assert.ok(
    compactText(title).includes(compactText(registration)),
    "Paid PDF title should include the registration.",
  );
  assert.ok((document.getSubject() ?? "").includes("Report ID"), "Paid report ID should be present.");
  return pages;
}

function printTable(rows: ResultRow[]) {
  const free = rows.filter((row) => row.group === "FREE");
  const full = rows.filter((row) => row.group === "FULL");
  console.log("\nFREE PDF STRESS TEST\n");
  for (const row of free) {
    const mark = row.ok ? "PASS" : "FAIL";
    console.log(`${row.id.padEnd(16, ".")} ${mark} - ${row.pages} pages${row.detail ? ` (${row.detail})` : ""}`);
  }
  console.log("\nFULL REPORT MOCKS\n");
  for (const row of full) {
    const mark = row.ok ? "PASS" : "FAIL";
    console.log(`${row.id.padEnd(16, ".")} ${mark} - ${row.pages} pages${row.detail ? ` (${row.detail})` : ""}`);
  }
}

async function writeIndex(rows: ResultRow[]) {
  const lines = [
    "# PDF stress-test output",
    "",
    "Regenerate with `npm run pdf:stress-test`.",
    "",
    "## Free report",
    "",
    ...rows
      .filter((row) => row.group === "FREE")
      .map((row) => `- ${row.id}: ${row.ok ? "PASS" : "FAIL"} (${row.pages} pages)`),
    "",
    "## Paid report mocks",
    "",
    ...rows
      .filter((row) => row.group === "FULL")
      .map((row) => `- ${row.id}: ${row.ok ? "PASS" : "FAIL"} (${row.pages} pages)`),
    "",
  ];
  await fs.writeFile(path.join(OUTPUT_ROOT, "INDEX.md"), lines.join("\n"));
}

async function run() {
  await fs.rm(OUTPUT_ROOT, { recursive: true, force: true });
  await fs.mkdir(OUTPUT_ROOT, { recursive: true });
  const { iconPngs, plateFontBytes } = await loadAssets();
  const generatedAt = new Date("2026-09-20T12:00:00Z");
  const rows: ResultRow[] = [];

  for (const testCase of freeStressCases) {
    const folder = path.join(OUTPUT_ROOT, testCase.id);
    try {
      const imagePng = await loadImagePng(testCase.vehicle.summary.imageSrc);
      const bytes = await generateVehicleReportPdf(testCase.vehicle, {
        imagePng,
        iconPngs,
        plateFontBytes,
        generatedAt,
        baseUrl: "https://autoviewer.co.uk",
      });
      const pages = await assertFreePdf(bytes, testCase.vehicle.summary.registration);
      await writePdfAndImages(folder, bytes);
      rows.push({
        group: "FREE",
        id: testCase.id,
        ok: true,
        pages,
        expected: "2",
        detail: testCase.label,
      });
    } catch (error) {
      rows.push({
        group: "FREE",
        id: testCase.id,
        ok: false,
        pages: 0,
        expected: "2",
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  }

  for (const testCase of paidMockCases) {
    const folder = path.join(OUTPUT_ROOT, `full-${testCase.id}`);
    const expectedMin = testCase.id === "complex" ? 4 : 3;
    try {
      const imagePng = await loadImagePng(testCase.vehicle.summary.imageSrc);
      const bytes = await generateFullReportPdf(testCase.vehicle, {
        imagePng,
        iconPngs,
        plateFontBytes,
        generatedAt,
        premium: testCase.premium,
        baseUrl: "https://autoviewer.co.uk",
      });
      const pages = await assertPaidPdf(
        bytes,
        testCase.vehicle.summary.registration,
        expectedMin,
      );
      await writePdfAndImages(folder, bytes);
      rows.push({
        group: "FULL",
        id: testCase.id,
        ok: pages >= expectedMin,
        pages,
        expected: String(expectedMin),
        detail: testCase.label,
      });
    } catch (error) {
      rows.push({
        group: "FULL",
        id: testCase.id,
        ok: false,
        pages: 0,
        expected: String(expectedMin),
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  }

  await writeIndex(rows);
  printTable(rows);
  const failed = rows.filter((row) => !row.ok);
  if (failed.length > 0) {
    console.error(`\n${failed.length} PDF stress-test case(s) failed.`);
    process.exitCode = 1;
  } else {
    console.log(`\nOutput: ${OUTPUT_ROOT}`);
  }
}

void run();
