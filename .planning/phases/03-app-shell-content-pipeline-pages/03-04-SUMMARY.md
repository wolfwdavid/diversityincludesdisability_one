---
phase: 03-app-shell-content-pipeline-pages
plan: 04
subsystem: ui
tags: [sveltekit, svelte5, accessibility, wcag, forms-scaffold, events-data, donate-linkout, playwright]

# Dependency graph
requires:
  - phase: 03-app-shell-content-pipeline-pages
    plan: 01
    provides: app shell + landmarks, base-prefix convention, .button/.container utilities, e2e/shell.spec.ts gate, Footer email link
  - phase: 02-design-system-dual-theme
    provides: token CSS layers (base.css --measure/--space/--color-* /--focus-ring-width)
provides:
  - Get Involved page (PAGE-04) — volunteer info + safe external donate link-out placeholder (rel=noopener, no payment widget)
  - Typed events data module src/lib/data/events.ts (EventItem) + Events page (PAGE-05) with {:else} empty-state
  - Accessible Contact form SCAFFOLD (PAGE-07) — labeled fields, aria-describedby error slots, role=alert live regions, mailto fallback, NO backend
  - e2e/scaffold.spec.ts — PAGE-04 donate-rel + PAGE-07 labeled-fields/no-action gate
affects: [04-forms-backend, 06-a11y-hardening]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Donate = external <a rel=\"noopener noreferrer\"> placeholder + TODO(Phase 4/FORM-04); never an embedded payment widget/checkout"
    - "Events driven by a typed data module (src/lib/data/events.ts); page renders {#if sorted.length}...{:else} empty-state so zero real events is a valid state"
    - "Contact form is a11y-complete scaffold: label/for pairing, aria-describedby error slots, role=alert aria-live regions, preventDefault-only submit, mailto fallback — Phase 4 adds only the backend"

key-files:
  created:
    - src/lib/data/events.ts
    - e2e/scaffold.spec.ts
  modified:
    - src/routes/get-involved/+page.svelte
    - src/routes/events/+page.svelte
    - src/routes/contact/+page.svelte

key-decisions:
  - "Donate anchor is a labeled external link-out placeholder (rel=noopener noreferrer, href=# with TODO(Phase 4/FORM-04)); intentional href=# a11y warning suppressed with a scoped svelte-ignore"
  - "Events sorted ascending by date; sample entries flagged fictional in a code comment + on-page disclaimer; empty-state string 'No upcoming events — check back soon.'"
  - "Contact scaffold uses onsubmit=preventDefault (no full-page GET) with NO action/fetch/backend; email fallback assertion scoped to <main> because the Footer landmark also links emanrimawi@gmail.com"

requirements-completed: [PAGE-04, PAGE-05, PAGE-07]

# Metrics
duration: 40min
completed: 2026-07-05
---

# Phase 3 Plan 04: Get Involved / Events / Contact Scaffolds Summary

**Fleshed the three stand-in pages that complete the seven-page site before Phase-4 forms and Phase-5 3D: Get Involved with an authored volunteer blurb + a safe external Donate link-out placeholder (PAGE-04); an Events page driven by a typed `events.ts` data module with a real `{:else}` empty-state (PAGE-05); and an accessibility-complete Contact form scaffold — labeled fields, `aria-describedby` error slots, `role=alert` live regions, and a `mailto` fallback — with NO backend (PAGE-07). New `e2e/scaffold.spec.ts` gates donate-rel + contact labeling; `shell.spec.ts` (12) and unit (5) stay green.**

## Performance

- **Duration:** ~40 min
- **Completed:** 2026-07-05
- **Tasks:** 3
- **Files:** 5 (2 created, 3 modified)

