---
phase: 04-forms-donate
plan: 02
type: execute
wave: 2
depends_on: ["04-01"]
files_modified:
  - src/routes/get-involved/+page.svelte
  - scripts/assert-no-secret.mjs
  - package.json
  - e2e/forms.spec.ts
autonomous: true
requirements: [FORM-04]

must_haves:
  truths:
    - "The donate action is a clearly-labeled external link (rel=noopener noreferrer) to the org's platform, never an embedded checkout"
    - "The donate URL and platform name are read from the single config source, not hardcoded on the page"
    - "The link warns it opens externally / leaves the site (new-tab cue + privacy note)"
    - "A static scan fails the build if a real-looking Web3Forms key is ever committed, and confirms rel=noopener is present"
  artifacts:
    - path: "src/routes/get-involved/+page.svelte"
      provides: "Config-driven external donate link with new-tab cue + privacy note"
      contains: "rel=\"noopener noreferrer\""
    - path: "scripts/assert-no-secret.mjs"
      provides: "Static hygiene scan (no committed key, placeholder present, rel=noopener present)"
      min_lines: 25
    - path: "package.json"
      provides: "test:no-secret npm script"
      contains: "test:no-secret"
  key_links:
    - from: "src/routes/get-involved/+page.svelte"
      to: "src/lib/config.ts"
      via: "imports DONATE_URL + DONATE_PLATFORM_NAME"
      pattern: "DONATE_URL"
    - from: "scripts/assert-no-secret.mjs"
      to: "src/ and build/"
      via: "walks files asserting no UUID-shaped access key"
      pattern: "UUID"
---

<objective>
Turn the Phase-3 donate PLACEHOLDER on /get-involved into a real, config-driven, clearly-labeled EXTERNAL link-out (never an embedded checkout), and add a static secret-hygiene gate that fails if a real Web3Forms key is ever committed and asserts the donate link keeps rel=noopener.

Purpose: Deliver FORM-04 (donate is a labeled external link-out with rel="noopener") and lock in the no-committed-secret constraint for a 501c3-pending org.
Output: Wired donate anchor reading from config.ts, a donate E2E assertion, and scripts/assert-no-secret.mjs wired as `npm run test:no-secret`.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/phases/04-forms-donate/04-RESEARCH.md

# Source-of-truth files
@src/routes/get-involved/+page.svelte
@src/lib/config.ts
@scripts/assert-no-shiki-chunk.mjs
@package.json

<interfaces>
<!-- CONSUMES config.ts created by 04-01 (do not redefine it here). -->

src/lib/config.ts (from 04-01):
```typescript
export const DONATE_URL: string;           // placeholder 'https://example.org/donate-TODO'
export const DONATE_PLATFORM_NAME: string; // placeholder 'our giving platform'
```

Project conventions:
- `.sr-only` and `.button` utilities already exist in src/lib/styles/app.css (reuse for the new-tab cue + button styling).
- Existing scan mirror: scripts/assert-no-shiki-chunk.mjs (walk build/, exit 1 on match, wired as npm script `test:no-shiki`).
- E2E: e2e/forms.spec.ts already exists (created in 04-01); append the donate test.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Config-driven external donate link-out + donate E2E</name>
  <files>src/routes/get-involved/+page.svelte, e2e/forms.spec.ts</files>
  <read_first>
    - src/routes/get-involved/+page.svelte (EXISTING donate section with href="#" placeholder + the volunteer form added in 04-01 — do NOT touch the volunteer form)
    - src/lib/config.ts (DONATE_URL, DONATE_PLATFORM_NAME — from 04-01)
    - .planning/phases/04-forms-donate/04-RESEARCH.md (Pattern 5 — donate link-out; Pitfall 4 new-tab cue)
    - src/lib/styles/app.css (`.sr-only`, `.button` already defined)
  </read_first>
  <action>
**A. Update src/routes/get-involved/+page.svelte donate section.** Add the config import to the existing `<script>` block:
```typescript
import { DONATE_URL, DONATE_PLATFORM_NAME } from '$lib/config';
```

