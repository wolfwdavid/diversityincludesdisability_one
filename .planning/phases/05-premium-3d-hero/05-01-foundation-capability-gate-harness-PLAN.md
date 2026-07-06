---
phase: 05-premium-3d-hero
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - src/lib/a11y/prefers.svelte.ts
  - scripts/check-3d-boundary.mjs
  - src/lib/styles/app.css
  - e2e/premium-hero.spec.ts
  - e2e/premium-bundle.spec.ts
  - e2e/premium-dispose.spec.ts
autonomous: true
requirements: [HERO-02, HERO-04, A11Y-05]
must_haves:
  truths:
    - "The capability gate module exports reactive reduced-motion, synchronous WebGL detection, and synchronous low-power detection"
    - "A build-grep boundary script exists, is wired as npm run test:no-three, and fails loudly (RED) while no premium chunk is split"
    - "The always-loaded stylesheet owns .hero-scene positioning + the 800ms crossfade (D-17) + the scroll-out fade selector (.is-ready.is-onscreen, D-07) so no scene component needs a scoped style block"
    - "Three Playwright specs for the hero capability branches are authored, type-clean, and listable"
  artifacts:
    - path: "src/lib/a11y/prefers.svelte.ts"
      provides: "prefersReducedMotion (reactive $state), webglSupported(), notLowPower() — imports ONLY $app/environment"
      exports: ["prefersReducedMotion", "webglSupported", "notLowPower"]
      contains: "notLowPower"
    - path: "scripts/check-3d-boundary.mjs"
      provides: "content-based bundle-split proof (premium chunk exists AND home entry references none)"
      contains: "@threlte|WebGLRenderer|three\\.module"
    - path: "src/lib/styles/app.css"
      provides: ".hero-scene positioning + 800ms opacity crossfade (D-17) + scroll-out fade selector (.is-ready.is-onscreen, D-07)"
      contains: ".hero-scene"
    - path: "e2e/premium-hero.spec.ts"
      provides: "capability-branch specs (accessible no-canvas-no-poster, reduced-motion poster-no-canvas, premium canvas-mounts-decorative)"
      contains: "did:theme"
  key_links:
    - from: "package.json"
      to: "scripts/check-3d-boundary.mjs"
      via: "npm script test:no-three"
      pattern: "test:no-three"
    - from: "src/lib/a11y/prefers.svelte.ts"
      to: "$app/environment"
      via: "the ONLY import (never three/@threlte)"
      pattern: "\\$app/environment"
---

<objective>
Lay the three-free foundation for the Premium 3D hero: install the Threlte/Three stack, create the capability gate (reduced-motion + WebGL + low-power), copy the build-grep boundary proof from sibling `_four` and wire it as an npm script, add the always-loaded `.hero-scene` positioning + 800ms crossfade + D-07 scroll-fade CSS, and author the three Playwright capability-branch specs as the RED drive-green target for Plans 05-02/05-03.

Purpose: Nyquist Wave 0 for this phase — every downstream task verifies against gates that MUST exist first. The capability gate and the boundary script are the load-bearing HERO-02/HERO-04/A11Y-05 machinery; the scene is useless without them.
Output: Installed deps, `src/lib/a11y/prefers.svelte.ts`, `scripts/check-3d-boundary.mjs` + `test:no-three`, `.hero-scene` CSS, three authored e2e specs (RED).
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/05-premium-3d-hero/05-CONTEXT.md
@.planning/phases/05-premium-3d-hero/05-RESEARCH.md
@.planning/phases/05-premium-3d-hero/05-VALIDATION.md

<interfaces>
<!-- Contracts the executor needs. Use these directly; do not re-derive. -->

Theme store — src/lib/theme/theme.svelte.ts (already shipped, DO NOT modify):
```typescript
export type Theme = 'premium' | 'accessible';
export const THEME_KEY = 'did:theme';   // localStorage key; app.html inline script reads it pre-paint → sets data-theme
export const theme;                       // theme.current === 'premium' | 'accessible' (runes $state)
```
The app.html inline script sets `document.documentElement.dataset.theme` before first paint from `localStorage['did:theme']`; the runes store adopts that attr at hydration.

