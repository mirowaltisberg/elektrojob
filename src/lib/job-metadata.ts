import type { JobListing } from "./job-types";

// An editorial budget for a concise summary, not a Google character limit.
const DESCRIPTION_LENGTH = 200;

type PublicJobMetadata = Pick<
  JobListing,
  "title" | "location" | "workload" | "type" | "responsibilities" | "requirements"
>;

function normalizeText(value: string): string {
  return value.replace(/\\(?=in\b)/gu, "/").replace(/\s+/gu, " ").trim();
}

function knownValue(value: string): string {
  const normalized = normalizeText(value);
  return /^(?:nicht angegeben|unbekannt)$/iu.test(normalized) ? "" : normalized;
}

function sentence(value: string): string {
  return /[.!?…]$/u.test(value) ? value : `${value}.`;
}

function shorten(value: string, limit: number): string {
  if (value.length <= limit) return value;
  const words = value.slice(0, limit - 1);
  const boundary = words.lastIndexOf(" ");
  return `${words.slice(0, boundary > 0 ? boundary : words.length).replace(/[\s,;:.–—-]+$/u, "")}…`;
}

/** Summarise only fields that have already passed the public job boundary. */
export function buildJobMetaDescription(job: PublicJobMetadata): string {
  const facts = [knownValue(job.workload), knownValue(job.type)].filter(Boolean);
  const heading = sentence(`${normalizeText(job.title)} in ${normalizeText(job.location)}`);
  const summary = facts.length > 0 ? `${heading} ${sentence(facts.join(", "))}` : heading;
  const remaining = DESCRIPTION_LENGTH - summary.length - 1;
  const tasks = job.responsibilities.map(normalizeText).filter(Boolean);
  const requirements = job.requirements.map(normalizeText).filter((item) =>
    item && !/^Diese Qualifikationen sind uns wichtig[.!:]?$/iu.test(item));
  const details = [
    ...tasks.map(sentence),
    ...requirements.map((item) => sentence(`Anforderung: ${item}`)),
  ];

  // A complete source item preserves qualifications and context. If no item
  // fits, keep the known facts instead of publishing a cut-off claim.
  const detail = details.find((item) => item.length <= remaining);
  if (!detail) return shorten(summary, DESCRIPTION_LENGTH);
  return `${summary} ${detail}`;
}
