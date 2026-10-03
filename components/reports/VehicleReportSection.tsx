import { FreeReportHtml } from "@/components/reports/FreeReportHtml";
import { Container } from "@/components/ui/Container";
import { ExampleReportActions } from "@/components/vehicle/ExampleReportActions";
import type { VehicleRecord } from "@/types/vehicle";

export function VehicleReportSection({
  vehicle,
  eyebrow,
  title,
  description,
  headingLevel = "h1",
  ownersLabel = null,
  className = "",
}: {
  vehicle: VehicleRecord;
  eyebrow: string;
  title: string;
  description: string;
  headingLevel?: "h1" | "h2";
  ownersLabel?: string | null;
  className?: string;
}) {
  const Heading = headingLevel;

  return (
    <section
      className={`bg-[#F9FBFE] pt-4 pb-7 md:bg-surface-soft md:pt-5 md:pb-9 ${className}`.trim()}
    >
      <Container>
        <div className="mb-4 grid gap-4 md:mb-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div className="text-left">
            <p className="eyebrow">{eyebrow}</p>
            <Heading className="heading-section mt-2 md:whitespace-nowrap">
              {title}
            </Heading>
            <p className="body-copy mt-2 max-w-2xl md:whitespace-nowrap">
              {description}
            </p>
          </div>
          <div className="hidden md:block">
            <ExampleReportActions vehicle={vehicle} ownersLabel={ownersLabel} />
          </div>
        </div>

        <FreeReportHtml vehicle={vehicle} mode="full" />

        <div className="mt-4 md:hidden">
          <ExampleReportActions vehicle={vehicle} ownersLabel={ownersLabel} />
        </div>
      </Container>
    </section>
  );
}

export function LiveVehicleReportSection({
  vehicle,
  headingLevel,
  className,
}: {
  vehicle: VehicleRecord;
  headingLevel?: "h1" | "h2";
  className?: string;
}) {
  return (
    <VehicleReportSection
      vehicle={vehicle}
      eyebrow="Vehicle report"
      title={`Vehicle report for ${vehicle.summary.displayRegistration}`}
      description={
        vehicle.summary.isDemo
          ? "Free AutoViewer report using demonstration data."
          : "Free AutoViewer report using official public vehicle data."
      }
      headingLevel={headingLevel}
      ownersLabel={vehicle.summary.isDemo ? "2" : null}
      className={className}
    />
  );
}
