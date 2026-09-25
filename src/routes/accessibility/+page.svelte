<script lang="ts">
  import { base } from '$app/paths';
</script>

<svelte:head>
  <title>Accessibility statement — Diversity Includes Disability</title>
  <meta name="description" content="How accessible this website is, how we test it, what we know is not fixed yet, and how to tell us about a barrier." />
</svelte:head>

<h1>Accessibility statement</h1>
<p class="lede">
  Diversity Includes Disability is run for and by disabled people, so this website has to work for
  everyone. This page says how accessible it is, what we still need to fix, and how to reach us if
  something gets in your way.
</p>

<section aria-labelledby="conformance">
  <h2 id="conformance">Conformance target</h2>
  <p>
    We aim to meet the <a href="https://www.w3.org/TR/WCAG22/" rel="noopener">Web Content
    Accessibility Guidelines (WCAG) 2.2</a> at level AA across the whole site, in both of its
    themes. The Accessible theme is the conformance target; the Premium theme is held to the same
    checks.
  </p>
</section>

<section aria-labelledby="testing">
  <h2 id="testing">How we test</h2>
  <ul>
    <li>
      Automated checks with axe-core run against every page of the site, in both themes, before
      each release. They cover the WCAG 2.0, 2.1 and 2.2 A and AA rules that can be checked by
      machine, and a release does not ship while any of them fails.
    </li>
    <li>
      Automated keyboard checks confirm the skip link, the menu, focus outlines and target sizes on
      every release.
    </li>
    <li>
      A manual keyboard and screen-reader walk-through of both themes is done before each release,
      because automated tools cannot judge reading order, announcements or focus handling.
    </li>
  </ul>
</section>

<section aria-labelledby="themes">
  <h2 id="themes">Two themes</h2>
  <p>
    The site has two complete designs. The <strong>Accessible</strong> theme is light and high
    contrast, uses larger text, has no animation and never loads 3D graphics. The
    <strong>Premium</strong> theme is dark, animated, and shows a decorative 3D scene on the home
    page. The 3D scene is hidden from assistive technology and is replaced by a still image when
    your device asks for reduced motion or cannot run it.
  </p>
  <p>
    Use the theme button at the top of every page to switch at any time. If your system is set to
    reduced motion or increased contrast, your first visit starts in the Accessible theme.
  </p>
</section>

<section aria-labelledby="known-issues">
  <h2 id="known-issues">Known issues</h2>
  <p>We know about the following problems and are working to fix them:</p>
  <ul>
    <li>
      The two runway video clips on the <a href="{base}/creative">Creative page</a> do not have
      captions or a transcript yet (WCAG 1.2.2). Each clip has a short text label describing what
      it shows.
    </li>
    <li>
      The photo description (alt text) on the Creative page is a draft that is still waiting for
      the founder's sign-off.
    </li>
  </ul>
  <p>
    Apart from these, our latest automated checks found no WCAG 2.2 AA failures on any page in
    either theme.
  </p>
</section>

<section aria-labelledby="help">
  <h2 id="help">Get help or report a problem</h2>
  <p>
    If any part of this site is hard to use, or you need information in another format, email
    <a href="mailto:diversityincludesdisability@gmail.com">diversityincludesdisability@gmail.com</a>.
    Tell us the page and what went wrong. We are a small nonprofit and will reply as soon as we
    can.
  </p>
  <p>This statement was written on 25 September 2026.</p>
</section>

<style>
  .lede {
    font-size: 1.125em;
    max-inline-size: var(--measure);
  }
</style>
