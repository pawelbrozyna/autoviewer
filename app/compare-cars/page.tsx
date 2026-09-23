import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { FAQ } from "@/components/ui/FAQ";
import { RelatedTools } from "@/components/ui/RelatedTools";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageHero } from "@/components/layout/PageHero";
import { CompareSearchForm } from "@/components/vehicle/CompareSearchForm";
import { VehicleComparison } from "@/components/vehicle/VehicleComparison";
import { lookupVehicle } from "@/lib/api/vehicle-service";
import { relatedToolsMap } from "@/lib/site";
import {
  absoluteUrl,
  buildPageMetadata,
  webApplicationJsonLd,
} from "@/lib/seo/metadata";
import { normalizeRegistration } from "@/lib/vehicle/registration";

export const metadata: Metadata = buildPageMetadata({
  title: "Compare Cars by Registration",
  description:
    "Compare two UK cars side by side using their registrations. Spot differences in year, fuel, mileage, tax and more.",
  path: "/compare-cars",
});

export default async function CompareCarsPage({
  searchParams,
}: {
  searchParams: Promise<{ left?: string; right?: string }>;
}) {
  const params = await searchParams;
  const leftReg = params.left ? normalizeRegistration(params.left) : "";
  const rightReg = params.right ? normalizeRegistration(params.right) : "";

  const leftResult = leftReg ? await lookupVehicle(leftReg) : null;
  const rightResult = rightReg ? await lookupVehicle(rightReg) : null;
  const canCompare =
    leftResult?.ok && rightResult?.ok ? true : false;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            webApplicationJsonLd({
              name: "AutoViewer Compare Cars",
              description: "Compare two UK cars by registration.",
              url: absoluteUrl("/compare-cars"),
            }),
          ),
        }}
      />
      <PageHero
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Compare Cars" },
        ]}
        title="Compare cars by registration"
        description="See key information, spot differences and make a more confident decision."
        variant="tool"
      >
        <CompareSearchForm
          defaultLeft={leftReg || "AB12 CDE"}
          defaultRight={rightReg || "CD34 EFG"}
        />
      </PageHero>

      <section className="pt-5 pb-8 md:pt-6 md:pb-10 lg:pt-5 lg:pb-9">
        <Container className="space-y-6 md:space-y-7">
          {canCompare && leftResult?.ok && rightResult?.ok ? (
            <VehicleComparison left={leftResult.data} right={rightResult.data} />
          ) : leftReg || rightReg ? (
            <div className="rounded-[12px] border border-warning/25 bg-warning-bg px-5 py-4 text-[15px] text-warning">
              We couldn’t compare those registrations. In demo mode, try{" "}
              <Link href="/compare-cars?left=AV19SWF&right=CD34EFG" className="font-semibold underline">
                AB12 CDE vs CD34 EFG
              </Link>
              .
            </div>
          ) : (
            <div>
              <p className="eyebrow mb-3">Example comparison</p>
              {/* Lazy import avoided - use mock via lookup */}
              <ExampleCompare />
            </div>
          )}

          <div className="prose-av">
            <h2>Compare before you shortlist</h2>
            <p>
              When two cars look similar on paper, a side-by-side view of year,
              fuel, mileage, tax status and buyer score can highlight the better
              option for your budget and risk tolerance.
            </p>
          </div>

          <div>
            <SectionHeading title="Related tools" className="mb-6" />
            <RelatedTools tools={relatedToolsMap["compare-cars"]} />
          </div>

          <div>
            <SectionHeading title="Frequently asked questions" className="mb-6" />
            <FAQ
              items={[
                {
                  question: "Can I compare any two registrations?",
                  answer:
                    "Yes, when data is available for both. In demo mode, use AB12 CDE and CD34 EFG.",
                },
                {
                  question: "Is the buyer score official?",
                  answer:
                    "No. AutoViewer Buyer Score is an internal indication from available history, not a mechanical inspection.",
                },
              ]}
            />
          </div>
        </Container>
      </section>
    </>
  );
}

async function ExampleCompare() {
  const left = await lookupVehicle("AV19SWF");
  const right = await lookupVehicle("CD34EFG");
  if (!left.ok || !right.ok) return null;
  return <VehicleComparison left={left.data} right={right.data} demo />;
}
