"""Validate, merge and publish one complete elektro job snapshot.

Only this command is allowed to write scraper output to Supabase. The parallel
scrape workers produce isolated JSON artifacts and have no database secrets.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import re
import sys
import unicodedata
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from supabase import Client


TRADE = "elektro"
ID_PREFIX = f"scraped-{TRADE}-"
ALLOWED_SOURCES = {"google", "indeed", "linkedin"}
DEFAULT_MAX_AGE_DAYS = 35
DEFAULT_MIN_JOBS = 100
DEFAULT_MIN_RETENTION_RATIO = 0.50
SELECT_PAGE_SIZE = 1000
DELETE_BATCH_SIZE = 200


class PipelineError(RuntimeError):
    """A safe, user-displayable pipeline failure without job data."""


def text(value: Any) -> str:
    return value.strip() if isinstance(value, str) else ""


def parse_iso_date(value: Any) -> date | None:
    raw = text(value)
    if not raw:
        return None
    try:
        return date.fromisoformat(raw[:10])
    except ValueError:
        return None


def normalize_signature_part(value: Any) -> str:
    normalized = unicodedata.normalize("NFKC", text(value)).casefold()
    return re.sub(r"\s+", " ", normalized).strip()


def expected_job_id(job_url: str) -> str:
    digest = hashlib.md5(job_url.encode("utf-8")).hexdigest()[:12]
    return f"{ID_PREFIX}{digest}"


def is_recent_real_job(job: Any, cutoff: date, today: date) -> bool:
    if not isinstance(job, dict):
        return False

    job_id = text(job.get("id"))
    job_url = text(job.get("jobUrl"))
    source = text(job.get("source")).casefold()
    posted = parse_iso_date(job.get("datePosted"))
    title = text(job.get("title"))
    location = text(job.get("location"))
    description = text(job.get("fullDescription")) or text(job.get("description"))

    if not job_id.startswith(ID_PREFIX):
        return False
    if not re.match(r"^https?://", job_url, re.IGNORECASE):
        return False
    if job_id != expected_job_id(job_url):
        return False
    if source not in ALLOWED_SOURCES:
        return False
    if not posted or posted < cutoff or posted > today + timedelta(days=1):
        return False
    if len(title) < 5 or not location or len(description) < 80:
        return False
    return True


def quality_score(job: dict[str, Any]) -> tuple[int, int, int, int]:
    full_description = text(job.get("fullDescription"))
    structured_items = sum(
        len(job.get(key) or [])
        for key in ("responsibilities", "requirements", "benefits")
        if isinstance(job.get(key), list)
    )
    return (
        min(len(full_description), 20_000),
        structured_items,
        int(bool(text(job.get("salary")))),
        int(bool(text(job.get("company")))),
    )


def preferred_job(current: dict[str, Any], candidate: dict[str, Any]) -> dict[str, Any]:
    current_date = parse_iso_date(current.get("datePosted")) or date.min
    candidate_date = parse_iso_date(candidate.get("datePosted")) or date.min
    if candidate_date != current_date:
        return candidate if candidate_date > current_date else current
    return candidate if quality_score(candidate) > quality_score(current) else current


def merge_artifacts(
    paths: list[Path],
    expected_files: int,
    max_age_days: int,
) -> tuple[list[dict[str, Any]], int]:
    unique_paths = sorted({path.resolve() for path in paths})
    if len(unique_paths) != expected_files:
        raise PipelineError(
            f"expected {expected_files} scrape artifacts, found {len(unique_paths)}"
        )

    today = datetime.now(timezone.utc).date()
    cutoff = today - timedelta(days=max_age_days)
    by_id: dict[str, dict[str, Any]] = {}
    rejected = 0

    for path in unique_paths:
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            raise PipelineError(f"could not read scrape artifact {path.name}") from exc

        jobs = payload.get("jobs") if isinstance(payload, dict) else None
        if not isinstance(jobs, list):
            raise PipelineError(f"scrape artifact {path.name} has no jobs array")

        for raw_job in jobs:
            if not is_recent_real_job(raw_job, cutoff, today):
                rejected += 1
                continue
            job = dict(raw_job)
            job_id = text(job.get("id"))
            existing = by_id.get(job_id)
            by_id[job_id] = preferred_job(existing, job) if existing else job

    # A source can expose the same listing under different tracking URLs. The
    # second pass removes those semantic duplicates without collapsing distinct
    # employers advertising the same role in the same city.
    by_signature: dict[tuple[str, str, str], dict[str, Any]] = {}
    for job in by_id.values():
        company_signature = normalize_signature_part(job.get("company"))
        signature = (
            normalize_signature_part(job.get("title")),
            company_signature or text(job.get("id")),
            normalize_signature_part(job.get("location")),
        )
        existing = by_signature.get(signature)
        by_signature[signature] = preferred_job(existing, job) if existing else job

    merged = sorted(
        by_signature.values(),
        key=lambda job: (text(job.get("datePosted")), text(job.get("id"))),
        reverse=True,
    )
    return merged, rejected


def safe_string_list(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    return [text(item) for item in value if text(item)]


def to_db_row(job: dict[str, Any], today: date) -> dict[str, Any]:
    posted = parse_iso_date(job.get("datePosted"))
    if not posted:
        raise PipelineError("validated job lost its publication date")

    return {
        "id": text(job.get("id")),
        "title": text(job.get("title")),
        "company": text(job.get("company")),
        "location": text(job.get("location")),
        "type": text(job.get("type")) or "Vollzeit",
        "workload": text(job.get("workload")) or "100%",
        "description": text(job.get("description")),
        "full_description": text(job.get("fullDescription")),
        "responsibilities": safe_string_list(job.get("responsibilities")),
        "requirements": safe_string_list(job.get("requirements")),
        "benefits": safe_string_list(job.get("benefits")),
        "date_posted": posted.isoformat(),
        "is_new": (today - posted).days <= 3,
        "is_urgent": False,
        "salary": text(job.get("salary")),
        "job_url": text(job.get("jobUrl")),
        "source": text(job.get("source")).casefold(),
        "is_remote": bool(job.get("isRemote")),
        "company_url": text(job.get("companyUrl")),
        "trade": TRADE,
    }


def create_supabase_client() -> Client:
    from supabase import create_client

    url = os.environ.get("SUPABASE_URL", "").strip()
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    if not url or not key:
        raise PipelineError("required Supabase publisher secrets are missing")
    return create_client(url, key)


def fetch_existing_jobs(client: Client) -> dict[str, date | None]:
    existing: dict[str, date | None] = {}
    offset = 0

    while True:
        response = (
            client.table("jobs")
            .select("id,date_posted")
            .eq("trade", TRADE)
            .range(offset, offset + SELECT_PAGE_SIZE - 1)
            .execute()
        )
        rows = response.data or []
        for row in rows:
            if not isinstance(row, dict):
                continue
            job_id = text(row.get("id"))
            if job_id.startswith(ID_PREFIX):
                existing[job_id] = parse_iso_date(row.get("date_posted"))

        if len(rows) < SELECT_PAGE_SIZE:
            break
        offset += SELECT_PAGE_SIZE

    return existing


def enforce_safety_threshold(
    fresh_count: int,
    existing: dict[str, date | None],
    cutoff: date,
    minimum_jobs: int,
    minimum_retention_ratio: float,
) -> None:
    existing_recent_count = sum(
        1 for posted in existing.values() if posted is not None and posted >= cutoff
    )
    required_count = minimum_jobs
    if existing_recent_count >= minimum_jobs:
        required_count = max(
            required_count,
            math.ceil(existing_recent_count * minimum_retention_ratio),
        )

    if fresh_count < required_count:
        raise PipelineError(
            f"safety threshold failed: {fresh_count} fresh jobs, {required_count} required"
        )


def delete_stale_jobs(client: Client, stale_ids: set[str]) -> None:
    safe_ids = sorted(job_id for job_id in stale_ids if job_id.startswith(ID_PREFIX))
    for offset in range(0, len(safe_ids), DELETE_BATCH_SIZE):
        batch = safe_ids[offset : offset + DELETE_BATCH_SIZE]
        (
            client.table("jobs")
            .delete(returning="minimal")
            .eq("trade", TRADE)
            .in_("id", batch)
            .execute()
        )


def verify_publish(client: Client, expected_count: int) -> None:
    jobs_response = (
        client.table("jobs")
        .select("id", count="exact")
        .eq("trade", TRADE)
        .limit(1)
        .execute()
    )
    if jobs_response.count != expected_count:
        raise PipelineError(
            f"post-publish verification failed: expected {expected_count}, found {jobs_response.count}"
        )

    metadata_response = (
        client.table("scrape_metadata")
        .select("total_jobs")
        .eq("id", 1)
        .single()
        .execute()
    )
    metadata = metadata_response.data or {}
    if metadata.get("total_jobs") != expected_count:
        raise PipelineError("post-publish metadata verification failed")


def publish(
    client: Client,
    jobs: list[dict[str, Any]],
    max_age_days: int,
    minimum_jobs: int,
    minimum_retention_ratio: float,
) -> tuple[int, int]:
    today = datetime.now(timezone.utc).date()
    cutoff = today - timedelta(days=max_age_days)
    existing = fetch_existing_jobs(client)
    enforce_safety_threshold(
        len(jobs),
        existing,
        cutoff,
        minimum_jobs,
        minimum_retention_ratio,
    )

    rows = [to_db_row(job, today) for job in jobs]
    fresh_ids = {row["id"] for row in rows}
    stale_ids = set(existing) - fresh_ids

    # One complete snapshot upsert, issued only by this final publisher job.
    # Returning minimal avoids echoing private source data into Actions logs.
    (
        client.table("jobs")
        .upsert(rows, on_conflict="id", returning="minimal")
        .execute()
    )

    # Upsert first so a prune failure can only leave extra old rows; it cannot
    # make the live site empty. Every delete is constrained by trade and ID.
    delete_stale_jobs(client, stale_ids)

    scraped_at = datetime.now(timezone.utc).isoformat()
    metadata_response = (
        client.table("scrape_metadata")
        .update(
            {
                "scraped_at": scraped_at,
                "total_jobs": len(rows),
            }
        )
        .eq("id", 1)
        .select("id")
        .execute()
    )
    if not metadata_response.data:
        raise PipelineError("scrape metadata row 1 was not updated")

    verify_publish(client, len(rows))
    return len(rows), len(stale_ids)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Publish one validated elektro job snapshot")
    parser.add_argument("--input", nargs="+", required=True, help="Chunk JSON files")
    parser.add_argument("--expected-files", type=int, default=1)
    parser.add_argument("--max-age-days", type=int, default=DEFAULT_MAX_AGE_DAYS)
    parser.add_argument("--min-jobs", type=int, default=DEFAULT_MIN_JOBS)
    parser.add_argument(
        "--min-retention-ratio",
        type=float,
        default=DEFAULT_MIN_RETENTION_RATIO,
    )
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if args.expected_files < 1:
        parser.error("expected-files must be positive")
    if args.max_age_days < 1 or args.max_age_days > 90:
        parser.error("max-age-days must be in the range 1..90")
    if args.min_jobs < 1:
        parser.error("min-jobs must be positive")
    if not 0 < args.min_retention_ratio <= 1:
        parser.error("min-retention-ratio must be in the range (0, 1]")
    return args


def main() -> int:
    args = parse_args()
    try:
        jobs, rejected = merge_artifacts(
            [Path(path) for path in args.input],
            args.expected_files,
            args.max_age_days,
        )
        if len(jobs) < args.min_jobs:
            raise PipelineError(
                f"minimum snapshot size failed: {len(jobs)} fresh jobs, {args.min_jobs} required"
            )

        print(f"Validated {len(jobs)} fresh real jobs; rejected {rejected} invalid records.")
        if args.dry_run:
            print("Dry run complete; Supabase was not contacted.")
            return 0

        client = create_supabase_client()
        published, pruned = publish(
            client,
            jobs,
            args.max_age_days,
            args.min_jobs,
            args.min_retention_ratio,
        )
        print(f"Published {published} jobs and pruned {pruned} stale elektro rows.")
        return 0
    except PipelineError as exc:
        print(f"Publish blocked: {exc}", file=sys.stderr)
        return 2
    except Exception as exc:  # Keep arbitrary API payloads out of public logs.
        print(f"Publish failed safely ({type(exc).__name__}).", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
