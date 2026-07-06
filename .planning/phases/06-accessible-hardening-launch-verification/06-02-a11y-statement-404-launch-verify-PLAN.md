---
phase: 06-accessible-hardening-launch-verification
plan: 02
type: execute
wave: 2
depends_on: ["06-01"]
files_modified:
  - src/routes/accessibility/+page.svelte
  - src/lib/data/nav.ts
  - src/lib/components/Footer.svelte
  - src/routes/+error.svelte
  - e2e/accessibility-statement.a11y.spec.ts
  - e2e/a11y-axe.a11y.spec.ts
  - scripts/verify-deploy.sh
  - tests/deploy.smoke.spec.ts
  - .planning/phases/06-accessible-hardening-launch-verification/LAUNCH-CHECKLIST.md
autonomous: false
requirements: [A11Y-06]
must_haves:
  truths:
    - "A published /accessibility/ page states the conformance target, test cadence, an honest known-issues list, and a help contact"
    - "The accessibility statement is reachable from every page via the footer"
    - "The new /accessibility/ page is included in the axe scan set and passes WCAG 2.2 AA"
    - "A branded 404 page renders on the deployed build for unknown paths"
    - "The deployed site verifies clean: correct base path, deep links resolve, _app assets return 200"
  artifacts:
    - path: "src/routes/accessibility/+page.svelte"
      provides: "Scope-style accessibility statement"
      contains: "Conformance target"
    - path: "e2e/accessibility-statement.a11y.spec.ts"
      provides: "Asserts the required statement sections + footer link"
      contains: "Conformance target"
    - path: "scripts/verify-deploy.sh"
      provides: "Live deployed-URL verification incl. /accessibility/ deep-link"
      contains: "accessibility/"
    - path: ".planning/phases/06-accessible-hardening-launch-verification/LAUNCH-CHECKLIST.md"
      provides: "Final deployed-URL launch verification checklist"
      contains: "base path"
  key_links:
    - from: "src/lib/data/nav.ts / src/lib/components/Footer.svelte"
      to: "/accessibility"
      via: "footer link to {base}/accessibility"
      pattern: "accessibility"
    - from: "e2e/a11y-axe.a11y.spec.ts"
      to: "/accessibility/"
      via: "route added to the axe ROUTES array"
      pattern: "'/accessibility/'"
    - from: "scripts/verify-deploy.sh"
      to: "deployed /accessibility/"
      via: "curl deep-link resolves + _app asset 200"
      pattern: "accessibility/"
---

<objective>
Publish an honest, Scope-style accessibility statement page, ensure the branded 404 is solid, and prove the deployed build verifies clean end-to-end (base path, deep links, `_app` 200, branded 404) via an automated harness plus a human live-URL check.

Purpose: A11Y-06 requires a published accessibility statement with an honest known-issues list. Success criterion #3 requires the DEPLOYED build (not local) to verify clean. This plan ships the statement, wires it into nav + the axe scan set, and hardens the deployed-URL verification harness into a launch checklist.
Output: `/accessibility/` route, footer link, statement structure spec, `/accessibility/` added to the axe ROUTES, an extended `verify-deploy.sh` + `deploy.smoke.spec.ts`, a `LAUNCH-CHECKLIST.md`, and a human live-URL sign-off.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md

@src/lib/data/nav.ts
@src/lib/components/Footer.svelte
@src/routes/+error.svelte
@src/routes/about/+page.svelte
@src/lib/config.ts
@scripts/verify-deploy.sh
@tests/deploy.smoke.spec.ts
@e2e/a11y-axe.a11y.spec.ts

<interfaces>
<!-- Contracts the executor needs — use directly, no exploration required. -->

Base-prefixed internal links: `import { base } from '$app/paths';` then `href="{base}/accessibility"`.
Footer nav is data-driven from src/lib/data/nav.ts (navItems: {href,label}[]) — but navItems
is the PRIMARY header nav; the accessibility statement should NOT be added to the primary
header nav (Scope convention: it lives in the footer). Add the footer link directly in
Footer.svelte's secondary list, OR add a separate `footerExtra` export in nav.ts. Prefer a
dedicated link in Footer.svelte to keep the 7-item primary nav count stable (shell.spec.ts
asserts exactly 7 primary-nav items — do NOT break that).

