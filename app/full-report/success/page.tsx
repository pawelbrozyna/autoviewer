import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  formatRegistrationDisplay,
  isValidRegistrationFormat,
  normalizeRegistration,
} from "@/lib/vehicle/registration";

export const metadata: Metadata = buildPageMetadata({
  title: "Payment received",
  description: "Your AutoViewer Full Report payment is being confirmed.",
  path: "/full-report/success",
  noIndex: true,
});

type PageProps = {
  searchParams: Promise<{ registration?: string | string[] }>;
};

export default async function FullReportSuccessPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const rawRegistration = Array.isArray(params.registration)
    ? params.registration[0]
    : params.registration;
  const normalized = normalizeRegistration(rawRegistration ?? "");
  const hasRegistration = isValidRegistrationFormat(normalized);

  return (
    <main className="bg-surface-soft py-8 md:py-12">
      <Container className="max-w-xl">
        <div className="rounded-[12px] border border-border bg-white p-6 text-center md:p-8">
          <Clock className="mx-auto h-8 w-8 text-blue" aria-hidden />
          <h1 className="mt-3 text-[26px] font-bold leading-tight text-navy md:text-[32px]">
            Thank you, we are confirming your payment
          </h1>
          {hasRegistration ? (
            <p className="mt-3 inline-flex rounded-[7px] bg-[#FACC35] px-4 py-1.5 text-[20px] font-extrabold tracking-[0.06em] text-black">
              {formatRegistrationDisplay(normalized)}
            </p>
          ) : null}
          <p className="body-copy mt-3">
            Your Full Report will be prepared once Stripe confirms the payment.
            Full Reports are not available yet, so nothing has been unlocked at
            this stage.
          </p>
          <Link
            href={
              hasRegistration
                ? `/vehicle/${encodeURIComponent(normalized)}`
                : "/check-a-vehicle"
            }
            className="mt-5 inline-flex items-center gap-2 text-[15px] font-semibold text-blue hover:text-blue-hover"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to free report
          </Link>
        </div>
      </Container>
    </main>
  );
}
