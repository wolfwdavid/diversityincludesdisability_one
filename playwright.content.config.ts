import { defineConfig, devices } from '@playwright/test';

// Sub-path deep-link harness: build + preview WITH BASE_PATH so /diversityincludesdisability_one/... is exercised.
// webServer.env is cross-platform (no cross-env needed). Only runs *.base.spec.ts.
const BASE_PATH = '/diversityincludesdisability_one';
export default defineConfig({
	testDir: 'e2e',
	testMatch: '**/*.base.spec.ts',
	timeout: 60_000,
	use: { baseURL: `http://localhost:4174${BASE_PATH}/` },
	reporter: 'list',
	webServer: {
		command: 'npm run build && npm run preview -- --port 4174 --strictPort',
		env: { BASE_PATH },
		url: `http://localhost:4174${BASE_PATH}/`,
		timeout: 180_000,
		reuseExistingServer: !process.env.CI
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
});
