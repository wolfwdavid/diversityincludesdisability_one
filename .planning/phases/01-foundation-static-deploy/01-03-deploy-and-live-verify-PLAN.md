---
phase: 01-foundation-static-deploy
plan: 03
type: execute
wave: 3
depends_on: ["01-01", "01-02"]
files_modified:
  - .planning/phases/01-foundation-static-deploy/01-DEPLOY-LOG.md
autonomous: false
requirements: [DEPLOY-01, DEPLOY-02, DEPLOY-03, DEPLOY-04]
must_haves:
  truths:
    - "The repo is pushed to github.com/wolfwdavid/diversityincludesdisability_one and the deploy workflow has run to success on main"
    - "Visiting the live sub-path URL loads the skeleton with styles/JS (no broken assets)"
    - "A hard load of /about/ resolves and an unknown path renders our branded 404 body"
    - "An _app/immutable asset returns HTTP 200 on the live URL (proves .nojekyll + base path)"
  artifacts:
    - path: ".planning/phases/01-foundation-static-deploy/01-DEPLOY-LOG.md"
      provides: "recorded evidence of the green curl matrix + smoke run + Actions run URL"
  key_links:
    - from: "push to main"
      to: "GitHub Actions deploy → Pages"
      via: "deploy.yml on push"
      pattern: "gh run list"
    - from: "live BASE_URL"
      to: "_app/immutable asset 200"
      via: "scripts/verify-deploy.sh"
      pattern: "_app/immutable"
---

<objective>
Publish the site for the first time and verify all four DEPLOY requirements **against the live GitHub Pages URL** — the actual gate for this phase. A build can succeed while the deployed site is unstyled and dead, so success is defined by the curl matrix + Playwright smoke going green against `https://wolfwdavid.github.io/diversityincludesdisability_one/`, not localhost.

Purpose: Close DEPLOY-01..04 with real evidence. This plan pushes the repo, walks the human through the single unavoidable one-time repo setting (Settings → Pages → Source: GitHub Actions), waits for the deploy, then runs the Wave 0 harness from 01-02 against the deployed URL.
Output: A green live deploy + `01-DEPLOY-LOG.md` capturing the Actions run URL and the passing verification output.

NOTE: This plan is NOT autonomous — Task 2 is an unavoidable repo-settings UI step and Task 3 gates on a human eyeball of the live page.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/01-foundation-static-deploy/01-RESEARCH.md
@.planning/phases/01-foundation-static-deploy/01-VALIDATION.md

<key_facts>
- Live BASE_URL: https://wolfwdavid.github.io/diversityincludesdisability_one
- GitHub login: wolfwdavid; repo name must be diversityincludesdisability_one (deploy.yml derives BASE_PATH from the repo name).
- The ONE unavoidable manual step: Settings → Pages → Source: "GitHub Actions". The first deploy will not publish until this is set. It is a repo UI setting with no CLI equivalent.
- Verification harness already exists from 01-02: `scripts/verify-deploy.sh` (5 curl checks) and `tests/deploy.smoke.spec.ts` (Playwright, 4 assertions), both reading BASE_URL.
- Pages can take 1–3 minutes after the workflow succeeds before the URL serves.
</key_facts>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create the GitHub repo (if needed) and push main to trigger the first deploy</name>
  <read_first>
    - .github/workflows/deploy.yml (confirm it triggers on push to main)
    - .gitignore (confirm build/ and node_modules/ excluded before committing)
  </read_first>
  <files>(git state only — no source files changed)</files>
  <action>
    Ensure everything from 01-01/01-02 is committed, then get it onto GitHub under the exact repo name the workflow expects.

    1. Confirm the working tree builds and is staged cleanly (build/ and node_modules/ must be gitignored):
    ```bash
    git status --porcelain
    npm run build   # sanity: still green
    ```
    2. Ensure the branch is `main`: `git branch -M main`.
    3. Create + push the GitHub repo via gh CLI (public, so Pages is free). If the repo already exists, just add the remote and push:
    ```bash
    gh repo create wolfwdavid/diversityincludesdisability_one --public --source=. --remote=origin --push
    # If it already exists:
    #   git remote add origin https://github.com/wolfwdavid/diversityincludesdisability_one.git 2>/dev/null || true
    #   git push -u origin main
    ```
    If `gh` returns an auth error, STOP and surface it (the user must `gh auth login`) — an auth checkpoint will be created dynamically; do not work around it.

    4. Confirm the push landed and the workflow was queued:
    ```bash
    gh run list --workflow "Deploy to GitHub Pages" --limit 3
    ```
    The very first run may fail at the deploy step until Pages source is set (Task 2) — that is expected; the important thing is the workflow was triggered by the push (DEPLOY-01).
  </action>
  <verify>
    <automated>git remote get-url origin | grep -qi 'diversityincludesdisability_one' && git ls-remote --heads origin main | grep -q refs/heads/main</automated>
  </verify>
  <acceptance_criteria>
    - `git remote get-url origin` contains `diversityincludesdisability_one` (correct repo name — BASE_PATH derives from it)
    - `git ls-remote --heads origin main` shows a `refs/heads/main` ref (main pushed)
    - `gh run list --workflow "Deploy to GitHub Pages" --limit 3` lists at least one run (push triggered the workflow — DEPLOY-01)
    - `git ls-files build/ | wc -l` returns 0 (build output not committed) AND `git ls-files node_modules/ | wc -l` returns 0
  </acceptance_criteria>
  <done>Repo exists at github.com/wolfwdavid/diversityincludesdisability_one with main pushed; the deploy workflow was triggered by the push; build/ and node_modules/ are not tracked.</done>
