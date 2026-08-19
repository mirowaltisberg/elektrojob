"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHaptic } from "@/hooks/use-haptic";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  CalendarDays,
  Clock,
  FilterX,
  LocateFixed,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Wallet,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchDropdown } from "@/components/search-dropdown";
import { HeaderDropdownMenu } from "@/components/header-dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { JobFacets, JobListing, JobSort, RemoteFilter } from "@/lib/job-types";
import { FEATURE_FLAGS } from "@/lib/feature-flags";
import { trackEvent } from "@/lib/analytics";
import { estimateSalary, formatSalaryRange } from "@/lib/salary-estimates";

const MobileFilterBar = dynamic(() => import("./mobile-filter-bar"), {
  ssr: false,
});

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
  "Grossraum Zürich",
  "Zentralschweiz",
  "Nordwestschweiz",
  "Ostschweiz",
  "Mittelland",
  "Westschweiz / Romandie",
  "Tessin",
  "Wallis",
  "Ganze Schweiz",
];

const EMPLOYER_MENU_ITEMS = [
  { label: "Arbeitgeber-Login", href: "/arbeitgeber/login" },
  { label: "Preise & Pakete", href: "/arbeitgeber/preise" },
  { label: "Kandidatenzugang", href: "/arbeitgeber/kandidaten" },
  { label: "Support kontaktieren", href: "/kontakt" },
];

const PAGE_SIZE = 12;
const SCRAPE_STALE_HOURS = 72;
const DEFAULT_RADIUS_KM = "25";
const REGION_RADIUS_KM: Record<string, string> = {
  "grossraum zürich": "50",
  "grossraum zurich": "50",
  zentralschweiz: "50",
  nordwestschweiz: "50",
  ostschweiz: "80",
  mittelland: "50",
  "westschweiz / romandie": "80",
  westschweiz: "80",
  romandie: "80",
  tessin: "50",
  wallis: "50",
};
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

