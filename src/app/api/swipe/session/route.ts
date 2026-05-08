import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase";
import { setSwipeSessionCookie } from "@/lib/swipe/session";
import { findSwissPostalCode } from "@/lib/swiss-postal-codes";

const ACCEPTED_CV_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_CV_SIZE = 10 * 1024 * 1024;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+0-9 ()/-]{7,}$/;

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const plz = String(form.get("plz") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const cv = form.get("cv");

    if (!findSwissPostalCode(plz)) {
      return NextResponse.json({ error: "plz_invalid" }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "email_invalid" }, { status: 400 });
    }
    if (!PHONE_RE.test(phone)) {
      return NextResponse.json({ error: "phone_invalid" }, { status: 400 });
    }
    if (!(cv instanceof File) || cv.size === 0) {
      return NextResponse.json({ error: "cv_missing" }, { status: 400 });
    }
    if (!ACCEPTED_CV_TYPES.includes(cv.type)) {
      return NextResponse.json({ error: "cv_type" }, { status: 400 });
    }
    if (cv.size > MAX_CV_SIZE) {
      return NextResponse.json({ error: "cv_size" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Reserve a session id by inserting a row, then upload the CV under that id.
    // Doing it in this order keeps the storage path stable and avoids orphan files.
    const userAgent = request.headers.get("user-agent") ?? null;
    const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
    const ipHash = forwardedFor ? hashIp(forwardedFor.split(",")[0].trim()) : null;

    const safeName = cv.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const timestamp = Date.now();

    const { data: inserted, error: insertError } = await supabase
      .from("swipe_sessions")
      .insert({
        plz,
        email,
        phone,
        cv_path: "pending",
        cv_filename: cv.name,
        user_agent: userAgent,
        ip_hash: ipHash,
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      console.error("swipe session insert failed", insertError);
      return NextResponse.json({ error: "server" }, { status: 500 });
    }

    const sessionId = inserted.id as string;
    const cvPath = `swipe-sessions/${sessionId}/${timestamp}-${safeName}`;
    const buffer = Buffer.from(await cv.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("cvs")
      .upload(cvPath, buffer, { contentType: cv.type });

    if (uploadError) {
      console.error("swipe cv upload failed", uploadError);
      // Roll back the session row; otherwise we'd carry a row that never works.
      await supabase.from("swipe_sessions").delete().eq("id", sessionId);
      return NextResponse.json({ error: "upload" }, { status: 500 });
    }

    await supabase
      .from("swipe_sessions")
      .update({ cv_path: cvPath })
      .eq("id", sessionId);

    await setSwipeSessionCookie(sessionId);
    return NextResponse.json({ sessionId });
  } catch (err) {
    console.error("swipe session error", err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
