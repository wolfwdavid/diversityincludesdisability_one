---
phase: 06-accessible-hardening-launch-verification
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - playwright.a11y.config.ts
  - e2e/a11y-axe.a11y.spec.ts
  - e2e/a11y-capability.a11y.spec.ts
autonomous: false
requirements: [A11Y-01]
must_haves:
  truths:
    - "Automated axe scan passes WCAG 2.2 AA (wcag22aa tags) on all 7 pages in the Accessible theme"
    - "Automated axe scan passes on all 7 pages in the Premium theme as cross-theme corroboration"
    - "The Accessible theme renders zero <canvas>/WebGL on every page"
    - "Reduced-motion is genuinely honored: Accessible --motion-duration resolves to 0, and Premium + reduced-motion shows the poster with zero canvas"
    - "A human confirms screen-reader + keyboard navigation works end-to-end across both themes"
  artifacts:
    - path: "playwright.a11y.config.ts"
      provides: "Local build+preview a11y test runner on port 4175, testMatch **/*.a11y.spec.ts"
      contains: "a11y.spec.ts"
    - path: "e2e/a11y-axe.a11y.spec.ts"
      provides: "AxeBuilder WCAG 2.2 AA scan across 7 routes x both themes"
      contains: "wcag22aa"
    - path: "e2e/a11y-capability.a11y.spec.ts"
      provides: "Reduced-motion + zero-WebGL verification in the Accessible theme"
      contains: "canvas"
    - path: "package.json"
      provides: "test:a11y script"
      contains: "test:a11y"
  key_links:
    - from: "e2e/a11y-axe.a11y.spec.ts"
      to: "localStorage did:theme"
      via: "addInitScript seeds theme before navigation, then AxeBuilder analyze"
      pattern: "did:theme"
    - from: "e2e/a11y-axe.a11y.spec.ts"
      to: "axe violations"
      via: "expect(results.violations).toEqual([])"
      pattern: "violations"
    - from: "e2e/a11y-capability.a11y.spec.ts"
      to: "canvas count"
      via: "expect(page.locator('canvas')).toHaveCount(0) in accessible theme"
      pattern: "toHaveCount\\(0\\)"
---

<objective>
Independently verify — against a real build, not by assumption — that the Accessible theme meets WCAG 2.2 AA on every page via automated axe scans, that reduced-motion and no-WebGL are genuinely honored, and corroborate the automation with a human screen-reader + keyboard walkthrough across both themes.

Purpose: Conformance is a deliverable of this phase. A11Y-01 requires an automated axe scan that passes on every page in the Accessible theme. This plan builds that gate, wires it as `npm run test:a11y`, and drives it green.
Output: `@axe-core/playwright` installed, a dedicated a11y Playwright config, an axe scan spec (7 routes x both themes, WCAG 2.2 AA tag set), a capability spec (reduced-motion + zero-WebGL), and a human-verified SR/keyboard walkthrough.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md

@playwright.theme.config.ts
@e2e/theme.spec.ts
@e2e/shell.spec.ts
@e2e/premium-hero.spec.ts
@src/lib/a11y/prefers.svelte.ts
@src/app.html

<interfaces>
<!-- Contracts the executor needs — use directly, no exploration required. -->

Theme is seeded for tests by writing localStorage BEFORE navigation (the app.html
inline script reads it before first paint):
  page.addInitScript((t) => localStorage.setItem('did:theme', t), theme);   // t: 'accessible' | 'premium'

The 7 prerendered routes (relative goto under the preview baseURL) — from src/lib/data/nav.ts:
  ['/', '/about/', '/programs/', '/get-involved/', '/events/', '/blog/', '/contact/']

Motion is a CSS token, not display:none — read it via:
  getComputedStyle(document.documentElement).getPropertyValue('--motion-duration')
  Accessible resolves to 0 (Chromium serializes as "0s"); Premium is non-zero.

Premium 3D hero canvas is decorative (aria-hidden) and mounts async only when
premium + WebGL + motion-ok + not-low-power; in Accessible there is NEVER a canvas
and NEVER a poster image (D-15).

