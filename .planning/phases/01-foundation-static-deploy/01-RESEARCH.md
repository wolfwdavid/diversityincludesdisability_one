# Phase 1: Foundation & Static Deploy - Research

**Researched:** 2026-07-04
**Domain:** SvelteKit static build (adapter-static) deployed to a GitHub Pages **project** repo (sub-path)
**Confidence:** HIGH (stack + Pages config verified against official SvelteKit docs and npm registry today; only GitHub Action *pin numbers* are MEDIUM — see below)

> **No CONTEXT.md exists** for this phase (`/gsd:discuss-phase` was not run). There are no locked user decisions to copy verbatim. The one open path-model decision is captured under **Open Questions** (custom domain vs sub-path). Absent that, this phase builds directly on the pre-verified `.planning/research/STACK.md` and `.planning/research/PITFALLS.md` — do **not** re-derive versions.

## Summary

Phase 1 stands up a skeleton SvelteKit site that builds **fully static** with `@sveltejs/adapter-static` and deploys to `https://<user>.github.io/diversityincludesdisability_one/` via GitHub Actions — with the four load-bearing GitHub Pages details correct and **verified against the deployed URL, not localhost**: (1) `paths.base` driven by a `BASE_PATH` env so every asset/link resolves under the repo sub-path, (2) a manually-shipped `static/.nojekyll` so the `_app/` directory is served, (3) `prerender = true` + `fallback: '404.html'` so deep links and refreshes resolve, and (4) the official Actions pipeline (`upload-pages-artifact` + `deploy-pages`).

The single most important correction to prior research: **adapter-static does NOT automatically write `.nojekyll`.** The official docs instruct you to add an empty `static/.nojekyll` yourself. Treat that file as mandatory (DEPLOY-04), not belt-and-suspenders. Everything else in STACK.md's "load-bearing config" section is confirmed accurate.

Because dev serves from root (`/`) but Pages serves from `/diversityincludesdisability_one/`, base-path bugs are invisible locally. The plan must (a) make at least one link/asset use the `base` helper so DEPLOY-02 is actually testable, (b) add a second route (`/about`) so DEPLOY-03's deep-link/refresh path is testable, and (c) verify all of it by `curl`-ing the live URL, since a build can "succeed" while the deployed site is unstyled and dead.

**Primary recommendation:** Scaffold with `npx sv create` (minimal + TS), pin the versions in STACK.md, configure `svelte.config.js` exactly as below, ship `static/.nojekyll`, set `trailingSlash = 'always'` and `prerender = true` in the root `+layout.ts`, wire the official Actions workflow with `BASE_PATH=/${{ github.event.repository.name }}`, and gate the phase on live-URL `curl`/Playwright checks — not local preview.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support (how this phase implements it) |
|----|-------------|--------------------------------------------------|
| **DEPLOY-01** | Site builds fully static (adapter-static) and deploys to GitHub Pages via GitHub Actions | `adapter-static@3.0.10` with `fallback:'404.html'`; official Actions workflow (`upload-pages-artifact` + `deploy-pages`); Settings → Pages → Source: **GitHub Actions**. See *Standard Stack* + *Deploy Pipeline*. |
| **DEPLOY-02** | All assets and internal links resolve under the repo sub-path (correct `base`) | `paths.base = process.env.BASE_PATH` set to `/diversityincludesdisability_one` in CI; every internal link/asset uses `base` from `$app/paths`; skeleton page ships one `base`-prefixed link + asset to make it testable. See *Base-Path Handling*. |
| **DEPLOY-03** | Every route prerendered; deep links / refreshes resolve (404 fallback configured) | `export const prerender = true` in root `+layout.ts`; adapter `strict:true` (default) fails the build if any route isn't prerendered; `fallback:'404.html'` for unknown paths; a second `/about` route proves deep-link refresh. See *Prerender & 404 Fallback*. |
| **DEPLOY-04** | `.nojekyll` emitted so `_app` assets are served by Pages | **Manually** ship empty `static/.nojekyll` (adapter does NOT auto-emit it — verified today); adapter-static copies `static/` verbatim to output root. Verify `_app/immutable/*` returns 200 on the live URL. See *.nojekyll Handling*. |
</phase_requirements>

