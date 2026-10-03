/**
 * Render the free report email for a registration without sending it.
 *
 * Usage: npm run email:preview -- V1NTH
 * Writes the HTML and plain-text versions to the system temp folder. Never prints credentials.
 */
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { lookupVehicle } from "@/lib/api/vehicle-service";
import {
  buildReportEmailHtml,
  buildReportEmailText,
} from "@/lib/mail/report-email";
import { absoluteUrl } from "@/lib/seo/metadata";
import { registrationToSlug } from "@/lib/vehicle/registration";

async function main() {
  const registration = process.argv[2] ?? "V1NTH";
  const result = await lookupVehicle(registration);
  if (!result.ok) {
    console.error(`Lookup failed: ${result.error.code}`);
    process.exit(1);
  }

  const vehicle = result.data;
  const reportUrl = absoluteUrl(
    `/vehicle/${registrationToSlug(vehicle.summary.registration)}`,
  );
  const base = join(tmpdir(), `autoviewer-email-${vehicle.summary.registration}`);
  writeFileSync(`${base}.html`, buildReportEmailHtml(vehicle, reportUrl));
  writeFileSync(`${base}.txt`, buildReportEmailText(vehicle, reportUrl));
  console.log(`${base}.html`);
  console.log(`${base}.txt`);
}

void main();
