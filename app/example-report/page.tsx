import type { Metadata } from "next";
import { HomeHero } from "@/components/home/HomeHero";
import { Container } from "@/components/ui/Container";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DvlaLookupProvider } from "@/components/vehicle/DvlaLookupContext";
import { DvlaLookupReport } from "@/components/vehicle/DvlaLookupReport";
import { ExampleReportActions } from "@/components/vehicle/ExampleReportActions";
import { VehicleFullReport } from "@/components/vehicle/VehicleFullReport";
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

      <section className="bg-surface-soft py-6 md:py-8">
        <Container>
          <div className="mb-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="eyebrow mb-0">Example report</p>
                <StatusBadge tone="info">Demo data</StatusBadge>
              </div>
              <h1 className="heading-section mt-2">
                Full example vehicle report
              </h1>
              <p className="body-copy mt-2 max-w-2xl">
                Explore a complete AutoViewer report using demonstration data.
              </p>
            </div>
            <ExampleReportActions vehicle={vehicle} ownersLabel="2" />
          </div>

          <VehicleFullReport vehicle={vehicle} ownersLabel="2" />
        </Container>
      </section>
    </>
  );
}
