---
phase: 02-design-system-dual-theme
plan: 02
subsystem: ui
tags: [theming, no-flash, fouc, svelte-runes, localstorage, ssr-safe, prerender, accessible-first, adapter-static]

# Dependency graph
requires:
  - phase: 02-design-system-dual-theme
    plan: 01
    provides: "Three-layer CSS token architecture with :root[data-theme='premium'|'accessible'] peer themes; Vitest jsdom + local-preview Playwright harness; RED theme.test.ts + THEME spec"
provides:
  - "Blocking synchronous inline theme-init script in app.html — sets <html data-theme> before first paint (no FOUC)"
  - "Accessible-first paint-time defaulting from prefers-reduced-motion + prefers-contrast: more (first visit only)"
  - "Namespaced localStorage key 'did:theme' read at boot; explicit stored choice wins over signals"
  - "SSR/prerender-safe runes singleton theme.svelte.ts (current/set/toggle/THEME_KEY) reconciled from the DOM attribute"
  - "Single source of truth for theme state that 02-03's ThemeToggle and Phase-5's hero gate import directly"
affects: [02-03-accessible-theme-toggle, phase-5-premium-hero]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Classic synchronous inline <script> as first child of <head> (no module/defer/async) = canonical anti-FOUC on a static/prerendered host"
    - "Runes .svelte.ts singleton browser-guarded via $app/environment; initial() reconciles from document.documentElement.dataset.theme so hydrated state matches pre-paint attribute"
    - "Paint-time default decided ONLY by cheap synchronous media queries; expensive/async/non-portable capability signals (WebGL/Battery/deviceMemory/saveData) excluded from the theme decision"
    - "Origin-namespaced localStorage key (did:theme) to avoid cross-project collision on wolfwdavid.github.io"

key-files:
  created:
    - src/lib/theme/theme.svelte.ts
  modified:
    - src/app.html

key-decisions:
  - "THEME-05 paint-time defaulting uses prefers-reduced-motion + prefers-contrast: more ONLY; no-WebGL/low-power deferred to the Phase-5 hero MOUNT gate (poster fallback), never the theme"
  - "Inline script is classic + synchronous (no type=module/defer/async) and inline (not external) so it is guaranteed-blocking and base-path-immune"
  - "SSR/prerender default is 'accessible' (safe); the client store reconciles to the real value from the DOM attribute at hydration"

patterns-established:
  - "Anti-FOUC inline-script-in-app.html + browser-guarded runes store reconciled from the DOM attribute"

requirements-completed: [THEME-02, THEME-04, THEME-05]

# Metrics
duration: 6min
completed: 2026-07-05
---

# Phase 2 Plan 02: No-Flash Init & Store Summary

**A classic synchronous blocking inline script in `app.html` that sets `<html data-theme>` before first paint — reading the namespaced `localStorage['did:theme']` first, then `prefers-reduced-motion`/`prefers-contrast: more` to default assistive-signal visitors to Accessible — plus an SSR/prerender-safe Svelte 5 runes singleton (`theme.svelte.ts`) that reconciles its state from that DOM attribute and persists `set()`/`toggle()` to both the attribute and localStorage; unit + no-flash/accessible-first/persistence E2E slices now green and `npm run build` stays green.**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-07-05T00:49:23Z
- **Completed:** 2026-07-05T00:54:58Z
- **Tasks:** 2
- **Files created:** 1 · **Files modified:** 1

## Accomplishments

- **No-flash (THEME-04):** `app.html` gains a classic synchronous inline `<script>` as the first child of `<head>` (before `%sveltekit.head%`) that sets `document.documentElement.dataset.theme` during HTML parse, before any styled content paints. No `type="module"`, no `defer`/`async` (all of which run post-parse → guaranteed flash). Inline (not external) so it needs no `%sveltekit.assets%` prefix and cannot be delayed by a network round-trip — base-path-immune.
- **Accessible-first defaulting (THEME-05):** on a first visit (no stored choice) the paint-time default is `accessible` when `prefers-reduced-motion: reduce` OR `prefers-contrast: more` matches, else `premium`. Both are cheap, synchronous, portable media queries.
- **Persistence + explicit-choice precedence (THEME-02):** the script reads the namespaced `localStorage['did:theme']` FIRST; a stored `'premium'|'accessible'` wins over any OS signal and survives reload / return visits. A `try/catch` sets a safe `accessible` fallback if `localStorage`/`matchMedia` throw.
- **SSR/prerender-safe runes store:** `src/lib/theme/theme.svelte.ts` is a browser-guarded runes singleton exposing `current` (`$state<Theme>`), `set()`, `toggle()`, and `THEME_KEY`. Under prerender (`!browser`) `initial()` returns the constant `'accessible'` without touching `window`/`document`; in the browser it reconciles from `document.documentElement.dataset.theme` (the value the inline script set), so hydrated state matches the pre-painted attribute — no flash on the store either. `set()`/`toggle()` mirror both the DOM attribute and `localStorage`, swallowing storage failures (private mode) while still updating state.
- **Test slices flipped green:** `test:unit` (2 tests, THEME-01/02 store logic — was RED-by-design after 02-01) passes; the `no flash | accessible-first | persists` Playwright slices (THEME-04, THEME-05, THEME-02) pass; `npm run build` exits 0 (no "window is not defined" prerender crash).

## Exact paint-time default-decision algorithm shipped (`app.html`)

