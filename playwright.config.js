// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // All execution artifacts go into test-results/
  outputDir: 'test-results',

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],

  use: {
    baseURL: 'https://ishop-qa.reward360.in',
    // ─── Desktop viewport ─────────────────────────────────────────────────────
    // Set to 1920x1080 so the iShop portal renders in desktop mode.
    // Without this, the app shows a "best viewed on Portrait mode" overlay
    // that blocks all interactive elements on normal / smaller screens.
    viewport: { width: 1920, height: 1080 },
    launchOptions: {
      args: [
        '--start-maximized',
        // Force the actual Chrome window to 1920×1080 so new popup tabs also
        // inherit a desktop-sized window (setViewportSize only fixes the CDP
        // viewport of the originating page, not newly opened popup pages).
        '--window-size=1920,1080',
      ],
    },
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        // Explicit desktop viewport for Chromium project
        viewport: { width: 1920, height: 1080 },
        launchOptions: {
          args: [
            '--start-maximized',
            '--window-size=1920,1080',
          ],
        },
      },
    },
  ],
});
