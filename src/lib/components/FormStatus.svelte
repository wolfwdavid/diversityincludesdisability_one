<script lang="ts">
	let { kind, message }: { kind: 'ok' | 'err' | 'sending'; message: string } = $props();
	let el = $state<HTMLElement>();
	$effect(() => {
		if (kind === 'ok' || kind === 'err') el?.focus();
	});
</script>

<p
	bind:this={el}
	tabindex="-1"
	role={kind === 'err' ? 'alert' : 'status'}
	aria-live={kind === 'err' ? 'assertive' : 'polite'}
	class="form-status {kind}"
>
	{message}
</p>

<style>
	.form-status {
		margin-block: var(--space-4) 0;
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius);
		border: 1px solid var(--color-border);
		max-inline-size: var(--measure);
	}
	.form-status:focus-visible {
		outline: var(--focus-ring-width) solid var(--color-focus);
		outline-offset: 2px;
	}
	.form-status.ok { border-color: var(--color-accent); }
	.form-status.err { border-color: var(--color-accent); font-weight: var(--font-weight-heading); }
</style>
