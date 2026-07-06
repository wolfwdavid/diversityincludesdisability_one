---
phase: 04-forms-donate
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/config.ts
  - src/lib/forms/submit.ts
  - src/lib/forms/validation.ts
  - src/lib/forms/validation.test.ts
  - src/lib/components/FormStatus.svelte
  - src/routes/contact/+page.svelte
  - src/routes/get-involved/+page.svelte
  - e2e/forms.spec.ts
autonomous: true
requirements: [FORM-01, FORM-02, FORM-03]

must_haves:
  truths:
    - "A visitor can submit the contact form and receive a clear success or error confirmation"
    - "A visitor can submit the volunteer form on /get-involved and receive a confirmation"
    - "Submitting an empty/invalid form shows inline errors, marks fields aria-invalid, and moves focus to the first invalid field without hitting the network"
    - "On success, focus moves to a screen-reader-announced confirmation region (role=status, tabindex=-1)"
    - "On failure, an assertive error (role=alert) shows and the mailto fallback stays visible"
    - "All fields have associated labels and the whole flow is keyboard-operable"
  artifacts:
    - path: "src/lib/config.ts"
      provides: "Single-source swappable placeholders WEB3FORMS_ACCESS_KEY, DONATE_URL, DONATE_PLATFORM_NAME"
      contains: "WEB3FORMS_ACCESS_KEY"
    - path: "src/lib/forms/submit.ts"
      provides: "submitToWeb3Forms() fetch wrapper with success/error/network normalization"
      exports: ["submitToWeb3Forms"]
    - path: "src/lib/forms/validation.ts"
      provides: "Pure validateContact()/validateVolunteer() returning field->message map in field order"
      exports: ["validateContact", "validateVolunteer"]
    - path: "src/lib/forms/validation.test.ts"
      provides: "Vitest unit tests for the pure validation utils"
    - path: "src/lib/components/FormStatus.svelte"
      provides: "Focus-managed status region (role status/alert, tabindex=-1)"
      min_lines: 8
    - path: "src/routes/contact/+page.svelte"
      provides: "Wired contact form extending the Phase-3 scaffold"
      contains: "submitToWeb3Forms"
    - path: "src/routes/get-involved/+page.svelte"
      provides: "Volunteer form section using the shared engine"
      contains: "validateVolunteer"
    - path: "e2e/forms.spec.ts"
      provides: "Route-mocked E2E: success, server error, network fail, validation focus, volunteer"
      contains: "page.route"
  key_links:
    - from: "src/routes/contact/+page.svelte"
      to: "https://api.web3forms.com/submit"
      via: "submitToWeb3Forms() called in onsubmit after validation passes"
      pattern: "submitToWeb3Forms"
    - from: "src/lib/forms/submit.ts"
      to: "src/lib/config.ts"
      via: "imports WEB3FORMS_ACCESS_KEY"
      pattern: "from '\\$lib/config'"
    - from: "src/routes/contact/+page.svelte"
      to: "src/lib/components/FormStatus.svelte"
      via: "renders FormStatus on ok/err with focus + live region"
      pattern: "FormStatus"
---

<objective>
Wire the existing Phase-3 accessible contact SCAFFOLD to a real static-host backend (Web3Forms) and add a second, volunteer form on /get-involved — both fully accessible, both driven by one shared submit + validation + status engine, with a single swappable config source and zero new dependencies.

Purpose: Deliver FORM-01 (contact submits with clear success/error), FORM-02 (volunteer submits and confirms), and FORM-03 (fully accessible: labels, announced errors, keyboard-navigable, focus-managed).
Output: config.ts (placeholders), forms/submit.ts + forms/validation.ts (+ unit test), components/FormStatus.svelte, extended contact page, volunteer section on get-involved, and route-mocked E2E coverage.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/04-forms-donate/04-RESEARCH.md

# Source-of-truth files this plan extends / mirrors
@src/routes/contact/+page.svelte
@src/routes/get-involved/+page.svelte
@src/lib/posts.test.ts
@e2e/shell.spec.ts
@playwright.theme.config.ts
@vite.config.ts

