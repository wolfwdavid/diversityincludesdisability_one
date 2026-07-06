---
phase: 5
slug: premium-3d-hero
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-06
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright e2e (existing) + node grep-gate scripts |
| **Config file** | playwright.config.ts (existing; see RESEARCH harness gotchas) |
| **Quick run command** | `npm run test:boundary` (bundle-split gate) |
| **Full suite command** | `npm test` (build + gates + e2e) |
| **Estimated runtime** | ~120 seconds |

---

## Sampling Rate

- **After every task commit:** Run the quick gate relevant to the task (boundary grep / targeted spec)
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 180 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| (filled by planner from RESEARCH "Validation Architecture") | | | HERO-01..04, A11Y-05 | e2e / grep-gate | | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `scripts/check-3d-boundary.mjs` — content-based bundle-split gate (adapted from sibling `_four`)
- [ ] Playwright spec stubs for HERO-01..04 + A11Y-05 (capability gate, poster fallback, reduced-motion = no canvas, disposal nav loop)

*See RESEARCH.md "Validation Architecture" for the authoritative gate list.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| AA contrast of hero heading/CTA over the brightest dynamic orb frame | A11Y-05 | Dynamic canvas pixels not axe-checkable | Capture Premium hero frames; verify scrim keeps text ≥4.5:1 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 180s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
