import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://localhost:3100";

export default defineConfig({
  testDir: "./tests",
  testMatch: ["**/e2e/**/*.spec.ts", "**/integration/**/*.spec.ts"],
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    trace: "retain-on-failure"
  },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3100",
    env: {
      DATABASE_URL: "postgres://unused:unused@127.0.0.1:1/unused",
      OWN_AUTH_APP_URL: baseURL,
      OWN_AUTH_TEST_MODE: "1",
      OWN_AUTH_TOKEN_PEPPER:
        "starter-test-pepper-that-is-long-enough-and-never-used-in-production"
    },
    reuseExistingServer: false,
    timeout: 120_000,
    url: baseURL
  }
});
