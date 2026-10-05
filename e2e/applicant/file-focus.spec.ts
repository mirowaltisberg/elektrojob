import { expect, test, type Locator, type Page } from "@playwright/test";

const observations = new WeakMap<Page, { writes: string[]; pageErrors: string[] }>();

const pdf = (name = "synthetischer-lebenslauf.pdf") => ({
  name,
  mimeType: "application/pdf",
  buffer: Buffer.from("%PDF-1.4\nSynthetic local fixture only.\n%%EOF\n"),
});

async function chooseFile(page: Page, button: Locator, file = pdf()) {
  await button.focus();
  const chooser = page.waitForEvent("filechooser");
  await page.keyboard.press("Enter");
  await (await chooser).setFiles(file);
}

test.beforeEach(async ({ context, page }) => {
  const writes: string[] = [];
  const pageErrors: string[] = [];
  observations.set(page, { writes, pageErrors });
  page.on("pageerror", error => pageErrors.push(error.message));
  await context.route("**/*", route => {
    const request = route.request();
    const url = new URL(request.url());
    if (request.method() !== "GET") writes.push(`${request.method()} ${url.pathname}`);
    return url.origin !== "http://127.0.0.1:3112" || request.method() !== "GET"
      ? route.abort()
      : route.continue();
  });
  // No test submits a form, including synthetic submissions. Assert that any
  // accidental submit event is caught, even if native validation blocks HTTP.
  await page.addInitScript(() => {
    document.addEventListener("submit", event => {
      event.preventDefault();
      throw new Error("Applicant focus tests must never submit forms");
    }, true);
  });
  await page.goto("/jobs/scraped-elektro-abcdef123456");
  await page.getByRole("button", { name: "Nur notwendige Funktionen", exact: true }).click();
  await page.getByRole("button", { name: "Bewerbung starten", exact: true }).filter({ visible: true }).click();
  const name = page.getByRole("textbox", { name: "Vollständiger Name" });
  await expect(name).toHaveCSS("height", "44px");
  await name.fill("Testperson Muster");
  test.info().annotations.push({ type: "safety", description: "Local synthetic listing and PDF; no submissions" });
});

test.afterEach(async ({ page }) => {
  expect(observations.get(page)).toEqual({ writes: [], pageErrors: [] });
});

test("selection and removal keep a useful keyboard position", async ({ page }) => {
  const dialog = page.getByRole("dialog");
  await chooseFile(page, dialog.getByRole("button", { name: "PDF-Lebenslauf auswählen", exact: true }));
  const change = dialog.getByRole("button", { name: "Anderen CV wählen", exact: true });
  await expect(change).toBeFocused();
  await expect(dialog.locator("#apply-cv-status")).toHaveText(`Ausgewählt: ${pdf().name}`);
  await expect(change).toHaveAccessibleDescription(new RegExp(pdf().name.replaceAll(".", "\\.")));
  await page.screenshot({ animations: "disabled", path: test.info().outputPath("selected-file.png") });
  await page.keyboard.press("Tab");
  await expect(dialog.getByRole("button", { name: "PDF entfernen", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(dialog.getByRole("button", { name: "PDF-Lebenslauf auswählen", exact: true })).toBeFocused();
  await expect(dialog.locator("#apply-cv-status")).toHaveText("Kein PDF ausgewählt.");
  await page.screenshot({ animations: "disabled", path: test.info().outputPath("removed-file.png") });
  await page.keyboard.press("Tab");
  await expect(dialog.getByRole("checkbox")).toBeFocused();
});

test("replacement and an empty chooser retain the file and focus", async ({ page }) => {
  const dialog = page.getByRole("dialog");
  await chooseFile(page, dialog.getByRole("button", { name: "PDF-Lebenslauf auswählen", exact: true }));
  const change = dialog.getByRole("button", { name: "Anderen CV wählen", exact: true });
  await chooseFile(page, change, pdf("ersatz-lebenslauf.pdf"));
  await expect(dialog.locator("#apply-cv-status")).toHaveText("Ausgewählt: ersatz-lebenslauf.pdf");
  await expect(change).toBeFocused();
  const chooser = page.waitForEvent("filechooser");
  await page.keyboard.press("Enter");
  await (await chooser).setFiles([]);
  await expect(dialog.locator("#apply-cv-status")).toHaveText("Ausgewählt: ersatz-lebenslauf.pdf");
  await expect(change).toBeFocused();
});

test("invalid replacement keeps the previous file and offers recovery", async ({ page }) => {
  const dialog = page.getByRole("dialog");
  const picker = dialog.getByRole("button", { name: "PDF-Lebenslauf auswählen", exact: true });
  const invalid = { ...pdf("keine-pdf.pdf"), buffer: Buffer.from("This is not a PDF document.") };
  await chooseFile(page, picker, invalid);
  await expect(dialog.getByRole("alert")).toContainText("keine gültige PDF-Datei");
  await expect(picker).toBeFocused();
  await chooseFile(page, picker);
  const change = dialog.getByRole("button", { name: "Anderen CV wählen", exact: true });
  await expect(dialog.getByRole("alert")).toHaveCount(0);
  await chooseFile(page, change, invalid);
  await expect(dialog.getByRole("alert")).toContainText("keine gültige PDF-Datei");
  await expect(dialog.locator("#apply-cv-status")).toHaveText(`Ausgewählt: ${pdf().name}`);
  await expect(change).toBeFocused();
  await chooseFile(page, change, pdf("korrigiert.pdf"));
  await expect(dialog.getByRole("alert")).toHaveCount(0);
  await expect(dialog.locator("#apply-cv-status")).toHaveText("Ausgewählt: korrigiert.pdf");
});

test("completing validation does not steal focus after the user moves on", async ({ page }) => {
  await page.evaluate(() => {
    const original = File.prototype.arrayBuffer;
    File.prototype.arrayBuffer = async function () {
      await new Promise<void>(resolve => { window.addEventListener("finish-test-file-read", () => resolve(), { once: true }); });
      return original.call(this);
    };
  });
  const dialog = page.getByRole("dialog");
  await chooseFile(page, dialog.getByRole("button", { name: "PDF-Lebenslauf auswählen", exact: true }));
  await expect(dialog.getByText("PDF wird geprüft...", { exact: true })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(dialog.getByRole("checkbox")).toBeFocused();
  await page.evaluate(() => window.dispatchEvent(new Event("finish-test-file-read")));
  await expect(dialog.locator("#apply-cv-status")).toHaveText(`Ausgewählt: ${pdf().name}`);
  await expect(dialog.getByRole("checkbox")).toBeFocused();
});

test("closing and reopening retains the draft without mobile overflow", async ({ page }) => {
  const dialog = page.getByRole("dialog");
  const file = pdf(`${"synthetischer-langer-dateiname-".repeat(3)}.pdf`);
  await chooseFile(page, dialog.getByRole("button", { name: "PDF-Lebenslauf auswählen", exact: true }), file);
  await expect(dialog.getByText(file.name, { exact: true })).toBeVisible();
  await expect.poll(() => dialog.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.screenshot({ animations: "disabled", path: test.info().outputPath("long-filename.png") });
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  const trigger = page.getByRole("button", { name: "Bewerbung starten", exact: true }).filter({ visible: true });
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(dialog.getByRole("textbox", { name: "Vollständiger Name" })).toHaveValue("Testperson Muster");
  await expect(dialog.locator("#apply-cv-status")).toHaveText(`Ausgewählt: ${file.name}`);
});
