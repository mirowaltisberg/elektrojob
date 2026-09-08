import assert from "node:assert/strict";
import test from "node:test";
import { buildJobMetaDescription } from "./job-metadata";
import type { JobListing } from "./job-types";

const job: JobListing = {
  id: "test-job",
  title: "Elektroinstallateur/in",
  location: "Luzern",
  workload: "80-100%",
  type: "Festanstellung",
  description: "Eine generische Einleitung ohne zusätzliche Stellenangaben.",
  responsibilities: ["Montage und Inbetriebnahme von Photovoltaikanlagen"],
  requirements: ["Abgeschlossene Ausbildung als Elektroinstallateur/in EFZ"],
  benefits: [],
  datePosted: "2026-09-08",
  isNew: false,
  isUrgent: false,
  source: "scraped",
};

test("summarises known job facts and source tasks instead of a generic introduction", () => {
  assert.equal(buildJobMetaDescription(job),
    "Elektroinstallateur/in in Luzern. 80-100%, Festanstellung. Montage und Inbetriebnahme von Photovoltaikanlagen.");
});

test("uses available public tasks even when some job details remain unverified", () => {
  const incompleteJob = { ...job, hasVerifiedDetails: false, workload: "Nicht angegeben", type: "Nicht angegeben" };
  const description = buildJobMetaDescription(incompleteJob);
  assert.equal(description,
    "Elektroinstallateur/in in Luzern. Montage und Inbetriebnahme von Photovoltaikanlagen.");
  assert.doesNotMatch(description, /100%|Festanstellung|Nicht angegeben/u);
});

test("prefers a complete task that fits without changing its wording", () => {
  const description = buildJobMetaDescription({
    ...job,
    responsibilities: ["Eine ausführliche Aufgabenbeschreibung ".repeat(8), "Wartung und Prüfung elektrischer Anlagen."],
  });
  assert.ok(description.endsWith("Wartung und Prüfung elektrischer Anlagen."));
  assert.doesNotMatch(description, /…/u);
});

test("clearly identifies a requirement when no source tasks are available", () => {
  assert.ok(buildJobMetaDescription({ ...job, responsibilities: [] })
    .endsWith("Anforderung: Abgeschlossene Ausbildung als Elektroinstallateur/in EFZ."));
});

test("leaves missing details absent and does not invent generic tasks or defaults", () => {
  assert.equal(buildJobMetaDescription({
    ...job, workload: "Nicht angegeben", type: "", responsibilities: [], requirements: [],
  }), "Elektroinstallateur/in in Luzern.");
});

test("does not publish a partial source item when the complete context cannot fit", () => {
  const task = "Montage und Inbetriebnahme komplexer elektrischer Anlagen sowie die sorgfältige Prüfung, Wartung und Dokumentation bestehender Installationen in unterschiedlichen Gebäuden";
  const description = buildJobMetaDescription({ ...job, responsibilities: [task], requirements: [] });
  assert.ok(description.length <= 200);
  assert.equal(description, "Elektroinstallateur/in in Luzern. 80-100%, Festanstellung.");
});

test("uses a complete requirement when tasks are too long and skips empty section headings", () => {
  const description = buildJobMetaDescription({
    ...job,
    responsibilities: ["Eine ausführliche Aufgabenbeschreibung ".repeat(8)],
    requirements: ["Diese Qualifikationen sind uns wichtig", "Abgeschlossene Ausbildung als Elektroinstallateur\\in EFZ"],
  });
  assert.ok(description.endsWith("Anforderung: Abgeschlossene Ausbildung als Elektroinstallateur/in EFZ."));
});

test("does not use IDs, dates, raw descriptions or employer fields for uniqueness", () => {
  const source = {
    ...job,
    id: "meaningless-identifier",
    datePosted: "2099-12-31",
    company: "Vertraulicher Arbeitgeber AG",
    fullDescription: "Kontakt: private@example.ch",
    description: "Kontakt: private@example.ch",
  };
  assert.equal(buildJobMetaDescription(source), buildJobMetaDescription(job));
  assert.doesNotMatch(buildJobMetaDescription(source), /meaningless|2099|Vertraulich|private|@/u);
});

test("normalises whitespace and preserves safe source wording and punctuation", () => {
  assert.equal(buildJobMetaDescription({
    ...job,
    workload: " 80-100% ",
    type: " unbekannt ",
    responsibilities: [" ", "Prüfung\n und  Wartung elektrischer Anlagen!"],
  }), "Elektroinstallateur/in in Luzern. 80-100%. Prüfung und Wartung elektrischer Anlagen!");
});
