import type { Metadata } from "next";
import Link from "next/link";
import { GuideLayout } from "@/components/guides/GuideLayout";
import { buildPageMetadata, breadcrumbJsonLd } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "MOT Advisories Explained",
  description:
    "Understand MOT advisories, minor, major and dangerous defects - and what used car buyers should do about them.",
  path: "/guides/mot-advisories-explained",
});

export default function MotAdvisoriesGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Guides", path: "/guides" },
              {
                name: "MOT advisories explained",
                path: "/guides/mot-advisories-explained",
              },
            ]),
          ),
        }}
      />
      <GuideLayout
        title="MOT advisories explained"
        description="What advisory, minor, major and dangerous defects mean for buyers."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Guides", href: "/guides" },
          { label: "MOT advisories" },
        ]}
      >
        <p>
          After you run an{" "}
          <Link href="/mot-history">MOT history check</Link>, defect wording can
          look technical. This guide translates the main categories into practical
          buyer language.
        </p>

        <h2>Advisory</h2>
        <p>
          An advisory highlights something that may need attention in future. The
          car can still pass. Repeated advisories on the same area - tyres,
          corrosion, oil leaks - are a signal to inspect carefully and budget for
          work.
        </p>

        <h2>Minor</h2>
        <p>
          Minor defects are not severe enough to fail the test under current rules,
          but they are recorded. Ask whether they have been fixed since the test.
        </p>

        <h2>Major</h2>
        <p>
          Major defects cause an MOT failure. The vehicle should not be driven on
          public roads until repaired and retested, except to a pre-arranged repair
          appointment in limited circumstances. For buyers, a recent major fail
          deserves a clear explanation and evidence of repair.
        </p>

        <h2>Dangerous</h2>
        <p>
          Dangerous defects are the most serious failure category. Do not treat
          these lightly. Confirm repairs with invoices and a fresh pass before
          purchase.
        </p>

        <h2>Repeated advisories</h2>
        <p>
          One advisory may be routine. The same advisory appearing year after year
          can mean deferred maintenance. Factor likely repair costs into the price.
        </p>

        <h2>What a buyer should do</h2>
        <ul>
          <li>Read the latest test first, then scan older failures.</li>
          <li>Ask the seller what was repaired after any fail.</li>
          <li>Budget for outstanding advisories that look imminent.</li>
          <li>
            Combine MOT history with a careful inspection - an MOT is not a full
            mechanical survey.
          </li>
        </ul>
      </GuideLayout>
    </>
  );
}
