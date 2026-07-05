<script lang="ts">
	import { theme } from './theme.svelte.ts';

	let announce = $state('');
	const isPremium = $derived(theme.current === 'premium');

	function onClick() {
		theme.toggle();
		announce = `${theme.current === 'premium' ? 'Premium' : 'Accessible'} theme enabled`;
	}
</script>

<button type="button" class="theme-toggle" aria-pressed={isPremium} onclick={onClick}>
	<span>Theme: {isPremium ? 'Premium' : 'Accessible'}</span>
</button>

<!-- Polite live region: visually hidden, announced by AT. One per app. -->
<div aria-live="polite" class="sr-only">{announce}</div>

<style>
	.theme-toggle {
		/* WCAG 2.2 2.5.8 Target Size: >= 24x24 CSS px; 44px is the stronger heuristic */
		min-block-size: 44px;
		min-inline-size: 44px;
		padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
		border: 1px solid var(--color-border, currentColor);
		border-radius: var(--radius, 4px);
		background: var(--color-surface, transparent);
		color: var(--color-text, inherit);
		font: inherit;
		cursor: pointer;
	}
	.theme-toggle:hover {
		border-color: var(--color-accent, currentColor);
	}
	.theme-toggle:focus-visible {
		outline: var(--focus-ring-width, 2px) solid var(--color-focus, currentColor);
		outline-offset: 2px;
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
		border: 0;
	}
</style>
