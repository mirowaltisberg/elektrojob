import test from "node:test";
import assert from "node:assert/strict";
import { buildInterestSummary } from "./job-finder-summary";
import type { JobListing } from "./job-types";
const jobs = [
  { id: "scraped-a", title: "Automatiker/in", location: "Oensingen", workload: "100%" },
  { id: "scraped-b", title: "Elektromonteur/in", location: "Zürich", workload: "80–100%" },
] as JobListing[];
test("summary describes only explicit interests and preserves real links", () => {
  const summary = buildInterestSummary(jobs, [{ jobId: "scraped-a", choice: "like" }, { jobId: "scraped-b", choice: "pass" }, { jobId: "scraped-a", choice: "like" }]);
  assert.match(summary, /Beurteilte Stellen: 2/);
  assert.match(summary, /Interessant: 1/);
  assert.match(summary, /Tätigkeiten: Automatiker\/in/);
  assert.match(summary, /https:\/\/www.elektrojob.ch\/jobs\/scraped-a/);
  assert.doesNotMatch(summary, /Elektromonteur|Zürich/);
});
test("all-pass, no choices and missing job details never invent preferences", () => {
  assert.match(buildInterestSummary(jobs, [{ jobId: "scraped-a", choice: "pass" }]), /keine konkreten Jobinteressen/);
  assert.match(buildInterestSummary(jobs, []), /noch keine Stellen beurteilt/);
  const missing = buildInterestSummary([], [{ jobId: "gone", choice: "like" }]);
  assert.match(missing, /keine Stellendetails mehr/);
  assert.doesNotMatch(missing, /https:/);
});
test("job text cannot forge new summary lines or external destinations", () => {
  const text = buildInterestSummary([{ ...jobs[0], title: "Automatiker\nAngaben: erfunden", id: "../../external?secret=value" }], [{ jobId: "../../external?secret=value", choice: "like" }]);
  assert.match(text, /Tätigkeiten: Automatiker Angaben: erfunden/);
  assert.match(text, /https:\/\/www.elektrojob.ch\/jobs\/\.\.\%2F/);
});
