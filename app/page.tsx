import type { Metadata } from "next";
import { ExampleReport } from "@/components/home/ExampleReport";
import { HomeCompareSection } from "@/components/home/HomeCompareSection";
import { HomeHero } from "@/components/home/HomeHero";
import { VehicleFeatureGrid } from "@/components/vehicle/VehicleFeatureGrid";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Free Car Check UK - MOT, Tax, Mileage & Vehicle History | AutoViewer",
  description:
    "Free UK car check for MOT history, tax, mileage, recalls and vehicle details. Simple, fast and built for used car buyers.",
  path: "/",
  absoluteTitle: true,
});

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <ExampleReport />
      <HomeCompareSection />
      <VehicleFeatureGrid />
    </>
  );
}
