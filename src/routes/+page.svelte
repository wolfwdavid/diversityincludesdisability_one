<script lang="ts">
  import { base } from '$app/paths';
</script>

<svelte:head>
  <title>Diversity Includes Disability</title>
  <meta name="description" content="Intersectional disability equity — for and by disabled people. Training, consulting, representation, and public speaking." />
</svelte:head>

<!-- Static hero placeholder. The Phase-5 Premium 3D hero replaces this region behind a capability gate. -->
<section class="hero">
  <h1>Diversity Includes Disability</h1>
  <!-- MISSION SUMMARY: org-approved 2026-07-06 — do not reword without a new sign-off. -->
  <p class="lede">
    Intersectional disability equity — for and by disabled people. Through training, consulting,
    representation, and public speaking, we help organizations move beyond compliance to genuine inclusion.
  </p>

  <div class="cta-row">
    <a class="button" href="{base}/get-involved">Get Involved</a>
    <a class="button is-secondary" href="{base}/about">About Eman &amp; the mission</a>
  </div>
</section>

<section aria-labelledby="what-we-do">
  <h2 id="what-we-do">What we do</h2>
  <p>
    We deliver intersectional disability equity and inclusion trainings, disability consulting,
    modeling for representation, and speaking — centering the leadership of disabled people of color.
    <a href="{base}/programs">See our programs &amp; services</a>.
  </p>
</section>

<style>
  .hero { padding-block: var(--space-section) var(--space-8); }
  .lede { font-size: 1.25em; color: var(--color-text); max-inline-size: var(--measure); }
  .disclaimer { color: var(--color-text-muted); }
  .cta-row { display: flex; flex-wrap: wrap; gap: var(--space-4); margin-block-start: var(--space-6); }
  section + section { margin-block-start: var(--space-section); }
</style>
