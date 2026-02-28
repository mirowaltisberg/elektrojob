// SEO-DECISION: Comprehensive landing page matrix covering 12 roles × 8 cantons = 96 combinations.
// Each page has unique title, description, intro text, and FAQs for content depth and
// geographic targeting without keyword cannibalization.

export interface LandingFaq {
  question: string;
  answer: string;
}

export interface LandingPageConfig {
  role: string;
  canton: string;
  title: string;
  description: string;
  intro: string;
  faqs: LandingFaq[];
}

// --- Role-specific content templates ---
// Used to generate unique content per role × canton combination.

interface RoleContent {
  /** Short role label for titles */
  label: string;
  /** Longer description of what this role does */
  roleDescription: string;
  /** Typical salary range string */
  salaryRange: string;
  /** Key requirements */
  requirements: string;
  /** Career progression options */
  career: string;
  /** Related roles */
  related: string[];
}

const ROLE_CONTENT: Record<string, RoleContent> = {
  "Elektroinstallateur EFZ": {
    label: "Elektroinstallateur EFZ",
    roleDescription:
      "Elektroinstallateure EFZ planen, installieren und warten elektrische Anlagen in Wohn-, Gewerbe- und Industriebauten. Sie führen Stark- und Schwachstrominstallationen aus, nehmen Anlagen in Betrieb und führen Sicherheitskontrollen durch.",
    salaryRange: "CHF 75'000 – 95'000",
    requirements:
      "Abgeschlossene 4-jährige Lehre als Elektroinstallateur EFZ, gute Kenntnisse der NIV und Schweizer Normen, Fahrausweis Kategorie B.",
    career:
      "Weiterbildung zum Elektro-Sicherheitsberater, Elektro-Projektleiter oder eidg. dipl. Elektroinstallationsmeister.",
    related: ["Montage-Elektriker EFZ", "Servicetechniker Elektro", "Betriebselektriker"],
  },
  "Montage-Elektriker EFZ": {
    label: "Montage-Elektriker EFZ",
    roleDescription:
      "Montage-Elektriker EFZ führen elektrische Montagearbeiten in Gebäuden aus — von Rohbaueinlagen über Kabelzug bis zur Montage von Schaltern und Steckdosen. Sie arbeiten meist im Team auf Baustellen.",
    salaryRange: "CHF 75'000 – 80'000",
    requirements:
      "Abgeschlossene 3-jährige Lehre als Montage-Elektriker EFZ, handwerkliches Geschick, Teamfähigkeit.",
    career:
      "Verkürzte Zusatzlehre als Elektroinstallateur EFZ, Weiterbildung zum Vorarbeiter oder Teamleiter.",
    related: ["Elektroinstallateur EFZ", "Elektromonteur", "Servicetechniker Elektro"],
  },
  "Servicetechniker Elektro": {
    label: "Servicetechniker Elektro",
    roleDescription:
      "Servicetechniker Elektro beheben elektrische Störungen direkt beim Kunden, führen Wartungsarbeiten durch und beraten Kunden zu elektrischen Anlagen. Sie arbeiten selbstständig mit einem ausgerüsteten Servicefahrzeug.",
    salaryRange: "CHF 75'000 – 90'000",
    requirements:
      "Ausbildung als Elektroinstallateur EFZ, Freude am Kundenkontakt, lösungsorientierte Arbeitsweise, Fahrausweis.",
    career:
      "Spezialisierung auf Smart Home, Gebäudeautomation oder Photovoltaik. Weiterbildung zum Kundendienstleiter.",
    related: ["Elektroinstallateur EFZ", "Betriebselektriker", "Gebäudetechniker"],
  },
  "Projektleiter Elektro": {
    label: "Projektleiter Elektro",
    roleDescription:
      "Projektleiter Elektro leiten Elektroprojekte von der Offerte über die Planung bis zur Übergabe. Sie führen Montageequipen, kontrollieren Kosten und Termine und beraten Bauherren und Architekten.",
    salaryRange: "CHF 85'000 – 110'000",
    requirements:
      "Weiterbildung zum Elektro-Projektleiter, Führungserfahrung, Kenntnisse in KNX/DALI, Verhandlungsgeschick.",
    career:
      "Aufstieg zum Bereichsleiter, Geschäftsführer oder Gründung eines eigenen Elektrobetriebs.",
    related: ["Bauleiter Elektro", "Elektroplaner", "Elektroinstallateur EFZ"],
  },
  "Automatiker EFZ": {
    label: "Automatiker EFZ",
    roleDescription:
      "Automatiker EFZ bauen und verdrahten Steuerungs- und Schaltanlagen für Industrie und Gebäudeautomation. Sie programmieren SPS-Steuerungen, nehmen Anlagen in Betrieb und führen Fehlersuchen durch.",
    salaryRange: "CHF 75'000 – 95'000",
    requirements:
      "Abgeschlossene 4-jährige Lehre als Automatiker EFZ, SPS-Programmierkenntnisse, exaktes Lesen von Elektroschemata.",
    career:
      "Spezialisierung auf Robotik, Industrie 4.0 oder Gebäudeautomation. Weiterbildung zum Automationsingenieur.",
    related: ["Schaltanlagenbauer", "Betriebselektriker", "Elektroinstallateur EFZ"],
  },
  "Elektroplaner": {
    label: "Elektroplaner",
    roleDescription:
      "Elektroplaner erstellen Elektropläne und Installationsschemen für Neubauten und Umbauten. Sie berechnen Kabelquerschnitte, dimensionieren Verteilungen und arbeiten eng mit Architekten und Bauherren zusammen.",
    salaryRange: "CHF 80'000 – 100'000",
    requirements:
      "Ausbildung als Elektroinstallateur EFZ mit Weiterbildung zum Elektroplaner oder Gebäudetechnikplaner, CAD-Kenntnisse.",
    career:
      "Aufstieg zum Planungsleiter, Spezialisierung auf Energieberatung oder nachhaltiges Bauen.",
    related: ["Projektleiter Elektro", "Bauleiter Elektro", "Gebäudetechniker"],
  },
  "Elektromonteur": {
    label: "Elektromonteur",
    roleDescription:
      "Elektromonteure führen elektrische Installationsarbeiten auf Baustellen und in bestehenden Gebäuden aus. Sie verlegen Kabel, montieren Verteilungen und installieren Beleuchtungs- und Steckdosensysteme.",
    salaryRange: "CHF 70'000 – 85'000",
    requirements:
      "Ausbildung im Elektrobereich (EFZ oder gleichwertig), handwerkliches Geschick, Teamfähigkeit.",
    career:
      "Weiterbildung zum Elektroinstallateur EFZ, Vorarbeiter oder Spezialisierung auf einen Fachbereich.",
    related: ["Montage-Elektriker EFZ", "Elektroinstallateur EFZ", "Servicetechniker Elektro"],
  },
  "Gebäudetechniker": {
    label: "Gebäudetechniker",
    roleDescription:
      "Gebäudetechniker sind Spezialisten für die technische Infrastruktur von Gebäuden — von Heizung, Lüftung und Klima (HLK) über Sanitäranlagen bis zur Gebäudeautomation. Sie planen, installieren und optimieren gebäudetechnische Systeme.",
    salaryRange: "CHF 75'000 – 95'000",
    requirements:
      "Ausbildung im Bereich Gebäudetechnik oder Elektro, Kenntnisse in HLK-Systemen und Gebäudeautomation.",
    career:
      "Spezialisierung auf Smart Building, Energiemanagement oder nachhaltige Gebäudetechnik.",
    related: ["Elektroplaner", "Servicetechniker Elektro", "Projektleiter Elektro"],
  },
  "Photovoltaik-Spezialist": {
    label: "Photovoltaik-Spezialist",
    roleDescription:
      "Photovoltaik-Spezialisten planen und installieren Solaranlagen auf Dächern und Fassaden. Sie dimensionieren PV-Systeme, nehmen Wechselrichter in Betrieb und beraten Kunden zu Eigenverbrauchsoptimierung und Förderprogrammen.",
    salaryRange: "CHF 70'000 – 90'000",
    requirements:
      "Ausbildung als Elektroinstallateur EFZ oder Solarteur, Kenntnisse in PV-Planung und Wechselrichtertechnik.",
    career:
      "Wachstumsbranche durch die Energiewende — Spezialisierung auf Grossanlagen, Speicherlösungen oder Energieberatung.",
    related: ["Elektroinstallateur EFZ", "Elektroplaner", "Gebäudetechniker"],
  },
  "Schaltanlagenbauer": {
    label: "Schaltanlagenbauer",
    roleDescription:
      "Schaltanlagenbauer konstruieren, verdrahten und prüfen Schaltgerätekombinationen und Steuerungsanlagen für Industrie, Infrastruktur und Energieversorgung. Sie arbeiten nach Elektroschemata und führen Funktionsprüfungen durch.",
    salaryRange: "CHF 72'000 – 88'000",
    requirements:
      "Ausbildung als Automatiker EFZ oder Elektroinstallateur EFZ, exaktes Arbeiten nach Schema, Prüferfahrung.",
    career:
      "Spezialisierung auf Mittelspannungsanlagen, Automatisierung oder Qualitätsmanagement.",
    related: ["Automatiker EFZ", "Betriebselektriker", "Elektroinstallateur EFZ"],
  },
  "Bauleiter Elektro": {
    label: "Bauleiter Elektro",
    roleDescription:
      "Bauleiter Elektro koordinieren und überwachen Elektroinstallationen auf Grossbaustellen. Sie sind verantwortlich für Terminplanung, Kostenkontrolle, Qualitätssicherung und die Führung von Subunternehmern.",
    salaryRange: "CHF 90'000 – 120'000",
    requirements:
      "Weiterbildung zum Elektro-Projektleiter oder Bauleiter, mehrjährige Berufserfahrung, Führungskompetenz.",
    career:
      "Aufstieg zum Gesamtprojektleiter, Niederlassungsleiter oder Geschäftsführer eines Elektrobetriebs.",
    related: ["Projektleiter Elektro", "Elektroplaner", "Elektroinstallateur EFZ"],
  },
  "Betriebselektriker": {
    label: "Betriebselektriker",
    roleDescription:
      "Betriebselektriker sind für die Wartung, Instandhaltung und Reparatur elektrischer Anlagen in Industrie- und Gewerbebetrieben zuständig. Sie führen regelmässige Prüfungen durch und sorgen für einen störungsfreien Betrieb.",
    salaryRange: "CHF 75'000 – 90'000",
    requirements:
      "Ausbildung als Elektroinstallateur EFZ oder Automatiker EFZ, Erfahrung in industrieller Instandhaltung.",
    career:
      "Aufstieg zum Instandhaltungsleiter, Spezialisierung auf Prozessautomation oder Energiemanagement.",
    related: ["Automatiker EFZ", "Servicetechniker Elektro", "Elektroinstallateur EFZ"],
  },
};

