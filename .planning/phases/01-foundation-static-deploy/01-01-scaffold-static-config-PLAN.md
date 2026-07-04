---
phase: 01-foundation-static-deploy
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - svelte.config.js
  - vite.config.ts
  - .gitignore
  - static/.nojekyll
  - static/favicon.svg
  - src/routes/+layout.ts
  - src/routes/+page.svelte
  - src/routes/about/+page.svelte
autonomous: true
requirements: [DEPLOY-01, DEPLOY-02, DEPLOY-03, DEPLOY-04]
must_haves:
  truths:
    - "npm run build produces a fully static site in build/ with no un-prerendered routes (strict:true passes)"
    - "The build output contains .nojekyll and 404.html at its root"
    - "The skeleton home page references at least one asset and one internal link through the base helper (not root-absolute)"
    - "A second /about route exists and is reachable by a real <a> link so the prerender crawler emits about/index.html"
  artifacts:
    - path: "svelte.config.js"
      provides: "adapter-static with fallback 404.html, strict:true, base from BASE_PATH"
      contains: "adapter-static"
    - path: "src/routes/+layout.ts"
      provides: "site-wide prerender + trailingSlash always"
      contains: "prerender = true"
    - path: "static/.nojekyll"
      provides: "DEPLOY-04 — keeps _app/ from being stripped by Jekyll"
    - path: "src/routes/+page.svelte"
      provides: "base-safe home skeleton (DEPLOY-02 testable)"
      contains: "$app/paths"
    - path: "src/routes/about/+page.svelte"
      provides: "deep-link target for DEPLOY-03"
    - path: ".gitignore"
      provides: "excludes node_modules/build/.env and private 501c3 source"
  key_links:
    - from: "svelte.config.js"
      to: "process.env.BASE_PATH"
      via: "paths.base assignment"
      pattern: "base: process\\.env\\.BASE_PATH"
    - from: "src/routes/+page.svelte"
      to: "$app/paths base"
      via: "import base, prefix href/src"
      pattern: "\\{base\\}/"
---

<objective>
Scaffold the SvelteKit skeleton and configure it to build **fully static** with `@sveltejs/adapter-static`, so a blank site compiles to `build/` with the four load-bearing GitHub Pages details correct: env-driven `base` path, `.nojekyll`, site-wide prerender, and a `404.html` deep-link fallback.

Purpose: This is the foundation the whole project stands on. Every base-path / `.nojekyll` / deep-link bug is invisible on localhost and only surfaces on the Pages sub-path — so we configure it correctly up front and make it testable (one `base`-prefixed asset+link on `/`, a real `/about` route) so later plans can verify it against the live URL.
Output: A buildable SvelteKit repo (`package.json`, `svelte.config.js`, `+layout.ts`, skeleton `/` + `/about`, `static/.nojekyll`, `.gitignore`) where `npm run build` exits 0 and emits `build/.nojekyll` + `build/404.html`.

SCOPE FENCE: Foundation subset ONLY. Do NOT install or configure `three`/`@threlte/*`, `mdsvex`, `shiki`, Tailwind, `@fontsource/*`, forms, or axe/lighthouse — those belong to Phases 2–6 and must not touch the critical path now.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/01-foundation-static-deploy/01-RESEARCH.md
@.planning/research/STACK.md

