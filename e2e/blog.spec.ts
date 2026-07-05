import { test, expect } from '@playwright/test';

test('a post renders as a static page with its title h1 (BLOG-01)', async ({ page }) => {
	await page.goto('./blog/welcome/');
	await expect(page.locator('h1')).toHaveText(/Welcome to Diversity Includes Disability/);
	await expect(page.locator('article time')).toHaveAttribute('datetime', '2026-07-04');
});

test('code is highlighted at build time as inert Shiki HTML (BLOG-03)', async ({ page }) => {
	await page.goto('./blog/welcome/');
	// Shiki emits <pre class="shiki"> with colored <span> tokens — present in the static HTML.
	await expect(page.locator('pre.shiki')).toHaveCount(1);
	await expect(page.locator('pre.shiki span').first()).toBeVisible();
});