Existing local build+preview config pattern (copy its shape) — playwright.theme.config.ts:
  testDir 'e2e', webServer 'npm run build && npm run preview -- --port 4173 --strictPort',
  baseURL 'http://localhost:4173/', projects [chromium].
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Install axe + author the WCAG 2.2 AA scan gate across 7 routes x both themes</name>
  <files>package.json, playwright.a11y.config.ts, e2e/a11y-axe.a11y.spec.ts</files>
  <read_first>
    - package.json (see existing scripts: test:theme, test:base, smoke; and devDependencies pins)
    - playwright.theme.config.ts (the local build+preview config shape to replicate)
    - e2e/premium-hero.spec.ts (the exact localStorage 'did:theme' seeding + relative goto('./') pattern)
    - src/lib/data/nav.ts (canonical route list)
    - src/app.html (confirm the inline script reads localStorage 'did:theme' before paint)
  </read_first>
  <behavior>
    - In the Accessible theme, axe (tags wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa) reports ZERO violations on each of the 7 routes.
    - In the Premium theme, axe reports ZERO violations on each of the 7 routes (loaded with waitUntil 'networkidle' so the async 3D canvas has settled).
    - Seeding localStorage 'did:theme' before navigation makes the page render in the requested theme (no flash).
    - The suite runs via `npm run test:a11y` against a local production build+preview (not the live URL).
  </behavior>
  <action>
    1. Install exact dev deps (pins from STACK.md): run `npm i -D @axe-core/playwright@4.12.1 axe-core@4.12.1`.
    2. Create `playwright.a11y.config.ts` by copying `playwright.theme.config.ts` and changing: `testMatch: '**/*.a11y.spec.ts'` (drop testIgnore), port `4175` (baseURL `http://localhost:4175/`, webServer command `npm run build && npm run preview -- --port 4175 --strictPort`, url `http://localhost:4175/`), keep `reuseExistingServer: !process.env.CI`, keep chromium project. Keep timeout 60_000.
    3. Add to package.json scripts: `"test:a11y": "playwright test --config playwright.a11y.config.ts"`.
    4. Create `e2e/a11y-axe.a11y.spec.ts`:
       - `import AxeBuilder from '@axe-core/playwright';` and `import { test, expect } from '@playwright/test';`
       - `const ROUTES = ['/', '/about/', '/programs/', '/get-involved/', '/events/', '/blog/', '/contact/'];`
       - `const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];`
       - Helper: `const seed = (page, t) => page.addInitScript((theme) => localStorage.setItem('did:theme', theme), t);`
       - For each route, a test `axe WCAG 2.2 AA passes on ${path} (accessible)`: seed(page,'accessible'); `await page.goto('.'+path)`; assert `document.documentElement.dataset.theme === 'accessible'`; run `const r = await new AxeBuilder({ page }).withTags(WCAG).analyze();` then `expect(r.violations, JSON.stringify(r.violations.map(v=>({id:v.id,nodes:v.nodes.length})),null,2)).toEqual([]);`
       - For each route, a second test `...(premium)`: seed(page,'premium'); `await page.goto('.'+path, { waitUntil: 'networkidle' });` then the same AxeBuilder assertion.
    5. Run `npm run test:a11y`. For every violation reported, fix the underlying page/component (e.g. add missing form label, raise a token contrast pair to >=4.5:1 for text / >=3:1 for large text or UI, add an aria-label, correct a role) in the relevant `src/**` file until the suite exits 0. Do NOT suppress rules or narrow the tag set to make it pass — fix the real defect. If the Premium decorative canvas produces a genuine false positive (it is aria-hidden), you may `.exclude('.hero-scene')` in the Premium loop only, with an inline comment citing D-decorative-canvas; never exclude anything in the Accessible loop.
  </action>
  <verify>
    <automated>npm run test:a11y</automated>
  </verify>
  <acceptance_criteria>
    - `grep -q '"test:a11y"' package.json` succeeds
    - `grep -q '@axe-core/playwright' package.json` succeeds
    - `playwright.a11y.config.ts` exists and `grep -q "a11y.spec.ts" playwright.a11y.config.ts` succeeds
    - `grep -q "wcag22aa" e2e/a11y-axe.a11y.spec.ts` succeeds
    - `grep -q "did:theme" e2e/a11y-axe.a11y.spec.ts` succeeds
    - `grep -q "toEqual(\[\])" e2e/a11y-axe.a11y.spec.ts` succeeds (violations asserted empty)
    - `npm run test:a11y` exits 0 (14 passing tests: 7 routes x 2 themes)
    - No `.exclude(` appears inside any `accessible` test block (grep the accessible loop)
  </acceptance_criteria>
  <done>Axe WCAG 2.2 AA scan passes with zero violations on all 7 routes in both themes; the gate is runnable as `npm run test:a11y` and exits 0.</done>
</task>

