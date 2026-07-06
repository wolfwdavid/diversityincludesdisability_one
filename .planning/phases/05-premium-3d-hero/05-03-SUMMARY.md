---
phase: 05-premium-3d-hero
plan: 03
subsystem: ui
tags: [poster, avif, webp, sharp, picture, crossfade, fallback, playwright]

requires:
  - phase: 05-premium-3d-hero (plan 02)
    provides: live constellation scene + .hero-scene crossfade wiring + poster-dependent RED specs
provides:
  - Committed constellation poster in AVIF/WebP/JPG (static/hero/) captured from the real scene
  - Dev-only capture pipeline (scripts/capture-poster.mjs — Playwright screenshot → sharp)
  - Premium-only base-prefixed <picture> underlay + 800ms poster→scene crossfade
  - Full capability fallback matrix green (accessible no-image, reduced-motion poster, no-WebGL/low-power/import-fail/context-loss → poster)
affects: [06-accessible-hardening-launch-verification]

tech-stack:
  added: [sharp (devDependencies only)]
  patterns:
    - "Poster captured during dev and committed (no build-time render pipeline); dev-only script never imported by app code"
    - "Premium-only decorative <picture> at z-index 0 with the canvas (z1, opacity 0→1) crossfading over it = 'the stars begin to move'"

key-files:
  created:
    - scripts/capture-poster.mjs
    - static/hero/constellation-poster.avif
    - static/hero/constellation-poster.webp
    - static/hero/constellation-poster.jpg
  modified:
    - src/routes/+page.svelte
    - package.json

key-decisions:
  - "Poster captured at 2x from the .hero region (1112×1530); object-fit:cover handles any hero aspect at render"
  - "Poster seed differs per load (Math.random) so poster and live composition are stylistically — not pixel — identical; drift makes the crossfade read as motion (D-14 intent preserved)"
  - "AA verified by construction: exclusion zone (|x|≥1.6) + densest scrim at the text column → ~8.9:1 for #f6f4f2 text even behind the brightest orb"

patterns-established:
  - "Windows E2E: self-managed vite preview on a private port (4188) + throwaway playwright config (deleted after), since 4173/4174 are squatted by sibling projects and managed webServer hangs at teardown"

requirements-completed: [HERO-03, A11Y-05]

duration: 40min
completed: 2026-07-06
---

# Phase 05 Plan 03: Poster, Crossfade & Fallback Gate Summary

**A real constellation still captured and committed as AVIF/WebP/JPG, rendered Premium-only beneath a canvas that crossfades in over 800ms ('the stars begin to move'), serving as the permanent fallback for every non-render path while Accessible shows no image — closing the capability matrix (all 8 premium specs green) with AA verified over the worst-case orb frame.**

## Performance

- **Duration:** ~40 min
- **Completed:** 2026-07-06
- **Tasks:** 3 (2 auto + 1 human-verify checkpoint)
- **Files modified:** 6 (5 created, 1 modified)

## Accomplishments
- Captured the live scene and committed three optimized poster formats (AVIF 26 KB / WebP 46 KB / JPG 66 KB — all far under the 250 KB budget)
- Built a dev-only capture pipeline (Playwright + sharp) isolated from the client bundle
- Wired the Premium-only base-prefixed `<picture>` underlay; the canvas crossfades over it
- Turned the two poster-dependent specs green → all 8 premium capability specs pass; boundary stays GREEN
- Human checkpoint approved: poster aesthetic + crossfade confirmed; AA holds (~8.9:1) over the worst-case bright-orb frame

## Task Commits

1. **Task 1: Capture + commit poster** — `688476e` (feat)
2. **Task 2: Wire Premium-only poster + drive specs green** — `51f2b30` (feat)
3. **Task 3: Human verify** — approved by user 2026-07-06 (no code change needed; AA satisfied by design)

## Files Created/Modified
- `scripts/capture-poster.mjs` — dev-only Playwright→sharp poster capture
- `static/hero/constellation-poster.{avif,webp,jpg}` — committed poster (three formats)
- `src/routes/+page.svelte` — Premium-only `<picture>` underlay + `.hero__poster` styling
- `package.json` — sharp devDependency

## Decisions Made
See key-decisions in frontmatter (2x capture, per-load seed difference, AA-by-construction).

## Deviations from Plan
None functionally. Harness note: 4173/4174 were squatted by sibling projects and the managed webServer hung, so the E2E ran against a self-managed preview on private port 4188 with a throwaway config (created then deleted, never committed) — the documented Windows-safe pattern.

## Issues Encountered
- **Port contention:** repeated races freeing 4173; resolved by switching to a private port (4188) per the project's documented sibling-squat gotcha.

## User Setup Required
None.

## Next Phase Readiness
- Phase 5 feature-complete: capability-gated 3D hero, poster-first fallback, clean disposal, D-07 fade+pause, all specs green.
- Phase 6 (Accessible Hardening & Launch Verification) can now run the independent WCAG 2.2 AA+ audit against the deployed build including the Premium hero.

---
*Phase: 05-premium-3d-hero*
*Completed: 2026-07-06*
