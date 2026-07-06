---
phase: 05-premium-3d-hero
verified: 2026-07-06T00:00:00Z
status: passed
score: 4/4 must-haves verified
---

# Phase 5: Premium 3D Hero Verification Report

**Phase Goal:** The Premium home hero renders a performant Threlte 3D showpiece that is lazy-loaded only when Premium AND WebGL AND motion-ok AND not-low-power, shows a static poster first in all other cases, never blocks first paint, and disposes cleanly on navigation.
**Verified:** 2026-07-06
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | In Premium + WebGL + motion-ok + not-low-power, the home hero renders a performant 3D showpiece | ✓ VERIFIED | `PremiumHero.svelte` composes `show3D = theme.current==='premium' && !prefersReducedMotion.current && webglSupported() && notLowPower() && !contextLost`; mounts `HeroScene` → `SceneCanvas` → `Scene` (camera, Lights, 40/20-instance `Orbs`, `LineSegments` `Connections`, both reading the single `positions.ts` source). `npm run build` exits 0; `test:no-three` reports `OK: 1 premium chunk(s) split out`. |
| 2 | Every gate-fail path (accessible / reduced-motion / no-WebGL / low-power / import-fail / context-loss) shows a static poster; hero heading/CTA remain present | ✓ VERIFIED | `+page.svelte` renders `{#if theme.current==='premium'}<picture class="hero__poster">…` (base-prefixed AVIF/WebP/JPG, all 3 files exist on disk, 27KB/48KB/66KB — under budget) beneath the gated canvas; `PremiumHero`'s `{:catch}` and `contextLost` both leave `show3D` false so only the poster shows; h1/lede/CTA text nodes are untouched (diff-verified against plan requirement — text unchanged). Accessible mode renders no poster (D-15, `theme.current==='premium'` guard). |
| 3 | The 3D never blocks first paint and disposes cleanly on navigation (no leak) | ✓ VERIFIED | Two nested `import()` hops (`PremiumHero`→`HeroScene`→`SceneCanvas`) keep three/@threlte out of the eager/home bundle; `check-3d-boundary.mjs` confirms the prerendered `build/index.html` references no premium chunk (exit 0). `Scene.svelte onDestroy` removes `visibilitychange`/`webglcontextlost`/`pointermove` listeners, disconnects the `IntersectionObserver`, and calls `renderer.dispose(); renderer.forceContextLoss();` — the exact HERO-04 disposal contract. 05-02-SUMMARY records the ×15 Home↔About dispose spec passing with zero console errors. |
| 4 | Reduced-motion visitors get animation/3D fully disabled, not merely softened | ✓ VERIFIED | `prefersReducedMotion.current` is a hard AND-term in `show3D`; when true, `PremiumHero` never even attempts the `import()` — zero canvas, zero three-chunk network fetch (`e2e/premium-hero.spec.ts` "A11Y-05 … reduced-motion" asserts `canvas` count 0 and no response body matches `/@threlte|THREE\.WebGLRenderer/`). Poster (static image) is what's shown instead. |

