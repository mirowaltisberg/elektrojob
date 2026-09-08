"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent, PointerEvent } from "react";
import {
  AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle2, Clock3,
  ExternalLink, FileText, Heart, Loader2, MapPin, Send, ShieldCheck,
  UploadCloud, Wallet, X, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTestRunId, getTestRunToken } from "@/lib/application-client";
import { trackSavedApplication } from "@/lib/google-ads";
import {
  MAX_APPLICATION_PDF_BYTES, hasDisallowedPdfFeatures, hasPdfMagic,
  isAcceptedPdfMimeType, isValidPdfFilename,
} from "@/lib/application-validation";
import type { JobListing } from "@/lib/job-types";

type Choice = "like" | "pass";
interface FinderSession {
  id: string;
  name: string;
  cvDelivered: boolean;
  cvNotificationSkipped?: boolean;
  summaryDelivered: boolean;
  completed: boolean;
  swipes: { jobId: string; choice: Choice }[];
}
interface FinderResponse {
  success?: boolean;
  session: FinderSession | null;
  jobs?: JobListing[];
  summary?: { text: string } | null;
  conversionId?: string;
  synthetic?: boolean;
}

function mergeDeliveryStatus(current: FinderSession | null, incoming: FinderSession | null) {
  if (!current || !incoming || current.id !== incoming.id) return current;
  return {
    ...current,
    cvDelivered: current.cvDelivered || incoming.cvDelivered,
    cvNotificationSkipped: current.cvNotificationSkipped || incoming.cvNotificationSkipped,
    summaryDelivered: current.summaryDelivered || incoming.summaryDelivered,
  };
}

function isSession(value: unknown): value is FinderSession {
  if (!value || typeof value !== "object") return false;
  const session = value as Partial<FinderSession>;
  return typeof session.id === "string" && typeof session.name === "string" &&
    typeof session.cvDelivered === "boolean" && typeof session.summaryDelivered === "boolean" &&
    (session.cvNotificationSkipped === undefined || typeof session.cvNotificationSkipped === "boolean") &&
    typeof session.completed === "boolean" && Array.isArray(session.swipes) &&
    session.swipes.every((swipe) => typeof swipe?.jobId === "string" &&
      (swipe.choice === "like" || swipe.choice === "pass"));
}

async function readResponse(response: Response, requireSession = true): Promise<FinderResponse> {
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data && typeof data === "object" && "error" in data && typeof data.error === "string"
      ? data.error : "Das hat gerade nicht geklappt. Bitte versuche es erneut.";
    throw new Error(message);
  }
  if (!data || typeof data !== "object" || !("session" in data) ||
    !(isSession(data.session) || (!requireSession && data.session === null))) {
    throw new Error("Die Speicherung konnte nicht bestätigt werden. Bitte versuche es erneut.");
  }
  return data as FinderResponse;
}

