import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Lohn Elektriker Schweiz 2026 | Gehalt nach Beruf, Kanton & Erfahrung",
  description:
    "Wie viel verdient ein Elektriker in der Schweiz? Lohn nach Beruf (Elektroinstallateur, Montage-Elektriker, Elektroplaner), Kanton, Erfahrung und Spezialisierung — Daten 2026.",
  alternates: { canonical: "/lohn-elektriker-schweiz" },
};

export const revalidate = 86400;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.elektrojob.ch";

const ROLE_SALARIES: { role: string; entry: string; mid: string; senior: string; slug: string }[] = [
  { role: "Elektroinstallateur EFZ", entry: "65'000 – 72'000", mid: "75'000 – 88'000", senior: "85'000 – 100'000", slug: "elektroinstallateur-efz" },
  { role: "Montage-Elektriker EFZ", entry: "60'000 – 68'000", mid: "70'000 – 80'000", senior: "78'000 – 88'000", slug: "montage-elektriker-efz" },
  { role: "Elektroniker EFZ", entry: "62'000 – 70'000", mid: "75'000 – 90'000", senior: "88'000 – 105'000", slug: "elektroniker" },
  { role: "Automatiker EFZ", entry: "65'000 – 73'000", mid: "78'000 – 92'000", senior: "92'000 – 110'000", slug: "automatiker-efz" },
  { role: "Servicetechniker Elektro", entry: "70'000 – 78'000", mid: "78'000 – 90'000", senior: "88'000 – 105'000", slug: "servicetechniker-elektro" },
  { role: "Betriebselektriker", entry: "70'000 – 78'000", mid: "78'000 – 90'000", senior: "88'000 – 100'000", slug: "betriebselektriker" },
  { role: "Elektroplaner", entry: "70'000 – 80'000", mid: "82'000 – 100'000", senior: "98'000 – 120'000", slug: "elektroplaner" },
  { role: "Projektleiter Elektro", entry: "78'000 – 88'000", mid: "90'000 – 108'000", senior: "105'000 – 130'000", slug: "projektleiter-elektro" },
  { role: "Bauleiter Elektro", entry: "82'000 – 92'000", mid: "95'000 – 115'000", senior: "110'000 – 140'000", slug: "bauleiter-elektro" },
  { role: "Photovoltaik-Spezialist", entry: "65'000 – 75'000", mid: "78'000 – 92'000", senior: "90'000 – 110'000", slug: "photovoltaik-spezialist" },
  { role: "Schaltanlagenbauer", entry: "65'000 – 73'000", mid: "75'000 – 88'000", senior: "85'000 – 100'000", slug: "schaltanlagenbauer" },
  { role: "Gebäudetechniker", entry: "70'000 – 78'000", mid: "80'000 – 95'000", senior: "92'000 – 110'000", slug: "gebaeudetechniker" },
];

const CANTON_FACTORS: { canton: string; factor: string; note: string; slug: string }[] = [
  { canton: "Zürich", factor: "+5 bis +10 %", note: "Höchste Lohnniveaus, dichter Markt, viele Grossprojekte.", slug: "zuerich" },
  { canton: "Zug", factor: "+8 bis +12 %", note: "Steuergünstig, aber Top-Löhne dank Industrie- und Hightech-Sektor.", slug: "zug" },
  { canton: "Basel", factor: "+5 bis +8 %", note: "Pharma/Industrie zahlen überdurchschnittlich, v.a. für Servicetechniker.", slug: "basel" },
  { canton: "Bern", factor: "0 bis +3 %", note: "Solide Mittelwerte, breite Mischung Bund/Bau/Industrie.", slug: "bern" },
  { canton: "Aargau", factor: "0 bis +2 %", note: "Industrie- und Energieversorger ziehen den Lohn leicht hoch.", slug: "aargau" },
  { canton: "Luzern", factor: "−2 bis +2 %", note: "Mittelfeld, Tourismus- und Wohnbau treiben Nachfrage.", slug: "luzern" },
  { canton: "St. Gallen", factor: "−2 bis +1 %", note: "Industriestandort mit konkurrenzfähigen Saläre.", slug: "st-gallen" },
  { canton: "Solothurn", factor: "−3 bis 0 %", note: "Etwas unter dem Schweizer Mittel, dafür tiefere Lebenskosten.", slug: "solothurn" },
  { canton: "Thurgau", factor: "−4 bis −1 %", note: "Ländlicher, aber spannende Industrieprojekte.", slug: "thurgau" },
  { canton: "Graubünden", factor: "−5 bis −1 %", note: "Tourismus & Bergbahnen — Saisonarbeit häufig.", slug: "graubuenden" },
  { canton: "Schaffhausen", factor: "−3 bis 0 %", note: "Maschinenindustrie sorgt für stabile Nachfrage.", slug: "schaffhausen" },
  { canton: "Fribourg", factor: "−5 bis −2 %", note: "Zweisprachiger Markt, dynamisches Wachstum.", slug: "fribourg" },
];

