---
phase: 03-app-shell-content-pipeline-pages
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - playwright.theme.config.ts
  - playwright.content.config.ts
  - e2e/shell.spec.ts
  - src/routes/programs/+page.svelte
  - src/routes/get-involved/+page.svelte
  - src/routes/events/+page.svelte
  - src/routes/contact/+page.svelte
  - src/routes/blog/+page.svelte
  - src/lib/data/nav.ts
  - src/lib/styles/app.css
  - src/lib/components/Header.svelte
  - src/lib/components/Footer.svelte
  - src/routes/+layout.svelte
autonomous: true
requirements: [PAGE-08, A11Y-02, A11Y-03, A11Y-04]
must_haves:
  truths:
    - "Pressing Tab on any page reaches a 'Skip to main content' link FIRST, and activating it moves keyboard focus into <main> (not just scrolls)"
    - "Every page has exactly one <header>, one primary <nav>, one <main id=\"main-content\" tabindex=\"-1\">, and one <footer> landmark, with a single <h1> per page"
    - "All seven routes (/, /about, /programs, /get-involved, /events, /blog, /contact) are reachable by clicking header nav links and the build prerenders every one (strict prerender green)"
    - "The responsive nav disclosure button exposes aria-expanded, is controlled by aria-controls, closes on Escape and returns focus to itself, and every nav link/control is >=24px and shows a visible focus ring"
    - "The Phase-2 ThemeToggle is now mounted inside the Header (removed from top-of-layout) and still toggles the theme, unchanged"
  artifacts:
    - path: "src/routes/+layout.svelte"
      provides: "App shell: 4 CSS token imports + app.css, skip-link, Header, main landmark, Footer"
      contains: "id=\"main-content\""
    - path: "src/lib/components/Header.svelte"
      provides: "header>nav disclosure with aria-expanded/aria-controls/Escape + relocated ThemeToggle + active aria-current"
      contains: "aria-expanded"
    - path: "src/lib/components/Footer.svelte"
      provides: "footer landmark with footer nav + attribution + contact email"
      contains: "emanrimawi@gmail.com"
    - path: "src/lib/data/nav.ts"
      provides: "Single source of truth for the 7 nav items (label + un-prefixed href)"
      contains: "get-involved"
    - path: "src/lib/styles/app.css"
      provides: "Token-driven global utilities: .skip-link, .sr-only, .button, .container, focus + scroll-margin"
      contains: ".skip-link"
    - path: "e2e/shell.spec.ts"
      provides: "Playwright A11Y-02/03/04 + PAGE-08 shell spec across all 7 pages"
      contains: "toBeFocused"
  key_links:
    - from: "src/routes/+layout.svelte"
      to: "src/lib/components/Header.svelte"
      via: "import + <Header /> render above <main>"
      pattern: "<Header"
    - from: "src/lib/components/Header.svelte"
      to: "src/lib/data/nav.ts"
      via: "import navItems, render base-prefixed links"
      pattern: "navItems"
    - from: "src/lib/components/Header.svelte"
      to: "src/lib/theme/ThemeToggle.svelte"
      via: "relocated mount inside header"
      pattern: "ThemeToggle"
---

<objective>
Build the token-driven accessible app shell in `+layout.svelte`: a skip-link that actually moves focus into `<main id="main-content" tabindex="-1">`, exactly one header/nav/main/footer landmark set, a responsive keyboard-operable disclosure Header (with the Phase-2 ThemeToggle relocated into it) and a Footer, all composed ONLY from the existing Phase-2 CSS custom properties. Also stub the five missing routes so the full nav resolves under strict prerender, and stand up the shell Playwright spec (A11Y-02/03/04 + PAGE-08) that later plans keep green.

Purpose: Landmarks + heading structure + focus behavior are established ONCE in the layout so the seven content pages inherit correct semantics instead of retrofitting them seven times.
Output: `+layout.svelte` shell; `Header.svelte`/`Footer.svelte`; `nav.ts`; `app.css` global utilities; five route stubs; `e2e/shell.spec.ts`; two Playwright configs wired.

