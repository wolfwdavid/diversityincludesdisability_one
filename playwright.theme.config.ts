import { defineConfig, devices } from '@playwright/test';

// Phase-2 theme E2E: run against a LOCAL build+preview, not the live Pages URL.
// Kept separate from playwright.config.ts (Phase-1 live smoke harness).
export default defineConfig({
	testDir: 'e2e',
	timeout: 30_000,
	use: { baseURL: 'http://localhost:4173/' },
	reporter: 'list',
	webServer: {
		command: 'npm run build && npm run preview -- --port 4173 --strictPort',
		url: 'http://localhost:4173/',
		timeout: 120_000,
		reuseExistingServer: !process.env.CI
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
});
