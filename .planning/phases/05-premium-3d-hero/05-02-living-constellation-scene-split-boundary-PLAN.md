---
phase: 05-premium-3d-hero
plan: 02
type: execute
wave: 2
depends_on: ["05-01"]
files_modified:
  - src/lib/components/premium/PremiumHero.svelte
  - src/lib/components/premium/HeroScene.svelte
  - src/lib/components/premium/SceneCanvas.svelte
  - src/lib/components/premium/scene/Scene.svelte
  - src/lib/components/premium/scene/positions.ts
  - src/lib/components/premium/scene/Orbs.svelte
  - src/lib/components/premium/scene/Connections.svelte
  - src/lib/components/premium/scene/Lights.svelte
  - src/routes/+page.svelte
autonomous: true
requirements: [HERO-01, HERO-02, HERO-04]
must_haves:
  truths:
    - "In Premium + WebGL + motion-ok + not-low-power, the home hero mounts a live periwinkle constellation canvas"
    - "The gate is composed from theme.current==='premium' AND !reduced-motion AND WebGL AND notLowPower AND !contextLost"
    - "three/@threlte code is split into its own chunk and never referenced by the prerendered Accessible/Home entry"
    - "Navigating away disposes the renderer, listeners, and IntersectionObserver — no WebGL context accumulation across 15 cycles"
    - "As the constellation scrolls out of the hero viewport it gently fades to transparent (opacity 0) AND rendering pauses; both restore when it scrolls back in (D-07 — fade + RAF pause, not just RAF pause)"
    - "Proximity connection lines always terminate on the currently-visible orb centers because Orbs and Connections derive every position from ONE shared module (no independent drift math)"
  artifacts:
    - path: "src/lib/components/premium/PremiumHero.svelte"
      provides: "three-free capability gate; {#await import('./HeroScene.svelte')}; owns contextLost + sceneReady"
      min_lines: 20
      contains: "theme.current === 'premium'"
    - path: "src/lib/components/premium/SceneCanvas.svelte"
      provides: "the SOLE <Canvas renderMode='on-demand' dpr={[1,2]}> owner (second import hop); passes onVisibility down to Scene"
      contains: "dpr={[1, 2]}"
    - path: "src/lib/components/premium/scene/Scene.svelte"
      provides: "camera + lights + Orbs + Connections + useTask running-gate + onVisibility bubble + parallax tilt + onReady first-frame + onDestroy disposal; builds the shared seed array once"
      contains: "renderer.forceContextLoss"
    - path: "src/lib/components/premium/scene/positions.ts"
      provides: "the SINGLE source of orb geometry: makeOrbSeeds(count) → {basePos, driftPhase, size}[] and a pure orbPositionAt(seed, elapsed, out) drift function; imported by BOTH Orbs and Connections so lines track visible orbs (D-03)"
      contains: "orbPositionAt"
    - path: "src/lib/components/premium/scene/Orbs.svelte"
      provides: "InstancedMesh of 40 (desktop)/20 (mobile) periwinkle white-core orbs; positions from ./positions (shared with Connections), breathe scale local, edge-banded seeds"
      contains: "InstancedMesh"
    - path: "src/lib/components/premium/scene/Connections.svelte"
      provides: "LineSegments proximity graph reading the SAME ./positions seeds/drift as Orbs, per-frame BufferGeometry + setDrawRange"
      contains: "LineSegments"
    - path: "src/routes/+page.svelte"
      provides: "static import PremiumHero + full-bleed overlay in .hero + scrim + 85svh premium sizing; text nodes unchanged"
      contains: "PremiumHero"
  key_links:
    - from: "src/lib/components/premium/PremiumHero.svelte"
      to: "src/lib/components/premium/HeroScene.svelte"
      via: "dynamic import() behind the show3D gate"
      pattern: "import\\('\\./HeroScene\\.svelte'\\)"
    - from: "src/lib/components/premium/HeroScene.svelte"
      to: "src/lib/components/premium/SceneCanvas.svelte"
      via: "SECOND dynamic import() (the CSS-leak fix)"
      pattern: "import\\('\\./SceneCanvas\\.svelte'\\)"
    - from: "src/lib/components/premium/scene/Scene.svelte"
      to: "src/lib/components/premium/HeroScene.svelte"
      via: "onVisibility(onscreen) callback bubbled UP → HeroScene toggles .is-onscreen → CSS opacity fade (D-07)"
      pattern: "onVisibility"
    - from: "src/lib/components/premium/scene/Orbs.svelte"
      to: "src/lib/components/premium/scene/positions.ts"
      via: "import { makeOrbSeeds, orbPositionAt } — the shared position source"
      pattern: "from '\\./positions'"
    - from: "src/lib/components/premium/scene/Connections.svelte"
      to: "src/lib/components/premium/scene/positions.ts"
      via: "import { orbPositionAt } — SAME source as Orbs (why lines terminate on orb centers)"
      pattern: "from '\\./positions'"
    - from: "src/routes/+page.svelte"
      to: "src/lib/components/premium/PremiumHero.svelte"
      via: "static import (three-free, safe in the Accessible graph)"
      pattern: "PremiumHero"
