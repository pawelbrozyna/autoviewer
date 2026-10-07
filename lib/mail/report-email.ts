import { absoluteUrl } from "@/lib/seo/metadata";
import type { VehicleRecord } from "@/types/vehicle";

const NAVY = "#071a3d";
const BLUE = "#1769e0";
const TEXT = "#0b1b33";
const MUTED = "#64748b";
const BORDER = "#dfe5ee";
const PLATE = "#fac023";
const OUTER_BG = "#f3f5f8";
const CARD_BORDER = "#c5cdd9";
/** Dark-mode clients that recolour bgcolor leave background-image alone, so the card stays white. */
const CARD_BG =
  "background-color:#ffffff;background-image:linear-gradient(#ffffff,#ffffff);";
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
    ? `<p class="av-muted" style="margin:6px 0 0;font-family:${FONT};font-size:12px;line-height:18px;color:${MUTED};">This report contains demonstration data only.</p>`
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
<style>
:root { color-scheme: light; supported-color-schemes: light; }
body, .av-card, .av-header, .av-logo { background-color: #ffffff !important; }
.av-outer { background-color: ${OUTER_BG} !important; }
.av-navy { color: ${NAVY} !important; }
.av-text { color: ${TEXT} !important; }
.av-muted { color: ${MUTED} !important; }
@media (prefers-color-scheme: dark) {
  .av-outer { background-color: ${OUTER_BG} !important; }
  .av-card, .av-header, .av-logo { background-color: #ffffff !important; }
  .av-navy { color: ${NAVY} !important; }
  .av-text { color: ${TEXT} !important; }
  .av-muted { color: ${MUTED} !important; }
}
[data-ogsc] .av-navy { color: ${NAVY} !important; }
[data-ogsc] .av-text { color: ${TEXT} !important; }
[data-ogsc] .av-muted { color: ${MUTED} !important; }
[data-ogsb] .av-outer { background-color: ${OUTER_BG} !important; }
[data-ogsb] .av-card, [data-ogsb] .av-header, [data-ogsb] .av-logo { background-color: #ffffff !important; }
</style>
</head>
<body class="av-outer" bgcolor="${OUTER_BG}" style="margin:0;padding:0;background-color:${OUTER_BG};color-scheme:light;supported-color-schemes:light;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${OUTER_BG};opacity:0;">Your AutoViewer report for ${registration} is ready to view online.</div>
<table role="presentation" class="av-outer" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${OUTER_BG}" style="background-color:${OUTER_BG};color-scheme:light;">
<tr>
<td align="center" style="padding:24px 12px;">
<!--[if mso]><table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#ffffff"><![endif]-->
<table role="presentation" class="av-card" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="max-width:640px;width:100%;${CARD_BG}border:1px solid ${CARD_BORDER};border-radius:12px;border-collapse:separate;box-shadow:0 1px 2px rgba(7,26,61,0.08);color-scheme:light;">
<tr>
<td align="center" class="av-header" bgcolor="#ffffff" style="padding:17px 24px 0;background-color:#ffffff;background-image:linear-gradient(#ffffff,#ffffff);border-radius:12px 12px 0 0;">
<table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;border-collapse:separate;">
<tr>
<td class="av-logo" bgcolor="#ffffff" style="padding:10px 18px;${CARD_BG}border:1px solid #e6eaf0;border-radius:9px;">
<img src="${logoUrl}" width="163" height="24" alt="AutoViewer" style="display:block;margin:0 auto;border:0;outline:none;text-decoration:none;width:163px;height:24px;background-color:#ffffff;font-family:${FONT};font-size:20px;font-weight:700;color:${NAVY};">
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td align="center" class="av-card" bgcolor="#ffffff" style="padding:11px 24px 0;text-align:center;${CARD_BG}">
<h1 class="av-navy" style="margin:0;font-family:${FONT};font-size:24px;line-height:30px;font-weight:700;color:${NAVY};">Your vehicle report is ready</h1>
<p class="av-muted" style="margin:6px 0 0;font-family:${FONT};font-size:15px;line-height:22px;color:${MUTED};">Your free AutoViewer report is available online.</p>
</td>
</tr>
<tr>
<td align="center" class="av-card" bgcolor="#ffffff" style="padding:20px 24px 0;text-align:center;${CARD_BG}">
<table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
<tr>
<td style="background-color:${PLATE};border:2px solid #000000;border-radius:5px;padding:5px 14px;font-family:${FONT};font-size:18px;line-height:22px;font-weight:700;letter-spacing:1px;color:#000000;white-space:nowrap;">${registration}</td>
</tr>
</table>
<p class="av-text" style="margin:10px 0 0;font-family:${FONT};font-size:17px;line-height:24px;font-weight:700;color:${TEXT};">${vehicleName}</p>
<p class="av-muted" style="margin:2px 0 0;font-family:${FONT};font-size:14px;line-height:21px;color:${MUTED};">${summary}</p>
</td>
</tr>
<tr>
<td class="av-card" bgcolor="#ffffff" style="padding:22px 24px 0;${CARD_BG}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center" bgcolor="${BLUE}" style="background-color:${BLUE};border-radius:10px;">
<a href="${url}" target="_blank" style="display:block;padding:13px 20px;font-family:${FONT};font-size:16px;line-height:22px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;text-align:center;">View your vehicle report</a>
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td align="center" class="av-card" bgcolor="#ffffff" style="padding:14px 24px 22px;text-align:center;${CARD_BG}">
<p class="av-muted" style="margin:0;font-family:${FONT};font-size:12px;line-height:18px;color:${MUTED};">Button not working? Copy this link into your browser:</p>
<p style="margin:2px 0 0;font-family:${FONT};font-size:12px;line-height:18px;word-break:break-all;"><a href="${url}" target="_blank" class="av-muted" style="color:${MUTED};text-decoration:underline;">${url}</a></p>
</td>
</tr>
<tr>
<td class="av-card" bgcolor="#ffffff" style="padding:0 24px;${CARD_BG}"><div style="height:1px;line-height:1px;font-size:1px;background-color:${BORDER};">&nbsp;</div></td>
</tr>
<tr>
<td align="center" class="av-card" bgcolor="#ffffff" style="padding:14px 24px 20px;text-align:center;${CARD_BG}border-radius:0 0 12px 12px;">
<p class="av-muted" style="margin:0;font-family:${FONT};font-size:12px;line-height:18px;color:${MUTED};">${REPORT_EMAIL_FOOTER}</p>
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