Premium locked tokens — src/lib/styles/theme-premium.css (DO NOT modify):
bg `#0f1020`, surface `#1a1b2e`, text `#f6f4f2`, accent `#7aa2ff`, accent-hover `#a9c2ff`,
`--motion-ease: var(--ease-emphasized)`, `--motion-duration-slow: var(--dur-slow)`.

Existing static-scan script shape to mirror — scripts/assert-no-shiki-chunk.mjs (walk build/_app, grep, exit 1).
Existing npm scripts already present: test:no-shiki, test:no-secret, test:e2e (playwright --config playwright.theme.config.ts).
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install Threlte stack + author the capability gate (prefers.svelte.ts)</name>
  <read_first>
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\diversityincludesdisability_one\package.json (current deps/scripts — you are adding to these)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\diversityincludesdisability_four\src\lib\a11y\prefers.svelte.ts (the proven reduced-motion + webglSupported source to copy, then EXTEND with notLowPower)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\diversityincludesdisability_one\.planning\phases\05-premium-3d-hero\05-RESEARCH.md (§Capability Gate — the notLowPower reference implementation and fail-open rationale)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\diversityincludesdisability_one\src\lib\theme\theme.svelte.ts (browser-guard prerender-safe pattern to match)
  </read_first>
  <files>package.json, src/lib/a11y/prefers.svelte.ts</files>
  <action>
    1. Verify registry versions first (training data may be stale): run `npm view three version` (expect 0.185.1), `npm view @threlte/core version` (expect 8.5.16), `npm view @types/three version` (expect 0.185.0). If a version drifted, use the current published one and note it in the SUMMARY.
    2. Install with npm (this repo uses npm + package-lock.json, NOT pnpm — do not create pnpm files):
       `npm install three@0.185.1 @threlte/core@8.5.16`
       `npm install -D @types/three@0.185.0`
       Do NOT install `@threlte/extras` — intentionally omitted this phase (adds focus-trap/pointer-capture risk to a decorative aria-hidden scene).
    3. Create `src/lib/a11y/prefers.svelte.ts`. Copy the `_four` file verbatim (reactive `PrefersReducedMotion` class exporting `prefersReducedMotion`, and memoized `webglSupported()`), then ADD the synchronous fail-open `notLowPower()`:
       ```ts
       let _lowPowerOk: boolean | null = null;
       export function notLowPower(): boolean {
         if (!browser) return false;                       // SSR: no scene
         if (_lowPowerOk !== null) return _lowPowerOk;
         const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
         const lowMemory = typeof nav.deviceMemory === 'number' && nav.deviceMemory < 4;      // <4GB (Chromium-only)
         const fewCores  = typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 2;
         const saveData  = nav.connection?.saveData === true;                                 // Data Saver on
         _lowPowerOk = !(lowMemory || fewCores || saveData);                                  // fail-open: absent APIs → capable
         return _lowPowerOk;
       }
       ```
       Keep the module's ONLY import `import { browser } from '$app/environment'`. It must NEVER import three/@threlte — it lives in the Accessible graph and is the three-free gate's dependency.
    4. Keep the low-power thresholds (`< 4`, `<= 2`, `saveData`) as the single tunable block with a comment marking them MEDIUM-confidence / field-tunable (STATE.md research flag).
  </action>
  <verify>
    <automated>npm ls three @threlte/core @types/three && npx svelte-check --tsconfig ./tsconfig.json 2>&1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - `npm ls three` reports `three@0.185.1` and `npm ls @threlte/core` reports `@threlte/core@8.5.16` (or the noted current version if drift occurred)
    - `grep -c "@threlte/extras" package.json` returns 0 (extras NOT installed)
    - `src/lib/a11y/prefers.svelte.ts` exists and `grep -E "export (const prefersReducedMotion|function webglSupported|function notLowPower)" src/lib/a11y/prefers.svelte.ts` matches all three
    - `grep -c "three\|@threlte" src/lib/a11y/prefers.svelte.ts` returns 0 (module stays three-free)
    - `grep -c "\$app/environment" src/lib/a11y/prefers.svelte.ts` returns >=1
    - `npx svelte-check` reports 0 errors introduced by this file
  </acceptance_criteria>
  <done>Threlte/Three installed at pinned versions (npm); `prefers.svelte.ts` exports reduced-motion + webglSupported + notLowPower, imports only $app/environment, type-clean.</done>
