import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFImage,
  type PDFPage,
} from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import type { ReportIconName, VehicleReportPdfOptions } from "@/lib/reports/pdf";
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
const BODY = rgb(0.2, 0.24, 0.3);
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

const REPORT_ICON_NAMES: ReportIconName[] = [
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
];

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
    const innerX = x + stroke;
    const innerWidth = width - stroke * 2;
    const headerBottom = y + height - headerHeight;
    const headerRadius = Math.max(1, radius - stroke);
    // Top rounded strip so header fill stays inside rounded corners.
    page.drawRectangle({
      x: innerX + headerRadius,
      y: headerBottom + headerHeight - stroke - headerRadius,
      width: innerWidth - headerRadius * 2,
      height: headerRadius,
      color: headerFill,
    });
    page.drawRectangle({
      x: innerX,
      y: headerBottom,
      width: innerWidth,
      height: headerHeight - stroke - headerRadius,
      color: headerFill,
    });
    for (const cx of [
      innerX + headerRadius,
      innerX + innerWidth - headerRadius,
    ]) {
      page.drawCircle({
        x: cx,
        y: y + height - stroke - headerRadius,
        size: headerRadius,
        color: headerFill,
      });
    }
    page.drawLine({
      start: { x: innerX, y: headerBottom },
      end: { x: innerX + innerWidth, y: headerBottom },
      thickness: 0.55,
      color: INNER_LINE,
    });
  }
}

function textY(centerY: number, size: number) {
  return centerY - size * 0.35;
}

function headerTitleY(
  sectionY: number,
  sectionHeight: number,
  headerHeight: number,
  size: number,
) {
  return textY(sectionY + sectionHeight - headerHeight / 2, size);
}

function headerIconY(
  sectionY: number,
  sectionHeight: number,
  headerHeight: number,
  iconSize: number,
) {
  return sectionY + sectionHeight - headerHeight / 2 - iconSize / 2;
}

function rowCenterY(contentTop: number, row: number, rowHeight: number) {
  return contentTop - (row + 0.5) * rowHeight;
}

function rowIconY(centerY: number, iconSize: number) {
  return centerY - iconSize / 2;
}

function drawInnerHLine(page: PDFPage, x: number, y: number, width: number) {
  page.drawLine({
    start: { x, y },
    end: { x: x + width, y },
    thickness: 0.5,
    color: INNER_LINE,
  });
}

function drawInnerVLine(page: PDFPage, x: number, y: number, height: number) {
  page.drawLine({
    start: { x, y },
    end: { x, y: y + height },
    thickness: 0.5,
    color: INNER_LINE,
  });
}

