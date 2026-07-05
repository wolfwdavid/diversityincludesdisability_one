---
phase: 03-app-shell-content-pipeline-pages
plan: 04
type: execute
wave: 2
depends_on: [03-01]
files_modified:
  - src/routes/get-involved/+page.svelte
  - src/lib/data/events.ts
  - src/routes/events/+page.svelte
  - src/routes/contact/+page.svelte
  - e2e/scaffold.spec.ts
autonomous: true
requirements: [PAGE-04, PAGE-05, PAGE-07]
must_haves:
  truths:
    - "Get Involved shows an authored volunteer blurb and a clearly-labeled external Donate link with rel=\"noopener noreferrer\" (placeholder URL, NO embedded checkout)"
    - "Events renders a list from a data module when events exist and a clear empty-state message when none, structured to render real events when added"
    - "Contact is a fully accessible form SCAFFOLD: every field has an associated <label>, error slots are wired via aria-describedby, and a mailto:emanrimawi@gmail.com fallback is shown — with NO submit handler / no backend (Phase 4)"
    - "Each page has one <h1> with ordered headings and every internal link is base-prefixed"
  artifacts:
    - path: "src/routes/get-involved/+page.svelte"
      provides: "Volunteer info + external donate link-out placeholder (PAGE-04)"
      contains: "rel=\"noopener noreferrer\""
    - path: "src/lib/data/events.ts"
      provides: "Typed events data array + empty-state ready structure (PAGE-05)"
      contains: "export interface"
    - path: "src/routes/events/+page.svelte"
      provides: "Events list + empty-state (PAGE-05)"
      contains: "No upcoming events"
    - path: "src/routes/contact/+page.svelte"
      provides: "Accessible contact form scaffold, labels + aria-describedby, no backend (PAGE-07)"
      contains: "aria-describedby"
    - path: "e2e/scaffold.spec.ts"
      provides: "Asserts donate rel=noopener, labeled contact fields, no form action"
      contains: "noopener"
  key_links:
    - from: "src/routes/events/+page.svelte"
      to: "src/lib/data/events.ts"
      via: "import events + {#each}/{:else} empty-state"
      pattern: "import { events }"
    - from: "src/routes/contact/+page.svelte"
      to: "emanrimawi@gmail.com"
      via: "mailto fallback link"
      pattern: "mailto:emanrimawi@gmail.com"
---

<objective>
Build the three scaffold pages that stand in for Phase-4 functionality: Get Involved / Donate with a volunteer blurb + a safe external Donate link-out placeholder (PAGE-04); an Events page driven by a typed data module with a proper empty-state (PAGE-05); and a fully accessible Contact FORM SCAFFOLD — labels + `aria-describedby` error slots + a mailto fallback — with NO submit wiring (PAGE-07). All base-prefixed, single-h1, token-only.

Purpose: These pages complete the seven-page site so it stands alone before forms (Phase 4) and 3D (Phase 5). The Contact form is markup-and-a11y-complete so Phase 4 only adds the submit backend; the Donate link-out is a clearly-labeled external anchor now, never an embedded checkout.
Output: real `+page.svelte` for `/get-involved`, `/events`, `/contact`; `src/lib/data/events.ts`; `e2e/scaffold.spec.ts`.

SCOPE FENCE: NO form submit handler, NO fetch/POST, NO Web3Forms/Formspree wiring, NO real donation URL (all Phase 4). NO backend, no `+page.server.ts`, no form actions. Authored copy for Get Involved/Events must be flagged as placeholder. Do NOT touch the shell, pipeline, or the Home/About/Programs pages. Tokens + `.button`/`.container` utilities only.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@.planning/phases/03-app-shell-content-pipeline-pages/03-RESEARCH.md
@.planning/phases/03-app-shell-content-pipeline-pages/03-VALIDATION.md
@src/lib/styles/tokens/base.css

