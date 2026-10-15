import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of Use",
  description:
    "Terms of use for AutoViewer, including data-source limitations and acceptable use.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <section className="bg-white">
      <Container className="max-w-[860px] py-6 md:py-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Terms" },
          ]}
          className="mb-3"
        />
        <h1 className="text-[1.5rem] font-bold tracking-tight text-navy md:text-[1.75rem]">
          Terms of use
        </h1>

        <div className="prose-av mt-4 md:mt-5">
          <p>Last updated: 15 October 2026</p>
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
          <h2>Representative vehicle images</h2>
          <p>
            Vehicle images shown on AutoViewer are illustrative and may not
            depict the exact vehicle searched. AutoViewer selects the closest
            suitable image available in its pre-generated image library using
            the vehicle information available from its data sources.
          </p>
          <p>
            Images are created in advance and are not generated or recoloured
            for each search. The vehicle shown may therefore differ in
            generation, body style, derivative, specification, equipment or
            colour. Where a registered colour is shown separately, this comes
            from the available vehicle data and may differ from the colour shown
            in the image.
          </p>
          <p>
            If the available data is not sufficient to select a suitable image
            confidently, AutoViewer may show a generic placeholder instead.
            Representative images should not be used to verify a vehicle&apos;s
            exact identity, specification, condition or appearance.
          </p>
          <h2>Acceptable use</h2>
          <ul>
            <li>Do not attempt to abuse or overload the service.</li>
            <li>Do not use the service for unlawful purposes.</li>
            <li>Do not scrape the site in a way that degrades availability.</li>
          </ul>
          <h2>Contact</h2>
          <p>
            Questions about these terms can be sent via our{" "}
            <a href="/contact">contact form</a>.
          </p>
        </div>
      </Container>
    </section>
  );
}
