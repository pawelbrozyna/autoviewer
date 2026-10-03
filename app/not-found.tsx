import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { VehicleSearchForm } from "@/components/vehicle/VehicleSearchForm";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

const popularLinks = [
  { href: "/check-a-vehicle", label: "Check a vehicle" },
  { href: "/mot-history", label: "MOT history check" },
  { href: "/mileage-check", label: "Mileage check" },
  { href: "/compare-cars", label: "Compare cars" },
  { href: "/guides", label: "Used car guides" },
  { href: "/", label: "Homepage" },
];

export default function NotFound() {
  return (
    <section className="border-b border-border bg-[#f4f6f9]">
      <Container className="tool-hero-y">
        <p className="eyebrow">Error 404</p>
        <h1 className="heading-page mt-2">Page not found</h1>
        <p className="body-copy mt-3 max-w-xl">
          The page you were looking for does not exist or has moved. You can
          still check a vehicle by registration below.
        </p>

        <div className="mt-5 max-w-xl md:mt-6">
          <VehicleSearchForm checkSource="unknown" />
        </div>

        <div className="mt-6 md:mt-8">
          <h2 className="eyebrow mb-3">Popular pages</h2>
          <ul className="flex flex-wrap gap-2">
            {popularLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-10 items-center rounded-[9px] border border-border bg-white px-3.5 text-[14px] font-semibold text-navy transition hover:border-navy/30 hover:bg-surface-soft"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
