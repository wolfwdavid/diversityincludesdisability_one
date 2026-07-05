# Phase 4: Forms & Donate - Research

**Researched:** 2026-07-05
**Domain:** Static-host form submission (Web3Forms) + accessible form UX (WCAG 2.2) in SvelteKit runes-mode on GitHub Pages
**Confidence:** HIGH (stack + API + a11y patterns verified against official sources; free-tier limits verified current 2026)

## Summary

Phase 4 wires the existing Phase-3 accessible contact **scaffold** to a real static-host backend and adds a second (volunteer) form plus a safe donate link-out — all with **no server, no committed secrets, and no embedded checkout**. The backend is **Web3Forms**: a client-side `fetch` POST to `https://api.web3forms.com/submit` carrying a **public** `access_key`. This is fully static-host compatible (designed for JAMstack/GitHub Pages), needs zero npm dependencies (native `fetch`), and its access key is public-by-design (an alias to the org's email), so it is safe to embed — but per the user decision it must live in **one swappable config value**, never scattered literals.

The hard part is **FORM-03 (accessibility)**: on submit we must (a) client-side-validate required fields and expose errors via `aria-describedby` + `aria-invalid`, (b) move focus to the first invalid field on error and to a focus-managed success confirmation on success, (c) reflect in-flight state without stranding focus, and (d) keep everything keyboard-operable and screen-reader-announced (WCAG 3.3.1 Error Identification, 3.3.3 Error Suggestion, 4.1.3 Status Messages, 3.3.2 Labels/Instructions). The existing scaffold already has the label/`for`, `aria-describedby` slots, and a `mailto` fallback — we **extend** it, not replace it, but we do refine the redundant `role="alert" + aria-live="polite"` combo and add `aria-invalid`.

**Primary recommendation:** Keep Web3Forms (roadmap is correct — 250 submissions/mo free vs Formspree's 50/mo, no per-submission verification click, access-key model is simpler than an endpoint dashboard). Build a shared `submitToWeb3Forms()` helper + a shared validation util + a shared `FormStatus` region, composed by two thin page-level forms (contact on `/contact`, volunteer on `/get-involved`). Donate stays a config-driven external `<a rel="noopener noreferrer">`. Test entirely with Playwright `page.route()` mocking of `api.web3forms.com/submit` (success + error + network-fail) plus a Vitest unit test on the validation util and a build/source grep asserting no real key is committed and `rel="noopener"` is present.

<user_constraints>
## User Constraints

> No `CONTEXT.md` exists for this phase (no `/gsd:discuss-phase` was run). These constraints are lifted verbatim from the orchestrator's task brief and the roadmap-prescribed plans. Planner MUST honor them.

### Locked Decisions
- **Build with placeholders.** The real Web3Forms access key and the real donation URL are **swapped in later by the user**. Design so both are **single-source swappable values** (e.g. a `src/lib/config.ts` or `PUBLIC_` env var) with a clearly-`TODO`'d placeholder — **never hardcoded across files**.
- The Web3Forms access key is a **PUBLIC client-side key** (safe to embed by design) — but still keep it swappable and out of scattered literals.
- **No server, no embedded checkout, no committed secrets.** GitHub Pages is a static host (from REQUIREMENTS.md Out of Scope: no SSR/backend APIs, no on-site payment processing, no committed credentials — org is 501c3-pending).
- Backend is **Web3Forms** (roadmap 04-01 prescribes it) — endpoint/access-key IDs only.
- Donate is a **clearly-labeled external link-out** (`rel="noopener noreferrer"`) to the org's existing platform — **never** an embedded checkout (FORM-04).
- **Extend** the existing Phase-3 contact scaffold's accessibility patterns rather than replacing them.

### Claude's Discretion
- Config mechanism: `src/lib/config.ts` vs `$env/static/public` `PUBLIC_` var (recommendation below: `config.ts`).
- Shared reusable form component/helper vs two separate forms (recommendation below: shared helper + shared status component, two thin page forms).
- Where the volunteer form lives: a `/get-involved` section vs its own route (recommendation below: section on `/get-involved`).
- Spam mitigation choice: honeypot-only vs hCaptcha (recommendation below: **honeypot-only** for accessibility).
- Which real donation platform the user will later choose (research notes options; stays a placeholder now).

### Deferred Ideas (OUT OF SCOPE)
- Newsletter signup (v2 NEWS-01).
- Any server-side/serverless form handling, Netlify/Vercel/Cloudflare Forms (host-specific, do nothing on Pages).
- Submissions dashboard / CRM integration.
- Real donation-platform account setup (user does the URL swap later).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| **FORM-01** | Contact form submits via a static-host-compatible backend (Web3Forms) with clear success/error states | Web3Forms `fetch` POST pattern (below), success/error response handling, `FormStatus` region |
| **FORM-02** | Volunteer / get-involved form submits and confirms | Same shared `submitToWeb3Forms()` engine; form lives as a section on `/get-involved`; focus-managed confirmation |
| **FORM-03** | Forms are fully accessible (associated labels, errors announced, keyboard-navigable) | Accessible submit→result pattern (WCAG 3.3.1/3.3.3/4.1.3/3.3.2); extends existing scaffold; focus management + `aria-invalid` + status region |
| **FORM-04** | Donate is a clearly-labeled external link-out (`rel="noopener"`), never an embedded checkout | Config-driven `DONATE_URL`, `rel="noopener noreferrer"`, privacy note, new-tab a11y cue |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Native `fetch` | Platform | POST to Web3Forms | Zero new deps; SvelteKit runs client-side after hydration; the whole point of a static-host form service |
| Web3Forms | Access-key API (service, not npm) | Contact/volunteer backend | Purpose-built for static/JAMstack sites; public access key; 250 submissions/mo free; honeypot built in; works from GitHub Pages |
| Svelte 5 runes (`$state`, `$derived`) | `^5.56.1` (installed) | Form state, in-flight/error/success flags | Already the project's reactivity model |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@playwright/test` | `^1.61.1` (installed) | E2E: submit success/error + focus + aria, via route-mocking | The FORM-01/02/03 verification backbone |
| `vitest` | `^4.1.9` (installed) | Unit test the extracted validation util | If validation logic is extracted to `$lib/forms/validation.ts` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| **Web3Forms** | Formspree (free) | **Formspree free = 50 submissions/mo/form vs Web3Forms 250/mo** (verified 2026). Formspree also historically requires an endpoint-confirmation email and shows branding; Web3Forms' access-key model needs no dashboard account. Formspree wins only if warmed-IP deliverability is a hard requirement — not the case here. **Recommendation: stay on Web3Forms** (roadmap confirmed). |
| honeypot-only spam | hCaptcha (`data-captcha`) | CAPTCHAs impose a real accessibility cost (cognitive/visual/audio challenges) on a disability-advocacy site. **Use honeypot `botcheck` only.** Web3Forms also runs a server-side spam check automatically. Keep hCaptcha as a documented escalation if spam becomes a problem. |
| `src/lib/config.ts` | `$env/static/public` `PUBLIC_WEB3FORMS_KEY` | `$env/static/public` inlines a build-time value from `.env` (gitignored) — good for "keep it out of git," but the placeholder can't be committed and a missing var fails the build. Since the key is **public by design**, a committed `config.ts` with a visible `TODO` placeholder is the simpler single source and satisfies the swappable-later requirement. **Recommendation: `config.ts`.** |
| Two separate full forms | One over-generic `<Form>` component | Contact and volunteer have **different field sets**, so a single generic component with slotted fields over-abstracts. Extract the *shared behavior* (submit + validation + status) and keep two thin page forms. |

**Installation:** None. Zero new npm packages. (Native `fetch`; Web3Forms is a hosted service.)

## Architecture Patterns

### Recommended Structure (additive)
```
src/lib/
├── config.ts                 # NEW: single source — WEB3FORMS_ACCESS_KEY (placeholder), DONATE_URL (placeholder), DONATE_PLATFORM_NAME
├── forms/
│   ├── submit.ts             # NEW: submitToWeb3Forms(payload) → {ok, message}; wraps fetch + error normalization
│   └── validation.ts         # NEW: pure validateContact()/validateVolunteer() → {field: errorMessage} (unit-testable)
└── components/
    └── FormStatus.svelte      # NEW: focus-managed success/error region (role=status / role=alert, tabindex=-1)

src/routes/
├── contact/+page.svelte       # EXTEND scaffold: wire onsubmit → validate → submit → status
└── get-involved/+page.svelte  # EXTEND: add volunteer <form> section (same engine); keep donate link-out
```

### Pattern 1: Web3Forms client-side submit (FORM-01)
**What:** POST JSON to the fixed endpoint with the public `access_key`.
**When:** In the form's `onsubmit` after client-side validation passes.
```typescript
// Source: https://docs.web3forms.com (llms-full.txt), verified 2026-07-05
// $lib/forms/submit.ts
import { WEB3FORMS_ACCESS_KEY } from '$lib/config';

export async function submitToWeb3Forms(
  fields: Record<string, string>
): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ access_key: WEB3FORMS_ACCESS_KEY, ...fields })
    });
    const json = await res.json().catch(() => ({}));
    // Robust: check BOTH HTTP status and the success flag Web3Forms returns.
    const ok = res.ok && json.success !== false;
    return { ok, message: json.message ?? (ok ? 'Sent.' : 'Something went wrong.') };
  } catch {
    // Network failure / offline → distinct, actionable message + mailto fallback in UI.
    return { ok: false, message: 'Network error — please email us directly instead.' };
  }
}
```
- **Endpoint:** `https://api.web3forms.com/submit` (HIGH — official).
- **Body:** JSON is simplest (no file uploads here). `Content-Type: application/json` + `Accept: application/json`. FormData is only needed for file attachments — not required for these forms.
- **Required field:** `access_key` in every request (HIGH).
- **Response:** HTTP 200 + `{ message, success, data }`. `message` is HIGH confidence; the `success` boolean is MEDIUM (documented broadly but not in the minimal fetch example) — hence the belt-and-suspenders `res.ok && json.success !== false` check.
- **CORS / static host:** Web3Forms is purpose-built for static/JAMstack sites and submits directly from the browser — works from GitHub Pages with **no server** (HIGH by design; CORS handled by the service).

### Pattern 2: Honeypot spam field (accessible, server-free)
**What:** A hidden `botcheck` checkbox; bots tick it, real (and SR) users never see it.
```html
<!-- Source: https://docs.web3forms.com spam-protection, verified 2026-07-05 -->
<input type="checkbox" name="botcheck" style="display:none" tabindex="-1" aria-hidden="true" />
```
- `display:none` removes it from the a11y tree and tab order; add `tabindex="-1" aria-hidden="true"` belt-and-suspenders so no SR/keyboard user ever lands on it. **No CAPTCHA** — preserves accessibility.

### Pattern 3: Accessible submit → result (FORM-03, the hard part)
**What:** Validate → announce → focus → submit → confirm, all keyboard + SR friendly.
```typescript
// Pattern (pseudocode for the page component):
// state: errors = $state<Record<string,string>>({}); status = $state<'idle'|'sending'|'ok'|'err'>('idle');
async function onsubmit(e: SubmitEvent) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.currentTarget as HTMLFormElement));
  errors = validateContact(data);                 // pure fn → { email: 'Enter a valid email', ... }
  if (Object.keys(errors).length) {
    // WCAG 3.3.1 + 2.4.3: focus the FIRST invalid field so its aria-describedby error is read.
    const first = document.getElementById(`c-${Object.keys(errors)[0]}`);
    first?.focus();
    return;
  }
  status = 'sending';                              // 4.1.3: status region announces "Sending…"; button → aria-busy
  const { ok, message } = await submitToWeb3Forms(data as Record<string,string>);
  status = ok ? 'ok' : 'err';
  // On success: render confirmation, move focus to it (tabindex=-1) AND role=status announces (covers all SRs).
}
```
**Rules to encode:**
1. **Labels (3.3.2):** already present (`<label for>`), keep. Add `autocomplete` (present) for 1.3.5.
2. **Field errors (3.3.1/3.3.3):** each field gets `aria-invalid={!!errors.x}` and `aria-describedby="c-x-error"`; the error `<p id="c-x-error">` shows text (message includes a *suggestion*, e.g. "Enter a valid email like name@example.com" for 3.3.3).
3. **Refine the scaffold:** the scaffold currently sets **both** `role="alert"` and `aria-live="polite"` on every field error slot. `role="alert"` already implies `aria-live="assertive"` — the combo is contradictory and, on all fields at once, noisy. **Recommendation:** drop per-field `role="alert"`; rely on `aria-describedby` + moving focus to the first invalid field for announcement. Reserve one **form-level** live region (`FormStatus`) for submit outcome. (Optional gold-standard enhancement: a GOV.UK-style error-summary box at the top with `role="alert"` + `tabindex="-1"` that receives focus and links to each field — good if forms grow, optional for these short forms.)
4. **Focus on error:** move focus to the first invalid field (WCAG 2.4.3 focus order; ensures the description is spoken).
5. **In-flight (4.1.3):** set `aria-busy="true"` on the form and update `FormStatus` to "Sending your message…"; the button label becomes "Sending…". If you `disabled` the button, do it **after** focus has left it (submit already fired) — safest is to keep it enabled but guard re-entry, or set `aria-disabled`. Requests are fast; disabling is acceptable but note the focus caveat.
6. **Success (4.1.3):** render a confirmation with `role="status"` (polite) **and** programmatically focus it (`tabindex="-1"`) — belt-and-suspenders so both live-region-reading and focus-following screen readers announce it. Consider replacing the form with the confirmation to prevent double-submit.
7. **Error outcome:** `FormStatus` uses `role="alert"` (assertive) for the failure message + keep the `mailto:` fallback visible.

### Pattern 4: `FormStatus.svelte` (shared, focus-managed)
```svelte
<!-- role switches: 'status' (polite) for success/sending, 'alert' (assertive) for error -->
<script lang="ts">
  let { kind, message }: { kind: 'ok' | 'err' | 'sending'; message: string } = $props();
  let el = $state<HTMLElement>();
  $effect(() => { if (kind === 'ok' || kind === 'err') el?.focus(); });
</script>
<p bind:this={el} tabindex="-1" role={kind === 'err' ? 'alert' : 'status'}
   aria-live={kind === 'err' ? 'assertive' : 'polite'} class="form-status {kind}">
  {message}
</p>
```

### Pattern 5: Config-driven donate link-out (FORM-04)
```svelte
<!-- Source: MDN rel=noopener; existing get-involved scaffold -->
<script>import { DONATE_URL, DONATE_PLATFORM_NAME } from '$lib/config';</script>
<a class="button" href={DONATE_URL} target="_blank" rel="noopener noreferrer">
  Donate on {DONATE_PLATFORM_NAME}<span class="sr-only"> (opens in a new tab)</span>
</a>
<p class="disclaimer">Donations are handled by {DONATE_PLATFORM_NAME}, an external platform. Clicking leaves this site; their privacy policy applies.</p>
```
- `rel="noopener noreferrer"` is **mandatory** with `target="_blank"` (prevents `window.opener` hijack + strips referrer). `noopener` is default in modern browsers but declare it explicitly (WCAG/security).
- Include a visually-hidden "opens in a new tab" cue (WCAG 3.2.5 predictable) if using `target="_blank"`; if the org prefers same-tab, drop `target` and the cue.
- `DONATE_URL` placeholder e.g. `'https://example.org/donate-TODO'` with a `// TODO(user): real giving-platform URL` comment.

### `config.ts` shape
```typescript
// src/lib/config.ts — SINGLE SOURCE for user-swappable values.
// TODO(user): replace both placeholders before launch. The access key is PUBLIC (safe to commit).
export const WEB3FORMS_ACCESS_KEY = 'YOUR_WEB3FORMS_ACCESS_KEY'; // https://web3forms.com → email → key
export const DONATE_URL = 'https://example.org/donate-TODO';
export const DONATE_PLATFORM_NAME = 'our giving platform';
```

### Anti-Patterns to Avoid
- **`+page.server.ts` / form actions / API routes** — no server on Pages; they silently don't run. Client `fetch` only.
- **Scattered access-key literals** — violates the locked single-source decision.
- **CAPTCHA by default** — a11y cost on a disability-advocacy site; honeypot first.
- **`role="alert"` on every field simultaneously** — noisy/contradictory with `aria-live="polite"`; use focus + `aria-describedby`, one form-level status region.
- **Disabling the submit button while it still holds focus** — can strand SR focus; disable only after submit fires or use `aria-disabled`.
- **Embedded checkout/iframe for donations** — explicitly out of scope (PCI/no-server); link out only.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form email delivery | Own SMTP / serverless relay | Web3Forms | No server exists; deliverability, spam filtering, storage handled |
| Spam filtering | Custom regex/rate-limit | `botcheck` honeypot + Web3Forms server-side check | No server for rate-limiting; honeypot is free + accessible |
| Email validation | Elaborate regex | Minimal shape check + `type="email"` + let Web3Forms/real email bounce | Over-strict regex rejects valid addresses; native type + light check is enough |
| New-tab safety | — | `rel="noopener noreferrer"` | One attribute vs a `window.opener` vulnerability |

**Key insight:** On a static host the entire "backend" is a third-party POST. The only code we own is validation + accessible UX + the swappable config — keep that surface minimal.

## Common Pitfalls

### Pitfall 1: Focus lost after submit → SR users don't know what happened
**What goes wrong:** Form submits, DOM updates, but focus stays on a now-disabled button or vanished form; SR announces nothing.
**Why:** Live regions alone don't always fire if the node is inserted+focused inconsistently across SRs.
**How to avoid:** Dual path — `role="status"`/`role="alert"` live region **and** programmatic `focus()` on a `tabindex="-1"` confirmation. Verify in the Playwright test that the success node is `toBeFocused()`.
**Warning signs:** Success only visible, never announced.

### Pitfall 2: `success` boolean assumed but only `message` guaranteed
**What goes wrong:** Checking `json.success` alone may misread outcomes if the field is absent.
**How to avoid:** `res.ok && json.success !== false` (treats 200 as success unless explicitly flagged false).

### Pitfall 3: 250/mo free cap hit silently
**What goes wrong:** Beyond 250 submissions/mo, Web3Forms may reject; UI must show the error, not a false success.
**How to avoid:** Always branch on the response; keep the `mailto:` fallback visible on error. Note the cap for the org (unlikely for a small nonprofit, but real).

### Pitfall 4: Donate `target="_blank"` without a new-tab cue
**What goes wrong:** Context switch with no warning (WCAG 3.2.5).
**How to avoid:** Visually-hidden "(opens in a new tab)" or use same-tab.

### Pitfall 5: Base-path breakage on internal links
**What goes wrong:** Hardcoded `/contact` breaks under the `/diversityincludesdisability_one` sub-path.
**How to avoid:** Existing convention — `import { base } from '$app/paths'` and `{base}/...`. External donate URL is absolute, so unaffected.

## Runtime State Inventory

> Not a rename/refactor phase — greenfield feature wiring. This section is included only to explicitly confirm no hidden runtime state is involved.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — no DB; submissions live only in Web3Forms' 30-day storage (external). | None |
| Live service config | Web3Forms access key + donation URL — but these are **committed placeholders** the user swaps later, not hidden UI state. | User swaps 2 values in `config.ts` |
| OS-registered state | None. | None |
| Secrets/env vars | Access key is **public by design** (safe to commit); **no real secret exists to leak**. Verified: docs state "not a secret API key… safe to use in client-side code." | None — but grep test asserts no *other* key/token committed |
| Build artifacts | Static `build/` output will inline `config.ts` values; a stale build could carry an old placeholder. | Rebuild on swap (CI already redeploys on push) |

## Code Examples

### Playwright: mock success + assert focus/announcement (FORM-01/03)
```typescript
// Source: https://playwright.dev/docs/mock — page.route()
// e2e/forms.spec.ts  (run via `npm run test:e2e` — playwright.theme.config.ts, local build+preview)
import { test, expect } from '@playwright/test';

test('contact form: success is announced and focus-managed (FORM-01/03)', async ({ page }) => {
  await page.route('**/api.web3forms.com/submit', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Email sent successfully!' }) })
  );
  await page.goto('./contact/');
  await page.getByLabel('Name').fill('Ada');
  await page.getByLabel('Email').fill('ada@example.com');
  await page.getByLabel('Message').fill('Hello');
  await page.getByRole('button', { name: /send message/i }).click();
  const status = page.locator('.form-status.ok');
  await expect(status).toBeVisible();
  await expect(status).toBeFocused();               // dual-path a11y proof
});
```

### Playwright: mock server error + network failure (FORM-01)
```typescript
test('contact form: server error shows alert + mailto fallback', async ({ page }) => {
  await page.route('**/api.web3forms.com/submit', (route) =>
    route.fulfill({ status: 400, contentType: 'application/json',
      body: JSON.stringify({ success: false, message: 'Bad request' }) }));
  // ...fill + submit...
  await expect(page.locator('.form-status.err')).toHaveAttribute('role', 'alert');
});

test('contact form: network failure is handled', async ({ page }) => {
  await page.route('**/api.web3forms.com/submit', (route) => route.abort('failed'));
  // ...fill + submit... assert distinct network-error message
});
```

### Playwright: validation blocks submit + focuses first invalid (FORM-03)
```typescript
test('empty submit shows errors and focuses first invalid field (FORM-03)', async ({ page }) => {
  let hit = false;
  await page.route('**/api.web3forms.com/submit', (r) => { hit = true; r.abort(); });
  await page.goto('./contact/');
  await page.getByRole('button', { name: /send message/i }).click();
  await expect(page.getByLabel('Name')).toBeFocused();        // first invalid focused
  await expect(page.getByLabel('Name')).toHaveAttribute('aria-invalid', 'true');
  expect(hit).toBe(false);                                     // never hit the network
});
```

### Vitest: pure validation util
```typescript
// src/lib/forms/validation.test.ts
import { describe, it, expect } from 'vitest';
import { validateContact } from './validation';
describe('validateContact', () => {
  it('flags missing name/email/message', () => {
    expect(Object.keys(validateContact({}))).toEqual(['name', 'email', 'message']);
  });
  it('rejects a malformed email with a suggestion', () => {
    expect(validateContact({ name: 'A', email: 'nope', message: 'x' }).email).toMatch(/valid email/i);
  });
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Server/CGI mail script | Client POST to hosted form API (Web3Forms/Formspree) | Static-site era | No server needed on Pages |
| CAPTCHA-by-default | Honeypot-first, CAPTCHA only if abused | a11y-aware consensus | No a11y tax for most sites |
| `target="_blank"` alone | Always `rel="noopener noreferrer"` | ~2021+ browser defaults | Security default, still declared explicitly |
| Formspree free 100/mo (older) | Formspree free **50/mo** vs Web3Forms **250/mo** | 2026 verified | Web3Forms materially more generous |

**Deprecated/outdated:** SvelteKit form *actions* and `+page.server.ts` — valid on a Node host, **inert on GitHub Pages**; do not use here.

## Open Questions

1. **Exact Web3Forms success JSON shape**
   - Known: HTTP 200 + `message` (HIGH); `success: true` present per broader docs (MEDIUM).
   - Handled: code checks `res.ok && json.success !== false`, robust either way.
2. **Which donation platform the org will use**
   - Known: Common nonprofit choices — **Givebutter** (free, nonprofit-focused), **Donorbox**, **PayPal Giving Fund**, **Every.org**. Some require confirmed 501c3 status (org is 501c3-**pending**), so PayPal-personal/Givebutter may be the interim path.
   - Handled: stays a placeholder `DONATE_URL`; user swaps later. No decision needed to build.
3. **Volunteer form field set (FORM-02)**
   - Unclear: exact fields (interests? availability?).
   - Recommendation: name, email, message/"how you'd like to help" as a safe default; mark copy as authored-placeholder (consistent with Phase-3 sign-off flagging).

## Validation Architecture

> `workflow.nyquist_validation: true` — section included.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright `^1.61.1` (E2E) + Vitest `^4.1.9` (unit) — both installed |
| Config file | `playwright.theme.config.ts` (local build+preview, `testDir: e2e`, ignores `*.base.spec.ts`) — **reuse, no new config**; `vitest run` for units |
| Quick run command | `npx playwright test --config playwright.theme.config.ts e2e/forms.spec.ts` |
| Full suite command | `npm run test:e2e && npm run test:unit` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FORM-01 | Submit success → confirmation (mocked 200) | e2e | `npx playwright test --config playwright.theme.config.ts e2e/forms.spec.ts -g "success"` | ❌ Wave 0 |
| FORM-01 | Submit server-error (mocked 400) + network-fail (abort) → error + mailto | e2e | `... -g "error\|network"` | ❌ Wave 0 |
| FORM-02 | Volunteer form on `/get-involved` submits + confirms (mocked) | e2e | `... -g "volunteer"` | ❌ Wave 0 |
| FORM-03 | Empty submit → errors, `aria-invalid`, focus first invalid, no network hit | e2e | `... -g "validation\|invalid"` | ❌ Wave 0 |
| FORM-03 | Success region is `toBeFocused()` + live-region role | e2e | `... -g "announced\|focus"` | ❌ Wave 0 |
| FORM-03 | Validation logic (pure) | unit | `npm run test:unit` | ❌ Wave 0 |
| FORM-04 | Donate `<a>` has `rel="noopener"`/`noreferrer`, config URL, external | e2e + grep | `... -g "donate"` + secret/rel scan | ❌ Wave 0 |
| FORM-04 / secrets | No real access key committed; placeholder present; `rel=noopener` present | static scan | `node scripts/assert-no-secret.mjs` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npx playwright test --config playwright.theme.config.ts e2e/forms.spec.ts` (+ `npm run test:unit` if validation touched)
- **Per wave merge:** `npm run test:e2e && npm run test:unit`
- **Phase gate:** Full suite green (incl. existing `e2e/shell.spec.ts` a11y) before `/gsd:verify-work`; axe/WCAG full conformance is Phase 6.

### Wave 0 Gaps
- [ ] `e2e/forms.spec.ts` — covers FORM-01/02/03 (route-mocked success/error/network, focus, `aria-invalid`, announcement)
- [ ] `src/lib/forms/validation.test.ts` — unit tests for the pure validation util (FORM-03)
- [ ] `scripts/assert-no-secret.mjs` — grep `src/` + `build/` for a real-looking key and for the committed `TODO` placeholder; assert `rel="noopener"` on the donate link (FORM-04 + secret hygiene). Wire as an `npm run test:no-secret` script mirroring `test:no-shiki`.
- [ ] `src/lib/config.ts`, `src/lib/forms/submit.ts`, `src/lib/forms/validation.ts`, `src/lib/components/FormStatus.svelte` — implementation files the tests target.
- [ ] Add a `.sr-only` / visually-hidden utility to `app.css` if not already present (for the new-tab cue) — verify during planning.

*Framework install: none — Playwright + Vitest already configured.*

## Sources

### Primary (HIGH confidence)
- Web3Forms docs `https://docs.web3forms.com/llms-full.txt` — fetch endpoint/method/headers/JSON body, `access_key` requirement, `botcheck` honeypot, hCaptcha, redirect (cross-domain = paid), static-host design. Fetched 2026-07-05.
- Web3Forms spam-protection docs — honeypot + hCaptcha options; server-side spam check automatic.
- Existing project files: `src/routes/contact/+page.svelte` (scaffold), `src/routes/get-involved/+page.svelte`, `e2e/shell.spec.ts`, `playwright.theme.config.ts`, `CLAUDE.md` STACK section (Web3Forms guidance verified 2026-07-04).
- Playwright `page.route()` mocking — standard, matches installed 1.61.1.

### Secondary (MEDIUM confidence)
- Free-tier limits (WebSearch, cross-referenced, 2026): **Web3Forms 250 submissions/mo**, unlimited access keys, 30-day storage, access key public/safe (`web3forms.com/pricing`, splitforms, formtorch). **Formspree 50/mo/form** (`splitforms.com/formspree-free-plan-limits`, `help.formspree.io`, formtorch). Pricing can change — re-confirm at build if the cap matters.
- Web3Forms `success` boolean presence — documented broadly, not in the minimal fetch example; code handles both.

### Tertiary (LOW confidence)
- Donation-platform shortlist (Givebutter/Donorbox/PayPal/Every.org) and 501c3-pending eligibility nuances — general ecosystem knowledge; user decides later, does not affect the build (placeholder).

## Metadata

**Confidence breakdown:**
- Standard stack (Web3Forms + native fetch, zero deps): HIGH — official docs + installed toolchain.
- API pattern (endpoint/body/honeypot/CORS/static): HIGH — official docs; `success` flag MEDIUM (handled defensively).
- Free-tier recommendation (Web3Forms over Formspree): HIGH — multiple 2026 sources agree (250 vs 50).
- Accessible submit→result pattern (WCAG 3.3.1/3.3.3/4.1.3/3.3.2): HIGH — established a11y practice; extends existing scaffold.
- Donation platform choice: LOW — deferred to user, placeholder only.

**Research date:** 2026-07-05
**Valid until:** ~2026-08-05 (30 days; re-verify free-tier caps if submission volume approaches limits).
</content>
</invoke>
