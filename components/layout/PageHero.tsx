import {
  ClipboardList,
  Gauge,
  Landmark,
  ShieldAlert,
  Car,
} from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { ToolHeroBackdrop, HeroMobileGradient } from "@/components/layout/ToolHeroBackdrop";
import { cn } from "@/lib/utils";

const featureIcons = [
  { icon: ClipboardList, label: "MOT", mobileOnlyHide: false },
  { icon: Gauge, label: "Mileage", mobileOnlyHide: false },
  { icon: Landmark, label: "Tax", mobileOnlyHide: false },
  { icon: ShieldAlert, label: "Recalls", mobileOnlyHide: false },
  { icon: Car, label: "Details", mobileOnlyHide: true },
] as const;

export function HeroFeatureStrip({ className }: { className?: string }) {
  return (
    <div className={className}>
      <ul className="-mt-1 flex flex-nowrap items-center justify-center gap-x-3 gap-y-2 md:flex-wrap md:justify-start md:gap-x-6 md:gap-y-3 lg:gap-x-5">
        {featureIcons.map((item) => {
          const Icon = item.icon;
          return (
            <li
              key={item.label}
              className={cn(
                "flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[15px] font-semibold text-navy/85 md:gap-2 md:text-[15px] lg:text-[14px]",
                item.mobileOnlyHide && "max-md:hidden",
              )}
            >
              <Icon
                className="h-[17px] w-[17px] shrink-0 text-navy/70 md:h-[18px] md:w-[18px] lg:h-[17px] lg:w-[17px]"
                strokeWidth={1.75}
                aria-hidden
              />
              {item.label}
            </li>
          );
        })}
      </ul>
      <p className="support-copy mt-3 pb-1 text-center md:text-left">
        Simple. Reliable. Built for UK drivers.
      </p>
    </div>
  );
}

/**
 * Shared subpage hero: same shell, height and type scale as HomeHero.
 * variant="tool" adds the shared header.png backdrop (subtle).
 */
export function PageHero({
  breadcrumbs,
  title,
  description,
  children,
  className,
  showFeatureStrip = true,
  variant = "plain",
  titleClassName,
}: {
  breadcrumbs: Array<{ label: string; href?: string }>;
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
  /** Vehicle-check feature row. Opt out on pages where it is irrelevant. */
  showFeatureStrip?: boolean;
  /** @deprecated Kept for call-site compat. Not rendered (would stretch hero height). */
  eyebrow?: string;
  /** "tool" = shared header.png backdrop; "plain" = soft surface (guides etc.). */
  variant?: "plain" | "tool";
  titleClassName?: string;
}) {
  const isTool = variant === "tool";

  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-border",
        isTool ? "bg-white" : "bg-surface-soft",
      )}
    >
      {isTool ? <ToolHeroBackdrop /> : <HeroMobileGradient />}
      <Container className="relative">
        <div
          className={cn(
            "tool-hero-y md:max-w-[720px] lg:max-w-[700px]",
            className,
          )}
        >
          <div className="hero-topline">
            <Breadcrumbs items={breadcrumbs} className="mb-0" />
          </div>
          <h1
            className={cn(
              "heading-page max-w-none md:whitespace-nowrap",
              titleClassName,
            )}
          >
            {title}
          </h1>
          <p className="body-copy mt-3 max-w-none md:mt-3.5 md:whitespace-nowrap lg:mt-3">
            {description}
          </p>
          {children ? (
            <div className="mt-5 shrink-0 md:mt-6 lg:mt-5">{children}</div>
          ) : null}
          {showFeatureStrip ? (
            <HeroFeatureStrip
              className={
                children
                  ? "shrink-0"
                  : "mt-5 shrink-0 md:mt-6 lg:mt-5"
              }
            />
          ) : null}
        </div>
      </Container>
    </section>
  );
}