// --- Canton-specific content ---

interface CantonContent {
  /** Full canton name for titles */
  name: string;
  /** Short canton abbreviation */
  abbr: string;
  /** Brief economic context for the electrical industry */
  context: string;
}

const CANTON_CONTENT: Record<string, CantonContent> = {
  ZH: {
    name: "Zürich",
    abbr: "ZH",
    context:
      "Der Kanton Zürich ist der grösste Arbeitsmarkt der Schweiz mit zahlreichen Neubauprojekten, Smart-Building-Initiativen und einer hohen Dichte an Elektroinstallationsfirmen.",
  },
  BE: {
    name: "Bern",
    abbr: "BE",
    context:
      "Im Kanton Bern gibt es eine starke Nachfrage nach Elektro-Fachkräften, besonders in der Bundesstadt und im Berner Oberland — von Wohnbau bis Infrastrukturprojekte.",
  },
  BS: {
    name: "Basel",
    abbr: "BS",
    context:
      "Basel-Stadt und die Region Nordwestschweiz bieten attraktive Arbeitsbedingungen mit zahlreichen Industriebetrieben, Pharmaunternehmen und grossen Bauprojekten.",
  },
  AG: {
    name: "Aargau",
    abbr: "AG",
    context:
      "Der Kanton Aargau ist ein wichtiger Industriestandort mit vielen Energieversorgern und einer hohen Nachfrage nach Elektro-Fachkräften in Industrie und Bau.",
  },
  SG: {
    name: "St. Gallen",
    abbr: "SG",
    context:
      "Die Ostschweiz mit dem Kanton St. Gallen bietet vielfältige Möglichkeiten für Elektro-Fachkräfte — von KMU-Betrieben bis zu grossen Gebäudetechnik-Unternehmen.",
  },
  LU: {
    name: "Luzern",
    abbr: "LU",
    context:
      "Im Kanton Luzern wächst die Nachfrage nach Elektro-Fachkräften stetig — getrieben durch Neubauprojekte, Tourismus-Infrastruktur und Smart-Building-Trends.",
  },
  SO: {
    name: "Solothurn",
    abbr: "SO",
    context:
      "Der Kanton Solothurn bietet als Industriestandort zwischen Bern und Basel gute Karrierechancen für Elektro-Fachkräfte in Produktion, Bau und Instandhaltung.",
  },
  ZG: {
    name: "Zug",
    abbr: "ZG",
    context:
      "Der Kanton Zug bietet als wirtschaftsstarker Standort überdurchschnittliche Löhne und spannende Projekte im Bereich Gebäudetechnik und Hightech-Infrastruktur.",
  },
};