## Accomplishments
- **Get Involved (PAGE-04):** single `<h1>` + two ordered `<h2>` sections (ways/donate), base-prefixed internal links to Programs and Contact, and a clearly-labeled external "Donate (external)" anchor with `rel="noopener noreferrer"` and a `TODO(Phase 4/FORM-04)` — no embedded payment widget/checkout. Authored copy double-flagged as placeholder.
- **Events (PAGE-05):** `src/lib/data/events.ts` exports the `EventItem` interface + two flagged-fictional sample events; the page sorts by date and renders `{#if sorted.length > 0}...{:else}` with the exact empty-state string, so it renders real events the moment the data module is updated (and degrades cleanly to zero events). External event links carry `rel="noopener noreferrer"`.
- **Contact (PAGE-07):** fully accessible form scaffold — every field has a `<label for>`/`id` pair, each wired to an `aria-describedby` error slot (`role="alert" aria-live="polite"`), with a visible `mailto:emanrimawi@gmail.com` fallback. `onsubmit` is `preventDefault`-only; the `<form>` has NO `action`, NO `fetch`, NO backend — Phase 4 adds only the submit wiring.
- **Gate:** new `e2e/scaffold.spec.ts` (3 tests) proves PAGE-04 donate rel=noopener + PAGE-07 labeled fields/aria-describedby/no-form-action. Full run: **15/15** (3 scaffold + 12 shell) on a private known-free preview port; `npm run test:unit` 5/5; `npm run build` exits 0.

## Task Commits

1. **Task 1: Get Involved — volunteer info + safe donate link-out** — `2e1e5a0` (feat)
2. **Task 2: Events — typed data module + list/empty-state** — `45bfb1b` (feat)
3. **Task 3: Contact form scaffold + scaffold spec** — `102f40e` (feat)

**Plan metadata:** see final docs commit.

## Files Created/Modified
- `src/routes/get-involved/+page.svelte` — Volunteer "ways to help" list (base-prefixed links) + external donate link-out placeholder (PAGE-04)
- `src/lib/data/events.ts` — Typed `EventItem[]` data module with flagged sample events (PAGE-05)
- `src/routes/events/+page.svelte` — Date-sorted list with `{:else}` empty-state, consumes the data module (PAGE-05)
- `src/routes/contact/+page.svelte` — Accessible form scaffold: label/for pairs, aria-describedby error slots, role=alert, mailto fallback, no backend (PAGE-07)
- `e2e/scaffold.spec.ts` — PAGE-04 donate-rel + PAGE-07 labeling/no-action gate

## Decisions Made
- **Donate link-out convention:** a labeled external `<a rel="noopener noreferrer">` with `href="#"` + `TODO(Phase 4/FORM-04)`, never an embedded checkout; the real giving-platform URL is deferred to Phase 4.
- **Events data-module + empty-state pattern:** typed `events.ts` is the single source; the page's `{#if}...{:else}` makes zero real events a valid rendered state, so removing the sample entries yields the empty-state with no code change.
- **Contact a11y contract:** `label[for]`↔`input[id]` pairing, `aria-describedby` → per-field `role="alert" aria-live="polite"` error `<p>` slots, `preventDefault`-only submit, and a `mailto` fallback — the markup is complete so Phase 4 only wires the backend.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Reworded donate TODO comment to pass the task's own no-checkout gate**
- **Found during:** Task 1
- **Issue:** The plan's EXACT content included the comment "No embedded checkout.", but the same task's `verify`/acceptance asserts `! grep -qi "checkout"` — the plan would fail its own gate on its own comment.
- **Fix:** Reworded the comment to "No embedded payment widget." — preserves intent, passes the gate. No behavior change.
- **Files modified:** src/routes/get-involved/+page.svelte
- **Commit:** 2e1e5a0

**2. [Rule 1 - Bug] Reworded Contact script comment to pass the no-backend grep gate**
- **Found during:** Task 3
- **Issue:** The plan's EXACT Contact content contained the word "Web3Forms" in a comment, but the task's `verify` asserts `! grep -qi "web3forms"` — again the plan tripped its own gate.
- **Fix:** Reworded "wires Web3Forms + validation" to "wires the form backend + validation." Intent preserved (no backend now); gate passes.
- **Files modified:** src/routes/contact/+page.svelte
- **Commit:** 102f40e

