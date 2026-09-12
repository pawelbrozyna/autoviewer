import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "/",
    "/check-a-vehicle",
    "/mot-history",
    "/car-tax-check",
    "/mileage-check",
    "/tax-mileage",
    "/recall-check",
    "/vehicle-details",
    "/compare-cars",
    "/running-costs",
    "/guides",
    "/guides/used-car-buying-checklist",
    "/guides/mot-advisories-explained",
    "/guides/cat-s-vs-cat-n",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
  ];

  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${SITE_URL}${route === "/" ? "" : route}`,
    lastModified,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route.startsWith("/guides") ? 0.6 : 0.8,
  }));
}
