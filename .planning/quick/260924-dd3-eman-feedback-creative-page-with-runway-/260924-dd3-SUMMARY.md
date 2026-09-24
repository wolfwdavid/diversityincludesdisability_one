---
phase: quick-260924-dd3
plan: 01
subsystem: content-pages
tags: [creative-page, media, credit-correction, contact-email, nav]
requires: []
provides:
  - "/creative/ route (Pictures then Videos) with corrected show/designer credit"
  - "Creative entry in the primary nav (Header + Footer)"
  - "Org contact email diversityincludesdisability@gmail.com site-wide"
affects: [about-page, footer, contact-page, get-involved-page, e2e-shell-spec]
tech-stack:
  added: []
  patterns: ["Media served from static/<route>/ matching the page that owns it"]
key-files:
  created:
    - src/routes/creative/+page.svelte
    - static/creative/eman-runway.avif (git mv from static/about/)
    - static/creative/eman-runway.webp (git mv)
    - static/creative/eman-runway.jpg (git mv)
    - static/creative/eman-clip-1.mp4 (git mv)
    - static/creative/eman-clip-2.mp4 (git mv)
  modified:
    - src/routes/about/+page.svelte
    - src/lib/data/nav.ts
    - content/media/eman/MANIFEST.md
    - e2e/shell.spec.ts
    - src/lib/components/Footer.svelte
    - src/routes/contact/+page.svelte
    - src/routes/get-involved/+page.svelte
    - src/lib/config.ts
    - e2e/forms.spec.ts
    - e2e/scaffold.spec.ts
decisions:
  - "Media moved with git mv so history follows the files; static/about/ removed entirely"
  - "Credit is show + designer only (The Model Experience, New York Fashion Week / One World Peace Co.) — no photographer line"
  - "content/media/eman/ file slugs keep the old one-world-worldwide name on purpose; MANIFEST documents the misread"
metrics:
  duration: "~12 min"
  completed: "2026-09-24"
  tasks: 3
  commits: 2
---

# Quick 260924-dd3: Eman feedback — Creative page, corrected credit, org email

**One-liner:** New `/creative/` page hosts the runway photo (Pictures) above both clips (Videos) with the corrected credit "Eman walking for One World Peace Co. at The Model Experience show, New York Fashion Week", About is trimmed back to bio + link, and every contact address is now diversityincludesdisability@gmail.com.

## What changed

### Task 1 — Creative page, media move, About trim, credit, nav, shell spec — `8904b20`

- `git mv` of all five assets `static/about/` -> `static/creative/`; `static/about/` no longer exists.
- `src/lib/data/nav.ts`: `{ href: '/creative', label: 'Creative' }` inserted between About and Programs & Services (Header and Footer both render from this list).
- `src/routes/creative/+page.svelte` (new): h1 Creative, lede reusing existing About/Programs wording, `<section aria-labelledby="pictures">` with the `<figure class="founder-photo">` (avif/webp/jpg, 985x943, lazy), then `<section aria-labelledby="videos">` with both `<video>` clips. Alt text ends "...in front of a One World Peace backdrop."; figcaption is the locked wording; clip aria-labels reference The Model Experience runway show. Seven `{base}/creative/eman-*` references.
- `src/routes/about/+page.svelte`: figure, Watch section and the whole `<style>` block removed; founder bio now ends "See photos and video from her runway work on the <a href="{base}/creative">Creative page</a>." Mission paragraph untouched.
- `content/media/eman/MANIFEST.md`: wiring line updated to `/creative/` (with the About history), table cell corrected to the One World Peace backdrop + designer/show, new "Credit (from Eman, 2026-09-24)" section noting the slug is intentionally stale. No file under `content/media/eman/` renamed.
- `e2e/shell.spec.ts`: ROUTES gains `/creative/`, nav-label loop gains `/creative/i`, test renamed "all 8 pages reachable from header nav (PAGE-08)".

Note: the first `git commit` for this task landed with only the five renames because `git add` aborted on the now-nonexistent `static/about` pathspec listed in the plan; the commit was amended (nothing had been pushed) so Task 1 is still exactly one commit, `8904b20`.

### Task 2 — Organization email everywhere — `9631526`

`emanrimawi@gmail.com` -> `diversityincludesdisability@gmail.com` in Footer.svelte (href + text), contact/+page.svelte (2x href + text), get-involved/+page.svelte (href + text), config.ts comment (parenthetical now "org address per Eman 2026-09-24"), forms.spec.ts and scaffold.spec.ts regex locators. 11 occurrences total across the six files; zero `emanrimawi` hits remain in src/, static/, e2e/, tests/, scripts/. `.planning/` history untouched by design.

