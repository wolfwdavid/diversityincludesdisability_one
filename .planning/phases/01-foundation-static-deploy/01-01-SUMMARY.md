---
phase: 01-foundation-static-deploy
plan: 01
subsystem: infra
tags: [sveltekit, adapter-static, github-pages, prerender, static-site, vite, svelte5]

# Dependency graph
requires: []
provides:
  - Buildable SvelteKit static-export scaffold (adapter-static, strict prerender)
  - Env-driven base path (BASE_PATH) for GitHub Pages sub-path deploys
  - static/.nojekyll so Pages serves the _app/ directory (DEPLOY-04)
  - Sitewide prerender + trailingSlash='always' + 404.html SPA fallback (DEPLOY-03)
  - Base-safe skeleton home + /about route proving DEPLOY-02/DEPLOY-03 are testable
  - Privacy-first .gitignore (501c3-pending: no secrets/private source can be committed)
affects: [01-02-ci-deploy, 01-03-live-verify, all future page/theme/hero phases]

# Tech tracking
tech-stack:
  added:
    - "@sveltejs/adapter-static@3.0.10"
    - "svelte-check@4.7.1"
    - "svelte@5.56.4 / @sveltejs/kit@2.69.1 / @sveltejs/vite-plugin-svelte@7.1.2 (scaffold)"
    - "vite@8.1.3 / typescript@6.0.3 (scaffold)"
  patterns:
    - "svelte.config.js is the single source of truth for kit config; vite.config.ts just calls sveltekit()"
    - "paths.base from process.env.BASE_PATH ?? '' — '' locally, /repo in CI"
    - "paths.relative=false so absolute base-prefixed URLs survive the 404.html deep-link fallback at any depth"
    - "All internal links/assets go through base from $app/paths — never root-absolute"

key-files:
  created:
    - svelte.config.js
    - src/routes/+layout.ts
    - src/routes/+page.svelte
    - src/routes/about/+page.svelte
    - static/.nojekyll
    - static/favicon.svg
    - .gitignore
  modified:
    - vite.config.ts
    - package.json

key-decisions:
  - "paths.relative=false (not Kit 2.x default true) so the 404.html SPA fallback loads /_app assets from any unmatched depth and assets carry the sub-path"
  - "svelte.config.js normalized as the canonical kit-config location; vite.config.ts reduced to a bare sveltekit() call (sv 0.16.2 scaffold had put adapter/compilerOptions inline in vite.config.ts and produced no svelte.config.js)"
  - "Build for the repo SUB-PATH now (BASE_PATH from repo name); custom domain deferred"
  - "static/.nojekyll shipped manually — adapter-static does NOT auto-emit it (DEPLOY-04 mandatory)"

patterns-established:
  - "Env-driven base path with absolute (relative=false) asset URLs for Pages sub-path deploys"
  - "strict:true prerender as a build-time guard that fails on any un-prerendered route"

requirements-completed: [DEPLOY-01, DEPLOY-02, DEPLOY-03, DEPLOY-04]

# Metrics
duration: 14min
completed: 2026-07-04
---

# Phase 1 Plan 01: Scaffold & Static Config Summary

**SvelteKit (Svelte 5.56.4 / Kit 2.69.1 / Vite 8.1.3) scaffolded and configured for fully-static GitHub Pages export via adapter-static@3.0.10 — env-driven base path, absolute-URL 404.html deep-link fallback, sitewide strict prerender, and a manually-shipped .nojekyll — with a base-safe home + /about skeleton and a build that exits 0 emitting build/.nojekyll + build/404.html + build/about/index.html.**

## Performance

- **Duration:** 14 min
- **Started:** 2026-07-04T21:07:11Z
- **Completed:** 2026-07-04T21:22:08Z
- **Tasks:** 3
- **Files modified:** 20 (scaffold + config)

## Accomplishments
- SvelteKit minimal+TS scaffolded into the existing repo without clobbering `.git/`, `.planning/`, or `CLAUDE.md`.
- Configured `adapter-static` with `fallback:'404.html'`, `strict:true`, env-driven `paths.base`, and `paths.relative=false`.
- Sitewide prerender (`prerender=true`) + `trailingSlash='always'` so deep links and refreshes resolve on Pages.
- Shipped the four load-bearing Pages details: env base, `static/.nojekyll`, sitewide prerender, and the `404.html` fallback.
- Base-safe home (`/`) + `/about` skeleton with a base-prefixed asset and internal link, making DEPLOY-02/03 verifiable on the live sub-path.
- Privacy-first `.gitignore` shipped up front (501c3-pending org — no secrets or private source can ever be committed).

