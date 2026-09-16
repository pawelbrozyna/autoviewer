import "server-only";
import nodemailer, { type SendMailOptions, type Transporter } from "nodemailer";

const REQUIRED_VARIABLES = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_SECURE",
  "SMTP_USER",
  "SMTP_PASSWORD",
  "MAIL_REPORTS_FROM",
  "MAIL_SUPPORT_FROM",
  "MAIL_REPLY_TO",
] as const;

export type MailConfig = {
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPassword: string;
  reportsFrom: string;
  supportFrom: string;
  replyTo: string;
};

export class MailConfigurationError extends Error {
  constructor(readonly invalidVariables: string[]) {
    super("Email delivery is not configured.");
    this.name = "MailConfigurationError";
  }
}

function readEnvironment(): Record<(typeof REQUIRED_VARIABLES)[number], string> {
  return Object.fromEntries(
    REQUIRED_VARIABLES.map((name) => [name, process.env[name]?.trim() ?? ""]),
  ) as Record<(typeof REQUIRED_VARIABLES)[number], string>;
}

export function getMailConfig(): MailConfig {
  const env = readEnvironment();
  const invalidVariables = REQUIRED_VARIABLES.filter((name) => !env[name]);
  const smtpPort = Number(env.SMTP_PORT);
  const secureValue = env.SMTP_SECURE.toLowerCase();

  if (
    env.SMTP_PORT &&
    (!Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535)
  ) {
    invalidVariables.push("SMTP_PORT");
  }
  if (
    env.SMTP_SECURE &&
    secureValue !== "true" &&
    secureValue !== "false"
  ) {
    invalidVariables.push("SMTP_SECURE");
  }
  if (
    env.SMTP_USER &&
    env.SMTP_USER.toLowerCase() !== "support@autoviewer.co.uk"
  ) {
    invalidVariables.push("SMTP_USER");
  }
  if (
    env.MAIL_REPORTS_FROM &&
    env.MAIL_REPORTS_FROM !==
      "AutoViewer Reports <reports@autoviewer.co.uk>"
  ) {
    invalidVariables.push("MAIL_REPORTS_FROM");
  }
  if (
    env.MAIL_SUPPORT_FROM &&
    env.MAIL_SUPPORT_FROM !==
      "AutoViewer Support <support@autoviewer.co.uk>"
  ) {
    invalidVariables.push("MAIL_SUPPORT_FROM");
  }
  if (
    env.MAIL_REPLY_TO &&
    env.MAIL_REPLY_TO.toLowerCase() !== "support@autoviewer.co.uk"
  ) {
    invalidVariables.push("MAIL_REPLY_TO");
  }

  if (invalidVariables.length) {
    throw new MailConfigurationError([...new Set(invalidVariables)]);
  }

  return {
    smtpHost: env.SMTP_HOST,
    smtpPort,
    smtpSecure: secureValue === "true",
    smtpUser: env.SMTP_USER,
    smtpPassword: env.SMTP_PASSWORD,
    reportsFrom: env.MAIL_REPORTS_FROM,
    supportFrom: env.MAIL_SUPPORT_FROM,
    replyTo: env.MAIL_REPLY_TO,
  };
}

let transporter: Transporter | null = null;
let transporterKey = "";

function getTransporter(config: MailConfig): Transporter {
  const key = [
    config.smtpHost,
    config.smtpPort,
    config.smtpSecure,
    config.smtpUser,
  ].join("|");

  if (!transporter || transporterKey !== key) {
    transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPassword,
      },
    });
    transporterKey = key;
  }

  return transporter;
}

export async function sendMail(
  config: MailConfig,
  message: SendMailOptions,
  mailer: Pick<Transporter, "sendMail"> = getTransporter(config),
): Promise<void> {
  await mailer.sendMail(message);
}

export function logMailError(context: string, error: unknown): void {
  if (error instanceof MailConfigurationError) {
    console.error(
      `${context} Missing or invalid environment variables:`,
      error.invalidVariables.join(", "),
    );
    return;
  }

  const smtpError = error as {
    name?: unknown;
    code?: unknown;
    command?: unknown;
    responseCode?: unknown;
  };
  console.error(context, {
    name: typeof smtpError?.name === "string" ? smtpError.name : "Error",
    code: typeof smtpError?.code === "string" ? smtpError.code : undefined,
    command:
      typeof smtpError?.command === "string" ? smtpError.command : undefined,
    responseCode:
      typeof smtpError?.responseCode === "number"
        ? smtpError.responseCode
        : undefined,
  });
}
