import "server-only";
import Stripe from "stripe";
import {
  type CheckoutSource,
  FULL_REPORT_AMOUNT_PENCE,
  FULL_REPORT_CURRENCY,
  FULL_REPORT_PRODUCT_NAME,
} from "@/lib/full-report";
import { formatRegistrationDisplay } from "@/lib/vehicle/registration";

/** Stripe fetches brand images itself, so they must be public and not redirect. */
const STRIPE_ASSET_ORIGIN = "https://www.autoviewer.co.uk";

/** Keep checkout to cards and Apple Pay / Google Pay; BNPL, delayed-settlement and extra wallets add clutter for a £7.99 report. */
const EXCLUDED_PAYMENT_METHODS: Stripe.Checkout.SessionCreateParams.ExcludedPaymentMethodType[] = [
  "affirm",
  "afterpay_clearpay",
  "alma",
  "billie",
  "klarna",
  "scalapay",
  "sequra",
  "sunbit",
  "zip",
  "acss_debit",
  "au_becs_debit",
  "bacs_debit",
  "sepa_debit",
  "us_bank_account",
  "nz_bank_account",
  "customer_balance",
  "boleto",
  "konbini",
  "multibanco",
  "oxxo",
  "crypto",
  "amazon_pay",
  "revolut_pay",
];

let client: Stripe | null = null;

export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }
  client ??= new Stripe(secretKey);
  return client;
}

export type FullReportCheckoutInput = {
  source: CheckoutSource;
  registration: string | null;
  reportId?: string | null;
  origin: string;
};

function checkoutCancelPath(source: CheckoutSource, registration: string | null): string {
  if (source === "vehicle" && registration) {
    return `/vehicle/${encodeURIComponent(registration)}?checkout=cancelled`;
  }
  if (source === "full-report") {
    return registration
      ? `/full-report?registration=${encodeURIComponent(registration)}&checkout=cancelled`
      : "/full-report?checkout=cancelled";
  }
  if (source === "home") return "/?checkout=cancelled";
  return "/example-report?checkout=cancelled";
}

export async function createFullReportCheckoutSession({
  source,
  registration,
  reportId,
  origin,
}: FullReportCheckoutInput): Promise<string> {
  const metadata: Record<string, string> = {
    product: "full_vehicle_report",
    source,
  };
  if (registration) metadata.registration = registration;
  if (reportId) metadata.reportId = reportId;

  const vehicleSuffix = registration ? ` for ${formatRegistrationDisplay(registration)}` : "";
  const successPath = registration
    ? `/full-report/success?session_id={CHECKOUT_SESSION_ID}&registration=${encodeURIComponent(registration)}`
    : "/full-report/success?session_id={CHECKOUT_SESSION_ID}";
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    excluded_payment_method_types: EXCLUDED_PAYMENT_METHODS,
    submit_type: "pay",
    locale: "en-GB",
    branding_settings: {
      display_name: "AutoViewer",
      logo: { type: "url", url: `${STRIPE_ASSET_ORIGIN}/autoviewer-mark-checkout.png` },
      icon: { type: "url", url: `${STRIPE_ASSET_ORIGIN}/autoviewer-icon.png` },
      button_color: "#1769e0",
      background_color: "#f7f9fc",
      border_style: "rounded",
      font_family: "inter",
    },
    custom_text: {
      submit: {
        message: `One-off payment for the AutoViewer Full Vehicle Report${vehicleSuffix}. No subscription.`,
      },
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: FULL_REPORT_CURRENCY,
          unit_amount: FULL_REPORT_AMOUNT_PENCE,
          product_data: {
            name: FULL_REPORT_PRODUCT_NAME,
            description: `Full vehicle history and risk checks${vehicleSuffix}. Finance & write-off check · Stolen & keeper history · Instant report`,
          },
        },
      },
    ],
    metadata,
    payment_intent_data: { metadata },
    client_reference_id: reportId ?? registration ?? undefined,
    success_url: `${origin}${successPath}`,
    cancel_url: `${origin}${checkoutCancelPath(source, registration)}`,
  });

  if (!session.url) {
    throw new Error("Stripe did not return a Checkout URL.");
  }
  return session.url;
}

/**
 * Called only from the verified webhook. A success redirect is never proof of
 * payment, so unlocking and any paid data API calls must start from here once
 * persistence exists.
 */
export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  if (session.payment_status !== "paid") return;
  if (session.metadata?.product !== "full_vehicle_report") return;

  // TODO: persist the paid order (session.id, metadata.registration,
  // metadata.reportId) and unlock the Full Report. No paid API calls yet.
  console.info("[stripe] checkout.session.completed", {
    sessionId: session.id,
    registration: session.metadata?.registration ?? null,
  });
}
