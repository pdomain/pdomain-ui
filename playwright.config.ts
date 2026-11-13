/**
 * Playwright config for pdomain-ui e2e tests.
 *
 * Tests run against the pre-built Storybook static site (`storybook-static/`).
 *
 * just recipes:
 *   `just e2e`    — builds Storybook, starts static server, runs tests
 *   `just e2e-ci` — assumes storybook-static exists; same but uses HTML reporter
 *
 * Architecture:
 *   Tests load `iframe.html?viewMode=story&id=<storyId>` directly (without
 *   the Storybook manager frame) and manually emit `setCurrentStory` on
 *   `__STORYBOOK_PREVIEW__.channel` to trigger story rendering. See
 *   `tests/e2e/storybook.e2e.ts` for the `loadStory()` helper.
 *
 * Port 6007 avoids collisions with the live Storybook dev server (6006).
 */

import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORYBOOK_DIR = path.join(__dirname, 'storybook-static');
const PORT = 6007;

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.e2e.ts',

  // Timeout per test: Storybook stories may take a moment to hydrate.
  timeout: 30_000,

  // Reporter: list in interactive mode, HTML in CI.
  reporter: process.env['CI'] ? [['html', { open: 'never' }]] : [['list']],

  // Run tests sequentially to avoid port conflicts.
  workers: 1,
  fullyParallel: false,

  use: {
    baseURL: `http://localhost:${PORT}`,
    headless: true,
  },

  webServer: {
    // Use `sirv-cli` (declared devDependency) to serve the pre-built Storybook
    // static site. Invoked via `pnpm exec sirv` so no runtime download occurs.
    // Port 6007 avoids conflicts with the Storybook dev server (6006).
    command: `pnpm exec sirv ${STORYBOOK_DIR} --port ${PORT} --single`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env['CI'],
    timeout: 30_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
