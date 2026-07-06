<script lang="ts">
	import { base } from '$app/paths';
	import { submitToWeb3Forms } from '$lib/forms/submit';
	import { validateVolunteer, type Errors } from '$lib/forms/validation';
	import FormStatus from '$lib/components/FormStatus.svelte';
	import { DONATE_URL, DONATE_PLATFORM_NAME } from '$lib/config';

	let vErrors = $state<Errors>({});
	let vStatus = $state<'idle' | 'sending' | 'ok' | 'err'>('idle');
	let vMessage = $state('');

	async function onVolunteerSubmit(e: SubmitEvent) {
		e.preventDefault();
		const form = e.currentTarget as HTMLFormElement;
		const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
		vErrors = validateVolunteer(data);
		if (Object.keys(vErrors).length) {
			document.getElementById(`v-${Object.keys(vErrors)[0]}`)?.focus();
			return;
		}
		vStatus = 'sending';
		vMessage = 'Sending…';
		const { ok, message } = await submitToWeb3Forms({ ...data, subject: 'Volunteer interest' });
		vStatus = ok ? 'ok' : 'err';
		vMessage = ok
			? 'Thank you for offering to help — we will be in touch.'
			: message;
	}
</script>

<svelte:head>
	<title>Get Involved — Diversity Includes Disability</title>
	<meta name="description" content="Volunteer, invite Eman to speak, partner with us, or donate to support intersectional disability equity." />
</svelte:head>

<h1>Get Involved</h1>
<!-- COPY: AUTHORED PLACEHOLDER — confirm with organization before launch. -->
<p class="lede">Volunteer, invite Eman to speak, partner with us, or donate — every kind of support moves the work forward.</p>
<p class="disclaimer"><em>Placeholder copy — pending organization sign-off.</em></p>

<section aria-labelledby="ways">
	<h2 id="ways">Ways to help</h2>
	<ul>
		<li><strong>Volunteer</strong> your time and skills for disabled-led advocacy.</li>
		<li><strong>Invite Eman</strong> to speak or run a training — see <a href="{base}/programs">Programs &amp; Services</a>.</li>
		<li><strong>Partner</strong> with us on accessibility and inclusion — <a href="{base}/contact">contact us</a>.</li>
	</ul>
</section>

<section aria-labelledby="volunteer">
	<h2 id="volunteer">Volunteer with us</h2>
	<!-- COPY: AUTHORED PLACEHOLDER — confirm with organization before launch. -->
	<p>Tell us a little about yourself and how you would like to help.</p>

	{#if vStatus === 'ok'}
		<FormStatus kind="ok" message={vMessage} />
	{:else}
		<form novalidate onsubmit={onVolunteerSubmit} aria-busy={vStatus === 'sending'}>
			<div class="field">
				<label for="v-name">Name</label>
				<input id="v-name" name="name" type="text" autocomplete="name"
				       aria-describedby="v-name-error" aria-invalid={!!vErrors.name} required />
				<p id="v-name-error" class="error">{vErrors.name ?? ''}</p>
			</div>
			<div class="field">
				<label for="v-email">Email</label>
				<input id="v-email" name="email" type="email" autocomplete="email"
				       aria-describedby="v-email-error" aria-invalid={!!vErrors.email} required />
				<p id="v-email-error" class="error">{vErrors.email ?? ''}</p>
			</div>
			<div class="field">
				<label for="v-message">How would you like to help?</label>
				<textarea id="v-message" name="message" rows="5"
				          aria-describedby="v-message-error" aria-invalid={!!vErrors.message} required></textarea>
				<p id="v-message-error" class="error">{vErrors.message ?? ''}</p>
			</div>
			<input type="checkbox" name="botcheck" style="display:none" tabindex="-1" aria-hidden="true" />
			<button class="button" type="submit">
				{vStatus === 'sending' ? 'Sending…' : 'Sign me up'}
			</button>
			{#if vStatus === 'err'}
				<FormStatus kind="err" message={vMessage} />
				<p class="disclaimer">If this keeps happening, email <a href="mailto:emanrimawi@gmail.com">emanrimawi@gmail.com</a>.</p>
			{/if}
		</form>
	{/if}
</section>

<section aria-labelledby="donate">
	<h2 id="donate">Donate</h2>
	<p>Support our work directly. Donations are handled securely on {DONATE_PLATFORM_NAME}, an external platform.</p>
	<p>
		<a class="button" href={DONATE_URL} target="_blank" rel="noopener noreferrer">
			Donate on {DONATE_PLATFORM_NAME}<span class="sr-only"> (opens in a new tab)</span>
		</a>
	</p>
	<p class="disclaimer">
		Clicking this link leaves our site; {DONATE_PLATFORM_NAME}'s own privacy policy applies. We never process payments on this site.
	</p>
</section>

<style>
	.lede { font-size: 1.125em; max-inline-size: var(--measure); }
	.disclaimer { color: var(--color-text-muted); }
	section { margin-block-start: var(--space-6); }
	ul { padding-inline-start: var(--space-6); }
	li { margin-block: var(--space-2); }
	form { display: grid; gap: var(--space-6); max-inline-size: var(--measure); margin-block-start: var(--space-6); }
	.field { display: grid; gap: var(--space-2); }
	label { font-weight: var(--font-weight-heading); }
	input, textarea {
		padding: var(--space-3); font: inherit;
		color: var(--color-text); background: var(--color-bg);
		border: 1px solid var(--color-border); border-radius: var(--radius);
	}
	input[aria-invalid="true"], textarea[aria-invalid="true"] { border-color: var(--color-accent); border-width: 2px; }
	input:focus-visible, textarea:focus-visible { outline: var(--focus-ring-width) solid var(--color-focus); outline-offset: 2px; }
	.error { color: var(--color-text-muted); min-height: 1em; margin: 0; }
	.error:empty { min-height: 0; }
</style>
