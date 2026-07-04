# Phase 2: Design System & Dual Theme - Research

**Researched:** 2026-07-04
**Domain:** CSS custom-property theming, no-flash theme init, Svelte 5 runes state, WCAG 2.2 accessible toggle, SvelteKit adapter-static / GitHub Pages sub-path
**Confidence:** HIGH (all six research questions resolved against authoritative sources; a few MEDIUM items flagged inline)

> **No CONTEXT.md exists for this phase.** Constraints below are drawn from REQUIREMENTS.md (THEME-01..06), ROADMAP.md (three prescribed plans), STATE.md (Phase 1 decisions), and the project CLAUDE.md stack section. No `## User Constraints` block is emitted because there is no discuss-phase output to copy verbatim.

## Summary

This phase builds **two complete, peer CSS-custom-property token sets** (Premium and Accessible) and the machinery to select, apply, persist, and toggle between them without a flash of the wrong theme. Everything here is achievable with **zero runtime dependencies** — plain CSS custom properties, a tiny blocking inline script in `app.html`, a Svelte 5 runes module (`theme.svelte.ts`), and a native `<button>` toggle. No library is needed or wanted; the stack table below is deliberately "nothing new to install."

The three load-bearing correctness problems are: (1) **no-flash** — a synchronous inline script in `app.html` must set `data-theme` on `<html>` before first paint, reading `localStorage` first and OS media-query signals second; (2) **accessible-first defaulting** — only cheap, universally-available, synchronous signals may gate first paint (`prefers-reduced-motion`, `prefers-contrast`, `prefers-color-scheme`), while WebGL/Battery/deviceMemory detection is **too expensive, too async, or too non-portable to block paint** and must be deferred to Phase 5's capability gate; and (3) **SSR/prerender safety** — the runes store must not touch `window`/`document` at module top level, and must reconcile its state from the DOM attribute the inline script already set, so the prerendered HTML and the hydrated app agree.

The accessible toggle should be a **native `<button>` with `aria-pressed`**, not `role="switch"` with `aria-checked` — `aria-pressed` has materially better and more consistent screen-reader support (ChromeVox does not recognize `role="switch"`; NVDA re-maps switches to toggle buttons anyway). A visually-hidden `aria-live="polite"` region announces the resulting theme, and focus stays on the button because we never remove/replace it on toggle.

**Primary recommendation:** Ship a three-layer CSS token architecture (`reset.css` → `tokens/base.css` primitives+semantics → `theme-premium.css` / `theme-accessible.css` scoped by `:root[data-theme="…"]`), a blocking **inline** (not external) script in `app.html` that reads a **namespaced** `localStorage` key then reduced-motion/contrast media queries, a `theme.svelte.ts` runes singleton that reads its initial value from `document.documentElement.dataset.theme` under a `browser` guard, and a native `<button aria-pressed>` toggle with a polite live-region announcement. Both themes must differ in contrast, type scale, spacing, AND motion — motion is expressed as tokens (`--motion-duration-*`, `--motion-ease-*`) so the Accessible theme is a genuine design, not `display:none` on animation.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| THEME-01 | Toggle between Premium and Accessible from any page | Native `<button aria-pressed>` in the app shell (`ThemeToggle`), driven by the `theme.svelte.ts` runes singleton; both themes are `[data-theme]`-scoped CSS so a single attribute flip re-skins the whole page. Toggle lives in Header (Phase 3 shell) but the component + store are built here. |
| THEME-02 | Persists across pages and return visits | `localStorage.setItem(namespacedKey, theme)` on every change; inline script reads it first at boot. Per-page navigation keeps the module-singleton store alive (SPA client nav); return visits restored from `localStorage`. |
| THEME-03 | Themes differ across motion, contrast, typography, spacing | Two complete peer token files. Primitive→semantic→component token layering; each theme overrides semantic tokens for color/contrast, `--font-*`/type-scale, `--space-*`, and `--motion-duration-*`/`--motion-ease-*`. Documented token map below. |
| THEME-04 | No flash of wrong theme (applied before first paint) | Synchronous **blocking** inline `<script>` in `app.html` `<head>` (or top of `<body>`) sets `document.documentElement.dataset.theme` before the parser reaches styled content. Pattern + exact code below. |
| THEME-05 | First-visit default honors reduced-motion / no-WebGL / low-power → Accessible | Cheap synchronous signals decide the paint-time default (reduced-motion, prefers-contrast); expensive/async/non-portable signals (WebGL, Battery, saveData, deviceMemory) are explicitly **excluded from the paint-time decision** and deferred to Phase 5. Concrete algorithm below. |
| THEME-06 | Toggle keyboard-operable, announced to AT, preserves focus | Native `<button>` = free keyboard + focus semantics; `aria-pressed` state; visually-hidden `aria-live="polite"` announcement; focus never leaves the button because the element is never replaced. Anti-flash on the control handled via DOM-attribute reconciliation. |
</phase_requirements>

