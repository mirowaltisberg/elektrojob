import assert from "node:assert/strict";
import test from "node:test";
import {
  ApplicationRequestTooLarge,
  InvalidApplicationRequest,
  getApplicationOrigins,
  getSingleFile,
  getSingleString,
  isSameOrigin,
  parseBoundedFormData,
} from "./application-request";
import { MAX_APPLICATION_REQUEST_BYTES } from "./application-validation";

const production = "https://www.elektrojob.ch";
const preview = "https://elektrojob-check-abc.vercel.app";
const branch = "https://elektrojob-git-check-team.vercel.app";
const previewEnvironment = {
  VERCEL_ENV: "preview",
  VERCEL_URL: new URL(preview).hostname,
  VERCEL_BRANCH_URL: new URL(branch).hostname,
};

function request(origin: string | null, fetchSite = "same-origin") {
  const headers = new Headers({ "sec-fetch-site": fetchSite });
  if (origin !== null) headers.set("origin", origin);
  return new Request(`${preview}/api/applications`, { method: "POST", headers });
}

function formRequest(form: FormData) {
  return new Request(`${production}/api/applications`, { method: "POST", body: form });
}

test("Vorschau-Bewerbungen funktionieren nur auf den exakt konfigurierten Auslieferungsadressen", () => {
  const origins = getApplicationOrigins(previewEnvironment);
  for (const origin of [production, "https://elektrojob.ch", preview, branch]) {
    assert.equal(isSameOrigin(request(origin), origins), true);
  }
  for (const origin of [null, "null", "https://other.vercel.app", `${preview}.attacker.invalid`, "http://elektrojob-check-abc.vercel.app", "http://localhost:3000"]) {
    assert.equal(isSameOrigin(request(origin), origins), false);
  }
  assert.equal(isSameOrigin(request(preview, "cross-site"), origins), false);
  assert.equal(isSameOrigin(request(preview, "same-site"), origins), false);
  const spoofed = request("https://other.vercel.app");
  spoofed.headers.set("host", new URL(preview).hostname);
  spoofed.headers.set("x-forwarded-host", new URL(preview).hostname);
  assert.equal(isSameOrigin(spoofed, origins), false);
});

test("Produktions- und Entwicklungsumgebungen erhalten keine Vorschau-Ausnahme", () => {
  for (const VERCEL_ENV of [undefined, "production", "development"]) {
    const origins = getApplicationOrigins({ ...previewEnvironment, VERCEL_ENV });
    assert.deepEqual(origins, [production, "https://elektrojob.ch"]);
    assert.equal(isSameOrigin(request(preview), origins), false);
  }
  for (const VERCEL_URL of ["*.vercel.app", "https://example.vercel.app", "example.vercel.app/path", "example.vercel.app:443", "example.vercel.app@attacker.invalid", "-invalid.vercel.app"]) {
    assert.deepEqual(getApplicationOrigins({ VERCEL_ENV: "preview", VERCEL_URL }), [production, "https://elektrojob.ch"]);
  }
});

test("Ein vollständiges Formular mit Name, PDF und Einwilligung behält Datei und Felder unverändert", async () => {
  const form = new FormData();
  form.set("name", "  Max Muster  ");
  form.set("consent", "yes");
  form.set("cv", new File(["%PDF-1.7\nsynthetischer Test\n%%EOF"], "CV Müller.pdf", { type: "application/pdf" }));
  const parsed = await parseBoundedFormData(formRequest(form));
  assert.equal(getSingleString(parsed, "name"), "Max Muster");
  assert.equal(getSingleString(parsed, "consent"), "yes");
  const pdf = getSingleFile(parsed, "cv");
  assert.equal(pdf.name, "CV Müller.pdf");
  assert.equal(await pdf.text(), "%PDF-1.7\nsynthetischer Test\n%%EOF");
});

test("Beschädigte Multipart-Daten werden als Eingabefehler erkannt", async () => {
  const malformed = new Request(`${production}/api/applications`, {
    method: "POST",
    headers: { "content-type": "multipart/form-data; boundary=expected" },
    body: "--unexpected\r\nContent-Disposition: form-data; name=\"name\"\r\n\r\nTest",
  });
  await assert.rejects(parseBoundedFormData(malformed), InvalidApplicationRequest);
  await assert.rejects(parseBoundedFormData(new Request(`${production}/api/applications`, {
    method: "POST", headers: { "content-type": "application/json" }, body: "{}",
  })), InvalidApplicationRequest);
});

test("Unbekannte, doppelte und falsch typisierte Felder werden zurückgewiesen", async () => {
  const unknown = new FormData();
  unknown.set("unexpected", "value");
  await assert.rejects(parseBoundedFormData(formRequest(unknown)), InvalidApplicationRequest);
  const duplicate = new FormData();
  duplicate.append("name", "Max");
  duplicate.append("name", "Muster");
  const parsed = await parseBoundedFormData(formRequest(duplicate));
  assert.throws(() => getSingleString(parsed, "name"), InvalidApplicationRequest);
  assert.throws(() => getSingleFile(parsed, "name"), InvalidApplicationRequest);
  assert.throws(() => getSingleString(parsed, "missing"), InvalidApplicationRequest);
});

test("Zu grosse Uploads werden auch ohne Content-Length begrenzt", async () => {
  const oversized = new Request(`${production}/api/applications`, {
    method: "POST",
    headers: { "content-type": "multipart/form-data; boundary=oversized" },
    body: new Uint8Array(MAX_APPLICATION_REQUEST_BYTES + 1),
  });
  assert.equal(oversized.headers.has("content-length"), false);
  await assert.rejects(parseBoundedFormData(oversized), ApplicationRequestTooLarge);
  const declared = formRequest(new FormData());
  declared.headers.set("content-length", String(MAX_APPLICATION_REQUEST_BYTES + 1));
  await assert.rejects(parseBoundedFormData(declared), ApplicationRequestTooLarge);
});
