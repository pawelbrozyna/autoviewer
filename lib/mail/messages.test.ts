import assert from "node:assert/strict";
import type { SendMailOptions } from "nodemailer";
import { getMockVehicle } from "@/lib/api/mock";
import {
  buildContactMessage,
  buildReportMessage,
  normalizeEmail,
  SUPPORT_INBOX,
} from "@/lib/mail/messages";
import { getMailConfig, sendMail } from "@/lib/server/mail";

async function run() {
  Object.assign(process.env, {
    SMTP_HOST: "smtp.hostinger.com",
    SMTP_PORT: "465",
    SMTP_SECURE: "true",
    SMTP_USER: "support@autoviewer.co.uk",
    SMTP_PASSWORD: "test-secret-not-for-delivery",
    MAIL_REPORTS_FROM:
      "AutoViewer Reports <reports@autoviewer.co.uk>",
    MAIL_SUPPORT_FROM:
      "AutoViewer Support <support@autoviewer.co.uk>",
    MAIL_REPLY_TO: "support@autoviewer.co.uk",
  });

  const config = getMailConfig();
  const visitorEmail = normalizeEmail(" VISITOR@EXAMPLE.COM ");
  assert.equal(visitorEmail, "visitor@example.com");
  assert.equal(normalizeEmail("not-an-email"), null);

  const contact = buildContactMessage(config, {
    name: "Test visitor",
    email: visitorEmail,
    message: "Please help with my report.",
  });
  assert.equal(
    contact.from,
    "AutoViewer Support <support@autoviewer.co.uk>",
  );
  assert.equal(contact.to, SUPPORT_INBOX);
  assert.equal(contact.replyTo, visitorEmail);

  let delivered: SendMailOptions | null = null;
  await sendMail(config, contact, {
    sendMail: async (message: SendMailOptions) => {
      delivered = message;
      return {} as never;
    },
  });
  assert.equal(delivered, contact);

  const vehicle = getMockVehicle("AV19SWF");
  assert.ok(vehicle);

  const report = buildReportMessage(config, {
    recipient: "driver@example.com",
    vehicle,
    reportUrl: "https://autoviewer.co.uk/example-report",
  });
  assert.equal(
    report.from,
    "AutoViewer Reports <reports@autoviewer.co.uk>",
  );
  assert.equal(report.to, "driver@example.com");
  assert.equal(report.replyTo, "support@autoviewer.co.uk");
  assert.match(String(report.subject), /AV19 SWF/);

  const { POST: sendReport } = await import(
    "@/app/api/reports/example/email/route"
  );
  const invalidReportResponse = await sendReport(
    new Request("https://autoviewer.co.uk/api/reports/example/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "malformed-address" }),
    }),
  );
  assert.equal(invalidReportResponse.status, 400);
  assert.doesNotMatch(
    await invalidReportResponse.text(),
    /test-secret-not-for-delivery/,
  );

  const { POST: sendContact } = await import("@/app/api/contact/route");
  const invalidContactResponse = await sendContact(
    new Request("https://autoviewer.co.uk/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "malformed-address",
        message: "A valid-length support message.",
      }),
    }),
  );
  assert.equal(invalidContactResponse.status, 400);
  assert.doesNotMatch(
    await invalidContactResponse.text(),
    /test-secret-not-for-delivery/,
  );

  console.log("Mail tests passed.");
}

void run();
