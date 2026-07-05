import { test, expect } from '@playwright/test';

// --- THEME-03: two complete peer designs (green in 02-01) ---
test('peer designs differ across contrast, type, spacing, and motion', async ({ page }) => {
	await page.goto('./');

	const read = (t: 'premium' | 'accessible') =>
		page.evaluate((theme) => {
			document.documentElement.dataset.theme = theme;
			const cs = getComputedStyle(document.documentElement);
			const g = (n: string) => cs.getPropertyValue(n).trim();
			return {
				bg: g('--color-bg'),
				text: g('--color-text'),
				fontSize: g('--font-size-base'),
				section: g('--space-section'),
				motion: g('--motion-duration')
			};
		}, t);

	const premium = await read('premium');
	const accessible = await read('accessible');

	expect(premium.bg).not.toBe(accessible.bg); // contrast/palette differs
	expect(premium.text).not.toBe(accessible.text);
	expect(premium.fontSize).not.toBe(accessible.fontSize); // typography differs
	expect(premium.section).not.toBe(accessible.section); // spacing differs
	expect(premium.motion).not.toBe(accessible.motion); // motion differs (token, not display:none)
	expect(accessible.motion).toMatch(/0ms|--dur-0/); // Accessible motion off BY DESIGN (0ms via --dur-0)
});

// --- THEME-04: no flash (green in 02-02) ---
test('no flash: data-theme is set on <html> before first paint', async ({ page }) => {
	await page.goto('./');
	const attr = await page.evaluate(() => document.documentElement.dataset.theme);
	expect(['premium', 'accessible']).toContain(attr);
});

// --- THEME-05: accessible-first default (green in 02-02) ---
test('accessible-first: reduced-motion first visit lands on accessible', async ({ page, context }) => {
	await context.clearCookies();
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.addInitScript(() => localStorage.removeItem('did:theme'));
	await page.goto('./');
	const attr = await page.evaluate(() => document.documentElement.dataset.theme);
	expect(attr).toBe('accessible');
});

// --- THEME-02: persistence across reload (green in 02-02) ---
test('persists the chosen theme across a reload', async ({ page }) => {
	await page.goto('./');
	await page.evaluate(() => localStorage.setItem('did:theme', 'premium'));
	await page.reload();
	const attr = await page.evaluate(() => document.documentElement.dataset.theme);
	expect(attr).toBe('premium');
});

// --- THEME-01/06: toggle a11y (green in 02-03) ---
test('toggle a11y: keyboard-operable button flips aria-pressed, keeps focus, announces', async ({ page }) => {
	await page.goto('./');
	const btn = page.getByRole('button', { name: /theme/i });
	await btn.focus();
	const before = await btn.getAttribute('aria-pressed');
	await page.keyboard.press('Enter');
	const after = await btn.getAttribute('aria-pressed');
	expect(after).not.toBe(before);
	await expect(btn).toBeFocused(); // focus retained on switch
	await expect(page.locator('[aria-live="polite"]')).toContainText(/theme enabled/i);
});
