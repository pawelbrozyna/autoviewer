import type { Metadata } from "next";
import { HeroMobileGradient } from "@/components/layout/ToolHeroBackdrop";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { PUBLIC_SUPPORT_EMAIL } from "@/lib/contact";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of Use",
  description:
    "Terms of use for AutoViewer, including data-source limitations and acceptable use.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-surface-soft">
        <HeroMobileGradient />
        <Container className="relative tool-hero-y max-w-3xl">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Terms" },
            ]}
          />
          <p className="eyebrow mb-2.5">Legal</p>
          <h1 className="heading-page">Terms of use</h1>
        </Container>
      </section>
      <section className="section-y">
        <Container className="max-w-3xl">
          <div className="prose-av">
            <p>Last updated: 12 September 2026</p>
          <h2>Service</h2>
          <p>
            AutoViewer provides tools to help users review vehicle-related
            information. Results depend on available data sources and may be
            incomplete, delayed or unavailable.
          </p>
          <h2>No affiliation</h2>
          <p>
            AutoViewer is independent and is not affiliated with or endorsed by
            DVLA, DVSA or vehicle manufacturers.
          </p>
          <h2>No professional advice</h2>
          <p>
            Information on AutoViewer is for general guidance. It is not a
            mechanical inspection, valuation, insurance quote or legal advice.
            Always inspect a vehicle and verify important claims before purchase.
          </p>
          <h2>Acceptable use</h2>
          <ul>
            <li>Do not attempt to abuse or overload the service.</li>
            <li>Do not use the service for unlawful purposes.</li>
            <li>Do not scrape the site in a way that degrades availability.</li>
          </ul>
          <h2>Contact</h2>
          <p>
            Questions:{" "}
            <a href={`mailto:${PUBLIC_SUPPORT_EMAIL}`}>{PUBLIC_SUPPORT_EMAIL}</a>
          </p>
        </div>
        </Container>
      </section>
    </>
  );
}
