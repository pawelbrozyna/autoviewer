import type { Metadata } from "next";
import Link from "next/link";
import { CheckerLandingPage } from "@/components/tools/CheckerLandingPage";
import {
  absoluteUrl,
  buildPageMetadata,
  webApplicationJsonLd,
} from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "MOT History Check - Free UK MOT Checker",
  description:
    "Free MOT history check by UK registration. See pass and fail results, mileage at test and recorded defects.",
  path: "/mot-history",
});

export default function MotHistoryPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            webApplicationJsonLd({
              name: "AutoViewer MOT History Check",
              description: "Free UK MOT history checker by registration.",
              url: absoluteUrl("/mot-history"),
            }),
          ),
        }}
      />
      <CheckerLandingPage
        toolKey="mot-history"
        checkSource="mot-history"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "MOT History" },
        ]}
        eyebrow="MOT checker"
        title="MOT history check"
        description="See past and present MOT results, recorded mileage and defects for a UK registration."
        buttonLabel="Check MOT history →"
        whatYoullSee={[
          {
            title: "Pass and fail outcomes",
            text: "A clear timeline of MOT results so you can spot patterns quickly.",
          },
          {
            title: "Mileage at each test",
            text: "Compare readings between tests and watch for inconsistencies.",
          },
          {
            title: "Defect detail",
            text: "Where available, defects are grouped as dangerous, major, minor or advisory.",
          },
        ]}
        howItWorks={[
          {
            step: "Enter the number plate",
            text: "Use the registration shown on the vehicle.",
          },
          {
            step: "Review the MOT timeline",
            text: "Scan recent results first, then open older tests if needed.",
          },
          {
            step: "Read advisories carefully",
            text: "Advisories are not fails, but repeated issues can still matter when buying.",
          },
        ]}
        explanation={
          <>
            <h2>Why MOT history matters when buying</h2>
            <p>
              An MOT certificate only confirms the car met the minimum standard on
              the day of the test. The history behind it often tells a clearer story:
              repeated advisories, recent failures, or sudden mileage changes.
            </p>
            <p>
              Use the MOT checker before viewing a car, then cross-check what you see
              on the day - tyres, brakes, warning lights and service paperwork.
            </p>
            <p>
              For defect categories, read our guide:{" "}
              <Link href="/guides/mot-advisories-explained">
                MOT advisories explained
              </Link>
              .
            </p>
          </>
        }
        faqs={[
          {
            question: "Can I check MOT history for free?",
            answer:
              "Yes. Enter a UK registration to view available MOT history through AutoViewer.",
          },
          {
            question: "What does an advisory mean?",
            answer:
              "An advisory highlights something worth monitoring. It is not an automatic fail, but buyers should still assess the risk and cost.",
          },
          {
            question: "Does a recent pass guarantee the car is sound?",
            answer:
              "No. An MOT is not a full mechanical inspection and condition can change after the test date.",
          },
        ]}
      />
    </>
  );
}