## Standard Stack

Build on the verified `.planning/research/STACK.md`. Phase 1 needs only the **foundation subset** below (3D/markdown/forms/theming belong to later phases and must NOT be pulled onto the critical path now).

### Core (Phase 1)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Svelte | `5.56.4` | UI framework (runes) | Current stable; required by the rest of the ecosystem |
| SvelteKit | `2.69.1` | App framework / router / prerender | Its prerender pipeline + adapter-static produce the static output Pages needs |
| @sveltejs/adapter-static | `3.0.10` | Static export | The only correct adapter for a no-server GitHub Pages deploy |
| @sveltejs/vite-plugin-svelte | `7.1.2` | Svelte↔Vite | Peer-required by Kit 2.69 |
| Vite | `7.3.6` (pin) | Build tool / dev server | Battle-tested combo; Vite 8 works but is newer |
| TypeScript | `^5.3.3` (`5.x`) | Types | Kit peer requirement |

### Supporting (dev / CI gate)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| svelte-check | `4.7.1` | Type/diagnostics gate | Run in CI before build |
| @playwright/test | `1.61.1` | Deployed-URL smoke test | Post-deploy verification (Validation Architecture) |
| vitest | `4.1.9` | Unit tests | Scaffolded now; used from Phase 2 for the theme/util logic |
| prettier + eslint | latest (sv add-ons) | Lint/format | Standard CI hygiene |

**Do NOT install in Phase 1:** `three`, `@threlte/*`, `mdsvex`, `shiki`, Tailwind, `@fontsource/*`, form libs, axe/lighthouse. They belong to Phases 2–6 and would bloat the foundation.

**Installation (foundation only):**
```bash
# Scaffold — fully non-interactive (verified flags, svelte.dev/docs/cli/sv-create)
npx sv create diversityincludesdisability_one --template minimal --types ts --no-add-ons --install npm
#   (or interactive: npx sv create → SvelteKit minimal, TypeScript, add prettier + eslint + vitest + playwright)

npm install -D @sveltejs/adapter-static@3.0.10
# svelte-check / playwright / vitest come from the sv add-ons or:
npm install -D svelte-check@4.7.1 @playwright/test@1.61.1 vitest@4.1.9
```

**Version verification (done 2026-07-04 via npm registry + official docs — HIGH):** All versions above are live-verified in STACK.md. Re-running `npm view @sveltejs/adapter-static version` before build is cheap insurance but not expected to move.

### `sv create` non-interactive flags (verified today)
| Flag | Purpose |
|------|---------|
| `--template minimal\|demo\|library` | Use `minimal` (skeleton, no sample game) |
| `--types ts\|jsdoc` / `--no-types` | Use `ts` |
| `--add [add-ons...]` / `--no-add-ons` | Add-ons: prettier, eslint, vitest, playwright, etc. `--no-add-ons` skips the prompt |
| `--install npm` / `--no-install` | Package manager or skip install |
| `--no-dir-check` | Bypass empty-dir check (useful if `.git`/`.planning` already present) |

> **Windows note:** the repo dir already contains `.git/`, `.planning/`, `CLAUDE.md`. Scaffolding *into* a non-empty dir may need `--no-dir-check`, or scaffold into a temp subdir and move files up. The planner should account for scaffolding on top of existing files (do not clobber `CLAUDE.md` or `.planning/`).

## Architecture Patterns

### Recommended Project Structure (Phase 1 skeleton)
```
diversityincludesdisability_one/
├── .github/workflows/deploy.yml   # official Pages pipeline
├── src/
│   ├── app.html                   # %sveltekit.assets% for base-safe markup
│   ├── routes/
│   │   ├── +layout.ts             # prerender = true; trailingSlash = 'always'
│   │   ├── +layout.svelte         # minimal shell + skip link (a11y scaffold)
│   │   ├── +page.svelte           # home skeleton; uses {base} link + asset (DEPLOY-02 testable)
│   │   └── about/
│   │       └── +page.svelte       # 2nd route → deep-link/refresh test (DEPLOY-03)
│   └── lib/
├── static/
│   ├── .nojekyll                  # MANDATORY (DEPLOY-04)
│   └── favicon.svg                # asset referenced via base (DEPLOY-02)
├── svelte.config.js
├── vite.config.ts
├── .gitignore
└── package.json
```

