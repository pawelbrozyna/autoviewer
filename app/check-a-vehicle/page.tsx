import type { Metadata } from "next";
import { CheckerLandingPage } from "@/components/tools/CheckerLandingPage";
import {
  absoluteUrl,
  buildPageMetadata,
  webApplicationJsonLd,
} from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Vehicle Check by Registration - Free UK Car Check",
  description:
    "Enter a UK registration for a free vehicle check covering MOT history, tax status, mileage readings, recalls and key vehicle details.",
  path: "/check-a-vehicle",
});

export default function CheckAVehiclePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            webApplicationJsonLd({
              name: "AutoViewer Vehicle Check",
              description:
                "Free UK vehicle check by registration for MOT, tax, mileage and more.",
              url: absoluteUrl("/check-a-vehicle"),
            }),
          ),
        }}
      />
      <CheckerLandingPage
        toolKey="check-a-vehicle"
        checkSource="check-a-vehicle"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Check a Vehicle" },
        ]}
        eyebrow="Free UK car check"
        title="Vehicle check by registration"
        description="Check MOT history, tax, mileage, recalls and vehicle details in one clear report."
        whatYoullSee={[
          {
            title: "Status at a glance",
            text: "See MOT and tax status quickly, alongside key vehicle identity details.",
          },
          {
            title: "History that matters",
            text: "Review MOT results, recorded mileage and available recall information.",
          },
          {
            title: "Buyer-focused summary",
            text: "Understand what the available history suggests before you commit.",
          },
        ]}
        howItWorks={[
          {
            step: "Enter the registration",
            text: "Type the number plate. We’ll normalise spacing and capitalisation automatically.",
          },
          {
            step: "We look up available data",
            text: "Where configured, AutoViewer requests information from official UK data sources.",
          },
          {
            step: "Read a clear report",
            text: "Results are organised so you can scan status first, then dig into detail.",
          },
        ]}
        explanation={
          <>
            <h2>A clearer free car check for UK buyers</h2>
            <p>
              Buying a used car is easier when the important facts are in one place.
              AutoViewer helps you check a vehicle by registration and review MOT
              history, tax or SORN status, mileage readings from tests, available
              recall information and core vehicle details.
            </p>
            <p>
              This is designed for quick decisions - not endless tabs. Enter a
              registration, scan the status overview, then open the sections that
              matter for your purchase.
            </p>
            <p>
              Vehicle information may be sourced from official UK government
              datasets and services. AutoViewer is an independent product and is
              not affiliated with or endorsed by DVLA or DVSA.
            </p>
          </>
        }
        faqs={[
          {
            question: "Is the vehicle check free?",
            answer:
              "Yes. AutoViewer’s core registration check is free to use. Future premium provenance data would be clearly separated if introduced.",
          },
          {
            question: "What registration formats are accepted?",
            answer:
              "Enter a UK number plate in any common spacing. We uppercase and strip spaces before lookup.",
          },
          {
            question: "Does this include finance or write-off data?",
            answer:
              "Not from DVLA/DVSA sources. Outstanding finance, stolen and write-off checks would require a separate commercial provider.",
          },
        ]}
      />
    </>
  );
}
