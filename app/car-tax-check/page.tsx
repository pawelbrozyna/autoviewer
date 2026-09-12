import type { Metadata } from "next";
import { CheckerLandingPage } from "@/components/tools/CheckerLandingPage";
import {
  absoluteUrl,
  buildPageMetadata,
  webApplicationJsonLd,
} from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Car Tax Check - Check VED & SORN Status",
  description:
    "Check car tax and SORN status by UK registration. Confirm whether a vehicle is taxed, untaxed or declared SORN.",
  path: "/car-tax-check",
});

export default function CarTaxCheckPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            webApplicationJsonLd({
              name: "AutoViewer Car Tax Check",
              description: "Check UK car tax and SORN status by registration.",
              url: absoluteUrl("/car-tax-check"),
            }),
          ),
        }}
      />
      <CheckerLandingPage
        toolKey="car-tax-check"
        checkSource="car-tax-check"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Car Tax Check" },
        ]}
        eyebrow="Tax & SORN"
        title="Car tax check"
        description="Confirm current vehicle tax (VED) or SORN status using a UK registration."
        buttonLabel="Check tax status →"
        crossLink={{
          href: "/tax-mileage",
          label: "Need mileage history too?",
        }}
        whatYoullSee={[
          {
            title: "Taxed, untaxed or SORN",
            text: "A plain-language status so you know where the vehicle stands today.",
          },
          {
            title: "Due date where available",
            text: "See when tax is due if that information is returned by the data source.",
          },
          {
            title: "Context for buyers",
            text: "Tax status is useful context, but it is not a substitute for a full vehicle check.",
          },
        ]}
        howItWorks={[
          {
            step: "Enter the registration",
            text: "Use the number plate exactly as shown on the vehicle.",
          },
          {
            step: "Check the status",
            text: "We’ll show taxed, untaxed, SORN or unknown based on available data.",
          },
          {
            step: "Continue your checks",
            text: "Pair tax status with MOT history and mileage before buying.",
          },
        ]}
        explanation={
          <>
            <h2>Check car tax before you buy or drive</h2>
            <p>
              Road tax (VED) and SORN status are among the first things to confirm.
              A car showing as taxed is useful context for a buyer; a SORN declaration
              means the vehicle is not taxed and should not be used on public roads
              except in limited circumstances.
            </p>
            <p>
              AutoViewer presents tax status clearly alongside related checks so you
              can move on to MOT, mileage and running costs without switching tools.
            </p>
          </>
        }
        faqs={[
          {
            question: "What does SORN mean?",
            answer:
              "SORN is a Statutory Off Road Notification. It tells DVLA the vehicle is not being used or kept on a public road.",
          },
          {
            question: "Is tax the same as an MOT?",
            answer:
              "No. Tax and MOT are separate. A vehicle can be taxed without a valid MOT, and vice versa, depending on circumstances.",
          },
          {
            question: "Can I estimate yearly tax costs here?",
            answer:
              "Use the running costs calculator to estimate ownership costs including road tax.",
          },
        ]}
      />
    </>
  );
}
