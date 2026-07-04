---
phase: 1
slug: foundation-static-deploy
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-07-04
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Foundation phase — the "unit under test" is the DEPLOYED site, so validation is build-time + a smoke check against the live GitHub Pages URL, not localhost.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright 1.61.1 (deployed-URL smoke) + `curl` matrix (HTTP status) + `svelte-check` (build integrity); Vitest 4.1.9 scaffolded for Phase 2 |
| **Config file** | `playwright.config.ts` (scaffolded in 01-02, `baseURL` from `BASE_URL`) |
| **Quick run command** | `npm run build` (adapter-static `strict:true` fails on any un-prerendered route) |
| **Full suite command** | `npm run build && BASE_URL=<live> npm run verify:deploy && npm run smoke` |
| **Estimated runtime** | ~30–60 seconds (build); curl matrix ~5s; Playwright smoke ~15s |

---

## Sampling Rate

- **After every task commit:** Run `npm run build` (must exit 0; `strict:true` guards prerender coverage)
- **After every plan wave:** Wave 1 → `npm run build`; Wave 2 → build + YAML/harness lint; Wave 3 → full live suite
- **Before `/gsd:verify-work`:** Live deployed URL must pass the curl matrix (`scripts/verify-deploy.sh`) in RESEARCH.md `## Validation Architecture` + `npm run smoke`
- **Max feedback latency:** ~60 seconds (build); live checks gated on deploy propagation (1–3 min)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01 T1 | 01-01 | 1 | DEPLOY-01 | scaffold assert | `test -f package.json && grep '@sveltejs/adapter-static' package.json` | ✅ (built) | ⬜ pending |
| 01-01 T2 | 01-01 | 1 | DEPLOY-02/03/04 | config assert | `grep 'base: process.env.BASE_PATH' svelte.config.js && grep 'prerender = true' src/routes/+layout.ts && test -f static/.nojekyll` | ✅ (built) | ⬜ pending |
| 01-01 T3 | 01-01 | 1 | DEPLOY-01/02/03/04 | build (strict) | `npm run build && test -f build/.nojekyll && test -f build/404.html && test -f build/about/index.html` | ✅ (built) | ⬜ pending |
| 01-02 T1 | 01-02 | 2 | DEPLOY-01 | yaml assert | `grep 'BASE_PATH' .github/workflows/deploy.yml && grep 'deploy-pages@' .github/workflows/deploy.yml` | ✅ (built) | ⬜ pending |
| 01-02 T2 | 01-02 | 2 | DEPLOY-01..04 | harness scaffold | `test -f scripts/verify-deploy.sh && test -f tests/deploy.smoke.spec.ts && grep 'baseURL' playwright.config.ts` | ✅ (built) | ⬜ pending |
| 01-03 T1 | 01-03 | 3 | DEPLOY-01 | push/trigger | `git ls-remote --heads origin main && gh run list --workflow "Deploy to GitHub Pages"` | ✅ (built) | ⬜ pending |
| 01-03 T3 | 01-03 | 3 | DEPLOY-01..04 | live smoke | `BASE_URL=<live> npm run verify:deploy && npm run smoke` | ✅ (built) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `playwright.config.ts` — base config for the deployed-URL smoke test → **built in 01-02 T2**
- [x] `tests/deploy.smoke.spec.ts` — asserts skeleton page loads, `_app` asset 200s, `/about/` deep-link resolves, 404 fallback body present → **built in 01-02 T2**
- [x] `scripts/verify-deploy.sh` — the five curl checks, exit-nonzero on failure → **built in 01-02 T2**
- [ ] `npm i -D @playwright/test @axe-core/playwright` — Playwright installed in 01-02 T2; @axe-core deferred to Phase 6 (not needed for P1 smoke)

*Note: DEPLOY requirements are verified primarily by `npm run build` (strict prerender) + a curl matrix against the live URL; Playwright smoke is the automated wrapper. Harness is authored in Wave 2 (01-02) but only runs green in Wave 3 (01-03) once the site is deployed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| GitHub Pages source set to "GitHub Actions" | DEPLOY-01 | One-time repo setting, cannot be automated | Repo → Settings → Pages → Source: GitHub Actions (before first deploy publishes) — 01-03 Task 2 |
| Live sub-path renders with styles | DEPLOY-02 | Requires the real Pages CDN + sub-path | Visit `https://wolfwdavid.github.io/diversityincludesdisability_one/`, confirm CSS/JS load, no 404 in devtools network — 01-03 Task 3 |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (harness authored in 01-02)
- [x] No watch-mode flags
- [x] Feedback latency < 60s (build); live checks gated on deploy propagation
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved (planner) — 2026-07-04
