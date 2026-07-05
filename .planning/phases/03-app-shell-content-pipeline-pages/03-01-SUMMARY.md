---
phase: 03-app-shell-content-pipeline-pages
plan: 01
subsystem: ui
tags: [sveltekit, svelte5, accessibility, wcag, landmarks, playwright, app-shell, disclosure-nav]

# Dependency graph
requires:
  - phase: 01-foundation-static-deploy
    provides: static adapter, strict prerender, base-path model, Playwright local harness
  - phase: 02-design-system-dual-theme
    provides: token CSS layers (reset/base/theme-premium/theme-accessible), ThemeToggle component
provides:
  - Accessible app shell in +layout.svelte (skip-link -> main#main-content[tabindex=-1] -> Header/Footer)
  - Single-source primary nav (nav.ts) with base-prefixed rendering convention
  - Header.svelte responsive keyboard-operable disclosure nav with relocated ThemeToggle
  - Footer.svelte landmark (footer nav + contact email + attribution)
  - Token-only global utilities (app.css): skip-link, sr-only, button, container, scroll-margin
  - Five strict-prerender route stubs (programs, get-involved, events, contact, blog)
  - e2e/shell.spec.ts A11Y-02/03/04 + PAGE-08 gate + playwright.content.config.ts base-path harness
affects: [03-02-content-pipeline, 03-03-home-about-programs, 03-04-getinvolved-events-contact, 03-05-blog-index, 06-a11y-hardening]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "App shell owns all landmarks + skip-link once; content pages inherit semantics"
    - "nav.ts single source of truth; every internal href rendered as {base}{item.href}"
    - "Responsive disclosure nav: aria-expanded/aria-controls, Escape returns focus, hidden attr + desktop CSS override"
    - "Playwright split harness: theme config (base='') ignores *.base.spec.ts; content config runs sub-path *.base.spec.ts"

key-files:
  created:
    - src/lib/data/nav.ts
    - src/lib/styles/app.css
    - src/lib/components/Header.svelte
    - src/lib/components/Footer.svelte
    - e2e/shell.spec.ts
    - playwright.content.config.ts
    - src/routes/programs/+page.svelte
    - src/routes/get-involved/+page.svelte
    - src/routes/events/+page.svelte
    - src/routes/contact/+page.svelte
    - src/routes/blog/+page.svelte
  modified:
    - src/routes/+layout.svelte
    - playwright.theme.config.ts
    - package.json

key-decisions:
  - "Disclosure menu uses the HTML hidden attribute for tab-order removal when closed; desktop @media overrides with .menu[hidden]{display:flex} so the list always shows >=48rem"
  - "Target-size test scoped to :visible controls — the display:none disclosure button on desktop has a null boundingBox and is not a tabbable target"
  - "ThemeToggle mount moved into Header (component unchanged); it remains the single app-wide toggle with its own aria-live region"

patterns-established:
  - "Base-prefix convention: import { base } from '$app/paths'; render href=\"{base}{item.href}\" for every internal link"
  - "main#main-content[tabindex=-1] so the skip link MOVES focus, not just scrolls"
  - "Distinct nav landmarks: aria-label=Primary (header) vs aria-label=Footer"

requirements-completed: [PAGE-08, A11Y-02, A11Y-03, A11Y-04]

# Metrics
duration: 34min
completed: 2026-07-05
---

# Phase 3 Plan 01: App Shell, Landmarks & Nav Summary

**Token-driven accessible SvelteKit app shell — skip-link that moves focus into `main#main-content[tabindex=-1]`, one header/nav/main/footer landmark set, a keyboard-operable responsive disclosure Header with the relocated ThemeToggle, a Footer, five strict-prerender route stubs, and a green Playwright A11Y-02/03/04 + PAGE-08 gate.**

## Performance

- **Duration:** 34 min
- **Started:** 2026-07-05T02:33:02Z
- **Completed:** 2026-07-05T03:07:41Z
- **Tasks:** 3
- **Files modified:** 14 (11 created, 3 modified)

## Accomplishments
- App shell established ONCE in `+layout.svelte`: skip-link → `<main id="main-content" tabindex="-1">` → Header/Footer, with the 4 Phase-2 token CSS imports preserved in order + `app.css` appended.
- Header disclosure nav is fully keyboard operable: `aria-expanded`/`aria-controls`, Escape closes and returns focus to the toggle, active link marked with `aria-current="page"`, all targets ≥44px, visible focus ring; ThemeToggle relocated inside it (component untouched).
- `nav.ts` single source of truth (7 items) with base-prefixed rendering; five route stubs so strict prerender resolves the whole nav.
- `e2e/shell.spec.ts` (12 tests) green across all 7 routes; Phase-2 `theme.spec.ts` (5 tests) still green — shell refactor didn't regress theming.

## Task Commits

Each task was committed atomically:

1. **Task 1: Route stubs, shell a11y spec, base-path harness** - `4f72136` (test)
2. **Task 2: Nav single-source, token utilities, Header/Footer** - `e37121e` (feat)
3. **Task 3: Wire the accessible app shell into +layout** - `70cca73` (feat)

**Plan metadata:** see final docs commit.

## Files Created/Modified
- `src/routes/+layout.svelte` - Accessible shell: 4 token imports + app.css, skip-link, Header, main#main-content, Footer; top-level ThemeToggle removed
- `src/lib/components/Header.svelte` - Header landmark + responsive disclosure nav (aria-expanded/controls, Escape returns focus, aria-current) + relocated ThemeToggle
- `src/lib/components/Footer.svelte` - Footer landmark with footer nav, contact email, attribution
- `src/lib/data/nav.ts` - Single source of truth for the 7 primary nav items (un-prefixed hrefs)
- `src/lib/styles/app.css` - Token-only global utilities: skip-link, sr-only, button, container, WCAG 2.4.11 scroll-margin
- `src/routes/{programs,get-involved,events,contact,blog}/+page.svelte` - Strict-prerender route stubs (single h1 + placeholder)
- `e2e/shell.spec.ts` - A11Y-02/03/04 + PAGE-08 shell gate across all 7 routes
- `playwright.content.config.ts` - Sub-path deep-link harness (BASE_PATH via webServer.env, runs *.base.spec.ts)
- `playwright.theme.config.ts` - Added `testIgnore: '**/*.base.spec.ts'`
- `package.json` - Added `test:e2e` and `test:base` scripts (existing scripts untouched)

## Decisions Made
- Disclosure menu uses the HTML `hidden` attribute for tab-order removal when closed; a desktop `@media (min-width:48rem)` rule (`.menu[hidden]{display:flex}`) keeps the list visible ≥48rem regardless of `open`.
- ThemeToggle mount moved into Header per STATE.md decision; component, theme store, and 4 CSS token files unchanged.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Target-size test scoped to visible controls**
- **Found during:** Task 1 (writing e2e/shell.spec.ts) / confirmed Task 3 gate
- **Issue:** The plan's target-size test iterated every `nav[aria-label="Primary"] a, button` and asserted `boundingBox()` not-null. The Header (same plan) hides `.nav-toggle` via `display:none` on desktop; Playwright returns `null` for a display:none box, so the assertion would fail at the default desktop viewport.
- **Fix:** Scoped that one selector to `a:visible, button:visible`, preserving the WCAG 2.5.8 intent (every *visible* interactive target ≥24px). All other spec text is verbatim.
- **Files modified:** e2e/shell.spec.ts
- **Verification:** `interactive targets are at least 24x24 CSS px` passes.
- **Committed in:** 4f72136 (Task 1 commit)

**2. [Rule 1 - Bug] Silenced a11y lint on the disclosure Escape handler**
- **Found during:** Task 3 (`npm run check`)
- **Issue:** `svelte-check` warned `a11y_no_noninteractive_element_interactions` on the `<nav onkeydown={onKeydown}>` Escape handler (my Task-2 code).
- **Fix:** Added a scoped `<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->`; the disclosure legitimately needs container-level Escape capture.
- **Files modified:** src/lib/components/Header.svelte
- **Verification:** `npm run check` warning cleared for Header.
- **Committed in:** 70cca73 (Task 3 commit)

**3. [Rule 3 - Blocking] Killed an orphaned preview server squatting port 4173**
- **Found during:** Task 3 (running the shell Playwright gate)
- **Issue:** Playwright's `reuseExistingServer` latched onto a leftover `vite preview` process (PID 13440) from the sibling `diversityincludesdisability_four` project already listening on 4173. The first gate run tested that wrong build (nav showed "Services", "Skip to navigation", a different ThemeToggle) → 9 false failures.
- **Fix:** Confirmed the PID was an orphaned sibling-project preview (via CommandLine), stopped it, freed the port, re-ran — 12/12 passed.
- **Files modified:** none (environmental).
- **Verification:** Re-run of `e2e/shell.spec.ts` = 12 passed.

### Out-of-scope (deferred, NOT fixed)

- `tests/deploy.smoke.spec.ts:4` — pre-existing `Cannot find name 'process'` svelte-check error (Phase-1 file). Does not block `npm run build`. Logged to `.planning/phases/03-app-shell-content-pipeline-pages/deferred-items.md`.

---

**Total deviations:** 3 auto-fixed (2 bug, 1 blocking) + 1 out-of-scope deferral
**Impact on plan:** All fixes were necessary for a green gate and correct a11y semantics. No scope creep — spec assertions and Header/Footer behavior match the plan exactly.

## Issues Encountered
- The port-4173 collision with the sibling project produced a confusing first run; resolved by inspecting the process command line and freeing the port (see Deviation 3). The split-harness `testIgnore`/`testMatch` design remains intact.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Shell, landmarks, skip-link focus, base-prefixing, and the 7-route nav are established; content plans (03-02/03/04/05) fill the stubs and must keep `e2e/shell.spec.ts` green.
- `test:e2e` (root) and `test:base` (sub-path) harnesses are wired for later specs.

---
*Phase: 03-app-shell-content-pipeline-pages*
*Completed: 2026-07-05*

## Self-Check: PASSED

All 13 listed files exist and all 3 task commits (4f72136, e37121e, 70cca73) are present in history.
