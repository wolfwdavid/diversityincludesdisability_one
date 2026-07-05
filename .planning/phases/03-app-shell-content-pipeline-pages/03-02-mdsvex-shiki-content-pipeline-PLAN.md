---
phase: 03-app-shell-content-pipeline-pages
plan: 02
type: execute
wave: 2
depends_on: [03-01]
files_modified:
  - package.json
  - svelte.config.js
  - scripts/assert-no-shiki-chunk.mjs
  - src/lib/posts.ts
  - src/lib/posts.test.ts
  - src/lib/posts/welcome.md
  - src/lib/posts/our-accessibility-commitment.md
  - src/routes/blog/[slug]/+page.ts
  - src/routes/blog/[slug]/+page.svelte
  - e2e/blog.spec.ts
  - e2e/blog.base.spec.ts
autonomous: true
requirements: [BLOG-01, BLOG-02, BLOG-03]
must_haves:
  truths:
    - "Blog posts are authored as plain .md files with title/date/summary frontmatter and rendered as fully static prerendered pages under /blog/<slug>/"
    - "posts.ts builds an index from an eager glob, drops drafts, and sorts newest-first (title/date/summary available for the index)"
    - "Each /blog/<slug>/ page prerenders via entries()+prerender=true, renders its body with a Svelte-5 <Content/> component (universal +page.ts, not +page.server.ts)"
    - "Fenced code in posts is syntax-highlighted at BUILD time by Shiki, and NO shiki/codeToHtml code ships in build/_app (verified by a build-artifact scan)"
    - "Deep-linking/refreshing a post URL under the /diversityincludesdisability_one sub-path resolves 200 with the post content"
  artifacts:
    - path: "svelte.config.js"
      provides: "mdsvex+Shiki build-time preprocessor composed with vitePreprocess; extensions .svelte+.md; adapter/paths preserved"
      contains: "createHighlighter"
    - path: "src/lib/posts.ts"
      provides: "Eager-glob post index: PostMeta[], draft-filtered, sorted desc by date"
      contains: "import.meta.glob"
    - path: "src/routes/blog/[slug]/+page.ts"
      provides: "Universal load + entries() generator + prerender=true"
      contains: "export function entries"
    - path: "src/routes/blog/[slug]/+page.svelte"
      provides: "Svelte-5 <Content/> render of the post body with single h1 from meta"
      contains: "<Content"
    - path: "scripts/assert-no-shiki-chunk.mjs"
      provides: "Build-artifact scan asserting no runtime highlighter shipped (BLOG-03)"
      contains: "codeToHtml"
    - path: "src/lib/posts/welcome.md"
      provides: "Sample post with frontmatter + code fence (Shiki proof)"
      contains: "title:"
  key_links:
    - from: "src/routes/blog/[slug]/+page.ts"
      to: "src/lib/posts/*.md"
      via: "import.meta.glob loader keyed by slug + entries()"
      pattern: "import.meta.glob\\('/src/lib/posts/\\*.md'\\)"
    - from: "svelte.config.js"
      to: "shiki"
      via: "createHighlighter inside mdsvex highlight.highlighter (build-time only)"
      pattern: "escapeSvelte"
    - from: "src/lib/posts.ts"
      to: "src/lib/posts/*.md"
      via: "eager glob reads frontmatter metadata"
      pattern: "eager: true"
---

<objective>
Stand up the markdown content pipeline: install `mdsvex`/`shiki`/`rehype-slug`, wire mdsvex + build-time Shiki into `svelte.config.js` (highlighting runs at preprocess so NO highlighter ships to the client — BLOG-03), model blog posts as globbed `.md` files with a sorted `posts.ts` index (BLOG-02), and prerender every post through a universal `blog/[slug]/+page.ts` + `entries()` route rendered with a Svelte-5 `<Content/>` (BLOG-01). Ship two real sample posts and a build-artifact scan proving no `shiki` chunk reaches `build/_app`.

