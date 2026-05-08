import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase";

export const SWIPE_COOKIE = "ej_swipe_sid";
const COOKIE_MAX_AGE_DAYS = 30;

export interface SwipeSessionRow {
  id: string;
  plz: string;
  email: string;
  phone: string;
  cv_path: string;
  cv_filename: string;
  created_at: string;
}

export async function setSwipeSessionCookie(sessionId: string) {
  const jar = await cookies();
  jar.set(SWIPE_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * COOKIE_MAX_AGE_DAYS,
  });
}

export async function getSwipeSessionId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(SWIPE_COOKIE)?.value ?? null;
}

export async function clearSwipeSession() {
  const jar = await cookies();
  jar.delete(SWIPE_COOKIE);
}

export async function loadSwipeSession(
  sessionId: string,
): Promise<SwipeSessionRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("swipe_sessions")
    .select("id, plz, email, phone, cv_path, cv_filename, created_at")
    .eq("id", sessionId)
    .maybeSingle();

  if (error || !data) return null;
  return data as SwipeSessionRow;
}

export async function loadCurrentSwipeSession(): Promise<SwipeSessionRow | null> {
  const id = await getSwipeSessionId();
  if (!id) return null;
  return loadSwipeSession(id);
}
