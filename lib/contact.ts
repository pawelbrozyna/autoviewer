/**
 * Central contact / support email configuration.
 * Keep public addresses and mail transport settings here - do not scatter
 * hardcoded emails through page components.
 */

/** Public-facing support address shown on the site. */
export const PUBLIC_SUPPORT_EMAIL = "support@autoviewer.co.uk";

/**
 * Gmail account used for Nodemailer transport and inbox destination.
 * Authenticated with process.env.GMAIL_APP_PASSWORD (never hardcode).
 */
export const CONTACT_GMAIL_USER = "taxcalcuk@gmail.com";

/** Inbox that receives contact-form messages. */
export const CONTACT_MAIL_TO = CONTACT_GMAIL_USER;

export const CONTACT_FROM_NAME = "AutoViewer";

export const CONTACT_EMAIL_SUBJECT = "[AutoViewer] Contact form message";

export const CONTACT_MESSAGE_MIN = 5;
export const CONTACT_MESSAGE_MAX = 1000;
