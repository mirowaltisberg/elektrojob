import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { loadCurrentSwipeSession } from "@/lib/swipe/session";

interface DecisionPayload {
  jobId: string;
  jobTitle?: string;
  direction: "left" | "right";
}

export async function POST(request: Request) {
  const session = await loadCurrentSwipeSession();
  if (!session) {
    return NextResponse.json({ error: "no_session" }, { status: 401 });
  }

  let body: DecisionPayload;
  try {
    body = (await request.json()) as DecisionPayload;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  if (!body?.jobId || (body.direction !== "left" && body.direction !== "right")) {
    return NextResponse.json({ error: "bad_payload" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Idempotent: same (session, job) records once. Subsequent swipes on the
  // same job from the same session are silently dropped.
  const { error: decisionError } = await supabase
    .from("swipe_decisions")
    .insert({
      session_id: session.id,
      job_id: body.jobId,
      direction: body.direction,
    });

  if (decisionError && decisionError.code !== "23505") {
    console.error("swipe decision insert failed", decisionError);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }

  if (body.direction === "right") {
    const { error: applicationError } = await supabase
      .from("applications")
      .insert({
        job_id: body.jobId,
        // The applications table requires a name. Derive a friendly fallback
        // from the email so we always have something for the operator inbox.
        name: deriveName(session.email),
        email: session.email,
        phone: session.phone,
        cv_path: session.cv_path,
        cv_filename: session.cv_filename,
        source: "swipe",
      });

    if (applicationError) {
      console.error("swipe apply insert failed", applicationError);
      return NextResponse.json({ error: "apply_failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}

function deriveName(email: string): string {
  const local = email.split("@")[0] ?? "Bewerber";
  return local
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}
