---
phase: 04-forms-donate
plan: 02
subsystem: forms
tags: [donate, external-link, secret-hygiene, wcag, playwright, static-scan]

# Dependency graph
requires:
  - phase: 04-forms-donate
    plan: 01
    provides: "config.ts single source (DONATE_URL, DONATE_PLATFORM_NAME, WEB3FORMS_ACCESS_KEY placeholders) + e2e/forms.spec.ts"
provides:
  - "Config-driven external donate link-out on /get-involved (rel=noopener noreferrer, target=_blank, sr-only new-tab cue, privacy note)"
  - "Static secret-hygiene gate: scripts/assert-no-secret.mjs wired as npm run test:no-secret (UUID-key scan over src/+build/, placeholder+TODO assertion, rel=noopener assertion)"
affects: [phase-06-wcag-verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "External link-out only for payments — never an embedded checkout/iframe (E2E asserts zero iframes)"
    - "Static hygiene scans as npm scripts mirroring assert-no-shiki-chunk.mjs (walk dirs, collect errors, exit 1)"

key-files:
  created:
    - scripts/assert-no-secret.mjs
  modified:
    - src/routes/get-involved/+page.svelte
    - e2e/forms.spec.ts
    - package.json

key-decisions:
  - "Donate stays a pure external link-out (FORM-04): rel=noopener noreferrer + target=_blank declared explicitly, sr-only new-tab cue for WCAG 3.2.5, privacy note that the platform's own policy applies"
  - "Secret scan runs over BOTH src/ and build/ so a key leaking via any import path into the bundle also fails the gate"

patterns-established:
  - "test:no-secret joins test:no-shiki as a static post-build gate; both mirror the same walk/collect/exit-1 script shape"

requirements-completed: [FORM-04]

# Metrics
duration: 80min
completed: 2026-07-06
---

# Phase 4 Plan 02: Donate Link-out + Secret Scan Summary

**Turned the Phase-3 donate placeholder into a config-driven, clearly-labeled external link-out (rel=noopener noreferrer + new-tab cue + privacy note, zero iframes) and added a static secret-hygiene gate (`npm run test:no-secret`) that fails if a UUID-shaped access key is ever committed or built.**

## Performance

- **Duration:** ~80 min wall clock (dominated by a Playwright-on-Windows webServer teardown hang; the tests themselves ran in seconds)
- **Completed:** 2026-07-06T11:40:00Z
- **Tasks:** 2 of 2
- **Files modified:** 4 (1 created, 3 modified)

## Accomplishments
- /get-involved donate section now imports `DONATE_URL` + `DONATE_PLATFORM_NAME` from `$lib/config` — no hardcoded URL, no `href="#"` left, and the `svelte-ignore a11y_invalid_attribute` escape hatch is gone.
- Donate anchor: `target="_blank" rel="noopener noreferrer"`, `.sr-only` "(opens in a new tab)" cue (WCAG 3.2.5), and a privacy disclaimer stating the link leaves the site and no payments are processed on-site.
- New donate E2E asserts rel/target, absolute external href (not `#`), and **zero iframes** on the page — embedded checkout is structurally impossible without failing CI.
- `scripts/assert-no-secret.mjs` (mirrors the no-shiki scan): fails on any UUID-shaped key in `src/` or `build/`, asserts config.ts keeps the committed `YOUR_WEB3FORMS_ACCESS_KEY` placeholder + a TODO marker, and asserts the donate link keeps `rel="noopener noreferrer"`. Wired as `npm run test:no-secret`.
- Negative spot-check performed: a temporary UUID appended to config.ts made the scan print FAILED and identify the file; reverted, scan green again.

## Task Commits

Each task was committed atomically:

1. **Task 1: Config-driven external donate link-out + donate E2E** - `c2be07c` (feat)
2. **Task 2: Static secret-hygiene scan wired as npm script** - `3466f56` (feat)

## Files Created/Modified
- `src/routes/get-involved/+page.svelte` - Donate section rewired to config-driven external link-out; volunteer form untouched.
- `e2e/forms.spec.ts` - Appended the FORM-04 donate test (rel/target/href/no-iframe).
- `scripts/assert-no-secret.mjs` - Static hygiene scan (UUID key over src/+build/, placeholder+TODO, rel=noopener).
- `package.json` - Added `"test:no-secret": "node scripts/assert-no-secret.mjs"` next to `test:no-shiki`.

## Deviations from Plan

None - plan executed exactly as written.

## Final Phase Gate (04-VALIDATION.md full suite)

Run against a fresh `npm run build` served on a private, curl-verified preview port (4197; curl confirmed the donate markup + zero iframes before tests ran):

- `npm run test:unit` — 3 files / **9/9 tests green**
- `npm run build` — **exit 0** (adapter-static wrote build/)
- `npm run test:no-secret` — **exit 0**, prints "FORM-04 / secret-hygiene OK"; negative UUID spot-check correctly FAILED then reverted
- forms E2E — **6/6 green** (4 contact + 1 volunteer + 1 new donate)
- `e2e/shell.spec.ts` — **13/13 green** (skip link, landmarks + single h1 on all 7 pages, heading order, nav reachability, disclosure focus, focus outlines, 24px targets)
- Total E2E: 19/19 passed in 6.0s
- No new npm dependencies; config.ts remains the only source of the donate URL.

## Notes for Downstream
- Phase 6 (WCAG verification) inherits the donate link-out with its new-tab cue; the sr-only cue text is "(opens in a new tab)".
- `DONATE_URL` / `DONATE_PLATFORM_NAME` are still TODO placeholders in config.ts — user swaps them before launch; the scan enforces the Web3Forms placeholder stays until then.

## Environment / Process Note
Playwright's managed `webServer` hangs at teardown on this Windows box (cmd.exe wrapper survives; a run reported "1 passed (32.1m)" where the test took 308ms). Worked around by running the final gate against a self-managed `vite preview` on a private curl-verified port (4197) with a webServer-less throwaway config, then killing the server tree via taskkill and deleting the throwaway config (never committed). Sibling-project port squatting on 4173/4174/4200 also avoided by the private port.

## Self-Check: PASSED

- scripts/assert-no-secret.mjs — FOUND
- src/routes/get-involved/+page.svelte donate rewire — FOUND (rel="noopener noreferrer", DONATE_URL import)
- package.json test:no-secret — FOUND
- e2e/forms.spec.ts donate test — FOUND
- Commits c2be07c, 3466f56 — FOUND in git history
