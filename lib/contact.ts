/**
 * Contact form constants and server mail config helpers.
 * Mail credentials must stay server-only (no NEXT_PUBLIC_).
 * Client code may import message limits only.
 */

export const CONTACT_FROM_NAME = "AutoViewer";

export const CONTACT_EMAIL_SUBJECT = "[AutoViewer] Contact form message";

export const CONTACT_MESSAGE_MIN = 5;
export const CONTACT_MESSAGE_MAX = 1000;

export type ContactMailConfig = {
  /** Gmail account used to authenticate / send. */
  gmailUser: string;
  /** Inbox that receives contact messages. */
  mailTo: string;
  /** Gmail App Password for CONTACT_GMAIL_USER. */
  appPassword: string;
};

/**
 * Resolve server-side mail settings from environment variables.
 * Never call this from client components.
 */
export function getContactMailConfig():
  | { ok: true; config: ContactMailConfig }
  | { ok: false; missing: string[] } {
  const gmailUser = process.env.CONTACT_GMAIL_USER?.trim() ?? "";
  const mailTo = process.env.CONTACT_MAIL_TO?.trim() ?? "";
  const appPassword = process.env.GMAIL_APP_PASSWORD?.trim() ?? "";

  const missing: string[] = [];
  if (!gmailUser) missing.push("CONTACT_GMAIL_USER");
  if (!mailTo) missing.push("CONTACT_MAIL_TO");
  if (!appPassword) missing.push("GMAIL_APP_PASSWORD");

  if (missing.length > 0) {
    return { ok: false, missing };
  }

  return {
    ok: true,
    config: {
      gmailUser,
      mailTo,
      appPassword,
    },
  };
}
