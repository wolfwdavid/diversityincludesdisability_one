---
phase: 03-app-shell-content-pipeline-pages
plan: 05
type: execute
wave: 3
depends_on: [03-01, 03-02, 03-03, 03-04]
files_modified:
  - src/routes/blog/+page.svelte
  - e2e/blog-index.spec.ts
  - e2e/shell.spec.ts
autonomous: true
requirements: [PAGE-06, A11Y-03, A11Y-04]
must_haves:
  truths:
    - "The Blog/News index lists every non-draft post with its title (link), date, and summary, newest-first, and links to each post's own statically rendered page"
    - "Clicking a post title from the index navigates to /blog/<slug>/ and the post renders (index -> post link works with base prefix)"
    - "Across ALL seven pages: exactly one <h1>, heading levels never skip, header/nav/main/footer landmarks present, visible focus, and every interactive target >=24px (site-wide a11y pass green)"
    - "The full local + sub-path E2E suite (shell, content, scaffold, blog, blog-base, theme) and the no-shiki build scan all pass as the Phase-3 gate"
  artifacts:
    - path: "src/routes/blog/+page.svelte"
      provides: "Blog/News index: posts.ts-driven list with title/date/summary (PAGE-06, BLOG-02 presentation)"
      contains: "import { posts }"
    - path: "e2e/blog-index.spec.ts"
      provides: "Index lists posts with title/date/summary + navigates to a post"
      contains: "toContainText"
  key_links:
    - from: "src/routes/blog/+page.svelte"
      to: "src/lib/posts.ts"
      via: "import posts, {#each} render title/date/summary"
      pattern: "import { posts }"
    - from: "src/routes/blog/+page.svelte"
      to: "/blog/<slug>/"
      via: "base-prefixed post links"
      pattern: "href=\"{base}/blog/"
---

<objective>
Flesh out the Blog/News index (`blog/+page.svelte`) to list every post from `posts.ts` (title link, date, summary, newest-first) linking to each statically rendered post page (PAGE-06), then run the site-wide accessibility hardening pass: confirm one h1 + ordered headings + landmarks + visible focus + >=24px targets on all seven pages, and run the full E2E + build suite as the Phase-3 gate (A11Y-03/04). Fix any per-page heading-order or target-size regressions surfaced.

Purpose: This closes the phase — the blog gets its reader-facing index, and the cross-cutting a11y guarantees established in the shell (03-01) are verified to actually hold once all seven pages carry real content.
Output: real `blog/+page.svelte`; `e2e/blog-index.spec.ts`; finalized site-wide green suite; populated 03-VALIDATION sign-off.

SCOPE FENCE: Do NOT change the pipeline (`svelte.config.js`, `posts.ts`, `blog/[slug]/*`) or the shell primitives — this plan consumes them. Any page edits in the hardening pass must be MINIMAL and only to fix a real heading-order/target-size violation (not restyling). No new dependency, no new design system. Full WCAG axe/Lighthouse conformance is Phase 6 — this validates structure, not full AA.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@.planning/phases/03-app-shell-content-pipeline-pages/03-RESEARCH.md
@.planning/phases/03-app-shell-content-pipeline-pages/03-VALIDATION.md
@src/lib/posts.ts
@src/routes/blog/+page.svelte
@e2e/shell.spec.ts

