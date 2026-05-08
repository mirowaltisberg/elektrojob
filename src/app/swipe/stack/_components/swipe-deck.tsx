"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Heart, Loader2, Telescope, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useHaptic } from "@/hooks/use-haptic";
import { SWIPE_COPY } from "@/lib/swipe/copy";
import type { SwipeJobCard } from "@/lib/swipe/queue";
import type { SwipeRadiusKm } from "@/lib/swipe/queue";
import { SwipeCard } from "./swipe-card";

const NEXT_RADIUS: Record<SwipeRadiusKm, SwipeRadiusKm | null> = {
  25: 50,
  50: 100,
  100: null,
};

interface SwipeDeckProps {
  initialCards: SwipeJobCard[];
  initialRadiusKm: SwipeRadiusKm;
  plz: string;
}

interface ToastState {
  id: number;
  kind: "applied" | "skipped" | "error";
  text: string;
}

export function SwipeDeck({
  initialCards,
  initialRadiusKm,
  plz,
}: SwipeDeckProps) {
  const { trigger } = useHaptic();
  const [queue, setQueue] = useState<SwipeJobCard[]>(initialCards);
  const [radiusKm, setRadiusKm] = useState<SwipeRadiusKm>(initialRadiusKm);
  const [loadingMore, setLoadingMore] = useState(false);
  const [exhausted, setExhausted] = useState(initialCards.length === 0);
  const [appliedCount, setAppliedCount] = useState(0);
  const [toast, setToast] = useState<ToastState | null>(null);

  const toastTimerRef = useRef<number | null>(null);
  const showToast = (state: Omit<ToastState, "id">) => {
    setToast({ ...state, id: Date.now() });
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 1600);
  };

  useEffect(() => () => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
  }, []);

  // When the deck thins out, fetch more from the server.
  useEffect(() => {
    if (queue.length > 4 || loadingMore || exhausted) return;
    let cancelled = false;
    (async () => {
      setLoadingMore(true);
      try {
        const res = await fetch(`/api/swipe/jobs?radiusKm=${radiusKm}`);
        if (!res.ok) throw new Error("fetch_failed");
        const data: { cards: SwipeJobCard[] } = await res.json();
        if (cancelled) return;
        setQueue((prev) => {
          const seen = new Set(prev.map((c) => c.id));
          const fresh = data.cards.filter((c) => !seen.has(c.id));
          if (prev.length === 0 && fresh.length === 0) {
            setExhausted(true);
          }
          return [...prev, ...fresh];
        });
      } catch {
        if (!cancelled) {
          showToast({ kind: "error", text: SWIPE_COPY.stack.errorToast });
        }
      } finally {
        if (!cancelled) setLoadingMore(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue.length, radiusKm]);

  const sendDecision = async (jobId: string, direction: "left" | "right") => {
    try {
      const res = await fetch("/api/swipe/decision", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jobId, direction }),
      });
      if (!res.ok) throw new Error("decision_failed");
    } catch {
      // We've already updated the UI optimistically; surface a soft error toast.
      showToast({ kind: "error", text: SWIPE_COPY.stack.errorToast });
      trigger("error");
    }
  };

  const handleCommit = (direction: "left" | "right", card: SwipeJobCard) => {
    setQueue((prev) => prev.filter((c) => c.id !== card.id));

    if (direction === "right") {
      setAppliedCount((n) => n + 1);
      showToast({ kind: "applied", text: SWIPE_COPY.stack.sentToast });
    } else {
      showToast({ kind: "skipped", text: SWIPE_COPY.stack.skipToast });
    }

    void sendDecision(card.id, direction);
  };

  const expandRadius = () => {
    const next = NEXT_RADIUS[radiusKm];
    if (!next) return;
    trigger("selection");
    setRadiusKm(next);
    setExhausted(false);
    setQueue([]); // forces effect to refetch with new radius
  };

  const visibleCards = useMemo(() => queue.slice(0, 3), [queue]);
  const topCard = visibleCards[0];

  // Trigger button-driven swipes for accessibility / reduced motion users.
  const triggerProgrammatic = (direction: "left" | "right") => {
    if (!topCard) return;
    handleCommit(direction, topCard);
  };

  return (
    <main className="relative flex min-h-[100dvh] flex-col px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <DeckHeader
        plz={plz}
        radiusKm={radiusKm}
        appliedCount={appliedCount}
      />

      <div className="relative mt-3 flex-1">
        <div className="relative h-full">
          <AnimatePresence>
            {visibleCards.map((card, i) => (
              <SwipeCard
                key={card.id}
                card={card}
                index={i}
                isTop={i === 0}
                onCommit={(direction) => handleCommit(direction, card)}
              />
            ))}
          </AnimatePresence>

          {visibleCards.length === 0 && !loadingMore && (
            <EmptyState
              radiusKm={radiusKm}
              onExpandRadius={expandRadius}
              appliedCount={appliedCount}
            />
          )}

          {visibleCards.length === 0 && loadingMore && (
            <div className="absolute inset-0 grid place-items-center">
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
                <span className="text-sm">Lade weitere Stellen …</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons — work as both fallback and supplement to the gesture */}
      {topCard && (
        <ActionRow
          onSkip={() => triggerProgrammatic("left")}
          onApply={() => triggerProgrammatic("right")}
        />
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={`
              pointer-events-none fixed left-1/2 -translate-x-1/2 z-30
              top-[max(1rem,env(safe-area-inset-top))]
              rounded-full px-4 py-2 text-sm font-semibold shadow-lg
              ${
                toast.kind === "applied"
                  ? "bg-emerald-600 text-white shadow-emerald-600/30"
                  : toast.kind === "error"
                    ? "bg-red-600 text-white shadow-red-600/30"
                    : "bg-slate-900 text-white shadow-slate-900/30"
              }
            `}
            role="status"
            aria-live="polite"
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function DeckHeader({
  plz,
  radiusKm,
  appliedCount,
}: {
  plz: string;
  radiusKm: SwipeRadiusKm;
  appliedCount: number;
}) {
  return (
    <header className="flex items-center justify-between text-sm">
      <Link
        href="/swipe"
        className="-ml-2 inline-flex h-10 items-center gap-1 rounded-lg pl-2 pr-3 font-medium text-slate-700 transition-colors hover:bg-slate-100"
        aria-label="Zurück"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden />
      </Link>
      <div className="text-center text-xs leading-tight">
        <div className="font-semibold text-slate-900">PLZ {plz}</div>
        <div className="text-slate-500">{radiusKm} km Umkreis</div>
      </div>
      <div className="min-w-[2.5rem] text-right">
        {appliedCount > 0 && (
          <span className="inline-flex h-7 items-center gap-1 rounded-full bg-emerald-50 px-2.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
            <Heart className="h-3.5 w-3.5 fill-current" aria-hidden />
            {appliedCount}
          </span>
        )}
      </div>
    </header>
  );
}

function ActionRow({
  onSkip,
  onApply,
}: {
  onSkip: () => void;
  onApply: () => void;
}) {
  return (
    <div className="pointer-events-none mt-4 mb-[max(1rem,env(safe-area-inset-bottom))] flex items-center justify-center gap-6">
      <button
        type="button"
        onClick={onSkip}
        aria-label={SWIPE_COPY.stack.skip}
        className="
          btn-interactive pointer-events-auto
          flex h-16 w-16 items-center justify-center rounded-full
          bg-white text-slate-500 ring-1 ring-slate-200
          shadow-[0_8px_20px_-8px_rgb(0_0_0_/_0.18)]
          hover:text-slate-900
        "
      >
        <X className="h-7 w-7" aria-hidden strokeWidth={2.5} />
      </button>
      <button
        type="button"
        onClick={onApply}
        aria-label={SWIPE_COPY.stack.apply}
        className="
          btn-interactive pointer-events-auto
          flex h-20 w-20 items-center justify-center rounded-full
          bg-primary text-primary-foreground
          shadow-[0_12px_28px_-6px_oklch(0.795_0.155_75_/_0.55)]
        "
      >
        <Heart className="h-8 w-8 fill-current" aria-hidden />
      </button>
    </div>
  );
}

function EmptyState({
  radiusKm,
  onExpandRadius,
  appliedCount,
}: {
  radiusKm: SwipeRadiusKm;
  onExpandRadius: () => void;
  appliedCount: number;
}) {
  const next = NEXT_RADIUS[radiusKm];
  const finished = !next;

  return (
    <div className="absolute inset-0 grid place-items-center px-4">
      <div className="max-w-sm text-center">
        <div className="swipe-float mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 ring-1 ring-amber-100">
          <Telescope className="h-9 w-9 text-primary" aria-hidden />
        </div>
        <h2 className="mt-5 text-2xl font-extrabold leading-tight tracking-tight text-slate-900">
          {finished ? SWIPE_COPY.stack.finishedTitle : SWIPE_COPY.stack.emptyTitle}
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
          {finished ? SWIPE_COPY.stack.finishedBody : SWIPE_COPY.stack.emptyBody}
        </p>

        {appliedCount > 0 && (
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
            <Heart className="h-3.5 w-3.5 fill-current" aria-hidden />
            {appliedCount} Bewerbung{appliedCount === 1 ? "" : "en"} gesendet
          </p>
        )}

        <div className="mt-7">
          {!finished ? (
            <button
              type="button"
              onClick={onExpandRadius}
              className="
                btn-interactive
                inline-flex h-12 items-center justify-center
                rounded-2xl bg-primary px-5 text-sm font-bold text-primary-foreground
                shadow-lg shadow-primary/30
              "
            >
              {SWIPE_COPY.stack.expandRadius(next ?? radiusKm)}
            </button>
          ) : (
            <Link
              href="/"
              className="
                btn-interactive
                inline-flex h-12 items-center justify-center
                rounded-2xl bg-slate-900 px-5 text-sm font-bold text-white
              "
            >
              {SWIPE_COPY.stack.finishedCta}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
