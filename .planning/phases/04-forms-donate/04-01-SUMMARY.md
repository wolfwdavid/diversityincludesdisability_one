---
phase: 04-forms-donate
plan: 01
subsystem: forms
tags: [web3forms, accessibility, wcag, svelte5-runes, forms, validation, playwright, vitest]

# Dependency graph
requires:
  - phase: 03-content-pages
    provides: "Accessible contact form SCAFFOLD (labels/for, aria-describedby slots, mailto fallback) and get-involved page with donate placeholder"
provides:
  - "Shared form engine: config.ts (swappable placeholders), forms/submit.ts (Web3Forms fetch wrapper), forms/validation.ts (pure, unit-tested), components/FormStatus.svelte (focus-managed live region)"
  - "Wired accessible contact form on /contact (FORM-01/03)"
  - "Accessible volunteer form on /get-involved (FORM-02/03)"
  - "Single-source DONATE_URL + DONATE_PLATFORM_NAME placeholders consumed downstream by 04-02"
affects: [04-02-donate-linkout, phase-06-wcag-verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Client-side Web3Forms POST (public access key, zero deps, static-host compatible)"
    - "Shared submit + pure validation + one form-level focus-managed status region composed by two thin page forms"
    - "Honeypot botcheck (display:none + tabindex=-1 + aria-hidden) instead of CAPTCHA for accessibility"
    - "Focus-to-first-invalid on validation error; success replaces the form to prevent double-submit"

key-files:
  created:
    - src/lib/config.ts
    - src/lib/forms/submit.ts
    - src/lib/forms/validation.ts
    - src/lib/forms/validation.test.ts
    - src/lib/components/FormStatus.svelte
    - e2e/forms.spec.ts
  modified:
    - src/routes/contact/+page.svelte
    - src/routes/get-involved/+page.svelte

key-decisions:
  - "config.ts (committed public-by-design placeholders) chosen over $env/static/public so a placeholder can be committed and never fail the build"
  - "Dropped the scaffold's per-field role=alert + aria-live=polite in favor of aria-describedby + focus-to-first-invalid + one form-level FormStatus region (removes contradictory/noisy announcements)"
  - "Honeypot-only spam mitigation (no CAPTCHA) to avoid an accessibility tax on a disability-advocacy site"
  - "Volunteer form lives as a section on /get-involved (not its own route), reusing the shared engine with v- ids"

patterns-established:
  - "submitToWeb3Forms(): res.ok && json.success !== false belt-and-suspenders success check; distinct network-error message"
  - "validateContact/validateVolunteer return field->message maps in field order (name,email,message) for deterministic first-invalid focus"

requirements-completed: [FORM-01, FORM-02, FORM-03]

# Metrics
duration: 165min
completed: 2026-07-06
---

# Phase 4 Plan 01: Accessible Contact + Volunteer Forms (Web3Forms) Summary

**Wired the Phase-3 contact scaffold and a new /get-involved volunteer form to a client-side Web3Forms backend through one shared submit + pure-validation + focus-managed status engine, with a single swappable config source and zero new dependencies.**

## Performance

- **Duration:** ~165 min (spans a slow first cross-project-port build; wall-clock includes environment fights)
- **Started:** 2026-07-06T03:40:00Z (approx)
- **Completed:** 2026-07-06T10:19:00Z
- **Tasks:** 3 of 3
- **Files modified:** 8 (6 created, 2 modified)

## Accomplishments
- Shared, dependency-free form engine (config + submit + pure validation + FormStatus) with the validation contract unit-tested (Vitest).
- Contact form now validates, POSTs to Web3Forms, and reports success (focused role=status) / error (role=alert + mailto fallback) / network failure — all keyboard + screen-reader friendly.
- Volunteer form added to /get-involved on the same engine without disturbing the donate placeholder or heading order.
- Route-mocked E2E (success 200 / server error 400 / network abort / validation-blocks-submit / volunteer) proves all three FORM requirements against a private curl-verified preview port — never the live endpoint.

## Task Commits

Each task was committed atomically:

1. **Task 1: Shared engine (config + submit + pure validation + FormStatus), TDD** - `58ce496` (feat)
2. **Task 2: Wire contact form + route-mocked E2E** - `42552df` (feat)
3. **Task 3: Volunteer form on /get-involved + E2E** - `63be5c2` (feat)

_TDD note: Task 1 followed RED (failing validation.test.ts against a missing module) → GREEN (implementation, 9/9 unit tests pass) in a single squashed commit._

## Files Created/Modified
- `src/lib/config.ts` - Single-source public-by-design placeholders WEB3FORMS_ACCESS_KEY / DONATE_URL / DONATE_PLATFORM_NAME (all TODO-marked).
- `src/lib/forms/submit.ts` - submitToWeb3Forms() fetch wrapper; normalizes success/error/network into {ok, message}.
- `src/lib/forms/validation.ts` - Pure validateContact()/validateVolunteer() returning field->message maps in field order.
- `src/lib/forms/validation.test.ts` - Vitest unit tests for the validation contract.
- `src/lib/components/FormStatus.svelte` - Focus-managed status region (role status/alert, aria-live, tabindex=-1).
- `src/routes/contact/+page.svelte` - Wired contact form extending the scaffold (aria-invalid, honeypot, one FormStatus region).
- `src/routes/get-involved/+page.svelte` - Added volunteer form section before the untouched donate placeholder.
- `e2e/forms.spec.ts` - 5 route-mocked Playwright tests (4 contact + 1 volunteer).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Scoped the server-error mailto assertion to avoid a strict-mode violation**
- **Found during:** Task 2 (running the contact E2E)
- **Issue:** `page.getByRole('link', { name: /emanrimawi@gmail.com/i })` matched three elements on the live page (lede link, form error-disclaimer link, footer link), so `.toBeVisible()` threw a Playwright strict-mode error rather than asserting the intended fallback.
- **Fix:** Scoped the locator to `page.locator('form .disclaimer').getByRole('link', ...)`, which targets exactly the error-fallback mailto the test intends to verify.
- **Files modified:** e2e/forms.spec.ts
- **Commit:** `42552df`

All other files were created exactly as specified in the plan's `<action>` blocks.

## Verification
- `npm run test:unit` — 3 files / 9 tests green (incl. new validation contract tests).
- `npm run build` — exits 0 (adapter-static wrote build/).
- forms E2E (route-mocked, private curl-verified port, never the live endpoint) — 5/5 green: contact success/server-error/network/validation + volunteer success.
- `e2e/shell.spec.ts` — 13/13 green against the same build (single h1 + landmarks + heading order preserved on /contact and /get-involved).
- No new npm dependencies (package.json devDependencies unchanged).

## Notes for Downstream
- 04-02 consumes `DONATE_URL` and `DONATE_PLATFORM_NAME` from `src/lib/config.ts`; the donate `<section id="donate">` placeholder on /get-involved was intentionally left untouched for that plan.
- All three config values are committed TODO placeholders (the Web3Forms key is public by design). The user swaps them before launch; CI rebuilds on push.

## Environment / Process Note
Sibling projects squat Playwright preview ports 4173/4200 with `reuseExistingServer:!CI`. A stale leftover preview on 4200 initially served a non-hydrating build and produced false E2E failures. Resolved by building fresh and previewing on private, curl-verified ports (4189, then 4191), running gates against those, and deleting the throwaway configs (never committed).

## Self-Check: PASSED

All 8 planned files + SUMMARY.md verified present on disk; all 3 task commits (58ce496, 42552df, 63be5c2) verified in git history.
