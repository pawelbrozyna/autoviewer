import type { Metadata } from "next";
import { Check, Minus } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { RelatedTools } from "@/components/ui/RelatedTools";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RunningCostsCalculator } from "@/components/tools/RunningCostsCalculator";
import { RunningCostsHero } from "@/components/tools/RunningCostsHero";
import {
  absoluteUrl,
  buildPageMetadata,
  webApplicationJsonLd,
} from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Car Running Costs Calculator UK",
  description:
    "Estimate UK car running costs including fuel, road tax, insurance and maintenance. See annual car costs, monthly car costs and cost per mile.",
  path: "/running-costs",
});

const relatedTools = [
  {
    href: "/check-a-vehicle",
    label: "Check a Vehicle",
    description: "MOT, mileage, tax, recalls and more in one place.",
  },
  {
    href: "/compare-cars",
    label: "Compare Cars",
    description: "Compare two registrations side by side.",
  },
  {
    href: "/tax-mileage",
    label: "Tax & Mileage",
    description: "Check tax status and mileage history together.",
  },
  {
    href: "/mot-history",
    label: "MOT History",
    description: "Review past MOT results and advisories.",
  },
];

const includedItems = [
  "Fuel",
  "Road tax",
  "Insurance",
  "Servicing & maintenance",
  "Optional finance",
];

const excludedItems = [
  "Depreciation",
  "Unexpected repairs",
  "Parking",
  "Tolls",
  "Breakdown cover",
];

export default function RunningCostsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            webApplicationJsonLd({
              name: "AutoViewer Running Costs Calculator",
              description:
                "Estimate UK car running costs including fuel, road tax, insurance and maintenance.",
              url: absoluteUrl("/running-costs"),
            }),
          ),
        }}
      />
      <RunningCostsHero />

      <section className="section-y">
        <Container>
          <div className="mx-auto w-full max-w-[1180px] space-y-10 md:space-y-12">
            <div>
              <RunningCostsCalculator />

              <div className="rounded-b-[12px] border-x border-b border-border bg-surface-soft/70 px-6 py-7 md:px-7 md:py-8">
                <div className="grid gap-8 md:grid-cols-2 md:gap-10">
                  <div>
                    <h2 className="text-[20px] font-bold tracking-tight text-navy md:text-[22px]">
                      What&apos;s included?
                    </h2>
                    <ul className="mt-4 space-y-2.5">
                      {includedItems.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2.5 text-[15px] leading-relaxed text-navy/80 md:text-[16px]"
                        >
                          <Check
                            className="mt-0.5 h-[18px] w-[18px] shrink-0 text-blue"
                            strokeWidth={2.25}
                            aria-hidden
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h2 className="text-[20px] font-bold tracking-tight text-navy md:text-[22px]">
                      What isn&apos;t included?
                    </h2>
                    <ul className="mt-4 space-y-2.5">
                      {excludedItems.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2.5 text-[15px] leading-relaxed text-navy/75 md:text-[16px]"
                        >
                          <Minus
                            className="mt-0.5 h-[18px] w-[18px] shrink-0 text-navy/40"
                            strokeWidth={2.25}
                            aria-hidden
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <SectionHeading title="Related tools" className="mb-6" />
              <RelatedTools tools={relatedTools} />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
