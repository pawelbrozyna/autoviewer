import {
  Car,
  ClipboardList,
  Fuel,
  Gauge,
  Landmark,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const features = [
  {
    icon: ClipboardList,
    title: "MOT history check",
    description: "See past and present MOT results.",
    href: "/mot-history",
  },
  {
    icon: Gauge,
    title: "Car mileage check",
    description: "Review mileage recorded at each MOT.",
    href: "/mileage-check",
  },
  {
    icon: Landmark,
    title: "Car tax check",
    description: "Check tax and SORN status by registration.",
    href: "/car-tax-check",
  },
  {
    icon: ShieldAlert,
    title: "Car recall check",
    description: "See available manufacturer safety recall information.",
    href: "/recall-check",
  },
  {
    icon: Car,
    title: "Car details by registration",
    description: "Make, model, fuel and year from the number plate.",
    href: "/vehicle-details",
  },
  {
    icon: Fuel,
    title: "Running costs calculator",
    description: "Understand fuel, tax and ownership costs.",
    href: "/running-costs",
  },
];

const guides = [
  { href: "/guides/used-car-buying-checklist", label: "Used car buying checklist" },
  { href: "/guides/mot-advisories-explained", label: "MOT advisories explained" },
  { href: "/guides/cat-s-vs-cat-n", label: "Cat S vs Cat N" },
];

export function VehicleFeatureGrid() {
  return (
    <section className="bg-surface-soft pb-6 pt-3 md:pb-8 md:pt-4 lg:pb-7 lg:pt-3">
      <Container>
        <SectionHeading
          eyebrow="Everything you need"
          title="Clearer information. Greater confidence."
          action={{
            href: "/check-a-vehicle",
            label: "Free car reg check →",
          }}
        />
        <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.title}
                href={feature.href}
                className="group flex items-start gap-2.5 rounded-[12px] py-0.5 lg:gap-2.5 lg:p-1"
              >
                <div className="shrink-0 text-blue">
                  <Icon className="h-5 w-5 lg:h-5 lg:w-5" strokeWidth={1.6} />
                </div>
                <div className="min-w-0">
                  <h3 className="heading-card group-hover:text-blue">
                    {feature.title}
                  </h3>
                  <p className="support-copy mt-0.5 lg:mt-1">{feature.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-4 text-[15px] md:mt-6">
          <span className="font-semibold text-navy">Buying guides:</span>
          {guides.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="font-semibold text-blue hover:text-blue-hover"
            >
              {guide.label}
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
