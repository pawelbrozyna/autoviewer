import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact AutoViewer",
  description:
    "Contact AutoViewer for product questions, data feedback or support.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <section className="bg-white">
      <Container className="max-w-[760px] py-6 md:py-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Contact" },
          ]}
          className="mb-3"
        />
        <h1 className="text-[1.5rem] font-bold tracking-tight text-navy md:text-[1.75rem]">
          Contact
        </h1>

        <div className="relative mt-4 rounded-[12px] border border-border bg-white p-4 md:mt-5 md:p-5">
          <p className="mb-4 text-[13px] text-muted md:text-[14px]">
            Please include the registration you checked (if relevant). Do not
            send passwords, API keys or other secrets.
          </p>
          <ContactForm />
        </div>
      </Container>
    </section>
  );
}