<key_facts>
- Base-prefix EVERY internal link: `import { base } from '$app/paths'`, `href="{base}/contact"`. (RESEARCH Pitfall 1.)
- Donate = external link-out placeholder: `<a href="#" rel="noopener noreferrer">Donate</a>` with a `TODO(Phase 4/FORM-04): real donation URL` comment. NEVER an embedded checkout. (RESEARCH PAGE-04.)
- Contact is a SCAFFOLD only: labeled fields + `aria-describedby` error slots + mailto:emanrimawi@gmail.com fallback. NO submit handler (Phase 4 wires FORM-01..03). The `<form>` must NOT have an `action` or `on:submit` that posts anywhere.
- Events: `src/lib/data/events.ts` with 1-2 clearly-fictional sample events + an empty-state string. The page renders `{#each}` ... `{:else}` empty-state so it works with zero real events. (RESEARCH PAGE-05.)
- The layout supplies header/main/footer; pages render only their own `<h1>` + sections. One h1 each; ordered h2s.
- Real contact email is `emanrimawi@gmail.com` (HIGH confidence).
</key_facts>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Get Involved / Donate — volunteer info + safe external donate link-out (PAGE-04)</name>
  <read_first>
    - src/routes/get-involved/+page.svelte (03-01 stub — replace it)
    - .planning/phases/03-app-shell-content-pipeline-pages/03-RESEARCH.md ("Get Involved / Donate — AUTHORED PLACEHOLDER", "FORM-04 donate is external link-out")
  </read_first>
  <files>src/routes/get-involved/+page.svelte</files>
  <action>
    Replace `src/routes/get-involved/+page.svelte` with EXACTLY (authored+flagged volunteer copy; external Donate link-out placeholder with rel="noopener noreferrer"; single h1; base-prefixed internal links):
    ```svelte
    <script lang="ts">
      import { base } from '$app/paths';
    </script>

    <svelte:head>
      <title>Get Involved — Diversity Includes Disability</title>
      <meta name="description" content="Volunteer, invite Eman to speak, partner with us, or donate to support intersectional disability equity." />
    </svelte:head>

    <h1>Get Involved</h1>
    <!-- COPY: AUTHORED PLACEHOLDER — confirm with organization before launch. -->
    <p class="lede">Volunteer, invite Eman to speak, partner with us, or donate — every kind of support moves the work forward.</p>
    <p class="disclaimer"><em>Placeholder copy — pending organization sign-off.</em></p>

    <section aria-labelledby="ways">
      <h2 id="ways">Ways to help</h2>
      <ul>
        <li><strong>Volunteer</strong> your time and skills for disabled-led advocacy.</li>
        <li><strong>Invite Eman</strong> to speak or run a training — see <a href="{base}/programs">Programs &amp; Services</a>.</li>
        <li><strong>Partner</strong> with us on accessibility and inclusion — <a href="{base}/contact">contact us</a>.</li>
      </ul>
    </section>

    <section aria-labelledby="donate">
      <h2 id="donate">Donate</h2>
      <p>Support our work directly. Donations open on our external giving platform.</p>
      <!-- TODO(Phase 4/FORM-04): replace href="#" with the real external donation URL. No embedded checkout. -->
      <p><a class="button" href="#" rel="noopener noreferrer">Donate (external)</a></p>
      <p class="disclaimer"><em>Donation link is a placeholder — the giving platform URL is wired in Phase 4.</em></p>
    </section>

    <style>
      .lede { font-size: 1.125em; max-inline-size: var(--measure); }
      .disclaimer { color: var(--color-text-muted); }
      section { margin-block-start: var(--space-6); }
      ul { padding-inline-start: var(--space-6); }
      li { margin-block: var(--space-2); }
    </style>
    ```
  </action>
  <verify>
    <automated>test $(grep -c "<h1>" src/routes/get-involved/+page.svelte) -eq 1 && grep -q 'rel="noopener noreferrer"' src/routes/get-involved/+page.svelte && grep -q "FORM-04" src/routes/get-involved/+page.svelte && grep -q 'href="{base}/programs"' src/routes/get-involved/+page.svelte && ! grep -qi "iframe\|checkout\|stripe\|paypal-button" src/routes/get-involved/+page.svelte</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "<h1>" src/routes/get-involved/+page.svelte` returns 1 AND two ordered h2 sections (ways, donate)
    - `grep 'rel="noopener noreferrer"' src/routes/get-involved/+page.svelte` present on the Donate anchor (clearly labeled "Donate (external)")
    - `grep "TODO(Phase 4/FORM-04)" src/routes/get-involved/+page.svelte` present (real URL deferred) AND no real donation URL committed
    - NO embedded checkout: `grep -i "iframe\|checkout\|stripe\|paypal" src/routes/get-involved/+page.svelte` returns NOTHING
    - `grep -i "placeholder copy" src/routes/get-involved/+page.svelte` present (authored copy flagged) AND base-prefixed internal links present
  </acceptance_criteria>
  <done>Get Involved renders authored+flagged volunteer copy, a "ways to help" list with base-prefixed links, and a clearly-labeled external Donate link-out placeholder (rel="noopener noreferrer", TODO for Phase-4 URL, no embedded checkout).</done>
</task>

<task type="auto">
  <name>Task 2: Events — typed data module + list with empty-state (PAGE-05)</name>
  <read_first>
    - src/routes/events/+page.svelte (03-01 stub — replace it)
    - .planning/phases/03-app-shell-content-pipeline-pages/03-RESEARCH.md ("Events — AUTHORED PLACEHOLDER, structure ready")
  </read_first>
  <files>src/lib/data/events.ts, src/routes/events/+page.svelte</files>
  <action>
    Create `src/lib/data/events.ts` (typed array; 1-2 clearly-fictional sample events flagged in a comment; empty-state ready — the page handles `events.length === 0`):
    ```ts
    // src/lib/data/events.ts — events data. SAMPLE entries are fictional placeholders; replace with real events.
    export interface EventItem {
      title: string;
      date: string;        // ISO 'YYYY-MM-DD'
      location: string;
      description: string;
      url?: string;        // optional external link (rel=noopener at render)
    }

    // NOTE: sample/fictional — confirm/replace with real events before launch.
    export const events: EventItem[] = [
      {
        title: 'Intersectional Disability Equity Training (sample)',
        date: '2026-09-15',
        location: 'Online',
        description: 'A sample listing to demonstrate the events layout. Replace with a real event.'
      },
      {
        title: 'Accessible Transit Panel (sample)',
        date: '2026-10-02',
        location: 'New York, NY',
        description: 'A second sample listing. Replace with a real event.'
      }
    ];
    ```

    Replace `src/routes/events/+page.svelte` with EXACTLY (renders the list newest-first, or an empty-state; single h1; external event links get rel=noopener):
    ```svelte
    <script lang="ts">
      import { events, type EventItem } from '$lib/data/events';
      const sorted: EventItem[] = [...events].sort((a, b) => +new Date(a.date) - +new Date(b.date));
    </script>

    <svelte:head>
      <title>Events — Diversity Includes Disability</title>
      <meta name="description" content="Upcoming events, trainings, and panels from Diversity Includes Disability." />
    </svelte:head>

    <h1>Events</h1>
    <p class="disclaimer"><em>Sample events shown below are placeholders — pending real listings.</em></p>

    {#if sorted.length > 0}
      <ul class="events">
        {#each sorted as ev}
          <li>
            <h2>{ev.title}</h2>
            <p class="meta"><time datetime={ev.date}>{ev.date}</time> · {ev.location}</p>
            <p>{ev.description}</p>
            {#if ev.url}
              <p><a class="button is-secondary" href={ev.url} rel="noopener noreferrer">Event details</a></p>
            {/if}
          </li>
        {/each}
      </ul>
    {:else}
      <p class="empty">No upcoming events — check back soon.</p>
    {/if}

    <style>
      .disclaimer { color: var(--color-text-muted); }
      .events { list-style: none; padding: 0; display: grid; gap: var(--space-6); margin-block-start: var(--space-6); }
      .events li { padding: var(--space-4); border: 1px solid var(--color-border); border-radius: var(--radius); }
      .meta { color: var(--color-text-muted); }
      .empty { margin-block-start: var(--space-6); font-size: 1.125em; }
    </style>
    ```
  </action>
  <verify>
    <automated>test -f src/lib/data/events.ts && test $(grep -c "<h1>" src/routes/events/+page.svelte) -eq 1 && grep -q "export interface EventItem" src/lib/data/events.ts && grep -q "import { events" src/routes/events/+page.svelte && grep -q "No upcoming events" src/routes/events/+page.svelte && grep -q "{:else}" src/routes/events/+page.svelte</automated>
  </verify>
  <acceptance_criteria>
    - `grep "export interface EventItem" src/lib/data/events.ts` AND `grep "export const events" src/lib/data/events.ts` present (typed data module)
    - Sample events flagged fictional: `grep -i "sample\|fictional\|placeholder" src/lib/data/events.ts` present
    - `grep -c "<h1>" src/routes/events/+page.svelte` returns 1
    - `grep "{#if sorted.length" src/routes/events/+page.svelte` AND `grep "{:else}" src/routes/events/+page.svelte` AND `grep "No upcoming events" src/routes/events/+page.svelte` present (empty-state ready)
    - `grep "import { events" src/routes/events/+page.svelte` present (page consumes the data module)
    - External event links (when present) carry `rel="noopener noreferrer"`
  </acceptance_criteria>
  <done>Events renders a typed data-driven list (sorted, sample entries flagged) with a working `{:else}` empty-state, single h1; structure renders real events when the data module is updated.</done>
</task>

<task type="auto">
  <name>Task 3: Contact — accessible form scaffold (labels + aria-describedby, no backend) (PAGE-07) + scaffold spec</name>
  <read_first>
    - src/routes/contact/+page.svelte (03-01 stub — replace it)
    - .planning/phases/03-app-shell-content-pipeline-pages/03-RESEARCH.md ("Contact — accessible form SCAFFOLD, no submit; mailto fallback")
    - src/lib/theme/ThemeToggle.svelte (existing `.sr-only` pattern; app.css also provides global `.sr-only`)
  </read_first>
  <files>src/routes/contact/+page.svelte, e2e/scaffold.spec.ts</files>
  <action>
    Replace `src/routes/contact/+page.svelte` with EXACTLY (accessible form SCAFFOLD — every field labeled, error slots wired via aria-describedby, mailto fallback; NO submit handler, NO action, NO fetch — Phase 4 wires the backend):
    ```svelte
    <script lang="ts">
      // SCAFFOLD ONLY — no submit handler / backend. Phase 4 (FORM-01..03) wires Web3Forms + validation.
      // Prevent a naive full-page GET submit while the backend is absent.
      function onsubmit(e: SubmitEvent) {
        e.preventDefault(); // no-op until Phase 4
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
    <p class="disclaimer"><em>The form below is a scaffold — submission is wired in a later phase. Use the email link above meanwhile.</em></p>

    <form novalidate {onsubmit}>
      <div class="field">
        <label for="c-name">Name</label>
        <input id="c-name" name="name" type="text" autocomplete="name" aria-describedby="c-name-error" required />
        <p id="c-name-error" class="error" role="alert" aria-live="polite"></p>
      </div>

      <div class="field">
        <label for="c-email">Email</label>
        <input id="c-email" name="email" type="email" autocomplete="email" aria-describedby="c-email-error" required />
        <p id="c-email-error" class="error" role="alert" aria-live="polite"></p>
      </div>

      <div class="field">
        <label for="c-message">Message</label>
        <textarea id="c-message" name="message" rows="6" aria-describedby="c-message-error" required></textarea>
        <p id="c-message-error" class="error" role="alert" aria-live="polite"></p>
      </div>

      <button class="button" type="submit">Send message</button>
      <p class="disclaimer"><em>(Sending is disabled until the Phase-4 backend is connected.)</em></p>
    </form>

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
      input:focus-visible, textarea:focus-visible {
        outline: var(--focus-ring-width) solid var(--color-focus); outline-offset: 2px;
      }
      .error { color: var(--color-text-muted); min-height: 1em; margin: 0; }
    </style>
    ```

    Create `e2e/scaffold.spec.ts` (asserts PAGE-04 donate rel + PAGE-07 labeled fields + no-backend):
    ```ts
    import { test, expect } from '@playwright/test';

    test('Donate is a clearly-labeled external link with rel=noopener (PAGE-04)', async ({ page }) => {
      await page.goto('./get-involved/');
      const donate = page.getByRole('link', { name: /donate/i });
      await expect(donate).toBeVisible();
      await expect(donate).toHaveAttribute('rel', /noopener/);
    });

    test('Contact fields are all labeled and wired with aria-describedby (PAGE-07)', async ({ page }) => {
      await page.goto('./contact/');
      for (const label of [/name/i, /email/i, /message/i]) {
        await expect(page.getByLabel(label)).toBeVisible();
      }
      await expect(page.locator('input#c-name')).toHaveAttribute('aria-describedby', 'c-name-error');
      await expect(page.getByRole('link', { name: /emanrimawi@gmail.com/i })).toBeVisible();
    });

    test('Contact form has no backend action (scaffold only)', async ({ page }) => {
      await page.goto('./contact/');
      const action = await page.locator('form').getAttribute('action');
      expect(action).toBeNull(); // no POST target until Phase 4
    });
    ```

    Then prove build + scaffold spec:
    ```bash
    npm run build
    npx playwright test --config playwright.theme.config.ts e2e/scaffold.spec.ts
    ```
  </action>
  <verify>
    <automated>test $(grep -c "<h1>" src/routes/contact/+page.svelte) -eq 1 && grep -q "mailto:emanrimawi@gmail.com" src/routes/contact/+page.svelte && grep -q 'aria-describedby="c-name-error"' src/routes/contact/+page.svelte && grep -q "for=\"c-name\"" src/routes/contact/+page.svelte && ! grep -q "action=" src/routes/contact/+page.svelte && ! grep -qi "fetch\|web3forms\|formspree\|+page.server" src/routes/contact/+page.svelte && test -f e2e/scaffold.spec.ts && npm run build && npx playwright test --config playwright.theme.config.ts e2e/scaffold.spec.ts</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "<h1>" src/routes/contact/+page.svelte` returns 1
    - Every field labeled: `grep 'for="c-name"'`, `grep 'for="c-email"'`, `grep 'for="c-message"'` each present, matching `id="c-name/email/message"`
    - Error slots wired: `grep 'aria-describedby="c-name-error"'` present AND `<p id="c-name-error" ...>` exists for each field
    - `grep "mailto:emanrimawi@gmail.com" src/routes/contact/+page.svelte` present (real email fallback)
    - NO backend: `grep "action=" src/routes/contact/+page.svelte` returns NOTHING AND `grep -i "fetch\|web3forms\|formspree" src/routes/contact/+page.svelte` returns NOTHING AND no `+page.server.ts` created
    - `npm run build` exits 0 AND `npx playwright test --config playwright.theme.config.ts e2e/scaffold.spec.ts` exits 0 (PAGE-04 + PAGE-07)
    - Shell spec still green: `npx playwright test --config playwright.theme.config.ts e2e/shell.spec.ts` exits 0 on /get-involved, /events, /contact
  </acceptance_criteria>
  <done>Contact renders an accessible form scaffold (labeled fields, aria-describedby error slots, role=alert live regions, mailto fallback) with NO backend/action; `e2e/scaffold.spec.ts` proves PAGE-04 donate-rel and PAGE-07 labeling; build green.</done>
</task>

</tasks>

<verification>
- `npm run build` exits 0 with real Get Involved / Events / Contact pages.
- `npx playwright test --config playwright.theme.config.ts e2e/scaffold.spec.ts` green — donate rel=noopener (PAGE-04), contact fields labeled + aria-describedby + mailto (PAGE-07), no form action.
- Events renders sample list + `{:else}` empty-state (PAGE-05).
- `e2e/shell.spec.ts` still green on all three pages; every link base-prefixed; no backend/checkout/3D; tokens-only.
</verification>

<success_criteria>
- Seven-page site is now navigable end-to-end (with 03-05 blog index) and stands alone before Phase-4 forms/Phase-5 3D.
- Contact form is a11y-complete so Phase 4 only adds submit; Donate is a safe labeled external link-out, never an embedded checkout.
</success_criteria>

<output>
After completion, create `.planning/phases/03-app-shell-content-pipeline-pages/03-04-SUMMARY.md` recording: the donate link-out placeholder convention (rel=noopener + TODO Phase-4 URL, no checkout), the `events.ts` data-module + empty-state pattern (sample events flagged), and the Contact scaffold's a11y contract (label/for pairing, aria-describedby error slots, role=alert, mailto fallback, NO backend). Note the scaffold spec is the PAGE-04/07 gate.
</output>
