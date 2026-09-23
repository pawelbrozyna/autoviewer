import { SampleReportPreview } from "@/components/home/SampleReportPreview";
import { Container } from "@/components/ui/Container";
import { getMockVehicle } from "@/lib/api/mock";

export function ExampleReport() {
  const vehicle = getMockVehicle("AV19SWF")!;

  return (
    <section className="bg-[#F9FBFE] pt-4 pb-7 md:bg-surface-soft md:pt-5 md:pb-9">
      <Container>
        <div className="mb-4 text-left md:mb-5">
          <p className="eyebrow">Example report</p>
          <h2 className="heading-section mt-2 md:whitespace-nowrap">
            See what your AutoViewer report looks like
          </h2>
          <p className="body-copy mt-2 md:whitespace-nowrap">
            Preview the clear vehicle identity, status and history information
            included in a free report.
          </p>
        </div>
        <SampleReportPreview vehicle={vehicle} />
      </Container>
    </section>
  );
}
