import { defineConfig, devices } from '@playwright/test';

// Phase-6 accessibility gate: axe WCAG 2.2 AA scans + capability proofs against a LOCAL
// build+preview (root base path, like the custom-domain deploy). Only runs *.a11y.spec.ts.
//
// Port 4197 is private to this harness (theme = 4173, sub-path = 4174, sibling projects squat
// 4175). PLAYWRIGHT_A11Y_PORT overrides it.
//
// reuseExistingServer is ALWAYS true: on Windows Playwright's managed webServer hangs at teardown,
// so the documented local flow is to build, start `vite preview --port 4197 --strictPort` yourself,
// then run `npm run test:a11y`. When nothing is listening, Playwright starts the server itself
// (CI / macOS / Linux). Restart the preview after EVERY rebuild: it caches the file list at
// startup, so a stale preview serves new HTML whose hashed _app/ chunks 404 (the hydration guard
// in a11y-axe.a11y.spec.ts catches exactly that).
const PORT = Number(process.env.PLAYWRIGHT_A11Y_PORT ?? 4197);
const URL = `http://localhost:${PORT}/`;

export default defineConfig({
	testDir: 'e2e',
	testMatch: '**/*.a11y.spec.ts',
	timeout: 60_000,
	use: { baseURL: URL },
	reporter: 'list',
	webServer: {
		command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
		url: URL,
		timeout: 180_000,
		reuseExistingServer: true
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
});
