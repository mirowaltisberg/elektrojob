import Link from "next/link";
import { TOP_LANDING_PAGES, getLandingPath } from "@/lib/landing-pages";
import { JsonLd } from "@/components/json-ld";

// SEO-DECISION: Server-rendered content for homepage crawlability.
// This content is always visible to search engines even though the
// main job search is client-rendered.

const HOMEPAGE_FAQS = [
  {
    question: "Welche Elektriker Jobs gibt es auf elektrojob.ch?",
    answer: "Auf der Startseite findest du ausgewählte Stellen aus der Schweizer Elektrobranche mit konkreten Angaben zu Ort, Pensum, Aufgaben und Anforderungen. Welche Berufe und Regionen aktuell vertreten sind, siehst du in der Trefferliste. Die Auswahl ändert sich mit den verfügbaren Inseraten. Weitere Berufs- und Kantonsseiten können auch Stellen mit noch unvollständigen Angaben enthalten; dort werden fehlende Details kenntlich gemacht.",
  },
  {
    question: "Warum zeigen manche Stellen keinen Lohn?",
    answer: "Viele Inserate enthalten keine veröffentlichte Lohnangabe. In diesem Fall ergänzen wir keinen geschätzten Betrag für die konkrete Stelle. Den Lohn und weitere Vertragsbedingungen klärst du bei deiner Anfrage. Allgemeine Informationen zu Lohnfragen ersetzen kein konkretes Angebot des Arbeitgebers.",
  },
  {
    question: "Wie finde ich einen Elektriker Job in der Schweiz?",
    answer: "Suche nach Beruf und Arbeitsort und grenze die Auswahl bei Bedarf mit Umkreis und Pensum ein. Auf der Detailseite findest du die vorhandenen Aufgaben und Anforderungen. Wenn die Stelle passt, sendest du deinen Namen und deinen Lebenslauf als PDF bis 4 MB über das Formular zur internen Prüfung. Dafür bestätigst du die Einwilligung zur Verarbeitung deiner Angaben; ein Konto brauchst du nicht. Für eine breitere Suche kannst du verwandte Berufsbezeichnungen und benachbarte Orte berücksichtigen.",
  },
  {
    question: "Wie finde ich Stellen in meinem Kanton?",
    answer: "Gib deinen Kanton, einen Ort oder eine Postleitzahl in das Ortsfeld ein. Über den Umkreis kannst du die Suche auf nahegelegene Arbeitsorte begrenzen. Die angezeigte Trefferzahl bezieht sich auf die aktuelle Auswahl und deine Filter; sie ist keine Statistik des gesamten Schweizer Arbeitsmarkts.",
  },
  {
    question: "Welche Ausbildung brauche ich für eine Stelle?",
    answer: "Die Anforderungen unterscheiden sich je nach Beruf und Aufgabe. Lies deshalb die Angaben zur Ausbildung und Berufserfahrung auf der jeweiligen Detailseite. Falls deine Qualifikation anders bezeichnet wird oder einzelne Anforderungen unklar sind, kannst du dies bei deiner Anfrage klären.",
  },
  {
    question: "Wie finde ich Stellen mit reduziertem Pensum?",
    answer: "Nutze den Pensum-Filter und wähle einen der aktuell verfügbaren Werte. Die Startseite zeigt nur Stellen, deren Arbeitspensum ausdrücklich angegeben ist. Ein Bereich wie 80–100 Prozent beschreibt den Rahmen im Inserat; das konkrete Pensum wird im Bewerbungsprozess vereinbart. Wir ersetzen fehlende Pensumsangaben nicht durch Standardwerte.",
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

/**
 * Server-rendered SEO content for the homepage.
 * Crawlable by search engines even when JS is disabled.
 * Includes: introduction, FAQ section and landing page links.
 */
export function HomepageSeoContent() {
  return (
    <section className="bg-white border-t" aria-label="Informationen für Elektriker in der Schweiz">
      <JsonLd data={faqPageSchema} />

      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-5xl">
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            Ausgewählte Elektriker Jobs in der Schweiz
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-4">
            Auf der Startseite zeigen wir Elektrojobs mit konkreten Aufgaben, Anforderungen,
            einem Arbeitsort und einem angegebenen Pensum. So kannst du die wichtigsten
            Stellenangaben vergleichen, bevor du deine Bewerbung sendest.
          </p>
          <p className="text-slate-600 text-base leading-relaxed">
            Suche nach Beruf, Ort, Umkreis und Pensum. Die angezeigten Ergebnisse richten
            sich nach den aktuell verfügbaren Inseraten und deinen Filtern.
          </p>
          <p className="text-slate-600 text-base leading-relaxed mt-4">
            Lohn und Anstellungsart zeigen wir bei einer Stelle nur an, wenn entsprechende
            Angaben vorhanden sind. Fehlende Angaben werden nicht durch Schätzungen ersetzt.
          </p>
        </div>

        <div id="loehne" className="mb-12 scroll-mt-24">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
            Lohnangaben zur konkreten Stelle
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Ist kein Lohn veröffentlicht, klärst du den Betrag und die Vertragsbedingungen
            bei deiner Anfrage. Allgemeine Berufs- und Lohninformationen sind keine Zusage
            für eine der aufgeführten Stellen.
          </p>
        </div>

        {/* Topical hubs — internal links to new SEO content */}
        <div className="mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
            Mehr zum Thema Elektriker Schweiz
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Link href="/lohn-elektriker-schweiz" className="rounded-lg border border-slate-200 bg-slate-50 p-4 hover:border-primary/40 hover:bg-white transition">
              <p className="font-semibold text-slate-900 mb-1">Lohn Elektriker Schweiz</p>
              <p className="text-xs text-slate-600">Informationen zu Lohnfragen und Einflussfaktoren.</p>
            </Link>
            <Link href="/elektriker-ausbildung" className="rounded-lg border border-slate-200 bg-slate-50 p-4 hover:border-primary/40 hover:bg-white transition">
              <p className="font-semibold text-slate-900 mb-1">Elektriker Ausbildung</p>
              <p className="text-xs text-slate-600">Lehre, EFZ, EBA und Weiterbildung — der vollständige Guide.</p>
            </Link>
            <Link href="/elektriker-in-der-naehe" className="rounded-lg border border-slate-200 bg-slate-50 p-4 hover:border-primary/40 hover:bg-white transition">
              <p className="font-semibold text-slate-900 mb-1">Elektriker in der Nähe</p>
              <p className="text-xs text-slate-600">Stellen in deiner Region — Grossraum Zürich, Basel, Bern, Zentralschweiz, Ostschweiz.</p>
            </Link>
            <Link href="/elektroinstallateur-jobs" className="rounded-lg border border-slate-200 bg-slate-50 p-4 hover:border-primary/40 hover:bg-white transition">
              <p className="font-semibold text-slate-900 mb-1">Elektroinstallateur Jobs</p>
              <p className="text-xs text-slate-600">Stellenangebote für Elektroinstallateure in der Schweiz.</p>
            </Link>
            <Link href="/montage-elektriker-jobs" className="rounded-lg border border-slate-200 bg-slate-50 p-4 hover:border-primary/40 hover:bg-white transition">
              <p className="font-semibold text-slate-900 mb-1">Montage-Elektriker Jobs</p>
              <p className="text-xs text-slate-600">Stellen für Montage-Elektriker EFZ in der ganzen Schweiz.</p>
            </Link>
            <Link href="/elektroplaner-jobs" className="rounded-lg border border-slate-200 bg-slate-50 p-4 hover:border-primary/40 hover:bg-white transition">
              <p className="font-semibold text-slate-900 mb-1">Elektroplaner Jobs</p>
              <p className="text-xs text-slate-600">Planungsbüros, Generalplaner und Bauherrenberatung.</p>
            </Link>
            <Link href="/elektroniker-jobs" className="rounded-lg border border-slate-200 bg-slate-50 p-4 hover:border-primary/40 hover:bg-white transition">
              <p className="font-semibold text-slate-900 mb-1">Elektroniker Jobs</p>
              <p className="text-xs text-slate-600">Hardware, Embedded und Service in Schweizer Industrie.</p>
            </Link>
            <Link href="/elektriker-jobs/zuerich" className="rounded-lg border border-slate-200 bg-slate-50 p-4 hover:border-primary/40 hover:bg-white transition">
              <p className="font-semibold text-slate-900 mb-1">Elektriker Jobs Zürich</p>
              <p className="text-xs text-slate-600">Stellenangebote im Grossraum Zürich.</p>
            </Link>
            <Link href="/elektriker-jobs/basel" className="rounded-lg border border-slate-200 bg-slate-50 p-4 hover:border-primary/40 hover:bg-white transition">
              <p className="font-semibold text-slate-900 mb-1">Elektriker Jobs Basel</p>
              <p className="text-xs text-slate-600">Pharma, Chemie und Industrie in der Nordwestschweiz.</p>
            </Link>
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
            Elektriker Jobs nach Beruf und Kanton
          </h2>
          <nav aria-label="Alle Stellen für Elektriker nach Beruf und Kanton" className="space-y-4">
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
