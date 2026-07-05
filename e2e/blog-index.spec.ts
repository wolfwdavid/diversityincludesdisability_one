import { test, expect } from '@playwright/test';

test('blog index lists posts with title, date, and summary (BLOG-02)', async ({ page }) => {
  await page.goto('./blog/');
  await expect(page.locator('h1')).toHaveText(/News/);
  const first = page.locator('.post-list li').first();
  await expect(first.locator('h2 a')).toBeVisible();
  await expect(first.locator('time')).toHaveAttribute('datetime', /\d{4}-\d{2}-\d{2}/);
  await expect(first.locator('.summary')).not.toBeEmpty();
});

test('newest post is listed first (BLOG-02 sort)', async ({ page }) => {
  await page.goto('./blog/');
  await expect(page.locator('.post-list li').first().locator('h2 a'))
    .toHaveText(/Welcome to Diversity Includes Disability/);
});

test('clicking a post title opens its static page (PAGE-06)', async ({ page }) => {
  await page.goto('./blog/');
  await page.getByRole('link', { name: /Welcome to Diversity Includes Disability/ }).click();
  await expect(page).toHaveURL(/\/blog\/welcome\/$/);
  await expect(page.locator('article h1')).toHaveText(/Welcome to Diversity Includes Disability/);
});
