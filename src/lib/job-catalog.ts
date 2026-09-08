import {
  getScrapedJobById,
  getScrapedMeta,
  loadScrapedJobs,
  type ScrapedJob,
} from "@/lib/scraped-jobs";
import { cleanJobText } from "@/lib/job-text-clean";
import { buildPublicJobCopy } from "@/lib/job-public";
import { getPublicJobLocation, getVerifiedJobDetails } from "@/lib/job-source-quality";
import type {
  JobListing,
  JobSearchParams,
} from "@/lib/job-types";

import { searchJobListingsInCatalogue, sortJobs, type JobSearchResult } from "@/lib/job-search";
export type { JobSearchResult } from "@/lib/job-search";

const SCRAPE_STALE_HOURS = Math.max(1, Number(process.env.SCRAPE_STALE_HOURS ?? 72));
const MIN_RELEVANCE_SCORE = 2;
const POSITIVE_KEYWORDS = [
  "elektro",
  "elektriker",
  "montage-elektriker",
  "elektroinstallateur",
  "automatiker",
  "elektroplaner",
  "netzelektriker",
  "elektromonteur",
  "elektrotechnik",
  "starkstrom",
  "schwachstrom",
  "schaltanlagen",
  "gebäudeautomation",
  "photovoltaik",
  "solartechnik",
  "inbetriebnahme",
  "servicetechniker",
  "brandmelde",
  "monteur",
  "installat",
  "wartung",
];

const NEGATIVE_KEYWORDS = [
  "verkäufer",
  "detailhandel",
  "pfleger",
  "pflegefach",
  "jurist",
  "staatsanwalt",
  "küche",
  "koch",
  "reinigung",
  "logistik",
  "marketing",
  "hr manager",
  "data analyst",
  "praktikum data",
];

const CORE_TITLE_KEYWORDS = [
  "elektro",
  "elektriker",
  "elektroinstallateur",
  "montage-elektriker",
  "elektromonteur",
  "elektroniker",
  "automatiker",
  "automatikmonteur",
  "automation",
  "instandhalt",
  "inbetriebnahme",
  "betriebselektriker",
  "schaltanlagen",
  "schaltschrank",
  "gebäudeautomation",
  "gebaeudeautomation",
  "photovoltaik",
  "solartechnik",
  "netzelektriker",
  "bahntechnik",
  "sps",
  "msr",
  "mess regel",
  "mechatron",
  "servicetechni",
  "kundendiensttechni",
  "field service",
  "monteur",
  "techniker",
  "projektleiter",
  "bauleiter",
  "brandmelde",
  "freileitungs",
  "starkstrom",
  "schwachstrom",
  "planer",
  "zeichner",
  "emr",
  "energie",
  "netz",
  "trafo",
  "installat",
  "wartung",
];

const HARD_NEGATIVE_TITLE_KEYWORDS = [
  "pflege",
  "fage",
  "spitex",
  "gesundheit",
  "notfall",
  "sozial",
  "verkauf",
  "sales",
  "marketing",
  "jurist",
  "anwalt",
  "fahrer",
  "chauffeur",
  "logistik",
  "reinigung",
  "koch",
  "küche",
  "kueche",
  "hauswirtschaft",
  "arzt",
  "medizin",
  "data",
  "hr",
  "human resources",
];

/** Keywords that uniquely identify THIS trade (elektro) */
const TRADE_IDENTITY_KEYWORDS = [
  "elektro",
  "elektriker",
  "elektroinstallateur",
  "montage-elektriker",
  "elektromonteur",
  "elektroniker",
  "automatiker",
  "automatikmonteur",
  "betriebselektriker",
  "schaltanlagen",
  "schaltschrank",
  "gebäudeautomation",
  "gebaeudeautomation",
  "photovoltaik",
  "solartechnik",
  "netzelektriker",
  "starkstrom",
  "schwachstrom",
  "sps",
  "msr",
  "mechatron",
  "bahntechnik",
  "freileitungs",
  "trafo",
  "emr",
  "elektrotechnik",
  "brandmelde",
];