<interfaces>
<!-- Contracts this plan CREATES. Downstream (04-02) consumes DONATE_URL/DONATE_PLATFORM_NAME from config.ts. -->

src/lib/config.ts (NEW — single source, all values are committed placeholders):
```typescript
export const WEB3FORMS_ACCESS_KEY: string; // PUBLIC by design; placeholder 'YOUR_WEB3FORMS_ACCESS_KEY'
export const DONATE_URL: string;           // placeholder 'https://example.org/donate-TODO'
export const DONATE_PLATFORM_NAME: string; // placeholder 'our giving platform'
```

src/lib/forms/submit.ts (NEW):
```typescript
export function submitToWeb3Forms(fields: Record<string, string>): Promise<{ ok: boolean; message: string }>;
```

src/lib/forms/validation.ts (NEW):
```typescript
export type Errors = Record<string, string>;
export function validateContact(data: Record<string, unknown>): Errors;   // keys in field order: name, email, message
export function validateVolunteer(data: Record<string, unknown>): Errors;
```

src/lib/components/FormStatus.svelte (NEW):
```typescript
// props: { kind: 'ok' | 'err' | 'sending'; message: string }
// role = kind==='err' ? 'alert' : 'status'; focuses itself (tabindex=-1) on ok/err
```

Project conventions (already in codebase — reuse, do not recreate):
- `.sr-only` and `.button` utilities exist in src/lib/styles/app.css.
- Form-state CSS tokens exist in src/lib/styles/tokens/base.css (--color-*, --space-*, --radius, --focus-ring-width, --measure).
- E2E specs live in e2e/, run via `npm run test:e2e` (playwright.theme.config.ts, build+preview at :4173), navigate with RELATIVE paths (e.g. `page.goto('./contact/')`).
- Unit tests live beside source in src/ and run via `npm run test:unit` (vitest, jsdom).
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Shared engine — config + submit + pure validation (unit-tested) + FormStatus</name>
  <files>src/lib/config.ts, src/lib/forms/submit.ts, src/lib/forms/validation.ts, src/lib/forms/validation.test.ts, src/lib/components/FormStatus.svelte</files>
  <read_first>
    - .planning/phases/04-forms-donate/04-RESEARCH.md (Patterns 1, 3, 4; `config.ts` shape; Vitest example)
    - src/lib/posts.test.ts (existing vitest style — describe/it/expect, globals on)
    - vite.config.ts (vitest include = src/**/*.{test,spec}.{js,ts}, jsdom)
  </read_first>
  <behavior>
    - validateContact({}) returns keys ['name','email','message'] IN THAT ORDER (so "first invalid" is deterministic).
    - validateContact({name:'A', email:'nope', message:'x'}).email matches /valid email/i (a suggestion, WCAG 3.3.3).
    - validateContact({name:'A', email:'a@b.co', message:'x'}) returns {} (no errors).
    - validateVolunteer behaves the same shape (name/email/message required, email format-checked).
  </behavior>
  <action>
Create FOUR new files exactly as below (all values in config.ts are COMMITTED PLACEHOLDERS — the Web3Forms key is PUBLIC by design, so do NOT use $env and do NOT invent a real key).

**src/lib/config.ts**
```typescript
// src/lib/config.ts — SINGLE SOURCE for user-swappable values.
// TODO(user): replace all three placeholders before launch.
// The Web3Forms access key is PUBLIC by design (an alias to the org's email),
// so committing a placeholder literal is safe — do NOT move it to $env.
export const WEB3FORMS_ACCESS_KEY = 'YOUR_WEB3FORMS_ACCESS_KEY'; // TODO(user): from https://web3forms.com (enter org email -> copy key)
export const DONATE_URL = 'https://example.org/donate-TODO'; // TODO(user): real external giving-platform URL
export const DONATE_PLATFORM_NAME = 'our giving platform'; // TODO(user): e.g. 'Givebutter'
```

**src/lib/forms/submit.ts** (research Pattern 1 — belt-and-suspenders success check + distinct network message)
```typescript
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
    const ok = res.ok && json.success !== false;
    return { ok, message: json.message ?? (ok ? 'Sent.' : 'Something went wrong.') };
  } catch {
    return { ok: false, message: 'Network error — please email us directly instead.' };
  }
}
```

