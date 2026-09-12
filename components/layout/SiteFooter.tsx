import Link from "next/link";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { Container } from "@/components/ui/Container";
import { footerCompany, footerTools } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-white">
      <Container className="pb-4 pt-2.5 md:pb-11 md:pt-7 lg:pb-9 lg:pt-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-16 lg:gap-14">
          <div className="md:min-w-0 md:max-w-sm">
            <BrandLogo size="header" />
            <p className="-mt-2.5 support-copy max-w-xs pl-[13px] leading-snug md:-mt-1">
              A clearer view for a better drive.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-16 sm:gap-20 md:gap-24 lg:gap-28 md:pr-10 lg:pr-16 xl:pr-20">
            <div>
              <h2 className="eyebrow mb-3">Tools</h2>
              <ul className="space-y-2">
                {footerTools.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-[15px] text-navy/85 hover:text-blue"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="eyebrow mb-3">Company</h2>
              <ul className="space-y-2">
                {footerCompany.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-[15px] text-navy/85 hover:text-blue"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-5 md:mt-9">
          <p className="meta-copy max-w-3xl leading-relaxed">
            AutoViewer is an independent service and is not affiliated with or
            endorsed by DVLA, DVSA or vehicle manufacturers. MOT and vehicle data
            may be sourced from official UK government datasets and services.
          </p>
          <p className="meta-copy mt-2.5">
            © {year} AutoViewer. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
