import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import {
  CONTACT_EMAIL_SUBJECT,
  CONTACT_FROM_NAME,
  CONTACT_MESSAGE_MAX,
  CONTACT_MESSAGE_MIN,
  getContactMailConfig,
} from "@/lib/contact";

type ContactBody = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  company?: unknown;
};

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

type SmtpError = Error & {
  code?: unknown;
  command?: unknown;
  responseCode?: unknown;
  response?: unknown;
};

function redactSensitiveText(
  value: unknown,
  sensitiveValues: string[],
): string | number | undefined {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return undefined;

  return sensitiveValues.reduce(
    (safe, sensitive) =>
      sensitive ? safe.replaceAll(sensitive, "[redacted]") : safe,
    value,
  );
}

function logContactEmailError(error: unknown, sensitiveValues: string[]) {
  if (process.env.NODE_ENV !== "development") {
    console.error("Contact email delivery failed.");
    return;
  }

  if (!(error instanceof Error)) {
    console.error("Contact email delivery failed with an unknown error.");
    return;
  }

  const smtpError = error as SmtpError;
  console.error("Contact email delivery failed:", {
    name: smtpError.name,
    message: redactSensitiveText(smtpError.message, sensitiveValues),
    code: redactSensitiveText(smtpError.code, sensitiveValues),
    command: redactSensitiveText(smtpError.command, sensitiveValues),
    responseCode: redactSensitiveText(
      smtpError.responseCode,
      sensitiveValues,
    ),
    response: redactSensitiveText(smtpError.response, sensitiveValues),
  });
}

export async function POST(req: Request) {
  let body: ContactBody;

  try {
    body = (await req.json()) as ContactBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = asTrimmedString(body.name);
  const email = asTrimmedString(body.email);
  const message = asTrimmedString(body.message);
  const company = asTrimmedString(body.company);

  // Honeypot: pretend success so bots do not retry.
  if (company) {
    return NextResponse.json({ success: true });
  }

  if (!message || message.length < CONTACT_MESSAGE_MIN) {
    return NextResponse.json(
      { error: "Message must be at least 5 characters." },
      { status: 400 },
    );
  }

  if (message.length > CONTACT_MESSAGE_MAX) {
    return NextResponse.json(
      { error: "Message must be at most 1000 characters." },
      { status: 400 },
    );
  }

  if (email && !isValidEmail(email)) {
    return NextResponse.json(
      { error: "Please provide a valid email address." },
      { status: 400 },
    );
  }

  if (name.length > 120) {
    return NextResponse.json(
      { error: "Name is too long." },
      { status: 400 },
    );
  }

  const mailConfig = getContactMailConfig();
  if (!mailConfig.ok) {
    console.error(
      "Contact mail is not configured. Missing environment variables:",
      mailConfig.missing.join(", "),
    );
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }

  const { gmailUser, mailTo, appPassword } = mailConfig.config;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: appPassword,
    },
  });

  try {
    await transporter.sendMail({
      from: `"${CONTACT_FROM_NAME}" <${gmailUser}>`,
      to: mailTo,
      replyTo: email || undefined,
      subject: CONTACT_EMAIL_SUBJECT,
      text: [
        `Name: ${name || "Not provided"}`,
        `Email: ${email || "Not provided"}`,
        "",
        "Message:",
        message,
      ].join("\n"),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logContactEmailError(error, [gmailUser, mailTo, appPassword]);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}
