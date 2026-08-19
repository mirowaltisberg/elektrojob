import type { Metadata } from "next";
import { HomepageSearch } from "@/app/_components/homepage-search";
import { HomepageSeoContent } from "@/app/_components/homepage-seo-content";
import { SiteFooter } from "@/components/site-footer";
import { searchJobListings } from "@/lib/job-catalog";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Elektriker Jobs Schweiz 2026",
  description:
    "Elektriker Jobs in der Schweiz: aktuelle Stellen für Elektroinstallateure, Montage-Elektriker, Elektroniker und Elektroplaner – mit Lohnband und Pensum-Filter.",
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
    sort: "newest",
  });

  return (
    <>
      <JsonLd data={homepageBreadcrumbSchema} />
      <HomepageSearch initialData={initialData} />
      <HomepageSeoContent />
      <SiteFooter />
    </>
  );
}
