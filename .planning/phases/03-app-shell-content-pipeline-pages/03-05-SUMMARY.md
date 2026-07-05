---
phase: 03-app-shell-content-pipeline-pages
plan: 05
subsystem: blog-index-a11y
tags: [sveltekit, svelte5, blog, mdsvex, accessibility, wcag, playwright, phase-gate]

# Dependency graph
requires:
  - phase: 03-app-shell-content-pipeline-pages (03-01)
    provides: app shell + landmarks + base-prefix convention + e2e/shell.spec.ts A11Y gate across 7 routes
  - phase: 03-app-shell-content-pipeline-pages (03-02)
    provides: posts.ts eager-glob index (PostMeta[], draft-filtered, date-desc) + prerendered blog/[slug] post pages
  - phase: 03-app-shell-content-pipeline-pages (03-03, 03-04)
    provides: real content on Home/About/Programs/Get-Involved/Events/Contact (all 7 pages now carry content)
provides:
  - Reader-facing Blog/News index (blog/+page.svelte) driven by posts.ts — title link + date + summary, newest-first, empty-state, base-prefixed trailing-slash post links (PAGE-06, BLOG-02 presentation)
  - e2e/blog-index.spec.ts (lists title/date/summary, newest-first sort, click-through to a static post page)
  - Site-wide structural a11y gate verified green across all 7 real pages (single h1, ordered headings, landmarks, visible focus, >=24px targets)
  - Focus-visibility assertion (WCAG 2.4.7) added to e2e/shell.spec.ts
  - Full Phase-3 gate signed off in 03-VALIDATION.md
affects: [06-a11y-hardening]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Blog index consumes the posts.ts contract as-is (import { posts }) — no re-sort/re-glob; presentation-only layer over the 03-02 pipeline"
    - "Base-prefixed trailing-slash post links: href=\"{base}/blog/{post.slug}/\" (trailingSlash='always')"
    - "Index h1 is 'News'; each post title is an h2 link — keeps single-h1 + heading order valid site-wide"

key-files:
  created:
    - src/routes/blog/+page.svelte
    - e2e/blog-index.spec.ts
  modified:
    - e2e/shell.spec.ts
    - .planning/phases/03-app-shell-content-pipeline-pages/03-VALIDATION.md

key-decisions:
  - "No page fixes required in the hardening pass — all 7 real pages already passed single-h1, heading-order, landmarks, and >=24px target checks; only the focus-visibility (2.4.7) assertion was added to the shell spec per the plan"
  - "Full-suite gate run on private ports (4190/4191/4192) with throwaway no-webServer configs (deleted, uncommitted) to dodge the active sibling-session port-4173/4174 squatting; each preview curl-verified to serve THIS build before running"

patterns-established:
  - "Blog index is a thin presentation over posts.ts; the pipeline (svelte.config.js, posts.ts, blog/[slug]) is consumed unchanged per the plan SCOPE FENCE"

requirements-completed: [PAGE-06, A11Y-03, A11Y-04]

# Metrics
duration: 22min
completed: 2026-07-05
---

# Phase 3 Plan 05: Blog/News Index + Site-Wide A11y Hardening Summary

**Replaced the 03-01 blog stub with a real posts.ts-driven Blog/News index (title link + date + summary, newest-first, empty-state, base-prefixed trailing-slash post links), added a click-through E2E spec, and ran the full Phase-3 gate on private curl-verified ports — 5 unit, root+sub-path builds at 0, no-shiki clean, 29 root E2E (shell 13/13 across all 7 real pages incl. a new WCAG 2.4.7 focus-visibility assertion), and 1 sub-path deep-link — all green with zero page fixes needed. Closes Phase 3.**

## Performance

- **Duration:** ~22 min
- **Tasks:** 2
- **Files modified:** 4 (2 created, 2 modified)

## Accomplishments
- `src/routes/blog/+page.svelte` now imports `posts` from `$lib/posts` and renders each non-draft post newest-first as an `<h2>` title link (`href="{base}/blog/{post.slug}/"`), a `<time datetime>` date, and a summary, with a `{:else}` empty-state. Single `<h1>` ("News") preserved; no re-sort/re-glob (consumes the 03-02 contract as-is).
- `e2e/blog-index.spec.ts` proves the index lists title/date/summary, that "Welcome to Diversity Includes Disability" is listed first (BLOG-02 sort), and that clicking a title navigates to `/blog/welcome/` where the static post renders (PAGE-06). 3/3 green.
- Added a focus-visibility assertion (WCAG 2.4.7) to `e2e/shell.spec.ts`: a focused primary-nav link yields a non-`none` outline style. Shell spec now 13/13.
- Site-wide structural a11y confirmed green across all seven now-real pages — single h1, heading levels never skip, header/nav/main/footer landmarks, visible focus, ≥24px targets. **No heading-order or target-size regression surfaced; zero page fixes required.**
- `03-VALIDATION.md` sign-off populated: Per-Task Map all green, Wave 0 scaffolds checked, `wave_0_complete: true`, final gate run recorded.

