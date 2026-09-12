import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CompareSearchForm } from "@/components/vehicle/CompareSearchForm";
import { VehicleComparison } from "@/components/vehicle/VehicleComparison";
import { getMockVehicle } from "@/lib/api/mock";

export function HomeCompareSection() {
  const left = getMockVehicle("AB12CDE")!;
  const right = getMockVehicle("CD34EFG")!;

  return (
    <section className="bg-white pb-5 pt-2 md:pb-6 md:pt-3 lg:pb-5 lg:pt-2.5">
      <Container>
        <SectionHeading
          eyebrow="Compare vehicles"
          title="Compare two cars side by side."
          description="See key information, spot differences and make a more confident decision."
          className="mb-5 lg:mb-4"
        />
        <CompareSearchForm />
        <div className="mt-3 lg:mt-2.5">
          <div className="md:hidden">
            <p className="eyebrow mb-2">Example comparison</p>
          </div>
          <VehicleComparison left={left} right={right} demo />
        </div>
      </Container>
    </section>
  );
}