## Standard Stack

### Core (nothing new to install — all already present)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Svelte | 5.56.x (installed) | Runes (`$state`/`$derived`) power the theme store in a `.svelte.ts` module | Runes are the current reactivity model; `.svelte.ts` modules are the sanctioned way to share reactive state across components. |
| SvelteKit | 2.63.x (installed) | `app.html` template, `$app/environment` `browser` guard, prerender pipeline | Provides the `app.html` injection point and the SSR/prerender guard needed for a window-free module. |
| @sveltejs/adapter-static | 3.0.10 (installed) | Static export; determines that theme logic must be 100% client-side | No server = no cookie/SSR theming; the inline-script-in-`app.html` pattern is the only correct one. |
| Plain CSS custom properties + `@layer` | native | Token architecture; both themes as `[data-theme]`-scoped variable sets | Lighter and clearer than any CSS framework for a two-theme token system (confirmed in project CLAUDE.md "Alternatives Considered"). |

### Supporting (optional, defer unless a concrete need appears)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @fontsource-variable/* | latest | Self-hosted brand fonts referenced by `--font-*` tokens | If Premium/Accessible use distinct typefaces. Self-host (privacy/perf) — never hotlink Google Fonts. Font *selection* can be deferred to Phase 3 if desired; token *slots* must exist now. |

### Alternatives Considered (all rejected for this phase)
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Plain CSS custom properties | Tailwind v4 `@theme` + `[data-theme]` | Extra build dependency for zero benefit here; project CLAUDE.md marks it "optional convenience, not required." |
| Inline `app.html` script | External `%sveltekit.assets%/theme-init.js` | External needs a network round-trip (reintroduces flash risk) and the `%sveltekit.assets%` base-path prefix; inline is guaranteed-blocking and base-path-immune. ROADMAP explicitly prescribes *inline*. |
| `aria-pressed` button | `role="switch"` + `aria-checked` | `role="switch"` has worse SR support (ChromeVox ignores it; NVDA re-maps it). See Accessible Toggle section. |
| Runes module | Svelte writable store / context | Runes `.svelte.ts` is the current idiom; a store works but is the legacy pattern the stack explicitly moved off. |

**Installation:** None. All dependencies already in `package.json` (verified). Optional fonts only if peer designs demand distinct typefaces:
```bash
# ONLY if the two themes use different self-hosted typefaces:
npm install @fontsource-variable/<premium-face> @fontsource-variable/<accessible-face>
```

**Version verification:** No new packages, so no registry check required. Svelte 5.56 / Kit 2.63 / adapter-static 3.0.10 confirmed installed via `package.json` (2026-07-04).

## Architecture Patterns

### Recommended file structure (additive to existing `src/`)
```
src/
├── app.html                     # + blocking inline theme-init script (THEME-04/05)
├── lib/
│   ├── theme/
│   │   ├── theme.svelte.ts       # runes singleton: current theme, set(), toggle(), constants
│   │   └── ThemeToggle.svelte    # native <button aria-pressed> + live-region (THEME-01/06)
│   └── styles/
│       ├── reset.css             # modern reset (Andy Bell / Josh Comeau style)
│       ├── tokens/
│       │   └── base.css          # primitive tokens + :root default semantic tokens
│       ├── theme-premium.css     # :root[data-theme="premium"] semantic overrides
│       └── theme-accessible.css  # :root[data-theme="accessible"] semantic overrides
└── routes/
    └── +layout.svelte            # import the four CSS files (order matters, see below)
```

### Pattern 1: Blocking inline theme-init script (THEME-04, THEME-05)
**What:** A synchronous `<script>` in `app.html` that runs during HTML parse and sets `data-theme` on `<html>` *before* the browser paints styled content.
**When to use:** Always, for any persisted theme on a static/prerendered site. This is the canonical dark-mode anti-FOUC pattern.
**Where it goes:** In `app.html`. Placing it in `<head>` (before `%sveltekit.head%`) or as the first child of `<body>` both work; **`<head>` is preferred** so the attribute is set before any body/style is parsed. It must be **inline and synchronous** (no `async`/`defer`, no `type="module"` — modules are deferred by spec and would flash).

