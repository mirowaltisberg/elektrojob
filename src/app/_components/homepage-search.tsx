"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpWideNarrow,
  Briefcase,
  Building2,
  CalendarDays,
  Clock,
  FilterX,
  LocateFixed,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Wallet,
  WifiOff,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchDropdown } from "@/components/search-dropdown";
import { HeaderDropdownMenu } from "@/components/header-dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { generateFakeJobs, normalizeSearchInput } from "@/lib/job-generator";
import type { JobFacets, JobListing, JobSort, RemoteFilter } from "@/lib/job-types";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { StaggeredList } from "@/components/staggered-list";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FEATURE_FLAGS } from "@/lib/feature-flags";
import { trackEvent } from "@/lib/analytics";
import { TOP_LANDING_PAGES, getLandingPath } from "@/lib/landing-pages";
import { calculateDistanceKm, resolveLocationCoordinate, type Coordinate } from "@/lib/location-distance";
import { estimateSalary, formatSalaryRange } from "@/lib/salary-estimates";

const JOB_SUGGESTIONS = [
  "Elektroinstallateur",
  "Montage-Elektriker",
  "Servicetechniker",
  "Projektleiter Elektro",
  "Automatiker",
  "Elektroplaner",
  "Elektromonteur",
  "Gebäudetechnik",
  "Photovoltaik",
  "Schaltanlagenbauer",
  "Bauleiter Elektro",
  "Betriebselektriker",
];

const LOCATION_SUGGESTIONS = [
  "Zürich, ZH",
  "Bern, BE",
  "Basel, BS",
  "Luzern, LU",
  "St. Gallen, SG",
  "Winterthur, ZH",
  "Aarau, AG",
  "Biel, BE",
  "Thun, BE",
  "Chur, GR",
  "Schaffhausen, SH",
  "Solothurn, SO",
  "Zug, ZG",
  "Fribourg, FR",
  "Lausanne, VD",
  "Lugano, TI",
  "Ganze Schweiz",
];

const EMPLOYER_MENU_ITEMS = [
  { label: "Arbeitgeber-Login", href: "#" },
  { label: "Preise & Pakete", href: "#" },
  { label: "Kandidatenzugang", href: "#" },
  { label: "Support kontaktieren", href: "#" },
];

const PAGE_SIZE = 30;
const INITIAL_MOBILE_PAGE_SIZE = 5;
const MOBILE_LOAD_MORE_SIZE = 15;
const FALLBACK_GENERATED_COUNT = 150;
const SCRAPE_STALE_HOURS = 72;
const DEFAULT_RADIUS_KM = "25";
const COUNTRY_WIDE_LOCATIONS = new Set([
  "schweiz",
  "ganze schweiz",
  "schweizweit",
  "switzerland",
  "whole switzerland",
  "ch",
]);
const RADIUS_OPTIONS = [
  { value: "5", label: "5 km" },
  { value: "10", label: "10 km" },
  { value: "15", label: "15 km" },
  { value: "25", label: "25 km" },
  { value: "35", label: "35 km" },
  { value: "50", label: "50 km" },
  { value: "80", label: "80 km" },
  { value: "120", label: "120 km" },
  { value: "all", label: "Beliebig" },
] as const;
const DEFAULT_FACETS: JobFacets = {
  types: [],
  workloads: [],
  remote: {
    true: 0,
    false: 0,
    unknown: 0,
  },
};

