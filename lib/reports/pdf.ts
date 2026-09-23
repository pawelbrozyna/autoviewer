import {
  PDFArray,
  PDFDocument,
  PDFName,
  PDFString,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFImage,
  type PDFPage,
} from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { FULL_REPORT_PRICE, fullReportHref } from "@/lib/full-report";
import {
  FREE_ADVISORY_LIMIT,
  FREE_MILEAGE_LIMIT,
  FREE_SPEC_LIMIT,
  advisoryRowsForPdf,
  collectAdvisories,
  mileageRowsForPdf,
  motRowsForFreePdf,
} from "@/lib/reports/pdf-limits";
import { absoluteUrl } from "@/lib/seo/metadata";
import type { MotTest, VehicleRecord } from "@/types/vehicle";

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
const YELLOW = rgb(0.98, 0.8, 0.14);
const WHITE = rgb(1, 1, 1);
const BLACK = rgb(0, 0, 0);

export type VehicleReportPdfOptions = {
  ownersLabel?: string | null;
  imagePng?: Uint8Array | null;
  generatedAt?: Date;
  baseUrl?: string;
  iconPngs?: Partial<Record<ReportIconName, Uint8Array>>;
  plateFontBytes?: Uint8Array | null;
};

const REPORT_ICON_NAMES = [
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

export type ReportIconName = (typeof REPORT_ICON_NAMES)[number];

function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      line = next;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function fitText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;
  let value = text;
  while (
    value.length > 1 &&
    font.widthOfTextAtSize(`${value}...`, size) > maxWidth
  ) {
    value = value.slice(0, -1);
  }
  return `${value.trim()}...`;
}

function formatDate(value?: string | null): string {
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

function drawCard(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  options?: { fill?: ReturnType<typeof rgb>; border?: ReturnType<typeof rgb> },
) {
  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: options?.fill ?? WHITE,
    borderColor: options?.border ?? BORDER,
    borderWidth: 0.8,
  });
}