function drawEmbeddedIcon(
  page: PDFPage,
  icons: Partial<Record<ReportIconName, PDFImage>>,
  name: ReportIconName,
  x: number,
  y: number,
  size: number,
): boolean {
  const icon = icons[name];
  if (!icon) return false;
  page.drawImage(icon, { x, y, width: size, height: size });
  return true;
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
  const embeddedIcons: Partial<Record<ReportIconName, PDFImage>> = {};
  for (const name of REPORT_ICON_NAMES) {
    const bytes = options.iconPngs?.[name];
    if (bytes) embeddedIcons[name] = await pdf.embedPng(bytes);
  }
  const { summary, details } = vehicle;
  const premium = options.premium;
  const generatedAt = options.generatedAt ?? new Date();
  const generatedDate = generatedAt.toLocaleDateString("en-GB");
  const reportId = `AVF-${summary.registration}-${generatedAt
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "")}`;

  const page1 = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  wordmark(page1, bold, MARGIN, 797);
  const tagline = "CLEARER CARS. BRIGHTER DECISIONS.";
  page1.drawText(tagline, {
    x: MARGIN,
    y: 785,
    size: 6.2,
    font: regular,
    color: MUTED,
  });
  if (summary.isDemo) {
    const demoX = MARGIN + regular.widthOfTextAtSize(tagline, 6.2) + 10;
    page1.drawRectangle({
      x: demoX,
      y: 781,
      width: 58,
      height: 12,
      color: rgb(0.93, 0.96, 1),
      borderColor: BORDER,
      borderWidth: 0.5,
    });
    page1.drawText("DEMO DATA", {
      x: demoX + 8,
      y: 784,
      size: 6.5,
      font: bold,
      color: BLUE,
    });
  }
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

  if (options.imagePng) {
    const image = await pdf.embedPng(options.imagePng);
    const dimensions = image.scaleToFit(275.5, 142.5);
    page1.drawImage(image, {
      x: 552 - dimensions.width,
      y: 594 + (150 - dimensions.height) / 2,
      width: dimensions.width,
      height: dimensions.height,
    });
  }

  const vehicleTitle = [summary.year, summary.make, summary.model]
    .filter(Boolean)
    .join(" ");
  const titleSize = 17;
  page1.drawText(fitText(vehicleTitle, bold, titleSize, PAGE_WIDTH - MARGIN - 32), {
    x: MARGIN + 12,
    y: 732,
    size: titleSize,
    font: bold,
    color: NAVY,
  });

  const plateText = summary.displayRegistration;
  const plateFontSize = 29;
  const plateHeight = 38;
  const plateWidth = Math.max(
    150,
    plateFont.widthOfTextAtSize(plateText, plateFontSize) + 30,
  );
  const plateX = MARGIN + 12;
  const plateY = 675;
  const plateTextWidth = plateFont.widthOfTextAtSize(plateText, plateFontSize);
  const plateTextFullHeight = plateFont.heightAtSize(plateFontSize, {
    descender: true,
  });
  drawRounded(page1, plateX, plateY, plateWidth, plateHeight, BLACK, 5);
  drawRounded(
    page1,
    plateX + 1.5,
    plateY + 1.5,
    plateWidth - 3,
    plateHeight - 3,
    YELLOW,
    4,
  );
  page1.drawText(plateText, {
    x: plateX + (plateWidth - plateTextWidth) / 2,
    y: plateY + (plateHeight - plateTextFullHeight) / 2 + 6,
    size: plateFontSize,
    font: plateFont,
    color: BLACK,
  });

  const vehicleMetadataY = 658;
  const specsLineY = vehicleMetadataY - 4;
  const specParts = [summary.colour, summary.fuelType, summary.transmission].filter(
    Boolean,
  ) as string[];
  if (specParts.length === 0) {
    page1.drawText("Specification not available", {
      x: MARGIN + 12,
      y: specsLineY,
      size: 11.2,
      font: regular,
      color: BLACK,
    });
  } else {
    let specX = MARGIN + 12;
    specParts.forEach((part, index) => {
      if (index > 0) {
        const divider = "  |  ";
        page1.drawText(divider, {
          x: specX,
          y: specsLineY,
          size: 11.2,
          font: regular,
          color: MUTED,
        });
        specX += regular.widthOfTextAtSize(divider, 11.2);
      }
      page1.drawText(part, {
        x: specX,
        y: specsLineY,
        size: 11.2,
        font: regular,
        color: BLACK,
      });
      specX += regular.widthOfTextAtSize(part, 11.2);
    });
  }
  page1.drawText("First registered", {
    x: MARGIN + 12,
    y: vehicleMetadataY - 22,
    size: 8.5,
    font: regular,
    color: MUTED,
  });
  page1.drawText(formatDate(details.monthOfFirstRegistration), {
    x: MARGIN + 12,
    y: vehicleMetadataY - 39,
    size: 12,
    font: bold,
    color: BLACK,
  });

  const warning =
    premium.finance.status !== "CLEAR" ||
    premium.writeOff.status !== "NO RECORD" ||
    premium.stolen.status !== "NO RECORD" ||
    vehicle.recalls.hasOpenRecalls ||
    vehicle.motTests.some((test) => test.testResult === "FAIL") ||
    premium.mileageConsistency.status === "Needs review";
  const summaryY = 543;
  const summaryIconSize = 30.8;
  drawSection(page1, MARGIN, summaryY, CONTENT_WIDTH, 52, warning ? AMBER_BG : GREEN_BG);
  page1.drawText(
    `Summary: ${warning ? "Items require attention" : "No major premium-history issues found"}`,
    {
      x: 88,
      y: textY(569, 13) + 5,
      size: 13,
      font: bold,
      color: warning ? NAVY : GREEN,
    },
  );
  const hasSummaryIcon = drawEmbeddedIcon(
    page1,
    embeddedIcons,
    warning ? "warning" : "check",
    50,
    summaryY + 52 / 2 - summaryIconSize / 2,
    summaryIconSize,
  );
  if (!hasSummaryIcon) {
    page1.drawCircle({
      x: 65,
      y: 569,
      size: 15.4,
      color: warning ? AMBER : GREEN,
    });
  }
  page1.drawText(
    fitText(
      warning
        ? "Review premium checks, recalls and history details below."
        : "Based on the premium and vehicle history data shown in this report.",
      regular,
      8.3,
      430,
    ),
    {
      x: 88,
      y: textY(569, 8.3) - 8,
      size: 8.3,
      font: regular,
      color: MUTED,
    },
  );

  const contents = [
    ["Overview", "Premium summary"],
    ["Technical", "MOT, mileage, advisories"],
    ["History", "Finance, keepers, recalls"],
  ] as const;
  const contentsHeaderHeight = 26;
  const contentsHeight = 70;
  const contentsTop = 530;
  const contentsY = contentsTop - contentsHeight;
  drawSection(
    page1,
    MARGIN,
    contentsY,
    CONTENT_WIDTH,
    contentsHeight,
    WHITE,
    contentsHeaderHeight,
  );
  page1.drawText("In this full report", {
    x: MARGIN + 14,
    y: headerTitleY(contentsY, contentsHeight, contentsHeaderHeight, 12),
    size: 12,
    font: bold,
    color: NAVY,
  });
  const contentsBodyCenter = contentsY + (contentsHeight - contentsHeaderHeight) / 2;
  contents.forEach(([label, detail], index) => {
    const x = MARGIN + 14 + index * (CONTENT_WIDTH / 3);
    page1.drawText(label, {
      x,
      y: textY(contentsBodyCenter + 9, 11),
      size: 11,
      font: bold,
      color: BLUE,
    });
    page1.drawText(detail, {
      x,
      y: textY(contentsBodyCenter - 9, 9.5),
      size: 9.5,
      font: regular,
      color: BODY,
    });
  });

  const facts: Array<[string, string, ReportIconName]> = [
    [
      "Finance",
      premium.finance.status === "CLEAR" ? "Clear" : "Record found",
      "pound",
    ],
    [
      "Write-off",
      premium.writeOff.status === "NO RECORD" ? "No record" : premium.writeOff.status,
      "warning",
    ],
    [
      "Stolen",
      premium.stolen.status === "NO RECORD" ? "No record" : "Record found",
      "shield-check",
    ],
    ["Previous keepers", String(premium.keepers.count), "user"],
    [
      "Keeper changes",
      String(Math.max(0, premium.keepers.timeline.length - 1)),
      "history",
    ],
    [
      "Recalls",
      vehicle.recalls.hasOpenRecalls ? `${vehicle.recalls.count} open` : "None open",
      "clipboard",
    ],
    ["MOT", summary.motStatus.status, "shield-check"],
    ["Mileage consistency", premium.mileageConsistency.status, "mileage"],
  ];
  const factsHeaderHeight = 26;
  const factsRowHeight = 28;
  const factsHeight = factsHeaderHeight + Math.ceil(facts.length / 2) * factsRowHeight;
  const factsTop = contentsY - 12;
  const factsY = factsTop - factsHeight;
  drawSection(page1, MARGIN, factsY, CONTENT_WIDTH, factsHeight, WHITE, factsHeaderHeight);
  page1.drawText("Premium checks", {
    x: 48,
    y: headerTitleY(factsY, factsHeight, factsHeaderHeight, 12.5),
    size: 12.5,
    font: bold,
    color: NAVY,
  });
  const factColumnWidth = CONTENT_WIDTH / 2;
  const factsContentTop = factsY + factsHeight - factsHeaderHeight;
  facts.forEach(([label, value, icon], index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const baseX = MARGIN + column * factColumnWidth;
    const centerY = rowCenterY(factsContentTop, row, factsRowHeight);
    if (column === 0 && row === 0) {
      drawInnerVLine(page1, MARGIN + factColumnWidth, factsY, factsHeight - factsHeaderHeight);
    }
    if (column === 0 && row > 0) {
      drawInnerHLine(
        page1,
        MARGIN,
        factsContentTop - row * factsRowHeight,
        CONTENT_WIDTH,
      );
    }
    drawEmbeddedIcon(page1, embeddedIcons, icon, baseX + 11, rowIconY(centerY, 14), 14);
    page1.drawText(label, {
      x: baseX + 34,
      y: textY(centerY, 8.6),
      size: 8.6,
      font: regular,
      color: MUTED,
    });
    const tone = statusTone(value);
    page1.drawText(fitText(value, bold, 9.2, 92), {
      x: baseX + factColumnWidth - 105,
      y: textY(centerY, 9.2),
      size: 9.2,
      font: bold,
      color: tone.color,
    });
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
    ["Power", summary.powerBhp != null ? `${summary.powerBhp} bhp` : null],
    ["CO2", details.co2Emissions != null ? `${details.co2Emissions} g/km` : null],
    ["Euro status", details.euroStatus],
    ["First registered", formatDate(details.monthOfFirstRegistration)],
    ["Tax status", summary.tax.status],
    ["MOT status", summary.motStatus.status],
    ["MOT expiry", formatDate(summary.motStatus.expiryDate)],
    [
      "Current mileage",
      summary.latestMileage != null
        ? `${summary.latestMileage.toLocaleString("en-GB")} miles`
        : null,
    ],
  ].filter(
    (item): item is [string, string] =>
      typeof item[1] === "string" && item[1] !== "Not available",
  );
  const specHeaderHeight = 26;
  const specRowHeight = 26;
  const specificationRows = Math.ceil(Math.min(specs.length, PAID_SPEC_LIMIT) / 2);
  const specHeight = specHeaderHeight + Math.max(1, specificationRows) * specRowHeight;
  const specTop = factsY - 12;
  const specBottom = specTop - specHeight;
  drawSection(page1, MARGIN, specBottom, CONTENT_WIDTH, specHeight, WHITE, specHeaderHeight);
  page1.drawText("Vehicle specification", {
    x: MARGIN + 12,
    y: headerTitleY(specBottom, specHeight, specHeaderHeight, 12),
    size: 12,
    font: bold,
    color: NAVY,
  });
  const specColumnWidth = CONTENT_WIDTH / 2;
  const specContentTop = specTop - specHeaderHeight;
  specs.slice(0, PAID_SPEC_LIMIT).forEach(([label, value], index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const baseX = MARGIN + column * specColumnWidth;
    const centerY = rowCenterY(specContentTop, row, specRowHeight);
    if (column === 0 && row === 0) {
      drawInnerVLine(
        page1,
        MARGIN + specColumnWidth,
        specBottom,
        specHeight - specHeaderHeight,
      );
    }
    if (column === 0 && row > 0) {
      drawInnerHLine(
        page1,
        MARGIN,
        specContentTop - row * specRowHeight,
        CONTENT_WIDTH,
      );
    }
    page1.drawText(label, {
      x: baseX + 12,
      y: textY(centerY, 8.4),
      size: 8.4,
      font: regular,
      color: MUTED,
    });
    page1.drawText(fitText(value, bold, 8.9, 105), {
      x: baseX + 105,
      y: textY(centerY, 8.9),
      size: 8.9,
      font: bold,
      color: NAVY,
    });
  });
  // Footers are applied after all pages are known.
  const allPages: PDFPage[] = [page1];

  const FLOW_BOTTOM = 56;
  const FLOW_GAP = 14;
  const vehicleLabel = `${summary.year ?? ""} ${summary.make} ${summary.model}`.trim();

  type Flow = {
    page: PDFPage;
    y: number;
  };

  const startContentPage = (heading: string, subheading: string): Flow => {
    const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    allPages.push(page);
    wordmark(page, bold, MARGIN, 797);
    page.drawText("CLEARER CARS. BRIGHTER DECISIONS.", {
      x: MARGIN,
      y: 785,
      size: 6.2,
      font: regular,
      color: MUTED,
    });
    page.drawText(heading, {
      x: PAGE_WIDTH - MARGIN - bold.widthOfTextAtSize(heading, 13),
      y: 800,
      size: 13,
      font: bold,
      color: NAVY,
    });
    const meta = `${summary.displayRegistration}  |  Page ${allPages.length}`;
    page.drawText(meta, {
      x: PAGE_WIDTH - MARGIN - regular.widthOfTextAtSize(meta, 7.5),
      y: 783,
      size: 7.5,
      font: regular,
      color: MUTED,
    });
    page.drawLine({
      start: { x: MARGIN, y: 765 },
      end: { x: PAGE_WIDTH - MARGIN, y: 765 },
      thickness: 1.4,
      color: BLUE,
    });
    page.drawText(subheading, {
      x: MARGIN,
      y: 740,
      size: 17.5,
      font: bold,
      color: NAVY,
    });
    page.drawRectangle({
      x: PAGE_WIDTH - MARGIN - 132,
      y: 726,
      width: 132,
      height: 32,
      color: SOFT,
    });
    page.drawText(summary.displayRegistration, {
      x: PAGE_WIDTH - MARGIN - 122,
      y: 744,
      size: 10,
      font: bold,
      color: NAVY,
    });
    page.drawText(fitText(vehicleLabel, regular, 6.8, 112), {
      x: PAGE_WIDTH - MARGIN - 122,
      y: 733,
      size: 6.8,
      font: regular,
      color: MUTED,
    });
    return { page, y: 715 };
  };

  const ensureSpace = (flow: Flow, needed: number, heading: string, subheading: string) => {
    if (flow.y - needed >= FLOW_BOTTOM) return;
    const next = startContentPage(heading, `${subheading} (continued)`);
    flow.page = next.page;
    flow.y = next.y;
  };

  // --- Technical evidence: MOT, mileage, advisories (all rows) ---
  let flow = startContentPage("Technical Evidence", "MOT History & Advisories");

  const motSlice = motRowsForPaidPdf(vehicle.motTests);
  const motRows = motSlice.shown;
  const motHeaderHeight = 26;
  const motColHeaderHeight = 22;
  const motRowHeight = 24;
  const motColumns = [
    { title: "Date", x: 51, width: 84 },
    { title: "Result", x: 140, width: 60 },
    { title: "Mileage", x: 205, width: 95 },
    { title: "Notes", x: 305, width: 238 },
  ];

  const drawMotChunk = (
    flowState: Flow,
    chunk: typeof motRows,
    title: string,
  ) => {
    const panelTop = flowState.y;
    const panelHeight =
      motHeaderHeight +
      motColHeaderHeight +
      Math.max(1, chunk.length) * motRowHeight;
    const panelBottom = panelTop - panelHeight;
    drawSection(
      flowState.page,
      MARGIN,
      panelBottom,
      CONTENT_WIDTH,
      panelHeight,
      WHITE,
      motHeaderHeight,
    );
    flowState.page.drawText(title, {
      x: 48,
      y: headerTitleY(panelBottom, panelHeight, motHeaderHeight, 12.5),
      size: 12.5,
      font: bold,
      color: NAVY,
    });
    const motColHeaderY = panelTop - motHeaderHeight - motColHeaderHeight;
    const motInset = 0.8;
    flowState.page.drawRectangle({
      x: MARGIN + motInset,
      y: motColHeaderY,
      width: CONTENT_WIDTH - motInset * 2,
      height: motColHeaderHeight,
      color: SOFT,
    });
    drawInnerHLine(
      flowState.page,
      MARGIN + motInset,
      motColHeaderY,
      CONTENT_WIDTH - motInset * 2,
    );
    const motColHeaderCenter = motColHeaderY + motColHeaderHeight / 2;
    motColumns.forEach((column) => {
      flowState.page.drawText(column.title.toUpperCase(), {
        x: column.x,
        y: textY(motColHeaderCenter, 8),
        size: 8,
        font: bold,
        color: MUTED,
      });
    });
    const motBodyHeight = motColHeaderY + motColHeaderHeight - panelBottom;
    drawInnerVLine(
      flowState.page,
      MARGIN + motInset,
      panelBottom + motInset,
      motBodyHeight - motInset,
    );
    drawInnerVLine(
      flowState.page,
      MARGIN + CONTENT_WIDTH - motInset,
      panelBottom + motInset,
      motBodyHeight - motInset,
    );
    for (const x of [135, 200, 300]) {
      drawInnerVLine(
        flowState.page,
        x,
        panelBottom + motInset,
        motBodyHeight - motInset,
      );
    }
    if (chunk.length === 0) {
      flowState.page.drawText("MOT history is not available from the connected source.", {
        x: 51,
        y: textY(rowCenterY(motColHeaderY, 0, motRowHeight), 9),
        size: 9,
        font: regular,
        color: MUTED,
      });
    } else {
      chunk.forEach((test, index) => {
        const centerY = rowCenterY(motColHeaderY, index, motRowHeight);
        if (index > 0) {
          drawInnerHLine(
            flowState.page,
            MARGIN + motInset,
            motColHeaderY - index * motRowHeight,
            CONTENT_WIDTH - motInset * 2,
          );
        }
        flowState.page.drawText(formatDate(test.completedDate), {
          x: motColumns[0].x,
          y: textY(centerY, 9.4),
          size: 9.4,
          font: regular,
          color: NAVY,
        });
        flowState.page.drawText(test.testResult, {
          x: motColumns[1].x,
          y: textY(centerY, 9.4),
          size: 9.4,
          font: bold,
          color:
            test.testResult === "PASS"
              ? GREEN
              : test.testResult === "FAIL"
                ? RED
                : AMBER,
        });
        flowState.page.drawText(
          test.odometerValue != null
            ? `${test.odometerValue.toLocaleString("en-GB")} mi`
            : "Not available",
          {
            x: motColumns[2].x,
            y: textY(centerY, 9.4),
            size: 9.4,
            font: bold,
            color: NAVY,
          },
        );
        const note =
          test.defects.length > 0
            ? `${test.defects.length} advisory / defect item${test.defects.length === 1 ? "" : "s"}`
            : "No advisories recorded";
        flowState.page.drawText(fitText(note, regular, 9.1, motColumns[3].width), {
          x: motColumns[3].x,
          y: textY(centerY, 9.1),
          size: 9.1,
          font: regular,
          color: MUTED,
        });
      });
    }
    flowState.y = panelBottom - FLOW_GAP;
  };

  {
    let remaining = [...motRows];
    let first = true;
    if (remaining.length === 0) {
      ensureSpace(
        flow,
        motHeaderHeight + motColHeaderHeight + motRowHeight,
        "Technical Evidence",
        "MOT History",
      );
      drawMotChunk(flow, [], "MOT history");
    }
    while (remaining.length > 0) {
      const headerBlock = motHeaderHeight + motColHeaderHeight;
      const available = flow.y - FLOW_BOTTOM - headerBlock;
      const maxRows = Math.max(1, Math.floor(available / motRowHeight));
      if (flow.y - (headerBlock + Math.min(maxRows, remaining.length) * motRowHeight) < FLOW_BOTTOM) {
        ensureSpace(
          flow,
          headerBlock + motRowHeight,
          "Technical Evidence",
          "MOT History",
        );
      }
      const availAfterEnsure = flow.y - FLOW_BOTTOM - headerBlock;
      const rowsThisPage = Math.max(
        1,
        Math.min(remaining.length, Math.floor(availAfterEnsure / motRowHeight)),
      );
      const chunk = remaining.slice(0, rowsThisPage);
      remaining = remaining.slice(rowsThisPage);
      drawMotChunk(flow, chunk, first ? "MOT history" : "MOT history (continued)");
      first = false;
    }
  }

  const mileageRows = mileageRowsForPdf(
    [...vehicle.mileageHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    ),
    PAID_MILEAGE_LIMIT,
  ).shown;
  const advisoryItems =
    collectAdvisories(vehicle).length > 0
      ? collectAdvisories(vehicle).map((item) => ({
          date: item.date,
          type: item.type,
          text: item.text,
        }))
      : [
          {
            date: "",
            type: "No advisories recorded",
            text: "No MOT advisories are shown in the available history.",
          },
        ];
  const advisoryRows = advisoryRowsForPdf(advisoryItems, PAID_ADVISORY_LIMIT).shown;

  const mileageHeaderHeight = 26;
  const mileageColHeaderHeight = 22;
  const mileageRowHeight = 24;

  const drawMileageChunk = (
    flowState: Flow,
    chunk: typeof mileageRows,
    title: string,
  ) => {
    const panelTop = flowState.y;
    const panelHeight =
      mileageHeaderHeight +
      mileageColHeaderHeight +
      Math.max(1, chunk.length) * mileageRowHeight;
    const panelBottom = panelTop - panelHeight;
    drawSection(
      flowState.page,
      MARGIN,
      panelBottom,
      CONTENT_WIDTH,
      panelHeight,
      WHITE,
      mileageHeaderHeight,
    );
    flowState.page.drawText(title, {
      x: 48,
      y: headerTitleY(panelBottom, panelHeight, mileageHeaderHeight, 12.5),
      size: 12.5,
      font: bold,
      color: NAVY,
    });
    const mileageColY = panelTop - mileageHeaderHeight - mileageColHeaderHeight;
    const mileageInset = 0.8;
    const mileageSplitX = MARGIN + CONTENT_WIDTH / 2;
    flowState.page.drawRectangle({
      x: MARGIN + mileageInset,
      y: mileageColY,
      width: CONTENT_WIDTH - mileageInset * 2,
      height: mileageColHeaderHeight,
      color: SOFT,
    });
    drawInnerHLine(
      flowState.page,
      MARGIN + mileageInset,
      mileageColY,
      CONTENT_WIDTH - mileageInset * 2,
    );
    const bodyH = mileageColY + mileageColHeaderHeight - panelBottom;
    drawInnerVLine(
      flowState.page,
      MARGIN + mileageInset,
      panelBottom + mileageInset,
      bodyH - mileageInset,
    );
    drawInnerVLine(
      flowState.page,
      mileageSplitX,
      panelBottom + mileageInset,
      bodyH - mileageInset,
    );
    drawInnerVLine(
      flowState.page,
      MARGIN + CONTENT_WIDTH - mileageInset,
      panelBottom + mileageInset,
      bodyH - mileageInset,
    );
    const colCenter = mileageColY + mileageColHeaderHeight / 2;
    flowState.page.drawText("DATE", {
      x: 51,
      y: textY(colCenter, 8),
      size: 8,
      font: bold,
      color: MUTED,
    });
    flowState.page.drawText("MILEAGE", {
      x: mileageSplitX + 10,
      y: textY(colCenter, 8),
      size: 8,
      font: bold,
      color: MUTED,
    });
    if (chunk.length === 0) {
      flowState.page.drawText("Mileage history is not available.", {
        x: 51,
        y: textY(rowCenterY(mileageColY, 0, mileageRowHeight), 9.4),
        size: 9.4,
        font: regular,
        color: MUTED,
      });
    } else {
      chunk.forEach((point, index) => {
        const centerY = rowCenterY(mileageColY, index, mileageRowHeight);
        if (index > 0) {
          drawInnerHLine(
            flowState.page,
            MARGIN + mileageInset,
            mileageColY - index * mileageRowHeight,
            CONTENT_WIDTH - mileageInset * 2,
          );
        }
        flowState.page.drawText(formatDate(point.date), {
          x: 51,
          y: textY(centerY, 9.4),
          size: 9.4,
          font: regular,
          color: NAVY,
        });
        flowState.page.drawText(`${point.mileage.toLocaleString("en-GB")} mi`, {
          x: mileageSplitX + 10,
          y: textY(centerY, 9.4),
          size: 9.4,
          font: bold,
          color: NAVY,
        });
      });
    }
    flowState.y = panelBottom - FLOW_GAP;
  };

  {
    let remaining = [...mileageRows];
    let first = true;
    while (remaining.length > 0 || first) {
      const headerBlock = mileageHeaderHeight + mileageColHeaderHeight;
      if (remaining.length === 0 && first) {
        ensureSpace(
          flow,
          headerBlock + mileageRowHeight,
          "Technical Evidence",
          "Mileage history",
        );
        drawMileageChunk(flow, [], "Mileage history");
        break;
      }
      const avail = flow.y - FLOW_BOTTOM - headerBlock;
      let rowsThisPage = Math.max(1, Math.floor(avail / mileageRowHeight));
      if (flow.y - (headerBlock + Math.min(rowsThisPage, remaining.length) * mileageRowHeight) < FLOW_BOTTOM) {
        ensureSpace(
          flow,
          headerBlock + mileageRowHeight,
          "Technical Evidence",
          "Mileage history",
        );
        rowsThisPage = Math.max(
          1,
          Math.floor((flow.y - FLOW_BOTTOM - headerBlock) / mileageRowHeight),
        );
      }
      rowsThisPage = Math.min(rowsThisPage, remaining.length);
      const chunk = remaining.slice(0, rowsThisPage);
      remaining = remaining.slice(rowsThisPage);
      drawMileageChunk(
        flow,
        chunk,
        first ? "Mileage history" : "Mileage history (continued)",
      );
      first = false;
      if (remaining.length === 0) break;
    }
  }

  const advisoryHeaderHeight = 26;
  const advisoryRowHeight = 32;

  const drawAdvisoryChunk = (
    flowState: Flow,
    chunk: typeof advisoryRows,
    title: string,
  ) => {
    const panelTop = flowState.y;
    const panelHeight =
      advisoryHeaderHeight + Math.max(1, chunk.length) * advisoryRowHeight;
    const panelBottom = panelTop - panelHeight;
    drawSection(
      flowState.page,
      MARGIN,
      panelBottom,
      CONTENT_WIDTH,
      panelHeight,
      AMBER_BG,
      advisoryHeaderHeight,
      rgb(1, 0.96, 0.84),
    );
    flowState.page.drawText(title, {
      x: MARGIN + 32,
      y: headerTitleY(panelBottom, panelHeight, advisoryHeaderHeight, 12),
      size: 12,
      font: bold,
      color: NAVY,
    });
    drawEmbeddedIcon(
      flowState.page,
      embeddedIcons,
      "warning",
      MARGIN + 12,
      headerIconY(panelBottom, panelHeight, advisoryHeaderHeight, 14),
      14,
    );
    const contentTop = panelTop - advisoryHeaderHeight;
    chunk.forEach((item, index) => {
      const centerY = rowCenterY(contentTop, index, advisoryRowHeight);
      if (index > 0) {
        drawInnerHLine(
          flowState.page,
          MARGIN,
          contentTop - index * advisoryRowHeight,
          CONTENT_WIDTH,
        );
      }
      drawEmbeddedIcon(
        flowState.page,
        embeddedIcons,
        "warning",
        MARGIN + 11,
        rowIconY(centerY, 15),
        15,
      );
      const typeColor =
        item.type === "MAJOR" || item.type === "DANGEROUS" ? RED : AMBER;
      const textX = MARGIN + 38;
      const textWidth = CONTENT_WIDTH - 52;
      flowState.page.drawText(fitText(item.type, bold, 8.6, textWidth), {
        x: textX,
        y: textY(centerY + 6, 8.6),
        size: 8.6,
        font: bold,
        color: typeColor,
      });
      flowState.page.drawText(
        fitText(
          item.date ? `${item.text} - ${formatDate(item.date)}` : item.text,
          regular,
          8.2,
          textWidth,
        ),
        {
          x: textX,
          y: textY(centerY - 8, 8.2),
          size: 8.2,
          font: regular,
          color: BODY,
        },
      );
    });
    flowState.y = panelBottom - FLOW_GAP;
  };

  {
    let remaining = [...advisoryRows];
    let first = true;
    while (remaining.length > 0) {
      const headerBlock = advisoryHeaderHeight;
      if (flow.y - (headerBlock + advisoryRowHeight) < FLOW_BOTTOM) {
        ensureSpace(
          flow,
          headerBlock + advisoryRowHeight,
          "Technical Evidence",
          "Advisories",
        );
      }
      const rowsThisPage = Math.max(
        1,
        Math.min(
          remaining.length,
          Math.floor((flow.y - FLOW_BOTTOM - headerBlock) / advisoryRowHeight),
        ),
      );
      const chunk = remaining.slice(0, rowsThisPage);
      remaining = remaining.slice(rowsThisPage);
      drawAdvisoryChunk(
        flow,
        chunk,
        first ? "Advisories / Notes" : "Advisories / Notes (continued)",
      );
      first = false;
    }
  }

  // --- Premium history: finance, write-off, stolen, mileage, keepers, recalls ---
  flow = startContentPage("Premium history details", "History & risk checks");

  const checks: Array<[string, string, string, ReportIconName]> = [
    ["Finance check", premium.finance.status, premium.finance.detail, "pound"],
    [
      "Write-off history",
      premium.writeOff.status,
      premium.writeOff.date
        ? `${premium.writeOff.detail} Recorded: ${formatDate(premium.writeOff.date)}`
        : premium.writeOff.detail,
      "warning",
    ],
    ["Stolen vehicle check", premium.stolen.status, premium.stolen.detail, "shield-check"],
    [
      "Mileage consistency",
      premium.mileageConsistency.status,
      premium.mileageConsistency.detail,
      "mileage",
    ],
  ];

  for (const item of checks) {
    const detailSize = 10;
    const detailLine = 13;
    const lines = wrapText(item[2], regular, detailSize, CONTENT_WIDTH - 36);
    const cardHeight = 26 + Math.max(30, 18 + lines.length * detailLine);
    ensureSpace(flow, cardHeight + FLOW_GAP, "Premium history details", "History & risk checks");
    const y = flow.y - cardHeight;
    const tone = statusTone(item[1]);
    drawSection(flow.page, MARGIN, y, CONTENT_WIDTH, cardHeight, WHITE, 26, tone.fill);
    drawEmbeddedIcon(
      flow.page,
      embeddedIcons,
      item[3],
      MARGIN + 12,
      headerIconY(y, cardHeight, 26, 14),
      14,
    );
    flow.page.drawText(item[0], {
      x: MARGIN + 38,
      y: headerTitleY(y, cardHeight, 26, 12),
      size: 12,
      font: bold,
      color: NAVY,
    });
    flow.page.drawText(item[1], {
      x: PAGE_WIDTH - MARGIN - 14 - bold.widthOfTextAtSize(item[1], 10),
      y: headerTitleY(y, cardHeight, 26, 10),
      size: 10,
      font: bold,
      color: tone.color,
    });
    lines.forEach((line, lineIndex) => {
      flow.page.drawText(line, {
        x: MARGIN + 18,
        y: y + cardHeight - 26 - 18 - lineIndex * detailLine,
        size: detailSize,
        font: regular,
        color: BODY,
      });
    });
    flow.y = y - FLOW_GAP;
  }

  const keeperEvents = premium.keepers.timeline;
  const keeperRowHeight = 28;
  const keeperHeaderHeight = 48;

  {
    let remaining = [...keeperEvents];
    let first = true;
    while (remaining.length > 0 || first) {
      const minHeight = keeperHeaderHeight + keeperRowHeight;
      ensureSpace(flow, minHeight, "Premium history details", "Previous keepers");
      const rowsThisPage = Math.max(
        1,
        Math.min(
          Math.max(remaining.length, 1),
          Math.floor((flow.y - FLOW_BOTTOM - keeperHeaderHeight) / keeperRowHeight),
        ),
      );
      const chunk =
        remaining.length === 0 ? [] : remaining.slice(0, rowsThisPage);
      if (remaining.length > 0) remaining = remaining.slice(rowsThisPage);
      const panelHeight =
        keeperHeaderHeight + Math.max(1, chunk.length) * keeperRowHeight;
      const panelTop = flow.y;
      const panelBottom = panelTop - panelHeight;
      drawSection(
        flow.page,
        MARGIN,
        panelBottom,
        CONTENT_WIDTH,
        panelHeight,
        WHITE,
        26,
      );
      drawEmbeddedIcon(
        flow.page,
        embeddedIcons,
        "user",
        MARGIN + 12,
        headerIconY(panelBottom, panelHeight, 26, 14),
        14,
      );
      flow.page.drawText(
        first ? "Previous keepers" : "Previous keepers (continued)",
        {
          x: MARGIN + 32,
          y: headerTitleY(panelBottom, panelHeight, 26, 12),
          size: 12,
          font: bold,
          color: NAVY,
        },
      );
      flow.page.drawText(`${premium.keepers.count} registered keepers`, {
        x: MARGIN + 14,
        y: panelTop - 40,
        size: 9,
        font: regular,
        color: MUTED,
      });
      if (chunk.length === 0) {
        flow.page.drawText("No keeper timeline available.", {
          x: MARGIN + 14,
          y: textY(panelTop - keeperHeaderHeight - keeperRowHeight / 2, 9),
          size: 9,
          font: regular,
          color: MUTED,
        });
      } else {
        chunk.forEach((event, index) => {
          const centerY =
            panelTop - keeperHeaderHeight - (index + 0.5) * keeperRowHeight;
          if (index > 0) {
            drawInnerHLine(
              flow.page,
              MARGIN,
              panelTop - keeperHeaderHeight - index * keeperRowHeight,
              CONTENT_WIDTH,
            );
          }
          flow.page.drawText(event.year, {
            x: MARGIN + 14,
            y: textY(centerY, 10),
            size: 10,
            font: bold,
            color: NAVY,
          });
          flow.page.drawText(fitText(event.label, regular, 9, CONTENT_WIDTH - 90), {
            x: MARGIN + 70,
            y: textY(centerY, 9),
            size: 9,
            font: regular,
            color: MUTED,
          });
        });
      }
      flow.y = panelBottom - FLOW_GAP;
      first = false;
      if (remaining.length === 0) break;
    }
  }

  const recallItems = vehicle.recalls.items;
  const recallRowHeight = 36;
  const recallHeaderHeight = 26;
  const CONTENT_FLOW_TOP = 715;

  {
    let remaining =
      recallItems.length > 0
        ? [...recallItems]
        : [{ title: "No manufacturer recalls in this sample.", date: "", status: "" }];
    let first = true;

    const sectionHeight = (rowCount: number) =>
      recallHeaderHeight + Math.max(1, rowCount) * recallRowHeight;
    const maxRowsOnFreshPage = Math.max(
      1,
      Math.floor((CONTENT_FLOW_TOP - FLOW_BOTTOM - recallHeaderHeight) / recallRowHeight),
    );

    // Prefer keeping the whole Recalls block on one page when it fits.
    const fullHeight = sectionHeight(remaining.length);
    if (flow.y - fullHeight < FLOW_BOTTOM && remaining.length <= maxRowsOnFreshPage) {
      const next = startContentPage("Premium history details", "Recalls");
      flow.page = next.page;
      flow.y = next.y;
    }

    while (remaining.length > 0) {
      const heightNeeded = sectionHeight(remaining.length);
      if (
        flow.y - heightNeeded < FLOW_BOTTOM &&
        remaining.length <= maxRowsOnFreshPage
      ) {
        const next = startContentPage(
          "Premium history details",
          first ? "Recalls" : "Recalls (continued)",
        );
        flow.page = next.page;
        flow.y = next.y;
      } else if (flow.y - (recallHeaderHeight + recallRowHeight) < FLOW_BOTTOM) {
        const next = startContentPage(
          "Premium history details",
          first ? "Recalls" : "Recalls (continued)",
        );
        flow.page = next.page;
        flow.y = next.y;
      }

      const rowsThisPage = Math.max(
        1,
        Math.min(
          remaining.length,
          Math.floor((flow.y - FLOW_BOTTOM - recallHeaderHeight) / recallRowHeight),
        ),
      );
      const chunk = remaining.slice(0, rowsThisPage);
      remaining = remaining.slice(rowsThisPage);
      const panelHeight = recallHeaderHeight + chunk.length * recallRowHeight;
      const panelTop = flow.y;
      const panelBottom = panelTop - panelHeight;
      drawSection(
        flow.page,
        MARGIN,
        panelBottom,
        CONTENT_WIDTH,
        panelHeight,
        WHITE,
        recallHeaderHeight,
      );
      drawEmbeddedIcon(
        flow.page,
        embeddedIcons,
        "clipboard",
        MARGIN + 12,
        headerIconY(panelBottom, panelHeight, recallHeaderHeight, 14),
        14,
      );
      flow.page.drawText(first ? "Recalls" : "Recalls (continued)", {
        x: MARGIN + 32,
        y: headerTitleY(panelBottom, panelHeight, recallHeaderHeight, 12),
        size: 12,
        font: bold,
        color: NAVY,
      });
      chunk.forEach((item, index) => {
        const topY = panelTop - recallHeaderHeight - index * recallRowHeight;
        if (index > 0) {
          drawInnerHLine(flow.page, MARGIN, topY, CONTENT_WIDTH);
        }
        flow.page.drawText(fitText(item.title, bold, 10, CONTENT_WIDTH - 40), {
          x: MARGIN + 14,
          y: topY - 14,
          size: 10,
          font: bold,
          color: NAVY,
        });
        flow.page.drawText(
          [item.status, item.date ? formatDate(item.date) : null]
            .filter(Boolean)
            .join("  |  ") || "Not available",
          {
            x: MARGIN + 14,
            y: topY - 28,
            size: 8.5,
            font: regular,
            color: MUTED,
          },
        );
      });
      flow.y = panelBottom - FLOW_GAP;
      first = false;
    }
  }

  const finalPageCount = allPages.length;
  allPages.forEach((page, index) => {
    footer(page, regular, bold, index + 1, finalPageCount);
  });

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