interface JobsApiResponse {
  jobs: JobListing[];
  total: number;
  offset: number;
  limit: number;
  facets: JobFacets;
  scrapedAt: string | null;
  fallbackUsed: boolean;
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function normalizeLocationFilter(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (COUNTRY_WIDE_LOCATIONS.has(normalize(trimmed))) {
    return "";
  }

  return trimmed;
}

function parseRadiusKm(value: string): number | null {
  if (!value || value === "all") {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function getCoordinate(cache: Map<string, Coordinate | null>, value: string): Coordinate | null {
  const key = normalize(value);
  if (!key) {
    return null;
  }

  if (cache.has(key)) {
    return cache.get(key) ?? null;
  }

  const coordinate = resolveLocationCoordinate(value);
  cache.set(key, coordinate);
  return coordinate;
}

function matchesLocationWithRadius(
  jobLocation: string,
  activeLocation: string,
  radiusKm: string,
  coordinateCache: Map<string, Coordinate | null>
): boolean {
  if (!activeLocation) {
    return true;
  }

  const radius = parseRadiusKm(radiusKm);
  if (!radius) {
    return matchesTextFilter(jobLocation, activeLocation);
  }

  const originCoordinate = getCoordinate(coordinateCache, activeLocation);
  if (!originCoordinate) {
    return matchesTextFilter(jobLocation, activeLocation);
  }

  const jobCoordinate = getCoordinate(coordinateCache, jobLocation);
  if (!jobCoordinate) {
    return matchesTextFilter(jobLocation, activeLocation);
  }

  return calculateDistanceKm(originCoordinate, jobCoordinate) <= radius;
}

function matchesTextFilter(value: string, filter: string): boolean {
  const normalizedFilter = normalize(filter);
  if (!normalizedFilter || normalizedFilter === "all") {
    return true;
  }

  return normalize(value).includes(normalizedFilter);
}

function matchesRemoteFilter(job: JobListing, remote: RemoteFilter): boolean {
  if (remote === "any") {
    return true;
  }
  if (remote === "true") {
    return job.isRemote === true;
  }
  return job.isRemote === false;
}

function matchesPostedWithin(job: JobListing, postedWithinDays: string): boolean {
  if (!postedWithinDays || postedWithinDays === "all") {
    return true;
  }

  const days = Number(postedWithinDays);
  if (!Number.isFinite(days) || days <= 0) {
    return true;
  }

  const postedDate = Date.parse(job.datePosted);
  if (!Number.isFinite(postedDate)) {
    return false;
  }

  const threshold = Date.now() - days * 24 * 60 * 60 * 1000;
  return postedDate >= threshold;
}

function sortJobs(jobs: JobListing[], sort: JobSort): JobListing[] {
  return [...jobs].sort((a, b) => {
    if (sort === "company") {
      return a.company.localeCompare(b.company, "de-CH");
    }

    if (sort === "oldest") {
      return Date.parse(a.datePosted) - Date.parse(b.datePosted);
    }

    if (sort === "relevance") {
      const relevanceDiff = (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0);
      if (relevanceDiff !== 0) {
        return relevanceDiff;
      }
    }

    return Date.parse(b.datePosted) - Date.parse(a.datePosted);
  });
}

function buildFacets(jobs: JobListing[]): JobFacets {
  const typeMap = new Map<string, number>();
  const workloadMap = new Map<string, number>();
  const remote = {
    true: 0,
    false: 0,
    unknown: 0,
  };

  for (const job of jobs) {
    const type = job.type.trim();
    const workload = job.workload.trim();

    if (type) {
      typeMap.set(type, (typeMap.get(type) ?? 0) + 1);
    }
    if (workload) {
      workloadMap.set(workload, (workloadMap.get(workload) ?? 0) + 1);
    }

    if (job.isRemote === true) {
      remote.true += 1;
    } else if (job.isRemote === false) {
      remote.false += 1;
    } else {
      remote.unknown += 1;
    }
  }

  const toFacetArray = (map: Map<string, number>) =>
    [...map.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value, "de-CH"));

  return {
    types: toFacetArray(typeMap),
    workloads: toFacetArray(workloadMap),
    remote,
  };
}

function isScrapedStale(scrapedAt: string | null): boolean {
  if (!scrapedAt) {
    return true;
  }

  const parsed = Date.parse(scrapedAt);
  if (!Number.isFinite(parsed)) {
    return true;
  }

  return Date.now() - parsed > SCRAPE_STALE_HOURS * 60 * 60 * 1000;
}

function isGeneratedJob(job: JobListing): boolean {
  return job.source === "generated";
}

function isScrapedJob(job: JobListing): boolean {
  return job.source === "scraped";
}

export function HomepageSearch() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [activeLocation, setActiveLocation] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [facets, setFacets] = useState<JobFacets>(DEFAULT_FACETS);
  const [scrapedAt, setScrapedAt] = useState<string | null>(null);
  const [fallbackUsed, setFallbackUsed] = useState(false);
  const [searchKey, setSearchKey] = useState(0);

  const [typeFilter, setTypeFilter] = useState("all");
  const [workloadFilter, setWorkloadFilter] = useState("all");
  const [remoteFilter, setRemoteFilter] = useState<RemoteFilter>("any");
  const [postedWithinDays, setPostedWithinDays] = useState("30");
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);
  const [sortBy, setSortBy] = useState<JobSort>("newest");

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);
  const hasTrackedFilterChange = useRef(false);
  const coordinateCacheRef = useRef<Map<string, Coordinate | null>>(new Map());
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);
  const isMobileRef = useRef(false);
  const [isMobile, setIsMobile] = useState(false);

  const [plzSuggestions, setPlzSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const normalizedInput = location.trim();
    if (!normalizedInput) {
      setPlzSuggestions([]);
      return;
    }
    const controller = new AbortController();
    fetch(`/api/postal-codes?q=${encodeURIComponent(normalizedInput)}&limit=14`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data: string[]) => setPlzSuggestions(data))
      .catch(() => {});
    return () => controller.abort();
  }, [location]);

  const locationDropdownSuggestions = useMemo(() => {
    const normalizedInput = location.trim();

    if (!normalizedInput) {
      return LOCATION_SUGGESTIONS;
    }

    const cityMatches = LOCATION_SUGGESTIONS.filter((item) =>
      item.toLowerCase().includes(normalizedInput.toLowerCase())
    );
    const isPlzSearch = /^\d{1,4}$/.test(normalizedInput);

    if (isPlzSearch) {
      return plzSuggestions;
    }

    return [...new Set([...plzSuggestions, ...cityMatches])].slice(0, 14);
  }, [location, plzSuggestions]);

  const scrollToResults = useCallback(() => {
    if (resultsRef.current) {
      const top = resultsRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, []);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => {
      const mobile = mq.matches;
      isMobileRef.current = mobile;
      setIsMobile(mobile);
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const runSearch = useCallback(
    async (append: boolean, offsetOverride = 0) => {
      const nextOffset = append ? offsetOverride : 0;
      const scopedLocation = normalizeLocationFilter(activeLocation);
      const mobile = isMobileRef.current;
      const limit = append
        ? (mobile ? MOBILE_LOAD_MORE_SIZE : PAGE_SIZE)
        : (mobile ? INITIAL_MOBILE_PAGE_SIZE : PAGE_SIZE);

      setErrorMessage(null);
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        if (FEATURE_FLAGS.apiSearch) {
          const params = new URLSearchParams({
            q: activeQuery,
            loc: scopedLocation,
            limit: String(limit),
            offset: String(nextOffset),
            sort: sortBy,
            remote: remoteFilter,
          });

          if (typeFilter !== "all") {
            params.set("type", typeFilter);
          }
          if (workloadFilter !== "all") {
            params.set("workload", workloadFilter);
          }
          if (postedWithinDays !== "all") {
            params.set("postedWithinDays", postedWithinDays);
          }
          if (scopedLocation && radiusKm !== "all") {
            params.set("radiusKm", radiusKm);
          }

          const response = await fetch(`/api/jobs?${params.toString()}`);
          if (!response.ok) {
            throw new Error("Die Jobs konnten nicht geladen werden.");
          }

          const data = (await response.json()) as JobsApiResponse;
          setJobs((prev) => (append ? [...prev, ...data.jobs] : data.jobs));
          setTotalJobs(data.total);
          setFacets(data.facets ?? DEFAULT_FACETS);
          setScrapedAt(data.scrapedAt ?? null);
          setFallbackUsed(Boolean(data.fallbackUsed));
        } else {
          const context = normalizeSearchInput(activeQuery, scopedLocation);
          const fallbackJobs = generateFakeJobs({
            query: context.query,
            location: context.location,
            count: FALLBACK_GENERATED_COUNT,
          }).map((job) => ({ ...job, source: "generated", relevanceScore: 1 }) as JobListing);

          const queryScoped = fallbackJobs.filter(
            (job) =>
              matchesTextFilter(job.title, activeQuery) &&
              matchesLocationWithRadius(
                job.location,
                scopedLocation,
                radiusKm,
                coordinateCacheRef.current
              )
          );
          const clientFacets = buildFacets(queryScoped);

          const filtered = queryScoped.filter(
            (job) =>
              matchesTextFilter(job.type, typeFilter) &&
              matchesTextFilter(job.workload, workloadFilter) &&
              matchesRemoteFilter(job, remoteFilter) &&
              matchesPostedWithin(job, postedWithinDays)
          );

          const sorted = sortJobs(filtered, sortBy);
          const paged = sorted.slice(nextOffset, nextOffset + limit);

          setJobs((prev) => (append ? [...prev, ...paged] : paged));
          setTotalJobs(sorted.length);
          setFacets(clientFacets);
          setScrapedAt(null);
          setFallbackUsed(true);
        }

        if (!append) {
          setSearchKey((prev) => prev + 1);
        }
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unbekannter Fehler");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [
      activeLocation,
      activeQuery,
      postedWithinDays,
      radiusKm,
      remoteFilter,
      sortBy,
      typeFilter,
      workloadFilter,
    ]
  );

  useEffect(() => {
    void runSearch(false);
  }, [runSearch]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlQuery = params.get("q") ?? "";
    const urlLocation = params.get("loc") ?? "";
    const urlRadiusKm = params.get("radiusKm") ?? "";

    if (!urlQuery && !urlLocation && !urlRadiusKm) {
      return;
    }

    setQuery(urlQuery);
    setLocation(urlLocation);
    setActiveQuery(urlQuery);
    setActiveLocation(normalizeLocationFilter(urlLocation));
    if (urlRadiusKm === "all" || RADIUS_OPTIONS.some((option) => option.value === urlRadiusKm)) {
      setRadiusKm(urlRadiusKm);
    }
    setHasSearched(true);
  }, []);

  useEffect(() => {
    if (!hasTrackedFilterChange.current) {
      hasTrackedFilterChange.current = true;
      return;
    }

    const scopedLocation = normalizeLocationFilter(activeLocation);
    trackEvent("filter_usage", {
      type: typeFilter,
      workload: workloadFilter,
      remote: remoteFilter,
      posted_within_days: postedWithinDays,
      radius_km: scopedLocation ? radiusKm : "all",
      sort: sortBy,
    });
  }, [activeLocation, postedWithinDays, radiusKm, remoteFilter, sortBy, typeFilter, workloadFilter]);

  const handleSearch = () => {
    const normalizedQuery = query.trim();
    const normalizedLocation = normalizeLocationFilter(location);

    setHasSearched(true);
    setActiveQuery(normalizedQuery);
    setActiveLocation(normalizedLocation);
    trackEvent("search_submit", {
      query: normalizedQuery,
      location: normalizedLocation,
      radius_km: normalizedLocation ? radiusKm : "all",
    });
    window.setTimeout(scrollToResults, 80);
  };

  const handleLoadMore = useCallback(() => {
    void runSearch(true, jobs.length);
  }, [runSearch, jobs.length]);

  const visibleJobs = jobs.length;
  const canLoadMore = visibleJobs < totalJobs;
  const staleData = !fallbackUsed && isScrapedStale(scrapedAt);
  const normalizedLocationDraft = normalizeLocationFilter(location);
  const normalizedActiveLocation = normalizeLocationFilter(activeLocation);
  const hasLocationDraft = Boolean(normalizedLocationDraft);
  const hasLocationInput = hasLocationDraft;
  const hasActiveLocation = Boolean(normalizedActiveLocation);

  useEffect(() => {
    if (!isMobile || !canLoadMore || isLoadingMore) return;
    const sentinel = loadMoreSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          handleLoadMore();
        }
      },
      { rootMargin: "200px", threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isMobile, canLoadMore, isLoadingMore, handleLoadMore]);

  const resetFilters = () => {
    setTypeFilter("all");
    setWorkloadFilter("all");
    setRemoteFilter("any");
    setPostedWithinDays("30");
    setRadiusKm(DEFAULT_RADIUS_KM);
    setSortBy("newest");
    trackEvent("filter_reset");
  };

  const resetToHome = useCallback(() => {
    setQuery("");
    setLocation("");
    setActiveQuery("");
    setActiveLocation("");
    setHasSearched(false);
    setTypeFilter("all");
    setWorkloadFilter("all");
    setRemoteFilter("any");
    setPostedWithinDays("30");
    setRadiusKm(DEFAULT_RADIUS_KM);
    setSortBy("newest");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const filterSelectClass =
    "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b header-blur sticky top-0 z-30 animate-header">
        <div className="container mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center shrink-0" onClick={resetToHome}>
            <Image src="/logo.svg" alt="elektrojob.ch — Elektrojobs in der Schweiz" width={200} height={32} className="h-7 sm:h-8 w-auto" />
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2 shrink-0">
            <HeaderDropdownMenu
              label="Für Arbeitgeber"
              items={EMPLOYER_MENU_ITEMS}
              className="hidden sm:block"
            />
            <Button
              size="sm"
              className="text-xs sm:text-sm px-2.5 sm:px-4 h-8 sm:h-10 btn-interactive shadow-md shadow-primary/20"
            >
              <span className="sm:hidden">Inserieren</span>
              <span className="hidden sm:inline">Stelle ausschreiben</span>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section
          className={`relative z-20 bg-primary/5 border-b overflow-visible ${
            hasSearched
              ? "pt-8 sm:pt-10 md:pt-12 pb-4 sm:pb-6 md:pb-8"
              : "pt-10 sm:pt-14 md:pt-20 pb-5 sm:pb-7 md:pb-9"
          }`}
        >
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <h1 className="animate-hero-title text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-4 sm:mb-6 tracking-tight leading-tight">
              Finde deinen nächsten <span className="text-primary">Elektrojob</span>
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>in der Schweiz
            </h1>
            <p className="animate-hero-subtitle text-base sm:text-lg text-slate-600 mb-8 sm:mb-10 max-w-2xl mx-auto px-1">
              Live-Stellen mit smarter Filterung für Elektro-Fachkräfte in der ganzen Schweiz.
            </p>

            <form
              className="animate-hero-search max-w-4xl mx-auto relative z-30"
              onSubmit={(event) => {
                event.preventDefault();
                handleSearch();
              }}
            >
              <div className="search-container bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg border flex flex-col md:flex-row gap-3">
                <SearchDropdown
                  value={query}
                  onChange={setQuery}
                  suggestions={JOB_SUGGESTIONS}
                  placeholder="Welchen Job suchst du?"
                  icon={<Search className="h-5 w-5 text-slate-400" />}
                />
                <div className="hidden md:block w-px bg-slate-200 my-2"></div>
                <SearchDropdown
                  value={location}
                  onChange={setLocation}
                  suggestions={locationDropdownSuggestions}
                  placeholder="Wo? (Ort, Kanton oder PLZ)"
                  icon={<MapPin className="h-5 w-5 text-slate-400" />}
                />
                <div className={`flex w-full flex-col md:w-auto md:flex-row md:items-center transition-[gap] duration-300 ${hasLocationDraft ? "gap-2 sm:gap-3" : "gap-0"}`}>
                  <div
                    aria-hidden={!hasLocationDraft}
                    className={`relative overflow-hidden transition-all duration-500 ease-out ${
                      hasLocationDraft
                        ? "max-h-12 opacity-100 translate-y-0 md:max-w-[220px] md:translate-x-0 md:border-l md:border-slate-200 md:pl-3"
                        : "max-h-0 opacity-0 -translate-y-2 pointer-events-none md:max-w-0 md:translate-x-3 md:pl-0 md:border-l-0"
                    }`}
                  >
                    <label htmlFor="radius-km" className="sr-only">
                      Maximaler Umkreis
                    </label>
                    <LocateFixed className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <select
                      id="radius-km"
                      className="h-12 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 md:min-w-[200px] md:w-auto md:border-none md:bg-transparent md:shadow-none md:focus:ring-0"
                      value={radiusKm}
                      onChange={(event) => setRadiusKm(event.target.value)}
                      disabled={!hasLocationDraft}
                    >
                      {RADIUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.value === "all" ? "Umkreis: Beliebig" : `Umkreis: ${option.label}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isLoading}
                    className="h-12 px-6 sm:px-8 text-base font-semibold rounded-xl btn-interactive shadow-md shadow-primary/25 w-full md:w-auto transition-all duration-300"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Lädt...
                      </>
                    ) : (
                      "Jobs suchen"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </section>

        <section
          ref={resultsRef}
          className={`relative z-10 bg-slate-50 pb-24 sm:pb-16 ${
            hasSearched ? "pt-4 sm:pt-6" : "pt-6 sm:pt-8"
          }`}
        >
          <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
            <AnimateOnScroll className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {hasSearched ? "Suchergebnisse" : "Aktuelle Elektrojobs"}
                </h2>
                {hasActiveLocation && (
                  <p className="text-xs text-slate-500 mt-1">
                    Suchradius: {radiusKm === "all" ? "Beliebig" : `${radiusKm} km`}
                  </p>
                )}
                {scrapedAt && !fallbackUsed && (
                  <p className="text-xs text-slate-500 mt-1">
                    Datenstand: {new Date(scrapedAt).toLocaleString("de-CH")}
                  </p>
                )}
              </div>
              <span className="text-sm text-slate-500">
                <span key={searchKey} className="count-animate">
                  {visibleJobs} von {totalJobs}
                </span>{" "}
                Stellen
              </span>
            </AnimateOnScroll>

            <AnimateOnScroll className="hidden md:grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
              <select
                className={filterSelectClass}
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
              >
                <option value="all">Vertragsart</option>
                {facets.types.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.value} ({item.count})
                  </option>
                ))}
              </select>

              <select
                className={filterSelectClass}
                value={workloadFilter}
                onChange={(event) => setWorkloadFilter(event.target.value)}
              >
                <option value="all">Pensum</option>
                {facets.workloads.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.value} ({item.count})
                  </option>
                ))}
              </select>

              <select
                className={filterSelectClass}
                value={remoteFilter}
                onChange={(event) => setRemoteFilter(event.target.value as RemoteFilter)}
              >
                <option value="any">Remote</option>
                <option value="true">Nur Remote</option>
                <option value="false">Nur vor Ort</option>
              </select>

              <select
                className={filterSelectClass}
                value={postedWithinDays}
                onChange={(event) => setPostedWithinDays(event.target.value)}
              >
                <option value="7">Letzte 7 Tage</option>
                <option value="14">Letzte 14 Tage</option>
                <option value="30">Letzte 30 Tage</option>
                <option value="all">Alle Zeiträume</option>
              </select>

              <select
                className={filterSelectClass}
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as JobSort)}
              >
                <option value="newest">Neueste zuerst</option>
                <option value="relevance">Relevanz</option>
                <option value="company">Firma A-Z</option>
                <option value="oldest">Älteste zuerst</option>
              </select>
            </AnimateOnScroll>

            {fallbackUsed && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <p className="font-semibold flex items-center gap-2">
                  <WifiOff className="h-4 w-4" />
                  Live-Daten nicht verfügbar
                </p>
                <p className="mt-1">Aktuell zeigen wir hochwertige Demo-Stellen, bis neue Scraping-Daten bereit sind.</p>
              </div>
            )}

            {!fallbackUsed && staleData && (
              <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                <p className="font-semibold">Datenstand: {scrapedAt ? new Date(scrapedAt).toLocaleString("de-CH") : "unbekannt"}</p>
                <p className="mt-1">Die Live-Stellen wurden länger nicht aktualisiert. Wir empfehlen eine neue Suche in einigen Stunden.</p>
              </div>
            )}

            {errorMessage && (
              <Card className="mb-4 border-red-200">
                <CardContent className="p-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-red-700">Jobs konnten nicht geladen werden</p>
                    <p className="text-sm text-slate-600 mt-1">{errorMessage}</p>
                  </div>
                  <Button variant="outline" onClick={() => void runSearch(false)}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Erneut laden
                  </Button>
                </CardContent>
              </Card>
            )}

            {isLoading && !isLoadingMore && !errorMessage && (
              <div className="space-y-3 sm:space-y-4 results-enter">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="skeleton-card h-32 sm:h-36 border border-slate-100"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            )}

            {!isLoading && !errorMessage && jobs.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="font-semibold text-slate-900">Keine passenden Jobs gefunden</p>
                  <p className="text-sm text-slate-500 mt-1">Passe deine Suchbegriffe oder Filter an.</p>
                  <Button onClick={resetFilters} variant="outline" className="mt-4">
                    <FilterX className="h-4 w-4 mr-1" />
                    Filter zurücksetzen
                  </Button>
                </CardContent>
              </Card>
            )}

            {!isLoading && !errorMessage && jobs.length > 0 && (
              <>
                <StaggeredList className="space-y-3 sm:space-y-4" baseDelayMs={60} staggerMs={80} triggerKey={searchKey}>
                  {jobs.map((job, index) => {
                    const href = isGeneratedJob(job)
                      ? {
                          pathname: `/jobs/${job.id}`,
                          query: {
                            q: job.searchContext?.query ?? activeQuery,
                            loc: job.searchContext?.location ?? activeLocation,
                          },
                        }
                      : `/jobs/${job.id}`;

                    return (
                      <Link
                        key={`${job.source}-${job.id}-${index}`}
                        href={href}
                        className="block group"
                        onClick={() =>
                          trackEvent("job_open", {
                            job_id: job.id,
                            source: job.source,
                            position: index + 1,
                          })
                        }
                      >
                        <Card className="job-card hover:border-primary/50 active:border-primary/40">
                          <CardContent className="p-4 sm:p-6">
                            {/* Title row */}
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <h3 className="text-base sm:text-xl font-bold text-slate-900 group-hover:text-primary transition-colors duration-200 break-words">
                                {job.title}
                              </h3>
                              <Badge
                                variant="outline"
                                className={isScrapedJob(job) ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-600"}
                              >
                                <Building2 className="h-3 w-3" />
                                {isScrapedJob(job) ? "Live" : "Demo"}
                              </Badge>
                              {job.isNew && (
                                <Badge className="bg-accent text-slate-900 hover:bg-accent/90 badge-pulse-new">Neu</Badge>
                              )}
                              {job.isUrgent && (
                                <Badge variant="destructive" className="badge-pulse-urgent">Dringend</Badge>
                              )}
                              {job.isRemote === true && (
                                <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700">
                                  Remote
                                </Badge>
                              )}
                            </div>

                            {/* Company */}
                            <div className="flex items-center gap-1 text-sm font-medium text-slate-700 mb-3">
                              <Briefcase className="h-4 w-4 text-primary" />
                              {job.company}
                            </div>

                            {/* Structured info grid */}
                            {(() => {
                              const salaryDisplay = job.salary || (() => {
                                const est = estimateSalary(job.title);
                                return est ? `~${formatSalaryRange(est)}` : null;
                              })();
                              return (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-100 rounded-lg border border-slate-200 overflow-hidden mb-3">
                                  <div className="bg-white px-3 py-2.5 flex flex-col gap-0.5">
                                    <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 truncate">
                                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                                      {job.location}
                                    </span>
                                    <span className="text-[11px] text-slate-400 uppercase tracking-wide">Ort</span>
                                  </div>
                                  <div className="bg-white px-3 py-2.5 flex flex-col gap-0.5">
                                    <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 truncate">
                                      <Wallet className="h-3.5 w-3.5 text-primary shrink-0" />
                                      {salaryDisplay ?? "–"}
                                    </span>
                                    <span className="text-[11px] text-slate-400 uppercase tracking-wide">Lohn, CHF/Jahr</span>
                                  </div>
                                  <div className="bg-white px-3 py-2.5 flex flex-col gap-0.5">
                                    <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 truncate">
                                      <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                                      {job.workload}
                                    </span>
                                    <span className="text-[11px] text-slate-400 uppercase tracking-wide">Pensum</span>
                                  </div>
                                  <div className="bg-white px-3 py-2.5 flex flex-col gap-0.5">
                                    <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 truncate">
                                      <CalendarDays className="h-3.5 w-3.5 text-primary shrink-0" />
                                      {job.type}
                                    </span>
                                    <span className="text-[11px] text-slate-400 uppercase tracking-wide">Anstellungsart</span>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Description + actions */}
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                              <p className="text-slate-600 text-sm line-clamp-2 flex-1 min-w-0">{job.description}</p>
                              <div className="flex items-center gap-3 shrink-0">
                                <Badge
                                  variant="secondary"
                                  className="bg-primary/10 text-primary hover:bg-primary/20 font-bold transition-colors duration-200"
                                >
                                  <Zap className="h-3 w-3 mr-1 fill-current" />
                                  Bewerben
                                </Badge>
                                <span className="text-xs text-slate-400 flex items-center gap-1 whitespace-nowrap">
                                  <CalendarDays className="h-3 w-3" />
                                  {new Date(job.datePosted).toLocaleDateString("de-CH")}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </StaggeredList>

                {canLoadMore && isMobile && (
                  <div className="mt-6 flex flex-col items-center gap-2">
                    <div
                      ref={loadMoreSentinelRef}
                      className="h-4 w-full"
                      aria-hidden="true"
                    />
                    {isLoadingMore && (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Lädt weitere Jobs...
                      </div>
                    )}
                  </div>
                )}

                {canLoadMore && (
                  <AnimateOnScroll className="mt-10 text-center hidden md:block" delay={120}>
                    <Button
                      onClick={handleLoadMore}
                      variant="outline"
                      size="lg"
                      className="rounded-xl btn-interactive"
                      disabled={isLoadingMore}
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Lädt...
                        </>
                      ) : (
                        "Weitere Jobs laden"
                      )}
                    </Button>
                  </AnimateOnScroll>
                )}
              </>
            )}

            <AnimateOnScroll className="mt-10 sm:mt-12">
              <h3 className="text-lg font-bold text-slate-900 mb-3">Beliebte Suchseiten</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {TOP_LANDING_PAGES.slice(0, 12).map((item) => (
                  <Link
                    key={`${item.role}-${item.canton}`}
                    href={getLandingPath(item)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:border-primary/40 hover:text-primary transition-colors"
                  >
                    {item.role} in {item.canton}
                  </Link>
                ))}
              </div>
            </AnimateOnScroll>
          </div>
        </section>
      </main>

      {FEATURE_FLAGS.mobileFilters && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-white/95 backdrop-blur-sm border-t shadow-[0_-4px_12px_-2px_rgb(0,0,0,0.08)] z-20">
          <div className="grid grid-cols-2 gap-2">
            <Dialog open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-11">
                  <SlidersHorizontal className="h-4 w-4 mr-1" />
                  Filter
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[calc(100%-1rem)] max-w-none max-h-[85dvh] overflow-y-auto rounded-2xl p-4 top-auto bottom-2 translate-y-0">
                <DialogHeader>
                  <DialogTitle>Filter</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  {hasLocationInput && (
                    <select
                      className={filterSelectClass}
                      value={radiusKm}
                      onChange={(event) => setRadiusKm(event.target.value)}
                    >
                      {RADIUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.value === "all" ? "Umkreis: Beliebig" : `Umkreis: ${option.label}`}
                        </option>
                      ))}
                    </select>
                  )}
                  <select
                    className={filterSelectClass}
                    value={typeFilter}
                    onChange={(event) => setTypeFilter(event.target.value)}
                  >
                    <option value="all">Vertragsart</option>
                    {facets.types.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.value} ({item.count})
                      </option>
                    ))}
                  </select>
                  <select
                    className={filterSelectClass}
                    value={workloadFilter}
                    onChange={(event) => setWorkloadFilter(event.target.value)}
                  >
                    <option value="all">Pensum</option>
                    {facets.workloads.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.value} ({item.count})
                      </option>
                    ))}
                  </select>
                  <select
                    className={filterSelectClass}
                    value={remoteFilter}
                    onChange={(event) => setRemoteFilter(event.target.value as RemoteFilter)}
                  >
                    <option value="any">Remote</option>
                    <option value="true">Nur Remote</option>
                    <option value="false">Nur vor Ort</option>
                  </select>
                  <select
                    className={filterSelectClass}
                    value={postedWithinDays}
                    onChange={(event) => setPostedWithinDays(event.target.value)}
                  >
                    <option value="7">Letzte 7 Tage</option>
                    <option value="14">Letzte 14 Tage</option>
                    <option value="30">Letzte 30 Tage</option>
                    <option value="all">Alle Zeiträume</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Button variant="outline" onClick={resetFilters}>
                    Zurücksetzen
                  </Button>
                  <Button onClick={() => setIsFilterSheetOpen(false)}>Fertig</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isSortSheetOpen} onOpenChange={setIsSortSheetOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-11">
                  <ArrowUpWideNarrow className="h-4 w-4 mr-1" />
                  Sortieren
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[calc(100%-1rem)] max-w-none rounded-2xl p-4 top-auto bottom-2 translate-y-0">
                <DialogHeader>
                  <DialogTitle>Sortieren nach</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 mt-1">
                  {[
                    { value: "newest", label: "Neueste zuerst" },
                    { value: "relevance", label: "Relevanz" },
                    { value: "company", label: "Firma A-Z" },
                    { value: "oldest", label: "Älteste zuerst" },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors ${
                        sortBy === item.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                      onClick={() => {
                        setSortBy(item.value as JobSort);
                        setIsSortSheetOpen(false);
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}

    </div>
  );
}