### Pattern 1: adapter-static + env-driven base path
**What:** Configure the adapter for a full prerender with an SPA-style 404 fallback, and drive `base` from an env var so local (`''`) and CI (`/repo`) differ cleanly.
**When to use:** Every project-repo (sub-path) GitHub Pages deploy.
```js
// svelte.config.js — Source: https://svelte.dev/docs/kit/adapter-static (verified 2026-07-04)
import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      // pages: 'build', assets: 'build' (defaults)
      fallback: '404.html',   // GitHub Pages serves this for any unmatched path
      precompress: false,
      strict: true            // DEFAULT — build FAILS if any route isn't prerendered (enforces DEPLOY-03)
    }),
    paths: {
      // '' locally so `npm run dev`/preview work from root; '/diversityincludesdisability_one' in CI
      base: process.env.BASE_PATH ?? ''
    }
  }
};
export default config;
```
> The official docs example uses `process.argv.includes('dev') ? '' : process.env.BASE_PATH`. The `?? ''` form above is equivalent and slightly safer (never `undefined` when the env var is absent). Either is acceptable; pick one and keep it.

### Pattern 2: prerender + trailingSlash in the root layout
**What:** Turn the whole site into prerendered HTML and make Pages serve `about/index.html` cleanly on refresh.
```ts
// src/routes/+layout.ts — Source: adapter-static docs + PITFALLS.md Pitfall 3
export const prerender = true;
export const trailingSlash = 'always';
```
`trailingSlash = 'always'` makes SvelteKit emit `about/index.html` (not `about.html`), which is how GitHub Pages resolves `/about/` on a hard refresh without a 404.

### Pattern 3: base-safe links/assets in the skeleton page (makes DEPLOY-02 testable)
```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { base } from '$app/paths';
</script>

<img src="{base}/favicon.svg" alt="Diversity Includes Disability" width="48" height="48" />
<h1>Diversity Includes Disability</h1>
<nav><a href="{base}/about">About</a></nav>
```
```svelte
<!-- src/routes/about/+page.svelte  (the deep-link target for DEPLOY-03) -->
<script lang="ts">
  import { base } from '$app/paths';
</script>
<h1>About</h1>
<a href="{base}/">Home</a>
```
For markup inside `app.html`, use `%sveltekit.assets%` (already base-aware) rather than hardcoded `/`.

