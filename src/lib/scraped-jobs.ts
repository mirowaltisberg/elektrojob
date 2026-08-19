import fs from "fs";
import path from "path";
import { createAdminClient } from "@/lib/supabase";

const TRADE = "elektro";
const RUNTIME_MAX_AGE_DAYS = 45;

export interface ScrapedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  workload: string;
  description: string;
  fullDescription: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  datePosted: string;
  isNew: boolean;
  isUrgent: boolean;
  salary: string;
  jobUrl: string;
  source: string;
  isRemote: boolean;
  companyUrl: string;
}

/** Listing-friendly version without fullDescription */
export type ScrapedJobListing = Omit<ScrapedJob, "fullDescription">;

// --- TTL cache ---
const CACHE_TTL_MS = 300_000;
let cachedJobs: ScrapedJob[] | null = null;
let cachedAt = 0;

interface DbRow {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  workload: string;
  description: string;
  full_description?: string;
  responsibilities?: string[];
  requirements?: string[];
  benefits?: string[];
  date_posted: string | null;
  is_new: boolean;
  is_urgent: boolean;
  salary: string;
  job_url?: string;
  source?: string;
  is_remote: boolean;
  company_url?: string;
}

const PUBLICATION_SELECT = [
  "id",
  "title",
  "company",
  "location",
  "type",
  "workload",
  "description",
  "date_posted",
  "is_new",
  "is_urgent",
  "salary",
  "is_remote",
].join(",");

function mapRowToScrapedJob(row: DbRow): ScrapedJob {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    location: row.location,
    type: row.type,
    workload: row.workload,
    description: row.description,
    fullDescription: row.full_description ?? "",
    responsibilities: row.responsibilities ?? [],
    requirements: row.requirements ?? [],
    benefits: row.benefits ?? [],
    datePosted: row.date_posted ?? "",
    isNew: row.is_new,
    isUrgent: row.is_urgent,
    salary: row.salary,
    jobUrl: row.job_url ?? "",
    source: row.source ?? "",
    isRemote: row.is_remote,
    companyUrl: row.company_url ?? "",
  };
}

function runtimeCutoffDate(): string {
  return new Date(Date.now() - RUNTIME_MAX_AGE_DAYS * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}

function isRuntimeFresh(job: ScrapedJob): boolean {
  const postedAt = Date.parse(job.datePosted);
  return Number.isFinite(postedAt) && postedAt >= Date.parse(runtimeCutoffDate());
}

// --- JSON fallback (resilience if Supabase is unreachable) ---
function loadFromJson(): ScrapedJob[] {
  try {
    const filePath = path.join(process.cwd(), "src", "data", "scraped-jobs.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw) as { jobs: ScrapedJob[] };
    return (data.jobs ?? []).filter(isRuntimeFresh);
  } catch {
    return [];
  }
}

const SUPABASE_PAGE_SIZE = 1000;

/**
 * Load all scraped jobs from Supabase (with TTL cache).
 * Paginates through all results since Supabase limits to 1000 rows per request.
 * Falls back to local JSON if Supabase is unreachable.
 */
export async function loadScrapedJobs(): Promise<ScrapedJob[]> {
  if (cachedJobs && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedJobs;
  }

  try {
    const supabase = createAdminClient();
    const allRows: DbRow[] = [];
    let from = 0;

    while (true) {
      const { data, error } = await supabase
        .from("jobs")
        .select(PUBLICATION_SELECT)
        .eq("trade", TRADE)
        .gte("date_posted", runtimeCutoffDate())
        .order("date_posted", { ascending: false })
        .range(from, from + SUPABASE_PAGE_SIZE - 1);

      if (error || !data || data.length === 0) {
        break;
      }

      allRows.push(...(data as unknown as DbRow[]));

      if (data.length < SUPABASE_PAGE_SIZE) {
        break;
      }

      from += SUPABASE_PAGE_SIZE;
    }

    if (allRows.length > 0) {
      cachedJobs = allRows.map(mapRowToScrapedJob);
      cachedAt = Date.now();
      return cachedJobs;
    }
  } catch {
    // fall through to JSON fallback
  }

  return loadFromJson();
}

/** Get a single job by ID with full description.
 *  Checks the in-memory cache first to avoid a DB round-trip
 *  when loadScrapedJobs has already been called recently.
 */
export async function getScrapedJobById(id: string): Promise<ScrapedJob | null> {
  // Fast path: check in-memory cache first (avoids Supabase round-trip)
  if (cachedJobs && Date.now() - cachedAt < CACHE_TTL_MS) {
    const cached = cachedJobs.find((j) => j.id === id);
    if (cached) {
      return cached;
    }
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("jobs")
      .select(PUBLICATION_SELECT)
      .eq("id", id)
      .eq("trade", TRADE)
      .gte("date_posted", runtimeCutoffDate())
      .single();

    if (!error && data) {
      return mapRowToScrapedJob(data as unknown as DbRow);
    }
  } catch {
    // fall through to JSON fallback
  }

  // Fallback: search local JSON
  const jobs = loadFromJson();
  return jobs.find((j) => j.id === id) ?? null;
}

let cachedMeta: { scrapedAt: string; totalJobs: number } | null = null;
let cachedMetaAt = 0;
const META_CACHE_TTL_MS = 300_000;

export async function getScrapedMeta(): Promise<{ scrapedAt: string; totalJobs: number } | null> {
  if (cachedMeta && Date.now() - cachedMetaAt < META_CACHE_TTL_MS) return cachedMeta;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("scrape_metadata")
      .select("scraped_at,total_jobs")
      .eq("id", 1)
      .single();

    if (!error && data) {
      cachedMeta = {
        scrapedAt: data.scraped_at as string,
        totalJobs: data.total_jobs as number,
      };
      cachedMetaAt = Date.now();
      return cachedMeta;
    }
  } catch {
    // fall through
  }

  return null;
}
