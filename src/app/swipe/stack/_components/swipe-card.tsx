"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "motion/react";
import { Briefcase, Building2, MapPin, Sparkles, Zap } from "lucide-react";
import { useHaptic } from "@/hooks/use-haptic";
import { SWIPE_COPY } from "@/lib/swipe/copy";
import type { SwipeJobCard } from "@/lib/swipe/queue";

const SWIPE_THRESHOLD = 110; // px from center
const VELOCITY_THRESHOLD = 700; // px/s

interface SwipeCardProps {
  card: SwipeJobCard;
  index: number; // 0 = top, 1 = behind, 2 = further behind
  isTop: boolean;
  onCommit: (direction: "left" | "right") => void;
}

export function SwipeCard({ card, index, isTop, onCommit }: SwipeCardProps) {
  const { trigger } = useHaptic();
  const x = useMotionValue(0);
  const crossedRef = useRef(false);

  // Cards behind the top card sit smaller and lower for stack depth.
  const stackY = index * 8;
  const stackScale = 1 - index * 0.04;
  const stackOpacity = index === 0 ? 1 : index === 1 ? 0.85 : 0.65;

  // Tilt left/right with horizontal drag — small angle keeps it tasteful.
  const rotate = useTransform(x, [-260, 0, 260], [-12, 0, 12]);
  const rightStampOpacity = useTransform(x, [40, SWIPE_THRESHOLD], [0, 1]);
  const leftStampOpacity = useTransform(x, [-SWIPE_THRESHOLD, -40], [1, 0]);

  // Fire a haptic tick the first time the card crosses the commit threshold.
  useEffect(() => {
    if (!isTop) return;
    const unsub = x.on("change", (v) => {
      if (Math.abs(v) >= SWIPE_THRESHOLD && !crossedRef.current) {
        crossedRef.current = true;
        trigger("light");
      } else if (Math.abs(v) < SWIPE_THRESHOLD && crossedRef.current) {
        crossedRef.current = false;
      }
    });
    return () => unsub();
  }, [isTop, trigger, x]);

  const handleDragStart = () => {
    if (!isTop) return;
    trigger("selection");
  };

  const handleDragEnd = (_: PointerEvent, info: PanInfo) => {
    if (!isTop) return;
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    const isFlick = Math.abs(velocity) > VELOCITY_THRESHOLD;
    const passed = Math.abs(offset) > SWIPE_THRESHOLD;
    const direction = offset > 0 || velocity > 0 ? "right" : "left";

    if (isFlick || passed) {
      flyOut(direction);
    } else {
      // Spring back to center.
      animate(x, 0, {
        type: "spring",
        stiffness: 480,
        damping: 32,
        mass: 0.6,
      });
    }
  };

  const flyOut = (direction: "left" | "right") => {
    const target = direction === "right" ? 600 : -600;
    trigger(direction === "right" ? "success" : "nudge");
    animate(x, target, {
      type: "spring",
      stiffness: 320,
      damping: 28,
      velocity: direction === "right" ? 800 : -800,
      onComplete: () => onCommit(direction),
    });
  };

  return (
    <motion.article
      className="
        absolute inset-x-0 mx-auto
        w-[min(92vw,420px)] aspect-[5/8] max-h-[78dvh]
        rounded-[28px] bg-white
        shadow-[0_1px_2px_rgb(0_0_0_/_0.04),0_24px_60px_-24px_rgb(0_0_0_/_0.30)]
        ring-1 ring-slate-200/80
        will-change-transform select-none
        touch-none
      "
      drag={isTop ? "x" : false}
      dragElastic={0.9}
      dragMomentum={false}
      dragSnapToOrigin={false}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        y: stackY,
        scale: stackScale,
        opacity: stackOpacity,
        zIndex: 10 - index,
      }}
      initial={{ y: stackY + 24, opacity: 0, scale: stackScale * 0.96 }}
      animate={{ y: stackY, opacity: stackOpacity, scale: stackScale }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 28,
        mass: 0.7,
      }}
    >
      <CardContent card={card} />

      {isTop && (
        <>
          <motion.span
            className="swipe-stamp swipe-stamp-right"
            style={{ opacity: rightStampOpacity }}
            aria-hidden
          >
            {SWIPE_COPY.stack.rightStamp}
          </motion.span>
          <motion.span
            className="swipe-stamp swipe-stamp-left"
            style={{ opacity: leftStampOpacity }}
            aria-hidden
          >
            {SWIPE_COPY.stack.leftStamp}
          </motion.span>
        </>
      )}
    </motion.article>
  );
}

function CardContent({ card }: { card: SwipeJobCard }) {
  return (
    <div className="flex h-full flex-col p-6">
      {/* Top row — badges */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {card.isUrgent && (
            <span className="inline-flex h-6 items-center rounded-full bg-red-50 px-2.5 font-semibold text-red-700 ring-1 ring-red-100 badge-pulse-urgent">
              <Zap className="mr-1 h-3 w-3 fill-current" aria-hidden />
              Dringend
            </span>
          )}
          {card.isNew && (
            <span className="inline-flex h-6 items-center rounded-full bg-amber-50 px-2.5 font-semibold text-amber-700 ring-1 ring-amber-100 badge-pulse-new">
              <Sparkles className="mr-1 h-3 w-3" aria-hidden />
              Neu
            </span>
          )}
        </div>
        {card.salary && (
          <span className="rounded-md bg-slate-50 px-2 py-0.5 font-semibold tabular-nums text-slate-700 ring-1 ring-slate-200/70">
            {card.salary}
          </span>
        )}
      </div>

      {/* Title + company */}
      <h2 className="mt-4 text-[clamp(1.4rem,5.5vw,1.7rem)] font-extrabold leading-[1.15] tracking-tight text-slate-900 line-clamp-3">
        {card.title}
      </h2>
      <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-600">
        <Building2 className="h-4 w-4 text-slate-400" aria-hidden />
        <span className="truncate">{card.company}</span>
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
        <MapPin className="h-4 w-4 text-slate-400" aria-hidden />
        <span className="truncate">{card.location}</span>
      </div>

      {/* Tags */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        <Tag>{card.type}</Tag>
        <Tag>{card.workload}</Tag>
        {card.isRemote && <Tag tone="brand">Home-Office möglich</Tag>}
      </div>

      {/* Description */}
      <p className="mt-4 text-[15px] leading-relaxed text-slate-700 line-clamp-4">
        {card.description}
      </p>

      {/* Responsibilities or benefits */}
      {card.responsibilities.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {card.responsibilities.slice(0, 3).map((r) => (
            <li
              key={r}
              className="flex items-start gap-2 text-[13px] text-slate-600"
            >
              <Briefcase
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                aria-hidden
              />
              <span className="line-clamp-1">{r}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Footer hint */}
      <div className="mt-auto pt-4 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
        Wisch nach rechts zum Bewerben
      </div>
    </div>
  );
}

function Tag({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "brand";
}) {
  const cls =
    tone === "brand"
      ? "bg-primary/10 text-amber-800 ring-amber-200"
      : "bg-slate-50 text-slate-700 ring-slate-200/70";
  return (
    <span
      className={`inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium ring-1 ${cls}`}
    >
      {children}
    </span>
  );
}
