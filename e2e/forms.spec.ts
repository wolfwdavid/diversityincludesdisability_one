import { test, expect } from '@playwright/test';

test('contact: success is announced and focus-managed (FORM-01/03)', async ({ page }) => {
	await page.route('**/api.web3forms.com/submit', (route) =>
		route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({ success: true, message: 'Email sent successfully!' })
		})
	);
	await page.goto('./contact/');
	await page.getByLabel('Name').fill('Ada');
	await page.getByLabel('Email').fill('ada@example.com');
	await page.getByLabel('Message').fill('Hello there');
	await page.getByRole('button', { name: /send message/i }).click();
	const status = page.locator('.form-status.ok');
	await expect(status).toBeVisible();
	await expect(status).toBeFocused();
	await expect(status).toHaveAttribute('role', 'status');
});

test('contact: server error shows an assertive alert + mailto fallback (FORM-01)', async ({ page }) => {
	await page.route('**/api.web3forms.com/submit', (route) =>
		route.fulfill({
			status: 400,
			contentType: 'application/json',
			body: JSON.stringify({ success: false, message: 'Bad request' })
		})
	);
	await page.goto('./contact/');
	await page.getByLabel('Name').fill('Ada');
	await page.getByLabel('Email').fill('ada@example.com');
	await page.getByLabel('Message').fill('Hello there');
	await page.getByRole('button', { name: /send message/i }).click();
	await expect(page.locator('.form-status.err')).toHaveAttribute('role', 'alert');
	// Scoped to the error-fallback disclaimer: the page also has a lede + footer mailto link.
	await expect(page.locator('form .disclaimer').getByRole('link', { name: /emanrimawi@gmail.com/i })).toBeVisible();
});

test('contact: network failure is handled distinctly (FORM-01)', async ({ page }) => {
	await page.route('**/api.web3forms.com/submit', (route) => route.abort('failed'));
	await page.goto('./contact/');
	await page.getByLabel('Name').fill('Ada');
	await page.getByLabel('Email').fill('ada@example.com');
	await page.getByLabel('Message').fill('Hello there');
	await page.getByRole('button', { name: /send message/i }).click();
	await expect(page.locator('.form-status.err')).toContainText(/network error/i);
});

test('contact: empty submit shows errors, marks aria-invalid, focuses first invalid, no network hit (FORM-03)', async ({ page }) => {
	let hit = false;
	await page.route('**/api.web3forms.com/submit', (route) => { hit = true; return route.abort('failed'); });
	await page.goto('./contact/');
	await page.getByRole('button', { name: /send message/i }).click();
	await expect(page.getByLabel('Name')).toBeFocused();
	await expect(page.getByLabel('Name')).toHaveAttribute('aria-invalid', 'true');
	expect(hit).toBe(false);
});

test('volunteer: form on /get-involved submits and confirms (FORM-02)', async ({ page }) => {
	await page.route('**/api.web3forms.com/submit', (route) =>
		route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({ success: true, message: 'ok' })
		})
	);
	await page.goto('./get-involved/');
	await page.getByLabel('Name').fill('Grace');
	await page.getByLabel('Email').fill('grace@example.com');
	await page.getByLabel(/how would you like to help/i).fill('Outreach');
	await page.getByRole('button', { name: /sign me up/i }).click();
	const status = page.locator('.form-status.ok');
	await expect(status).toBeVisible();
	await expect(status).toBeFocused();
});