### Task 3 — Verification (nothing committed; build/ is gitignored)

## Verification results

| Check | Result |
|---|---|
| `npm run check` | 818 files, **1 error** = the pre-existing `@types/node` error in `tests/deploy.smoke.spec.ts` (allowed); 5 pre-existing warnings in premium scene / home page, none in changed files |
| `MSYS_NO_PATHCONV=1 BASE_PATH=/diversityincludesdisability_one npm run build` | exit 0, "built in 3.43s", adapter-static wrote `build/` |
| `ls build/creative` | `eman-clip-1.mp4 eman-clip-2.mp4 eman-runway.avif eman-runway.jpg eman-runway.webp index.html` |
| `ls build/about` | `index.html` only |
| Preview :4193 `/creative/` `/about/` | 200 / 200 |
| `/creative/eman-runway.avif` | HTTP/1.1 200 OK, Content-Type: image/avif |
| `/creative/eman-runway.webp` | HTTP/1.1 200 OK, Content-Type: image/webp |
| `/creative/eman-runway.jpg` | HTTP/1.1 200 OK, Content-Type: image/jpeg |
| `/creative/eman-clip-1.mp4` | HTTP/1.1 200 OK, Content-Type: video/mp4 |
| `/creative/eman-clip-2.mp4` | HTTP/1.1 200 OK, Content-Type: video/mp4 |
| Old `/about/eman-runway.jpg`, `/about/eman-clip-1.mp4` | 404 text/html (SPA fallback, as expected) |
| Rendered `/creative/`: credit string count | 1 |
| Rendered `/creative/`: h2 order | `Pictures` then `Videos` |
| Rendered `/about/`: `href="/diversityincludesdisability_one/creative"` | 3 occurrences (header nav, inline "Creative page" bio link, footer nav) — the plan's "1" only counted the inline link, which is present exactly once |
| Rendered `/`: `>Creative<` | 2 (header + footer nav) |
| Preview killed | PID 6148 terminated; port 4193 no longer responds |
| `grep -rl "emanrimawi@gmail.com" build` | 0 files |
| `grep -rl "One World Worldwide" build` | 0 files |
| `grep -rl "diversityincludesdisability@gmail.com" build` | 13 files |
| `grep -rl "One World Peace" build` | 2 files |
| `npm run test:unit` | 3 files, 9 tests passed |
| `npm run test:no-secret` | OK — no committed key, placeholder present, rel=noopener present |
| Playwright (`playwright.theme.config.ts`: shell, content, scaffold, forms) | **26 passed** (17.3s), browsers were already installed |
| Plan `<automated>` blocks, Tasks 1-3 | PASS / PASS / PASS |
| Git | `main...origin/main [ahead 2]`, tree clean apart from the untracked `.planning/quick/` dir; commit messages contain no AI mentions; NOT pushed |

## Deviations from Plan

**1. [Rule 3 - Blocking] Task 1 `git add` pathspec** — the plan's stage command included `static/about`, which no longer exists after the move, so `git add` aborted and the first commit carried only the renames. Fixed by staging the remaining files and `git commit --amend --no-edit` before anything was pushed. Result is the single intended commit `8904b20`.

**2. [Observation, no change] About page link count** — the plan expected `grep -c` of the creative href on `/about/` to be 1; it is 3 occurrences (2 lines) because Header and Footer nav also link to Creative on every page. The inline bio link is present exactly once; nothing to fix.

No other deviations — plan executed as written.

## Skipped

Nothing. Playwright e2e ran (browsers were present under `%LOCALAPPDATA%\ms-playwright`).

## Open items (need Eman)

- Alt-text sign-off for the runway photo (still marked as a draft in the MEDIA comment on `/creative/`).
- Captions/transcripts for both clips (WCAG 1.2.2) — noted in the Videos section comment.
- Higher-resolution originals for the clips, if they exist (176x144 source).

## Owner's remaining action

`git push origin main` (two commits ahead). The deploy workflow will publish `/creative/` and the moved media.

## Self-Check: PASSED

- `src/routes/creative/+page.svelte` — FOUND
- `static/creative/{eman-runway.avif,webp,jpg,eman-clip-1.mp4,eman-clip-2.mp4}` — FOUND; `static/about/` — absent as intended
- Commit `8904b20` (feat(creative)) — FOUND in `git log`
- Commit `9631526` (fix(contact)) — FOUND in `git log`
