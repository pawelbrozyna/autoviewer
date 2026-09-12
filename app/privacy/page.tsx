import type { Metadata } from "next";
import { HeroMobileGradient } from "@/components/layout/ToolHeroBackdrop";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { PUBLIC_SUPPORT_EMAIL } from "@/lib/contact";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy",
  description:
    "How AutoViewer handles vehicle registration searches, technical logs and privacy.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-surface-soft">
        <HeroMobileGradient />
        <Container className="relative tool-hero-y max-w-3xl">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Privacy" },
            ]}
          />
          <p className="eyebrow mb-2.5">Legal</p>
          <h1 className="heading-page">Privacy policy</h1>
        </Container>
      </section>
      <section className="section-y">
        <Container className="max-w-3xl">
          <div className="prose-av">
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
            Privacy questions:{" "}
            <a href={`mailto:${PUBLIC_SUPPORT_EMAIL}`}>{PUBLIC_SUPPORT_EMAIL}</a>
          </p>
          <p>
            This page describes the current intended implementation. It is not an
            absolute guarantee against all third-party infrastructure processing
            required to deliver a website.
          </p>
        </div>
        </Container>
      </section>
    </>
  );
}
