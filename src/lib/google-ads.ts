"use client";

export const ADS_TAG_ID = "AW-18434284216";
export const ADS_CONVERSION = `${ADS_TAG_ID}/jv6KCMGvs_AcELi1k9ZE`;
export const ADS_CONSENT_KEY = "jobsite-google-ads-consent-v1";
export const ADS_CONSENT_EVENT = "jobsite:google-ads-consent-change";
export type AdsConsentChoice = "accepted" | "declined" | null;

declare global {
  interface Window {
    jobsiteAdsLayer?: unknown[];
  }
}

const hosts = new Set([
  "elektrojob.ch", "www.elektrojob.ch",
  "gaertnerjob.ch", "www.gaertnerjob.ch",
  "sanitaerjobs.ch", "www.sanitaerjobs.ch",
]);
const pending = new Set<string>();
const sent = new Set<string>();
let ready = false;

export function readAdsConsent(): AdsConsentChoice {
  if (typeof window === "undefined") return null;
  try {
    const choice = window.localStorage.getItem(ADS_CONSENT_KEY);
    return choice === "accepted" || choice === "declined" ? choice : null;
  } catch {
    return null;
  }
}

export function isProductionAdsHost(): boolean {
  return typeof window !== "undefined" && hosts.has(window.location.hostname);
}

function canMeasure(): boolean {
  return isProductionAdsHost() && readAdsConsent() === "accepted";
}

// A separate layer prevents ordinary site events from being routed to Ads.
function adsTag(...commands: unknown[]) {
  window.jobsiteAdsLayer ??= [];
  // Google gtag's command format is an Arguments object, not a data event.
  // eslint-disable-next-line prefer-rest-params
  window.jobsiteAdsLayer.push(arguments);
  void commands;
}

function measurementUrl(): string {
  const url = new URL(window.location.origin + window.location.pathname);
  const query = new URLSearchParams(window.location.search);
  for (const key of ["gclid", "gbraid", "wbraid"]) {
    const value = query.get(key);
    if (value && /^[A-Za-z0-9_-]{1,250}$/.test(value)) url.searchParams.set(key, value);
  }
  return url.href;
}

function safeReferrer(): string {
  try { return document.referrer ? new URL(document.referrer).origin : ""; }
  catch { return ""; }
}

function updateGoogleConsent(accepted: boolean) {
  adsTag("consent", "update", {
    ad_storage: accepted ? "granted" : "denied",
    ad_user_data: accepted ? "granted" : "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  });
}

export function activateGoogleAds(): void {
  if (!canMeasure()) return;
  if (!ready) {
    adsTag("consent", "default", {
      ad_storage: "denied", ad_user_data: "denied",
      ad_personalization: "denied", analytics_storage: "denied",
    });
    adsTag("set", "ads_data_redaction", true);
    adsTag("set", "url_passthrough", false);
    adsTag("js", new Date());
    updateGoogleConsent(true);
    adsTag("config", ADS_TAG_ID, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_expires: 90 * 24 * 60 * 60,
      page_location: measurementUrl(),
      page_referrer: safeReferrer(),
      page_title: "Jobwebsite",
    });
    ready = true;
  } else {
    updateGoogleConsent(true);
  }
  for (const id of pending) sendConversion(id);
  pending.clear();
}

function sendConversion(id: string) {
  if (!canMeasure() || sent.has(id)) return;
  sent.add(id);
  adsTag("event", "conversion", {
    send_to: ADS_CONVERSION,
    transaction_id: id,
    page_location: measurementUrl(),
    page_referrer: safeReferrer(),
    page_title: "Jobwebsite",
  });
}

/** Call only with the opaque ID returned after a successful server save. */
export function trackSavedApplication(id: unknown): void {
  try {
    if (!canMeasure() || typeof id !== "string" ||
        !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(id)) return;
    if (ready) sendConversion(id);
    else pending.add(id);
  } catch {
    // Measurement must never turn a saved application into a visible error.
  }
}

function removeAdsCookies() {
  const parts = window.location.hostname.split(".");
  const domains = ["", ...parts.slice(0, -1).map((_, i) => parts.slice(i).join("."))];
  for (const entry of document.cookie.split(";")) {
    const name = entry.trim().split("=")[0];
    if (!/^_gcl_/.test(name)) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; Path=/;${domain ? ` Domain=${domain};` : ""} SameSite=Lax`;
    }
  }
}

export function syncAdsConsent(): void {
  const accepted = readAdsConsent() === "accepted";
  if (ready) updateGoogleConsent(accepted);
  if (!accepted) {
    pending.clear();
    removeAdsCookies();
  }
}

export function saveAdsConsent(choice: Exclude<AdsConsentChoice, null>): boolean {
  try { window.localStorage.setItem(ADS_CONSENT_KEY, choice); }
  catch { return false; }
  syncAdsConsent();
  window.dispatchEvent(new Event(ADS_CONSENT_EVENT));
  return true;
}

export function subscribeAdsConsent(onChange: () => void): () => void {
  const update = () => { syncAdsConsent(); onChange(); };
  const onStorage = (event: StorageEvent) => {
    if (event.key === ADS_CONSENT_KEY || event.key === null) update();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(ADS_CONSENT_EVENT, update);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(ADS_CONSENT_EVENT, update);
  };
}
