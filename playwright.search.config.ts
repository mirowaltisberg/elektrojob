import { defineConfig, devices } from "@playwright/test";

// Unset optional IDs: an empty string renders a text child in the existing
// root <head>, causing hydration recovery to discard the stylesheet.
delete process.env.NEXT_PUBLIC_GA_ID;
delete process.env.NEXT_PUBLIC_FB_PIXEL_ID;

export default defineConfig({
  testDir: "./e2e/search",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  outputDir: "test-results/search",
  use: {
    baseURL: "http://127.0.0.1:3110",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: [
    {
      command: "node e2e/search/empty-catalog.mjs",
      url: "http://127.0.0.1:3111",
      reuseExistingServer: false,
    },
    {
      command: `npm run ${process.env.SEARCH_UX_PRODUCTION === "1" ? "start" : "dev"} -- --hostname 127.0.0.1 --port 3110`,
      url: "http://127.0.0.1:3110",
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        NEXT_TELEMETRY_DISABLED: "1",
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:3111",
        SUPABASE_SERVICE_ROLE_KEY: "synthetic-search-test-key",
        NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3110",
      },
    },
  ],
});
