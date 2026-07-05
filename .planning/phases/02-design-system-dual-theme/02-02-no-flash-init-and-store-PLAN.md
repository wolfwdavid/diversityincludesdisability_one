---
phase: 02-design-system-dual-theme
plan: 02
type: execute
wave: 2
depends_on: [01]
files_modified:
  - src/app.html
  - src/lib/theme/theme.svelte.ts
autonomous: true
requirements: [THEME-02, THEME-04, THEME-05]
must_haves:
  truths:
    - "On load, <html data-theme> is set BEFORE first paint by a synchronous inline script in app.html — no flash of the wrong theme (THEME-04)"
    - "A first-time visitor whose OS signals reduced-motion or increased-contrast lands on the Accessible theme by default; everyone else defaults to Premium (THEME-05)"
    - "An explicit stored choice in localStorage['did:theme'] always wins over signals and survives reload / return visit (THEME-02)"
    - "The runes store theme.svelte.ts reads its initial value from the DOM attribute the inline script set, is browser-guarded (no top-level window/document), and set()/toggle() write both the attribute and localStorage"
    - "npm run build stays green (no SSR/prerender crash from window access)"
  artifacts:
    - path: "src/app.html"
      provides: "Blocking synchronous inline theme-init script (no-flash + accessible-first defaulting)"
      contains: "document.documentElement.dataset.theme"
    - path: "src/lib/theme/theme.svelte.ts"
      provides: "SSR/prerender-safe runes singleton: current, set(), toggle(), THEME_KEY"
      contains: "$state<Theme>"
  key_links:
    - from: "src/app.html"
      to: "localStorage['did:theme']"
      via: "reads the namespaced key first, then media-query signals"
      pattern: "localStorage.getItem\\('did:theme'\\)"
    - from: "src/lib/theme/theme.svelte.ts"
      to: "document.documentElement.dataset.theme"
      via: "initial() reconciles from the attribute the inline script set"
      pattern: "documentElement.dataset.theme"
---

<objective>
Make the two peer themes from 02-01 selectable and persistent with zero flash. Ship (1) a synchronous **blocking inline script** in `app.html` that sets `<html data-theme>` before first paint — reading the namespaced `localStorage['did:theme']` first, then cheap OS media-query signals to default assistive-signal visitors to the Accessible theme (THEME-04, THEME-05); and (2) an SSR/prerender-safe **runes store** `theme.svelte.ts` that reconciles from the DOM attribute, and whose `set()`/`toggle()` persist the choice to `localStorage` (THEME-02).

Purpose: On a static/prerendered GitHub Pages site there is no server to theme via cookies — the inline-script-in-app.html pattern is the only correct anti-FOUC path, and the runes store is the single source of truth every component (the toggle in 02-03, the hero gate in Phase 5) reads.
Output: `src/app.html` with the blocking init script; `src/lib/theme/theme.svelte.ts` runes singleton. The 02-01 unit stubs (theme.test.ts) and the THEME-02/04/05 slices of e2e/theme.spec.ts go green.

SCOPE FENCE: NO ThemeToggle component and NO +layout.svelte change here (02-03). NO async/expensive capability detection (WebGL/Battery/deviceMemory/saveData) — those are Phase-5 hero-mount concerns and must NOT gate first paint. Only `prefers-reduced-motion` and `prefers-contrast: more` may decide the paint-time default.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@.planning/phases/02-design-system-dual-theme/02-RESEARCH.md
@.planning/phases/02-design-system-dual-theme/02-01-SUMMARY.md
@src/app.html

<interfaces>
<!-- Contract this plan CREATES — 02-03's ThemeToggle imports these directly. -->
```ts
// src/lib/theme/theme.svelte.ts (created here)
export type Theme = 'premium' | 'accessible';
export const THEME_KEY = 'did:theme';
export const theme: {
  current: Theme;        // reactive ($state)
  set(next: Theme): void;
  toggle(): void;
};
```
Tokens consumed (from 02-01, already shipped): `:root[data-theme='premium']` and `:root[data-theme='accessible']` blocks in theme-premium.css / theme-accessible.css. This plan only flips the `data-theme` attribute; the CSS does the re-skin.
</interfaces>

