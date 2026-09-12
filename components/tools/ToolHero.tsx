import { PageHero } from "@/components/layout/PageHero";
import { VehicleSearchForm } from "@/components/vehicle/VehicleSearchForm";
import type { CheckSource } from "@/lib/analytics";

export function ToolHero({
  breadcrumbs,
  title,
  description,
  buttonLabel = "Check vehicle →",
  checkSource = "unknown",
  eyebrow,
}: {
  breadcrumbs: Array<{ label: string; href?: string }>;
  title: string;
  description: string;
  buttonLabel?: string;
  checkSource?: CheckSource;
  /** Optional label under breadcrumbs (tax-mileage and similar). */
  eyebrow?: string;
}) {
  return (
    <PageHero
      breadcrumbs={breadcrumbs}
      title={title}
      description={description}
      eyebrow={eyebrow}
      variant="tool"
    >
      <VehicleSearchForm
        buttonLabel={buttonLabel}
        checkSource={checkSource}
      />
    </PageHero>
  );
}
