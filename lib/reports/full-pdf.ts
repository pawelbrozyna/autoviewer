import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import type { VehicleReportPdfOptions } from "@/lib/reports/pdf";
import {
  PAID_ADVISORY_LIMIT,
  PAID_MILEAGE_LIMIT,
  PAID_SPEC_LIMIT,
  advisoryRowsForPdf,
  collectAdvisories,
  mileageRowsForPdf,
  motRowsForPaidPdf,
} from "@/lib/reports/pdf-limits";
import type { PaidReportFixture, PremiumMockData } from "@/lib/reports/stress/fixtures";
import type { VehicleRecord } from "@/types/vehicle";

export type FullReportPdfOptions = VehicleReportPdfOptions & {
  premium: PremiumMockData;
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 34;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const NAVY = rgb(0.027, 0.106, 0.227);
const BLUE = rgb(0.02, 0.39, 0.75);
const MUTED = rgb(0.37, 0.43, 0.51);
const BORDER = rgb(0.8, 0.83, 0.86);
const INNER_LINE = rgb(0.86, 0.88, 0.91);
const SOFT = rgb(0.925, 0.94, 0.955);
const GREEN = rgb(0.075, 0.53, 0.24);
const GREEN_BG = rgb(0.918, 0.973, 0.929);
const AMBER = rgb(0.82, 0.48, 0.04);
const AMBER_BG = rgb(1, 0.973, 0.9);
const RED = rgb(0.75, 0.1, 0.12);
const RED_BG = rgb(0.996, 0.93, 0.93);
const YELLOW = rgb(0.98, 0.8, 0.14);
const WHITE = rgb(1, 1, 1);
const BLACK = rgb(0, 0, 0);

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) line = next;
    else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function fitText(text: string, font: PDFFont, size: number, maxWidth: number) {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;
  let value = text;
  while (value.length > 1 && font.widthOfTextAtSize(`${value}...`, size) > maxWidth) {
    value = value.slice(0, -1);
  }
  return `${value.trim()}...`;
}