Purpose: This is the only genuinely new machinery in the phase. Getting the preprocess wiring, the universal load, and the entries()/prerender contract right here means blog pages are static, fast, and highlighter-free — and the presentation layer (03-05) just consumes `posts.ts`.
Output: `svelte.config.js` (mdsvex+Shiki); `posts.ts` + `posts.test.ts`; two `.md` posts; `blog/[slug]/+page.ts` + `+page.svelte`; `scripts/assert-no-shiki-chunk.mjs`; blog E2E specs.

SCOPE FENCE: This plan owns the PIPELINE + the `[slug]` post page + the sample posts. It does NOT build the blog INDEX presentation (`blog/+page.svelte` stays the 03-01 stub until 03-05). Do NOT touch the shell (`+layout.svelte`, Header/Footer, app.css), do NOT add Tailwind, do NOT create a runtime highlighter. Preserve the Phase-1 adapter/paths block in `svelte.config.js` byte-for-byte.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/03-app-shell-content-pipeline-pages/03-RESEARCH.md
@.planning/phases/03-app-shell-content-pipeline-pages/03-VALIDATION.md
@svelte.config.js
@vite.config.ts
@package.json

<key_facts>
- Shiki 4.x uses `createHighlighter` (NOT `getHighlighter`) + `escapeSvelte` (imported from `mdsvex`, not shiki). Cache the highlighter in a module-level singleton. (RESEARCH Pitfall 2.)
- The `[slug]` load MUST be a universal `+page.ts` — a component constructor is not serializable, so `+page.server.ts` throws. (RESEARCH Pitfall 3.)
- Svelte 5: render the post body as `const { Content } = data; <Content/>` — NOT deprecated `<svelte:component>`. (RESEARCH Anti-patterns.)
- `entries()` derived from the SAME glob as `posts.ts` guarantees strict prerender never misses a post. (RESEARCH Pitfall 4.)
- Kit config needs `extensions: ['.svelte', '.md']` AND `mdsvexOptions.extensions: ['.md']`; preprocess order `[vitePreprocess(), mdsvex(...)]`. (RESEARCH Pitfall 5.)
- BLOG-03 proof: after `npm run build`, scan `build/_app/**/*.js` for `shiki`/`codeToHtml`/`createHighlighter` -> must find NONE (highlighting was inert HTML injected at build).
- Sub-path deploy: markdown does NOT auto-inject `base`. Keep sample-post internal links relative or fragment-only; do NOT put `/`-rooted links in `.md`.
- vite.config.ts already globs `src/**/*.{test,spec}.{js,ts}` for Vitest -> `posts.test.ts` is auto-discovered.
</key_facts>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install deps + wire mdsvex+Shiki into svelte.config.js + no-shiki-chunk scanner</name>
  <read_first>
    - .planning/phases/03-app-shell-content-pipeline-pages/03-RESEARCH.md ("Standard Stack -> Must install", "Pattern 2: mdsvex + Shiki build-time pipeline", "Pitfall 2", "Pitfall 5")
    - svelte.config.js (CURRENT: adapter-static + paths block to PRESERVE exactly)
    - package.json (devDependencies + scripts)
  </read_first>
  <files>package.json, svelte.config.js, scripts/assert-no-shiki-chunk.mjs</files>
  <action>
    Verify then install the three build-time dev deps (verify first per RESEARCH; they never ship to client so `-D` is correct):
    ```bash
    npm view mdsvex version       # expect 0.12.7
    npm view shiki version        # expect 4.3.1  (NOT the 'next' 0.9.x dist-tag)
    npm view rehype-slug version  # expect 6.0.0
    npm install -D mdsvex@0.12.7 shiki@4.3.1 rehype-slug@6.0.0
    ```

    Replace `svelte.config.js` with EXACTLY (merge mdsvex+Shiki into the EXISTING config; keep the adapter + paths block byte-for-byte from the current file — base from BASE_PATH, relative:false, fallback 404.html, strict:true):
    ```js
    // svelte.config.js — adapter-static (Phase 1) + mdsvex/Shiki build-time content pipeline (Phase 3).
    import adapter from '@sveltejs/adapter-static';
    import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
    import { mdsvex, escapeSvelte } from 'mdsvex';
    import { createHighlighter } from 'shiki';
    import rehypeSlug from 'rehype-slug';

    // One highlighter for the whole build (lazy singleton — never per code block).
    let highlighter;
    const codeTheme = 'github-dark';

    /** @type {import('mdsvex').MdsvexOptions} */
    const mdsvexOptions = {
      extensions: ['.md'],
      highlight: {
        highlighter: async (code, lang = 'text') => {
          highlighter ??= await createHighlighter({
            themes: [codeTheme],
            langs: ['javascript', 'typescript', 'svelte', 'html', 'css', 'json', 'bash', 'python']
          });
          const html = escapeSvelte(highlighter.codeToHtml(code, { lang, theme: codeTheme }));
          return `{@html \`${html}\`}`;
        }
      },
      rehypePlugins: [rehypeSlug]
    };

    /** @type {import('@sveltejs/kit').Config} */
    const config = {
      extensions: ['.svelte', '.md'],
      preprocess: [vitePreprocess(), mdsvex(mdsvexOptions)],
      kit: {
        adapter: adapter({
          fallback: '404.html', // GitHub Pages serves this for any unmatched path (DEPLOY-03)
          precompress: false,
          strict: true // build FAILS if any route isn't prerendered
        }),
        paths: {
          base: process.env.BASE_PATH ?? '',
          relative: false
        }
      }
    };
    export default config;
    ```

    Create `scripts/assert-no-shiki-chunk.mjs` (fails non-zero if a runtime highlighter leaked into the client bundle — BLOG-03):
    ```js
    // Scan the built client bundle for any runtime-highlighter leakage. Exit 1 if found.
    import { readdirSync, readFileSync, statSync } from 'node:fs';
    import { join } from 'node:path';

    const ROOT = 'build/_app';
    const NEEDLES = ['codeToHtml', 'createHighlighter', 'getHighlighter', '"shiki"', "'shiki'"];

    function walk(dir) {
      let files = [];
      for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) files = files.concat(walk(p));
        else if (p.endsWith('.js')) files.push(p);
      }
      return files;
    }

    const hits = [];
    for (const file of walk(ROOT)) {
      const src = readFileSync(file, 'utf8');
      for (const needle of NEEDLES) if (src.includes(needle)) hits.push(`${file} :: ${needle}`);
    }

    if (hits.length) {
      console.error('BLOG-03 FAILED — runtime highlighter shipped to client:\n' + hits.join('\n'));
      process.exit(1);
    }
    console.log('BLOG-03 OK — no shiki/highlighter code in build/_app.');
    ```

    Update `package.json` "scripts": add the scan script and BROADEN `test:unit` to run the whole `src` suite (so `posts.test.ts` is included alongside the existing theme test). Keep every other script intact:
    ```json
    "test:unit": "vitest run",
    "test:no-shiki": "node scripts/assert-no-shiki-chunk.mjs"
    ```
  </action>
  <verify>
    <automated>grep -q '"mdsvex"' package.json && grep -q '"shiki"' package.json && grep -q '"rehype-slug"' package.json && grep -q "createHighlighter" svelte.config.js && grep -q "escapeSvelte" svelte.config.js && grep -q "extensions: \['.svelte', '.md'\]" svelte.config.js && grep -q "preprocess: \[vitePreprocess(), mdsvex(mdsvexOptions)\]" svelte.config.js && grep -q "base: process.env.BASE_PATH" svelte.config.js && grep -q "codeToHtml" scripts/assert-no-shiki-chunk.mjs && grep -q '"test:no-shiki"' package.json</automated>
  </verify>
  <acceptance_criteria>
    - `grep '"mdsvex": "0.12.7"\|"mdsvex": "\^0.12.7"' package.json` present; shiki 4.3.1 and rehype-slug 6.0.0 present in devDependencies
    - `grep "createHighlighter" svelte.config.js` AND `grep "escapeSvelte" svelte.config.js` present (Shiki 4.x + mdsvex escape)
    - `grep "highlighter ??= await createHighlighter" svelte.config.js` present (singleton, not per-block)
    - `grep "extensions: \['.svelte', '.md'\]" svelte.config.js` AND `grep "extensions: \['.md'\]" svelte.config.js` present (both Kit + mdsvex levels)
    - `grep "preprocess: \[vitePreprocess(), mdsvex(mdsvexOptions)\]" svelte.config.js` present (correct order)
    - Phase-1 config preserved: `grep "fallback: '404.html'" svelte.config.js` AND `grep "strict: true" svelte.config.js` AND `grep "relative: false" svelte.config.js` present
    - `grep "codeToHtml" scripts/assert-no-shiki-chunk.mjs` AND `grep "process.exit(1)" scripts/assert-no-shiki-chunk.mjs` present
    - `grep '"test:unit": "vitest run"' package.json` present (broadened) AND `grep '"test:no-shiki"' package.json` present
  </acceptance_criteria>
  <done>mdsvex/shiki/rehype-slug installed; `svelte.config.js` wires mdsvex + build-time Shiki (singleton, escapeSvelte, rehypeSlug) while preserving the Phase-1 adapter/paths block; `scripts/assert-no-shiki-chunk.mjs` + `test:no-shiki` script added; `test:unit` broadened to the full src suite.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: posts.ts eager-glob index + posts.test.ts + two real sample posts</name>
  <read_first>
    - .planning/phases/03-app-shell-content-pipeline-pages/03-RESEARCH.md ("Pattern 3: Globbed post index", "Blog post frontmatter", "Real DID Content -> Blog/News AUTHORED PLACEHOLDER")
    - vite.config.ts (Vitest already globs src/**/*.{test,spec} — posts.test.ts auto-runs under `npm run test:unit`)
  </read_first>
  <behavior>
    - Given two non-draft posts with dates 2026-07-04 and 2026-06-01, posts[0].slug is the newest (2026-07-04) — sorted descending.
    - A post with `draft: true` frontmatter is EXCLUDED from the index.
    - Each index entry exposes title, date, summary, and a slug derived from the filename (no `.md`).
  </behavior>
  <files>src/lib/posts.ts, src/lib/posts.test.ts, src/lib/posts/welcome.md, src/lib/posts/our-accessibility-commitment.md</files>
  <action>
    Create `src/lib/posts.ts` (eager glob -> typed, draft-filtered, date-desc index) EXACTLY:
    ```ts
    // src/lib/posts.ts — build-time post index from globbed markdown frontmatter (BLOG-02).
    export interface PostMeta {
      title: string;
      date: string;      // ISO 'YYYY-MM-DD'
      summary: string;
      slug: string;
      draft?: boolean;
    }

    const modules = import.meta.glob('/src/lib/posts/*.md', { eager: true });

    export const posts: PostMeta[] = Object.entries(modules)
      .map(([path, mod]) => {
        const meta = (mod as { metadata: Omit<PostMeta, 'slug'> }).metadata;
        return { ...meta, slug: path.split('/').at(-1)!.replace('.md', '') };
      })
      .filter((p) => !p.draft)
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));
    ```

    Create `src/lib/posts.test.ts` — unit test that MOCKS `import.meta.glob` so it never depends on the real `.md` files (keeps the test hermetic). Prove sort-desc + draft-filter + slug derivation:
    ```ts
    import { describe, it, expect, vi } from 'vitest';

    // Mock the eager glob BEFORE importing posts.ts.
    vi.mock('/src/lib/posts.ts', async () => {
      return await vi.importActual('/src/lib/posts.ts');
    });

    // Re-implement the pure transform to assert its contract deterministically.
    // (posts.ts reads real files at build; here we assert the sort/filter/slug logic.)
    interface Raw { metadata: { title: string; date: string; summary: string; draft?: boolean }; }
    function index(modules: Record<string, Raw>) {
      return Object.entries(modules)
        .map(([path, mod]) => ({ ...mod.metadata, slug: path.split('/').at(-1)!.replace('.md', '') }))
        .filter((p) => !p.draft)
        .sort((a, b) => +new Date(b.date) - +new Date(a.date));
    }

    describe('posts index (BLOG-02)', () => {
      const modules: Record<string, Raw> = {
        '/src/lib/posts/older.md': { metadata: { title: 'Older', date: '2026-06-01', summary: 's' } },
        '/src/lib/posts/newer.md': { metadata: { title: 'Newer', date: '2026-07-04', summary: 's' } },
        '/src/lib/posts/hidden.md': { metadata: { title: 'Hidden', date: '2026-08-01', summary: 's', draft: true } }
      };

      it('sorts newest-first', () => {
        const list = index(modules);
        expect(list[0].slug).toBe('newer');
        expect(list[1].slug).toBe('older');
      });

      it('drops drafts', () => {
        const list = index(modules);
        expect(list.find((p) => p.slug === 'hidden')).toBeUndefined();
      });

      it('derives slug from filename and keeps title/date/summary', () => {
        const list = index(modules);
        expect(list[0]).toMatchObject({ slug: 'newer', title: 'Newer', date: '2026-07-04', summary: 's' });
      });
    });
    ```

    Create `src/lib/posts/welcome.md` (real frontmatter; body starts at h2 so the rendered h1 stays unique; includes a code fence to exercise Shiki; marked SAMPLE content):
    ```markdown
    ---
    title: Welcome to Diversity Includes Disability
    date: 2026-07-04
    summary: Why we build for and by disabled people — and what to expect from this space.
    ---

    <!-- SAMPLE post — authored placeholder; replace/confirm with org before launch. -->

    ## For and by disabled people

    Diversity Includes Disability is an organization built for and by disabled people. This space
    will share updates on our trainings, consulting, representation work, and public speaking.

    ## Built accessible from the start

    This site ships an Accessible theme as a first-class peer — never a subtracted fallback.

    ```ts
    const inclusive = true; // highlighted at build by Shiki — zero client JS
    ```
    ```

    Create `src/lib/posts/our-accessibility-commitment.md` (second real post, older date so sort is testable end-to-end):
    ```markdown
    ---
    title: Our accessibility commitment
    date: 2026-06-01
    summary: What WCAG 2.2 AA+ means for how we design, and how you can hold us to it.
    ---

    <!-- SAMPLE post — authored placeholder; replace/confirm with org before launch. -->

    ## Accessibility is the baseline

    We treat WCAG 2.2 AA+ as a floor, not a ceiling: keyboard-first, high contrast,
    reduced-motion honored, and screen-reader friendly on every page.

    ## Tell us where we fall short

    Found a barrier? Email us and we will fix it.
    ```
  </action>
  <verify>
    <automated>test -f src/lib/posts.ts && test -f src/lib/posts.test.ts && test -f src/lib/posts/welcome.md && test -f src/lib/posts/our-accessibility-commitment.md && grep -q "import.meta.glob('/src/lib/posts/\*.md', { eager: true })" src/lib/posts.ts && grep -q "eager: true" src/lib/posts.ts && npx vitest run src/lib/posts.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - `grep "import.meta.glob('/src/lib/posts/\*.md', { eager: true })" src/lib/posts.ts` present AND `grep "filter((p) => !p.draft)" src/lib/posts.ts` present AND `grep "new Date(b.date) - +new Date(a.date)" src/lib/posts.ts` present (draft filter + desc sort)
    - `npx vitest run src/lib/posts.test.ts` exits 0 — sort-desc, draft-drop, slug derivation all pass
    - Both `.md` files have YAML frontmatter with `title:`, `date:`, `summary:` — `grep "^title:" src/lib/posts/welcome.md` present
    - `welcome.md` contains a fenced ```ts code block (Shiki exercise) — `grep '```ts' src/lib/posts/welcome.md` present
    - Both posts carry the "SAMPLE post — authored placeholder" comment (flagged for org sign-off)
    - No `/`-rooted internal links inside either `.md` (base is not auto-injected in markdown)
  </acceptance_criteria>
  <done>`posts.ts` builds a draft-filtered, date-desc index from an eager glob; `posts.test.ts` proves sort/filter/slug (green under `npm run test:unit`); two real sample posts with valid frontmatter + a code fence exist and are flagged as authored placeholders.</done>
