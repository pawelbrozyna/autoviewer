import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { FAQ } from "@/components/ui/FAQ";
import { RelatedTools } from "@/components/ui/RelatedTools";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ToolHero } from "@/components/tools/ToolHero";
import { VehicleSearchForm } from "@/components/vehicle/VehicleSearchForm";
import type { CheckSource } from "@/lib/analytics";
import { relatedToolsMap } from "@/lib/site";

export function CheckerLandingPage({
  toolKey,
  breadcrumbs,
  title,
  description,
  whatYoullSee,
  howItWorks,
  explanation,
  faqs,
  buttonLabel,
  checkSource = "unknown",
  crossLink,
}: {
  toolKey: keyof typeof relatedToolsMap;
  breadcrumbs: Array<{ label: string; href?: string }>;
  title: string;
  description: string;
  whatYoullSee: Array<{ title: string; text: string }>;
  howItWorks: Array<{ step: string; text: string }>;
  explanation: React.ReactNode;
  faqs: Array<{ question: string; answer: string }>;
  buttonLabel?: string;
  checkSource?: CheckSource;
  crossLink?: { href: string; label: string };
  /** @deprecated No longer shown in ToolHero by default */
  eyebrow?: string;
}) {
  return (
    <>
      <ToolHero
        breadcrumbs={breadcrumbs}
        title={title}
        description={description}
        buttonLabel={buttonLabel}
        checkSource={checkSource}
      />

      <section className="section-y">
        <Container className="space-y-11 md:space-y-12">
          {crossLink ? (
            <p className="rounded-[12px] border border-border bg-surface-soft px-4 py-3.5 text-[15px] text-navy/80 md:px-5">
              {crossLink.label}{" "}
              <Link
                href={crossLink.href}
                className="font-semibold text-blue hover:text-blue-hover"
              >
                Tax &amp; Mileage →
              </Link>
            </p>
          ) : null}

          <div>
            <SectionHeading title="What you’ll see" />
            <div className="grid gap-4 md:grid-cols-3 md:gap-5">
              {whatYoullSee.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[12px] border border-border bg-white p-5"
                >
                  <h3 className="heading-card">{item.title}</h3>
                  <p className="support-copy mt-2">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionHeading title="How it works" />
            <ol className="grid gap-4 md:grid-cols-3 md:gap-5">
              {howItWorks.map((item, index) => (
                <li
                  key={item.step}
                  className="rounded-[12px] border border-border bg-surface-soft p-5"
                >
                  <div className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-blue md:text-[13px]">
                    Step {index + 1}
                  </div>
                  <h3 className="heading-card">{item.step}</h3>
                  <p className="support-copy mt-2">{item.text}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="prose-av max-w-[46rem]">{explanation}</div>

          <div>
            <SectionHeading title="Related tools" />
            <RelatedTools tools={relatedToolsMap[toolKey]} />
          </div>

          <div>
            <SectionHeading title="Frequently asked questions" />
            <FAQ items={faqs} />
          </div>

          <div className="rounded-[12px] border border-border bg-surface-soft p-5 md:p-6">
            <h2 className="heading-section text-[1.35rem] md:text-[1.5rem]">
              Ready to check a vehicle?
            </h2>
            <p className="support-copy mt-2 max-w-xl">
              Enter a UK registration to get started. In demo mode, try AB12 CDE or
              CD34 EFG.
            </p>
            <div className="mt-4 max-w-xl md:mt-5">
              <VehicleSearchForm
                buttonLabel={buttonLabel}
                checkSource={checkSource}
              />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
