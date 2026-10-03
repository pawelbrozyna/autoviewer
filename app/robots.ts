import type { MetadataRoute } from "next";
import { isIndexingAllowed } from "@/lib/seo/indexing";
import { SITE_URL } from "@/lib/seo/metadata";

export default function robots(): MetadataRoute.Robots {
  if (!isIndexingAllowed()) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/vehicle/", "/api/", "/compare-cars?"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
