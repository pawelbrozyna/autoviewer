import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import type { VehicleRecord } from "@/types/vehicle";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 44;
const NAVY = rgb(0.004, 0.125, 0.275);
const BLUE = rgb(0.09, 0.41, 0.88);
const MUTED = rgb(0.38, 0.45, 0.55);
const BORDER = rgb(0.87, 0.9, 0.94);

function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/);
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

async function imageUrlToPng(url: string): Promise<Uint8Array | null> {
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

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    return blob ? new Uint8Array(await blob.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

export async function generateVehicleReportPdf(
  vehicle: VehicleRecord,
  options?: { ownersLabel?: string | null },
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const page: PDFPage = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const { summary, details } = vehicle;

  const logoSize = 24;
  page.drawText("Auto", {
    x: MARGIN,
    y: 797,
    size: logoSize,
    font: bold,
    color: NAVY,
  });
  page.drawText("Viewer", {
    x: MARGIN + bold.widthOfTextAtSize("Auto", logoSize),
    y: 797,
    size: logoSize,
    font: bold,
    color: BLUE,
  });
  const generated = `Generated ${new Date().toLocaleDateString("en-GB")}`;
  page.drawText(generated, {
    x: PAGE_WIDTH - MARGIN - regular.widthOfTextAtSize(generated, 10),
    y: 797,
    size: 10,
    font: regular,
    color: MUTED,
  });
  page.drawLine({
    start: { x: MARGIN, y: 780 },
    end: { x: PAGE_WIDTH - MARGIN, y: 780 },
    thickness: 1,
    color: BORDER,
  });

  page.drawText("EXAMPLE VEHICLE REPORT", {
    x: MARGIN,
    y: 754,
    size: 9,
    font: bold,
    color: BLUE,
  });
  page.drawText(`${summary.make} ${summary.model}`.trim(), {
    x: MARGIN,
    y: 730,
    size: 18,
    font: bold,
    color: NAVY,
  });

  const registrationWidth =
    bold.widthOfTextAtSize(summary.displayRegistration, 14) + 22;
  page.drawRectangle({
    x: MARGIN,
    y: 691,
    width: registrationWidth,
    height: 27,
    color: rgb(0.98, 0.8, 0.14),
  });
  page.drawText(summary.displayRegistration, {
    x: MARGIN + 11,
    y: 699,
    size: 14,
    font: bold,
    color: rgb(0, 0, 0),
  });
  const demoLabel = "DEMO DATA";
  const demoLabelWidth = bold.widthOfTextAtSize(demoLabel, 9);
  const demoBadgeWidth = demoLabelWidth + 16;
  const demoBadgeX = MARGIN + registrationWidth + 8;
  page.drawRectangle({
    x: demoBadgeX,
    y: 693,
    width: demoBadgeWidth,
    height: 21,
    color: rgb(0.93, 0.96, 1),
  });
  page.drawText(demoLabel, {
    x: demoBadgeX + (demoBadgeWidth - demoLabelWidth) / 2,
    y: 700,
    size: 9,
    font: bold,
    color: BLUE,
  });

  const meta = [
    summary.year,
    summary.fuelType,
    summary.transmission,
    summary.engineCapacity != null
      ? `${summary.engineCapacity.toLocaleString("en-GB")} cc`
      : null,
  ]
    .filter(Boolean)
    .join(" | ");
  page.drawText(meta, {
    x: MARGIN,
    y: 674,
    size: 10,
    font: regular,
    color: MUTED,
  });

  if (summary.imageSrc) {
    const png = await imageUrlToPng(summary.imageSrc);
    if (png) {
      const image = await pdf.embedPng(png);
      const imageAreaWidth = 283;
      const dimensions = image.scaleToFit(imageAreaWidth, 151);
      const imageX = PAGE_WIDTH - MARGIN - dimensions.width;
      page.drawImage(image, {
        x: imageX,
        y: 621,
        width: dimensions.width,
        height: dimensions.height,
      });
      const caption =
        `Illustrative image - colour and specification may differ. ` +
        `Recorded colour: ${summary.colour ?? "Not available"}.`;
      const captionLines = wrapText(caption, regular, 7.5, dimensions.width);
      captionLines.forEach((line, index) => {
        const lineWidth = regular.widthOfTextAtSize(line, 7.5);
        page.drawText(line, {
          x: imageX + (dimensions.width - lineWidth) / 2,
          y: 612 - index * 9,
          size: 7.5,
          font: regular,
          color: MUTED,
        });
      });
    }
  }

  page.drawLine({
    start: { x: MARGIN, y: 585 },
    end: { x: PAGE_WIDTH - MARGIN, y: 585 },
    thickness: 1,
    color: BORDER,
  });

  const leftX = MARGIN;
  const rightX = 306;
  const columnWidth = 245;

  function drawSection(
    x: number,
    startY: number,
    title: string,
    lines: string[],
  ): number {
    page.drawText(title, {
      x,
      y: startY,
      size: 11,
      font: bold,
      color: NAVY,
    });
    page.drawLine({
      start: { x, y: startY - 5 },
      end: { x: x + columnWidth, y: startY - 5 },
      thickness: 0.7,
      color: BORDER,
    });

    let lineY = startY - 18;
    for (const text of lines) {
      const wrapped = wrapText(text, regular, 8.7, columnWidth);
      for (const line of wrapped) {
        page.drawText(line, {
          x,
          y: lineY,
          size: 8.7,
          font: regular,
          color: MUTED,
        });
        lineY -= 11;
      }
    }
    return lineY - 10;
  }

  let leftY = 566;
  leftY = drawSection(leftX, leftY, "Vehicle summary", [
    `Mileage: ${summary.latestMileage?.toLocaleString("en-GB") ?? "Not available"} miles`,
    `Owners: ${options?.ownersLabel ?? "Not available"}`,
    `Road tax: ${summary.annualRoadTaxGbp != null ? `£${summary.annualRoadTaxGbp} per year` : "Not available"}`,
    `Buyer Score: ${vehicle.buyerScore?.score != null ? `${vehicle.buyerScore.score}/100 - ${vehicle.buyerScore.label}` : "Not available"}`,
    `Tax status: ${summary.tax.status}${summary.tax.dueDate ? `, due ${summary.tax.dueDate}` : ""}`,
    `MOT status: ${summary.motStatus.status}${summary.motStatus.expiryDate ? `, expires ${summary.motStatus.expiryDate}` : ""}`,
  ]);

  leftY = drawSection(leftX, leftY, "Vehicle details", [
    `Make: ${details.make || "Not available"}`,
    `Model: ${details.model || "Not available"}`,
    `Year: ${details.yearOfManufacture ?? "Not available"}`,
    `Colour: ${details.colour ?? "Not available"}`,
    `Fuel: ${details.fuelType ?? "Not available"}`,
    `Engine: ${details.engineCapacity != null ? `${details.engineCapacity.toLocaleString("en-GB")} cc` : "Not available"}`,
    `Transmission: ${details.transmission ?? "Not available"}`,
    `First registered: ${details.monthOfFirstRegistration ?? "Not available"}`,
    `Euro status: ${details.euroStatus ?? "Not available"}`,
    `CO2 emissions: ${details.co2Emissions != null ? `${details.co2Emissions} g/km` : "Not available"}`,
  ]);

  leftY = drawSection(leftX, leftY, "Technical details", [
    `Power: ${summary.powerBhp != null ? `${summary.powerBhp} bhp` : "Not available"}`,
    `Combined MPG: ${summary.combinedMpg ?? "Not available"}`,
    `Type approval: ${details.typeApproval ?? "Not available"}`,
    `Wheelplan: ${details.wheelplan ?? "Not available"}`,
    `Revenue weight: ${details.revenueWeight != null ? `${details.revenueWeight.toLocaleString("en-GB")} kg` : "Not available"}`,
    `Export status: ${details.markedForExport == null ? "Not available" : details.markedForExport ? "Marked for export" : "Not marked for export"}`,
  ]);

  drawSection(leftX, leftY, "Data notes", [
    ...vehicle.dataQuality.notes,
    `Sources: ${vehicle.dataQuality.sources.join(", ")}`,
    "Demo data only. Not live government vehicle information.",
  ]);

  let rightY = 566;
  rightY = drawSection(
    rightX,
    rightY,
    "MOT history",
    vehicle.motTests.length
      ? vehicle.motTests.flatMap((test) => [
          `${test.completedDate}: ${test.testResult}, ${test.odometerValue?.toLocaleString("en-GB") ?? "Not available"} miles`,
          ...test.defects.map(
            (defect) => `  ${defect.type}: ${defect.text}`,
          ),
        ])
      : ["Data not available yet."],
  );

  rightY = drawSection(
    rightX,
    rightY,
    "Mileage history",
    vehicle.mileageHistory.length
      ? vehicle.mileageHistory.map(
          (point) =>
            `${point.date}: ${point.mileage.toLocaleString("en-GB")} miles (${point.source})`,
        )
      : ["Data not available yet."],
  );

  rightY = drawSection(rightX, rightY, "Tax information", [
    `Status: ${summary.tax.status}`,
    `Due date: ${summary.tax.dueDate ?? "Not available"}`,
    `Annual amount: ${summary.annualRoadTaxGbp != null ? `£${summary.annualRoadTaxGbp}` : "Not available"}`,
  ]);

  rightY = drawSection(
    rightX,
    rightY,
    "Recall information",
    vehicle.recalls.dataAvailable === false
      ? ["Data not available yet."]
      : vehicle.recalls.items.length
        ? vehicle.recalls.items.map(
            (item) =>
              `${item.title}${item.description ? `: ${item.description}` : ""}`,
          )
        : ["No outstanding recalls indicated in available data."],
  );

  rightY = drawSection(
    rightX,
    rightY,
    "Buyer insights",
    vehicle.buyerScore?.reasons.length
      ? [
          `Score: ${vehicle.buyerScore.score}/100 - ${vehicle.buyerScore.label}`,
          ...vehicle.buyerScore.reasons.map(
            (reason) =>
              `${reason.label}${reason.impact ? ` (${reason.impact > 0 ? "+" : ""}${reason.impact})` : ""}`,
          ),
        ]
      : ["Data not available yet."],
  );

  drawSection(rightX, rightY, "Related checks", [
    "MOT history checker: autoviewer.co.uk/mot-history",
    "Tax and mileage: autoviewer.co.uk/tax-mileage",
    "Compare cars: autoviewer.co.uk/compare-cars",
    "Running costs: autoviewer.co.uk/running-costs",
  ]);

  page.drawLine({
    start: { x: MARGIN, y: 32 },
    end: { x: PAGE_WIDTH - MARGIN, y: 32 },
    thickness: 0.7,
    color: BORDER,
  });
  page.drawText("AutoViewer | Example report | Page 1 of 1", {
    x: MARGIN,
    y: 18,
    size: 8,
    font: regular,
    color: MUTED,
  });

  return pdf.save();
}

export async function downloadVehicleReportPdf(
  vehicle: VehicleRecord,
  options?: { ownersLabel?: string | null },
) {
  const bytes = await generateVehicleReportPdf(vehicle, options);
  const blob = new Blob([new Uint8Array(bytes)], {
    type: "application/pdf",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `autoviewer-example-report-${vehicle.summary.registration}.pdf`;
  anchor.click();
  URL.revokeObjectURL(url);
}
