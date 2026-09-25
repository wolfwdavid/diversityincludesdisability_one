import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Page } from '@playwright/test';

// A11Y-01: automated WCAG 2.2 AA gate. Every prerendered page is scanned by axe-core in BOTH
// themes; the Accessible theme is the conformance target, Premium is cross-theme corroboration.
// Nothing is excluded and no rule is disabled: a violation here means a real defect to fix in src/.
//
// Route list mirrors src/lib/data/nav.ts plus every blog post so the mdsvex/Shiki content
// path is covered too.
const ROUTES = [
	'/',
	'/about/',
	'/creative/',
	'/programs/',
	'/get-involved/',
	'/events/',
	'/blog/',
	'/blog/welcome/',
	'/blog/our-accessibility-commitment/',
	'/contact/'
];

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

// Seed the theme BEFORE navigation: app.html's inline script reads 'did:theme' before first paint.
const seed = (page: Page, theme: 'accessible' | 'premium') =>
	page.addInitScript((t) => localStorage.setItem('did:theme', t), theme);

// Hydration guard: the prerendered HTML is scannable even when the JS bundle 404s (stale preview,
// wrong base path), which would make a green scan meaningless for anything client-rendered.
// Every page must load with zero failed requests / page errors, and the theme toggle (whose SSR
// text is always "Accessible") must reflect the seeded theme after hydration.
const guard = (page: Page) => {
	const problems: string[] = [];
	page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
	page.on('response', (r) => {
		if (r.status() >= 400) problems.push(`${r.status()} ${r.url()}`);
	});
	return problems;
};

const expectHydrated = async (page: Page, theme: 'accessible' | 'premium', problems: string[]) => {
	expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe(theme);
	await expect(page.getByRole('button', { name: /theme/i })).toHaveAttribute(
		'aria-pressed',
		String(theme === 'premium')
	);
	expect(problems, ['page loaded with errors:', ...problems].join('\n')).toEqual([]);
};

const describeViolations = (violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations']) =>
	JSON.stringify(
		violations.map((v) => ({
			id: v.id,
			impact: v.impact,
			help: v.help,
			nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary }))
		})),
		null,
		2
	);

for (const path of ROUTES) {
	test(`axe WCAG 2.2 AA passes on ${path} (accessible)`, async ({ page }) => {
		const problems = guard(page);
		await seed(page, 'accessible');
		await page.goto(`.${path}`);
		await expectHydrated(page, 'accessible', problems);
		const r = await new AxeBuilder({ page }).withTags(WCAG).analyze();
		expect(r.violations, describeViolations(r.violations)).toEqual([]);
	});

	test(`axe WCAG 2.2 AA passes on ${path} (premium)`, async ({ page }) => {
		const problems = guard(page);
		await seed(page, 'premium');
		// networkidle so the async 3D hero import (Home) has settled before the scan.
		await page.goto(`.${path}`, { waitUntil: 'networkidle' });
		await expectHydrated(page, 'premium', problems);
		const r = await new AxeBuilder({ page }).withTags(WCAG).analyze();
		expect(r.violations, describeViolations(r.violations)).toEqual([]);
	});
}
