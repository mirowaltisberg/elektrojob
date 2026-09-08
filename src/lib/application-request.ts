import { MAX_APPLICATION_REQUEST_BYTES } from "./application-validation";

type DeploymentEnvironment = {
  VERCEL_ENV?: string;
  VERCEL_URL?: string;
  VERCEL_BRANCH_URL?: string;
};

/** Nur die serverseitig bekannten Vorschau-Adressen dieser Auslieferung ergänzen. */
export function getApplicationOrigins(environment: DeploymentEnvironment): string[] {
  const origins = ["https://www.elektrojob.ch", "https://elektrojob.ch"];
  if (environment.VERCEL_ENV !== "preview") return origins;

  for (const hostname of [environment.VERCEL_URL, environment.VERCEL_BRANCH_URL]) {
    if (hostname && /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.vercel\.app$/i.test(hostname)) {
      const origin = `https://${hostname.toLowerCase()}`;
      if (!origins.includes(origin)) origins.push(origin);
    }
  }
  return origins;
}

const ALLOWED_FIELDS = new Set([
  "jobId",
  "name",
  "email",
  "phone",
  "cv",
  "website",
  "formStartedAt",
  "consent",
  "submissionId",
  "analytics",
  "testRunId",
  "testToken",
]);

export class InvalidApplicationRequest extends Error {}
export class ApplicationRequestTooLarge extends Error {}

export function isSameOrigin(request: Request, allowedOrigins: readonly string[]): boolean {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  return Boolean(origin && allowedOrigins.includes(origin)) && (!fetchSite || fetchSite === "same-origin");
}

async function readRequestBody(request: Request): Promise<Buffer> {
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    if (!/^\d+$/.test(contentLength) || Number(contentLength) > MAX_APPLICATION_REQUEST_BYTES) {
      throw new ApplicationRequestTooLarge();
    }
  }

  if (!request.body) {
    throw new InvalidApplicationRequest();
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    totalBytes += value.byteLength;
    if (totalBytes > MAX_APPLICATION_REQUEST_BYTES) {
      await reader.cancel();
      throw new ApplicationRequestTooLarge();
    }
    chunks.push(value);
  }

  if (totalBytes === 0) {
    throw new InvalidApplicationRequest();
  }
  return Buffer.concat(chunks, totalBytes);
}

export async function parseBoundedFormData(request: Request): Promise<FormData> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!/^multipart\/form-data;\s*boundary=/i.test(contentType)) {
    throw new InvalidApplicationRequest();
  }

  const body = await readRequestBody(request);
  const boundedRequest = new Request(request.url, {
    method: "POST",
    headers: { "content-type": contentType },
    body: Uint8Array.from(body).buffer,
  });
  let formData: FormData;
  try {
    formData = await boundedRequest.formData();
  } catch {
    // Eine beschädigte Multipart-Anfrage ist ein Eingabefehler, kein Ausfall.
    throw new InvalidApplicationRequest();
  }

  let entryCount = 0;
  for (const key of formData.keys()) {
    entryCount += 1;
    if (entryCount > ALLOWED_FIELDS.size || !ALLOWED_FIELDS.has(key)) {
      throw new InvalidApplicationRequest();
    }
  }
  return formData;
}

export function getSingleString(formData: FormData, field: string): string {
  const values = formData.getAll(field);
  if (values.length !== 1 || typeof values[0] !== "string") {
    throw new InvalidApplicationRequest();
  }
  return values[0].normalize("NFKC").trim();
}

export function getSingleFile(formData: FormData, field: string): File {
  const values = formData.getAll(field);
  if (values.length !== 1 || !(values[0] instanceof File)) {
    throw new InvalidApplicationRequest();
  }
  return values[0];
}

