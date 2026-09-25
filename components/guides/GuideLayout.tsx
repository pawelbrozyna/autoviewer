import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/layout/PageHero";
import { VehicleSearchForm } from "@/components/vehicle/VehicleSearchForm";

export function GuideLayout({
  title,
  description,
  breadcrumbs,
  children,
}: {
  title: string;
  description: string;
  breadcrumbs: Array<{ label: string; href?: string }>;
  children: React.ReactNode;
}) {
  return (
    <article>
      <PageHero
        breadcrumbs={breadcrumbs}
        title={title}
        description={description}
        variant="tool"
      >
        <VehicleSearchForm
          buttonLabel="Check vehicle →"
          checkSource="guides"
        />
      </PageHero>
      <Container className="section-y">
        <div className="prose-av mx-auto max-w-[46rem]">{children}</div>
      </Container>
    </article>
  );
}
