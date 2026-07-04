import { test, expect } from '@playwright/test';

const BASE =
	process.env.BASE_URL ?? 'https://wolfwdavid.github.io/diversityincludesdisability_one';

test('DEPLOY-01: root serves the built HTML', async ({ page }) => {
	const res = await page.goto('/');
	expect(res?.status()).toBeLessThan(400);
	await expect(page.locator('h1')).toBeVisible();
});

test('DEPLOY-02/04: no request 4xxs and an _app asset loads', async ({ page }) => {
	const bad: string[] = [];
	page.on('response', (r) => {
		if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`);
	});
	await page.goto('/', { waitUntil: 'networkidle' });
	expect(bad, `4xx requests:\n${bad.join('\n')}`).toEqual([]);
});

test('DEPLOY-03: deep-link /about/ resolves on a hard load', async ({ page }) => {
	const res = await page.goto('/about/');
	expect(res?.status()).toBeLessThan(400);
	await expect(page.locator('h1')).toHaveText(/about/i);
});

test('DEPLOY-03: unknown path serves our branded 404 fallback', async ({ page }) => {
	await page.goto('/definitely-not-a-page-xyz/');
	await expect(page.locator('body')).toContainText(/Diversity Includes Disability/i);
});