**src/lib/forms/validation.ts** (pure; keys inserted in field order name -> email -> message)
```typescript
export type Errors = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function base(data: Record<string, unknown>, helpMsg: string): Errors {
  const errors: Errors = {};
  const name = String(data.name ?? '').trim();
  const email = String(data.email ?? '').trim();
  const message = String(data.message ?? '').trim();
  if (!name) errors.name = 'Enter your name.';
  if (!email) errors.email = 'Enter your email address.';
  else if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email like name@example.com.';
  if (!message) errors.message = helpMsg;
  return errors;
}

export function validateContact(data: Record<string, unknown>): Errors {
  return base(data, 'Enter a message.');
}

export function validateVolunteer(data: Record<string, unknown>): Errors {
  return base(data, 'Tell us how you would like to help.');
}
```

**src/lib/forms/validation.test.ts** (vitest — mirrors src/lib/posts.test.ts style; globals are on)
```typescript
import { describe, it, expect } from 'vitest';
import { validateContact, validateVolunteer } from './validation';

describe('validateContact (FORM-03)', () => {
  it('flags missing name/email/message in field order', () => {
    expect(Object.keys(validateContact({}))).toEqual(['name', 'email', 'message']);
  });
  it('rejects a malformed email with a suggestion', () => {
    expect(validateContact({ name: 'A', email: 'nope', message: 'x' }).email).toMatch(/valid email/i);
  });
  it('passes a well-formed submission', () => {
    expect(validateContact({ name: 'A', email: 'a@b.co', message: 'x' })).toEqual({});
  });
});

describe('validateVolunteer (FORM-02/03)', () => {
  it('requires all fields', () => {
    expect(Object.keys(validateVolunteer({}))).toEqual(['name', 'email', 'message']);
  });
});
```

**src/lib/components/FormStatus.svelte** (research Pattern 4 — role switches; focuses on ok/err)
```svelte
<script lang="ts">
  let { kind, message }: { kind: 'ok' | 'err' | 'sending'; message: string } = $props();
  let el = $state<HTMLElement>();
  $effect(() => {
    if (kind === 'ok' || kind === 'err') el?.focus();
  });
</script>

<p
  bind:this={el}
  tabindex="-1"
  role={kind === 'err' ? 'alert' : 'status'}
  aria-live={kind === 'err' ? 'assertive' : 'polite'}
  class="form-status {kind}"
>
  {message}
</p>

<style>
  .form-status {
    margin-block: var(--space-4) 0;
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius);
    border: 1px solid var(--color-border);
    max-inline-size: var(--measure);
  }
  .form-status:focus-visible {
    outline: var(--focus-ring-width) solid var(--color-focus);
    outline-offset: 2px;
  }
  .form-status.ok { border-color: var(--color-accent); }
  .form-status.err { border-color: var(--color-accent); font-weight: var(--font-weight-heading); }
</style>
```
  </action>
  <verify>
    <automated>npm run test:unit</automated>
  </verify>
  <acceptance_criteria>
    - `src/lib/config.ts` exists and contains `WEB3FORMS_ACCESS_KEY`, `DONATE_URL`, `DONATE_PLATFORM_NAME`, and a `TODO` marker (grep).
    - `src/lib/forms/submit.ts` contains `api.web3forms.com/submit` and imports from `$lib/config` (grep).
    - `src/lib/forms/validation.ts` exports `validateContact` and `validateVolunteer` (grep).
    - `src/lib/components/FormStatus.svelte` contains `role={kind === 'err' ? 'alert' : 'status'}` and `tabindex="-1"` (grep).
    - `npm run test:unit` exits 0 with validation tests green.
  </acceptance_criteria>
  <done>Shared engine exists; the pure validation contract is unit-verified; config is the single swappable source.</done>
</task>

