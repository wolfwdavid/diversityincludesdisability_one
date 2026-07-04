---
phase: 01-foundation-static-deploy
plan: 02
type: execute
wave: 2
depends_on: ["01-01"]
files_modified:
  - .github/workflows/deploy.yml
  - playwright.config.ts
  - tests/deploy.smoke.spec.ts
  - scripts/verify-deploy.sh
  - package.json
autonomous: true
requirements: [DEPLOY-01, DEPLOY-02, DEPLOY-03, DEPLOY-04]
must_haves:
  truths:
    - "A push to main triggers a GitHub Actions workflow that builds with BASE_PATH from the repo name and publishes build/ to Pages"
    - "The workflow requests least-privilege Pages permissions (pages: write, id-token: write) and serializes deploys via a pages concurrency group"
    - "A runnable smoke suite (Playwright) and a curl matrix (scripts/verify-deploy.sh) exist that assert DEPLOY-01..04 against a live BASE_URL"
  artifacts:
    - path: ".github/workflows/deploy.yml"
      provides: "official SvelteKit → Pages pipeline (build→deploy)"
      contains: "upload-pages-artifact"
    - path: "scripts/verify-deploy.sh"
      provides: "the five live-URL curl checks, exit-nonzero on failure"
      contains: "_app/immutable"
    - path: "tests/deploy.smoke.spec.ts"
      provides: "Playwright deployed-URL smoke covering DEPLOY-01..04"
      contains: "about"
    - path: "playwright.config.ts"
      provides: "baseURL from BASE_URL env; deployed-target project"
      contains: "baseURL"
  key_links:
    - from: ".github/workflows/deploy.yml"
      to: "BASE_PATH=/${{ github.event.repository.name }}"
      via: "build step env"
      pattern: "BASE_PATH: '/\\$\\{\\{ github.event.repository.name \\}\\}'"
    - from: ".github/workflows/deploy.yml"
      to: "actions/deploy-pages"
      via: "deploy job"
      pattern: "actions/deploy-pages@"
---

<objective>
Create the GitHub Actions pipeline that rebuilds and redeploys the static site to GitHub Pages on every push to `main`, and scaffold the Wave 0 verification harness (Playwright smoke + a curl matrix) that later proves DEPLOY-01..04 against the **live** URL — not localhost.

Purpose: DEPLOY-01 requires an automated CI deploy, and the whole phase is gated on live-URL checks (RESEARCH "## Validation Architecture"). The workflow injects `BASE_PATH` from the repo name so the sub-path can never drift, and the smoke/curl harness turns the five load-bearing assertions (root 200, base-path assets, deep-link, 404 fallback, `_app` served) into repeatable commands.
Output: `.github/workflows/deploy.yml`, `playwright.config.ts`, `tests/deploy.smoke.spec.ts`, `scripts/verify-deploy.sh`, plus a `verify:deploy` npm script.

SCOPE FENCE: No axe/lighthouse budgets here (Phase 6). Smoke only asserts "nothing 404s and it renders."
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@.planning/phases/01-foundation-static-deploy/01-RESEARCH.md
@.planning/phases/01-foundation-static-deploy/01-VALIDATION.md

<key_facts>
- Live BASE_URL: https://wolfwdavid.github.io/diversityincludesdisability_one
- Workflow shape is HIGH confidence; action major pins are MEDIUM — pin to whatever https://svelte.dev/docs/kit/adapter-static shows at build time. Docs today show newer majors (checkout@v7, setup-node@v6, upload-pages-artifact@v5, deploy-pages@v5); STACK.md shows widely-deployed v4/v4/v3/v5. Either works; the shape (permissions, concurrency, BASE_PATH from repo name, artifact path build/, two-job build→deploy) is what matters.
- Node 22 LTS. Build output dir is build/ (adapter-static default).
- BASE_PATH is a build-time var derived from the repo name — NOT a secret.
- This plan depends on 01-01 (package.json + `npm run build` producing build/).
</key_facts>