```
1. stored = localStorage.getItem('did:theme')
2. if stored === 'premium' | 'accessible'  → theme = stored            (explicit choice wins; STOP)
3. else  reduce       = matchMedia('(prefers-reduced-motion: reduce)').matches
         moreContrast = matchMedia('(prefers-contrast: more)').matches
         theme = (reduce || moreContrast) ? 'accessible' : 'premium'
4. document.documentElement.dataset.theme = theme
   (any throw → catch → dataset.theme = 'accessible')
```

## Key contract (consumed by 02-03 + Phase 5)

```ts
// src/lib/theme/theme.svelte.ts
export type Theme = 'premium' | 'accessible';
export const THEME_KEY = 'did:theme';
export const theme: { current: Theme; set(next: Theme): void; toggle(): void };
```

- **Key parity confirmed:** the namespaced key is `'did:theme'` in BOTH `app.html` (`var KEY = 'did:theme'`) and `theme.svelte.ts` (`export const THEME_KEY = 'did:theme'`), so the store reads exactly what the inline script wrote.
- **Browser-guard approach:** `import { browser } from '$app/environment'`; `initial()` returns the `DEFAULT` constant when `!browser`; `set()` early-returns before any `document`/`localStorage` access when `!browser`. No `window`/`document`/`localStorage` at module top level.

## Test slices now green

- `npm run test:unit` → `vitest run src/lib/theme` → **2 passed** (toggle mirrors `<html data-theme>` — THEME-01; `set()` persists to `localStorage['did:theme']` — THEME-02).
- `npx playwright test --config playwright.theme.config.ts -g "no flash|accessible-first|persists"` → **3 passed** (THEME-04 pre-paint attribute; THEME-05 reduced-motion → accessible; THEME-02 persists across reload).
- `npm run build` → exits 0, adapter-static wrote `build/` (no prerender window crash).
- **Still RED by design → 02-03:** the `toggle a11y` E2E slice (THEME-01/06) needs the `ThemeToggle` component + `+layout.svelte` mount, explicitly out of scope here (scope fence).

## Task Commits

1. **Task 1: Blocking inline theme-init script in app.html (THEME-04, THEME-05)** - `740f32a` (feat)
2. **Task 2: SSR/prerender-safe runes store theme.svelte.ts (THEME-02) + flip store/E2E slices green** - `b1bc544` (feat)

**Plan metadata:** _(final docs commit — see below)_

## Files Created/Modified

- `src/app.html` - Added the classic synchronous inline theme-init script as the first child of `<head>`; preserved charset/viewport/`text-scale` meta and the `%sveltekit.head%`/`%sveltekit.body%` shell.
- `src/lib/theme/theme.svelte.ts` - New browser-guarded runes singleton: `Theme` type, `THEME_KEY`, `initial()` reconciler, `ThemeStore` class with `current`/`set()`/`toggle()`, exported `theme`.

## Decisions Made

- **THEME-05 signal scope (logged to STATE.md):** paint-time defaulting uses `prefers-reduced-motion` + `prefers-contrast: more` ONLY. no-WebGL / low-power are deliberately EXCLUDED from the theme default — synchronous WebGL probing blocks first paint, the Battery API is deprecated/async, and `deviceMemory`/`saveData` are Chromium-only — and are instead honored at the Phase-5 hero MOUNT gate (poster fallback), never the theme. No CONTEXT.md authorized this narrowing; it is recorded explicitly per 02-RESEARCH.md "Signal Detection" so it stays traceable and never reads as a silently-dropped requirement.
- **Inline + classic + synchronous** over external/module/deferred: the only guaranteed-blocking, base-path-immune anti-FOUC form on a static/prerendered Pages host.
- **SSR/prerender default = `'accessible'`**, reconciled from the DOM attribute at hydration, so the prerendered HTML and hydrated app agree without a store-level flash.

## Deviations from Plan

None - both tasks executed exactly as the plan's `<action>` blocks specify (the exact inline-script body with `var KEY = 'did:theme'` / `localStorage.getItem(KEY)`, and the SSR-safe runes store with no top-level window access). No auto-fixes were required.

**Total deviations:** 0

## Known Stubs

None. `theme.svelte.ts` is fully wired to real data (DOM attribute + `localStorage`); no placeholder or empty-value stubs were introduced. The `ThemeToggle` component and `+layout.svelte` mount that the `toggle a11y` E2E slice needs are an intentional scope fence for plan **02-03**, not a stub in this plan's surface.

## Issues Encountered

- A leftover local `vite preview` server from the 02-01 session was already bound to port 4173, so the background `npm run preview -- --strictPort` returned "Port 4173 is already in use." Verified the running server was serving the FRESH build (the new `did:theme` inline script was present in both the served root HTML and `build/index.html`), then ran the Playwright slice with `reuseExistingServer` (non-CI) attaching to it — all three slices passed in ~2s. No code change required.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The runes store is the single source of truth, safe under prerender, and ready for **02-03**'s native `<button aria-pressed>` `ThemeToggle` (imports `theme` + `toggle()` directly) and Phase-5's hero capability gate.
- Only THEME-01 (toggle from any page) and THEME-06 (keyboard-operable, AT-announced, focus-preserving toggle) remain for 02-03 to complete the phase's THEME requirement set.

---
*Phase: 02-design-system-dual-theme*
*Completed: 2026-07-05*

## Self-Check: PASSED

Both files verified present (`src/lib/theme/theme.svelte.ts`, `src/app.html`); both task commits (`740f32a`, `b1bc544`) verified in git history.
