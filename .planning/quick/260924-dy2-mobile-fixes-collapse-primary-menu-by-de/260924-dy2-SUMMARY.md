---
phase: quick-260924-dy2
plan: 01
subsystem: ui
tags: [mobile, header, disclosure-nav, css, creative-page, playwright]

requires:
  - quick-260924-dd3 (Creative page with the two runway clips)
provides:
  - Primary menu collapsed by default on phones (hidden attribute honoured)
  - Mobile header layout: brand / (Menu + theme toggle) / full-width list
  - Runway clips fill the column on phones, pair up at 22rem on desktop
  - e2e regression coverage for hidden-on-load at 390px and visible-without-click at 1200px
affects: [PAGE-08, A11Y-04, PAGE-02]

tech-stack:
  added: []
  patterns:
    - Component-scoped `.menu[hidden] { display: none; }` outside the media query, desktop override after it (same specificity, source order wins)
    - CSS `order` to reorder the nav visually without touching DOM/focus order or aria-controls

key-files:
  created: []
  modified:
    - src/lib/components/Header.svelte
    - e2e/shell.spec.ts
    - src/routes/creative/+page.svelte

decisions:
  - Fix the hidden rule inside Header.svelte, not with a global `[hidden]` rule in reset.css (one-file change, cannot regress anything else)
  - Reorder mobile nav with CSS `order` on `.menu`, never by moving markup
  - Keep `width="176" height="144"` on both videos; size the `li` instead so the video can fill it

metrics:
  duration: ~9 min
  completed: 2026-09-24
  tasks: 3
  commits: 2
---

# Quick Task 260924-dy2: Mobile fixes — collapse primary menu by default, full-width runway clips

**One-liner:** Scoped `.menu[hidden] { display: none }` so the phone header collapses from 557px to 105-110px, wrapping-flex nav puts Menu + theme toggle on one row with the open list full-width beneath, and `.clips li { flex: 1 1 14rem; max-inline-size: 22rem }` grows the runway clips from 176px thumbnails to 352px on a 390px phone.

## What changed and why

### Task 1 — Header.svelte + e2e/shell.spec.ts (commit `c0558b4`)

**Root cause:** the scoped `.menu { display: flex; ... }` rule (specificity `.menu.svelte-xxxx`) beat the user-agent `[hidden] { display: none }`, and `reset.css` has no `[hidden]` rule. The desktop media query deliberately overrides `.menu[hidden]` to `display: flex`, but the mobile branch had no counterpart, so every page loaded with all eight links expanded even though `hidden` and `aria-expanded="false"` were set correctly.

**Fix (style block only; script, markup, aria attributes, Escape handler, 44px targets and focus ring byte-identical):**
- New `nav` rule: `display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2) var(--space-3); flex: 1 1 100%` — the nav becomes its own full row under the brand on phones.
- `.menu` gains `flex-basis: 100%; order: 1` — the open list spans the nav row and is visually placed after both the Menu button and the theme toggle (DOM order unchanged).
- New `.menu[hidden] { display: none; }` after `.menu`, outside the media query.
- Desktop query resets `nav { flex: 0 1 auto }`, `.menu { flex-basis: auto; order: 0 }`, and keeps the existing `.menu[hidden] { display: flex; }` verbatim after the mobile rule so source order wins at >= 48rem.

**Test:** the A11Y-04 disclosure test now runs at 390x844, asserts `#primary-menu` `toBeHidden()` on load, `toBeVisible()` after click, Menu button and theme toggle share a row (|dy| < 2px), the open list starts below the buttons and spans the nav width, and `toBeHidden()` again after Escape with focus returned. A new PAGE-08 test at 1200x800 asserts the list is visible without a click and the Menu button is hidden.

### Task 2 — creative/+page.svelte (commit `44d0afc`)

**Root cause:** the `.clips li` flex items had no `flex` rule, so they shrink-wrapped to the videos' 176px intrinsic width; `inline-size: min(100%, 22rem)` then resolved against that 176px box.

**Fix (style block only; markup incl. `width="176" height="144"`, `.founder-photo*` and `.lede` untouched):** `.clips li { flex: 1 1 14rem; max-inline-size: 22rem }` and `.clips video { inline-size: 100% }`. At 390px (358px column) each item wraps to its own line and grows to min(358px, 22rem) = 352px; on desktop both items share a row at 22rem each.

## Commits (on `main`, NOT pushed — main is ahead of origin/main by 2)

| Task | Commit | Message | Files |
|------|--------|---------|-------|
| 1 | `c0558b4` | fix(header): collapse the primary menu by default on phones | src/lib/components/Header.svelte, e2e/shell.spec.ts |
| 2 | `44d0afc` | fix(creative): let runway clips fill the column on phones | src/routes/creative/+page.svelte |

Both messages describe the change only: no AI mentions, no Co-Authored-By trailer (verified by grep on `git show`).

## Verification results (Task 3)