**Critical SSR/hydration note (verified):** Setting an attribute on `<html>` causes **no hydration mismatch**. Svelte/Kit only hydrates the content inside `%sveltekit.body%` (the `<div style="display:contents">` wrapper); the `<html>` and `<head>` elements are outside the hydrated component tree, so a script mutating `<html data-theme>` is invisible to hydration diffing. The prerendered *body* markup must not encode a theme-specific branch (it doesn't — themes are pure CSS), so body HTML is identical regardless of theme. The one exception is the toggle control's own `aria-pressed`/label — see Pattern 4.

```html
<!-- Source: https://scriptraccoon.dev/blog/darkmode-toggle-sveltekit (technique),
     https://svelte.dev/docs/kit/hooks (app.html injection). Adapted, HIGH confidence. -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script>
      // Runs synchronously before first paint. No base-path concern (inline).
      (function () {
        try {
          var KEY = 'did:theme';                       // NAMESPACED — see GitHub Pages gotcha
          var stored = localStorage.getItem(KEY);
          var theme;
          if (stored === 'premium' || stored === 'accessible') {
            theme = stored;                            // returning visitor: explicit choice wins
          } else {
            // First visit: accessible-first defaulting from CHEAP SYNCHRONOUS signals only.
            var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
            var moreContrast = matchMedia('(prefers-contrast: more)').matches;
            theme = (reduce || moreContrast) ? 'accessible' : 'premium';
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

### Pattern 2: SSR/prerender-safe runes theme store (THEME-01, THEME-02)
**What:** A module-singleton in `theme.svelte.ts` exposing reactive `current`, plus `set()`/`toggle()` that write the DOM attribute and `localStorage`.
**When to use:** Any component that needs to read or change the theme.
**Key rules:** (a) no `window`/`document`/`localStorage` access at module top level — guard with `browser`; (b) initial client value read from the DOM attribute the inline script already set (single source of truth → no flash, no mismatch); (c) SSR/prerender returns a neutral default.

```ts
// src/lib/theme/theme.svelte.ts
// Source: https://svelte.dev/docs/svelte/$state (runes in .svelte.ts),
//         https://svelte.dev/docs/kit/$app-environment (browser guard). HIGH confidence.
import { browser } from '$app/environment';

export type Theme = 'premium' | 'accessible';
export const THEME_KEY = 'did:theme';           // MUST match app.html inline script
const DEFAULT: Theme = 'accessible';            // safe SSR/prerender default

function initial(): Theme {
  if (!browser) return DEFAULT;                 // prerender: no window access
  const attr = document.documentElement.dataset.theme; // set by inline script pre-paint
  return attr === 'premium' || attr === 'accessible' ? attr : DEFAULT;
}

class ThemeStore {
  current = $state<Theme>(initial());

  set(next: Theme) {
    this.current = next;
    if (!browser) return;
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(THEME_KEY, next); } catch { /* private mode */ }
  }
  toggle() { this.set(this.current === 'premium' ? 'accessible' : 'premium'); }
}

export const theme = new ThemeStore();
```

> **Prerender/state-leak note:** Module-level `$state` is a per-process singleton. On a *live* SSR server this could leak between requests, but this project is **fully prerendered at build time** with `adapter-static`, so there is no long-lived server request cycle to leak across — and the initial value is a constant `DEFAULT` on the server anyway. HIGH confidence this is safe here; if the app ever moved to live SSR, initialization would need to move into a per-request context. Flag for planner awareness only.

### Pattern 3: Three-layer CSS token architecture (THEME-03)
**What:** Primitive tokens → semantic tokens → per-theme semantic overrides, all as CSS custom properties, scoped by `:root[data-theme="…"]`.
**Layering & load order** (import order in `+layout.svelte` matters; later wins on equal specificity, but the `[data-theme]` selector adds specificity so theme files reliably override `base.css` defaults):
```
1. reset.css              — normalize box model, margins, media defaults, :focus-visible baseline
2. tokens/base.css        — primitives (--color-ink-900, --size-4…) + :root default semantics
3. theme-premium.css      — :root[data-theme="premium"]   { semantic overrides }
4. theme-accessible.css   — :root[data-theme="accessible"]{ semantic overrides }
```

```css
/* tokens/base.css — Source: design-tokens community practice (primitive→semantic).
   MEDIUM-HIGH: naming convention is a well-established pattern, exact palette TBD by design. */
