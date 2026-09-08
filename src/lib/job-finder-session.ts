import { createHmac, timingSafeEqual } from "node:crypto";
import { isSubmissionId } from "./application-persistence";

export const FINDER_COOKIE = "__Host-elektrojob-finder";
export const FINDER_ACCESS_SECONDS = 7 * 24 * 60 * 60;

export function finderCookieValue(id: string, secret: string): string {
  return `${id}.${createHmac("sha256", secret).update(`job-finder-session-v1:${id}`).digest("base64url")}`;
}

export function readFinderCookie(header: string | null, secret: string): string | null {
  const values = (header ?? "").split(";").map((part) => part.trim()).filter((part) => part.startsWith(`${FINDER_COOKIE}=`));
  if (values.length !== 1) return null;
  const value = values[0].slice(FINDER_COOKIE.length + 1);
  const [id, signature, extra] = value.split(".");
  if (extra !== undefined || !isSubmissionId(id ?? "") || !/^[A-Za-z0-9_-]{43}$/.test(signature ?? "")) return null;
  const actual = Buffer.from(value);
  const expected = Buffer.from(finderCookieValue(id, secret));
  return actual.length === expected.length && timingSafeEqual(actual, expected) ? id : null;
}
