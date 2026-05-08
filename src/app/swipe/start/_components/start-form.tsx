"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Loader2,
  MapPin,
  UploadCloud,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useHaptic } from "@/hooks/use-haptic";
import { SWIPE_COPY } from "@/lib/swipe/copy";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const PLZ_RE = /^[0-9]{4}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+0-9 ()/-]{7,}$/;

interface PlzSuggestion {
  plz: string;
  label: string;
}

export function StartForm() {
  const router = useRouter();
  const { trigger } = useHaptic();

  const [plz, setPlz] = useState("");
  const [plzMunicipality, setPlzMunicipality] = useState<string | null>(null);
  const [plzSuggestions, setPlzSuggestions] = useState<PlzSuggestion[]>([]);
  const [showPlzSuggestions, setShowPlzSuggestions] = useState(false);

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // PLZ autocomplete — debounced
  useEffect(() => {
    if (!plz || plz.length < 2) {
      setPlzSuggestions([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/postal-codes?q=${encodeURIComponent(plz)}&limit=6`,
        );
        const data: string[] = await res.json();
        const cleaned: PlzSuggestion[] = data
          .filter((label) => /^\d{4}\s/.test(label))
          .map((label) => ({
            plz: label.slice(0, 4),
            label,
          }));
        setPlzSuggestions(cleaned);
      } catch {
        // Silent — don't bother the user if autocomplete fails.
      }
    }, 140);
    return () => clearTimeout(t);
  }, [plz]);

  const handlePlzPick = (s: PlzSuggestion) => {
    trigger("selection");
    setPlz(s.plz);
    setPlzMunicipality(s.label);
    setShowPlzSuggestions(false);
  };

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) return SWIPE_COPY.errors.cvType;
    if (file.size > MAX_FILE_SIZE) return SWIPE_COPY.errors.cvSize;
    return null;
  };

  const handleFile = (file: File) => {
    const err = validateFile(file);
    if (err) {
      trigger("error");
      setError(err);
      return;
    }
    trigger("selection");
    setError(null);
    setCvFile(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!PLZ_RE.test(plz)) {
      setError(SWIPE_COPY.errors.plzInvalid);
      trigger("error");
      return;
    }
    if (!cvFile) {
      setError(SWIPE_COPY.errors.cvMissing);
      trigger("error");
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setError(SWIPE_COPY.errors.emailInvalid);
      trigger("error");
      return;
    }
    if (!PHONE_RE.test(phone)) {
      setError(SWIPE_COPY.errors.phoneInvalid);
      trigger("error");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("plz", plz);
      fd.append("email", email);
      fd.append("phone", phone);
      fd.append("cv", cvFile);

      const res = await fetch("/api/swipe/session", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data as { error?: string }).error ?? "network",
        );
      }

      trigger("success");
      router.push("/swipe/stack");
    } catch (err) {
      setSubmitting(false);
      trigger("error");
      setError(
        err instanceof Error
          ? mapErrorCode(err.message)
          : SWIPE_COPY.errors.network,
      );
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <form onSubmit={submit} className="mt-8 space-y-7">
      {/* PLZ */}
      <section className="swipe-section space-y-2 [animation-delay:0.05s]">
        <Label htmlFor="swipe-plz" className="text-sm font-semibold text-slate-900">
          {SWIPE_COPY.start.plzLabel}
        </Label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <MapPin className="h-4 w-4" aria-hidden />
          </span>
          <Input
            id="swipe-plz"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={4}
            value={plz}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 4);
              setPlz(v);
              setPlzMunicipality(null);
              setShowPlzSuggestions(true);
            }}
            onFocus={() => setShowPlzSuggestions(true)}
            onBlur={() => setTimeout(() => setShowPlzSuggestions(false), 150)}
            placeholder={SWIPE_COPY.start.plzPlaceholder}
            className="
              h-12 rounded-xl pl-9 text-base
              focus-visible:shadow-[0_0_0_3px_oklch(0.795_0.155_75_/_20%)]
            "
          />
          {showPlzSuggestions && plzSuggestions.length > 0 && (
            <ul
              role="listbox"
              className="
                search-dropdown search-dropdown-open absolute z-20 mt-2 w-full
                overflow-hidden rounded-xl bg-white ring-1 ring-slate-200/80
                shadow-[0_10px_40px_-10px_rgb(0_0_0_/_0.18)]
              "
            >
              {plzSuggestions.map((s) => (
                <li key={s.label}>
                  <button
                    type="button"
                    onClick={() => handlePlzPick(s)}
                    className="
                      search-dropdown-item flex w-full items-center justify-between
                      px-4 py-2.5 text-left text-sm text-slate-800
                    "
                  >
                    <span>{s.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {plzMunicipality && (
          <p className="text-xs text-slate-500">{plzMunicipality}</p>
        )}
      </section>

      {/* CV */}
      <section className="swipe-section space-y-2 [animation-delay:0.10s]">
        <Label className="text-sm font-semibold text-slate-900">
          {SWIPE_COPY.start.cvLabel}
        </Label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="sr-only"
          onChange={onFileChange}
        />
        {!cvFile ? (
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
            }}
            onDrop={onDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            className={`
              group flex cursor-pointer flex-col items-center justify-center
              rounded-2xl border-2 border-dashed p-6 text-center transition-colors
              ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-slate-200 bg-white hover:border-primary/50 hover:bg-slate-50"
              }
            `}
          >
            <div
              className="
                flex h-12 w-12 items-center justify-center rounded-full bg-primary/10
                transition-transform duration-200 ease-out group-hover:scale-110
              "
            >
              <UploadCloud className="h-6 w-6 text-primary" />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-900">
              Klicken oder Datei hineinziehen
            </p>
            <p className="mt-1 text-xs text-slate-500">{SWIPE_COPY.start.cvHint}</p>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {cvFile.name}
              </p>
              <p className="text-xs text-slate-500">{formatFileSize(cvFile.size)}</p>
            </div>
            <span className="inline-flex h-7 items-center gap-1 rounded-full bg-emerald-50 px-2 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              Bereit
            </span>
            <button
              type="button"
              onClick={() => {
                trigger("selection");
                setCvFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="
                rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600
                transition-colors
              "
              aria-label="Datei entfernen"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </section>

      {/* Email */}
      <section className="swipe-section space-y-2 [animation-delay:0.15s]">
        <Label htmlFor="swipe-email" className="text-sm font-semibold text-slate-900">
          {SWIPE_COPY.start.emailLabel}
        </Label>
        <Input
          id="swipe-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={SWIPE_COPY.start.emailPlaceholder}
          className="
            h-12 rounded-xl text-base
            focus-visible:shadow-[0_0_0_3px_oklch(0.795_0.155_75_/_20%)]
          "
        />
      </section>

      {/* Phone */}
      <section className="swipe-section space-y-2 [animation-delay:0.20s]">
        <Label htmlFor="swipe-phone" className="text-sm font-semibold text-slate-900">
          {SWIPE_COPY.start.phoneLabel}
        </Label>
        <Input
          id="swipe-phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={SWIPE_COPY.start.phonePlaceholder}
          className="
            h-12 rounded-xl text-base
            focus-visible:shadow-[0_0_0_3px_oklch(0.795_0.155_75_/_20%)]
          "
        />
      </section>

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600 ring-1 ring-red-100">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      )}

      <p className="text-xs leading-relaxed text-slate-500">
        {SWIPE_COPY.start.privacy}
      </p>

      <button
        type="submit"
        disabled={submitting}
        className="
          btn-interactive
          flex h-14 w-full items-center justify-center gap-2
          rounded-2xl bg-primary text-base font-extrabold text-primary-foreground
          shadow-lg shadow-primary/30
          disabled:cursor-not-allowed disabled:opacity-70
        "
      >
        {submitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            {SWIPE_COPY.start.submitting}
          </>
        ) : (
          <>
            {SWIPE_COPY.start.submit}
            <ArrowRight className="h-5 w-5" aria-hidden />
          </>
        )}
      </button>
    </form>
  );
}

function mapErrorCode(code: string): string {
  switch (code) {
    case "plz_invalid":
      return SWIPE_COPY.errors.plzInvalid;
    case "email_invalid":
      return SWIPE_COPY.errors.emailInvalid;
    case "phone_invalid":
      return SWIPE_COPY.errors.phoneInvalid;
    case "cv_missing":
      return SWIPE_COPY.errors.cvMissing;
    case "cv_type":
      return SWIPE_COPY.errors.cvType;
    case "cv_size":
      return SWIPE_COPY.errors.cvSize;
    default:
      return SWIPE_COPY.errors.network;
  }
}
