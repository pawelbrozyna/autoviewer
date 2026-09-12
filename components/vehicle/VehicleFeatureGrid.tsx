import {
  ClipboardList,
  Gauge,
  ShieldAlert,
  Fuel,
  LineChart,
} from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const features = [
  {
    icon: ClipboardList,
    title: "MOT history",
    description: "See past and present MOT results.",
    href: "/mot-history",
  },
  {
    icon: Gauge,
    title: "Tax & mileage",
    description: "Check tax status and recorded mileage together.",
    href: "/tax-mileage",
  },
  {
    icon: ShieldAlert,
    title: "Recall search",
    description: "See available manufacturer safety recall information.",
    href: "/recall-check",
  },
  {
    icon: Fuel,
    title: "Running costs",
    description: "Understand fuel, tax and ownership costs.",
    href: "/running-costs",
  },
  {
    icon: LineChart,
    title: "Buyer score",
    description: "Get a simple indication from available history.",
    href: "/check-a-vehicle",
  },
];

export function VehicleFeatureGrid() {
  return (
    <section className="bg-surface-soft pb-7 pt-4 md:pb-9 md:pt-5 lg:pb-8 lg:pt-4">
      <Container>
        <SectionHeading
          eyebrow="Everything you need"
          title="Clearer information. Greater confidence."
          action={{
            href: "/check-a-vehicle",
            label: "Learn more about our checks →",
          }}
        />
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-4 xl:grid-cols-5 xl:gap-3.5">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.title}
                href={feature.href}
                className="group flex items-start gap-3 rounded-[12px] p-1 lg:gap-2.5"
              >
                <div className="shrink-0 text-blue">
                  <Icon className="h-6 w-6 lg:h-5 lg:w-5" strokeWidth={1.6} />
                </div>
                <div className="min-w-0">
                  <h3 className="heading-card group-hover:text-blue">
                    {feature.title}
                  </h3>
                  <p className="support-copy mt-1">{feature.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
