<script lang="ts">
  import { base } from '$app/paths';
</script>

<svelte:head>
  <title>About &amp; Mission — Diversity Includes Disability</title>
  <meta name="description" content="About Eman Rimawi-Doster, founder and Executive Director of Diversity Includes Disability, and the organization's mission." />
</svelte:head>

<h1>About &amp; Mission</h1>

<section aria-labelledby="mission">
  <h2 id="mission">Our mission</h2>
  <!-- MISSION: org-approved 2026-07-06 — do not reword without a new sign-off. -->
  <p>
    Diversity Includes Disability advances intersectional disability equity — for and by disabled people.
    Through training, consulting, representation, and public speaking, we help organizations move beyond
    compliance to genuine inclusion, centering the leadership of disabled people of color.
  </p>
</section>

<section aria-labelledby="founder">
  <h2 id="founder">About Eman Rimawi-Doster</h2>
  <!-- MEDIA: supplied by Eman 2026-09-22; alt text is a draft pending her sign-off. -->
  <figure class="founder-photo">
    <picture>
      <source type="image/avif" srcset="{base}/about/eman-runway.avif" />
      <source type="image/webp" srcset="{base}/about/eman-runway.webp" />
      <img
        src="{base}/about/eman-runway.jpg"
        alt="Eman Rimawi-Doster on a fashion runway, smiling over her shoulder, wearing a Revolution T-shirt and shorts with a forearm crutch, her two prosthetic legs visible, in front of a One World Worldwide backdrop."
        width="985"
        height="943"
        loading="lazy"
        decoding="async"
      />
    </picture>
    <figcaption>Eman walking the runway at a One World Worldwide show.</figcaption>
  </figure>
  <p>
    Eman Rimawi-Doster is a disability-justice advocate, organizer, and the founder and Executive
    Director of Diversity Includes Disability — an organization built for and by disabled people. A mixed
    Black Palestinian woman, bilateral amputee, and person living with lupus, Eman has spent years as one
    of New York's most forceful voices for accessible transit, voting rights, and health equity, including
    leading the Access-A-Ride campaign at New York Lawyers for the Public Interest. She also serves as
    Executive Director of the Harlem Independent Living Center.
  </p>
  <p>
    Since becoming a double amputee in 2014, Eman has also launched an adaptive clothing line and works
    as a poet and graphic-novel creator.
  </p>
</section>

<section aria-labelledby="watch">
  <h2 id="watch">Watch</h2>
  <!-- MEDIA: two phone clips supplied by Eman 2026-09-22. Captions/transcripts still needed (WCAG 1.2.2). -->
  <ul class="clips" role="list">
    <li>
      <video controls preload="metadata" playsinline width="176" height="144" aria-label="Clip 1 from Eman, 21 seconds">
        <source src="{base}/about/eman-clip-1.mp4" type="video/mp4" />
        Your browser can't play this video. <a href="{base}/about/eman-clip-1.mp4">Download clip 1 (MP4, 0.3 MB)</a>.
      </video>
    </li>
    <li>
      <video controls preload="metadata" playsinline width="176" height="144" aria-label="Clip 2 from Eman, 60 seconds">
        <source src="{base}/about/eman-clip-2.mp4" type="video/mp4" />
        Your browser can't play this video. <a href="{base}/about/eman-clip-2.mp4">Download clip 2 (MP4, 1 MB)</a>.
      </video>
    </li>
  </ul>
</section>

<section aria-labelledby="work">
  <h2 id="work">Our work</h2>
  <p>
    Explore our <a href="{base}/programs">programs &amp; services</a>, find out how to
    <a href="{base}/get-involved">get involved</a>, or <a href="{base}/contact">contact us</a>.
  </p>
</section>

<style>
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
