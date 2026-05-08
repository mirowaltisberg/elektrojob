import type { MetadataRoute } from "next";
import { getIndexableJobListings } from "@/lib/job-catalog";
import { getLandingPath, TOP_LANDING_PAGES } from "@/lib/landing-pages";
import { ELEKTRIKER_CITIES } from "@/lib/elektriker-cities";
import { ROLE_HUBS } from "@/lib/role-hubs";

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.elektrojob.ch";

function toAbsolute(path: string): string {
  return `${SITE_URL}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobs = await getIndexableJobListings(400);
  const now = new Date();

  // Only include scraped jobs with valid IDs and recent dates (max 90 days old)
  const cutoffMs = now.getTime() - 90 * 24 * 60 * 60 * 1000;
  const minDescriptionLength = 250;
  const validJobs = jobs.filter((job) => {
    if (!job.id || !job.title) return false;
    const descriptionLength = (job.fullDescription?.length || job.description?.length || 0);
    const postedMs = job.datePosted ? Date.parse(job.datePosted) : 0;
    return descriptionLength >= minDescriptionLength && postedMs > cutoffMs;
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: toAbsolute("/kontakt"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: toAbsolute("/arbeitgeber/preise"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    // SEO content hubs (Elektriker keyword cluster)
    {
      url: toAbsolute("/lohn-elektriker-schweiz"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: toAbsolute("/elektriker-ausbildung"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: toAbsolute("/elektriker-in-der-naehe"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    // Role hubs (national)
    ...ROLE_HUBS.map((hub) => ({
      url: toAbsolute(`/${hub.slug}`),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    // City pages
    ...ELEKTRIKER_CITIES.map((city) => ({
      url: toAbsolute(`/elektriker-jobs/${city.slug}`),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    // Existing role × canton matrix
    ...TOP_LANDING_PAGES.map((page) => ({
      url: toAbsolute(getLandingPath(page)),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];

  const jobRoutes: MetadataRoute.Sitemap = validJobs.map((job) => ({
    url: toAbsolute(`/jobs/${job.id}`),
    lastModified: job.datePosted ? new Date(job.datePosted) : now,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [...staticRoutes, ...jobRoutes];
}
