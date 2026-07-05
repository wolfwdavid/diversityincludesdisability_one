---
phase: 3
slug: app-shell-content-pipeline-pages
status: ready
nyquist_compliant: true
wave_0_complete: false
created: 2026-07-05
updated: 2026-07-05
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Unit framework** | Vitest 4.1.9 (jsdom; `vite.config.ts` globs `src/**/*.{test,spec}.{js,ts}`) |
| **E2E framework** | Playwright 1.61.1 — two local configs |
| **Config files** | `playwright.theme.config.ts` (root-base build+preview @4173, `testIgnore: **/*.base.spec.ts`); `playwright.content.config.ts` (sub-path build+preview @4174, `webServer.env.BASE_PATH`, `testMatch: **/*.base.spec.ts`) |
| **Build gate** | `npm run build` (adapter-static, `strict:true` — fails on any un-prerendered route) |
| **Artifact scan** | `scripts/assert-no-shiki-chunk.mjs` via `npm run test:no-shiki` (BLOG-03) |
| **Quick run command** | `npm run test:unit` (Vitest, fast) |
| **Full suite command** | `npm run test:unit && npm run build && npm run test:no-shiki && npm run test:e2e && npm run test:base` |
| **Estimated runtime** | ~120–180 seconds (build+preview dominates) |

---

## Sampling Rate

- **After every task commit:** Run `npm run test:unit` (+ `svelte-check` via `npm run check`).
- **After every plan wave:** Run `npm run build` + the wave's relevant Playwright spec.
- **Before `/gsd:verify-work`:** Full suite must be green (all commands above exit 0).
- **Max feedback latency:** ~180 seconds (full suite).

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | A11Y-02/03/04, PAGE-08 | e2e scaffold + stubs | `test -f e2e/shell.spec.ts && test -f playwright.content.config.ts` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | PAGE-08, A11Y-04 | grep structural | `grep aria-expanded src/lib/components/Header.svelte` | ❌ W0 | ⬜ pending |
| 03-01-03 | 01 | 1 | A11Y-02/03/04, PAGE-08 | e2e | `npm run build && npx playwright test --config playwright.theme.config.ts e2e/shell.spec.ts` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 2 | BLOG-03 | build-artifact | `grep createHighlighter svelte.config.js` (+ `test:no-shiki` after build) | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 2 | BLOG-02 | unit | `npx vitest run src/lib/posts.test.ts` | ❌ W0 | ⬜ pending |
| 03-02-03 | 02 | 2 | BLOG-01, BLOG-03, PAGE-06 | build + e2e | `npm run build && npm run test:no-shiki && npx playwright test --config playwright.theme.config.ts e2e/blog.spec.ts && npm run test:base` | ❌ W0 | ⬜ pending |
| 03-03-01 | 03 | 2 | PAGE-01 | grep + e2e | `grep 'href="{base}/get-involved"' src/routes/+page.svelte` | ❌ W0 | ⬜ pending |
| 03-03-02 | 03 | 2 | PAGE-02 | grep + e2e | `grep Access-A-Ride src/routes/about/+page.svelte` | ❌ W0 | ⬜ pending |
| 03-03-03 | 03 | 2 | PAGE-03 | e2e content | `npx playwright test --config playwright.theme.config.ts e2e/content.spec.ts` | ❌ W0 | ⬜ pending |
| 03-04-01 | 04 | 2 | PAGE-04 | grep + e2e | `grep 'rel="noopener noreferrer"' src/routes/get-involved/+page.svelte` | ❌ W0 | ⬜ pending |
| 03-04-02 | 04 | 2 | PAGE-05 | grep | `grep 'No upcoming events' src/routes/events/+page.svelte` | ❌ W0 | ⬜ pending |
| 03-04-03 | 04 | 2 | PAGE-07 | e2e scaffold | `npx playwright test --config playwright.theme.config.ts e2e/scaffold.spec.ts` | ❌ W0 | ⬜ pending |
| 03-05-01 | 05 | 3 | PAGE-06, BLOG-02 | e2e | `npx playwright test --config playwright.theme.config.ts e2e/blog-index.spec.ts` | ❌ W0 | ⬜ pending |
| 03-05-02 | 05 | 3 | A11Y-03, A11Y-04 | full suite | `npm run test:unit && npm run build && npm run test:no-shiki && npm run test:e2e && npm run test:base` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Wave 0 scaffolding is distributed into the first task of the owning plan (interface-first, then implement):

- [ ] `playwright.content.config.ts` — sub-path (BASE_PATH) build+preview harness (03-01 T1)
- [ ] `playwright.theme.config.ts` — add `testIgnore: **/*.base.spec.ts` (03-01 T1)
- [ ] `e2e/shell.spec.ts` — A11Y-02/03/04 + PAGE-08 across all 7 routes (03-01 T1)
- [ ] Five route stubs (programs/get-involved/events/contact/blog) so strict prerender resolves the nav (03-01 T1)
- [ ] `scripts/assert-no-shiki-chunk.mjs` + `test:no-shiki` script (03-02 T1)
- [ ] `src/lib/posts.test.ts` — mocked-glob unit test for sort/draft/slug (03-02 T2)
- [ ] `src/lib/posts/*.md` — 2 sample posts w/ frontmatter + code fence (03-02 T2)
- [ ] `e2e/blog.spec.ts` + `e2e/blog.base.spec.ts` (03-02 T3)
- [ ] `e2e/content.spec.ts` (03-03 T3), `e2e/scaffold.spec.ts` (03-04 T3), `e2e/blog-index.spec.ts` (03-05 T1)
- [ ] Framework installs: `npm i -D mdsvex@0.12.7 shiki@4.3.1 rehype-slug@6.0.0` (03-02 T1) — blocks the pipeline
- [ ] `src/lib/data/events.ts` sample data (03-04 T2)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Mission/authored-copy wording is org-approved | PAGE-01/02/04/05 (content) | Editorial sign-off, not automatable | Org reviews Home/About mission + Get Involved/Events placeholder copy before launch |
| Full WCAG 2.2 AA conformance (axe/Lighthouse, SR walkthrough) | A11Y-01 | Deferred to Phase 6 by design | Phase 6 runs axe + manual SR/keyboard across both themes; Phase 3 validates STRUCTURE only |

*Phase 3 automates all structural a11y behaviors (skip-link focus, landmarks, heading order, keyboard nav, target size). Full conformance is Phase 6.*

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (specs, configs, fixtures, installs)
- [x] No watch-mode flags (all `vitest run` / `playwright test`, never `--watch`)
- [x] Feedback latency < 180s (full suite)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** ready 2026-07-05 (planner). `wave_0_complete` flips true once 03-01 T1 + 03-02 T1/T2 land the scaffolds.
