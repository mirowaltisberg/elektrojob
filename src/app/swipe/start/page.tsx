import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SWIPE_COPY } from "@/lib/swipe/copy";
import { loadCurrentSwipeSession } from "@/lib/swipe/session";
import { StartForm } from "./_components/start-form";

export const metadata: Metadata = {
  title: "Lebenslauf hochladen — Wischen statt bewerben",
  robots: { index: false, follow: false },
};

export default async function SwipeStartPage() {
  // If a session already exists, jump straight to the deck.
  const existing = await loadCurrentSwipeSession();
  if (existing) {
    redirect("/swipe/stack");
  }

  return (
    <main className="px-5 pb-16 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between">
        <Link
          href="/swipe"
          className="
            inline-flex h-10 items-center gap-1 -ml-2 pl-2 pr-3 rounded-lg
            text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors
          "
          aria-label="Zurück"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
          Zurück
        </Link>
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Schritt 1 von 1
        </span>
      </header>

      <section className="mt-8 max-w-prose">
        <h1 className="animate-hero-title text-3xl font-extrabold leading-[1.1] tracking-tight text-slate-900">
          {SWIPE_COPY.start.title}
        </h1>
        <p className="animate-hero-subtitle mt-3 max-w-md text-sm text-slate-600">
          Wir nutzen diese Angaben für jede Bewerbung, die du per Wisch absendest.
          Du kannst sie später jederzeit ändern.
        </p>
      </section>

      <StartForm />
    </main>
  );
}