SCOPE FENCE: NO new design system (compose from `src/lib/styles/tokens/base.css` + the two theme files only — do NOT add Tailwind or new token names). Do NOT modify `ThemeToggle.svelte`, `theme.svelte.ts`, the 4 existing CSS files, `app.html`, `+layout.ts`, or `svelte.config.js`. Do NOT install any dependency (mdsvex/shiki belong to 03-02). Content pages are STUBS here (one `<h1>` + one placeholder line); real content is 03-03/04/05.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/03-app-shell-content-pipeline-pages/03-RESEARCH.md
@.planning/phases/03-app-shell-content-pipeline-pages/03-VALIDATION.md
@src/routes/+layout.svelte
@src/lib/theme/ThemeToggle.svelte
@src/lib/styles/tokens/base.css
@playwright.theme.config.ts

<key_facts>
- Sub-path deploy: EVERY internal href MUST be base-prefixed. `import { base } from '$app/paths'`; render `href="{base}{item.href}"`. Bare `/about` 404s on Pages. (RESEARCH Pitfall 1, HIGH.)
- `<main tabindex="-1">` is REQUIRED so the skip link MOVES focus (not just scrolls). (RESEARCH Pitfall 6.)
- strict prerender (`strict:true`) + a full nav means the crawler follows every nav link — so ALL 7 routes must exist or `npm run build` fails. This plan stubs the 5 missing ones (/, /about already exist).
- ThemeToggle is UNCHANGED — only its mount MOVES from top-of-+layout into Header (STATE.md line 79). It already ships its own aria-live region + 44px target.
- Existing tokens available: --space-*, --color-bg/surface/text/text-muted/accent/on-accent/border/focus, --focus-ring-width, --radius, --measure, --space-section, --font-heading. Do NOT invent new ones.
- Local E2E harness = `playwright.theme.config.ts` (build+preview at root, base=''). Base-path specs (`*.base.spec.ts`) run under a separate config so the sub-path deep-link can be exercised.
- Playwright `webServer.env` sets BASE_PATH cross-platform (Windows-safe) — no `cross-env` needed.
</key_facts>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Wave 0 — route stubs (strict-prerender safe), shell spec, base-path Playwright config</name>
  <read_first>
    - .planning/phases/03-app-shell-content-pipeline-pages/03-RESEARCH.md ("Validation Architecture", "Phase Requirements -> Test Map", "Wave 0 gaps", "Responsive disclosure nav")
    - .planning/phases/03-app-shell-content-pipeline-pages/03-VALIDATION.md
    - playwright.theme.config.ts (Phase-2 local harness — extend, do NOT break the theme spec)
    - src/routes/+page.svelte and src/routes/about/+page.svelte (existing pattern: `import { base } from '$app/paths'`, `<h1>`)
    - package.json (scripts block)
  </read_first>
  <files>package.json, playwright.theme.config.ts, playwright.content.config.ts, e2e/shell.spec.ts, src/routes/programs/+page.svelte, src/routes/get-involved/+page.svelte, src/routes/events/+page.svelte, src/routes/contact/+page.svelte, src/routes/blog/+page.svelte</files>
  <action>
    Create the FIVE missing route stubs so the full nav resolves under strict prerender. Each is minimal (one `<h1>`, one placeholder line) and will be fleshed out by 03-02/03/04/05. Use EXACTLY this shape (swap the slug/title per file):

    `src/routes/programs/+page.svelte`:
    ```svelte
    <svelte:head><title>Programs & Services — Diversity Includes Disability</title></svelte:head>
    <h1>Programs & Services</h1>
    <p>Content coming in this phase.</p>
    ```
    Repeat for:
    - `src/routes/get-involved/+page.svelte` — title "Get Involved — Diversity Includes Disability", `<h1>Get Involved</h1>`
    - `src/routes/events/+page.svelte` — title "Events — Diversity Includes Disability", `<h1>Events</h1>`
    - `src/routes/contact/+page.svelte` — title "Contact — Diversity Includes Disability", `<h1>Contact</h1>`
    - `src/routes/blog/+page.svelte` — title "News — Diversity Includes Disability", `<h1>News</h1>`

    Extend `playwright.theme.config.ts`: add `testIgnore: '**/*.base.spec.ts'` to the config object (so root-base specs never run the sub-path deep-link specs). Change NOTHING else in that file.

    Create `playwright.content.config.ts` at repo root (builds+previews with BASE_PATH set, serving under the sub-path; only runs `*.base.spec.ts`):
    ```ts
    import { defineConfig, devices } from '@playwright/test';

    // Sub-path deep-link harness: build + preview WITH BASE_PATH so /diversityincludesdisability_one/... is exercised.
    // webServer.env is cross-platform (no cross-env needed). Only runs *.base.spec.ts.
    const BASE_PATH = '/diversityincludesdisability_one';
    export default defineConfig({
      testDir: 'e2e',
      testMatch: '**/*.base.spec.ts',
      timeout: 60_000,
      use: { baseURL: `http://localhost:4174${BASE_PATH}/` },
      reporter: 'list',
      webServer: {
        command: 'npm run build && npm run preview -- --port 4174 --strictPort',
        env: { BASE_PATH },
        url: `http://localhost:4174${BASE_PATH}/`,
        timeout: 180_000,
        reuseExistingServer: !process.env.CI
      },
      projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
    });
    ```

    Add scripts to `package.json` "scripts" (keep all existing scripts intact):
    ```json
    "test:e2e": "playwright test --config playwright.theme.config.ts",
    "test:base": "playwright test --config playwright.content.config.ts"
    ```

    Create `e2e/shell.spec.ts` — the shell spec covering A11Y-02/03/04 + PAGE-08. It iterates all seven routes. It goes GREEN in this plan (stubs satisfy heading/landmark/target assertions; content plans keep it green):
    ```ts
    import { test, expect } from '@playwright/test';

    const ROUTES = ['/', '/about/', '/programs/', '/get-involved/', '/events/', '/blog/', '/contact/'];

    // --- A11Y-02: skip link is first focusable and MOVES focus into <main> ---
    test('skip link is first tab stop and moves focus into main (A11Y-02)', async ({ page }) => {
      await page.goto('./');
      await page.keyboard.press('Tab');
      const skip = page.getByRole('link', { name: /skip to main content/i });
      await expect(skip).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(page.locator('main#main-content')).toBeFocused();
    });

    // --- A11Y-03: one h1 + one of each landmark on every page ---
    for (const path of ROUTES) {
      test(`landmarks + single h1 on ${path} (A11Y-03)`, async ({ page }) => {
        await page.goto(`.${path}`);
        await expect(page.locator('h1')).toHaveCount(1);
        await expect(page.locator('body > header, header')).toHaveCount(1);
        await expect(page.locator('main#main-content')).toHaveCount(1);
        await expect(page.locator('footer')).toHaveCount(1);
        await expect(page.locator('nav[aria-label="Primary"]')).toHaveCount(1);
      });
    }

    // --- A11Y-03: heading levels never skip (no h3 before an h2, etc.) ---
    test('heading order never skips a level across pages (A11Y-03)', async ({ page }) => {
      for (const path of ROUTES) {
        await page.goto(`.${path}`);
        const levels = await page.locator('h1,h2,h3,h4').evaluateAll((els) =>
          els.map((e) => Number(e.tagName[1]))
        );
        let prev = 0;
        for (const lvl of levels) {
          expect(lvl - prev).toBeLessThanOrEqual(1); // never jump more than one level deeper
          prev = lvl;
        }
      }
    });

    // --- PAGE-08: every nav item is reachable via the header nav ---
    test('all 7 pages reachable from header nav (PAGE-08)', async ({ page }) => {
      await page.goto('./');
      const nav = page.locator('nav[aria-label="Primary"]');
      for (const label of [/home/i, /about/i, /programs/i, /get involved/i, /events/i, /news/i, /contact/i]) {
        await expect(nav.getByRole('link', { name: label })).toHaveCount(1);
      }
    });

    // --- A11Y-04: disclosure nav is keyboard operable, Escape returns focus, targets >=24px ---
    test('nav disclosure: aria-expanded toggles, Escape closes + returns focus (A11Y-04)', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 800 }); // mobile: disclosure visible
      await page.goto('./');
      const toggle = page.getByRole('button', { name: /menu/i });
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await page.keyboard.press('Escape');
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect(toggle).toBeFocused();
    });

    test('interactive targets are at least 24x24 CSS px (A11Y-04 / WCAG 2.5.8)', async ({ page }) => {
      await page.goto('./');
      for (const el of await page.locator('nav[aria-label="Primary"] a, nav[aria-label="Primary"] button').all()) {
        const box = await el.boundingBox();
        expect(box, 'nav control has a box').not.toBeNull();
        expect(box!.height).toBeGreaterThanOrEqual(24);
        expect(box!.width).toBeGreaterThanOrEqual(24);
      }
    });
    ```
  </action>
  <verify>
    <automated>test -f e2e/shell.spec.ts && test -f playwright.content.config.ts && test -f src/routes/programs/+page.svelte && test -f src/routes/get-involved/+page.svelte && test -f src/routes/events/+page.svelte && test -f src/routes/contact/+page.svelte && test -f src/routes/blog/+page.svelte && grep -q "testIgnore: '\*\*/\*.base.spec.ts'" playwright.theme.config.ts && grep -q '"test:e2e"' package.json && grep -q '"test:base"' package.json</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "<h1>" src/routes/programs/+page.svelte` returns 1 (single-h1 stub) — same for get-involved/events/contact/blog stubs
    - `grep "testIgnore: '\*\*/\*.base.spec.ts'" playwright.theme.config.ts` present AND the original `webServer` block is still intact
    - `grep "testMatch: '\*\*/\*.base.spec.ts'" playwright.content.config.ts` present AND `grep "env: { BASE_PATH }" playwright.content.config.ts` present
    - `grep '"test:e2e"' package.json` present AND `grep '"test:base"' package.json` present AND the Phase-1/2 scripts (`smoke`, `test:theme`, `test:unit`) are unchanged
    - `grep "toBeFocused" e2e/shell.spec.ts` present AND `grep "main#main-content" e2e/shell.spec.ts` present AND `grep "PAGE-08" e2e/shell.spec.ts` present
    - No new dependency added: `grep 'mdsvex\|shiki\|tailwind' package.json` returns NOTHING
  </acceptance_criteria>
  <done>Five route stubs exist so strict prerender resolves the full nav; `e2e/shell.spec.ts` covers A11Y-02/03/04 + PAGE-08 across all 7 routes; `playwright.content.config.ts` (base-path harness) created; `test:e2e`/`test:base` scripts added; Phase-1/2 harness untouched.</done>
