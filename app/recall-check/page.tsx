import type { Metadata } from "next";
import { CheckerLandingPage } from "@/components/tools/CheckerLandingPage";
import {
  absoluteUrl,
  buildPageMetadata,
  webApplicationJsonLd,
} from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Vehicle Recall Check - UK Safety Recalls",
  description:
    "Check available manufacturer safety recall information for a UK vehicle registration.",
  path: "/recall-check",
});

export default function RecallCheckPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            webApplicationJsonLd({
              name: "AutoViewer Recall Check",
              description: "UK vehicle safety recall check by registration.",
              url: absoluteUrl("/recall-check"),
            }),
          ),
        }}
      />
      <CheckerLandingPage
        toolKey="recall-check"
        checkSource="recall-check"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Recall Check" },
        ]}
        eyebrow="Safety recalls"
        title="Vehicle recall check"
        description="See available manufacturer safety recall information linked to a UK registration."
        buttonLabel="Check recalls →"
        whatYoullSee={[
          {
            title: "Recall indication",
            text: "Where source data provides it, we’ll show whether outstanding recalls are indicated.",
          },
          {
            title: "Clear next steps",
            text: "If a recall is flagged, contact a franchised dealer or the manufacturer for confirmation.",
          },
          {
            title: "Combined vehicle view",
            text: "Recalls sit alongside MOT and tax so you can assess the car in context.",
          },
        ]}
        howItWorks={[
          {
            step: "Enter the registration",
            text: "Start with the number plate of the car you are considering.",
          },
          {
            step: "Review recall status",
            text: "We’ll present available recall indications from configured data sources.",
          },
          {
            step: "Confirm with the manufacturer",
            text: "Outstanding recalls should be verified and rectified before purchase where possible.",
          },
        ]}
        explanation={
          <>
            <h2>Why safety recalls matter</h2>
            <p>
              Manufacturer recalls address safety issues that may not be obvious
              during a short test drive. Checking for available recall information
              is a sensible step before buying, especially on older or higher-volume
              models.
            </p>
            <p>
              Recall coverage can vary by data source. If a recall is indicated,
              treat it as something to confirm with a dealer rather than a final
              diagnosis from AutoViewer alone.
            </p>
          </>
        }
        faqs={[
          {
            question: "Are all recalls shown?",
            answer:
              "We show recall information where available from configured sources. Always confirm outstanding work with the manufacturer or a franchised dealer.",
          },
          {
            question: "Is a recalled car unsafe to buy?",
            answer:
              "Not necessarily - many recalls are rectified free of charge. The key is knowing the status before you commit.",
          },
          {
            question: "Does a clean MOT mean no recalls?",
            answer:
              "No. MOT tests and manufacturer recalls are separate processes.",
          },
        ]}
      />
    </>
  );
}
