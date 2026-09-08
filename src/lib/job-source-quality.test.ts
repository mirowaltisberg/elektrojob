import assert from "node:assert/strict";
import test from "node:test";
import { getPublicJobLocation, getVerifiedEmploymentType, getVerifiedJobDetails, getVerifiedWorkload, isElectricalSourceRole, sanitizeSourceItems } from "./job-source-quality";

const source = {
  title: "Elektroinstallateur/in 80–100%", company: "Mustermann Elektro AG", location: "Winterthur, Zürich",
  fullDescription: "Pensum: 80–100%. " + "In dieser Stelle werden elektrische Anlagen installiert, geprüft und fachgerecht dokumentiert. ".repeat(5),
  description: "Veröffentlichte Stelle in Winterthur.",
  responsibilities: ["Elektrische Anlagen installieren und sorgfältig prüfen", "Arbeitsaufträge selbstständig ausführen und dokumentieren"],
  requirements: ["Abgeschlossene Ausbildung im Elektrobereich erforderlich", "Selbstständige Arbeitsweise und Freude an technischen Aufgaben"],
};
source.fullDescription += [...source.responsibilities, ...source.requirements].join(". ");

test("homepage selection requires source-backed detail and preserves optional unknown fields", () => {
  const result = getVerifiedJobDetails(source, "Elektroinstallateur/in");
  assert.equal(result.hasVerifiedDetails, true);
  assert.equal(result.workload, "80-100%");
  assert.equal(result.type, "");
  assert.deepEqual(result.responsibilities, source.responsibilities);
  assert.equal(getVerifiedJobDetails({ ...source, title: "Elektroinstallateur/in", fullDescription: "Keine Pensumangabe. ".repeat(30) }, "Elektroinstallateur/in").hasVerifiedDetails, false);
  assert.equal(getVerifiedJobDetails({ ...source, requirements: [] }, "Elektroinstallateur/in").hasVerifiedDetails, false);
  assert.equal(getVerifiedJobDetails({ ...source, location: "Schweiz" }, "Elektroinstallateur/in").hasVerifiedDetails, false);
  assert.equal(getVerifiedJobDetails(source, "Elektro-Fachkraft").hasVerifiedDetails, false);
});

test("source items with employer identity and contact details are excluded entirely", () => {
  const safe = "Elektroinstallationen sorgfältig prüfen und dokumentieren";
  assert.deepEqual(sanitizeSourceItems([
    safe, safe,
    "Arbeite in unserem Team bei Mustermann Elektro an neuen Aufgaben",
    "Fragen beantwortet Herr Peter Müller jederzeit persönlich",
    "Zusammenarbeit mit Peter Müller und der Installationsleitung",
    "Weitere Informationen findest du unter https://example.test/jobs",
    "Weitere Informationen findest du unter jobs.example.ch/karriere.",
    "Unser Ansprechpartner Peter Müller beantwortet technische Fragen.",
    "Sende deine Unterlagen bitte direkt an Peter Müller in Winterthur.",
    "Sende deine Unterlagen an jobs@example.test für weitere Informationen",
    "Rufe uns unter +41 44 555 55 55 für weitere Informationen an",
    "Treffpunkt ist die Beispielstrasse 15 für den Einsatzbeginn",
    "Installation und Inbetriebnahme bei Beispiel GmbH in Zürich",
    "Du bist Teil des engagierten Teams von Beispiel gmbh in Zürich.",
    "Konfiguration der Anlagen auf intern.example.ch.",
    "Konfiguration der Anlagen auf intern.example.ch?ref=abc",
    "Technische Abklärungen unter + 41 44 5555555 durchführen.",
    "Peter Müller, Leiter Technik, begleitet deine Einarbeitung persönlich.",
    "Rudolf Meier steht dir während deiner Einarbeitung zur Seite.",
  ], source.company), [safe]);
});

test("workload ranges and labelled values are read without defaulting from Vollzeit", () => {
  assert.equal(getVerifiedWorkload("Elektroinstallateur/in 80–100%", ""), "80-100%");
  assert.equal(getVerifiedWorkload("Elektroinstallateur/in 80 %", ""), "80%");
  assert.equal(getVerifiedWorkload("Elektroinstallateur/in", "Pensum: 60%"), "60%");
  assert.equal(getVerifiedWorkload("Elektroinstallateur/in 100-80%", ""), "");
  assert.equal(getVerifiedWorkload("Elektroinstallateur/in", "Vollzeit, mit 20% Mitarbeiterrabatt"), "");
});


