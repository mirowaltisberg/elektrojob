export type JobSource = "scraped";
export type JobSort = "newest" | "oldest" | "relevance";
export type RemoteFilter = "any" | "true" | "false";

/**
 * Public job shape. Employer identities, source URLs, raw descriptions, and
 * contact details must never cross this boundary.
 */
export interface JobListing {
  id: string;
  title: string;
  location: string;
  type: string;
  workload: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  datePosted: string;
  isNew: boolean;
  isUrgent: boolean;
  source: "scraped";
  salary?: string;
  isRemote?: boolean;
  relevanceScore?: number;
}

export interface JobFacetCount {
  value: string;
  count: number;
}

export interface JobFacets {
  types: JobFacetCount[];
  workloads: JobFacetCount[];
  remote: {
    true: number;
    false: number;
    unknown: number;
  };
}

export interface JobSearchParams {
  q?: string;
  loc?: string;
  radiusKm?: number;
  limit?: number;
  offset?: number;
  type?: string;
  workload?: string;
  remote?: RemoteFilter;
  postedWithinDays?: number;
  sort?: JobSort;
}
