---
phase: 02-design-system-dual-theme
plan: 03
subsystem: ui
tags: [theming, a11y, wcag-2.2, aria-pressed, aria-live, focus-retention, svelte-runes, theme-toggle]

# Dependency graph
requires:
  - phase: 02-design-system-dual-theme
    plan: 02
    provides: "SSR/prerender-safe runes singleton theme.svelte.ts (current/set/toggle/THEME_KEY) reconciled from the DOM attribute; no-flash inline script setting <html data-theme> pre-paint"
  - phase: 02-design-system-dual-theme
    plan: 01
    provides: "Three-layer CSS token architecture with --color-focus / --focus-ring-width (2px premium / 3px accessible) focus-ring tokens and the Playwright THEME spec"
provides:
  - "Native <button type=button aria-pressed> ThemeToggle that flips the 02-02 store via theme.toggle()"
  - "Visually-hidden aria-live=polite region announcing 'Premium/Accessible theme enabled' in plain language on switch"
  - "Focus-retaining toggle (same node persists across switches — zero manual focus management) with tokenized focus ring that thickens in Accessible mode"
  - "WCAG 2.2 2.5.8-compliant target size (44px each axis, well above the 24x24 CSS px floor)"
  - "Global mount in +layout.svelte so the control is present on every page (THEME-01)"
affects: [phase-3-header-nav-shell]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Native <button aria-pressed> over role=switch/aria-checked — materially better cross-AT support (ChromeVox ignores switch; NVDA re-maps it)"
    - "Focus retention is free by never replacing the toggle node — attributes mutate, the element persists, focus never leaves it"
    - "One visually-hidden aria-live=polite region per app to speak the resulting theme NAME (aria-pressed alone only announces pressed/not-pressed)"
    - "Label derived from the store (seeded from the DOM attribute at hydration) so no ~100ms post-hydration label swap"

key-files:
  created:
    - src/lib/theme/ThemeToggle.svelte
  modified:
    - src/routes/+layout.svelte

key-decisions:
  - "aria-pressed native button (not role=switch/aria-checked) for the theme control — best-supported cross-AT toggle semantics"
  - "Temporary top-of-layout mount of <ThemeToggle/> purely to make the control globally present and testable now; Phase 3 (PAGE-08 shell) relocates it into the Header/Nav — flagged, not built here"
  - "Visible label carries the theme NAME (Theme: Premium/Accessible) for sighted users; aria-pressed carries machine state; the polite live region carries the plain-language announcement — three complementary channels"

patterns-established:
  - "Accessible dual-state control = native <button aria-pressed> + one polite aria-live region + tokenized :focus-visible ring + >=44px target"

requirements-completed: [THEME-01, THEME-06]

# Metrics
duration: 13min
completed: 2026-07-05
---

# Phase 2 Plan 03: Accessible ThemeToggle Summary

**A native `<button type="button" aria-pressed>` `ThemeToggle` that flips the 02-02 runes store via `theme.toggle()`, announces the resulting theme in plain language through a single visually-hidden `aria-live="polite"` region, retains focus because the same node persists across switches, meets WCAG 2.2 2.5.8 target size (44px) with a tokenized focus ring that thickens in Accessible mode — mounted in `+layout.svelte` so the control is on every page. The final `toggle a11y` slice goes green, closing THEME-01 and THEME-06 and making the whole dual-theme system operable end to end.**

## Performance

- **Duration:** ~13 min
- **Started:** 2026-07-05T01:01:11Z
- **Completed:** 2026-07-05T01:14:13Z
- **Tasks:** 2
- **Files created:** 1 · **Files modified:** 1

## Accomplishments

- **Accessible toggle control (THEME-06):** `src/lib/theme/ThemeToggle.svelte` is a native `<button type="button">` whose `aria-pressed` reflects `theme.current === 'premium'`. Click / Enter / Space all activate it for free (native button semantics — no hand-rolled `role="button"` div, no keydown handlers that routinely miss Space). `type="button"` prevents accidental form submission when Phase 3 later nests it inside a header that may contain a form.
- **Plain-language announcement (THEME-06):** one visually-hidden `aria-live="polite"` region is updated on each toggle to `"Premium theme enabled"` / `"Accessible theme enabled"`, so assistive tech speaks the theme NAME rather than the opaque `aria-pressed` "pressed / not pressed".
- **Focus retention (THEME-06):** because the same `<button>` node persists across toggles (attributes mutate, the element is never replaced/re-rendered away), focus never leaves it — verified by the E2E `await expect(btn).toBeFocused()` after `Enter`. Zero manual focus management.
- **Target size + tokenized focus ring:** `min-block-size`/`min-inline-size: 44px` comfortably exceeds WCAG 2.2 **2.5.8 Target Size (Minimum) = 24x24 CSS px**; `:focus-visible` uses `--focus-ring-width` (2px premium / 3px accessible from 02-01) so the ring thickens in Accessible mode, and `--color-focus`.
- **Global presence (THEME-01):** `+layout.svelte` imports and renders `<ThemeToggle />` so the control appears on every page. All four 02-01 CSS layer imports, the favicon import/link, `$props()`, and `{@render children()}` are preserved untouched.
- **Full Phase-2 THEME suite green end to end:** the whole Playwright spec passes — `peer designs` (THEME-03), `no flash` (THEME-04), `accessible-first` (THEME-05), `persists` (THEME-02), and now `toggle a11y` (THEME-01/06). `npm run test:unit` stays green (2/2) and `npm run build` exits 0 (fully static). All six THEME requirements are now verified.

## Key contract shipped

