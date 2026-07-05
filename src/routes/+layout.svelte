<script lang="ts">
	import '$lib/styles/reset.css';
	import '$lib/styles/tokens/base.css';
	import '$lib/styles/theme-premium.css';
	import '$lib/styles/theme-accessible.css';
	import '$lib/styles/app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<a class="skip-link" href="#main-content">Skip to main content</a>
<Header />
<main id="main-content" tabindex="-1">
	<div class="container prose">
		{@render children()}
	</div>
</main>
<Footer />