</task>

<task type="auto">
  <name>Task 2: Nav data + token-driven global utilities + Header/Footer components</name>
  <read_first>
    - .planning/phases/03-app-shell-content-pipeline-pages/03-RESEARCH.md ("Pattern 1: App shell", "Responsive disclosure nav", "Skip link", "Focus visibility + target size", "Base-prefixed nav data", "Active-link detection")
    - src/lib/theme/ThemeToggle.svelte (mount unchanged; note it renders its own aria-live region)
    - src/lib/styles/tokens/base.css (semantic token NAMES to consume — do not invent new ones)
  </read_first>
  <files>src/lib/data/nav.ts, src/lib/styles/app.css, src/lib/components/Header.svelte, src/lib/components/Footer.svelte</files>
  <action>
    Create `src/lib/data/nav.ts` (single source of truth; hrefs are UN-prefixed — consumers add `base`):
    ```ts
    // src/lib/data/nav.ts — single source of truth for primary nav. Hrefs are base-prefixed at render.
    export const navItems = [
      { href: '/',             label: 'Home' },
      { href: '/about',        label: 'About' },
      { href: '/programs',     label: 'Programs & Services' },
      { href: '/get-involved', label: 'Get Involved' },
      { href: '/events',       label: 'Events' },
      { href: '/blog',         label: 'News' },
      { href: '/contact',      label: 'Contact' }
    ] as const;
    ```

    Create `src/lib/styles/app.css` — global utilities composed ONLY from existing tokens (skip-link, sr-only, button, container, header-height + scroll-margin for WCAG 2.4.11). Add EXACTLY:
    ```css
    /* app.css — token-driven global utilities (NO new design system). */
    :root { --header-height: 5rem; }

    /* Skip link (A11Y-02 / WCAG 2.4.1): off-screen until focused, then visible. */
    .skip-link {
      position: absolute; left: var(--space-2); top: var(--space-2);
      transform: translateY(-150%);
      padding: var(--space-2) var(--space-4);
      background: var(--color-surface); color: var(--color-text);
      border: var(--focus-ring-width) solid var(--color-focus);
      border-radius: var(--radius); z-index: 1000;
    }
    .skip-link:focus { transform: translateY(0); }

    /* Screen-reader-only text (visible label for AT). */
    .sr-only {
      position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
      overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
    }

    /* Primary CTA button (also usable on <a>). >=24px target, token colors. */
    .button {
      display: inline-flex; align-items: center; justify-content: center;
      min-block-size: 44px; min-inline-size: 44px;
      padding: var(--space-3) var(--space-6);
      background: var(--color-accent); color: var(--color-on-accent);
      border: 1px solid transparent; border-radius: var(--radius);
      font: inherit; font-weight: var(--font-weight-heading); text-decoration: none;
      cursor: pointer;
    }
    .button:hover { background: var(--color-accent-hover); }
    .button.is-secondary { background: transparent; color: var(--color-accent); border-color: var(--color-border); }

    /* Content width container. */
    .container { max-inline-size: 72rem; margin-inline: auto; padding-inline: var(--space-4); }
    main .prose { max-inline-size: var(--measure); }

    /* WCAG 2.4.11 focus-not-obscured: keep anchored/focused headings clear of a sticky header. */
    :target { scroll-margin-top: calc(var(--header-height) + var(--space-4)); }
    main :is(h1, h2, h3, [tabindex]) { scroll-margin-top: calc(var(--header-height) + var(--space-4)); }
    ```

    Create `src/lib/components/Header.svelte` — header landmark + responsive disclosure nav + relocated ThemeToggle. Base-prefix every link; `aria-current="page"` on the active link; Escape closes + returns focus; disclosure button hidden on desktop via CSS; menu links removed from tab order when closed on mobile (`hidden`):
    ```svelte
    <script lang="ts">
      import { base } from '$app/paths';
      import { page } from '$app/state';
      import { navItems } from '$lib/data/nav';
      import ThemeToggle from '$lib/theme/ThemeToggle.svelte';

      let open = $state(false);
      let toggleBtn: HTMLButtonElement;

      const isCurrent = (href: string) =>
        page.url.pathname === `${base}${href}/` || page.url.pathname === `${base}${href}`;

      function onKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape' && open) { open = false; toggleBtn.focus(); }
      }
    </script>

    <header>
      <div class="container header-bar">
        <a class="brand" href="{base}/">Diversity Includes Disability</a>

        <nav aria-label="Primary" onkeydown={onKeydown}>
          <button
            bind:this={toggleBtn}
            class="nav-toggle"
            type="button"
            aria-expanded={open}
            aria-controls="primary-menu"
            onclick={() => (open = !open)}
          >
            <span class="sr-only">Menu</span>
            <span aria-hidden="true">{open ? 'Close' : 'Menu'}</span>
          </button>

          <ul id="primary-menu" class="menu" class:open hidden={!open}>
            {#each navItems as item}
              <li>
                <a
                  href="{base}{item.href}"
                  aria-current={isCurrent(item.href) ? 'page' : undefined}
                >{item.label}</a>
              </li>
            {/each}
          </ul>

          <ThemeToggle />
        </nav>
      </div>
    </header>

    <style>
      header { border-block-end: 1px solid var(--color-border); background: var(--color-bg); }
      .header-bar {
        display: flex; align-items: center; gap: var(--space-4);
        min-block-size: var(--header-height); flex-wrap: wrap;
      }
      .brand {
        font-family: var(--font-heading); font-weight: var(--font-weight-heading);
        color: var(--color-text); text-decoration: none; margin-inline-end: auto;
        min-block-size: 44px; display: inline-flex; align-items: center;
      }
      .nav-toggle {
        min-block-size: 44px; min-inline-size: 44px;
        padding: var(--space-2) var(--space-4);
        background: var(--color-surface); color: var(--color-text);
        border: 1px solid var(--color-border); border-radius: var(--radius);
        font: inherit; cursor: pointer;
      }
      .menu { list-style: none; display: flex; flex-direction: column; gap: var(--space-2); padding: 0; }
      .menu a {
        display: inline-flex; align-items: center;
        min-block-size: 44px; padding: var(--space-2) var(--space-3);
        color: var(--color-text); text-decoration: none; border-radius: var(--radius);
      }
      .menu a:hover { background: var(--color-surface); }
      .menu a[aria-current='page'] { font-weight: var(--font-weight-heading); text-decoration: underline; }
      :where(a, button):focus-visible {
        outline: var(--focus-ring-width) solid var(--color-focus); outline-offset: 2px;
      }
      /* Desktop: show the list inline, hide the disclosure button. */
      @media (min-width: 48rem) {
        .nav-toggle { display: none; }
        .menu { flex-direction: row; align-items: center; gap: var(--space-4); }
        .menu[hidden] { display: flex; } /* desktop always shows the list regardless of `open` */
      }
    </style>
    ```

    Create `src/lib/components/Footer.svelte` — footer landmark, a secondary footer nav (distinct aria-label), attribution, and the REAL contact email:
    ```svelte
    <script lang="ts">
      import { base } from '$app/paths';
      import { navItems } from '$lib/data/nav';
    </script>

    <footer>
      <div class="container footer-inner">
        <nav aria-label="Footer">
          <ul>
            {#each navItems as item}
              <li><a href="{base}{item.href}">{item.label}</a></li>
            {/each}
          </ul>
        </nav>
        <p class="contact">
          Contact: <a href="mailto:emanrimawi@gmail.com">emanrimawi@gmail.com</a>
        </p>
        <p class="attribution">&copy; Eman Rimawi-Doster. Diversity Includes Disability.</p>
      </div>
    </footer>

    <style>
      footer {
        border-block-start: 1px solid var(--color-border);
        margin-block-start: var(--space-section);
        padding-block: var(--space-8);
        background: var(--color-surface); color: var(--color-text);
      }
      .footer-inner { display: flex; flex-direction: column; gap: var(--space-4); }
      footer ul { list-style: none; display: flex; flex-wrap: wrap; gap: var(--space-4); padding: 0; }
      footer a { color: var(--color-text); min-block-size: 44px; display: inline-flex; align-items: center; }
      footer a:focus-visible { outline: var(--focus-ring-width) solid var(--color-focus); outline-offset: 2px; }
    </style>
    ```
  </action>
  <verify>
    <automated>test -f src/lib/data/nav.ts && test -f src/lib/styles/app.css && test -f src/lib/components/Header.svelte && test -f src/lib/components/Footer.svelte && grep -q "aria-expanded" src/lib/components/Header.svelte && grep -q "aria-controls=\"primary-menu\"" src/lib/components/Header.svelte && grep -q "ThemeToggle" src/lib/components/Header.svelte && grep -q "emanrimawi@gmail.com" src/lib/components/Footer.svelte && grep -q ".skip-link" src/lib/styles/app.css</automated>
  </verify>
  <acceptance_criteria>
    - `grep 'href="{base}{item.href}"' src/lib/components/Header.svelte` present (every nav link base-prefixed) AND Footer likewise
    - `grep "aria-label=\"Primary\"" src/lib/components/Header.svelte` present AND `grep "aria-label=\"Footer\"" src/lib/components/Footer.svelte` present (distinct nav landmarks)
    - `grep "aria-expanded={open}" src/lib/components/Header.svelte` AND `grep "e.key === 'Escape'" src/lib/components/Header.svelte` AND `grep "toggleBtn.focus()" src/lib/components/Header.svelte` present (disclosure + Escape-returns-focus)
    - `grep "aria-current=" src/lib/components/Header.svelte` present (active-link)
    - `grep "import ThemeToggle" src/lib/components/Header.svelte` AND `grep "<ThemeToggle" src/lib/components/Header.svelte` present (relocated, unchanged component)
    - `grep 'min-block-size: 44px' src/lib/components/Header.svelte` present (>=24px target floor, 44 chosen)
    - `grep '.button' src/lib/styles/app.css` AND `grep '.container' src/lib/styles/app.css` AND `grep 'scroll-margin-top' src/lib/styles/app.css` present, and every value references a `var(--...)` token or a literal layout value only (no new color hexes)
    - ThemeToggle.svelte and the 4 token/theme CSS files are NOT modified by this task
  </acceptance_criteria>
  <done>`nav.ts` single source; `app.css` token-only utilities (skip-link/sr-only/button/container/scroll-margin); `Header.svelte` (base-prefixed disclosure nav, aria-expanded/controls, Escape returns focus, active aria-current, relocated ThemeToggle) and `Footer.svelte` (footer nav + email + attribution) all built from existing tokens.</done>