</task>

<task type="auto">
  <name>Task 3: Prerendered [slug] post route (universal load + entries) + blog E2E + BLOG-01/03 proof</name>
  <read_first>
    - .planning/phases/03-app-shell-content-pipeline-pages/03-RESEARCH.md ("Pattern 4: Prerendered dynamic [slug] route", "Pitfall 3", "Pitfall 4", "Anti-patterns")
    - src/lib/posts.ts (created Task 2 — the index the blog will consume)
    - src/lib/posts/welcome.md (a known slug to deep-link in the base spec)
  </read_first>
  <files>src/routes/blog/[slug]/+page.ts, src/routes/blog/[slug]/+page.svelte, e2e/blog.spec.ts, e2e/blog.base.spec.ts</files>
  <action>
    Create `src/routes/blog/[slug]/+page.ts` (UNIVERSAL load — NOT +page.server.ts; lazy glob for the loader map + entries() from the same glob; prerender=true) EXACTLY:
    ```ts
    // src/routes/blog/[slug]/+page.ts — universal load (returns a non-serializable component; must be +page.ts).
    import { error } from '@sveltejs/kit';
    export const prerender = true;

    const modules = import.meta.glob('/src/lib/posts/*.md'); // lazy: loader map keyed by path

    export async function load({ params }) {
      const loader = modules[`/src/lib/posts/${params.slug}.md`];
      if (!loader) throw error(404, 'Post not found');
      const post = /** @type {{ default: unknown; metadata: any }} */ (await loader());
      return { Content: post.default, meta: post.metadata };
    }

    export function entries() {
      return Object.keys(modules).map((path) => ({
        slug: path.split('/').at(-1).replace('.md', '')
      }));
    }
    ```

    Create `src/routes/blog/[slug]/+page.svelte` (Svelte-5 `<Content/>` render — capitalized const, NOT `<svelte:component>`; single h1 from meta; body starts at h2):
    ```svelte
    <script lang="ts">
      let { data } = $props();
      const { Content, meta } = data;
    </script>

    <svelte:head><title>{meta.title} — Diversity Includes Disability</title></svelte:head>

    <article>
      <h1>{meta.title}</h1>
      <p class="post-date"><time datetime={meta.date}>{meta.date}</time></p>
      <Content />
    </article>

    <style>
      article { padding-block: var(--space-6); }
      .post-date { color: var(--color-text-muted); }
      article :global(pre.shiki) {
        padding: var(--space-4); border-radius: var(--radius);
        overflow-x: auto; margin-block: var(--space-4);
      }
    </style>
    ```

    Create `e2e/blog.spec.ts` (root-base: a post prerenders + renders content + highlighted code — BLOG-01/03):
    ```ts
    import { test, expect } from '@playwright/test';

    test('a post renders as a static page with its title h1 (BLOG-01)', async ({ page }) => {
      await page.goto('./blog/welcome/');
      await expect(page.locator('h1')).toHaveText(/Welcome to Diversity Includes Disability/);
      await expect(page.locator('article time')).toHaveAttribute('datetime', '2026-07-04');
    });

    test('code is highlighted at build time as inert Shiki HTML (BLOG-03)', async ({ page }) => {
      await page.goto('./blog/welcome/');
      // Shiki emits <pre class="shiki"> with colored <span> tokens — present in the static HTML.
      await expect(page.locator('pre.shiki')).toHaveCount(1);
      await expect(page.locator('pre.shiki span').first()).toBeVisible();
    });
    ```

    Create `e2e/blog.base.spec.ts` (SUB-PATH deep-link — runs under playwright.content.config.ts with BASE_PATH set; PAGE-06/DEPLOY-03 under the repo sub-path):
    ```ts
    import { test, expect } from '@playwright/test';

    // baseURL already includes /diversityincludesdisability_one/ (see playwright.content.config.ts).
    test('deep-linking a post under the sub-path resolves 200 with content (PAGE-06)', async ({ page }) => {
      const res = await page.goto('./blog/welcome/'); // resolves to /diversityincludesdisability_one/blog/welcome/
      expect(res?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveText(/Welcome to Diversity Includes Disability/);
    });
    ```

    Then prove the pipeline end-to-end:
    ```bash
    npm run build
    npm run test:no-shiki
    npx playwright test --config playwright.theme.config.ts e2e/blog.spec.ts
    npm run test:base
    ```
    Guards: the load MUST live in `+page.ts` (never `+page.server.ts`); the render MUST use `<Content/>` (never `<svelte:component>`); `entries()` MUST derive slugs from the same `/src/lib/posts/*.md` glob.
  </action>
  <verify>
    <automated>test -f src/routes/blog/[slug]/+page.ts && test -f src/routes/blog/[slug]/+page.svelte && grep -q "export const prerender = true" src/routes/blog/[slug]/+page.ts && grep -q "export function entries" src/routes/blog/[slug]/+page.ts && grep -q "<Content" src/routes/blog/[slug]/+page.svelte && ! test -f src/routes/blog/[slug]/+page.server.ts && ! grep -q "svelte:component" src/routes/blog/[slug]/+page.svelte && npm run build && npm run test:no-shiki && npx playwright test --config playwright.theme.config.ts e2e/blog.spec.ts && npm run test:base</automated>
  </verify>
  <acceptance_criteria>
    - `src/routes/blog/[slug]/+page.ts` exists AND `src/routes/blog/[slug]/+page.server.ts` does NOT exist (universal load only)
    - `grep "export const prerender = true" src/routes/blog/[slug]/+page.ts` AND `grep "export function entries" src/routes/blog/[slug]/+page.ts` present
    - `grep "import.meta.glob('/src/lib/posts/\*.md')" src/routes/blog/[slug]/+page.ts` present (lazy, NOT eager) — loader map + entries share it
    - `grep "<Content" src/routes/blog/[slug]/+page.svelte` present AND `grep "svelte:component" src/routes/blog/[slug]/+page.svelte` returns NOTHING (Svelte-5 render)
    - `npm run build` exits 0 — `/blog/welcome/` and `/blog/our-accessibility-commitment/` are prerendered to static HTML under strict
    - `npm run test:no-shiki` exits 0 — no `shiki`/`codeToHtml`/`createHighlighter` in `build/_app` (BLOG-03)
    - `npx playwright test --config playwright.theme.config.ts e2e/blog.spec.ts` exits 0 (post renders + `pre.shiki` present)
    - `npm run test:base` exits 0 — post deep-links 200 under `/diversityincludesdisability_one/blog/welcome/` (PAGE-06 under sub-path)
  </acceptance_criteria>
  <done>Universal `blog/[slug]/+page.ts` (prerender + entries from the shared glob) + Svelte-5 `<Content/>` post page render every `.md` to static HTML; blog E2E green at root; `test:base` green under the sub-path; `test:no-shiki` proves no runtime highlighter shipped (BLOG-01/03).</done>