### Anti-Patterns to Avoid (Phase 1)
- **Root-absolute internal URLs** (`href="/about"`, `src="/logo.svg"`): 404 on the Pages sub-path. Always prefix with `base`. (PITFALLS Pitfall 1)
- **Relative `href` on nested routes** producing `/repo/blog/blog/post`: use `{base}/absolute-from-root` style, not bare relative. (kit #11554)
- **`adapter-auto` / `adapter-node` / `adapter-vercel`**: produce non-static output Pages can't serve. (STACK "What NOT to Use")
- **Any `+page.server.ts`, form actions, API routes**: no server on Pages — they silently don't run.
- **Verifying only on `localhost`**: dev serves from `/`, hiding every base-path and `.nojekyll` bug. Verify the deployed URL.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Static export / prerender crawl | Custom HTML dump script | `adapter-static` (`prerender=true`, `strict=true`) | Handles crawl, entry enumeration, and fails loudly on un-prerendered routes |
| Base-path prefixing | Manual string concatenation of `/repo` | `base`/`assets` from `$app/paths`, `%sveltekit.assets%` | SvelteKit rewrites all internal refs correctly; manual concat drifts |
| Pages deploy plumbing | `git push` to `gh-pages` + custom `.nojekyll` copy | `actions/upload-pages-artifact` + `actions/deploy-pages` | Official path skips Jekyll entirely, handles artifacts/permissions/OIDC |
| SPA 404 routing | Hand-written redirect shim | adapter `fallback:'404.html'` | GitHub Pages natively serves `404.html`; SvelteKit builds the app-shell fallback |

**Key insight:** The entire Pages-deploy surface is a solved problem in official SvelteKit + GitHub tooling. Every hand-rolled variant (manual `gh-pages` branch, custom base concat, DIY prerender) reintroduces exactly the failures in PITFALLS 1–3.

## .nojekyll Handling (DEPLOY-04 — corrected, HIGH confidence)

**Verified against official adapter-static docs on 2026-07-04:** adapter-static does **NOT** automatically emit `.nojekyll`. Prior research marked this MEDIUM; it is now resolved. Two facts:

1. **Manually ship `static/.nojekyll`** (empty file). adapter-static copies `static/` verbatim to the build output root, so `.nojekyll` lands at `build/.nojekyll`. **This is the mechanism that satisfies DEPLOY-04 — treat it as mandatory, not optional.**
2. When deploying via the **official Actions path** (`upload-pages-artifact` + `deploy-pages`), GitHub does **not** run Jekyll on the artifact, so underscore dirs (`_app/`) survive even if `.nojekyll` were missing. Shipping the file anyway is correct belt-and-suspenders: it guarantees `_app/` is served regardless of deploy method, and it's what the docs prescribe.

**Verification (must be on the live URL):** fetch the deployed HTML, extract an `_app/immutable/...` asset path, and confirm it returns **HTTP 200** (not 404). A missing/broken `.nojekyll` shows as an unstyled, non-interactive page that "deployed successfully." (PITFALLS Pitfall 2)

## Prerender & 404 Fallback (DEPLOY-03)

- `export const prerender = true` in `src/routes/+layout.ts` prerenders every crawlable route to its own HTML file. With `strict: true` (adapter default), the **build fails** if any route can't be prerendered — a useful guardrail that keeps DEPLOY-03 honest.
- Ensure routes are reachable by real `<a>` links so the crawler finds them (the skeleton `/` → `/about` link does this).
- `fallback: '404.html'` makes the adapter emit an app-shell `404.html`; GitHub Pages serves it for any unmatched path. Even with everything prerendered, this catches typos/old shared links and renders the branded app instead of GitHub's raw 404.
- `trailingSlash = 'always'` ensures `/about/` resolves to `about/index.html` on refresh (prevents the classic deep-link 404).

## Deploy Pipeline (DEPLOY-01)

`.github/workflows/deploy.yml` — the official SvelteKit → Pages pipeline. **Structure is HIGH confidence; exact action major-version pins are MEDIUM** (GitHub bumps action majors periodically — the official docs page today shows the newer majors below; if a major has advanced further by build time, use the current major shown at https://svelte.dev/docs/kit/adapter-static).

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]

# Required for deploy-pages (OIDC) — least privilege
permissions:
  contents: read
  pages: write
  id-token: write

# Serialize deploys; don't cancel an in-progress production deploy
concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22          # Node 22 LTS (docs show 20; 22 is the safer forward choice)
          cache: npm
      - run: npm ci
      - run: npm run build
        env:
          BASE_PATH: '/${{ github.event.repository.name }}'   # → /diversityincludesdisability_one
      - uses: actions/upload-pages-artifact@v3
        with:
          path: 'build/'

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

**Version reconciliation (2026-07-04):** the official docs page as fetched today lists newer majors — `actions/checkout@v7`, `actions/setup-node@v6`, `actions/upload-pages-artifact@v5`, `actions/deploy-pages@v5`. STACK.md lists the older, widely-deployed majors (`checkout@v4`, `setup-node@v4`, `upload-pages-artifact@v3`, `deploy-pages@v5`) shown above. **Recommendation:** pin to whatever the official docs page shows at build time; the workflow *shape* (permissions, concurrency, BASE_PATH from repo name, artifact path `build/`, two-job build→deploy) is stable and is what matters. `actions/configure-pages` is **optional** — the SvelteKit-canonical approach sets `BASE_PATH` manually from the repo name and omits it. (Only add `configure-pages@v5` if you want it to auto-detect/inject the base path instead.)

**One-time repo setting (cannot be automated in the workflow):** Settings → Pages → **Source: GitHub Actions**. The plan must include this as a manual step; the first deploy will not publish until it's set.

## .gitignore (Privacy — 501c3-pending; PITFALLS Pitfall 15)

Ship this in Phase 1 so no secret or private source can ever be committed:
```gitignore
# Dependencies
node_modules/

# Build / SvelteKit output
/build/
/.svelte-kit/
/dist/
/package/

# Env & secrets
.env
.env.*
!.env.example
*.key
*.pem

# Private / 501c3-pending source material — NEVER commit
*.notion
notion-export/
/private/
/secrets/
*.secret.*

# OS / editor
.DS_Store
Thumbs.db
.vscode/*
!.vscode/extensions.json

# Test / tool output
/playwright-report/
/test-results/
/coverage/
.lighthouseci/
```
> Third-party form endpoints (Web3Forms access key) are Phase 4, not Phase 1 — but note now: a Web3Forms *access key* is a public client-side key and is safe to expose; any true admin/API secret goes in GitHub Actions **secrets**, never the repo. (PITFALLS Pitfall 15/16)

## Runtime State Inventory

> This is a **greenfield** phase (fresh scaffold, no rename/migration). The categories below are checked for completeness and are all empty.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — no datastore in this phase | None |
| Live service config | GitHub Pages "Source: GitHub Actions" must be enabled once in repo Settings (UI, not git) | Manual one-time repo setting (in plan) |
| OS-registered state | None | None |
| Secrets/env vars | `BASE_PATH` (build-time, set by CI from repo name — not a secret). No secrets required this phase | None — verified: no admin keys used in Phase 1 |
| Build artifacts | `/build/` and `/.svelte-kit/` are generated; both gitignored | None — covered by `.gitignore` |

## Common Pitfalls (Phase-1-relevant subset from PITFALLS.md)

### Pitfall 1: Base path breaks every asset and internal link
**What goes wrong:** Unset `paths.base` or hardcoded `/` links 404 on the sub-path; looks perfect on localhost.
**Why:** Dev serves from `/`; Pages serves from `/diversityincludesdisability_one/`. Bug is invisible locally.
**How to avoid:** `base: process.env.BASE_PATH ?? ''`; set `BASE_PATH=/${{ github.event.repository.name }}` in CI; import `base` for every internal link/asset; `%sveltekit.assets%` in `app.html`.
**Warning signs:** DevTools Network shows 404s for `/_app/...`; unstyled page on Pages only.

### Pitfall 2: Missing `.nojekyll` → `_app/` dropped
**What goes wrong:** Jekyll strips underscore dirs; site deploys "successfully" but is unstyled/dead.
**How to avoid:** Ship `static/.nojekyll` (mandatory — adapter does not auto-emit it). Verify `_app/immutable/*` returns 200 live.
**Warning signs:** `_app/immutable/...` 404s on production only; view-source references files that don't load.

### Pitfall 3: Deep-link 404 on refresh / shared URLs
**What goes wrong:** Refreshing `/about/` or a shared deep link hits GitHub's raw 404.
**How to avoid:** `prerender = true` sitewide; link routes with real `<a>`; `fallback:'404.html'`; `trailingSlash='always'`.
**Warning signs:** Home works but refresh on a sub-page 404s; pages reachable by click but not direct URL.

### Pitfall (privacy): Committing secrets / private Notion source
**How to avoid:** Ship the `.gitignore` above in Phase 1; extract only public copy from private sources; secrets → Actions secrets. **Recovery is HIGH cost** (rotate + purge history), so prevent up front.

## Code Examples

All verified patterns are inline above under *Architecture Patterns*, *.nojekyll Handling*, and *Deploy Pipeline*. Primary source for every SvelteKit/Pages snippet: **https://svelte.dev/docs/kit/adapter-static** (fetched 2026-07-04, HIGH).

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `npm create svelte@latest` | `npx sv create` (unified Svelte CLI) | 2024→ | Use `sv create`; old scaffolder is legacy |
| Push to `gh-pages` branch + manual `.nojekyll` | `upload-pages-artifact` + `deploy-pages` (Actions, no Jekyll) | GitHub Pages Actions GA | No branch juggling; Jekyll never runs on the artifact |
| adapter emits `.nojekyll` (assumed) | **You ship `static/.nojekyll`** (docs-confirmed) | — (clarified 2026-07-04) | DEPLOY-04 requires the manual file |
| `adapter-auto` in new projects | Explicit `adapter-static` for Pages | — | auto-adapter guesses wrong for Pages |

**Deprecated/outdated:** `npm create svelte`, Sapper, `gh-pages`-branch deploys, `svelte-preprocess`-for-markdown (later phases), Svelte 3/4 store-first patterns.

## Validation Architecture

> nyquist_validation is enabled (`.planning/config.json` → `workflow.nyquist_validation: true`). This section is REQUIRED and drives the downstream Nyquist VALIDATION.md. **Every DEPLOY requirement is verified against the DEPLOYED URL, not localhost** — a build can succeed while the live site is broken.

**Deployed base URL:** `https://<user>.github.io/diversityincludesdisability_one/` (GitHub login is `wolfwdavid` → `https://wolfwdavid.github.io/diversityincludesdisability_one/`). Use a `BASE_URL` variable in checks so it's swappable if a custom domain is later attached.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright `1.61.1` (deployed-URL smoke) + `curl` (HTTP status assertions) + Vitest `4.1.9` (scaffolded, unit-ready for Phase 2) |
| Config file | `playwright.config.ts` (from sv add-on or Wave 0) targeting `BASE_URL`; `vite.config.ts` carries Vitest config |
| Quick run command (local pre-deploy) | `BASE_PATH=/diversityincludesdisability_one npm run build && npm run preview` then click-through |
| Full suite command (post-deploy) | `BASE_URL=https://wolfwdavid.github.io/diversityincludesdisability_one npx playwright test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command (runs against DEPLOYED url) | Expected | File Exists? |
|--------|----------|-----------|-----------------------------------------------|----------|-------------|
| DEPLOY-01 | Live root serves the built site | smoke (curl) | `curl -sfI "$BASE_URL/"` | `HTTP 200`, `content-type: text/html` | ❌ Wave 0 |
| DEPLOY-02 | Assets/links resolve under sub-path | smoke (curl+grep) | fetch `/`, assert refs are `/diversityincludesdisability_one/...` not bare `/`; then `curl -sfI` the referenced CSS/JS | hrefs/src carry the sub-path; assets `HTTP 200` | ❌ Wave 0 |
| DEPLOY-03 | Deep link + refresh resolves | smoke (curl) | `curl -sfI "$BASE_URL/about/"` (hard GET, no client nav) | `HTTP 200` (prerendered `about/index.html`) | ❌ Wave 0 |
| DEPLOY-03 | Unknown path → branded 404 (not GitHub raw) | smoke (curl) | `curl -s "$BASE_URL/does-not-exist-xyz/"` | body contains our app-shell/404 marker (fallback served) | ❌ Wave 0 |
| DEPLOY-04 | `_app` assets served (`.nojekyll` works) | smoke (curl) | fetch `/`, extract an `_app/immutable/...` URL, `curl -sfI` it | `HTTP 200` (NOT 404) | ❌ Wave 0 |

### Concrete verification commands (copy-ready)
```bash
BASE_URL="https://wolfwdavid.github.io/diversityincludesdisability_one"

# DEPLOY-01: root is live and HTML
curl -sfI "$BASE_URL/" | grep -i '200\|content-type: text/html'

# DEPLOY-03: deep link survives a hard GET / refresh
curl -sfI "$BASE_URL/about/" | grep -i '200'

# DEPLOY-03: unknown path serves our 404 fallback (GitHub returns 404 status but our HTML body)
curl -s "$BASE_URL/definitely-not-a-page-xyz/" | grep -qi 'diversity includes disability' && echo "fallback OK"

# DEPLOY-04 + DEPLOY-02: an _app asset actually loads (proves .nojekyll + base path)
ASSET=$(curl -s "$BASE_URL/" | grep -oE '/diversityincludesdisability_one/_app/immutable/[^"]+\.(js|css)' | head -1)
curl -sfI "$BASE_URL${ASSET#/diversityincludesdisability_one}" | grep -i '200'
```

### Sampling Rate
- **Per task commit:** `npm run build` (with `strict:true` this fails on any un-prerendered route) + `svelte-check`.
- **Per wave merge:** local `BASE_PATH=/diversityincludesdisability_one npm run build && npm run preview` click-through.
- **Phase gate:** the five curl checks above **green against the live Pages URL** + a Playwright smoke run, before `/gsd:verify-work`.

### Playwright / Lighthouse smoke assertions
- **Playwright** (against `$BASE_URL`): `page.goto(BASE_URL)` returns ok; no `response.status() >= 400` on any request (catches base-path 404s); `<h1>` visible; clicking the About link lands on `/about/`; `page.goto(BASE_URL + '/about/')` (hard load) still 200 (no GitHub 404 chrome); page title present.
- **Lighthouse (optional this phase):** run against `$BASE_URL`; assert Best-Practices has no 404 resources and the page is a valid static document. Full a11y/perf budgets are Phase 6 — Phase 1 only asserts "nothing 404s and it renders."

### Wave 0 Gaps
- [ ] `playwright.config.ts` — `baseURL` from `BASE_URL` env; deployed-target project
- [ ] `tests/deploy.smoke.spec.ts` — covers DEPLOY-01..04 (asset-200, deep-link, 404 fallback, no-4xx)
- [ ] `scripts/verify-deploy.sh` — the five curl checks above, exit-nonzero on failure (usable in CI post-deploy or locally)
- [ ] Framework install: Playwright browsers `npx playwright install --with-deps chromium` (if not from sv add-on)

## Open Questions

1. **Custom domain vs. sub-path (path model)** — flagged in STATE.md as a Phase 1 decision.
   - What we know: repo is `diversityincludesdisability_one` → default is the sub-path `https://<user>.github.io/diversityincludesdisability_one/`, so `base = /diversityincludesdisability_one`.
   - What's unclear: whether the org will attach a real `.org` custom domain. If so, `base` becomes `''` and a `static/CNAME` file is required.
   - Recommendation: **build for the sub-path now** (BASE_PATH from repo name). Encode it in CI so it can't drift. If a custom domain lands later, it's a one-line `base` change + `CNAME` file — cheap. Do not block Phase 1 on this.

2. **GitHub Action major-version pins** — official docs show newer majors (checkout@v7, setup-node@v6, upload-pages-artifact@v5) than STACK.md's widely-deployed set.
   - What we know: the workflow *shape* is stable; only major numbers move.
   - Recommendation: pin to whatever https://svelte.dev/docs/kit/adapter-static shows at build time; both sets work. Not a blocker.

## Sources

### Primary (HIGH confidence)
- https://svelte.dev/docs/kit/adapter-static — fetched 2026-07-04. Confirmed: adapter options (`pages`,`assets`,`fallback`,`precompress`,`strict` default `true`), **`.nojekyll` is manual (`static/.nojekyll`), not auto-emitted**, `paths.base` from `BASE_PATH`, `trailingSlash`, `prerender`, full Actions workflow (`upload-pages-artifact` + `deploy-pages`, `BASE_PATH=/${{ github.event.repository.name }}`).
- https://svelte.dev/docs/cli/sv-create — fetched 2026-07-04. Non-interactive flags (`--template`, `--types`, `--no-add-ons`, `--install`, `--no-dir-check`); templates `minimal|demo|library`.
- `.planning/research/STACK.md` — pre-verified stack (npm registry, 2026-07-04, HIGH).
- `.planning/research/PITFALLS.md` — Pitfalls 1,2,3,15,16 (HIGH).

### Secondary (MEDIUM confidence)
- Exact GitHub Action major-version pins (checkout@v7 / setup-node@v6 / upload-pages-artifact@v5 vs STACK.md's v4/v4/v3) — resolve at build time against the official docs page.

## Metadata

**Confidence breakdown:**
- Standard stack (foundation subset): HIGH — versions live-verified 2026-07-04.
- adapter-static config + `.nojekyll` + prerender/fallback: HIGH — confirmed against official docs today (`.nojekyll` MEDIUM→HIGH correction).
- Base-path handling: HIGH — official pattern + PITFALLS.
- Deploy pipeline structure: HIGH; exact action pins: MEDIUM.
- Validation Architecture (live-URL checks): HIGH — standard curl/Playwright against Pages.

**Research date:** 2026-07-04
**Valid until:** ~2026-08-04 (30 days; SvelteKit/adapter-static are stable — main churn risk is GitHub Action major bumps and npm point releases).
