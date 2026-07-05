---
phase: 02-design-system-dual-theme
plan: 01
subsystem: ui
tags: [css-custom-properties, design-tokens, theming, dual-theme, vitest, jsdom, playwright, wcag]

# Dependency graph
requires:
  - phase: 01-foundation-static-deploy
    provides: "SvelteKit adapter-static build, base-path model (paths.relative=false), +layout.svelte shell, Playwright smoke harness in tests/"
provides:
  - "Three-layer CSS token architecture (reset -> base primitives+semantics -> theme-premium / theme-accessible)"
  - "Two complete peer themes differing across contrast, typography, spacing, AND motion (THEME-03)"
  - ":root default semantics = Accessible values (safe fallback when no data-theme attr)"
  - "Motion-as-token model (--motion-duration/-ease/-distance); Accessible = --dur-0 by design, not display:none"
  - "Phase-2 test infra: Vitest jsdom config + local build/preview Playwright harness (playwright.theme.config.ts) + full THEME-01..06 spec"
  - "test:unit and test:theme npm scripts"
affects: [02-02-no-flash-init-and-store, 02-03-accessible-theme-toggle, phase-3-shell-and-pages, phase-6-a11y-verification]

# Tech tracking
tech-stack:
  added: [jsdom]
  patterns:
    - "Primitive -> semantic -> per-theme-override token layering scoped by :root[data-theme]"
    - "Motion expressed as design tokens so Accessible theme is a genuine peer (0 duration) not a subtracted fallback"
    - "CSS imported into +layout.svelte (Vite hashes + base-prefixes) — never a hand-written <link> in app.html"
    - "Vitest scoped to src/** (excludes e2e/ + tests/) so Playwright specs never picked up by the unit runner"
    - "Separate Playwright config per environment: playwright.config.ts (live Pages smoke) vs playwright.theme.config.ts (local build+preview)"

key-files:
  created:
    - src/lib/styles/reset.css
    - src/lib/styles/tokens/base.css
    - src/lib/styles/theme-premium.css
    - src/lib/styles/theme-accessible.css
    - playwright.theme.config.ts
    - src/lib/theme/theme.test.ts
    - e2e/theme.spec.ts
  modified:
    - vite.config.ts
    - package.json
    - src/routes/+layout.svelte

key-decisions:
  - "Accessible values live in base.css :root as the safe fallback; theme-accessible.css re-declares them scoped, theme-premium.css overrides to dark — Accessible is a peer, never a subtraction"
  - "Motion is a token (--motion-duration): Accessible = var(--dur-0), Premium = var(--dur-base)/450ms via primitives; the reduced-motion @media block is a belt, not the design"
  - "Widened the accessible-motion E2E regex to accept Chromium's canonical '0s' serialization of 0ms (deviation Rule 1)"

patterns-established:
  - "Three-layer CSS custom-property token system with [data-theme] specificity override"
  - "Per-environment Playwright configs; Vitest src-scoped so runners never cross-pick specs"

requirements-completed: [THEME-03]

# Metrics
duration: 16min
completed: 2026-07-05
---

# Phase 2 Plan 01: Tokens & Dual-Theme CSS Summary

**Three-layer CSS custom-property token system shipping two complete peer themes — light/high-contrast/no-motion Accessible and dark/editorial/animated Premium — that differ across contrast, typography, spacing, and motion; plus Vitest jsdom + local-preview Playwright harness with the THEME-03 peer-designs test green.**

## Performance

- **Duration:** ~16 min
- **Started:** 2026-07-05T00:26:50Z
- **Completed:** 2026-07-05T00:43:08Z
- **Tasks:** 3
- **Files created:** 7 · **Files modified:** 3

## Accomplishments
- Two complete peer token sets, verified to differ across all four THEME-03 axes via computed-style E2E assertions.
- `:root` defaults = Accessible values, so a page with no `data-theme` attribute renders the safe theme.
- Motion modeled as tokens (`--motion-duration` etc.): Accessible resolves to `--dur-0` (zero) by design; Premium to `--dur-base` (250ms) / `--dur-slow` (450ms) through the base primitives — honoring the layering key-link.
- Four CSS layers imported into `+layout.svelte` in load order (reset → base → theme-premium → theme-accessible) so Vite hashes + base-prefixes them (no app.html `<link>`).
- Phase-2 test infrastructure stood up: Vitest jsdom block in `vite.config.ts`, `playwright.theme.config.ts` (local `npm run build && npm run preview` webServer on :4173), `test:unit`/`test:theme` scripts, unit stubs, and the full THEME-01..06 Playwright spec.
- `npm run build` stays green (fully static, adapter-static wrote `build/`).

## Token values chosen (contrast ratios)

**Accessible peer** (`:root[data-theme='accessible']`, light):
- bg `#ffffff`, text `#1a1a1a` (~17:1 AAA), muted `#333333` (~12.6:1), accent `#0b3ad6` (~8.1:1 AAA), on-accent `#ffffff` (~8.1:1), border `#595959` (~7:1)
- font-size-base `1.125rem` (18px), system font headings, section spacing `4rem`, radius `4px`, focus ring `3px`
- `--motion-duration: var(--dur-0)` → motion off by design

**Premium peer** (`:root[data-theme='premium']`, dark):
- bg `#0f1020`, text `#f6f4f2` (~17:1), muted `#c7c9d9` (~11.9:1), accent `#7aa2ff` (~7.5:1), on-accent `#0f1020`, border `#3a3c55`
- font-size-base `1rem` (16px), **serif** headings (`--font-serif`), type ratio `1.28`, letter-spacing `-0.02em`, section spacing `3rem`, radius `12px`, focus ring `2px`
- `--motion-duration: var(--dur-base)` (250ms), slow `var(--dur-slow)` (450ms), distance `12px`

