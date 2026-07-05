import { test, expect } from '@playwright/test';

// baseURL already includes /diversityincludesdisability_one/ (see playwright.content.config.ts).
test('deep-linking a post under the sub-path resolves 200 with content (PAGE-06)', async ({ page }) => {
	const res = await page.goto('./blog/welcome/'); // resolves to /diversityincludesdisability_one/blog/welcome/
	expect(res?.status()).toBe(200);
	await expect(page.locator('h1')).toHaveText(/Welcome to Diversity Includes Disability/);
});
