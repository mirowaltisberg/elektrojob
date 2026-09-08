import { createAdminClient } from "@/lib/supabase";
import { FinderError, finderFailure, finderJson, finderPayload, readFinderJson, requireFinderOrigin, requireFinderSession, type FinderRecord } from "@/lib/job-finder-server";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    requireFinderOrigin(request);
    const session = await requireFinderSession(request);
    const body = await readFinderJson(request);
    if (body.expectedSessionId !== session.id) throw new FinderError("In einem anderen Tab wurde ein neuer Job-Finder gestartet. Bitte lade diese Seite neu, bevor du fortfährst.", 409);
    if (Object.keys(body).some((key) => !["expectedSessionId", "jobId", "choice"].includes(key)) || typeof body.jobId !== "string" || !session.jobs.some((job) => job.id === body.jobId) || !["like", "pass"].includes(String(body.choice))) throw new FinderError("Diese Auswahl ist ungültig.");
    const { data, error } = await createAdminClient().rpc("record_job_finder_swipe", { p_id: session.id, p_job_id: body.jobId, p_choice: body.choice });
    if (error?.message.includes("finder_completed")) throw new FinderError("Deine Interessen wurden bereits abgeschlossen. Bitte lade die Seite neu.", 409);
    if (error?.message.includes("finder_choice_conflict")) throw new FinderError("Für diese Stelle wurde bereits eine andere Auswahl gespeichert. Bitte lade die Seite neu.", 409);
    if (error || !data) throw new Error("finder_swipe_failed");
    return finderJson({ success: true, ...await finderPayload(data as FinderRecord) });
  } catch (error) { return finderFailure(error); }
}
