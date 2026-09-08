import { matchesJobLocation, matchesJobQuery } from "./job-search-matching";
import { getCantonSearchCode } from "./canton-search";
import { calculateDistanceKm, resolveLocationCoordinate, type Coordinate } from "./location-distance";
import type { JobFacets, JobListing, JobSearchParams, JobSort, RemoteFilter } from "./job-types";

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 200;
const MIN_RADIUS_KM = 5;
const MAX_RADIUS_KM = 300;
const COUNTRY_WIDE_LOCATIONS = new Set([
  "schweiz",
  "ganze schweiz",
  "schweizweit",
  "switzerland",
  "whole switzerland",
  "ch",
]);
const coordinateCache = new Map<string, Coordinate | null>();

interface NormalizedParams {
  q: string;
  loc: string;
  radiusKm: number | null;
  limit: number;
  offset: number;
  type: string;
  workload: string;
  remote: RemoteFilter;
  postedWithinDays: number | null;
  sort: JobSort;
}

export interface JobSearchResult {
  jobs: JobListing[];
  total: number;
  offset: number;
  limit: number;
  facets: JobFacets;
  scrapedAt: string | null;
  exactTotal: number;
  alternativeMessage: string | null;
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

function normalizeWorkload(value: string): string {
  return value.replace(/\s+/g, "").trim();
}

function isValueInFilter(fieldValue: string, selectedValue: string): boolean {
  const normalizedField = normalizeText(fieldValue);
  const normalizedSelected = normalizeText(selectedValue);

  if (!normalizedSelected || normalizedSelected === "all") {
    return true;
  }

  return normalizedField.includes(normalizedSelected);
}

function getCachedCoordinate(location: string): Coordinate | null {
  const normalizedLocation = normalizeText(location);
  if (!normalizedLocation) {
    return null;
  }

  if (coordinateCache.has(normalizedLocation)) {
    return coordinateCache.get(normalizedLocation) ?? null;
  }

  const resolved = resolveLocationCoordinate(location);
  coordinateCache.set(normalizedLocation, resolved);
  return resolved;
}

function matchesLocationWithRadius(
  job: JobListing,
  location: string,
  radiusKm: number | null,
  originCoordinate: Coordinate | null
): boolean {
  if (!location) {
    return true;
  }

  if (getCantonSearchCode(location) || !radiusKm || !originCoordinate) {
    return matchesJobLocation(job, location);
  }

  const jobCoordinate = getCachedCoordinate(job.location);
  if (!jobCoordinate) {
    return matchesJobLocation(job, location);
  }

  return calculateDistanceKm(originCoordinate, jobCoordinate) <= radiusKm;
}

function matchesRemote(job: JobListing, remote: RemoteFilter): boolean {
  if (remote === "any") {
    return true;
  }

  if (remote === "true") {
    return job.isRemote === true;
  }

  return job.isRemote === false;
}

function matchesPostedWithinDays(job: JobListing, postedWithinDays: number | null): boolean {
  if (!postedWithinDays) {
    return true;
  }

  const dateMs = parseIsoDateMs(job.datePosted);
  if (!dateMs) {
    return false;
  }

  const thresholdMs = Date.now() - postedWithinDays * 24 * 60 * 60 * 1000;
  return dateMs >= thresholdMs;
}

export function sortJobs(jobs: JobListing[], sort: JobSort): JobListing[] {
  return [...jobs].sort((a, b) => {
    if (sort === "oldest") {
      return parseIsoDateMs(a.datePosted) - parseIsoDateMs(b.datePosted);
    }

    if (sort === "relevance") {
      const detailDelta = Number(b.hasVerifiedDetails === true) - Number(a.hasVerifiedDetails === true);
      if (detailDelta !== 0) return detailDelta;
      const relevanceDelta = (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0);
      if (relevanceDelta !== 0) {
        return relevanceDelta;
      }
    }

    return parseIsoDateMs(b.datePosted) - parseIsoDateMs(a.datePosted) || a.id.localeCompare(b.id);
  });
}

function buildFacets(jobs: JobListing[]): JobFacets {
  const typeCounts = new Map<string, number>();
  const workloadCounts = new Map<string, number>();
  const remote = {
    true: 0,
    false: 0,
    unknown: 0,
  };

  for (const job of jobs) {
    const type = job.type.trim();
    const workload = normalizeWorkload(job.workload);

    if (type) {
      typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);
    }
    if (workload) {
      workloadCounts.set(workload, (workloadCounts.get(workload) ?? 0) + 1);
    }

    if (job.isRemote === true) {
      remote.true += 1;
    } else if (job.isRemote === false) {
      remote.false += 1;
    } else {
      remote.unknown += 1;
    }
  }

  const mapToSortedArray = (map: Map<string, number>) =>
    [...map.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value, "de-CH"));

  return {
    types: mapToSortedArray(typeCounts),
    workloads: mapToSortedArray(workloadCounts),
    remote,
  };
}

function normalizeLocationFilter(location: string): string {
  const trimmed = location.trim();
  if (!trimmed) {
    return "";
  }

  if (COUNTRY_WIDE_LOCATIONS.has(normalizeText(trimmed))) {
    return "";
  }

  return trimmed;
}

