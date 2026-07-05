---
phase: 03-app-shell-content-pipeline-pages
plan: 02
subsystem: content-pipeline
tags: [mdsvex, shiki, sveltekit, svelte5, markdown, prerender, entries, blog, vitest, playwright]

# Dependency graph
requires:
  - phase: 01-foundation-static-deploy
    provides: adapter-static, strict prerender, BASE_PATH sub-path model, 404.html fallback, Playwright split harness (theme/content configs)
  - phase: 03-app-shell-content-pipeline-pages (03-01)
    provides: app shell + /blog route stub, nav.ts single-source, base-prefix convention, e2e split harness (test:e2e root / test:base sub-path)
provides:
  - Build-time markdown content pipeline (mdsvex + Shiki in svelte.config.js) — highlighting runs at preprocess, zero client highlighter (BLOG-03)
  - posts.ts eager-glob index (PostMeta[], draft-filtered, date-desc) ready for the 03-05 index presentation (BLOG-02)
  - Universal blog/[slug]/+page.ts (prerender=true + entries() from the shared lazy glob) rendering a Svelte-5 <Content/> post page (BLOG-01)
  - Two authored sample posts (welcome, our-accessibility-commitment) with valid frontmatter + a Shiki-highlighted code fence
  - scripts/assert-no-shiki-chunk.mjs + test:no-shiki script (build-artifact guard for BLOG-03)
  - e2e/blog.spec.ts (root) + e2e/blog.base.spec.ts (sub-path deep-link 200, PAGE-06)
affects: [03-05-blog-index, 06-a11y-hardening]

# Tech tracking
tech-stack:
  added: [mdsvex@0.12.7, shiki@4.3.1, rehype-slug@6.0.0]
  patterns:
    - "Build-time syntax highlighting: Shiki createHighlighter singleton inside mdsvex highlight.highlighter + escapeSvelte → inert {@html} at preprocess; never ships to client"
    - "Globbed content model: eager import.meta.glob for the index (posts.ts), lazy import.meta.glob for the [slug] loader map + entries() — same glob keeps index and prerender in sync"
    - "Universal +page.ts (not +page.server.ts) returns the non-serializable Content component; prerender=true + entries() makes strict SSG deterministic"
    - "Svelte-5 dynamic render: const Content = \$derived(data.Content); <Content /> — never <svelte:component>"

key-files:
  created:
    - scripts/assert-no-shiki-chunk.mjs
    - src/lib/posts.ts
    - src/lib/posts.test.ts
    - src/lib/posts/welcome.md
    - src/lib/posts/our-accessibility-commitment.md
    - src/routes/blog/[slug]/+page.ts
    - src/routes/blog/[slug]/+page.svelte
    - e2e/blog.spec.ts
    - e2e/blog.base.spec.ts
  modified:
    - svelte.config.js
    - package.json

key-decisions:
  - "Shiki theme: single github-dark (declared langs js/ts/svelte/html/css/json/bash/python) — one theme keeps the inert HTML small; a per-site-theme code theme is deferred (RESEARCH Open Q2)"
  - "Frontmatter dates are QUOTED strings ('2026-07-04') — unquoted YAML coerces to a JS Date that mdsvex serializes as a full ISO timestamp, breaking the datetime attribute"
  - "[slug] render uses \$derived(data.Content) instead of the plan's plain destructure — clears the state_referenced_locally warning while keeping <Content/> and single-h1"

patterns-established:
  - "BLOG-03 guard: after build, scan build/_app/**/*.js for codeToHtml/createHighlighter/getHighlighter/'shiki' — must find none"
  - "Post authoring: bodies start at h2 (page renders the h1 from meta) so heading order stays valid (A11Y-03); no /-rooted links in .md (base not auto-injected)"

requirements-completed: [BLOG-01, BLOG-02, BLOG-03]

# Metrics
duration: 40min
completed: 2026-07-05
---

# Phase 3 Plan 02: mdsvex + Shiki Content Pipeline Summary

**Build-time markdown blog pipeline — mdsvex + a Shiki `createHighlighter` singleton wired into `svelte.config.js` (inert `{@html}`, zero client highlighter), an eager-glob `posts.ts` index (draft-filtered, date-desc), and a universal `blog/[slug]/+page.ts` (`prerender=true` + `entries()` from the shared glob) rendering a Svelte-5 `<Content/>` post page — with two sample posts prerendered to static HTML and a build-artifact scan proving no `shiki` chunk reaches `build/_app`.**

## Performance

