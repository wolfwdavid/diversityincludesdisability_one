---
phase: 05-premium-3d-hero
plan: 03
type: execute
wave: 3
depends_on: ["05-02"]
files_modified:
  - scripts/capture-poster.mjs
  - static/hero/constellation-poster.avif
  - static/hero/constellation-poster.webp
  - static/hero/constellation-poster.jpg
  - src/routes/+page.svelte
  - package.json
autonomous: false
requirements: [HERO-03, A11Y-05]
must_haves:
  truths:
    - "A high-quality still of the actual constellation scene is committed as AVIF + WebP + JPG under static/hero/"
    - "In Premium mode the poster shows first and the live scene crossfades in over 800ms ('the stars begin to move')"
    - "Every gate-fail path (accessible / reduced-motion / no-WebGL / low-power / import fail / context loss) lands on the poster (Premium); Accessible renders NO image"
    - "The hero heading + CTA stay AA-contrast over the scrimmed worst-case (brightest orb behind text)"
  artifacts:
    - path: "static/hero/constellation-poster.avif"
      provides: "primary optimized poster (base-prefixed at render)"
    - path: "src/routes/+page.svelte"
      provides: "Premium-only <picture> poster (base-prefixed via $app/paths) beneath the canvas; crossfade underlay"
      contains: "constellation-poster"
    - path: "scripts/capture-poster.mjs"
      provides: "dev-only capture pipeline: Playwright screenshot of the live scene -> sharp -> avif/webp/jpg"
      contains: "sharp"
  key_links:
    - from: "src/routes/+page.svelte"
      to: "static/hero/constellation-poster.*"
      via: "<picture> srcset base-prefixed with $app/paths base"
      pattern: "\\{base\\}/hero/constellation-poster"
    - from: "src/routes/+page.svelte"
      to: "src/lib/theme/theme.svelte.ts"
      via: "poster rendered only when theme.current === 'premium' (D-15)"
      pattern: "theme.current === 'premium'"
---

<objective>
Produce and wire the poster — the permanent Premium fallback and the crossfade origin. Capture a beautiful still of the real constellation, optimize it to AVIF/WebP/JPG, commit it, render it Premium-only (base-prefixed) beneath the canvas, and crossfade the live scene in over 800ms so gate-passed visitors watch "the stars begin to move" while every gate-FAIL visitor sees the same art, frozen. Then drive the poster-dependent capability specs green and confirm AA contrast.

Purpose: HERO-03 (static poster in all non-render cases; Accessible gets NO image) and the poster half of A11Y-05 (reduced-motion -> poster, zero canvas). Closes the fallback matrix.
Output: `static/hero/constellation-poster.{avif,webp,jpg}`, `scripts/capture-poster.mjs`, the Premium-only `<picture>` + crossfade underlay in `+page.svelte`, green fallback specs, and a human-verified poster + AA sign-off.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/phases/05-premium-3d-hero/05-CONTEXT.md
@.planning/phases/05-premium-3d-hero/05-RESEARCH.md
@.planning/phases/05-premium-3d-hero/05-02-SUMMARY.md

