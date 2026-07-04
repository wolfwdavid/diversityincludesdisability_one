---
phase: 01-foundation-static-deploy
plan: 03
subsystem: infra
tags: [github-pages, github-actions, deploy, playwright, curl, live-verify, sveltekit, error-page]

# Dependency graph
requires:
  - phase: 01-01
    provides: adapter-static scaffold with 404.html SPA fallback + .nojekyll + base path
  - phase: 01-02
    provides: deploy.yml CI pipeline + Playwright/curl live-URL smoke harness (scaffolded, unrun)
provides:
  - First live GitHub Pages deploy of the site at the repo sub-path
  - DEPLOY-01..04 verified GREEN against the deployed URL (curl matrix + Playwright, not localhost)
  - Branded +error.svelte error boundary for the SPA 404 fallback (DEPLOY-03 "branded" half)
  - A working, sub-path-correct verification harness (fixed the scaffolded baseURL + over-assertion bugs)
  - 01-DEPLOY-LOG.md — recorded run URL + verbatim verification evidence
affects: [02-design-system, 03-app-shell, 04-forms, 05-hero, 06-launch-verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Playwright baseURL for a repo sub-path MUST end in a trailing slash; goto paths MUST be relative (no leading slash) or they reset to the origin root"
    - "A JS-hydrated SPA 404 fallback is asserted in two layers: curl proves the correct app shell + base path is served; Playwright proves the client-rendered branded body"
    - "Branded error boundary via src/routes/+error.svelte rendered by the client router on top of adapter-static's fallback:'404.html'"

key-files:
  created:
    - src/routes/+error.svelte
    - .planning/phases/01-foundation-static-deploy/01-DEPLOY-LOG.md
  modified:
    - playwright.config.ts
    - tests/deploy.smoke.spec.ts
    - scripts/verify-deploy.sh

key-decisions:
  - "Added a minimal branded +error.svelte in the foundation phase so the unmatched-path fallback renders the org name (DEPLOY-03 'branded'), not SvelteKit's bare default; Phase 6 (06-02) refines it into the final a11y-hardened 404"
  - "Fixed the 01-02 harness live rather than documenting around it: Playwright sub-path baseURL bug + verify-deploy.sh over-assertion on JS-hydrated fallback text"
  - "Kept the branded-404 body assertion in Playwright (JS-capable) and reduced the curl check to a static app-shell + base-path assertion, since curl cannot execute the client router"

patterns-established:
  - "Sub-path-safe Playwright config (trailing-slash baseURL + relative goto)"
  - "Two-layer 404-fallback verification (static shell via curl, hydrated body via Playwright)"

requirements-completed: [DEPLOY-01, DEPLOY-02, DEPLOY-03, DEPLOY-04]

# Metrics
duration: 20min
completed: 2026-07-04
---

# Phase 1 Plan 03: Deploy & Live-Verify Summary

**First live GitHub Pages deploy at the repo sub-path with DEPLOY-01..04 verified GREEN against the deployed URL — curl matrix + Playwright/Chromium smoke both pass, backed by a branded `+error.svelte` 404 boundary and two harness fixes that made the 01-02 smoke suite actually runnable on a sub-path.**

## Performance

- **Duration:** ~20 min (continuation agent — Task 3 only; Tasks 1–2 done by orchestrator + human)
- **Completed:** 2026-07-04
- **Tasks:** 1 executed here (Task 3 verify) — Tasks 1 (repo+push) and 2 (Pages Source) pre-completed
- **Files created:** 2 · **Files modified:** 3

## Accomplishments
- Ran the live curl matrix (`scripts/verify-deploy.sh`) against https://wolfwdavid.github.io/diversityincludesdisability_one/ → **ALL DEPLOY CHECKS PASSED** (exit 0).
- Ran the Playwright/Chromium smoke against the live URL → **4 passed** (root HTML, no-4xx + `_app` asset, deep-link `/about/`, branded 404).
- Confirmed the branded 404 via a Chromium `innerText` dump: `<h1>Diversity Includes Disability</h1>`, "404: Not Found", "Return home" — served with a 404 status from the `404.html` SPA fallback (OUR page, not SvelteKit default, not GitHub chrome).
- Added `src/routes/+error.svelte` (branded error boundary) so the unmatched-path fallback carries the org name — the "branded" half of DEPLOY-03. Rebuilt + redeployed (Actions run 28721178698, success) and re-verified green.
- Wrote `01-DEPLOY-LOG.md` with the Actions run URL, verbatim curl/Playwright output, the 404 body dump, and a DEPLOY-01..04 → evidence table.

## Task Commits

1. **Task 3a: branded `+error.svelte` for the SPA 404 fallback** — `b094f36` (feat)
2. **Task 3b: correct deploy harness for the repo sub-path** — `4391d4f` (fix)
3. **Task 3c: record live DEPLOY-01..04 verification evidence** — `b4c1d62` (docs)

**Plan metadata:** final docs commit (STATE/ROADMAP/REQUIREMENTS + this summary) — see git log.

_Note: Task 1 (repo create + push, run 28720512888) and Task 2 (Pages Source → GitHub Actions) were completed by the orchestrator + human before this continuation agent ran._

## Files Created/Modified
- `src/routes/+error.svelte` — branded error boundary; shows org name + HTTP status/message + return-home link, rendered by the client router on the `404.html` fallback.
- `playwright.config.ts` — normalize `baseURL` to a trailing slash so relative `goto()` paths resolve under the repo sub-path.
- `tests/deploy.smoke.spec.ts` — relative (no-leading-slash) `goto()` paths.
- `scripts/verify-deploy.sh` — assert the JS-hydrated 404 fallback serves OUR app shell wired to the correct base path (instead of grepping for client-rendered text absent from static HTML).
- `.planning/phases/01-foundation-static-deploy/01-DEPLOY-LOG.md` — recorded live evidence.

## Decisions Made
- **Branded 404 belongs in the foundation:** DEPLOY-03 explicitly requires "our branded 404", and the plan's human-verify expects the org name. A minimal `+error.svelte` satisfies it now; Phase 6 (`06-02`) refines it into the final accessibility-hardened statement/404. This is not scope creep into Phase 6 — it is the foundational error boundary DEPLOY-03 mandates.
- **Fix the harness, don't document around it:** the 01-02 smoke suite was scaffolded but never run; its first live run exposed a sub-path `baseURL` bug and an over-assertion on the JS-hydrated fallback. Both were real bugs and were fixed so the harness is a valid gate for every future phase.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Playwright sub-path baseURL reset to origin root**
- **Found during:** Task 3 (first live Playwright run)
- **Issue:** `baseURL` had no trailing slash, so leading-slash `page.goto('/')` / `goto('/about/')` resolved to `https://wolfwdavid.github.io/...`, stripping the `/diversityincludesdisability_one` sub-path and hitting GitHub's raw 404 ("There isn't a GitHub Pages site here"). All 4 assertions failed with a false negative.
- **Fix:** Normalized `baseURL` to a trailing slash in `playwright.config.ts`; switched the spec to relative `goto()` paths (`./`, `about/`, `definitely-not-a-page-xyz/`).
- **Files modified:** playwright.config.ts, tests/deploy.smoke.spec.ts
- **Verification:** `npm run smoke` → 4 passed against the live URL.
- **Committed in:** `4391d4f`

**2. [Rule 1 - Bug] verify-deploy.sh over-asserted client-rendered text on the static 404 shell**
- **Found during:** Task 3 (first live curl run — exit 1)
- **Issue:** The 404 check grepped the *static* fallback HTML for "diversity includes disability", but the fallback is adapter-static's SPA `404.html` shell — the branded text is rendered by the client router after hydration and is never in the raw HTML. (Note: the plan pre-flagged a possible status-code over-assertion; the actual over-assertion was on the body text.)
- **Fix:** Assert the fallback serves OUR app shell wired to the correct base path (`__sveltekit` base config + `/diversityincludesdisability_one/_app` preloads); the client-rendered branded body is asserted by Playwright.
- **Files modified:** scripts/verify-deploy.sh
- **Verification:** `bash scripts/verify-deploy.sh` → ALL DEPLOY CHECKS PASSED (exit 0); Playwright asserts the hydrated branded body.
- **Committed in:** `4391d4f`

**3. [Rule 2 - Missing Critical] No branded 404 — unmatched paths showed SvelteKit's bare default**
- **Found during:** Task 3 (branded-404 Playwright assertion, once the sub-path bug was fixed)
- **Issue:** With no `+error.svelte`, the client router rendered SvelteKit's default "404 Not Found" (our app, but unbranded). DEPLOY-03 requires "our branded 404".
- **Fix:** Added `src/routes/+error.svelte` showing the org name, status/message, and a return-home link; rebuilt + redeployed.
- **Files modified:** src/routes/+error.svelte (created)
- **Verification:** Chromium dump → `<h1>Diversity Includes Disability</h1>` + "404: Not Found" + "Return home"; Playwright branded-404 assertion green.
- **Committed in:** `b094f36`

---

**Total deviations:** 3 auto-fixed (2 bugs, 1 missing-critical). Both bugs were latent 01-02 harness defects surfaced by the first live run; the missing-critical was DEPLOY-03's branded 404.
**Impact on plan:** All three were required to make DEPLOY-01..04 verifiably green against the live URL. No scope creep — the error boundary is foundational (not the Phase 6 a11y statement), and no theme/content/3D work was touched.

## Issues Encountered
- **Pre-existing type-check error (deferred, out of scope):** `svelte-check` reports 1 error in `tests/deploy.smoke.spec.ts` — `Cannot find name 'process'` (missing `@types/node`). This is a latent 01-02 issue in a test file, does **not** block the production build (`npm run build` exit 0) and does **not** block Playwright (esbuild transpiles it; the smoke ran 4/4 green). Left unfixed to avoid a dependency/tsconfig change outside this plan's scope; logged for a later pass.

## Known Stubs
- `src/routes/+page.svelte` and `about/+page.svelte` retain the 01-01 foundation-skeleton copy (deliberate — real content is Phases 2–6). `+error.svelte` is a minimal branded boundary, intentionally refined later by Phase 6 (`06-02`). Neither blocks this plan's goal (a verified live static deploy).

## User Setup Required
None remaining. The one-time manual step (Settings → Pages → Source: GitHub Actions) was completed by the human in Task 2. Push-to-`main` now auto-rebuilds + redeploys.

## Next Phase Readiness
- The site is **live** at https://wolfwdavid.github.io/diversityincludesdisability_one/ with DEPLOY-01..04 verified green against the deployed URL. Phase 1 is complete.
- The live-URL verification harness (curl matrix + Playwright) is now correct and sub-path-safe — reusable by every future phase and by Phase 6's final launch checklist.
- Ready for **Phase 2** (Design System & Dual Theme). No blockers.

---
*Phase: 01-foundation-static-deploy*
*Completed: 2026-07-04*

## Self-Check: PASSED

All 6 claimed files exist on disk (`src/routes/+error.svelte`, `01-DEPLOY-LOG.md`, `01-03-SUMMARY.md`, `playwright.config.ts`, `tests/deploy.smoke.spec.ts`, `scripts/verify-deploy.sh`) and all 3 task commits (`b094f36`, `4391d4f`, `b4c1d62`) are present in git history. Live verification re-confirmed: curl matrix → ALL DEPLOY CHECKS PASSED; Playwright → 4 passed; branded 404 renders our org name at a 404 status.