function normalizeSearchParams(params: JobSearchParams): NormalizedParams {
  const limit = Math.min(
    Math.max(Number.isFinite(params.limit) ? Math.floor(Number(params.limit)) : DEFAULT_LIMIT, 1),
    MAX_LIMIT
  );
  const offset = Math.max(Number.isFinite(params.offset) ? Math.floor(Number(params.offset)) : 0, 0);
  const radiusRaw = Number(params.radiusKm);
  const radiusKm =
    Number.isFinite(radiusRaw) && radiusRaw > 0
      ? Math.min(Math.max(Math.round(radiusRaw), MIN_RADIUS_KM), MAX_RADIUS_KM)
      : null;
  const postedWithinDaysRaw = Number(params.postedWithinDays);
  const postedWithinDays =
    Number.isFinite(postedWithinDaysRaw) && postedWithinDaysRaw > 0 ? postedWithinDaysRaw : null;

  const sort: JobSort = ["newest", "oldest", "relevance"].includes(params.sort ?? "")
    ? (params.sort as JobSort)
    : "newest";

  const remote: RemoteFilter = ["any", "true", "false"].includes(params.remote ?? "")
    ? (params.remote as RemoteFilter)
    : "any";

  return {
    q: (params.q ?? "").trim(),
    loc: normalizeLocationFilter(params.loc ?? ""),
    radiusKm,
    limit,
    offset,
    type: (params.type ?? "").trim(),
    workload: (params.workload ?? "").trim(),
    remote,
    postedWithinDays,
    sort,
  };
}

function applySecondaryFilters(
  jobs: JobListing[],
  normalized: NormalizedParams
): JobListing[] {
  return jobs.filter(
    (job) =>
      isValueInFilter(job.type, normalized.type) &&
      isValueInFilter(normalizeWorkload(job.workload), normalizeWorkload(normalized.workload)) &&
      matchesRemote(job, normalized.remote) &&
      matchesPostedWithinDays(job, normalized.postedWithinDays)
  );
}

/** Filters a published catalogue without loading data; shared by API and server pages. */
export function searchJobListingsInCatalogue(
  catalogue: JobListing[],
  params: JobSearchParams,
  scrapedAt: string | null = null
): JobSearchResult {
  const normalized = normalizeSearchParams(params);
  const originCoordinate =
    normalized.loc ? getCachedCoordinate(normalized.loc) : null;
  const candidates = params.homepageOnly
    ? catalogue.filter((job) => job.hasVerifiedDetails === true)
    : catalogue;
  const matchesPlace = (job: JobListing) =>
    matchesLocationWithRadius(job, normalized.loc, normalized.radiusKm, originCoordinate);

  const scopedJobs = candidates.filter(
    (job) =>
      matchesJobQuery(job, normalized.q) &&
      matchesPlace(job)
  );
  const filteredJobs = applySecondaryFilters(scopedJobs, normalized);
  let sortedJobs = sortJobs(filteredJobs, normalized.sort);
  let alternativeMessage: string | null = null;
  let facetJobs = scopedJobs;

  if (filteredJobs.length === 0 && params.allowAlternatives && candidates.length > 0) {
    const sameProfession = normalized.q
      ? candidates.filter((job) => matchesJobQuery(job, normalized.q))
      : [];
    const sameLocation = normalized.loc ? candidates.filter(matchesPlace) : [];
    let alternatives: JobListing[];
    if (scopedJobs.length > 0) {
      alternatives = scopedJobs;
      alternativeMessage = "Diese Stellen passen zu Beruf und Arbeitsort. Einzelne weitere Filter weichen ab oder die Angaben sind noch nicht bekannt.";
    } else if (sameProfession.length > 0) {
      alternatives = sameProfession;
      alternativeMessage = "Weitere Stellen für deinen Beruf, auch ausserhalb des gewählten Orts oder Umkreises. Weitere Filter können abweichen.";
    } else if (sameLocation.length > 0) {
      alternatives = sameLocation;
      alternativeMessage = "Weitere Elektrojobs am gewählten Arbeitsort. Dein Suchbegriff und weitere Filter passen hier nicht vollständig.";
    } else {
      alternatives = candidates;
      alternativeMessage = "Weitere aktuelle Elektrojobs in der Schweiz. Diese Vorschläge passen nicht zu allen gewählten Filtern.";
    }
    facetJobs = alternatives;

    // Preserve profession/location first, then prefer nearby jobs and matching
    // secondary preferences. Unknown information never counts as a match.
    const preferenceScore = (job: JobListing) =>
      Number(Boolean(normalized.type) && normalized.type !== "all" && isValueInFilter(job.type, normalized.type)) +
      Number(Boolean(normalized.workload) && normalized.workload !== "all" && isValueInFilter(normalizeWorkload(job.workload), normalizeWorkload(normalized.workload))) +
      Number(normalized.remote !== "any" && matchesRemote(job, normalized.remote)) +
      Number(Boolean(normalized.postedWithinDays) && matchesPostedWithinDays(job, normalized.postedWithinDays));
    const distance = (job: JobListing) => {
      const coordinate = originCoordinate ? getCachedCoordinate(job.location) : null;
      return originCoordinate && coordinate ? calculateDistanceKm(originCoordinate, coordinate) : Infinity;
    };
    sortedJobs = sortJobs(alternatives, normalized.sort);
    if (normalized.sort === "relevance") {
      const ranked = sortedJobs.map((job) => ({ job, distance: distance(job), score: preferenceScore(job) }));
      ranked.sort((a, b) => (a.distance === b.distance ? 0 : a.distance < b.distance ? -1 : 1) || b.score - a.score);
      sortedJobs = ranked.map(({ job }) => job);
    }
  }

  const facets = buildFacets(facetJobs);
  const total = sortedJobs.length;
  const paged = sortedJobs.slice(normalized.offset, normalized.offset + normalized.limit);

  return {
    jobs: paged,
    total,
    offset: normalized.offset,
    limit: normalized.limit,
    facets,
    scrapedAt,
    exactTotal: filteredJobs.length,
    alternativeMessage,
  };
}