:root {
  /* --- PRIMITIVE tokens (raw, theme-agnostic) --- */
  --ink-900: #14110f;  --ink-100: #f6f4f2;
  --brand-600: #1b4dff; --brand-300: #9db4ff;
  --space-1: 0.25rem;  --space-2: 0.5rem;  --space-4: 1rem;  --space-8: 2rem;
  --font-sans: system-ui, sans-serif;
  --dur-0: 0ms; --dur-fast: 150ms; --dur-slow: 400ms;
  --ease-standard: cubic-bezier(.2,0,0,1); --ease-linear: linear;

  /* --- SEMANTIC tokens (what components consume) — default = Premium-ish --- */
  --bg: var(--ink-100); --fg: var(--ink-900); --accent: var(--brand-600);
  --type-scale-ratio: 1.25;  --font-body: var(--font-sans);
  --space-section: var(--space-8);
  --motion-duration: var(--dur-slow); --motion-ease: var(--ease-standard);
  --focus-ring-width: 2px;
}
```
```css
/* theme-accessible.css — a DISTINCT design, not motion removed.
   Higher contrast, larger type, more generous spacing, near-zero motion. */
:root[data-theme='accessible'] {
  --bg: #ffffff; --fg: #14110f;               /* aim ≥ 7:1 (AAA) where feasible, ≥4.5:1 AA floor */
  --accent: #0b3ad6;                          /* verify ≥4.5:1 on --bg */
  --type-scale-ratio: 1.333;                  /* larger, calmer type scale */
  --space-section: 3rem;                      /* more breathing room */
  --motion-duration: var(--dur-0);            /* genuine: motion is a design choice = off */
  --motion-ease: var(--ease-linear);
  --focus-ring-width: 3px;                    /* thicker, more visible focus */
}
```
```css
/* theme-premium.css */
:root[data-theme='premium'] {
  --bg: #0f1020; --fg: #f6f4f2; --accent: #7aa2ff;
  --type-scale-ratio: 1.25;
  --space-section: 2rem;
  --motion-duration: var(--dur-slow); --motion-ease: var(--ease-standard);
}
```
**Motion tokens are the key to THEME-03/A11Y-05 done right:** animations reference `transition-duration: var(--motion-duration)` and `transition-timing-function: var(--motion-ease)`. In Accessible mode `--motion-duration: 0ms` collapses motion to nothing *by design* — no `display:none`, no removed elements, identical layout. **Belt-and-suspenders safety net** (even in Premium, always respect OS):
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important; animation-iteration-count: 1 !important;
    transition-duration: .01ms !important; scroll-behavior: auto !important;
  }
}
```

### Pattern 4: Accessible toggle with no control-flash (THEME-06)
See "Accessible Toggle" section below for the full component. The hydration-flash concern on the *control itself*: the prerendered HTML renders the button with the SSR default (`accessible`), but the inline script may have set `premium`. Resolve by having the button read `theme.current` (which `initial()` seeds from the DOM attribute at hydration) — so at hydration the `aria-pressed`/label immediately reflect the true theme. A one-frame correction is possible but imperceptible; to eliminate it entirely, keep the button label theme-agnostic ("Switch theme") and drive only `aria-pressed` + the live-region text from the store.

### Anti-Patterns to Avoid
- **Accessible-as-fallback:** defining only Premium tokens and stripping them for Accessible. Both files must be complete peers with independent contrast/type/space/motion values. (Structural reason the ROADMAP builds both up front.)
- **`type="module"` or `defer`/`async` on the init script:** modules/deferred scripts run after parse → guaranteed flash. Must be classic inline synchronous.
- **Reading `window`/`localStorage` at `.svelte.ts` module top level:** crashes/leaks during prerender. Always `browser`-guard.
- **Blocking first paint on WebGL/Battery/deviceMemory:** expensive/async/non-portable — see Signal Detection.
- **`role="switch"` + `aria-checked`:** weaker SR support than `aria-pressed` (below).
- **`!important` motion kill as the *only* reduced-motion story:** it's a safety net, not the design. Accessible theme must genuinely differ.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Theme persistence | Custom cookie/hook plumbing | `localStorage` + inline script | No server on Pages; cookies need SSR you don't have. |
| Keyboard/focus semantics for the toggle | `<div role="button">` + keydown handlers | Native `<button>` | Free Enter/Space activation, focusability, focus ring, and role — hand-rolled versions routinely miss Space or focus. |
| Reduced-motion detection at runtime | Scroll/FPS heuristics | `matchMedia('(prefers-reduced-motion: reduce)')` | OS-level, synchronous, universally supported. |
| CSS reset | Bespoke normalize | Andy Bell / Josh Comeau modern reset | Edge cases (form inheritance, media defaults, `:focus-visible`) are already solved. |
| Announcing theme change to AT | Custom ARIA soup | One `aria-live="polite"` visually-hidden region | Simple, robust; `role="switch"` alone doesn't announce a plain-language result. |