<key_facts>
- Repo dir already contains .git/, .planning/, CLAUDE.md → scaffolding needs `--no-dir-check` (must NOT clobber those).
- GitHub login: wolfwdavid. Live URL will be https://wolfwdavid.github.io/diversityincludesdisability_one/.
- Path model decision: build for the repo SUB-PATH now (custom domain deferred). `base` comes from `BASE_PATH`; CI sets it to `/diversityincludesdisability_one`.
- adapter-static does NOT auto-emit .nojekyll — you MUST ship static/.nojekyll (RESEARCH ".nojekyll Handling", HIGH confidence).
- Pinned versions (STACK.md, verified 2026-07-04): adapter-static 3.0.10, svelte-check 4.7.1. Svelte 5.56.4 / Kit 2.69.1 / Vite 7.3.6 come from the scaffold.
</key_facts>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Scaffold SvelteKit (minimal + TS) into the existing repo and ship .gitignore</name>
  <read_first>
    - .planning/phases/01-foundation-static-deploy/01-RESEARCH.md ("Installation", "sv create non-interactive flags", ".gitignore")
    - .planning/research/STACK.md ("Core Technologies" version table)
    - CLAUDE.md (project GSD workflow notes)
  </read_first>
  <files>package.json, vite.config.ts, src/app.html, src/routes/, .gitignore</files>
  <action>
    Scaffold WITHOUT clobbering .git/.planning/CLAUDE.md. From the repo root, run the non-interactive Svelte CLI into the current directory:

    ```bash
    npx sv create . --template minimal --types ts --no-add-ons --install npm --no-dir-check
    ```

    If `sv create .` refuses on the non-empty directory even with `--no-dir-check`, use the temp-dir fallback (does not touch .git/.planning/CLAUDE.md):
    ```bash
    npx sv create .sv-tmp --template minimal --types ts --no-add-ons --install npm
    # move scaffold up, preserving existing files
    cp -R .sv-tmp/. .            # copies package.json, src/, vite.config.ts, tsconfig, etc.
    rm -rf .sv-tmp
    npm install
    ```

    Then add the static adapter + type-check gate (pinned):
    ```bash
    npm install -D @sveltejs/adapter-static@3.0.10 svelte-check@4.7.1
    ```

    Create `.gitignore` at repo root with EXACTLY this content (privacy-critical — org is 501c3-pending, no secrets or private Notion source may ever be committed):
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

    Do NOT install three/threlte/mdsvex/shiki/tailwind/fonts/forms/axe (scope fence).
  </action>
  <verify>
    <automated>test -f package.json && test -f svelte.config.js && test -f src/app.html && grep -q '"@sveltejs/adapter-static"' package.json && grep -q '"svelte-check"' package.json && grep -q 'node_modules/' .gitignore && grep -q 'notion-export/' .gitignore</automated>
  </verify>
  <acceptance_criteria>
    - `test -f package.json` succeeds AND `test -f src/app.html` succeeds (scaffold landed)
    - `test -d .git && test -d .planning && test -f CLAUDE.md` all succeed (existing files preserved, not clobbered)
    - `grep '@sveltejs/adapter-static' package.json` shows version `3.0.10`
    - `grep 'svelte-check' package.json` present
    - `grep -c 'notion-export/' .gitignore` returns 1 (privacy gitignore shipped)
    - `grep -E 'three|threlte|mdsvex|tailwind' package.json` returns NOTHING (scope fence held)
  </acceptance_criteria>
  <done>SvelteKit minimal+TS scaffold exists in the repo alongside preserved .git/.planning/CLAUDE.md; adapter-static@3.0.10 + svelte-check installed; privacy .gitignore in place; no out-of-scope deps.</done>
</task>

