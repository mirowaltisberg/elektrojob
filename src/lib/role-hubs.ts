export interface RoleHubFaq {
  question: string;
  answer: string;
}

export interface RoleHubConfig {
  /** URL slug for the page, e.g. "elektroinstallateur-jobs" */
  slug: string;
  /** Display name in H1 / breadcrumbs, e.g. "Elektroinstallateur Jobs" */
  displayName: string;
  /** SEO title */
  title: string;
  /** Meta description */
  description: string;
  /** Search query used to fetch matching listings */
  searchQuery: string;
  /** Hero subtitle */
  hero: string;
  /** Long-form intro about the role */
  longIntro: string;
  /** Salary band sentence */
  salary: string;
  /** Education / Lehre sentence */
  education: string;
  /** Career path sentence */
  career: string;
  /** Day-to-day tasks bullets */
  tasks: string[];
  /** Skill / requirement bullets */
  requirements: string[];
  /** Slug used to deep-link into /elektrojobs/[role]/[canton] — must match an existing role */
  cantonRoleSlug: string;
  /** FAQs */
  faqs: RoleHubFaq[];
}

export const ROLE_HUBS: RoleHubConfig[] = [
  {
    slug: "elektroinstallateur-jobs",
    displayName: "Elektroinstallateur Jobs",
    title: "Elektroinstallateur Jobs Schweiz 2026 | Stellen für Elektroinstallateure EFZ",
    description:
      "Alle offenen Elektroinstallateur Jobs in der Schweiz: EFZ-Stellen, Sicherheitsberater, Servicetechniker. Lohn CHF 75'000 – 100'000, Festanstellung & Temporär.",
    searchQuery: "Elektroinstallateur",
    cantonRoleSlug: "elektroinstallateur-efz",
    hero:
      "Stellen für Elektroinstallateure EFZ in der ganzen Schweiz — von Wohnbau über Industrie bis Smart-Building.",
    longIntro:
      "Der Elektroinstallateur EFZ gehört zu den meistgesuchten Elektriker-Berufen der Schweiz. Nach der 4-jährigen Lehre planst, montierst und prüfst du Stark- und Schwachstrominstallationen in Wohn-, Gewerbe- und Industriebauten. Die aktuellen, anonymisierten Stellen oberhalb dieses Ratgebers zeigen dir direkt, wie viele passende Inserate momentan verfügbar sind.",
    salary:
      "Das Lohnband für Elektroinstallateure EFZ liegt zwischen CHF 75'000 (Berufseinsteiger) und CHF 100'000 (Senior, Sicherheitsberater nach NIV). In Zürich, Zug und Basel zahlen Arbeitgeber 5 bis 10 Prozent über dem Schweizer Mittel.",
    education:
      "Voraussetzung ist ein abgeschlossenes EFZ als Elektroinstallateur (4 Jahre Lehre) oder ein verkürzter Quereinstieg über Montage-Elektriker EFZ + 2 Jahre Zusatzlehre. Erwachsene mit Branchenerfahrung können den EFZ via Nachholbildung (Art. 32 BBG) erwerben.",
    career:
      "Nächste Stufen: Elektro-Sicherheitsberater (BP) → Elektro-Projektleiter (BP) → eidg. dipl. Elektroinstallationsmeister (HFP). Spezialisierungen wie KNX, Photovoltaik, Smart-Home oder Brandmeldetechnik bringen je 5 bis 12 Prozent mehr Lohn.",
    tasks: [
      "Rohbaueinlagen, Verteilungen und Stark-/Schwachstrominstallationen ausführen",
      "Anlagen in Betrieb nehmen und nach NIN/NIV prüfen",
      "Schaltgerätekombinationen verdrahten und beschriften",
      "Smart-Home-Komponenten (KNX, DALI) installieren und parametrieren",
      "Service- und Reparaturarbeiten direkt beim Kunden",
    ],
    requirements: [
      "EFZ als Elektroinstallateur (oder gleichwertig)",
      "Sichere Kenntnisse der NIN und NIV",
      "Fahrausweis Kategorie B",
      "Teamfähigkeit und Kundenorientierung",
      "Deutsch, ggf. Französisch oder Italienisch je nach Kanton",
    ],
    faqs: [
      {
        question: "Wie viele Elektroinstallateur Jobs sind aktuell ausgeschrieben?",
        answer:
          "Die aktuelle Zahl steht direkt oberhalb der Trefferliste auf dieser Seite. Sie wird aus den tatsächlich verfügbaren, geprüften Inseraten berechnet und kann sich mit neuen Ausschreibungen oder abgelaufenen Stellen ändern. Mit den Filtern grenzt du das Ergebnis nach Ort, Pensum, Vertragsart und Veröffentlichungszeitraum ein.",
      },
      {
        question: "Was unterscheidet Elektroinstallateur Jobs von Montage-Elektriker Stellen?",
        answer:
          "Der Elektroinstallateur EFZ darf eigenständig planen, in Betrieb nehmen und nach NIN prüfen — der Montage-Elektriker EFZ ist auf die ausführende Tätigkeit fokussiert. Der Lohnabstand beträgt durchschnittlich CHF 5'000 bis CHF 10'000 pro Jahr zugunsten des Elektroinstallateurs. Zudem können Elektroinstallateure mit dem Sicherheitsberater-Ausweis nach NIV Schlusskontrollen verantworten — eine wichtige Voraussetzung für viele Senior-Positionen und Selbständigkeit.",
      },
      {
        question: "Welche Kantone bieten die meisten Elektroinstallateur Stellen?",
        answer:
          "Die Top-5-Kantone sind Zürich, Bern, Aargau, Waadt und Basel-Stadt — sie vereinen rund 60 Prozent aller offenen Elektroinstallateur Stellen. Im Mittelfeld liegen St. Gallen, Luzern, Genf, Thurgau und Solothurn. Pendelnde Elektroinstallateure profitieren von höherer Stellenwahl und besseren Lohnverhandlungen, wenn sie einen Radius von 25 bis 50 km um ihren Wohnort einbeziehen.",
      },
      {
        question: "Wie hoch ist der Lohn als Elektroinstallateur?",
        answer:
          "Das Schweizer Bruttojahresgehalt liegt zwischen CHF 65'000 (Lehrabschluss) und CHF 100'000+ (Sicherheitsberater mit 10 Jahren Erfahrung). Mit dem Sicherheitsberater-Ausweis nach NIV steigt das Salär um 10 bis 15 Prozent, mit dem Elektro-Projektleiter um 15 bis 25 Prozent. Pikettdienst, Servicepauschalen und Boni für Projektabschlüsse können das Jahresgehalt um weitere CHF 3'000 bis CHF 12'000 erhöhen.",
      },
    ],
  },
  {
    slug: "elektroniker-jobs",
    displayName: "Elektroniker Jobs",
    title: "Elektroniker Jobs Schweiz 2026 | Stellen für Elektroniker EFZ",
    description:
      "Elektroniker Jobs in der Schweiz: Hardware-Entwicklung, Prüftechnik, Service. EFZ-Stellen in Industrie, Medizintechnik und Embedded Systems. Lohn CHF 70'000 – 105'000.",
    searchQuery: "Elektroniker",
    cantonRoleSlug: "elektroniker",
    hero:
      "Stellen für Elektroniker EFZ — Hardware, Embedded, Prüftechnik und Service in Schweizer Industriebetrieben.",
    longIntro:
      "Der Elektroniker EFZ entwickelt, prüft und repariert elektronische Geräte, Steuerungen und Mikrocontroller. Im Gegensatz zum Elektroinstallateur arbeitet der Elektroniker meist in Werkstätten, Labors und Entwicklungsabteilungen — bei Medizintechnik-Firmen, Maschinenbauern, Halbleiter-Zulieferern und Forschungsinstituten. Die Nachfrage wächst mit Industrie 4.0, IoT und Elektrifizierung.",
    salary:
      "Das Lohnband für Elektroniker EFZ liegt zwischen CHF 70'000 (Berufseinsteiger) und CHF 105'000 (Senior mit Spezialisierung auf Hochfrequenz, Medizintechnik oder Embedded Software).",
    education:
      "Voraussetzung ist die 4-jährige EFZ-Lehre als Elektroniker. Quereinsteiger aus Automatiker- oder Elektroinstallateur-Berufen können sich über Weiterbildungen in SPS, Mikrocontroller-Programmierung oder Prüftechnik in den Markt einarbeiten.",
    career:
      "Karrierepfade führen zum dipl. Techniker HF Elektrotechnik, Bachelor FH Elektrotechnik oder zum Spezialisten für EMV, Embedded oder Power Electronics. Die Nähe zur Software-Entwicklung macht Elektroniker zu gefragten Profilen für IoT- und Hardware-Startups.",
    tasks: [
      "Schaltungen entwerfen, layouten und prototypisieren",
      "Embedded Software für Mikrocontroller schreiben (C, C++)",
      "Prüf- und Messprozesse aufsetzen, Fehlersuche durchführen",
      "Geräte und Baugruppen in Serienreife bringen",
      "Service und Reparatur elektronischer Geräte",
    ],
    requirements: [
      "EFZ als Elektroniker oder gleichwertige Ausbildung",
      "Sicherer Umgang mit Oszilloskop, Multimeter, Logic Analyzer",
      "Grundlagen Mikrocontroller-Programmierung",
      "Englischkenntnisse für Datenblätter und Doku",
      "Strukturiertes, fehleranalytisches Denken",
    ],
    faqs: [
      {
        question: "Wo arbeiten Elektroniker in der Schweiz?",
        answer:
          "Typische Arbeitgeber kommen aus Maschinenbau, Medizintechnik, Halbleiter- und Sensorik, Bahnindustrie sowie aus zahlreichen spezialisierten KMU im Raum Zürich, Basel, Bern und in der Ostschweiz. Auch Hochschulen und Forschungsinstitute beschäftigen Elektroniker in Entwicklung, Laborbetrieb und Prüftechnik.",
      },
      {
        question: "Verdient ein Elektroniker mehr als ein Elektroinstallateur?",
        answer:
          "Im Mid- und Senior-Level oft ja. Elektroniker mit Spezialisierung auf Hochfrequenz, EMV, Embedded oder Power Electronics verdienen typischerweise CHF 5'000 bis CHF 15'000 mehr pro Jahr als vergleichbare Elektroinstallateure. Im Einsteigerlevel sind die Lohnbänder ähnlich. Mit Bachelor FH oder dipl. Techniker HF öffnet sich zusätzlich der Engineering-Bereich mit Salärbändern bis CHF 130'000+.",
      },
      {
        question: "Welche Weiterbildungen lohnen sich für Elektroniker?",
        answer:
          "Drei Wege sind in der Praxis besonders verbreitet. Erstens dipl. Techniker HF Elektrotechnik (3 Jahre berufsbegleitend) — Standardweg in die Senior- und Lead-Engineer-Rollen. Zweitens Bachelor FH Elektrotechnik / Mikrotechnik / Mechatronik — akademische Karriere mit Forschungsperspektive. Drittens spezialisierte Kurse in EMV, Embedded Software, FPGA-Design oder Funktechnik — schnelle Lohnaufschläge bei wenig Zeitaufwand.",
      },
    ],
  },
  {
    slug: "montage-elektriker-jobs",
    displayName: "Montage-Elektriker Jobs",
    title: "Montage-Elektriker Jobs Schweiz 2026 | Stellen für Montage-Elektriker EFZ",
    description:
      "Montage-Elektriker Jobs in der Schweiz: 3-jährige EFZ-Lehre, ausführende Montagetätigkeit, Festanstellung & Temporär. Lohn CHF 65'000 – 90'000.",
    searchQuery: "Montage-Elektriker",
    cantonRoleSlug: "montage-elektriker-efz",
    hero:
      "Stellen für Montage-Elektriker EFZ — auf Baustellen in der ganzen Schweiz, mit Aufstiegschancen.",
    longIntro:
      "Der Montage-Elektriker EFZ ist auf die ausführende Tätigkeit auf der Baustelle fokussiert: Kabelzug, Apparatemontage, Verdrahtung von Verteilungen, Endkontrolle nach Vorgabe. Die 3-jährige Lehre ist der schnellste Weg in einen vollwertigen Schweizer Elektriker-Beruf. Wer später mehr Verantwortung will, wechselt via 2-jährige Zusatzlehre zum Elektroinstallateur EFZ.",
    salary:
      "Das Lohnband für Montage-Elektriker EFZ liegt zwischen CHF 65'000 (Berufseinsteiger) und CHF 90'000 (Senior mit Vorarbeiterposition). In Zug und Zürich liegen die Saläre 5 bis 10 Prozent höher.",
    education:
      "Voraussetzung ist die 3-jährige EFZ-Lehre als Montage-Elektriker. Auch der Wechsel vom Elektropraktiker EBA ist möglich. Quereinsteiger profitieren von einer kürzeren Ausbildungszeit als beim Elektroinstallateur.",
    career:
      "Aufstiegsperspektiven: Vorarbeiter, Teamleiter Montage oder Wechsel zum Elektroinstallateur EFZ via 2-jährige verkürzte Zusatzlehre — viele Schweizer Elektrobetriebe finanzieren diesen Weg mit, weil voll befähigte Fachkräfte knapp sind.",
    tasks: [
      "Kabelzug und Rohbaueinlagen ausführen",
      "Schalter, Steckdosen, Leuchten und Verteilungen montieren",
      "Verdrahtung nach Schema",
      "Endkontrolle und Übergabe an den Sicherheitsberater",
      "Materialdisposition und Baustellenlogistik",
    ],
    requirements: [
      "EFZ als Montage-Elektriker (oder gleichwertig)",
      "Handwerkliches Geschick und körperliche Belastbarkeit",
      "Teamfähigkeit",
      "Schwindelfreiheit (Arbeit auf Gerüsten, Hebebühnen)",
      "Fahrausweis Kategorie B von Vorteil",
    ],
    faqs: [
      {
        question: "Was verdient ein Montage-Elektriker?",
        answer:
          "Berufseinsteiger nach 3-jähriger Lehre starten typischerweise zwischen CHF 60'000 und CHF 68'000 pro Jahr. Mit drei Jahren Erfahrung verschiebt sich das Salär in den Bereich CHF 70'000 bis CHF 80'000, mit Vorarbeiterposition oder Spezialisierung sind CHF 85'000 bis CHF 90'000 möglich. In Zug und Zürich zahlen Arbeitgeber 5 bis 10 Prozent über dem Mittel. Der 13. Monatslohn ist Standard.",
      },
      {
        question: "Lohnt sich der Wechsel zum Elektroinstallateur?",
        answer:
          "Für die meisten Montage-Elektriker ja. Die 2-jährige verkürzte Zusatzlehre bringt mittelfristig CHF 5'000 bis CHF 10'000 mehr Lohn pro Jahr und öffnet die Tür zu Sicherheitsberater, Projektleiter und Installationsmeister. Viele Schweizer Elektrobetriebe finanzieren die Zusatzlehre mit (Schulgeld, reduziertes Pensum) — frag im Bewerbungsgespräch aktiv nach diesem Modell.",
      },
      {
        question: "Welche Arbeitgeber suchen Montage-Elektriker?",
        answer:
          "Klassische Schweizer Elektroinstallationsbetriebe (KMU mit 5 bis 80 Mitarbeitenden), General-Elektrounternehmen mit Grossaufträgen (Spitäler, Verwaltungsbauten, Wohnüberbauungen) und Personaldienstleister mit Temporärvermittlung. Saisonale Spitzenmonate sind März bis Juni und September/Oktober. In dieser Zeit erhöht sich das Stellenangebot um 30 bis 50 Prozent.",
      },
    ],
  },
  {
    slug: "elektroplaner-jobs",
    displayName: "Elektroplaner Jobs",
    title: "Elektroplaner Jobs Schweiz 2026 | Stellen für Elektroplaner & Gebäudetechnikplaner",
    description:
      "Elektroplaner Jobs in der Schweiz: Planungsbüros, Generalplaner, Bauherrenberatung. CAD/BIM, KNX, Smart-Building. Lohn CHF 80'000 – 120'000.",
    searchQuery: "Elektroplaner",
    cantonRoleSlug: "elektroplaner",
    hero:
      "Stellen für Elektroplaner — von Wohnbau über Spitäler bis Industrie- und Verwaltungsbauten.",
    longIntro:
      "Elektroplaner planen elektrische Anlagen, Stark-/Schwachstrominstallationen, Smart-Building-Steuerungen und Sicherheitssysteme — meist in Planungsbüros, bei Generalplanern oder direkt bei Bauherren. Sie arbeiten mit modernen CAD- und BIM-Werkzeugen, kennen Schweizer Normen (NIN, NIV) und betreuen Projekte von der Vorplanung bis zur Inbetriebnahme. Die Nachfrage steigt mit Smart-Building, Energieeffizienz und Photovoltaik.",
    salary:
      "Das Lohnband für Elektroplaner liegt zwischen CHF 80'000 (Berufseinsteiger nach Technikerausbildung) und CHF 120'000 (Senior-Planer mit Bauherrenberatung). Projektleiter Elektro mit Planungsverantwortung verdienen bis CHF 130'000.",
    education:
      "Üblich ist eine Weiterbildung zum dipl. Techniker HF Elektrotechnik oder Gebäudetechnikplaner Elektro EFZ — gefolgt von Berufserfahrung in einem Installationsbetrieb oder Planungsbüro. Bachelor FH Elektrotechnik öffnet zusätzlich Engineering- und Forschungsrollen.",
    career:
      "Aufstieg zum Senior Elektroplaner, Projektleiter Elektro, Bauleiter Elektro oder Bereichsleiter eines Planungsbüros. Mit eigener Firma sind Spezialisierungen auf Smart-Building, Krankenhaus- oder Industrieplanung lukrative Nischen.",
    tasks: [
      "Elektroplanung mit CAD- und BIM-Werkzeugen",
      "Lastberechnungen, Schemata und Stromlaufpläne erstellen",
      "Ausschreibungen und Submissionen vorbereiten",
      "Bauherren- und Architektenberatung zu Smart-Building, KNX/DALI",
      "Bauüberwachung und Inbetriebnahme begleiten",
    ],
    requirements: [
      "Gebäudetechnikplaner Elektro EFZ oder dipl. Techniker HF Elektrotechnik",
      "Sicherer Umgang mit CAD- und BIM-Werkzeugen",
      "Kenntnisse NIN/NIV, SIA-Norm 118",
      "Verhandlungsgeschick mit Bauherren und Architekten",
      "Strukturiertes Projektdenken",
    ],
    faqs: [
      {
        question: "Wie wird man Elektroplaner in der Schweiz?",
        answer:
          "Der direkteste Weg ist die 4-jährige EFZ-Lehre als Gebäudetechnikplaner Elektro. Wer bereits einen Elektroinstallateur- oder Montage-Elektriker-EFZ hat, weiterbildet sich zum dipl. Techniker HF Elektrotechnik (3 Jahre berufsbegleitend) und sammelt parallel Praxiserfahrung in einem Planungsbüro. Bachelor FH Elektrotechnik bietet einen akademischen Weg mit Engineering-Schwerpunkt.",
      },
      {
        question: "Welche Software nutzen Elektroplaner?",
        answer:
          "In Schweizer Planungsbüros gehören CAD-, BIM- und Elektroschema-Programme zur Grundausstattung. Für Lichtberechnungen kommen spezialisierte Simulationswerkzeuge zum Einsatz; Smart-Building-Projekte nutzen Engineering-Software für KNX und weitere Bussysteme. Wer mehrere Werkzeugtypen sicher beherrscht und Modelle, Schemata sowie Berechnungen sauber zwischen den Projektbeteiligten austauschen kann, hat einen klaren Lohn- und Karrierevorteil.",
      },
      {
        question: "Verdient ein Elektroplaner mehr als ein Elektroinstallateur?",
        answer:
          "Ja, im Mittelwert deutlich. Während Elektroinstallateure typischerweise zwischen CHF 75'000 und CHF 95'000 verdienen, liegen Elektroplaner zwischen CHF 80'000 und CHF 110'000 — Senior-Planer und Projektleiter Elektro überschreiten regelmässig CHF 120'000. Die zusätzliche Weiterbildungszeit (3 Jahre Techniker HF) zahlt sich also klar aus, sowohl in Lohn als auch in Karriereoptionen.",
      },
    ],
  },
];

export function findRoleHub(slug: string): RoleHubConfig | null {
  return ROLE_HUBS.find((r) => r.slug === slug) ?? null;
}
