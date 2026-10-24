// GENERATED FILE -- do not edit.
//
// Rendered from this target's configuration in Postgres on every hydrate, and
// re-rendered before every ingest, so edits here are discarded. Change the
// base URL in the portal instead; the change arrives as a tree diff and a new
// revision.
import { defineConfig, devices } from '@playwright/test';

const baseURL = "https://custom-test-target-app.vercel.app";

/* The orchestrator sets QA_RUN_DIR per run, so Playwright's output lands in the
 * run directory and never in this worktree -- the worktree is the tree a
 * revision is made of. */
const RUN_DIR = process.env.QA_RUN_DIR;
const outputPath = (name: string) => (RUN_DIR ? `${RUN_DIR}/${name}` : name);

export default defineConfig({
  /* One target per worktree: the whole tree is this target's, seed included. */
  testDir: '.',
  outputDir: outputPath('test-results'),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI
    ? 1
    : process.env.QA_WORKERS
      ? Number(process.env.QA_WORKERS)
      : undefined,
  /* open: 'never' so a failing local run does not block on the report server. */
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: outputPath('playwright-report') }],
  ],
  use: {
    /* Playwright's default is no limit; an agent driving the browser over MCP
     * would hang forever on a missing element. */
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], baseURL } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'], baseURL } },
    { name: 'webkit', use: { ...devices['Desktop Safari'], baseURL } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'], baseURL } },
  ],
});