<interfaces>
From 01-01 (already built): `npm run build` emits static site to `build/` including `build/.nojekyll`, `build/404.html`, `build/about/index.html`. Home references `{base}/favicon.svg` and `{base}/about`. Body text contains "Diversity Includes Disability" (used as the 404-fallback marker).
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add the official SvelteKit → GitHub Pages deploy workflow</name>
  <read_first>
    - .planning/phases/01-foundation-static-deploy/01-RESEARCH.md ("## Deploy Pipeline (DEPLOY-01)", "Version reconciliation")
    - package.json (confirm `build` script exists from scaffold)
  </read_first>
  <files>.github/workflows/deploy.yml</files>
  <action>
    Create `.github/workflows/deploy.yml` with EXACTLY this content (official two-job build→deploy pipeline; BASE_PATH injected from the repo name so the sub-path can't drift):
    ```yaml
    name: Deploy to GitHub Pages
    on:
      push:
        branches: [main]
      workflow_dispatch:

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
              node-version: 22
              cache: npm
          - run: npm ci
          - run: npm run build
            env:
              BASE_PATH: '/${{ github.event.repository.name }}'
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

    Before committing, quickly reconcile the four action pins against https://svelte.dev/docs/kit/adapter-static (WebFetch). If the docs show a newer major for any of `checkout`/`setup-node`/`upload-pages-artifact`/`deploy-pages`, bump that pin to match. Do NOT change the workflow shape (permissions, concurrency group `pages`, `BASE_PATH` from repo name, artifact `path: 'build/'`, two-job build→deploy). `actions/configure-pages` is intentionally omitted — BASE_PATH is set manually.
  </action>
  <verify>
    <automated>test -f .github/workflows/deploy.yml && grep -q "branches: \[main\]" .github/workflows/deploy.yml && grep -q "pages: write" .github/workflows/deploy.yml && grep -q "id-token: write" .github/workflows/deploy.yml && grep -q "group: pages" .github/workflows/deploy.yml && grep -q "BASE_PATH: '/\${{ github.event.repository.name }}'" .github/workflows/deploy.yml && grep -q "upload-pages-artifact" .github/workflows/deploy.yml && grep -q "deploy-pages@" .github/workflows/deploy.yml && grep -q "path: 'build/'" .github/workflows/deploy.yml</automated>
  </verify>
  <acceptance_criteria>
    - `test -f .github/workflows/deploy.yml` succeeds
    - `grep "on:" -A3 .github/workflows/deploy.yml` shows `push` on `branches: [main]` (DEPLOY-01 auto-trigger)
    - `grep -E 'pages: write|id-token: write'` returns BOTH lines (OIDC deploy permissions)
    - `grep "group: pages" .github/workflows/deploy.yml` present AND `grep "cancel-in-progress: false"` present (serialized deploys)
    - `grep "BASE_PATH: '/\${{ github.event.repository.name }}'" .github/workflows/deploy.yml` present (sub-path from repo name)
    - `grep -E 'upload-pages-artifact@|deploy-pages@' .github/workflows/deploy.yml` returns BOTH jobs' actions
    - `grep "configure-pages" .github/workflows/deploy.yml` returns NOTHING (BASE_PATH set manually, per RESEARCH)
  </acceptance_criteria>
  <done>deploy.yml exists with push-to-main + workflow_dispatch triggers, least-privilege Pages permissions, pages concurrency, BASE_PATH from repo name, and the official upload-artifact→deploy-pages two-job flow.</done>
</task>

<task type="auto">
  <name>Task 2: Scaffold the live-URL smoke harness (Playwright config + spec + curl script)</name>
  <read_first>
    - .planning/phases/01-foundation-static-deploy/01-RESEARCH.md ("## Validation Architecture", "Concrete verification commands", "Wave 0 Gaps")
    - .planning/phases/01-foundation-static-deploy/01-VALIDATION.md ("Wave 0 Requirements")
    - package.json (add scripts)
  </read_first>
  <files>playwright.config.ts, tests/deploy.smoke.spec.ts, scripts/verify-deploy.sh, package.json</files>
  <action>
    Install the smoke framework (pinned): `npm install -D @playwright/test@1.61.1 vitest@4.1.9` (vitest is scaffolded now for Phase 2 util tests; no test files needed for it yet). Then `npx playwright install --with-deps chromium` (skip `--with-deps` if it errors on Windows; browsers alone are enough locally).

    Create `playwright.config.ts` — target a swappable `BASE_URL` so a custom domain can replace the sub-path later:
    ```ts
    import { defineConfig } from '@playwright/test';

    const BASE_URL =
      process.env.BASE_URL ?? 'https://wolfwdavid.github.io/diversityincludesdisability_one';

    export default defineConfig({
      testDir: 'tests',
      timeout: 30_000,
      use: { baseURL: BASE_URL },
      reporter: 'list'
    });
    ```

    Create `tests/deploy.smoke.spec.ts` covering DEPLOY-01..04 against the deployed URL (hard GETs, no reliance on client nav):
    ```ts
    import { test, expect } from '@playwright/test';

    const BASE =
      process.env.BASE_URL ?? 'https://wolfwdavid.github.io/diversityincludesdisability_one';

    test('DEPLOY-01: root serves the built HTML', async ({ page }) => {
      const res = await page.goto('/');
      expect(res?.status()).toBeLessThan(400);
      await expect(page.locator('h1')).toBeVisible();
    });

    test('DEPLOY-02/04: no request 4xxs and an _app asset loads', async ({ page }) => {
      const bad: string[] = [];
      page.on('response', (r) => {
        if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`);
      });
      await page.goto('/', { waitUntil: 'networkidle' });
      expect(bad, `4xx requests:\n${bad.join('\n')}`).toEqual([]);
    });

    test('DEPLOY-03: deep-link /about/ resolves on a hard load', async ({ page }) => {
      const res = await page.goto('/about/');
      expect(res?.status()).toBeLessThan(400);
      await expect(page.locator('h1')).toHaveText(/about/i);
    });

    test('DEPLOY-03: unknown path serves our branded 404 fallback', async ({ page }) => {
      await page.goto('/definitely-not-a-page-xyz/');
      await expect(page.locator('body')).toContainText(/Diversity Includes Disability/i);
    });
    ```

    Create `scripts/verify-deploy.sh` — the five copy-ready curl checks from RESEARCH, exit-nonzero on any failure:
    ```bash
    #!/usr/bin/env bash
    set -euo pipefail
    BASE_URL="${BASE_URL:-https://wolfwdavid.github.io/diversityincludesdisability_one}"
    echo "Verifying $BASE_URL"

    # DEPLOY-01: root is live and HTML
    curl -sfI "$BASE_URL/" | grep -qi 'content-type: text/html'

    # DEPLOY-03: deep link survives a hard GET / refresh
    curl -sfI "$BASE_URL/about/" >/dev/null

    # DEPLOY-03: unknown path serves our 404 fallback body (GitHub returns 404 status, our HTML)
    curl -s "$BASE_URL/definitely-not-a-page-xyz/" | grep -qi 'diversity includes disability'

    # DEPLOY-04 + DEPLOY-02: an _app asset actually loads (proves .nojekyll + base path)
    ASSET=$(curl -s "$BASE_URL/" | grep -oE '/diversityincludesdisability_one/_app/immutable/[^"]+\.(js|css)' | head -1)
    test -n "$ASSET"
    curl -sfI "$BASE_URL${ASSET#/diversityincludesdisability_one}" >/dev/null

    echo "ALL DEPLOY CHECKS PASSED"
    ```

    Add npm scripts to `package.json`:
    ```json
    "smoke": "playwright test",
    "verify:deploy": "bash scripts/verify-deploy.sh"
    ```
  </action>
  <verify>
    <automated>test -f playwright.config.ts && grep -q "baseURL" playwright.config.ts && test -f tests/deploy.smoke.spec.ts && grep -q "about/" tests/deploy.smoke.spec.ts && grep -q "definitely-not-a-page-xyz" tests/deploy.smoke.spec.ts && test -f scripts/verify-deploy.sh && grep -q "_app/immutable" scripts/verify-deploy.sh && grep -q "verify:deploy" package.json && grep -q '"@playwright/test"' package.json</automated>
  </verify>
  <acceptance_criteria>
    - `grep '"@playwright/test"' package.json` shows `1.61.1`; `grep '"vitest"' package.json` shows `4.1.9`
    - `grep "baseURL" playwright.config.ts` present AND `grep "process.env.BASE_URL" playwright.config.ts` present (swappable target)
    - `tests/deploy.smoke.spec.ts` contains all four assertions: `grep -c "test(" tests/deploy.smoke.spec.ts` returns 4
    - `grep -E 'about/|definitely-not-a-page-xyz|_app|4xx' tests/deploy.smoke.spec.ts` matches (DEPLOY-01..04 covered)
    - `grep "_app/immutable" scripts/verify-deploy.sh` present AND `grep "set -euo pipefail" scripts/verify-deploy.sh` present (fails loud)
    - `grep -E 'verify:deploy|smoke' package.json` returns both scripts
    - NOTE: these tests are EXPECTED to be un-runnable until the site is live — they are the Wave 0 harness. Do NOT run them green here; 01-03 runs them against the deployed URL.
  </acceptance_criteria>
  <done>Playwright config + a 4-assertion smoke spec + a 5-check curl script exist and are wired to a swappable BASE_URL, with `smoke` and `verify:deploy` npm scripts. Harness is ready but intentionally unrun (no live site yet).</done>
</task>

</tasks>

<verification>
- `.github/workflows/deploy.yml` parses as valid YAML and contains the load-bearing shape (permissions, concurrency, BASE_PATH from repo name, artifact `build/`, build→deploy).
- `playwright.config.ts`, `tests/deploy.smoke.spec.ts`, `scripts/verify-deploy.sh` exist; `npm run` exposes `smoke` and `verify:deploy`.
- `npm run build` still exits 0 (adding test infra did not break the build).
</verification>

<success_criteria>
- Pushing to main will trigger an automated Pages deploy (DEPLOY-01) — pending the one-time repo setting handled in 01-03.
- The live-URL verification harness for DEPLOY-01..04 exists and is runnable once the site is deployed.
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-static-deploy/01-02-SUMMARY.md` recording: the exact action pins used in deploy.yml (and whether they were bumped from the RESEARCH defaults), the installed Playwright/Vitest versions, and a note that the smoke harness is Wave 0 (unrun until 01-03 deploys).
</output>
