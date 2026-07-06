---
phase: 04-forms-donate
verified: 2026-07-06T08:00:00Z
status: passed
score: 10/10 must-haves verified
---

# Phase 4: Forms + Donate Verification Report

**Phase Goal:** Visitors can contact the org and volunteer through fully accessible forms that submit via a static-host-compatible backend with clear success/error states, and can reach the org's existing donation platform via a safe external link-out — no server, no embedded checkout, no committed secrets.

**Verified:** 2026-07-06T08:00:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | A visitor can submit the contact form and receive a clear success/error confirmation | ✓ VERIFIED | `src/routes/contact/+page.svelte` wires `submitToWeb3Forms` → `FormStatus`; `e2e/forms.spec.ts` proves 200-success (`.form-status.ok`, focused, `role=status`), 400-error (`role=alert` + mailto fallback), and network-abort (distinct "network error" message) via `page.route` mocks |
| 2 | A visitor can submit the volunteer form on /get-involved and receive a confirmation | ✓ VERIFIED | `src/routes/get-involved/+page.svelte` has a `<section aria-labelledby="volunteer">` form using `validateVolunteer` + `submitToWeb3Forms`; E2E `volunteer:` test proves success + focus |
| 3 | Empty/invalid submit shows inline errors, marks aria-invalid, moves focus to first invalid field, no network hit | ✓ VERIFIED | `onsubmit` in both pages calls `validateContact`/`validateVolunteer` before any fetch and does `document.getElementById(...).focus()` on the first error key; E2E `empty submit` test asserts `hit === false` and `aria-invalid="true"` |
| 4 | On success, focus moves to a screen-reader-announced confirmation region (role=status, tabindex=-1) | ✓ VERIFIED | `FormStatus.svelte`: `tabindex="-1"`, `role={kind==='err'?'alert':'status'}`, `$effect` calls `el?.focus()` on ok/err; E2E asserts `toBeFocused()` + `role=status` |
| 5 | On failure, an assertive error (role=alert) shows and the mailto fallback stays visible | ✓ VERIFIED | Same component (`role="alert"` when `kind==='err'`); contact page renders mailto disclaimer inside the `{#if status === 'err'}` block; E2E asserts both |
| 6 | All fields have associated labels and the flow is keyboard-operable | ✓ VERIFIED | Every input/textarea has `<label for=...>` matching `id`; native `<form>`/`<button type="submit">` semantics are keyboard-operable by default; E2E uses `getByLabel(...)` successfully, confirming programmatic label association |
| 7 | The donate action is a clearly-labeled external link (rel=noopener noreferrer) to the org's platform, never an embedded checkout | ✓ VERIFIED | `<a class="button" href={DONATE_URL} target="_blank" rel="noopener noreferrer">Donate on {DONATE_PLATFORM_NAME}<span class="sr-only"> (opens in a new tab)</span></a>`; E2E asserts `rel`, `target`, absolute `href`, and `iframe` count === 0 |
| 8 | Donate URL/platform name read from single config source, not hardcoded on page | ✓ VERIFIED | `get-involved/+page.svelte` imports `DONATE_URL, DONATE_PLATFORM_NAME` from `$lib/config`; no literal donate URL string appears in the route file |
| 9 | A static scan fails the build if a real-looking Web3Forms key is committed, and confirms rel=noopener is present | ✓ VERIFIED | `scripts/assert-no-secret.mjs` walks `src/` + `build/` for a UUID-shaped key, checks `config.ts` keeps the placeholder + TODO, and checks `rel="noopener noreferrer"` on the get-involved page; wired as `npm run test:no-secret` (ran here — exit 0, "OK" printed) |
| 10 | No server, no embedded checkout, no committed secrets | ✓ VERIFIED | `submit.ts` calls Web3Forms directly from the client (no server route added); no `<iframe` anywhere in get-involved; `config.ts` contains only the literal placeholder `'YOUR_WEB3FORMS_ACCESS_KEY'` (not UUID-shaped) |