<task type="auto">
  <name>Task 2: Wire the contact form + route-mocked E2E (success / error / network / validation)</name>
  <files>src/routes/contact/+page.svelte, e2e/forms.spec.ts</files>
  <read_first>
    - src/routes/contact/+page.svelte (EXISTING scaffold to EXTEND — keep labels/for, aria-describedby ids c-name/c-email/c-message, mailto lede, styles)
    - .planning/phases/04-forms-donate/04-RESEARCH.md (Pattern 3 rules 1-7; Playwright mock examples)
    - src/lib/forms/submit.ts, src/lib/forms/validation.ts, src/lib/components/FormStatus.svelte (Task 1 outputs)
    - e2e/shell.spec.ts (E2E style: relative `page.goto('./contact/')`, getByRole/getByLabel)
  </read_first>
  <action>
**A. Replace src/routes/contact/+page.svelte** with the wired version below. This EXTENDS the scaffold: keep the ids (c-name/c-email/c-message), labels, mailto lede, and the existing `<style>` block. The refinement per research: DROP the per-field `role="alert" aria-live="polite"` slots; keep `aria-describedby`; add `aria-invalid`; use ONE form-level FormStatus region. Add the honeypot `botcheck`. On success, replace the form with the focused confirmation to prevent double-submit.

```svelte
<script lang="ts">
  import { submitToWeb3Forms } from '$lib/forms/submit';
  import { validateContact, type Errors } from '$lib/forms/validation';
  import FormStatus from '$lib/components/FormStatus.svelte';

  let errors = $state<Errors>({});
  let status = $state<'idle' | 'sending' | 'ok' | 'err'>('idle');
  let statusMessage = $state('');

  async function onsubmit(e: SubmitEvent) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    errors = validateContact(data);
    if (Object.keys(errors).length) {
      document.getElementById(`c-${Object.keys(errors)[0]}`)?.focus();
      return;
    }
    status = 'sending';
    statusMessage = 'Sending your message…';
    const { ok, message } = await submitToWeb3Forms(data);
    status = ok ? 'ok' : 'err';
    statusMessage = ok
      ? 'Thank you — your message has been sent. We will be in touch.'
      : message;
  }
</script>

<svelte:head>
  <title>Contact — Diversity Includes Disability</title>
  <meta name="description" content="Contact Diversity Includes Disability to book a training, request consulting, or partner with us." />
</svelte:head>

<h1>Contact</h1>
<p class="lede">
  Prefer email? Reach us directly at
  <a href="mailto:emanrimawi@gmail.com">emanrimawi@gmail.com</a>.
</p>

{#if status === 'ok'}
  <FormStatus kind="ok" message={statusMessage} />
{:else}
  <form novalidate {onsubmit} aria-busy={status === 'sending'}>
    <div class="field">
      <label for="c-name">Name</label>
      <input id="c-name" name="name" type="text" autocomplete="name"
             aria-describedby="c-name-error" aria-invalid={!!errors.name} required />
      <p id="c-name-error" class="error">{errors.name ?? ''}</p>
    </div>

    <div class="field">
      <label for="c-email">Email</label>
      <input id="c-email" name="email" type="email" autocomplete="email"
             aria-describedby="c-email-error" aria-invalid={!!errors.email} required />
      <p id="c-email-error" class="error">{errors.email ?? ''}</p>
    </div>

    <div class="field">
      <label for="c-message">Message</label>
      <textarea id="c-message" name="message" rows="6"
                aria-describedby="c-message-error" aria-invalid={!!errors.message} required></textarea>
      <p id="c-message-error" class="error">{errors.message ?? ''}</p>
    </div>

    <!-- Honeypot: bots tick it; SR/keyboard users never reach it. -->
    <input type="checkbox" name="botcheck" style="display:none" tabindex="-1" aria-hidden="true" />

    <button class="button" type="submit">
      {status === 'sending' ? 'Sending…' : 'Send message'}
    </button>

    {#if status === 'err'}
      <FormStatus kind="err" message={statusMessage} />
      <p class="disclaimer">
        If this keeps happening, email us at
        <a href="mailto:emanrimawi@gmail.com">emanrimawi@gmail.com</a>.
      </p>
    {/if}
  </form>
{/if}

<style>
  .lede { font-size: 1.125em; max-inline-size: var(--measure); }
  .disclaimer { color: var(--color-text-muted); }
  form { display: grid; gap: var(--space-6); max-inline-size: var(--measure); margin-block-start: var(--space-6); }
  .field { display: grid; gap: var(--space-2); }
  label { font-weight: var(--font-weight-heading); }
  input, textarea {
    padding: var(--space-3); font: inherit;
    color: var(--color-text); background: var(--color-bg);
    border: 1px solid var(--color-border); border-radius: var(--radius);
  }
  input[aria-invalid="true"], textarea[aria-invalid="true"] { border-color: var(--color-accent); border-width: 2px; }
  input:focus-visible, textarea:focus-visible {
    outline: var(--focus-ring-width) solid var(--color-focus); outline-offset: 2px;
  }
  .error { color: var(--color-text-muted); min-height: 1em; margin: 0; }
  .error:empty { min-height: 0; }
</style>
```