function drawRoundedPanel(
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
  options?: {
    fill?: ReturnType<typeof rgb>;
    headerHeight?: number;
    headerFill?: ReturnType<typeof rgb>;
    border?: ReturnType<typeof rgb>;
  },
) {
  const fill = options?.fill ?? WHITE;
  const border = options?.border ?? BORDER;
  const headerHeight = options?.headerHeight ?? 0;
  const radius = 6;
  const stroke = 0.7;
  drawRoundedPanel(page, x, y, width, height, border, radius);
  drawRoundedPanel(
    page,
    x + stroke,
    y + stroke,
    width - stroke * 2,
    height - stroke * 2,
    fill,
    Math.max(1, radius - stroke),
  );
  if (headerHeight > 0) {
    const headerFill = options?.headerFill ?? SOFT;
    const innerX = x + stroke;
    const innerWidth = width - stroke * 2;
    const headerBottom = y + height - headerHeight;
    const headerRadius = Math.max(1, radius - stroke);
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
    for (const cx of [innerX + headerRadius, innerX + innerWidth - headerRadius]) {
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

function drawInnerHLine(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
) {
  page.drawLine({
    start: { x, y },
    end: { x: x + width, y },
    thickness: 0.5,
    color: INNER_LINE,
  });
}

function drawInnerVLine(
  page: PDFPage,
  x: number,
  y: number,
  height: number,
) {
  page.drawLine({
    start: { x, y },
    end: { x, y: y + height },
    thickness: 0.5,
    color: INNER_LINE,
  });
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

function rowCenterY(
  contentTop: number,
  row: number,
  rowHeight: number,
) {
  return contentTop - (row + 0.5) * rowHeight;
}

function drawUnlockCta(
  pdf: PDFDocument,
  page: PDFPage,
  bold: PDFFont,
  icons: Partial<Record<ReportIconName, PDFImage>>,
  y: number,
  url: string,
) {
  const width = 220;
  const height = 28;
  const x = MARGIN + (CONTENT_WIDTH - width) / 2;
  drawRoundedPanel(page, x, y, width, height, BLUE, 6);
  const label = `Unlock Full Report - ${FULL_REPORT_PRICE}`;
  const labelWidth = bold.widthOfTextAtSize(label, 10.5);
  page.drawText(label, {
    x: x + (width - labelWidth) / 2 + 8,
    y: textY(y + height / 2, 10.5),
    size: 10.5,
    font: bold,
    color: WHITE,
  });
  drawEmbeddedIcon(page, icons, "lock-white", x + 14, y + (height - 13) / 2, 13);
  addLink(pdf, page, { x, y, width, height }, url);
}

function drawWordmark(page: PDFPage, bold: PDFFont, x: number, y: number) {
  const size = 22;
  page.drawText("Auto", { x, y, size, font: bold, color: NAVY });
  page.drawText("Viewer", {
    x: x + bold.widthOfTextAtSize("Auto", size),
    y,
    size,
    font: bold,
    color: BLUE,
  });
}

function drawFooter(
  page: PDFPage,
  regular: PDFFont,
  bold: PDFFont,
  pageNumber: number,
  pageCount = 2,
) {
  page.drawLine({
    start: { x: MARGIN, y: 42 },
    end: { x: PAGE_WIDTH - MARGIN, y: 42 },
    thickness: 0.6,
    color: BORDER,
  });
  const footerSize = 10;
  page.drawText("Auto", {
    x: MARGIN,
    y: 25,
    size: footerSize,
    font: bold,
    color: NAVY,
  });
  page.drawText("Viewer", {
    x: MARGIN + bold.widthOfTextAtSize("Auto", footerSize),
    y: 25,
    size: footerSize,
    font: bold,
    color: BLUE,
  });
  page.drawText("Vehicle history checks you can trust.", {
    x: MARGIN,
    y: 14,
    size: 6.5,
    font: regular,
    color: MUTED,
  });
  const disclaimer =
    "Summary report only. Confirm important details before buying.";
  page.drawText(disclaimer, {
    x: (PAGE_WIDTH - regular.widthOfTextAtSize(disclaimer, 6.5)) / 2,
    y: 25,
    size: 6.5,
    font: regular,
    color: MUTED,
  });
  const pageLabel = `Page ${pageNumber} of ${pageCount}`;
  page.drawText(pageLabel, {
    x: PAGE_WIDTH - MARGIN - regular.widthOfTextAtSize(pageLabel, 6.5),
    y: 14,
    size: 6.5,
    font: regular,
    color: MUTED,
  });
}

function addLink(
  pdf: PDFDocument,
  page: PDFPage,
  rect: { x: number; y: number; width: number; height: number },
  url: string,
) {
  const annotation = pdf.context.register(
    pdf.context.obj({
      Type: "Annot",
      Subtype: "Link",
      Rect: [rect.x, rect.y, rect.x + rect.width, rect.y + rect.height],
      Border: [0, 0, 0],
      A: {
        Type: "Action",
        S: "URI",
        URI: PDFString.of(url),
      },
    }),
  );
  let annotations = page.node.lookupMaybe(PDFName.of("Annots"), PDFArray);
  if (!annotations) {
    annotations = pdf.context.obj([]);
    page.node.set(PDFName.of("Annots"), annotations);
  }
  annotations.push(annotation);
}

function drawLock(page: PDFPage, x: number, y: number) {
  page.drawRectangle({
    x,
    y,
    width: 10,
    height: 8,
    color: NAVY,
  });
  page.drawLine({
    start: { x: x + 2, y: y + 8 },
    end: { x: x + 2, y: y + 12 },
    thickness: 1.1,
    color: NAVY,
  });
  page.drawLine({
    start: { x: x + 8, y: y + 8 },
    end: { x: x + 8, y: y + 12 },
    thickness: 1.1,
    color: NAVY,
  });
  page.drawLine({
    start: { x: x + 2, y: y + 12 },
    end: { x: x + 8, y: y + 12 },
    thickness: 1.1,
    color: NAVY,
  });
  page.drawCircle({ x: x + 5, y: y + 4, size: 1, color: WHITE });
}

function drawCheck(page: PDFPage, x: number, y: number, filled = true) {
  page.drawCircle({
    x,
    y,
    size: 6,
    color: filled ? BLUE : WHITE,
    borderColor: filled ? BLUE : GREEN,
    borderWidth: 1,
  });
  page.drawLine({
    start: { x: x - 3, y },
    end: { x: x - 1, y: y - 2 },
    thickness: 1.2,
    color: filled ? WHITE : GREEN,
  });
  page.drawLine({
    start: { x: x - 1, y: y - 2 },
    end: { x: x + 3, y: y + 3 },
    thickness: 1.2,
    color: filled ? WHITE : GREEN,
  });
}

function drawFactIcon(page: PDFPage, x: number, y: number, index: number) {
  const line = NAVY;
  if (index === 1 || index === 8) {
    page.drawCircle({ x, y, size: 5, borderColor: line, borderWidth: 1 });
    page.drawLine({
      start: { x, y },
      end: { x: x + 3, y: y + 3 },
      thickness: 1,
      color: line,
    });
  } else if (index === 2 || index === 6) {
    page.drawRectangle({
      x: x - 5,
      y: y - 5,
      width: 10,
      height: 10,
      borderColor: line,
      borderWidth: 1,
    });
    page.drawLine({
      start: { x: x - 5, y: y + 2 },
      end: { x: x + 5, y: y + 2 },
      thickness: 0.8,
      color: line,
    });
  } else if (index === 4) {
    page.drawRectangle({
      x: x - 5,
      y: y - 2,
      width: 10,
      height: 5,
      borderColor: line,
      borderWidth: 1,
    });
    page.drawCircle({ x: x - 3, y: y - 3, size: 1.5, color: line });
    page.drawCircle({ x: x + 3, y: y - 3, size: 1.5, color: line });
  } else if (index === 3) {
    page.drawRectangle({
      x: x - 6,
      y: y - 4,
      width: 12,
      height: 8,
      borderColor: line,
      borderWidth: 1,
    });
    page.drawCircle({ x: x - 3, y: y, size: 1.3, color: line });
    page.drawCircle({ x: x + 3, y, size: 1.3, color: line });
  } else if (index === 5 || index === 7) {
    page.drawCircle({ x: x - 1, y, size: 4.5, borderColor: line, borderWidth: 1 });
    page.drawLine({
      start: { x: x - 4, y: y - 4 },
      end: { x: x + 4, y: y + 4 },
      thickness: 1,
      color: line,
    });
  } else if (index === 9) {
    drawCheck(page, x, y, true);
  } else {
    page.drawLine({
      start: { x: x - 5, y: y - 4 },
      end: { x, y: y + 5 },
      thickness: 1,
      color: line,
    });
    page.drawLine({
      start: { x, y: y + 5 },
      end: { x: x + 5, y: y - 4 },
      thickness: 1,
      color: line,
    });
    page.drawLine({
      start: { x: x + 5, y: y - 4 },
      end: { x: x - 5, y: y - 4 },
      thickness: 1,
      color: line,
    });
  }
}

async function imageUrlToPng(url: string): Promise<Uint8Array | null> {
  if (
    typeof window === "undefined" ||
    typeof createImageBitmap === "undefined"
  ) {
    return null;
  }
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const bitmap = await createImageBitmap(await response.blob());
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.drawImage(bitmap, 0, 0);
    bitmap.close();
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    let minX = canvas.width;
    let minY = canvas.height;
    let maxX = 0;
    let maxY = 0;
    for (let y = 0; y < canvas.height; y += 2) {
      for (let x = 0; x < canvas.width; x += 2) {
        const offset = (y * canvas.width + x) * 4;
        const visible =
          pixels.data[offset + 3] > 10 &&
          (pixels.data[offset] < 246 ||
            pixels.data[offset + 1] < 246 ||
            pixels.data[offset + 2] < 246);
        if (!visible) continue;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
    const hasVehicleBounds = maxX > minX && maxY > minY;
    const padding = 8;
    const cropX = hasVehicleBounds ? Math.max(0, minX - padding) : 0;
    const cropY = hasVehicleBounds ? Math.max(0, minY - padding) : 0;
    const cropWidth = hasVehicleBounds
      ? Math.min(canvas.width - cropX, maxX - minX + padding * 2)
      : canvas.width;
    const cropHeight = hasVehicleBounds
      ? Math.min(canvas.height - cropY, maxY - minY + padding * 2)
      : canvas.height;
    const output = document.createElement("canvas");
    output.width = cropWidth;
    output.height = cropHeight;
    const outputContext = output.getContext("2d");
    if (!outputContext) return null;
    outputContext.drawImage(
      canvas,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight,
    );
    const blob = await new Promise<Blob | null>((resolve) =>
      output.toBlob(resolve, "image/png"),
    );
    return blob ? new Uint8Array(await blob.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

async function loadReportIconPngs(): Promise<
  Partial<Record<ReportIconName, Uint8Array>>
> {
  if (typeof window === "undefined") return {};
  const entries = await Promise.all(
    REPORT_ICON_NAMES.map(async (name) => {
      try {
        const response = await fetch(`/report-icons/${name}.png`);
        if (!response.ok) return null;
        return [name, new Uint8Array(await response.arrayBuffer())] as const;
      } catch {
        return null;
      }
    }),
  );
  const icons: Partial<Record<ReportIconName, Uint8Array>> = {};
  entries.forEach((entry) => {
    if (entry) icons[entry[0]] = entry[1];
  });
  return icons;
}

async function loadPlateFontBytes(): Promise<Uint8Array | null> {
  if (typeof window === "undefined") return null;
  try {
    const response = await fetch("/fonts/BarlowCondensed-SemiBold.ttf");
    return response.ok
      ? new Uint8Array(await response.arrayBuffer())
      : null;
  } catch {
    return null;
  }
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

function reportSummary(vehicle: VehicleRecord): {
  title: string;
  detail: string;
  positive: boolean;
} {
  const issues: string[] = [];
  if (vehicle.summary.motStatus.status === "Expired") issues.push("MOT");
  if (
    vehicle.summary.tax.status === "Untaxed" ||
    vehicle.summary.tax.status === "SORN"
  ) {
    issues.push("tax");
  }
  if (vehicle.recalls.dataAvailable !== false && vehicle.recalls.hasOpenRecalls) {
    issues.push("recall");
  }
  if (issues.length > 0) {
    return {
      title: "Items need attention",
      detail: `Review the available ${issues.join(", ")} information below.`,
      positive: false,
    };
  }
  const coreAvailable =
    vehicle.summary.motStatus.status !== "Unknown" &&
    vehicle.summary.tax.status !== "Unknown";
  return {
    title: coreAvailable
      ? "No immediate issues indicated"
      : "Available checks completed",
    detail:
      "Based only on the free public and demonstration data shown in this report.",
    positive: coreAvailable,
  };
}

function checkedItems(
  vehicle: VehicleRecord,
): Array<{ title: string; detail: string }> {
  const { summary } = vehicle;
  return [
    vehicle.dataQuality.sources.includes("DVLA") ||
    vehicle.dataQuality.sources.includes("MOCK")
      ? {
          title: "DVLA registration details",
          detail: "Make, model, colour and status",
        }
      : null,
    summary.motStatus.status !== "Unknown"
      ? { title: "MOT status", detail: "Current status and history" }
      : null,
    summary.tax.status !== "Unknown"
      ? { title: "Tax status", detail: "Vehicle tax and due date" }
      : null,
    vehicle.mileageHistory.length > 1
      ? { title: "Mileage consistency", detail: "Checked for irregularities" }
      : null,
    summary.make && summary.make !== "Unknown"
      ? {
          title: "Vehicle identity basics",
          detail: "Make, model and engine details",
        }
      : null,
    vehicle.motTests.length > 0
      ? { title: "MOT advisories", detail: "Notable advisories from past tests" }
      : null,
  ].filter(
    (item): item is { title: string; detail: string } => Boolean(item),
  );
}

function reportUrl(registration: string, baseUrl?: string): string {
  const path = fullReportHref(registration);
  if (baseUrl) return new URL(path, baseUrl).toString();
  return absoluteUrl(path);
}

export async function generateVehicleReportPdf(
  vehicle: VehicleRecord,
  options: VehicleReportPdfOptions = {},
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
  const page1 = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const page2 = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const { summary, details } = vehicle;
  const generatedAt = options.generatedAt ?? new Date();
  const generatedDate = generatedAt.toLocaleDateString("en-GB");
  const reportId = `AV-${summary.registration}-${generatedAt
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "")}`;
  const upgradeUrl = reportUrl(summary.registration, options.baseUrl);

  drawWordmark(page1, bold, MARGIN, 797);
  const tagline = "CLEARER CARS. BRIGHTER DECISIONS.";
  page1.drawText(tagline, {
    x: MARGIN,
    y: 785,
    size: 6.2,
    font: regular,
    color: MUTED,
  });
  const reportTitle = "Vehicle Report";
  page1.drawText(reportTitle, {
    x: PAGE_WIDTH - MARGIN - bold.widthOfTextAtSize(reportTitle, 15),
    y: 800,
    size: 15,
    font: bold,
    color: NAVY,
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
  const metadata = [`Report ID  ${reportId}`, `Generated  ${generatedDate}`];
  metadata.forEach((line, index) => {
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

  drawCard(page1, MARGIN, 603, CONTENT_WIDTH, 150, {
    fill: WHITE,
    border: WHITE,
  });

  const imageBytes =
    options.imagePng ??
    (summary.imageSrc ? await imageUrlToPng(summary.imageSrc) : null);
  if (imageBytes) {
    const image = await pdf.embedPng(imageBytes);
    const dimensions = image.scaleToFit(275.5, 142.5);
    page1.drawImage(image, {
      x: 552 - dimensions.width,
      y: 594 + (150 - dimensions.height) / 2,
      width: dimensions.width,
      height: dimensions.height,
    });
  } else {
    page1.drawText("Representative image unavailable", {
      x: 348,
      y: 660,
      size: 9,
      font: regular,
      color: MUTED,
    });
  }

  const vehicleTitle = [
    summary.year,
    summary.make,
    summary.model,
  ]
    .filter(Boolean)
    .join(" ");
  // Drawn after the image so the title sits on top; one line across the hero.
  const titleSize = 17;
  const titleMaxWidth = PAGE_WIDTH - MARGIN - 12 - 20;
  page1.drawText(fitText(vehicleTitle, bold, titleSize, titleMaxWidth), {
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
  const plateTextWidth = plateFont.widthOfTextAtSize(
    plateText,
    plateFontSize,
  );
  const plateTextFullHeight = plateFont.heightAtSize(plateFontSize, {
    descender: true,
  });
  drawRoundedPanel(page1, plateX, plateY, plateWidth, plateHeight, BLACK, 5);
  drawRoundedPanel(
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
    y:
      plateY +
      (plateHeight - plateTextFullHeight) / 2 +
      6,
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

  const summaryResult = reportSummary(vehicle);
  const summaryY = 543;
  const summaryIconSize = 30.8;
  drawSection(page1, MARGIN, summaryY, CONTENT_WIDTH, 52, {
    fill: summaryResult.positive ? GREEN_BG : AMBER_BG,
  });
  page1.drawText(`Summary: ${summaryResult.title}`, {
    x: 88,
    y: textY(569, 13) + 5,
    size: 13,
    font: bold,
    color: summaryResult.positive ? GREEN : NAVY,
  });
  const hasSummaryIcon = drawEmbeddedIcon(
    page1,
    embeddedIcons,
    summaryResult.positive ? "check" : "warning",
    50,
    554,
    summaryIconSize,
  );
  if (!hasSummaryIcon) {
    page1.drawCircle({
      x: 65,
      y: 569,
      size: 15.4,
      color: summaryResult.positive ? GREEN : AMBER,
    });
  }
  if (!hasSummaryIcon && summaryResult.positive) {
    page1.drawLine({
      start: { x: 59, y: 569 },
      end: { x: 63, y: 565 },
      thickness: 2,
      color: WHITE,
    });
    page1.drawLine({
      start: { x: 63, y: 565 },
      end: { x: 71, y: 574 },
      thickness: 2,
      color: WHITE,
    });
  } else if (!hasSummaryIcon) {
    page1.drawText("!", {
      x: 63,
      y: 563,
      size: 14,
      font: bold,
      color: WHITE,
    });
  }
  page1.drawText(fitText(summaryResult.detail, regular, 8.3, 430), {
    x: 88,
    y: textY(569, 8.3) - 8,
    size: 8.3,
    font: regular,
    color: MUTED,
  });

  const factsY = 370;
  const factsHeight = 156;
  const factsHeaderHeight = 26;
  const factsRowHeight = 26;
  drawSection(page1, MARGIN, factsY, CONTENT_WIDTH, factsHeight, {
    fill: WHITE,
    headerHeight: factsHeaderHeight,
  });
  page1.drawText("Key facts", {
    x: 48,
    y: headerTitleY(factsY, factsHeight, factsHeaderHeight, 12.5),
    size: 12.5,
    font: bold,
    color: NAVY,
  });
  const facts = [
    ["MOT status", summary.motStatus.status],
    ["Mileage", summary.latestMileage != null ? `${summary.latestMileage.toLocaleString("en-GB")} miles` : "Not available"],
    ["MOT expiry date", formatDate(summary.motStatus.expiryDate)],
    ["Engine size", summary.engineCapacity != null ? `${summary.engineCapacity.toLocaleString("en-GB")} cc` : "Not available"],
    ["Tax status", summary.tax.status],
    ["CO2 emissions", details.co2Emissions != null ? `${details.co2Emissions} g/km` : "Not available"],
    ["Tax due date", formatDate(summary.tax.dueDate)],
    ["Euro status", details.euroStatus ?? "Not available"],
    ["Overall score", vehicle.buyerScore?.score != null ? `${vehicle.buyerScore.score}/100` : "Not available"],
    ["ULEZ status", "Not checked"],
  ];
  const factIcons: ReportIconName[] = [
    "shield-check",
    "mileage",
    "calendar",
    "engine",
    "car",
    "co2",
    "calendar",
    "leaf",
    "info",
    "check",
  ];
  const factColumnWidth = CONTENT_WIDTH / 2;
  const factsContentTop = factsY + factsHeight - factsHeaderHeight;
  facts.forEach(([label, value], index) => {
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
    if (
      !drawEmbeddedIcon(
        page1,
        embeddedIcons,
        factIcons[index],
        baseX + 11,
        centerY - 7,
        14,
      )
    ) {
      drawFactIcon(page1, baseX + 18, centerY + 2, index);
    }
    page1.drawText(label, {
      x: baseX + 34,
      y: textY(centerY, 8.6),
      size: 8.6,
      font: regular,
      color: MUTED,
    });
    page1.drawText(fitText(value, bold, 9.2, 92), {
      x: baseX + factColumnWidth - 105,
      y: textY(centerY, 9.2),
      size: 9.2,
      font: bold,
      color:
        value === "Valid" || value === "Taxed" || value === "Yes"
          ? GREEN
          : NAVY,
    });
  });

  const leftX = MARGIN;
  const leftWidth = CONTENT_WIDTH;
  const rightX = MARGIN;
  const rightWidth = CONTENT_WIDTH;
  const checksY = 230;
  const checksHeight = 128;
  const checksHeaderHeight = 26;
  const checksRowHeight = 34;
  drawSection(page1, leftX, checksY, leftWidth, checksHeight, {
    fill: WHITE,
    headerHeight: checksHeaderHeight,
  });
  page1.drawText("What we checked", {
    x: leftX + 12,
    y: headerTitleY(checksY, checksHeight, checksHeaderHeight, 12.5),
    size: 12.5,
    font: bold,
    color: NAVY,
  });
  const checks = checkedItems(vehicle);
  const checksContentTop = checksY + checksHeight - checksHeaderHeight;
  checks.slice(0, 6).forEach((item, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = leftX + 22 + column * (leftWidth / 2);
    const centerY = rowCenterY(checksContentTop, row, checksRowHeight);
    if (column === 0 && row === 0) {
      drawInnerVLine(
        page1,
        leftX + leftWidth / 2,
        checksY,
        checksHeight - checksHeaderHeight,
      );
    }
    if (column === 0 && row > 0) {
      drawInnerHLine(
        page1,
        leftX,
        checksContentTop - row * checksRowHeight,
        leftWidth,
      );
    }
    if (
      !drawEmbeddedIcon(page1, embeddedIcons, "check", x - 6, centerY - 5, 13)
    ) {
      drawCheck(page1, x, centerY + 3);
    }
    page1.drawText(item.title, {
      x: x + 14,
      y: textY(centerY + 5, 9),
      size: 9,
      font: bold,
      color: NAVY,
    });
    page1.drawText(fitText(item.detail, regular, 7.5, 200), {
      x: x + 14,
      y: textY(centerY - 6, 7.5),
      size: 7.5,
      font: regular,
      color: MUTED,
    });
  });

  const premiumHeaderHeight = 26;
  const premiumRowHeight = 29;
  const premiumHeight = premiumHeaderHeight + premiumRowHeight * 3 + 8;
  const premiumY = 218 - premiumHeight;
  drawSection(page1, rightX, premiumY, rightWidth, premiumHeight, {
    fill: AMBER_BG,
    headerHeight: premiumHeaderHeight,
    headerFill: rgb(1, 0.96, 0.84),
  });
  page1.drawText("More available in Full Report", {
    x: rightX + 12,
    y: headerTitleY(premiumY, premiumHeight, premiumHeaderHeight, 12.5),
    size: 12.5,
    font: bold,
    color: NAVY,
  });
  page1.drawText(FULL_REPORT_PRICE, {
    x:
      rightX +
      rightWidth -
      15 -
      bold.widthOfTextAtSize(FULL_REPORT_PRICE, 13),
    y: headerTitleY(premiumY, premiumHeight, premiumHeaderHeight, 13),
    size: 13,
    font: bold,
    color: NAVY,
  });
  page1.drawText("COMING SOON", {
    x: rightX + 225,
    y: headerTitleY(premiumY, premiumHeight, premiumHeaderHeight, 6.5),
    size: 6.5,
    font: bold,
    color: AMBER,
  });
  const lockedItems = [
    ["Finance check", "Outstanding finance, hire purchase"],
    ["Write-off check", "Insurance write-off history"],
    ["Stolen check", "Stolen vehicle database check"],
    ["Previous owners", "Number of keepers and history"],
    ["Keeper changes", "Timeline of registered keepers"],
    ["Recall check", "Manufacturer safety recalls"],
  ] as const;
  const premiumIcons: ReportIconName[] = [
    "pound",
    "document",
    "car",
    "user",
    "history",
    "wrench",
  ];
  const premiumContentTop = premiumY + premiumHeight - premiumHeaderHeight;
  lockedItems.forEach((item, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const cellWidth = rightWidth / 2;
    const x = rightX + 16 + column * cellWidth;
    const centerY = rowCenterY(premiumContentTop, row, premiumRowHeight);
    if (column === 0 && row === 0) {
      drawInnerVLine(
        page1,
        rightX + rightWidth / 2,
        premiumY,
        premiumHeight - premiumHeaderHeight,
      );
    }
    if (column === 0 && row > 0) {
      drawInnerHLine(
        page1,
        rightX,
        premiumContentTop - row * premiumRowHeight,
        rightWidth,
      );
    }
    if (!drawEmbeddedIcon(page1, embeddedIcons, premiumIcons[index], x - 1, centerY - 6, 13)) {
      drawLock(page1, x, centerY);
    }
    page1.drawText(fitText(item[0], bold, 8.5, cellWidth - 20), {
      x: x + 18,
      y: textY(centerY + 5, 8.5),
      size: 8.5,
      font: bold,
      color: NAVY,
    });
    page1.drawText(fitText(item[1], regular, 6.9, cellWidth - 20), {
      x: x + 18,
      y: textY(centerY - 6, 6.9),
      size: 6.9,
      font: regular,
      color: MUTED,
    });
    addLink(pdf, page1, { x, y: centerY - 14, width: cellWidth - 5, height: 28 }, upgradeUrl);
  });
  drawUnlockCta(pdf, page1, bold, embeddedIcons, 52, upgradeUrl);
  drawFooter(page1, regular, bold, 1);

  drawWordmark(page2, bold, MARGIN, 797);
  page2.drawText("CLEARER CARS. BRIGHTER DECISIONS.", {
    x: MARGIN,
    y: 785,
    size: 6.2,
    font: regular,
    color: MUTED,
  });
  const technicalTitle = "Technical Evidence";
  page2.drawText(technicalTitle, {
    x:
      PAGE_WIDTH -
      MARGIN -
      bold.widthOfTextAtSize(technicalTitle, 13),
    y: 800,
    size: 13,
    font: bold,
    color: NAVY,
  });
  const technicalMeta = `${summary.displayRegistration}  |  Page 2`;
  page2.drawText(technicalMeta, {
    x:
      PAGE_WIDTH -
      MARGIN -
      regular.widthOfTextAtSize(technicalMeta, 7.5),
    y: 783,
    size: 7.5,
    font: regular,
    color: MUTED,
  });
  page2.drawLine({
    start: { x: MARGIN, y: 765 },
    end: { x: PAGE_WIDTH - MARGIN, y: 765 },
    thickness: 1.4,
    color: BLUE,
  });
  page2.drawText("MOT History & Vehicle Details", {
    x: MARGIN,
    y: 735,
    size: 17.5,
    font: bold,
    color: NAVY,
  });
  page2.drawRectangle({
    x: PAGE_WIDTH - MARGIN - 132,
    y: 721,
    width: 132,
    height: 32,
    color: SOFT,
  });
  page2.drawText(summary.displayRegistration, {
    x: PAGE_WIDTH - MARGIN - 122,
    y: 739,
    size: 10,
    font: bold,
    color: NAVY,
  });
  page2.drawText(
    fitText(`${summary.year ?? ""} ${summary.make} ${summary.model}`, regular, 6.8, 112),
    {
      x: PAGE_WIDTH - MARGIN - 122,
      y: 728,
      size: 6.8,
      font: regular,
      color: MUTED,
    },
  );

  const motSlice = motRowsForFreePdf(vehicle.motTests);
  const motRows = motSlice.shown;
  const motTop = 710;
  const motHeaderHeight = 26;
  const motColHeaderHeight = 22;
  const motRowHeight = 24;
  const motNoteHeight = motSlice.note ? 16 : 0;
  const motPanelBottom =
    motTop -
    motHeaderHeight -
    motColHeaderHeight -
    Math.max(1, motRows.length) * motRowHeight -
    motNoteHeight;
  const motPanelHeight = motTop - motPanelBottom;
  drawSection(page2, MARGIN, motPanelBottom, CONTENT_WIDTH, motPanelHeight, {
    fill: WHITE,
    headerHeight: motHeaderHeight,
  });
  page2.drawText("MOT history", {
    x: 48,
    y: headerTitleY(motPanelBottom, motPanelHeight, motHeaderHeight, 12.5),
    size: 12.5,
    font: bold,
    color: NAVY,
  });
  const columns = [
    { title: "Date", x: 51, width: 84 },
    { title: "Result", x: 140, width: 60 },
    { title: "Mileage", x: 205, width: 95 },
    { title: "Notes", x: 305, width: 238 },
  ];
  const motColHeaderY = motTop - motHeaderHeight - motColHeaderHeight;
  const motInset = 0.8;
  page2.drawRectangle({
    x: MARGIN + motInset,
    y: motColHeaderY,
    width: CONTENT_WIDTH - motInset * 2,
    height: motColHeaderHeight,
    color: SOFT,
  });
  drawInnerHLine(page2, MARGIN + motInset, motColHeaderY, CONTENT_WIDTH - motInset * 2);
  const motColHeaderCenter = motColHeaderY + motColHeaderHeight / 2;
  columns.forEach((column) => {
    page2.drawText(column.title.toUpperCase(), {
      x: column.x,
      y: textY(motColHeaderCenter, 8),
      size: 8,
      font: bold,
      color: MUTED,
    });
  });
  const motBodyHeight = motColHeaderY + motColHeaderHeight - motPanelBottom;
  drawInnerVLine(page2, MARGIN + motInset, motPanelBottom + motInset, motBodyHeight - motInset);
  drawInnerVLine(
    page2,
    MARGIN + CONTENT_WIDTH - motInset,
    motPanelBottom + motInset,
    motBodyHeight - motInset,
  );
  for (const x of [135, 200, 300]) {
    drawInnerVLine(page2, x, motPanelBottom + motInset, motBodyHeight - motInset);
  }
  const motContentTop = motColHeaderY;
  if (motRows.length === 0) {
    page2.drawText("MOT history is not available from the connected source.", {
      x: 51,
      y: textY(rowCenterY(motContentTop, 0, motRowHeight), 9),
      size: 9,
      font: regular,
      color: MUTED,
    });
  } else {
    motRows.forEach((test, index) => {
      const centerY = rowCenterY(motContentTop, index, motRowHeight);
      if (index > 0) {
        drawInnerHLine(
          page2,
          MARGIN + motInset,
          motContentTop - index * motRowHeight,
          CONTENT_WIDTH - motInset * 2,
        );
      }
      page2.drawText(formatDate(test.completedDate), {
        x: columns[0].x,
        y: textY(centerY, 9.4),
        size: 9.4,
        font: regular,
        color: NAVY,
      });
      page2.drawText(test.testResult, {
        x: columns[1].x,
        y: textY(centerY, 9.4),
        size: 9.4,
        font: bold,
        color:
          test.testResult === "PASS"
            ? GREEN
            : test.testResult === "FAIL"
              ? rgb(0.75, 0.1, 0.12)
              : AMBER,
      });
      page2.drawText(
        test.odometerValue != null
          ? `${test.odometerValue.toLocaleString("en-GB")} mi`
          : "Not available",
        {
          x: columns[2].x,
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
      page2.drawText(fitText(note, regular, 9.1, columns[3].width), {
        x: columns[3].x,
        y: textY(centerY, 9.1),
        size: 9.1,
        font: regular,
        color: MUTED,
      });
    });
  }
  if (motSlice.note) {
    page2.drawText(motSlice.note, {
      x: 51,
      y: motPanelBottom + 6,
      size: 7.5,
      font: regular,
      color: MUTED,
    });
  }

  const advisoryItems = collectAdvisories(vehicle);
  const mileageSlice = mileageRowsForPdf(
    [...vehicle.mileageHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    ),
    FREE_MILEAGE_LIMIT,
  );
  const mileageRows = mileageSlice.shown;
  const advisorySource = [
    ...(advisoryItems.length > 0
      ? advisoryItems
      : [
          {
            date: "",
            type: "No advisories recorded",
            text: "No MOT advisories are shown in the available history.",
          },
        ]),
    ...(vehicle.recalls.dataAvailable !== false &&
    vehicle.recalls.hasOpenRecalls
      ? vehicle.recalls.items.map((item) => ({
          date: item.date ?? "",
          type: "Open recall",
          text: item.title,
        }))
      : []),
    ...(vehicle.buyerScore?.score != null
      ? [
          {
            date: "",
            type: `Buyer Score ${vehicle.buyerScore.score}/100`,
            text: vehicle.buyerScore.label ?? "Available history assessed",
          },
        ]
      : []),
    ...vehicle.dataQuality.notes.slice(0, 2).map((note) => ({
      date: "",
      type: "Data note",
      text: note,
    })),
  ];
  const advisorySlice = advisoryRowsForPdf(advisorySource, FREE_ADVISORY_LIMIT);
  const advisoryPreview = advisorySlice.shown;
  const detailTop = motPanelBottom - 16;
  const halfWidth = (CONTENT_WIDTH - 12) / 2;
  const mileageHeaderHeight = 26;
  const mileageColHeaderHeight = 22;
  const mileageRowHeight = 24;
  const mileageHeight =
    mileageHeaderHeight +
    mileageColHeaderHeight +
    Math.max(1, mileageRows.length) * mileageRowHeight +
    (mileageSlice.note ? 16 : 0);
  const mileageBottom = detailTop - mileageHeight;
  drawSection(page2, MARGIN, mileageBottom, halfWidth, mileageHeight, {
    fill: WHITE,
    headerHeight: mileageHeaderHeight,
  });
  page2.drawText("Mileage history", {
    x: 48,
    y: headerTitleY(mileageBottom, mileageHeight, mileageHeaderHeight, 12.5),
    size: 12.5,
    font: bold,
    color: NAVY,
  });
  const mileageColY = detailTop - mileageHeaderHeight - mileageColHeaderHeight;
  const mileageInset = 0.8;
  const mileageSplitX = MARGIN + 120;
  page2.drawRectangle({
    x: MARGIN + mileageInset,
    y: mileageColY,
    width: halfWidth - mileageInset * 2,
    height: mileageColHeaderHeight,
    color: SOFT,
  });
  drawInnerHLine(page2, MARGIN + mileageInset, mileageColY, halfWidth - mileageInset * 2);
  const mileageBodyHeight = mileageColY + mileageColHeaderHeight - mileageBottom;
  drawInnerVLine(
    page2,
    MARGIN + mileageInset,
    mileageBottom + mileageInset,
    mileageBodyHeight - mileageInset,
  );
  drawInnerVLine(
    page2,
    mileageSplitX,
    mileageBottom + mileageInset,
    mileageBodyHeight - mileageInset,
  );
  drawInnerVLine(
    page2,
    MARGIN + halfWidth - mileageInset,
    mileageBottom + mileageInset,
    mileageBodyHeight - mileageInset,
  );
  const mileageColHeaderCenter = mileageColY + mileageColHeaderHeight / 2;
  page2.drawText("DATE", {
    x: 51,
    y: textY(mileageColHeaderCenter, 8),
    size: 8,
    font: bold,
    color: MUTED,
  });
  page2.drawText("MILEAGE", {
    x: mileageSplitX + 10,
    y: textY(mileageColHeaderCenter, 8),
    size: 8,
    font: bold,
    color: MUTED,
  });
  if (mileageRows.length === 0) {
    page2.drawText("Mileage history is not available.", {
      x: 51,
      y: textY(rowCenterY(mileageColY, 0, mileageRowHeight), 9.4),
      size: 9.4,
      font: regular,
      color: MUTED,
    });
  } else {
    mileageRows.forEach((point, index) => {
      const centerY = rowCenterY(mileageColY, index, mileageRowHeight);
      if (index > 0) {
        drawInnerHLine(
          page2,
          MARGIN + mileageInset,
          mileageColY - index * mileageRowHeight,
          halfWidth - mileageInset * 2,
        );
      }
      page2.drawText(formatDate(point.date), {
        x: 51,
        y: textY(centerY, 9.4),
        size: 9.4,
        font: regular,
        color: NAVY,
      });
      page2.drawText(`${point.mileage.toLocaleString("en-GB")} mi`, {
        x: mileageSplitX + 10,
        y: textY(centerY, 9.4),
        size: 9.4,
        font: bold,
        color: NAVY,
      });
    });
  }
  if (mileageSlice.note) {
    page2.drawText(mileageSlice.note, {
      x: 51,
      y: mileageBottom + 6,
      size: 7.5,
      font: regular,
      color: MUTED,
    });
  }

  const specX = MARGIN + halfWidth + 12;
  const advisoryHeaderHeight = 26;
  const advisoryRowHeight = 30;
  const notesHeight =
    advisoryHeaderHeight +
    Math.max(1, advisoryPreview.length) * advisoryRowHeight +
    (advisorySlice.note ? 16 : 0);
  const notesBottom = detailTop - notesHeight;
  drawSection(page2, specX, notesBottom, halfWidth, notesHeight, {
    fill: AMBER_BG,
    headerHeight: advisoryHeaderHeight,
    headerFill: rgb(1, 0.96, 0.84),
  });
  page2.drawText("Advisories / Notes", {
    x: specX + 32,
    y: headerTitleY(notesBottom, notesHeight, advisoryHeaderHeight, 12),
    size: 12,
    font: bold,
    color: NAVY,
  });
  drawEmbeddedIcon(
    page2,
    embeddedIcons,
    "warning",
    specX + 12,
    detailTop - 20,
    14,
  );
  const specifications = [
    ["Colour", details.colour],
    [
      "Engine",
      details.engineCapacity != null
        ? `${details.engineCapacity.toLocaleString("en-GB")} cc`
        : null,
    ],
    ["Fuel", details.fuelType],
    ["Transmission", details.transmission],
    [
      "Power",
      summary.powerBhp != null ? `${summary.powerBhp} bhp` : null,
    ],
    [
      "CO2",
      details.co2Emissions != null
        ? `${details.co2Emissions} g/km`
        : null,
    ],
    ["Euro status", details.euroStatus],
    ["MOT test number", motRows[0]?.motTestNumber ?? null],
    ["First registered", formatDate(details.monthOfFirstRegistration)],
    ["Tax status", summary.tax.status],
    ["MOT expiry", formatDate(summary.motStatus.expiryDate)],
    ["V5C issued", formatDate(details.dateOfLastV5CIssued)],
    ["Wheelplan", details.wheelplan],
    ["Type approval", details.typeApproval],
  ].filter(
    (item): item is [string, string] =>
      typeof item[1] === "string" && item[1] !== "Not available",
  );
  const advisoryContentTop = detailTop - advisoryHeaderHeight;
  advisoryPreview.forEach((item, index) => {
    const centerY = rowCenterY(advisoryContentTop, index, advisoryRowHeight);
    if (index > 0) {
      drawInnerHLine(
        page2,
        specX,
        advisoryContentTop - index * advisoryRowHeight,
        halfWidth,
      );
    }
    const hasWarningIcon = drawEmbeddedIcon(
      page2,
      embeddedIcons,
      "warning",
      specX + 11,
      centerY - 7,
      15,
    );
    if (!hasWarningIcon) {
      page2.drawCircle({
        x: specX + 18,
        y: centerY,
        size: 4,
        color: AMBER,
      });
      page2.drawText("!", {
        x: specX + 16.8,
        y: textY(centerY, 5.5),
        size: 5.5,
        font: bold,
        color: WHITE,
      });
    }
    page2.drawText(fitText(item.type, bold, 8.6, halfWidth - 48), {
      x: specX + 30,
      y: textY(centerY + 5, 8.6),
      size: 8.6,
      font: bold,
      color: NAVY,
    });
    page2.drawText(
      fitText(
        item.date ? `${item.text} - ${formatDate(item.date)}` : item.text,
        regular,
        7.4,
        halfWidth - 48,
      ),
      {
        x: specX + 30,
        y: textY(centerY - 6, 7.4),
        size: 7.4,
        font: regular,
        color: MUTED,
      },
    );
  });
  if (advisorySlice.note) {
    page2.drawText(advisorySlice.note, {
      x: specX + 12,
      y: notesBottom + 6,
      size: 7.5,
      font: regular,
      color: MUTED,
    });
  }

  const advisoryTop = Math.min(mileageBottom, notesBottom) - 16;
  const specificationRows = Math.ceil(
    Math.min(specifications.length, FREE_SPEC_LIMIT) / 2,
  );
  const specHeaderHeight = 26;
  const specRowHeight = 26;
  const advisoryBottom =
    advisoryTop - (specHeaderHeight + Math.max(1, specificationRows) * specRowHeight);
  const advisoryHeight = advisoryTop - advisoryBottom;
  drawSection(page2, MARGIN, advisoryBottom, CONTENT_WIDTH, advisoryHeight, {
    fill: WHITE,
    headerHeight: specHeaderHeight,
  });
  page2.drawText("Vehicle specification", {
    x: MARGIN + 12,
    y: headerTitleY(advisoryBottom, advisoryHeight, specHeaderHeight, 12),
    size: 12,
    font: bold,
    color: NAVY,
  });
  const specColumnWidth = CONTENT_WIDTH / 2;
  const specContentTop = advisoryTop - specHeaderHeight;
  specifications.slice(0, FREE_SPEC_LIMIT).forEach(([label, value], index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const baseX = MARGIN + column * specColumnWidth;
    const centerY = rowCenterY(specContentTop, row, specRowHeight);
    if (column === 0 && row === 0) {
      drawInnerVLine(
        page2,
        MARGIN + specColumnWidth,
        advisoryBottom,
        advisoryHeight - specHeaderHeight,
      );
    }
    if (column === 0 && row > 0) {
      drawInnerHLine(
        page2,
        MARGIN,
        specContentTop - row * specRowHeight,
        CONTENT_WIDTH,
      );
    }
    page2.drawText(label, {
      x: baseX + 12,
      y: textY(centerY, 8.4),
      size: 8.4,
      font: regular,
      color: MUTED,
    });
    page2.drawText(fitText(value, bold, 8.9, 105), {
      x: baseX + 105,
      y: textY(centerY, 8.9),
      size: 8.9,
      font: bold,
      color: NAVY,
    });
  });
  drawUnlockCta(pdf, page2, bold, embeddedIcons, 52, upgradeUrl);
  drawFooter(page2, regular, bold, 2);

  pdf.setTitle(`AutoViewer Vehicle Report - ${summary.displayRegistration}`);
  pdf.setSubject(`Free AutoViewer vehicle information report. Report ID ${reportId}`);
  pdf.setKeywords([reportId, summary.registration, "Unlock Full Report"]);
  pdf.setAuthor("AutoViewer");
  pdf.setCreator("AutoViewer");
  return pdf.save();
}

export async function downloadVehicleReportPdf(
  vehicle: VehicleRecord,
  options?: Omit<VehicleReportPdfOptions, "imagePng">,
) {
  const [imagePng, iconPngs, plateFontBytes] = await Promise.all([
    vehicle.summary.imageSrc
      ? imageUrlToPng(vehicle.summary.imageSrc)
      : Promise.resolve(null),
    loadReportIconPngs(),
    loadPlateFontBytes(),
  ]);
  const bytes = await generateVehicleReportPdf(vehicle, {
    ...options,
    imagePng,
    iconPngs,
    plateFontBytes,
    baseUrl: typeof window !== "undefined" ? window.location.origin : undefined,
  });
  const blob = new Blob([new Uint8Array(bytes)], {
    type: "application/pdf",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `autoviewer-free-report-${vehicle.summary.registration}.pdf`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function motTableRowsForPdf(tests: MotTest[]): MotTest[] {
  return motRowsForFreePdf(tests).shown;
}
