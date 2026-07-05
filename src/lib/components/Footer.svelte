<script lang="ts">
	import { base } from '$app/paths';
	import { navItems } from '$lib/data/nav';
</script>

<footer>
	<div class="container footer-inner">
		<nav aria-label="Footer">
			<ul>
				{#each navItems as item}
					<li><a href="{base}{item.href}">{item.label}</a></li>
				{/each}
			</ul>
		</nav>
		<p class="contact">
			Contact: <a href="mailto:emanrimawi@gmail.com">emanrimawi@gmail.com</a>
		</p>
		<p class="attribution">&copy; Eman Rimawi-Doster. Diversity Includes Disability.</p>
	</div>
</footer>

<style>
	footer {
		border-block-start: 1px solid var(--color-border);
		margin-block-start: var(--space-section);
		padding-block: var(--space-8);
		background: var(--color-surface); color: var(--color-text);
	}
	.footer-inner { display: flex; flex-direction: column; gap: var(--space-4); }
	footer ul { list-style: none; display: flex; flex-wrap: wrap; gap: var(--space-4); padding: 0; }
	footer a { color: var(--color-text); min-block-size: 44px; display: inline-flex; align-items: center; }
	footer a:focus-visible { outline: var(--focus-ring-width) solid var(--color-focus); outline-offset: 2px; }
</style>
