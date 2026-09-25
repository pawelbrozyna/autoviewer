import { PageHero } from "@/components/layout/PageHero";
import { VehicleSearchForm } from "@/components/vehicle/VehicleSearchForm";
import type { CheckSource } from "@/lib/analytics";

export function ToolHero({
  breadcrumbs,
  title,
  description,
  buttonLabel = "Check vehicle →",
  checkSource = "unknown",
  inlineDvlaLookup = false,
}: {
  breadcrumbs: Array<{ label: string; href?: string }>;
  title: string;
  description: string;
  buttonLabel?: string;
  checkSource?: CheckSource;
  /** @deprecated No longer rendered in the hero. */
  eyebrow?: string;
  inlineDvlaLookup?: boolean;
}) {
  return (
    <PageHero
      breadcrumbs={breadcrumbs}
      title={title}
      description={description}
      variant="tool"
    >
      <VehicleSearchForm
        buttonLabel={buttonLabel}
        checkSource={checkSource}
        inlineDvlaLookup={inlineDvlaLookup}
      />
    </PageHero>
  );
}
