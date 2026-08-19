import { cleanJobText } from "@/lib/job-text-clean";

interface PublicJobCopyInput {
  title: string;
  company: string;
  location: string;
  type: string;
  workload: string;
}

interface PublicJobCopy {
  title: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
}

function canonicalPublicTitle(rawTitle: string): string {
  const title = cleanJobText(rawTitle).toLocaleLowerCase("de-CH");

  if (/projektleit/.test(title)) return "Elektro-Projektleiter/in";
  if (/bauleit/.test(title)) return "Elektro-Bauleiter/in";
  if (/sicherheitsberat|kontrolleur/.test(title)) return "Elektro-Sicherheitsberater/in";
  if (/betriebselektr/.test(title)) return "Betriebselektriker/in";
  if (/netz(?:elektr|monteur)|hochspannung|freileitung/.test(title)) return "Netzelektriker/in";
  if (/gebäudeautomat/.test(title)) return "Gebäudeautomatiker/in";
  if (/schaltanlag|schaltschrank/.test(title)) return "Schaltanlagenbauer/in";
  if (/automat|sps|steuerung/.test(title)) return "Automatiker/in";
  if (/elektroplan|fachplan|zeichner/.test(title)) return "Elektroplaner/in";
  if (/service|kundendienst|instandhalt/.test(title)) return "Servicetechniker/in Elektro";
  if (/solar|photovoltaik/.test(title)) return "Elektroinstallateur/in Photovoltaik";
  if (/gebäudetechnik/.test(title)) return "Gebäudetechniker/in Elektro";
  if (/telematik|netzwerk/.test(title)) return "Telematiker/in";
  if (/elektromaschin/.test(title)) return "Elektromaschinenbauer/in";
  if (/elektroniker/.test(title)) return "Elektroniker/in";
  if (/ingenieur/.test(title)) return "Elektroingenieur/in";
  if (/techniker/.test(title)) return "Elektrotechniker/in";
  if (/montage.?elektr/.test(title)) return "Montage-Elektriker/in";
  if (/monteur|montage/.test(title)) return "Elektromonteur/in";
  if (/install|electrician|elektriker/.test(title)) return "Elektroinstallateur/in";

  return "Elektro-Fachkraft";
}

