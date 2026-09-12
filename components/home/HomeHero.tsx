import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { HeroFeatureStrip } from "@/components/layout/PageHero";
import { HeroMobileGradient } from "@/components/layout/ToolHeroBackdrop";
import { VehicleSearchForm } from "@/components/vehicle/VehicleSearchForm";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-[#f4f6f9]">
      <HeroMobileGradient />

      <div className="absolute inset-0 hidden bg-[#f4f6f9] md:block">
        <div className="absolute -bottom-[24%] right-0 h-[185%] w-full">
          <Image
            src="/header.png"
            alt=""
            fill
            priority
            sizes="70vw"
            className="object-contain object-right-bottom"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/88 to-transparent" />
      </div>

      <Container className="relative">
        <div className="tool-hero-y pb-4 md:max-w-[720px] md:pb-[1.75rem] lg:max-w-[700px] lg:pb-[1.55rem]">
          <div className="hero-topline">
            <p className="eyebrow mb-0 leading-none">Vehicle history check</p>
          </div>
          <h1 className="heading-page max-w-none md:whitespace-nowrap">
            Make a smarter buying decision.
          </h1>
          <p className="body-copy mt-3 max-w-none md:mt-3.5 md:whitespace-nowrap lg:mt-3">
            Check MOT history, mileage, tax, recalls and more - all in one place.
          </p>

          <div className="mt-5 md:mt-6 lg:mt-5">
            <VehicleSearchForm checkSource="home" />
          </div>

          <HeroFeatureStrip />
        </div>
      </Container>
    </section>
  );
}
