import type { MetadataRoute } from "next";
import { isIndexingAllowed } from "@/lib/seo/indexing";
import { SITE_URL } from "@/lib/seo/metadata";

/**
 * Indexable public pages only. Registration reports (/vehicle/*) and noindex
 * pages (/example-report, /full-report) must never be listed here.
 */
const INDEXABLE_ROUTES = [
  "/",
  "/check-a-vehicle",
  "/mot-history",
  "/mileage-check",
  "/car-tax-check",
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

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isIndexingAllowed()) return [];

  return INDEXABLE_ROUTES.map((route) => ({
    url: `${SITE_URL}${route === "/" ? "" : route}`,
  }));
}