Replace the placeholder donate `<section aria-labelledby="donate">` body (the part with `href="#"`, the `svelte-ignore a11y_invalid_attribute`, and the "Donation link is a placeholder" disclaimer) with the config-driven external link-out below. Keep the `<h2 id="donate">Donate</h2>` heading:
```svelte
<section aria-labelledby="donate">
  <h2 id="donate">Donate</h2>
  <p>Support our work directly. Donations are handled securely on {DONATE_PLATFORM_NAME}, an external platform.</p>
  <p>
    <a class="button" href={DONATE_URL} target="_blank" rel="noopener noreferrer">
      Donate on {DONATE_PLATFORM_NAME}<span class="sr-only"> (opens in a new tab)</span>
    </a>
  </p>
  <p class="disclaimer">
    Clicking this link leaves our site; {DONATE_PLATFORM_NAME}'s own privacy policy applies. We never process payments on this site.
  </p>
</section>
```
Notes:
- `rel="noopener noreferrer"` is MANDATORY with `target="_blank"` (declare explicitly — security + WCAG).
- The `.sr-only` "opens in a new tab" cue satisfies WCAG 3.2.5 (predictable context change).
- `DONATE_URL` is an absolute external URL, so it needs NO `base` prefix (unlike internal links).
- Do NOT embed any iframe/checkout widget — external link ONLY (FORM-04, out-of-scope payments).

**B. Append to e2e/forms.spec.ts:**
```typescript
test('donate: external link reads config URL, is labeled, and is safe (FORM-04)', async ({ page }) => {
  await page.goto('./get-involved/');
  const link = page.getByRole('link', { name: /donate on/i });
  await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(link).toHaveAttribute('target', '_blank');
  const href = await link.getAttribute('href');
  expect(href).toMatch(/^https?:\/\//);          // absolute external URL, not '#'
  expect(href).not.toBe('#');
  // No embedded checkout/iframe on the page.
  await expect(page.locator('iframe')).toHaveCount(0);
});
```
  </action>
  <verify>
    <automated>npx playwright test --config playwright.theme.config.ts e2e/forms.spec.ts -g "donate"</automated>
  </verify>
  <acceptance_criteria>
    - `src/routes/get-involved/+page.svelte` imports `DONATE_URL` + `DONATE_PLATFORM_NAME` from `$lib/config` and the donate anchor uses `href={DONATE_URL}` (grep — no literal `href="#"` remains in the donate section).
    - The donate anchor has `rel="noopener noreferrer"` and a `.sr-only` "opens in a new tab" cue (grep).
    - No `<iframe` on the page (grep + E2E `toHaveCount(0)`).
    - The donate E2E test passes.
  </acceptance_criteria>
  <done>Donate is a clearly-labeled, config-driven external link-out with new-tab cue and privacy note — never an embedded checkout.</done>
</task>

<task type="auto">
  <name>Task 2: Static secret-hygiene scan wired as an npm script</name>
  <files>scripts/assert-no-secret.mjs, package.json</files>
  <read_first>
    - scripts/assert-no-shiki-chunk.mjs (mirror this style — walk dir, collect hits, exit 1 with message)
    - src/lib/config.ts (asserts the placeholder + TODO are present)
    - src/routes/get-involved/+page.svelte (asserts rel="noopener noreferrer" present — from Task 1)
    - package.json (scripts block — add test:no-secret next to test:no-shiki)
  </read_first>
  <action>
