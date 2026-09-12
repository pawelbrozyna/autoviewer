import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import {
  CONTACT_EMAIL_SUBJECT,
  CONTACT_FROM_NAME,
  CONTACT_GMAIL_USER,
  CONTACT_MAIL_TO,
  CONTACT_MESSAGE_MAX,
  CONTACT_MESSAGE_MIN,
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

  const appPassword = process.env.GMAIL_APP_PASSWORD;
  if (!appPassword) {
    console.error("GMAIL_APP_PASSWORD is not configured");
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: CONTACT_GMAIL_USER,
      pass: appPassword,
    },
  });

  try {
    await transporter.sendMail({
      from: `"${CONTACT_FROM_NAME}" <${CONTACT_GMAIL_USER}>`,
      to: CONTACT_MAIL_TO,
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
    console.error("Contact email error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}