**Key insight:** This entire phase is a *zero-dependency* problem. Every "library" temptation (theme libs, headless switch components, framework theming plugins) adds bundle and indirection over ~40 lines of platform CSS/JS. The platform primitives (`matchMedia`, CSS custom properties, `localStorage`, `<button aria-pressed>`) are the correct tools.

## Signal Detection for Accessible-First Defaulting (THEME-05)

**The rule: only cheap, synchronous, universally-available signals may gate first paint.** Everything else is deferred to Phase 5's `capabilities.ts` (which gates the 3D hero *mount*, not the theme).

| Signal | Available at first paint? | Portable? | Verdict |
|--------|---------------------------|-----------|---------|
| `matchMedia('(prefers-reduced-motion: reduce)')` | Yes, synchronous | All modern browsers | **USE** — primary accessible-first trigger |
| `matchMedia('(prefers-contrast: more)')` | Yes, synchronous | All modern browsers (Safari/Chrome/FF) | **USE** — strong accessibility intent signal |
| `matchMedia('(prefers-color-scheme: dark)')` | Yes, synchronous | Universal | Optional — informs default *palette*, not accessible-vs-premium. Do NOT equate dark with accessible. |
| WebGL availability | Requires creating a canvas + context — **expensive, can be tens of ms**, and touches GPU | Universal but costly | **EXCLUDE from paint.** Defer to Phase 5 hero gate. A no-WebGL device still gets Premium *2D* fine; only the 3D hero is gated. |
| `navigator.connection.saveData` | Synchronous **but** Chromium-only (absent in Safari/Firefox) | No | **EXCLUDE from paint** (non-portable). May inform hero gate in Phase 5. |
| `navigator.hardwareConcurrency` | Synchronous but capped/spoofed (WebKit caps at 8 macOS / 2 iOS) | Uneven | **EXCLUDE** — unreliable low-power proxy. |
| `navigator.deviceMemory` | Synchronous but **Chromium-only**, rounded for anti-fingerprinting | No (absent Safari/Firefox) | **EXCLUDE** — non-portable. |
| Battery Status API (`navigator.getBattery`) | **Async (returns a Promise)** and **deprecated/removed** (Firefox removed it; privacy-restricted elsewhere) | No | **EXCLUDE entirely.** Cannot block paint (async) and is being dropped. |

**Concrete paint-time default-decision algorithm (first visit only):**
```
1. If localStorage['did:theme'] is 'premium' | 'accessible' → use it (explicit choice, no signals). STOP.
2. Else compute:  reduce   = prefers-reduced-motion: reduce
                  contrast = prefers-contrast: more
3. default = (reduce OR contrast) ? 'accessible' : 'premium'
4. Set <html data-theme=default>.
```
This is what the Pattern 1 inline script does. **"no-WebGL" and "low-power" are honored at the hero level in Phase 5, not the theme level** — a Premium theme on a no-WebGL device simply shows the poster (HERO-03). This is the correct separation: THEME-05's spirit ("assistive signals → Accessible") is satisfied by reduced-motion/contrast; WebGL/power are hero-mount concerns. **Document this boundary for the planner** so Phase 2 isn't over-scoped with async capability detection that belongs in Phase 5.

**Confidence:** HIGH on the media-query signals and on the exclusion rationale (Battery deprecation, deviceMemory/saveData Chromium-only, WebGL cost) — all verified via MDN/caniuse-backed search 2026-07-04.

## Accessible Toggle Pattern (THEME-06)

**Decision: native `<button>` with `aria-pressed`, NOT `role="switch"`/`aria-checked`.**

Evidence (verified 2026-07-04): toggle buttons correctly use `aria-pressed`; checkable widgets use `aria-checked`. `role="switch"` is functionally a checkbox with on/off labels, **but its SR support is weaker** — ChromeVox does not recognize `role="switch"`, and NVDA re-maps a `role="switch"` element to "toggle button, pressed" anyway. `aria-pressed` on a native button has the most consistent cross-AT support (NVDA announces "…, toggle button, pressed"). For a two-value Premium/Accessible control, `aria-pressed` is the safer, better-supported choice.

**Focus retention:** because the same `<button>` element persists across toggles (we mutate attributes, never replace/remove the node), focus is never lost — no manual focus management needed. This is the primary reason to prefer a native button over any re-rendered custom control.