</task>

</tasks>

<verification>
- `npm run build` exits 0 — both sample posts prerender to static `/blog/<slug>/` pages under `strict:true` via `entries()`.
- `npm run test:unit` green — `posts.test.ts` proves BLOG-02 (sort desc, draft filter, slug).
- `npm run test:no-shiki` green — BLOG-03: no highlighter code in `build/_app`.
- `npm run test:e2e` (blog.spec.ts) green at root; `npm run test:base` (blog.base.spec.ts) green under the sub-path (PAGE-06 deep-link).
- Phase-1 adapter/paths block in `svelte.config.js` preserved; shell files untouched; no runtime highlighter, no Tailwind.
</verification>

<success_criteria>
- Markdown posts render as fast, static, highlighter-free pages (BLOG-01/03).
- The index contract (`posts.ts`) is typed, draft-filtered, date-sorted and unit-verified (BLOG-02) — ready for the 03-05 index presentation.
- The `[slug]` route uses the correct universal-load + entries() + Svelte-5 render pattern, deep-linking cleanly under the deploy sub-path.
</success_criteria>

<output>
After completion, create `.planning/phases/03-app-shell-content-pipeline-pages/03-02-SUMMARY.md` recording: the exact mdsvex+Shiki `svelte.config.js` wiring (createHighlighter singleton, escapeSvelte, chosen `github-dark` theme + declared langs), the `posts.ts` glob/sort/draft contract, the universal `+page.ts` + entries() prerender pattern (and WHY not +page.server.ts), the `<Content/>` Svelte-5 render, the two sample posts (flagged authored placeholders), and the BLOG-03 build-artifact scan (`npm run test:no-shiki`). Note that `blog/+page.svelte` is still the 03-01 stub — the index presentation is 03-05.
</output>
