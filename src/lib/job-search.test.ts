import assert from "node:assert/strict";
import test from "node:test";
import { searchJobListingsInCatalogue } from "./job-search";
import type { JobListing } from "./job-types";

function job(id: string, patch: Partial<JobListing> = {}): JobListing {
  return {
    id, title: "Elektroinstallateur/in", location: "Luzern, Luzern",
    type: "Festanstellung", workload: "80-100%", description: "Elektroinstallationen und Wartung.",
    responsibilities: [], requirements: [], benefits: [], datePosted: new Date().toISOString(),
    isNew: true, isUrgent: false, source: "scraped", relevanceScore: 20,
    ...patch,
  };
}

const catalogue = [
  job("local-incomplete"),
  job("local-detailed", { hasVerifiedDetails: true }),
  job("zurich", { location: "Zürich, Zürich", hasVerifiedDetails: true, workload: "100%" }),
  job("planner", { title: "Elektroplaner/in", isRemote: true, workload: "60%" }),
  job("older", { datePosted: new Date(Date.now() - 40 * 86400000).toISOString() }),
];

test("unfiltered search exposes the complete catalogue and ranks detailed jobs first", () => {
  const result = searchJobListingsInCatalogue(catalogue, { sort: "relevance", allowAlternatives: true });
  assert.equal(result.total, 5);
  assert.equal(result.exactTotal, 5);
  assert.equal(result.alternativeMessage, null);
  assert.equal(result.jobs[0].hasVerifiedDetails, true);
  assert(result.jobs.some((j) => j.id === "local-incomplete"));
});

test("exact results keep all requested filters and never mix in alternatives", () => {
  const result = searchJobListingsInCatalogue(catalogue, {
    q: "Elektroinstallateur", loc: "Luzern, LU", radiusKm: 5,
    workload: "80-100%", type: "Festanstellung", postedWithinDays: 7, allowAlternatives: true,
  });
  assert.deepEqual(new Set(result.jobs.map((j) => j.id)), new Set(["local-incomplete", "local-detailed"]));
  assert.equal(result.exactTotal, 2);
  assert.equal(result.alternativeMessage, null);
});

test("secondary-filter alternatives preserve profession and place", () => {
  const result = searchJobListingsInCatalogue(catalogue, {
    q: "Elektroinstallateur", loc: "Luzern, LU", radiusKm: 5, remote: "true", allowAlternatives: true,
  });
  assert.equal(result.exactTotal, 0);
  assert(result.jobs.length > 0);
  assert(result.jobs.every((j) => j.title === "Elektroinstallateur/in" && j.location === "Luzern, Luzern"));
  assert.match(result.alternativeMessage!, /weitere Filter/);
  assert(result.jobs.every((j) => j.isRemote !== true)); // unknown remote stays unknown
});

test("when the local profession has no match, the same profession elsewhere is preferred", () => {
  const result = searchJobListingsInCatalogue(catalogue, {
    q: "Elektroplaner", loc: "Zürich, ZH", radiusKm: 5, allowAlternatives: true,
  });
  assert.deepEqual(result.jobs.map((j) => j.id), ["planner"]);
  assert.equal(result.exactTotal, 0);
  assert.match(result.alternativeMessage!, /ausserhalb/);
});

test("an unknown profession returns local alternatives, not false exact matches", () => {
  const result = searchJobListingsInCatalogue(catalogue, {
    q: "Unbekannterberuf", loc: "Luzern, LU", radiusKm: 5, allowAlternatives: true,
  });
  assert(result.jobs.length > 0);
  assert(result.jobs.every((j) => j.location === "Luzern, Luzern"));
  assert.equal(result.exactTotal, 0);
  assert.match(result.alternativeMessage!, /Suchbegriff/);
});

test("every combination returns real alternatives if the published catalogue is non-empty", () => {
  const before = JSON.stringify(catalogue);
  for (const q of ["", "Elektroinstallateur", "Elektroplaner", "xyz"])
    for (const loc of ["", "Luzern, LU", "ZH", "Atlantis"])
      for (const remote of ["any", "true", "false"] as const)
        for (const type of ["", "Temporär"])
          for (const workload of ["", "1%"])
            for (const postedWithinDays of [0, 1]) {
              const result = searchJobListingsInCatalogue(catalogue, { q, loc, remote, type, workload, postedWithinDays, radiusKm: 5, allowAlternatives: true });
              assert(result.jobs.length > 0, JSON.stringify({ q, loc, remote, type, workload, postedWithinDays }));
              assert(result.jobs.every((j) => catalogue.includes(j)));
              assert.equal(result.alternativeMessage !== null, result.exactTotal === 0);
            }
  assert.equal(JSON.stringify(catalogue), before);
});

test("alternatives paginate consistently without duplicates and preserve the result mode", () => {
  const query = { q: "unknown", loc: "Atlantis", allowAlternatives: true, limit: 2, sort: "relevance" as const };
  const pages = [0, 2, 4].map((offset) => searchJobListingsInCatalogue(catalogue, { ...query, offset }));
  assert.equal(new Set(pages.flatMap((p) => p.jobs.map((j) => j.id))).size, catalogue.length);
  assert(pages.every((p) => p.total === 5 && p.exactTotal === 0 && p.alternativeMessage === pages[0].alternativeMessage));
  assert.equal(searchJobListingsInCatalogue(catalogue, { ...query, offset: 5 }).jobs.length, 0);
});

test("strict catalogue queries remain exact and an empty source never invents jobs", () => {
  const strict = searchJobListingsInCatalogue(catalogue, { q: "xyz" });
  assert.equal(strict.total, 0);
  assert.equal(strict.alternativeMessage, null);
  const empty = searchJobListingsInCatalogue([], { q: "xyz", allowAlternatives: true });
  assert.equal(empty.total, 0);
  assert.deepEqual(empty.jobs, []);
  assert.equal(empty.alternativeMessage, null);
});