<key_facts>
- NAMESPACED key `did:theme` is MANDATORY (RESEARCH Pitfall 2, HIGH): all wolfwdavid.github.io project pages share one origin/localStorage; an unnamespaced `theme` collides across the account's many repos.
- The inline script MUST be classic + synchronous — NO type="module", NO defer/async (those run after parse → guaranteed flash). RESEARCH Anti-Patterns.
- Setting an attribute on <html> causes NO hydration mismatch: Kit only hydrates inside %sveltekit.body%; <html>/<head> are outside the hydrated tree. RESEARCH Pattern 1 note (HIGH).
- theme.svelte.ts: NO window/document/localStorage at module top level — guard with `browser` from $app/environment, else prerender crashes with "window is not defined". RESEARCH Pitfall 3.
- SSR/prerender DEFAULT is 'accessible' (safe), reconciled to the real value from the DOM attribute at hydration → no flash on the store either.
- Current app.html already has <meta name="text-scale"> and the %sveltekit.head% / %sveltekit.body% shell — PRESERVE all of it; only ADD the <script> in <head>.
</key_facts>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Blocking inline theme-init script in app.html (THEME-04, THEME-05)</name>
  <read_first>
    - .planning/phases/02-design-system-dual-theme/02-RESEARCH.md ("Pattern 1: Blocking inline theme-init script", "Signal Detection", "Concrete paint-time default-decision algorithm")
    - src/app.html (current shell — preserve meta tags + %sveltekit.head%/%sveltekit.body%)
  </read_first>
  <files>src/app.html</files>
  <action>
    Add the blocking inline script as the FIRST child of `<head>` (before `%sveltekit.head%`), preserving every existing element (charset, viewport, `text-scale` meta, the body shell). The script is classic + synchronous (no module/defer/async). Result `src/app.html` EXACTLY:
    ```html
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="text-scale" content="scale" />
        <script>
          // Runs synchronously before first paint. Inline => base-path-immune (no %sveltekit.assets%).
          (function () {
            try {
              var KEY = 'did:theme'; // NAMESPACED — origin is shared across wolfwdavid.github.io projects
              var stored = localStorage.getItem(KEY);
              var theme;
              if (stored === 'premium' || stored === 'accessible') {
                theme = stored; // returning visitor: explicit choice wins over signals
              } else {
                // First visit: accessible-first defaulting from CHEAP SYNCHRONOUS signals only.
                var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
                var moreContrast = matchMedia('(prefers-contrast: more)').matches;
                theme = reduce || moreContrast ? 'accessible' : 'premium';
              }
              document.documentElement.dataset.theme = theme;
            } catch (e) {
              document.documentElement.dataset.theme = 'accessible'; // safe fallback
            }
          })();
        </script>
        %sveltekit.head%
      </head>
      <body data-sveltekit-preload-data="hover">
        <div style="display: contents">%sveltekit.body%</div>
      </body>
    </html>
    ```
    Do NOT add `type="module"`, `defer`, or `async`. Do NOT detect WebGL/Battery/deviceMemory/saveData here (async/expensive/non-portable — Phase-5 hero concern, not the theme default).
  </action>
  <verify>
    <automated>grep -q "localStorage.getItem('did:theme')" src/app.html && grep -q "document.documentElement.dataset.theme" src/app.html && grep -q "prefers-reduced-motion: reduce" src/app.html && grep -q "prefers-contrast: more" src/app.html && ! grep -q 'type="module"' src/app.html && grep -q "%sveltekit.body%" src/app.html</automated>
  </verify>
  <acceptance_criteria>
    - `grep "localStorage.getItem('did:theme')" src/app.html` present (namespaced key, read first)
    - `grep "document.documentElement.dataset.theme = theme" src/app.html` present (attribute set pre-paint)
    - `grep "prefers-reduced-motion: reduce" src/app.html` AND `grep "prefers-contrast: more" src/app.html` present (accessible-first triggers)
    - `grep -E 'type="module"|defer|async>' src/app.html` returns NOTHING on the init script (classic synchronous)
    - `grep -E 'WebGL|getBattery|deviceMemory|saveData' src/app.html` returns NOTHING (scope fence — no paint-time capability detection)
    - `grep "%sveltekit.head%" src/app.html` AND `grep "%sveltekit.body%" src/app.html` AND `grep "text-scale" src/app.html` present (shell preserved)
  </acceptance_criteria>
  <done>app.html has a classic synchronous inline script that sets <html data-theme> before first paint from localStorage['did:theme'] then reduced-motion/contrast signals, with an accessible safe fallback; the existing Kit shell is fully preserved.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: SSR/prerender-safe runes store theme.svelte.ts (THEME-02) + flip store/E2E slices green</name>
  <read_first>
    - .planning/phases/02-design-system-dual-theme/02-RESEARCH.md ("Pattern 2: SSR/prerender-safe runes theme store", "Prerender/state-leak note", "Pitfall 3")
    - src/lib/theme/theme.test.ts (unit stubs from 02-01 — this task makes them green)
    - e2e/theme.spec.ts (the "no flash", "accessible-first", "persists" tests — this task makes them green)
    - src/app.html (the inline script that set the attribute this store reconciles from)
  </read_first>
  <files>src/lib/theme/theme.svelte.ts</files>
  <behavior>
    - initial() returns 'accessible' when !browser (prerender) — no window access.
    - initial() in browser returns the value of document.documentElement.dataset.theme when it is 'premium'|'accessible', else 'accessible'.
    - set('premium') sets current='premium', writes document.documentElement.dataset.theme='premium', and localStorage['did:theme']='premium'.
    - toggle() flips premium<->accessible and mirrors both attribute + localStorage.
    - THEME_KEY === 'did:theme' (must equal the app.html key).
    - localStorage failure (private mode) is swallowed, current still updates.
  </behavior>
  <action>
    Create `src/lib/theme/theme.svelte.ts` with EXACTLY (runes singleton; browser-guarded; reconciles from the DOM attribute the inline script set):
    ```ts
    // src/lib/theme/theme.svelte.ts
    // SSR/prerender-safe runes theme singleton. No top-level window/document access.
    import { browser } from '$app/environment';

    export type Theme = 'premium' | 'accessible';
    export const THEME_KEY = 'did:theme'; // MUST match the app.html inline script
    const DEFAULT: Theme = 'accessible';  // safe SSR/prerender default

    function initial(): Theme {
      if (!browser) return DEFAULT; // prerender: never touch window/document
      const attr = document.documentElement.dataset.theme; // set pre-paint by app.html
      return attr === 'premium' || attr === 'accessible' ? attr : DEFAULT;
    }

    class ThemeStore {
      current = $state<Theme>(initial());

      set(next: Theme) {
        this.current = next;
        if (!browser) return;
        document.documentElement.dataset.theme = next;
        try {
          localStorage.setItem(THEME_KEY, next);
        } catch {
          /* private mode / storage disabled — state still updated */
        }
      }

      toggle() {
        this.set(this.current === 'premium' ? 'accessible' : 'premium');
      }
    }

    export const theme = new ThemeStore();
    ```
    Then flip the tests green:
    ```bash
    npm run test:unit
    npx playwright test --config playwright.theme.config.ts -g "no flash|accessible-first|persists"
    npm run build
    ```
    The `npm run build` MUST stay green — if it fails with "window is not defined", the `browser` guard is missing somewhere.
  </action>
  <verify>
    <automated>grep -q "\$state<Theme>(initial())" src/lib/theme/theme.svelte.ts && grep -q "if (!browser) return DEFAULT" src/lib/theme/theme.svelte.ts && npm run test:unit && npx playwright test --config playwright.theme.config.ts -g "no flash|accessible-first|persists" && npm run build</automated>
  </verify>
  <acceptance_criteria>
    - `grep "import { browser } from '\$app/environment'" src/lib/theme/theme.svelte.ts` present
    - `grep "export const THEME_KEY = 'did:theme'" src/lib/theme/theme.svelte.ts` present (matches app.html)
    - `grep "\$state<Theme>(initial())" src/lib/theme/theme.svelte.ts` present AND no top-level `window.`/`document.`/`localStorage.` outside the `browser`-guarded methods/initial()
    - `npm run test:unit` exits 0 (theme.test.ts toggle + persistence pass — THEME-01/02 store logic)
    - `npx playwright test --config playwright.theme.config.ts -g "no flash|accessible-first|persists"` exits 0 (THEME-04, THEME-05, THEME-02)
    - `npm run build` exits 0 (no prerender window crash)
  </acceptance_criteria>
  <done>theme.svelte.ts is a browser-guarded runes singleton reconciling from the DOM attribute and persisting to localStorage['did:theme']; unit tests and the no-flash/accessible-first/persistence E2E slices pass; build green.</done>
</task>

</tasks>

<verification>
- `npm run test:unit` green (store toggle + persistence).
- `npx playwright test --config playwright.theme.config.ts -g "no flash|accessible-first|persists"` green (THEME-04, THEME-05, THEME-02).
- `npm run build` exits 0 (no SSR/prerender window crash).
- app.html init script is classic + synchronous and reads the namespaced `did:theme` key; no WebGL/Battery paint-time detection.
</verification>

<success_criteria>
- Correct theme is applied before first paint; assistive-signal first-time visitors default to Accessible; explicit choice persists across reload and return visits.
- The runes store is the single source of truth (reconciled from the DOM attribute), safe under prerender, ready for 02-03's toggle and Phase-5's hero gate.
</success_criteria>

<output>
After completion, create `.planning/phases/02-design-system-dual-theme/02-02-SUMMARY.md` recording: the exact inline-script default-decision algorithm shipped, confirmation the key is `did:theme` in both app.html and theme.svelte.ts, the browser-guard approach, and which test slices are now green (unit + no-flash/accessible-first/persistence), leaving only THEME-01/06 toggle a11y for 02-03.
</output>
