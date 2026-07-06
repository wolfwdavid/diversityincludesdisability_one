<script lang="ts">
  import { base } from '$app/paths';
  import PremiumHero from '$lib/components/premium/PremiumHero.svelte';
  import { theme } from '$lib/theme/theme.svelte';
</script>

<svelte:head>
  <title>Diversity Includes Disability</title>
  <meta name="description" content="Intersectional disability equity — for and by disabled people. Training, consulting, representation, and public speaking." />
</svelte:head>

<!-- Static hero placeholder. The Phase-5 Premium 3D hero replaces this region behind a capability gate. -->
<section class="hero">
  <!-- Premium-only poster: the permanent fallback for every non-render path (reduced-motion,
       no-WebGL, low-power, import failure, context loss) AND the crossfade origin — the canvas
       (.hero-scene, z1) fades in OVER this on first frame so it reads as "the stars begin to move"
       (D-17). Accessible renders NO image (D-15). Base-prefixed for the sub-path deploy. -->
  {#if theme.current === 'premium'}
    <picture class="hero__poster" aria-hidden="true">
      <source type="image/avif" srcset="{base}/hero/constellation-poster.avif" />
      <source type="image/webp" srcset="{base}/hero/constellation-poster.webp" />
      <img src="{base}/hero/constellation-poster.jpg" alt="" width="1112" height="1530" />
    </picture>
  {/if}
  <!-- Premium-only decorative 3D background (behind the text). Three-free gate; mounts the scene
       only when the capability gate passes, else renders nothing and the poster shows. -->
  <PremiumHero />
  <div class="hero__scrim" aria-hidden="true"></div>
  <div class="hero__content">
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
  .hero { position: relative; isolation: isolate; padding-block: var(--space-section) var(--space-8); }
  /* Poster underlay (z0): the canvas (.hero-scene, z1) crossfades in over it. Decorative. */
  .hero__poster { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
  .hero__poster img { inline-size: 100%; block-size: 100%; object-fit: cover; }
  /* Text sits above the poster (z0), the scene (z1, app.css) and the scrim (z2). */
  .hero__content { position: relative; z-index: 3; }
  /* Soft darkening behind the text column so Premium text keeps AA margin where orbs overlap.
     Inert (pointer-events:none) and transparent to content; harmless in Accessible (no scene there). */
  .hero__scrim {
    position: absolute; inset: 0; z-index: 2; pointer-events: none;
    background: radial-gradient(ellipse at center,
      rgba(15, 16, 32, 0.72) 0%, rgba(15, 16, 32, 0.35) 60%, transparent 100%);
  }
  .lede { font-size: 1.25em; color: var(--color-text); max-inline-size: var(--measure); }
  .disclaimer { color: var(--color-text-muted); }
  .cta-row { display: flex; flex-wrap: wrap; gap: var(--space-4); margin-block-start: var(--space-6); }
  section + section { margin-block-start: var(--space-section); }

  /* Premium-only tall hero (D-12); Accessible keeps its compact text hero untouched. */
  :global(:root[data-theme='premium']) .hero {
    min-block-size: 85svh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  /* Short/landscape viewports: never let the CTA scroll off. */
  @media (max-height: 32rem) {
    :global(:root[data-theme='premium']) .hero { min-block-size: auto; }
  }
</style>
