import Link from "next/link";
import { TOP_LANDING_PAGES, getLandingPath } from "@/lib/landing-pages";
import { JsonLd } from "@/components/json-ld";

// SEO-DECISION: Server-rendered content for homepage crawlability.
// This content is always visible to search engines even though the
// main job search is client-rendered.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.elektrojob.ch";

const HOMEPAGE_FAQS = [
  {
    question: "Welche Elektrojobs gibt es auf elektrojob.ch?",
    answer:
      "Auf elektrojob.ch findest du offene Stellen für Elektroinstallateur EFZ, Montage-Elektriker EFZ, Servicetechniker Elektro, Projektleiter Elektro, Automatiker EFZ, Elektroplaner, Elektromonteur, Gebäudetechniker, Photovoltaik-Spezialisten, Schaltanlagenbauer, Bauleiter Elektro und Betriebselektriker — in der ganzen Schweiz.",
  },
  {
    question: "Was verdient ein Elektroinstallateur in der Schweiz?",
    answer:
      "Ein Elektroinstallateur EFZ verdient in der Schweiz durchschnittlich zwischen CHF 75'000 und CHF 95'000 pro Jahr. Das Gehalt variiert je nach Kanton, Berufserfahrung und Arbeitgeber. In Zürich und Basel liegen die Löhne tendenziell höher als in ländlicheren Regionen.",
  },
  {
    question: "Wie finde ich einen Job als Elektriker in der Schweiz?",
    answer:
      "Auf elektrojob.ch kannst du gezielt nach Elektrojobs in deiner Region suchen. Nutze die Filteroptionen nach Beruf, Kanton, Pensum und Umkreis. Du kannst dich direkt über die Plattform bewerben — einfach Lebenslauf hochladen und abschicken.",
  },
  {
    question: "Welche Kantone haben die meisten Elektrojobs?",
    answer:
      "Die meisten offenen Stellen für Elektro-Fachkräfte gibt es in den Kantonen Zürich, Bern, Aargau, Basel und St. Gallen. Diese Regionen haben eine hohe Dichte an Elektroinstallationsfirmen und Bauprojekten.",
  },
  {
    question: "Was ist der Unterschied zwischen Elektroinstallateur und Montage-Elektriker?",
    answer:
      "Der Elektroinstallateur EFZ (4-jährige Lehre) plant und installiert elektrische Anlagen eigenständig und darf Sicherheitskontrollen durchführen. Der Montage-Elektriker EFZ (3-jährige Lehre) führt hauptsächlich Montagearbeiten unter Anleitung aus. Beide Berufe sind in der Schweiz sehr gefragt.",
  },
  {
    question: "Gibt es auf elektrojob.ch auch Teilzeitstellen?",
    answer:
      "Ja, auf elektrojob.ch findest du sowohl Vollzeit- als auch Teilzeitstellen. Nutze den Pensum-Filter, um Stellen mit 60–80% oder 80–100% Arbeitspensum zu finden.",
  },
];

const faqPageSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOMEPAGE_FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

const SALARY_TABLE = [
  { role: "Bauleiter Elektro", range: "CHF 90'000 – 120'000" },
  { role: "Projektleiter Elektro", range: "CHF 85'000 – 110'000" },
  { role: "Elektroplaner", range: "CHF 80'000 – 100'000" },
  { role: "Elektroinstallateur EFZ", range: "CHF 75'000 – 95'000" },
  { role: "Automatiker EFZ", range: "CHF 75'000 – 95'000" },
  { role: "Gebäudetechniker", range: "CHF 75'000 – 95'000" },
  { role: "Servicetechniker Elektro", range: "CHF 75'000 – 90'000" },
  { role: "Betriebselektriker", range: "CHF 75'000 – 90'000" },
  { role: "Montage-Elektriker EFZ", range: "CHF 75'000 – 80'000" },
  { role: "Photovoltaik-Spezialist", range: "CHF 70'000 – 90'000" },
  { role: "Elektromonteur", range: "CHF 70'000 – 85'000" },
  { role: "Schaltanlagenbauer", range: "CHF 72'000 – 88'000" },
];

