import type { SendMailOptions } from "nodemailer";
import type { MailConfig } from "@/lib/server/mail";
import type { VehicleRecord } from "@/types/vehicle";

export const SUPPORT_INBOX = "support@autoviewer.co.uk";

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (
    !email ||
    email.length > 254 ||
    /[\r\n]/.test(email) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return null;
  }
  return email;
}

export function buildContactMessage(
  config: MailConfig,
  input: {
    name: string;
    email: string | null;
    message: string;
  },
): SendMailOptions {
  return {
    from: config.supportFrom,
    to: SUPPORT_INBOX,
    replyTo: input.email ?? undefined,
    subject: "[AutoViewer] Contact form message",
    text: [
      `Name: ${input.name || "Not provided"}`,
      `Email: ${input.email || "Not provided"}`,
      "",
      "Message:",
      input.message,
    ].join("\n"),
  };
}

export function buildReportMessage(
  config: MailConfig,
  input: {
    recipient: string;
    vehicle: VehicleRecord;
    reportUrl: string;
  },
): SendMailOptions {
  const registration = input.vehicle.summary.displayRegistration;

  return {
    from: config.reportsFrom,
    to: input.recipient,
    replyTo: config.replyTo,
    subject: `Your AutoViewer vehicle report - ${registration}`,
    text: [
      `View your AutoViewer vehicle report for ${registration}:`,
      input.reportUrl,
      "",
      "This report contains demonstration data only.",
    ].join("\n"),
  };
}
