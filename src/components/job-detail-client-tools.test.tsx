import assert from "node:assert/strict";
import test from "node:test";
import { renderToString } from "react-dom/server";
import { RecentlyViewedJobs } from "./job-detail-client-tools";

test("recent visits do not change the initial markup before hydration", () => {
  let storageReads = 0;
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { localStorage: { getItem: () => {
      storageReads += 1;
      return JSON.stringify([{
        id: "scraped-elektro-123456abcdef", title: "Elektroniker/in", location: "Bern",
        href: "/jobs/scraped-elektro-123456abcdef", source: "scraped", viewedAt: "2026-09-08T08:00:00Z",
      }]);
    } } },
  });
  try {
    const markup = renderToString(<RecentlyViewedJobs
      jobId="scraped-elektro-abcdef123456" jobTitle="Elektroinstallateur/in"
      location="Zürich" source="scraped" currentHref="/jobs/scraped-elektro-abcdef123456"
    />);
    assert.equal(markup, "");
    assert.equal(storageReads, 0);
  } finally {
    if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
    else Reflect.deleteProperty(globalThis, "window");
  }
});
