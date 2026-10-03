import type { Metadata } from "next";
import { HomeHero } from "@/components/home/HomeHero";
import { VehicleReportSection } from "@/components/reports/VehicleReportSection";
import { DvlaLookupProvider } from "@/components/vehicle/DvlaLookupContext";
import { DvlaLookupReport } from "@/components/vehicle/DvlaLookupReport";
import { getMockVehicle } from "@/lib/api/mock";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Full Example Vehicle Report",
  description:
    "Explore a complete AutoViewer vehicle report using demonstration data.",
  path: "/example-report",
});

export default function ExampleReportPage() {
  const vehicle = getMockVehicle("AV19SWF")!;

  return (
    <>
      <DvlaLookupProvider>
        <HomeHero inlineDvlaLookup />
        <DvlaLookupReport />
      </DvlaLookupProvider>

      <VehicleReportSection
        vehicle={vehicle}
        eyebrow="Example report"
        title="Full example vehicle report"
        description="Explore a complete AutoViewer report using demonstration data."
        ownersLabel="2"
      />
    </>
  );
}
