import { test, expect } from '@playwright/test';

// A11Y-06: a published accessibility statement with the required sections, reachable from the
// footer of every page (it deliberately lives OUTSIDE the primary nav, Scope-style).
test('accessibility statement has the required sections and a help contact (A11Y-06)', async ({ page }) => {
	await page.goto('./accessibility/');
	await expect(page.locator('h1')).toHaveText(/accessibility statement/i);
	for (const heading of [/conformance target/i, /how we test/i, /known issues/i, /get help/i]) {
		await expect(page.getByRole('heading', { level: 2, name: heading })).toBeVisible();
	}
	await expect(page.locator('body')).toContainText('WCAG');
	await expect(page.locator('body')).toContainText('2.2');
	await expect(page.locator('body')).toContainText(/level AA/);
	await expect(page.locator('a[href="mailto:diversityincludesdisability@gmail.com"]').first()).toBeVisible();
	// Honest known-issues list: the uncaptioned runway clips are declared, not hidden.
	await expect(page.locator('body')).toContainText(/captions/i);
});

test('footer links to the accessibility statement from every page (A11Y-06)', async ({ page }) => {
	for (const path of ['/', '/about/', '/contact/']) {
		await page.goto(`.${path}`);
		const link = page.locator('footer').getByRole('link', { name: /accessibility statement/i });
		await expect(link).toHaveCount(1);
		await expect(link).toHaveAttribute('href', /\/accessibility$/);
	}
	// Not in the primary nav: shell.spec.ts pins that at exactly 8 items.
	await expect(
		page.locator('nav[aria-label="Primary"]').getByRole('link', { name: /accessibility statement/i })
	).toHaveCount(0);
});