<interfaces>
<!-- From 05-01 / 05-02 (shipped). Use directly. -->
Hero seam — src/routes/+page.svelte: `<section class="hero">` contains `<PremiumHero />` (z-index 1), `.hero__scrim` (z-index 2), text content (z-index 3). `.hero { position: relative; isolation: isolate; }`.
Crossfade CSS — src/lib/styles/app.css (from 05-01): `.hero-scene { opacity: 0; transition: opacity 800ms var(--motion-ease); } .hero-scene.is-ready { opacity: 1; }`. HeroScene applies `.is-ready` from `sceneReady`, raised by PremiumHero's `onReady` (first useTask tick). The crossfade is ALREADY wired end-to-end in 05-02 — this plan only adds the poster UNDERLAY the canvas fades in over.
Base path — `import { base } from '$app/paths'` (already imported in +page.svelte). All internal asset URLs MUST be `{base}/...` for the /diversityincludesdisability_one sub-path deploy (Pitfall 7).
Theme store — `import { theme } from '$lib/theme/theme.svelte'`; `theme.current === 'premium'`.
Windows harness — self-managed `vite preview` on port 4173 + `reuseExistingServer` (managed webServer hangs at teardown; see 04-02-SUMMARY / Pitfall 6).
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Capture + optimize + commit the constellation poster</name>
  <read_first>
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\diversityincludesdisability_one\src\lib\components\premium\scene\Scene.svelte (the live scene being captured — from 05-02)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\diversityincludesdisability_one\playwright.theme.config.ts (Playwright + local preview pattern to reuse for the capture)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\diversityincludesdisability_one\.planning\phases\05-premium-3d-hero\05-RESEARCH.md (§Poster — D-14/16 capture-during-dev, AVIF/WebP + fallback, base-prefixed, no build-time render pipeline)
  </read_first>
  <files>scripts/capture-poster.mjs, static/hero/constellation-poster.avif, static/hero/constellation-poster.webp, static/hero/constellation-poster.jpg, package.json</files>
  <action>
    1. Install the dev-only image encoder: `npm install -D sharp`. sharp is used ONLY by the capture script at dev time; app code never imports it, so it cannot leak into the client bundle (the boundary/build gates confirm this).
    2. Write `scripts/capture-poster.mjs` (Node + Playwright chromium + sharp):
       - Launch chromium with `deviceScaleFactor: 2`, viewport ~1600x900 (2x capture, D-16).
       - `addInitScript` to set `localStorage['did:theme'] = 'premium'`; `emulateMedia({ reducedMotion: 'no-preference' })`; goto the local preview `http://localhost:4173/`.
       - Wait for `canvas` visible; wait ~2-3s so the drift reaches a pleasing frame (a fixed elapsed target is fine).
       - Screenshot the `.hero` region (bounding box) to an in-memory PNG buffer via `locator('.hero').screenshot()`.
       - With sharp, emit three files to `static/hero/`: `constellation-poster.avif` (quality ~55), `constellation-poster.webp` (quality ~80), `constellation-poster.jpg` (quality ~82 — the universal fallback). Keep each well under ~200 KB.
       - Print the three output byte sizes.
       This script requires a running preview (start `npm run build && npm run preview -- --port 4173 --strictPort` first, Windows-safe). Do NOT wire it into `npm test` or CI — it is a one-off dev tool.
    3. Run the capture against the running preview; verify the three files exist and are non-empty. Stage them under `static/hero/`.
    4. Sanity (D-14): the poster must visually match the live scene so the load-in reads as motion starting. If the captured frame is unflattering, re-run at a different elapsed target (composition is Claude's discretion). Final aesthetic sign-off happens at the Task 3 checkpoint.
  </action>
  <verify>
    <automated>ls -l static/hero/constellation-poster.avif static/hero/constellation-poster.webp static/hero/constellation-poster.jpg && node -e "const s=require('fs').statSync('static/hero/constellation-poster.jpg').size; if(s<2000||s>250000) throw new Error('poster jpg size out of range: '+s); console.log('jpg bytes',s)"</automated>
  </verify>
  <acceptance_criteria>
    - `scripts/capture-poster.mjs` exists and `grep -c "sharp" scripts/capture-poster.mjs` returns >=1 AND `grep -c "did:theme" scripts/capture-poster.mjs` returns 1
    - All three of `static/hero/constellation-poster.avif`, `.webp`, `.jpg` exist and are >2 KB and <250 KB each
    - `grep -c "\"sharp\"" package.json` returns 1 (dev dependency)
    - sharp appears ONLY under devDependencies (never a runtime import): `grep -rc "from 'sharp'\|require('sharp')" src/` returns 0
  </acceptance_criteria>
  <done>The real constellation is captured at 2x and committed as AVIF + WebP + JPG under static/hero/, each optimized and under budget; capture is a dev-only script, not in CI.</done>
</task>

<task type="auto">
  <name>Task 2: Wire the Premium-only base-prefixed poster + drive the fallback specs green</name>
  <read_first>
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\diversityincludesdisability_one\src\routes\+page.svelte (from 05-02 — you add the poster UNDER PremiumHero; text + scrim + 85svh stay as-is)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\diversityincludesdisability_one\e2e\premium-hero.spec.ts (the poster-dependent assertions to turn green — from 05-01)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\diversityincludesdisability_one\.planning\phases\05-premium-3d-hero\05-RESEARCH.md (§Hero Composition/Poster — z-order, Premium-only render, base-prefix, D-15 Accessible NO image)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\diversityincludesdisability_one\.planning\phases\05-premium-3d-hero\05-CONTEXT.md (D-14/D-15/D-17)
  </read_first>
  <files>src/routes/+page.svelte</files>
  <action>
    Edit `src/routes/+page.svelte`. Keep the h1/lede/disclaimer/CTA text nodes unchanged.
    1. Add the poster as the FIRST child of `<section class="hero">`, BENEATH `<PremiumHero />` (poster z-index 0; canvas z-index 1 from app.css; scrim z-index 2; text z-index 3). Render it ONLY in Premium (D-15 — Accessible renders NO image):
       ```svelte
       {#if theme.current === 'premium'}
         <picture class="hero__poster" aria-hidden="true">
           <source type="image/avif" srcset="{base}/hero/constellation-poster.avif" />
           <source type="image/webp" srcset="{base}/hero/constellation-poster.webp" />
           <img src="{base}/hero/constellation-poster.jpg" alt="" width="1600" height="900" />
         </picture>
       {/if}
       ```
       Ensure `theme` is imported (`import { theme } from '$lib/theme/theme.svelte'`) and `base` is already imported. Every URL is `{base}/hero/...` (Pitfall 7 — a raw `/hero/...` 404s on the sub-path deploy).
    2. Add `.hero__poster` styling in the scoped `<style>`: `position:absolute; inset:0; z-index:0; pointer-events:none;` and the `img` `width:100%; height:100%; object-fit:cover;`. The poster is `aria-hidden` and decorative (the real content is the DOM text). The canvas (`.hero-scene`, z-index 1, opacity 0->1) fades in OVER this poster on `sceneReady` — the 800ms crossfade (already wired in app.css/HeroScene) now visibly reads as "the stars begin to move" (D-17).
    3. The poster is the permanent Premium fallback for every non-render branch: accessible (not rendered — D-15), reduced-motion, no-WebGL, low-power, `{:catch}` import failure, and `contextLost` (PremiumHero's show3D goes false but the poster stays mounted beneath). No extra wiring needed — the `{#if theme.current === 'premium'}` poster is always present in Premium; only the canvas overlay is gated.
    4. Drive the poster-dependent capability specs GREEN (Windows-safe harness): start `npm run build && npm run preview -- --port 4173 --strictPort`, then run `npx playwright test --config playwright.theme.config.ts e2e/premium-hero.spec.ts`, then taskkill the preview. Targets now green:
       - accessible: no canvas AND no `.hero picture, .hero img` (D-15) AND h1 visible;
       - A11Y-05 premium + reduced-motion: `.hero picture` VISIBLE (poster) AND zero canvas AND no three chunk downloaded;
       - premium + motion + capable: canvas mounts, `.hero-scene` aria-hidden.
    5. Run the full phase gate: `npm run build && node scripts/check-3d-boundary.mjs && npx playwright test --config playwright.theme.config.ts e2e/premium-hero.spec.ts e2e/premium-bundle.spec.ts e2e/premium-dispose.spec.ts` — all green.
  </action>
  <verify>
    <automated>npm run build && node scripts/check-3d-boundary.mjs && npx playwright test --config playwright.theme.config.ts e2e/premium-hero.spec.ts</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "hero__poster" src/routes/+page.svelte` returns >=2 (element + style)
    - `grep -c "{base}/hero/constellation-poster" src/routes/+page.svelte` returns 3 (avif + webp + jpg all base-prefixed)
    - `grep -c "theme.current === 'premium'" src/routes/+page.svelte` returns >=1 (Premium-only poster, D-15)
    - `grep -c "three\|@threlte" src/routes/+page.svelte` returns 0 (entry stays three-free)
    - `node scripts/check-3d-boundary.mjs` exits 0 (`home bundle is WebGL-free`)
    - `e2e/premium-hero.spec.ts` passes fully incl. the accessible-no-image, reduced-motion-poster, and premium-canvas branches; `e2e/premium-bundle.spec.ts` + `e2e/premium-dispose.spec.ts` still green
  </acceptance_criteria>
  <done>Premium renders the base-prefixed poster beneath a canvas that crossfades in over 800ms; Accessible renders no image; every gate-fail path shows the poster; all five capability specs are green.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Human verify — poster aesthetic + AA contrast over the worst-case frame</name>
  <what-built>
    A committed AVIF/WebP/JPG poster captured from the live constellation, rendered Premium-only and base-prefixed, with an 800ms poster->scene crossfade; scrim + edge-band exclusion zone protecting hero text legibility. All automated capability specs (canvas branches, poster branches, bundle split, dispose x15, context loss) are green.
  </what-built>
  <how-to-verify>
    1. Start a local preview: `npm run build && npm run preview -- --port 4173 --strictPort`, open `http://localhost:4173/`.
    2. Toggle to Premium. Confirm: the poster appears immediately, then the constellation fades in over ~0.8s ("the stars begin to move"), not a hard swap. Reload a few times to confirm the crossfade reads well.
    3. AA contrast (A11Y-05, the one manual-only check per 05-VALIDATION): with the scene running, watch for the moment a BRIGHT orb drifts nearest the text column. Screenshot that worst-case frame; sample the h1 and CTA text pixels vs their immediate background (the scrimmed region) and confirm >=4.5:1 (normal text) / >=3:1 (the large h1). If marginal, deepen the scrim (`.hero__scrim` rgba alpha) rather than dimming orbs, and re-verify. Tools: browser devtools color picker, or any contrast checker on the captured pixels.
    4. Toggle to Accessible: confirm NO hero image and the compact text hero is unchanged (D-15).
    5. Emulate reduced-motion (devtools Rendering -> Emulate CSS prefers-reduced-motion: reduce) in Premium: confirm the poster shows and NO canvas mounts (A11Y-05).
    6. Mobile check (narrow the viewport <=640px in Premium): confirm the scene still mounts (~20 orbs), no parallax, and the CTA remains on-screen at 85svh (short-viewport handling).
  </how-to-verify>
  <resume-signal>Type "approved" if the poster is beautiful, the crossfade reads as "waking up", AA holds over the worst-case orb frame, Accessible has no image, and reduced-motion shows the poster with zero canvas. Otherwise describe the issue (unflattering frame / crossfade / marginal contrast / mobile CTA) and it will be addressed.</resume-signal>
  <files>src/routes/+page.svelte, src/lib/styles/app.css</files>
  <action>Human-in-the-loop verification of the two things automation cannot judge: (1) poster aesthetic + the 800ms "stars begin to move" crossfade, and (2) AA contrast of the hero text over the worst-case bright-orb frame (the one manual-only check named in 05-VALIDATION). Present the how-to-verify steps to the user, wait for the resume signal, and if contrast is marginal deepen the `.hero__scrim` rgba alpha (never dim the orbs) and re-verify before proceeding.</action>
  <verify>Human confirms per the how-to-verify steps; if AA is marginal, `.hero__scrim` alpha is increased and re-checked until text measures >=4.5:1 (>=3:1 for the large h1) over the brightest-orb frame.</verify>
  <done>User replies "approved": poster is beautiful, crossfade reads as waking up, AA holds over the worst-case orb, Accessible shows no image, reduced-motion shows poster + zero canvas.</done>
</task>

</tasks>

<verification>
- `npm run build` exits 0; `node scripts/check-3d-boundary.mjs` exits 0 (`home bundle is WebGL-free`).
- Full phase gate green: `npx playwright test --config playwright.theme.config.ts e2e/premium-hero.spec.ts e2e/premium-bundle.spec.ts e2e/premium-dispose.spec.ts` (all capability branches, bundle split, dispose x15, context loss).
- `static/hero/constellation-poster.{avif,webp,jpg}` committed, each <250 KB; sharp only in devDependencies.
- `grep -c "{base}/hero/constellation-poster" src/routes/+page.svelte` returns 3; poster gated on `theme.current === 'premium'`.
- Human checkpoint approved: poster aesthetic, 800ms crossfade, AA over worst-case orb, Accessible no-image, reduced-motion poster-only.
</verification>

<success_criteria>
The poster is captured from the real scene and committed in three optimized formats; Premium shows the poster first and crossfades the live scene in over 800ms; every gate-fail path (accessible, reduced-motion, no-WebGL, low-power, import fail, context loss) lands on the poster while Accessible renders no image (HERO-03); reduced-motion yields poster + zero canvas + no three chunk (A11Y-05); AA contrast holds over the worst-case orb frame (human-verified).
</success_criteria>

<output>
After completion, create `.planning/phases/05-premium-3d-hero/05-03-SUMMARY.md`.
</output>
