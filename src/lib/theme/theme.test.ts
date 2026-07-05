import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('$app/environment', () => ({ browser: true }));

describe('theme store (THEME-01/02 unit — RED until 02-02 creates theme.svelte.ts)', () => {
	beforeEach(() => {
		localStorage.clear();
		document.documentElement.removeAttribute('data-theme');
	});

	it('toggle() flips premium <-> accessible and mirrors to <html data-theme> (THEME-01)', async () => {
		const { theme } = await import('./theme.svelte.ts');
		theme.set('premium');
		expect(theme.current).toBe('premium');
		expect(document.documentElement.dataset.theme).toBe('premium');
		theme.toggle();
		expect(theme.current).toBe('accessible');
		expect(document.documentElement.dataset.theme).toBe('accessible');
	});

	it('set() persists the choice to localStorage["did:theme"] (THEME-02)', async () => {
		const { theme, THEME_KEY } = await import('./theme.svelte.ts');
		expect(THEME_KEY).toBe('did:theme');
		theme.set('premium');
		expect(localStorage.getItem('did:theme')).toBe('premium');
	});
});
