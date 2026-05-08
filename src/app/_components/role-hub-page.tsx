import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Wallet } from "lucide-react";
import type { RoleHubConfig } from "@/lib/role-hubs";
import { searchJobListings } from "@/lib/job-catalog";
import { buildJobPostingSchema } from "@/lib/job-schema";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.elektrojob.ch";

const TOP_CANTONS = [
  { name: "Zürich", slug: "zuerich" },
  { name: "Bern", slug: "bern" },
  { name: "Basel", slug: "basel" },
  { name: "Aargau", slug: "aargau" },
  { name: "Luzern", slug: "luzern" },
  { name: "St. Gallen", slug: "st-gallen" },
  { name: "Solothurn", slug: "solothurn" },
  { name: "Zug", slug: "zug" },
  { name: "Thurgau", slug: "thurgau" },
  { name: "Graubünden", slug: "graubuenden" },
  { name: "Schaffhausen", slug: "schaffhausen" },
  { name: "Fribourg", slug: "fribourg" },
];

interface Props {
  config: RoleHubConfig;
}

export async function RoleHubPage({ config }: Props) {
  const result = await searchJobListings({
    q: config.searchQuery,
    loc: "",
    limit: 18,
    offset: 0,
    sort: "newest",
  });

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Startseite", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: config.displayName,
        item: `${SITE_URL}/${config.slug}`,
      },
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: config.displayName,
    description: config.description,
    numberOfItems: result.jobs.length,
    itemListElement: result.jobs.slice(0, 15).map((job, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/jobs/${job.id}`,
      name: job.title,
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: config.faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={itemListSchema} />
      <JsonLd data={faqSchema} />
      {result.jobs.slice(0, 10).map((job) => (
        <JsonLd key={`schema-${job.source}-${job.id}`} data={buildJobPostingSchema(job)} />
      ))}

      <main className="bg-white">
        <section className="bg-primary/5 border-b">
          <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-14 max-w-5xl">
            <nav className="text-sm text-slate-500 mb-3" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-primary">Startseite</Link>
              <span className="mx-2">/</span>
              <span className="text-slate-700">{config.displayName}</span>
            </nav>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight mb-4">
              {config.displayName} <span className="text-primary">Schweiz</span>
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed mb-6 max-w-3xl">{config.hero}</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href={`/?q=${encodeURIComponent(config.searchQuery)}`}>
                  Alle {config.displayName} ansehen
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/lohn-elektriker-schweiz">Lohn vergleichen</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 py-10 max-w-5xl">
          <div className="prose prose-slate max-w-none mb-8">
            <p className="text-slate-700 leading-relaxed">{config.longIntro}</p>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Aktuelle {config.displayName}
          </h2>
          {result.jobs.length === 0 ? (
            <p className="text-slate-600">
              Aktuell laden wir die Inserate. Schau gleich auf der{" "}
              <Link href="/" className="text-primary underline">Startseite</Link> vorbei.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {result.jobs.slice(0, 12).map((job) => (
                <Card key={`${job.source}-${job.id}`} className="hover:border-primary/40 transition">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">
                      <Link
                        href={
                          job.source === "generated"
                            ? `/jobs/${job.id}?q=${encodeURIComponent(config.searchQuery)}`
                            : `/jobs/${job.id}`
                        }
                        className="hover:text-primary"
                      >
                        {job.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-slate-600 mb-2 line-clamp-1">
                      {job.company || "Schweizer Elektrobetrieb"}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.location || "Schweiz"}
                      </span>
                      {job.salary && (
                        <span className="inline-flex items-center gap-1">
                          <Wallet className="h-3 w-3" />
                          {job.salary}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="bg-slate-50 border-y">
          <div className="container mx-auto px-4 sm:px-6 py-10 max-w-4xl space-y-8">
            <article>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Lohn</h2>
              <p className="text-slate-700 leading-relaxed">{config.salary}</p>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link href="/lohn-elektriker-schweiz">Vollständige Lohnübersicht</Link>
              </Button>
            </article>
            <article>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Ausbildung</h2>
              <p className="text-slate-700 leading-relaxed">{config.education}</p>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link href="/elektriker-ausbildung">Ausbildungs-Guide</Link>
              </Button>
            </article>
            <article>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Karriere</h2>
              <p className="text-slate-700 leading-relaxed">{config.career}</p>
            </article>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 py-10 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Typische Aufgaben</h2>
              <ul className="space-y-2">
                {config.tasks.map((t) => (
                  <li key={t} className="flex items-start gap-2 text-slate-700">
                    <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Anforderungen</h2>
              <ul className="space-y-2">
                {config.requirements.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-slate-700">
                    <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 border-y">
          <div className="container mx-auto px-4 sm:px-6 py-10 max-w-5xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              {config.displayName} nach Kanton
            </h2>
            <p className="text-slate-600 mb-5">
              Direkt in deinen Wunschkanton springen — alle Stellen für {config.displayName} regional gefiltert:
            </p>
            <div className="flex flex-wrap gap-2">
              {TOP_CANTONS.map((c) => (
                <Link
                  key={c.slug}
                  href={`/elektrojobs/${config.cantonRoleSlug}/${c.slug}`}
                  className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:border-primary/40 hover:text-primary transition"
                >
                  {config.displayName} {c.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 py-10 max-w-4xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-5">Häufig gestellte Fragen</h2>
          <div className="space-y-3">
            {config.faqs.map((faq, i) => (
              <details key={i} className="group rounded-lg border border-slate-200 bg-white overflow-hidden">
                <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                  {faq.question}
                  <span className="ml-2 shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden>▾</span>
                </summary>
                <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed">{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
