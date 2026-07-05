---
phase: 02-design-system-dual-theme
plan: 03
type: execute
wave: 3
depends_on: [02]
files_modified:
  - src/lib/theme/ThemeToggle.svelte
  - src/routes/+layout.svelte
autonomous: true
requirements: [THEME-01, THEME-06]
must_haves:
  truths:
    - "A visitor can toggle between Premium and Accessible from a control present on every page (THEME-01)"
    - "The toggle is a native <button> — fully keyboard-operable (Enter/Space), exposes aria-pressed reflecting the theme, and preserves focus after switching (THEME-06)"
    - "A visually-hidden aria-live=polite region announces the resulting theme in plain language on switch (THEME-06)"
    - "The toggle target is >= 24x24 CSS px (WCAG 2.2 2.5.8) and its focus ring uses the token that thickens in Accessible mode"
    - "npm run build stays green and the full Phase-2 theme suite passes"
  artifacts:
    - path: "src/lib/theme/ThemeToggle.svelte"
      provides: "Native <button aria-pressed> theme toggle + polite live region"
      contains: "aria-pressed"
    - path: "src/routes/+layout.svelte"
      provides: "Mounts <ThemeToggle/> so the control is on every page (Phase 3 relocates it into the Header)"
      contains: "ThemeToggle"
  key_links:
    - from: "src/lib/theme/ThemeToggle.svelte"
      to: "src/lib/theme/theme.svelte.ts"
      via: "imports the theme store, calls theme.toggle()"
      pattern: "theme.toggle\\(\\)"
    - from: "src/routes/+layout.svelte"
      to: "src/lib/theme/ThemeToggle.svelte"
      via: "imports + renders the component in the layout"
      pattern: "<ThemeToggle"
---

<objective>
Deliver the user-facing control: a native `<button aria-pressed>` **ThemeToggle** that flips the store from 02-02, announces the result to assistive tech via a polite live region, and preserves focus because the same element persists across toggles (THEME-06). Mount it in `+layout.svelte` so it is present on every page (THEME-01) — Phase 3 later relocates it into the Header/Nav shell.

Purpose: A native button gives free Enter/Space activation, focusability, and role — hand-rolled `role="button"` div toggles routinely miss Space or lose focus. `aria-pressed` has materially better cross-AT support than `role="switch"` (ChromeVox ignores switch; NVDA re-maps it). This closes the two remaining THEME requirements and makes the whole dual-theme system operable end-to-end.
Output: `src/lib/theme/ThemeToggle.svelte`; `+layout.svelte` mounting it. The final THEME-01/06 "toggle a11y" E2E slice goes green and the full Phase-2 suite passes.

SCOPE FENCE: This is the ONLY user-facing toggle work. Do NOT build the Header/Nav/Footer shell (Phase 3, PAGE-08). Do NOT restyle pages. Do NOT add icons requiring new assets — a text label is sufficient and accessible.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@.planning/phases/02-design-system-dual-theme/02-RESEARCH.md
@.planning/phases/02-design-system-dual-theme/02-02-SUMMARY.md
@src/routes/+layout.svelte

<interfaces>
<!-- Contract this plan CONSUMES (created in 02-02). -->
```ts
// src/lib/theme/theme.svelte.ts
export type Theme = 'premium' | 'accessible';
export const THEME_KEY: string;                 // 'did:theme'
export const theme: { current: Theme; set(next: Theme): void; toggle(): void };
```
Tokens available for styling the toggle (from 02-01): `--color-accent`, `--color-focus`, `--focus-ring-width` (2px premium / 3px accessible), `--color-on-accent`, `--radius`.
Current +layout.svelte already imports the four CSS layers + favicon and renders `{@render children()}` — PRESERVE all of it; only ADD the ThemeToggle import + one `<ThemeToggle />` render.
</interfaces>

