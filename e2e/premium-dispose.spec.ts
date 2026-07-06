import { test, expect, type Page } from '@playwright/test';

// Phase-5 premium 3D hero — disposal, context loss, and D-07 scroll-fade (HERO-04 + A11Y-05).
// RED until 05-02 mounts the scene. See premium-hero.spec.ts header for _one deltas.

const seed = (page: Page, t: 'accessible' | 'premium') =>
	page.addInitScript((theme) => localStorage.setItem('did:theme', theme), t);

const poster = '.hero picture, .hero img';

test('nav Home<->About x15 disposes cleanly, no WebGL context console errors', async ({ page }) => {
	const errors: string[] = [];
	page.on('console', (m) => {
		if (/too many active webgl|context lost/i.test(m.text())) errors.push(m.text());
	});
	await seed(page, 'premium');
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await page.goto('./');
	for (let i = 0; i < 15; i++) {
		await expect(page.locator('canvas')).toBeVisible({ timeout: 10_000 });
		await page.getByRole('link', { name: /about/i }).first().click();
		await expect(page).toHaveURL(/\/about\/?$/);
		await expect(page.locator('canvas')).toHaveCount(0);
		await page.goBack();
	}
	expect(errors).toEqual([]);
});

test('forced context loss -> poster fallback, no crash, h1 intact', async ({ page }) => {
	await seed(page, 'premium');
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await page.goto('./');
	await expect(page.locator('canvas')).toBeVisible({ timeout: 10_000 });
	await page.evaluate(() => {
		const c = document.querySelector('canvas') as HTMLCanvasElement | null;
		(c?.getContext('webgl2') || c?.getContext('webgl'))
			?.getExtension('WEBGL_lose_context')
			?.loseContext();
	});
	await expect(page.locator(poster).first()).toBeVisible();
	await expect(page.locator('h1')).toBeVisible();
});

test('D-07: scrolling the hero out of view fades + pauses the scene', async ({ page }) => {
	await seed(page, 'premium');
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await page.goto('./');
	await expect(page.locator('canvas')).toBeVisible({ timeout: 10_000 });
	await expect(page.locator('.hero-scene')).toHaveClass(/is-onscreen/);
	// Scroll the hero fully out of view — gentle fade (class removed) + RAF pause (D-07).
	await page.mouse.wheel(0, 2000);
	await expect(page.locator('.hero-scene')).not.toHaveClass(/is-onscreen/);
	// Scroll back to top — the scene regains is-onscreen and resumes.
	await page.mouse.wheel(0, -2000);
	await expect(page.locator('.hero-scene')).toHaveClass(/is-onscreen/);
});
