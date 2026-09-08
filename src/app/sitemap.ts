import type { MetadataRoute } from "next";
import { getIndexableJobListings } from "@/lib/job-catalog";
import { getLandingPath, TOP_LANDING_PAGES } from "@/lib/landing-pages";
import { ELEKTRIKER_CITIES } from "@/lib/elektriker-cities";
import { ROLE_HUBS } from "@/lib/role-hubs";

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.elektrojob.ch";

function toAbsolute(path: string): string {
  return `${SITE_URL}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobs = await getIndexableJobListings();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: toAbsolute("/kontakt"),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: toAbsolute("/arbeitgeber/preise"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    { url: toAbsolute("/datenschutz"), changeFrequency: "monthly", priority: 0.2 },
    { url: toAbsolute("/team"), changeFrequency: "monthly", priority: 0.4 },
    // SEO content hubs (Elektriker keyword cluster)
    {
      url: toAbsolute("/lohn-elektriker-schweiz"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: toAbsolute("/elektriker-ausbildung"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: toAbsolute("/elektriker-in-der-naehe"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    // Role hubs (national)
    ...ROLE_HUBS.map((hub) => ({
      url: toAbsolute(`/${hub.slug}`),
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    // City pages
    ...ELEKTRIKER_CITIES.map((city) => ({
      url: toAbsolute(`/elektriker-jobs/${city.slug}`),
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    // Existing role × canton matrix
    ...TOP_LANDING_PAGES.map((page) => ({
      url: toAbsolute(getLandingPath(page)),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];

  const jobRoutes: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: toAbsolute(`/jobs/${job.id}`),
    ...(job.datePosted && Number.isFinite(Date.parse(job.datePosted))
      ? { lastModified: new Date(job.datePosted) }
      : {}),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [...staticRoutes, ...jobRoutes];
}
