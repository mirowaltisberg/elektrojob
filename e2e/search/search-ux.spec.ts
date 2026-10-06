import { expect, test, type Page } from "@playwright/test";

const queryName = "Welchen Job suchst du?";
const locationName = "Wo? (Ort, Kanton oder PLZ)";

function jobPage(offset = 0, total = 36) {
  return {
    jobs: Array.from({ length: Math.min(12, total - offset) }, (_, index) => ({
      id: `synthetic-job-${offset + index + 1}`,
      title: `Teststelle Elektroinstallateur ${offset + index + 1}`,
      location: "Testort, ZH",
      type: "Festanstellung",
      workload: "100%",
      description: "Erfundene Stelle für einen lokalen Oberflächentest.",
      responsibilities: [], requirements: [], benefits: [],
      datePosted: new Date().toISOString(),
      isNew: false, isUrgent: false, source: "scraped",
    })),
    total, offset, limit: 12,
    facets: { types: [], workloads: [], remote: { true: 0, false: 0, unknown: total } },
    scrapedAt: new Date().toISOString(),
  };
}

async function mockSearch(page: Page, failingOffset?: number) {
  const offsets: number[] = [];
  let fail = failingOffset !== undefined;
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== "http://127.0.0.1:3110" || route.request().method() !== "GET") {
      return route.abort();
    }
    if (url.pathname === "/api/jobs") {
      const offset = Number(url.searchParams.get("offset") ?? "0");
      offsets.push(offset);
      if (fail && offset === failingOffset) {
        return route.fulfill({ status: 503, json: { error: "Synthetic unavailable" } });
      }
      return route.fulfill({ json: jobPage(offset) });
    }
    if (url.pathname === "/api/postal-codes") return route.fulfill({ json: [] });
    return route.continue();
  });
  await page.goto("/");
  await expect(page.getByRole("combobox", { name: queryName })).toHaveCSS("height", "48px");
  await page.getByRole("button", { name: "Nur notwendige Funktionen", exact: true }).click();
  // Wait for hydration and the initial client search.
  if (failingOffset === 0) {
    await expect(page.getByRole("button", { name: "Erneut laden", exact: true })).toBeVisible();
  } else {
    await expect(page.locator('a[href^="/jobs/synthetic-job-"]')).toHaveCount(12);
  }
  return { offsets, recover: () => { fail = false; } };
}

test("keyboard suggestion selection keeps focus and continues to the location field", async ({ page }) => {
  await mockSearch(page);
  const query = page.getByRole("combobox", { name: queryName });
  await query.fill("Montage");
  await query.press("ArrowDown");
  await query.press("Enter");
  await expect(query).toHaveValue("Montage-Elektriker");
  await expect(query).toBeFocused();
  await expect(query).toHaveAttribute("aria-expanded", "false");
  await query.press("Tab");
  const location = page.getByRole("combobox", { name: locationName });
  await expect(location).toBeFocused();
  const submitted = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return url.pathname === "/api/jobs" && url.searchParams.get("q") === "Montage-Elektriker";
  });
  await location.press("Enter");
  await submitted;
});

test("a pointer click selects a suggestion and Escape and Tab close the popup", async ({ page }) => {
  await mockSearch(page);
  const query = page.getByRole("combobox", { name: queryName });
  await query.click();
  await page.getByRole("option", { name: "Automatiker", exact: true }).click();
  await expect(query).toHaveValue("Automatiker");
  await expect(query).toBeFocused();
  await expect(query).toHaveAttribute("aria-expanded", "false");
  await query.press("ArrowDown");
  await expect(query).toHaveAttribute("aria-expanded", "true");
  await query.press("Escape");
  await expect(query).toHaveAttribute("aria-expanded", "false");
  await expect(query).not.toHaveAttribute("aria-activedescendant");
  await query.press("ArrowDown");
  await query.press("Tab");
  await expect(query).toHaveAttribute("aria-expanded", "false");
});

