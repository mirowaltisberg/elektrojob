import assert from "node:assert/strict";
import test from "node:test";
import {
  ADS_CONSENT_KEY, ADS_CONVERSION, activateGoogleAds, readAdsConsent,
  saveAdsConsent, trackSavedApplication,
} from "./google-ads";

test("Ads measures one confirmed application only with separate consent on production", () => {
  const storage = new Map<string, string>();
  const target = new EventTarget();
  const browser = Object.assign(target, {
    location: new URL("https://www.elektrojob.ch/jobs/test?gclid=test-click&email=private%40example.com&q=private-search"),
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => { storage.set(key, value); },
    },
    jobsiteAdsLayer: [] as unknown[],
  });
  Object.defineProperty(globalThis, "window", { value: browser, configurable: true });
  Object.defineProperty(globalThis, "document", {
    value: { referrer: "https://example.com/private?email=secret", cookie: "_gcl_aw=old; necessary=yes" },
    configurable: true,
  });
  const commands = () => browser.jobsiteAdsLayer.map(item => Array.from(item as ArrayLike<unknown>));
  const conversions = () => commands().filter(command => command[0] === "event");
  const first = "11f095b7-1625-4b90-871b-9a58d57d5c42";
  const second = "22f095b7-1625-4b90-871b-9a58d57d5c42";
  const third = "33f095b7-1625-4b90-871b-9a58d57d5c42";

  // An old anonymous-analytics choice never grants advertising consent.
  storage.set("jobsite-analytics-consent", "accepted");
  assert.equal(readAdsConsent(), null);
  trackSavedApplication(first);
  activateGoogleAds();
  assert.equal(commands().length, 0);

  saveAdsConsent("declined");
  activateGoogleAds();
  trackSavedApplication(first);
  assert.equal(conversions().length, 0);

  // A quick submit while the script loads is discarded if consent is revoked.
  saveAdsConsent("accepted");
  trackSavedApplication(first);
  saveAdsConsent("declined");
  saveAdsConsent("accepted");
  activateGoogleAds();
  assert.equal(conversions().length, 0);
  assert.deepEqual(commands()[0], ["consent", "default", {
    ad_storage: "denied", ad_user_data: "denied",
    ad_personalization: "denied", analytics_storage: "denied",
  }]);

  // Only server-issued UUIDs are accepted; caller payload cannot add PII.
  trackSavedApplication(undefined);
  trackSavedApplication({ name: "private", email: "private@example.com" });
  trackSavedApplication("application-open");
  assert.equal(conversions().length, 0);
  trackSavedApplication(first);
  trackSavedApplication(first);
  assert.equal(conversions().length, 1);
  assert.deepEqual(conversions()[0], ["event", "conversion", {
    send_to: ADS_CONVERSION,
    transaction_id: first,
    page_location: "https://www.elektrojob.ch/jobs/test?gclid=test-click",
    page_referrer: "https://example.com",
    page_title: "Jobwebsite",
  }]);
  assert.doesNotMatch(JSON.stringify(commands()), /private|secret|@example/);

  saveAdsConsent("declined");
  trackSavedApplication(second);
  assert.equal(conversions().length, 1);
  assert.equal((commands().at(-1)?.[2] as Record<string, string>).ad_storage, "denied");

  // Preview/local tests cannot contaminate production conversion reports.
  saveAdsConsent("accepted");
  browser.location = new URL("https://preview.vercel.app/");
  activateGoogleAds();
  trackSavedApplication(second);
  assert.equal(conversions().length, 1);
  browser.location = new URL("https://sanitaerjobs.ch/");
  activateGoogleAds();
  trackSavedApplication(third);
  assert.equal(conversions().length, 2);
  assert.equal(storage.get(ADS_CONSENT_KEY), "accepted");

  // Browser storage restrictions fail closed without breaking the form.
  browser.localStorage.getItem = () => { throw new Error("storage blocked"); };
  assert.equal(readAdsConsent(), null);
  assert.doesNotThrow(() => trackSavedApplication(second));
  assert.equal(conversions().length, 2);
});
