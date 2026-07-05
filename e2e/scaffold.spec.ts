import { test, expect } from '@playwright/test';

test('Donate is a clearly-labeled external link with rel=noopener (PAGE-04)', async ({ page }) => {
  await page.goto('./get-involved/');
  const donate = page.getByRole('link', { name: /donate/i });
  await expect(donate).toBeVisible();
  await expect(donate).toHaveAttribute('rel', /noopener/);
});

test('Contact fields are all labeled and wired with aria-describedby (PAGE-07)', async ({ page }) => {
  await page.goto('./contact/');
  for (const label of [/name/i, /email/i, /message/i]) {
    await expect(page.getByLabel(label)).toBeVisible();
  }
  await expect(page.locator('input#c-name')).toHaveAttribute('aria-describedby', 'c-name-error');
  // Scope to <main>: the footer landmark also links the same email (see 03-01 Footer).
  await expect(page.getByRole('main').getByRole('link', { name: /emanrimawi@gmail.com/i })).toBeVisible();
});

test('Contact form has no backend action (scaffold only)', async ({ page }) => {
  await page.goto('./contact/');
  const action = await page.locator('form').getAttribute('action');
  expect(action).toBeNull(); // no POST target until Phase 4
});
