import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildPublicJobCopy } from "../src/lib/job-public";

interface RawScrapedJob {
  id: unknown;
  title: unknown;
  company: unknown;
  location: unknown;
  type: unknown;
  workload: unknown;
}

interface ScrapedJobFile {
  jobs?: unknown;
}

const DEFAULT_FIXTURE = "src/data/scraped-jobs.json";
const SCRAPED_ID_PATTERN = /^scraped-elektro-[0-9a-f]{12}$/i;
const FORBIDDEN_KEYS = new Set([
  "company",
  "companyUrl",
  "jobUrl",
  "scrapedSource",
  "fullDescription",
]);
const FAKE_MARKER_PATTERN = /\b(?:demo|tinder|generated|mock)\b/iu;

function fail(message: string): never {
  throw new Error(message);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsExactEmployerName(publicCopy: string, employer: string): boolean {
  const normalizedEmployer = employer.trim();
  if (!normalizedEmployer) return false;

  return new RegExp(
    `(?:^|[^\\p{L}\\p{N}])${escapeRegExp(normalizedEmployer)}(?:$|[^\\p{L}\\p{N}])`,
    "iu",
  ).test(publicCopy);
}

function requireString(
  job: RawScrapedJob,
  key: keyof RawScrapedJob,
  index: number,
): string {
  const value = job[key];
  if (typeof value !== "string") {
    fail(`Job ${index + 1} has a non-string ${String(key)}`);
  }
  return value;
}

function findForbiddenKey(value: unknown): string | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const key = findForbiddenKey(item);
      if (key) return key;
    }
    return null;
  }

  if (!value || typeof value !== "object") return null;

  for (const [key, nestedValue] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.has(key)) return key;
    const nestedKey = findForbiddenKey(nestedValue);
    if (nestedKey) return nestedKey;
  }

  return null;
}

function readJobs(filePath: string): RawScrapedJob[] {
  const parsed: unknown = JSON.parse(readFileSync(filePath, "utf8"));
  const jobs = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === "object"
      ? (parsed as ScrapedJobFile).jobs
      : undefined;

  if (!Array.isArray(jobs) || jobs.length === 0) {
    fail(`${filePath} must contain a non-empty jobs array`);
  }

  return jobs as RawScrapedJob[];
}

const fixturePath = resolve(process.cwd(), process.argv[2] ?? DEFAULT_FIXTURE);
const jobs = readJobs(fixturePath);
const seenIds = new Set<string>();

for (const [index, job] of jobs.entries()) {
  const id = requireString(job, "id", index);
  const title = requireString(job, "title", index);
  const company = requireString(job, "company", index);
  const location = requireString(job, "location", index);
  const type = requireString(job, "type", index);
  const workload = requireString(job, "workload", index);

  if (!SCRAPED_ID_PATTERN.test(id)) {
    fail(`Job ${index + 1} has invalid scraped ID: ${id}`);
  }
  if (seenIds.has(id)) {
    fail(`Duplicate scraped ID: ${id}`);
  }
  seenIds.add(id);

  const publicJob = buildPublicJobCopy({
    title,
    company,
    location,
    type,
    workload,
  });
  const serialized = JSON.stringify(publicJob);

  if (containsExactEmployerName(serialized, company)) {
    fail(`Public copy for ${id} contains the exact employer name: ${company}`);
  }

  const forbiddenKey = findForbiddenKey(publicJob);
  if (forbiddenKey) {
    fail(`Public copy for ${id} contains forbidden key: ${forbiddenKey}`);
  }

  if (FAKE_MARKER_PATTERN.test(`${id}\n${serialized}`)) {
    fail(`Public copy for ${id} contains a demo/generated marker`);
  }
}

console.log(`Public-job invariant check passed for ${jobs.length} scraped jobs.`);
