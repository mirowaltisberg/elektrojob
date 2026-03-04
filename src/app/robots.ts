import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://elektrojob.ch";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/jobs/", "/elektrojobs/"],
        disallow: [
          "/api/",           // API routes — not for indexing
          "/*?*sort=",       // Filter/sort parameter URLs — duplicate content
          "/*?*type=",
          "/*?*workload=",
          "/*?*remote=",
          "/*?*postedWithinDays=",
          "/*?*offset=",     // Pagination parameter URLs
          "/*?*q=",          // Search query parameter URLs — duplicate content
          "/*?*loc=",
          "/*?*radiusKm=",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
