import type { Metadata } from "next";
import { CheckerLandingPage } from "@/components/tools/CheckerLandingPage";
import {
  absoluteUrl,
  buildPageMetadata,
  webApplicationJsonLd,
} from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Car Mileage Check - View MOT Mileage History",
  description:
    "Check car mileage history from MOT readings. Spot possible inconsistencies before you buy a used car.",
  path: "/mileage-check",
});

export default function MileageCheckPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            webApplicationJsonLd({
              name: "AutoViewer Mileage Check",
              description: "UK car mileage history check from MOT readings.",
              url: absoluteUrl("/mileage-check"),
            }),
          ),
        }}
      />
      <CheckerLandingPage
        toolKey="mileage-check"
        checkSource="mileage-check"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Mileage Check" },
        ]}
        eyebrow="Mileage history"
        title="Car mileage check"
        description="View mileage recorded at MOT tests and look for possible inconsistencies."
        buttonLabel="Check mileage →"
        crossLink={{
          href: "/tax-mileage",
          label: "Want tax status as well?",
        }}
        whatYoullSee={[
          {
            title: "Mileage timeline",
            text: "Readings from available MOT tests, ordered clearly by date.",
          },
          {
            title: "Simple chart",
            text: "A lightweight visual of how recorded mileage has changed over time.",
          },
          {
            title: "Inconsistency alerts",
            text: "If a later reading is materially lower than an earlier one, we flag it carefully.",
          },
        ]}
        howItWorks={[
          {
            step: "Enter the registration",
            text: "We’ll look up available MOT mileage readings for that vehicle.",
          },
          {
            step: "Review the trend",
            text: "Compare dates and mileages. Large drops deserve extra questions.",
          },
          {
            step: "Verify in person",
            text: "Check the odometer on the day and ask for service invoices where possible.",
          },
        ]}
        explanation={
          <>
            <h2>Mileage checks for used car buyers</h2>
            <p>
              MOT tests usually record mileage. Looking across those readings can
              highlight unusual drops that deserve further scrutiny. AutoViewer
              labels this carefully as a possible inconsistency - not a definitive
              conclusion that a vehicle has been clocked.
            </p>
            <p>
              Always combine mileage history with a physical inspection, service
              paperwork and common-sense checks of wear against the stated miles.
            </p>
          </>
        }
        faqs={[
          {
            question: "Where does mileage data come from?",
            answer:
              "Primarily from MOT test records where odometer readings were captured.",
          },
          {
            question: "Does a drop always mean the car was clocked?",
            answer:
              "No. Readings can be wrong, units can differ, or data can be incomplete. Treat anomalies as a prompt to investigate.",
          },
          {
            question: "Can private sales hide mileage history?",
            answer:
              "MOT mileage history is still worth checking, but paperwork and a careful inspection remain essential.",
          },
        ]}
      />
    </>
  );
}
