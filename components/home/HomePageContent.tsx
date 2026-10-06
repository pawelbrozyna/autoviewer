import { ExampleReport } from "@/components/home/ExampleReport";
import { FullReportUpsell } from "@/components/home/FullReportUpsell";
import { HomeCompareSection } from "@/components/home/HomeCompareSection";
import { HomeHero } from "@/components/home/HomeHero";
import {
  DvlaLookupProvider,
  HiddenWhenLookupResult,
} from "@/components/vehicle/DvlaLookupContext";
import { DvlaLookupReport } from "@/components/vehicle/DvlaLookupReport";
import { VehicleFeatureGrid } from "@/components/vehicle/VehicleFeatureGrid";

export function HomePageContent() {
  return (
    <DvlaLookupProvider>
      <HomeHero inlineDvlaLookup />
      <DvlaLookupReport />
      <HiddenWhenLookupResult>
        <FullReportUpsell />
        <ExampleReport />
        <HomeCompareSection />
        <VehicleFeatureGrid />
      </HiddenWhenLookupResult>
    </DvlaLookupProvider>
  );
}
