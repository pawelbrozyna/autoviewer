import { NextResponse } from "next/server";
import {
  CONTACT_MESSAGE_MAX,
  CONTACT_MESSAGE_MIN,
} from "@/lib/contact";
import {
  buildContactMessage,
  normalizeEmail,
} from "@/lib/mail/messages";
import {
  getMailConfig,
  logMailError,
  MailConfigurationError,
  sendMail,
} from "@/lib/server/mail";

export const runtime = "nodejs";

type ContactBody = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  company?: unknown;
};

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: Request) {
  let body: ContactBody;

  try {
    body = (await req.json()) as ContactBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = asTrimmedString(body.name);
  const emailInput = asTrimmedString(body.email);
  const email = emailInput ? normalizeEmail(emailInput) : null;
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

  if (emailInput && !email) {
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

  try {
    const config = getMailConfig();
    await sendMail(
      config,
      buildContactMessage(config, { name, email, message }),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    logMailError("Contact email delivery failed.", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: error instanceof MailConfigurationError ? 503 : 502 },
    );
  }
}
