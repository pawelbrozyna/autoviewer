import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/layout/PageHero";
import { VehicleSearchForm } from "@/components/vehicle/VehicleSearchForm";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Used Car Buying Guides",
  description:
    "Practical UK used car buying guides covering MOT advisories, write-off categories and a clear pre-purchase checklist.",
  path: "/guides",
});

const guides = [
  {
    href: "/guides/used-car-buying-checklist",
    title: "Used car buying checklist",
    description:
      "A practical checklist covering registration checks, MOT, mileage, documents and the test drive.",
  },
  {
    href: "/guides/mot-advisories-explained",
    title: "MOT advisories explained",
    description:
      "Understand advisory, minor, major and dangerous defects - and what buyers should do next.",
  },
  {
    href: "/guides/cat-s-vs-cat-n",
    title: "Cat S vs Cat N",
    description:
      "A clear explanation of insurance write-off categories and why they matter when buying.",
  },
];

export default function GuidesIndexPage() {
  return (
    <>
      <PageHero
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Guides" },
        ]}
        title="Clear guidance for UK used car buyers"
        description="Short, practical articles to help you check a vehicle with more confidence."
        variant="tool"
      >
        <VehicleSearchForm
          buttonLabel="Check vehicle →"
          checkSource="guides"
        />
      </PageHero>

      <section className="section-y">
        <Container>
          <div className="grid gap-4 md:grid-cols-3 md:gap-5">
            {guides.map((guide) => (
              <Link
                key={guide.href}
                href={guide.href}
                className="rounded-[12px] border border-border bg-white p-5 transition-colors hover:border-blue/30 hover:bg-surface-soft"
              >
                <h2 className="heading-card">{guide.title}</h2>
                <p className="support-copy mt-2">{guide.description}</p>
                <span className="mt-3.5 inline-block text-[15px] font-semibold text-blue">
                  Read guide →
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