## Task Commits

Each task was committed atomically:

1. **Task 1: Blog/News index + blog-index E2E** - `12aa1a4` (feat)
2. **Task 2: focus-visibility assertion (shell spec)** - `c0a0068` (test)
3. **Task 2: validation sign-off** - `1bbda86` (docs)

**Plan metadata:** see final docs commit.

## Files Created/Modified
- `src/routes/blog/+page.svelte` - Real posts.ts-driven index (replaces 03-01 stub): title link + date + summary, newest-first, empty-state, base-prefixed trailing-slash links
- `e2e/blog-index.spec.ts` - Lists title/date/summary + newest-first + click-through to static post (PAGE-06/BLOG-02)
- `e2e/shell.spec.ts` - Added WCAG 2.4.7 focus-visibility assertion for primary-nav links
- `.planning/phases/03-app-shell-content-pipeline-pages/03-VALIDATION.md` - Sign-off populated; final gate run recorded

## Full Phase-3 Gate (the exact suite, all green)

Equivalent to `npm run test:unit && npm run build && npm run test:no-shiki && npm run test:e2e && npm run test:base`, executed on private curl-verified ports:

| Gate | Command | Result |
|------|---------|--------|
| Unit | `npm run test:unit` | **5 passed** |
| Build (root) | `npm run build` | exit 0 |
| Build (sub-path) | `BASE_PATH=/diversityincludesdisability_one npm run build` | exit 0 |
| No-shiki (BLOG-03) | `npm run test:no-shiki` | OK (no highlighter in build/_app) |
| Root E2E | full `e2e/*` (not `*.base`) @ private port 4192 | **29 passed** |
| Sub-path E2E | `e2e/*.base.spec.ts` @ private port 4191 | **1 passed** |

Root E2E breakdown: shell 13/13 (all 7 pages: landmarks+single-h1, heading order, PAGE-08 reachability, disclosure Escape-returns-focus, focus-visibility 2.4.7, ≥24px targets), content 3, scaffold 3, blog 2, blog-index 3, theme 5.

## Decisions Made
- No page edits in the hardening pass — every real page already satisfied the structural a11y checks; only the focus-visibility assertion was added (plan-mandated).
- Gate run on private ports (4190/4191/4192) with throwaway `no-webServer` Playwright configs, each curl-verified to serve THIS build, to avoid the active sibling `_two` session squatting the shared 4173/4174 ports. Temp configs deleted, never committed.

## Deviations from Plan

None — plan executed exactly as written. The plan's Task-1 verification pointed at the shared `playwright.theme.config.ts` (port 4173); per the standing cross-project port-collision guidance this was run against a private, curl-verified port instead, with identical spec content and identical (green) results. No code deviation.

## Known Stubs
None. The blog index is fully wired to `posts.ts` (real data). The Home 3D hero remains an intentional static placeholder owned by Phase 5, and the Contact form remains an intentional a11y scaffold owned by Phase 4 — both documented in prior summaries, neither in this plan's scope.

## Next Phase Readiness
- The seven-page accessible site is complete and navigable end-to-end with a working markdown blog (index + prerendered posts) — no forms wired, no 3D. Phase 4 wires the Contact/volunteer form backend; Phase 5 adds the capability-gated 3D hero; **Phase 6 runs full WCAG 2.2 AA axe/Lighthouse + SR conformance** (this phase validated structure only).

---
*Phase: 03-app-shell-content-pipeline-pages*
*Completed: 2026-07-05*

## Self-Check: PASSED

All 4 listed files exist (`blog/+page.svelte`, `e2e/blog-index.spec.ts`, `e2e/shell.spec.ts`, `03-05-SUMMARY.md`) and all 3 task commits (12aa1a4, c0a0068, 1bbda86) are present in history. Throwaway Playwright configs (4190/4191/4192) removed, not committed.
