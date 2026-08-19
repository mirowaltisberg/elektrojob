import Link from "next/link";
import { TOP_LANDING_PAGES, getLandingPath } from "@/lib/landing-pages";
import { JsonLd } from "@/components/json-ld";

// SEO-DECISION: Server-rendered content for homepage crawlability.
// This content is always visible to search engines even though the
// main job search is client-rendered.

// FAQ answers target the AI-citation optimum band of 134-167 words per answer.
// Shorter answers get truncated by LLMs into low-context excerpts; longer ones
// get summarized away. The 134-167 range survives both ends intact.
const HOMEPAGE_FAQS = [
  {
    question: "Welche Elektriker Jobs gibt es auf elektrojob.ch?",
    answer:
      "Auf elektrojob.ch findest du Stellen aus der Schweizer Elektrobranche. Dazu gehören die EFZ-Berufe Elektroinstallateur, Montage-Elektriker, Elektroniker, Automatiker, Netzelektriker und Telematiker, dazu Service- und Aussendienst-Profile wie Servicetechniker Elektro, Betriebselektriker und Smart-Home-Techniker. Auf der Planungs- und Projektebene findest du Elektroplaner, Gebäudetechnikplaner, Bauleiter Elektro und Projektleiter Elektro. Spezialisierte Profile wie Photovoltaik-Spezialisten, Schaltanlagenbauer, Sicherheitsberater nach NIV sowie Ladeinfrastruktur-Techniker sind ebenfalls vertreten. Mit der Suche nach Beruf, Ort oder Postleitzahl und dem Umkreis-Filter grenzt du die Treffer nach deinem bevorzugten Pendelradius ein. Zusätzliche Filter für Pensum, Anstellungsart, Arbeitsmodell und Veröffentlichungsdatum helfen bei der Auswahl. Die Inserate verteilen sich auf alle 26 Schweizer Kantone, mit besonderer Dichte in Zürich, Bern, Aargau, Basel-Stadt und der Ostschweiz.",
  },
  {
    question: "Was verdient ein Elektroinstallateur in der Schweiz?",
    answer:
      "Ein Elektroinstallateur EFZ verdient in der Schweiz im Durchschnitt CHF 75'000 bis 95'000 pro Jahr. Das Gehalt variiert deutlich nach Kanton, Berufserfahrung, Arbeitgebergrösse und Spezialisierung. Im Kanton Zürich, in Zug und in Basel-Stadt liegen die Löhne tendenziell 5 bis 10 Prozent über dem Schweizer Mittel; in ländlicheren Kantonen wie Freiburg, Solothurn oder Graubünden 5 bis 8 Prozent darunter. Berufsanfänger nach EFZ-Abschluss starten meist im Bereich CHF 65'000 bis 72'000, mit drei bis fünf Jahren Erfahrung verschiebt sich der Marktwert in den Bereich CHF 80'000 bis 90'000. Spezialisierungen auf Smart-Building, Photovoltaik oder Brandmeldeanlagen bringen zusätzliche 5 bis 12 Prozent. Vorarbeiter, Serviceeinsatz mit Pikett und Sicherheitsberaterausweis nach NIV heben das Salärband weiter. Im Vergleich zum Nachbarland Deutschland liegen die Schweizer Bruttolöhne durchschnittlich 60 bis 80 Prozent höher; allerdings sind Lebenshaltungskosten und Krankenkassenprämien ebenfalls deutlich höher, sodass sich der direkte Nettovergleich nur über einen detaillierten Lohnrechner lohnt. Der 13. Monatslohn ist in der Elektrobranche Standard. Die vollständige Lohnübersicht für alle Elektroberufe findest du auf dieser Startseite.",
  },
  {
    question: "Wie finde ich einen Elektriker Job in der Schweiz?",
    answer:
      "Auf elektrojob.ch startest du mit einem Beruf, Stichwort oder Fachgebiet und ergänzt bei Bedarf einen Ort oder eine Postleitzahl. Über den Umkreis-Filter legst du fest, wie weit die Stelle von deinem gewünschten Arbeitsort entfernt sein darf. Anschliessend kannst du die Ergebnisse nach Anstellungsart, Pensum, Arbeitsmodell und Veröffentlichungsdatum eingrenzen und nach Relevanz oder Aktualität sortieren. Jede Trefferkarte zeigt die wichtigsten Angaben zur Stelle kompakt an. Auf der Detailseite findest du Aufgaben, Anforderungen und weitere Angaben zum Inserat. Wenn die Stelle passt, kannst du dein Bewerbungsdossier direkt über das Formular erfassen und einen Lebenslauf als PDF-, DOC- oder DOCX-Datei hochladen. Für eine breitere Suche lohnt es sich, verwandte Berufsbezeichnungen und benachbarte Kantone einzubeziehen.",
  },
  {
    question: "In welchen Kantonen gibt es die meisten Elektriker Jobs?",
    answer:
      "Die mit Abstand meisten offenen Stellen für Elektro-Fachkräfte gibt es in den Kantonen Zürich, Bern, Aargau, Waadt und Basel-Stadt. Diese fünf Kantone vereinen rund 60 Prozent aller publizierten Elektro-Stellenausschreibungen in der Schweiz. Im Mittelfeld folgen St. Gallen, Luzern, Genf, Thurgau und Solothurn. Ländlichere Kantone wie Uri, Glarus, Appenzell Innerrhoden oder Jura haben deutlich weniger offene Stellen, dafür weniger Konkurrenz unter Bewerbern. Die regionale Verteilung folgt Wirtschaftswachstum und Bautätigkeit: Wo Wohnungsbau, Gewerbe- und Industrieprojekte zunehmen, steigt auch die Nachfrage nach Elektro-Installateuren, Servicetechnikern und Planern. Für Pendlerregionen lohnt sich ein Blick auf die Nachbarkantone — Aargauer Betriebe rekrutieren häufig in Solothurn und Luzern, Basler in Baselland und Solothurn, Zürcher in Schaffhausen, Thurgau und Schwyz. Eine zweisprachige Bewerbung (Deutsch und Französisch) öffnet zusätzlich den Markt im Kanton Wallis, in der Region Biel/Bienne und in Teilen von Fribourg. Die täglich aktualisierten Stellenzahlen pro Kanton siehst du in unserem Filter.",
  },
  {
    question:
      "Was ist der Unterschied zwischen Elektroinstallateur und Montage-Elektriker?",
    answer:
      "Der Unterschied liegt in Lehrdauer, Befähigung und Gehaltsband. Der Elektroinstallateur EFZ absolviert eine 4-jährige Lehre und darf eigenständig Anlagen planen, in Betrieb nehmen und nach NIN / NIV prüfen. Mit dem Zusatzausweis Sicherheitsberater übernimmt er die volle Verantwortung für Schlusskontrollen. Der Montage-Elektriker EFZ macht eine 3-jährige Lehre und ist auf die ausführende Tätigkeit fokussiert: Kabelzug, Apparatemontage, Verdrahtung von Verteilungen, Endkontrolle nach Vorgabe. Beide Berufe sind in der Schweiz gefragt, der Lohnabstand beträgt durchschnittlich CHF 5'000 bis 10'000 pro Jahr zugunsten des Elektroinstallateurs. Wechsel ist gut möglich: Über die zweijährige verkürzte Zusatzlehre wird der Montage-Elektriker zum Elektroinstallateur EFZ. Viele Lehrbetriebe finanzieren diesen Weg mit, weil Fachkräfte mit voller Befähigung knapp sind. Aktuell entstehen zudem hybride Profile wie der Solarteur (Fokus Photovoltaik-Montage), der für Berufseinsteiger eine Alternative zum klassischen Installateur-Pfad darstellt. Welcher Beruf besser passt, hängt von Lust auf Eigenverantwortung versus Teamarbeit auf der Baustelle ab — eine Berufsberatung in deinem Wohnkanton hilft bei der konkreten Wahl.",
  },
  {
    question: "Gibt es auf elektrojob.ch auch Teilzeitstellen für Elektriker?",
    answer:
      "Ja, ein wachsender Teil der Stellen auf elektrojob.ch ist Teilzeitarbeit oder mit reduziertem Pensum verfügbar. Im Filter wählst du zwischen Vollzeit (90–100%), 80–100%, 60–80% oder Teilzeit unter 60%. Teilzeitmodelle sind besonders bei Servicetechnikern, Elektroplanern und in der Gebäudetechnik verbreitet — Elternzeit-Modelle, schrittweiser Wiedereinstieg nach Pause und Vorruhestand mit Reduzierung auf 60 oder 80 Prozent sind in der Schweizer Elektrobranche zunehmend Standard. Auf der Baustellenseite (Elektroinstallateur, Montage-Elektriker) bleibt Vollzeit dominant, weil Equipen meist vollständig disponiert werden. In den Bereichen Planung, Projektleitung und Kundendienst ist Teilzeit hingegen gut etabliert. Job-Sharing-Modelle (zwei Personen teilen sich eine Stelle) werden ebenfalls vereinzelt angeboten. Wer Elternzeit-Wiedereinstieg sucht, profitiert von einer wachsenden Akzeptanz für gestaffelte Pensumserhöhungen — also Start mit 60 Prozent und schrittweise Anhebung über 12 bis 24 Monate. Frage in Erstgesprächen explizit nach diesem Modell, viele Betriebe bieten es ohne aktive Werbung an. Wir kennzeichnen jedes Inserat klar mit dem akzeptierten Pensumband, damit du auf einen Blick siehst, welche Stelle zu deiner gewünschten Arbeitszeit passt.",
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
    <section className="bg-white border-t" aria-label="Informationen für Elektriker in der Schweiz">
      <JsonLd data={faqPageSchema} />

      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-5xl">
        {/* SEO intro paragraph — AI-citeable, entity-rich */}
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            Elektriker Jobs Schweiz — alle offenen Stellen für Elektriker
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-4">
            Auf elektrojob.ch findest du alle offenen Stellen für Elektriker in der Schweiz —
            vom Elektroinstallateur EFZ über den Montage-Elektriker und Elektroniker bis zum
            Elektroplaner, Servicetechniker und Projektleiter Elektro. Unsere spezialisierte
            Jobbörse für Elektriker richtet sich an alle Berufsleute der Schweizer Elektrobranche.
          </p>
          <p className="text-slate-600 text-base leading-relaxed">
            Egal ob du Elektriker Jobs in Zürich, Basel, Bern, Luzern oder St. Gallen suchst —
            mit der smarten Filterung nach Beruf, Ort, Umkreis und Pensum findest du als
            Elektriker Schweiz-weit schnell die passende Stelle. Bewirb dich direkt über die
            Plattform mit wenigen Klicks.
          </p>

          <p className="text-slate-600 text-base leading-relaxed mt-4">
            Zusätzlich findest du Festanstellungen, Temporärstellen, Teilzeitpensen, Lehrstellen
            und Elektriker Stellenangebote mit Lohnband. Besonders gesucht werden Elektriker
            mit EFZ/EBA, Erfahrung im Service, in der Montage oder Projektleitung sowie
            regionaler Mobilität. Damit eignet sich die Suche für klassische Stellen für
            Elektriker in der Schweiz ebenso wie für spezialisierte Profile wie
            Elektroinstallateur Jobs, Montage-Elektriker, Elektroniker und Elektroplaner Jobs.
          </p>
        </div>

        {/* Salary table — highly citeable by AI. id="loehne" anchor lets editorial */}
        {/* sections on category pages deep-link via /#loehne. */}
        <div id="loehne" className="mb-12 scroll-mt-24">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
            Lohn Elektriker Schweiz — Lohnübersicht aller Elektroberufe
          </h2>
          <p className="text-slate-500 text-sm mb-4">
            Durchschnittliche Jahresgehälter für Elektriker in der Schweiz (2025/2026, Richtwerte).
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

          <details className="mt-4 group rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
            <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors">
              Methodologie — wie wir die Lohnbänder berechnen
              <span
                className="ml-2 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                aria-hidden="true"
              >
                ▾
              </span>
            </summary>
            <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed space-y-2">
              <p>
                <strong>Stand:</strong> 2. Mai 2026.
              </p>
              <p>
                <strong>Quellen:</strong> Wir aggregieren öffentlich publizierte
                Lohndaten der Schweizer Elektrobranche aus den Jahres- und
                Branchenstatistiken von{" "}
                <a
                  href="https://www.eit.swiss"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-slate-800"
                >
                  EIT.swiss
                </a>{" "}
                (Verband der Schweizer Elektroinstallationsbetriebe),{" "}
                <a
                  href="https://www.electrosuisse.ch"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-slate-800"
                >
                  Electrosuisse
                </a>{" "}
                und dem{" "}
                <a
                  href="https://www.bfs.admin.ch"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-slate-800"
                >
                  Bundesamt für Statistik (BFS)
                </a>
                . Ergänzend werten wir die täglich auf elektrojob.ch indexierten
                öffentlichen Stellenausschreibungen aus.
              </p>
              <p>
                <strong>Bandbreite und Mittelwert:</strong> Die Tabelle zeigt
                Richtbänder. Der konkrete Lohn wird im Bewerbungsprozess
                individuell verhandelt und hängt von Erfahrung, Spezialisierung,
                Arbeitgebergrösse, Branche und Region ab. Innerhalb eines Bands
                liegt die Mehrheit (rund zwei Drittel) der ausgewerteten
                Vergleichswerte.
              </p>
              <p>
                <strong>Aktualisierung:</strong> Wir überarbeiten die Lohnbänder
                jährlich beziehungsweise sofort, sobald ein Branchenverband neue
                Empfehlungen veröffentlicht oder sich die Marktlage in einer
                Region merklich verändert. Korrekturhinweise nehmen wir gerne
                über die Kontaktseite entgegen.
              </p>
            </div>
          </details>
        </div>

        {/* Topical hubs — internal links to new SEO content */}
        <div className="mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
            Mehr zum Thema Elektriker Schweiz
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Link href="/lohn-elektriker-schweiz" className="rounded-lg border border-slate-200 bg-slate-50 p-4 hover:border-primary/40 hover:bg-white transition">
              <p className="font-semibold text-slate-900 mb-1">Lohn Elektriker Schweiz</p>
              <p className="text-xs text-slate-600">Lohnbänder nach Beruf, Erfahrung und Kanton — Stand 2026.</p>
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
              <p className="text-xs text-slate-600">Alle Stellen für Elektroinstallateure EFZ in der Schweiz.</p>
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
              <p className="text-xs text-slate-600">Grossraum Zürich — höchste Stellenwahl der Schweiz.</p>
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
