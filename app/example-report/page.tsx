import type { Metadata } from "next";
import { HomeHero } from "@/components/home/HomeHero";
import { FullReportUpsellCard } from "@/components/reports/FullReportUpsellCard";
import { VehicleReportSection } from "@/components/reports/VehicleReportSection";
import {
  DvlaLookupProvider,
  HiddenWhenLookupResult,
} from "@/components/vehicle/DvlaLookupContext";
import { CheckoutStatusNoticeFromUrl } from "@/components/vehicle/CheckoutCancelledNotice";
import { DvlaLookupReport } from "@/components/vehicle/DvlaLookupReport";
import { getMockVehicle } from "@/lib/api/mock";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Full Example Vehicle Report",
  description:
    "Explore a complete AutoViewer vehicle report using demonstration data.",
  path: "/example-report",
  noIndex: true,
});

export default function ExampleReportPage() {
  const vehicle = getMockVehicle("AV19SWF")!;

  return (
    <>
      <DvlaLookupProvider>
        <HomeHero inlineDvlaLookup headingLevel="h2" />
        <DvlaLookupReport />
        <HiddenWhenLookupResult>
          <VehicleReportSection
            vehicle={vehicle}
            eyebrow="Example report"
            title="Full example vehicle report"
            description="Explore a complete AutoViewer report using demonstration data."
            ownersLabel="2"
            notice={<CheckoutStatusNoticeFromUrl />}
            footer={<FullReportUpsellCard registration={null} className="mt-6 md:mt-8" />}
          />
        </HiddenWhenLookupResult>
      </DvlaLookupProvider>
    </>
  );
}
