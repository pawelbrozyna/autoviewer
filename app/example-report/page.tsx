import type { Metadata } from "next";
import { HomeHero } from "@/components/home/HomeHero";
import { FreeReportHtml } from "@/components/reports/FreeReportHtml";
import { Container } from "@/components/ui/Container";
import { DvlaLookupProvider } from "@/components/vehicle/DvlaLookupContext";
import { DvlaLookupReport } from "@/components/vehicle/DvlaLookupReport";
import { ExampleReportActions } from "@/components/vehicle/ExampleReportActions";
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

      <section className="bg-[#F9FBFE] pt-4 pb-7 md:bg-surface-soft md:pt-5 md:pb-9">
        <Container>
          <div className="mb-4 grid gap-4 md:mb-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div className="text-left">
              <p className="eyebrow">Example report</p>
              <h1 className="heading-section mt-2 md:whitespace-nowrap">
                Full example vehicle report
              </h1>
              <p className="body-copy mt-2 max-w-2xl md:whitespace-nowrap">
                Explore a complete AutoViewer report using demonstration data.
              </p>
            </div>
            <ExampleReportActions vehicle={vehicle} ownersLabel="2" />
          </div>

          <FreeReportHtml vehicle={vehicle} mode="full" />
        </Container>
      </section>
    </>
  );
}
