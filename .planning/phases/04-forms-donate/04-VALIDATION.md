---
phase: 4
slug: forms-donate
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-07-05
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright `^1.61.1` (E2E, route-mocked) + Vitest `^4.1.9` (unit, jsdom) — both already installed |
| **Config file** | `playwright.theme.config.ts` (local build+preview at :4173, `testDir: e2e`) + `vite.config.ts` test block (vitest, `src/**/*.{test,spec}.{js,ts}`) — REUSE, no new config |
| **Quick run command** | `npx playwright test --config playwright.theme.config.ts e2e/forms.spec.ts` (+ `npm run test:unit` if validation touched) |
| **Full suite command** | `npm run test:e2e && npm run test:unit && npm run build && npm run test:no-secret` |
| **Estimated runtime** | ~60–90 seconds (Playwright includes a build+preview boot) |

---

## Sampling Rate

- **After every task commit:** Run the quick run command (forms.spec.ts; add `npm run test:unit` when Task 1's validation changes).
- **After every plan wave:** Run the full suite command.
- **Before `/gsd:verify-work`:** Full suite must be green (incl. existing `e2e/shell.spec.ts` a11y).
- **Max feedback latency:** ~90 seconds.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | FORM-03 | unit | `npm run test:unit` | ❌ W0 (this task creates it) | ⬜ pending |
| 04-01-02 | 01 | 1 | FORM-01, FORM-03 | e2e | `... e2e/forms.spec.ts -g "contact"` | ❌ W0 (this task creates it) | ⬜ pending |
| 04-01-03 | 01 | 1 | FORM-02 | e2e | `... e2e/forms.spec.ts -g "volunteer"` | ❌ W0 (extends forms.spec.ts) | ⬜ pending |
| 04-02-01 | 02 | 2 | FORM-04 | e2e | `... e2e/forms.spec.ts -g "donate"` | ❌ W0 (extends forms.spec.ts) | ⬜ pending |
| 04-02-02 | 02 | 2 | FORM-04 | static scan | `npm run build && npm run test:no-secret` | ❌ W0 (this task creates it) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Test scaffolds are created inline by the first task that owns each behavior (single-executor sequential plans; no separate Wave-0 plan needed):

- [ ] `src/lib/forms/validation.test.ts` — Vitest unit tests for `validateContact`/`validateVolunteer` (created + passing in 04-01 Task 1; FORM-03).
- [ ] `e2e/forms.spec.ts` — route-mocked E2E; created in 04-01 Task 2 (contact success 200 / server error 400 / network abort / validation focus + aria-invalid), extended in 04-01 Task 3 (volunteer) and 04-02 Task 1 (donate). Uses `page.route('**/api.web3forms.com/submit', ...)` — NO live endpoint.
- [ ] `scripts/assert-no-secret.mjs` + `npm run test:no-secret` — static secret/rel scan (created in 04-02 Task 2; FORM-04 + hygiene), mirrors `scripts/assert-no-shiki-chunk.mjs` / `test:no-shiki`.

*Framework install: none — Playwright + Vitest already configured.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Real screen-reader announcement timbre (NVDA/VoiceOver) on submit | FORM-03 | Live-region + focus behavior across specific AT/browser pairs can't be fully asserted headless | Optional Phase-6 pass: submit contact + volunteer with NVDA and VoiceOver; confirm the success confirmation is spoken and receives focus. Automated E2E already asserts `toBeFocused()` + `role=status/alert`, so this is corroborative, not blocking. |

*All FORM-01/02/03/04 behaviors have automated verification; the row above is corroborative only.*

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify (every task has one)
- [x] Wave 0 covers all MISSING references (validation.test.ts, forms.spec.ts, assert-no-secret.mjs)
- [x] No watch-mode flags
- [x] Feedback latency < 90s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-07-05
