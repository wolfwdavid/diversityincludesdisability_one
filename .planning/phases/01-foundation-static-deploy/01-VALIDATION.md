---
phase: 1
slug: foundation-static-deploy
status: draft
nyquist_compliant: false
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
| **Framework** | Playwright 1.61.x + @axe-core/playwright (smoke only in P1); `svelte-check` for build integrity |
| **Config file** | none yet — Wave 0 scaffolds `playwright.config.ts` |
| **Quick run command** | `npm run build` (adapter-static `strict:true` fails on any un-prerendered route) |
| **Full suite command** | `npm run build && npx playwright test` |
| **Estimated runtime** | ~30–60 seconds (build); smoke test ~15s |

---

## Sampling Rate

- **After every task commit:** Run `npm run build` (must exit 0; `strict:true` guards prerender coverage)
- **After every plan wave:** Run the full suite (`build` + Playwright smoke)
- **Before `/gsd:verify-work`:** Live deployed URL must pass the curl matrix in RESEARCH.md `## Validation Architecture`
- **Max feedback latency:** ~60 seconds

---

## Per-Task Verification Map

*Populated by the planner. Each DEPLOY requirement maps to a build assertion and/or a curl/Playwright check against the deployed URL.*

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| (planner fills) | — | — | DEPLOY-01..04 | build / smoke | `npm run build` / `curl -I` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `playwright.config.ts` — base config for the deployed-URL smoke test
- [ ] `tests/smoke.spec.ts` — asserts skeleton page loads, `_app` asset 200s, `/about/` deep-link resolves, 404 fallback body present
- [ ] `npm i -D @playwright/test @axe-core/playwright` — install if absent

*Note: DEPLOY requirements are verified primarily by `npm run build` (strict prerender) + a curl matrix against the live URL; Playwright smoke is the automated wrapper.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| GitHub Pages source set to "GitHub Actions" | DEPLOY-01 | One-time repo setting, cannot be automated | Repo → Settings → Pages → Source: GitHub Actions (before first deploy publishes) |
| Live sub-path renders with styles | DEPLOY-02 | Requires the real Pages CDN + sub-path | Visit `https://wolfwdavid.github.io/diversityincludesdisability_one/`, confirm CSS/JS load, no 404 in devtools network |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