// --- All role keys ---
const ALL_ROLES = Object.keys(ROLE_CONTENT);
const ALL_CANTONS = Object.keys(CANTON_CONTENT);

// --- Content generation ---

function buildLandingConfig(roleKey: string, cantonKey: string): LandingPageConfig {
  const role = ROLE_CONTENT[roleKey];
  const canton = CANTON_CONTENT[cantonKey];

  if (!role || !canton) {
    throw new Error(`Invalid role "${roleKey}" or canton "${cantonKey}"`);
  }

  return {
    role: roleKey,
    canton: cantonKey,
    title: `${role.label} Jobs in ${canton.name}`,
    description: `Aktuelle ${role.label} Stellen im Kanton ${canton.name}. ${role.roleDescription.split(".")[0]}. Jetzt bewerben auf elektrojob.ch.`,
    intro: `${role.roleDescription} ${canton.context} Finde aktuelle ${role.label} Jobs in ${canton.name} auf elektrojob.ch und bewirb dich direkt.`,
    faqs: [
      {
        question: `Was verdient ein ${role.label} im Kanton ${canton.name}?`,
        answer: `Ein ${role.label} verdient in der Schweiz durchschnittlich ${role.salaryRange} pro Jahr. Im Kanton ${canton.name} können die Löhne je nach Arbeitgeber, Erfahrung und Spezialisierung variieren.`,
      },
      {
        question: `Welche Voraussetzungen braucht man als ${role.label}?`,
        answer: role.requirements,
      },
      {
        question: `Welche Karrieremöglichkeiten hat ein ${role.label}?`,
        answer: role.career,
      },
      {
        question: `Wie viele ${role.label} Jobs gibt es in ${canton.name}?`,
        answer: `Auf elektrojob.ch findest du aktuelle ${role.label} Stellen im Kanton ${canton.name}. Die Anzahl verfügbarer Jobs variiert — nutze unsere Suche für die aktuellsten Ergebnisse.`,
      },
    ],
  };
}