**Score:** 10/10 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/config.ts` | Single-source swappable placeholders | ✓ VERIFIED | Contains `WEB3FORMS_ACCESS_KEY`, `DONATE_URL`, `DONATE_PLATFORM_NAME`, all TODO-marked; 7 lines, substantive |
| `src/lib/forms/submit.ts` | `submitToWeb3Forms()` fetch wrapper | ✓ VERIFIED | Exports `submitToWeb3Forms`; POSTs to `api.web3forms.com/submit`; imports key from `$lib/config`; normalizes ok/error/network |
| `src/lib/forms/validation.ts` | Pure `validateContact()`/`validateVolunteer()` | ✓ VERIFIED | Both exported; field-order deterministic (name, email, message); email regex check |
| `src/lib/forms/validation.test.ts` | Vitest unit tests | ✓ VERIFIED | 4 tests present, all passing (part of 9/9 total unit tests) |
| `src/lib/components/FormStatus.svelte` | Focus-managed status region | ✓ VERIFIED | `role`/`aria-live` switch on `kind`, `tabindex="-1"`, `$effect` focuses on ok/err; 33 lines |
| `src/routes/contact/+page.svelte` | Wired contact form | ✓ VERIFIED | Contains `submitToWeb3Forms`, `aria-invalid`, `aria-describedby`, honeypot `botcheck`, single `FormStatus` region (no per-field `role=alert`) |
| `src/routes/get-involved/+page.svelte` | Volunteer form + donate link-out | ✓ VERIFIED | Contains `validateVolunteer`, `v-name`/`v-email`/`v-message` ids, honeypot, config-driven donate anchor with `rel="noopener noreferrer"`; single `<h1>` preserved |
| `scripts/assert-no-secret.mjs` | Static hygiene scan | ✓ VERIFIED | 50 lines; walks `src`/`build`, UUID regex, placeholder/TODO check, rel=noopener check; ran directly — exit 0 |
| `package.json` | `test:no-secret` script | ✓ VERIFIED | `"test:no-secret": "node scripts/assert-no-secret.mjs"` present and runnable |
| `e2e/forms.spec.ts` | Route-mocked E2E: success/error/network/validation/volunteer/donate | ✓ VERIFIED | 6 tests present covering all FORM-01..04 requirements, all use `page.route` mocks (no live endpoint) |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `contact/+page.svelte` | `https://api.web3forms.com/submit` | `submitToWeb3Forms()` called in onsubmit after validation | ✓ WIRED | Confirmed by grep + E2E route-mock interception |
| `get-involved/+page.svelte` | `https://api.web3forms.com/submit` | `submitToWeb3Forms()` called in onVolunteerSubmit | ✓ WIRED | Same pattern, confirmed by E2E volunteer test |
| `forms/submit.ts` | `lib/config.ts` | imports `WEB3FORMS_ACCESS_KEY` | ✓ WIRED | `import { WEB3FORMS_ACCESS_KEY } from '$lib/config'` at line 1 |
| `contact/+page.svelte` | `components/FormStatus.svelte` | renders on ok/err with focus + live region | ✓ WIRED | `import FormStatus`; rendered in both `{#if status === 'ok'}` and `{#if status === 'err'}` branches |
| `get-involved/+page.svelte` | `lib/config.ts` | imports `DONATE_URL` + `DONATE_PLATFORM_NAME` | ✓ WIRED | Import present; both values interpolated into the donate anchor and copy |
| `scripts/assert-no-secret.mjs` | `src/` and `build/` | walks files asserting no UUID-shaped key | ✓ WIRED | `walk()` function invoked for both dirs; ran and passed |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| FORM-01 | 04-01 | Contact form submits via static-host backend with clear success/error | ✓ SATISFIED | REQUIREMENTS.md marked Complete; code + E2E confirm |
| FORM-02 | 04-01 | Volunteer/get-involved form submits and confirms | ✓ SATISFIED | REQUIREMENTS.md marked Complete; code + E2E confirm |
| FORM-03 | 04-01 | Forms fully accessible (labels, announced errors, keyboard-nav) | ✓ SATISFIED | REQUIREMENTS.md marked Complete; labels/aria-invalid/aria-describedby/focus mgmt confirmed in code |
| FORM-04 | 04-02 | Donate is a clearly-labeled external link-out, never embedded checkout | ✓ SATISFIED | REQUIREMENTS.md marked Complete; rel=noopener + no-iframe confirmed in code + scan |

No orphaned requirements found for Phase 4.

### Anti-Patterns Found

None found. Scanned `src/lib/config.ts`, `src/lib/forms/*`, `src/lib/components/FormStatus.svelte`, `src/routes/contact/+page.svelte`, `src/routes/get-involved/+page.svelte`, `scripts/assert-no-secret.mjs` for TODO/FIXME/placeholder/empty-handler/stub patterns.

The three `TODO(user):` comments in `config.ts` and the two "COPY: AUTHORED PLACEHOLDER" comments in `get-involved/+page.svelte` are **intentional, logged, user-facing swap points** per the phase's documented context (public-by-design key placeholder, copy pending org sign-off) — not implementation stubs. They do not gate the phase.

No `href="#"` remains on the donate link (confirmed by grep — zero matches). No `<iframe` present. No empty `onClick={() => {}}`-style handlers found in forms code.

### Human Verification Required

### 1. Real screen-reader announcement timbre (NVDA/VoiceOver)

**Test:** Submit the contact and volunteer forms with NVDA and VoiceOver active.
**Expected:** The success/error confirmation is spoken aloud and receives focus, matching the automated `role=status`/`role=alert` + `toBeFocused()` assertions.
**Why human:** Live-region announcement timbre and AT-specific behavior cannot be fully asserted headless; this is corroborative per `04-VALIDATION.md`, not blocking (automated E2E already covers the structural contract).

### Gaps Summary

No gaps found. All 10 derived observable truths verified against the actual codebase (not just SUMMARY claims). All 10 required artifacts exist, are substantive (no stubs), and are wired. All 6 key links confirmed wired. All 4 FORM requirements (FORM-01 through FORM-04) are satisfied in both REQUIREMENTS.md and in the underlying code/tests. Safe gates re-run directly during this verification:

- `npm run build` — exit 0
- `npm run test:unit` — 3 files / 9 tests passed
- `npm run test:no-secret` — exit 0, printed "FORM-04 / secret-hygiene OK"

The Web3Forms access key and donate URL remain intentional, clearly-TODO'd placeholders in `src/lib/config.ts` per the phase's documented design (the key is public-by-design; both are user-swappable before launch). This is a logged decision, not a gap — the `test:no-secret` gate specifically enforces that the placeholder stays present until swapped, and E2E validates the full flow via route-mocking, which is the correct architecture for a static-host site with a client-only key.

---

_Verified: 2026-07-06T08:00:00Z_
_Verifier: Claude (gsd-verifier)_