</task>

<task type="auto">
  <name>Task 2: Copy the boundary proof + wire test:no-three + add .hero-scene crossfade + scroll-fade CSS</name>
  <read_first>
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\diversityincludesdisability_four\scripts\check-3d-boundary.mjs (copy VERBATIM — same adapter-static, same build/index.html entry, same build/_app/immutable layout)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\diversityincludesdisability_one\scripts\assert-no-shiki-chunk.mjs (the existing static-scan npm-script shape to mirror)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\diversityincludesdisability_one\src\lib\styles\app.css (you append to this; it is the always-loaded home stylesheet)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\diversityincludesdisability_one\.planning\phases\05-premium-3d-hero\05-RESEARCH.md (§Lazy-Import Boundary — why .hero-scene positioning MUST live in an always-loaded stylesheet, and the 800ms crossfade D-17; §Motion D-07 — the scroll-out fade toggled by .is-onscreen)
  </read_first>
  <files>scripts/check-3d-boundary.mjs, package.json, src/lib/styles/app.css</files>
  <action>
    1. Copy `_four`'s `scripts/check-3d-boundary.mjs` verbatim to `scripts/check-3d-boundary.mjs`. It scans `build/_app/immutable` for chunks whose CONTENT matches `/@threlte|WebGLRenderer|three\.module/`, asserts >=1 exists (premium chunk split), then parses `build/index.html` (the prerendered Accessible/Home entry) and asserts none of its referenced `_app/immutable/*.js` chunks is a premium chunk. No edits needed — it is repo-layout-agnostic.
    2. Add to `package.json` scripts, next to `test:no-shiki`: `"test:no-three": "node scripts/check-3d-boundary.mjs"`.
    3. Append to `src/lib/styles/app.css` the always-loaded `.hero-scene` rules (owning positioning + the D-17 800ms crossfade AND the D-07 scroll fade so HeroScene/SceneCanvas can carry NO scoped `<style>`). Note the visible selector is `.is-ready.is-onscreen` — the wrapper is opaque ONLY once the first frame has painted (is-ready, D-17) AND the hero is on-screen (is-onscreen, D-07); scrolling the hero out removes is-onscreen → gentle fade to 0 while the RAF loop is paused; scrolling back restores both:
       ```css
       /* Premium 3D hero background layer. Positioning lives HERE (always-loaded) so the scene
          components need no scoped <style> — that is the four-level CSS-leak fix (see 05-RESEARCH). */
       .hero-scene {
         position: absolute; inset: 0; z-index: 1;
         pointer-events: none;                 /* decorative; never captures input */
         opacity: 0;                           /* poster shows through until first frame */
         transition: opacity 800ms var(--motion-ease);   /* D-17 crossfade AND D-07 scroll fade */
       }
       /* Visible only once the first frame painted (is-ready, D-17) AND the hero is on-screen
          (is-onscreen, D-07). HeroScene toggles both classes; Scene bubbles onscreen up. */
       .hero-scene.is-ready.is-onscreen { opacity: 1; }
       @media (prefers-reduced-motion: reduce) { .hero-scene { transition: none; } }
       ```
    4. Run `npm run build` then `npm run test:no-three`. It is EXPECTED to exit 1 with `FAIL: no three/@threlte chunk found` — that is the correct RED baseline (no scene imports three yet; Plan 05-02 drives it green). Confirm the message, do not "fix" it.
  </action>
  <verify>
    <automated>npm run build && (node scripts/check-3d-boundary.mjs; echo "exit=$?")</automated>
  </verify>
  <acceptance_criteria>
    - `scripts/check-3d-boundary.mjs` exists and `grep -c "@threlte|WebGLRenderer|three\\.module" scripts/check-3d-boundary.mjs` returns >=1
    - `grep -c "\"test:no-three\": \"node scripts/check-3d-boundary.mjs\"" package.json` returns 1
    - `grep -c "\.hero-scene" src/lib/styles/app.css` returns >=1 AND `grep -c "transition: opacity 800ms" src/lib/styles/app.css` returns 1
    - `grep -c "\.hero-scene.is-ready.is-onscreen" src/lib/styles/app.css` returns 1 (D-07 scroll-fade selector present — the always-loaded home of the gentle fade)
    - `node scripts/check-3d-boundary.mjs` exits non-zero AND prints `no three/@threlte chunk found` (the intended RED baseline before the scene exists)
    - `npm run build` exits 0 (site still builds static)
  </acceptance_criteria>
  <done>Boundary proof copied + wired as test:no-three (RED as expected); app.css owns .hero-scene positioning + the 800ms crossfade + the D-07 scroll-fade selector (.is-ready.is-onscreen); build still green.</done>
