---
phase: 02-design-system-dual-theme
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - vite.config.ts
  - playwright.theme.config.ts
  - package.json
  - src/lib/theme/theme.test.ts
  - e2e/theme.spec.ts
  - src/lib/styles/reset.css
  - src/lib/styles/tokens/base.css
  - src/lib/styles/theme-premium.css
  - src/lib/styles/theme-accessible.css
  - src/routes/+layout.svelte
autonomous: true
requirements: [THEME-03]
must_haves:
  truths:
    - "Two complete peer CSS token sets exist: setting <html data-theme=\"premium\"> vs data-theme=\"accessible\" changes background/contrast, type size, section spacing, AND motion duration — not motion alone"
    - "The four CSS layers (reset, base, theme-premium, theme-accessible) are imported into +layout.svelte in order so Vite hashes+base-prefixes them (no hand-written <link> in app.html)"
    - "With no data-theme attribute the page falls back to the Accessible (safe) token values"
    - "npm run build stays green with the new CSS (fully static, no un-prerendered route)"
    - "Test infrastructure exists: a Vitest jsdom config and a local-preview Playwright config, with THEME spec stubs; the THEME-03 peer-designs E2E test passes"
  artifacts:
    - path: "src/lib/styles/tokens/base.css"
      provides: "Primitive tokens + :root default (Accessible) semantic tokens"
      contains: "--color-bg"
    - path: "src/lib/styles/theme-premium.css"
      provides: "Dark Premium peer — :root[data-theme='premium'] semantic overrides"
      contains: ":root[data-theme='premium']"
    - path: "src/lib/styles/theme-accessible.css"
      provides: "Light Accessible peer — :root[data-theme='accessible'] semantic overrides"
      contains: ":root[data-theme='accessible']"
    - path: "src/lib/styles/reset.css"
      provides: "Modern CSS reset + :focus-visible baseline + reduced-motion safety net"
      contains: "prefers-reduced-motion"
    - path: "src/routes/+layout.svelte"
      provides: "Imports the four token layers in load order"
      contains: "$lib/styles/tokens/base.css"
    - path: "vite.config.ts"
      provides: "Vitest jsdom test block for the theme store unit test"
      contains: "environment: 'jsdom'"
    - path: "playwright.theme.config.ts"
      provides: "Local build+preview webServer harness for Phase-2 theme E2E (separate from Phase-1 live smoke)"
      contains: "webServer"
    - path: "e2e/theme.spec.ts"
      provides: "Playwright THEME-01..06 spec (THEME-03 green now; others RED until later plans)"
      contains: "peer designs"
  key_links:
    - from: "src/routes/+layout.svelte"
      to: "src/lib/styles/*.css"
      via: "import statements in load order"
      pattern: "import '\\$lib/styles/theme-accessible.css'"
    - from: "src/lib/styles/theme-premium.css"
      to: "src/lib/styles/tokens/base.css"
      via: "overrides semantic tokens defined in base"
      pattern: "var\\(--dur-"
---

<objective>
Build the design-system foundation for Phase 2: a three-layer CSS custom-property token architecture shipping **two complete, peer-designed themes** — a light, high-contrast, calm-motion **Accessible** theme and a dark, editorial, animated **Premium** theme — that differ across contrast, typography, spacing, AND motion (THEME-03). Also stand up the Phase-2 test infrastructure (Vitest jsdom config + a local build/preview Playwright harness) and the full THEME spec file, with the THEME-03 peer-designs test going green now.

Purpose: Designing both token sets up front is the structural guarantee that the Accessible theme is a genuine peer, never a subtracted fallback. Every later component consumes these semantic tokens, so flipping one `data-theme` attribute re-skins the whole site with zero JS re-render.
Output: `reset.css`, `tokens/base.css`, `theme-premium.css`, `theme-accessible.css` imported into `+layout.svelte`; a Vitest test block in `vite.config.ts`; `playwright.theme.config.ts`; `src/lib/theme/theme.test.ts` (unit stubs, RED until 02-02); `e2e/theme.spec.ts` (THEME-03 green, others scoped to later plans).

