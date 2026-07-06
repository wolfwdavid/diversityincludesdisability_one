---
phase: 5
slug: premium-3d-hero
status: planned
nyquist_compliant: true
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
| 05-01 T1 capability gate | 05-01 | 1 | HERO-02, A11Y-05 | type-check | `npx svelte-check` + grep exports notLowPower/webglSupported/prefersReducedMotion | ❌ W0 → creates | ⬜ pending |
| 05-01 T2 boundary proof (RED) | 05-01 | 1 | HERO-04 | grep-gate | `node scripts/check-3d-boundary.mjs` (exits 1 "no premium chunk" = correct RED) | ❌ W0 → creates | ⬜ pending |
| 05-01 T3 spec stubs (RED) | 05-01 | 1 | HERO-01..04, A11Y-05 | e2e (authored) | `npx playwright test --config playwright.theme.config.ts --list e2e/premium-*.spec.ts` | ❌ W0 → creates | ⬜ pending |
| 05-02 T1 four-level boundary | 05-02 | 2 | HERO-02 | type-check | `npx svelte-check` + grep gate composition | ❌ → 05-01 | ⬜ pending |
| 05-02 T2 constellation scene | 05-02 | 2 | HERO-01, HERO-04 | grep-gate + build | `npm run build && node scripts/check-3d-boundary.mjs` (now GREEN: chunk split) | ❌ → 05-01 | ⬜ pending |
| 05-02 T3 hero wiring + specs | 05-02 | 2 | HERO-01, HERO-02, HERO-04 | e2e | `npx playwright test --config playwright.theme.config.ts e2e/premium-bundle.spec.ts e2e/premium-dispose.spec.ts` | ❌ → 05-01 | ⬜ pending |
| 05-03 T1 poster capture | 05-03 | 3 | HERO-03 | file-size gate | `ls static/hero/constellation-poster.{avif,webp,jpg}` + size bounds | ❌ → 05-02 | ⬜ pending |
| 05-03 T2 poster wiring + fallback specs | 05-03 | 3 | HERO-03, A11Y-05 | e2e | `npx playwright test --config playwright.theme.config.ts e2e/premium-hero.spec.ts` (all branches GREEN) | ❌ → 05-01 | ⬜ pending |
| 05-03 T3 AA + aesthetic (manual) | 05-03 | 3 | A11Y-05 | human-verify | scrim keeps h1/CTA >=4.5:1 over brightest-orb frame; poster/crossfade sign-off | manual | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `scripts/check-3d-boundary.mjs` — content-based bundle-split gate (05-01 T2, copied verbatim from `_four`)
- [x] Playwright spec stubs for HERO-01..04 + A11Y-05 (05-01 T3: premium-hero / premium-bundle / premium-dispose specs, `did:theme` key, no axe, no data-hydrated wait)

*See RESEARCH.md "Validation Architecture" for the authoritative gate list.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| AA contrast of hero heading/CTA over the brightest dynamic orb frame | A11Y-05 | Dynamic canvas pixels not axe-checkable | Capture Premium hero frames; verify scrim keeps text ≥4.5:1 |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (05-01 creates gate script + capability gate + spec stubs before any scene work)
- [x] No watch-mode flags
- [x] Feedback latency < 180s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** planned 2026-07-06 (3 plans, waves 1→2→3)
