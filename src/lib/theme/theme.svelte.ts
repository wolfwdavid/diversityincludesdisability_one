// src/lib/theme/theme.svelte.ts
// SSR/prerender-safe runes theme singleton. No top-level window/document access.
import { browser } from '$app/environment';

export type Theme = 'premium' | 'accessible';
export const THEME_KEY = 'did:theme'; // MUST match the app.html inline script
const DEFAULT: Theme = 'accessible'; // safe SSR/prerender default

function initial(): Theme {
	if (!browser) return DEFAULT; // prerender: never touch window/document
	const attr = document.documentElement.dataset.theme; // set pre-paint by app.html
	return attr === 'premium' || attr === 'accessible' ? attr : DEFAULT;
}

class ThemeStore {
	current = $state<Theme>(initial());

	set(next: Theme) {
		this.current = next;
		if (!browser) return;
		document.documentElement.dataset.theme = next;
		try {
			localStorage.setItem(THEME_KEY, next);
		} catch {
			/* private mode / storage disabled — state still updated */
		}
	}

	toggle() {
		this.set(this.current === 'premium' ? 'accessible' : 'premium');
	}
}

export const theme = new ThemeStore();