</task>

<task type="auto">
  <name>Task 3: Wire the shell into +layout.svelte and prove A11Y-02/03/04 + PAGE-08</name>
  <read_first>
    - src/routes/+layout.svelte (CURRENT: 4 CSS imports + favicon + top-level <ThemeToggle/>; you KEEP the 4 imports, ADD app.css, REMOVE the top-level ThemeToggle since Header now owns it)
    - src/lib/components/Header.svelte and Footer.svelte (created in Task 2)
    - e2e/shell.spec.ts (the gate created in Task 1)
  </read_first>
  <files>src/routes/+layout.svelte</files>
  <action>
    Replace `src/routes/+layout.svelte` with EXACTLY (KEEP the four token CSS imports in order, ADD `app.css` after them, ADD Header/Footer imports, REMOVE the top-of-layout `<ThemeToggle/>` — Header renders it now; add skip-link + `<main id="main-content" tabindex="-1">`):
    ```svelte
    <script lang="ts">
      import '$lib/styles/reset.css';
      import '$lib/styles/tokens/base.css';
      import '$lib/styles/theme-premium.css';
      import '$lib/styles/theme-accessible.css';
      import '$lib/styles/app.css';
      import favicon from '$lib/assets/favicon.svg';
      import Header from '$lib/components/Header.svelte';
      import Footer from '$lib/components/Footer.svelte';

      let { children } = $props();
    </script>

    <svelte:head>
      <link rel="icon" href={favicon} />
    </svelte:head>

    <a class="skip-link" href="#main-content">Skip to main content</a>
    <Header />
    <main id="main-content" tabindex="-1">
      <div class="container prose">
        {@render children()}
      </div>
    </main>
    <Footer />
    ```

    Then prove structure + type-safety + the shell spec:
    ```bash
    npm run check
    npm run build
    npx playwright test --config playwright.theme.config.ts e2e/shell.spec.ts
    ```
    Guard: the four token CSS imports MUST remain in the exact order reset -> base -> theme-premium -> theme-accessible (Phase-2 layering); `<main>` MUST keep `id="main-content"` and `tabindex="-1"`; there must be exactly one top-level `<ThemeToggle/>` in the app and it lives in Header, not the layout.
  </action>
  <verify>
    <automated>grep -q 'id="main-content"' src/routes/+layout.svelte && grep -q 'tabindex="-1"' src/routes/+layout.svelte && grep -q 'class="skip-link" href="#main-content"' src/routes/+layout.svelte && grep -q "import '\$lib/styles/theme-accessible.css'" src/routes/+layout.svelte && grep -q "import '\$lib/styles/app.css'" src/routes/+layout.svelte && grep -q "<Header" src/routes/+layout.svelte && grep -q "<Footer" src/routes/+layout.svelte && ! grep -q "import ThemeToggle" src/routes/+layout.svelte && npm run build && npx playwright test --config playwright.theme.config.ts e2e/shell.spec.ts</automated>
  </verify>
  <acceptance_criteria>
    - +layout.svelte imports all FOUR token CSS files in order reset->base->theme-premium->theme-accessible, THEN app.css (Phase-2 layering preserved)
    - `grep 'id="main-content"' src/routes/+layout.svelte` AND `grep 'tabindex="-1"' src/routes/+layout.svelte` present
    - `grep 'class="skip-link" href="#main-content"' src/routes/+layout.svelte` present AND the skip link is the first element after `<svelte:head>` (first focusable)
    - `grep "import ThemeToggle" src/routes/+layout.svelte` returns NOTHING (relocated into Header) — ThemeToggle now appears exactly once app-wide, inside Header
    - `npm run build` exits 0 (all 7 routes prerender under strict; nav resolves)
    - `npx playwright test --config playwright.theme.config.ts e2e/shell.spec.ts` exits 0 — skip-link moves focus into main, one h1 + landmarks per page, heading order valid, all 7 nav links reachable, disclosure Escape returns focus, targets >=24px
    - The Phase-2 theme spec still passes: `npx playwright test --config playwright.theme.config.ts e2e/theme.spec.ts -g "peer designs"` exits 0
  </acceptance_criteria>
  <done>`+layout.svelte` is the accessible shell (4 token imports + app.css, skip-link -> main#main-content[tabindex=-1], Header with relocated ThemeToggle, Footer); `npm run build` green with all 7 routes prerendered; `e2e/shell.spec.ts` green (A11Y-02/03/04 + PAGE-08); Phase-2 theme spec still green.</done>
</task>

</tasks>

<verification>
- `npm run build` exits 0 — all seven routes prerender under `strict:true` (nav resolves).
- `npm run test:e2e` runs `e2e/shell.spec.ts` green: skip-link moves focus into `<main>`; one h1 + one header/nav/main/footer per page; heading levels never skip; all 7 nav links reachable; disclosure toggles `aria-expanded`, Escape returns focus; nav targets >=24px.
- Phase-2 `e2e/theme.spec.ts -g "peer designs"` still green (shell refactor didn't break theming).
- ThemeToggle relocated into Header, component file unchanged; the 4 token CSS files + app.html + svelte.config.js unchanged; no new dependency installed.
</verification>

<success_criteria>
- One layout owns all landmarks + skip-link so seven pages inherit correct semantics.
- Header/Footer are fully keyboard-operable, base-prefixed, token-only, with visible focus and >=24px targets.
- The nav resolves all seven routes (stubs now; real content in 03-03/04/05).
</success_criteria>

<output>
After completion, create `.planning/phases/03-app-shell-content-pipeline-pages/03-01-SUMMARY.md` recording: the shell structure (skip-link -> main#main-content[tabindex=-1] -> Header/Footer), the nav single-source (`nav.ts`) + base-prefixing convention, the global utilities added to `app.css` (skip-link/sr-only/button/container/scroll-margin), the ThemeToggle relocation into Header, the five route stubs created for strict-prerender, and the two Playwright configs + `test:e2e`/`test:base` scripts. Note that `e2e/shell.spec.ts` is green and is the gate later plans must keep green.
</output>
