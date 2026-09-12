import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { HeroMobileGradient } from "@/components/layout/ToolHeroBackdrop";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { PUBLIC_SUPPORT_EMAIL } from "@/lib/contact";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact AutoViewer",
  description:
    "Contact AutoViewer for product questions, data feedback or support. Send a message or email our team.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-surface-soft">
        <HeroMobileGradient />
        <Container className="relative tool-hero-y max-w-3xl">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Contact" },
            ]}
          />
          <p className="eyebrow mb-2.5">Contact</p>
          <h1 className="heading-page">Get in touch</h1>
          <p className="body-copy mt-3 max-w-2xl">
            For product questions, data-source feedback or support, send a
            message below or email{" "}
            <a
              href={`mailto:${PUBLIC_SUPPORT_EMAIL}`}
              className="font-semibold text-blue hover:text-blue-hover"
            >
              {PUBLIC_SUPPORT_EMAIL}
            </a>
            .
          </p>
        </Container>
      </section>

      <section className="bg-white py-8 md:py-10">
        <Container className="max-w-3xl">
          <div className="rounded-[12px] border border-border bg-white p-4 md:p-6">
            <h2 className="text-[1.15rem] font-bold tracking-tight text-navy md:text-[1.25rem]">
              Send a message
            </h2>
            <p className="mt-1.5 text-[14px] text-muted md:text-[15px]">
              Please include the registration you checked (if relevant). Do not
              send passwords, API keys or other secrets.
            </p>
            <div className="relative mt-5">
              <ContactForm />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
