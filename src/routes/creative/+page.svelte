<script lang="ts">
  import { base } from '$app/paths';
</script>

<svelte:head>
  <title>Creative — Diversity Includes Disability</title>
  <meta name="description" content="Photos and video from Eman Rimawi-Doster's creative work: runway modeling for representation, an adaptive clothing line, poetry, and graphic novels." />
</svelte:head>

<h1>Creative</h1>
<p class="lede">
  Alongside her advocacy, Eman Rimawi-Doster models for representation, has launched an adaptive
  clothing line, and works as a poet and graphic-novel creator. Photos and video from her runway work
  are below.
</p>

<section aria-labelledby="pictures">
  <h2 id="pictures">Pictures</h2>
  <!-- MEDIA: supplied by Eman 2026-09-22; show/designer credit from Eman 2026-09-24; alt text is a draft pending her sign-off. -->
  <figure class="founder-photo">
    <picture>
      <source type="image/avif" srcset="{base}/creative/eman-runway.avif" />
      <source type="image/webp" srcset="{base}/creative/eman-runway.webp" />
      <img
        src="{base}/creative/eman-runway.jpg"
        alt="Eman Rimawi-Doster on a fashion runway, smiling over her shoulder, wearing a Revolution T-shirt and shorts with a forearm crutch, her two prosthetic legs visible, in front of a One World Peace backdrop."
        width="985"
        height="943"
        loading="lazy"
        decoding="async"
      />
    </picture>
    <figcaption>Eman walking for One World Peace Co. at The Model Experience show, New York Fashion Week.</figcaption>
  </figure>
</section>

<section aria-labelledby="videos">
  <h2 id="videos">Videos</h2>
  <!-- MEDIA: two phone clips supplied by Eman 2026-09-22. Captions/transcripts still needed (WCAG 1.2.2). -->
  <ul class="clips" role="list">
    <li>
      <video controls preload="metadata" playsinline width="176" height="144" aria-label="Clip 1 from The Model Experience runway show, 21 seconds">
        <source src="{base}/creative/eman-clip-1.mp4" type="video/mp4" />
        Your browser can't play this video. <a href="{base}/creative/eman-clip-1.mp4">Download clip 1 (MP4, 0.3 MB)</a>.
      </video>
    </li>
    <li>
      <video controls preload="metadata" playsinline width="176" height="144" aria-label="Clip 2 from The Model Experience runway show, 60 seconds">
        <source src="{base}/creative/eman-clip-2.mp4" type="video/mp4" />
        Your browser can't play this video. <a href="{base}/creative/eman-clip-2.mp4">Download clip 2 (MP4, 1 MB)</a>.
      </video>
    </li>
  </ul>
</section>

<style>
  .lede {
    font-size: 1.125em;
    color: var(--color-text-muted);
    max-inline-size: var(--measure);
  }
  .founder-photo {
    margin: 0 0 var(--space-block);
    max-inline-size: 28rem;
  }
  .founder-photo img {
    display: block;
    inline-size: 100%;
    block-size: auto;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
  }
  .founder-photo figcaption {
    margin-block-start: var(--space-2);
    font-size: 0.9375rem;
  }
  .clips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-6);
    padding: 0;
    margin: 0;
    list-style: none;
  }
  .clips video {
    display: block;
    inline-size: min(100%, 22rem);
    block-size: auto;
    background: #000;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
  }
</style>
