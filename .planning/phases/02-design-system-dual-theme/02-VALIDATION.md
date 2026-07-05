---
phase: 2
slug: design-system-dual-theme
status: planned
nyquist_compliant: true
wave_0_complete: false
created: 2026-07-04
updated: 2026-07-04
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework (unit)** | Vitest 4.1.9 (installed) — jsdom env for `theme.svelte.ts` store logic |
| **Framework (E2E)** | Playwright 1.61.1 (installed) — no-flash / defaulting / persistence / keyboard+aria |
| **Config file (unit)** | `vite.config.ts` `test` block — added in Wave 0 (02-01 Task 1); needs `jsdom` dep |
| **Config file (E2E)** | `playwright.theme.config.ts` — added in Wave 0; local `webServer` (build + preview :4173), `testDir: e2e/`. SEPARATE from Phase-1 `playwright.config.ts` (live smoke, `tests/`). |
| **Quick run command** | `npm run test:unit` (= `vitest run src/lib/theme`) |
| **Full suite command** | `npm run check && npm run test:unit && npx playwright test --config playwright.theme.config.ts && npm run build` |
| **Estimated runtime** | ~30–60 s (build+preview boot dominates the E2E leg) |

Playwright drives THEME-05 deterministically via `page.emulateMedia({ reducedMotion: 'reduce' })`, and reads `document.documentElement.dataset.theme` immediately after `goto` (before any click) to verify THEME-04's pre-paint guarantee. Unit test mocks `$app/environment` (`browser: true`) so the store's `initial()` reconciles from the jsdom `<html>` attribute.

---

## Sampling Rate

- **After every task commit:** Run `npm run test:unit` (fast, pure logic) where a store exists; otherwise the task's scoped `-g` Playwright slice.
- **After every plan wave:** Run `npm run check && npm run test:unit && npx playwright test --config playwright.theme.config.ts`.
- **Before `/gsd:verify-work`:** Full suite green + `npm run build` exits 0.
- **Max feedback latency:** ~60 s.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | (infra) | scaffold | `test -f e2e/theme.spec.ts && grep "environment: 'jsdom'" vite.config.ts && grep webServer playwright.theme.config.ts` | ❌ W0 → created here | ⬜ pending |
| 02-01-02 | 01 | 1 | THEME-03 | file/CSS | `grep --color-bg/--motion-duration src/lib/styles/tokens/base.css` | ✅ after task | ⬜ pending |
| 02-01-03 | 01 | 1 | THEME-03 | E2E (computed style) | `npx playwright test --config playwright.theme.config.ts -g "peer designs"` | ✅ (02-01-01) | ⬜ pending |
| 02-02-01 | 02 | 2 | THEME-04, THEME-05 | E2E | `npx playwright test --config playwright.theme.config.ts -g "no flash\|accessible-first"` | ✅ (02-01-01) | ⬜ pending |
| 02-02-02 | 02 | 2 | THEME-02 (+01 store logic) | unit + E2E | `npm run test:unit && npx playwright test --config playwright.theme.config.ts -g "no flash\|accessible-first\|persists"` | ✅ (02-01-01) | ⬜ pending |
| 02-03-01 | 03 | 3 | THEME-06 | file + E2E | `grep aria-pressed/aria-live src/lib/theme/ThemeToggle.svelte` | ✅ after task | ⬜ pending |
| 02-03-02 | 03 | 3 | THEME-01, THEME-06 | E2E (full) | `npx playwright test --config playwright.theme.config.ts` | ✅ (02-01-01) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

Requirement → test coverage: THEME-01 (02-03-02 + store unit), THEME-02 (02-02-02 unit+E2E), THEME-03 (02-01-03), THEME-04 (02-02-01), THEME-05 (02-02-01), THEME-06 (02-03-01/02). All six covered by an automated command.

---

## Wave 0 Requirements

Wave 0 is delivered as **02-01 Task 1** (first task of the first plan). It creates:

- [ ] `jsdom` dev dependency (`npm install -D jsdom`) — Vitest environment
- [ ] `vite.config.ts` `test` block — `environment: 'jsdom'`, `include: src/**`, `exclude: e2e/**, tests/**`
- [ ] `playwright.theme.config.ts` — local `webServer` (build + `preview --port 4173`), `testDir: e2e/`, `baseURL http://localhost:4173/`
- [ ] `package.json` scripts — `test:unit`, `test:theme`
- [ ] `src/lib/theme/theme.test.ts` — unit stubs for store toggle + persistence (RED until 02-02 creates `theme.svelte.ts`)
- [ ] `e2e/theme.spec.ts` — full THEME-01..06 spec; `peer designs` green in 02-01, remaining slices RED until 02-02 / 02-03

Phase-1 harness (`playwright.config.ts`, `tests/deploy.smoke.spec.ts`) is intentionally left untouched — Phase-2 E2E lives in `e2e/` with its own config.

*Not in scope this phase:* `@axe-core/playwright` WCAG scan (Phase 6).

---

## Manual-Only Verifications

*All phase behaviors have automated verification.* The no-flash guarantee (THEME-04), accessible-first defaulting (THEME-05), persistence (THEME-02), keyboard/aria/focus (THEME-06), and peer-design differences (THEME-03) are each covered by Playwright/Vitest. A one-time human spot-check with a real screen reader (NVDA/VoiceOver) confirming the "…theme enabled" announcement is recommended but not gating.

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (theme.test.ts, e2e/theme.spec.ts, vitest+playwright configs)
- [x] No watch-mode flags
- [x] Feedback latency < 60 s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-07-04 (planning)