const FAQS = [
  {
    question: "Wie viel verdient ein Elektriker in der Schweiz?",
    answer:
      "Ein Elektriker in der Schweiz verdient im Durchschnitt zwischen CHF 65'000 und CHF 110'000 pro Jahr. Der konkrete Lohn hängt vor allem vom Beruf (Elektroinstallateur EFZ, Montage-Elektriker, Elektroplaner, Projektleiter Elektro), von der Erfahrung, vom Kanton und vom Arbeitgeber ab. Berufseinsteiger nach EFZ-Lehrabschluss starten typischerweise zwischen CHF 65'000 und CHF 72'000, mit drei bis fünf Jahren Erfahrung verschiebt sich das Salärband Richtung CHF 80'000 bis CHF 95'000. Spezialisierungen wie Photovoltaik, Smart-Home, KNX/DALI oder Sicherheitsberater nach NIV bringen jeweils 5 bis 12 Prozent mehr. Der 13. Monatslohn ist in der Schweizer Elektrobranche Standard.",
  },
  {
    question: "Welcher Kanton zahlt Elektrikern am besten?",
    answer:
      "Die höchsten Löhne für Elektriker zahlen Zug, Zürich und Basel-Stadt — typisch 5 bis 12 Prozent über dem Schweizer Mittel. In Zug treiben Hightech- und Industriekonzerne, in Basel die Pharma- und Chemiebranche, in Zürich Finanz- und Bauwirtschaft die Saläre nach oben. Im Mittelfeld liegen Bern, Aargau und Luzern nahe am Schweizer Durchschnitt. Tendenziell tiefer (−3 bis −5 Prozent) sind Fribourg, Solothurn und Graubünden — dafür sind dort die Lebenshaltungskosten und Mietpreise spürbar tiefer. Der Nettolohn-Vergleich lohnt sich also immer mit einem Steuer- und Lebenskostenrechner.",
  },
  {
    question: "Verdient ein Elektroinstallateur mehr als ein Montage-Elektriker?",
    answer:
      "Ja. Der Elektroinstallateur EFZ verdient durchschnittlich CHF 5'000 bis CHF 10'000 pro Jahr mehr als der Montage-Elektriker EFZ. Grund ist die längere Lehre (4 statt 3 Jahre) und die volle Befähigung, Anlagen selbständig zu planen, in Betrieb zu nehmen und nach NIN/NIV zu prüfen. Mit dem Sicherheitsberater-Ausweis steigt der Lohn um weitere 5 bis 10 Prozent. Der Wechsel ist via verkürzte Zusatzlehre möglich (zwei Jahre) — viele Lehrbetriebe finanzieren diesen Weg, weil voll befähigte Fachkräfte knapp sind.",
  },
  {
    question: "Wie viel verdient ein Lehrling als Elektriker in der Schweiz?",
    answer:
      "Lehrlinge in den Elektriker-Berufen verdienen je nach Kanton, Branche und Lehrjahr zwischen CHF 750 und CHF 1'700 pro Monat. Die EIT.swiss-Empfehlungen liegen 2026 bei rund CHF 850 (1. Lehrjahr), CHF 1'050 (2. Lehrjahr), CHF 1'400 (3. Lehrjahr) und CHF 1'650 (4. Lehrjahr) für den Elektroinstallateur EFZ. Beim 3-jährigen Montage-Elektriker EFZ entfällt das vierte Lehrjahr. Der 13. Monatslohn ist in vielen Lehrverhältnissen Standard. Genaue Zahlen findest du in unserem Guide zur Elektriker Ausbildung.",
  },
  {
    question: "Wie steigert ein Elektriker seinen Lohn am schnellsten?",
    answer:
      "Drei Hebel funktionieren am besten: Erstens Spezialisierung — Photovoltaik, Smart-Building, KNX/DALI oder Sicherheitsberater nach NIV bringen je 5 bis 12 Prozent. Zweitens Weiterbildung — Elektro-Projektleiter, Elektro-Sicherheitsberater oder eidg. dipl. Elektroinstallationsmeister heben das Salärband um CHF 10'000 bis CHF 25'000. Drittens Wechsel des Arbeitgebers — bei intern blockierten Lohnerhöhungen ist ein Stellenwechsel oft der schnellste Weg, weil Konkurrenzunternehmen aktuell aktiv um Fachkräfte werben. Zusätzlich helfen Pikettdienst-Zulagen, Servicepauschalen und Boni für Projektabschlüsse.",
  },
];

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Startseite", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Lohn Elektriker Schweiz", item: `${SITE_URL}/lohn-elektriker-schweiz` },
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
  headline: "Lohn Elektriker Schweiz 2026",
  description: "Übersicht der Löhne für Elektriker in der Schweiz: nach Beruf, Erfahrung und Kanton.",
  datePublished: "2026-05-08",
  dateModified: "2026-05-08",
  author: { "@type": "Organization", name: "elektrojob.ch" },
  publisher: {
    "@type": "Organization",
    name: "elektrojob.ch",
    logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.svg` },
  },
};

export default function LohnElektrikerSchweizPage() {
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
              <span className="text-slate-700">Lohn Elektriker Schweiz</span>
            </nav>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight mb-4">
              Lohn Elektriker Schweiz <span className="text-primary">2026</span>
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed mb-6">
              Was verdient ein Elektriker in der Schweiz? Hier findest du die aktuellen Lohnbänder
              für alle relevanten Elektriker-Berufe — aufgeschlüsselt nach Erfahrung, Kanton und
              Spezialisierung. Datenbasis 2026.
            </p>
            <Button asChild>
              <Link href="/">Offene Elektriker Jobs ansehen</Link>
            </Button>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 py-12 max-w-5xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">
            Lohn nach Beruf und Erfahrung
          </h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Die folgenden Lohnbänder zeigen typische Schweizer Bruttojahresgehälter (12 × Monatslohn,
            ohne 13. ML und Boni). Einsteiger = bis 2 Jahre Erfahrung, Mid = 3–7 Jahre, Senior = 8+ Jahre
            inkl. Spezialisierung oder Führungsverantwortung.
          </p>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-900">Beruf</th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-900">Einsteiger</th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-900">Mid-Level</th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-900">Senior</th>
                </tr>
              </thead>
              <tbody>
                {ROLE_SALARIES.map((row) => (
                  <tr key={row.role} className="border-t border-slate-100">
                    <td className="py-3 px-4 text-sm">
                      <Link
                        href={`/elektrojobs/${row.slug}/zuerich`}
                        className="text-slate-800 hover:text-primary font-medium"
                      >
                        {row.role}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-700">CHF {row.entry}</td>
                    <td className="py-3 px-4 text-sm text-slate-700">CHF {row.mid}</td>
                    <td className="py-3 px-4 text-sm text-slate-900 font-medium">CHF {row.senior}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Quellen: EIT.swiss-Lohnempfehlungen 2026, Electrosuisse-Branchenstatistik, BFS-Lohnstrukturerhebung,
            Auswertung von über 26&apos;000 öffentlichen Schweizer Stelleninseraten.
          </p>
        </section>

        <section className="bg-slate-50 border-y">
          <div className="container mx-auto px-4 sm:px-6 py-12 max-w-5xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">
              Lohn Elektriker nach Kanton
            </h2>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Kantonale Abweichung vom Schweizer Mittelwert. Bei einem Mittel von z.B. CHF 85&apos;000
              bedeutet &quot;+8 Prozent&quot; rund CHF 91&apos;800.
            </p>
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="w-full text-left">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="py-3 px-4 text-sm font-semibold text-slate-900">Kanton</th>
                    <th className="py-3 px-4 text-sm font-semibold text-slate-900">Abweichung</th>
                    <th className="py-3 px-4 text-sm font-semibold text-slate-900">Hinweis</th>
                  </tr>
                </thead>
                <tbody>
                  {CANTON_FACTORS.map((row) => (
                    <tr key={row.canton} className="border-t border-slate-100">
                      <td className="py-3 px-4 text-sm font-medium">
                        <Link
                          href={`/elektrojobs/elektroinstallateur-efz/${row.slug}`}
                          className="text-slate-800 hover:text-primary"
                        >
                          {row.canton}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-900 font-medium whitespace-nowrap">{row.factor}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">
            Was beeinflusst den Lohn von Elektrikern?
          </h2>
          <div className="prose prose-slate max-w-none space-y-4 text-slate-700">
            <p>
              <strong>Lehrabschluss und Befähigung:</strong> Ein Elektroinstallateur EFZ (4-jährige Lehre)
              verdient typischerweise CHF 5&apos;000 bis CHF 10&apos;000 mehr als ein Montage-Elektriker EFZ
              (3-jährige Lehre). Mit dem Sicherheitsberater-Ausweis nach NIV oder dem eidg. dipl.
              Elektroinstallationsmeister steigt das Lohnband nochmals deutlich.
            </p>
            <p>
              <strong>Spezialisierung:</strong> Photovoltaik, Smart-Building, KNX/DALI, Brandmeldeanlagen,
              Ladeinfrastruktur und Industrieautomation sind aktuell die am stärksten nachgefragten
              Spezialisierungen — sie bringen je 5 bis 12 Prozent Lohnaufschlag.
            </p>
            <p>
              <strong>Region:</strong> Zug, Zürich und Basel zahlen typisch 5 bis 12 Prozent über dem Mittel,
              ländlichere Kantone wie Fribourg, Solothurn oder Graubünden 3 bis 5 Prozent darunter — bei
              entsprechend tieferen Lebenshaltungskosten.
            </p>
            <p>
              <strong>Arbeitgebergrösse und Branche:</strong> Industrie und Pharma zahlen überdurchschnittlich,
              klassische Installationsbetriebe liegen im Mittelfeld, Subunternehmer und Kleinbetriebe
              tendenziell darunter. Servicetechniker mit Pikettdienst verdienen via Zulagen oft 10 bis
              15 Prozent mehr als die Grundbasis.
            </p>
            <p>
              <strong>Pikett, Boni, 13. Monatslohn:</strong> Fast alle Schweizer Elektrobetriebe zahlen
              den 13. Monatslohn. Pikettdienst-Zulagen, Schichtboni und Projektabschlussprämien können
              das Jahresgehalt nochmals um CHF 3&apos;000 bis CHF 12&apos;000 anheben.
            </p>
          </div>
        </section>

        <section className="bg-slate-50 border-t">
          <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">
              Häufig gestellte Fragen — Lohn Elektriker Schweiz
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
            Bereit für deinen nächsten Elektriker Job?
          </h2>
          <p className="text-slate-600 mb-6">
            Vergleiche Lohn, Pensum und Region direkt in den offenen Stellen.
          </p>
          <Button asChild size="lg">
            <Link href="/">Elektriker Jobs in der Schweiz ansehen</Link>
          </Button>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
