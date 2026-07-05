import { test, expect } from '@playwright/test';

test('Home shows the org name and base-prefixed CTAs (PAGE-01)', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('h1')).toHaveText(/Diversity Includes Disability/);
  await expect(page.getByRole('link', { name: /get involved/i }).first()).toBeVisible();
});

test('About shows the real Eman Rimawi bio (PAGE-02)', async ({ page }) => {
  await page.goto('./about/');
  await expect(page.locator('body')).toContainText('Rimawi-Doster');
  await expect(page.locator('body')).toContainText('Access-A-Ride');
  await expect(page.locator('body')).toContainText('Harlem Independent Living Center');
});

test('Programs lists all four real services (PAGE-03)', async ({ page }) => {
  await page.goto('./programs/');
  for (const name of [
    /Intersectional Disability Equity and Inclusion trainings and facilitation/,
    /Disability Consulting/,
    /Modeling for Representation/,
    /Speaker and Panelist/
  ]) {
    await expect(page.getByRole('heading', { name })).toBeVisible();
  }
});