/**
 * Server-rendered SEO content for the homepage.
 * Crawlable by search engines even when JS is disabled.
 * Includes: intro text, FAQ section, salary table, landing page links.
 */
export function HomepageSeoContent() {
  return (
    <section className="bg-white border-t" aria-label="Informationen für Elektro-Fachkräfte">
      <JsonLd data={faqPageSchema} />

      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-5xl">
        {/* SEO intro paragraph — AI-citeable, entity-rich */}
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            Elektrojobs in der Schweiz finden
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-4">
            Auf elektrojob.ch finden Elektro-Fachkräfte aktuelle offene Stellen in der ganzen Schweiz
            — von Elektroinstallateur EFZ über Montage-Elektriker und Projektleiter Elektro bis hin zu
            Automatiker, Elektroplaner und Photovoltaik-Spezialisten. Ob du deinen nächsten Elektrojob
            in Zürich, Bern oder Basel suchst — unsere spezialisierte Jobbörse
            richtet sich an alle Berufsleute der Elektrobranche.
          </p>
          <p className="text-slate-600 text-base leading-relaxed">
            Ob du in Zürich, Bern, Basel, Luzern, St. Gallen oder einem anderen Schweizer Kanton
            suchst — mit unserer smarten Filterung nach Beruf, Ort, Umkreis und Pensum findest du
            schnell die passende Stelle. Bewirb dich direkt über die Plattform mit wenigen Klicks.
          </p>
        </div>

        {/* Salary table — highly citeable by AI */}
        <div className="mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
            Lohnübersicht Elektroberufe Schweiz
          </h2>
          <p className="text-slate-500 text-sm mb-4">
            Durchschnittliche Jahresgehälter für Elektro-Fachkräfte in der Schweiz (2025/2026, Richtwerte).
            Quellen:{" "}
            <a href="https://www.eit.swiss" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-700">EIT.swiss</a>,{" "}
            <a href="https://www.electrosuisse.ch" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-700">Electrosuisse</a>,{" "}
            <a href="https://www.bfs.admin.ch" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-700">BFS</a>.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="py-3 pr-4 text-sm font-semibold text-slate-900">Beruf</th>
                  <th className="py-3 text-sm font-semibold text-slate-900">Jahreslohn (CHF)</th>
                </tr>
              </thead>
              <tbody>
                {SALARY_TABLE.map((row) => (
                  <tr key={row.role} className="border-b border-slate-100">
                    <td className="py-2.5 pr-4 text-sm text-slate-700">{row.role}</td>
                    <td className="py-2.5 text-sm font-medium text-slate-900">{row.range}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ section — conversational query targets */}
        <div className="mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
            Häufig gestellte Fragen
          </h2>
          <div className="space-y-4">
            {HOMEPAGE_FAQS.map((faq, index) => (
              <details
                key={index}
                className="group rounded-lg border border-slate-200 bg-slate-50 overflow-hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors">
                  {faq.question}
                  <span
                    className="ml-2 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  >
                    ▾
                  </span>
                </summary>
                <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Landing page links — grouped by role to reduce DOM size while keeping all 144 links crawlable */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
            Alle Elektrojobs nach Beruf und Kanton
          </h2>
          <nav aria-label="Alle Stellenangebote nach Beruf und Kanton" className="space-y-4">
            {Object.entries(
              TOP_LANDING_PAGES.reduce<Record<string, typeof TOP_LANDING_PAGES>>((acc, item) => {
                (acc[item.role] ??= []).push(item);
                return acc;
              }, {})
            ).map(([role, pages]) => (
              <div key={role}>
                <p className="text-sm font-semibold text-slate-800 mb-1.5">{role}</p>
                <div className="flex flex-wrap gap-1.5">
                  {pages.map((item) => (
                    <Link
                      key={`${item.role}-${item.canton}`}
                      href={getLandingPath(item)}
                      className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:border-primary/40 hover:text-primary transition-colors"
                    >
                      {item.canton}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