---

<objective>
Build the "Living Constellation" — the periwinkle Threlte showpiece — behind the proven four-level lazy-import boundary, and wire it into the existing Home hero as a full-bleed decorative background WITHOUT touching the shipped h1/lede/CTA semantics. The scene mounts only when the capability gate passes; three/@threlte stays fully code-split; the renderer disposes cleanly on navigation.

Purpose: HERO-01 (the 3D showpiece), HERO-02 (the composed gate), and HERO-04 (split + disposal). This is the core of the phase — everything else gates or falls back to it.
Output: 7 premium components + a shared positions module + the Home hero wiring; `test:no-three` flips GREEN; the premium canvas-mount + dispose (incl. D-07 scroll-fade) specs go green.
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
@.planning/phases/05-premium-3d-hero/05-01-SUMMARY.md

<interfaces>
<!-- Contracts from Plan 05-01 (already shipped) and the shell. Use directly. -->

Capability gate — src/lib/a11y/prefers.svelte.ts (from 05-01):
```typescript
export const prefersReducedMotion;           // .current reactive boolean
export function webglSupported(): boolean;    // synchronous, memoized
export function notLowPower(): boolean;       // synchronous, fail-open
```
Theme store — src/lib/theme/theme.svelte.ts: `theme.current === 'premium'`.

Always-loaded CSS (from 05-01, src/lib/styles/app.css): `.hero-scene { position:absolute; inset:0; z-index:1; pointer-events:none; opacity:0; transition:opacity 800ms var(--motion-ease); }` and `.hero-scene.is-ready.is-onscreen { opacity:1; }`. HeroScene toggles `.is-ready` (crossfade, D-17) via `class:is-ready={sceneReady}` AND `.is-onscreen` (scroll fade, D-07) via `class:is-onscreen={onscreen}`, where `onscreen` is bubbled up from Scene's IntersectionObserver via the `onVisibility` callback. DO NOT add scoped <style> to HeroScene or SceneCanvas.

Locked Premium palette (theme-premium.css): bg `#0f1020`, accent `#7aa2ff`, accent-hover `#a9c2ff`, text `#f6f4f2`. Canvas is transparent so `--color-bg` navy shows through.

