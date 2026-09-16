import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { VehicleReportDesktop } from "@/components/vehicle/VehicleReportDesktop";
import { VehicleSummaryMobile } from "@/components/vehicle/VehicleSummaryMobile";
import { getMockVehicle } from "@/lib/api/mock";

export function ExampleReport() {
  const vehicle = getMockVehicle("AV19SWF")!;

  return (
    <section className="bg-[#F9FBFE] pb-3 pt-0.5 md:bg-surface-soft md:pb-4 md:pt-7 lg:pb-3.5 lg:pt-6">
      <Container>
        <div className="md:hidden">
          <VehicleSummaryMobile
            vehicle={vehicle}
            titleAs="h2"
            showCta={false}
          />
        </div>

        <div className="hidden md:block">
          <div className="mb-5 lg:mb-4">
            <p className="eyebrow mb-2">Example report</p>
            <div className="flex flex-wrap items-center gap-4">
              <h2 className="heading-section">Preview a vehicle report</h2>
              <Link
                href="/example-report"
                className="inline-flex min-h-[44px] items-center justify-center rounded-[10px] bg-navy px-4.5 text-[16px] font-semibold !text-white transition-all duration-150 hover:bg-navy-soft hover:shadow-md hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2"
              >
                View full example report →
              </Link>
            </div>
          </div>
          <VehicleReportDesktop
            vehicle={vehicle}
            ownersLabel="2"
            summaryOnly
            highlightRegistration
            stretchMotHistory
          />
        </div>

        <Link
          href="/example-report"
          className="mt-4 inline-flex min-h-[54px] items-center justify-center rounded-[10px] bg-navy px-5 text-[19px] font-semibold text-white transition-all duration-150 hover:bg-navy-soft hover:shadow-md hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 md:hidden"
        >
          View full example report →
        </Link>
      </Container>
    </section>
  );
}