</task>

<task type="checkpoint:human-action" gate="blocking">
  <name>Task 2: One-time — set GitHub Pages Source to "GitHub Actions"</name>
  <read_first>
    - .github/workflows/deploy.yml (the workflow whose deploy job is blocked until Pages Source is set)
  </read_first>
  <files>(GitHub repo Settings — no repo files changed)</files>
  <action>
    HUMAN-ONLY step (no CLI/API equivalent). Task 1 pushed the repo and triggered the deploy workflow, but GitHub Pages will not publish the artifact until the repo's Pages Source is switched to "GitHub Actions".

    1. Open https://github.com/wolfwdavid/diversityincludesdisability_one/settings/pages
    2. Under "Build and deployment" → "Source", select **GitHub Actions** (not "Deploy from a branch").
    3. Go to the Actions tab: https://github.com/wolfwdavid/diversityincludesdisability_one/actions
    4. Re-run the latest "Deploy to GitHub Pages" workflow (or push an empty commit: `git commit --allow-empty -m "trigger pages deploy" && git push`).
    5. Wait for BOTH the `build` and `deploy` jobs to show green. The deploy job prints the published URL.

    Resume signal: reply "deployed" once the workflow shows green build + deploy jobs, or paste any error from the Actions log.
  </action>
  <verify>
    <automated>gh run list --workflow "Deploy to GitHub Pages" --limit 1 --json conclusion --jq '.[0].conclusion' | grep -q success</automated>
  </verify>
  <acceptance_criteria>
    - The latest "Deploy to GitHub Pages" run shows `conclusion: success` for BOTH build and deploy jobs (`gh run list ... --jq '.[0].conclusion'` → `success`)
    - The deploy job's environment URL resolves to `https://wolfwdavid.github.io/diversityincludesdisability_one/`
  </acceptance_criteria>
  <done>Pages Source is set to "GitHub Actions" and a full build→deploy workflow run has completed green, publishing the site to the sub-path URL.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Verify DEPLOY-01..04 green against the live URL</name>
  <read_first>
    - scripts/verify-deploy.sh (the 5-check curl matrix from 01-02)
    - tests/deploy.smoke.spec.ts (the 4-assertion Playwright smoke from 01-02)
    - .planning/phases/01-foundation-static-deploy/01-RESEARCH.md ("Concrete verification commands")
  </read_first>
  <files>.planning/phases/01-foundation-static-deploy/01-DEPLOY-LOG.md</files>
  <action>
    With Pages published, verify the live sub-path serves the styled skeleton, resolves deep links, serves a branded 404, and loads `_app` assets. Run the 01-02 harness against the deployed URL, then have the human eyeball it.

    Automated portion (run once the site is live — wait 1–3 min after the deploy job goes green):
    ```bash
    export BASE_URL="https://wolfwdavid.github.io/diversityincludesdisability_one"
    npm run verify:deploy      # 5 curl checks — must print "ALL DEPLOY CHECKS PASSED"
    npm run smoke              # Playwright — 4 assertions must pass
    ```

    Human confirmation:
    1. Visit https://wolfwdavid.github.io/diversityincludesdisability_one/ — the page shows the heading and favicon, styled (not raw/unstyled). Open DevTools → Network and confirm NO 404s (especially none for `/_app/...`).
    2. Visit https://wolfwdavid.github.io/diversityincludesdisability_one/about/ directly (hard load / paste in a fresh tab) — it resolves to the About page, not a GitHub 404.
    3. Visit https://wolfwdavid.github.io/diversityincludesdisability_one/does-not-exist-xyz/ — you get OUR page content ("Diversity Includes Disability"), not GitHub's raw 404 chrome.

    Then record evidence in `.planning/phases/01-foundation-static-deploy/01-DEPLOY-LOG.md`: the Actions run URL, the `verify:deploy` output line, the Playwright pass count, and which browser/date the human checked.

    Resume signal: reply "verified" once `verify:deploy` prints ALL DEPLOY CHECKS PASSED, `smoke` passes, and the three manual URL checks look right — or describe what broke (unstyled page → `.nojekyll`/base-path; /about 404 → prerender/trailingSlash; asset 404 → base path).
  </action>
  <verify>
    <automated>BASE_URL="https://wolfwdavid.github.io/diversityincludesdisability_one" bash scripts/verify-deploy.sh</automated>
  </verify>
  <acceptance_criteria>
    - `BASE_URL=<live> npm run verify:deploy` prints `ALL DEPLOY CHECKS PASSED` (root 200/HTML, `/about/` 200, 404 fallback body present, `_app/immutable` asset 200 → DEPLOY-01..04 live)
    - `BASE_URL=<live> npm run smoke` reports all 4 Playwright assertions passing
    - `.planning/phases/01-foundation-static-deploy/01-DEPLOY-LOG.md` exists and contains the Actions run URL + the `verify:deploy` pass line
    - Human confirms: live page styled with no `/_app/` 404s; `/about/` hard-load resolves; unknown path shows our branded 404 body
  </acceptance_criteria>
  <done>The live URL passes the full curl matrix + Playwright smoke, the human has eyeballed the three URL cases, and 01-DEPLOY-LOG.md records the evidence. DEPLOY-01..04 are verified against the deployed site.</done>
