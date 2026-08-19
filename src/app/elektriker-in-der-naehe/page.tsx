import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Elektriker in der Nähe | Stellen in deiner Region — Schweiz",
  description:
    "Elektriker Jobs in deiner Nähe: Stellen in allen Schweizer Regionen — Grossraum Zürich, Nordwestschweiz, Zentralschweiz, Ostschweiz, Romandie. Mit Umkreis-Filter.",
  alternates: { canonical: "/elektriker-in-der-naehe" },
};

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.elektrojob.ch";

const REGIONS: {
  region: string;
  cantons: { name: string; slug: string; cities: string[] }[];
  intro: string;
}[] = [
  {
    region: "Grossraum Zürich",
    cantons: [
      { name: "Zürich", slug: "zuerich", cities: ["Zürich", "Winterthur", "Uster", "Dübendorf", "Wetzikon"] },
      { name: "Schaffhausen", slug: "schaffhausen", cities: ["Schaffhausen", "Neuhausen"] },
      { name: "Thurgau", slug: "thurgau", cities: ["Frauenfeld", "Kreuzlingen", "Arbon"] },
    ],
    intro:
      "Die Region Zürich ist der grösste Schweizer Arbeitsmarkt für Elektriker. Hohe Lohnniveaus, dichte Bautätigkeit und zahlreiche Smart-Building-Projekte sorgen für konstante Nachfrage nach Elektroinstallateuren, Servicetechnikern und Elektroplanern.",
  },
  {
    region: "Nordwestschweiz",
    cantons: [
      { name: "Basel", slug: "basel", cities: ["Basel", "Liestal", "Allschwil"] },
      { name: "Aargau", slug: "aargau", cities: ["Aarau", "Baden", "Wettingen", "Brugg"] },
      { name: "Solothurn", slug: "solothurn", cities: ["Solothurn", "Olten", "Grenchen"] },
    ],
    intro:
      "Pharma, Chemie und Maschinenindustrie prägen den Nordwesten. Servicetechniker, Betriebselektriker und Automatiker sind besonders gesucht — oft mit überdurchschnittlichen Saläre dank Industriearbeitgebern.",
  },
  {
    region: "Bern & Mittelland",
    cantons: [
      { name: "Bern", slug: "bern", cities: ["Bern", "Biel", "Thun", "Burgdorf"] },
      { name: "Fribourg", slug: "fribourg", cities: ["Fribourg", "Bulle", "Murten"] },
    ],
    intro:
      "Im Mittelland trifft Bundesverwaltung auf vielfältige Industrie- und Infrastrukturprojekte. Der zweisprachige Markt rund um Biel und Fribourg eröffnet Elektrikern mit Deutsch- und Französischkenntnissen besondere Chancen.",
  },
  {
    region: "Zentralschweiz",
    cantons: [
      { name: "Luzern", slug: "luzern", cities: ["Luzern", "Emmen", "Kriens", "Sursee"] },
      { name: "Zug", slug: "zug", cities: ["Zug", "Baar", "Cham"] },
    ],
    intro:
      "Tourismus-Infrastruktur, Hightech-Hub und Wohnungsbau treiben die Nachfrage. Zug zahlt regelmässig die höchsten Schweizer Saläre für Elektriker im Industrie- und Gebäudetechnik-Bereich.",
  },
  {
    region: "Ostschweiz",
    cantons: [
      { name: "St. Gallen", slug: "st-gallen", cities: ["St. Gallen", "Wil", "Rapperswil", "Buchs"] },
      { name: "Graubünden", slug: "graubuenden", cities: ["Chur", "Davos", "St. Moritz"] },
    ],
    intro:
      "Industrie, Tourismus und Bergbahn-Infrastruktur sorgen für vielseitige Aufgaben. Saisonarbeit ist in den Tourismusorten verbreitet, in St. Gallen dominieren langfristige Festanstellungen.",
  },
];

