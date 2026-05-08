import type { ReactNode } from "react";
import { DesktopRedirect } from "./_components/desktop-redirect";
import "./swipe.css";

export default function SwipeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="swipe-stage relative">
      <DesktopRedirect />
      {/* Desktop fallback — visible only on lg+ before the JS redirect runs.
         Keeps Lighthouse desktop happy and serves anyone with JS disabled. */}
      <div className="hidden lg:flex min-h-[100dvh] flex-col items-center justify-center text-center px-8">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
          Nur auf dem Smartphone
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          Wechsle auf dein Handy.
        </h1>
        <p className="mt-3 max-w-md text-slate-600">
          Wischen statt bewerben gibt es nur in der mobilen Ansicht.
          Du wirst gleich zur Startseite weitergeleitet.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20"
        >
          Zur Startseite
        </a>
      </div>

      <div className="lg:hidden">{children}</div>
    </div>
  );
}
