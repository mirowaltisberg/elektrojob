import { FinderError, finderFailure, finderJson, finderPayload, finishFinder, readFinderJson, requireFinderOrigin, requireFinderSession } from "@/lib/job-finder-server";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  try {
    requireFinderOrigin(request);
    const record = await requireFinderSession(request);
    const body = await readFinderJson(request);
    if (body.expectedSessionId !== record.id) throw new FinderError("In einem anderen Tab wurde ein neuer Job-Finder gestartet. Bitte lade diese Seite neu, bevor du fortfährst.", 409);
    if (Object.keys(body).some((key) => key !== "expectedSessionId")) throw new FinderError("Ungültige Anfrage.");
    const completed = await finishFinder(record);
    return finderJson({ success: true, ...await finderPayload(completed) });
  } catch (error) { return finderFailure(error); }
}