function DeliveryStatus({ delivered, label, skipped = false }: { delivered: boolean; label: string; skipped?: boolean }) {
  const Icon = skipped ? FileText : delivered ? CheckCircle2 : Clock3;
  return (
    <div className={`flex items-start gap-2 text-sm ${skipped ? "text-slate-700" : delivered ? "text-emerald-800" : "text-amber-900"}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{label}: <strong>{skipped ? "gespeichert; frühere Bewerbung bereits gemeldet" : delivered ? "an unser Team gesendet" : "gespeichert, Versand noch offen"}</strong></span>
    </div>
  );
}

function ErrorNotice({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div role="alert" className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}

function JobDetails({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-5">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <ul className="mt-2 space-y-2 text-sm leading-relaxed text-slate-600">
        {items.map((item, index) => <li key={`${index}-${item}`} className="flex gap-2"><span aria-hidden="true">•</span><span>{item}</span></li>)}
      </ul>
    </div>
  );
}

export function JobFinder() {
  const [session, setSession] = useState<FinderSession | null>(null);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [cv, setCv] = useState<File | null>(null);
  const [validatingFile, setValidatingFile] = useState(false);
  const [busy, setBusy] = useState<"start" | "like" | "pass" | "finish" | "retry" | null>(null);
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const requestInFlight = useRef(false);
  const submissionId = useRef<string | null>(null);
  const formStartedAt = useRef(0);
  const fileSelection = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const card = useRef<HTMLElement>(null);
  const focusNextCard = useRef(false);
  const pointer = useRef<{ id: number; x: number; y: number; cancelled: boolean } | null>(null);

  const loadSession = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await fetch("/api/job-finder", { cache: "no-store", signal });
      const data = await readResponse(response, false);
      if (signal?.aborted) return;
      setSession(data.session);
      setJobs(data.jobs ?? []);
      setSummaryText(data.summary?.text ?? null);
      if (!formStartedAt.current) formStartedAt.current = Date.now();
    } catch (cause) {
      if (signal?.aborted) return;
      setLoadError(cause instanceof Error ? cause.message : "Der Job-Finder konnte nicht geladen werden.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadSession(controller.signal);
    return () => controller.abort();
  }, [loadSession]);

  const activeSessionId = session?.id;
  const deliveryPending = Boolean(session && (
    (!session.cvDelivered && !session.cvNotificationSkipped) ||
    (session.completed && !session.summaryDelivered)
  ));

  useEffect(() => {
    if (!activeSessionId || !deliveryPending) return;
    const controller = new AbortController();
    let polling = false;
    const timer = window.setInterval(async () => {
      if (polling || requestInFlight.current || document.hidden) return;
      polling = true;
      try {
        const response = await fetch("/api/job-finder", { cache: "no-store", signal: controller.signal });
        const data = await readResponse(response, false);
        if (!controller.signal.aborted) {
          setSession((current) => mergeDeliveryStatus(current, data.session));
        }
      } catch {
        // Status checks must not interrupt swiping or change already saved choices.
      } finally {
        polling = false;
      }
    }, 15_000);
    return () => {
      window.clearInterval(timer);
      controller.abort();
    };
  }, [activeSessionId, deliveryPending]);

  const selected = new Set(session?.swipes.map((swipe) => swipe.jobId));
  const currentJob = jobs.find((job) => !selected.has(job.id));
  const likeCount = session?.swipes.filter((swipe) => swipe.choice === "like").length ?? 0;
  const choiceCount = session?.swipes.length ?? 0;
  const likedIds = new Set(session?.swipes.filter((swipe) => swipe.choice === "like").map((swipe) => swipe.jobId));
  const likedJobs = jobs.filter((job) => likedIds.has(job.id));

  useEffect(() => {
    if (focusNextCard.current && currentJob && !session?.completed) {
      card.current?.focus({ preventScroll: true });
      focusNextCard.current = false;
    }
  }, [currentJob, session?.completed]);

  const chooseFile = async (file: File | undefined) => {
    if (!file || requestInFlight.current) return;
    const selection = ++fileSelection.current;
    setValidatingFile(true);
    setError(null);
    let message: string | null = null;
    if (!isAcceptedPdfMimeType(file.type) || !isValidPdfFilename(file.name.normalize("NFKC").trim())) {
      message = "Bitte wähle deinen Lebenslauf als PDF-Datei aus.";
    } else if (file.size < 10 || file.size > MAX_APPLICATION_PDF_BYTES) {
      message = "Dein Lebenslauf darf maximal 4 MB gross sein.";
    } else {
      try {
        const bytes = new Uint8Array(await file.arrayBuffer());
        if (!hasPdfMagic(bytes)) message = "Diese Datei ist keine gültige PDF-Datei.";
        else if (hasDisallowedPdfFeatures(bytes)) message = "Bitte exportiere deinen Lebenslauf als PDF ohne Passwortschutz oder ausführbare Inhalte.";
      } catch {
        message = "Die Datei konnte nicht gelesen werden. Bitte wähle sie erneut aus.";
      }
    }
    if (selection !== fileSelection.current) return;
    setValidatingFile(false);
    if (message) {
      setError(message);
      setCv(null);
      if (fileInput.current) fileInput.current.value = "";
      return;
    }
    setCv(file);
  };

  const start = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (requestInFlight.current || validatingFile) return;
    if (!name.trim() || !cv || !consent) {
      setError("Bitte gib deinen Namen an, wähle deinen CV aus und bestätige die Einwilligung.");
      return;
    }
    requestInFlight.current = true;
    setBusy("start");
    setError(null);
    submissionId.current ??= crypto.randomUUID();
    const form = new FormData();
    form.set("name", name.trim());
    form.set("cv", cv);
    form.set("consent", "yes");
    form.set("website", website);
    form.set("formStartedAt", String(formStartedAt.current));
    form.set("submissionId", submissionId.current);
    const testRunId = getTestRunId();
    const testToken = getTestRunToken();
    if (testRunId) form.set("testRunId", testRunId);
    if (testToken) form.set("testToken", testToken);
    try {
      const response = await fetch("/api/job-finder/start", { method: "POST", body: form });
      const data = await readResponse(response);
      setSession(data.session);
      setJobs(data.jobs ?? []);
      setCv(null);
      focusNextCard.current = true;
      if (data.success === true && data.synthetic === false) trackSavedApplication(data.conversionId);
      setAnnouncement(data.session?.cvNotificationSkipped ? "Dein CV wurde gespeichert; eine frühere Bewerbung wurde bereits gemeldet. Du kannst jetzt Jobs entdecken." : data.session?.cvDelivered ? "Dein CV wurde an unser Team gesendet. Du kannst jetzt Jobs entdecken." : "Dein CV wurde gespeichert. Der Versand ist noch offen. Du kannst jetzt Jobs entdecken.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Dein CV konnte nicht gesendet werden. Bitte versuche es erneut.");
    } finally {
      requestInFlight.current = false;
      setBusy(null);
    }
  };

  const saveChoice = async (choice: Choice) => {
    if (!currentJob || !session || session.completed || requestInFlight.current) return;
    requestInFlight.current = true;
    setBusy(choice);
    setError(null);
    const job = currentJob;
    try {
      const response = await fetch("/api/job-finder/swipes", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expectedSessionId: session.id, jobId: job.id, choice }),
      });
      const data = await readResponse(response);
      if (!data.session?.swipes.some((swipe) => swipe.jobId === job.id && swipe.choice === choice)) {
        throw new Error("Deine Auswahl konnte nicht bestätigt werden. Bitte wähle erneut.");
      }
      focusNextCard.current = true;
      setSession(data.session);
      setAnnouncement(`${choice === "like" ? "Interessiert mich" : "Passt nicht"} gespeichert: ${job.title}.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Deine Auswahl konnte nicht gespeichert werden. Die Stelle bleibt sichtbar. Bitte versuche es erneut.");
    } finally {
      setDragX(0);
      setDragging(false);
      requestInFlight.current = false;
      setBusy(null);
    }
  };

  const finish = async () => {
    if (!session || choiceCount === 0 || requestInFlight.current) return;
    requestInFlight.current = true;
    setBusy("finish");
    setError(null);
    try {
      const response = await fetch("/api/job-finder/finish", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expectedSessionId: session.id }),
      });
      const data = await readResponse(response);
      if (!data.session?.completed) throw new Error("Deine Zusammenfassung konnte nicht bestätigt werden. Bitte versuche es erneut.");
      setSession(data.session);
      setSummaryText(data.summary?.text ?? null);
      setAnnouncement(data.session.summaryDelivered ? "Deine Interessen wurden an unser Team gesendet." : "Deine Interessen wurden gespeichert. Der Versand ist noch offen.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Deine Interessen konnten nicht gesendet werden. Deine Auswahl bleibt gespeichert.");
    } finally {
      requestInFlight.current = false;
      setBusy(null);
    }
  };

  const refreshDeliveryStatus = async () => {
    if (!session || requestInFlight.current) return;
    requestInFlight.current = true;
    setBusy("retry");
    setError(null);
    try {
      const response = await fetch("/api/job-finder/retry", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: "{}",
      });
      const data = await readResponse(response);
      setSession((current) => mergeDeliveryStatus(current, data.session));
      setAnnouncement(data.session?.cvNotificationSkipped ? "Dein CV wurde gespeichert; eine frühere Bewerbung wurde bereits gemeldet." : data.session?.cvDelivered ? "Dein CV wurde an unser Team gesendet." : "Dein CV ist gespeichert. Der Versand ist weiterhin offen.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Der Versandstatus konnte nicht aktualisiert werden. Bitte versuche es erneut.");
    } finally {
      requestInFlight.current = false;
      setBusy(null);
    }
  };

  const startAgain = () => {
    if (requestInFlight.current) return;
    setSession(null);
    setJobs([]);
    setSummaryText(null);
    setName("");
    setConsent(false);
    setCv(null);
    setWebsite("");
    setError(null);
    setAnnouncement("Du kannst einen neuen Job-Finder mit deinem CV starten.");
    submissionId.current = null;
    formStartedAt.current = Date.now();
  };

  const pointerDown = (event: PointerEvent<HTMLElement>) => {
    if (requestInFlight.current || !event.isPrimary || (event.pointerType === "mouse" && event.button !== 0) ||
      (event.target as HTMLElement).closest("a, button, summary, input, select, textarea, details[open]")) return;
    pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY, cancelled: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const pointerMove = (event: PointerEvent<HTMLElement>) => {
    const active = pointer.current;
    if (!active || active.id !== event.pointerId || active.cancelled) return;
    const dx = event.clientX - active.x;
    const dy = event.clientY - active.y;
    if (Math.abs(dy) > 16 && Math.abs(dy) > Math.abs(dx)) {
      active.cancelled = true;
      setDragX(0);
      setDragging(false);
      return;
    }
    if (Math.abs(dx) > 8) {
      setDragging(true);
      setDragX(Math.max(-130, Math.min(130, dx)));
    }
  };

  const pointerEnd = (event: PointerEvent<HTMLElement>, cancelled = false) => {
    const active = pointer.current;
    pointer.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(false);
    if (!active || active.id !== event.pointerId || active.cancelled || cancelled) {
      setDragX(0);
      return;
    }
    const dx = event.clientX - active.x;
    const threshold = Math.min(90, event.currentTarget.clientWidth * 0.24);
    if (Math.abs(dx) >= threshold && Math.abs(dx) > Math.abs(event.clientY - active.y) * 1.3) {
      void saveChoice(dx > 0 ? "like" : "pass");
    } else setDragX(0);
  };

  const keyboardChoice = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      void saveChoice(event.key === "ArrowRight" ? "like" : "pass");
    }
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-slate-50 text-slate-900">
      <a href="#job-finder-main" className="sr-only z-50 rounded-md bg-white p-3 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Zum Job-Finder</a>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" aria-label="elektrojob.ch – Startseite" className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600">
            <Image src="/logo.svg" alt="elektrojob.ch" width={142} height={29} priority className="h-7 w-auto" />
          </Link>
          <Link href="/" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Zur Stellensuche
          </Link>
        </div>
      </header>

      <main id="job-finder-main" className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-12">
        <div className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>
        <nav aria-label="Dein Weg zum passenden Job" className="mb-8 sm:mb-12">
          <ol className="mx-auto grid max-w-xl grid-cols-3 gap-2 text-xs font-semibold sm:text-sm">
            {["CV senden", "Jobs entdecken", "Interessen senden"].map((label, index) => {
              const step = session?.completed ? 2 : session ? 1 : 0;
              return (
                <li key={label} aria-current={step === index ? "step" : undefined} className={`flex flex-col items-center gap-2 ${step >= index ? "text-slate-900" : "text-slate-500"}`}>
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full ${step > index ? "bg-emerald-100 text-emerald-800" : step === index ? "bg-amber-300 text-slate-900" : "bg-slate-200"}`}>
                    {step > index ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
                  </span>
                  {label}
                </li>
              );
            })}
          </ol>
        </nav>

        {loading ? (
          <div role="status" className="py-16 text-center text-slate-600"><Loader2 className="mx-auto mb-3 h-7 w-7 animate-spin" aria-hidden="true" />Dein Job-Finder wird geladen …</div>
        ) : loadError ? (
          <div className="mx-auto max-w-xl space-y-4"><h1 className="text-2xl font-bold">Job-Finder laden</h1><ErrorNotice message={loadError} /><Button onClick={() => void loadSession()} className="min-h-11">Erneut laden</Button></div>
        ) : !session ? (
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
            <div className="lg:pt-7">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900"><Zap className="h-3.5 w-3.5" aria-hidden="true" /> DEIN NÄCHSTER ELEKTROJOB</p>
              <h1 className="max-w-lg text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl">Einmal CV senden.<br /><span className="text-amber-700">Dann einfach swipen.</span></h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg">Noch nicht sicher, welche Stelle passt? Sende uns deinen Lebenslauf und zeige uns danach, welche Elektrojobs dich interessieren.</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-700">
                <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" /><span><strong>Nur Name und CV.</strong> Kein Konto, kein Motivationsschreiben.</span></li>
                <li className="flex gap-3"><Send className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" /><span><strong>Dein CV geht zuerst an unser Team.</strong> Auch wenn du danach keine Jobs auswählst.</span></li>
                <li className="flex gap-3"><Heart className="mt-0.5 h-5 w-5 shrink-0 text-rose-700" aria-hidden="true" /><span><strong>Deine Interessen geben die Richtung vor.</strong> Ein Swipe ist keine Bewerbung auf eine einzelne Stelle.</span></li>
              </ul>
            </div>
            <form onSubmit={(event) => void start(event)} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/40 sm:p-8" aria-label="CV an unser Team senden">
              <div><h2 className="text-xl font-bold">Los geht’s mit deinem CV</h2><p className="mt-1 text-sm text-slate-600">Bitte stelle sicher, dass wir dich über die Kontaktdaten in deinem CV erreichen können.</p></div>
              <div className="space-y-2">
                <label htmlFor="finder-name" className="block text-sm font-semibold">Vor- und Nachname</label>
                <input id="finder-name" name="name" autoComplete="name" required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} disabled={busy !== null} placeholder="Dein Name" className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200 disabled:opacity-60" />
              </div>
              <div className="space-y-2">
                <label htmlFor="finder-cv" className="block text-sm font-semibold">Dein Lebenslauf</label>
                <div className={`relative rounded-2xl border-2 border-dashed p-5 text-center ${cv ? "border-emerald-300 bg-emerald-50/60" : "border-slate-300 bg-slate-50"}`}>
                  {cv ? <FileText className="mx-auto mb-2 h-7 w-7 text-emerald-700" aria-hidden="true" /> : <UploadCloud className="mx-auto mb-2 h-7 w-7 text-amber-700" aria-hidden="true" />}
                  <p className="break-all text-sm font-semibold">{cv ? cv.name : "PDF-Lebenslauf auswählen"}</p>
                  <p id="finder-cv-help" className="mt-1 text-xs text-slate-600">{validatingFile ? "Datei wird geprüft …" : cv ? `${cv.size < 1_000_000 ? `${Math.max(1, Math.round(cv.size / 1_000)).toLocaleString("de-CH")} KB` : `${(cv.size / 1_000_000).toLocaleString("de-CH", { maximumFractionDigits: 1 })} MB`} · bereit zum Senden` : "PDF · maximal 4 MB"}</p>
                  <input ref={fileInput} id="finder-cv" name="cv" type="file" accept="application/pdf,.pdf" aria-describedby="finder-cv-help" required disabled={busy !== null} onChange={(event) => void chooseFile(event.target.files?.[0])} className="mt-3 block w-full min-w-0 text-xs text-slate-600 file:mr-3 file:rounded-lg file:border file:border-slate-300 file:bg-white file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600" />
                </div>
              </div>
              <div className="hidden" aria-hidden="true"><label htmlFor="finder-website">Website</label><input id="finder-website" name="website" autoComplete="off" tabIndex={-1} value={website} onChange={(event) => setWebsite(event.target.value)} /></div>
              <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-slate-600">
                <input type="checkbox" name="consent" required checked={consent} onChange={(event) => setConsent(event.target.checked)} disabled={busy !== null} className="mt-1 h-5 w-5 shrink-0 accent-amber-600" />
                <span>Ich willige ein, dass mein Name und CV jetzt an das Team von elektrojob.ch gesendet werden. Meine anschliessenden Job-Auswahlen dürfen gespeichert und als Interessenübersicht an das Team übermittelt werden. <Link href="/datenschutz" target="_blank" rel="noopener noreferrer" className="font-medium text-slate-800 underline underline-offset-2">Datenschutz</Link></span>
              </label>
              <ErrorNotice message={error} />
              <Button type="submit" disabled={busy !== null || validatingFile} className="h-auto min-h-13 w-full whitespace-normal rounded-xl bg-amber-300 px-4 py-3.5 text-base font-bold text-slate-900 hover:bg-amber-400">
                {busy === "start" ? <><Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />CV wird gesendet …</> : <><span>CV senden & Jobs entdecken</span><ArrowRight className="h-5 w-5" aria-hidden="true" /></>}
              </Button>
              <p className="flex items-start justify-center gap-2 text-xs leading-relaxed text-slate-600"><ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />Dein CV wird nicht öffentlich auf der Website angezeigt.</p>
            </form>
          </div>
        ) : session.completed ? (
          <section className="mx-auto max-w-2xl" aria-labelledby="finder-complete-title">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/30 sm:p-9">
              <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${session.summaryDelivered && (session.cvDelivered || session.cvNotificationSkipped) ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                {session.summaryDelivered && (session.cvDelivered || session.cvNotificationSkipped) ? <CheckCircle2 className="h-7 w-7" aria-hidden="true" /> : <Clock3 className="h-7 w-7" aria-hidden="true" />}
              </div>
              <h1 id="finder-complete-title" className="text-3xl font-extrabold tracking-tight">{session.summaryDelivered ? "Danke! Wir kennen deine Interessen." : "Deine Interessen sind gespeichert."}</h1>
              <p className="mt-3 text-slate-600">{likeCount > 0 ? `Du hast ${likeCount} ${likeCount === 1 ? "Stelle" : "Stellen"} interessant gefunden und ${choiceCount - likeCount} übersprungen.` : `Du hast ${choiceCount} Stellen angesehen und keine als interessant markiert. Auch das hilft uns, deine Wünsche einzuordnen.`}</p>
              <div className="my-6 space-y-3 rounded-xl bg-slate-50 p-4" aria-live="polite"><DeliveryStatus delivered={session.cvDelivered} skipped={session.cvNotificationSkipped} label="Dein CV" /><DeliveryStatus delivered={session.summaryDelivered} label="Deine Interessenübersicht" /></div>
              {deliveryPending ? <p className="mb-5 text-sm leading-relaxed text-slate-600">Der Versand erfolgt normalerweise innerhalb weniger Minuten. Du musst die Seite dafür nicht offen lassen.</p> : null}
              {summaryText ? <div className="border-t border-slate-200 pt-5"><h2 className="font-bold">Deine Interessenübersicht</h2><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-600">{summaryText}</p></div> : null}
              {likedJobs.length > 0 ? <details className="mt-5 rounded-xl border border-slate-200 p-4"><summary className="cursor-pointer font-semibold">Interessante Stellen ansehen ({likedJobs.length})</summary><ul className="mt-3 space-y-3">{likedJobs.map((job) => <li key={job.id}><Link href={`/jobs/${job.id}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-amber-800 underline underline-offset-2">{job.title} · {job.location}<span className="sr-only"> (öffnet einen neuen Tab)</span></Link></li>)}</ul></details> : null}
              <p className="mt-5 text-sm leading-relaxed text-slate-600">Deine Auswahl beschreibt deine Interessen. Sie löst keine zusätzlichen Einzelbewerbungen aus.</p>
              <div className="mt-5 space-y-4"><ErrorNotice message={error} />{deliveryPending ? <Button onClick={() => void refreshDeliveryStatus()} disabled={busy !== null} className="min-h-12 w-full rounded-xl">{busy === "retry" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Clock3 className="h-4 w-4" aria-hidden="true" />}Versandstatus aktualisieren</Button> : null}<Button asChild variant="outline" className="min-h-12 w-full rounded-xl"><Link href="/">Zurück zu den Stellen</Link></Button><button type="button" onClick={startAgain} disabled={busy !== null} className="min-h-11 w-full text-sm font-semibold text-slate-600 underline underline-offset-2 disabled:opacity-50">Neuen Job-Finder starten</button></div>
            </div>
          </section>
        ) : (
          <section className="mx-auto max-w-xl" aria-labelledby="finder-swipe-title">
            <div className="mb-5 space-y-3"><DeliveryStatus delivered={session.cvDelivered} skipped={session.cvNotificationSkipped} label="Dein CV" />{!session.cvDelivered && !session.cvNotificationSkipped ? <><p className="text-sm leading-relaxed text-slate-600">Dein CV wird über unseren bestehenden Versand an das Team weitergegeben. Der Versand erfolgt normalerweise innerhalb weniger Minuten. Du kannst bereits Jobs entdecken.</p><Button variant="outline" onClick={() => void refreshDeliveryStatus()} disabled={busy !== null} className="min-h-11 rounded-xl text-sm">{busy === "retry" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Clock3 className="h-4 w-4" aria-hidden="true" />}Versandstatus aktualisieren</Button></> : null}</div>
            <h1 id="finder-swipe-title" className="text-3xl font-extrabold tracking-tight sm:text-4xl">Was passt zu dir?</h1>
            <p id="finder-swipe-help" className="mt-2 text-sm leading-relaxed text-slate-600">Nach rechts: interessiert mich. Nach links: passt nicht. Du kannst auch die Tasten unten nutzen und jederzeit deine Interessen senden.</p>
            <div className="mb-5 mt-5 flex flex-wrap items-center justify-between gap-2 text-sm"><span className="font-semibold">{choiceCount} {choiceCount === 1 ? "Stelle" : "Stellen"} angesehen</span><span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 font-semibold text-rose-800"><Heart className="h-3.5 w-3.5" aria-hidden="true" />{likeCount} interessant</span></div>
            <div className="mb-4"><ErrorNotice message={error} /></div>
            {currentJob ? (
              <>
                <article ref={card} key={currentJob.id} data-testid="job-swipe-card" data-job-id={currentJob.id} tabIndex={0} aria-label={`Stelle: ${currentJob.title}`} aria-describedby="finder-swipe-help" aria-keyshortcuts="ArrowLeft ArrowRight" aria-busy={busy === "like" || busy === "pass"} onKeyDown={keyboardChoice} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={(event) => pointerEnd(event)} onPointerCancel={(event) => pointerEnd(event, true)}
                  style={{ touchAction: "pan-y", transform: `translateX(${dragX}px) rotate(${dragX / 22}deg)` }}
                  className={`relative rounded-3xl border bg-white shadow-xl shadow-slate-200/50 outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-4 ${dragX > 40 ? "border-emerald-400" : dragX < -40 ? "border-rose-300" : "border-slate-200"} ${dragging ? "select-none" : "transition-transform duration-200 motion-reduce:transition-none"}`}>
                  <div aria-hidden="true" className={`pointer-events-none absolute right-5 top-5 z-10 rotate-[-8deg] rounded-lg border-2 px-3 py-1 text-sm font-extrabold ${dragX > 40 ? "border-emerald-600 bg-emerald-50 text-emerald-800 opacity-100" : dragX < -40 ? "border-rose-600 bg-rose-50 text-rose-800 opacity-100" : "opacity-0"}`}>{dragX > 0 ? "INTERESSANT" : "PASST NICHT"}</div>
                  <div className="rounded-t-3xl border-b border-amber-100 bg-gradient-to-br from-amber-50 to-white p-6 sm:p-7">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200 bg-amber-100 text-amber-800"><Zap className="h-6 w-6" aria-hidden="true" /></div>
                    <h2 className="break-words text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">{currentJob.title}</h2>
                    <p className="mt-3 flex items-start gap-2 text-sm font-semibold text-slate-600"><MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />{currentJob.location || "Arbeitsort nicht angegeben"}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">{[currentJob.workload, currentJob.type, currentJob.isRemote === true ? "Remote möglich" : ""].filter((item) => item && item !== "Nicht angegeben").map((item, index) => <span key={`${index}-${item}`} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700">{item}</span>)}</div>
                  </div>
                  <div className="p-6 sm:p-7">
                    {currentJob.salary ? <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800"><Wallet className="h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />{currentJob.salary}</p> : null}
                    <p className="line-clamp-4 text-sm leading-relaxed text-slate-600">{currentJob.description}</p>
                    <details className="mt-5 border-t border-slate-100 pt-4">
                      <summary className="cursor-pointer py-1 text-sm font-bold text-amber-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600">Mehr zur Stelle</summary>
                      <div className="pt-3"><p className="text-sm leading-relaxed text-slate-600">{currentJob.description}</p><JobDetails title="Deine Aufgaben" items={currentJob.responsibilities} /><JobDetails title="Das bringst du mit" items={currentJob.requirements} /><JobDetails title="Das bietet die Stelle" items={currentJob.benefits} /><Link href={`/jobs/${currentJob.id}`} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-amber-800 underline underline-offset-2">Vollständiges Inserat<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /><span className="sr-only"> (öffnet einen neuen Tab)</span></Link></div>
                    </details>
                  </div>
                </article>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => void saveChoice("pass")} disabled={busy !== null} className="h-auto min-h-14 whitespace-normal rounded-2xl border-slate-300 px-3 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100">{busy === "pass" ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <X className="h-5 w-5" aria-hidden="true" />}Passt nicht</Button>
                  <Button onClick={() => void saveChoice("like")} disabled={busy !== null} className="h-auto min-h-14 whitespace-normal rounded-2xl bg-emerald-700 px-3 py-3 text-sm font-bold text-white hover:bg-emerald-800">{busy === "like" ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Heart className="h-5 w-5" aria-hidden="true" />}Interessiert mich</Button>
                </div>
                <p className="mt-3 text-center text-xs text-slate-600">Die nächste Karte erscheint, sobald deine Auswahl gespeichert ist.</p>
              </>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-7 text-center"><CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-amber-700" aria-hidden="true" /><h2 className="text-xl font-bold">{choiceCount ? "Alle aktuellen Stellen angesehen" : "Gerade keine Stellen zum Swipen"}</h2><p className="mt-3 text-sm leading-relaxed text-slate-600">{choiceCount ? "Sende uns jetzt deine Interessenübersicht. Du musst deinen CV nicht nochmals hochladen." : "Dein CV ist gespeichert. Du kannst später zurückkommen oder in der Stellensuche nachsehen."}</p>{!choiceCount ? <Button variant="outline" onClick={() => void loadSession()} disabled={busy !== null} className="mt-5 min-h-11 w-full rounded-xl">Stellen neu laden</Button> : null}<Link href="/" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-amber-800 underline">Zur Stellensuche</Link></div>
            )}
            <div className="mt-7 border-t border-slate-200 pt-5">
              <Button onClick={() => void finish()} disabled={busy !== null || choiceCount === 0} className="min-h-12 w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800">{busy === "finish" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}Interessen senden</Button>
              <p className="mt-3 text-center text-xs leading-relaxed text-slate-600">{choiceCount === 0 ? "Wähle bei mindestens einer Stelle, ob sie dich interessiert." : "Wir erhalten eine Zusammenfassung deiner Auswahl. Ein Swipe ist keine Einzelbewerbung."}</p>
            </div>
          </section>
        )}
      </main>
      <footer className="mx-auto mt-8 flex max-w-6xl flex-wrap justify-center gap-x-6 gap-y-2 px-4 pb-8 text-xs text-slate-600"><span>elektrojob.ch · Elektrojobs in der Schweiz</span><Link href="/datenschutz" className="underline underline-offset-2">Datenschutz</Link><Link href="/kontakt" className="underline underline-offset-2">Kontakt</Link></footer>
    </div>
  );
}
