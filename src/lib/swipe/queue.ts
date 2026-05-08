import { createAdminClient } from "@/lib/supabase";
import { searchJobListings } from "@/lib/job-catalog";
import type { JobListing } from "@/lib/job-types";

export type SwipeRadiusKm = 25 | 50 | 100;

export interface SwipeJobCard {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  workload: string;
  salary?: string;
  isRemote?: boolean;
  isUrgent?: boolean;
  isNew?: boolean;
  description: string;
  responsibilities: string[];
  benefits: string[];
}

export async function loadSwipedJobIds(sessionId: string): Promise<Set<string>> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("swipe_decisions")
    .select("job_id")
    .eq("session_id", sessionId);
  return new Set((data ?? []).map((row) => row.job_id as string));
}

function compactDescription(input: string, sentences = 2): string {
  if (!input) return "";
  const trimmed = input.replace(/\s+/g, " ").trim();
  const parts = trimmed.split(/(?<=[.!?])\s+/);
  return parts.slice(0, sentences).join(" ");
}

function toCard(job: JobListing): SwipeJobCard {
  return {
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    type: job.type,
    workload: job.workload,
    salary: job.salary,
    isRemote: job.isRemote,
    isUrgent: job.isUrgent,
    isNew: job.isNew,
    description: compactDescription(job.description, 3),
    responsibilities: (job.responsibilities ?? []).slice(0, 3),
    benefits: (job.benefits ?? []).slice(0, 3),
  };
}

export async function loadSwipeQueue(params: {
  sessionId: string;
  plz: string;
  radiusKm: SwipeRadiusKm;
  limit?: number;
}): Promise<{ cards: SwipeJobCard[]; total: number }> {
  const { sessionId, plz, radiusKm } = params;
  const limit = params.limit ?? 20;

  const swiped = await loadSwipedJobIds(sessionId);

  const result = await searchJobListings({
    loc: plz,
    radiusKm,
    limit: limit + swiped.size,
    sort: "newest",
  });

  const cards: SwipeJobCard[] = [];
  for (const job of result.jobs) {
    if (swiped.has(job.id)) continue;
    cards.push(toCard(job));
    if (cards.length >= limit) break;
  }

  return { cards, total: result.total };
}
