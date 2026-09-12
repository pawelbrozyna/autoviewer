import type { Metadata } from "next";
import {
  CarFront,
  ClipboardList,
  Gauge,
  BadgePoundSterling,
  ShieldAlert,
  Columns2,
  Calculator,
  Sparkles,
  ScanSearch,
  FileSearch,
  Landmark,
  GitCompare,
} from "lucide-react";
import { AboutBuyerScoreExample } from "@/components/about/AboutBuyerScoreExample";
import { HeroMobileGradient } from "@/components/layout/ToolHeroBackdrop";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { VehicleSearchForm } from "@/components/vehicle/VehicleSearchForm";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildPageMetadata({
  title: "About AutoViewer - UK Vehicle Checks Made Clear",
  description:
    "Learn how AutoViewer helps UK car buyers understand MOT history, mileage, tax, recalls, running costs and vehicle information before buying.",
  path: "/about",
  absoluteTitle: true,
});

const helpItems = [
  {
    title: "Check a vehicle",
    body: "Check key information using a UK registration.",
    icon: ScanSearch,
  },
  {
    title: "MOT history",
    body: "Review past test results, failures, defects and advisories.",
    icon: ClipboardList,
  },
  {
    title: "Mileage",
    body: "Follow recorded mileage over time and spot inconsistencies.",
    icon: Gauge,
  },
  {
    title: "Tax & SORN",
    body: "See available road tax and SORN information.",
    icon: BadgePoundSterling,
  },
  {
    title: "Safety recalls",
    body: "See available manufacturer recall information.",
    icon: ShieldAlert,
  },
  {
    title: "Compare cars",
    body: "Compare two vehicles side by side.",
    icon: Columns2,
  },
  {
    title: "Running costs",
    body: "Understand estimated fuel, tax and ownership costs.",
    icon: Calculator,
  },
  {
    title: "Buyer Score",
    body: "See a simple interpretation of available vehicle history.",
    icon: Sparkles,
  },
] as const;

const ukPoints = [
  {
    title: "UK registration checks",
    icon: CarFront,
  },
  {
    title: "MOT-focused history",
    icon: FileSearch,
  },
  {
    title: "Road tax information",
    icon: Landmark,
  },
  {
    title: "Clear used-car comparisons",
    icon: GitCompare,
  },
] as const;