const FAQS = [
  {
    question: "Wie finde ich Elektriker Jobs in meiner Nähe?",
    answer:
      "Auf elektrojob.ch gibst du in der Suche deinen Wohnort, deine Postleitzahl oder deinen bevorzugten Arbeitsort ein und wählst einen Umkreis zwischen 5 und 120 Kilometern. Die Trefferliste zeigt dir passende Elektriker Stellen innerhalb dieses Pendelradius und lässt sich nach Relevanz, Aktualität oder Lohn sortieren. Ort und Region sind direkt bei jedem Inserat sichtbar. Wer flexibel mit dem Auto pendelt, sucht häufig in einem Radius von 30 bis 50 Kilometern; für Wege mit dem öffentlichen Verkehr ist je nach Verbindung ein engerer Radius sinnvoll. Mit zusätzlichen Filtern für Pensum, Anstellungsart, Arbeitsmodell und Veröffentlichungsdatum grenzt du die Ergebnisse weiter ein.",
  },
  {
    question: "Welche Region in der Schweiz hat die meisten Elektriker Stellen?",
    answer:
      "Der Grossraum Zürich (inkl. Winterthur und Uster) hat mit Abstand die meisten offenen Elektriker Stellen — typischerweise 30 bis 35 Prozent aller in der Schweiz publizierten Inserate. Es folgen die Nordwestschweiz (Basel, Aargau, Solothurn) mit rund 18 Prozent, dann Bern/Mittelland und die Zentralschweiz mit jeweils 12 bis 15 Prozent. Die Ostschweiz (St. Gallen, Thurgau, Graubünden, Schaffhausen) deckt rund 10 Prozent. Wer pendelbereit ist, profitiert in den Schwerpunktregionen von höherer Stellenwahl und besseren Lohnverhandlungspositionen.",
  },
  {
    question: "Wie weit sollte ich für einen Elektriker Job pendeln?",
    answer:
      "Die meisten Schweizer Elektriker pendeln zwischen 15 und 40 Minuten Fahrzeit. Bei Servicetechniker-Stellen ist ein Geschäftsfahrzeug üblich — Pendelweg zur Werkstatt oder ins Servicegebiet wird teils als Arbeitszeit gerechnet. Auf Baustellen gilt meist die Regel: bis 30 Minuten ohne Zulage, darüber hinaus zahlt der Arbeitgeber Wegspesen oder Zulagen gemäss Gesamtarbeitsvertrag (GAV). Wer regelmässig auf wechselnden Baustellen arbeitet, plant seinen Wohnort entsprechend zentral — oft an der Schnittstelle mehrerer Kantone wie Aargau (Mittelpunkt zwischen Zürich, Basel, Bern).",
  },
];

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Startseite", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Elektriker in der Nähe", item: `${SITE_URL}/elektriker-in-der-naehe` },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

export default function ElektrikerInDerNaehePage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />

      <main className="bg-white">
        <section className="bg-primary/5 border-b">
          <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-4xl">
            <nav className="text-sm text-slate-500 mb-3" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-primary">Startseite</Link>
              <span className="mx-2">/</span>
              <span className="text-slate-700">Elektriker in der Nähe</span>
            </nav>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight mb-4">
              Elektriker <span className="text-primary">in der Nähe</span>
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed mb-6">
              Stellen für Elektriker in jeder Schweizer Region. Wähle deinen Pendelradius oder
              klicke direkt auf deine Region — wir zeigen dir alle offenen Inserate.
            </p>
            <Button asChild>
              <Link href="/">Mit Umkreis-Suche starten</Link>
            </Button>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 py-12 max-w-5xl">
          {REGIONS.map((region) => (
            <article
              key={region.region}
              id={region.region.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "und")}
              className="mb-12 scroll-mt-24"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
                Elektriker in der Nähe — {region.region}
              </h2>
              <p className="text-slate-600 mb-5 leading-relaxed">{region.intro}</p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {region.cantons.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/elektrojobs/elektroinstallateur-efz/${c.slug}`}
                    className="rounded-lg border border-slate-200 bg-white p-4 hover:border-primary/40 hover:shadow-sm transition"
                  >
                    <h3 className="font-semibold text-slate-900 mb-1">
                      Elektriker Jobs {c.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Städte: {c.cities.join(", ")}
                    </p>
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="bg-slate-50 border-t">
          <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">
              Häufig gestellte Fragen
            </h2>
            <div className="space-y-4">
              {FAQS.map((faq, i) => (
                <details key={i} className="group rounded-lg border border-slate-200 bg-white overflow-hidden">
                  <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                    {faq.question}
                    <span className="ml-2 shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden>▾</span>
                  </summary>
                  <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed">{faq.answer}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            Lieber direkt mit Umkreis-Filter suchen?
          </h2>
          <p className="text-slate-600 mb-6">
            Gib deine Postleitzahl oder deinen Wohnort in die Suche ein und wähle den Radius.
          </p>
          <Button asChild size="lg">
            <Link href="/">Jetzt nach Elektriker Jobs suchen</Link>
          </Button>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
