import type { Metadata } from "next";
import { HomePageContent } from "@/components/home/HomePageContent";
import { HOME_TITLE, buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: HOME_TITLE,
  description:
    "Free UK car check for MOT history, tax, mileage, recalls and vehicle details. Simple, fast and built for used car buyers.",
  path: "/",
  absoluteTitle: true,
});

export default function HomePage() {
  return <HomePageContent />;
}