**B. Create e2e/forms.spec.ts** with the contact tests below (route-mock ONLY — never hit the live endpoint). Volunteer + donate tests are appended by later tasks.

```typescript
import { test, expect } from '@playwright/test';

test('contact: success is announced and focus-managed (FORM-01/03)', async ({ page }) => {
  await page.route('**/api.web3forms.com/submit', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Email sent successfully!' })
    })
  );
  await page.goto('./contact/');
  await page.getByLabel('Name').fill('Ada');
  await page.getByLabel('Email').fill('ada@example.com');
  await page.getByLabel('Message').fill('Hello there');
  await page.getByRole('button', { name: /send message/i }).click();
  const status = page.locator('.form-status.ok');
  await expect(status).toBeVisible();
  await expect(status).toBeFocused();
  await expect(status).toHaveAttribute('role', 'status');
});

test('contact: server error shows an assertive alert + mailto fallback (FORM-01)', async ({ page }) => {
  await page.route('**/api.web3forms.com/submit', (route) =>
    route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ success: false, message: 'Bad request' })
    })
  );
  await page.goto('./contact/');
  await page.getByLabel('Name').fill('Ada');
  await page.getByLabel('Email').fill('ada@example.com');
  await page.getByLabel('Message').fill('Hello there');
  await page.getByRole('button', { name: /send message/i }).click();
  await expect(page.locator('.form-status.err')).toHaveAttribute('role', 'alert');
  await expect(page.getByRole('link', { name: /emanrimawi@gmail.com/i })).toBeVisible();
});

test('contact: network failure is handled distinctly (FORM-01)', async ({ page }) => {
  await page.route('**/api.web3forms.com/submit', (route) => route.abort('failed'));
  await page.goto('./contact/');
  await page.getByLabel('Name').fill('Ada');
  await page.getByLabel('Email').fill('ada@example.com');
  await page.getByLabel('Message').fill('Hello there');
  await page.getByRole('button', { name: /send message/i }).click();
  await expect(page.locator('.form-status.err')).toContainText(/network error/i);
});

test('contact: empty submit shows errors, marks aria-invalid, focuses first invalid, no network hit (FORM-03)', async ({ page }) => {
  let hit = false;
  await page.route('**/api.web3forms.com/submit', (route) => { hit = true; return route.abort('failed'); });
  await page.goto('./contact/');
  await page.getByRole('button', { name: /send message/i }).click();
  await expect(page.getByLabel('Name')).toBeFocused();
  await expect(page.getByLabel('Name')).toHaveAttribute('aria-invalid', 'true');
  expect(hit).toBe(false);
});
```
  </action>
  <verify>
    <automated>npx playwright test --config playwright.theme.config.ts e2e/forms.spec.ts -g "contact"</automated>
  </verify>
  <acceptance_criteria>
    - `src/routes/contact/+page.svelte` contains `submitToWeb3Forms`, `aria-invalid`, `aria-describedby`, and a `name="botcheck"` honeypot with `tabindex="-1"` + `aria-hidden` (grep).
    - `src/routes/contact/+page.svelte` has NO per-field `role="alert"` on the error `<p>` slots (grep for `class="error"` shows no `role=`).
    - Exactly one form-level status region via `FormStatus` (grep `FormStatus`).
    - `e2e/forms.spec.ts` contains `page.route('**/api.web3forms.com/submit'` and asserts `toBeFocused()` on `.form-status.ok` (grep).
    - The 4 contact E2E tests pass (route-mocked, no live endpoint).
  </acceptance_criteria>
  <done>Contact form validates, submits via Web3Forms, and reports success/error accessibly with managed focus — verified by route-mocked E2E.</done>
