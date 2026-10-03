import { absoluteUrl } from "@/lib/seo/metadata";
import type { VehicleRecord } from "@/types/vehicle";

const NAVY = "#071a3d";
const BLUE = "#1769e0";
const TEXT = "#0b1b33";
const MUTED = "#64748b";
const BORDER = "#dfe5ee";
const SOFT = "#f7f9fc";
const PLATE = "#fac023";
const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export const REPORT_EMAIL_FOOTER =
  "This report is based on available public vehicle data.";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function reportVehicleName(vehicle: VehicleRecord): string {
  const { year, make, model } = vehicle.summary;
  return [year, make, model].filter(Boolean).join(" ");
}

export function reportSummaryLine(vehicle: VehicleRecord): string {
  const { motStatus } = vehicle.summary;
  const date = formatDate(motStatus.expiryDate);
  const parts: string[] = [];

  if (motStatus.status === "Valid") {
    parts.push(date ? `MOT valid until ${date}` : "MOT valid");
  } else if (motStatus.status === "Expired") {
    parts.push(date ? `MOT expired on ${date}` : "MOT expired");
  } else if (motStatus.status === "First MOT due") {
    parts.push(date ? `First MOT due ${date}` : "First MOT not yet due");
  }

  const tests = vehicle.motTests.length;
  if (tests > 0) {
    parts.push(`${tests} MOT ${tests === 1 ? "test" : "tests"} on record`);
  }

  return parts.length > 0
    ? `${parts.join(". ")}.`
    : "Includes MOT history, mileage and vehicle details from public records.";
}

export function buildReportEmailText(
  vehicle: VehicleRecord,
  reportUrl: string,
): string {
  const lines = [
    "Your vehicle report is ready",
    "",
    `${vehicle.summary.displayRegistration} - ${reportVehicleName(vehicle)}`,
    reportSummaryLine(vehicle),
    "",
    "View your vehicle report:",
    reportUrl,
    "",
    REPORT_EMAIL_FOOTER,
  ];
  if (vehicle.summary.isDemo) {
    lines.push("This report contains demonstration data only.");
  }
  return lines.join("\n");
}

export function buildReportEmailHtml(
  vehicle: VehicleRecord,
  reportUrl: string,
): string {
  const registration = escapeHtml(vehicle.summary.displayRegistration);
  const vehicleName = escapeHtml(reportVehicleName(vehicle));
  const summary = escapeHtml(reportSummaryLine(vehicle));
  const url = escapeHtml(reportUrl);
  const logoUrl = escapeHtml(absoluteUrl("/autoviewer-mark-optimized.png"));
  const demoNote = vehicle.summary.isDemo
    ? `<p style="margin:6px 0 0;font-family:${FONT};font-size:12px;line-height:18px;color:${MUTED};">This report contains demonstration data only.</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en-GB" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>Your vehicle report is ready</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#ffffff;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#ffffff;opacity:0;">Your AutoViewer report for ${registration} is ready to view online.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;">
<tr>
<td align="center" style="padding:24px 12px;">
<!--[if mso]><table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background-color:#ffffff;border:1px solid ${BORDER};border-radius:12px;">
<tr>
<td style="padding:24px 24px 18px;border-bottom:1px solid ${BORDER};">
<img src="${logoUrl}" width="163" height="24" alt="AutoViewer" style="display:block;border:0;outline:none;text-decoration:none;width:163px;height:24px;font-family:${FONT};font-size:20px;font-weight:700;color:${NAVY};">
</td>
</tr>
<tr>
<td style="padding:24px 24px 4px;">
<h1 style="margin:0;font-family:${FONT};font-size:24px;line-height:30px;font-weight:700;color:${NAVY};">Your vehicle report is ready</h1>
<p style="margin:8px 0 0;font-family:${FONT};font-size:15px;line-height:22px;color:${MUTED};">Your free AutoViewer report is available online.</p>
</td>
</tr>
<tr>
<td style="padding:18px 24px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${BORDER};border-radius:10px;background-color:${SOFT};">
<tr>
<td style="padding:16px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr>
<td style="background-color:${PLATE};border:2px solid #000000;border-radius:5px;padding:5px 12px;font-family:${FONT};font-size:18px;line-height:22px;font-weight:700;letter-spacing:1px;color:#000000;white-space:nowrap;">${registration}</td>
</tr>
</table>
<p style="margin:12px 0 0;font-family:${FONT};font-size:17px;line-height:24px;font-weight:700;color:${TEXT};">${vehicleName}</p>
<p style="margin:4px 0 0;font-family:${FONT};font-size:14px;line-height:21px;color:${MUTED};">${summary}</p>
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding:22px 24px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center" bgcolor="${BLUE}" style="background-color:${BLUE};border-radius:10px;">
<a href="${url}" target="_blank" style="display:block;padding:15px 20px;font-family:${FONT};font-size:17px;line-height:22px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;">View your vehicle report</a>
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding:16px 24px 24px;">
<p style="margin:0;font-family:${FONT};font-size:13px;line-height:19px;color:${MUTED};">Button not working? Copy this link into your browser:</p>
<p style="margin:4px 0 0;font-family:${FONT};font-size:13px;line-height:19px;word-break:break-all;"><a href="${url}" target="_blank" style="color:${BLUE};text-decoration:underline;">${url}</a></p>
</td>
</tr>
<tr>
<td style="padding:16px 24px 20px;border-top:1px solid ${BORDER};">
<p style="margin:0;font-family:${FONT};font-size:12px;line-height:18px;color:${MUTED};">${REPORT_EMAIL_FOOTER}</p>
${demoNote}
</td>
</tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td>
</tr>
</table>
</body>
</html>`;
}
