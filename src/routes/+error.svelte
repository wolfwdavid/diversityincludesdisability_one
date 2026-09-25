<!-- src/routes/+error.svelte -->
<!-- Branded error boundary for the SPA 404 fallback (DEPLOY-03): when GitHub Pages
     serves 404.html for an unmatched path, the client router mounts here and renders
     OUR branded page — not SvelteKit's bare default and not GitHub's raw 404 chrome.
     Renders inside +layout's <main>, so the skip link, header, footer and landmarks are
     inherited; this file adds only content and an error-scoped nav. -->
<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';

	const notFound = $derived(page.status === 404);
</script>

<svelte:head><title>Page not found — Diversity Includes Disability</title></svelte:head>

<img src="{base}/favicon.svg" alt="" width="48" height="48" />
<h1>Diversity Includes Disability</h1>
<p><strong>{page.status}</strong>: {page.error?.message ?? 'Page not found'}</p>
<p>
	{#if notFound}
		The page you were looking for could not be found. It may have moved, or the address may
		have a typo. Try one of the pages below or use the menu at the top.
	{:else}
		Something went wrong loading this page. Try again, or use one of the pages below.
	{/if}
</p>
<nav aria-label="Error page">
	<ul>
		<li><a href="{base}/">Return home</a></li>
		<li><a href="{base}/about">About &amp; Mission</a></li>
		<li><a href="{base}/contact">Contact</a></li>
	</ul>
</nav>

<style>
	nav ul { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: var(--space-4); }
	nav a { min-block-size: 44px; display: inline-flex; align-items: center; }
</style>
