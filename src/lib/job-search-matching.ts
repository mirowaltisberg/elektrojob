import type { JobListing } from "./job-types";
import { parseSwissJobAddress } from "./job-schema";
import { getCantonSearchCode } from "./canton-search";

const IGNORED_QUERY_TOKENS = new Set(["efz", "job", "jobs", "stelle", "stellen", "spezialist"]);

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("de-CH").trim();
}

function tokenize(value: string): string[] {
  return normalize(value).split(/[^\p{L}\p{N}]+/u).filter((token) => token.length >= 2);
}

export function matchesJobQuery(job: Pick<JobListing, "title" | "description">, query: string): boolean {
  const queryTokens = tokenize(query).filter((token) => !IGNORED_QUERY_TOKENS.has(token));
  if (queryTokens.length === 0) return true;

  const publicTokens = tokenize(`${job.title} ${job.description}`);
  return queryTokens.every((queryToken) => {
    if (queryToken === "elektriker") return true;

    return publicTokens.some((publicToken) =>
      publicToken === queryToken ||
      (queryToken.length >= 5 && publicToken.startsWith(queryToken)) ||
      // Allow plural/feminine endings without treating the shared "Elektro"
      // prefix as a match for every distinct electrical profession.
      (publicToken.length >= 8 && queryToken.startsWith(publicToken) && queryToken.length - publicToken.length <= 3)
    );
  });
}

export function matchesJobLocation(job: Pick<JobListing, "location">, location: string): boolean {
  const query = normalize(location);
  if (!query) return true;

  const requestedAddress = parseSwissJobAddress(location);
  const jobAddress = parseSwissJobAddress(job.location);
  const cantonCode = getCantonSearchCode(location);
  if (cantonCode) {
    return cantonCode === jobAddress.addressRegion;
  }
  if (normalize(job.location).includes(query)) return true;

  // Dropdown suggestions include canton abbreviations, while sources commonly
  // store the full canton name ("Zürich, ZH" versus "Zürich, Zürich").
  if (location.includes(",") && requestedAddress.addressLocality && jobAddress.addressLocality) {
    return normalize(requestedAddress.addressLocality) === normalize(jobAddress.addressLocality) &&
      (!requestedAddress.addressRegion || requestedAddress.addressRegion === jobAddress.addressRegion);
  }

  return false;
}
