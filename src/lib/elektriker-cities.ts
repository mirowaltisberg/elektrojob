export interface ElektrikerCity {
  /** URL slug */
  slug: string;
  /** Display name */
  name: string;
  /** Canton abbreviation */
  cantonAbbr: string;
  /** Canton slug — used to link to /elektrojobs/[role]/[canton] pages */
  cantonSlug: string;
  /** Population (approx, for crowd context) */
  population: string;
  /** Distinctive employer/economic characteristics */
  intro: string;
  /** Top neighborhoods or districts where Elektriker work concentrates */
  districts: string[];
  /** Typical commuter towns within ~25 km radius */
  commuterTowns: string[];
  /** Region label */
  region: string;
  /** Average salary band for Elektroinstallateur EFZ in this city */
  salaryBand: string;
}

export const ELEKTRIKER_CITIES: ElektrikerCity[] = [
  {
    slug: "zuerich",
    name: "Zürich",
    cantonAbbr: "ZH",
    cantonSlug: "zuerich",
    population: "ca. 440'000",
    region: "Grossraum Zürich",
    intro:
      "Zürich ist der grösste Schweizer Arbeitsmarkt für Elektriker. Banken, Tech-Konzerne, Spitäler, Universitäten und ein dichtes Netz an Wohnbau- und Gewerbeprojekten sorgen für konstante Nachfrage. Smart-Building, KNX/DALI und Photovoltaik sind die Wachstumsfelder, die Lohnniveaus liegen 5 bis 10 Prozent über dem Schweizer Mittel.",
    districts: ["City", "Oerlikon", "Altstetten", "Wiedikon", "Schwamendingen", "Affoltern"],
    commuterTowns: ["Winterthur", "Uster", "Dübendorf", "Wetzikon", "Wädenswil", "Bülach"],
    salaryBand: "CHF 80'000 – 105'000",
  },
  {
    slug: "basel",
    name: "Basel",
    cantonAbbr: "BS",
    cantonSlug: "basel",
    population: "ca. 175'000",
    region: "Nordwestschweiz",
    intro:
      "Basel ist ein bedeutender Pharma-, Chemie- und Life-Sciences-Standort. Industriebetriebe und ihre Zulieferer beschäftigen Servicetechniker, Betriebselektriker und Automatiker mit überdurchschnittlichen Salären. Der grenznahe Markt zu Frankreich und Deutschland macht trinationale Karrieren attraktiv. Der Hafenausbau und Wohnbauprojekte am Rheinufer sorgen zusätzlich für Aufträge im Installationsbereich.",
    districts: ["Innenstadt", "Kleinbasel", "Gundeldingen", "Bachletten", "St. Johann"],
    commuterTowns: ["Liestal", "Allschwil", "Münchenstein", "Riehen", "Reinach", "Pratteln"],
    salaryBand: "CHF 80'000 – 100'000",
  },
  {
    slug: "bern",
    name: "Bern",
    cantonAbbr: "BE",
    cantonSlug: "bern",
    population: "ca. 145'000",
    region: "Mittelland",
    intro:
      "Bern vereint Bundesverwaltung, regionale Energieversorger und ein breites Spektrum an Gewerbe- und Wohnbauprojekten. Sicherheitsanlagen, Brandmeldetechnik und KNX-Steuerungen sind in den öffentlichen Bauten besonders gefragt. Die Lohnniveaus entsprechen dem Schweizer Mittel — gepaart mit hohem Lebensstandard und ausgewogenen Pendelwegen.",
    districts: ["Innenstadt", "Länggasse", "Breitenrain", "Wankdorf", "Bümpliz"],
    commuterTowns: ["Biel", "Thun", "Köniz", "Münsingen", "Burgdorf", "Lyss"],
    salaryBand: "CHF 75'000 – 95'000",
  },
  {
    slug: "luzern",
    name: "Luzern",
    cantonAbbr: "LU",
    cantonSlug: "luzern",
    population: "ca. 83'000",
    region: "Zentralschweiz",
    intro:
      "Luzern wächst dynamisch — Tourismus-Infrastruktur mit Hotels, Bergbahnen und Veranstaltungsbauten, Gewerbe in Emmen/Kriens und der Wohnungsbau in der Seeregion treiben die Nachfrage. Smart-Home und Photovoltaik sind in den Neubauten häufig gefragt. Die Nähe zu Zug eröffnet zusätzliche Pendelchancen mit attraktiven Salären.",
    districts: ["Innenstadt", "Tribschen", "Sentimatt", "Würzenbach", "Maihof"],
    commuterTowns: ["Emmen", "Kriens", "Sursee", "Hochdorf", "Stans", "Zug"],
    salaryBand: "CHF 75'000 – 95'000",
  },
  {
    slug: "st-gallen",
    name: "St. Gallen",
    cantonAbbr: "SG",
    cantonSlug: "st-gallen",
    population: "ca. 80'000",
    region: "Ostschweiz",
    intro:
      "St. Gallen ist Industriestandort und Tor zur Ostschweiz. Maschinenindustrie, Lebensmittelverarbeitung sowie ein wachsender Bildungs- und Spitalsektor beschäftigen Elektriker in stabilen Festanstellungen. Saläre liegen leicht unter dem Schweizer Mittel, dafür sind Mietpreise und Lebenshaltungskosten spürbar tiefer als in Zürich oder Zug.",
    districts: ["Innenstadt", "St. Fiden", "Bruggen", "Riethüsli", "Heiligkreuz"],
    commuterTowns: ["Wil", "Rorschach", "Gossau", "Herisau", "Rapperswil", "Buchs SG"],
    salaryBand: "CHF 72'000 – 90'000",
  },
];

export function findElektrikerCity(slug: string): ElektrikerCity | null {
  return ELEKTRIKER_CITIES.find((c) => c.slug === slug) ?? null;
}
