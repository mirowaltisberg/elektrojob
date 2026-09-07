import assert from "node:assert/strict";
import test from "node:test";
import { buildJobPostingSchema, assertSafeJobPostingSchema } from "./job-schema";
import { buildPublicJobCopy } from "./job-public";
import type { JobListing } from "./job-types";

const job: JobListing = {
 id: "scraped-elektro-fixture", title: "Elektroinstallateur/in", location: "Winterthur, Zürich",
 description: "Veröffentlichte Stelle in Winterthur.", type: "Nicht angegeben", workload: "Nicht angegeben",
 responsibilities: [], requirements: [], benefits: [], datePosted: "2026-09-07", isNew: false, isUrgent: false, source: "scraped",
};
const options = { siteName: "elektrojob.ch", siteUrl: "https://www.elektrojob.ch", directApply: false };
test("real Elektro vacancies receive markup without inferred salaries, hours or employer identity", () => {
 const schema = buildJobPostingSchema(job, options);
 assertSafeJobPostingSchema(schema);
 assert.equal(schema.jobLocation.address.addressLocality, "Winterthur");
 assert.equal(schema.title, job.title);
 assert.equal(schema.url, "https://www.elektrojob.ch/jobs/scraped-elektro-fixture");
 assert.equal(schema.directApply, false);
 assert.equal(schema.baseSalary, undefined);
 assert.equal(schema.employmentType, undefined);
 assert.equal(schema.workHours, undefined);
 assert.throws(() => buildJobPostingSchema({ ...job, id: "direct-hire-elektro" }, options));
});
test("missing contract and workload remain unknown in public copy", () => {
 const copy=buildPublicJobCopy({title:"Elektroinstallateur",company:"Privater Arbeitgeber",location:"Winterthur",type:"",workload:""});
 assert.doesNotMatch(copy.description,/80-100|Festanstellung|Privater Arbeitgeber/);
 assert.match(copy.description,/Pensum nicht angegeben/);
});
