<script lang="ts">
  import { base } from '$app/paths';
</script>

<svelte:head>
  <title>Programs &amp; Services — Diversity Includes Disability</title>
  <meta name="description" content="Intersectional disability equity trainings, disability consulting, modeling for representation, and speaking." />
</svelte:head>

<h1>Programs &amp; Services</h1>
<p class="lede">We offer four core services, delivered for and by disabled people.</p>

<section aria-labelledby="s-trainings">
  <h2 id="s-trainings">Intersectional Disability Equity and Inclusion trainings and facilitation</h2>
  <p>Trainings and facilitation that center intersectional disability equity — moving teams beyond compliance toward genuine inclusion.</p>
</section>

<section aria-labelledby="s-consulting">
  <h2 id="s-consulting">Disability Consulting</h2>
  <p>Consulting for organizations that want disabled-led guidance on access, policy, and inclusive practice.</p>
</section>

<section aria-labelledby="s-modeling">
  <h2 id="s-modeling">Modeling for Representation</h2>
  <p>Modeling work that expands authentic representation of disabled people.</p>
</section>

<section aria-labelledby="s-speaking">
  <h2 id="s-speaking">Speaker and Panelist</h2>
  <p>Keynotes, panels, and public speaking on disability justice, accessible transit, voting rights, and health equity.</p>
</section>

<p class="cta"><a class="button" href="{base}/contact">Book Eman or request a training</a></p>

<style>
  .lede { font-size: 1.125em; color: var(--color-text-muted); max-inline-size: var(--measure); }
  section { margin-block-start: var(--space-6); }
  .cta { margin-block-start: var(--space-section); }
</style>