<key_facts>
- `posts.ts` (03-02) exports `posts: PostMeta[]` already sorted newest-first, drafts filtered. Import and render; do NOT re-sort or re-implement.
- Base-prefix post links: `href="{base}/blog/{post.slug}/"` (trailingSlash='always' — include the trailing slash). (RESEARCH Pitfall 1 + Phase-1 trailingSlash.)
- Post pages already exist and prerender (03-02). The index just links to them.
- Blog post BODIES start at h2 (h1 is the rendered title) — index page itself has one h1 ("News").
- The shell spec (03-01) already iterates all 7 routes for landmarks + heading order + PAGE-08 + disclosure + target size. Re-run it now that all pages carry real content; extend it only if a gap appears.
- Phase gate suite: `npm run test:unit` + `npm run build` + `npm run test:no-shiki` + `npm run test:e2e` (root-base specs) + `npm run test:base` (sub-path deep-link).
</key_facts>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Blog/News index — posts.ts-driven list with title/date/summary (PAGE-06)</name>
  <read_first>
    - src/routes/blog/+page.svelte (03-01 stub — replace it)
    - src/lib/posts.ts (the index contract: PostMeta[] sorted desc, drafts filtered)
    - .planning/phases/03-app-shell-content-pipeline-pages/03-RESEARCH.md ("Pattern 3", BLOG-02 row, PAGE-06 row)
  </read_first>
  <files>src/routes/blog/+page.svelte, e2e/blog-index.spec.ts</files>
  <action>
    Replace `src/routes/blog/+page.svelte` with EXACTLY (consume `posts.ts`; list title link + date + summary; single h1; empty-state; base-prefixed post links with trailing slash):
    ```svelte
    <script lang="ts">
      import { base } from '$app/paths';
      import { posts } from '$lib/posts';
    </script>

    <svelte:head>
      <title>News — Diversity Includes Disability</title>
      <meta name="description" content="Updates, essays, and announcements from Diversity Includes Disability." />
    </svelte:head>

    <h1>News</h1>

    {#if posts.length > 0}
      <ul class="post-list">
        {#each posts as post}
          <li>
            <h2><a href="{base}/blog/{post.slug}/">{post.title}</a></h2>
            <p class="meta"><time datetime={post.date}>{post.date}</time></p>
            <p class="summary">{post.summary}</p>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="empty">No posts yet — check back soon.</p>
    {/if}

    <style>
      .post-list { list-style: none; padding: 0; display: grid; gap: var(--space-8); margin-block-start: var(--space-6); }
      .post-list h2 { margin-block-end: var(--space-1); }
      .post-list a { color: var(--color-accent); }
      .meta { color: var(--color-text-muted); margin: 0; }
      .summary { max-inline-size: var(--measure); }
      .empty { margin-block-start: var(--space-6); font-size: 1.125em; }
    </style>
    ```

    Create `e2e/blog-index.spec.ts` (index lists title/date/summary + navigates to a post — PAGE-06/BLOG-02 presentation):
    ```ts
    import { test, expect } from '@playwright/test';

    test('blog index lists posts with title, date, and summary (BLOG-02)', async ({ page }) => {
      await page.goto('./blog/');
      await expect(page.locator('h1')).toHaveText(/News/);
      const first = page.locator('.post-list li').first();
      await expect(first.locator('h2 a')).toBeVisible();
      await expect(first.locator('time')).toHaveAttribute('datetime', /\d{4}-\d{2}-\d{2}/);
      await expect(first.locator('.summary')).not.toBeEmpty();
    });

    test('newest post is listed first (BLOG-02 sort)', async ({ page }) => {
      await page.goto('./blog/');
      await expect(page.locator('.post-list li').first().locator('h2 a'))
        .toHaveText(/Welcome to Diversity Includes Disability/);
    });

    test('clicking a post title opens its static page (PAGE-06)', async ({ page }) => {
      await page.goto('./blog/');
      await page.getByRole('link', { name: /Welcome to Diversity Includes Disability/ }).click();
      await expect(page).toHaveURL(/\/blog\/welcome\/$/);
      await expect(page.locator('article h1')).toHaveText(/Welcome to Diversity Includes Disability/);
    });
    ```

    Then:
    ```bash
    npm run build
    npx playwright test --config playwright.theme.config.ts e2e/blog-index.spec.ts
    ```
  </action>
  <verify>
    <automated>test $(grep -c "<h1>" src/routes/blog/+page.svelte) -eq 1 && grep -q "import { posts } from '\$lib/posts'" src/routes/blog/+page.svelte && grep -q 'href="{base}/blog/{post.slug}/"' src/routes/blog/+page.svelte && grep -q "post.summary" src/routes/blog/+page.svelte && grep -q "datetime={post.date}" src/routes/blog/+page.svelte && test -f e2e/blog-index.spec.ts && npm run build && npx playwright test --config playwright.theme.config.ts e2e/blog-index.spec.ts</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "<h1>" src/routes/blog/+page.svelte` returns 1 (index has one h1 "News"; each post title is an h2)
    - `grep "import { posts } from '\$lib/posts'" src/routes/blog/+page.svelte` present (consumes the index; no re-sort/re-glob)
    - `grep 'href="{base}/blog/{post.slug}/"' src/routes/blog/+page.svelte` present (base-prefixed, trailing slash)
    - Title + date + summary all rendered: `grep "post.title"`, `grep "datetime={post.date}"`, `grep "post.summary"` each present
    - `grep "{:else}" src/routes/blog/+page.svelte` present (empty-state)
    - `npm run build` exits 0 AND `npx playwright test --config playwright.theme.config.ts e2e/blog-index.spec.ts` exits 0 (lists posts, newest-first, navigates to post)
  </acceptance_criteria>
  <done>Blog/News index consumes `posts.ts` and lists every post (title link + date + summary, newest-first) with an empty-state, linking to each statically rendered post; `e2e/blog-index.spec.ts` proves PAGE-06 + BLOG-02 presentation.</done>
</task>

<task type="auto">
  <name>Task 2: Site-wide a11y hardening pass + Phase-3 full-suite gate (A11Y-03/04)</name>
  <read_first>
    - e2e/shell.spec.ts (03-01 — iterates all 7 routes; now every page has real content)
    - .planning/phases/03-app-shell-content-pipeline-pages/03-RESEARCH.md ("Accessible App-Shell Patterns", "Heading order", "Focus visibility + target size", "Sampling rate")
    - .planning/phases/03-app-shell-content-pipeline-pages/03-VALIDATION.md (populate sign-off)
    - src/lib/styles/app.css (scroll-margin-top for 2.4.11 already present)
  </read_first>
  <files>e2e/shell.spec.ts</files>
  <action>
    Run the FULL Phase-3 suite against all seven now-real pages and fix any structural a11y regression surfaced:
    ```bash
    npm run test:unit
    npm run build
    npm run test:no-shiki
    npm run test:e2e
    npm run test:base
    ```

    `npm run test:e2e` runs shell.spec.ts across all 7 routes (single h1, header/nav/main/footer, heading levels never skip, PAGE-08 reachability, disclosure Escape-returns-focus, >=24px targets) PLUS content/scaffold/blog/blog-index/theme specs. `npm run test:base` runs the sub-path deep-link.

    If shell.spec surfaces a real gap now that pages carry content, extend `e2e/shell.spec.ts` with a focus-visibility assertion (WCAG 2.4.7) that Tabbing to a nav link yields a visible outline, and a 2.4.11 assertion that a focused in-page target is not obscured by the header. Add to `e2e/shell.spec.ts`:
    ```ts
    test('focused nav links show a visible focus outline (A11Y-04 / WCAG 2.4.7)', async ({ page }) => {
      await page.goto('./');
      const link = page.locator('nav[aria-label="Primary"] a').first();
      await link.focus();
      const outline = await link.evaluate((el) => getComputedStyle(el).outlineStyle);
      expect(outline).not.toBe('none');
    });
    ```

    For any page that fails "heading order never skips" or "targets >=24px", make the MINIMAL fix in that page (e.g., correct an h3-before-h2, or ensure a control uses the `.button`/token min-size). Re-run until the whole suite is green. Do NOT restyle beyond the fix.

    Then populate `.planning/phases/03-app-shell-content-pipeline-pages/03-VALIDATION.md` sign-off: mark all sign-off checkboxes, record the exact suite commands, and confirm the per-task map is green. (The planner pre-populates the map; this task confirms the run.)
  </action>
  <verify>
    <automated>npm run test:unit && npm run build && npm run test:no-shiki && npm run test:e2e && npm run test:base</automated>
  </verify>
  <acceptance_criteria>
    - `npm run test:unit` exits 0 (posts + theme unit tests)
    - `npm run build` exits 0 (all 7 routes + 2 blog posts prerender under strict)
    - `npm run test:no-shiki` exits 0 (BLOG-03: no highlighter in build/_app)
    - `npm run test:e2e` exits 0 — shell (A11Y-02/03/04, PAGE-08), content (PAGE-01/02/03), scaffold (PAGE-04/07), blog (BLOG-01/03), blog-index (PAGE-06/BLOG-02), theme (peer designs) all green across all 7 pages
    - `npm run test:base` exits 0 — post deep-links 200 under `/diversityincludesdisability_one/`
    - `e2e/shell.spec.ts` includes a focus-visibility (2.4.7) assertion AND every page passes single-h1 + heading-order + >=24px targets
    - `grep "nyquist_compliant: true" .planning/phases/03-app-shell-content-pipeline-pages/03-VALIDATION.md` present and sign-off checkboxes are checked
  </acceptance_criteria>
  <done>Full Phase-3 suite (unit + build + no-shiki + e2e + base) is green across all seven now-real pages; shell spec includes a focus-visibility assertion; any heading-order/target-size regression fixed minimally; 03-VALIDATION sign-off populated and nyquist_compliant confirmed. (Full axe/Lighthouse AA conformance remains Phase 6.)</done>
</task>

</tasks>

<verification>
- Blog/News index lists all posts (title/date/summary, newest-first) and each title links to its statically rendered post page (PAGE-06).
- Full suite green: `npm run test:unit && npm run build && npm run test:no-shiki && npm run test:e2e && npm run test:base`.
- Site-wide: one h1 per page, ordered headings, header/nav/main/footer landmarks, visible focus, >=24px targets across all seven pages (A11Y-03/04 structural).
- No pipeline/shell changes beyond consuming them; no new dependency; no new design system.
</verification>

<success_criteria>
- The seven-page accessible site stands complete and navigable end-to-end with a working markdown blog — no forms, no 3D.
- Structural accessibility (landmarks, heading order, focus, target size) is verified across every page; full WCAG AA conformance is handed to Phase 6.
</success_criteria>

<output>
After completion, create `.planning/phases/03-app-shell-content-pipeline-pages/03-05-SUMMARY.md` recording: the blog index presentation (posts.ts-driven, base-prefixed trailing-slash links), the site-wide a11y pass results (which pages, any fixes made), the exact Phase-3 gate command suite and that it is green, and an explicit note that full axe/Lighthouse WCAG 2.2 AA conformance is Phase 6 (this phase validated structure). Update STATE.md position to Phase 3 complete.
</output>