<key_facts>
- Focus retention is FREE: because the same <button> node persists across toggles (we mutate attributes, never replace the node), focus never leaves it — no manual focus management. RESEARCH "Focus retention" (HIGH).
- Announce via one visually-hidden aria-live="polite" region — aria-pressed alone announces "pressed/not pressed", opaque for a theme NAME. RESEARCH "Announcement".
- Keep the visible label theme-agnostic-safe against hydration: aria-pressed carries state; the label text is derived from the store which is seeded from the DOM attribute at hydration (initial()), so no ~100ms label swap. RESEARCH Pitfall 1.
- type="button" prevents accidental form submit when the toggle later sits inside a header that may contain a form.
- Target size >= 24x24 CSS px is WCAG 2.2 2.5.8; use min 44px (stronger heuristic).
- aria-pressed is preferred over role="switch"/aria-checked (better SR support). RESEARCH "Accessible Toggle Pattern" (HIGH).
</key_facts>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: ThemeToggle.svelte — native aria-pressed button + polite live region (THEME-06)</name>
  <read_first>
    - .planning/phases/02-design-system-dual-theme/02-RESEARCH.md ("Accessible Toggle Pattern (THEME-06)" full component, "Pitfall 1")
    - src/lib/theme/theme.svelte.ts (the store API this consumes: theme.current, theme.toggle())
    - e2e/theme.spec.ts (the "toggle a11y" test this must satisfy: aria-pressed flips, focus retained, live region announces)
  </read_first>
  <files>src/lib/theme/ThemeToggle.svelte</files>
  <behavior>
    - Renders a native <button type="button"> with aria-pressed reflecting whether the current theme is 'premium'.
    - Clicking / Enter / Space calls theme.toggle() and updates aria-pressed.
    - After a toggle, a visually-hidden aria-live="polite" region contains "Premium theme enabled" or "Accessible theme enabled".
    - Focus remains on the button after activation (same node persists).
    - Focus ring uses --focus-ring-width + --color-focus; hit area min 44px each axis.
  </behavior>
  <action>
    Create `src/lib/theme/ThemeToggle.svelte` with EXACTLY:
    ```svelte
    <script lang="ts">
      import { theme } from './theme.svelte.ts';

      let announce = $state('');
      const isPremium = $derived(theme.current === 'premium');

      function onClick() {
        theme.toggle();
        announce = `${theme.current === 'premium' ? 'Premium' : 'Accessible'} theme enabled`;
      }
    </script>

    <button
      type="button"
      class="theme-toggle"
      aria-pressed={isPremium}
      onclick={onClick}
    >
      <span>Theme: {isPremium ? 'Premium' : 'Accessible'}</span>
    </button>

    <!-- Polite live region: visually hidden, announced by AT. One per app. -->
    <div aria-live="polite" class="sr-only">{announce}</div>

    <style>
      .theme-toggle {
        /* WCAG 2.2 2.5.8 Target Size: >= 24x24 CSS px; 44px is the stronger heuristic */
        min-block-size: 44px;
        min-inline-size: 44px;
        padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
        border: 1px solid var(--color-border, currentColor);
        border-radius: var(--radius, 4px);
        background: var(--color-surface, transparent);
        color: var(--color-text, inherit);
        font: inherit;
        cursor: pointer;
      }
      .theme-toggle:hover {
        border-color: var(--color-accent, currentColor);
      }
      .theme-toggle:focus-visible {
        outline: var(--focus-ring-width, 2px) solid var(--color-focus, currentColor);
        outline-offset: 2px;
      }
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
        border: 0;
      }
    </style>
    ```
    Do NOT use `role="switch"`/`aria-checked`, a `<div>` with keydown handlers, or icon assets.
  </action>
  <verify>
    <automated>grep -q "aria-pressed={isPremium}" src/lib/theme/ThemeToggle.svelte && grep -q "theme.toggle()" src/lib/theme/ThemeToggle.svelte && grep -q 'aria-live="polite"' src/lib/theme/ThemeToggle.svelte && grep -q 'type="button"' src/lib/theme/ThemeToggle.svelte && grep -q "min-inline-size: 44px" src/lib/theme/ThemeToggle.svelte && ! grep -q 'role="switch"' src/lib/theme/ThemeToggle.svelte</automated>
  </verify>
  <acceptance_criteria>
    - `grep 'type="button"' src/lib/theme/ThemeToggle.svelte` present AND `grep "aria-pressed={isPremium}" src/lib/theme/ThemeToggle.svelte` present
    - `grep "theme.toggle()" src/lib/theme/ThemeToggle.svelte` present (drives the 02-02 store)
    - `grep 'aria-live="polite"' src/lib/theme/ThemeToggle.svelte` present AND `grep "theme enabled" src/lib/theme/ThemeToggle.svelte` present (plain-language announcement)
    - `grep "min-inline-size: 44px" src/lib/theme/ThemeToggle.svelte` AND `grep "min-block-size: 44px" src/lib/theme/ThemeToggle.svelte` present (target size)
    - `grep ":focus-visible" src/lib/theme/ThemeToggle.svelte` present AND `grep -- "--focus-ring-width" src/lib/theme/ThemeToggle.svelte` present (tokenized focus ring)
    - `grep -E 'role="switch"|aria-checked' src/lib/theme/ThemeToggle.svelte` returns NOTHING (native button pattern held)
  </acceptance_criteria>
  <done>ThemeToggle.svelte is a native aria-pressed button that toggles the store, announces the resulting theme via a polite live region, meets 2.5.8 target size, and uses the tokenized focus ring — no switch role, no div-button, no icon assets.</done>