const principles = [
  {
    title: "Clear data",
    body: "Show useful information without unnecessary jargon.",
  },
  {
    title: "Simple tools",
    body: "Make important vehicle checks easy to use.",
  },
  {
    title: "Fewer clicks",
    body: "Help users get answers quickly.",
  },
  {
    title: "Better decisions",
    body: "Turn raw vehicle history into understandable information.",
  },
] as const;

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-surface-soft">
        <HeroMobileGradient />
        <Container className="relative tool-hero-y max-w-[1240px]">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "About" },
            ]}
          />
          <p className="eyebrow mb-2.5 md:mb-3">About AutoViewer</p>
          <h1 className="heading-page max-w-3xl">
            Clear vehicle information.
            <br className="hidden sm:block" /> Better buying decisions.
          </h1>
          <div className="body-copy mt-4 max-w-3xl space-y-3 md:mt-5">
            <p>
              Buying a used car should not mean jumping between multiple
              websites, trying to decode MOT records or guessing what the
              numbers actually mean.
            </p>
            <p>
              AutoViewer brings useful UK vehicle information together in one
              clear place.
            </p>
            <p>
              Enter a registration and quickly see the details that matter -
              MOT history, recorded mileage, tax status, recalls, vehicle
              information and buying insights.
            </p>
          </div>
          <p className="mt-5 max-w-2xl border-l-[3px] border-navy pl-4 text-[16px] font-semibold leading-snug text-navy md:mt-6 md:text-[17px]">
            Our goal is simple:
            <span className="mt-1 block font-medium text-navy/80">
              make vehicle data easier to understand before you buy.
            </span>
          </p>
        </Container>
      </section>

      {/* What AutoViewer helps with */}
      <section className="border-b border-border bg-white py-8 md:py-10">
        <Container className="max-w-[1240px]">
          <h2 className="heading-section">What AutoViewer helps you understand</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 md:mt-6 md:gap-3.5">
            {helpItems.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="rounded-[12px] border border-border bg-white p-3.5 md:p-4"
                >
                  <Icon
                    className="h-5 w-5 text-navy"
                    aria-hidden
                    strokeWidth={1.75}
                  />
                  <h3 className="mt-2.5 text-[15px] font-semibold text-navy md:text-[16px]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-[14px] leading-snug text-muted md:text-[15px]">
                    {item.body}
                  </p>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Independent */}
      <section className="border-b border-border bg-surface-soft py-8 md:py-10">
        <Container className="max-w-[1240px]">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.85fr)] lg:items-start lg:gap-10">
            <div>
              <h2 className="heading-section">Independent and straightforward</h2>
              <div className="body-copy mt-4 max-w-3xl space-y-3">
                <p>AutoViewer is an independent service.</p>
                <p>
                  We are not affiliated with or endorsed by DVLA, DVSA or any
                  vehicle manufacturer.
                </p>
                <p>
                  Where available, we use official UK vehicle data and present it
                  in a simpler, more useful format.
                </p>
                <p>
                  We do not want to overwhelm users with jargon, dozens of tabs
                  or meaningless statistics.
                </p>
                <p>
                  If a piece of information can help someone make a better buying
                  decision, we show it clearly.
                </p>
                <p>
                  If we do not have reliable data, we do not pretend that we do.
                </p>
              </div>
            </div>
            <aside className="rounded-[12px] border border-border bg-white p-4 md:p-5">
              <p className="eyebrow mb-2.5">Our approach</p>
              <ul className="space-y-3 text-[15px] leading-snug text-navy">
                <li className="border-b border-border pb-3">
                  Official sources where available
                </li>
                <li className="border-b border-border pb-3">
                  Clear presentation over noise
                </li>
                <li className="border-b border-border pb-3">
                  No invented conclusions
                </li>
                <li>Inspection still comes first</li>
              </ul>
            </aside>
          </div>
        </Container>
      </section>

      {/* Buyer Score */}
      <section className="border-b border-border bg-white py-8 md:py-10">
        <Container className="max-w-[1240px]">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)] lg:items-start lg:gap-10">
            <div>
              <h2 className="heading-section">What the Buyer Score means</h2>
              <div className="body-copy mt-4 max-w-3xl space-y-3">
                <p>
                  The AutoViewer Buyer Score is our interpretation of the
                  vehicle history available to us.
                </p>
                <p>It can consider signals such as:</p>
                <ul className="list-disc space-y-1.5 pl-5">
                  <li>MOT results</li>
                  <li>repeated defects or advisories</li>
                  <li>mileage consistency</li>
                  <li>safety recalls</li>
                </ul>
                <p>It is designed to make patterns easier to understand.</p>
              </div>
              <div className="mt-5 rounded-[12px] border border-border bg-surface-soft px-4 py-3.5 md:px-5">
                <p className="text-[15px] font-semibold leading-snug text-navy md:text-[16px]">
                  It is not a mechanical inspection, valuation or guarantee of
                  vehicle condition.
                </p>
                <p className="mt-1.5 text-[14px] leading-snug text-muted md:text-[15px]">
                  A vehicle should always be inspected properly before purchase.
                </p>
              </div>
            </div>
            <AboutBuyerScoreExample />
          </div>
        </Container>
      </section>

      {/* Built for UK buyers */}
      <section className="border-b border-border bg-surface-soft py-8 md:py-10">
        <Container className="max-w-[1240px]">
          <h2 className="heading-section">Built for UK car buyers</h2>
          <p className="body-copy mt-4 max-w-3xl">
            AutoViewer is designed around the UK used-car market.
          </p>
          <p className="body-copy mt-3 max-w-3xl">
            From MOT history to road tax and registration-based checks, the
            product is built around the information UK buyers actually use.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 md:mt-6">
            {ukPoints.map((point) => {
              const Icon = point.icon;
              return (
                <div
                  key={point.title}
                  className="flex items-center gap-2.5 rounded-[12px] border border-border bg-white px-3.5 py-3"
                >
                  <Icon
                    className="h-5 w-5 shrink-0 text-navy"
                    aria-hidden
                    strokeWidth={1.75}
                  />
                  <span className="text-[14px] font-semibold text-navy md:text-[15px]">
                    {point.title}
                  </span>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Product principles */}
      <section className="border-b border-border bg-white py-8 md:py-10">
        <Container className="max-w-[1240px]">
          <h2 className="heading-section">Our approach</h2>
          <div className="mt-6 grid gap-0 md:mt-7 md:grid-cols-2 lg:grid-cols-4">
            {principles.map((item, index) => (
              <div
                key={item.title}
                className={cn(
                  "py-4 md:px-5 md:py-1",
                  index > 0 && "border-t border-border md:border-t-0 md:border-l",
                )}
              >
                <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-[1.2rem] font-bold tracking-tight text-navy md:text-[1.3rem]">
                  {item.title}
                </h3>
                <p className="mt-2 text-[15px] leading-snug text-muted md:text-[16px]">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Direction */}
      <section className="border-b border-border bg-surface-soft py-8 md:py-10">
        <Container className="max-w-[1240px]">
          <h2 className="heading-section">Where AutoViewer is going</h2>
          <div className="body-copy mt-4 max-w-3xl space-y-3">
            <p>AutoViewer is still growing.</p>
            <p>
              We are building towards a single place where someone can check,
              understand and compare a car before buying it - without needing to
              become a vehicle-data expert first.
            </p>
          </div>
          <p className="mt-5 text-[1.25rem] font-bold tracking-tight text-navy md:text-[1.4rem]">
            Know more before you buy.
          </p>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="bg-white py-8 md:py-10">
        <Container className="max-w-[1240px]">
          <div className="rounded-[12px] border border-border bg-surface-soft p-4 md:p-6">
            <h2 className="heading-section">Ready to check a vehicle?</h2>
            <p className="body-copy mt-2.5 max-w-2xl">
              Enter a UK registration and see the information available for that
              vehicle.
            </p>
            <div className="mt-4 max-w-xl md:mt-5">
              <VehicleSearchForm buttonLabel="Check vehicle →" checkSource="about" />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