**3. [Rule 1 - Bug] Scoped the contact-email assertion to the `<main>` landmark**
- **Found during:** Task 3 (running e2e/scaffold.spec.ts)
- **Issue:** The plan's `page.getByRole('link', { name: /emanrimawi@gmail.com/i })` matched **2** elements — the contact page body AND the Footer landmark's email link (added in 03-01) — a Playwright strict-mode violation.
- **Fix:** Scoped the assertion to `page.getByRole('main').getByRole('link', ...)`, asserting the contact page's own mailto fallback (mirrors 03-01's selector-scoping precedent). Other spec text verbatim.
- **Files modified:** e2e/scaffold.spec.ts
- **Verification:** scaffold.spec.ts 3/3 pass.
- **Commit:** 102f40e

**4. [Rule 1 - Bug] Suppressed intentional a11y_invalid_attribute on the placeholder donate href**
- **Found during:** Task 3 (`npm run check`)
- **Issue:** `svelte-check` warned `a11y_invalid_attribute` on the donate anchor's `href="#"` — but `href="#"` is the intentional, documented Phase-4 placeholder.
- **Fix:** Added a scoped `<!-- svelte-ignore a11y_invalid_attribute -->` (mirrors 03-01 Deviation 2). `npm run check` now reports 0 warnings on the plan's files.
- **Files modified:** src/routes/get-involved/+page.svelte
- **Commit:** 102f40e (folded into Task 3 as it surfaced during the Task-3 check gate)

### Out-of-scope (deferred, NOT fixed)
- `tests/deploy.smoke.spec.ts:4` — pre-existing `Cannot find name 'process'` svelte-check error (Phase-1 file, already logged in `deferred-items.md` by 03-01). Does not block `npm run build`. Left untouched.

---

**Total deviations:** 4 auto-fixed (all Rule 1) + 1 out-of-scope deferral (pre-existing). Three of the four were self-contradictions inside the plan's own EXACT content vs. its own grep gates; one was a real strict-mode collision with the 03-01 Footer email. No scope creep — page markup and a11y semantics match the plan exactly.

## Known Stubs
- **Donate URL (PAGE-04):** `href="#"` placeholder, `TODO(Phase 4/FORM-04)` — intentional; the real external giving-platform URL is wired in Phase 4. Documented on-page and in a code comment.
- **Contact submit (PAGE-07):** `onsubmit` is `preventDefault`-only, no backend — intentional per plan; Phase 4 (FORM-01..03) adds the submit backend. The markup/a11y is complete.
- **Events sample data:** two flagged-fictional sample events in `events.ts` — intentional placeholder; replace with real listings (structure is empty-state-ready).
- Authored placeholder copy on Get Involved/Events is flagged on-page and in comments, pending org sign-off (mission-copy provenance tracked in 03-RESEARCH).

These stubs are the deliberate Phase-3/Phase-4 boundary; none block the plan's goal (a complete, navigable, accessible seven-page site before forms/3D).

## Verification Evidence
- `npm run build` — exit 0 (adapter-static wrote `build`).
- `e2e/scaffold.spec.ts` + `e2e/shell.spec.ts` — **15 passed** on a private known-free preview port (4188, self-started, curl-verified to serve THIS build's new pages; never the shared 4173 that a sibling session squats).
- `npm run test:unit` — 5/5 passed.
- `npm run check` — 0 warnings on this plan's files (1 pre-existing deferred error in `deploy.smoke.spec.ts`, out of scope).

## Next Phase Readiness
- Seven-page site is navigable end-to-end (with 03-05 blog index) and stands alone before Phase-4 forms/Phase-5 3D.
- Contact form is markup/a11y-complete → Phase 4 (FORM-01..03) adds only the submit backend; Donate (FORM-04) swaps the placeholder `href="#"` for the real external URL.

---
*Phase: 03-app-shell-content-pipeline-pages*
*Completed: 2026-07-05*

## Self-Check: PASSED

All 5 plan files + SUMMARY.md exist; all 3 task commits (2e1e5a0, 45bfb1b, 102f40e) present in history.
