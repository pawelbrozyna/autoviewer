import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VehicleReportDesktop } from "@/components/vehicle/VehicleReportDesktop";
import { VehicleSummaryMobile } from "@/components/vehicle/VehicleSummaryMobile";
import { getMockVehicle } from "@/lib/api/mock";

export function ExampleReport() {
  const vehicle = getMockVehicle("AV19SWF")!;
  const reportPath = `/vehicle/${vehicle.summary.registration}`;

  return (
    <section className="bg-[#F9FBFE] pb-3 pt-0.5 md:bg-surface-soft md:pb-4 md:pt-7 lg:pb-3.5 lg:pt-6">
      <Container>
        <div className="md:hidden">
          <VehicleSummaryMobile
            vehicle={vehicle}
            titleAs="h2"
            reportPath={reportPath}
          />
        </div>

        <div className="hidden md:block">
          <SectionHeading
            eyebrow="Example report"
            title="See what a complete vehicle report looks like."
            className="mb-5 lg:mb-4"
          />
          <VehicleReportDesktop
            vehicle={vehicle}
            ownersLabel="2"
            summaryOnly
            highlightRegistration
            stretchMotHistory
          />
        </div>
      </Container>
    </section>
  );
}
