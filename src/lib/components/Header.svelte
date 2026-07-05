<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { navItems } from '$lib/data/nav';
	import ThemeToggle from '$lib/theme/ThemeToggle.svelte';

	let open = $state(false);
	let toggleBtn: HTMLButtonElement;

	const isCurrent = (href: string) =>
		page.url.pathname === `${base}${href}/` || page.url.pathname === `${base}${href}`;

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) {
			open = false;
			toggleBtn.focus();
		}
	}
</script>

<header>
	<div class="container header-bar">
		<a class="brand" href="{base}/">Diversity Includes Disability</a>

		<nav aria-label="Primary" onkeydown={onKeydown}>
			<button
				bind:this={toggleBtn}
				class="nav-toggle"
				type="button"
				aria-expanded={open}
				aria-controls="primary-menu"
				onclick={() => (open = !open)}
			>
				<span class="sr-only">Menu</span>
				<span aria-hidden="true">{open ? 'Close' : 'Menu'}</span>
			</button>

			<ul id="primary-menu" class="menu" class:open hidden={!open}>
				{#each navItems as item}
					<li>
						<a
							href="{base}{item.href}"
							aria-current={isCurrent(item.href) ? 'page' : undefined}
						>{item.label}</a>
					</li>
				{/each}
			</ul>

			<ThemeToggle />
		</nav>
	</div>
</header>

<style>
	header { border-block-end: 1px solid var(--color-border); background: var(--color-bg); }
	.header-bar {
		display: flex; align-items: center; gap: var(--space-4);
		min-block-size: var(--header-height); flex-wrap: wrap;
	}
	.brand {
		font-family: var(--font-heading); font-weight: var(--font-weight-heading);
		color: var(--color-text); text-decoration: none; margin-inline-end: auto;
		min-block-size: 44px; display: inline-flex; align-items: center;
	}
	.nav-toggle {
		min-block-size: 44px; min-inline-size: 44px;
		padding: var(--space-2) var(--space-4);
		background: var(--color-surface); color: var(--color-text);
		border: 1px solid var(--color-border); border-radius: var(--radius);
		font: inherit; cursor: pointer;
	}
	.menu { list-style: none; display: flex; flex-direction: column; gap: var(--space-2); padding: 0; }
	.menu a {
		display: inline-flex; align-items: center;
		min-block-size: 44px; padding: var(--space-2) var(--space-3);
		color: var(--color-text); text-decoration: none; border-radius: var(--radius);
	}
	.menu a:hover { background: var(--color-surface); }
	.menu a[aria-current='page'] { font-weight: var(--font-weight-heading); text-decoration: underline; }
	:where(a, button):focus-visible {
		outline: var(--focus-ring-width) solid var(--color-focus); outline-offset: 2px;
	}
	/* Desktop: show the list inline, hide the disclosure button. */
	@media (min-width: 48rem) {
		.nav-toggle { display: none; }
		.menu { flex-direction: row; align-items: center; gap: var(--space-4); }
		.menu[hidden] { display: flex; } /* desktop always shows the list regardless of `open` */
	}
</style>
