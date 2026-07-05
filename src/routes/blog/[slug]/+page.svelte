<script lang="ts">
	let { data } = $props();
	const Content = $derived(data.Content);
	const meta = $derived(data.meta);
</script>

<svelte:head><title>{meta.title} — Diversity Includes Disability</title></svelte:head>

<article>
	<h1>{meta.title}</h1>
	<p class="post-date"><time datetime={meta.date}>{meta.date}</time></p>
	<Content />
</article>

<style>
	article {
		padding-block: var(--space-6);
	}
	.post-date {
		color: var(--color-text-muted);
	}
	article :global(pre.shiki) {
		padding: var(--space-4);
		border-radius: var(--radius);
		overflow-x: auto;
		margin-block: var(--space-4);
	}
</style>