</task>

<task type="auto">
  <name>Task 2: Mount ThemeToggle in +layout.svelte and prove the full THEME suite (THEME-01)</name>
  <read_first>
    - src/routes/+layout.svelte (current: four CSS imports + favicon + {@render children()} — preserve ALL of it)
    - src/lib/theme/ThemeToggle.svelte (created in Task 1)
    - e2e/theme.spec.ts (full suite — all THEME-01..06 tests must pass after this)
  </read_first>
  <files>src/routes/+layout.svelte</files>
  <action>
    Update `src/routes/+layout.svelte` to import and render `<ThemeToggle />` so the control appears on every page (THEME-01). Preserve the four CSS imports, the favicon import/link, `$props()`, and `{@render children()}`. Result EXACTLY:
    ```svelte
    <script lang="ts">
      import '$lib/styles/reset.css';
      import '$lib/styles/tokens/base.css';
      import '$lib/styles/theme-premium.css';
      import '$lib/styles/theme-accessible.css';
      import favicon from '$lib/assets/favicon.svg';
      import ThemeToggle from '$lib/theme/ThemeToggle.svelte';

      let { children } = $props();
    </script>

    <svelte:head>
      <link rel="icon" href={favicon} />
    </svelte:head>

    <ThemeToggle />

    {@render children()}
    ```
    NOTE FOR PHASE 3: this is a temporary top-of-layout mount purely to make the control globally present and testable now; Phase 3 (PAGE-08 shell) relocates `<ThemeToggle />` into the Header/Nav — do not build that shell here.

    Then prove the full Phase-2 theme suite and static build are green:
    ```bash
    npm run check
    npm run test:unit
    npx playwright test --config playwright.theme.config.ts
    npm run build
    ```
  </action>
  <verify>
    <automated>grep -q "import ThemeToggle from '\$lib/theme/ThemeToggle.svelte'" src/routes/+layout.svelte && grep -q "<ThemeToggle />" src/routes/+layout.svelte && grep -q "{@render children()}" src/routes/+layout.svelte && npx playwright test --config playwright.theme.config.ts && npm run build</automated>
  </verify>
  <acceptance_criteria>
    - `grep "import ThemeToggle from '\$lib/theme/ThemeToggle.svelte'" src/routes/+layout.svelte` present
    - `grep "<ThemeToggle />" src/routes/+layout.svelte` present (rendered in layout → on every page, THEME-01)
    - +layout.svelte still imports all four CSS layers AND `import favicon` AND renders `{@render children()}` (nothing regressed from 02-01)
    - `npx playwright test --config playwright.theme.config.ts` exits 0 — ALL of peer-designs, no-flash, accessible-first, persists, AND toggle-a11y pass (THEME-01..06 end to end)
    - `npm run test:unit` exits 0 AND `npm run check` exits 0
    - `npm run build` exits 0 (fully static, no un-prerendered route)
  </acceptance_criteria>
  <done>+layout.svelte mounts <ThemeToggle/> globally with all 02-01 imports preserved; the full Phase-2 Playwright theme suite and unit tests pass and the static build is green — all six THEME requirements verified end to end.</done>
</task>

</tasks>

<verification>
- `npx playwright test --config playwright.theme.config.ts` passes the WHOLE spec: peer-designs (THEME-03), no-flash (THEME-04), accessible-first (THEME-05), persists (THEME-02), toggle-a11y (THEME-01/06).
- `npm run test:unit` and `npm run check` green; `npm run build` exits 0.
- Toggle is a native aria-pressed button, keyboard-operable, focus retained, announces via aria-live; target >= 24px.
</verification>

<success_criteria>
- A keyboard/SR-friendly control on every page switches themes, announces the result, and keeps focus — THEME-01 and THEME-06 satisfied.
- Combined with 02-01/02-02, the full dual-theme system (peer designs, no-flash, persistence, accessible-first default, accessible toggle) is verified end to end and the build stays static-green.
</success_criteria>

<output>
After completion, create `.planning/phases/02-design-system-dual-theme/02-03-SUMMARY.md` recording: the toggle pattern shipped (native aria-pressed button + polite live region, focus-retention rationale), the temporary +layout mount (flagged for Phase-3 relocation into the Header), and confirmation the full Phase-2 theme suite + build are green (all six THEME reqs verified).
</output>
