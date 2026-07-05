<script lang="ts">
	import '$lib/styles/reset.css';
	import '$lib/styles/tokens/base.css';
	import '$lib/styles/theme-premium.css';
	import '$lib/styles/theme-accessible.css';
	import favicon from '$lib/assets/favicon.svg';
	import ThemeToggle from '$lib/theme/ThemeToggle.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ThemeToggle />

{@render children()}
