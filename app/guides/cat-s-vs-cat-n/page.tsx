import type { Metadata } from "next";
import Link from "next/link";
import { GuideLayout } from "@/components/guides/GuideLayout";
import { buildPageMetadata, breadcrumbJsonLd } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Cat S vs Cat N Explained",
  description:
    "Clear explanation of Cat S and Cat N insurance write-off categories for UK used car buyers.",
  path: "/guides/cat-s-vs-cat-n",
});

export default function CatSVsCatNPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Guides", path: "/guides" },
              { name: "Cat S vs Cat N", path: "/guides/cat-s-vs-cat-n" },
            ]),
          ),
        }}
      />
      <GuideLayout
        title="Cat S vs Cat N explained"
        description="What insurance write-off categories mean - and what free government vehicle data does not include."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Guides", href: "/guides" },
          { label: "Cat S vs Cat N" },
        ]}
      >
        <p>
          Cat S and Cat N are insurance write-off categories used in the UK. They
          describe how an insurer classified damage after a claim. They are{" "}
          <strong>not</strong> automatically included in free DVLA/DVSA vehicle
          lookup data shown by AutoViewer today.
        </p>

        <h2>Cat S (structural)</h2>
        <p>
          Cat S generally means the insurer decided the vehicle had structural
          damage and was uneconomical to repair at the time of the claim. A Cat S
          car can return to the road after professional repair, but buyers should
          be cautious about repair quality, future insurance and resale value.
        </p>

        <h2>Cat N (non-structural)</h2>
        <p>
          Cat N generally means the damage was not considered structural, but the
          insurer still wrote the vehicle off - often because repair costs exceeded
          the car’s value. Non-structural does not automatically mean minor.
          Electrical, safety-system or cosmetic repairs can still be significant.
        </p>

        <h2>What AutoViewer shows today</h2>
        <p>
          AutoViewer’s free checks focus on official-source vehicle information
          such as MOT history, tax/SORN and available mileage readings. Write-off
          category, outstanding finance and stolen status require commercial
          provenance data and are intentionally separated in our architecture for
          a future provider integration.
        </p>

        <h2>Buyer takeaways</h2>
        <ul>
          <li>Ask the seller directly about previous insurance claims.</li>
          <li>Consider a paid full history check before large purchases.</li>
          <li>
            Continue with a{" "}
            <Link href="/check-a-vehicle">registration check</Link> for MOT, tax
            and mileage context.
          </li>
          <li>
            Use our <Link href="/guides/used-car-buying-checklist">buying checklist</Link>{" "}
            before you transfer funds.
          </li>
        </ul>
      </GuideLayout>
    </>
  );
}
