---
phase: 03-app-shell-content-pipeline-pages
plan: 03
subsystem: ui
tags: [sveltekit, svelte5, content, accessibility, base-path, playwright, front-door-pages]

# Dependency graph
requires:
  - phase: 03-app-shell-content-pipeline-pages
    plan: 01
    provides: app shell landmarks (header/main#main-content/footer), .button/.button.is-secondary utilities, base-prefix convention, nav.ts, e2e/shell.spec.ts heading-order gate
  - phase: 02-design-system-dual-theme
    provides: token CSS (--space-section, --measure, --color-text, --color-text-muted, --space-4/6/8)
provides:
  - Home (/) real content — static (non-3D) hero placeholder + authored mission summary + base-prefixed primary/secondary CTAs
  - About (/about) real content — verbatim Eman Rimawi-Doster bio (HIGH-confidence facts) + flagged authored mission
  - Programs (/programs) real content — four verbatim service names, one ordered h2 each
  - e2e/content.spec.ts — PAGE-01/02/03 content gate (org name + CTA, bio keywords, four service names)
affects: [03-04-getinvolved-events-contact, 03-05-blog-index, 05-premium-3d-hero, 06-a11y-hardening]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Content pages render only their <h1> + ordered <h2 id> sections; shell owns all landmarks (single h1 per page)"
    - "Every internal link base-prefixed: import { base } from '$app/paths'; href=\"{base}/path\""
    - "Composed exclusively from existing tokens + .button/.button.is-secondary — no new design system"
    - "Static hero placeholder marks the region the Phase-5 capability-gated 3D hero later replaces"

key-files:
  created:
    - e2e/content.spec.ts
  modified:
    - src/routes/+page.svelte
    - src/routes/about/+page.svelte
    - src/routes/programs/+page.svelte

key-decisions:
  - "Mission prose is an AUTHORED PLACEHOLDER (live site exposes none) — rendered AND double-flagged (HTML comment + visible <em> disclaimer) on both Home summary and About, pending org sign-off before launch"
  - "Home ships the STATIC (non-3D) hero placeholder only; no Threlte/canvas — Phase 5 swaps the 3D hero in behind a capability gate"
  - "Real bio ported verbatim from 03-RESEARCH: bilateral/double amputee (2014), Access-A-Ride at NYLPI, Exec Dir Harlem Independent Living Center, lupus, mixed Black Palestinian, adaptive clothing line + poet/graphic-novel creator"

requirements-completed: [PAGE-01, PAGE-02, PAGE-03]

# Metrics
duration: 24min
completed: 2026-07-05
---

# Phase 3 Plan 03: Home + About/Mission + Programs & Services Content Summary

**Replaced the three front-door stubs with real funder-ready DID content — a static (non-3D) Home hero placeholder + authored/flagged mission summary + base-prefixed CTAs, the verbatim Eman Rimawi-Doster bio plus flagged authored mission on About, and all four verbatim Programs services — gated by a new `e2e/content.spec.ts` (PAGE-01/02/03), with the 03-01 shell heading-order spec and unit tests still green.**

## Performance

- **Duration:** 24 min
- **Started:** 2026-07-05T04:03:23Z
- **Completed:** 2026-07-05T04:27:46Z
- **Tasks:** 3
- **Files modified:** 4 (1 created, 3 modified)

## Accomplishments

- **Home (`/`, PAGE-01):** static `.hero` placeholder — single `<h1>Diversity Includes Disability</h1>`, an authored mission summary (double-flagged: HTML comment + visible "Placeholder mission summary — pending organization sign-off" `<em>`), primary `.button` CTA to `{base}/get-involved` and secondary `.button.is-secondary` CTA to `{base}/about`, plus a "What we do" section linking to `{base}/programs`. No 3D/canvas/Threlte.
- **About (`/about`, PAGE-02):** single `<h1>`, three ordered `<h2 id>` sections (mission → founder → work). Mission is the flagged authored placeholder. Founder section ports the real bio verbatim with all HIGH-confidence facts: mixed Black Palestinian woman, bilateral amputee, lupus, Access-A-Ride campaign at New York Lawyers for the Public Interest, Executive Director of the Harlem Independent Living Center, double amputee since 2014, adaptive clothing line + poet/graphic-novel creator. Base-prefixed cross-links to programs / get-involved / contact.
- **Programs (`/programs`, PAGE-03):** single `<h1>` + four ordered `<h2>` service sections with the verbatim live-site names — (1) Intersectional Disability Equity and Inclusion trainings and facilitation, (2) Disability Consulting, (3) Modeling for Representation, (4) Speaker and Panelist — and a base-prefixed `.button` CTA to `{base}/contact`.
- **Content gate:** `e2e/content.spec.ts` asserts the org name + Get Involved CTA (PAGE-01), the real bio keywords Rimawi-Doster / Access-A-Ride / Harlem Independent Living Center (PAGE-02), and all four service headings (PAGE-03).

## Task Commits

Each task committed atomically:

1. **Task 1: Home static hero placeholder + mission summary + CTAs (PAGE-01)** — `32f2c9c` (feat)
2. **Task 2: About/Mission — real Eman Rimawi bio + flagged mission (PAGE-02)** — `8e24eff` (feat)
3. **Task 3: Programs & Services — four real services + content spec (PAGE-03)** — `ae959de` (feat)

**Plan metadata:** see final docs commit.

## Files Created/Modified

- `src/routes/+page.svelte` — Home: static hero placeholder, flagged authored mission summary, primary/secondary base-prefixed CTAs, "what we do" → programs link
- `src/routes/about/+page.svelte` — About/Mission: flagged authored mission + verbatim real bio, single h1 + three ordered h2s, base-prefixed cross-links
- `src/routes/programs/+page.svelte` — Programs: four verbatim services (one h2 each), single h1, base-prefixed contact CTA
- `e2e/content.spec.ts` — PAGE-01/02/03 content gate (created)

## Verification

- `npm run build` — exits 0 (adapter-static wrote `build/`), real Home/About/Programs content prerendered.
- `e2e/content.spec.ts` — **3/3 passed** (PAGE-01/02/03) against a fresh preview on private port 4178.
- `e2e/shell.spec.ts` — **12/12 passed**: single h1 + heading order held on `/`, `/about`, `/programs` (plus all 7 routes); no shell regression.
- `npm run test:unit` (vitest) — **5/5 passed**; Phase-2 theme unit specs unaffected.
- Port-collision guard honored: ran on a throwaway private-port (4178) config, curl-confirmed 4178 served THIS build's new content (four services + real bio) before trusting results, then removed the temp config (not committed).

## Decisions Made

- The mission statement is authored, not sourced (the live DID site exposes no mission prose). It is rendered so the pages read as complete, but double-flagged (HTML comment + visible disclaimer) on both Home and About so the org must approve/replace the wording before launch.
- Home ships only the static hero placeholder; the Phase-5 Premium 3D hero (Threlte/canvas, capability-gated) is explicitly out of scope here and will replace this region later.

## Deviations from Plan

None — the three `+page.svelte` files and `e2e/content.spec.ts` were written exactly per the plan's `<action>` blocks (verbatim). All acceptance greps and the build + Playwright gates passed on the first content run.

### Environmental note (not a code change)

- Playwright's Windows `webServer` teardown hangs after tests pass (graceful-shutdown wait), inflating wallclock (a "13.6m" run was ~1s of actual tests + idle teardown). Freed by killing the node tree after the green result was captured. No file impact; results are valid. This is the same class of port/preview friction flagged for this project family.

## Known Stubs (intentional, by design)

- **Authored mission prose** (Home `src/routes/+page.svelte` and About `src/routes/about/+page.svelte`): intentional placeholder, clearly flagged in-code and in-UI. Resolution path is **organization sign-off** (content approval), not a future build plan. Does not block the plan goal — pages are complete and funder-readable.
- **Static hero placeholder** (Home): intentional per the scope fence; the real 3D hero is delivered in Phase 5 behind a capability gate.

## User Setup Required

None — no external service configuration. One content action is pending: **org sign-off on the authored mission wording** before public launch.

## Next Phase Readiness

- Three front-door pages now carry real content; 03-04 (get-involved/events/contact) and 03-05 (blog index + a11y hardening) fill the remaining stubs and must keep `e2e/shell.spec.ts` + `e2e/content.spec.ts` green.
- The static hero placeholder is in place for Phase 5 to upgrade behind a capability gate.

---
*Phase: 03-app-shell-content-pipeline-pages*
*Completed: 2026-07-05*

## Self-Check: PASSED

All 4 files exist (`src/routes/+page.svelte`, `src/routes/about/+page.svelte`, `src/routes/programs/+page.svelte`, `e2e/content.spec.ts`) and all 3 task commits (32f2c9c, 8e24eff, ae959de) are present in history.
