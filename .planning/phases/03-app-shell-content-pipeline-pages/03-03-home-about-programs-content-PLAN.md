---
phase: 03-app-shell-content-pipeline-pages
plan: 03
type: execute
wave: 2
depends_on: [03-01]
files_modified:
  - src/routes/+page.svelte
  - src/routes/about/+page.svelte
  - src/routes/programs/+page.svelte
  - e2e/content.spec.ts
autonomous: true
requirements: [PAGE-01, PAGE-02, PAGE-03]
must_haves:
  truths:
    - "The Home page shows a static (non-3D) hero placeholder with the org name, an authored mission summary, and primary CTA buttons linking to Get Involved and About"
    - "The About page presents Eman Rimawi-Doster's REAL bio (bilateral amputee 2014, NYLPI Access-A-Ride, Exec Dir Harlem ILC + DID, lupus) and the org mission, with mission prose clearly flagged as an authored placeholder for org sign-off"
    - "The Programs & Services page lists all FOUR real service names (Intersectional Disability Equity & Inclusion trainings/facilitation; Disability Consulting; Modeling for Representation; Speaker & Panelist)"
    - "Every internal link on these three pages is base-prefixed via $app/paths; each page has exactly one <h1> and ordered h2 sections"
  artifacts:
    - path: "src/routes/+page.svelte"
      provides: "Home: static hero placeholder + mission summary + CTAs (PAGE-01)"
      contains: "class=\"button\""
    - path: "src/routes/about/+page.svelte"
      provides: "About/Mission with real Eman Rimawi bio + flagged authored mission (PAGE-02)"
      contains: "Rimawi"
    - path: "src/routes/programs/+page.svelte"
      provides: "Programs & Services — four real services (PAGE-03)"
      contains: "Disability Consulting"
    - path: "e2e/content.spec.ts"
      provides: "Content assertions: home CTAs, bio keywords, four service names"
      contains: "Modeling for Representation"
  key_links:
    - from: "src/routes/+page.svelte"
      to: "/get-involved and /about"
      via: "base-prefixed CTA buttons"
      pattern: "href=\"{base}/get-involved\""
    - from: "src/routes/programs/+page.svelte"
      to: "the four real services"
      via: "one h2 per service"
      pattern: "Speaker"
---

<objective>
Replace the Home, About/Mission, and Programs & Services stubs with real ported DID content: a static token-styled Home hero placeholder + mission summary + primary CTAs (PAGE-01); the About page with Eman Rimawi-Doster's real bio and an authored-but-flagged mission (PAGE-02); and the Programs page listing the four real services (PAGE-03). All links base-prefixed, all pages single-h1 with ordered headings, composed from existing tokens + the `.button`/`.container` utilities from 03-01.

Purpose: These are the org's front-door pages — the ones a funder or partner reads first. The bio and services are REAL (port verbatim from research); the mission is authored and must be visibly flagged so the org can approve wording before launch.
Output: real `+page.svelte` for `/`, `/about`, `/programs`; `e2e/content.spec.ts` proving the real strings render.

SCOPE FENCE: This is the STATIC hero placeholder, NOT the Phase-5 3D hero (no Threlte, no canvas, no capability gating). Do NOT touch the shell (`+layout.svelte`, Header/Footer, app.css, nav.ts), the pipeline (`svelte.config.js`, posts), or the other route pages (get-involved/events/contact/blog are 03-04/05). Compose ONLY from existing tokens + `.button`/`.container`/`.prose` utilities — no new design system.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@.planning/phases/03-app-shell-content-pipeline-pages/03-RESEARCH.md
@.planning/phases/03-app-shell-content-pipeline-pages/03-VALIDATION.md
@src/routes/+page.svelte
@src/routes/about/+page.svelte
@src/lib/styles/tokens/base.css

