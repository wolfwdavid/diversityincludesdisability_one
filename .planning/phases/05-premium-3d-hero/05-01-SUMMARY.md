---
phase: 05-premium-3d-hero
plan: 01
subsystem: ui
tags: [threlte, three, webgl, playwright, capability-detection, bundle-split]

requires:
  - phase: 02-design-system-dual-theme
    provides: theme.svelte.ts runes store + did:theme localStorage key + premium tokens
  - phase: 03-app-shell-content-pages
    provides: home +page.svelte with .hero region
provides:
  - Threlte/Three stack installed (three@0.185.1, @threlte/core@8.5.16, @types/three@0.185.0; extras intentionally omitted)
  - Three-free capability gate src/lib/a11y/prefers.svelte.ts (prefersReducedMotion reactive, webglSupported, notLowPower fail-open)
  - Bundle-split boundary proof scripts/check-3d-boundary.mjs wired as npm run test:no-three (RED baseline)
  - Always-loaded .hero-scene positioning + 800ms crossfade (D-17) + scroll-fade selector (.is-ready.is-onscreen, D-07) in app.css
  - Three authored capability-branch Playwright specs (RED drive-green targets for 05-02/05-03)
affects: [05-02-living-constellation-scene, 05-03-poster-crossfade-fallback]

tech-stack:
  added: [three@0.185.1, "@threlte/core@8.5.16", "@types/three@0.185.0"]
  patterns:
    - "Capability gate lives in the Accessible dependency graph — imports only $app/environment, never three/@threlte"
    - "Scene positioning + crossfade CSS in always-loaded app.css so scene components carry no scoped <style> (four-level CSS-leak fix)"
    - "RED-first harness: capability specs authored before the scene, drive-green targets for downstream waves"

key-files:
  created:
    - src/lib/a11y/prefers.svelte.ts
    - scripts/check-3d-boundary.mjs
    - e2e/premium-hero.spec.ts
    - e2e/premium-bundle.spec.ts
    - e2e/premium-dispose.spec.ts
  modified:
    - package.json
    - src/lib/styles/app.css

key-decisions:
  - "notLowPower() is fail-open: absent deviceMemory/hardwareConcurrency/saveData APIs are treated as capable (thresholds <4GB / <=2 cores / saveData are MEDIUM-confidence, field-tunable)"
  - "@threlte/extras deliberately NOT installed — it adds focus-trap/pointer-capture risk to a decorative aria-hidden scene"
  - "Poster selector standardized as '.hero picture, .hero img'; Accessible theme renders NO poster image (D-15)"

patterns-established:
  - "test:no-three: content-based bundle-split proof (premium chunk exists AND home entry references none)"
  - "did:theme localStorage seeding + no data-hydrated wait + no axe in Phase-5 e2e (axe deferred to Phase 6)"

requirements-completed: [HERO-02, HERO-04, A11Y-05]

duration: 15min
completed: 2026-07-06
---

# Phase 05 Plan 01: Foundation, Capability Gate & Harness Summary

**Three-free capability gate (reduced-motion + WebGL + fail-open low-power), a content-based bundle-split boundary proof wired as `test:no-three` at its RED baseline, always-loaded `.hero-scene` crossfade/scroll-fade CSS, and three authored capability-branch Playwright specs — the Wave-0 machinery every downstream 3D task verifies against.**

## Performance

- **Duration:** ~15 min active (spanned a session-limit interruption; resumed inline)
- **Completed:** 2026-07-06
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments
- Installed the pinned Threlte/Three stack via npm (extras omitted by design)
- Authored `prefers.svelte.ts` — the three-free gate exporting reactive reduced-motion, synchronous `webglSupported()`, and fail-open `notLowPower()`
- Copied the `_four` boundary proof, wired `test:no-three`, confirmed the intended RED baseline (no premium chunk split yet)
- Added `.hero-scene` positioning + 800ms crossfade + D-07 scroll-fade selector to the always-loaded `app.css`
- Authored 3 capability-branch specs (8 tests) covering accessible/reduced-motion/premium branches, runtime chunk-split network proof, disposal/context-loss, and the D-07 scroll fade

## Task Commits

1. **Task 1: Install Threlte stack + capability gate** — `3db0eda` (feat)
2. **Task 2: Boundary proof + test:no-three + hero-scene CSS** — `27fd329` (feat)
3. **Task 3: Capability-branch Playwright specs** — `4f6c2da` (test)

## Files Created/Modified
- `src/lib/a11y/prefers.svelte.ts` — three-free capability gate (reduced-motion, WebGL, low-power), imports only `$app/environment`
- `scripts/check-3d-boundary.mjs` — content-based premium-chunk split proof
- `src/lib/styles/app.css` — `.hero-scene` positioning + 800ms crossfade + `.is-ready.is-onscreen` scroll-fade
- `e2e/premium-hero.spec.ts` / `premium-bundle.spec.ts` / `premium-dispose.spec.ts` — capability-branch RED targets
- `package.json` — three deps + `test:no-three` script

## Decisions Made
- `notLowPower()` fail-open with field-tunable thresholds (see key-decisions).
- `@threlte/extras` omitted deliberately.
- Accessible renders no poster image (D-15).

## Deviations from Plan
None — plan executed as written. Two pre-existing issues were logged to `deferred-items.md` (not caused by this plan): a `tests/deploy.smoke.spec.ts` `process` type error (missing `@types/node`) and an unused `.disclaimer` CSS selector on the home page.

## Issues Encountered
The original parallel-subagent run hit a session limit mid-plan (after Task 1 committed, Task 2 applied-but-uncommitted, Task 3 not started). Resumed inline: verified Task 2's on-disk work against acceptance criteria, committed it, then completed Task 3. No work was lost or double-applied.

## User Setup Required
None.

## Next Phase Readiness
- Capability gate, boundary proof, crossfade CSS, and RED specs are all in place.
- `test:no-three` is correctly RED and becomes the green target for 05-02.
- Ready for 05-02 (Living Constellation scene behind the four-level lazy boundary).

---
*Phase: 05-premium-3d-hero*
*Completed: 2026-07-06*
