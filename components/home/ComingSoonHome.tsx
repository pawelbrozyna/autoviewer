import { BrandLogo } from "@/components/layout/BrandLogo";

/** Minimal Coming Soon screen for production homepage (and maintenance). */
export function ComingSoonHome() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-white px-6 py-16">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center">
          <BrandLogo size="header" href="/" className="pointer-events-none" />
        </div>
        <h1 className="mt-8 text-[1.75rem] font-bold tracking-tight text-navy md:text-[2rem]">
          AutoViewer is coming soon
        </h1>
        <p className="mt-3 text-[16px] leading-relaxed text-muted md:text-[17px]">
          We&apos;re currently connecting our live vehicle data services.
        </p>
      </div>
    </div>
  );
}