function getRegionRadius(location: string): string | null {
  return REGION_RADIUS_KM[normalize(location)] ?? null;
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

interface InitialJobData {
  jobs: JobListing[];
  total: number;
  offset: number;
  limit: number;
  facets: JobFacets;
  scrapedAt: string | null;
}

interface HomepageSearchProps {
  initialData?: InitialJobData;
}

export function HomepageSearch({ initialData }: HomepageSearchProps) {
  const { trigger } = useHaptic();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [activeLocation, setActiveLocation] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const [jobs, setJobs] = useState<JobListing[]>(initialData?.jobs ?? []);
  const [totalJobs, setTotalJobs] = useState(initialData?.total ?? 0);
  const [facets, setFacets] = useState<JobFacets>(initialData?.facets ?? DEFAULT_FACETS);
  const [scrapedAt, setScrapedAt] = useState<string | null>(initialData?.scrapedAt ?? null);
  const [searchKey, setSearchKey] = useState(0);
  const [searchRevision, setSearchRevision] = useState(0);

  const [typeFilter, setTypeFilter] = useState("all");
  const [workloadFilter, setWorkloadFilter] = useState("all");
  const [remoteFilter, setRemoteFilter] = useState<RemoteFilter>("any");
  const [postedWithinDays, setPostedWithinDays] = useState("30");
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);
  const [sortBy, setSortBy] = useState<JobSort>("newest");

  const [isLoading, setIsLoading] = useState(!initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);
  const hasTrackedFilterChange = useRef(false);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);
  const hasVisibleJobsRef = useRef(Boolean(initialData?.jobs.length));
  const searchAbortRef = useRef<AbortController | null>(null);
  const searchRequestRef = useRef(0);
  const loadMoreInFlightRef = useRef(false);
  const [isMobile, setIsMobile] = useState(false);

  const [plzSuggestions, setPlzSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const normalizedInput = location.trim();
    if (normalizedInput.length < 2) {
      setPlzSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/postal-codes?q=${encodeURIComponent(normalizedInput)}&limit=14`, {
        signal: controller.signal,
      })
        .then((r) => r.json())
        .then((data: string[]) => setPlzSuggestions(data))
        .catch(() => { });
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [location]);

  // Auto-set radius when a region is selected
  useEffect(() => {
    const regionRadius = getRegionRadius(location);
    if (regionRadius !== null) {
      setRadiusKm(String(regionRadius));
    }
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

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const runSearch = useCallback(
    async (append: boolean, offsetOverride = 0) => {
      if (append && loadMoreInFlightRef.current) {
        return;
      }

      const nextOffset = append ? offsetOverride : 0;
      const scopedLocation = normalizeLocationFilter(activeLocation);
      const requestId = searchRequestRef.current + 1;
      searchRequestRef.current = requestId;
      searchAbortRef.current?.abort();
      const controller = new AbortController();
      searchAbortRef.current = controller;

      setErrorMessage(null);
      if (append) {
        loadMoreInFlightRef.current = true;
        setIsLoadingMore(true);
      } else if (hasVisibleJobsRef.current) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const params = new URLSearchParams({
          q: activeQuery,
          loc: scopedLocation,
          limit: String(PAGE_SIZE),
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

        const response = await fetch("/api/jobs?" + params.toString(), {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Die Jobs konnten nicht geladen werden.");
        }

        const data = (await response.json()) as JobsApiResponse;
        if (requestId !== searchRequestRef.current) {
          return;
        }

        setJobs((previousJobs) => {
          if (!append) {
            hasVisibleJobsRef.current = data.jobs.length > 0;
            return data.jobs;
          }

          const existingIds = new Set(previousJobs.map((job) => job.id));
          const nextJobs = [
            ...previousJobs,
            ...data.jobs.filter((job) => !existingIds.has(job.id)),
          ];
          hasVisibleJobsRef.current = nextJobs.length > 0;
          return nextJobs;
        });
        setTotalJobs(data.total);
        setFacets(data.facets ?? DEFAULT_FACETS);
        setScrapedAt(data.scrapedAt ?? null);

        if (!append) {
          setSearchKey((previous) => previous + 1);
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setErrorMessage(error instanceof Error ? error.message : "Unbekannter Fehler");
        }
      } finally {
        if (requestId === searchRequestRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
          setIsLoadingMore(false);
          loadMoreInFlightRef.current = false;
        }
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

  const urlParamsApplied = useRef(false);
  const skipInitialSearch = useRef(Boolean(initialData?.jobs.length));

  useEffect(() => {
    if (!urlParamsApplied.current) {
      urlParamsApplied.current = true;
      const params = new URLSearchParams(window.location.search);
      const urlQuery = params.get("q") ?? "";
      const urlLocation = params.get("loc") ?? "";
      const urlRadiusKm = params.get("radiusKm") ?? "";

      if (urlQuery || urlLocation || urlRadiusKm) {
        skipInitialSearch.current = false;
        setQuery(urlQuery);
        setLocation(urlLocation);
        setActiveQuery(urlQuery);
        setActiveLocation(normalizeLocationFilter(urlLocation));
        if (urlRadiusKm === "all" || RADIUS_OPTIONS.some((option) => option.value === urlRadiusKm)) {
          setRadiusKm(urlRadiusKm);
        }
        setHasSearched(true);
        return;
      }
    }

    if (skipInitialSearch.current) {
      skipInitialSearch.current = false;
      return;
    }

    void runSearch(false);
  }, [runSearch, searchRevision]);

  useEffect(() => () => searchAbortRef.current?.abort(), []);

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
    setSearchRevision((revision) => revision + 1);
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

  const salaryMap = useMemo(() => {
    const map = new Map<string, string | null>();
    for (const job of jobs) {
      const display = job.salary || (() => {
        const est = estimateSalary(job.title);
        return est ? `~${formatSalaryRange(est)}` : null;
      })();
      map.set(`${job.source}-${job.id}`, display || null);
    }
    return map;
  }, [jobs]);

  const staleData = isScrapedStale(scrapedAt);
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
    <div className="min-h-screen flex flex-col overflow-x-clip">
      <header className="border-b header-blur sticky top-0 z-30">
        <div className="container mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center shrink-0" onClick={resetToHome}>
            <Image src="/logo.svg" alt="elektrojob.ch — Elektrojobs in der Schweiz" width={142} height={29} className="h-7 sm:h-8 w-auto" priority />
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2 shrink-0">
            <HeaderDropdownMenu
              label="Für Arbeitgeber"
              items={EMPLOYER_MENU_ITEMS}
              className="hidden sm:block"
            />
            <Button
              size="sm"
              asChild
              className="text-xs sm:text-sm px-2.5 sm:px-4 h-8 sm:h-10 btn-interactive shadow-md shadow-primary/20"
            >
              <Link href="/arbeitgeber/preise">
                <span className="sm:hidden">Inserieren</span>
                <span className="hidden sm:inline">Stelle ausschreiben</span>
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section
          className={`relative z-20 bg-primary/5 border-b overflow-visible ${hasSearched
            ? "pt-8 sm:pt-10 md:pt-12 pb-4 sm:pb-6 md:pb-8"
            : "pt-10 sm:pt-14 md:pt-20 pb-5 sm:pb-7 md:pb-9"
            }`}
        >
          <div className="container mx-auto px-4 sm:px-6 text-left sm:text-center">
            <h1 className="text-[clamp(2rem,8vw,4rem)] font-black text-slate-900 mb-3 sm:mb-5 tracking-[-0.04em] leading-[1.02] break-words">
              <span className="text-amber-700">Elektriker Jobs</span>
              <span className="block text-[0.72em] font-extrabold text-slate-700 mt-1.5 sm:mt-3">in der ganzen Schweiz</span>
            </h1>
            <p className="text-sm sm:text-lg text-slate-600 mb-6 sm:mb-8 max-w-2xl sm:mx-auto">
              Reale Stellen für Elektroinstallateure, Montage-Elektriker, Automatiker und Elektroplaner. Schnell filtern nach Beruf, Ort und Pensum.
            </p>

            <form
              className="max-w-4xl mx-auto relative z-30"
              onSubmit={(event) => {
                event.preventDefault();
                handleSearch();
              }}
            >
              <div className="search-container bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-md border flex flex-col lg:flex-row gap-3 min-w-0">
                <SearchDropdown
                  value={query}
                  onChange={setQuery}
                  suggestions={JOB_SUGGESTIONS}
                  placeholder="Welchen Job suchst du?"
                  icon={<Search className="h-5 w-5 text-slate-400" />}
                />
                <div className="hidden lg:block w-px bg-slate-200 my-2"></div>
                <SearchDropdown
                  value={location}
                  onChange={setLocation}
                  suggestions={locationDropdownSuggestions}
                  placeholder="Wo? (Ort, Kanton oder PLZ)"
                  icon={<MapPin className="h-5 w-5 text-slate-400" />}
                />
                <div className={`flex w-full min-w-0 flex-col lg:w-auto lg:flex-row lg:items-center ${hasLocationDraft ? "gap-2 sm:gap-3" : "gap-0"}`}>
                  <div
                    aria-hidden={!hasLocationDraft}
                    className={`relative overflow-hidden transition-[max-height,opacity] duration-150 ${hasLocationDraft
                      ? "max-h-12 opacity-100 lg:max-w-[220px] lg:border-l lg:border-slate-200 lg:pl-3"
                      : "max-h-0 opacity-0 pointer-events-none lg:max-w-0 lg:pl-0 lg:border-l-0"
                      }`}
                  >
                    <label htmlFor="radius-km" className="sr-only">
                      Maximaler Umkreis
                    </label>
                    <LocateFixed className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <select
                      id="radius-km"
                      className="h-12 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 lg:min-w-[190px] lg:w-auto lg:border-none lg:bg-transparent lg:shadow-none lg:focus:ring-0"
                      value={radiusKm}
                      onChange={(event) => { trigger("selection"); setRadiusKm(event.target.value); }}
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
                    disabled={isLoading || isRefreshing}
                    className="h-12 px-6 sm:px-8 text-base font-semibold rounded-xl btn-interactive shadow-md shadow-primary/25 w-full lg:w-auto"
                  >
                    {isLoading || isRefreshing ? (
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
          className={`relative z-10 bg-slate-50 pb-24 sm:pb-16 ${hasSearched ? "pt-4 sm:pt-6" : "pt-6 sm:pt-8"
            }`}
        >
          <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {hasSearched ? "Suchergebnisse" : "Aktuelle Elektrojobs"}
                </h2>
                {hasActiveLocation && (
                  <p className="text-xs text-slate-500 mt-1">
                    Suchradius: {radiusKm === "all" ? "Beliebig" : `${radiusKm} km`}
                  </p>
                )}
                {scrapedAt && (
                  <p className="text-xs text-slate-500 mt-1">
                    Datenstand: {new Date(scrapedAt).toLocaleString("de-CH")}
                  </p>
                )}
              </div>
              {totalJobs > 0 && (
                <span className="text-sm text-slate-500">
                  <span key={searchKey} className="count-animate">
                    {visibleJobs} von {totalJobs}
                  </span>{" "}
                  Stellen
                </span>
              )}
            </div>

            <div className="hidden md:grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
              <div>
                <label htmlFor="filter-type" className="sr-only">Vertragsart</label>
                <select
                  id="filter-type"
                  className={filterSelectClass}
                  value={typeFilter}
                  onChange={(event) => { trigger("selection"); setTypeFilter(event.target.value); }}
                >
                  <option value="all">Vertragsart</option>
                  {facets.types.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.value} ({item.count})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="filter-workload" className="sr-only">Pensum</label>
                <select
                  id="filter-workload"
                  className={filterSelectClass}
                  value={workloadFilter}
                  onChange={(event) => { trigger("selection"); setWorkloadFilter(event.target.value); }}
                >
                  <option value="all">Pensum</option>
                  {facets.workloads.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.value} ({item.count})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="filter-remote" className="sr-only">Remote-Arbeit</label>
                <select
                  id="filter-remote"
                  className={filterSelectClass}
                  value={remoteFilter}
                  onChange={(event) => { trigger("selection"); setRemoteFilter(event.target.value as RemoteFilter); }}
                >
                  <option value="any">Remote</option>
                  <option value="true">Nur Remote</option>
                  <option value="false">Nur vor Ort</option>
                </select>
              </div>

              <div>
                <label htmlFor="filter-posted" className="sr-only">Zeitraum</label>
                <select
                  id="filter-posted"
                  className={filterSelectClass}
                  value={postedWithinDays}
                  onChange={(event) => { trigger("selection"); setPostedWithinDays(event.target.value); }}
                >
                  <option value="7">Letzte 7 Tage</option>
                  <option value="14">Letzte 14 Tage</option>
                  <option value="30">Letzte 30 Tage</option>
                  <option value="all">Alle Zeiträume</option>
                </select>
              </div>

              <div>
                <label htmlFor="filter-sort" className="sr-only">Sortierung</label>
                <select
                  id="filter-sort"
                  className={filterSelectClass}
                  value={sortBy}
                  onChange={(event) => { trigger("selection"); setSortBy(event.target.value as JobSort); }}
                >
                  <option value="newest">Neueste zuerst</option>
                  <option value="relevance">Relevanz</option>
                  <option value="oldest">Älteste zuerst</option>
                </select>
              </div>
            </div>

            {!isLoading && staleData && (
              <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                <p className="font-semibold">Datenstand: {scrapedAt ? new Date(scrapedAt).toLocaleString("de-CH") : "unbekannt"}</p>
                <p className="mt-1">Die Stellen werden gerade aktualisiert. Bis dahin bleiben die zuletzt geprüften realen Inserate sichtbar.</p>
              </div>
            )}

            {isRefreshing && (
              <div className="mb-3 flex items-center gap-2 text-sm text-slate-500" role="status" aria-live="polite">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Ergebnisse werden aktualisiert
              </div>
            )}

            {errorMessage && (
              <Card className="mb-4 border-red-200 py-0 gap-0">
                <CardContent className="p-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-red-700">Jobs konnten nicht geladen werden</p>
                    <p className="text-sm text-slate-600 mt-1">{errorMessage}</p>
                  </div>
                  <Button variant="outline" onClick={() => setSearchRevision((revision) => revision + 1)}>
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
                    className={`skeleton-card h-32 sm:h-36 border border-slate-100 skeleton-stagger-${i}`}
                  />
                ))}
              </div>
            )}

            {!isLoading && !errorMessage && jobs.length === 0 && (
              <Card className="py-0 gap-0">
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

            {jobs.length > 0 && (
              <>
                <div className="space-y-3 sm:space-y-4">
                  {jobs.map((job, index) => (
                      <Link
                        key={job.id}
                        href={`/jobs/${job.id}`}
                        className="block group"
                        onClick={() => {
                          trigger("light");
                          trackEvent("job_open", {
                            job_id: job.id,
                            source: job.source,
                            position: index + 1,
                          });
                        }}
                      >
                        <Card className="job-card py-0 gap-0 hover:border-primary/50 active:border-primary/40">
                          <CardContent className="p-4 sm:p-5">
                            {/* Title row */}
                            <div className="flex min-w-0 flex-wrap items-center gap-2 mb-3">
                              <h3 className="basis-full min-w-0 text-base sm:text-xl font-bold text-slate-900 group-hover:text-primary transition-colors duration-200 [overflow-wrap:anywhere]">
                                {job.title}
                              </h3>
                              {job.isNew && (
                                <Badge className="bg-accent text-slate-900 hover:bg-accent/90">Neu</Badge>
                              )}
                              {job.isUrgent && (
                                <Badge variant="destructive">Dringend</Badge>
                              )}
                              {job.isRemote === true && (
                                <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700">
                                  Remote
                                </Badge>
                              )}
                            </div>

                            {/* Structured info grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-100 rounded-lg border border-slate-200 overflow-hidden mb-3">
                                  <div className="bg-white px-3 py-2.5 flex flex-col gap-0.5">
                                    <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 truncate">
                                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                                      {job.location}
                                    </span>
                                    <span className="text-[11px] text-slate-600 uppercase tracking-wide">Ort</span>
                                  </div>
                                  <div className="bg-white px-3 py-2.5 flex flex-col gap-0.5">
                                    <span className="flex items-center gap-1.5 text-[13px] sm:text-sm font-semibold tabular-nums text-slate-900 truncate">
                                      <Wallet className="h-3.5 w-3.5 text-primary shrink-0" />
                                      {salaryMap.get(`${job.source}-${job.id}`) ?? "–"}
                                    </span>
                                    <span className="text-[11px] text-slate-600 uppercase tracking-wide">Lohn, CHF/Jahr</span>
                                  </div>
                                  <div className="bg-white px-3 py-2.5 flex flex-col gap-0.5">
                                    <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 truncate">
                                      <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                                      {job.workload}
                                    </span>
                                    <span className="text-[11px] text-slate-600 uppercase tracking-wide">Pensum</span>
                                  </div>
                                  <div className="bg-white px-3 py-2.5 flex flex-col gap-0.5">
                                    <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 truncate">
                                      <CalendarDays className="h-3.5 w-3.5 text-primary shrink-0" />
                                      {job.type}
                                    </span>
                                    <span className="text-[11px] text-slate-600 uppercase tracking-wide">Anstellungsart</span>
                                  </div>
                                </div>

                            {/* Description + actions */}
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                              <p className="text-slate-600 text-sm line-clamp-2 flex-1 min-w-0">{job.description}</p>
                              <div className="flex items-center gap-3 shrink-0">
                                <Badge
                                  variant="secondary"
                                  className="bg-primary/10 text-amber-800 hover:bg-primary/20 font-bold transition-colors duration-200"
                                >
                                  <Zap className="h-3 w-3 mr-1 fill-current" />
                                  Bewerben
                                </Badge>
                                <span className="text-xs text-slate-600 flex items-center gap-1 whitespace-nowrap">
                                  <CalendarDays className="h-3 w-3" />
                                  {new Date(job.datePosted).toLocaleDateString("de-CH")}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                  ))}
                </div>

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
                  <div className="mt-10 text-center hidden md:block">
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
                  </div>
                )}
              </>
            )}

          </div>
        </section>
      </main>

      {FEATURE_FLAGS.mobileFilters && (
        <MobileFilterBar
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          workloadFilter={workloadFilter}
          setWorkloadFilter={setWorkloadFilter}
          remoteFilter={remoteFilter}
          setRemoteFilter={setRemoteFilter}
          postedWithinDays={postedWithinDays}
          setPostedWithinDays={setPostedWithinDays}
          sortBy={sortBy}
          setSortBy={setSortBy}
          radiusKm={radiusKm}
          setRadiusKm={setRadiusKm}
          hasLocationInput={hasLocationInput}
          facets={facets}
          resetFilters={resetFilters}
        />
      )}

    </div>
  );
}
