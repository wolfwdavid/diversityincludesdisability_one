import { test, expect, type Page } from '@playwright/test';

// Phase-5 premium 3D hero — runtime network proof of the lazy boundary (HERO-02/04).
// RED until 05-02 splits the three chunk. See premium-hero.spec.ts header for _one deltas.

const seed = (page: Page, t: 'accessible' | 'premium') =>
	page.addInitScript((theme) => localStorage.setItem('did:theme', theme), t);

test('accessible downloads zero three chunks', async ({ page }) => {
	const bodies: string[] = [];
	page.on('response', async (r) => {
		if (r.url().endsWith('.js')) bodies.push(await r.text().catch(() => ''));
	});
	await seed(page, 'accessible');
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await page.goto('./', { waitUntil: 'networkidle' });
	await expect(page.locator('canvas')).toHaveCount(0);
	expect(bodies.some((b) => /@threlte|THREE\.WebGLRenderer/.test(b))).toBe(false);
});

test('premium+motion downloads a three chunk and mounts a canvas', async ({ page }) => {
	const bodies: string[] = [];
	page.on('response', async (r) => {
		if (r.url().endsWith('.js')) bodies.push(await r.text().catch(() => ''));
	});
	await seed(page, 'premium');
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await page.goto('./');
	await expect(page.locator('canvas')).toBeVisible({ timeout: 10_000 });
	// The response handler reads each chunk body via async r.text(), so the three chunk may
	// still be resolving when the canvas becomes visible. Poll (don't read once) so the
	// assertion waits for that async capture instead of racing it.
	await expect
		.poll(() => bodies.some((b) => /@threlte|THREE\.WebGLRenderer/.test(b)), { timeout: 5_000 })
		.toBe(true);
});