function formatDate(value?: string | null) {
  if (!value) return "Not available";
  const date = new Date(value.length === 7 ? `${value}-01T12:00:00Z` : value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: value.length === 7 ? undefined : "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function drawRounded(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: ReturnType<typeof rgb>,
  radius = 6,
) {
  page.drawRectangle({
    x: x + radius,
    y,
    width: width - radius * 2,
    height,
    color: fill,
  });
  page.drawRectangle({
    x,
    y: y + radius,
    width,
    height: height - radius * 2,
    color: fill,
  });
  for (const [cx, cy] of [
    [x + radius, y + radius],
    [x + width - radius, y + radius],
    [x + radius, y + height - radius],
    [x + width - radius, y + height - radius],
  ]) {
    page.drawCircle({ x: cx, y: cy, size: radius, color: fill });
  }
}

function drawSection(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  fill = WHITE,
  headerHeight = 0,
  headerFill = SOFT,
) {
  const radius = 6;
  const stroke = 0.7;
  drawRounded(page, x, y, width, height, BORDER, radius);
  drawRounded(
    page,
    x + stroke,
    y + stroke,
    width - stroke * 2,
    height - stroke * 2,
    fill,
    Math.max(1, radius - stroke),
  );
  if (headerHeight > 0) {
    page.drawRectangle({
      x: x + stroke,
      y: y + height - headerHeight,
      width: width - stroke * 2,
      height: headerHeight - stroke,
      color: headerFill,
    });
    page.drawLine({
      start: { x: x + stroke, y: y + height - headerHeight },
      end: { x: x + width - stroke, y: y + height - headerHeight },
      thickness: 0.55,
      color: INNER_LINE,
    });
  }
}

function textY(centerY: number, size: number) {
  return centerY - size * 0.35;
}

function wordmark(page: PDFPage, bold: PDFFont, x: number, y: number) {
  page.drawText("Auto", { x, y, size: 22, font: bold, color: NAVY });
  page.drawText("Viewer", {
    x: x + bold.widthOfTextAtSize("Auto", 22),
    y,
    size: 22,
    font: bold,
    color: BLUE,
  });
}

function footer(
  page: PDFPage,
  regular: PDFFont,
  bold: PDFFont,
  pageNumber: number,
  pageCount: number,
) {
  page.drawLine({
    start: { x: MARGIN, y: 42 },
    end: { x: PAGE_WIDTH - MARGIN, y: 42 },
    thickness: 0.6,
    color: BORDER,
  });
  page.drawText("Auto", { x: MARGIN, y: 25, size: 10, font: bold, color: NAVY });
  page.drawText("Viewer", {
    x: MARGIN + bold.widthOfTextAtSize("Auto", 10),
    y: 25,
    size: 10,
    font: bold,
    color: BLUE,
  });
  const disclaimer = "Full vehicle report. Confirm important details before buying.";
  page.drawText(disclaimer, {
    x: (PAGE_WIDTH - regular.widthOfTextAtSize(disclaimer, 6.5)) / 2,
    y: 25,
    size: 6.5,
    font: regular,
    color: MUTED,
  });
  const label = `Page ${pageNumber} of ${pageCount}`;
  page.drawText(label, {
    x: PAGE_WIDTH - MARGIN - regular.widthOfTextAtSize(label, 6.5),
    y: 14,
    size: 6.5,
    font: regular,
    color: MUTED,
  });
}

function statusTone(status: string) {
  const upper = status.toUpperCase();
  if (
    upper.includes("CLEAR") ||
    upper.includes("NO RECORD") ||
    upper.includes("NONE OPEN") ||
    upper === "CONSISTENT" ||
    upper === "VALID" ||
    upper === "PASS"
  ) {
    return { fill: GREEN_BG, color: GREEN };
  }
  if (upper.includes("FAIL") || upper.includes("RECORD FOUND") || upper.includes("CATEGORY")) {
    return { fill: RED_BG, color: RED };
  }
  return { fill: AMBER_BG, color: AMBER };
}

export function paidReportNeedsFourthPage(premium: PremiumMockData, vehicle: VehicleRecord) {
  return (
    premium.keepers.timeline.length > 5 ||
    vehicle.recalls.items.length > 2 ||
    (premium.finance.status === "RECORD FOUND" &&
      premium.writeOff.status !== "NO RECORD" &&
      premium.keepers.count >= 6)
  );
}

export async function generateFullReportPdf(
  vehicle: VehicleRecord,
  options: FullReportPdfOptions,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const plateFont = options.plateFontBytes
    ? await pdf.embedFont(options.plateFontBytes, { subset: true })
    : bold;
  const { summary, details } = vehicle;
  const premium = options.premium;
  const pageCount = paidReportNeedsFourthPage(premium, vehicle) ? 4 : 3;
  const generatedAt = options.generatedAt ?? new Date();
  const generatedDate = generatedAt.toLocaleDateString("en-GB");
  const reportId = `AVF-${summary.registration}-${generatedAt
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "")}`;

  const page1 = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  wordmark(page1, bold, MARGIN, 797);
  page1.drawText("CLEARER CARS. BRIGHTER DECISIONS.", {
    x: MARGIN,
    y: 785,
    size: 6.2,
    font: regular,
    color: MUTED,
  });
  const title = "Full Vehicle Report";
  page1.drawText(title, {
    x: PAGE_WIDTH - MARGIN - bold.widthOfTextAtSize(title, 15),
    y: 800,
    size: 15,
    font: bold,
    color: NAVY,
  });
  [`Report ID  ${reportId}`, `Generated  ${generatedDate}`].forEach((line, index) => {
    page1.drawText(line, {
      x: PAGE_WIDTH - MARGIN - regular.widthOfTextAtSize(line, 7.8),
      y: 787 - index * 10,
      size: 7.8,
      font: regular,
      color: MUTED,
    });
  });
  page1.drawLine({
    start: { x: MARGIN, y: 765 },
    end: { x: PAGE_WIDTH - MARGIN, y: 765 },
    thickness: 1.4,
    color: BLUE,
  });

  const plateText = summary.displayRegistration;
  const plateWidth = Math.max(150, plateFont.widthOfTextAtSize(plateText, 29) + 30);
  drawRounded(page1, MARGIN + 12, 696, plateWidth, 38, BLACK, 5);
  drawRounded(page1, MARGIN + 13.5, 697.5, plateWidth - 3, 35, YELLOW, 4);
  page1.drawText(plateText, {
    x: MARGIN + 12 + (plateWidth - plateFont.widthOfTextAtSize(plateText, 29)) / 2,
    y: 706,
    size: 29,
    font: plateFont,
    color: BLACK,
  });
  const vehicleTitle = [summary.year, summary.make, summary.model].filter(Boolean).join(" ");
  const titleLines = wrapText(vehicleTitle, bold, 16, 270).slice(0, 2);
  titleLines.forEach((line, index) => {
    page1.drawText(line, {
      x: MARGIN + 12,
      y: 671 - index * 18,
      size: 16,
      font: bold,
      color: NAVY,
    });
  });
  const specY = titleLines.length > 1 ? 628 : 648;
  const spec = [summary.colour, summary.fuelType, summary.transmission]
    .filter(Boolean)
    .join("  |  ");
  page1.drawText(spec || "Specification not available", {
    x: MARGIN + 12,
    y: specY,
    size: 11.2,
    font: regular,
    color: BLACK,
  });
  page1.drawText("First registered", {
    x: MARGIN + 12,
    y: specY - 22,
    size: 8.5,
    font: regular,
    color: MUTED,
  });
  page1.drawText(formatDate(details.monthOfFirstRegistration), {
    x: MARGIN + 12,
    y: specY - 39,
    size: 12,
    font: bold,
    color: BLACK,
  });
  if (options.imagePng) {
    const image = await pdf.embedPng(options.imagePng);
    const dimensions = image.scaleToFit(275.5, 142.5);
    page1.drawImage(image, {
      x: 552 - dimensions.width,
      y: 603 + (150 - dimensions.height) / 2,
      width: dimensions.width,
      height: dimensions.height,
    });
  }

  const warning =
    premium.finance.status !== "CLEAR" ||
    premium.writeOff.status !== "NO RECORD" ||
    premium.stolen.status !== "NO RECORD" ||
    vehicle.recalls.hasOpenRecalls ||
    vehicle.motTests.some((test) => test.testResult === "FAIL");
  drawSection(page1, MARGIN, 530, CONTENT_WIDTH, 58, warning ? AMBER_BG : GREEN_BG);
  page1.drawText("Vehicle history summary", {
    x: MARGIN + 16,
    y: 568,
    size: 9,
    font: regular,
    color: MUTED,
  });
  page1.drawText(
    warning
      ? "Items require attention"
      : "No major premium-history issues found",
    {
      x: MARGIN + 16,
      y: 548,
      size: 14,
      font: bold,
      color: warning ? NAVY : GREEN,
    },
  );

  const facts = [
    ["Finance", premium.finance.status === "CLEAR" ? "Clear" : "Record found"],
    ["Write-off", premium.writeOff.status === "NO RECORD" ? "No record" : premium.writeOff.status],
    ["Stolen", premium.stolen.status === "NO RECORD" ? "No record" : "Record found"],
    ["Previous keepers", String(premium.keepers.count)],
    ["Keeper changes", String(Math.max(0, premium.keepers.timeline.length - 1))],
    ["Recalls", vehicle.recalls.hasOpenRecalls ? `${vehicle.recalls.count} open` : "None open"],
    ["MOT", summary.motStatus.status],
    ["Mileage consistency", premium.mileageConsistency.status],
  ] as const;
  const factRows = Math.ceil(facts.length / 2);
  const factsHeight = 48 + factRows * 42 + 12;
  const factsTop = 514;
  const factsY = factsTop - factsHeight;
  drawSection(page1, MARGIN, factsY, CONTENT_WIDTH, factsHeight);
  page1.drawText("Premium checks", {
    x: MARGIN + 14,
    y: factsTop - 22,
    size: 13,
    font: bold,
    color: NAVY,
  });
  facts.forEach(([label, value], index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = MARGIN + 16 + column * (CONTENT_WIDTH / 2);
    const y = factsTop - 62 - row * 42;
    const tone = statusTone(value);
    drawRounded(page1, x, y - 8, CONTENT_WIDTH / 2 - 28, 34, tone.fill, 5);
    page1.drawText(label, {
      x: x + 10,
      y: y + 12,
      size: 8,
      font: regular,
      color: MUTED,
    });
    page1.drawText(value, {
      x: x + 10,
      y: y - 2,
      size: 11,
      font: bold,
      color: tone.color,
    });
  });
  const contents = [
    ["Page 1", "Premium overview"],
    ["Page 2", "MOT and specification"],
    [pageCount === 4 ? "Pages 3-4" : "Page 3", "History and risk checks"],
  ] as const;
  const contentsHeight = 70;
  const contentsTop = factsY - 16;
  drawSection(page1, MARGIN, contentsTop - contentsHeight, CONTENT_WIDTH, contentsHeight);
  page1.drawText("In this full report", {
    x: MARGIN + 14,
    y: contentsTop - 22,
    size: 11,
    font: bold,
    color: NAVY,
  });
  contents.forEach(([label, detail], index) => {
    const x = MARGIN + 14 + index * (CONTENT_WIDTH / 3);
    page1.drawText(label, {
      x,
      y: contentsTop - 42,
      size: 9,
      font: bold,
      color: BLUE,
    });
    page1.drawText(detail, {
      x,
      y: contentsTop - 56,
      size: 8,
      font: regular,
      color: MUTED,
    });
  });
  footer(page1, regular, bold, 1, pageCount);

  const page2 = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  wordmark(page2, bold, MARGIN, 797);
  page2.drawText("Technical Evidence", {
    x: PAGE_WIDTH - MARGIN - bold.widthOfTextAtSize("Technical Evidence", 13),
    y: 800,
    size: 13,
    font: bold,
    color: NAVY,
  });
  page2.drawLine({
    start: { x: MARGIN, y: 765 },
    end: { x: PAGE_WIDTH - MARGIN, y: 765 },
    thickness: 1.4,
    color: BLUE,
  });
  const motSlice = motRowsForPaidPdf(vehicle.motTests);
  const motRows = motSlice.shown;
  const motTop = 740;
  const motHeaderHeight = 26;
  const motColH = 22;
  const motRowH = 22;
  const motNoteH = motSlice.note ? 14 : 0;
  const motBottom =
    motTop -
    motHeaderHeight -
    motColH -
    Math.max(1, motRows.length) * motRowH -
    motNoteH;
  drawSection(page2, MARGIN, motBottom, CONTENT_WIDTH, motTop - motBottom, WHITE, motHeaderHeight);
  page2.drawText("MOT history", {
    x: 48,
    y: motTop - 17,
    size: 12.5,
    font: bold,
    color: NAVY,
  });
  const motCols = [
    { title: "DATE", x: 51 },
    { title: "RESULT", x: 140 },
    { title: "MILEAGE", x: 205 },
    { title: "NOTES", x: 305 },
  ];
  const motColY = motTop - motHeaderHeight - motColH;
  page2.drawRectangle({
    x: MARGIN,
    y: motColY,
    width: CONTENT_WIDTH,
    height: motColH,
    color: SOFT,
  });
  motCols.forEach((column) => {
    page2.drawText(column.title, {
      x: column.x,
      y: textY(motColY + motColH / 2, 8),
      size: 8,
      font: bold,
      color: MUTED,
    });
  });
  motRows.forEach((test, index) => {
    const y = motColY - (index + 0.5) * motRowH;
    if (index > 0) {
      page2.drawLine({
        start: { x: MARGIN, y: motColY - index * motRowH },
        end: { x: PAGE_WIDTH - MARGIN, y: motColY - index * motRowH },
        thickness: 0.5,
        color: INNER_LINE,
      });
    }
    page2.drawText(formatDate(test.completedDate), {
      x: 51,
      y: textY(y, 9),
      size: 9,
      font: regular,
      color: NAVY,
    });
    page2.drawText(test.testResult, {
      x: 140,
      y: textY(y, 9),
      size: 9,
      font: bold,
      color:
        test.testResult === "PASS"
          ? GREEN
          : test.testResult === "FAIL"
            ? RED
            : AMBER,
    });
    page2.drawText(
      test.odometerValue != null
        ? `${test.odometerValue.toLocaleString("en-GB")} mi`
        : "Not available",
      {
        x: 205,
        y: textY(y, 9),
        size: 9,
        font: bold,
        color: NAVY,
      },
    );
    page2.drawText(
      fitText(
        test.defects.length > 0
          ? `${test.defects.length} advisory / defect item${test.defects.length === 1 ? "" : "s"}`
          : "No advisories recorded",
        regular,
        8.8,
        230,
      ),
      {
        x: 305,
        y: textY(y, 8.8),
        size: 8.8,
        font: regular,
        color: MUTED,
      },
    );
  });
  if (motSlice.note) {
    page2.drawText(motSlice.note, {
      x: 51,
      y: motBottom + 5,
      size: 7.5,
      font: regular,
      color: MUTED,
    });
  }

  const mileageSlice = mileageRowsForPdf(
    [...vehicle.mileageHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    ),
    PAID_MILEAGE_LIMIT,
  );
  const advisoryItems: Array<{ date: string; type: string; text: string }> =
    collectAdvisories(vehicle).map((item) => ({
      date: item.date,
      type: item.type,
      text: item.text,
    }));
  const advisorySlice = advisoryRowsForPdf(
    advisoryItems.length > 0
      ? advisoryItems
      : [
          {
            date: "",
            type: "No advisories recorded",
            text: "No MOT advisories are shown in the available history.",
          },
        ],
    PAID_ADVISORY_LIMIT,
  );
  const detailTop = motBottom - 14;
  const halfWidth = (CONTENT_WIDTH - 12) / 2;
  const mileageHeight =
    48 + Math.max(1, mileageSlice.shown.length) * 22 + (mileageSlice.note ? 14 : 0);
  const notesHeight =
    26 + Math.max(1, advisorySlice.shown.length) * 28 + (advisorySlice.note ? 14 : 0);
  drawSection(page2, MARGIN, detailTop - mileageHeight, halfWidth, mileageHeight, WHITE, 26);
  page2.drawText("Mileage history", {
    x: 48,
    y: detailTop - 17,
    size: 12,
    font: bold,
    color: NAVY,
  });
  mileageSlice.shown.forEach((point, index) => {
    const y = detailTop - 48 - index * 22;
    page2.drawText(formatDate(point.date), {
      x: 51,
      y: textY(y, 9),
      size: 9,
      font: regular,
      color: NAVY,
    });
    page2.drawText(`${point.mileage.toLocaleString("en-GB")} mi`, {
      x: MARGIN + 130,
      y: textY(y, 9),
      size: 9,
      font: bold,
      color: NAVY,
    });
  });
  if (mileageSlice.note) {
    page2.drawText(mileageSlice.note, {
      x: 51,
      y: detailTop - mileageHeight + 5,
      size: 7.2,
      font: regular,
      color: MUTED,
    });
  }
  const specX = MARGIN + halfWidth + 12;
  drawSection(
    page2,
    specX,
    detailTop - notesHeight,
    halfWidth,
    notesHeight,
    AMBER_BG,
    26,
    rgb(1, 0.96, 0.84),
  );
  page2.drawText("Advisories / Notes", {
    x: specX + 12,
    y: detailTop - 17,
    size: 12,
    font: bold,
    color: NAVY,
  });
  advisorySlice.shown.forEach((item, index) => {
    const y = detailTop - 48 - index * 28;
    page2.drawText(fitText(item.type, bold, 8.4, halfWidth - 28), {
      x: specX + 12,
      y: y + 4,
      size: 8.4,
      font: bold,
      color: NAVY,
    });
    page2.drawText(
      fitText(
        item.date ? `${item.text} - ${formatDate(item.date)}` : item.text,
        regular,
        7.3,
        halfWidth - 28,
      ),
      {
        x: specX + 12,
        y: y - 8,
        size: 7.3,
        font: regular,
        color: MUTED,
      },
    );
  });
  const specs = [
    ["Colour", details.colour],
    [
      "Engine",
      details.engineCapacity != null
        ? `${details.engineCapacity.toLocaleString("en-GB")} cc`
        : null,
    ],
    ["Fuel", details.fuelType],
    ["Transmission", details.transmission],
    ["CO2", details.co2Emissions != null ? `${details.co2Emissions} g/km` : null],
    ["Euro status", details.euroStatus],
    ["First registered", formatDate(details.monthOfFirstRegistration)],
    ["Tax status", summary.tax.status],
  ].filter(
    (item): item is [string, string] =>
      typeof item[1] === "string" && item[1] !== "Not available",
  );
  const specTop = detailTop - Math.max(mileageHeight, notesHeight) - 14;
  const specRows = Math.ceil(Math.min(specs.length, PAID_SPEC_LIMIT) / 2);
  const specHeight = 26 + specRows * 24;
  drawSection(page2, MARGIN, specTop - specHeight, CONTENT_WIDTH, specHeight, WHITE, 26);
  page2.drawText("Vehicle specification", {
    x: MARGIN + 12,
    y: specTop - 17,
    size: 12,
    font: bold,
    color: NAVY,
  });
  specs.slice(0, PAID_SPEC_LIMIT).forEach(([label, value], index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    page2.drawText(label, {
      x: MARGIN + 12 + column * (CONTENT_WIDTH / 2),
      y: specTop - 48 - row * 24,
      size: 8.4,
      font: regular,
      color: MUTED,
    });
    page2.drawText(fitText(value, bold, 8.8, 120), {
      x: MARGIN + 110 + column * (CONTENT_WIDTH / 2),
      y: specTop - 48 - row * 24,
      size: 8.8,
      font: bold,
      color: NAVY,
    });
  });
  footer(page2, regular, bold, 2, pageCount);

  const page3 = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  wordmark(page3, bold, MARGIN, 797);
  page3.drawText("Premium history details", {
    x: PAGE_WIDTH - MARGIN - bold.widthOfTextAtSize("Premium history details", 13),
    y: 800,
    size: 13,
    font: bold,
    color: NAVY,
  });
  page3.drawLine({
    start: { x: MARGIN, y: 765 },
    end: { x: PAGE_WIDTH - MARGIN, y: 765 },
    thickness: 1.4,
    color: BLUE,
  });

  const checks = [
    ["Finance check", premium.finance.status, premium.finance.detail],
    [
      "Write-off history",
      premium.writeOff.status,
      premium.writeOff.date
        ? `${premium.writeOff.detail} Recorded: ${formatDate(premium.writeOff.date)}`
        : premium.writeOff.detail,
    ],
    ["Stolen vehicle check", premium.stolen.status, premium.stolen.detail],
    [
      "Mileage consistency",
      premium.mileageConsistency.status,
      premium.mileageConsistency.detail,
    ],
  ] as const;
  checks.forEach((item, index) => {
    const y = 680 - index * 78;
    const tone = statusTone(item[1]);
    drawSection(page3, MARGIN, y, CONTENT_WIDTH, 70, WHITE, 26, tone.fill);
    page3.drawText(item[0], {
      x: MARGIN + 14,
      y: y + 48,
      size: 12,
      font: bold,
      color: NAVY,
    });
    page3.drawText(item[1], {
      x: PAGE_WIDTH - MARGIN - 14 - bold.widthOfTextAtSize(item[1], 10),
      y: y + 48,
      size: 10,
      font: bold,
      color: tone.color,
    });
    wrapText(item[2], regular, 9, CONTENT_WIDTH - 28)
      .slice(0, 2)
      .forEach((line, lineIndex) => {
        page3.drawText(line, {
          x: MARGIN + 14,
          y: y + 24 - lineIndex * 12,
          size: 9,
          font: regular,
          color: MUTED,
        });
      });
  });

  const keeperY = 330;
  const keeperEvents = premium.keepers.timeline.slice(0, 5);
  const keeperHeight = 70 + keeperEvents.length * 28;
  const keeperBottom = keeperY - keeperHeight + 26;
  drawSection(page3, MARGIN, keeperBottom, CONTENT_WIDTH / 2 - 6, keeperHeight);
  page3.drawText("Previous keepers", {
    x: MARGIN + 12,
    y: keeperY + 6,
    size: 12,
    font: bold,
    color: NAVY,
  });
  page3.drawText(`${premium.keepers.count} registered keepers`, {
    x: MARGIN + 12,
    y: keeperY - 18,
    size: 9,
    font: regular,
    color: MUTED,
  });
  keeperEvents.forEach((event, index) => {
    const y = keeperY - 46 - index * 28;
    page3.drawText(event.year, {
      x: MARGIN + 12,
      y,
      size: 10,
      font: bold,
      color: NAVY,
    });
    page3.drawText(event.label, {
      x: MARGIN + 70,
      y,
      size: 9,
      font: regular,
      color: MUTED,
    });
  });

  const recallX = MARGIN + CONTENT_WIDTH / 2 + 6;
  const recallItems = vehicle.recalls.items.slice(0, 4);
  const recallHeight = 52 + Math.max(1, recallItems.length) * 28;
  drawSection(page3, recallX, keeperY - recallHeight + 26, CONTENT_WIDTH / 2 - 6, recallHeight);
  page3.drawText("Recalls", {
    x: recallX + 12,
    y: keeperY + 6,
    size: 12,
    font: bold,
    color: NAVY,
  });
  if (recallItems.length === 0) {
    page3.drawText("No open manufacturer recalls in this sample.", {
      x: recallX + 12,
      y: keeperY - 24,
      size: 8.5,
      font: regular,
      color: MUTED,
    });
  } else {
    recallItems.forEach((item, index) => {
      const y = keeperY - 28 - index * 28;
      page3.drawText(fitText(item.title, bold, 8.4, CONTENT_WIDTH / 2 - 36), {
        x: recallX + 12,
        y,
        size: 8.4,
        font: bold,
        color: NAVY,
      });
      page3.drawText(
        [item.status ?? "Open", item.date ? formatDate(item.date) : null]
          .filter(Boolean)
          .join("  |  "),
        {
          x: recallX + 12,
          y: y - 11,
          size: 7.5,
          font: regular,
          color: MUTED,
        },
      );
    });
  }
  footer(page3, regular, bold, 3, pageCount);

  if (pageCount === 4) {
    const page4 = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    wordmark(page4, bold, MARGIN, 797);
    page4.drawText("Additional premium history", {
      x: PAGE_WIDTH - MARGIN - bold.widthOfTextAtSize("Additional premium history", 13),
      y: 800,
      size: 13,
      font: bold,
      color: NAVY,
    });
    page4.drawLine({
      start: { x: MARGIN, y: 765 },
      end: { x: PAGE_WIDTH - MARGIN, y: 765 },
      thickness: 1.4,
      color: BLUE,
    });
    const timelineHeight = 56 + premium.keepers.timeline.length * 22;
    drawSection(page4, MARGIN, 740 - timelineHeight, CONTENT_WIDTH, timelineHeight);
    page4.drawText("Full keeper timeline", {
      x: MARGIN + 14,
      y: 716,
      size: 13,
      font: bold,
      color: NAVY,
    });
    premium.keepers.timeline.forEach((event, index) => {
      page4.drawText(`${event.year}    ${event.label}`, {
        x: MARGIN + 14,
        y: 680 - index * 22,
        size: 11,
        font: regular,
        color: NAVY,
      });
    });
    const recallList = vehicle.recalls.items.length > 0
      ? vehicle.recalls.items
      : [{ title: "No further recall records in this mock.", date: "", status: "" }];
    const recallListHeight = 56 + recallList.length * 36;
    const recallListTop = 740 - timelineHeight - 16;
    drawSection(
      page4,
      MARGIN,
      recallListTop - recallListHeight,
      CONTENT_WIDTH,
      recallListHeight,
    );
    page4.drawText("Complete recall list", {
      x: MARGIN + 14,
      y: recallListTop - 24,
      size: 13,
      font: bold,
      color: NAVY,
    });
    recallList.forEach((item, index) => {
      page4.drawText(fitText(item.title, bold, 10, CONTENT_WIDTH - 40), {
        x: MARGIN + 14,
        y: recallListTop - 52 - index * 36,
        size: 10,
        font: bold,
        color: NAVY,
      });
      page4.drawText(
        [item.status, item.date ? formatDate(item.date) : null].filter(Boolean).join("  |  ") ||
          "Not available",
        {
          x: MARGIN + 14,
          y: recallListTop - 66 - index * 36,
          size: 8.5,
          font: regular,
          color: MUTED,
        },
      );
    });
    footer(page4, regular, bold, 4, pageCount);
  }

  pdf.setTitle(`AutoViewer Full Vehicle Report - ${summary.displayRegistration}`);
  pdf.setSubject(`Development mock of the paid AutoViewer full report. Report ID ${reportId}`);
  pdf.setKeywords([reportId, summary.registration, "Full Vehicle Report"]);
  pdf.setAuthor("AutoViewer");
  pdf.setCreator("AutoViewer");
  return pdf.save();
}

export function paidFixtureToPdf(fixture: PaidReportFixture, options: VehicleReportPdfOptions) {
  return generateFullReportPdf(fixture.vehicle, {
    ...options,
    premium: fixture.premium,
  });
}