**Score:** 4/4 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/a11y/prefers.svelte.ts` | reactive reduced-motion + sync `webglSupported()` + sync `notLowPower()`, imports ONLY `$app/environment` | ✓ VERIFIED | All three exported; only import is `$app/environment`; fail-open low-power thresholds present with a documented tunable comment. |
| `scripts/check-3d-boundary.mjs` | content-based bundle-split proof | ✓ VERIFIED | Exists; `node scripts/check-3d-boundary.mjs` after `npm run build` exits 0 printing `OK: 1 premium chunk(s) split out; home bundle is WebGL-free`. |
| `package.json` → `test:no-three` | wired npm script | ✓ VERIFIED | `"test:no-three": "node scripts/check-3d-boundary.mjs"` present. |
| `src/lib/styles/app.css` | `.hero-scene` positioning + 800ms crossfade (D-17) + `.is-ready.is-onscreen` scroll-fade (D-07) | ✓ VERIFIED (via 05-01/05-02 SUMMARY + component grep) | `HeroScene.svelte` and `SceneCanvas.svelte` carry no scoped `<style>` block (confirmed by direct read) and rely on this always-loaded stylesheet; class toggles (`is-ready`, `is-onscreen`) are applied from the components. |
| `src/lib/components/premium/PremiumHero.svelte` | three-free gate, `{#await import('./HeroScene.svelte')}` | ✓ VERIFIED | Confirmed by direct read: zero `three`/`@threlte` references; gate composes all 5 conditions; `{:then}`/`{:catch}` both fall back to no-render (poster shows). |
| `src/lib/components/premium/HeroScene.svelte` | second-hop wrapper, `aria-hidden`, no scoped style, owns `is-onscreen` | ✓ VERIFIED | `aria-hidden="true"`, `class:is-ready`/`class:is-onscreen`, no `<style>` block, imports `SceneCanvas` via a second `import()`. |
| `src/lib/components/premium/SceneCanvas.svelte` | sole `<Canvas renderMode="on-demand" dpr={[1,2]}>` owner | ✓ VERIFIED | Confirmed exact props; forwards `onVisibility` to `Scene`. |
| `src/lib/components/premium/scene/positions.ts` | single shared `makeOrbSeeds`/`orbPositionAt` source | ✓ VERIFIED | Both exports present; pure drift function. |
| `src/lib/components/premium/scene/Orbs.svelte` | `InstancedMesh` reading `./positions` | ✓ VERIFIED | Imports `orbPositionAt` from `./positions`; breathe formula `1 + 0.06 * Math.sin(...)` present; disposes geometry/material. |
| `src/lib/components/premium/scene/Connections.svelte` | `LineSegments` reading the SAME `./positions` | ✓ VERIFIED | Imports `orbPositionAt` from `./positions`; `setDrawRange`, `AdditiveBlending` present; disposes geometry/material. |
| `src/lib/components/premium/scene/Lights.svelte` | monochrome periwinkle, no orange | ✓ VERIFIED | Only `#7aa2ff` `AmbientLight`/`PointLight`s; no orange color present. |
| `src/routes/+page.svelte` | `PremiumHero` + scrim + 85svh + Premium-only base-prefixed `<picture>` poster | ✓ VERIFIED | All present; text nodes (h1/lede/CTA) unchanged; `three`/`@threlte` absent from this file (entry stays three-free). |
| `static/hero/constellation-poster.{avif,webp,jpg}` | committed, real capture, <250KB each | ✓ VERIFIED | All 3 files exist (26.9KB / 46.5KB / 66.1KB), well under budget. |
| `scripts/capture-poster.mjs` | dev-only Playwright+sharp capture pipeline | ✓ VERIFIED (via 05-03-SUMMARY; sharp confirmed devDependency-only, zero runtime imports in `src/`) | `sharp` is a devDependency; `grep -rc "from 'sharp'" src/` returns 0. |
| `e2e/premium-hero.spec.ts`, `premium-bundle.spec.ts`, `premium-dispose.spec.ts` | 8 capability-branch specs, type-clean, listable | ✓ VERIFIED | `npx playwright test --list` enumerates all 8 tests across 3 files with no parse error. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| `package.json` | `scripts/check-3d-boundary.mjs` | `npm run test:no-three` | ✓ WIRED | Script entry present and runnable; confirmed exit 0. |
| `prefers.svelte.ts` | `$app/environment` | sole import | ✓ WIRED | Confirmed only import in the file. |
| `PremiumHero.svelte` | `HeroScene.svelte` | `import('./HeroScene.svelte')` behind `show3D` | ✓ WIRED | Confirmed in source. |
| `HeroScene.svelte` | `SceneCanvas.svelte` | second `import()` hop | ✓ WIRED | Confirmed in source. |
| `Scene.svelte` | `HeroScene.svelte` | `onVisibility` bubble → `.is-onscreen` toggle | ✓ WIRED | `Scene`'s `IntersectionObserver` callback calls `onVisibility?.(onscreen)`; `HeroScene` sets `class:is-onscreen={onscreen}` from the prop it forwards through `SceneCanvas`. |
| `Orbs.svelte` | `scene/positions.ts` | `import { orbPositionAt } from './positions'` | ✓ WIRED | Confirmed. |
| `Connections.svelte` | `scene/positions.ts` | same import | ✓ WIRED | Confirmed — same `orbPositionAt` source, guaranteeing line endpoints track orb centers. |
| `+page.svelte` | `PremiumHero.svelte` | static import | ✓ WIRED | Confirmed; `+page.svelte` stays three-free. |
| `+page.svelte` | `static/hero/constellation-poster.*` | `<picture>` `{base}/hero/constellation-poster.*` | ✓ WIRED | All 3 base-prefixed source/img URLs present; poster gated on `theme.current === 'premium'`. |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|---|---|---|---|---|
| HERO-01 | 05-02 | Premium hero renders a performant 3D showpiece (Threlte) | ✓ SATISFIED | Living Constellation scene (Orbs + Connections + Lights) mounts behind the gate; boundary GREEN; 05-02-SUMMARY records the canvas-mount spec passing. |
| HERO-02 | 05-01, 05-02 | 3D lazy-loaded only when Premium AND WebGL AND motion-ok AND not-low-power | ✓ SATISFIED | `show3D` in `PremiumHero.svelte` composes exactly these 4 terms (+ `!contextLost`); confirmed by direct read. |
| HERO-03 | 05-03 | Static poster replaces 3D in all other cases | ✓ SATISFIED | Poster committed + wired Premium-only, underneath the canvas, covering every non-render branch (accessible has no image per D-15, which is itself a distinct, correctly-scoped behavior for that theme). |
| HERO-04 | 05-01, 05-02 | 3D never blocks first paint and disposes cleanly (no leak) | ✓ SATISFIED | Two-hop dynamic import keeps three out of the eager bundle; `Scene.svelte onDestroy` disposes renderer/listeners/IO; 05-02-SUMMARY records the ×15 nav-cycle dispose spec passing with zero console errors. |
| A11Y-05 | 05-01, 05-03 | Reduced-motion genuinely honored — 3D disabled, not softened | ✓ SATISFIED | `prefersReducedMotion.current` is a hard gate term (not an animation-speed multiplier); reduced-motion branch never imports the scene, shows the poster instead; 05-03-SUMMARY records this spec passing. |

No orphaned requirements — REQUIREMENTS.md maps exactly these 5 IDs to Phase 5, and all 5 appear in the plans' `requirements:` frontmatter.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|---|---|---|---|---|
| `src/lib/components/premium/scene/Orbs.svelte` | 16 | `svelte-check` warning: "This reference only captures the initial value of `seeds`" (`state_referenced_locally`) | ℹ️ Info | Benign — `seeds` is computed once in `Scene.svelte` and passed down as a static prop (never mutated after mount), so the one-time read in `new InstancedMesh(geo, mat, seeds.length)` is intentional, not a reactivity bug. Does not affect the goal. |
| `src/lib/components/premium/scene/Connections.svelte` | 21, 21, 40 | same `state_referenced_locally` warning ×3 | ℹ️ Info | Same benign pattern (`seeds.length`, `seeds.map`) — `seeds` is a stable one-shot array, not reactive state that changes post-mount. |
| `tests/deploy.smoke.spec.ts` | 4 | pre-existing `process` type error | ℹ️ Info (pre-existing, documented) | Logged in `deferred-items.md` prior to this phase; not caused by Phase 5 work; unrelated to the 3D hero. |
| `src/routes/+page.svelte` | 68 | unused CSS selector `.disclaimer` | ℹ️ Info (pre-existing, documented) | Logged in `deferred-items.md`; pre-existing markup drift, not touched by Phase 5. |

No blocker or warning-level anti-patterns found in Phase 5's own deliverables. `npx svelte-check` reports only the 1 pre-existing documented error and 5 warnings (4 pre-existing/benign as above, all cross-referenced).

### Human Verification Required

None outstanding. The one item requiring human judgment per the plans — poster aesthetic + 800ms crossfade feel + AA contrast over the worst-case bright-orb frame — was already executed as a `checkpoint:human-verify` task in Plan 05-03 and recorded as **approved** in `05-03-SUMMARY.md` ("Human checkpoint approved: poster aesthetic + crossfade confirmed; AA holds (~8.9:1) over the worst-case bright-orb frame").

E2E test execution itself (Playwright `webServer` hangs at teardown on this box, per project convention) was not re-run by this verifier; results are taken from the SUMMARY files' recorded outcomes (05-01: 3 specs authored RED as designed; 05-02: 6/8 green, 2 poster-dependent deferred to 05-03; 05-03: all 8 green) cross-referenced against static code inspection of every assertion's target (selectors, classes, gate composition, disposal calls) confirmed present and correctly wired in the current source tree.

### Gaps Summary

No gaps. All 4 ROADMAP success criteria hold against the current codebase: build is green, the boundary script proves the split (`OK: 1 premium chunk(s) split out; home bundle is WebGL-free`), the capability gate composes all 5 required conditions, the four-level lazy-import boundary and full imperative disposal are present in `Scene.svelte`, the poster is committed in three optimized formats and wired Premium-only beneath a crossfading canvas, and the D-07 scroll-fade (both the RAF-pause half and the opacity-fade half) is implemented via the shared `onVisibility` bubble. All 5 requirement IDs (HERO-01..04, A11Y-05) are satisfied and none are orphaned. The only findings are informational: 3 benign `svelte-check` warnings about one-shot prop reads (not a reactivity bug) and 2 pre-existing, already-documented issues unrelated to this phase's work.

---

*Verified: 2026-07-06*
*Verifier: Claude (gsd-verifier)*
