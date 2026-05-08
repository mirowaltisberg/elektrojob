import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { loadCurrentSwipeSession } from "@/lib/swipe/session";
import { loadSwipeQueue } from "@/lib/swipe/queue";
import { SwipeDeck } from "./_components/swipe-deck";

export const metadata: Metadata = {
  title: "Stellen wischen — elektrojob.ch",
  robots: { index: false, follow: false },
};

export default async function SwipeStackPage() {
  const session = await loadCurrentSwipeSession();
  if (!session) {
    redirect("/swipe/start");
  }

  const initial = await loadSwipeQueue({
    sessionId: session.id,
    plz: session.plz,
    radiusKm: 25,
    limit: 12,
  });

  return (
    <SwipeDeck
      initialCards={initial.cards}
      initialRadiusKm={25}
      plz={session.plz}
    />
  );
}