- **Duration:** 40 min
- **Started:** 2026-07-05T03:14:20Z
- **Completed:** 2026-07-05T03:55:17Z
- **Tasks:** 3
- **Files modified:** 11 (9 created, 2 modified)

## Accomplishments
- `svelte.config.js` composes `mdsvex(mdsvexOptions)` after `vitePreprocess()`; Shiki `createHighlighter` cached in a module-level singleton, `escapeSvelte` guards `{}`, `rehype-slug` adds heading ids, `github-dark` theme + 8 declared langs. Phase-1 adapter/paths block preserved byte-for-byte (404.html fallback, strict, relative:false, BASE_PATH).
- `posts.ts` builds a typed `PostMeta[]` from an eager `import.meta.glob('/src/lib/posts/*.md')`, drops `draft:true`, sorts newest-first; `posts.test.ts` proves sort/filter/slug hermetically (mocks the transform). Both green under the broadened `test:unit` (`vitest run`, 5 tests).
- `blog/[slug]/+page.ts` is a UNIVERSAL load (component is non-serializable → not `+page.server.ts`) with `prerender=true` and `entries()` derived from the same lazy glob; `+page.svelte` renders `<Content/>` (Svelte-5 `$derived`) with a single h1 + `<time>` from meta.
- Both sample posts prerender to static `/blog/<slug>/` HTML under `strict:true`; `welcome` emits `<pre class="shiki github-dark">` with token spans baked in. `test:no-shiki` confirms no highlighter code in `build/_app` (BLOG-03).
- E2E green: root `blog.spec.ts` (title h1 + `pre.shiki`) and sub-path `blog.base.spec.ts` (deep-link 200 under `/diversityincludesdisability_one/`, PAGE-06).

## Task Commits

Each task was committed atomically:

1. **Task 1: Deps + mdsvex/Shiki wiring + no-shiki scanner** - `99a0b93` (chore)
2. **Task 2: posts.ts index + unit test + two sample posts** - `d45c3d2` (feat, TDD test+impl)
3. **Task 3: Prerendered [slug] route + blog E2E** - `845e570` (feat)

**Plan metadata:** see final docs commit.

## Files Created/Modified
- `svelte.config.js` - Added mdsvex+Shiki build-time preprocessor (createHighlighter singleton, escapeSvelte, rehype-slug, github-dark); Kit extensions `.svelte`+`.md`; Phase-1 adapter/paths preserved
- `package.json` - Added mdsvex/shiki/rehype-slug devDeps; broadened `test:unit` to `vitest run`; added `test:no-shiki`
- `scripts/assert-no-shiki-chunk.mjs` - Scans `build/_app/**/*.js` for highlighter needles, exits 1 on any hit (BLOG-03)
- `src/lib/posts.ts` - Eager-glob PostMeta[] index: draft-filtered, date-desc, slug from filename
- `src/lib/posts.test.ts` - Vitest proving sort-desc, draft-drop, slug derivation
- `src/lib/posts/welcome.md`, `our-accessibility-commitment.md` - Authored SAMPLE posts (frontmatter + h2 bodies; welcome has a ts code fence)
- `src/routes/blog/[slug]/+page.ts` - Universal load + entries() + prerender=true (lazy glob loader map)
- `src/routes/blog/[slug]/+page.svelte` - Svelte-5 `<Content/>` render (single h1 + time from meta)
- `e2e/blog.spec.ts` - Root-base: post renders h1 + inert `pre.shiki` (BLOG-01/03)
- `e2e/blog.base.spec.ts` - Sub-path deep-link resolves 200 with content (PAGE-06)

## Decisions Made
- Single `github-dark` Shiki theme with 8 declared langs — smallest inert output; per-theme code coloring deferred (RESEARCH Open Q2).
- Frontmatter dates quoted as strings (see Deviation 1).
- `$derived(data.Content)` render over the plan's plain destructure to keep `svelte-check` warning-free (see Deviation 2).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Quote frontmatter dates so they stay `YYYY-MM-DD` strings**
- **Found during:** Task 3 (running the root blog E2E gate)
- **Issue:** The plan authored `date: 2026-07-04` unquoted. The mdsvex YAML frontmatter parser coerces an unquoted ISO date into a JS `Date`, which serializes to `2026-07-04T00:00:00.000Z`. The `<time datetime>` attribute then rendered the full timestamp, failing `blog.spec.ts`' `toHaveAttribute('datetime','2026-07-04')` and contradicting the `PostMeta.date: string` contract.
- **Fix:** Quoted both dates (`date: '2026-07-04'` / `'2026-06-01'`). Rebuilt — `<time datetime="2026-07-04">2026-07-04</time>`.
- **Files modified:** src/lib/posts/welcome.md, src/lib/posts/our-accessibility-commitment.md
- **Verification:** Root `blog.spec.ts` passes (2/2); build HTML shows the plain date string.
- **Committed in:** `845e570` (Task 3 commit)

