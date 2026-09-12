import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy",
  description:
    "How AutoViewer handles vehicle registration searches, technical logs and privacy.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <section className="bg-white">
      <Container className="max-w-[860px] py-6 md:py-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Privacy" },
          ]}
          className="mb-3"
        />
        <h1 className="text-[1.5rem] font-bold tracking-tight text-navy md:text-[1.75rem]">
          Privacy policy
        </h1>

        <div className="prose-av mt-4 md:mt-5">
          <p>Last updated: 12 September 2026</p>
          <h2>What we process</h2>
          <p>
            When you check a vehicle, you submit a registration number. That is
            vehicle data rather than a direct identifier of you as a person.
            Hosting infrastructure may process technical logs such as IP address,
            user agent and request timestamps to operate and secure the service.
          </p>
          <h2>What we do not do by default</h2>
          <ul>
            <li>We do not sell personal information.</li>
            <li>
              We do not add marketing trackers by default in this codebase.
            </li>
            <li>
              We do not store registration searches as a personal profile.
            </li>
          </ul>
          <h2>Cookies</h2>
          <p>
            AutoViewer does not currently set non-essential marketing cookies.
            Essential cookies may be used by the hosting platform if required for
            security or performance.
          </p>
          <h2>Analytics</h2>
          <p>
            An analytics abstraction exists for future GA4 connection. Until a
            measurement ID is configured, event helpers are no-ops and should not
            transmit data.
          </p>
          <h2>Contact</h2>
          <p>
            Privacy questions can be sent via our{" "}
            <a href="/contact">contact form</a>.
          </p>
          <p>
            This page describes the current intended implementation. It is not an
            absolute guarantee against all third-party infrastructure processing
            required to deliver a website.
          </p>
        </div>
      </Container>
    </section>
  );
}