// --- Build full matrix ---
export const TOP_LANDING_PAGES: LandingPageConfig[] = ALL_ROLES.flatMap((roleKey) =>
  ALL_CANTONS.map((cantonKey) => buildLandingConfig(roleKey, cantonKey))
);

// --- Slug helpers ---

function normalizeSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function toRoleSlug(role: string): string {
  return normalizeSlug(role);
}

export function toCantonSlug(canton: string): string {
  return normalizeSlug(canton);
}

export function getLandingPath(config: LandingPageConfig): string {
  return `/elektrojobs/${toRoleSlug(config.role)}/${toCantonSlug(config.canton)}`;
}

export function findLandingPageBySlug(roleSlug: string, cantonSlug: string): LandingPageConfig | null {
  return (
    TOP_LANDING_PAGES.find(
      (item) => toRoleSlug(item.role) === roleSlug && toCantonSlug(item.canton) === cantonSlug
    ) ?? null
  );
}

/**
 * Get landing pages for the same canton (different roles) or same role (different cantons).
 * Used for cross-linking on landing pages.
 */
export function getRelatedLandingPages(config: LandingPageConfig, limit = 8): LandingPageConfig[] {
  const sameCantonDifferentRole = TOP_LANDING_PAGES.filter(
    (p) => p.canton === config.canton && p.role !== config.role
  );
  const sameRoleDifferentCanton = TOP_LANDING_PAGES.filter(
    (p) => p.role === config.role && p.canton !== config.canton
  );

  // Mix: take some from same canton, some from same role
  const mixed: LandingPageConfig[] = [];
  const maxPerGroup = Math.ceil(limit / 2);
  mixed.push(...sameCantonDifferentRole.slice(0, maxPerGroup));
  mixed.push(...sameRoleDifferentCanton.slice(0, maxPerGroup));
  return mixed.slice(0, limit);
}