**2. [Rule 1 - Bug] TS-correct load typing + `$derived` render (clear svelte-check errors)**
- **Found during:** Task 3 (`npm run check`)
- **Issue:** The plan's `+page.ts` used a JSDoc `/** @type */` cast, which TypeScript ignores in a `.ts` file — `post` stayed `unknown` (3 errors), and `entries()` lacked the `!` non-null assertion. Downstream, `Content` typed as `unknown` failed `<Content/>` (not assignable to a component). The plan's `const { Content, meta } = data;` also raised a `state_referenced_locally` warning.
- **Fix:** Replaced the JSDoc cast with a TS `as { default: Component; metadata: any }` (importing `Component` from `svelte`), added `.at(-1)!` in `entries()`, and switched the render to `const Content = $derived(data.Content)` / `const meta = $derived(data.meta)`. All contract greps preserved (`prerender = true`, `entries`, lazy `import.meta.glob('/src/lib/posts/*.md')`, `<Content`).
- **Files modified:** src/routes/blog/[slug]/+page.ts, src/routes/blog/[slug]/+page.svelte
- **Verification:** `npm run check` clean for both files (0 errors/0 warnings on plan files); root + base E2E re-run green after rebuild.
- **Committed in:** `845e570` (Task 3 commit)

**3. [Rule 3 - Blocking] Sibling `_two` preview squatting port 4173/4174**
- **Found during:** Task 3 (running the Playwright gates)
- **Issue:** A separate active session's `diversityincludesdisability_two` `vite preview` (base `/diversityincludesdisability_two`) repeatedly re-grabbed port 4173 within seconds. With `reuseExistingServer: !CI`, `playwright.theme.config.ts` latched onto the wrong build (ERR_CONNECTION_REFUSED / sibling 404 base message) — the same class of collision the 03-01 executor hit.
- **Fix:** Ran the gates on private ports the sibling never uses: started my own verified `vite preview` on 4176 (root build) and 4177 (`BASE_PATH` build), confirmed each served THIS project's HTML, and ran the specs via two throwaway configs (`playwright.local-blog-{root,base}.config.ts`, no `webServer`, reuse my server). Temp configs deleted after; not committed.
- **Files modified:** none (environmental; temp configs removed).
- **Verification:** Root `blog.spec.ts` 2/2, base `blog.base.spec.ts` 1/1 against confirmed THIS-build servers.

---

**Total deviations:** 3 auto-fixed (2 bug, 1 blocking)
**Impact on plan:** All fixes were required for a correct, green gate. No scope creep — the pipeline wiring, universal-load contract, and `<Content/>` render match the plan; only the date-quoting, TS typing, and the render-warning fix differ from the plan's literal code, each documented above.

### Out-of-scope (deferred, NOT fixed)
- `tests/deploy.smoke.spec.ts:4` — pre-existing `Cannot find name 'process'` svelte-check error (Phase-1 file), already logged by 03-01 to `deferred-items.md`. Does not block `npm run build`.

## Issues Encountered
- The `BASE_PATH=/diversity...` build failed once with a "base must start but not end with '/'" error: Git Bash MSYS path-conversion mangled the leading-slash env value into a Windows path. Resolved by prefixing the command with `MSYS_NO_PATHCONV=1`.

## Known Stubs
- `src/routes/blog/+page.svelte` is intentionally still the 03-01 stub ("News — Content coming in this phase"). The blog INDEX presentation (listing title/date/summary from `posts.ts`) is explicitly owned by plan 03-05, per this plan's SCOPE FENCE. Not a blocker for BLOG-01/02/03 — the pipeline, `[slug]` post pages, and `posts.ts` index contract are all live and verified.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `posts.ts` is a stable, typed, draft-filtered, date-sorted contract ready for the 03-05 blog index presentation.
- The `[slug]` route, sample posts, and `test:no-shiki`/blog E2E harnesses are in place; 03-05 fills `blog/+page.svelte` and must keep these green.

---
*Phase: 03-app-shell-content-pipeline-pages*
*Completed: 2026-07-05*

## Self-Check: PASSED

All 11 listed files exist and all 3 task commits (99a0b93, d45c3d2, 845e570) are present in history. Temp local Playwright configs removed (not committed).
