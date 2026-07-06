<script lang="ts">
	import { submitToWeb3Forms } from '$lib/forms/submit';
	import { validateContact, type Errors } from '$lib/forms/validation';
	import FormStatus from '$lib/components/FormStatus.svelte';

	let errors = $state<Errors>({});
	let status = $state<'idle' | 'sending' | 'ok' | 'err'>('idle');
	let statusMessage = $state('');

	async function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		const form = e.currentTarget as HTMLFormElement;
		const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
		errors = validateContact(data);
		if (Object.keys(errors).length) {
			document.getElementById(`c-${Object.keys(errors)[0]}`)?.focus();
			return;
		}
		status = 'sending';
		statusMessage = 'Sending your message…';
		const { ok, message } = await submitToWeb3Forms(data);
		status = ok ? 'ok' : 'err';
		statusMessage = ok
			? 'Thank you — your message has been sent. We will be in touch.'
			: message;
	}
</script>

<svelte:head>
	<title>Contact — Diversity Includes Disability</title>
	<meta name="description" content="Contact Diversity Includes Disability to book a training, request consulting, or partner with us." />
</svelte:head>

<h1>Contact</h1>
<p class="lede">
	Prefer email? Reach us directly at
	<a href="mailto:emanrimawi@gmail.com">emanrimawi@gmail.com</a>.
</p>

{#if status === 'ok'}
	<FormStatus kind="ok" message={statusMessage} />
{:else}
	<form novalidate {onsubmit} aria-busy={status === 'sending'}>
		<div class="field">
			<label for="c-name">Name</label>
			<input id="c-name" name="name" type="text" autocomplete="name"
			       aria-describedby="c-name-error" aria-invalid={!!errors.name} required />
			<p id="c-name-error" class="error">{errors.name ?? ''}</p>
		</div>

		<div class="field">
			<label for="c-email">Email</label>
			<input id="c-email" name="email" type="email" autocomplete="email"
			       aria-describedby="c-email-error" aria-invalid={!!errors.email} required />
			<p id="c-email-error" class="error">{errors.email ?? ''}</p>
		</div>

		<div class="field">
			<label for="c-message">Message</label>
			<textarea id="c-message" name="message" rows="6"
			          aria-describedby="c-message-error" aria-invalid={!!errors.message} required></textarea>
			<p id="c-message-error" class="error">{errors.message ?? ''}</p>
		</div>

		<!-- Honeypot: bots tick it; SR/keyboard users never reach it. -->
		<input type="checkbox" name="botcheck" style="display:none" tabindex="-1" aria-hidden="true" />

		<button class="button" type="submit">
			{status === 'sending' ? 'Sending…' : 'Send message'}
		</button>

		{#if status === 'err'}
			<FormStatus kind="err" message={statusMessage} />
			<p class="disclaimer">
				If this keeps happening, email us at
				<a href="mailto:emanrimawi@gmail.com">emanrimawi@gmail.com</a>.
			</p>
		{/if}
	</form>
{/if}

<style>
	.lede { font-size: 1.125em; max-inline-size: var(--measure); }
	.disclaimer { color: var(--color-text-muted); }
	form { display: grid; gap: var(--space-6); max-inline-size: var(--measure); margin-block-start: var(--space-6); }
	.field { display: grid; gap: var(--space-2); }
	label { font-weight: var(--font-weight-heading); }
	input, textarea {
		padding: var(--space-3); font: inherit;
		color: var(--color-text); background: var(--color-bg);
		border: 1px solid var(--color-border); border-radius: var(--radius);
	}
	input[aria-invalid="true"], textarea[aria-invalid="true"] { border-color: var(--color-accent); border-width: 2px; }
	input:focus-visible, textarea:focus-visible {
		outline: var(--focus-ring-width) solid var(--color-focus); outline-offset: 2px;
	}
	.error { color: var(--color-text-muted); min-height: 1em; margin: 0; }
	.error:empty { min-height: 0; }
</style>