```svelte
<!-- src/lib/theme/ThemeToggle.svelte -->
<button type="button" class="theme-toggle" aria-pressed={isPremium} onclick={onClick}>
  <span>Theme: {isPremium ? 'Premium' : 'Accessible'}</span>
</button>
<div aria-live="polite" class="sr-only">{announce}</div>
```
- Consumes `theme` from `src/lib/theme/theme.svelte.ts` and drives it with `theme.toggle()`.
- `isPremium = $derived(theme.current === 'premium')`; `announce = $state('')` set to the plain-language string on click.
- Mounted once via `import ThemeToggle from '$lib/theme/ThemeToggle.svelte'` + `<ThemeToggle />` in `+layout.svelte`.

## Test slices now green

- `npm run test:unit` -> `vitest run src/lib/theme` -> **2 passed** (store logic, unchanged by this plan).
- `npx playwright test --config playwright.theme.config.ts` -> **5 passed** — the four previously-green slices PLUS `toggle a11y` (keyboard flips `aria-pressed`, focus retained, polite region announces `/theme enabled/i`), which was RED-by-design since Wave 0.
- `npm run build` -> exits 0, adapter-static wrote `build/` (no prerender crash; `ThemeToggle` is `browser`-safe via the SSR-safe store).

## Task Commits

1. **Task 1: ThemeToggle.svelte — native aria-pressed button + polite live region (THEME-06)** - `5feeb8a` (feat)
2. **Task 2: Mount ThemeToggle in +layout.svelte + prove the full THEME suite (THEME-01)** - `7ef1a73` (feat)

**Plan metadata:** _(final docs commit — see below)_

## Files Created/Modified

- `src/lib/theme/ThemeToggle.svelte` - New native `<button aria-pressed>` toggle: `$derived` premium state, `$state` announcement, `onClick` calling `theme.toggle()`, polite live region, `.sr-only` visually-hidden utility, 44px target, tokenized `:focus-visible` ring. Exactly per the plan `<action>` block.
- `src/routes/+layout.svelte` - Added `import ThemeToggle from '$lib/theme/ThemeToggle.svelte'` and one `<ThemeToggle />` render above `{@render children()}`; all four CSS imports, favicon, and `$props()`/children preserved.

## Decisions Made

- **`aria-pressed` native button over `role="switch"`/`aria-checked`** — recorded in 02-RESEARCH: ChromeVox does not recognize `role="switch"` and NVDA re-maps it to a toggle button anyway, so a native button with `aria-pressed` gives the most consistent cross-AT announcement.
- **Temporary top-of-layout mount** — the `<ThemeToggle />` sits at the top of `+layout.svelte` purely to make the control globally present and testable NOW. Phase 3 (PAGE-08 shell) relocates it into the Header/Nav; the shell is explicitly NOT built here (scope fence honored).
- **Three complementary state channels** — visible label (theme name, sighted users), `aria-pressed` (machine state), and the polite live region (plain-language change announcement) — rather than overloading any single one.

## Deviations from Plan

None to the plan's code. Both `<action>` blocks were implemented verbatim (the exact `ThemeToggle.svelte` body and the exact `+layout.svelte` mount). No auto-fixes (Rules 1-3) were required in the plan's own surface.

**Total deviations:** 0

### Out-of-scope discovery (logged, NOT fixed — scope boundary)

- `npm run check` (`svelte-check`) reports a single pre-existing error in `tests/deploy.smoke.spec.ts` — `Cannot find name 'process'` (missing `@types/node`). This is a **Phase-1** deploy-harness file, last modified in `4391d4f (fix(01-03): ...)`, and was already logged in this phase's `deferred-items.md` back at 02-01. The two files 02-03 touched contribute **zero** `svelte-check` diagnostics. Per the executor scope boundary (only auto-fix issues directly caused by the current task), it was re-confirmed and left deferred rather than fixed here. It does not affect the THEME suite, `test:unit`, or `npm run build` — all green. Suggested future cleanup: add `@types/node` + `"node"` to the tsconfig `types`, or exclude the Playwright `tests/` dir from `svelte-check`.

## Known Stubs

None. `ThemeToggle.svelte` is fully wired to the real 02-02 store (`theme.current` / `theme.toggle()`) and the real focus/color tokens from 02-01 — no hardcoded/placeholder/empty-value stubs. No `TODO`/`FIXME`/"coming soon" text was introduced. The Phase-3 Header/Nav relocation is an intentional, documented scope fence, not a stub.

## Issues Encountered

- **Stale preview server on port 4173** — the first `playwright test --config playwright.theme.config.ts` run reused a leftover `vite preview` server from the 02-02 session (`reuseExistingServer: !CI`), which served an OLD build without the `ThemeToggle`, so the `toggle a11y` slice timed out unable to find the button (the other four slices, which only read `<html data-theme>`, still passed). Resolved by killing the stale node process (PID on 4173) so Playwright ran a FRESH `npm run build && npm run preview`; the re-run passed all 5/5. No code change required — purely a stale-server environment issue.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All six THEME requirements (01-06) are now verified end to end: peer designs, no-flash, accessible-first default, persistence, and an accessible keyboard/SR toggle. The dual-theme design system is complete and operable.
- **Phase 3 handoff:** relocate the existing `<ThemeToggle />` from the top of `+layout.svelte` into the Header/Nav shell (PAGE-08). The component itself needs no change — only its mount location moves.

---
*Phase: 02-design-system-dual-theme*
*Completed: 2026-07-05*

## Self-Check: PASSED

Both files verified present (`src/lib/theme/ThemeToggle.svelte`, `src/routes/+layout.svelte`) and the SUMMARY exists; both task commits (`5feeb8a`, `7ef1a73`) verified in git history.