<task type="auto">
  <name>Task 2: Configure adapter-static, prerender, trailingSlash, and ship .nojekyll + favicon</name>
  <read_first>
    - .planning/phases/01-foundation-static-deploy/01-RESEARCH.md ("Pattern 1", "Pattern 2", ".nojekyll Handling")
    - svelte.config.js (the scaffold's default — replace adapter-auto)
  </read_first>
  <files>svelte.config.js, src/routes/+layout.ts, static/.nojekyll, static/favicon.svg</files>
  <action>
    Replace the scaffold's default `svelte.config.js` (which uses `adapter-auto`) with EXACTLY:
    ```js
    // svelte.config.js — Source: https://svelte.dev/docs/kit/adapter-static (verified 2026-07-04)
    import adapter from '@sveltejs/adapter-static';
    import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

    /** @type {import('@sveltejs/kit').Config} */
    const config = {
      preprocess: vitePreprocess(),
      kit: {
        adapter: adapter({
          fallback: '404.html',   // GitHub Pages serves this for any unmatched path (DEPLOY-03)
          precompress: false,
          strict: true             // DEFAULT — build FAILS if any route isn't prerendered
        }),
        paths: {
          // '' locally so dev/preview work from root; CI sets BASE_PATH=/diversityincludesdisability_one
          base: process.env.BASE_PATH ?? ''
        }
      }
    };
    export default config;
    ```
    (If the scaffold did not include `vitePreprocess` import, keep `preprocess` out rather than adding a missing dep — the adapter/paths block is what matters.)

    Create `src/routes/+layout.ts` with EXACTLY:
    ```ts
    // src/routes/+layout.ts — site-wide prerender for a fully static Pages build
    export const prerender = true;
    export const trailingSlash = 'always';
    ```
    `trailingSlash = 'always'` makes Kit emit `about/index.html` so `/about/` survives a hard refresh on Pages (DEPLOY-03).

    Create an EMPTY `static/.nojekyll` (0 bytes) — adapter-static copies `static/` verbatim to `build/`, landing `build/.nojekyll` so Pages serves `_app/` (DEPLOY-04). Mandatory, not optional.

    Create `static/favicon.svg` (a tiny valid SVG so the home page has one real asset to reference through `base` — makes DEPLOY-02 testable):
    ```svg
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="Diversity Includes Disability"><rect width="48" height="48" rx="8" fill="#1a1a2e"/><circle cx="24" cy="24" r="12" fill="#e94560"/></svg>
    ```
    If the scaffold already created `static/favicon.png`/`favicon.svg`, keep the SVG above (or leave existing) but ensure a base-referenceable asset exists.
  </action>
  <verify>
    <automated>grep -q "adapter-static" svelte.config.js && grep -q "fallback: '404.html'" svelte.config.js && grep -q "base: process.env.BASE_PATH" svelte.config.js && grep -q "prerender = true" src/routes/+layout.ts && grep -q "trailingSlash = 'always'" src/routes/+layout.ts && test -f static/.nojekyll && test -f static/favicon.svg</automated>
  </verify>
  <acceptance_criteria>
    - `grep "from '@sveltejs/adapter-static'" svelte.config.js` present (adapter-auto replaced)
    - `grep "fallback: '404.html'" svelte.config.js` present AND `grep "strict: true" svelte.config.js` present
    - `grep "base: process.env.BASE_PATH" svelte.config.js` present (env-driven base)
    - `grep "prerender = true" src/routes/+layout.ts` present AND `grep "trailingSlash = 'always'" src/routes/+layout.ts` present
    - `test -f static/.nojekyll` succeeds (file exists; may be 0 bytes)
    - `test -f static/favicon.svg` succeeds
  </acceptance_criteria>
  <done>svelte.config.js uses adapter-static with 404 fallback + strict + env base; +layout.ts prerenders sitewide with trailing slashes; static/.nojekyll and static/favicon.svg shipped.</done>
</task>

<task type="auto">
  <name>Task 3: Write base-safe skeleton home + /about route and prove the static build is green</name>
  <read_first>
    - .planning/phases/01-foundation-static-deploy/01-RESEARCH.md ("Pattern 3: base-safe links/assets", "Anti-Patterns to Avoid")
    - src/routes/+page.svelte (scaffold default — replace)
  </read_first>
  <files>src/routes/+page.svelte, src/routes/about/+page.svelte</files>
  <action>
    Replace `src/routes/+page.svelte` with a skeleton that uses the `base` helper for one asset AND one internal link (this is what makes DEPLOY-02 verifiable on the live sub-path). Use EXACTLY:
    ```svelte
    <!-- src/routes/+page.svelte -->
    <script lang="ts">
      import { base } from '$app/paths';
    </script>

    <svelte:head><title>Diversity Includes Disability</title></svelte:head>

    <img src="{base}/favicon.svg" alt="Diversity Includes Disability" width="48" height="48" />
    <h1>Diversity Includes Disability</h1>
    <p>Foundation deploy skeleton — accessible-first, deployed static to GitHub Pages.</p>
    <nav><a href="{base}/about">About</a></nav>
    ```

    Create `src/routes/about/+page.svelte` — the deep-link target the crawler must reach so `about/index.html` is emitted (DEPLOY-03):
    ```svelte
    <!-- src/routes/about/+page.svelte -->
    <script lang="ts">
      import { base } from '$app/paths';
    </script>

    <svelte:head><title>About — Diversity Includes Disability</title></svelte:head>

    <h1>About</h1>
    <p>Placeholder about page — proves deep-link refresh resolves on GitHub Pages.</p>
    <a href="{base}/">Home</a>
    ```

    NEVER use root-absolute internal URLs (`href="/about"`, `src="/favicon.svg"`) — they 404 on the Pages sub-path. Always prefix with `{base}`.

    Then prove the static build is green two ways — plain and sub-path:
    ```bash
    npx svelte-check --tsconfig ./tsconfig.json
    npm run build                                           # strict:true fails on any un-prerendered route
    BASE_PATH=/diversityincludesdisability_one npm run build
    ```
  </action>
  <verify>
    <automated>grep -q "\$app/paths" src/routes/+page.svelte && grep -q "{base}/about" src/routes/+page.svelte && grep -q "{base}/favicon.svg" src/routes/+page.svelte && test -f src/routes/about/+page.svelte && npm run build && test -f build/.nojekyll && test -f build/404.html && test -f build/about/index.html</automated>
  </verify>
  <acceptance_criteria>
    - `grep "import { base } from '\$app/paths'" src/routes/+page.svelte` present
    - `grep -E 'href="/[a-z]|src="/[a-z]' src/routes/+page.svelte src/routes/about/+page.svelte` returns NOTHING (no root-absolute internal refs)
    - `npm run build` exits 0 (strict prerender passes — DEPLOY-01/DEPLOY-03 config proven at build time)
    - `test -f build/.nojekyll` succeeds (DEPLOY-04 file reaches output)
    - `test -f build/404.html` succeeds (DEPLOY-03 fallback emitted)
    - `test -f build/about/index.html` succeeds (trailingSlash produced the deep-link file)
    - After `BASE_PATH=/diversityincludesdisability_one npm run build`, `grep -r 'diversityincludesdisability_one/favicon.svg' build/index.html` present (base prefixing works — DEPLOY-02)
  </acceptance_criteria>
  <done>Home and /about render base-safe links/assets; `npm run build` exits 0 with build/.nojekyll, build/404.html, and build/about/index.html present; with BASE_PATH set, asset/link refs carry the sub-path.</done>
</task>

</tasks>

<verification>
- `npm run build` exits 0 with default (empty) base AND with `BASE_PATH=/diversityincludesdisability_one` (strict:true enforces full prerender coverage — DEPLOY-01/DEPLOY-03 at build time).
- `build/.nojekyll`, `build/404.html`, `build/about/index.html` all exist (DEPLOY-04, DEPLOY-03).
- With BASE_PATH set, `build/index.html` references `favicon.svg` and the About link under `/diversityincludesdisability_one/` (DEPLOY-02).
- `.git/`, `.planning/`, `CLAUDE.md` untouched by the scaffold.
</verification>

<success_criteria>
- A blank SvelteKit site builds fully static with adapter-static (strict prerender green).
- The four load-bearing Pages details are configured: env base, `.nojekyll`, sitewide prerender, `404.html` fallback with trailing slashes.
- Skeleton `/` + `/about` make DEPLOY-02 (base) and DEPLOY-03 (deep link) testable by later plans.
- No out-of-scope dependencies present.
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-static-deploy/01-01-SUMMARY.md` recording: exact scaffold command used (primary vs temp-dir fallback), installed versions (Svelte/Kit/Vite/adapter-static), and confirmation that `build/.nojekyll` + `build/404.html` + `build/about/index.html` were emitted.
</output>