</task>

</tasks>

<verification>
- `npm run verify:deploy` (with BASE_URL set) prints "ALL DEPLOY CHECKS PASSED" — root 200/HTML, `/about/` 200, 404 fallback body present, `_app/immutable` asset 200 (DEPLOY-01..04 live).
- `npm run smoke` passes all 4 Playwright assertions against the deployed URL.
- The GitHub Actions "Deploy to GitHub Pages" workflow shows green build + deploy jobs, and re-runs on any push to main (DEPLOY-01).
- `01-DEPLOY-LOG.md` records the Actions run URL + passing verification output.
</verification>

<success_criteria>
1. Visiting the live sub-path loads the skeleton with no broken styles or 404 assets (DEPLOY-02, DEPLOY-04).
2. Deep-linking/refreshing `/about/` resolves; unknown paths render our branded 404 (DEPLOY-03).
3. `_app/` assets return 200 in production (DEPLOY-04).
4. A push to main triggers the workflow that rebuilds + redeploys automatically (DEPLOY-01).
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-static-deploy/01-03-SUMMARY.md` recording: the live URL, the successful Actions run URL, the green `verify:deploy` + `smoke` output, and confirmation that Pages Source is set to "GitHub Actions". Mark DEPLOY-01..04 as verified-live in the summary.
</output>