## Four-layer import order (`+layout.svelte`)
`reset.css` → `tokens/base.css` → `theme-premium.css` → `theme-accessible.css` → favicon; preserves `$props()`, `<svelte:head>`, `{@render children()}`.

## Test harness commands
- `npm run test:unit` → `vitest run src/lib/theme` — currently **RED by design** (imports `./theme.svelte.ts`, which plan 02-02 creates).
- `npm run test:theme` → `playwright test --config playwright.theme.config.ts` — builds+previews locally on :4173.
- THEME-03 slice: `npx playwright test --config playwright.theme.config.ts -g "peer designs"` → **PASS** (1 passed).

## Task Commits

1. **Task 1: Wave 0 test infra (Vitest jsdom + local-preview Playwright + THEME spec)** - `f0c7091` (chore)
2. **Task 2: Modern reset + primitive tokens + Accessible :root semantic defaults** - `7205f64` (feat)
3. **Task 3: Premium + Accessible peer themes, wire imports, prove THEME-03** - `25d477e` (feat)

**Plan metadata:** _(final docs commit — see below)_

## Files Created/Modified
- `src/lib/styles/reset.css` - Andy-Bell-style reset, token-driven `:focus-visible`, reduced-motion safety net
- `src/lib/styles/tokens/base.css` - Primitive palette/space/motion tokens + `:root` Accessible semantic defaults
- `src/lib/styles/theme-premium.css` - `:root[data-theme='premium']` dark/editorial/animated overrides
- `src/lib/styles/theme-accessible.css` - `:root[data-theme='accessible']` light/high-contrast/no-motion overrides
- `src/routes/+layout.svelte` - Imports the four token layers in load order
- `vite.config.ts` - Added Vitest jsdom `test` block scoped to `src/**`, excluding `e2e/`+`tests/`
- `playwright.theme.config.ts` - Local build+preview webServer harness (testDir `e2e/`)
- `package.json` - `jsdom` dev dep + `test:unit`/`test:theme` scripts
- `src/lib/theme/theme.test.ts` - Unit stubs (RED until 02-02)
- `e2e/theme.spec.ts` - Full THEME-01..06 Playwright spec (THEME-03 green; others RED until 02-02/02-03)

## Decisions Made
- Kept Accessible as the `:root` safe fallback and as an explicit scoped peer file — structural guarantee it is never a subtracted design.
- Referenced motion durations through base primitives (`var(--dur-base)`/`var(--dur-0)`) so the layering key-link (`var(--dur-`) holds and primitives remain the single source of duration truth.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Widened accessible-motion assertion to accept Chromium's `0s` serialization**
- **Found during:** Task 3 (proving THEME-03)
- **Issue:** `getComputedStyle(...).getPropertyValue('--motion-duration')` in Chromium returns the resolved `var(--dur-0)` as the canonical string `"0s"`, not `"0ms"`. The plan's regex `/0ms|--dur-0/` rejected `"0s"`, failing the final assertion though the CSS was correct (zero duration = motion off).
- **Fix:** Changed the regex to `/^0(ms|s)?$|--dur-0/`. All other assertions (bg, text, font-size, section, motion-differ) already passed.
- **Files modified:** `e2e/theme.spec.ts`
- **Verification:** `npx playwright test --config playwright.theme.config.ts -g "peer designs"` → 1 passed.
- **Committed in:** `25d477e` (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Test-vs-browser-reality correction only; the token intent (Accessible motion = zero) is unchanged. No scope creep.

## Issues Encountered
- The first `playwright test` invocation timed out at the 5-min wall clock because the webServer ran `build && preview` before the test. Resolved by pre-starting a preview server and letting `reuseExistingServer` attach, then re-running the slice (passes in ~1.5s). No code change required; the harness itself is correct for CI.
- `npm run check` reports two expected-RED errors in `theme.test.ts` (`Cannot find module './theme.svelte.ts'`, created in 02-02) and one pre-existing out-of-scope error in `tests/deploy.smoke.spec.ts` (`Cannot find name 'process'` — Phase-1 harness, `@types/node` not installed). The pre-existing one is logged to `deferred-items.md`; neither affects `npm run build`.

## Known Stubs
- `src/lib/theme/theme.test.ts` — intentional RED scaffold: imports `./theme.svelte.ts`, which is created by plan **02-02**. Documented in the plan; not a blocker for THEME-03. Goes green in 02-02.
- `e2e/theme.spec.ts` THEME-01/02/04/05/06 tests reference the inline init script, store, and toggle built in 02-02/02-03; RED until then. Each plan runs its own `-g` slice, so these do not block THEME-03.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Semantic token vocabulary and both peer themes are ready for 02-02 (no-flash inline script + `theme.svelte.ts` runes store) and 02-03 (accessible `<button aria-pressed>` toggle) to flip their THEME spec slices green.
- Test infra (Vitest jsdom, local-preview Playwright) is in place; 02-02 creates `theme.svelte.ts` to turn `test:unit` green.

---
*Phase: 02-design-system-dual-theme*
*Completed: 2026-07-05*

## Self-Check: PASSED

All 10 created/modified files verified present; all 3 task commits (f0c7091, 7205f64, 25d477e) verified in git history.