**Announcement:** a visually-hidden `aria-live="polite"` region updated on change speaks the resulting theme in plain language (`aria-pressed` alone announces "pressed/not pressed", which is opaque for a theme name).

```svelte
<!-- src/lib/theme/ThemeToggle.svelte
  Sources: https://www.w3.org/WAI/ARIA/apg/patterns/  (button/toggle patterns),
           https://adrianroselli.com/2021/10/switch-role-support.html (aria-pressed > switch),
           MDN ARIA button role. HIGH confidence. -->
<script lang="ts">
  import { theme } from './theme.svelte.ts';
  let announce = $state('');
  const isPremium = $derived(theme.current === 'premium');
  function onClick() {
    theme.toggle();
    announce = `${theme.current === 'premium' ? 'Premium' : 'Accessible'} theme enabled`;
  }
</script>

<button
  type="button"
  aria-pressed={isPremium}
  onclick={onClick}
  class="theme-toggle"
>
  <!-- Theme-agnostic label avoids any hydration text flash; state carried by aria-pressed -->
  <span>Theme: {isPremium ? 'Premium' : 'Accessible'}</span>
</button>

<!-- Polite live region; visually hidden but announced. One per app (put in shell). -->
<div aria-live="polite" class="sr-only">{announce}</div>

<style>
  .sr-only {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
  }
  .theme-toggle:focus-visible {
    outline: var(--focus-ring-width) solid var(--accent);
    outline-offset: 2px;
  }
  /* WCAG 2.2 2.5.8 target size: ensure ≥24×24 CSS px hit area */
  .theme-toggle { min-height: 44px; min-inline-size: 44px; }
</style>
```
**Notes:** `min-height/inline-size: 44px` comfortably exceeds WCAG 2.2 **2.5.8 Target Size (Minimum) = 24×24 CSS px** (44px is the stronger AAA/mobile heuristic). Focus outline uses the `--focus-ring-width` token so it thickens in Accessible mode. The `type="button"` prevents accidental form submission when the toggle later lives inside a header that may contain a form.

## Common Pitfalls

### Pitfall 1: Flash on the toggle *control* even when the page doesn't flash
**What goes wrong:** Page background/theme is correct pre-paint (inline script), but the button briefly shows the SSR-default label/`aria-pressed` before hydration corrects it.
**Why:** Prerendered HTML encodes the SSR default (`accessible`); the store reconciles to the real theme only at hydration.
**How to avoid:** Seed the store from `document.documentElement.dataset.theme` in `initial()` (already done) so hydration renders the correct state on the first client render; optionally keep the label theme-agnostic. **Warning sign:** button text/icon visibly swaps ~100ms after load.

### Pitfall 2: `localStorage` key collision across GitHub Pages projects (BASE_PATH gotcha)
**What goes wrong:** On `wolfwdavid.github.io`, **all** repo project-pages share **one origin**, so `localStorage` is shared across every project the user hosts there. An unnamespaced key like `theme` collides with other repos (this account hosts many).
**Why:** `localStorage` is origin-scoped, and Project Pages all live under `https://wolfwdavid.github.io/...`.
**How to avoid:** Namespace the key: `did:theme` (used consistently in both the inline script and `theme.svelte.ts`). **Warning sign:** theme mysteriously changes after visiting a *different* wolfwdavid.github.io project. HIGH confidence, project-specific — call this out to the planner.

### Pitfall 3: SSR/prerender crash from top-level `window` access
**What goes wrong:** `npm run build` fails during prerender with "window is not defined."
**Why:** `.svelte.ts` executes in Node during prerender; touching `document`/`localStorage` at module scope throws.
**How to avoid:** `browser` guard everywhere (done in Pattern 2). **Warning sign:** build error referencing `window`/`document`/`localStorage`.

### Pitfall 4: Reduced-motion "handled" only by killing animations
**What goes wrong:** Accessible theme looks like Premium with frozen animations — fails THEME-03's "two complete designs" bar and the reviewer's eye.
**Why:** Treating motion as the only axis of difference.
**How to avoid:** Give Accessible independent contrast, type scale, and spacing values (Pattern 3). **Warning sign:** the two themes are pixel-identical except for movement.

### Pitfall 5: CSS asset paths breaking under the sub-path
**What goes wrong (actually: does NOT happen if you do it right):** CSS `url()` assets 404 on Pages.
**Why/avoidance:** Import the four CSS files **into `+layout.svelte`** (or a component), so Vite processes, hashes, and base-prefixes them automatically. Do **not** hand-write `<link href="/styles/...">` in `app.html` (that would need the `%sveltekit.assets%` prefix and bypass hashing). Fonts referenced from CSS `url()` and imported via `@fontsource` are likewise base-safe when bundled. HIGH confidence — consistent with Phase 1's `paths.relative=false` + `base` decision.

