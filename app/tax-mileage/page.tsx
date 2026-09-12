import type { Metadata } from "next";
import Link from "next/link";
import { Gauge, Landmark } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { RelatedTools } from "@/components/ui/RelatedTools";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ToolHero } from "@/components/tools/ToolHero";
import { relatedToolsMap } from "@/lib/site";
import {
  absoluteUrl,
  buildPageMetadata,
  webApplicationJsonLd,
} from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Tax & Mileage Check",
  description:
    "Check a UK vehicle’s tax status and recorded mileage in one place using its registration number.",
  path: "/tax-mileage",
});

export default function TaxMileagePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            webApplicationJsonLd({
              name: "AutoViewer Tax & Mileage Check",
              description:
                "Check a UK vehicle’s tax status and recorded mileage in one place.",
              url: absoluteUrl("/tax-mileage"),
            }),
          ),
        }}
      />
      <ToolHero
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Tax & Mileage" },
        ]}
        title="Tax & mileage check"
        description="Check a vehicle’s tax status and recorded mileage together using its UK registration."
        buttonLabel="Check tax & mileage →"
        checkSource="tax-mileage"
      />

      <section className="section-y">
        <Container className="space-y-10 md:space-y-12">
          <div className="grid gap-4 md:grid-cols-2 md:gap-5">
            <div className="rounded-[12px] border border-border bg-white p-5 md:p-6">
              <div className="mb-3 flex items-center gap-2 text-blue">
                <Landmark className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                <h2 className="heading-card">Tax status</h2>
              </div>
              <ul className="space-y-2 text-[15px] leading-relaxed text-muted">
                <li>Taxed, SORN or untaxed where available</li>
                <li>Tax due date where returned by the data source</li>
                <li>Road tax context for ownership costs</li>
              </ul>
            </div>

            <div className="rounded-[12px] border border-border bg-white p-5 md:p-6">
              <div className="mb-3 flex items-center gap-2 text-blue">
                <Gauge className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                <h2 className="heading-card">Mileage history</h2>
              </div>
              <ul className="space-y-2 text-[15px] leading-relaxed text-muted">
                <li>Latest recorded mileage from MOT tests</li>
                <li>Previous MOT mileage readings and trend</li>
                <li>Possible inconsistency warnings if detected</li>
              </ul>
            </div>
          </div>

          <div className="rounded-[12px] border border-border bg-surface-soft p-5 md:p-6">
            <h2 className="heading-card">Also useful on the report</h2>
            <p className="support-copy mt-2 max-w-2xl">
              The same lookup also surfaces latest MOT status and core vehicle
              details such as year, fuel type and engine size where available.
            </p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[15px] font-semibold">
              <Link
                href="/mot-history"
                className="text-blue hover:text-blue-hover"
              >
                View full MOT history →
              </Link>
              <Link
                href="/check-a-vehicle"
                className="text-blue hover:text-blue-hover"
              >
                View full vehicle report →
              </Link>
            </div>
          </div>

          <div className="prose-av max-w-[46rem]">
            <h2>Tax and mileage in one check</h2>
            <p>
              Buyers often need both road tax status and recorded mileage before
              deciding. This page starts that combined check from a single UK
              registration and opens the same vehicle report used across
              AutoViewer.
            </p>
            <p>
              Looking for a more specific guide? See the dedicated{" "}
              <Link href="/car-tax-check">car tax check</Link> or{" "}
              <Link href="/mileage-check">mileage check</Link> pages, or continue
              to <Link href="/mot-history">MOT history</Link>.
            </p>
          </div>

          <div>
            <SectionHeading title="Related tools" className="mb-6" />
            <RelatedTools tools={relatedToolsMap["tax-mileage"]} />
          </div>
        </Container>
      </section>
    </>
  );
}
