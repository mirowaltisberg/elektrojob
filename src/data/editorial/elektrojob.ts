// SEO-DECISION: Per-page editorial content for the highest-traffic role × canton
// combinations. Keyed by `${roleSlug}::${cantonSlug}`. The category page renders
// EditorialIntro only when an entry exists here — pages without an entry fall back
// to the default short layout. Word target per section: ~80 words. Total per
// page: 320+. Swiss orthography only — never use Eszett, always "ss".

export interface EditorialContent {
  /** "Was macht ein/e ROLE in CANTON?" — concrete day-to-day, regional context */
  whatDoes: string;
  /** "Lohn & Aufstiegschancen" — salary band + progression. Deep-links to /#loehne */
  salary: string;
  /** "Welche Betriebe stellen ein?" — anonymized, never names specific companies */
  employers: string;
  /** "Bewerbungs-Tipps" — practical, regional (ÖV, Pendlerregion, Sprache) */
  applicationTips: string;
}

const ENTRIES: Record<string, EditorialContent> = {
  "elektroinstallateur-efz::zh": {
    whatDoes:
      "Ein Elektroinstallateur EFZ in Zürich plant Stark- und Schwachstrom-Installationen in Wohn-, Gewerbe- und Bürobauten, führt sie aus und nimmt sie in Betrieb. Der Arbeitsalltag wechselt zwischen Rohbau, Umbau und der Wartung bestehender Anlagen. In Zürich verschiebt sich die Praxis stark Richtung Smart-Building, KNX-Steuerung, Ladeinfrastruktur für Elektrofahrzeuge und Photovoltaik-Anschluss. Die hohe Sanierungsdichte in der Innenstadt bringt enge Raumverhältnisse und Termindruck mit sich, dafür auch Zugang zu Grossprojekten am Limmatufer, in Zürich-West und im Hochschulquartier. Wer Genauigkeit und schnelle Auffassung mitbringt, hat hier viel Auswahl.",
    salary:
      "Ein Elektroinstallateur EFZ verdient in Zürich typisch CHF 75'000 bis 95'000 pro Jahr — am oberen Ende des Schweizer Bands. Verantwortung als Vorarbeiter oder Servicetechniker hebt das Salär um weitere 8 bis 12 Prozent. Mit dem Zusatzausweis als Elektro-Sicherheitsberater (4 bis 6 Monate berufsbegleitend) öffnet sich der Bereich der eigenständigen Schlusskontrollen, mit der höheren Fachprüfung zum Elektro-Projektleiter sind CHF 95'000 bis 110'000 realistisch. Wer den eidg. dipl. Elektroinstallationsmeister anstrebt, landet im Kanton Zürich häufig im Bereich CHF 110'000 bis 140'000. Die vollständige Lohnübersicht steht auf unserer Startseite.",
    employers:
      "Im Kanton Zürich rekrutieren vor allem KMU mit 10 bis 50 Mitarbeitenden — typische Elektroinstallationsfirmen, die im Wohnungs- und Gewerbebau tätig sind. Daneben besetzen Grossbetriebe der Gebäudetechnik regelmässig Installateur-Stellen für Spitäler, Schulhäuser und öffentliche Bauten. Industrie- und Pharmastandorte rund um Zürich-Nord suchen Fachkräfte für Reinraumtechnik und prozesssichere Anlagen. Energieversorger, Verkehrsbetriebe und Generalunternehmer mit nationaler Tätigkeit besetzen Stellen für Sanierungs- und Neubauprojekte. Wir nennen aus Datenschutz- und Vermittlungsgründen keine Firmennamen — die Inserate auf elektrojob.ch sind anonymisiert, der Arbeitgeber wird im Vorgespräch offengelegt.",
    applicationTips:
      "Lege Wert auf einen kompakten Lebenslauf mit klar gelisteten NIN/NIV-Kenntnissen, gefahrenen Stundensätzen und konkreten Referenzobjekten — zum Beispiel «MFH Wipkingen, 28 Wohnungen, KNX, Vollausführung». Im Kanton Zürich rechnen Arbeitgeber damit, dass du täglich pendelst: ÖV-Knotenpunkt statt nur Wohnort angeben ist oft entscheidend, weil Baustellen wechseln. Plane für die Bewerbung 30 Minuten ein und füge ein Foto deiner Schweizer Lehrabschluss-Urkunde bei — viele Betriebe filtern Inserate ohne sichtbares EFZ aus. Beim Erstgespräch fragen Personalverantwortliche gezielt nach Schicht- und Pikettbereitschaft sowie nach deinem Führerausweis Kategorie B; halte beides bereit.",
  },

  "montage-elektriker-efz::zh": {
    whatDoes:
      "Ein Montage-Elektriker EFZ in Zürich verlegt Kabel, montiert Verteilungen und installiert Schalter, Steckdosen und Beleuchtungen — meist auf Baustellen, im Team und nach präziser Vorgabe der Elektroinstallateure. In Zürich heisst das viel Arbeit auf eng getakteten Grossbaustellen: Hochhäuser am Stadtrand, Sanierungen in den Stadtkreisen 1 bis 5, Bürotürme in Zürich-West. Der Tagesablauf wechselt zwischen Rohbaueinlagen, Apparatemontage und Endkontrolle vor der Wohnungsabnahme. Wer flink, sauber und wettertauglich arbeitet, ist bei Generalunternehmern wie bei spezialisierten Elektrobetrieben gefragt. Smart-Home-Komponenten und KNX-Verkabelung gehören heute zum Standardrepertoire.",
    salary:
      "Montage-Elektriker EFZ verdienen in Zürich CHF 75'000 bis 80'000 pro Jahr — etwas tiefer als ihre EFZ-Kollegen mit 4-jähriger Lehre, dafür mit kurzem Aufstiegsweg. Die verkürzte Zusatzlehre zum Elektroinstallateur EFZ dauert in der Regel zwei Jahre und hebt den Lohn auf CHF 75'000 bis 95'000. Wer Vorarbeiter wird, rechnet mit zusätzlich 6 bis 10 Prozent. Spezialisierungen wie Brandmeldeanlagen, Photovoltaik-Montage oder strukturierte Verkabelung bringen attraktive Zulagen. Im Kanton Zürich zahlen Generalunternehmer und Industriebetriebe oft etwas über dem GAV-Mindestlohn. Die vollständige Lohnübersicht steht auf unserer Startseite.",
    employers:
      "Im Kanton Zürich besetzen vor allem mittelgrosse Elektroinstallationsfirmen mit 20 bis 80 Mitarbeitenden Montage-Stellen. Sie bedienen Wohnüberbauungen, Gewerbe- und Bürobauten in der ganzen Region. Daneben suchen Generalunternehmer und Baukonsortien Montage-Equipen für Grossbaustellen wie in Glattpark, Zürich-Affoltern und Zürich-West. Industrie- und Logistikstandorte am Limmattal sowie das Spitalumfeld rund um Zürich-Nord bieten ebenfalls regelmässig offene Stellen. Wir nennen aus Datenschutz- und Vermittlungsgründen keine Firmennamen auf der Plattform — die Inserate sind anonymisiert, den konkreten Arbeitgeber lernst du im persönlichen Erstgespräch kennen.",
    applicationTips:
      "Halte deinen Lebenslauf knapp und konkret: welche Lehrbetriebe, welche Anlagentypen, wie viele Wohnungen pro Etappe. Im Kanton Zürich erwarten Arbeitgeber Pendelbereitschaft via S-Bahn — gib deinen ÖV-Knotenpunkt an statt nur den Wohnort. Das EFZ-Zeugnis als PDF-Anhang beschleunigt die Vorauswahl, viele Betriebe filtern Inserate ohne sichtbaren Lehrabschluss heraus. Im Telefongespräch werden Schicht- und Pikettbereitschaft, Fahrausweis Kategorie B und körperliche Eignung für Montagearbeit auf der Baustelle abgefragt — bereite ehrliche Antworten vor. Erfahrung mit Smart-Home oder Photovoltaik im Kurz-CV hervorzuheben, lohnt sich in Zürich besonders.",
  },

  "servicetechniker-elektro::be": {
    whatDoes:
      "Ein Servicetechniker Elektro im Kanton Bern fährt täglich verschiedene Kundenstandorte an, behebt Störungen, wartet bestehende Anlagen und berät Eigentümerinnen und Hauswarte zu Erweiterungen. Das Tätigkeitsgebiet reicht oft vom Mittelland über das Berner Oberland bis ins Emmental — Pendel- und Fahrzeiten gehören zum Berufsbild. Als Spezialist für Wartung, Notdienst und Kundendiagnostik arbeitet er meist eigenständig mit einem voll ausgerüsteten Servicefahrzeug. Smart-Home, Ladestationen, Photovoltaik und Wärmepumpen-Steuerungen prägen das aktuelle Auftragsportfolio. Wer kommunikativ ist und gut diagnostiziert, hat im Kanton Bern langfristig sichere Aufträge.",
    salary:
      "Servicetechniker Elektro verdienen im Kanton Bern CHF 75'000 bis 90'000 pro Jahr, je nach Pikettanteil und Spezialisierung. Wer aktiv im 24/7-Pikettdienst steht, rechnet mit 5 bis 10 Prozent Zuschlag plus Inkonvenienzzulagen. Mit der Spezialisierung auf Smart-Building, Gebäudeautomation oder Photovoltaik sind CHF 90'000 bis 100'000 realistisch. Der Aufstieg zum Service- oder Kundendienstleiter erweitert die Verantwortung für Disposition, Schulungen und Garantiefälle und hebt das Salär auf CHF 100'000 bis 115'000. Berufsbegleitende Weiterbildungen werden von vielen Betrieben mitfinanziert. Die vollständige Lohnübersicht steht auf der Startseite.",
    employers:
      "Im Kanton Bern besetzen mittelgrosse Elektrobetriebe und KMU der Gebäudetechnik den Grossteil der Service-Stellen. Daneben suchen Energieversorger, Verwaltungsabteilungen, Spitäler und Bildungsinstitutionen interne Servicetechniker für ihre Liegenschaften. Anbieter von Sicherheits- und Brandmeldeanlagen sowie Spezialisten für Wärmepumpen und Ladeinfrastruktur betreiben in der Region Bern eigene Serviceorganisationen. Tourismus- und Hotelbetriebe im Berner Oberland brauchen Techniker für saisonale Spitzen. Wir nennen aus Datenschutz- und Vermittlungsgründen keine Firmennamen — die Inserate sind anonymisiert, den konkreten Arbeitgeber lernst du im Erstgespräch kennen.",
    applicationTips:
      "Servicetechniker werden für ihre Selbstständigkeit eingestellt — beton im Lebenslauf konkrete Diagnoseerfahrung, geschätzte Reparaturzeiten und Kundenzufriedenheits-Kennzahlen. Im Kanton Bern werden weite Anfahrtswege erwartet: Wohnort und Pendelbereitschaft prominent angeben. Fahrausweis Kategorie B ist Pflicht, Kategorie BE oder C1 ein Plus für grössere Servicefahrzeuge. Sehr gute Deutschkenntnisse sind in den meisten Service-Stellen Voraussetzung — im Berner Mittelland zählt auch Mundartverständnis. Bereite dich auf Fragen zu typischen Störbildern, Zeitmanagement bei mehreren parallelen Aufträgen und Pikettbereitschaft inklusive Wochenende vor. Belege für absolvierte Hersteller-Schulungen — etwa ABB, Hager, Siemens, Schneider oder Feller — sowie ein Foto der EFZ-Urkunde erhöhen die Trefferquote im Vorauswahl-Schritt deutlich.",
  },

  "elektroplaner::ag": {
    whatDoes:
      "Ein Elektroplaner im Kanton Aargau erstellt Elektroschemata, Installationspläne und Verteilerdimensionierungen für Neubauten, Industrie- und Sanierungsprojekte. Der Alltag teilt sich auf zwischen CAD-Arbeit am Bildschirm (oft Plancal Nova, AutoCAD MEP oder ein BIM-Tool wie Revit), Koordinationssitzungen mit Architekten und HLK-Planern sowie Baubesuchen zur Kontrolle der Ausführung. Im Kanton Aargau dominieren Industrie- und Energieprojekte: Kraftwerke an Aare und Limmat, Pharma- und Maschinenbaustandorte sowie Logistikzentren brauchen normgerechte Elektroplanung. Daneben prägen Wohnungsbau in den Agglomerationsgemeinden und kommunale Sanierungsprojekte den Auftragsmix der meisten Planungsbüros.",
    salary:
      "Elektroplaner verdienen im Kanton Aargau typisch CHF 80'000 bis 100'000 pro Jahr, je nach Erfahrung und Software-Beherrschung. BIM-Kenntnisse heben den Marktwert deutlich — wer souverän mit Plancal Nova oder Revit MEP arbeitet, rechnet im oberen Drittel. Der Aufstieg zum Planungsleiter, Fachspezialist Energieplanung oder Projektleiter Elektro öffnet das Band CHF 100'000 bis 125'000. Mit dem Schritt in die selbstständige Beratung oder zum Bauherrenvertreter sind individuell höhere Honorare möglich. Berufsbegleitend angebotene CAS- und HF-Lehrgänge werden im Aargau von vielen Arbeitgebern mitfinanziert. Die vollständige Lohnübersicht steht auf der Startseite.",
    employers:
      "Im Kanton Aargau besetzen vor allem mittelgrosse Ingenieur- und Planungsbüros (10 bis 60 Mitarbeitende) Stellen für Elektroplaner. Daneben suchen Industrieunternehmen mit eigener Werkstechnik, Pharma- und Energieversorger sowie Generalplaner für Spital- und Schulhausbauten regelmässig nach Planungsfachkräften. Architekturbüros mit MEP-Schwerpunkt im Raum Aarau, Baden und Wettingen integrieren Elektroplaner immer häufiger direkt ins Team. Behörden auf Kantons- und Gemeindeebene besetzen Planungs- und Prüfstellen für öffentliche Hochbauten. Wir nennen aus Datenschutz- und Vermittlungsgründen keine Firmennamen — die Inserate sind anonymisiert, den konkreten Arbeitgeber lernst du im Erstgespräch kennen.",
    applicationTips:
      "Hänge eine kompakte Auswahl bearbeiteter Projekte an — Bauherrschaft anonymisiert, dafür mit Bauvolumen, Nutzungsart und deinem konkreten Planungsanteil. Im Kanton Aargau prüfen viele Büros Bewerbungsdossiers explizit auf Normkenntnisse (NIN, NIBT, SIA 380) und Erfahrung mit Energiebilanzen. Das Software-Toolkit gehört prominent in den Lebenslauf: Plancal Nova, AutoCAD MEP, Revit, Dialux, Nephos. Da Aargauer Büros oft für Auftraggeber in Zürich, Basel und Luzern arbeiten, wird Mobilität geschätzt — gib Pendelradius und Reisebereitschaft an. Im Bewerbungsgespräch werden Berechnungslogik, Termintreue und Koordinationsfähigkeit mit anderen Gewerken vertieft abgefragt.",
  },

  "automatiker-efz::zg": {
    whatDoes:
      "Ein Automatiker EFZ im Kanton Zug verdrahtet, programmiert und nimmt Steuerungs- und Schaltanlagen für Industrie und Gebäudetechnik in Betrieb. Der Tag wechselt zwischen Werkstattarbeit (Schaltschrankbau nach Schema), SPS-Programmierung (Siemens TIA, Beckhoff, Rockwell) und Inbetriebnahmen direkt beim Kunden. Im Kanton Zug prägen Hightech-Standorte, Pharmazulieferer und Maschinenbaubetriebe das Auftragsportfolio: Packstrassen, Reinraumtechnik, Prozessleitsysteme. Daneben gehören Gebäudeautomation für Bürotürme und Logistikzentren zum Standardgeschäft. Wer Schemata sauber liest, Fehler systematisch sucht und mit englischsprachigen Lieferanten kommuniziert, hat in Zug überdurchschnittliche Aufstiegschancen.",
    salary:
      "Automatiker EFZ verdienen im Kanton Zug CHF 75'000 bis 95'000 pro Jahr — am oberen Schweizer Durchschnitt. Mit SPS-Programmiererfahrung (Siemens S7/TIA, Beckhoff, Codesys) und Inbetriebnahmeroutine verschiebt sich der Marktwert ins obere Drittel. Spezialisierungen auf Robotik, Antriebstechnik oder Industrie 4.0 / OPC-UA-Vernetzung bringen Zulagen von 8 bis 15 Prozent. Der Aufstieg zum Automationsingenieur (HF/FH berufsbegleitend, 3 bis 4 Jahre) öffnet das Band CHF 100'000 bis 130'000. Pharma- und Hightech-Arbeitgeber im Kanton Zug zahlen oft marktführend, dafür wird auch internationale Inbetriebnahmebereitschaft erwartet. Die Lohnübersicht steht auf der Startseite.",
    employers:
      "Im Kanton Zug besetzen Automationsfirmen, Schaltanlagenbauer und Maschinenbauer mit 15 bis 200 Mitarbeitenden den Grossteil der Stellen. Daneben suchen Pharmazulieferer, Reinraumspezialisten und Logistiktechnik-Anbieter ihre eigenen Inbetriebnehmer und Serviceautomatiker. Hightech- und Forschungsstandorte rund um Rotkreuz und Baar betreiben interne Automationsabteilungen. Generalunternehmer für Gebäudeautomation besetzen Stellen für KNX-, BACnet- und Modbus-Integratoren. Auffallend stark vertreten sind im Kanton Zug auch internationale Konzernzentralen mit eigener Engineering-Abteilung sowie Datacenter-Betreiber, die für Stromverteilung, USV-Anlagen und Notstromaggregate spezialisierte Automatiker brauchen. Wir nennen aus Datenschutz- und Vermittlungsgründen keine Firmennamen — die Inserate sind anonymisiert, den konkreten Arbeitgeber lernst du im persönlichen Erstgespräch kennen.",
    applicationTips:
      "Liste im Lebenslauf konkrete SPS-Plattformen, Bus-Systeme und Programmiersprachen auf, mit denen du gearbeitet hast — Personalverantwortliche im Kanton Zug filtern sehr genau danach. Englisch in Wort und Schrift wird in den meisten Hightech-Stellen vorausgesetzt: Bewerbungsanschreiben in Deutsch, ergänzende Skills oder Projektbeschreibungen gerne auch in Englisch. Reisebereitschaft für Inbetriebnahmen im In- und Ausland prominent angeben. Bringe ein bis zwei dokumentierte Projektbeispiele mit Schaltplanausschnitt, Code-Snippet und Inbetriebnahme-Protokoll mit. Im Vorstellungsgespräch werden Fehlersuchstrategie, Sicherheit nach EN ISO 13849 und Zusammenarbeit mit Konstruktion und IT vertieft.",
  },
};

export function getEditorialContent(
  roleSlug: string,
  cantonSlug: string
): EditorialContent | null {
  return ENTRIES[`${roleSlug}::${cantonSlug}`] ?? null;
}

export const EDITORIAL_BYLINE = {
  name: "Redaktion elektrojob.ch",
  href: "/team",
  /** ISO date — formatted at render time */
  publishedAt: "2026-05-02",
} as const;
