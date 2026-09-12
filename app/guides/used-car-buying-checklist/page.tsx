import type { Metadata } from "next";
import Link from "next/link";
import { GuideLayout } from "@/components/guides/GuideLayout";
import { buildPageMetadata, breadcrumbJsonLd } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Used Car Buying Checklist",
  description:
    "A practical UK used car buying checklist covering registration checks, MOT history, mileage, finance, documents and the test drive.",
  path: "/guides/used-car-buying-checklist",
});

export default function UsedCarChecklistPage() {
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
                name: "Used car buying checklist",
                path: "/guides/used-car-buying-checklist",
              },
            ]),
          ),
        }}
      />
      <GuideLayout
        title="Used car buying checklist"
        description="A practical sequence of checks before you pay for a used car in the UK."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Guides", href: "/guides" },
          { label: "Buying checklist" },
        ]}
      >
        <p>
          Use this checklist alongside AutoViewer’s{" "}
          <Link href="/check-a-vehicle">vehicle check</Link>. Free official-source
          data covers a useful slice of the picture - MOT, tax, mileage readings and
          available recall indications - but it does not automatically include
          finance, stolen or write-off status.
        </p>

        <h2>1. Registration and VIN checks</h2>
        <ul>
          <li>Confirm the registration matches the advert and V5C.</li>
          <li>Check the VIN on the car matches paperwork.</li>
          <li>
            Run a <Link href="/check-a-vehicle">registration check</Link> before
            travelling to view.
          </li>
        </ul>

        <h2>2. MOT history</h2>
        <ul>
          <li>Review recent passes, fails and repeated advisories.</li>
          <li>
            Read{" "}
            <Link href="/guides/mot-advisories-explained">
              MOT advisories explained
            </Link>{" "}
            if defect wording is unclear.
          </li>
        </ul>

        <h2>3. Mileage</h2>
        <ul>
          <li>Compare MOT mileage readings for unusual drops.</li>
          <li>Check the odometer in person and compare wear to stated miles.</li>
        </ul>

        <h2>4. Finance, write-offs and stolen status</h2>
        <p>
          These usually require commercial vehicle-history data. AutoViewer does
          not invent this information from DVLA/DVSA sources. Ask the seller
          directly and consider a paid provenance check before transferring money.
        </p>

        <h2>5. Service history</h2>
        <ul>
          <li>Look for stamped books, digital records or invoices.</li>
          <li>Timing belt / wet belt intervals matter on many engines.</li>
        </ul>

        <h2>6. Tyres and brakes</h2>
        <ul>
          <li>Check tread depth, uneven wear and brake feel on a test drive.</li>
          <li>Budget for near-limit tyres if needed.</li>
        </ul>

        <h2>7. Test drive</h2>
        <ul>
          <li>Listen for unusual noises, check warning lights and gear changes.</li>
          <li>Drive at low and higher speeds if safe and legal to do so.</li>
        </ul>

        <h2>8. Documents</h2>
        <ul>
          <li>V5C in the seller’s name where expected.</li>
          <li>Service invoices, spare keys and locking-wheel-nut key.</li>
        </ul>

        <h2>Final checklist</h2>
        <ul>
          <li>Registration check complete</li>
          <li>MOT and mileage reviewed</li>
          <li>Tax/SORN understood</li>
          <li>Finance/write-off questions asked</li>
          <li>Inspection and paperwork satisfied</li>
        </ul>
      </GuideLayout>
    </>
  );
}
