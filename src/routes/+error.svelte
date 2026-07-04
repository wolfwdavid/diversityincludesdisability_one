<!-- src/routes/+error.svelte -->
<!-- Branded error boundary for the SPA 404 fallback (DEPLOY-03): when GitHub Pages
     serves 404.html for an unmatched path, the client router mounts here and renders
     OUR branded page — not SvelteKit's bare default and not GitHub's raw 404 chrome. -->
<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
</script>

<svelte:head><title>Page not found — Diversity Includes Disability</title></svelte:head>

<img src="{base}/favicon.svg" alt="Diversity Includes Disability" width="48" height="48" />
<h1>Diversity Includes Disability</h1>
<p>{page.status}: {page.error?.message ?? 'Page not found'}</p>
<p>The page you were looking for could not be found.</p>
<nav><a href="{base}/">Return home</a></nav>
