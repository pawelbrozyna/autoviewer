import { ExampleReport } from "@/components/home/ExampleReport";
import { HomeCompareSection } from "@/components/home/HomeCompareSection";
import { HomeHero } from "@/components/home/HomeHero";
import { DvlaLookupProvider } from "@/components/vehicle/DvlaLookupContext";
import { DvlaLookupReport } from "@/components/vehicle/DvlaLookupReport";
import { VehicleFeatureGrid } from "@/components/vehicle/VehicleFeatureGrid";

/** Full homepage content. Kept intact for easy restore when Coming Soon ends. */
export function HomePageContent() {
  return (
    <>
      <DvlaLookupProvider>
        <HomeHero inlineDvlaLookup />
        <DvlaLookupReport />
      </DvlaLookupProvider>
      <ExampleReport />
      <HomeCompareSection />
      <VehicleFeatureGrid />
    </>
  );
}
