<script lang="ts">
  import { base } from '$app/paths';
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

<section aria-labelledby="donate">
  <h2 id="donate">Donate</h2>
  <p>Support our work directly. Donations open on our external giving platform.</p>
  <!-- TODO(Phase 4/FORM-04): replace href="#" with the real external donation URL. No embedded payment widget. -->
  <p>
    <!-- svelte-ignore a11y_invalid_attribute -->
    <a class="button" href="#" rel="noopener noreferrer">Donate (external)</a>
  </p>
  <p class="disclaimer"><em>Donation link is a placeholder — the giving platform URL is wired in Phase 4.</em></p>
</section>

<style>
  .lede { font-size: 1.125em; max-inline-size: var(--measure); }
  .disclaimer { color: var(--color-text-muted); }
  section { margin-block-start: var(--space-6); }
  ul { padding-inline-start: var(--space-6); }
  li { margin-block: var(--space-2); }
</style>