<key_facts>
- Base-prefix EVERY internal link: `import { base } from '$app/paths'`, `href="{base}/about"`. (RESEARCH Pitfall 1.)
- The layout already provides header/nav/main/footer + `.container.prose` wrapper around `{@render children()}`. Pages render their `<h1>` + sections ONLY — never another header/main/footer, never a second h1.
- `.button` and `.button.is-secondary` classes exist in app.css (03-01) — use them for CTAs (>=44px targets, token colors).
- REAL bio facts (HIGH confidence) and the suggested authored bio prose are in RESEARCH "Real DID Content". Port the bio prose verbatim; keep the "double amputee since 2014 / NYLPI Access-A-Ride / Exec Dir Harlem ILC / lupus" facts.
- The four service NAMES are verbatim from the live site (RESEARCH): (1) Intersectional Disability Equity and Inclusion trainings and facilitation, (2) Disability Consulting, (3) Modeling for Representation, (4) Speaker and Panelist.
- Mission prose is AUTHORED PLACEHOLDER — render it AND flag it (visible note + HTML comment) for org sign-off.
- Home hero is a STATIC placeholder here; Phase 5 later swaps in the 3D hero behind a capability gate — do not build that now.
</key_facts>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Home page — static hero placeholder + mission summary + CTAs (PAGE-01)</name>
  <read_first>
    - src/routes/+page.svelte (current Phase-1 skeleton — replace it; note the `import { base }` pattern)
    - .planning/phases/03-app-shell-content-pipeline-pages/03-RESEARCH.md ("Phase Requirements" PAGE-01 row, "Mission (AUTHORED PLACEHOLDER)")
    - src/lib/styles/app.css semantics for `.button` / `.button.is-secondary` (from 03-01)
  </read_first>
  <files>src/routes/+page.svelte</files>
  <action>
    Replace `src/routes/+page.svelte` with EXACTLY (static hero placeholder — NO 3D; base-prefixed CTAs; single h1; mission summary flagged authored):
    ```svelte
    <script lang="ts">
      import { base } from '$app/paths';
    </script>

    <svelte:head>
      <title>Diversity Includes Disability</title>
      <meta name="description" content="Intersectional disability equity — for and by disabled people. Training, consulting, representation, and public speaking." />
    </svelte:head>

    <!-- Static hero placeholder. The Phase-5 Premium 3D hero replaces this region behind a capability gate. -->
    <section class="hero">
      <h1>Diversity Includes Disability</h1>
      <!-- MISSION SUMMARY: AUTHORED PLACEHOLDER — confirm/replace with org-approved wording before launch. -->
      <p class="lede">
        Intersectional disability equity — for and by disabled people. Through training, consulting,
        representation, and public speaking, we help organizations move beyond compliance to genuine inclusion.
      </p>
      <p class="disclaimer"><em>Placeholder mission summary — pending organization sign-off.</em></p>

      <div class="cta-row">
        <a class="button" href="{base}/get-involved">Get Involved</a>
        <a class="button is-secondary" href="{base}/about">About Eman &amp; the mission</a>
      </div>
    </section>

    <section aria-labelledby="what-we-do">
      <h2 id="what-we-do">What we do</h2>
      <p>
        We deliver intersectional disability equity and inclusion trainings, disability consulting,
        modeling for representation, and speaking — centering the leadership of disabled people of color.
        <a href="{base}/programs">See our programs &amp; services</a>.
      </p>
    </section>

    <style>
      .hero { padding-block: var(--space-section) var(--space-8); }
      .lede { font-size: 1.25em; color: var(--color-text); max-inline-size: var(--measure); }
      .disclaimer { color: var(--color-text-muted); }
      .cta-row { display: flex; flex-wrap: wrap; gap: var(--space-4); margin-block-start: var(--space-6); }
      section + section { margin-block-start: var(--space-section); }
    </style>
    ```
  </action>
  <verify>
    <automated>grep -q "import { base } from '\$app/paths'" src/routes/+page.svelte && grep -q 'href="{base}/get-involved"' src/routes/+page.svelte && grep -q 'href="{base}/about"' src/routes/+page.svelte && grep -q 'class="button"' src/routes/+page.svelte && test $(grep -c "<h1>" src/routes/+page.svelte) -eq 1</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "<h1>" src/routes/+page.svelte` returns 1 (single h1)
    - `grep 'href="{base}/get-involved"' src/routes/+page.svelte` AND `grep 'href="{base}/about"' src/routes/+page.svelte` present (base-prefixed CTAs)
    - `grep 'class="button"' src/routes/+page.svelte` AND `grep 'is-secondary' src/routes/+page.svelte` present (primary + secondary CTA)
    - `grep -i "placeholder mission" src/routes/+page.svelte` present (mission flagged authored) AND an HTML comment marks the mission as authored
    - No 3D/canvas: `grep -i "canvas\|threlte\|three" src/routes/+page.svelte` returns NOTHING
  </acceptance_criteria>
  <done>Home renders a static hero placeholder (single h1, org name), an authored+flagged mission summary, base-prefixed primary/secondary CTAs to Get Involved and About, and a "what we do" section linking to Programs.</done>
</task>

<task type="auto">
  <name>Task 2: About / Mission — real Eman Rimawi bio + flagged authored mission (PAGE-02)</name>
  <read_first>
    - src/routes/about/+page.svelte (current stub — replace it)
    - .planning/phases/03-app-shell-content-pipeline-pages/03-RESEARCH.md ("Eman Rimawi-Doster bio" — port the suggested prose verbatim; "Mission (AUTHORED PLACEHOLDER)")
  </read_first>
  <files>src/routes/about/+page.svelte</files>
  <action>
    Replace `src/routes/about/+page.svelte` with EXACTLY (real bio prose from RESEARCH ported verbatim; mission rendered AND flagged; single h1; ordered h2s; base-prefixed link):
    ```svelte
    <script lang="ts">
      import { base } from '$app/paths';
    </script>

    <svelte:head>
      <title>About &amp; Mission — Diversity Includes Disability</title>
      <meta name="description" content="About Eman Rimawi-Doster, founder and Executive Director of Diversity Includes Disability, and the organization's mission." />
    </svelte:head>

    <h1>About &amp; Mission</h1>

    <section aria-labelledby="mission">
      <h2 id="mission">Our mission</h2>
      <!-- MISSION: AUTHORED PLACEHOLDER — the live site exposes no mission prose. Confirm/replace before launch. -->
      <p>
        Diversity Includes Disability advances intersectional disability equity — for and by disabled people.
        Through training, consulting, representation, and public speaking, we help organizations move beyond
        compliance to genuine inclusion, centering the leadership of disabled people of color.
      </p>
      <p class="disclaimer"><em>Placeholder mission statement — pending organization sign-off.</em></p>
    </section>

    <section aria-labelledby="founder">
      <h2 id="founder">About Eman Rimawi-Doster</h2>
      <p>
        Eman Rimawi-Doster is a disability-justice advocate, organizer, and the founder and Executive
        Director of Diversity Includes Disability — an organization built for and by disabled people. A mixed
        Black Palestinian woman, bilateral amputee, and person living with lupus, Eman has spent years as one
        of New York's most forceful voices for accessible transit, voting rights, and health equity, including
        leading the Access-A-Ride campaign at New York Lawyers for the Public Interest. She also serves as
        Executive Director of the Harlem Independent Living Center.
      </p>
      <p>
        Since becoming a double amputee in 2014, Eman has also launched an adaptive clothing line and works
        as a poet and graphic-novel creator.
      </p>
    </section>

    <section aria-labelledby="work">
      <h2 id="work">Our work</h2>
      <p>
        Explore our <a href="{base}/programs">programs &amp; services</a>, find out how to
        <a href="{base}/get-involved">get involved</a>, or <a href="{base}/contact">contact us</a>.
      </p>
    </section>
    ```
  </action>
  <verify>
    <automated>test $(grep -c "<h1>" src/routes/about/+page.svelte) -eq 1 && grep -q "Rimawi-Doster" src/routes/about/+page.svelte && grep -q "Access-A-Ride" src/routes/about/+page.svelte && grep -q "Harlem Independent Living Center" src/routes/about/+page.svelte && grep -qi "placeholder mission" src/routes/about/+page.svelte && grep -q 'href="{base}/programs"' src/routes/about/+page.svelte</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "<h1>" src/routes/about/+page.svelte` returns 1 AND three ordered `<h2 id=...>` sections (mission, founder, work) present
    - Real bio facts present: `grep "bilateral amputee" src/routes/about/+page.svelte`, `grep "Access-A-Ride" ...`, `grep "Harlem Independent Living Center" ...`, `grep "lupus" ...`, `grep "double amputee in 2014" ...` all present
    - `grep -i "placeholder mission" src/routes/about/+page.svelte` present AND an HTML comment flags the mission as authored (org sign-off)
    - `grep 'href="{base}/programs"' src/routes/about/+page.svelte` AND `grep 'href="{base}/get-involved"' ...` AND `grep 'href="{base}/contact"' ...` present (base-prefixed)
  </acceptance_criteria>
  <done>About page renders the real Eman Rimawi-Doster bio (all HIGH-confidence facts) plus the authored+flagged mission, with a single h1, three ordered h2 sections, and base-prefixed cross-links.</done>
