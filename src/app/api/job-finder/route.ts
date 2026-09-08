import { finderFailure, finderJson, finderPayload, requireFinderSession, refreshEmptyFinderDeck, FinderError } from "@/lib/job-finder-server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try { return finderJson(await finderPayload(await refreshEmptyFinderDeck(await requireFinderSession(request)))); }
  catch (error) {
    if (error instanceof FinderError && error.status === 401) return finderJson({ session: null });
    return finderFailure(error);
  }
}