Help contact (org email, already used in Footer): mailto:emanrimawi@gmail.com
Verified prior-art conformance model: scope.org.uk accessibility statement (Scope-style).

The branded 404 (src/routes/+error.svelte) renders INSIDE +layout's <main> (inherits landmarks,
skip-link, header, footer). It already shows title, H1, status, and a {base}/ "Return home" link.

Deployed-URL harness (already proves base path / deep link / _app 200 / 404 fallback):
  scripts/verify-deploy.sh   (curl matrix, BASE_URL default = live Pages URL)
  tests/deploy.smoke.spec.ts (Playwright, run via `npm run smoke`)
Live URL: https://wolfwdavid.github.io/diversityincludesdisability_one
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Publish the Scope-style accessibility statement, link it in the footer, and add it to the axe scan set</name>
  <files>src/routes/accessibility/+page.svelte, src/lib/components/Footer.svelte, e2e/a11y-axe.a11y.spec.ts, e2e/accessibility-statement.a11y.spec.ts</files>
  <read_first>
    - src/routes/about/+page.svelte (house content/markup + heading conventions to match)
    - src/lib/components/Footer.svelte (where to add the secondary link; existing mailto + focus-ring pattern)
    - src/lib/config.ts (help-contact / org values)
    - e2e/a11y-axe.a11y.spec.ts (the ROUTES array to extend so the new page is axe-scanned)
    - src/routes/+layout.svelte (confirm the page renders inside main#main-content; do not re-add landmarks)
  </read_first>
  <action>
    1. Create `src/routes/accessibility/+page.svelte` — a prerendered (inherits layout prerender) statement modeled on scope.org.uk. Use `import { base } from '$app/paths';`. Include a `<svelte:head><title>Accessibility statement — Diversity Includes Disability</title></svelte:head>`. Single `<h1>Accessibility statement</h1>` then these `<h2>` sections with real, honest prose (no lorem):
       - "Conformance target" — state exactly: this site aims to conform to WCAG 2.2 level AA, and the Accessible theme is verified by automated axe scans (@axe-core/playwright, tags wcag2a/wcag2aa/wcag21a/wcag21aa/wcag22aa) on every page plus a manual screen-reader and keyboard review.
       - "How we test" (test cadence) — automated axe + capability checks run on every build via `npm run test:a11y`; a manual NVDA/VoiceOver + keyboard pass is done before each release.
       - "Two themes" — briefly explain the Accessible theme (high contrast, no motion, no WebGL) vs Premium, and that a first-time visitor whose OS signals reduced-motion or increased-contrast lands on the Accessible theme by default.
       - "Known issues" — an HONEST list. At minimum note: the Premium theme's 3D hero is decorative and hidden from assistive tech; blog post content contrast depends on authored markdown; and a placeholder line "No known WCAG 2.2 AA failures in the Accessible theme as of the latest verification ({DATE})." Use a real date derived from the current build date. Do NOT claim perfection beyond what the axe suite proves.
       - "Get help / report a problem" — a help contact: `<a href="mailto:emanrimawi@gmail.com">emanrimawi@gmail.com</a>` and an invitation to report barriers; note the org is a small nonprofit and will respond as able.
    2. Add a footer link: in `src/lib/components/Footer.svelte`, add `<a href="{base}/accessibility">Accessibility statement</a>` to the footer (e.g. a small secondary line under the nav list or appended to the footer nav `<ul>` as its own `<li>`). Keep the existing 44px target + `:focus-visible` outline styling. Do NOT add it to `navItems` in nav.ts (that would break shell.spec.ts's exactly-7-primary-nav assertion).
    3. Add `'/accessibility/'` to the `ROUTES` array in `e2e/a11y-axe.a11y.spec.ts` so the new page is axe-scanned in both themes.
    4. Create `e2e/accessibility-statement.a11y.spec.ts`: goto('accessibility/'); assert `page.locator('h1')` has text /accessibility statement/i; assert the page text contains "Conformance target", "Known issues", and "WCAG 2.2"; assert a `mailto:emanrimawi@gmail.com` link exists; then from Home (`./`) assert the footer contains a link with name /accessibility statement/i pointing at a `/accessibility` href.
    5. Run `npm run test:a11y` and fix any axe finding the new page surfaces (contrast, headings) until green.
  </action>
  <verify>
    <automated>npm run test:a11y -- accessibility-statement a11y-axe</automated>
  </verify>
  <acceptance_criteria>
    - `src/routes/accessibility/+page.svelte` exists
    - `grep -q "Conformance target" src/routes/accessibility/+page.svelte` succeeds
    - `grep -q "Known issues" src/routes/accessibility/+page.svelte` succeeds
    - `grep -q "WCAG 2.2" src/routes/accessibility/+page.svelte` succeeds
    - `grep -q "mailto:emanrimawi@gmail.com" src/routes/accessibility/+page.svelte` succeeds
    - `grep -q "accessibility" src/lib/components/Footer.svelte` succeeds (footer link present)
    - `grep -q "'/accessibility/'" e2e/a11y-axe.a11y.spec.ts` succeeds (added to axe scan set)
    - `grep -c "{ href:" src/lib/data/nav.ts` returns 7 (navItems still has exactly 7 entries — statement NOT added to primary nav) AND `grep -q "label: 'Home'" src/lib/data/nav.ts` succeeds (sanity: matches the real TS object-literal syntax `{ href: '/', label: 'Home' }`, not HTML-attribute syntax)
    - `npm run test:a11y -- accessibility-statement a11y-axe` exits 0 (accessibility page passes axe in both themes)
  </acceptance_criteria>
  <done>A published, honest, Scope-style accessibility statement is reachable from the footer of every page and passes WCAG 2.2 AA axe in both themes (A11Y-06).</done>
</task>

<task type="auto">
  <name>Task 2: Harden the branded 404 and extend the deployed-URL verification harness + launch checklist</name>
  <files>src/routes/+error.svelte, scripts/verify-deploy.sh, tests/deploy.smoke.spec.ts, .planning/phases/06-accessible-hardening-launch-verification/LAUNCH-CHECKLIST.md</files>
  <read_first>
    - src/routes/+error.svelte (current branded 404 markup)
    - scripts/verify-deploy.sh (existing curl matrix: root HTML, /about/ deep link, 404 fallback, _app asset 200)
    - tests/deploy.smoke.spec.ts (existing DEPLOY-01..04 Playwright smoke)
    - playwright.config.ts (live-URL config: testDir 'tests', BASE_URL default)
  </read_first>
  <action>
    1. Harden `src/routes/+error.svelte`: keep the branded title/H1/status. Ensure the 404 body is a11y-solid within the inherited layout: give the status paragraph a helpful message, and add navigation back into the site beyond just "Return home" — add links to the sitemap-critical pages (Home, About, Contact) as a small `<nav aria-label="Error page">` list of base-prefixed links (`{base}/`, `{base}/about`, `{base}/contact`). Do NOT add a second `<h1>` (there is already one) and do NOT re-declare landmarks that +layout provides. Keep it text-only (no images beyond the existing favicon).
    2. Extend `scripts/verify-deploy.sh`: after the existing checks, add (a) a deep-link check that `curl -sfI "$BASE_URL/accessibility/"` returns success (deployed statement resolves), and (b) reuse the existing `_app` asset extraction to confirm a 200. Keep `set -euo pipefail`. Keep the final `echo "ALL DEPLOY CHECKS PASSED"`.
    3. Extend `tests/deploy.smoke.spec.ts`: add ONE net-new test `DEPLOY: /accessibility/ deep-link resolves` (goto('accessibility/'), status < 400, h1 matches /accessibility statement/i). Use RELATIVE goto (no leading slash) per the existing sub-path comment. NOTE: a branded-404 smoke test already exists (`DEPLOY-03: unknown path serves our branded 404 fallback`, asserting body contains /Diversity Includes Disability/i) — do NOT add a duplicate; the existing test already covers the deployed 404.
    4. Create `.planning/phases/06-accessible-hardening-launch-verification/LAUNCH-CHECKLIST.md` — the final deployed-URL verification checklist. Include, as checkable items with the exact command/expected result for each: correct base path (`_app` assets under `/diversityincludesdisability_one/_app/`), deep links resolve (`/about/`, `/accessibility/`), `_app` assets return 200, branded 404 renders, `.nojekyll` present, `npm run test:a11y` green, `npm run test:no-three`/`test:no-shiki`/`test:no-secret` green, and the commands `BASE_URL=<live> npm run verify:deploy` and `BASE_URL=<live> npm run smoke`. State the live URL `https://wolfwdavid.github.io/diversityincludesdisability_one`.
    5. Run `npm run test:base` (sub-path harness) locally to confirm the 404 + deep-links still pass against a local sub-path build; run `npm run check` to confirm no type errors from the +error.svelte edit.
  </action>
  <verify>
    <automated>npm run check && npm run test:base</automated>
  </verify>
  <acceptance_criteria>
    - `grep -q "Error page" src/routes/+error.svelte` succeeds (added error-page nav landmark)
    - `grep -c "<h1" src/routes/+error.svelte` returns 1 (still exactly one H1)
    - `grep -q "accessibility/" scripts/verify-deploy.sh` succeeds
    - `grep -q "ALL DEPLOY CHECKS PASSED" scripts/verify-deploy.sh` succeeds (final echo preserved)
    - `grep -q "accessibility statement" tests/deploy.smoke.spec.ts` (case-insensitive) — new deep-link smoke present
    - `.planning/phases/06-accessible-hardening-launch-verification/LAUNCH-CHECKLIST.md` exists and `grep -qi "base path" LAUNCH-CHECKLIST.md` and `grep -q "verify:deploy" LAUNCH-CHECKLIST.md` succeed
    - `npm run check` exits 0 (no type errors)
    - `npm run test:base` exits 0 (sub-path deep-link + 404 harness green)
  </acceptance_criteria>
  <done>The branded 404 is a11y-hardened, the deployed-URL harness covers the statement page, and a LAUNCH-CHECKLIST.md documents the exact live verification steps.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Human live deployed-URL verification</name>
  <files>none (verification only)</files>
  <action>Manual verification only — no code changes. Commit/push, wait for the Actions deploy, then run the deployed-URL harness and walk LAUNCH-CHECKLIST.md against the live site per the how-to-verify steps below.</action>
  <what-built>Accessibility statement page (footer-linked, axe-green), hardened branded 404, and an extended deployed-URL harness + LAUNCH-CHECKLIST.md. All local automation is green before this checkpoint.</what-built>
  <read_first>
    - .planning/phases/06-accessible-hardening-launch-verification/LAUNCH-CHECKLIST.md (the exact steps/commands to run against the live URL)
  </read_first>
  <how-to-verify>
    1. Ensure the work is committed and pushed to `main` (the GitHub Actions deploy.yml rebuilds + redeploys). Wait for the Actions run to finish green.
    2. Run the automated deployed-URL harness against the LIVE site:
       `BASE_URL=https://wolfwdavid.github.io/diversityincludesdisability_one npm run verify:deploy`
       then `BASE_URL=https://wolfwdavid.github.io/diversityincludesdisability_one npm run smoke`
       Both must pass (base path correct, `/about/` and `/accessibility/` deep links resolve, `_app` asset 200, branded 404 fallback).
    3. In a browser, open the live URL. Confirm: (a) the footer "Accessibility statement" link works and the page shows conformance target + known issues + a working mailto help contact; (b) visiting a garbage path like `…/diversityincludesdisability_one/nope/` renders the branded 404 (org name + "Return home"), not GitHub's raw 404; (c) refreshing on `/accessibility/` (hard reload) still resolves.
    4. Walk the LAUNCH-CHECKLIST.md items and confirm each is satisfied on the deployed build.
  </how-to-verify>
  <resume-signal>Type "approved" if the live deployed build passes the checklist, or list the failing checklist items.</resume-signal>
</task>

</tasks>

<verification>
- `npm run test:a11y` green including `/accessibility/` (both themes).
- `npm run check` + `npm run test:base` green (404 + sub-path deep links).
- Deployed build: `verify:deploy` + `smoke` green against the live URL; branded 404 + statement live (human-verified).
</verification>

<success_criteria>
- A11Y-06 satisfied: a published, honest, Scope-style accessibility statement page is live and footer-linked.
- Success criterion #3 satisfied: deployed build verifies clean (base path, deep links, `_app` 200, branded 404) via harness + human sign-off.
</success_criteria>

<output>
After completion, create `.planning/phases/06-accessible-hardening-launch-verification/06-02-SUMMARY.md`
</output>
