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
    <div className="bg-white">
      <Container className="max-w-[900px] py-6 md:py-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "About" },
          ]}
          className="mb-3"
        />
        <h1 className="text-[1.5rem] font-bold tracking-tight text-navy md:text-[1.75rem]">
          About AutoViewer
        </h1>

        <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-muted md:mt-5 md:text-[16px]">
          <p>
            Buying a used car should not mean jumping between multiple websites,
            trying to decode MOT records or guessing what the numbers actually
            mean.
          </p>
          <p>
            AutoViewer brings useful UK vehicle information together in one clear
            place.
          </p>
          <p>
            Enter a registration and quickly see the details that matter - MOT
            history, recorded mileage, tax status, recalls, vehicle information
            and buying insights.
          </p>
          <p className="border-l-[3px] border-navy pl-3.5 font-semibold text-navy">
            Our goal is simple: make vehicle data easier to understand before you
            buy.
          </p>
        </div>

        <section className="mt-8 border-t border-border pt-7 md:mt-9 md:pt-8">
          <h2 className="heading-section">What AutoViewer helps you understand</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 md:mt-5 md:gap-3.5">
            {helpItems.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="rounded-[12px] border border-border bg-white p-3.5"
                >
                  <Icon
                    className="h-5 w-5 text-navy"
                    aria-hidden
                    strokeWidth={1.75}
                  />
                  <h3 className="mt-2 text-[15px] font-semibold text-navy">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-[14px] leading-snug text-muted">
                    {item.body}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-8 border-t border-border pt-7 md:mt-9 md:pt-8">
          <h2 className="heading-section">Independent and straightforward</h2>
          <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-muted md:text-[16px]">
            <p>AutoViewer is an independent service.</p>
            <p>
              We are not affiliated with or endorsed by DVLA, DVSA or any vehicle
              manufacturer.
            </p>
            <p>
              Where available, we use official UK vehicle data and present it in
              a simpler, more useful format.
            </p>
            <p>
              We do not want to overwhelm users with jargon, dozens of tabs or
              meaningless statistics.
            </p>
            <p>
              If a piece of information can help someone make a better buying
              decision, we show it clearly.
            </p>
            <p>
              If we do not have reliable data, we do not pretend that we do.
            </p>
          </div>
          <aside className="mt-5 rounded-[12px] border border-border bg-surface-soft p-4">
            <p className="eyebrow mb-2.5">Our approach</p>
            <ul className="space-y-2.5 text-[15px] leading-snug text-navy">
              <li className="border-b border-border pb-2.5">
                Official sources where available
              </li>
              <li className="border-b border-border pb-2.5">
                Clear presentation over noise
              </li>
              <li className="border-b border-border pb-2.5">
                No invented conclusions
              </li>
              <li>Inspection still comes first</li>
            </ul>
          </aside>
        </section>

        <section className="mt-8 border-t border-border pt-7 md:mt-9 md:pt-8">
          <h2 className="heading-section">What the Buyer Score means</h2>
          <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(240px,0.8fr)] lg:items-start lg:gap-8">
            <div className="space-y-3 text-[15px] leading-relaxed text-muted md:text-[16px]">
              <p>
                The AutoViewer Buyer Score is our interpretation of the vehicle
                history available to us.
              </p>
              <p>It can consider signals such as:</p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>MOT results</li>
                <li>repeated defects or advisories</li>
                <li>mileage consistency</li>
                <li>safety recalls</li>
              </ul>
              <p>It is designed to make patterns easier to understand.</p>
              <div className="rounded-[12px] border border-border bg-surface-soft px-4 py-3">
                <p className="text-[15px] font-semibold leading-snug text-navy">
                  It is not a mechanical inspection, valuation or guarantee of
                  vehicle condition.
                </p>
                <p className="mt-1.5 text-[14px] leading-snug text-muted">
                  A vehicle should always be inspected properly before purchase.
                </p>
              </div>
            </div>
            <AboutBuyerScoreExample />
          </div>
        </section>

        <section className="mt-8 border-t border-border pt-7 md:mt-9 md:pt-8">
          <h2 className="heading-section">Built for UK car buyers</h2>
          <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-muted md:text-[16px]">
            <p>AutoViewer is designed around the UK used-car market.</p>
            <p>
              From MOT history to road tax and registration-based checks, the
              product is built around the information UK buyers actually use.
            </p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {ukPoints.map((point) => {
              const Icon = point.icon;
              return (
                <div
                  key={point.title}
                  className="flex items-center gap-2.5 rounded-[12px] border border-border px-3.5 py-3"
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
        </section>

        <section className="mt-8 border-t border-border pt-7 md:mt-9 md:pt-8">
          <h2 className="heading-section">Our approach</h2>
          <div className="mt-5 grid gap-0 sm:grid-cols-2">
            {principles.map((item, index) => (
              <div
                key={item.title}
                className={cn(
                  "py-4 sm:px-4 sm:py-3",
                  index > 0 && "border-t border-border sm:border-t-0",
                  index % 2 === 1 && "sm:border-l",
                  index > 1 && "sm:border-t",
                )}
              >
                <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-1.5 text-[1.15rem] font-bold tracking-tight text-navy">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-[15px] leading-snug text-muted">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 border-t border-border pt-7 md:mt-9 md:pt-8">
          <h2 className="heading-section">Where AutoViewer is going</h2>
          <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-muted md:text-[16px]">
            <p>AutoViewer is still growing.</p>
            <p>
              We are building towards a single place where someone can check,
              understand and compare a car before buying it - without needing to
              become a vehicle-data expert first.
            </p>
          </div>
          <p className="mt-4 text-[1.15rem] font-bold tracking-tight text-navy md:text-[1.25rem]">
            Know more before you buy.
          </p>
        </section>

        <section className="mt-8 border-t border-border pt-7 md:mt-9 md:pt-8">
          <div className="rounded-[12px] border border-border bg-surface-soft p-4 md:p-5">
            <h2 className="heading-section">Ready to check a vehicle?</h2>
            <p className="mt-2 text-[15px] text-muted md:text-[16px]">
              Enter a UK registration and see the information available for that
              vehicle.
            </p>
            <div className="mt-4 max-w-xl">
              <VehicleSearchForm
                buttonLabel="Check vehicle →"
                checkSource="about"
              />
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}