/** Primary keywords from OTHER trades — reject if title matches these without any TRADE_IDENTITY match */
const OTHER_TRADE_KEYWORDS = [
  "sanitär",
  "sanitaer",
  "sanitärinstallateur",
  "sanitärmonteur",
  "heizung",
  "heizungsinstallateur",
  "heizungsmonteur",
  "heizungstechniker",
  "klima",
  "klimatechniker",
  "kälte",
  "kältetechniker",
  "kälteanlagenbauer",
  "lüftung",
  "lüftungsmonteur",
  "lüftungsanlagenbauer",
  "spengler",
  "bauspengler",
  "fassadenspengler",
  "dachdecker",
  "dachdeckerin",
  "zimmermann",
  "holzbau",
  "holzkonstruktion",
  "schreiner",
  "schreinerei",
  "tischler",
  "möbel",
  "möbelschreiner",
  "bodenleger",
  "parkettleger",
  "plattenleger",
  "fliesen",
  "fliesenleger",
  "estrich",
  "terrazzo",
  "gärtner",
  "gaertner",
  "garten",
  "landschaftsgärtner",
  "baumpflege",
  "gartenbau",
];

interface SourceBundle {
  scrapedJobs: JobListing[];
  scrapedAt: string | null;
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function parseIsoDateMs(value: string | undefined): number {
  if (!value) {
    return 0;
  }

  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function countKeywordHits(text: string, keywords: string[]): number {
  let hits = 0;
  for (const keyword of keywords) {
    if (text.includes(keyword)) {
      hits += 1;
    }
  }
  return hits;
}

function scoreScrapedJob(job: ScrapedJob): number {
  const title = normalizeText(job.title);
  const requirements = Array.isArray(job.requirements) ? job.requirements : [];
  const responsibilities = Array.isArray(job.responsibilities) ? job.responsibilities : [];
  const body = normalizeText(
    `${job.description} ${job.fullDescription} ${requirements.join(" ")} ${responsibilities.join(" ")}`
  );

  const titleTradeIdentityHits = countKeywordHits(title, TRADE_IDENTITY_KEYWORDS);
  const titleOtherTradeHits = countKeywordHits(title, OTHER_TRADE_KEYWORDS);
  const titleSignalHits = countKeywordHits(title, CORE_TITLE_KEYWORDS);
  const hardNegativeTitleHits = countKeywordHits(title, HARD_NEGATIVE_TITLE_KEYWORDS);
  const bodySignalHits = countKeywordHits(body, POSITIVE_KEYWORDS);
  const bodyNegativeHits = countKeywordHits(body, NEGATIVE_KEYWORDS);

  // Title mentions another trade but NOT this trade → reject
  if (titleOtherTradeHits > 0 && titleTradeIdentityHits === 0) {
    return -100;
  }

  if (hardNegativeTitleHits > 0 && titleSignalHits === 0) {
    return -100;
  }

  if (titleSignalHits === 0 && bodySignalHits < 3) {
    return -100;
  }

  if (titleSignalHits === 0 && bodyNegativeHits >= 3) {
    return -100;
  }

  let score = titleSignalHits * 10 + bodySignalHits * 2;
  score -= hardNegativeTitleHits * 8;
  score -= bodyNegativeHits * 4;

  if (title.includes("efz")) {
    score += 2;
  }

  if (titleSignalHits === 0) {
    score -= 4;
  }

  return score;
}

function dedupeSignature(job: Pick<ScrapedJob, "title" | "company" | "location">): string {
  return normalizeText(job.title) + "|" + normalizeText(job.company) + "|" + normalizeText(job.location);
}

function toPublicSalary(value: string): string | undefined {
  const cleaned = cleanJobText(value).trim();
  if (!cleaned || cleaned.length > 40 || !/\d/.test(cleaned)) {
    return undefined;
  }

  return /^[\d\s'’.,\-–—/%]*(?:CHF)?[\d\s'’.,\-–—/%]*$/i.test(cleaned)
    ? cleaned
    : undefined;
}

function toScrapedListing(job: ScrapedJob, relevanceScore: number): JobListing {
  const location = getPublicJobLocation(job.location);
  const titleCopy = buildPublicJobCopy({
    title: job.title,
    company: job.company,
    location,
    type: "",
    workload: "",
  });
  const verified = getVerifiedJobDetails(job, titleCopy.title);
  const publicCopy = buildPublicJobCopy({
    title: job.title, company: job.company, location,
    type: verified.type, workload: verified.workload,
  });
  const firstTask = verified.responsibilities[0];
  const description = verified.hasVerifiedDetails
    ? `${firstTask}${/[.!?]$/u.test(firstTask) ? "" : "."} Pensum: ${verified.workload}.${verified.type ? ` Anstellungsart: ${verified.type}.` : ""}`
    : `${publicCopy.description} Weitere Stellenangaben werden bei der Anfrage geklärt.`;

  return {
    id: String(job.id),
    title: publicCopy.title,
    location,
    type: verified.type || "Nicht angegeben",
    workload: verified.workload || "Nicht angegeben",
    description,
    responsibilities: verified.responsibilities,
    requirements: verified.requirements,
    benefits: [],
    hasVerifiedDetails: verified.hasVerifiedDetails,
    datePosted: job.datePosted,
    isNew: Boolean(job.isNew),
    isUrgent: Boolean(job.isUrgent),
    source: "scraped",
    salary: toPublicSalary(job.salary),
    isRemote: typeof job.isRemote === "boolean" ? job.isRemote : undefined,
    relevanceScore,
  };
}

let cachedCurated: JobListing[] | null = null;
let cachedCuratedSource: ScrapedJob[] | null = null;

async function buildCuratedScrapedListings(): Promise<JobListing[]> {
  const source = await loadScrapedJobs();
  if (cachedCurated && cachedCuratedSource === source) return cachedCurated;

  const deduped = new Map<string, JobListing>();

  for (const job of source) {
    const relevanceScore = scoreScrapedJob(job);
    if (relevanceScore < MIN_RELEVANCE_SCORE) {
      continue;
    }

    const signature = dedupeSignature(job);
    const listing = toScrapedListing(job, relevanceScore);
    if (!listing.description || !listing.description.trim()) {
      continue;
    }
    const existing = deduped.get(signature);

    if (!existing) {
      deduped.set(signature, listing);
      continue;
    }

    const existingScore = existing.relevanceScore ?? 0;
    const existingDate = parseIsoDateMs(existing.datePosted);
    const newDate = parseIsoDateMs(listing.datePosted);

    if (relevanceScore > existingScore || (relevanceScore === existingScore && newDate > existingDate)) {
      deduped.set(signature, listing);
    }
  }

  const result = [...deduped.values()];
  cachedCurated = result;
  cachedCuratedSource = source;
  return result;
}

export function isScrapedDataStale(scrapedAt: string | null): boolean {
  if (!scrapedAt) {
    return true;
  }

  const scrapedAtMs = Date.parse(scrapedAt);
  if (!Number.isFinite(scrapedAtMs)) {
    return true;
  }

  const maxAgeMs = SCRAPE_STALE_HOURS * 60 * 60 * 1000;
  return Date.now() - scrapedAtMs > maxAgeMs;
}

async function getSourceJobs(): Promise<SourceBundle> {
  const [meta, curatedScraped] = await Promise.all([
    getScrapedMeta(),
    buildCuratedScrapedListings(),
  ]);

  return {
    scrapedJobs: curatedScraped,
    scrapedAt: meta?.scrapedAt ?? null,
  };
}

export async function searchJobListings(params: JobSearchParams): Promise<JobSearchResult> {
  const sourceBundle = await getSourceJobs();
  return searchJobListingsInCatalogue(sourceBundle.scrapedJobs, params, sourceBundle.scrapedAt);
}

async function normalizeScrapedById(id: string): Promise<JobListing | null> {
  const scraped = await getScrapedJobById(id);
  if (!scraped) {
    return null;
  }

  const relevanceScore = scoreScrapedJob(scraped);
  if (relevanceScore < MIN_RELEVANCE_SCORE) {
    return null;
  }

  return toScrapedListing(scraped, relevanceScore);
}

export async function getJobListingById(input: {
  id: string;
}): Promise<JobListing | null> {
  if (!input.id.startsWith("scraped-")) {
    return null;
  }

  return normalizeScrapedById(input.id);
}

function overlapScore(a: string, b: string): number {
  const wordsA = new Set(
    normalizeText(a)
      .split(" ")
      .filter((word) => word.length >= 4)
  );
  const wordsB = new Set(
    normalizeText(b)
      .split(" ")
      .filter((word) => word.length >= 4)
  );

  let overlap = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) {
      overlap += 1;
    }
  }

  return overlap;
}

export async function getSimilarJobListings(current: JobListing, limit = 4): Promise<JobListing[]> {
  const candidates = await buildCuratedScrapedListings();

  return candidates
    .filter((candidate) => candidate.id !== current.id)
    .map((candidate) => {
      let score = overlapScore(current.title, candidate.title);

      if (normalizeText(candidate.location) === normalizeText(current.location)) {
        score += 3;
      }
      if (normalizeText(candidate.type) === normalizeText(current.type)) {
        score += 1;
      }

      return { candidate, score };
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return parseIsoDateMs(b.candidate.datePosted) - parseIsoDateMs(a.candidate.datePosted);
    })
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

export async function getIndexableJobListings(): Promise<JobListing[]> {
  const curatedScraped = await buildCuratedScrapedListings();
  return sortJobs(curatedScraped, "newest");
}