## Build Result (actually run)
- `npx svelte-check` — **165 files, 0 errors, 0 warnings**.
- `npm run build` (empty base) — **exit 0**. Emitted `build/.nojekyll`, `build/404.html`, `build/about/index.html`, `build/index.html`, `build/favicon.svg`.
- `BASE_PATH=/diversityincludesdisability_one npm run build` — **exit 0**. `build/index.html` and `build/404.html` reference assets/links as absolute `/diversityincludesdisability_one/...` (favicon, `_app/immutable/*`, `/about`) — confirming DEPLOY-02 and the depth-safe DEPLOY-03 fallback.

## Task Commits

1. **Task 1: Scaffold SvelteKit minimal+TS + privacy .gitignore + adapter-static install** — `9df9d1d` (chore)
2. **Task 2: Configure adapter-static, sitewide prerender, .nojekyll + favicon** — `7d5201c` (feat)
3. **Task 3: Base-safe home + /about; force absolute paths for Pages fallback** — `312082e` (feat)

**Plan metadata:** (final docs commit — see git log)

## Files Created/Modified
- `svelte.config.js` — adapter-static (fallback:404.html, strict, precompress:false), `paths.base=process.env.BASE_PATH ?? ''`, `paths.relative=false`, vitePreprocess.
- `vite.config.ts` — reduced to canonical bare `sveltekit()` (adapter/compilerOptions removed; svelte.config.js is now the single source of truth).
- `src/routes/+layout.ts` — `prerender=true`, `trailingSlash='always'`.
- `src/routes/+page.svelte` — base-prefixed favicon asset + `/about` link (DEPLOY-02 testable).
- `src/routes/about/+page.svelte` — deep-link target so the crawler emits `about/index.html` (DEPLOY-03).
- `static/.nojekyll` — empty; adapter-static copies it to `build/.nojekyll` so Pages serves `_app/` (DEPLOY-04).
- `static/favicon.svg` — tiny valid SVG, the base-referenceable asset for DEPLOY-02.
- `.gitignore` — privacy-first (node_modules, build artifacts, env/secrets, private/notion source, tool output).
- `package.json` — added `@sveltejs/adapter-static@3.0.10`, `svelte-check@4.7.1`.

## Scaffold Details (per output spec)
- **Scaffold command (primary, succeeded):** `npx sv create . --template minimal --types ts --no-add-ons --install npm --no-dir-check` (sv CLI v0.16.2). The temp-dir fallback was NOT needed — `.git/.planning/CLAUDE.md` were preserved. The initial in-scaffold `npm install` step reported a transient failure; a follow-up `npm install` succeeded.
- **Installed versions (from package-lock):** svelte `5.56.4`, @sveltejs/kit `2.69.1`, vite `8.1.3`, @sveltejs/adapter-static `3.0.10`, @sveltejs/vite-plugin-svelte `7.1.2`, svelte-check `4.7.1`, typescript `6.0.3`.
- **Output artifacts confirmed emitted:** `build/.nojekyll`, `build/404.html`, `build/about/index.html` (all present after both empty-base and sub-path builds).

## Decisions Made
- **paths.relative=false:** Kit 2.x now defaults `paths.relative` to `true`, which renders relative asset URLs (`./_app/...`). That breaks the `404.html` SPA fallback for deep unmatched paths (relative URLs resolve against the wrong depth) and fails DEPLOY-02's expectation of sub-path-prefixed URLs. Setting `relative:false` makes every URL absolute and base-prefixed, satisfying both DEPLOY-02 and the depth-safe DEPLOY-03 fallback.
- **svelte.config.js as canonical config location:** the sv 0.16.2 scaffold placed the adapter and compilerOptions inline in `vite.config.ts` and shipped no `svelte.config.js`. Normalized to the standard SvelteKit layout the plan and downstream tooling expect.
- Followed the plan's exact adapter-static/`+layout.ts` snippets otherwise; omitted forced-runes compilerOptions (Svelte 5 auto-detection handles the skeleton; svelte-check is clean).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Scaffold produced no svelte.config.js (config inlined in vite.config.ts)**
- **Found during:** Task 1 (Scaffold)
- **Issue:** sv CLI v0.16.2's minimal template placed `adapter` + `compilerOptions` inside `sveltekit({...})` in `vite.config.ts` and created no `svelte.config.js` — but the plan (and Task 1's own verify `test -f svelte.config.js`) require `svelte.config.js` as the kit-config source of truth.
- **Fix:** Created a canonical `svelte.config.js` and reduced `vite.config.ts` to a bare `sveltekit()` call so config lives in one standard place.
- **Files modified:** svelte.config.js (created), vite.config.ts
- **Verification:** `test -f svelte.config.js` passes; `npm run build` exits 0 using the config.
- **Committed in:** 9df9d1d (Task 1), refined in 7d5201c (Task 2)