| Check | Result |
|-------|--------|
| `npm run check` (svelte-check) | 818 files, **1 error, 5 warnings** — the single error is the pre-existing `tests/deploy.smoke.spec.ts` "Cannot find name 'process'" (`@types/node`). Nothing mentions Header, creative, or shell.spec. Warnings are pre-existing (Orbs/Connections `state_referenced_locally`, unused `.disclaimer` selector). |
| `npm run test:unit` (vitest) | **9 passed / 9** (3 files) |
| Playwright subset `shell + content + scaffold + forms` (playwright.theme.config.ts, root-base webServer build) | **27 passed / 27**, 0 failed, 9.8s — includes `nav disclosure: menu hidden on load, aria-expanded toggles, Escape closes + returns focus (A11Y-04)` and `primary menu is visible on desktop widths without the disclosure button (PAGE-08)` |
| `MSYS_NO_PATHCONV=1 BASE_PATH=/diversityincludesdisability_one npm run build` | exit 0, `build/creative/index.html` present and contains `primary-menu` |
| `npm run test:no-secret` (src/ + build/) | OK — no committed key, placeholder present, rel=noopener present |
| iPhone-13 one-off (`scripts/tmp/mobile-check.mjs` vs `vite preview --port 4194` of the BASE_PATH build) | exit 0, **34/34 PASS** across accessible + premium x /creative/ + /about/ |
| Stale-preview check on 4173 before Playwright | nothing listening |
| Cleanup | :4194 preview killed (PID 3860; curl now returns 000), `scripts/tmp` removed |

### iPhone-13 one-off measurements (390x844, chromium with the iPhone 13 device descriptor)

```
[accessible /creative/] {"closed":{"theme":"accessible","headerH":110,"menuHidden":true,"videoWidths":[352,352],"scrollWidth":390,"innerWidth":390},"open":{"menuVisible":true,"sameRow":true,"listBelow":true,"listFullWidth":true,"scrollWidth":390}}
[accessible /about/]    {"closed":{"theme":"accessible","headerH":110,"menuHidden":true,"videoWidths":[],"scrollWidth":390,"innerWidth":390},"open":{"menuVisible":true,"sameRow":true,"listBelow":true,"listFullWidth":true,"scrollWidth":390}}
[premium /creative/]    {"closed":{"theme":"premium","headerH":105,"menuHidden":true,"videoWidths":[352,352],"scrollWidth":390,"innerWidth":390},"open":{"menuVisible":true,"sameRow":true,"listBelow":true,"listFullWidth":true,"scrollWidth":390}}
[premium /about/]       {"closed":{"theme":"premium","headerH":105,"menuHidden":true,"videoWidths":[],"scrollWidth":390,"innerWidth":390},"open":{"menuVisible":true,"sameRow":true,"listBelow":true,"listFullWidth":true,"scrollWidth":390}}
```

Summary of the numbers:
- Header height with the menu closed: **110px** (accessible), **105px** (premium) — down from 557px on the live site; inside the 90-140 band.
- `#primary-menu` hidden on load: **true** on all four page/theme combinations (`hidden` attribute set AND computed `display: none`).
- Runway clip widths on /creative/: **[352, 352]** px in both themes (was 194px thumbnails inside the 358px column).
- `documentElement.scrollWidth`: **390** with the menu closed and **390** with it open, all four combinations — no horizontal overflow.
- After clicking Menu: list visible, Menu button and theme toggle on one row, list starts below the buttons and spans the full nav width — true on all four.

## Deviations from Plan

None in the code or the verification steps — the plan executed as written.

One procedural note: the plan's preflight expects `git status --short` to be empty, but the untracked `.planning/quick/260924-dy2-.../` directory (the plan file itself, created by the orchestrator) was present at start. Every "tree clean" gate was evaluated excluding that directory; no other untracked or modified files existed at any point.

## Known Stubs

None. No placeholder values or unwired data were introduced; both changes are pure CSS plus a test.

## Left open (for the orchestrator)

- `git push origin main` (2 commits ahead) — deliberately not pushed per the constraints.
- This SUMMARY (and the plan file) are untracked in `.planning/quick/...` — commit them together with the orchestrator's STATE.md update.
- No Playwright project, no browser install, and no `playwright*.config.ts` edits were made, per the locked decisions.

## Self-Check: PASSED

- `src/lib/components/Header.svelte` — FOUND, contains `.menu[hidden] { display: none; }` (1x) and `.menu[hidden] { display: flex; }` (1x), mobile rule at line 87 precedes `@media` at line 99
- `src/routes/creative/+page.svelte` — FOUND, contains `.clips li {` with `flex: 1 1 14rem;`
- `e2e/shell.spec.ts` — FOUND, contains `toBeHidden()`, `width: 390, height: 844`, `width: 1200, height: 800`
- Commit `c0558b4` — FOUND on main
- Commit `44d0afc` — FOUND on main
- `scripts/tmp` — absent; port 4194 — not listening
