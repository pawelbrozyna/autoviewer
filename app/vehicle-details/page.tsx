import type { Metadata } from "next";
import { CheckerLandingPage } from "@/components/tools/CheckerLandingPage";
import {
  absoluteUrl,
  buildPageMetadata,
  webApplicationJsonLd,
} from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Vehicle Details by Registration",
  description:
    "Look up UK vehicle details by registration including make, model, fuel type, colour and year of manufacture where available.",
  path: "/vehicle-details",
});

export default function VehicleDetailsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            webApplicationJsonLd({
              name: "AutoViewer Vehicle Details",
              description: "Look up UK vehicle details by registration.",
              url: absoluteUrl("/vehicle-details"),
            }),
          ),
        }}
      />
      <CheckerLandingPage
        toolKey="vehicle-details"
        checkSource="vehicle-details"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Vehicle Details" },
        ]}
        eyebrow="Specifications"
        title="Vehicle details by registration"
        description="Confirm make, model, fuel type, colour and other available specification details."
        buttonLabel="Look up details →"
        whatYoullSee={[
          {
            title: "Core identity",
            text: "Make, model and year information where the data source provides it.",
          },
          {
            title: "Fuel and engine",
            text: "Fuel type and engine capacity help with running-cost expectations.",
          },
          {
            title: "Useful buying context",
            text: "Colour and related attributes help you verify the car matches the advert.",
          },
        ]}
        howItWorks={[
          {
            step: "Enter the registration",
            text: "Match the plate to the advert or the car in front of you.",
          },
          {
            step: "Confirm the basics",
            text: "Check that make, fuel type and year align with what you were told.",
          },
          {
            step: "Continue deeper checks",
            text: "Use MOT, tax and mileage tools for the fuller picture.",
          },
        ]}
        explanation={
          <>
            <h2>Verify the car matches the advert</h2>
            <p>
              Before travelling to view a used car, confirm the registration
              details look right. Mismatched fuel type, year or colour can be an
              early warning that something in the listing is incomplete or wrong.
            </p>
            <p>
              Vehicle details are most useful when combined with MOT history, tax
              status and a careful in-person inspection.
            </p>
          </>
        }
        faqs={[
          {
            question: "Will I always see the exact model name?",
            answer:
              "Model naming can vary by data source. Treat the returned details as a strong guide and confirm trim in person.",
          },
          {
            question: "Can I get engine size?",
            answer:
              "Engine capacity is shown when available from the configured vehicle data source.",
          },
          {
            question: "Does this replace a full history check?",
            answer:
              "No. Specifications are only one part of a buying decision.",
          },
        ]}
      />
    </>
  );
}