## Code Examples

### Importing the token layers (base-path-safe)
```svelte
<!-- src/routes/+layout.svelte — Vite bundles+hashes+base-prefixes these automatically. -->
<script lang="ts">
  import '$lib/styles/reset.css';
  import '$lib/styles/tokens/base.css';
  import '$lib/styles/theme-premium.css';
  import '$lib/styles/theme-accessible.css';
  import favicon from '$lib/assets/favicon.svg';
  let { children } = $props();
</script>
<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
```

### Consuming tokens in a component (theme-reactive with zero JS)
```css
/* Any component style. Flipping :root[data-theme] re-skins instantly, no re-render. */
.card {
  background: var(--bg);
  color: var(--fg);
  padding: var(--space-section);
  transition: background var(--motion-duration) var(--motion-ease);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Svelte `writable` store for theme | Runes `$state` in `.svelte.ts` module | Svelte 5 (2024) | Store still works; runes are the idiom this stack standardized on. |
| Cookie + SSR `handle` hook theming | `localStorage` + inline `app.html` script | N/A for static hosts | The only viable path on adapter-static/Pages (no server). |
| `role="switch"` for on/off toggles | `<button aria-pressed>` | Ongoing SR-support reality | Better, more consistent AT announcements. |
| Battery API for power heuristics | Not used (deprecated) | FF removed; W3C dropped from track | Don't detect power at paint time; hero gate uses portable signals only. |

**Deprecated/outdated:**
- **Battery Status API:** deprecated/removed (Firefox removed; privacy-restricted). Do not use.
- **`navigator.deviceMemory` / `connection.saveData`:** Chromium-only — never as a *portable* gate; fine only as optional Phase-5 hero hints.

## Open Questions

1. **Exact palettes / type scales / typefaces for the two peer designs**
   - What we know: token *architecture*, *which* semantic tokens must differ, and WCAG contrast floors.
   - What's unclear: the concrete brand values (this is a design decision, not a research fact). scope.org.uk is the named accessibility reference (project CLAUDE.md).
   - Recommendation: planner assigns a design pass (invoke `ui-ux-pro-max` per STATE.md precedent) to fill token *values*; the *structure* in this doc is ready. Contrast must be verified ≥4.5:1 (AA normal text) and ideally ≥7:1 (AAA) in Accessible mode; ≥3:1 for large text and UI/non-text (1.4.11).

2. **Whether the two themes use distinct typefaces (→ whether to install `@fontsource-variable/*` this phase)**
   - What we know: `--font-*` token slots must exist now.
   - What's unclear: if design wants two faces or one face at two scales.
   - Recommendation: create the token slots now; defer the actual `@fontsource` install to whenever a distinct face is chosen (can be this phase or Phase 3 shell) — no architectural blocker either way.

3. **`prefers-contrast: more` as an accessible-first trigger — coverage**
   - What we know: supported in current Chrome/Safari/Firefox; synchronous.
   - What's unclear: older-browser share for this org's audience (likely low).
   - Recommendation: keep it as an *additive* OR trigger alongside `prefers-reduced-motion`; its absence just means reduced-motion alone decides. Low risk.

## Validation Architecture

> `workflow.nyquist_validation` is `true` in `.planning/config.json` → this section is included.

### Test Framework
| Property | Value |
|----------|-------|
| Framework (unit) | Vitest 4.1.9 (installed) — for `theme.svelte.ts` pure logic |
| Framework (component/E2E) | Playwright 1.61.1 (installed) — for no-flash, persistence, keyboard, aria; add `@axe-core/playwright` in Phase 6 (not required here) |
| Config file (unit) | none yet — Wave 0: add Vitest config (or `test` block in `vite.config.ts`) |
| Config file (E2E) | `playwright.config.ts` exists (Phase 1 smoke harness) |
| Quick run command | `npx vitest run src/lib/theme` |
| Full suite command | `npm run check && npx vitest run && npm run build` (add Playwright theme spec once written) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| THEME-01 | toggle() flips premium↔accessible; DOM attr + store agree | unit | `npx vitest run src/lib/theme/theme.test.ts` | ❌ Wave 0 |
| THEME-02 | choice written to `localStorage['did:theme']`; restored on reload | unit + E2E | `npx vitest run` / `npx playwright test theme.spec.ts` | ❌ Wave 0 |
| THEME-03 | premium vs accessible differ in bg/contrast, type, space, motion tokens | E2E (computed-style assert) | `npx playwright test theme.spec.ts -g "peer designs"` | ❌ Wave 0 |
| THEME-04 | no flash: `data-theme` present on `<html>` before first paint | E2E (evaluate on `document.documentElement` at load, no post-load mutation) | `npx playwright test theme.spec.ts -g "no flash"` | ❌ Wave 0 |
| THEME-05 | reduced-motion emulation → first visit lands on accessible | E2E (`emulateMedia({ reducedMotion: 'reduce' })`, cleared storage) | `npx playwright test theme.spec.ts -g "accessible-first"` | ❌ Wave 0 |
| THEME-06 | button keyboard-operable (Enter/Space), `aria-pressed` updates, focus retained, live region announces | E2E (keyboard + `getByRole('button', {pressed})` + `:focus` assert) | `npx playwright test theme.spec.ts -g "toggle a11y"` | ❌ Wave 0 |

Playwright is ideal here: `page.emulateMedia({ reducedMotion, forcedColors, colorScheme })` drives THEME-05 deterministically, and reading `document.documentElement.dataset.theme` immediately after `goto` (before any click) verifies THEME-04's pre-paint guarantee.

### Sampling Rate
- **Per task commit:** `npx vitest run src/lib/theme` (fast, pure logic)
- **Per wave merge:** `npm run check && npx vitest run && npx playwright test theme.spec.ts`
- **Phase gate:** full suite green + `npm run build` succeeds before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/lib/theme/theme.test.ts` — unit tests for `set`/`toggle`/persistence/init (THEME-01,02); jsdom-mock `localStorage` + `document.documentElement`
- [ ] `tests/theme.spec.ts` (Playwright) — no-flash, accessible-first defaulting, persistence-across-reload, keyboard+aria (THEME-02..06)
- [ ] Vitest config: add a `test` block to `vite.config.ts` (or `vitest.config.ts`) with `environment: 'jsdom'` for the store test — **framework already installed**, only config missing
- [ ] (Phase 6, not now) `@axe-core/playwright` for the AA scan — out of scope for Phase 2

## Sources

### Primary (HIGH confidence)
- https://svelte.dev/docs/kit/adapter-static — static/prerender model, `app.html`, base path (Phase 1 verified)
- https://svelte.dev/docs/svelte/$state and $derived — runes in `.svelte.ts` modules
- https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory — Chromium-only, rounded (fingerprinting)
- https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getBattery — Battery API deprecated/removed
- https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/switch_role and button_role — `aria-checked` vs `aria-pressed` semantics
- https://www.w3.org/WAI/ARIA/apg/patterns/switch/ — switch pattern (evaluated and rejected in favor of button)
- WCAG 2.2 (w3.org/TR/WCAG22): 1.4.3 (4.5:1 / 3:1 large), 1.4.6 AAA (7:1 / 4.5:1), 1.4.11 (3:1 non-text/UI), 2.5.8 Target Size (24×24 CSS px), 2.4.11 Focus Not Obscured

### Secondary (MEDIUM confidence — verified against a primary source)
- https://adrianroselli.com/2021/10/switch-role-support.html — `role="switch"` SR-support gaps (ChromeVox ignores; NVDA re-maps) — corroborated by MDN
- https://scriptraccoon.dev/blog/darkmode-toggle-sveltekit — SvelteKit no-flash inline-script technique (adapted to inline-in-head)
- https://caniuse.com/mdn-api_navigator_devicememory , https://caniuse.com/battery-status — support/deprecation tables

### Tertiary (LOW confidence — none load-bearing)
- Assorted DEV.to / community theme-toggle posts — used only to confirm the pattern is community-standard; superseded by the primary sources above.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zero new deps; all versions confirmed installed.
- No-flash inline script + hydration safety: HIGH — pattern is canonical; `<html>`-attribute-outside-hydration reasoning verified against Kit's `app.html` model.
- Signal detection / accessible-first algorithm: HIGH — media-query availability and the Battery/deviceMemory/saveData exclusions verified via MDN/caniuse 2026-07-04.
- Runes store SSR-safety: HIGH — `browser` guard + DOM-attr reconciliation; prerender-only mitigates state-leak.
- Accessible toggle (`aria-pressed` > `role=switch`): HIGH — multiple corroborating authoritative sources.
- CSS token palette *values*: N/A (design decision, flagged as Open Question) — architecture HIGH, concrete values TBD.

**Research date:** 2026-07-04
**Valid until:** 2026-08-03 (~30 days; stable platform APIs and a stable installed toolchain — low churn risk)
