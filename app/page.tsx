import type { Metadata } from "next";
import { ComingSoonHome } from "@/components/home/ComingSoonHome";
import { HomePageContent } from "@/components/home/HomePageContent";
import { buildPageMetadata } from "@/lib/seo/metadata";

function isProductionComingSoonHome(): boolean {
  return process.env.VERCEL_ENV === "production";
}

export async function generateMetadata(): Promise<Metadata> {
  if (isProductionComingSoonHome()) {
    return {
      title: "AutoViewer is coming soon",
      description:
        "AutoViewer is currently connecting live vehicle data services.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return buildPageMetadata({
    title: "Free Car Check UK - MOT, Tax, Mileage & Vehicle History | AutoViewer",
    description:
      "Free UK car check for MOT history, tax, mileage, recalls and vehicle details. Simple, fast and built for used car buyers.",
    path: "/",
    absoluteTitle: true,
  });
}

export default function HomePage() {
  if (isProductionComingSoonHome()) {
    return <ComingSoonHome />;
  }

  return <HomePageContent />;
}
