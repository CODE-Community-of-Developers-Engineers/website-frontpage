const { defineConfig, devices } = require('@playwright/test');

const port = Number(process.env.PLAYWRIGHT_TEST_PORT || 4173);
const basePath = process.env.SITE_BASE_PATH || '/website-frontpage';
const origin = `http://127.0.0.1:${port}`;

module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  globalTimeout: process.env.CI ? 10 * 60 * 1000 : undefined,
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  use: {
    baseURL: `${origin}${basePath}`,
    trace: 'on-first-retry'
  },
  webServer: {
    command: `node tests/e2e/serve-built-site.cjs --port ${port}`,
    url: `${origin}${basePath}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 10_000
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