</task>

<task type="auto">
  <name>Task 3: Volunteer form section on /get-involved + its route-mocked E2E</name>
  <files>src/routes/get-involved/+page.svelte, e2e/forms.spec.ts</files>
  <read_first>
    - src/routes/get-involved/+page.svelte (EXISTING — keep single h1 "Get Involved", the "Ways to help" section, and the donate section UNTOUCHED for 04-02; add a NEW volunteer form section only)
    - src/routes/contact/+page.svelte (Task 2 — mirror the wiring pattern with v- ids)
    - src/lib/forms/validation.ts (validateVolunteer), src/lib/forms/submit.ts, src/lib/components/FormStatus.svelte
  </read_first>
  <action>
**A. Extend src/routes/get-involved/+page.svelte** — add a volunteer `<form>` section using the SAME engine as contact, with `v-name`/`v-email`/`v-message` ids and `validateVolunteer`. Do NOT modify the existing donate section (04-02 owns it). Keep the single existing `<h1>`.

In the `<script>` block, keep `import { base } from '$app/paths';` and ADD:
```typescript
import { submitToWeb3Forms } from '$lib/forms/submit';
import { validateVolunteer, type Errors } from '$lib/forms/validation';
import FormStatus from '$lib/components/FormStatus.svelte';

let vErrors = $state<Errors>({});
let vStatus = $state<'idle' | 'sending' | 'ok' | 'err'>('idle');
let vMessage = $state('');

async function onVolunteerSubmit(e: SubmitEvent) {
  e.preventDefault();
  const form = e.currentTarget as HTMLFormElement;
  const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
  vErrors = validateVolunteer(data);
  if (Object.keys(vErrors).length) {
    document.getElementById(`v-${Object.keys(vErrors)[0]}`)?.focus();
    return;
  }
  vStatus = 'sending';
  vMessage = 'Sending…';
  const { ok, message } = await submitToWeb3Forms({ ...data, subject: 'Volunteer interest' });
  vStatus = ok ? 'ok' : 'err';
  vMessage = ok
    ? 'Thank you for offering to help — we will be in touch.'
    : message;
}
```

Insert a NEW `<section aria-labelledby="volunteer">` BEFORE the existing donate section (so heading order stays h1 -> h2s). COPY is an authored placeholder — flag it like other Phase-3 pages:
```svelte
<section aria-labelledby="volunteer">
  <h2 id="volunteer">Volunteer with us</h2>
  <!-- COPY: AUTHORED PLACEHOLDER — confirm with organization before launch. -->
  <p>Tell us a little about yourself and how you would like to help.</p>

  {#if vStatus === 'ok'}
    <FormStatus kind="ok" message={vMessage} />
  {:else}
    <form novalidate onsubmit={onVolunteerSubmit} aria-busy={vStatus === 'sending'}>
      <div class="field">
        <label for="v-name">Name</label>
        <input id="v-name" name="name" type="text" autocomplete="name"
               aria-describedby="v-name-error" aria-invalid={!!vErrors.name} required />
        <p id="v-name-error" class="error">{vErrors.name ?? ''}</p>
      </div>
      <div class="field">
        <label for="v-email">Email</label>
        <input id="v-email" name="email" type="email" autocomplete="email"
               aria-describedby="v-email-error" aria-invalid={!!vErrors.email} required />
        <p id="v-email-error" class="error">{vErrors.email ?? ''}</p>
      </div>
      <div class="field">
        <label for="v-message">How would you like to help?</label>
        <textarea id="v-message" name="message" rows="5"
                  aria-describedby="v-message-error" aria-invalid={!!vErrors.message} required></textarea>
        <p id="v-message-error" class="error">{vErrors.message ?? ''}</p>
      </div>
      <input type="checkbox" name="botcheck" style="display:none" tabindex="-1" aria-hidden="true" />
      <button class="button" type="submit">
        {vStatus === 'sending' ? 'Sending…' : 'Sign me up'}
      </button>
      {#if vStatus === 'err'}
        <FormStatus kind="err" message={vMessage} />
        <p class="disclaimer">If this keeps happening, email <a href="mailto:emanrimawi@gmail.com">emanrimawi@gmail.com</a>.</p>
      {/if}
    </form>
  {/if}
</section>
```

