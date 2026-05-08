// Trade-specific copy for the swipe feature.
// All other 9 sites override only this file when porting the feature.

export const SWIPE_COPY = {
  trade: {
    singular: "Elektriker",
    accusative: "Elektriker-Job",
    plural: "Elektriker-Jobs",
  },
  brand: "elektrojob.ch",

  landing: {
    eyebrow: "Neu auf elektrojob",
    title: "Wischen statt bewerben.",
    subtitle:
      "Lebenslauf einmal hochladen, dann mit einem Wisch auf Elektriker-Jobs bewerben — fertig in unter zwei Minuten.",
    cta: "Jetzt loslegen",
    steps: [
      {
        n: "01",
        title: "PLZ und Lebenslauf",
        body: "Wir zeigen dir nur Stellen in deiner Nähe und nutzen deinen CV für jede Bewerbung.",
      },
      {
        n: "02",
        title: "Wische rechts",
        body: "Spannender Job? Wisch nach rechts und du hast dich beworben — ohne Formular.",
      },
      {
        n: "03",
        title: "Wir melden uns",
        body: "Du erhältst zu jeder Bewerbung eine Bestätigung per Mail. Den Rest übernehmen wir.",
      },
    ],
    desktopHint: "Diese Funktion gibt es nur auf dem Smartphone.",
  },

  start: {
    title: "Drei Angaben — dann geht's los.",
    plzLabel: "Deine Postleitzahl",
    plzPlaceholder: "z. B. 8001",
    cvLabel: "Lebenslauf hochladen",
    cvHint: "PDF oder DOCX, bis 10 MB",
    emailLabel: "E-Mail-Adresse",
    emailPlaceholder: "max@beispiel.ch",
    phoneLabel: "Telefonnummer",
    phonePlaceholder: "+41 79 123 45 67",
    submit: "Stellen ansehen",
    submitting: "Einen Moment …",
    privacy:
      "Mit dem Klick auf «Stellen ansehen» erlaubst du uns, deinen CV bei rechts-Wischen an den Arbeitgeber weiterzuleiten.",
  },

  stack: {
    counterFormat: (current: number, total: number) => `${current} / ${total}`,
    apply: "Bewerben",
    skip: "Weiter",
    rightStamp: "BEWERBEN",
    leftStamp: "WEITER",
    sentToast: "Bewerbung gesendet",
    skipToast: "Übersprungen",
    errorToast: "Hat nicht geklappt — nochmal versuchen.",
    emptyTitle: "Keine weiteren Jobs in deiner Nähe.",
    emptyBody: "Erweitere den Suchradius, um mehr passende Stellen zu sehen.",
    expandRadius: (km: number) => `Auf ${km} km erweitern`,
    finishedTitle: "Das war's für heute!",
    finishedBody: "Wir melden uns per Mail, sobald sich ein Arbeitgeber zurückmeldet.",
    finishedCta: "Zur Startseite",
  },

  errors: {
    plzInvalid: "Bitte gib eine gültige Schweizer PLZ ein.",
    cvMissing: "Bitte lade deinen Lebenslauf hoch.",
    cvType: "Nur PDF- und DOCX-Dateien werden akzeptiert.",
    cvSize: "Die Datei darf maximal 10 MB gross sein.",
    emailInvalid: "Bitte gib eine gültige E-Mail-Adresse ein.",
    phoneInvalid: "Bitte gib eine gültige Telefonnummer ein.",
    network: "Netzwerkfehler — bitte erneut versuchen.",
  },
} as const;