</task>

<task type="auto">
  <name>Task 3: Programs & Services — four real services (PAGE-03) + content spec</name>
  <read_first>
    - src/routes/programs/+page.svelte (current stub — replace it)
    - .planning/phases/03-app-shell-content-pipeline-pages/03-RESEARCH.md ("Four services (verbatim service names from the live site)")
    - e2e/shell.spec.ts (heading-order test iterates programs — keep single h1 + ordered h2)
  </read_first>
  <files>src/routes/programs/+page.svelte, e2e/content.spec.ts</files>
  <action>
    Replace `src/routes/programs/+page.svelte` with EXACTLY (all four REAL service names, one h2 per service; single h1; base-prefixed CTA to contact):
    ```svelte
    <script lang="ts">
      import { base } from '$app/paths';
    </script>

    <svelte:head>
      <title>Programs &amp; Services — Diversity Includes Disability</title>
      <meta name="description" content="Intersectional disability equity trainings, disability consulting, modeling for representation, and speaking." />
    </svelte:head>

    <h1>Programs &amp; Services</h1>
    <p class="lede">We offer four core services, delivered for and by disabled people.</p>

    <section aria-labelledby="s-trainings">
      <h2 id="s-trainings">Intersectional Disability Equity and Inclusion trainings and facilitation</h2>
      <p>Trainings and facilitation that center intersectional disability equity — moving teams beyond compliance toward genuine inclusion.</p>
    </section>

    <section aria-labelledby="s-consulting">
      <h2 id="s-consulting">Disability Consulting</h2>
      <p>Consulting for organizations that want disabled-led guidance on access, policy, and inclusive practice.</p>
    </section>

    <section aria-labelledby="s-modeling">
      <h2 id="s-modeling">Modeling for Representation</h2>
      <p>Modeling work that expands authentic representation of disabled people.</p>
    </section>

    <section aria-labelledby="s-speaking">
      <h2 id="s-speaking">Speaker and Panelist</h2>
      <p>Keynotes, panels, and public speaking on disability justice, accessible transit, voting rights, and health equity.</p>
    </section>

    <p class="cta"><a class="button" href="{base}/contact">Book Eman or request a training</a></p>

    <style>
      .lede { font-size: 1.125em; color: var(--color-text-muted); max-inline-size: var(--measure); }
      section { margin-block-start: var(--space-6); }
      .cta { margin-block-start: var(--space-section); }
    </style>
    ```

    Create `e2e/content.spec.ts` (root-base content assertions for PAGE-01/02/03 real strings):
    ```ts
    import { test, expect } from '@playwright/test';

    test('Home shows the org name and base-prefixed CTAs (PAGE-01)', async ({ page }) => {
      await page.goto('./');
      await expect(page.locator('h1')).toHaveText(/Diversity Includes Disability/);
      await expect(page.getByRole('link', { name: /get involved/i }).first()).toBeVisible();
    });

    test('About shows the real Eman Rimawi bio (PAGE-02)', async ({ page }) => {
      await page.goto('./about/');
      await expect(page.locator('body')).toContainText('Rimawi-Doster');
      await expect(page.locator('body')).toContainText('Access-A-Ride');
      await expect(page.locator('body')).toContainText('Harlem Independent Living Center');
    });

    test('Programs lists all four real services (PAGE-03)', async ({ page }) => {
      await page.goto('./programs/');
      for (const name of [
        /Intersectional Disability Equity and Inclusion trainings and facilitation/,
        /Disability Consulting/,
        /Modeling for Representation/,
        /Speaker and Panelist/
      ]) {
        await expect(page.getByRole('heading', { name })).toBeVisible();
      }
    });
    ```

    Then prove build + content:
    ```bash
    npm run build
    npx playwright test --config playwright.theme.config.ts e2e/content.spec.ts
    ```
  </action>
  <verify>
    <automated>test $(grep -c "<h1>" src/routes/programs/+page.svelte) -eq 1 && grep -q "Disability Consulting" src/routes/programs/+page.svelte && grep -q "Modeling for Representation" src/routes/programs/+page.svelte && grep -q "Speaker and Panelist" src/routes/programs/+page.svelte && grep -q "Intersectional Disability Equity and Inclusion" src/routes/programs/+page.svelte && test -f e2e/content.spec.ts && npm run build && npx playwright test --config playwright.theme.config.ts e2e/content.spec.ts</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "<h1>" src/routes/programs/+page.svelte` returns 1 AND exactly four `<h2` service headings present
    - All four verbatim service names present: `grep "Intersectional Disability Equity and Inclusion trainings and facilitation"`, `grep "Disability Consulting"`, `grep "Modeling for Representation"`, `grep "Speaker and Panelist"` — each returns a match
    - `grep 'href="{base}/contact"' src/routes/programs/+page.svelte` present (base-prefixed CTA)
    - `grep "Modeling for Representation" e2e/content.spec.ts` present AND the spec asserts bio keywords + home CTA
    - `npm run build` exits 0 AND `npx playwright test --config playwright.theme.config.ts e2e/content.spec.ts` exits 0
    - Shell spec still green for these pages: `npx playwright test --config playwright.theme.config.ts e2e/shell.spec.ts` exits 0 (single h1 + heading order held on /, /about, /programs)
  </acceptance_criteria>
  <done>Programs page lists all four real services (single h1, four ordered h2s, base-prefixed CTA); `e2e/content.spec.ts` proves PAGE-01/02/03 real strings render; build green and shell heading-order held.</done>
</task>

</tasks>

<verification>
- `npm run build` exits 0 with real Home/About/Programs content.
- `npx playwright test --config playwright.theme.config.ts e2e/content.spec.ts` green — org name + Get Involved CTA (PAGE-01), real bio keywords (PAGE-02), four service names (PAGE-03).
- `e2e/shell.spec.ts` still green on /, /about, /programs (single h1, ordered headings, landmarks inherited from shell).
- Every internal link base-prefixed; no 3D/canvas; no new design system (tokens + `.button`/`.container`/`.prose` only).
</verification>

<success_criteria>
- The three front-door pages carry real, funder-ready content (bio + services verbatim), with the mission clearly flagged as authored pending org approval.
- Static hero placeholder is in place for Phase 5 to later upgrade behind a capability gate.
</success_criteria>

<output>
After completion, create `.planning/phases/03-app-shell-content-pipeline-pages/03-03-SUMMARY.md` recording: the ported bio (real facts) + the flagged authored mission (both Home summary and About), the four verbatim service names, the base-prefixed CTA convention, and confirmation the static hero placeholder (NOT the Phase-5 3D hero) is what shipped. Note `e2e/content.spec.ts` is the PAGE-01/02/03 content gate.
</output>
