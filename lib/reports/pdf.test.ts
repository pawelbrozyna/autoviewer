import assert from "node:assert/strict";
import {
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFName,
  PDFString,
} from "pdf-lib";
import { getMockVehicle } from "@/lib/api/mock";
import { fullReportHref } from "@/lib/full-report";
import { FREE_MOT_LIMIT, motRowsForFreePdf } from "@/lib/reports/pdf-limits";
import {
  generateVehicleReportPdf,
  motTableRowsForPdf,
} from "@/lib/reports/pdf";
import { freeStressCases } from "@/lib/reports/stress/fixtures";

async function run() {
  const vehicle = getMockVehicle("AV19SWF");
  assert.ok(vehicle);

  const bytes = await generateVehicleReportPdf(vehicle, {
    ownersLabel: "2",
    imagePng: null,
    generatedAt: new Date("2026-09-20T12:00:00Z"),
    baseUrl: "https://autoviewer.co.uk",
  });
  const document = await PDFDocument.load(bytes);

  assert.equal(document.getPageCount(), 2);
  for (const page of document.getPages()) {
    const links = page.node.lookup(PDFName.of("Annots"), PDFArray);
    assert.ok(links.size() > 0, "Each PDF page should contain upgrade links.");
    const firstLink = document.context.lookup(links.get(0), PDFDict);
    const action = firstLink.lookup(PDFName.of("A"), PDFDict);
    const uri = action.lookup(PDFName.of("URI"), PDFString).decodeText();
    assert.equal(
      uri,
      "https://autoviewer.co.uk/full-report?registration=AV19SWF",
    );
  }

  assert.equal(
    fullReportHref(" AV19 SWF "),
    "/full-report?registration=AV19SWF",
  );
  assert.equal(motTableRowsForPdf(vehicle.motTests).length, 3);

  const manyMot = freeStressCases.find((item) => item.id === "many-mot");
  assert.ok(manyMot);
  const motSlice = motRowsForFreePdf(manyMot.vehicle.motTests);
  assert.equal(motSlice.shown.length, FREE_MOT_LIMIT);
  assert.ok((motSlice.hidden ?? 0) > 0);
  assert.ok(motSlice.note?.includes("earlier MOT records"));

  const worst = freeStressCases.find((item) => item.id === "worst-case");
  assert.ok(worst);
  const worstBytes = await generateVehicleReportPdf(worst.vehicle, {
    ownersLabel: "3",
    imagePng: null,
    generatedAt: new Date("2026-09-20T12:00:00Z"),
    baseUrl: "https://autoviewer.co.uk",
  });
  const worstDocument = await PDFDocument.load(worstBytes);
  assert.equal(worstDocument.getPageCount(), 2);

  console.log("PDF report tests passed.");
}

void run();