Threlte 8 API (runes): `import { Canvas, T, useTask, useThrelte } from '@threlte/core'`. `useThrelte()` → `{ renderer, invalidate }`. `useTask((delta)=>{...}, { running })`. Scene components use `$props()`/`$state`/`$effect` — NO `export let`.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Four-level boundary — PremiumHero gate + HeroScene (+ scroll-fade) + SceneCanvas</name>
  <read_first>
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\diversityincludesdisability_four\src\lib\components\premium\PremiumHero.svelte (the proven gate — swap the store + add notLowPower + add sceneReady/onReady plumbing)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\diversityincludesdisability_four\src\lib\components\premium\HeroScene.svelte (second-hop wrapper, aria-hidden, NO scoped style)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\diversityincludesdisability_four\src\lib\components\premium\SceneCanvas.svelte (sole Canvas owner — change dpr to [1,2])
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\diversityincludesdisability_one\src\lib\a11y\prefers.svelte.ts (the gate inputs from 05-01)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\diversityincludesdisability_one\.planning\phases\05-premium-3d-hero\05-RESEARCH.md (§Lazy-Import Boundary — the four-level structure + why the SECOND import() hop and no scoped <style>; §Motion D-07 — the SAME IntersectionObserver drives both RAF pause AND a CSS opacity fade)
  </read_first>
  <files>src/lib/components/premium/PremiumHero.svelte, src/lib/components/premium/HeroScene.svelte, src/lib/components/premium/SceneCanvas.svelte</files>
  <action>
    Create the three-file boundary under `src/lib/components/premium/`. Copy `_four`'s files as the skeleton; apply these EXACT `_one` deltas:

    `PremiumHero.svelte` (THREE-FREE — imports only the theme store + prefers helper):
    ```svelte
    <script lang="ts">
      import { theme } from '$lib/theme/theme.svelte';   // _one THEME store (NOT _four's mode store)
      import { prefersReducedMotion, webglSupported, notLowPower } from '$lib/a11y/prefers.svelte';
      let contextLost = $state(false);   // raised by SceneCanvas → HeroScene → here
      let sceneReady = $state(false);    // first frame → triggers the 800ms crossfade (D-17)
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
        <HeroScene {sceneReady} onContextLost={() => (contextLost = true)} onReady={() => (sceneReady = true)} />
      {:catch}
        <!-- import/runtime failure: render nothing; poster shows through -->
      {/await}
    {/if}
    ```
    `HeroScene.svelte` (second-hop wrapper — NO scoped `<style>`; `.hero-scene` class comes from app.css; OWNS the `onscreen` state that drives the D-07 scroll fade):
    ```svelte
    <script lang="ts">
      let { onContextLost, onReady, sceneReady }: { onContextLost?: () => void; onReady?: () => void; sceneReady?: boolean } = $props();
      let onscreen = $state(true);   // bubbled up from Scene's IntersectionObserver → toggles the D-07 fade
    </script>
    <div class="hero-scene" class:is-ready={sceneReady} class:is-onscreen={onscreen} aria-hidden="true">
      {#await import('./SceneCanvas.svelte') then { default: SceneCanvas }}
        <SceneCanvas {onContextLost} {onReady} onVisibility={(v) => (onscreen = v)} />
      {/await}
    </div>
    ```
    `SceneCanvas.svelte` (SOLE `<Canvas>` owner — NO scoped `<style>`; dpr `[1, 2]` per D-13; forwards `onVisibility` down to Scene):
    ```svelte
    <script lang="ts">
      import { Canvas } from '@threlte/core';
      import Scene from './scene/Scene.svelte';
      let { onContextLost, onReady, onVisibility }: { onContextLost?: () => void; onReady?: () => void; onVisibility?: (onscreen: boolean) => void } = $props();
    </script>
    <Canvas renderMode="on-demand" dpr={[1, 2]}>
      <Scene {onContextLost} {onReady} {onVisibility} />
    </Canvas>
    ```
    Rules that are HERO-02/04 failures if broken: only files under `premium/` may import three/@threlte; PremiumHero must stay three-free; HeroScene and SceneCanvas carry NO scoped `<style>`; the Canvas is reachable only via the two nested `import()` hops. The D-07 gentle fade is a CONTEXT-COMPLIANCE requirement: HeroScene MUST toggle `.is-onscreen` (the opacity fade lives in app.css), not only pause the RAF loop.
  </action>
  <verify>
    <automated>npx svelte-check --tsconfig ./tsconfig.json 2>&1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "three\|@threlte" src/lib/components/premium/PremiumHero.svelte` returns 0 (gate stays three-free)
    - `grep -c "theme.current === 'premium'" src/lib/components/premium/PremiumHero.svelte` returns 1 AND `grep -c "notLowPower()" ...` returns 1 AND `grep -c "webglSupported()" ...` returns 1 AND `grep -c "prefersReducedMotion.current" ...` returns 1
    - `grep -c "import('./HeroScene.svelte')" src/lib/components/premium/PremiumHero.svelte` returns 1
    - `grep -c "import('./SceneCanvas.svelte')" src/lib/components/premium/HeroScene.svelte` returns 1
    - `grep -c "class:is-onscreen" src/lib/components/premium/HeroScene.svelte` returns 1 (D-07 fade class present — the "gentle fade" half of D-07)
    - `grep -c "onVisibility" src/lib/components/premium/HeroScene.svelte` returns >=1 AND `grep -c "onVisibility" src/lib/components/premium/SceneCanvas.svelte` returns >=1 (onscreen plumbed down to Scene)
    - `grep -c "<style" src/lib/components/premium/HeroScene.svelte src/lib/components/premium/SceneCanvas.svelte` returns 0 (no scoped style in either)
    - `grep -c "dpr={\[1, 2\]}" src/lib/components/premium/SceneCanvas.svelte` returns 1 AND `grep -c "renderMode=\"on-demand\"" ...` returns 1
    - `grep -c "aria-hidden=\"true\"" src/lib/components/premium/HeroScene.svelte` returns 1
    - `npx svelte-check` reports 0 errors from these files
  </acceptance_criteria>
  <done>Four-level boundary shell built: three-free gate reading the theme store + notLowPower, second-hop HeroScene (aria-hidden, no scoped style, toggles is-ready crossfade + is-onscreen scroll fade), SceneCanvas sole Canvas at dpr [1,2] on-demand; sceneReady/onReady/onContextLost/onVisibility plumbing complete.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: The Living Constellation scene (positions + Scene + Orbs + Connections + Lights)</name>
  <behavior>
    - Premium + capable → a single &lt;canvas&gt; mounts and stays visible (premium-hero.spec "canvas mounts, decorative")
    - The canvas wrapper is aria-hidden and not focusable (decorative guarantee)
    - Scroll the hero out of view → `.hero-scene` loses `.is-onscreen` and fades; scroll back → it restores (premium-dispose.spec "scroll fade + RAF pause", D-07)
    - Connection lines terminate exactly on visible orb centers (Orbs + Connections share one position source)
    - Nav Home↔About ×15 → no "too many active WebGL contexts" console error (premium-dispose.spec) — disposal works
    - Forced context loss → collapses to fallback without crashing, h1 intact
  </behavior>
  <read_first>
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\diversityincludesdisability_four\src\lib\components\premium\scene\Scene.svelte (the LIVE-VERIFIED disposal + running-gate + useTask skeleton to copy)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\diversityincludesdisability_four\src\lib\components\premium\scene\ParticleField.svelte (InstancedMesh + drift $effect + onDestroy dispose — re-author as periwinkle orbs)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\diversityincludesdisability_four\src\lib\components\premium\scene\Lights.svelte (light setup — re-author monochrome, drop the orange PointLight)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\diversityincludesdisability_one\src\lib\styles\theme-premium.css (locked periwinkle tokens the art mirrors)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\diversityincludesdisability_one\.planning\phases\05-premium-3d-hero\05-RESEARCH.md (§Scene Design + §Disposal — orb/connection/motion/light specifics and the exact onDestroy block)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\diversityincludesdisability_one\.planning\phases\05-premium-3d-hero\05-CONTEXT.md (D-01..D-08, D-11 art-direction decisions)
  </read_first>
  <files>src/lib/components/premium/scene/positions.ts, src/lib/components/premium/scene/Scene.svelte, src/lib/components/premium/scene/Orbs.svelte, src/lib/components/premium/scene/Connections.svelte, src/lib/components/premium/scene/Lights.svelte</files>
  <action>
    Create five files under `src/lib/components/premium/scene/`. Build `positions.ts` FIRST — it is the shared contract Orbs and Connections both implement against (interface-first ordering).

    `positions.ts` (the SINGLE position source — CREATE FIRST; this is the key-link that makes lines track orbs, D-03) — export exactly:
    ```ts
    import { Vector3 } from 'three';
    export interface OrbSeed { basePos: Vector3; driftPhase: number; size: number; }

    // Called ONCE (in Scene). Edge-banded random seeds implementing the exclusion zone (D-11):
    // x = ±(1.6 + rand*1.8) so |x| >= ~1.2 keeps the central text column clear; y/z spread modestly.
    export function makeOrbSeeds(count: number): OrbSeed[] { /* ... */ }

    // PURE drift: the world position of `seed` at `elapsed`. Slow sinusoidal orbit around basePos,
    // small ω (~0.3–0.5) for the 20–30s contemplative cycle (D-05/D-08). Writes into `out`, returns it.
    export function orbPositionAt(seed: OrbSeed, elapsed: number, out: Vector3): Vector3 { /* ... */ }
    ```
    Both Orbs and Connections MUST import from `./positions`. Do NOT recompute drift independently in either component — that divergence is exactly the bug the checker flagged (lines would drift off the visible orbs).

    `Scene.svelte` — copy `_four`'s Scene disposal skeleton VERBATIM, then adapt children + add onReady + onVisibility + parallax + the shared seed array:
      - `let { onContextLost, onReady, onVisibility }: { onContextLost?: () => void; onReady?: () => void; onVisibility?: (onscreen: boolean) => void } = $props();`
      - `const { renderer, invalidate } = useThrelte(); const canvas = renderer.domElement;`
      - `const COUNT = matchMedia('(max-width: 640px)').matches ? 20 : 40;` (D-04/D-13) and `import { makeOrbSeeds } from './positions'; const seeds = makeOrbSeeds(COUNT);` — computed ONCE, passed to BOTH children.
      - Running gate: `visible` (visibilitychange) AND `onscreen` (IntersectionObserver threshold 0 on canvas) → `running = () => visible && onscreen` (D-07 RAF pause). In the IO callback, ALSO call `onVisibility?.(onscreen)` on every change so HeroScene toggles `.is-onscreen` and the wrapper fades (D-07 gentle fade — the RAF pause is only HALF of D-07).
      - `webglcontextlost` listener → `e.preventDefault(); onContextLost?.()`.
      - Shared clock: `let elapsed = $state(0); useTask((delta) => { elapsed += delta; invalidate(); }, { running });`
      - onReady (D-17): fire `onReady?.()` exactly once on the first `useTask` tick (guard with a `let firstFrame = true;` flag) — this is the crossfade trigger.
      - Parallax tilt (D-06): only wire pointer if `!matchMedia('(pointer: coarse)').matches`; lerp a group rotation a few degrees (≈0.05 rad max) toward normalized pointer x/y; skip entirely on touch (D-13 mobile = no parallax). Wrap Orbs+Connections in a `<T.Group>` whose rotation you lerp in the useTask.
      - `<T.PerspectiveCamera makeDefault position={[0,0,6]} fov={50} />`, `<Lights />`, and the group with `<Orbs {seeds} {elapsed} />` + `<Connections {seeds} {elapsed} />` (both receive the SAME `seeds` array).
      - onDestroy: remove visibilitychange + webglcontextlost listeners, `io.disconnect()`, `try { renderer.dispose(); renderer.forceContextLoss(); } catch {}` (HERO-04 — copy `_four` verbatim).

    `Orbs.svelte` (D-01/D-02/D-04) — `let { seeds, elapsed = 0 }: { seeds: OrbSeed[]; elapsed?: number } = $props();` (seeds + `orbPositionAt` from `./positions`, shared with Connections). `InstancedMesh` of `seeds.length` over a small `SphereGeometry(0.05, 12, 12)`; `MeshStandardMaterial({ color: new Color('#7aa2ff'), emissive: new Color('#a9c2ff'), emissiveIntensity: 1.1 })` for periwinkle bodies with white-hot read. In an `$effect` on `elapsed`: for each seed `orbPositionAt(seed, elapsed, dummy.position)` (drift lives in positions.ts — do NOT reimplement it) + breathe scale `s = 1 + 0.06*Math.sin(elapsed*ω + seed.driftPhase)` (small ω ≈ 0.3–0.5 for the 20–30s cycle, D-05/D-08) + `dummy.scale.setScalar(seed.size * s)`; `dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix)`; `mesh.instanceMatrix.needsUpdate = true`. White-hot core: high emissiveIntensity is acceptable; a two-layer opaque-core + additive-halo look is Claude's discretion. `onDestroy(() => { geo.dispose(); mat.dispose(); })`.

    `Connections.svelte` (D-03, proximity graph) — `let { seeds, elapsed = 0 }: { seeds: OrbSeed[]; elapsed?: number } = $props();` — the SAME seed array Orbs receives. One `THREE.LineSegments` with a `BufferGeometry` pre-sized for max pairs `N*(N-1)/2 * 2` vertices (N=40 → ≤1560; negligible). Each frame (an `$effect` on `elapsed`): compute every orb's world position via `orbPositionAt(seed, elapsed, tmpVec)` (the SAME source as Orbs — this is why line endpoints land exactly on orb centers), walk unique pairs; for pairs within a distance threshold (Claude's-discretion tunable, e.g. ~1.4 world units) write both endpoints into the position attribute and a per-vertex alpha/color falling off with distance; `geometry.setDrawRange(0, activeVertexCount)`; `position.needsUpdate = true` (+ color attr). Material: `LineBasicMaterial({ transparent: true, vertexColors: true, blending: AdditiveBlending })` in the periwinkle range, low base opacity. `onDestroy(() => { geometry.dispose(); material.dispose(); })`.

    `Lights.svelte` (D-02 monochrome — NO orange) — `<T.AmbientLight intensity={0.35} />` + one or two low-intensity `<T.PointLight color="#7aa2ff" ... />`. Do NOT add the `_four` orange PointLight; monochrome periwinkle is locked.

    Decorative guarantee (non-negotiable, A11Y): the wrapper + canvas stay aria-hidden (from Task 1's HeroScene), pointer-events:none (app.css), no tabindex, no OrbitControls. All real content stays in +page.svelte's DOM.
  </action>
  <verify>
    <automated>npx svelte-check --tsconfig ./tsconfig.json 2>&1 | tail -5 && npm run build && node scripts/check-3d-boundary.mjs</automated>
  </verify>
  <acceptance_criteria>
    - All five files exist under `src/lib/components/premium/scene/`
    - `src/lib/components/premium/scene/positions.ts` exists AND `grep -c "orbPositionAt" src/lib/components/premium/scene/positions.ts` returns >=1 AND `grep -c "makeOrbSeeds" src/lib/components/premium/scene/positions.ts` returns >=1
    - `grep -c "from './positions'" src/lib/components/premium/scene/Orbs.svelte` returns 1 AND `grep -c "from './positions'" src/lib/components/premium/scene/Connections.svelte` returns 1 (BOTH read the ONE shared source — lines track orbs, D-03/key-link)
    - `grep -c "onVisibility" src/lib/components/premium/scene/Scene.svelte` returns >=1 (onscreen bubbled up for the D-07 gentle fade)
    - `grep -c "InstancedMesh" src/lib/components/premium/scene/Orbs.svelte` returns >=1 AND `grep -c "1 + 0.06" src/lib/components/premium/scene/Orbs.svelte` returns 1 (breathe formula)
    - `grep -c "#7aa2ff" src/lib/components/premium/scene/Orbs.svelte` returns >=1 (locked accent) AND `grep -ci "orange\|FF9E5E" src/lib/components/premium/scene/Lights.svelte` returns 0 (monochrome)
    - `grep -c "LineSegments" src/lib/components/premium/scene/Connections.svelte` returns >=1 AND `grep -c "setDrawRange" ...` returns 1 AND `grep -c "AdditiveBlending" ...` returns 1
    - `grep -c "forceContextLoss" src/lib/components/premium/scene/Scene.svelte` returns 1 AND `grep -c "IntersectionObserver" ...` returns 1 AND `grep -c "onReady" ...` returns >=1
    - `grep -rc "\.dispose()" src/lib/components/premium/scene/` shows Orbs, Connections, and Scene each call dispose
    - `npx svelte-check` clean; `npm run build` exits 0; `node scripts/check-3d-boundary.mjs` prints `OK: N premium chunk(s) split out` and exits 0 (test:no-three now GREEN — HERO-04 split proven)
  </acceptance_criteria>
  <done>The periwinkle constellation renders: 40/20 instanced white-core orbs on edge bands, a proximity LineSegments graph whose endpoints track the orbs via the shared positions.ts, monochrome lights, contemplative drift+breathe, optional parallax tilt, RAF pause + gentle fade offscreen (D-07 both halves), first-frame onReady, and full imperative disposal. Boundary gate GREEN.</done>
</task>

<task type="auto">
  <name>Task 3: Wire the hero into +page.svelte (full-bleed overlay, scrim, 85svh) + drive scene specs green</name>
  <read_first>
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\diversityincludesdisability_one\src\routes\+page.svelte (the shipped hero markup + <style> — you ADD layers, text nodes stay EXACTLY as-is)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\diversityincludesdisability_one\src\lib\styles\app.css (owns .hero-scene; you add .hero stacking + scrim + 85svh in +page.svelte scoped style)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\diversityincludesdisability_one\.planning\phases\05-premium-3d-hero\05-RESEARCH.md (§Hero Composition — z-order stack, 85svh premium-only, scrim + exclusion zone for AA)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\diversityincludesdisability_one\.planning\phases\05-premium-3d-hero\05-CONTEXT.md (D-10/D-11/D-12/D-15)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\diversityincludesdisability_one\playwright.theme.config.ts (harness; see Windows self-managed-preview note below)
  </read_first>
  <files>src/routes/+page.svelte</files>
  <action>
    Edit `src/routes/+page.svelte`. DO NOT change the h1, lede, disclaimer, or CTA text nodes (locked Phase-3 content). Add:
    1. `import PremiumHero from '$lib/components/premium/PremiumHero.svelte';` — a STATIC import (PremiumHero is three-free, safe in the entry). Do NOT import three/@threlte here.
    2. Inside `<section class="hero">`, add as the FIRST children (behind the text): `<PremiumHero />` (renders the `.hero-scene` overlay, z-index 1 from app.css) and a scrim element `<div class="hero__scrim" aria-hidden="true"></div>` (z-index 2). The existing text block sits above (z-index 3).
    3. In the `<style>` block:
       - `.hero { position: relative; isolation: isolate; }` and ensure the text content is positioned `z-index: 3` (wrap existing text in a `.hero__content { position: relative; z-index: 3; }` container, or set z-index on the children — text unchanged, only wrapper/positioning added).
       - `.hero__scrim`: a soft radial/linear darkening behind the text column guaranteeing AA — e.g. `position:absolute; inset:0; z-index:2; pointer-events:none; background: radial-gradient(ellipse at center, rgba(15,16,32,0.72) 0%, rgba(15,16,32,0.35) 60%, transparent 100%);` (values are Claude's discretion as long as AA holds; Premium text `#f6f4f2` on `#0f1020` is ~17:1 — the scrim preserves margin where orbs overlap).
       - Premium-only 85svh (D-12, Accessible untouched): `:global(:root[data-theme='premium']) .hero { min-block-size: 85svh; display: flex; flex-direction: column; justify-content: center; }`. Handle short/landscape viewports (Claude's discretion), e.g. `@media (max-height: 32rem) { :global(:root[data-theme='premium']) .hero { min-block-size: auto; } }` so the CTA never scrolls off.
    4. Confirm the scrim + PremiumHero only visually affect Premium: the `.hero-scene` only mounts in Premium (gate), and Accessible renders NO poster/image (D-15) and keeps its compact text hero. The scrim is inert (transparent-to-content) but only meaningful behind the 3D — acceptable as always-present since text contrast is unaffected in Accessible.
    5. Drive the scene specs GREEN using the Windows-safe harness (Pitfall 6 — managed webServer hangs at teardown on this box):
       - In one shell: `npm run build && npm run preview -- --port 4173 --strictPort` (leave running; curl `http://localhost:4173/` to confirm it serves).
       - In another: `npx playwright test --config playwright.theme.config.ts e2e/premium-hero.spec.ts e2e/premium-bundle.spec.ts e2e/premium-dispose.spec.ts` (config `reuseExistingServer` picks up the running preview).
       - Then stop the preview (taskkill the node/vite tree). Do NOT commit any throwaway config.
       Target: the accessible-branch, premium-canvas-mount, bundle, dispose, AND the D-07 scroll-fade assertion (in premium-dispose.spec.ts) pass. (The reduced-motion POSTER assertion and the accessible NO-poster-image assertion depend on the poster from Plan 05-03 — those two remain RED here and are 05-03's drive-green target; note that explicitly in the SUMMARY.)
  </action>
  <verify>
    <automated>npm run build && node scripts/check-3d-boundary.mjs && npx playwright test --config playwright.theme.config.ts e2e/premium-bundle.spec.ts e2e/premium-dispose.spec.ts</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "import PremiumHero" src/routes/+page.svelte` returns 1 AND `grep -c "<PremiumHero" src/routes/+page.svelte` returns 1
    - `grep -c "three\|@threlte" src/routes/+page.svelte` returns 0 (entry stays three-free)
    - `grep -c "hero__scrim" src/routes/+page.svelte` returns >=2 (element + style) AND `grep -c "85svh" src/routes/+page.svelte` returns 1
    - The h1/lede/disclaimer/CTA text content is byte-identical to the pre-edit version (diff shows only additions: import, PremiumHero, scrim, wrapper/positioning, style rules)
    - `node scripts/check-3d-boundary.mjs` exits 0 (`OK: ... home bundle is WebGL-free`) — HERO-04 split holds after wiring
    - `e2e/premium-bundle.spec.ts` and `e2e/premium-dispose.spec.ts` pass (HERO-02 lazy-load + HERO-04 no-leak / context-loss + D-07 scroll-fade assertion)
    - `e2e/premium-hero.spec.ts` "canvas mounts, decorative" passes (poster-dependent assertions may remain RED until 05-03 — documented)
  </acceptance_criteria>
  <done>The constellation is a full-bleed decorative background behind the untouched hero text, with a scrim + 85svh Premium sizing (Accessible untouched); three stays split (boundary GREEN); the bundle + dispose (incl. D-07 fade) + canvas-mount specs are green.</done>
</task>

</tasks>

<verification>
- `npm run build` exits 0; `node scripts/check-3d-boundary.mjs` prints `OK: N premium chunk(s) split out; home bundle is WebGL-free` and exits 0 (HERO-04 split GREEN — was RED in 05-01).
- `npx svelte-check` clean across all 7 premium components + the shared positions.ts + +page.svelte.
- Premium canvas-mount, bundle-network, and dispose (incl. the D-07 scroll-fade) specs pass via the self-managed preview.
- `grep -c "three\|@threlte" src/routes/+page.svelte src/lib/components/premium/PremiumHero.svelte` returns 0 (both stay three-free).
- D-07 fully honored: `grep -c "class:is-onscreen" src/lib/components/premium/HeroScene.svelte` returns 1 (fade) AND Scene bubbles `onVisibility` (RAF pause + fade).
- Orbs and Connections both import `./positions` (lines track orbs).
- Hero h1/lede/CTA text unchanged.
</verification>

<success_criteria>
Premium + WebGL + motion + not-low-power mounts a performant periwinkle constellation canvas (HERO-01); the gate composes theme + reduced-motion + WebGL + notLowPower + context-lost and lazy-imports only then (HERO-02); three/@threlte is code-split out of the Accessible/Home entry and the renderer disposes cleanly across 15 nav cycles (HERO-04). D-07 is fully implemented — the constellation gently fades AND pauses rendering as it leaves the viewport, restoring on re-entry. Connection lines track the visible orbs via a single shared position source (D-03). Poster-dependent fallback assertions are handed to 05-03.
</success_criteria>

<output>
After completion, create `.planning/phases/05-premium-3d-hero/05-02-SUMMARY.md`. Record which premium-hero.spec assertions remain RED pending the 05-03 poster.
</output>
</content>
</invoke>
