"use client";

import Script from "next/script";
import { useState, useSyncExternalStore } from "react";
import {
  ADS_TAG_ID, activateGoogleAds, isProductionAdsHost, readAdsConsent,
  saveAdsConsent, subscribeAdsConsent, type AdsConsentChoice,
} from "@/lib/google-ads";

type Props = {
  analyticsChoice?: AdsConsentChoice;
  onAnalyticsChoice?: (choice: "accepted" | "declined") => void;
};

function ConsentDialog({ analyticsChoice, onAnalyticsChoice, adsChoice, onClose }: Props & {
  adsChoice: AdsConsentChoice;
  onClose: () => void;
}) {
  const [analytics, setAnalytics] = useState(analyticsChoice === "accepted");
  const [ads, setAds] = useState(adsChoice === "accepted");
  const [error, setError] = useState(false);
  const save = (allowAnalytics: boolean, allowAds: boolean) => {
    if (!saveAdsConsent(allowAds ? "accepted" : "declined")) {
      setError(true);
      return;
    }
    onAnalyticsChoice?.(allowAnalytics ? "accepted" : "declined");
    onClose();
  };

  return (
    <aside className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-h-[80dvh] max-w-3xl overflow-y-auto rounded-xl border border-slate-300 bg-white p-4 text-slate-900 shadow-2xl sm:p-5"
      role="dialog" aria-modal="false" aria-labelledby="tracking-consent-title">
      <h2 id="tracking-consent-title" className="text-base font-bold">Deine Tracking-Auswahl</h2>
      <p className="mt-2 text-sm">Du kannst die Website und das Bewerbungsformular auch ohne optionales Tracking nutzen.</p>
      <div className="mt-3 space-y-3 text-sm">
        {onAnalyticsChoice && (
          <label className="flex items-start gap-3">
            <input type="checkbox" className="mt-1 h-5 w-5 shrink-0" checked={analytics} onChange={e => setAnalytics(e.target.checked)} />
            <span><strong>Eigene Nutzungsanalyse</strong><br />Seitenaufrufe, Klicks und Bewerbungsschritte mit zufälliger Sitzungs-ID. Keine Formulareingaben, Kontaktdaten oder Lebensläufe.</span>
          </label>
        )}
        <label className="flex items-start gap-3">
          <input type="checkbox" className="mt-1 h-5 w-5 shrink-0" checked={ads} onChange={e => setAds(e.target.checked)} />
          <span><strong>Google-Werbemessung</strong><br />Google erhält technische Geräte- und Verbindungsdaten sowie die Information, ob eine Bewerbung gespeichert wurde. Cookies ordnen Bewerbungen einem Anzeigenklick zu. Keine Bewerbungsinhalte und keine personalisierte Werbung. Eine Verarbeitung in den USA ist möglich.</span>
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="min-h-11 rounded border border-slate-400 px-4 font-semibold" onClick={() => save(false, false)}>Nur notwendige Funktionen</button>
        <button type="button" className="min-h-11 rounded border border-slate-400 px-4 font-semibold" onClick={() => save(analytics, ads)}>Auswahl speichern</button>
        <button type="button" className="min-h-11 rounded border border-slate-400 px-4 font-semibold" onClick={() => save(true, true)}>Alle erlauben</button>
      </div>
      <p className="mt-3 text-xs">Jederzeit änderbar unter «Tracking-Einstellungen». <a href="/werbemessung" className="underline">Details zur Google-Werbemessung</a>{onAnalyticsChoice && <> · <a href="/datenschutz" className="underline">Datenschutz</a></>}</p>
      {error && <p role="alert" className="mt-2 text-sm text-red-700">Dein Browser konnte die Auswahl nicht speichern. Google-Werbemessung bleibt ausgeschaltet.</p>}
    </aside>
  );
}

export function AdsConsent(props: Props) {
  const consent = useSyncExternalStore(subscribeAdsConsent, readAdsConsent, () => null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const show = settingsOpen || consent === null || (props.onAnalyticsChoice && props.analyticsChoice === null);
  return <>
    {consent === "accepted" && isProductionAdsHost() && (
      <Script id="jobsite-google-ads" src={`https://www.googletagmanager.com/gtag/js?id=${ADS_TAG_ID}&l=jobsiteAdsLayer`}
        strategy="afterInteractive" onReady={activateGoogleAds} />
    )}
    {show ? (
      <ConsentDialog key={`${consent}-${props.analyticsChoice}`} {...props} adsChoice={consent} onClose={() => setSettingsOpen(false)} />
    ) : (
      <button type="button" className="fixed bottom-2 left-2 z-40 rounded border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 shadow-sm" onClick={() => setSettingsOpen(true)}>Tracking-Einstellungen</button>
    )}
  </>;
}