test("structured source items require evidence in the original description", () => {
  const result = getVerifiedJobDetails({ ...source, fullDescription: "In dieser Stelle arbeiten Sie mit elektrischen Anlagen. ".repeat(10) }, "Elektroinstallateur/in");
  assert.equal(result.hasVerifiedDetails, false);
  assert.deepEqual(result.responsibilities, []);
  assert.deepEqual(result.requirements, []);
});

test("discounts, agency footer lists and negated employment terms are not job facts", () => {
  assert.equal(getVerifiedWorkload("Elektroinstallateur 100%", "Unsere Mitarbeitenden erhalten 20–30% Rabatt im Shop. Pensum: 100%"), "100%");
  assert.equal(getVerifiedWorkload("Elektroinstallateur", "Unsere Mitarbeitenden erhalten 20–30% Rabatt im Shop."), "");
  assert.equal(getVerifiedEmploymentType("Elektroinstallateur", "Keine Teilzeit, nur Vollzeit"), "");
  assert.equal(getVerifiedEmploymentType("Elektroinstallateur", "Anstellungsart: Vollzeit"), "Vollzeit");
  assert.equal(getVerifiedEmploymentType("Elektroinstallateur", "Wir vermitteln Vollzeit, Teilzeit und Temporär."), "");
});

test("public locations come from the municipality catalogue instead of source contact text", () => {
  assert.equal(getPublicJobLocation("Winterthur, Neutral AG"), "Winterthur, Zürich");
  assert.equal(getPublicJobLocation("Neutral AG, Zürich"), "Schweiz");
  assert.equal(getPublicJobLocation("Beispielstrasse 15, 8400 Winterthur, ZH"), "Winterthur, Zürich");
});

test("unrelated source roles cannot become electrical vacancies through a generic title", () => {
  for (const title of ["Projektleiter E-Business 100%", "Projektleiter Wärmeprojekte 80-100%", "Projektleiter Holzfeuerungsanlagen", "Projektleiter HLK", "Projektleiter"]) {
    assert.equal(isElectricalSourceRole(title), false, title);
    assert.equal(getVerifiedJobDetails({ ...source, title }, "Elektro-Projektleiter/in").hasVerifiedDetails, false, title);
  }
  assert.equal(isElectricalSourceRole("Projektleiter Elektro 80-100%"), true);
  assert.equal(isElectricalSourceRole("Automatiker EFZ 100%"), true);
});

test("truncated source lines and benefits cannot make a complete tasks section", () => {
  const rejected = [
    "Du begleitest unsere Projekte von der Planung bis zur",
    "Arbeiten an unseren Produktions-",
    "Durchführung im Rahmen Ihrer Fach- und Bewilligungskompeten-",
    "Einige Jahre Berufserfahrung sowie Weiterbildung auf diesen Ge",
    "Aktive Mitarbeit bei Neuanlagen bei Kunden im In-",
    "Analyse von mechanischen, pneumatischen, hydraulischen und",
    "Darauf kannst du dich freuen",
    "Sicherstellen der Verfügbarkeit unserer Lo-gistikanlagen",
    "Abgeschlossene Berufslehre oder eine ver-gleichbare Ausbildung",
    "quenzumrichtern sind Ihr Vorteil",
  ];
  assert.deepEqual(sanitizeSourceItems(rejected, "Neutral AG"), []);
  const perks = ["Ein engagiertes und hilfsbereites Team mit offenem Austausch", "Einen hohen Freiheitsgrad und flexible Arbeitszeiten"];
  const job = { ...source, responsibilities: perks, fullDescription: source.fullDescription + perks.join(". ") };
  assert.equal(getVerifiedJobDetails(job, "Elektroinstallateur/in").hasVerifiedDetails, false);
  assert.deepEqual(getVerifiedJobDetails(job, "Elektroinstallateur/in").responsibilities, []);
  const nonRequirements = ["Persönlichkeit & Arbeitsweise", "Mehr Ferientage bereits ab dem zweiten Dienstjahr", "Personalrestaurant Essbar mit täglich frischen Menüs", "Abwechslungsreiche und verantwortungsvolle Tätigkeit"];
  const wrongSection = { ...source, requirements: nonRequirements, fullDescription: source.fullDescription + nonRequirements.join(". ") };
  assert.deepEqual(getVerifiedJobDetails(wrongSection, "Elektroinstallateur/in").requirements, []);
});
