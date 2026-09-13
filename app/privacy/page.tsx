import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy",
  description:
    "How AutoViewer handles vehicle registration checks, contact messages, analytics and technical data.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <section className="bg-white">
      <Container className="max-w-[860px] py-6 md:py-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Privacy" },
          ]}
          className="mb-3"
        />
        <h1 className="text-[1.5rem] font-bold tracking-tight text-navy md:text-[1.75rem]">
          Privacy policy
        </h1>

        <div className="prose-av mt-4 md:mt-5">
          <p>Last updated: 13 September 2026</p>
          <p>
            This policy explains how AutoViewer processes information when you
            use{" "}
            <a href="https://autoviewer.co.uk">autoviewer.co.uk</a>. It is written
            for the current website implementation.
          </p>

          <h2>Who we are</h2>
          <p>
            AutoViewer is an independent UK vehicle-check website. It is not
            affiliated with or endorsed by DVLA, DVSA or vehicle manufacturers.
          </p>
          <p>
            For privacy questions, use our{" "}
            <a href="/contact">contact form</a>.
          </p>

          <h2>What information we process</h2>
          <h3>Vehicle registration checks</h3>
          <p>
            When you run a vehicle check, you enter a UK registration number. We
            use that registration to request and display vehicle-related
            information, such as MOT history, tax or SORN status where available,
            mileage records from MOT tests, recall information where available,
            and basic vehicle details.
          </p>
          <p>
            A registration number identifies a vehicle. It is not automatically
            the same as your personal identity, but it can relate to an
            identifiable person in some contexts.
          </p>
          <p>
            The AutoViewer application does not build a personal account profile
            of your searches. Checks are processed to return results for that
            request.
          </p>

          <h3>Official vehicle-data sources</h3>
          <p>
            Depending on configuration, AutoViewer may request vehicle data from
            official UK sources, including:
          </p>
          <ul>
            <li>DVLA Vehicle Enquiry Service</li>
            <li>DVSA MOT History API</li>
          </ul>
          <p>
            Other official or licensed vehicle-data sources may be used in future
            where needed to provide the service. Results depend on what those
            sources return and may be incomplete, delayed or unavailable.
          </p>

          <h3>Contact form</h3>
          <p>
            If you send a message through the contact form, we process:
          </p>
          <ul>
            <li>your name, if you provide one</li>
            <li>your email address, if you provide one</li>
            <li>the message content</li>
            <li>
              any vehicle registration or other details you choose to include in
              the message
            </li>
          </ul>
          <p>
            Name and email are optional. The message is required. Messages are
            sent by email so we can read and reply. A hidden anti-spam field may
            also be checked and is not used for ordinary correspondence.
          </p>

          <h3>Technical and hosting data</h3>
          <p>
            The website is hosted by Vercel. Like most websites, hosting and
            related infrastructure may process technical information such as IP
            address, browser or device information, request URLs, timestamps and
            similar server logs. This supports security, reliability and day-to-day
            operation of the service.
          </p>

          <h2>How we use information</h2>
          <ul>
            <li>to provide vehicle checks and related tools</li>
            <li>to respond to contact messages</li>
            <li>to keep the website secure and working</li>
            <li>
              to understand aggregate site usage through Google Analytics 4, as
              described below
            </li>
          </ul>
          <p>We do not sell personal information.</p>

          <h2>Analytics (Google Analytics 4)</h2>
          <p>
            AutoViewer uses Google Analytics 4 (GA4) in cookieless Consent Mode
            when a measurement ID is configured.
          </p>
          <ul>
            <li>
              Consent defaults keep{" "}
              <code>analytics_storage</code>, <code>ad_storage</code>,{" "}
              <code>ad_user_data</code> and <code>ad_personalization</code>{" "}
              denied
            </li>
            <li>
              AutoViewer does not grant those consent signals for analytics or
              advertising
            </li>
            <li>
              AutoViewer does not use Google Analytics cookies such as{" "}
              <code>_ga</code> or <code>_ga_*</code>
            </li>
            <li>
              advertising and personalisation features for GA4 are disabled in
              our configuration
            </li>
            <li>
              Google may still receive cookieless measurement requests (for
              example page views and selected product events)
            </li>
          </ul>
          <p>
            Custom events used on AutoViewer are high-level product events (such
            as starting a vehicle check or comparison). Registration numbers are
            not sent through our analytics helpers.
          </p>

          <h2>Cookies and similar technologies</h2>
          <p>
            AutoViewer does not use Google Analytics cookies. We do not claim that
            the site uses no cookies of any kind. Hosting, security or platform
            features provided by Vercel or the browser may still involve cookies
            or similar technologies required to operate a website.
          </p>
          <p>
            The site may also use browser local storage for limited technical
            purposes (for example an internal analytics-exclusion setting used by
            the site owner). That is not a Google Analytics cookie.
          </p>

          <h2>Third-party services</h2>
          <p>Depending on the feature you use, information may be processed by:</p>
          <ul>
            <li>Vercel, for website hosting and related infrastructure</li>
            <li>DVLA and/or DVSA, for vehicle data requests</li>
            <li>Google, for GA4 measurement and for delivering contact-form email</li>
          </ul>
          <p>
            Those organisations process information under their own systems and
            policies when they act as providers or data sources for the service.
          </p>

          <h2>Retention</h2>
          <p>
            Vehicle checks are processed to return results for the request. The
            current AutoViewer application does not keep a long-term personal
            search history account for users.
          </p>
          <p>
            Contact-form messages are received by email. We have not published a
            fixed retention period for those emails. They are kept as long as
            needed to handle the enquiry and ordinary inbox administration.
          </p>
          <p>
            Technical logs retained by hosting providers follow that provider&apos;s
            systems. Exact retention periods for Vercel or Google infrastructure
            logs are not controlled solely by AutoViewer.
          </p>

          <h2>Your privacy rights</h2>
          <p>
            Under UK data protection law, you may have rights including access,
            correction, erasure, restriction, objection and data portability, where
            applicable. You can also complain to the Information Commissioner&apos;s
            Office (ICO) if you are unhappy with how your information is handled.
          </p>
          <p>
            To exercise a privacy request relating to AutoViewer, use the{" "}
            <a href="/contact">contact form</a> and describe your request clearly.
          </p>

          <h2>Changes</h2>
          <p>
            We may update this policy when the website or our processing changes.
            The &quot;Last updated&quot; date at the top will be revised when we do.
          </p>
        </div>
      </Container>
    </section>
  );
}
