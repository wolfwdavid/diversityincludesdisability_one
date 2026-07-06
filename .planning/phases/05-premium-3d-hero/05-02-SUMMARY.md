---
phase: 05-premium-3d-hero
plan: 02
subsystem: ui
tags: [threlte, three, webgl, instancedmesh, linesegments, lazy-import, disposal, intersectionobserver]

requires:
  - phase: 05-premium-3d-hero (plan 01)
    provides: capability gate (prefers.svelte.ts), test:no-three boundary proof, .hero-scene crossfade/scroll-fade CSS, RED capability specs
provides:
  - Four-level lazy-import boundary (PremiumHero gate → HeroScene → SceneCanvas → scene/*) keeping three/@threlte out of the accessible/home entry
  - Living Constellation scene — instanced periwinkle orbs + proximity LineSegments graph sharing one position source
  - IntersectionObserver running-gate (RAF pause) + onVisibility bubble for the D-07 gentle fade
  - First-frame onReady crossfade trigger + full imperative renderer disposal on navigation
  - Home hero wired with full-bleed decorative background, AA scrim, premium-only 85svh (accessible untouched)
  - test:no-three flipped GREEN (premium chunk split; home bundle WebGL-free)
affects: [05-03-poster-crossfade-fallback]

tech-stack:
  added: []
  patterns:
    - "Single shared positions.ts source imported by BOTH Orbs and Connections so line endpoints track visible orb centers (no divergent drift math)"
    - "IntersectionObserver drives BOTH the RAF running-gate AND the CSS opacity fade via an onVisibility callback bubbled up to HeroScene (D-07 = fade + pause, both halves)"
    - "Renderer disposal: renderer.dispose() + renderer.forceContextLoss() + listener/IO teardown in onDestroy (no WebGL context accumulation across 15 nav cycles)"

key-files:
  created:
    - src/lib/components/premium/PremiumHero.svelte
    - src/lib/components/premium/HeroScene.svelte
    - src/lib/components/premium/SceneCanvas.svelte
    - src/lib/components/premium/scene/positions.ts
    - src/lib/components/premium/scene/Scene.svelte
    - src/lib/components/premium/scene/Orbs.svelte
    - src/lib/components/premium/scene/Connections.svelte
    - src/lib/components/premium/scene/Lights.svelte
  modified:
    - src/routes/+page.svelte
    - e2e/premium-dispose.spec.ts

key-decisions:
  - "Connection color falloff via AdditiveBlending (dark = invisible) instead of per-vertex alpha, since LineBasicMaterial vertexColors is RGB-only — a scaled periwinkle color IS the distance falloff"
  - "positions.ts owns per-orb driftRadius + omega so drift stays pure and shared; Orbs adds only local breathe scale, Connections adds only proximity pairing"
  - "D-07 test appends a 2500px spacer so the short home page has a scroll runway to move the 85svh hero fully past the viewport top (threshold-0 IO only reports gone at 100% out)"

patterns-established:
  - "premium/ import boundary: only files under premium/ import three/@threlte; PremiumHero and +page.svelte stay three-free (grep-gated)"

requirements-completed: [HERO-01, HERO-02, HERO-04]

duration: 45min
completed: 2026-07-06
---

# Phase 05 Plan 02: Living Constellation Scene & Split Boundary Summary

**A capability-gated, lazily-imported periwinkle Threlte constellation — instanced white-core orbs plus a proximity LineSegments graph that shares one position source so lines track orbs — wired as a full-bleed decorative hero background behind untouched text, with RAF-pause + gentle-fade on scroll and clean renderer disposal; the three chunk is split out of the accessible/home entry (test:no-three GREEN).**

## Performance

- **Duration:** ~45 min
- **Completed:** 2026-07-06
- **Tasks:** 3
- **Files modified:** 10 (8 created, 2 modified)

## Accomplishments
- Built the four-level lazy-import boundary; `test:no-three` flipped from RED → GREEN (`OK: 1 premium chunk(s) split out; home bundle is WebGL-free`)
- Authored the constellation: instanced orbs + proximity connections from a single `positions.ts`, monochrome lights, drift/breathe, parallax tilt, D-07 fade+pause, onReady crossfade trigger, imperative disposal
- Wired the hero: static three-free `PremiumHero`, AA scrim, premium-only 85svh; h1/lede/CTA text byte-identical to before
- 6/8 premium capability specs green (incl. the D-07 scroll-fade and ×15 clean-disposal); the 2 poster assertions are handed to 05-03

## Task Commits

1. **Task 1: Four-level lazy-import boundary** — `db464bc` (feat)
2. **Task 2: Living Constellation scene** — `ba643b5` (feat)
3. **Task 3: Hero wiring + drive scene specs green** — `70eea04` (feat)

## Files Created/Modified
- `premium/PremiumHero.svelte` — three-free gate (theme + reduced-motion + WebGL + notLowPower + context-lost)
- `premium/HeroScene.svelte` — second-hop wrapper, aria-hidden, toggles is-ready + is-onscreen (no scoped style)
- `premium/SceneCanvas.svelte` — sole `<Canvas dpr={[1,2]} renderMode="on-demand">`
- `premium/scene/positions.ts` — the single shared orb-geometry source (makeOrbSeeds + pure orbPositionAt)
- `premium/scene/Scene.svelte` — camera, running-gate, IO+onVisibility, parallax, onReady, disposal
- `premium/scene/Orbs.svelte` — InstancedMesh periwinkle orbs (drift from positions, local breathe)
- `premium/scene/Connections.svelte` — proximity LineSegments reading the same positions source
- `premium/scene/Lights.svelte` — monochrome periwinkle lights (no orange)
- `src/routes/+page.svelte` — PremiumHero + scrim + 85svh premium sizing (text unchanged)
- `e2e/premium-dispose.spec.ts` — D-07 scroll runway refinement

## Decisions Made
See key-decisions in frontmatter (AdditiveBlending falloff, positions.ts ownership, D-07 spacer).

## Deviations from Plan
None — plan executed as written. The D-07 spec's scroll approach was refined (spacer + window.scrollTo) after discovering `page.mouse.wheel` couldn't move the short home page's 85svh hero fully past the viewport top; the scene's D-07 mechanism was unchanged and correct.

## Issues Encountered
- **Parallel Playwright interference:** running the three premium spec files concurrently against one shared preview flaked the D-07 test (two processes scrolling the same server). Single-worker runs are stable — D-07 and all 6 targets pass deterministically with `--workers=1`.
- **Windows background capture:** PowerShell `run_in_background` did not capture Playwright output reliably; foreground single-worker runs against a self-managed `vite preview` on 4173 were the reliable path (consistent with the documented Windows webServer-teardown gotcha).

## RED assertions handed to Plan 05-03
Two poster-dependent specs remain RED by design (they wait on `.hero picture, .hero img`, which 05-03 creates):
- `e2e/premium-hero.spec.ts:31` — "A11Y-05 premium + reduced-motion: poster, zero canvas, no three chunk"
- `e2e/premium-dispose.spec.ts:29` — "forced context loss → poster fallback, no crash, h1 intact"

## User Setup Required
None.

## Next Phase Readiness
- Scene renders and disposes cleanly; boundary GREEN.
- 05-03 will capture a still of THIS scene, commit AVIF/WebP/JPG, render it Premium-only beneath the canvas, crossfade, and drive the 2 poster assertions green + human-verify aesthetic/AA.

---
*Phase: 05-premium-3d-hero*
*Completed: 2026-07-06*