function profileForTitle(title: string): {
  responsibilities: string[];
  requirements: string[];
} {
  const normalized = title.toLocaleLowerCase("de-CH");

  if (/projektleit|bauleit|teamleit|fachleit/.test(normalized)) {
    return {
      responsibilities: [
        "Elektroprojekte planen, koordinieren und bis zur Übergabe begleiten",
        "Termine, Qualität und Arbeitssicherheit im Einsatz sicherstellen",
        "Absprachen mit Fachpersonen, Baustellenleitung und Kundschaft führen",
      ],
      requirements: [
        "Abgeschlossene Ausbildung im Elektrobereich",
        "Erfahrung in der Leitung oder Koordination von Elektroarbeiten",
        "Selbstständige, zuverlässige und lösungsorientierte Arbeitsweise",
      ],
    };
  }

  if (/automat|sps|steuer|schaltanlag|schaltschrank/.test(normalized)) {
    return {
      responsibilities: [
        "Steuerungen und elektrische Anlagen aufbauen, verdrahten und prüfen",
        "Störungen systematisch analysieren und fachgerecht beheben",
        "Anlagen in Betrieb nehmen und Arbeiten nachvollziehbar dokumentieren",
      ],
      requirements: [
        "Abgeschlossene technische Ausbildung im Elektro- oder Automationsbereich",
        "Sicherer Umgang mit Schaltplänen, Messmitteln und Steuerungstechnik",
        "Exakte, verantwortungsbewusste und selbstständige Arbeitsweise",
      ],
    };
  }

  if (/planer|zeichner|planung/.test(normalized)) {
    return {
      responsibilities: [
        "Elektropläne, Schemas und technische Unterlagen erstellen",
        "Planungsdetails mit den beteiligten Fachbereichen koordinieren",
        "Projektunterlagen prüfen, nachführen und termingerecht bereitstellen",
      ],
      requirements: [
        "Abgeschlossene Ausbildung in Elektroplanung oder Elektrotechnik",
        "Gutes Verständnis für Normen, Schemas und technische Dokumentation",
        "Strukturierte, sorgfältige und teamorientierte Arbeitsweise",
      ],
    };
  }

  if (/service|wart|instand|betriebselektr|kundendienst/.test(normalized)) {
    return {
      responsibilities: [
        "Elektrische Anlagen warten, prüfen und bei Störungen instand setzen",
        "Fehler vor Ort eingrenzen und nachhaltige Lösungen umsetzen",
        "Ausgeführte Arbeiten sauber dokumentieren und übergeben",
      ],
      requirements: [
        "Abgeschlossene Ausbildung im Elektrobereich",
        "Erfahrung in Service, Unterhalt oder Störungsbehebung",
        "Zuverlässiges Auftreten und selbstständige Arbeitsweise",
      ],
    };
  }

  if (/netz|energie|trafo|hochspannung|niederspannung/.test(normalized)) {
    return {
      responsibilities: [
        "Arbeiten an Energie-, Netz- oder Verteilanlagen fachgerecht ausführen",
        "Kontrollen, Messungen und Instandhaltungsarbeiten durchführen",
        "Sicherheitsvorgaben konsequent einhalten und Einsätze dokumentieren",
      ],
      requirements: [
        "Abgeschlossene elektrotechnische Ausbildung",
        "Hohes Sicherheitsbewusstsein und technisches Verständnis",
        "Bereitschaft für selbstständige Einsätze im zugeteilten Gebiet",
      ],
    };
  }

  if (/solar|photovoltaik/.test(normalized)) {
    return {
      responsibilities: [
        "Photovoltaik- und Elektroinstallationen montieren und anschliessen",
        "Anlagen prüfen, in Betrieb nehmen und fachgerecht dokumentieren",
        "Störungen erkennen und technische Lösungen sauber umsetzen",
      ],
      requirements: [
        "Abgeschlossene Ausbildung im Elektrobereich",
        "Interesse an Energie- und Gebäudetechnik",
        "Sichere, zuverlässige und teamorientierte Arbeitsweise",
      ],
    };
  }

  return {
    responsibilities: [
      "Elektroinstallationen fachgerecht ausführen, prüfen und dokumentieren",
      "Pläne und technische Vorgaben sicher in die Praxis umsetzen",
      "Im Team für saubere, sichere und termingerechte Arbeiten sorgen",
    ],
    requirements: [
      "Abgeschlossene Ausbildung oder fundierte Erfahrung im Elektrobereich",
      "Verantwortungsbewusste und selbstständige Arbeitsweise",
      "Zuverlässigkeit, Teamgeist und ein hohes Qualitätsbewusstsein",
    ],
  };
}

export function buildPublicJobCopy(input: PublicJobCopyInput): PublicJobCopy {
  // Never echo a scraped title: employer brands can appear in it even when they
  // do not exactly match the structured company field.
  const title = canonicalPublicTitle(input.title);
  const location = cleanJobText(input.location) || "Schweiz";
  const type = cleanJobText(input.type) || "Festanstellung";
  const workload = cleanJobText(input.workload) || "80-100%";
  const profile = profileForTitle(title);

  return {
    title,
    description:
      "Aktuell gesucht wird eine Fachkraft als " +
      title +
      " in " +
      location +
      ". Diese veröffentlichte Stelle ist als " +
      type +
      " mit einem Pensum von " +
      workload +
      " ausgeschrieben. Angaben zum Arbeitgeber bleiben vertraulich und werden im Bewerbungsprozess offengelegt.",
    responsibilities: profile.responsibilities,
    requirements: profile.requirements,
    benefits: [],
  };
}
