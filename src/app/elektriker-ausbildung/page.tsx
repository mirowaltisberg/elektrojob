import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Elektriker Ausbildung Schweiz | Lehre, EFZ, Weiterbildung 2026",
  description:
    "Alles zur Elektriker Ausbildung in der Schweiz: 3- und 4-jährige Lehre (EFZ/EBA), Lehrlingslohn, Weiterbildungen zum Elektro-Sicherheitsberater, Projektleiter und Installationsmeister.",
  alternates: { canonical: "/elektriker-ausbildung" },
};

export const revalidate = 86400;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.elektrojob.ch";

const APPRENTICESHIPS: { name: string; duration: string; level: string; focus: string; salary: string; slug?: string }[] = [
  {
    name: "Elektroinstallateur EFZ",
    duration: "4 Jahre",
    level: "EFZ",
    focus: "Stark- und Schwachstrominstallationen planen, ausführen, in Betrieb nehmen, prüfen nach NIN.",
    salary: "850 / 1'050 / 1'400 / 1'650 CHF",
    slug: "elektroinstallateur-efz",
  },
  {
    name: "Montage-Elektriker EFZ",
    duration: "3 Jahre",
    level: "EFZ",
    focus: "Ausführende Tätigkeit: Kabelzug, Montage, Verdrahtung, Endkontrolle nach Vorgabe.",
    salary: "850 / 1'050 / 1'400 CHF",
    slug: "montage-elektriker-efz",
  },
  {
    name: "Elektropraktiker EBA",
    duration: "2 Jahre",
    level: "EBA",
    focus: "Einfache Elektroinstallationen unter Anleitung — Brücke zur EFZ-Lehre.",
    salary: "750 / 950 CHF",
  },
  {
    name: "Elektroniker EFZ",
    duration: "4 Jahre",
    level: "EFZ",
    focus: "Elektronische Geräte, Steuerungen und Mikrocontroller entwickeln, prüfen, reparieren.",
    salary: "850 / 1'050 / 1'400 / 1'650 CHF",
    slug: "elektroniker",
  },
  {
    name: "Automatiker EFZ",
    duration: "4 Jahre",
    level: "EFZ",
    focus: "Steuerungs- und Schaltanlagen bauen, SPS programmieren, Industrieautomation.",
    salary: "850 / 1'050 / 1'400 / 1'650 CHF",
    slug: "automatiker-efz",
  },
  {
    name: "Netzelektriker EFZ",
    duration: "3 Jahre",
    level: "EFZ",
    focus: "Bau und Unterhalt von Stromnetzen, Freileitungen, Kabelanlagen, Trafostationen.",
    salary: "850 / 1'050 / 1'400 CHF",
  },
  {
    name: "Telematiker EFZ",
    duration: "4 Jahre",
    level: "EFZ",
    focus: "Daten-, Multimedia- und Sicherheitsnetze installieren, konfigurieren, warten.",
    salary: "850 / 1'050 / 1'400 / 1'650 CHF",
  },
];

const WEITERBILDUNGEN: { name: string; duration: string; gain: string }[] = [
  { name: "Elektro-Sicherheitsberater (BP)", duration: "1–2 Jahre berufsbegleitend", gain: "+10–15 % Lohn, eigenständige Schlusskontrollen nach NIV." },
  { name: "Elektro-Projektleiter (BP)", duration: "1.5–2 Jahre berufsbegleitend", gain: "+15–25 % Lohn, Übernahme von Projekten von Offerte bis Abnahme." },
  { name: "Eidg. dipl. Elektroinstallationsmeister (HFP)", duration: "3–4 Jahre", gain: "+25–40 % Lohn, Geschäftsführungsperspektive." },
  { name: "Dipl. Techniker HF Elektrotechnik", duration: "3 Jahre berufsbegleitend", gain: "+15–25 % Lohn, Zugang zu Planung und Engineering." },
  { name: "Bachelor FH Elektrotechnik", duration: "3 Jahre Vollzeit / 4 Jahre berufsbegleitend", gain: "Akademische Karriere, Engineering- und Forschungsrollen." },
  { name: "Spezialisierungen (KNX, Photovoltaik, Smart Home, Ladeinfrastruktur)", duration: "wenige Tage bis Wochen", gain: "+5–12 % Lohn pro Spezialisierung." },
];

