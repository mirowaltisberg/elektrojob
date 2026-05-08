import type { Metadata } from "next";
import { HomepageSearch } from "@/app/_components/homepage-search";
import { HomepageSeoContent } from "@/app/_components/homepage-seo-content";
import { SiteFooter } from "@/components/site-footer";
import { searchJobListings } from "@/lib/job-catalog";
import { JsonLd } from "@/components/json-ld";
import { buildJobPostingSchema } from "@/lib/job-schema";

export const metadata: Metadata = {
  title: "Elektriker Jobs Schweiz 2026 | Stellen & Lohn für Elektriker",
  description:
    "Elektriker Jobs in der ganzen Schweiz: Elektroinstallateur, Montage-Elektriker, Elektroniker, Elektroplaner. Stellen für Elektriker mit Lohnband, Pensum-Filter und Bewerbung in 2 Klicks.",
  alternates: {
    canonical: "/",
  },
};

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.elektrojob.ch";

const homepageBreadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Startseite",
      item: SITE_URL,
    },
  ],
};

export default async function HomePage() {
  const initialData = await searchJobListings({
    q: "",
    loc: "",
    limit: 12,
    offset: 0,
    sort: "relevance",
  });

  // Strip heavy arrays not needed by the client-side search component
  const liteData = {
    ...initialData,
    jobs: initialData.jobs.map(({ responsibilities, requirements, benefits, fullDescription, ...rest }) => ({
      ...rest,
      responsibilities: [] as string[],
      requirements: [] as string[],
      benefits: [] as string[],
    })),
  };

  return (
    <>
      <JsonLd data={homepageBreadcrumbSchema} />
      {initialData.jobs.map((job) => (
        <JsonLd key={`schema-${job.source}-${job.id}`} data={buildJobPostingSchema(job)} />
      ))}
      <HomepageSearch initialData={liteData} />
      <HomepageSeoContent />
      <SiteFooter />
    </>
  );
}
