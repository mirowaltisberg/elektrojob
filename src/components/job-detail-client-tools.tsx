"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplyModal } from "@/components/apply-modal";
import type { JobSource } from "@/lib/job-types";
import { trackEvent } from "@/lib/analytics";
import { useHaptic } from "@/hooks/use-haptic";

const RECENT_KEY = "elektrojob:recent-jobs:v2";

interface RecentJobEntry {
  id: string;
  title: string;
  location: string;
  href: string;
  source: JobSource;
  viewedAt: string;
}

function readRecentJobs(): RecentJobEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as RecentJobEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

interface JobPrimaryActionProps {
  jobId: string;
  jobTitle: string;
  source: JobSource;
}

export function JobPrimaryAction({ jobId, jobTitle, source }: JobPrimaryActionProps) {
  return (
    <ApplyModal
      jobId={jobId}
      jobTitle={jobTitle}
      onOpen={() =>
        trackEvent("apply_click", {
          job_id: jobId,
          source,
          destination: "modal",
        })
      }
    />
  );
}

interface JobShareActionsProps {
  jobId: string;
  jobTitle: string;
  source: JobSource;
}

export function JobShareActions({ jobId, jobTitle, source }: JobShareActionsProps) {
  const { trigger } = useHaptic();
  const [isCopied, setIsCopied] = useState(false);
  const [pageUrl, setPageUrl] = useState("");

  useEffect(() => setPageUrl(window.location.href), []);

  const whatsappHref = useMemo(() => {
    if (!pageUrl) {
      return "#";
    }

    const text = `Interessanter Job: ${jobTitle} - ${pageUrl}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }, [jobTitle, pageUrl]);

  const handleCopy = async () => {
    if (!pageUrl) {
      return;
    }

    await navigator.clipboard.writeText(pageUrl);
    trigger("success");
    setIsCopied(true);
    trackEvent("share_copy_link", { job_id: jobId, source });
    window.setTimeout(() => setIsCopied(false), 1400);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button asChild variant="outline" size="sm" className="h-9 rounded-lg">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!pageUrl}
          onClick={() => trackEvent("share_whatsapp", { job_id: jobId, source })}
        >
          <MessageCircle className="h-4 w-4 mr-1" />
          WhatsApp
        </a>
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 rounded-lg"
        onClick={handleCopy}
        disabled={!pageUrl}
      >
        <Copy className="h-4 w-4 mr-1" />
        {isCopied ? "Kopiert" : "Link kopieren"}
      </Button>
    </div>
  );
}

interface RecentlyViewedJobsProps {
  jobId: string;
  jobTitle: string;
  location: string;
  source: JobSource;
  currentHref: string;
}

export function RecentlyViewedJobs({
  jobId,
  jobTitle,
  location,
  source,
  currentHref,
}: RecentlyViewedJobsProps) {
  const recentJobs = useMemo(
    () => readRecentJobs().filter((entry) => entry.id !== jobId).slice(0, 3),
    [jobId]
  );

  useEffect(() => {
    window.localStorage.removeItem("elektrojob:recent-jobs");

    const currentEntry: RecentJobEntry = {
      id: jobId,
      title: jobTitle,
      location,
      href: currentHref,
      source,
      viewedAt: new Date().toISOString(),
    };

    const previousEntries = readRecentJobs().filter((entry) => entry.id !== jobId);
    window.localStorage.setItem(
      RECENT_KEY,
      JSON.stringify([currentEntry, ...previousEntries].slice(0, 6))
    );
    trackEvent("job_view", { job_id: jobId, source });
  }, [currentHref, jobId, jobTitle, location, source]);

  if (recentJobs.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
      <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3">Zuletzt angesehen</h2>
      <ul className="space-y-2">
        {recentJobs.map((entry) => (
          <li key={`${entry.source}-${entry.id}`}>
            <Link
              href={entry.href}
              className="block rounded-lg border border-slate-200 px-3 py-2 hover:border-primary/40 hover:bg-primary/5 transition-colors"
              onClick={() =>
                trackEvent("recent_job_open", {
                  job_id: entry.id,
                  source: entry.source,
                })
              }
            >
              <p className="text-sm font-semibold text-slate-900 line-clamp-1">{entry.title}</p>
              <p className="text-xs text-slate-500 line-clamp-1">{entry.location}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
