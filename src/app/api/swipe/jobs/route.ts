import { NextResponse } from "next/server";
import { loadCurrentSwipeSession } from "@/lib/swipe/session";
import { loadSwipeQueue, type SwipeRadiusKm } from "@/lib/swipe/queue";

const ALLOWED_RADII: SwipeRadiusKm[] = [25, 50, 100];

export async function GET(request: Request) {
  const session = await loadCurrentSwipeSession();
  if (!session) {
    return NextResponse.json({ error: "no_session" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const radiusParam = Number(searchParams.get("radiusKm") ?? "25");
  const radiusKm = (ALLOWED_RADII.includes(radiusParam as SwipeRadiusKm)
    ? radiusParam
    : 25) as SwipeRadiusKm;

  const { cards, total } = await loadSwipeQueue({
    sessionId: session.id,
    plz: session.plz,
    radiusKm,
    limit: 20,
  });

  return NextResponse.json(
    { cards, total, radiusKm, plz: session.plz },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
