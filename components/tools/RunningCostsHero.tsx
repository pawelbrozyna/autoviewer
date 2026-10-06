import { PageHero } from "@/components/layout/PageHero";
import { VehicleSearchForm } from "@/components/vehicle/VehicleSearchForm";

/**
 * Running Costs hero - identical structure to Guides PageHero; only copy differs.
 */
export function RunningCostsHero() {
  return (
    <PageHero
      path="/running-costs"
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Car running costs calculator" },
      ]}
      title="Car running costs calculator"
      description="See what a car could really cost you each month and year."
      variant="tool"
    >
      <VehicleSearchForm
        buttonLabel="Check vehicle →"
        checkSource="running-costs"
      />
    </PageHero>
  );
}
