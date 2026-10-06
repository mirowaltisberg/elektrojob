import { defineConfig, devices } from "@playwright/test";

// Omit optional tracking IDs completely; empty strings trigger recovery in
// the existing root head and can discard its stylesheet during hydration.
delete process.env.NEXT_PUBLIC_GA_ID;
delete process.env.NEXT_PUBLIC_FB_PIXEL_ID;

export default defineConfig({
  testDir: "./e2e/applicant",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  outputDir: "test-results/applicant",
  use: {
    baseURL: "http://127.0.0.1:3112",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: [
    {
      command: "node e2e/applicant/synthetic-catalog.mjs",
      url: "http://127.0.0.1:3113",
      reuseExistingServer: false,
    },
    {
      command: `npm run ${process.env.APPLICANT_UX_PRODUCTION === "1" ? "start" : "dev"} -- --hostname 127.0.0.1 --port 3112`,
      url: "http://127.0.0.1:3112",
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        NEXT_TELEMETRY_DISABLED: "1",
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:3113",
        SUPABASE_SERVICE_ROLE_KEY: "synthetic-applicant-test-key",
        NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3112",
      },
    },
  ],
});