**2. [Rule 2 - Missing Critical] Absolute base-prefixed URLs required for the Pages 404 fallback**
- **Found during:** Task 3 (build verification)
- **Issue:** With Kit 2.x's default `paths.relative=true`, the sub-path build rendered relative URLs (`./favicon.svg`, `./_app/...`). Relative URLs in `404.html` resolve against the arbitrary depth of an unmatched path, so the SPA fallback would 404 its own assets — breaking DEPLOY-03 — and DEPLOY-02's acceptance (absolute `/diversityincludesdisability_one/...` refs) would fail.
- **Fix:** Set `kit.paths.relative=false` so all asset/link URLs are absolute and base-prefixed.
- **Files modified:** svelte.config.js
- **Verification:** `BASE_PATH=... npm run build` now emits `/diversityincludesdisability_one/favicon.svg`, `/diversityincludesdisability_one/_app/immutable/...`, and `/diversityincludesdisability_one/about` in both `index.html` and `404.html`.
- **Committed in:** 312082e (Task 3 commit)

**3. [Rule 3 - Blocking] Scaffold appended a config block to CLAUDE.md**
- **Found during:** Task 1 (Scaffold)
- **Issue:** sv CLI prepended an 8-line "Project Configuration" block to the existing `CLAUDE.md`, which the plan requires untouched.
- **Fix:** Reverted `CLAUDE.md` with `git checkout -- CLAUDE.md`.
- **Files modified:** CLAUDE.md (restored — net zero change)
- **Verification:** `git diff CLAUDE.md` empty.
- **Committed in:** N/A (revert, no change committed)

---

**Total deviations:** 3 auto-fixed (2 blocking, 1 missing-critical)
**Impact on plan:** All three were necessary to meet the plan's own acceptance criteria and correctness for the Pages deploy. No scope creep — scope fence held (no three/threlte/mdsvex/shiki/tailwind/fonts/forms/axe).

## Issues Encountered
- **Git-Bash MSYS2 path conversion:** `BASE_PATH=/diversityincludesdisability_one` was mangled by MSYS2 into `C:/Program Files/Git/diversityincludesdisability_one`, causing a `paths.base` validation error locally. Worked around with `MSYS_NO_PATHCONV=1` for the local sub-path build. This is a local Git-Bash-on-Windows quirk only — the CI runner (Ubuntu, plan 01-02) passes the value verbatim, so no config change is needed.
- Initial in-scaffold `npm install` reported a transient failure; a plain re-run succeeded.

## Known Stubs
- `src/routes/+page.svelte` and `src/routes/about/+page.svelte` carry intentional foundation-skeleton copy ("Foundation deploy skeleton…", "Placeholder about page…"). These are deliberate per the plan's SCOPE FENCE — real content, themes, and the 3D hero belong to Phases 2–6. They do not block this plan's goal (a buildable, correctly-configured static Pages deploy) and are resolved by the later content/page phases.

## User Setup Required
None for this plan. Note carried forward (plan 01-03): a one-time manual repo setting — Settings → Pages → Source: GitHub Actions — cannot be automated and is required before the first deploy publishes.

## Next Phase Readiness
- Static build is green (strict prerender passes) both at empty base and at the `/diversityincludesdisability_one` sub-path.
- Ready for **01-02** (CI deploy workflow + smoke infra): wire `.github/workflows/deploy.yml` with `BASE_PATH=/${{ github.event.repository.name }}`, `upload-pages-artifact` + `deploy-pages`, and the Playwright/curl smoke checks.
- No blockers. Repo is local-only (branch `master`, no remote) — pushing to `github.com/wolfwdavid/diversityincludesdisability_one` is a later wave's job.

---
*Phase: 01-foundation-static-deploy*
*Completed: 2026-07-04*

## Self-Check: PASSED

All 9 claimed files exist on disk and all 3 task commits (9df9d1d, 7d5201c, 312082e) are present in git history.
