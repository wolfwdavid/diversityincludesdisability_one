import { test, expect } from '@playwright/test';

const ROUTES = ['/', '/about/', '/programs/', '/get-involved/', '/events/', '/blog/', '/contact/'];

// --- A11Y-02: skip link is first focusable and MOVES focus into <main> ---
test('skip link is first tab stop and moves focus into main (A11Y-02)', async ({ page }) => {
	await page.goto('./');
	await page.keyboard.press('Tab');
	const skip = page.getByRole('link', { name: /skip to main content/i });
	await expect(skip).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(page.locator('main#main-content')).toBeFocused();
});

// --- A11Y-03: one h1 + one of each landmark on every page ---
for (const path of ROUTES) {
	test(`landmarks + single h1 on ${path} (A11Y-03)`, async ({ page }) => {
		await page.goto(`.${path}`);
		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.locator('body > header, header')).toHaveCount(1);
		await expect(page.locator('main#main-content')).toHaveCount(1);
		await expect(page.locator('footer')).toHaveCount(1);
		await expect(page.locator('nav[aria-label="Primary"]')).toHaveCount(1);
	});
}

// --- A11Y-03: heading levels never skip (no h3 before an h2, etc.) ---
test('heading order never skips a level across pages (A11Y-03)', async ({ page }) => {
	for (const path of ROUTES) {
		await page.goto(`.${path}`);
		const levels = await page.locator('h1,h2,h3,h4').evaluateAll((els) =>
			els.map((e) => Number(e.tagName[1]))
		);
		let prev = 0;
		for (const lvl of levels) {
			expect(lvl - prev).toBeLessThanOrEqual(1); // never jump more than one level deeper
			prev = lvl;
		}
	}
});

// --- PAGE-08: every nav item is reachable via the header nav ---
test('all 7 pages reachable from header nav (PAGE-08)', async ({ page }) => {
	await page.goto('./');
	const nav = page.locator('nav[aria-label="Primary"]');
	for (const label of [/home/i, /about/i, /programs/i, /get involved/i, /events/i, /news/i, /contact/i]) {
		await expect(nav.getByRole('link', { name: label })).toHaveCount(1);
	}
});

// --- A11Y-04: disclosure nav is keyboard operable, Escape returns focus, targets >=24px ---
test('nav disclosure: aria-expanded toggles, Escape closes + returns focus (A11Y-04)', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 800 }); // mobile: disclosure visible
	await page.goto('./');
	const toggle = page.getByRole('button', { name: /menu/i });
	await expect(toggle).toHaveAttribute('aria-expanded', 'false');
	await toggle.click();
	await expect(toggle).toHaveAttribute('aria-expanded', 'true');
	await page.keyboard.press('Escape');
	await expect(toggle).toHaveAttribute('aria-expanded', 'false');
	await expect(toggle).toBeFocused();
});

test('interactive targets are at least 24x24 CSS px (A11Y-04 / WCAG 2.5.8)', async ({ page }) => {
	await page.goto('./');
	// Only visible controls are interactive targets at this viewport; the disclosure
	// button is display:none on desktop (its box is null and it cannot be tabbed to).
	for (const el of await page.locator('nav[aria-label="Primary"] a:visible, nav[aria-label="Primary"] button:visible').all()) {
		const box = await el.boundingBox();
		expect(box, 'nav control has a box').not.toBeNull();
		expect(box!.height).toBeGreaterThanOrEqual(24);
		expect(box!.width).toBeGreaterThanOrEqual(24);
	}
});
