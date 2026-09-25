import { test, expect, type Page } from '@playwright/test';

// A11Y-01 / A11Y-05 capability proofs: the Accessible theme ships zero WebGL and a 0-duration
// motion token on every page, and Premium under OS reduced-motion falls back to the poster
// without ever downloading the three.js chunk.
const ROUTES = [
	'/',
	'/about/',
	'/creative/',
	'/programs/',
	'/get-involved/',
	'/events/',
	'/blog/',
	'/contact/'
];

const seed = (page: Page, theme: 'accessible' | 'premium') =>
	page.addInitScript((t) => localStorage.setItem('did:theme', t), theme);

const poster = '.hero picture, .hero img';

test('accessible theme renders zero WebGL/canvas on every page (A11Y-01)', async ({ page }) => {
	await seed(page, 'accessible');
	for (const path of ROUTES) {
		await page.goto(`.${path}`, { waitUntil: 'networkidle' });
		await expect(page.locator('canvas'), `canvas on ${path}`).toHaveCount(0);
		await expect(page.locator(poster), `poster on ${path}`).toHaveCount(0); // D-15: no poster in Accessible
	}
});

test('accessible theme motion duration token is 0 (A11Y-01 reduced-motion honored)', async ({ page }) => {
	await seed(page, 'accessible');
	await page.goto('./');
	const dur = await page.evaluate(() =>
		getComputedStyle(document.documentElement).getPropertyValue('--motion-duration').trim()
	);
	expect(dur).toMatch(/^0(ms|s)?$/); // Chromium serializes 0ms as "0s"
});

test('premium + reduced-motion shows poster, zero canvas, no three chunk (A11Y-05 corroboration)', async ({ page }) => {
	const bodies: string[] = [];
	page.on('response', async (r) => {
		if (r.url().endsWith('.js')) bodies.push(await r.text().catch(() => ''));
	});
	await seed(page, 'premium');
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('./', { waitUntil: 'networkidle' });
	await expect(page.locator(poster).first()).toBeVisible();
	await expect(page.locator('canvas')).toHaveCount(0);
	expect(bodies.some((b) => /@threlte|THREE\.WebGLRenderer/.test(b))).toBe(false);
});
