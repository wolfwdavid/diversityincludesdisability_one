import { test, expect, type Page } from '@playwright/test';

// Phase-5 premium 3D hero — capability-branch assertions (HERO-01/02/03 + A11Y-05).
//
// Authored GREEN-shaped but intentionally RED until the Threlte scene (05-02) and poster
// (05-03) ship — this is the drive-green target for those waves. Wave-1 acceptance is only
// that these are authored, type/lint-clean, and listable via `playwright --list`.
//
// _one deltas from _four's tests/premium-3d.spec.ts:
//   - seed via localStorage 'did:theme' (NOT 'did-mode')
//   - NO data-hydrated attribute in _one — wait on the canvas locator directly (it appears
//     only after the async import() resolves), never on a hydration flag
//   - NO axe (that is Phase 6)
//   - relative goto('./'); pin reducedMotion per-test for determinism
//   - Accessible renders NO poster image (D-15): poster is Premium-only

const seed = (page: Page, t: 'accessible' | 'premium') =>
	page.addInitScript((theme) => localStorage.setItem('did:theme', theme), t);

const poster = '.hero picture, .hero img';

test('accessible: no canvas, NO poster, content present', async ({ page }) => {
	await seed(page, 'accessible');
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await page.goto('./');
	await expect(page.locator('canvas')).toHaveCount(0);
	await expect(page.locator(poster)).toHaveCount(0); // D-15 — Accessible renders no image
	await expect(page.locator('h1')).toBeVisible();
});

test('A11Y-05 premium + reduced-motion: poster, zero canvas, no three chunk', async ({ page }) => {
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

test('HERO-01 premium + motion + capable: canvas mounts, decorative', async ({ page }) => {
	await seed(page, 'premium');
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await page.goto('./');
	// Canvas appears only after the async import() resolves — no hydration flag to wait on.
	await expect(page.locator('canvas')).toBeVisible({ timeout: 10_000 });
	// Decorative: the scene wrapper is aria-hidden and never in the tab order.
	await expect(page.locator('.hero-scene')).toHaveAttribute('aria-hidden', 'true');
	await expect(page.locator('.hero-scene[tabindex]')).toHaveCount(0);
});
