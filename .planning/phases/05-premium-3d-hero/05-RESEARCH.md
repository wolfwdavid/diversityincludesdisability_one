# Phase 5: Premium 3D Hero - Research

**Researched:** 2026-07-06
**Domain:** Threlte 8 / Three.js "Living Constellation" hero island, lazily code-split behind Premium theme in a SvelteKit adapter-static site, with a capability gate that includes low-power detection.
**Confidence:** HIGH on the lazy-import boundary, the second-hop CSS fix, disposal, and validation (all live-verified in the sibling `_four`). HIGH on stack/versions (npm-confirmed, identical to sibling). MEDIUM on the two NEW-to-`_one` elements: low-power heuristics and the proximity connection-line rendering (sound, standard techniques, but not yet built in this family).

## Summary

This phase adds exactly ONE decorative Threlte hero — a periwinkle "Living Constellation" of ~40 glowing orbs with proximity-based connection lines — that renders **only** when Premium theme AND WebGL AND motion-allowed AND not-low-power all hold. Every other outcome (Accessible theme, reduced-motion, no-WebGL, low-power, context loss, import failure) falls back to a static poster (Premium) or the untouched text hero (Accessible). Phases 1–4 already shipped a complete, deployed, accessible site, so this hero can never block launch.

**The sibling repo `diversityincludesdisability_four` already shipped and live-verified this exact class of feature.** Its proven architecture, boundary-check script, disposal pattern, and reactive-prefers helper transfer almost verbatim. The single most valuable hard-won lesson (discovered *after* `_four`'s own research, so it lives only in the shipped code): **@threlte/core's `<Canvas>` carries scoped CSS that leaks a `<link>` onto the Accessible home at SvelteKit `find_deps` `dynamic_import_depth` 1** — the fix is a **second dynamic-import hop** (`HeroScene` → `import()` → `SceneCanvas` which is the sole `<Canvas>` owner). Copy that four-level structure exactly.

Four things genuinely DIFFER for `_one` and are the real research surface: (1) the gate reads the **`theme` store** (`theme.current === 'premium'`), not `_four`'s `mode` store; (2) `_one` uses **npm**, not pnpm; (3) HERO-02 adds **low-power detection** the sibling never implemented; (4) the scene art is a **new "constellation" design** (orbs + connection lines + parallax tilt + exclusion-zone/scrim + ~85svh hero + an 800ms poster→scene crossfade + a poster that must be *produced* this phase).

**Primary recommendation:** Mirror `_four`'s four-file boundary (`PremiumHero` three-free gate → `HeroScene` wrapper → `SceneCanvas` sole `<Canvas>` → `scene/*`), swap the gate to read the `theme` store and add a synchronous `notLowPower()` check to the prefers helper, re-author `scene/*` as the periwinkle constellation with a `LineSegments` proximity graph, produce and commit an AVIF/WebP poster, crossfade it to the canvas over 800ms, and prove everything with the copied `check-3d-boundary.mjs` gate plus Playwright specs for each capability branch.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**3D Scene Concept — "Living Constellation"**
- **D-01:** Showpiece is a constellation of ~40 varied glowing orbs (different sizes, subtle texture variation, individual drift paths) forming one connected system. Deliberately abstract community metaphor. **NO literal disability iconography** (no puzzle pieces, no wheelchair symbols — semiotically risky for this org).
- **D-02:** **Periwinkle monochrome** — all orbs in shades of the Premium accent (`#7aa2ff` → `#a9c2ff`) with white-hot cores, on Premium navy (`#0f1020`). Must read as engineered into the locked Premium design system.
- **D-03:** **Proximity-based living connections** — faint lines fade in when orbs drift near each other and dissolve as they part.
- **D-04:** **~40 orbs** desktop; reduce to **~20 orbs** on small screens.

**Motion & Interactivity**
- **D-05:** Base motion: slow 3D drift + gentle breathe; whole field rotates almost imperceptibly; orbs subtly pulse/glow. Full cycle ~20–30s. Contemplative, never distracting.
- **D-06:** Pointer: **subtle parallax tilt only** — whole constellation tilts a few degrees toward cursor. No per-orb cursor reactions. Degrades to nothing on touch.
- **D-07:** Scroll: **gentle fade + RAF pause** — constellation fades as it leaves viewport and rendering pauses. No scroll-jacking, no parallax recede.
- **D-08:** Energy: contemplative & calm — slow, weighty, dignified. Elegance over spectacle.
- **D-09:** Reduced-motion visitors get 3D **fully disabled** (poster only). This phase's capability gate is where no-WebGL/low-power detection finally lands (deferred here from Phase 2 by THEME-05 decision).

**Hero Composition**
- **D-10:** **Full-bleed background** — constellation fills the entire hero region behind the existing h1/mission/CTAs. Text is real DOM (Phase 3) and stays exactly as-is semantically.
- **D-11:** Legibility: **exclusion zone + scrim** — orbs steered away from the text column AND a soft radial darkening behind the text block. Guaranteed WCAG AA contrast at all times, at all viewport sizes.
- **D-12:** Premium hero height: **~85svh** with a sliver of the next section visible. **Accessible mode keeps today's compact text hero unchanged.**
- **D-13:** **Premium mobile gets the 3D**, scaled down: ~20 orbs, no parallax, **DPR clamp ≤2**. Capability gate excludes weak devices.

**Poster Image Strategy**
- **D-14:** Poster is a **high-quality still of the actual constellation scene** — poster and live scene visually identical, so the load-in feels like "the stars begin to move."
- **D-15:** **Accessible theme gets NO hero image** — stays exactly as today: calm, text-first, fast. (Peer design, not subtracted fallback.)
- **D-16:** Poster production: **captured during dev and committed** — build scene, screenshot a 2x frame, optimize (AVIF/WebP + fallback), commit to `static/`. No build-time render pipeline.
- **D-17:** Premium load transition: **slow ~800ms crossfade** from poster to live scene.

### Claude's Discretion
- Exact orb material/shader (standard vs custom glow), light setup, and star-glint accents
- Precise drift/breathe animation curves and connection-distance threshold
- Exclusion-zone implementation technique (spawn-region constraints vs steering forces)
- Scrim gradient values (as long as AA contrast over the scrim is verifiable)
- Poster capture composition and file format specifics
- How the ~85svh hero responds to very short/landscape-mobile viewports

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| HERO-01 | Premium home hero renders a performant 3D showpiece (Threlte) | Constellation scene design (§Scene Design), `useTask` drift loop + on-demand render + DPR≤2 clamp, single `<Canvas>` island |
| HERO-02 | 3D lazy-loaded ONLY when Premium AND WebGL AND motion-ok AND **not-low-power** | Lazy-import boundary (§Lazy-Import Boundary) + `theme`-store gate + reduced-motion + `webglSupported()` + **NEW `notLowPower()`** (§Capability Gate) |
| HERO-03 | Static poster replaces 3D in all other cases (accessible / no-WebGL / reduced-motion) | Fallback matrix (§Capability Gate); poster production + `<picture>` AVIF/WebP + base-prefixed src (§Poster); Accessible keeps NO image (D-15) |
| HERO-04 | 3D never blocks first paint AND disposes cleanly on nav (no memory leak) | Build-grep split proof (§Validation); `renderer.dispose()`+`forceContextLoss()`+listener cleanup in `onDestroy`; RAF pause via IntersectionObserver+visibility; nav×15 leak spec |
| A11Y-05 | Reduced-motion genuinely honored — animation AND 3D disabled, not merely softened | Gate checks `prefers-reduced-motion: reduce` independently of theme → no import, no canvas, poster shown; e2e spec asserts zero canvas under reduce |
</phase_requirements>

## Standard Stack

### Core (add to the project — versions re-verified against the live npm registry 2026-07-06)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| three | 0.185.1 | WebGL engine under Threlte | Tree-shakeable ESM; import only the classes the scene uses. Pin minor to `@types/three`. |
| @threlte/core | 8.5.16 | Declarative Three.js for Svelte 5 runes | Threlte 8 is the Svelte-5/runes-native major. Provides `<Canvas>`, `<T>`, `useTask`, `useThrelte`. Peers `svelte>=5`, `three>=0.160` — both satisfied (`_one` is svelte `^5.56.1`). |
| @types/three | 0.185.0 | Three types (dev) | Match the `three` minor exactly. |

### Supporting
| Library | Version | Purpose | Decision |
|---------|---------|---------|----------|
| @threlte/extras | 9.21.0 | `<Float>`, `<OrbitControls>`, `useTexture`, etc. | **OMIT for this phase.** The scene is a non-interactive ambient drift; `<OrbitControls>` adds tab-focus/pointer-capture/focus-trap risk (contradicts the decorative `aria-hidden` guarantee) and bloats the premium chunk. Parallax tilt + breathe are trivial `useTask` math. Add later only if a helper earns its weight. |

**Installation (npm — `_one` convention; package-lock.json present, NOT pnpm):**
```bash
npm install three@0.185.1 @threlte/core@8.5.16
npm install -D @types/three@0.185.0
# @threlte/extras intentionally NOT installed
```

**Version verification (run before committing the plan — training data may be stale):**
```bash
npm view three version          # expect 0.185.1  ✓ confirmed 2026-07-06
npm view @threlte/core version  # expect 8.5.16   ✓ confirmed 2026-07-06
npm view @types/three version   # expect 0.185.0  ✓ confirmed 2026-07-06
```
No `@axe-core/playwright` in `_one` (the sibling had it). **Do NOT add axe for this phase** — full WCAG axe conformance is Phase 6's job; Phase 5's A11Y-05 gate is a behavioral "no canvas under reduce" assertion that needs no axe.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Threlte 8 declarative | Raw `three` in `onMount` | Raw three means hand-managing render loop, resize, and disposal. Threlte's managed loop + auto-disposal is safer for HERO-04. Not worth it for a scene this rich. |
| Procedural orbs (InstancedMesh) | GLTF model | A model adds an asset fetch that can 404 (another fallback path), licensing/provenance concern, loader weight, LCP risk. Procedural is lighter, cannot 404, and IS the poster. **Decision: procedural** (also matches D-16, no render pipeline). |
| `LineSegments` proximity graph | Post-process / shader lines | For ~40 orbs (≤780 pairs/frame) a single `LineSegments` with a per-frame-updated `BufferGeometry` + `setDrawRange` is trivially cheap and dependency-free. Skip shaders. |

## Delta From Sibling `_four` (READ THIS FIRST)

`_four` (`diversityincludesdisability_four`) shipped and **live-verified** this feature class. Reuse its bones; these are the concrete differences that will bite if copied blindly:

| Area | `_four` (proven) | `_one` (this phase) | Action |
|------|------------------|---------------------|--------|
| Gate store | `mode` store — `$lib/stores/mode.svelte`, key `did-mode`, attr `data-mode` | **`theme` store — `$lib/theme/theme.svelte.ts`, key `did:theme`, attr `data-theme`** | Gate reads `theme.current === 'premium'`; tests set `localStorage['did:theme']='premium'` |
| Package manager | pnpm | **npm** (package-lock.json) | All install/test commands use `npm`/`npx` |
| Low-power in gate | NOT implemented | **Required** (HERO-02 "not-low-power") | Add synchronous `notLowPower()` to prefers helper (§Capability Gate) |
| Poster | reused an existing SVG poster already in `Hero.svelte` | **Must be produced this phase** — capture a still, optimize AVIF/WebP, commit to `static/` (D-14/16); Accessible gets NO poster (D-15) | New task: poster capture + `<picture>` element |
| Poster→scene transition | nothing rendered during pending; poster showed through | **800ms crossfade** — canvas fades in over the poster (D-17) | Canvas opacity transition triggered on first frame / `oncreate` |
| Scene art | particle field + echo rings; blue `#6FB4FF`/orange `#FF9E5E` | **Periwinkle constellation** — ~40 orbs, white-hot cores, `#7aa2ff`→`#a9c2ff` on `#0f1020`, proximity connection LINES, parallax tilt, exclusion zone + scrim, ~85svh hero | Re-author `scene/*`; reuse InstancedMesh/useTask/lights/dispose skeleton |
| DPR clamp | `dpr={[1, 1.5]}` | `dpr={[1, 2]}` (D-13 says ≤2) | Use `[1, 2]` |
| Hydration marker in tests | waited on `html[data-hydrated="true"]` | **`_one` has NO `data-hydrated` attribute** | Wait on the canvas locator directly (it only appears after the async import resolves), or add a small hydration marker if a plan wants one |
| Raw-hex gate | `check-no-raw-hex.mjs` existed → scene folder had to be exempted | `_one` has **no raw-hex gate** | Scene may use numeric hex literals freely (still mirror the locked tokens for fidelity) |
| axe dep | present (`@axe-core/playwright`) | **absent** | Keep Phase-5 specs axe-free; defer axe to Phase 6 |

**Transfers essentially verbatim:** the four-level boundary structure, `check-3d-boundary.mjs`, `src/lib/a11y/prefers.svelte.ts` (extended), the `onDestroy` disposal block, the `useTask` running-gate (IntersectionObserver + visibilitychange), the context-lost → poster callback, and the Playwright branch specs.

## Lazy-Import Boundary (HERO-02 / HERO-04 — the load-bearing pattern)

**The hard rule:** `three` and `@threlte/*` may only be imported by files under `src/lib/components/premium/`, and those files may only be reached through a dynamic `import()`. A single static top-level import anywhere in the shared graph pulls ~150 KB of WebGL into the Accessible entry bundle and fails HERO-04 ("never blocks first paint"). The boundary is greppable and machine-verifiable.

### The FOUR-level structure (copy from `_four`'s shipped code — this is the CSS-leak fix)

```
+page.svelte (or an extracted Hero.svelte)      ← real h1/lede/CTA (Phase 3, unchanged) + poster + static import of PremiumHero
  └─ PremiumHero.svelte      ← THREE-FREE gate. Imports theme store + prefers helper ONLY. {#if show3D}{#await import('./HeroScene.svelte')}
       └─ HeroScene.svelte   ← wrapper <div class="hero-scene" aria-hidden>. NO scoped <style>. {#await import('./SceneCanvas.svelte')}
            └─ SceneCanvas.svelte  ← the SOLE <Canvas> owner. No scoped <style> of its own.
                 └─ scene/Scene.svelte  ← camera + lights + orbs + lines + useTask loop + onDestroy disposal
```

**Why FOUR levels, not three.** @threlte/core's `<Canvas>` component ships scoped CSS. SvelteKit's `find_deps` eagerly links a dynamic import's CSS with a `<link rel="stylesheet">` when the import sits at `dynamic_import_depth <= 1` (a FOUC-prevention window). If `<Canvas>` is reachable at depth 1, a **premium scene CSS `<link>` loads on the Accessible home** even though the JS stays split. The fix (proven live in `_four`): put `<Canvas>` behind a **second** `import()` hop (`HeroScene` → `SceneCanvas`), pushing the Canvas CSS to depth 2, past the eager-link window. `HeroScene` and `SceneCanvas` therefore carry **no scoped `<style>` block** — the `.hero-scene` positioning lives in an always-loaded stylesheet (a token/app CSS file), not in a component that would create a hoistable chunk.

### Quarantine rules (each is a HERO-02/04 failure if broken)
- **Only** files under `src/lib/components/premium/` may `import` from `three` or `@threlte/*`.
- Those files are reachable **only** via the `import('./HeroScene.svelte')` in `PremiumHero.svelte` (and the nested `import('./SceneCanvas.svelte')`). No other module may statically import them.
- `PremiumHero.svelte` must stay three-free — it imports only the `theme` store and the prefers helper (both in the Accessible graph).
- Do NOT add `three`/`@threlte` to `optimizeDeps`, a shared util, `+layout.svelte`, or any content component.
- `HeroScene.svelte` and `SceneCanvas.svelte` carry **no scoped `<style>`**.

### PremiumHero.svelte — the gate (adapted for `_one`'s theme store + low-power)
```svelte
<!-- src/lib/components/premium/PremiumHero.svelte  (NO three/@threlte import here) -->
<script lang="ts">
  import { theme } from '$lib/theme/theme.svelte';            // ← _one uses the THEME store
  import { prefersReducedMotion, webglSupported, notLowPower } from '$lib/a11y/prefers.svelte';

  let contextLost = $state(false);            // raised by SceneCanvas' webglcontextlost listener
  let sceneReady = $state(false);             // first frame painted → triggers the 800ms crossfade (D-17)

  // HERO-02: Premium theme AND motion-ok AND WebGL AND not-low-power AND context alive.
  const show3D = $derived(
    theme.current === 'premium' &&
    !prefersReducedMotion.current &&
    webglSupported() &&
    notLowPower() &&
    !contextLost
  );
</script>

{#if show3D}
  {#await import('./HeroScene.svelte')}
    <!-- pending: render nothing; poster shows through -->
  {:then { default: HeroScene }}
    <HeroScene onContextLost={() => (contextLost = true)} onReady={() => (sceneReady = true)} {sceneReady} />
  {:catch}
    <!-- import/runtime failure: render nothing; poster shows through (no content loss) -->
  {/await}
{/if}
```

### Verification method (the proof, not a vibe)
1. `npm run build`.
2. Grep every `build/_app/immutable/**/*.js` for `@threlte`/`WebGLRenderer`/`three.module`. Assert ≥1 chunk matches (premium chunk exists, code present but split).
3. Parse `build/index.html` (prerendered Home = the Accessible entry). Collect every referenced chunk (`modulepreload` + module scripts). Assert **none** is a premium chunk.
4. Runtime cross-check (Playwright): Accessible theme → no downloaded JS body contains `@threlte`/`THREE.WebGLRenderer`; Premium+capable → exactly one does.

The `_four` `scripts/check-3d-boundary.mjs` does steps 2–3 unchanged and works for `_one` as-is (same adapter-static, same `build/index.html` entry, same `build/_app/immutable` layout). **Copy it verbatim** and wire an npm script (mirror `_one`'s existing `test:no-shiki` pattern):
```json
"test:no-three": "node scripts/check-3d-boundary.mjs"
```

## Capability Gate (HERO-02, HERO-03, A11Y-05)

Extend `_four`'s reactive helper. It must import ONLY `$app/environment` — never `three`/`@threlte` (it lives in the Accessible graph).

```ts
// src/lib/a11y/prefers.svelte.ts
import { browser } from '$app/environment';

// Reactive reduced-motion (listens for live OS toggles → mid-session change respected).
class PrefersReducedMotion {
  current = $state(false);
  constructor() {
    if (!browser) return;
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    this.current = mq.matches;
    mq.addEventListener('change', (e) => (this.current = e.matches));
  }
}
export const prefersReducedMotion = new PrefersReducedMotion();

// Cheap synchronous WebGL feature-detect BEFORE importing three (avoid loading ~150KB to fail). Memoized.
let _webgl: boolean | null = null;
export function webglSupported(): boolean {
  if (!browser) return false;
  if (_webgl !== null) return _webgl;
  try {
    const c = document.createElement('canvas');
    _webgl = !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { _webgl = false; }
  return _webgl;
}

// NEW for _one (HERO-02 "not-low-power"). Cheap, synchronous, fail-OPEN:
// only weak devices with a CLEAR negative signal are excluded, so capable
// devices missing these (Chromium-only) APIs still get the scene.
let _lowPowerOk: boolean | null = null;
export function notLowPower(): boolean {
  if (!browser) return false;                      // SSR: no scene
  if (_lowPowerOk !== null) return _lowPowerOk;
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  const lowMemory = typeof nav.deviceMemory === 'number' && nav.deviceMemory < 4;   // <4GB
  const fewCores  = typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 2;
  const saveData  = nav.connection?.saveData === true;                              // Data Saver on
  _lowPowerOk = !(lowMemory || fewCores || saveData);
  return _lowPowerOk;
}
```

**Design note on the low-power heuristic (MEDIUM confidence — the one genuinely new gate):** `navigator.deviceMemory` and `navigator.connection.saveData` are Chromium-only; `hardwareConcurrency` is broadly supported. All are synchronous, matching the Phase-2 "cheap synchronous signals only" principle that pushed this detection here rather than to first paint. The helper is **fail-open**: absent APIs → treated as capable (a modern Safari/Firefox visitor is not wrongly excluded), and the DPR≤2 clamp + on-demand render already bound the cost on mid devices. Recommend the plan keep thresholds conservative and make them a single tunable constant so field data can adjust them later. This is the MEDIUM-confidence area the STATE.md research flag called out — treat it as tunable, not gospel.

**Fallback matrix — every non-render path lands on the poster (Premium) or the plain text hero (Accessible), zero content loss:**
| Condition | `show3D` | Result |
|-----------|----------|--------|
| Accessible theme | false | No import, no canvas, **no poster** (D-15) — today's text hero, unchanged |
| Premium + `prefers-reduced-motion: reduce` | false | Poster; no import, no motion (A11Y-05) |
| Premium + motion, no WebGL | false | Poster |
| Premium + motion + WebGL, low-power | false | Poster |
| Premium + all pass | true | Poster first → 800ms crossfade → live scene |
| Dynamic `import()` fails | `{:catch}` | Poster shows through |
| `webglcontextlost` at runtime | `contextLost=true` | Collapses to poster |

## Scene Design (HERO-01 — "Living Constellation", periwinkle, restrained)

Re-author `_four`'s `scene/*` into the constellation. Reuse the skeleton (InstancedMesh orbs, `useTask` drift, lights, imperative-dispose), replace the art.

**Palette (from the LOCKED `theme-premium.css` tokens — confirmed present):** bg `#0f1020`, accent `#7aa2ff`, accent-hover `#a9c2ff`, text `#f6f4f2`. Orbs range `#7aa2ff`→`#a9c2ff` with white-hot (`#ffffff`) emissive cores; canvas transparent so the CSS `--color-bg` navy shows through (avoids a hardcoded bg hex and keeps token fidelity).

**Component structure (all under `premium/scene/`):**
```
scene/
├── Scene.svelte        # <T.PerspectiveCamera makeDefault>, lights, children; owns useTask drift + running-gate + parallax tilt + onDestroy disposal
├── Orbs.svelte         # <T.InstancedMesh> of ~40 (desktop) / ~20 (mobile) spheres; per-orb drift+breathe; white-core material
├── Connections.svelte  # <T.Mesh is={LineSegments}>; per-frame BufferGeometry rebuild of near-pair segments, alpha by distance (D-03)
└── Lights.svelte       # periwinkle point light(s) + dim ambient; no orange counterpoint (monochrome, D-02)
```

### Orbs (D-01, D-02, D-04)
`THREE.InstancedMesh` of a small `SphereGeometry`, count `40` desktop / `20` at a small-screen breakpoint (read a matchMedia at scene init; the whole scene is Premium+capable already). Each instance carries a seed `{basePos, driftPhase, size, coreTint}`. In a shared `useTask`, advance `elapsed` and update each instance matrix with slow sinusoidal drift + a breathe scale (`1 + 0.06*sin(elapsed*ω + phase)`). One instanced mesh = one draw call. White-hot core via a high `emissiveIntensity` on a periwinkle `emissive`, or a two-layer look (opaque core + additive halo) at discretion. Seed positions **biased into two side bands** to implement the exclusion zone (see Legibility).

### Connections — proximity graph (D-03, NEW technical element, MEDIUM-HIGH confidence)
Standard three.js "nodes" technique, dependency-free:
- One `THREE.LineSegments` with a `BufferGeometry` sized for the max possible pairs (`N*(N-1)/2 * 2` vertices). For N=40 that's ≤1560 vertices — negligible.
- Each frame (inside the same `useTask`), walk all unique orb pairs; for pairs within a distance threshold, write both endpoints into the position array and a per-vertex alpha (or a color whose value falls off with distance) into a color/opacity attribute; then `geometry.setDrawRange(0, activeVertexCount)` and set `position.needsUpdate = true` (+ color attribute if used).
- Material: `LineBasicMaterial({ transparent:true, vertexColors:true, blending: AdditiveBlending })` in the periwinkle range, low base opacity. Distance threshold + max-opacity are Claude's-discretion tunables (D-03/§Discretion).
- 40 orbs ⇒ 780 pair checks/frame — trivial. If N ever grows, spatial hashing is the escape hatch; not needed here.

### Motion (D-05, D-06, D-07)
- **Drift + breathe + near-imperceptible field rotation** in `useTask`, delta-based, ~20–30s cycle, tiny amplitude (non-vestibular).
- **Parallax tilt (D-06):** lerp the constellation group's rotation a few degrees toward pointer position; wire only on non-touch (skip if `matchMedia('(pointer: coarse)')` or no pointer). Degrades to nothing on mobile per D-13.
- **Scroll fade + RAF pause (D-07):** the same IntersectionObserver that gates `running` also drives a CSS opacity fade on the `.hero-scene` wrapper as it leaves the viewport; when off-screen, `running=false` halts rendering (0 GPU).

### Lights (D-02)
Periwinkle monochrome: a dim `AmbientLight` + one or two low-intensity `PointLight`s in the `#7aa2ff` range. **No orange counterpoint** (that was `_four`; monochrome is locked here).

### Decorative-only guarantees (A11Y — non-negotiable)
- `.hero-scene` wrapper and the `<canvas>` are `aria-hidden="true"`, `pointer-events:none`, no `tabindex`, no `<OrbitControls>` → not focusable, not announced.
- The real `<h1>`/lede/CTA stay separate semantic DOM in `+page.svelte`, outside the canvas. No essential content or action lives in the 3D. Accessible-tree users get 100% of the content.

## Hero Composition, Poster & Crossfade (HERO-03, D-10..D-17)

### Layout (D-10, D-12)
Full-bleed background behind the existing hero text. `_one`'s hero is currently inline in `src/routes/+page.svelte` (`<section class="hero">` with h1/lede/disclaimer/CTA). Either extract a `Hero.svelte` or add the background layers inline; keep the text nodes exactly as-is. Background stack inside `.hero`, in z-order: (1) poster `<img>`/`<picture>` (Premium only), (2) `<PremiumHero />` canvas overlay, (3) scrim, (4) existing text content on top.

Premium hero height **~85svh** — apply via `:root[data-theme='premium'] .hero { min-block-size: 85svh; }` so **Accessible mode is untouched** (D-12). Handle short/landscape viewports (Claude's discretion) — e.g. cap with a `max-block-size` or fall back to natural height under a short-viewport media query so the CTA never scrolls off.

### Legibility — exclusion zone + scrim (D-11, AA-critical)
- **Exclusion zone:** seed orb positions into left/right bands, keeping the central text column clear (spawn-region constraint is simpler and cheaper than steering forces; either satisfies D-11 — Claude's discretion).
- **Scrim:** a radial/linear darkening (CSS pseudo-element or gradient layer) behind the text block, over the canvas. Premium text is `#f6f4f2` (~17:1 on the `#0f1020` bg); periwinkle orbs where they overlap text could erode that, so the scrim + exclusion zone jointly **guarantee AA at every viewport**. The plan should verify AA of the text over the worst-case (brightest orb behind text) — a static contrast check on the scrimmed region, or a manual capture, since orbs are dynamic.

### Poster (D-14, D-15, D-16) — NEW production work
- **Produce it:** build the scene, screenshot a beautiful 2x frame, optimize to AVIF + WebP (+ a JPG/PNG fallback), commit under `static/` (e.g. `static/hero/constellation-poster.avif|.webp|.jpg`). No build-time render pipeline (D-16).
- **Serve it base-prefixed:** all internal asset URLs must go through `$app/paths` `base` for the sub-path deploy (`/diversityincludesdisability_one`) — a raw `/hero/...` src breaks on Pages (03-RESEARCH base-path gotcha). Use `<picture>` with base-prefixed `srcset`/`src`.
- **Premium only:** render the poster element only when `theme.current === 'premium'`. **Accessible theme renders NO image** (D-15) — its identity is text-first clarity.
- Poster is the permanent Premium fallback for every gate-fail/`{:catch}`/context-lost path.

### 800ms crossfade (D-17) — NEW
Keep the poster mounted underneath. When the scene paints its first frame, fade the canvas in over ~800ms (CSS `transition: opacity 800ms var(--motion-ease)` on `.hero-scene`, toggled by a `sceneReady` flag). Signal first-frame from `SceneCanvas`/`Scene` — either Threlte's Canvas `oncreate`/`createdstate` or after the first `useTask` tick — bubbling an `onReady` callback up to `PremiumHero` (mirror the `onContextLost` callback plumbing). The poster can fade out or simply sit beneath the now-opaque canvas. Effect: "the still image wakes up," not a content swap.

## Disposal & Failure Handling (HERO-04 — no leaks, single canvas)

`_one` will have exactly ONE 3D surface, on the Home route only. The leak risk is repeated Home↔About nav re-creating GL contexts toward the browser's ~8–16 cap. `_four`'s pattern is live-verified leak-free over nav×15 — copy it into `Scene.svelte`:

```ts
import { onDestroy } from 'svelte';
import { useTask, useThrelte } from '@threlte/core';

const { renderer, invalidate } = useThrelte();
const canvas = renderer.domElement;

let visible = $state(typeof document === 'undefined' ? true : !document.hidden);
let onscreen = $state(true);
const running = () => visible && onscreen;

const onVis = () => (visible = !document.hidden);
document.addEventListener('visibilitychange', onVis);
const io = new IntersectionObserver(([e]) => (onscreen = e.isIntersecting), { threshold: 0 });
io.observe(canvas);

const onLost = (e: Event) => { e.preventDefault(); onContextLost?.(); }; // → parent collapses to poster
canvas.addEventListener('webglcontextlost', onLost, false);

let elapsed = $state(0);
useTask((delta) => { elapsed += delta; invalidate(); }, { running });

onDestroy(() => {
  document.removeEventListener('visibilitychange', onVis);
  canvas.removeEventListener('webglcontextlost', onLost);
  io.disconnect();
  try { renderer.dispose(); renderer.forceContextLoss(); } catch { /* already gone */ }
});
```
Also `.dispose()` any geometry/material/texture created imperatively (the orbs' `SphereGeometry`/material, the connections' `BufferGeometry`/`LineBasicMaterial`) in each child's own `onDestroy` — `_four`'s `ParticleField`/`EchoRings` did exactly this.

**Canvas config:** `<Canvas renderMode="on-demand" dpr={[1, 2]}>` (on-demand is the Threlte 8 default; `invalidate()` in the running task drives it; stopping the task → 0 GPU). DPR clamp `[1, 2]` per D-13 (≤2).

## Perf Budget

| Lever | Setting | Why |
|-------|---------|-----|
| DPR | `dpr={[1, 2]}` | D-13 clamp ≤2; biggest fill-rate win on hi-DPI |
| Render mode | `renderMode="on-demand"` + task-gated `invalidate()` | Renders only when the task runs; pause = 0 GPU |
| Pause offscreen/hidden | IntersectionObserver + `visibilitychange` → `running=false` | No battery/fan drain when not visible; also serves D-07 |
| Orb geometry | 1 `InstancedMesh` (40/20 instances) | One draw call; no textures, no GLTF |
| Connections | 1 `LineSegments`, per-frame BufferGeometry, `setDrawRange` | ≤780 pair checks/frame; negligible |
| Mobile | 20 orbs, no parallax, DPR≤2 | D-13; low-power gate already excludes weak devices |
| Premium chunk target | **< 200 KB gzipped** (three core + @threlte/core, no extras, no assets) | Poster covers the `{#await}` gap; keeps first Premium paint fast |

## Concrete File List (for the planner)

**New:**
- `src/lib/components/premium/PremiumHero.svelte` — three-free gate (theme + reduced-motion + WebGL + **notLowPower** + context-lost); `{#await import('./HeroScene.svelte')}`; owns `sceneReady` for the crossfade.
- `src/lib/components/premium/HeroScene.svelte` — `.hero-scene` wrapper (aria-hidden, NO scoped style); `{#await import('./SceneCanvas.svelte')}` (the CSS-leak second hop).
- `src/lib/components/premium/SceneCanvas.svelte` — sole `<Canvas renderMode="on-demand" dpr={[1,2]}>`; NO scoped style.
- `src/lib/components/premium/scene/Scene.svelte` — camera + lights + Orbs + Connections + `useTask` running-gate + parallax tilt + `onReady` first-frame signal + `onDestroy` disposal.
- `src/lib/components/premium/scene/Orbs.svelte` — instanced periwinkle orbs, white-hot cores, drift+breathe, edge-banded seeds.
- `src/lib/components/premium/scene/Connections.svelte` — proximity `LineSegments`.
- `src/lib/components/premium/scene/Lights.svelte` — periwinkle point light(s) + dim ambient.
- `src/lib/a11y/prefers.svelte.ts` — reactive reduced-motion + `webglSupported()` + **`notLowPower()`**.
- `scripts/check-3d-boundary.mjs` — copied from `_four` verbatim (build-grep split proof).
- `static/hero/constellation-poster.avif|.webp|.jpg` — the captured poster (committed).
- `e2e/premium-hero.spec.ts`, `e2e/premium-bundle.spec.ts`, `e2e/premium-dispose.spec.ts` — see Validation.

**Modified:**
- `src/routes/+page.svelte` (or extract `src/lib/components/Hero.svelte`) — add poster `<picture>` (Premium-only, base-prefixed) + static `import PremiumHero` + `<PremiumHero />` overlay + scrim + `[data-theme='premium'] .hero` 85svh sizing. **Text nodes unchanged.**
- A shared always-loaded stylesheet (e.g. `src/lib/styles/app.css`) — add `.hero-scene` positioning (so no scene component needs a scoped style block).
- `package.json` — add `three@0.185.1`, `@threlte/core@8.5.16` (deps), `@types/three@0.185.0` (dev); add `"test:no-three": "node scripts/check-3d-boundary.mjs"`.

## Common Pitfalls

### Pitfall 1: A single static `three`/`@threlte` import leaks WebGL into the Accessible entry (HERO-04 fail)
Any top-level import in `+page.svelte`, `PremiumHero.svelte`, a layout, or a shared util merges the WebGL chunk into the entry bundle; tree-shaking can't remove a statically-imported module. **Avoid:** quarantine to `premium/`, reach only via `import()`, keep `PremiumHero` three-free. **Warning sign:** `check-3d-boundary.mjs` finds `@threlte` in a modulepreloaded home chunk.

### Pitfall 2: The @threlte Canvas CSS `<link>` on the Accessible home (the sneaky one)
Even with the JS split correct, a `<Canvas>` at `dynamic_import_depth 1` gets its scoped CSS eagerly linked onto the home. **Avoid:** the FOUR-level structure — `<Canvas>` lives in `SceneCanvas.svelte` behind a second `import()`; `HeroScene`/`SceneCanvas` carry no scoped `<style>`. **Warning sign:** a premium-hashed `.css` `<link>` in `build/index.html`. (Consider extending the boundary check to also scan `build/index.html` for premium CSS links.)

### Pitfall 3: WebGL context accumulation across nav (HERO-04 fail)
**Avoid:** explicit `renderer.dispose()` + `forceContextLoss()` + listener/IO cleanup in `onDestroy`. **Warning sign:** "Too many active WebGL contexts" after ~8–16 Home↔About cycles; the dispose spec catches it via a console listener.

### Pitfall 4: Motion plays under reduced-motion because theme was checked but the media query wasn't
A user can explicitly pick Premium while running `prefers-reduced-motion: reduce`. **Avoid:** the independent `prefersReducedMotion` check in the gate (A11Y-05). The poster IS the frozen scene, so there's nothing to "soften" — it's fully off. **Warning sign:** canvas mounts with OS reduce-motion on.

### Pitfall 5: Wrong store / wrong localStorage key in tests
`_one` uses the `theme` store, key `did:theme`, attr `data-theme` — NOT `_four`'s `did-mode`. Copy a `_four` premium spec and it will silently never enter Premium. **Avoid:** set `localStorage['did:theme']='premium'` (the app.html inline script reads it pre-paint and sets `data-theme`, which the runes store adopts at hydration).

### Pitfall 6: Playwright managed `webServer` hangs at teardown on this Windows box
Documented in `_one`'s `04-02-SUMMARY.md`: the cmd.exe wrapper survives, reporting absurd durations ("1 passed (32.1m)" for a 308ms test). **Avoid:** run the gate against a self-managed `vite preview` on a private, curl-verified port with a webServer-less throwaway config, then `taskkill` the server tree (never commit the throwaway config). Alternatively rely on `reuseExistingServer` against a pre-started preview.

### Pitfall 7: Poster src not base-prefixed → 404 on Pages
A raw `/hero/poster.avif` resolves to the origin root on the sub-path deploy. **Avoid:** `{base}/hero/...` via `$app/paths`. **Warning sign:** broken poster in the deployed Premium hero (works locally at root).

## Code Examples

Proven, from `_four`'s shipped & live-verified source (`src/lib/components/premium/**`):

### The second-hop wrapper (HeroScene.svelte) — CSS-leak fix
```svelte
<script lang="ts">
  let { onContextLost, onReady, sceneReady }: {
    onContextLost?: () => void; onReady?: () => void; sceneReady?: boolean;
  } = $props();
</script>
<!-- .hero-scene lives in an always-loaded stylesheet → no scoped chunk to hoist. -->
<div class="hero-scene" class:is-ready={sceneReady} aria-hidden="true">
  {#await import('./SceneCanvas.svelte') then { default: SceneCanvas }}
    <SceneCanvas {onContextLost} {onReady} />
  {/await}
</div>
```

### The sole Canvas owner (SceneCanvas.svelte)
```svelte
<script lang="ts">
  import { Canvas } from '@threlte/core';
  import Scene from './scene/Scene.svelte';
  let { onContextLost, onReady }: { onContextLost?: () => void; onReady?: () => void } = $props();
</script>
<Canvas renderMode="on-demand" dpr={[1, 2]}>
  <Scene {onContextLost} {onReady} />
</Canvas>
```

### Instanced orbs skeleton (adapt colors/count from _four's ParticleField.svelte)
```svelte
<script lang="ts">
  import { onDestroy } from 'svelte';
  import { T } from '@threlte/core';
  import { InstancedMesh, Object3D, SphereGeometry, MeshStandardMaterial, Color } from 'three';
  let { elapsed = 0 }: { elapsed?: number } = $props();
  const COUNT = matchMedia('(max-width: 640px)').matches ? 20 : 40;   // D-04 / D-13
  const geo = new SphereGeometry(0.05, 12, 12);
  const mat = new MeshStandardMaterial({
    color: new Color('#7aa2ff'), emissive: new Color('#a9c2ff'), emissiveIntensity: 1.1
  });
  const mesh = new InstancedMesh(geo, mat, COUNT);
  const dummy = new Object3D();
  // seed into left/right bands (exclusion zone, D-11) with per-orb size/phase; drift+breathe in $effect on elapsed
  onDestroy(() => { geo.dispose(); mat.dispose(); });
</script>
<T is={mesh} />
```
Source: `diversityincludesdisability_four/src/lib/components/premium/scene/ParticleField.svelte` (live-verified). Full drift `$effect` and matrix update as in that file.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Threlte 7 (Svelte 4 stores/slots) | Threlte 8 (Svelte 5 runes, snippets, `useTask`) | Threlte 8 major | Use `useTask`/`useThrelte`, `$state`/`$derived`, `$props()` snippets — no `export let` in scene components |
| `<Canvas>` at import depth 1 | `<Canvas>` behind a second `import()` (SceneCanvas) | `_four` live fix | Prevents the premium scene CSS `<link>` leaking onto the Accessible home |
| `renderMode="always"` | `renderMode="on-demand"` + task-gated `invalidate()` | Threlte 8 default | Free pause when idle/offscreen |

**Deprecated/outdated:** `@react-three/*` patterns, Threlte-7 slot children, Svelte-4 `export let`.

## Open Questions

1. **Low-power thresholds** (MEDIUM — STATE.md's flagged area). Known: `deviceMemory`/`saveData` are Chromium-only, `hardwareConcurrency` broad; all synchronous. Unclear: the "right" cutoffs. Recommendation: ship the fail-open heuristic with `<4GB / ≤2 cores / saveData` as a single tunable constant; the poster fallback makes an over- or under-inclusive gate graceful either way.
2. **First-frame signal for the 800ms crossfade.** Known: Threlte's `<Canvas>` exposes creation state and `useTask` fires per frame. Unclear: cleanest hook (Canvas `oncreate` vs first `useTask` tick). Recommendation: fire `onReady` on the first `useTask` tick (guaranteed post-first-render) — simplest and framework-version-robust.
3. **AA over dynamic orbs.** The scrim + exclusion zone must hold AA at all viewports. Recommendation: verify against the worst case (brightest orb directly behind text) via a static contrast check on the scrimmed region or a manual capture; if marginal, deepen the scrim rather than dimming orbs.
4. **`<Canvas>` transparency to let `--color-bg` show through.** Recommendation: prefer a transparent canvas + CSS navy behind it; if the token bg doesn't read through, set clear alpha 0 in the renderer. Low risk (verified approach in `_four`).

## Validation Architecture

> `nyquist_validation` is enabled in `.planning/config.json`. Each success criterion maps to a programmatic gate. Tests run against the **production build via `vite preview`** (the same artifact shipped to Pages), using `_one`'s existing local-preview config pattern. **No `data-hydrated` attribute exists in `_one`** — wait on the canvas locator (it only appears after the async `import()` resolves) rather than a hydration flag.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright 1.61.1 (`@playwright/test`) + Node scripts (`scripts/*.mjs`). No axe in Phase 5 (deferred to Phase 6). |
| Config file | `playwright.theme.config.ts` (local build+preview, `testDir: e2e`, chromium) — or a dedicated `playwright.hero.config.ts`. **Windows caveat:** managed `webServer` hangs at teardown (Pitfall 6) — use a self-managed private-port preview + webServer-less throwaway config for the final gate. |
| Quick run command | `npx playwright test e2e/premium-hero.spec.ts --config playwright.theme.config.ts` |
| Full suite command | `npm run build && npm run test:no-three && npm run test:e2e` (add `test:no-three` after build) |

### Success-Criterion / Requirement → Test Map
| Req / SC | Behavior | Test Type | Automated Command | File Exists? |
|----------|----------|-----------|-------------------|-------------|
| HERO-04 (SC-3) | Premium chunk exists AND no three/@threlte in the Accessible/home critical bundle (never blocks first paint) | build-grep (Node) | `node scripts/check-3d-boundary.mjs` | ❌ Wave 0 |
| HERO-02/04 | Accessible theme downloads no three chunk; Premium+capable does | e2e network | `playwright test e2e/premium-bundle.spec.ts` | ❌ Wave 0 |
| HERO-01 (SC-1) | Premium + WebGL + motion + not-low-power → `<canvas>` visible | e2e | `playwright test e2e/premium-hero.spec.ts` | ❌ Wave 0 |
| HERO-03 (SC-2) | Accessible → no canvas, no poster, h1+CTA present; Premium no-WebGL/low-power → poster + no canvas | e2e | `playwright test e2e/premium-hero.spec.ts` | ❌ Wave 0 |
| A11Y-05 (SC-4) | Premium + `reducedMotion:reduce` → poster, **zero canvas**, no three chunk downloaded | e2e | `playwright test e2e/premium-hero.spec.ts` | ❌ Wave 0 |
| HERO-04 (SC-3) | Nav Home↔About ×15 → canvas removed on leave, re-created on return, **zero WebGL-context console errors** | e2e | `playwright test e2e/premium-dispose.spec.ts` | ❌ Wave 0 |
| HERO-04 | Forced `webglcontextlost` → poster fallback, no crash, h1 intact | e2e | `playwright test e2e/premium-dispose.spec.ts` | ❌ Wave 0 |
| HERO-01/decorative | Canvas is `aria-hidden`, not focusable (no tabindex, pointer-events:none) | e2e | `playwright test e2e/premium-hero.spec.ts` (attribute + Tab-order assert, no axe) | ❌ Wave 0 |

### Test blueprints (adapt `_four`'s specs to `_one`'s `did:theme` key)
```ts
// e2e/premium-hero.spec.ts (excerpt) — note the did:theme key and no data-hydrated wait
import { test, expect } from '@playwright/test';

test('accessible theme: no canvas, no poster, content present', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('did:theme', 'accessible'));
  await page.goto('./');
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('.hero picture, .hero img')).toHaveCount(0); // D-15: no image in accessible
  await expect(page.locator('h1')).toBeVisible();
});

test('A11Y-05: premium + reduced-motion → poster, no canvas, no three chunk', async ({ page }) => {
  const bodies: string[] = [];
  page.on('response', async (r) => { if (r.url().endsWith('.js')) bodies.push(await r.text().catch(() => '')); });
  await page.addInitScript(() => localStorage.setItem('did:theme', 'premium'));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  await expect(page.locator('.hero picture, .hero img')).toBeVisible(); // poster
  await expect(page.locator('canvas')).toHaveCount(0);
  expect(bodies.some((b) => /@threlte|THREE\.WebGLRenderer/.test(b))).toBe(false);
});

test('HERO-01: premium + motion + capable → canvas mounts, decorative', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('did:theme', 'premium'));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('./');
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible({ timeout: 10_000 });   // appears only after the async import
  await expect(page.locator('.hero-scene')).toHaveAttribute('aria-hidden', 'true');
});
```
Dispose spec (`_four` live-verified, nav×15 + forced context loss) and the bundle network spec copy over unchanged except for the `did:theme` key and the relative `goto('./')` convention. Playwright defaults `reducedMotion:'no-preference'`, but **pin it explicitly** in every premium spec for determinism.

### Sampling Rate
- **Per task commit:** `npx playwright test e2e/premium-hero.spec.ts --config playwright.theme.config.ts && node scripts/check-3d-boundary.mjs`
- **Per wave merge:** `npx playwright test e2e/premium-*.spec.ts --config playwright.theme.config.ts`
- **Phase gate:** `npm run build && node scripts/check-3d-boundary.mjs && npx playwright test e2e/premium-*.spec.ts` all green before `/gsd:verify-work`.

### Wave 0 Gaps
- [ ] Install `three@0.185.1 @threlte/core@8.5.16` + `-D @types/three@0.185.0` (npm) before any scene work.
- [ ] `scripts/check-3d-boundary.mjs` — copy from `_four`; wire `test:no-three` npm script.
- [ ] `src/lib/a11y/prefers.svelte.ts` — reduced-motion + `webglSupported()` + **`notLowPower()`** (shared gating fixture).
- [ ] `e2e/premium-hero.spec.ts` — HERO-01/02/03 + A11Y-05 capability branches.
- [ ] `e2e/premium-bundle.spec.ts` — HERO-02/04 runtime network proof.
- [ ] `e2e/premium-dispose.spec.ts` — HERO-04 nav×15 leak + forced context loss.
- [ ] Resolve the Windows `webServer` teardown workaround (self-managed private-port preview) before wiring the e2e gate.

## Sources

### Primary (HIGH confidence)
- `diversityincludesdisability_four` shipped + **live-verified** source: `src/lib/components/premium/**` (four-level boundary, SceneCanvas second hop, `onDestroy` disposal, `useTask` running-gate), `scripts/check-3d-boundary.mjs`, `src/lib/a11y/prefers.svelte.ts`, `src/lib/stores/mode.svelte`. Read directly this session.
- `diversityincludesdisability_four/.planning/phases/04-premium-3d-needs-research/04-RESEARCH.md` — Threlte 8 Canvas/useTask API (verified there against threlte.xyz), perf budget, validation blueprints.
- npm registry — three 0.185.1, @threlte/core 8.5.16, @types/three 0.185.0, @threlte/extras 9.21.0; `@threlte/core` peers `svelte>=5, three>=0.160` (re-verified 2026-07-06).
- `_one` repo: `src/lib/theme/theme.svelte.ts`, `src/app.html` (inline no-flash script, `did:theme`), `src/lib/styles/theme-premium.css` (locked periwinkle tokens), `src/routes/+page.svelte` (hero seam), `playwright.theme.config.ts`, `.planning/phases/04-forms-donate/04-02-SUMMARY.md` (Windows webServer teardown note), `.planning/config.json` (nyquist enabled).

### Secondary (MEDIUM confidence)
- MDN — `navigator.deviceMemory`, `navigator.hardwareConcurrency`, `NetworkInformation.saveData` (Chromium-scoped support; synchronous) → low-power heuristic design.
- three.js community "nodes/particles + connecting lines" pattern → `LineSegments` proximity graph technique.

### Tertiary (LOW confidence / needs runtime validation)
- Exact low-power thresholds — device-dependent; ship tunable, adjust with field data.
- AA contrast over the brightest dynamic orb — verify with a real capture/contrast check during build.

## Metadata

**Confidence breakdown:**
- Lazy-import boundary + four-level CSS-leak fix + build-grep proof: **HIGH** — live-verified in `_four`, greppable, test-enforced.
- Threlte 8 Canvas/useTask/disposal API: **HIGH** — verified against threlte.xyz in `_four` and confirmed by shipped code.
- Stack/versions: **HIGH** — npm-confirmed, identical to the shipped sibling, peers satisfied.
- Capability gate (theme + reduced-motion + WebGL): **HIGH** — proven pattern, only the store binding changes.
- Low-power detection: **MEDIUM** — sound synchronous heuristic, thresholds tunable (STATE.md's flagged area).
- Constellation scene (orbs + proximity lines + parallax + scrim/exclusion): **MEDIUM-HIGH** — standard primitives on a proven skeleton; art direction is new to this family, and the connection-line + AA-over-dynamic-orbs details need runtime tuning.

**Research date:** 2026-07-06
**Valid until:** ~2026-08-06 (re-verify three/@threlte versions and the Canvas/useTask API if picked up later).
