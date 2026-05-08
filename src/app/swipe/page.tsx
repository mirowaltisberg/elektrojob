import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { SWIPE_COPY } from "@/lib/swipe/copy";

export const metadata: Metadata = {
  title: "Tinder für Elektriker-Jobs — Wischen statt bewerben",
  description:
    "Lade deinen Lebenslauf einmal hoch, wische dich durch passende Elektriker-Stellen in deiner Nähe und bewirb dich mit einem Wisch.",
  alternates: { canonical: "/swipe" },
  openGraph: {
    title: "Wischen statt bewerben — elektrojob.ch",
    description:
      "Bewirb dich mit einem Wisch auf Elektriker-Jobs in deiner Nähe.",
    url: "/swipe",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function SwipeLandingPage() {
  const c = SWIPE_COPY.landing;

  return (
    <main className="px-5 pb-16 pt-[max(1.25rem,env(safe-area-inset-top))]">
      {/* Eyebrow + brand mark */}
      <header className="flex items-center justify-between text-sm">
        <Link
          href="/"
          className="font-bold tracking-tight text-slate-900"
          aria-label="Zur Startseite"
        >
          {SWIPE_COPY.brand}
        </Link>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200/80 backdrop-blur">
          <span
            aria-hidden
            className="swipe-pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-primary"
          />
          {c.eyebrow}
        </span>
      </header>

      {/* Hero */}
      <section className="mt-12 max-w-prose">
        <h1
          className="
            animate-hero-title text-4xl font-extrabold leading-[1.05]
            tracking-tight text-slate-900
            sm:text-5xl
          "
        >
          {c.title}
        </h1>
        <p className="animate-hero-subtitle mt-5 max-w-md text-base leading-relaxed text-slate-600">
          {c.subtitle}
        </p>

        <div className="animate-hero-search mt-8">
          <Link
            href="/swipe/start"
            className="
              btn-interactive group
              inline-flex h-14 w-full items-center justify-between
              rounded-2xl bg-slate-900 px-5 text-base font-bold text-white
              shadow-lg shadow-slate-900/15
              focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30
            "
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" aria-hidden />
              {c.cta}
            </span>
            <ArrowRight className="swipe-arrow h-5 w-5" aria-hidden />
          </Link>
          <p className="mt-3 text-center text-xs text-slate-500">
            Kostenlos · Kein Konto nötig · 90 Sekunden Setup
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="mt-16">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          So funktioniert&apos;s
        </h2>
        <ol className="mt-4 space-y-4">
          {c.steps.map((step, i) => (
            <li
              key={step.n}
              className={`swipe-step swipe-step-${i} relative overflow-hidden rounded-3xl bg-white p-5 ring-1 ring-slate-200/80 shadow-[0_1px_2px_rgb(0_0_0_/_0.04),0_8px_24px_-12px_rgb(0_0_0_/_0.08)]`}
            >
              <div className="flex items-baseline gap-4">
                <span className="swipe-step-num text-3xl font-extrabold tabular-nums">
                  {step.n}
                </span>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                    {step.body}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Visual hint — illustrated swipe gesture */}
      <SwipeHintIllustration />

      {/* Sticky CTA at the bottom — typical "thumb-zone" position */}
      <div
        className="
          mt-12 sticky bottom-0 -mx-5 px-5 pb-[max(1rem,env(safe-area-inset-bottom))]
          pt-4 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent
        "
      >
        <Link
          href="/swipe/start"
          className="
            btn-interactive
            flex h-14 w-full items-center justify-center gap-2
            rounded-2xl bg-primary text-base font-extrabold text-primary-foreground
            shadow-lg shadow-primary/30
          "
        >
          {c.cta}
          <ArrowRight className="h-5 w-5" aria-hidden />
        </Link>
      </div>
    </main>
  );
}

function SwipeHintIllustration() {
  return (
    <section
      aria-hidden
      className="mt-16 grid place-items-center"
    >
      <div
        className="
          relative h-44 w-full max-w-sm rounded-3xl
          bg-gradient-to-br from-white to-slate-100 ring-1 ring-slate-200/80
          shadow-[0_1px_2px_rgb(0_0_0_/_0.04),0_18px_40px_-20px_rgb(0_0_0_/_0.18)]
          overflow-hidden
        "
      >
        {/* Stack of cards visualization */}
        <div className="absolute inset-x-10 top-5 bottom-5 flex items-end justify-center">
          <div className="absolute h-32 w-44 translate-y-2 rotate-[-6deg] rounded-2xl bg-white ring-1 ring-slate-200 shadow-md" />
          <div className="absolute h-32 w-44 rotate-[3deg] rounded-2xl bg-white ring-1 ring-slate-200 shadow-md" />
          <div className="absolute h-32 w-44 -translate-y-1 rotate-[-1deg] rounded-2xl bg-gradient-to-br from-amber-50 to-white ring-1 ring-amber-200 shadow-lg">
            <div className="flex h-full flex-col p-3">
              <span className="h-2 w-16 rounded-full bg-slate-200" />
              <span className="mt-1.5 h-2 w-24 rounded-full bg-slate-200" />
              <span className="mt-auto inline-flex h-5 w-14 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                Neu
              </span>
            </div>
          </div>
        </div>

        {/* Wisch indicator */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
          <span>←</span>
          <span>Wisch</span>
          <span>→</span>
        </div>
      </div>
    </section>
  );
}