SCOPE FENCE: NO inline app.html script, NO theme.svelte.ts store, NO ThemeToggle component here (those are 02-02 / 02-03). Do NOT install fonts (`@fontsource/*`) — create the `--font-*` token slots only. Do NOT install Tailwind. Only new dev dep permitted: `jsdom` (for the Vitest environment).
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/02-design-system-dual-theme/02-RESEARCH.md
@.planning/phases/02-design-system-dual-theme/02-VALIDATION.md
@src/routes/+layout.svelte
@vite.config.ts

<key_facts>
- Static/Pages: CSS MUST be imported into +layout.svelte (Vite hashes + base-prefixes) — NEVER a hand-written <link href="/styles/…"> in app.html (would 404 under the /diversityincludesdisability_one sub-path). RESEARCH Pitfall 5, HIGH confidence.
- Load order matters: reset → base → theme-premium → theme-accessible. The `[data-theme]` selector adds specificity so theme files reliably override base's :root defaults.
- :root defaults in base.css = the ACCESSIBLE values (safe fallback: matches store DEFAULT='accessible' in 02-02 and the inline-script catch fallback). theme-accessible.css re-declares them scoped, theme-premium.css overrides to dark.
- Motion is a genuine design token: `--motion-duration`/`--motion-ease`/`--motion-distance`. Accessible = 0ms/linear/0 (off BY DESIGN, no display:none). Premium = 250ms/emphasized/12px.
- Phase-1 live smoke harness lives in tests/ (baseURL = live Pages URL). Phase-2 theme E2E goes in a SEPARATE e2e/ dir with a local webServer preview — do NOT modify playwright.config.ts or tests/.
- vitest already installed (^4.1.9); playwright already installed. Only jsdom is missing.
</key_facts>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Wave 0 — Vitest jsdom config, local-preview Playwright harness, and THEME spec scaffolds</name>
  <read_first>
    - .planning/phases/02-design-system-dual-theme/02-RESEARCH.md ("Validation Architecture", "Phase Requirements → Test Map", "Wave 0 Gaps")
    - .planning/phases/02-design-system-dual-theme/02-VALIDATION.md
    - vite.config.ts (current: bare sveltekit() plugin — add a test block)
    - playwright.config.ts (Phase-1 live harness — DO NOT edit; mirror its shape for the local one)
    - package.json (scripts + devDependencies)
  </read_first>
  <files>vite.config.ts, playwright.theme.config.ts, package.json, src/lib/theme/theme.test.ts, e2e/theme.spec.ts</files>
  <action>
    Install the one missing dev dependency (jsdom for the Vitest environment). Do NOT install anything else:
    ```bash
    npm install -D jsdom
    ```

    Replace `vite.config.ts` with EXACTLY (adds a Vitest jsdom `test` block; keeps sveltekit() so `.svelte.ts` runes compile; scopes unit tests to src/** so Playwright specs in e2e/ and tests/ are never picked up by Vitest):
    ```ts
    import { sveltekit } from '@sveltejs/kit/vite';
    import { defineConfig } from 'vitest/config';

    export default defineConfig({
      plugins: [sveltekit()],
      test: {
        environment: 'jsdom',
        globals: true,
        include: ['src/**/*.{test,spec}.{js,ts}'],
        exclude: ['e2e/**', 'tests/**', 'node_modules/**']
      }
    });
    ```

    Create `playwright.theme.config.ts` at repo root with EXACTLY (builds + previews locally on port 4173, base='' so served at root; inline theme script is base-immune. Separate testDir e2e/ so it never touches the Phase-1 live smoke harness):
    ```ts
    import { defineConfig, devices } from '@playwright/test';

    // Phase-2 theme E2E: run against a LOCAL build+preview, not the live Pages URL.
    // Kept separate from playwright.config.ts (Phase-1 live smoke harness).
    export default defineConfig({
      testDir: 'e2e',
      timeout: 30_000,
      use: { baseURL: 'http://localhost:4173/' },
      reporter: 'list',
      webServer: {
        command: 'npm run build && npm run preview -- --port 4173 --strictPort',
        url: 'http://localhost:4173/',
        timeout: 120_000,
        reuseExistingServer: !process.env.CI
      },
      projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
    });
    ```

    Add two scripts to `package.json` "scripts" (keep existing scripts intact):
    ```json
    "test:unit": "vitest run src/lib/theme",
    "test:theme": "playwright test --config playwright.theme.config.ts"
    ```

    Create `src/lib/theme/theme.test.ts` — Vitest unit stubs for the store (RED now; module `theme.svelte.ts` is created in 02-02). Mock `$app/environment` so `browser` is true under jsdom:
    ```ts
    import { describe, it, expect, beforeEach, vi } from 'vitest';

    vi.mock('$app/environment', () => ({ browser: true }));

    describe('theme store (THEME-01/02 unit — RED until 02-02 creates theme.svelte.ts)', () => {
      beforeEach(() => {
        localStorage.clear();
        document.documentElement.removeAttribute('data-theme');
      });

      it('toggle() flips premium <-> accessible and mirrors to <html data-theme> (THEME-01)', async () => {
        const { theme } = await import('./theme.svelte.ts');
        theme.set('premium');
        expect(theme.current).toBe('premium');
        expect(document.documentElement.dataset.theme).toBe('premium');
        theme.toggle();
        expect(theme.current).toBe('accessible');
        expect(document.documentElement.dataset.theme).toBe('accessible');
      });

      it('set() persists the choice to localStorage["did:theme"] (THEME-02)', async () => {
        const { theme, THEME_KEY } = await import('./theme.svelte.ts');
        expect(THEME_KEY).toBe('did:theme');
        theme.set('premium');
        expect(localStorage.getItem('did:theme')).toBe('premium');
      });
    });
    ```

    Create `e2e/theme.spec.ts` — the full THEME-01..06 Playwright spec. Only the THEME-03 "peer designs" test must pass in THIS plan; the rest reference the inline script / store / toggle built in 02-02 & 02-03 and will be RED until then (each plan runs its own `-g` slice, so unfinished tests do not block earlier plans):
    ```ts
    import { test, expect } from '@playwright/test';

    // --- THEME-03: two complete peer designs (green in 02-01) ---
    test('peer designs differ across contrast, type, spacing, and motion', async ({ page }) => {
      await page.goto('./');

      const read = (t: 'premium' | 'accessible') =>
        page.evaluate((theme) => {
          document.documentElement.dataset.theme = theme;
          const cs = getComputedStyle(document.documentElement);
          const g = (n: string) => cs.getPropertyValue(n).trim();
          return {
            bg: g('--color-bg'),
            text: g('--color-text'),
            fontSize: g('--font-size-base'),
            section: g('--space-section'),
            motion: g('--motion-duration')
          };
        }, t);

      const premium = await read('premium');
      const accessible = await read('accessible');

      expect(premium.bg).not.toBe(accessible.bg);          // contrast/palette differs
      expect(premium.text).not.toBe(accessible.text);
      expect(premium.fontSize).not.toBe(accessible.fontSize); // typography differs
      expect(premium.section).not.toBe(accessible.section);   // spacing differs
      expect(premium.motion).not.toBe(accessible.motion);     // motion differs (token, not display:none)
      expect(accessible.motion).toBe('0ms');                  // Accessible motion off BY DESIGN
    });

    // --- THEME-04: no flash (green in 02-02) ---
    test('no flash: data-theme is set on <html> before first paint', async ({ page }) => {
      await page.goto('./');
      const attr = await page.evaluate(() => document.documentElement.dataset.theme);
      expect(['premium', 'accessible']).toContain(attr);
    });

    // --- THEME-05: accessible-first default (green in 02-02) ---
    test('accessible-first: reduced-motion first visit lands on accessible', async ({ page, context }) => {
      await context.clearCookies();
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.addInitScript(() => localStorage.removeItem('did:theme'));
      await page.goto('./');
      const attr = await page.evaluate(() => document.documentElement.dataset.theme);
      expect(attr).toBe('accessible');
    });

    // --- THEME-02: persistence across reload (green in 02-02) ---
    test('persists the chosen theme across a reload', async ({ page }) => {
      await page.goto('./');
      await page.evaluate(() => localStorage.setItem('did:theme', 'premium'));
      await page.reload();
      const attr = await page.evaluate(() => document.documentElement.dataset.theme);
      expect(attr).toBe('premium');
    });

    // --- THEME-01/06: toggle a11y (green in 02-03) ---
    test('toggle a11y: keyboard-operable button flips aria-pressed, keeps focus, announces', async ({ page }) => {
      await page.goto('./');
      const btn = page.getByRole('button', { name: /theme/i });
      await btn.focus();
      const before = await btn.getAttribute('aria-pressed');
      await page.keyboard.press('Enter');
      const after = await btn.getAttribute('aria-pressed');
      expect(after).not.toBe(before);
      await expect(btn).toBeFocused();                       // focus retained on switch
      await expect(page.locator('[aria-live="polite"]')).toContainText(/theme enabled/i);
    });
    ```
  </action>
  <verify>
    <automated>npx playwright test --config playwright.theme.config.ts -g "peer designs"</automated>
  </verify>
  <acceptance_criteria>
    - `grep "environment: 'jsdom'" vite.config.ts` present AND `grep "exclude:" vite.config.ts` lists `e2e/**` and `tests/**`
    - `grep '"jsdom"' package.json` present (installed) AND `grep 'three\|threlte\|mdsvex\|tailwind\|fontsource' package.json` returns NOTHING (scope fence held)
    - `grep "webServer" playwright.theme.config.ts` present AND `grep "testDir: 'e2e'" playwright.theme.config.ts` present
    - `grep '"test:theme"' package.json` present AND `grep '"test:unit"' package.json` present
    - `test -f src/lib/theme/theme.test.ts` succeeds AND `grep "did:theme" src/lib/theme/theme.test.ts` present
    - `test -f e2e/theme.spec.ts` succeeds AND `grep "peer designs" e2e/theme.spec.ts` present
    - `npx playwright test --config playwright.theme.config.ts -g "peer designs"` exits 0 (THEME-03 verified once Task 3 lands the CSS; run this task's gate AFTER Task 3)
    - playwright.config.ts and tests/ are unchanged (Phase-1 harness untouched)
  </acceptance_criteria>
  <done>Vitest jsdom test block added to vite.config.ts; jsdom installed; playwright.theme.config.ts with a local build+preview webServer created; test:unit/test:theme scripts added; theme.test.ts unit stubs and e2e/theme.spec.ts full THEME spec created; Phase-1 harness untouched.</done>
</task>

<task type="auto">
  <name>Task 2: Modern reset + primitive tokens + :root (Accessible) semantic defaults</name>
  <read_first>
    - .planning/phases/02-design-system-dual-theme/02-RESEARCH.md ("Pattern 3: Three-layer CSS token architecture", "Don't Hand-Roll" reset row)
  </read_first>
  <files>src/lib/styles/reset.css, src/lib/styles/tokens/base.css</files>
  <action>
    Create `src/lib/styles/reset.css` with EXACTLY (Andy-Bell-style modern reset + `:focus-visible` baseline driven by tokens + a reduced-motion safety net that is a BELT, not the design):
    ```css
    /* reset.css — modern reset (Andy Bell / Josh Comeau lineage). */
    *, *::before, *::after { box-sizing: border-box; }
    * { margin: 0; }
    html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
    body {
      min-height: 100vh;
      line-height: var(--leading, 1.6);
      font-family: var(--font-body, system-ui, sans-serif);
      font-size: var(--font-size-base, 1rem);
      color: var(--color-text, #1a1a1a);
      background: var(--color-bg, #ffffff);
      -webkit-font-smoothing: antialiased;
    }
    img, picture, video, canvas, svg { display: block; max-width: 100%; }
    input, button, textarea, select { font: inherit; color: inherit; }
    p, h1, h2, h3, h4, h5, h6 { overflow-wrap: break-word; }
    ul[role='list'], ol[role='list'] { list-style: none; padding: 0; }
    a { color: var(--color-accent, #0b3ad6); }

    /* Token-driven focus ring — thickens in Accessible via --focus-ring-width */
    :focus-visible {
      outline: var(--focus-ring-width, 2px) solid var(--color-focus, #0b3ad6);
      outline-offset: 2px;
    }

    /* SAFETY NET only — Accessible theme kills motion via tokens (0ms) by design;
       this additionally honors OS reduced-motion even inside Premium. */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }
    ```

    Create `src/lib/styles/tokens/base.css` with EXACTLY (primitive tokens, then :root semantic tokens defaulting to the ACCESSIBLE palette as the safe fallback):
    ```css
    /* tokens/base.css — primitives (theme-agnostic) + :root default (Accessible) semantics. */
    :root {
      /* ---- PRIMITIVES ---- */
      --ink-950: #0f1020; --ink-900: #14110f; --ink-700: #333333;
      --ink-600: #595959; --ink-500: #6b6b6b;
      --paper-0: #ffffff; --paper-50: #f6f4f2; --paper-100: #f4f6f8;
      --blue-300: #7aa2ff; --blue-700: #0b3ad6; --blue-800: #082da0;
      --surface-dark: #1a1b2e; --border-dark: #3a3c55; --text-dim: #c7c9d9;

      --space-1: 0.25rem; --space-2: 0.5rem; --space-3: 0.75rem; --space-4: 1rem;
      --space-6: 1.5rem; --space-8: 2rem; --space-12: 3rem; --space-16: 4rem;

      --dur-0: 0ms; --dur-fast: 150ms; --dur-base: 250ms; --dur-slow: 450ms;
      --ease-linear: linear;
      --ease-standard: cubic-bezier(0.2, 0, 0, 1);
      --ease-emphasized: cubic-bezier(0.2, 0, 0, 1);

      --font-system: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      --font-serif: ui-serif, Georgia, "Times New Roman", serif;

      /* ---- SEMANTIC DEFAULTS = ACCESSIBLE (safe fallback) ---- */
      --color-bg: var(--paper-0);
      --color-surface: var(--paper-100);
      --color-text: var(--ink-900);
      --color-text-muted: var(--ink-700);
      --color-accent: var(--blue-700);
      --color-accent-hover: var(--blue-800);
      --color-on-accent: var(--paper-0);
      --color-border: var(--ink-600);
      --color-focus: var(--blue-700);

      --font-body: var(--font-system);
      --font-heading: var(--font-system);
      --font-size-base: 1.125rem;        /* 18px — larger for readability */
      --type-scale-ratio: 1.2;
      --leading: 1.7;
      --font-weight-body: 400;
      --font-weight-heading: 700;
      --letter-spacing-heading: normal;
      --measure: 60ch;

      --space-section: var(--space-16);  /* generous 4rem */
      --space-block: var(--space-6);
      --radius: 4px;

      --motion-duration: var(--dur-0);   /* Accessible: motion OFF by design */
      --motion-duration-slow: var(--dur-0);
      --motion-ease: var(--ease-linear);
      --motion-distance: 0px;
      --focus-ring-width: 3px;
    }
    ```
  </action>
  <verify>
    <automated>grep -q "prefers-reduced-motion" src/lib/styles/reset.css && grep -q ":focus-visible" src/lib/styles/reset.css && grep -q -- "--color-bg: var(--paper-0)" src/lib/styles/tokens/base.css && grep -q -- "--motion-duration: var(--dur-0)" src/lib/styles/tokens/base.css</automated>
  </verify>
  <acceptance_criteria>
    - `grep "box-sizing: border-box" src/lib/styles/reset.css` present AND `grep ":focus-visible" src/lib/styles/reset.css` present
    - `grep "prefers-reduced-motion: reduce" src/lib/styles/reset.css` present (safety net)
    - `grep -- "--font-size-base: 1.125rem" src/lib/styles/tokens/base.css` present (18px accessible default)
    - `grep -- "--color-text: var(--ink-900)" src/lib/styles/tokens/base.css` present AND `grep -- "--color-bg: var(--paper-0)" src/lib/styles/tokens/base.css` present
    - `grep -- "--motion-duration: var(--dur-0)" src/lib/styles/tokens/base.css` present (default = accessible = no motion)
    - `grep -- "--space-section: var(--space-16)" src/lib/styles/tokens/base.css` present
  </acceptance_criteria>
  <done>reset.css (modern reset + token-driven focus + reduced-motion safety net) and tokens/base.css (primitives + Accessible :root semantic defaults) exist with the exact concrete values.</done>
</task>

<task type="auto">
  <name>Task 3: Premium + Accessible peer theme files, wire imports into +layout.svelte, prove THEME-03</name>
  <read_first>
    - .planning/phases/02-design-system-dual-theme/02-RESEARCH.md ("Pattern 3", "Code Examples: Importing the token layers", "Anti-Patterns: Accessible-as-fallback")
    - src/routes/+layout.svelte (add CSS imports; preserve the favicon import + {@render children()})
    - src/lib/styles/tokens/base.css (semantic token NAMES to override — created in Task 2)
  </read_first>
  <files>src/lib/styles/theme-premium.css, src/lib/styles/theme-accessible.css, src/routes/+layout.svelte</files>
  <action>
    Create `src/lib/styles/theme-accessible.css` with EXACTLY (explicit peer file re-declaring the Accessible semantics scoped to the attribute; contrast verified: text #1a1a1a on #ffffff ~17:1 AAA, accent #0b3ad6 on #ffffff ~8.1:1 AAA, white on accent ~8.1:1 AAA, border #595959 on #ffffff ~7:1):
    ```css
    /* theme-accessible.css — a COMPLETE peer design: light, high-contrast, calm, no motion. */
    :root[data-theme='accessible'] {
      --color-bg: #ffffff;
      --color-surface: #f4f6f8;
      --color-text: #1a1a1a;            /* ~17:1 on bg (AAA) */
      --color-text-muted: #333333;      /* ~12.6:1 on bg (AAA) */
      --color-accent: #0b3ad6;          /* ~8.1:1 on bg (AAA) */
      --color-accent-hover: #082da0;
      --color-on-accent: #ffffff;       /* ~8.1:1 on accent (AAA) */
      --color-border: #595959;          /* ~7:1 on bg */
      --color-focus: #0b3ad6;

      --font-body: var(--font-system);
      --font-heading: var(--font-system);
      --font-size-base: 1.125rem;       /* 18px */
      --type-scale-ratio: 1.2;
      --leading: 1.7;
      --font-weight-body: 400;
      --font-weight-heading: 700;
      --letter-spacing-heading: normal;
      --measure: 60ch;

      --space-section: 4rem;
      --space-block: 1.5rem;
      --radius: 4px;

      --motion-duration: 0ms;           /* motion OFF by design (not display:none) */
      --motion-duration-slow: 0ms;
      --motion-ease: linear;
      --motion-distance: 0px;
      --focus-ring-width: 3px;          /* thicker, more visible focus */
    }
    ```

    Create `src/lib/styles/theme-premium.css` with EXACTLY (dark, editorial, animated peer; contrast verified: text #f6f4f2 on #0f1020 ~17:1, muted #c7c9d9 ~11.9:1, accent #7aa2ff on bg ~7.5:1):
    ```css
    /* theme-premium.css — a COMPLETE peer design: dark, editorial, animated. */
    :root[data-theme='premium'] {
      --color-bg: #0f1020;
      --color-surface: #1a1b2e;
      --color-text: #f6f4f2;            /* ~17:1 on bg */
      --color-text-muted: #c7c9d9;      /* ~11.9:1 on bg */
      --color-accent: #7aa2ff;          /* ~7.5:1 on bg */
      --color-accent-hover: #a9c2ff;
      --color-on-accent: #0f1020;       /* ~7.5:1 on accent */
      --color-border: #3a3c55;
      --color-focus: #7aa2ff;

      --font-body: var(--font-system);
      --font-heading: var(--font-serif);   /* distinct heading typeface family */
      --font-size-base: 1rem;              /* 16px — differs from Accessible's 18px */
      --type-scale-ratio: 1.28;            /* more dramatic scale */
      --leading: 1.5;
      --font-weight-body: 400;
      --font-weight-heading: 600;
      --letter-spacing-heading: -0.02em;   /* tighter, editorial */
      --measure: 68ch;

      --space-section: 3rem;               /* tighter than Accessible's 4rem */
      --space-block: 1rem;
      --radius: 12px;                      /* rounder, softer */

      --motion-duration: 250ms;            /* genuine motion */
      --motion-duration-slow: 450ms;
      --motion-ease: cubic-bezier(0.2, 0, 0, 1);
      --motion-distance: 12px;
      --focus-ring-width: 2px;
    }
    ```

    Update `src/routes/+layout.svelte` to import the four layers IN ORDER (Vite hashes + base-prefixes them). Preserve the existing favicon import, `$props()`, `<svelte:head>` and `{@render children()}`. Result EXACTLY:
    ```svelte
    <script lang="ts">
      import '$lib/styles/reset.css';
      import '$lib/styles/tokens/base.css';
      import '$lib/styles/theme-premium.css';
      import '$lib/styles/theme-accessible.css';
      import favicon from '$lib/assets/favicon.svg';

      let { children } = $props();
    </script>

    <svelte:head>
      <link rel="icon" href={favicon} />
    </svelte:head>

    {@render children()}
    ```

    Then prove the build is green and THEME-03 passes:
    ```bash
    npm run check
    npm run build
    npx playwright test --config playwright.theme.config.ts -g "peer designs"
    ```
    Anti-pattern guard: the two theme files MUST have independent color/type/space/motion VALUES — never define only Premium and strip it for Accessible.
  </action>
  <verify>
    <automated>grep -q ":root\[data-theme='premium'\]" src/lib/styles/theme-premium.css && grep -q ":root\[data-theme='accessible'\]" src/lib/styles/theme-accessible.css && grep -q "\$lib/styles/theme-accessible.css" src/routes/+layout.svelte && npm run build && npx playwright test --config playwright.theme.config.ts -g "peer designs"</automated>
  </verify>
  <acceptance_criteria>
    - `grep -- "--color-bg: #0f1020" src/lib/styles/theme-premium.css` present AND `grep -- "--color-bg: #ffffff" src/lib/styles/theme-accessible.css` present (palettes differ)
    - `grep -- "--font-size-base: 1rem" src/lib/styles/theme-premium.css` present AND `grep -- "--font-size-base: 1.125rem" src/lib/styles/theme-accessible.css` present (typography differs)
    - `grep -- "--space-section: 3rem" src/lib/styles/theme-premium.css` present AND `grep -- "--space-section: 4rem" src/lib/styles/theme-accessible.css` present (spacing differs)
    - `grep -- "--motion-duration: 250ms" src/lib/styles/theme-premium.css` present AND `grep -- "--motion-duration: 0ms" src/lib/styles/theme-accessible.css` present (motion differs, as tokens)
    - `grep -- "--font-heading: var(--font-serif)" src/lib/styles/theme-premium.css` present (distinct heading family)
    - +layout.svelte imports all four CSS files in order reset → base → theme-premium → theme-accessible AND retains `import favicon` and `{@render children()}`
    - `npm run build` exits 0 (static build stays green)
    - `npx playwright test --config playwright.theme.config.ts -g "peer designs"` exits 0 (THEME-03 proven)
  </acceptance_criteria>
  <done>Both peer theme files exist with independent contrast/type/space/motion values; +layout.svelte imports the four layers in order; build is green and the THEME-03 peer-designs E2E test passes.</done>
</task>

</tasks>

<verification>
- `npm run build` exits 0 with the four CSS layers imported (fully static, no un-prerendered route).
- `npx playwright test --config playwright.theme.config.ts -g "peer designs"` passes: premium vs accessible differ in `--color-bg`, `--color-text`, `--font-size-base`, `--space-section`, and `--motion-duration`, with Accessible `--motion-duration: 0ms`.
- Vitest config present (`environment: 'jsdom'`), jsdom installed, test:unit/test:theme scripts added; theme.test.ts + e2e/theme.spec.ts scaffolds exist.
- Phase-1 harness (playwright.config.ts, tests/) is untouched.
</verification>

<success_criteria>
- Two complete peer token sets exist (Accessible light/high-contrast/no-motion; Premium dark/editorial/animated), differing across all four axes THEME-03 requires.
- The Accessible values are the :root safe fallback; flipping `data-theme` re-skins with zero JS.
- Phase-2 test infrastructure is in place for 02-02/02-03 to flip their slices green.
</success_criteria>

<output>
After completion, create `.planning/phases/02-design-system-dual-theme/02-01-SUMMARY.md` recording: the exact token values chosen for each theme and their contrast ratios, the four-layer import order in +layout.svelte, the Vitest+Playwright harness commands (`npm run test:unit`, `npm run test:theme`), and confirmation the THEME-03 peer-designs test is green while store/toggle tests remain RED for 02-02/02-03.
</output>