**A. Create scripts/assert-no-secret.mjs** (mirrors assert-no-shiki-chunk.mjs). It (1) fails if any UUID-shaped Web3Forms access key is committed in `src/` or built into `build/`, (2) asserts config.ts keeps the committed placeholder + a TODO marker, (3) asserts the donate link keeps `rel="noopener noreferrer"`:
```javascript
// scripts/assert-no-secret.mjs
// FORM-04 + secret-hygiene gate (org is 501c3-pending — no committed credentials).
//  1. No real-looking Web3Forms access key (UUID shape) in src/ or build/.
//  2. config.ts keeps the committed PUBLIC placeholder + a TODO marker.
//  3. The donate link keeps rel="noopener noreferrer".
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
const errors = [];

function walk(dir, exts) {
  let files = [];
  if (!existsSync(dir)) return files;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) files = files.concat(walk(p, exts));
    else if (exts.some((e) => p.endsWith(e))) files.push(p);
  }
  return files;
}

// 1. No UUID-shaped access key anywhere in source or build output.
for (const dir of ['src', 'build']) {
  for (const file of walk(dir, ['.ts', '.js', '.svelte', '.html'])) {
    if (UUID_RE.test(readFileSync(file, 'utf8'))) {
      errors.push(`Possible real access key (UUID shape) committed in ${file}`);
    }
  }
}

// 2. config.ts keeps the committed placeholder + a TODO marker.
const cfg = existsSync('src/lib/config.ts') ? readFileSync('src/lib/config.ts', 'utf8') : '';
if (!cfg.includes('WEB3FORMS_ACCESS_KEY')) errors.push('config.ts missing WEB3FORMS_ACCESS_KEY export');
if (!cfg.includes('YOUR_WEB3FORMS_ACCESS_KEY')) errors.push('config.ts missing the placeholder key value');
if (!/TODO/.test(cfg)) errors.push('config.ts missing a TODO marker');

// 3. Donate link keeps rel="noopener noreferrer".
const gi = existsSync('src/routes/get-involved/+page.svelte')
  ? readFileSync('src/routes/get-involved/+page.svelte', 'utf8')
  : '';
if (!/rel="noopener noreferrer"/.test(gi)) {
  errors.push('get-involved donate link missing rel="noopener noreferrer"');
}

if (errors.length) {
  console.error('FORM-04 / secret-hygiene FAILED:\n' + errors.join('\n'));
  process.exit(1);
}
console.log('FORM-04 / secret-hygiene OK — no committed key, placeholder present, rel=noopener present.');
```

**B. Wire the npm script.** In package.json `scripts`, add next to `"test:no-shiki"`:
```json
"test:no-secret": "node scripts/assert-no-secret.mjs"
```
  </action>
  <verify>
    <automated>npm run build && npm run test:no-secret</automated>
  </verify>
  <acceptance_criteria>
    - `scripts/assert-no-secret.mjs` exists and contains `UUID_RE`, walks both `src` and `build`, and checks `rel="noopener noreferrer"` (grep).
    - `package.json` scripts contains `"test:no-secret": "node scripts/assert-no-secret.mjs"` (grep).
    - `npm run build` exits 0, then `npm run test:no-secret` exits 0 and prints the OK line.
    - Manual sanity (executor may spot-check): temporarily inserting a UUID into config.ts makes the script exit non-zero (then revert).
  </acceptance_criteria>
  <done>A committed-secret regression fails the build, and the donate link's rel=noopener is asserted — the no-secret constraint is enforced by an automated gate.</done>
</task>

</tasks>

<verification>
- `npm run build` exits 0.
- `npm run test:no-secret` exits 0.
- `npx playwright test --config playwright.theme.config.ts e2e/forms.spec.ts` green including the donate test.
- `e2e/shell.spec.ts` still green (single-h1 + landmarks preserved on /get-involved).
- No new npm dependencies; config.ts is the only source of the donate URL.
</verification>

<success_criteria>
- FORM-04: Donate is a clearly-labeled external link-out (`rel="noopener noreferrer"`, `target="_blank"` + new-tab cue), reads DONATE_URL from the single config source, carries a privacy note, and is never an embedded checkout — proven by E2E (rel/target/href/no-iframe).
- Secret hygiene: an automated scan fails if a real-looking access key is committed and confirms rel=noopener — wired as `npm run test:no-secret`.
</success_criteria>

<output>
After completion, create `.planning/phases/04-forms-donate/04-02-SUMMARY.md`
</output>