Add the shared field styles to the page `<style>` (mirror contact):
```css
form { display: grid; gap: var(--space-6); max-inline-size: var(--measure); margin-block-start: var(--space-6); }
.field { display: grid; gap: var(--space-2); }
label { font-weight: var(--font-weight-heading); }
input, textarea {
  padding: var(--space-3); font: inherit;
  color: var(--color-text); background: var(--color-bg);
  border: 1px solid var(--color-border); border-radius: var(--radius);
}
input[aria-invalid="true"], textarea[aria-invalid="true"] { border-color: var(--color-accent); border-width: 2px; }
input:focus-visible, textarea:focus-visible { outline: var(--focus-ring-width) solid var(--color-focus); outline-offset: 2px; }
.error { color: var(--color-text-muted); min-height: 1em; margin: 0; }
.error:empty { min-height: 0; }
```

**B. Append to e2e/forms.spec.ts:**
```typescript
test('volunteer: form on /get-involved submits and confirms (FORM-02)', async ({ page }) => {
  await page.route('**/api.web3forms.com/submit', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'ok' })
    })
  );
  await page.goto('./get-involved/');
  await page.getByLabel('Name').fill('Grace');
  await page.getByLabel('Email').fill('grace@example.com');
  await page.getByLabel(/how would you like to help/i).fill('Outreach');
  await page.getByRole('button', { name: /sign me up/i }).click();
  const status = page.locator('.form-status.ok');
  await expect(status).toBeVisible();
  await expect(status).toBeFocused();
});
```
  </action>
  <verify>
    <automated>npx playwright test --config playwright.theme.config.ts e2e/forms.spec.ts -g "volunteer"</automated>
  </verify>
  <acceptance_criteria>
    - `src/routes/get-involved/+page.svelte` contains `validateVolunteer`, `id="v-name"`, and a `name="botcheck"` honeypot (grep).
    - Still exactly one `<h1>` on the page (grep `<h1` count = 1); volunteer heading is an `<h2 id="volunteer">`.
    - The existing donate section is unchanged (still present with `id="donate"`).
    - `e2e/forms.spec.ts` contains a `volunteer` test asserting `.form-status.ok` `toBeFocused()`.
    - The volunteer E2E test passes; `npm run build` exits 0.
  </acceptance_criteria>
  <done>Volunteer form submits and confirms accessibly on /get-involved using the shared engine, without disturbing the donate placeholder or heading order.</done>
</task>

</tasks>

<verification>
- `npm run test:unit` green (validation contract).
- `npm run test:e2e` green for all forms.spec.ts contact + volunteer tests (route-mocked; no live endpoint hit).
- `npm run build` exits 0.
- Existing `e2e/shell.spec.ts` still green (single-h1 + landmarks preserved on /contact and /get-involved).
- No new npm dependencies added (package.json devDependencies unchanged).
</verification>

<success_criteria>
- FORM-01: Contact form POSTs to Web3Forms and shows clear success (focused role=status) and error (role=alert + mailto) states — proven by mocked 200/400/abort E2E.
- FORM-02: Volunteer form on /get-involved submits and confirms — proven by mocked E2E.
- FORM-03: Both forms have labels, aria-invalid + aria-describedby errors, focus-to-first-invalid on error, focus-managed announced confirmation, and are keyboard-operable; validation logic is unit-tested.
- Single-source config.ts holds the swappable public key placeholder; no scattered literals.
</success_criteria>

<output>
After completion, create `.planning/phases/04-forms-donate/04-01-SUMMARY.md`
</output>
