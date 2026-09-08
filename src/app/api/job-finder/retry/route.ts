import { FinderError, finderFailure, finderJson, finderPayload, readFinderJson, requireFinderOrigin, requireFinderSession } from "@/lib/job-finder-server";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  try {
    requireFinderOrigin(request);
    const record = await requireFinderSession(request);
    if (Object.keys(await readFinderJson(request)).length) throw new FinderError("Ungültige Anfrage.");
    return finderJson({ success: true, ...await finderPayload(record) });
  } catch (error) { return finderFailure(error); }
}