test("touch scrolling suggestions does not choose the first touched item", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Requires a touch viewport");
  await mockSearch(page);
  const query = page.getByRole("combobox", { name: queryName });
  await query.tap();
  const list = page.getByRole("listbox", { name: `${queryName} – Vorschläge` });
  const box = await list.boundingBox();
  if (!box) throw new Error("Suggestions are not visible");
  const session = await page.context().newCDPSession(page);
  const x = box.x + box.width / 2;
  const y = box.y + Math.min(box.height - 25, 150);
  await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  await expect(query).toHaveValue("");
  for (let step = 1; step <= 6; step++) {
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove", touchPoints: [{ x, y: y - step * 18 }],
    });
  }
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(query).toHaveValue("");
  await expect(query).toHaveAttribute("aria-expanded", "true");
  await expect.poll(() => list.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("touch-suggestions.png") });
  const option = page.getByRole("option", { name: "Betriebselektriker", exact: true });
  await option.scrollIntoViewIfNeeded();
  await option.tap();
  await expect(query).toHaveValue("Betriebselektriker");
  await expect(query).toHaveAttribute("aria-expanded", "false");
  await session.detach();
});

test("a failed next page is retried in place without losing loaded jobs", async ({ page }, testInfo) => {
  const { offsets, recover } = await mockSearch(page, 24);
  const jobs = page.locator('a[href^="/jobs/synthetic-job-"]');
  const more = page.getByRole("button", { name: "Weitere Jobs laden", exact: true });
  if (testInfo.project.name === "mobile") await more.scrollIntoViewIfNeeded();
  else await more.click();
  await expect(jobs).toHaveCount(24);
  if (testInfo.project.name === "mobile") await more.scrollIntoViewIfNeeded();
  else await more.click();
  const retry = page.getByRole("button", { name: "Weitere Jobs erneut laden", exact: true });
  await expect(retry).toBeVisible();
  const error = page.getByRole("alert").filter({ hasText: "Deine bisher geladenen Stellen bleiben erhalten" });
  await expect(error).toBeVisible();
  await expect(jobs).toHaveCount(24);
  if (testInfo.project.name === "mobile") {
    await page.getByRole("heading", { name: "Teststelle Elektroinstallateur 20", exact: true }).scrollIntoViewIfNeeded();
    await retry.scrollIntoViewIfNeeded();
    await expect(error).toBeVisible();
  }
  const beforeRetry = [...offsets];
  expect(offsets.filter((offset) => offset === 24)).toHaveLength(1);
  await retry.scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath("pagination-error.png"), fullPage: false });
  recover();
  await retry.click();
  await expect(jobs).toHaveCount(36);
  expect(offsets).toEqual([...beforeRetry, 24]);
  await expect(error).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Weitere Jobs laden", exact: true })).toHaveCount(0);
});

test("initial search failure still retries the first page", async ({ page }) => {
  const { offsets, recover } = await mockSearch(page, 0);
  const retry = page.getByRole("button", { name: "Erneut laden", exact: true });
  await expect(retry).toBeVisible();
  const beforeRetry = [...offsets];
  recover();
  await retry.click();
  await expect(page.locator('a[href^="/jobs/synthetic-job-"]')).toHaveCount(12);
  expect(offsets).toEqual([...beforeRetry, 0]);
});

test("a new search clears a pagination failure and starts at the first page", async ({ page }, testInfo) => {
  const { offsets } = await mockSearch(page, 12);
  const more = page.getByRole("button", { name: "Weitere Jobs laden", exact: true });
  if (testInfo.project.name === "mobile") await more.scrollIntoViewIfNeeded();
  else await more.click();
  await expect(page.getByRole("button", { name: "Weitere Jobs erneut laden", exact: true })).toBeVisible();
  const query = page.getByRole("combobox", { name: queryName });
  await query.fill("Neuer Suchbegriff");
  await query.press("Enter");
  await expect(page.locator('a[href^="/jobs/synthetic-job-"]')).toHaveCount(12);
  await expect(page.getByRole("button", { name: "Weitere Jobs erneut laden", exact: true })).toHaveCount(0);
  expect(offsets.at(-1)).toBe(0);
});