<task type="auto">
  <name>Task 2: Verify reduced-motion + zero-WebGL are genuinely honored in the Accessible theme</name>
  <files>e2e/a11y-capability.a11y.spec.ts</files>
  <read_first>
    - e2e/premium-hero.spec.ts (the localStorage seeding + reducedMotion emulateMedia + canvas/poster assertions to mirror)
    - e2e/theme.spec.ts (the getComputedStyle('--motion-duration') read pattern)
    - src/lib/a11y/prefers.svelte.ts (webglSupported + reduced-motion rune semantics)
    - src/routes/+page.svelte (Accessible renders NO poster image, D-15; Premium poster + PremiumHero gate)
  </read_first>
  <action>
    Create `e2e/a11y-capability.a11y.spec.ts` (`import { test, expect } from '@playwright/test';`):
    - `const ROUTES = ['/', '/about/', '/programs/', '/get-involved/', '/events/', '/blog/', '/contact/'];`
    - `const seed = (page, t) => page.addInitScript((theme) => localStorage.setItem('did:theme', theme), t);`
    - Test `accessible theme renders zero WebGL/canvas on every page (A11Y-01)`: for each route, seed(page,'accessible'); `await page.goto('.'+path, { waitUntil: 'networkidle' })`; `await expect(page.locator('canvas')).toHaveCount(0);` and `await expect(page.locator('.hero picture, .hero img')).toHaveCount(0);` (D-15: no poster in accessible).
    - Test `accessible theme motion duration token is 0 (A11Y-01 reduced-motion honored)`: seed(page,'accessible'); goto('./'); read `const dur = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--motion-duration').trim());` assert `expect(dur).toMatch(/^0(ms|s)?$/);`
    - Test `premium + reduced-motion shows poster, zero canvas, no three chunk (A11Y-05 corroboration)`: capture `.js` response bodies via `page.on('response', ...)`; seed(page,'premium'); `await page.emulateMedia({ reducedMotion: 'reduce' });` goto('./', { waitUntil: 'networkidle' }); `await expect(page.locator('.hero picture, .hero img').first()).toBeVisible();` `await expect(page.locator('canvas')).toHaveCount(0);` assert no captured body matches `/@threlte|THREE\.WebGLRenderer/`.
    This spec is picked up automatically by `playwright.a11y.config.ts` (testMatch **/*.a11y.spec.ts) — no config change needed.
  </action>
  <verify>
    <automated>npm run test:a11y -- a11y-capability</automated>
  </verify>
  <acceptance_criteria>
    - `e2e/a11y-capability.a11y.spec.ts` exists
    - `grep -q "toHaveCount(0)" e2e/a11y-capability.a11y.spec.ts` succeeds (zero-canvas assertion)
    - `grep -q "\-\-motion-duration" e2e/a11y-capability.a11y.spec.ts` succeeds
    - `grep -q "reducedMotion: 'reduce'" e2e/a11y-capability.a11y.spec.ts` succeeds
    - `npm run test:a11y -- a11y-capability` exits 0 (3 tests pass)
  </acceptance_criteria>
  <done>Automated proof that the Accessible theme ships zero WebGL/canvas and a 0ms motion token on every page, and that Premium under reduced-motion falls back to the poster with no three.js chunk.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Human screen-reader + keyboard walkthrough (both themes)</name>
  <files>none (verification only)</files>
  <action>Manual verification only — no code changes. Perform the how-to-verify steps below against a local build+preview across both themes; record concrete findings for any failure.</action>
  <what-built>Automated axe WCAG 2.2 AA gate (`npm run test:a11y`, 7 routes x both themes, all green) plus reduced-motion/zero-WebGL capability proofs. Automation is complete before this checkpoint.</what-built>
  <read_first>
    - e2e/a11y-axe.a11y.spec.ts (what the automation already covers, so manual testing targets what axe cannot: SR announcements, reading order, focus visibility)
  </read_first>
  <how-to-verify>
    1. Run `npm run build && npm run preview -- --port 4173` and open http://localhost:4173/ .
    2. KEYBOARD (both themes — toggle with the theme button): Tab from the top. Confirm (a) the first Tab focuses "Skip to main content" and Enter jumps focus into the page body; (b) every link, button, form field, and the theme toggle is reachable and shows a visible focus ring; (c) the mobile nav disclosure opens with Enter/Space and Escape closes it and returns focus to the toggle; (d) no keyboard trap anywhere.
    3. SCREEN READER (NVDA on Windows, or VoiceOver on macOS), Accessible theme: navigate by headings (H key) on Home, About, Programs, Contact — confirm one H1 per page and a sensible outline; navigate by landmarks — confirm banner/nav/main/contentinfo are announced; on the theme toggle confirm the pressed state and the polite "…theme enabled" announcement; on the Contact form confirm each field's label and that a submit error is announced.
    4. SCREEN READER, Premium theme, Home: confirm the 3D canvas is NOT announced (decorative/aria-hidden) and the H1 + lede + CTAs read normally.
    5. Note any issue as a concrete finding (page, element, expected vs actual).
  </how-to-verify>
  <resume-signal>Type "approved" if SR + keyboard pass on both themes, or list concrete findings to fix before resuming.</resume-signal>
</task>

</tasks>

<verification>
- `npm run test:a11y` exits 0 (axe 7 routes x 2 themes + 3 capability tests).
- Accessible theme: zero `<canvas>`, zero poster image, `--motion-duration` = 0 on every route.
- Human SR + keyboard walkthrough approved across both themes.
</verification>

<success_criteria>
- A11Y-01 satisfied: automated axe WCAG 2.2 AA scan passes on every page in the Accessible theme.
- Cross-theme corroboration (Premium axe green) + human SR/keyboard sign-off recorded.
</success_criteria>

<output>
After completion, create `.planning/phases/06-accessible-hardening-launch-verification/06-01-SUMMARY.md`
</output>
