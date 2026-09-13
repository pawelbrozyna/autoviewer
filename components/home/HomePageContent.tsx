import { ExampleReport } from "@/components/home/ExampleReport";
import { HomeCompareSection } from "@/components/home/HomeCompareSection";
import { HomeHero } from "@/components/home/HomeHero";
import { VehicleFeatureGrid } from "@/components/vehicle/VehicleFeatureGrid";

/** Full homepage content. Kept intact for easy restore when Coming Soon ends. */
export function HomePageContent() {
  return (
    <>
      <HomeHero />
      <ExampleReport />
      <HomeCompareSection />
      <VehicleFeatureGrid />
    </>
  );
}