const FAQS = [
  {
    question: "Welche Elektriker-Lehren gibt es in der Schweiz?",
    answer:
      "In der Schweiz gibt es sieben Hauptlehrberufe für Elektriker. Auf EFZ-Niveau (Eidgenössisches Fähigkeitszeugnis) sind das die 4-jährigen Lehren Elektroinstallateur EFZ, Elektroniker EFZ, Automatiker EFZ und Telematiker EFZ sowie die 3-jährigen Lehren Montage-Elektriker EFZ und Netzelektriker EFZ. Auf EBA-Niveau (Eidg. Berufsattest) gibt es den 2-jährigen Elektropraktiker EBA als Einstieg für praktisch begabte Lernende. Wer den Elektropraktiker EBA mit gutem Abschluss beendet, kann anschliessend verkürzt in die Montage-Elektriker- oder Elektroinstallateur-Lehre wechseln. Die Wahl hängt von Interesse (Bau, Industrie, IT/Telekom, Stromnetz) und schulischer Voraussetzung ab.",
  },
  {
    question: "Wie viel verdient ein Elektriker-Lehrling?",
    answer:
      "Der Lehrlingslohn richtet sich nach EIT.swiss-Empfehlung und Lehrjahr. Für die 4-jährige Elektroinstallateur-Lehre liegen die Empfehlungen 2026 bei rund CHF 850 (1. LJ), CHF 1'050 (2. LJ), CHF 1'400 (3. LJ) und CHF 1'650 (4. LJ) pro Monat. Beim 3-jährigen Montage-Elektriker entfällt das vierte Lehrjahr. Beim 2-jährigen Elektropraktiker EBA sind es etwa CHF 750 (1. LJ) und CHF 950 (2. LJ). Der 13. Monatslohn ist in vielen Lehrverträgen Standard. Die genaue Höhe legt der Lehrbetrieb fest — Industriebetriebe und grössere Installationsfirmen zahlen oft 5 bis 15 Prozent über der Empfehlung.",
  },
  {
    question: "Wie wird man Elektriker in der Schweiz?",
    answer:
      "Der klassische Weg ist eine 3- oder 4-jährige berufliche Grundbildung (Lehre) ab dem 9. Schuljahr. Du suchst dir eine Lehrstelle bei einem Schweizer Elektrobetrieb, der Vertrag wird beim kantonalen Berufsbildungsamt registriert, und du absolvierst parallel zur Praxis die Berufsfachschule (1–2 Tage pro Woche) und überbetriebliche Kurse. Nach erfolgreichem Qualifikationsverfahren erhältst du das EFZ. Ein Quereinstieg über eine verkürzte 2-jährige Zusatzlehre ist möglich, wenn du bereits einen verwandten EFZ-Abschluss hast (z.B. vom Montage-Elektriker zum Elektroinstallateur). Nachholbildung Art. 32 BBG erlaubt zudem den EFZ-Erwerb für Erwachsene mit mehrjähriger Branchenerfahrung.",
  },
  {
    question: "Was ist der Unterschied zwischen Elektriker, Elektroinstallateur und Elektroniker?",
    answer:
      "&quot;Elektriker&quot; ist der Sammelbegriff für alle elektrotechnischen Fachberufe. Der Elektroinstallateur EFZ baut elektrische Anlagen in Gebäuden — Verteilungen, Leuchten, Steckdosen, Smart-Home — und nimmt sie nach NIN/NIV in Betrieb. Der Elektroniker EFZ entwickelt und repariert elektronische Geräte, Steuerungen und Mikrocontroller, oft im Industrieumfeld. Der Montage-Elektriker EFZ ist auf die ausführende Montagearbeit fokussiert. Der Automatiker EFZ baut Schaltanlagen und programmiert SPS für Industrieautomation. Wer schlicht &quot;Elektriker werden&quot; sagt, meint meist den Elektroinstallateur — den breitesten und am häufigsten gesuchten Schweizer Lehrberuf.",
  },
  {
    question: "Welche Weiterbildungen lohnen sich nach der Elektriker-Lehre?",
    answer:
      "Drei Wege sind in der Schweizer Praxis besonders beliebt. Der Elektro-Sicherheitsberater (Berufsprüfung) ist die kürzeste Weiterbildung und erlaubt eigenständige Schlusskontrollen — er bringt 10 bis 15 Prozent mehr Lohn. Der Elektro-Projektleiter (BP) führt zur Verantwortung für ganze Projekte und hebt das Salär um 15 bis 25 Prozent. Der eidg. dipl. Elektroinstallationsmeister (Höhere Fachprüfung) öffnet die Tür zur selbständigen Geschäftsführung — Lohnzuwachs 25 bis 40 Prozent. Wer mehr in Engineering will, wählt den dipl. Techniker HF Elektrotechnik oder einen Bachelor FH. Spezialisierungen wie KNX, Photovoltaik, Smart-Home oder Ladeinfrastruktur lassen sich parallel in wenigen Tagen oder Wochen erwerben.",
  },
];

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Startseite", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Elektriker Ausbildung", item: `${SITE_URL}/elektriker-ausbildung` },
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

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Elektriker Ausbildung Schweiz — Lehre, EFZ, Weiterbildung",
  datePublished: "2026-05-08",
  dateModified: "2026-05-08",
  author: { "@type": "Organization", name: "elektrojob.ch" },
  publisher: {
    "@type": "Organization",
    name: "elektrojob.ch",
    logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.svg` },
  },
};

export default function ElektrikerAusbildungPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={articleSchema} />

      <main className="bg-white">
        <section className="bg-primary/5 border-b">
          <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-4xl">
            <nav className="text-sm text-slate-500 mb-3" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-primary">Startseite</Link>
              <span className="mx-2">/</span>
              <span className="text-slate-700">Elektriker Ausbildung</span>
            </nav>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight mb-4">
              Elektriker <span className="text-primary">Ausbildung</span> Schweiz
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed mb-6">
              Lehre, EFZ, EBA und Weiterbildungen — der vollständige Guide für deinen Berufseinstieg
              und deine Karriere als Elektriker in der Schweiz.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/">Lehrstellen ansehen</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/lohn-elektriker-schweiz">Lohn vergleichen</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 py-12 max-w-5xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">
            Elektriker Lehre — Übersicht der 7 Berufe
          </h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            In der Schweiz führen sieben Lehrberufe in das Feld der Elektrotechnik. Von der
            2-jährigen EBA-Lehre bis zur 4-jährigen EFZ-Lehre — wähle nach deinen Interessen
            (Bau, Industrie, IT/Telekom, Stromnetz) und schulischen Voraussetzungen.
          </p>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-900">Beruf</th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-900">Dauer</th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-900">Niveau</th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-900">Schwerpunkt</th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-900">Lohn pro LJ</th>
                </tr>
              </thead>
              <tbody>
                {APPRENTICESHIPS.map((row) => (
                  <tr key={row.name} className="border-t border-slate-100">
                    <td className="py-3 px-4 text-sm font-medium">
                      {row.slug ? (
                        <Link
                          href={`/elektrojobs/${row.slug}/zuerich`}
                          className="text-slate-800 hover:text-primary"
                        >
                          {row.name}
                        </Link>
                      ) : (
                        <span className="text-slate-800">{row.name}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-700 whitespace-nowrap">{row.duration}</td>
                    <td className="py-3 px-4 text-sm text-slate-700">{row.level}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{row.focus}</td>
                    <td className="py-3 px-4 text-sm text-slate-700 whitespace-nowrap">{row.salary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-slate-50 border-y">
          <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">
              Weiterbildungen — vom EFZ zur Karriere
            </h2>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Nach der Grundbildung stehen mehrere Weiterbildungswege offen. Die meisten Schweizer
              Elektrobetriebe unterstützen ihre Mitarbeitenden finanziell und mit reduziertem Pensum,
              weil voll qualifizierte Fachkräfte und Führungspersonen knapp sind.
            </p>
            <div className="space-y-3">
              {WEITERBILDUNGEN.map((w) => (
                <div key={w.name} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900">{w.name}</h3>
                    <span className="text-xs text-slate-500">{w.duration}</span>
                  </div>
                  <p className="text-sm text-slate-600">{w.gain}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">
            Quereinstieg & Erwachsenenbildung
          </h2>
          <div className="prose prose-slate max-w-none space-y-4 text-slate-700">
            <p>
              Du bist über 22 und hast keine Elektriker-Lehre? Drei Wege bringen dich trotzdem zum
              EFZ-Abschluss:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Verkürzte Zusatzlehre (2 Jahre):</strong> Wenn du bereits einen Lehrabschluss
                in einem verwandten Beruf hast (z.B. Montage-Elektriker → Elektroinstallateur).
              </li>
              <li>
                <strong>Nachholbildung Art. 32 BBG:</strong> Mit mindestens 5 Jahren Berufserfahrung
                in der Branche kannst du direkt zur Lehrabschlussprüfung antreten — meist mit einem
                Vorbereitungskurs von 6 bis 12 Monaten.
              </li>
              <li>
                <strong>Validierung von Bildungsleistungen:</strong> Dein Erfahrungsdossier wird
                geprüft, fehlende Kompetenzen ergänzt du modular nach.
              </li>
            </ul>
            <p>
              Beratungsstellen wie die kantonalen Berufs-, Studien- und Laufbahnberatungsstellen
              (BSLB) und die EIT.swiss-Berufsbildungsabteilung helfen kostenlos bei der Einstufung.
            </p>
          </div>
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
                  <div
                    className="px-4 pb-4 text-sm text-slate-600 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            Bereit für die Elektriker-Lehrstelle?
          </h2>
          <p className="text-slate-600 mb-6">
            Filtere offene Lehrstellen und Trainee-Programme nach Region und Pensum.
          </p>
          <Button asChild size="lg">
            <Link href="/">Offene Stellen für Elektriker ansehen</Link>
          </Button>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
