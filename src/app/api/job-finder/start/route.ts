import { createHash } from "node:crypto";
import { applicationIdentity, isSubmissionId } from "@/lib/application-persistence";
import { ApplicationRequestTooLarge, InvalidApplicationRequest, getSingleFile, getSingleString, parseBoundedFormData } from "@/lib/application-request";
import { MAX_APPLICATION_PDF_BYTES, hasDisallowedPdfFeatures, hasPdfMagic, isAcceptableFormAge, isAcceptedPdfMimeType, isValidPdfFilename, isValidPlainText } from "@/lib/application-validation";
import { verifyApplicationTestRun } from "@/lib/application-test-run";
import { FinderError, finderDeck, finderFailure, finderIpHash, finderJson, finderPayload, finderSecret, getFinderRecord, requireFinderOrigin, setFinderCookie, type FinderRecord } from "@/lib/job-finder-server";
import { createAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 60;
const allowedFields = new Set(["name", "cv", "consent", "website", "formStartedAt", "submissionId", "testRunId", "testToken"]);

export async function POST(request: Request) {
  try {
    requireFinderOrigin(request);
    const ipHash = finderIpHash(request);
    const form = await parseBoundedFormData(request);
    for (const field of form.keys()) if (!allowedFields.has(field)) throw new FinderError("Ungültige Anfrage.");
    const name = getSingleString(form, "name");
    const submissionId = getSingleString(form, "submissionId");
    const consent = getSingleString(form, "consent");
    const website = getSingleString(form, "website");
    const startedAt = getSingleString(form, "formStartedAt");
    const testRunId = form.has("testRunId") ? getSingleString(form, "testRunId") : "";
    const testToken = form.has("testToken") ? getSingleString(form, "testToken") : "";
    const file = getSingleFile(form, "cv");
    if (website || consent !== "yes" || !isValidPlainText(name, 100) || !isSubmissionId(submissionId)) throw new FinderError("Bitte prüfe deinen Namen und bestätige die Einwilligung.");
    if (!file.size || file.size > MAX_APPLICATION_PDF_BYTES || !isValidPdfFilename(file.name) || !isAcceptedPdfMimeType(file.type)) throw new FinderError("Bitte lade deinen Lebenslauf als PDF mit höchstens 4 MB hoch.");
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!hasPdfMagic(bytes) || hasDisallowedPdfFeatures(bytes)) throw new FinderError("Diese PDF kann nicht verarbeitet werden. Bitte exportiere den Lebenslauf ohne Passwortschutz und ohne ausführbare Inhalte.");
    const secret = finderSecret();
    const synthetic = process.env.VERCEL_ENV === "preview" || verifyApplicationTestRun("elektrojob.ch", testRunId, testToken, secret);
    if ((testRunId || testToken) && !synthetic) throw new FinderError("Der Testzugang ist ungültig oder abgelaufen.", 403);
    const id = applicationIdentity(secret, "elektrojob.ch/job-finder", submissionId, [name, file.name, testRunId], bytes);
    let record = await getFinderRecord(id);
    if (record && Date.parse(record.access_expires_at) <= Date.now()) throw new FinderError("Die Sitzung ist abgelaufen. Bitte lade die Seite neu und starte nochmals.", 401);
    if (!record) {
      if (!isAcceptableFormAge(startedAt)) throw new FinderError("Das Formular ist abgelaufen. Bitte lade die Seite neu.");
      const admin = createAdminClient();
      const quota = await admin.from("job_finder_sessions").select("id", { head: true, count: "exact" }).eq("ip_hash", ipHash).eq("synthetic", false).gte("created_at", new Date(Date.now() - 3_600_000).toISOString());
      if (quota.error || quota.count === null) throw new Error("finder_quota_failed");
      if (!synthetic && quota.count >= 3) throw new FinderError("Du hast bereits mehrere CVs gesendet. Bitte versuche es in einer Stunde erneut.", 429);
      const jobs = await finderDeck().catch(() => { console.error("[job-finder] catalogue_unavailable"); return []; });
      const cvPath = `job-finder/${id}.pdf`;
      const saved = await admin.rpc("create_job_finder_session", { p_session: { id, name, cv_path: cvPath, cv_filename: file.name, cv_sha256: createHash("sha256").update(bytes).digest("hex"), jobs, synthetic, ip_hash: ipHash } });
      if (saved.error || !saved.data) {
        // Ein unklarer Datenbankausgang darf keine womöglich verwendete PDF löschen.
        record = await getFinderRecord(id);
        if (!record && saved.error?.message.includes("finder_rate_limit")) {
          throw new FinderError("Du hast bereits mehrere CVs gesendet. Bitte versuche es in einer Stunde erneut.", 429);
        }
        if (!record) throw new Error("finder_save_unconfirmed");
      } else record = saved.data as FinderRecord;
    }
    if (!record.cv_uploaded_at) {
      const admin = createAdminClient();
      const upload = await admin.storage.from("cvs").upload(record.cv_path, bytes, { contentType: "application/pdf", upsert: false });
      if (upload.error && !["409", "Duplicate"].includes(String((upload.error as { statusCode?: string }).statusCode)) && !/already exists|duplicate/i.test(upload.error.message)) throw new Error("finder_upload_failed");
      const confirmation = await admin.rpc("confirm_job_finder_cv", { p_id: record.id });
      if (confirmation.error || !confirmation.data) throw new Error("finder_upload_confirmation_failed");
      record = confirmation.data as FinderRecord;
    }
    const response = finderJson({ success: true, ...await finderPayload(record), conversionId: record.id, synthetic: record.synthetic }, 202);
    setFinderCookie(response, record.id);
    return response;
  } catch (error) {
    if (error instanceof ApplicationRequestTooLarge) return finderFailure(new FinderError("Die PDF darf höchstens 4 MB gross sein.", 413));
    if (error instanceof InvalidApplicationRequest) return finderFailure(new FinderError("Das Formular konnte nicht gelesen werden. Bitte prüfe die Angaben."));
    return finderFailure(error);
  }
}