</task>

<task type="auto">
  <name>Task 3: Author the three capability-branch Playwright specs (RED drive-green targets)</name>
  <read_first>
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\diversityincludesdisability_four\tests\premium-3d.spec.ts (the proven spec set — adapt store key + REMOVE axe)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\diversityincludesdisability_one\playwright.theme.config.ts (testDir 'e2e', baseURL http://localhost:4173/, reuseExistingServer)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\diversityincludesdisability_one\e2e\theme.spec.ts (existing local-preview spec conventions in THIS repo)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\diversityincludesdisability_one\.planning\phases\05-premium-3d-hero\05-RESEARCH.md (§Validation Architecture — the exact test blueprints + the did:theme / no-data-hydrated / no-axe deltas; §Motion D-07 — the scroll-fade assertion)
  </read_first>
  <files>e2e/premium-hero.spec.ts, e2e/premium-bundle.spec.ts, e2e/premium-dispose.spec.ts</files>
  <action>
    Author three specs in `e2e/`. Adapt `_four`'s `tests/premium-3d.spec.ts` with these MANDATORY `_one` deltas: (a) seed via `localStorage['did:theme']` NOT `did-mode`; (b) there is NO `data-hydrated` attribute in `_one` — wait on the canvas locator directly (it appears only after the async `import()` resolves), never on a hydration flag; (c) NO axe — remove all `@axe-core/playwright` imports/usage (axe is Phase 6); (d) use relative `goto('./')`; (e) pin `page.emulateMedia({ reducedMotion })` explicitly in every spec for determinism. Seed helper: `page.addInitScript((t) => localStorage.setItem('did:theme', t), 'premium'|'accessible')`.

    `e2e/premium-hero.spec.ts` (HERO-01/02/03 + A11Y-05 capability branches):
      - "accessible: no canvas, NO poster, content present" → seed 'accessible', goto('./'); expect `canvas` count 0; expect `.hero picture, .hero img` count 0 (D-15 — Accessible renders no image); expect `h1` visible.
      - "A11Y-05 premium + reduced-motion: poster, zero canvas, no three chunk" → seed 'premium', `emulateMedia({ reducedMotion: 'reduce' })`, capture `.js` response bodies; expect `.hero picture, .hero img` visible (poster); expect `canvas` count 0; expect no body matches `/@threlte|THREE\.WebGLRenderer/`.
      - "HERO-01 premium + motion + capable: canvas mounts, decorative" → seed 'premium', `emulateMedia({ reducedMotion: 'no-preference' })`; expect `canvas` visible ({ timeout: 10_000 } — appears only after async import); expect `.hero-scene` has attribute `aria-hidden="true"`; assert the canvas/wrapper is not tabbable (no tabindex; pointer-events none via the aria-hidden wrapper).

    `e2e/premium-bundle.spec.ts` (HERO-02/04 runtime network proof):
      - "accessible downloads zero three chunks" → seed 'accessible', goto with `waitUntil: 'networkidle'`; expect `canvas` count 0; expect no captured `.js` body matches `/@threlte|THREE\.WebGLRenderer/`.
      - "premium+motion downloads a three chunk and mounts a canvas" → seed 'premium', motion no-preference; expect `canvas` visible; `expect.poll(() => bodies.some((b) => /@threlte|THREE\.WebGLRenderer/.test(b)), { timeout: 5_000 }).toBe(true)`.

    `e2e/premium-dispose.spec.ts` (HERO-04 leak + context loss + D-07 scroll fade):
      - "nav Home↔About ×15 disposes cleanly, no WebGL context console errors" → seed 'premium', motion no-preference; listen on `console` for `/too many active webgl|context lost/i`; loop 15×: expect canvas visible, click About link, expect URL `/about/?$`, expect canvas count 0, `page.goBack()`; expect zero collected errors.
      - "forced context loss → poster fallback, no crash, h1 intact" → seed 'premium', motion no-preference; expect canvas visible; `page.evaluate()` to `getExtension('WEBGL_lose_context')?.loseContext()`; expect `.hero picture, .hero img` visible; expect `h1` visible.
      - "D-07: scrolling the hero out of view fades + pauses the scene" → seed 'premium', motion no-preference; expect `canvas` visible and `.hero-scene` to have class matching `/is-onscreen/`; scroll the hero fully out of view (`page.mouse.wheel(0, 2000)`, or scroll a lower section/footer into view); `await expect(page.locator('.hero-scene')).not.toHaveClass(/is-onscreen/)` (gentle fade + RAF pause, D-07); scroll back to top (`page.mouse.wheel(0, -2000)`); expect `.hero-scene` to regain `is-onscreen`. NOTE: this asserts BOTH halves of D-07 — the fade class, not just the RAF pause.

    These specs reference selectors (`canvas`, `.hero-scene`, `.hero picture`) and classes (`is-onscreen`) that do not exist yet — they are the RED drive-green target for 05-02/05-03. Wave-1 acceptance is ONLY that they are authored, type/lint-clean, and listable.
  </action>
  <verify>
    <automated>npx playwright test --config playwright.theme.config.ts --list e2e/premium-hero.spec.ts e2e/premium-bundle.spec.ts e2e/premium-dispose.spec.ts</automated>
  </verify>
  <acceptance_criteria>
    - All three files exist under `e2e/` and `--list` enumerates them without a parse/type error
    - `grep -rc "did:theme" e2e/premium-hero.spec.ts e2e/premium-bundle.spec.ts e2e/premium-dispose.spec.ts` shows each seeds the `did:theme` key
    - `grep -rc "axe\|@axe-core\|data-hydrated" e2e/premium-*.spec.ts` returns 0 across all three (no axe, no hydration-flag wait)
    - `grep -c "reducedMotion" e2e/premium-hero.spec.ts` returns >=2 (branch determinism pinned)
    - `grep -c "picture, .hero img\|.hero picture" e2e/premium-hero.spec.ts` returns >=2 (poster/no-poster branches present)
    - `grep -c "is-onscreen" e2e/premium-dispose.spec.ts` returns >=1 (D-07 scroll-fade assertion authored — the gentle-fade half of D-07)
  </acceptance_criteria>
  <done>Three capability-branch specs authored (did:theme key, no axe, no data-hydrated wait, pinned reducedMotion, D-07 scroll-fade assertion), type-clean and listable — the RED target for the scene and poster plans.</done>
</task>

</tasks>

<verification>
- `npm ls three @threlte/core @types/three` shows pinned versions; `@threlte/extras` absent.
- `npm run build` exits 0; `node scripts/check-3d-boundary.mjs` exits 1 with "no three/@threlte chunk found" (intended RED).
- `npx svelte-check` clean.
- `npx playwright test --config playwright.theme.config.ts --list e2e/premium-*.spec.ts` lists all branch specs.
- `src/lib/a11y/prefers.svelte.ts` imports only `$app/environment`; `src/lib/styles/app.css` contains `.hero-scene` + `transition: opacity 800ms` + `.hero-scene.is-ready.is-onscreen`.
</verification>

<success_criteria>
Threlte/Three installed (npm, pinned); capability gate (reduced-motion + WebGL + notLowPower) three-free and type-clean; boundary proof wired as `test:no-three` at its RED baseline; `.hero-scene` crossfade + D-07 scroll-fade CSS in the always-loaded stylesheet; three capability-branch specs authored and listable (incl. the D-07 fade assertion) — Wave 0 complete, downstream plans have their gates.
</success_criteria>

<output>
After completion, create `.planning/phases/05-premium-3d-hero/05-01-SUMMARY.md`.
</output>
</content>
</invoke>
