import "server-only";
import { createHmac, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { searchJobListings } from "@/lib/job-catalog";
import type { JobListing } from "@/lib/job-types";
import { getApplicationOrigins, isSameOrigin } from "@/lib/application-request";
import { createApplicationRequestLimiter } from "@/lib/application-request-limit";
import { buildInterestSummary, type FinderSwipe } from "@/lib/job-finder-summary";
import { FINDER_ACCESS_SECONDS, FINDER_COOKIE, finderCookieValue, readFinderCookie } from "@/lib/job-finder-session";

export type FinderRecord = {
  id: string; name: string; cv_path: string; cv_filename: string; cv_uploaded_at: string | null; cv_sha256: string; jobs: JobListing[];
  swipes: FinderSwipe[]; synthetic: boolean; access_expires_at: string;
  retention_expires_at: string; completed_at: string | null; summary: string | null;
};
type Delivery = { kind: "cv" | "summary"; status: string; attempts: number };
export class FinderError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
const requestLimited = createApplicationRequestLimiter();
export function finderSecret() {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!value || !process.env.NEXT_PUBLIC_SUPABASE_URL) throw new FinderError("Der Job-Finder ist gerade nicht verfügbar. Bitte versuche es später erneut.", 503);
  return value;
}
export function finderJson(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Vary": "Cookie", "X-Robots-Tag": "noindex" } });
}
export function finderFailure(error: unknown) {
  if (error instanceof FinderError) return finderJson({ error: error.message }, error.status);
  console.error("[job-finder] request_failed", { requestId: randomUUID() });
  return finderJson({ error: "Das hat gerade nicht geklappt. Bitte versuche es erneut. Bereits gespeicherte Angaben bleiben erhalten." }, 503);
}
export function requireFinderOrigin(request: Request) {
  const allowed = getApplicationOrigins({ VERCEL_ENV: process.env.VERCEL_ENV, VERCEL_URL: process.env.VERCEL_URL, VERCEL_BRANCH_URL: process.env.VERCEL_BRANCH_URL });
  if (process.env.NODE_ENV === "development") allowed.push("http://localhost:3000", "http://127.0.0.1:3000");
  if (!isSameOrigin(request, allowed)) throw new FinderError("Diese Anfrage ist nicht erlaubt.", 403);
}
export function finderIpHash(request: Request) {
  const address = (request.headers.get("x-vercel-forwarded-for") ?? request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for"))?.split(",", 1)[0].trim() ?? (process.env.NODE_ENV === "development" ? "127.0.0.1" : null);
  if (!address || address.length > 64 || /[\u0000-\u0020\u007f]/.test(address)) throw new FinderError("Die Anfrage konnte nicht geprüft werden. Bitte lade die Seite neu.", 400);
  const hash = createHmac("sha256", finderSecret()).update(`job-finder-ip:${address}`).digest("hex");
  if (requestLimited(hash)) throw new FinderError("Bitte warte kurz und versuche es erneut.", 429);
  return hash;
}
export async function readFinderJson(request: Request): Promise<Record<string, unknown>> {
  if (!/^application\/json(?:;|$)/i.test(request.headers.get("content-type") ?? "")) throw new FinderError("Ungültige Anfrage.");
  if (Number(request.headers.get("content-length")) > 2048 || !request.body) throw new FinderError("Die Anfrage ist zu gross.", 413);
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    size += value.byteLength;
    if (size > 2048) { await reader.cancel(); throw new FinderError("Die Anfrage ist zu gross.", 413); }
    chunks.push(value);
  }
  try {
    const value: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value as Record<string, unknown>;
  } catch { throw new FinderError("Ungültige Anfrage."); }
}
export async function getFinderRecord(id: string): Promise<FinderRecord | null> {
  const { data, error } = await createAdminClient().from("job_finder_sessions").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error("finder_read_failed");
  return data as FinderRecord | null;
}
export async function requireFinderSession(request: Request): Promise<FinderRecord> {
  const id = readFinderCookie(request.headers.get("cookie"), finderSecret());
  const record = id ? await getFinderRecord(id) : null;
  if (!record || !record.cv_uploaded_at || Date.parse(record.access_expires_at) <= Date.now()) throw new FinderError("Deine Sitzung ist abgelaufen. Bitte starte den Job-Finder erneut.", 401);
  return record;
}
export async function finderPayload(record: FinderRecord) {
  const { data, error } = await createAdminClient().from("job_finder_deliveries").select("kind,status").eq("session_id", record.id);
  if (error) throw new Error("finder_delivery_read_failed");
  const deliveries = data as Delivery[];
  return {
    session: { id: record.id, name: record.name, cvDelivered: deliveries.some((d) => d.kind === "cv" && d.status === "sent"), summaryDelivered: deliveries.some((d) => d.kind === "summary" && d.status === "sent"), cvNotificationSkipped: deliveries.some((d) => d.kind === "cv" && d.status === "skipped"), completed: Boolean(record.completed_at), swipes: record.swipes },
    jobs: record.jobs,
    summary: record.summary ? { text: record.summary } : null,
  };
}
export function setFinderCookie(response: NextResponse, id: string) {
  response.cookies.set(FINDER_COOKIE, finderCookieValue(id, finderSecret()), { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: FINDER_ACCESS_SECONDS });
}
export async function finderDeck(): Promise<JobListing[]> {
  const { jobs } = await searchJobListings({ limit: 200, sort: "newest" });
  // Vollständige Details zuerst; verschiedene Orte vermeiden 60 fast gleiche Karten.
  const ranked = [...jobs].sort((a, b) => Number(Boolean(b.hasVerifiedDetails)) - Number(Boolean(a.hasVerifiedDetails)));
  const deck: JobListing[] = [];
  const locations = new Map<string, number>();
  for (const job of ranked) {
    const n = locations.get(job.location) ?? 0;
    if (n >= 4) continue;
    deck.push(job); locations.set(job.location, n + 1);
    if (deck.length === 60) break;
  }
  for (const job of ranked) {
    if (deck.length >= 60) break;
    if (!deck.some((item) => item.id === job.id)) deck.push(job);
  }
  return deck;
}
export async function finishFinder(record: FinderRecord): Promise<FinderRecord> {
  if (record.completed_at) return record;
  if (!record.swipes.length) throw new FinderError("Wähle zuerst mindestens eine Stelle aus.");
  const { data, error } = await createAdminClient().rpc("finish_job_finder_session", { p_id: record.id, p_swipes: record.swipes, p_summary: buildInterestSummary(record.jobs, record.swipes) });
  if (error?.message.includes("finder_changed")) throw new FinderError("Eine Auswahl wurde gerade gespeichert. Bitte sende die Interessen nochmals.", 409);
  if (error || !data) throw new Error("finder_finish_failed");
  return data as FinderRecord;
}

export async function refreshEmptyFinderDeck(record: FinderRecord): Promise<FinderRecord> {
  if (record.jobs.length || record.completed_at) return record;
  const jobs = await finderDeck().catch(() => []);
  if (!jobs.length) return record;
  const { data, error } = await createAdminClient().from("job_finder_sessions").update({ jobs }).eq("id", record.id).eq("jobs", "[]").select("*").maybeSingle();
  if (error) return record;
  return data as FinderRecord | null ?? await getFinderRecord(record.id) ?? record;
}
