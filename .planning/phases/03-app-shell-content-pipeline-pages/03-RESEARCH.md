# Phase 3: App Shell, Content Pipeline & Pages - Research

**Researched:** 2026-07-04
**Domain:** SvelteKit 2 (runes) static content site — app shell, mdsvex markdown pipeline, build-time Shiki, WCAG 2.2 accessible navigation, real nonprofit content
**Confidence:** HIGH (stack + patterns verified against npm registry, official SvelteKit/mdsvex/Shiki/WCAG sources); MEDIUM on the exact wording of the org mission (live site is a JS-rendered Wix single-pager; services + bio facts are real, mission prose is authored)

> No CONTEXT.md exists for this phase (`/gsd:discuss-phase` was not run). There are therefore no locked user decisions to copy verbatim; the constraints below are derived from REQUIREMENTS.md, ROADMAP.md, STATE.md, and the embedded STACK.md in CLAUDE.md. If a discuss-phase pass happens later, its decisions supersede anything here.

## Summary

Phase 3 turns the deployed skeleton (Phase 1) + dual-theme token system (Phase 2) into the full seven-page accessible site plus a markdown blog — with **no forms backend (Phase 4)** and **no 3D hero (Phase 5)**. The Home hero is a static token-styled placeholder; the Contact page is a form-ready *scaffold* (markup + labels, no submit wiring). The critical sequencing insight, already baked into the roadmap, is **shell-and-landmarks first (03-01), then pipeline (03-02), then content pages (03-03/04/05)** so heading order and landmark semantics are established once in `+layout.svelte` rather than retrofitted across seven pages.

The content pipeline is the only genuinely new machinery: **mdsvex 0.12.7** as a Svelte preprocessor (composes alongside the existing `vitePreprocess()`), **Shiki 4.3.1** wired into mdsvex's `highlight.highlighter` so code is highlighted **at build time inside `svelte.config.js`** and ships as inert HTML (satisfying BLOG-03 — Shiki never enters the client bundle because it only runs during preprocessing). Blog posts live as `.md` files outside the route tree; a `posts.ts` module uses `import.meta.glob('/src/lib/posts/*.md', { eager: true })` to build the index (BLOG-02), and the dynamic `blog/[slug]` route uses a **universal `+page.ts` load + `entries()` generator** to prerender every post statically under `adapter-static`.

Everything is composed from the **existing Phase-2 CSS custom properties** in `src/lib/styles/tokens/base.css` and the two theme files — do NOT introduce Tailwind or a new token system. All internal links MUST be `base`-prefixed (`import { base } from '$app/paths'`) because the site lives under the `/diversityincludesdisability_one` sub-path — this is the single highest-frequency footgun in this phase.

**Primary recommendation:** Install `mdsvex@0.12.7 shiki@4.3.1 rehype-slug@6.0.0` (all currently ABSENT from package.json); wire mdsvex+Shiki into `svelte.config.js` as a build-time preprocessor; build the shell in `+layout.svelte` (skip-link → header/nav/footer with the relocated ThemeToggle → `<main id="main-content" tabindex="-1">`); model blog posts as globbed `.md` data with an `entries()`-prerendered `[slug]` route; and port the real DID services + Eman Rimawi bio (sourced below) into About/Programs, marking authored prose as placeholder.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PAGE-01 | Home: hero + mission summary + primary CTAs | Static token-styled hero placeholder (NOT the Phase-5 3D hero); CTAs = base-prefixed `<a class="button">` to Get Involved / About |
| PAGE-02 | About/Mission with Eman Rimawi's real bio + org mission | Real bio sourced below (bilateral amputee 2014, NYLPI Access-A-Ride, Exec Dir Harlem ILC + DID); mission authored in org voice, flagged |
| PAGE-03 | Programs & Services — four real services | Verified from live site: (1) Intersectional Disability Equity & Inclusion trainings/facilitation, (2) Disability Consulting, (3) Modeling for Representation, (4) Speaker & Panelist |
| PAGE-04 | Get Involved / Donate — volunteer info + donate link-out | Authored placeholder copy; donate = clearly-labeled external `<a rel="noopener noreferrer">` placeholder (real backend is Phase 4/FORM-04) |
| PAGE-05 | Events — structure ready for real events | Events data array (`src/lib/data/events.ts`) + empty-state; authored placeholder events flagged |
| PAGE-06 | Blog/News index + individual post pages | `posts.ts` glob index + `blog/[slug]` prerendered route (see Architecture) |
| PAGE-07 | Contact — accessible contact form | Form-ready **scaffold** only (labels + `aria-describedby` wiring), NO submit — backend is Phase 4/FORM-01..03 |
| PAGE-08 | Consistent responsive accessible header/nav + footer | App-shell in `+layout.svelte`; responsive disclosure nav; ThemeToggle relocated into Header |
| BLOG-01 | Posts authored as markdown, rendered static | mdsvex `.md` → prerendered pages via `entries()` |
| BLOG-02 | Index lists title, date, summary | Frontmatter schema + eager glob + sort-by-date |
| BLOG-03 | Rich/code rendered at build time, no runtime highlighter | Shiki in `svelte.config.js` preprocess → inert HTML; assert no `shiki` chunk in `build/_app` |
| A11Y-02 | Skip-to-content link on every page | Skip link in layout → `#main-content` with `tabindex="-1"` to actually move focus |
| A11Y-03 | Correct landmarks + heading order every page | header/nav/main/footer landmarks; single `<h1>` per page; ordered h2/h3 |
| A11Y-04 | Keyboard-operable, visible focus, 2.4.11 + 2.5.8 | Tokenized `:focus-visible` ring; `scroll-margin-top` under sticky header (2.4.11); ≥24px targets (2.5.8) |
</phase_requirements>

## User Constraints (derived — no CONTEXT.md)

### Locked by roadmap / prior phases (treat as constraints)
- **Sub-path deploy:** `BASE_PATH=/diversityincludesdisability_one`; every internal href/asset MUST be `base`-prefixed. `paths.relative=false` (Phase-1 decision) — keep it; absolute base-prefixed URLs are required for the 404.html deep-link fallback.
- **Static only:** `adapter-static`, `prerender=true` site-wide (`+layout.ts`), `trailingSlash='always'`, `fallback:'404.html'`, `strict:true`. NO `+page.server.*`, NO form actions, NO API routes.
- **Tokens are fixed:** compose from `src/lib/styles/tokens/base.css` + `theme-premium.css` + `theme-accessible.css`. Do NOT add Tailwind or a second token system. The 4 CSS imports in `+layout.svelte` must survive the shell refactor.
- **ThemeToggle:** existing `src/lib/theme/ThemeToggle.svelte` is unchanged — only its **mount point moves** from top-of-layout into the new Header/Nav (Phase-2 decision, STATE.md line 79).
- **Scope, not now:** Contact form backend = Phase 4; 3D hero = Phase 5; axe/Lighthouse full audit + a11y statement = Phase 6. This phase ships a *complete accessible site without them.*

### Claude's discretion (recommend during planning)
- Posts location (`src/lib/posts/*.md` recommended), frontmatter field names, Shiki theme choice, nav breakpoint, mobile-nav interaction details, authored placeholder copy for Events/Get-Involved/Blog.

### Deferred / out of scope
- Newsletter (NEWS-01, v2), events calendar integration (EVNT-02, v2), site search (SRCH-01, v2), i18n (I18N-01, v2). Ignore.

## Standard Stack

### Already installed (confirmed in package.json — do NOT reinstall)
| Library | Version | Role in Phase 3 |
|---------|---------|-----------------|
| svelte | ^5.56.1 | Runes mode — components use `$props`, `$state`, `$derived` |
| @sveltejs/kit | ^2.63.0 | Router, prerender pipeline, `entries()`, `$app/paths` |
| @sveltejs/adapter-static | ^3.0.10 | Static export |
| @sveltejs/vite-plugin-svelte | ^7.1.2 | `vitePreprocess()` — stays in the preprocess array |
| vite | ^8.0.16 | `import.meta.glob` for post loading |
| vitest | ^4.1.9 | Unit tests for `posts.ts` glob/sort |
| @playwright/test | ^1.61.1 | E2E: skip-link focus, nav keyboard/aria, deep-link, no-shiki-chunk |

### Must install (ABSENT from package.json — new this phase)
| Library | Version (verified `npm view` 2026-07-04) | Purpose | Why standard |
|---------|------------------------------------------|---------|--------------|
| **mdsvex** | **0.12.7** | Markdown → Svelte preprocessor | De-facto Svelte markdown pipeline; peer `svelte ^5.0.0-next.120` → works with 5.56. Frontmatter + inline components, fully static. |
| **shiki** | **4.3.1** | Build-time syntax highlighting | Runs inside `svelte.config.js` preprocess → zero client JS (BLOG-03). TextMate-grade output as inert HTML. |
| **rehype-slug** | **6.0.0** | Auto heading `id`s | Anchor targets for blog headings; feeds ordered-heading nav. mdsvex `rehypePlugins`. |

Optional (planner discretion): **rehype-autolink-headings@7.1.0** for visible heading anchors.

**Installation:**
```bash
npm install -D mdsvex@0.12.7 shiki@4.3.1 rehype-slug@6.0.0
```
(mdsvex/shiki are build-time only → `-D` devDependency is correct; they never ship to the client.)

**Version verification (run before writing the plan's install task):**
```bash
npm view mdsvex version      # expect 0.12.7
npm view shiki version       # expect 4.3.1  (dist-tag latest; 'next' is an old 0.9.x — do NOT use)
npm view rehype-slug version # expect 6.0.0
```

### Alternatives considered (and rejected — per CLAUDE.md "What NOT to Use")
| Instead of | Rejected alternative | Why not here |
|------------|----------------------|--------------|
| mdsvex | `import.meta.glob` + `marked`/`markdown-it` | Loses component-in-markdown; mdsvex is the blessed Svelte path |
| Shiki (build-time) | Prism / highlight.js at runtime | Ships highlighter JS → violates BLOG-03 + a11y/perf budget |
| Plain CSS tokens | Tailwind v4 | Phase-2 already shipped a complete token system; adding Tailwind is redundant + contradicts "do not introduce a new design system" |
| mdsvex `.md` posts | Contentlayer | React-centric, unmaintained, no Svelte story |

## Architecture Patterns

### Recommended project structure (additions this phase)
```
src/
├── app.html                      # UNCHANGED (Phase-2 no-flash inline script stays)
├── routes/
│   ├── +layout.svelte            # 03-01: shell — skip-link, header/nav/footer, <main id> (KEEP 4 CSS imports)
│   ├── +layout.ts                # UNCHANGED (prerender=true, trailingSlash='always')
│   ├── +page.svelte              # 03-03: Home (PAGE-01) — static hero placeholder
│   ├── about/+page.svelte        # 03-03: About/Mission (PAGE-02)
│   ├── programs/+page.svelte     # 03-03: Programs & Services (PAGE-03)
│   ├── get-involved/+page.svelte # 03-04: Get Involved/Donate (PAGE-04)
│   ├── events/+page.svelte       # 03-04: Events (PAGE-05)
│   ├── contact/+page.svelte      # 03-04: Contact scaffold (PAGE-07, no backend)
│   ├── blog/
│   │   ├── +page.svelte          # 03-05: index (PAGE-06/BLOG-02) — imports posts.ts
│   │   └── [slug]/
│   │       ├── +page.ts          # 03-05: universal load + entries() + prerender=true
│   │       └── +page.svelte      # 03-05: renders <Content/> + meta (single h1)
│   └── +error.svelte             # UNCHANGED (Phase-1 branded 404; Phase-6 refines)
├── lib/
│   ├── posts/                    # 03-02: blog markdown lives HERE (outside routes)
│   │   └── *.md                  # frontmatter + body
│   ├── data/
│   │   ├── nav.ts                # 03-01/02: nav item list (label + href), single source
│   │   └── events.ts             # 03-04: events data array (PAGE-05 "structure ready")
│   ├── posts.ts                  # 03-02: eager glob → sorted index (BLOG-02)
│   ├── components/               # 03-01: SkipLink, Header, Nav, Footer, Button, PageHeader
│   └── styles/                   # UNCHANGED token/theme files
```

### Pattern 1: App shell in `+layout.svelte` (03-01, PAGE-08 + A11Y-02/03)
**What:** One layout owns all landmarks so every page inherits correct structure.
**Structure (order matters — skip link must be the first focusable element):**
```svelte
<script lang="ts">
  import '$lib/styles/reset.css';          // KEEP all 4 imports exactly
  import '$lib/styles/tokens/base.css';
  import '$lib/styles/theme-premium.css';
  import '$lib/styles/theme-accessible.css';
  import favicon from '$lib/assets/favicon.svg';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<a class="skip-link" href="#main-content">Skip to main content</a>
<Header />                            <!-- contains <nav> + relocated <ThemeToggle/> -->
<main id="main-content" tabindex="-1">
  {@render children()}
</main>
<Footer />
```
- `<main tabindex="-1">` is REQUIRED so the skip link actually **moves focus** (A11Y-02) — without it, clicking the skip link scrolls but many browsers/AT leave focus at the link.
- Exactly ONE `<header>`, ONE `<nav>` (add `aria-label="Primary"` if a second nav appears, e.g. footer nav → `aria-label="Footer"`), ONE `<main>`, ONE `<footer>` per page → landmark correctness (A11Y-03).
- The `<h1>` lives in each `+page.svelte`, never in the layout → guarantees single-h1-per-page.

### Pattern 2: mdsvex + Shiki build-time pipeline (03-02, BLOG-01/03)
**What:** Register mdsvex as a preprocessor composed WITH the existing `vitePreprocess()`, and plug Shiki into `highlight.highlighter`. All of this executes at build; the client bundle never imports Shiki.
**svelte.config.js (verified pattern — merge into the existing config, keep adapter/paths intact):**
```javascript
// Source: mdsvex docs + fatihnayebi.com/blog/build-time-syntax-highlighting-in-sveltekit (verified 2026-07-04)
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex, escapeSvelte } from 'mdsvex';
import { createHighlighter } from 'shiki';
import rehypeSlug from 'rehype-slug';

// One highlighter for the whole build (lazy singleton — do NOT create per code block).
let highlighter;
const theme = 'github-dark'; // pick to match tokens; single theme keeps output small

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
  extensions: ['.md'],
  highlight: {
    highlighter: async (code, lang = 'text') => {
      highlighter ??= await createHighlighter({
        themes: [theme],
        langs: ['javascript', 'typescript', 'svelte', 'html', 'css', 'json', 'bash', 'python']
      });
      const html = escapeSvelte(highlighter.codeToHtml(code, { lang, theme }));
      return `{@html \`${html}\`}`;
    }
  },
  rehypePlugins: [rehypeSlug]
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.md'],                 // Kit must recognize .md
  preprocess: [vitePreprocess(), mdsvex(mdsvexOptions)],  // order: vitePreprocess THEN mdsvex
  kit: {
    adapter: adapter({ fallback: '404.html', precompress: false, strict: true }),
    paths: { base: process.env.BASE_PATH ?? '', relative: false }   // UNCHANGED
  }
};
export default config;
```
- `escapeSvelte` comes from **`mdsvex`** (not shiki). It prevents `{` `}` in highlighted HTML from being parsed as Svelte.
- Because Shiki runs only inside this preprocess step, **no Shiki code reaches the client** (BLOG-03). Verify by asserting `build/_app/**/*.js` contains no `shiki` / `codeToHtml` (see Validation Architecture).
- Style the emitted `<pre class="shiki">` via a small CSS rule using tokens (or accept Shiki's inline theme colors). One theme avoids shipping a theme-switcher.

### Pattern 3: Globbed post index (03-02, BLOG-02)
```typescript
// src/lib/posts.ts  — Source: Vite import.meta.glob + mdsvex metadata export
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
  .sort((a, b) => +new Date(b.date) - +new Date(a.date)); // newest first
```
- mdsvex exports frontmatter as `metadata` and the compiled component as `default`. Frontmatter schema (fenced `---` YAML at top of each `.md`): `title`, `date`, `summary`, optional `draft`.
- Absolute glob path `/src/lib/posts/*.md` is robust regardless of importer depth.

### Pattern 4: Prerendered dynamic `[slug]` route (03-05, BLOG-01, DEPLOY-03)
```typescript
// src/routes/blog/[slug]/+page.ts  — universal load (NOT +page.server.ts)
import { error } from '@sveltejs/kit';
export const prerender = true;

const modules = import.meta.glob('/src/lib/posts/*.md'); // lazy (no eager) — returns loaders

export async function load({ params }) {
  const loader = modules[`/src/lib/posts/${params.slug}.md`];
  if (!loader) throw error(404, 'Post not found');
  const post = await loader() as { default: unknown; metadata: any };
  return { Content: post.default, meta: post.metadata };
}

export function entries() {
  return Object.keys(modules).map((path) => ({
    slug: path.split('/').at(-1)!.replace('.md', '')
  }));
}
```
```svelte
<!-- src/routes/blog/[slug]/+page.svelte -->
<script lang="ts">
  let { data } = $props();
  const { Content, meta } = data;   // Content is a component (Svelte 5: render directly)
</script>
<svelte:head><title>{meta.title} — Diversity Includes Disability</title></svelte:head>
<article>
  <h1>{meta.title}</h1>
  <p class="post-date"><time datetime={meta.date}>{meta.date}</time></p>
  <Content />          <!-- markdown body: author it starting at h2 so the h1 above is unique -->
</article>
```
**Why universal `+page.ts` (critical):** a component constructor is NOT serializable. `+page.server.ts` would throw "data is not serializable". Universal loads are allowed to return non-serializable values — SvelteKit simply re-runs the load on the client instead of transporting it. This is exactly why every mdsvex `[slug]` tutorial uses `+page.ts`.
**Why `entries()`:** the prerender crawler already discovers posts linked from the blog index, so `entries()` is belt-and-suspenders — but it guarantees prerendering even for unlinked/draft-preview posts and documents intent. With `strict: true`, any post not reachable AND not in `entries()` would fail the build; `entries()` makes it deterministic.

### Anti-patterns to avoid
- **Bare internal links.** `<a href="/about">` breaks on the sub-path. ALWAYS `<a href="{base}/about">` with `import { base } from '$app/paths'`. (See Common Pitfalls #1.)
- **h1 in the layout** or multiple h1s per page → breaks A11Y-03. h1 belongs to the page; posts start at h2.
- **Returning the component from `+page.server.ts`** → non-serializable error. Use `+page.ts`.
- **`<svelte:component this={data.Content}/>`** — deprecated in Svelte 5. Assign to a capitalized `const` and render `<Content/>`.
- **Importing Shiki in a `.svelte` component** to "highlight on the client" → ships the highlighter, violates BLOG-03. Highlighting happens ONLY in `svelte.config.js`.
- **Adding Tailwind / new tokens.** Compose the existing custom properties.

## Don't Hand-Roll

| Problem | Don't build | Use instead | Why |
|---------|-------------|-------------|-----|
| Markdown → HTML/components | Custom `marked` pipeline | **mdsvex** | Frontmatter, Svelte-in-md, rehype/remark ecosystem, prerender-friendly |
| Syntax highlighting | Regex/manual tokenizer, runtime Prism | **Shiki at build** | TextMate-accurate; zero client JS (BLOG-03) |
| Heading IDs / anchors | Manual slugging | **rehype-slug** | Unicode-safe, dedupes collisions |
| Listing/sorting posts | fs reads, manual manifest | **`import.meta.glob` (eager)** | Vite resolves at build; no server, tree-shaken |
| Prerendering dynamic routes | Custom route manifest | **`entries()` + `prerender=true`** | First-class SvelteKit SSG mechanism |
| Skip-link focus movement | JS scroll hacks | `href="#id"` + `tabindex="-1"` on target | Native, AT-correct, no JS |
| Sticky-header focus obscuring | JS scroll offset | CSS `scroll-margin-top` | Declarative, satisfies WCAG 2.4.11 |

**Key insight:** Every "content pipeline" concern here has a blessed, build-time, zero-runtime-cost Svelte/Vite solution. Hand-rolling any of them adds client JS and risks the a11y/perf budget that Phase 6 will gate.

## Accessible App-Shell Patterns (A11Y-02/03/04 — WCAG 2.2)

### Skip link (A11Y-02, WCAG 2.4.1)
```svelte
<a class="skip-link" href="#main-content">Skip to main content</a>
```
```css
.skip-link {
  position: absolute; left: var(--space-2); top: var(--space-2);
  transform: translateY(-150%);            /* off-screen until focused */
  padding: var(--space-2) var(--space-4);
  background: var(--color-surface); color: var(--color-text);
  border: var(--focus-ring-width) solid var(--color-focus);
  border-radius: var(--radius); z-index: 1000;
}
.skip-link:focus { transform: translateY(0); }   /* visible on focus */
```
Target: `<main id="main-content" tabindex="-1">`. The `tabindex="-1"` is what makes focus actually land in `<main>`.

### Focus visibility + target size (A11Y-04)
- **Visible focus (WCAG 2.4.7):** reuse the Phase-2 pattern — `:focus-visible { outline: var(--focus-ring-width) solid var(--color-focus); outline-offset: 2px; }`. Tokens already exist (`--focus-ring-width`, `--color-focus`).
- **Target size ≥24px (WCAG 2.5.8, AA):** every nav link / button `min-block-size: 24px; min-inline-size: 24px` (ThemeToggle already uses 44px). Prefer 44px for primary controls; 24px is the hard floor.
- **Focus not obscured (WCAG 2.4.11, AA — new in 2.2):** if the header is `position: sticky`, an anchor-jumped or tab-focused element can hide behind it. Fix declaratively:
  ```css
  :target { scroll-margin-top: var(--header-height, 5rem); }
  main :is(h1,h2,h3,[tabindex]) { scroll-margin-top: var(--header-height, 5rem); }
  ```
  Simplest guarantee: make the header NOT sticky in the Accessible theme (motion/calm) and only sticky in Premium — but even then apply `scroll-margin-top`.

### Responsive disclosure nav (PAGE-08 + A11Y-04)
```svelte
<script lang="ts">
  import { base } from '$app/paths';
  import { navItems } from '$lib/data/nav';
  let open = $state(false);
  let toggleBtn: HTMLButtonElement;
  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) { open = false; toggleBtn.focus(); } // ESC closes + returns focus
  }
</script>
<nav aria-label="Primary" onkeydown={onKeydown}>
  <button bind:this={toggleBtn} class="nav-toggle" aria-expanded={open}
          aria-controls="primary-menu" onclick={() => (open = !open)}>
    <span class="sr-only">Menu</span>{open ? 'Close' : 'Menu'}
  </button>
  <ul id="primary-menu" class:open>
    {#each navItems as item}
      <li><a href="{base}{item.href}" aria-current={/* page match */ undefined}>{item.label}</a></li>
    {/each}
  </ul>
  <ThemeToggle />       <!-- relocated here, component unchanged -->
</nav>
```
Requirements the pattern satisfies: `aria-expanded` reflects state; `aria-controls` links button↔menu; **ESC closes and returns focus** to the toggle; menu is a real `<ul>` of links (keyboard-operable for free); the desktop view shows the list and hides the button via CSS `@media`. Use `aria-current="page"` on the active link (compute from `$page.url.pathname` via `$app/state` / `$app/stores`). On mobile, hiding the menu should use `display:none`/`hidden` when closed so links aren't tab-reachable while visually hidden.

### Heading order (A11Y-03)
- One `<h1>` per page (page title). Sections use `<h2>`, sub-sections `<h3>`; never skip a level. Blog post bodies start at `<h2>` (h1 is the rendered title). rehype-slug gives each an `id`.

## Common Pitfalls

### Pitfall 1: Un-prefixed internal links break under the sub-path
**What goes wrong:** `<a href="/about">`, `<img src="/logo.png">`, or a markdown link `[x](/programs)` 404s on `wolfwdavid.github.io/diversityincludesdisability_one/`.
**Why:** the site is served from a sub-path, not origin root; `paths.relative=false` means absolute URLs are emitted as-is.
**How to avoid:** `import { base } from '$app/paths'` and prefix every internal href/src: `href="{base}/about"`, `src="{base}/img/x.png"`. Centralize nav in `src/lib/data/nav.ts` so prefixing happens in one place. For **markdown** content, `base` is NOT auto-injected — either (a) keep post-internal links relative, or (b) put post images in `static/` and reference `{base}`-prefixed paths from the `.md` via an mdsvex layout, or (c) avoid absolute in-content links. Flag any `/`-rooted link in `.md` during review.
**Warning signs:** links work in `npm run dev` (base='') but 404 on deploy. Test with `BASE_PATH=/diversityincludesdisability_one npm run build && npm run preview`.

### Pitfall 2: Shiki 4.x uses `createHighlighter`, not `getHighlighter`
**What goes wrong:** old tutorials import `getHighlighter` (Shiki ≤1.x / `shikiji`) — deprecated in 4.x.
**How to avoid:** `import { createHighlighter } from 'shiki'`. Cache it in a module-level singleton (`highlighter ??= await createHighlighter(...)`) so the build doesn't re-instantiate per code block. Declare only the `langs` you use (smaller/faster build).

### Pitfall 3: Serialization error on the `[slug]` route
**What goes wrong:** putting the load in `+page.server.ts` → "Data returned from load is not serializable" (the component constructor).
**How to avoid:** use universal `+page.ts` (Pattern 4). Accept that load re-runs on the client for that route (fine — it's a static import).

### Pitfall 4: `strict: true` build fails on an undiscovered post
**What goes wrong:** a post not linked anywhere AND not in `entries()` → prerender crawler misses it → strict build fails.
**How to avoid:** always provide `entries()` derived from the same glob as `posts.ts`, so index and route stay in sync.

### Pitfall 5: mdsvex `.md` not recognized / preprocess order
**What goes wrong:** forgetting `extensions: ['.svelte', '.md']` at the Kit config level, or ordering `mdsvex()` before `vitePreprocess()`.
**How to avoid:** set Kit `extensions` AND `mdsvexOptions.extensions: ['.md']`; order the array `[vitePreprocess(), mdsvex(...)]`.

### Pitfall 6: Skip link scrolls but doesn't move focus
**What goes wrong:** `<main>` without `tabindex="-1"` — focus stays on the skip link; screen-reader users aren't moved into content.
**How to avoid:** `<main id="main-content" tabindex="-1">`.

## Real DID Content (sourced 2026-07-04)

> **Provenance & confidence.** The live site `https://www.diversityincludesdisability.org/` is a JS-rendered Wix single-pager; automated fetch reliably extracts the **four services**, the **contact email**, and footer attribution. Eman Rimawi's **bio facts** are corroborated by multiple independent press/nonprofit sources (Living With Amplitude, NYLPI, The City, Center for American Progress). No explicit mission-statement prose is exposed on the site, so mission copy below is **AUTHORED in the org's voice from real facts** and must be confirmed/edited by the org before launch.

### Verified facts (HIGH confidence — port as real content)
- **Contact email:** `emanrimawi@gmail.com`
- **Footer attribution:** © Eman Rimawi-Doster (site currently "© 2024", Wix).
- **Four services (PAGE-03, verbatim service names from the live site):**
  1. **Intersectional Disability Equity and Inclusion trainings and facilitation**
  2. **Disability Consulting**
  3. **Modeling for Representation**
  4. **Speaker and Panelist**

### Eman Rimawi-Doster bio (PAGE-02 — facts HIGH confidence; assemble into prose)
- Mixed Black Palestinian woman; **bilateral (double) leg amputee since 2014**; lives with **lupus**; New York native.
- **Executive Director of Diversity Includes Disability** — an organization run *for and by disabled people*.
- **Executive Director, Harlem Independent Living Center.**
- Former **Access-A-Ride Campaign Coordinator & Organizer at New York Lawyers for the Public Interest (NYLPI)** (full-time disability advocate from 2017); nationally recognized voice on accessible transit, voting rights, and health equity for disabled New Yorkers.
- Launched an **adaptive clothing line** after her amputations; also a poet and graphic-novel creator.

Suggested About prose (authored, editable): *"Eman Rimawi-Doster is a disability-justice advocate, organizer, and the founder and Executive Director of Diversity Includes Disability — an organization built for and by disabled people. A mixed Black Palestinian woman, bilateral amputee, and person living with lupus, Eman has spent years as one of New York's most forceful voices for accessible transit, voting rights, and health equity, including leading the Access-A-Ride campaign at New York Lawyers for the Public Interest. She also serves as Executive Director of the Harlem Independent Living Center."*

### Mission (PAGE-01/02 — AUTHORED PLACEHOLDER, confirm with org)
*"Diversity Includes Disability advances intersectional disability equity — for and by disabled people. Through training, consulting, representation, and public speaking, we help organizations move beyond compliance to genuine inclusion, centering the leadership of disabled people of color."* — Mark clearly as authored; replace with org-approved wording.

### Pages without a real source — AUTHORED PLACEHOLDER (clearly label in copy + a code comment)
- **Get Involved / Donate (PAGE-04):** authored volunteer blurb ("Volunteer, invite Eman to speak, or partner with us…") + a placeholder external **Donate** link-out (`<a href="#" rel="noopener noreferrer">` with a `TODO(Phase 4/FORM-04): real donation URL`). No embedded checkout.
- **Events (PAGE-05):** `src/lib/data/events.ts` with 1–2 clearly-fictional sample events + an empty-state ("No upcoming events — check back soon"). Structure must render real events when added.
- **Blog/News (PAGE-06):** 1–2 authored sample posts in `src/lib/posts/*.md` (e.g., a welcome post + an accessibility-commitment post) with real frontmatter, marked as sample content.
- **Contact (PAGE-07):** accessible form **scaffold** (labeled fields, `aria-describedby` error slots, `emanrimawi@gmail.com` shown as a mailto fallback). NO submit handler/backend — that's Phase 4.

## Code Examples

### Base-prefixed nav data (single source of truth)
```typescript
// src/lib/data/nav.ts
export const navItems = [
  { href: '/',             label: 'Home' },
  { href: '/about',        label: 'About' },
  { href: '/programs',     label: 'Programs & Services' },
  { href: '/get-involved', label: 'Get Involved' },
  { href: '/events',       label: 'Events' },
  { href: '/blog',         label: 'News' },
  { href: '/contact',      label: 'Contact' }
] as const;
// consumer: <a href="{base}{item.href}">  — never render item.href bare
```

### Active-link detection (Svelte 5 runes)
```svelte
<script lang="ts">
  import { page } from '$app/state';   // Kit 2.x runes-friendly ($app/stores also works)
  import { base } from '$app/paths';
  const current = (href: string) => page.url.pathname === `${base}${href}`;
</script>
<a href="{base}{item.href}" aria-current={current(item.href) ? 'page' : undefined}>{item.label}</a>
```

### Blog post frontmatter (`src/lib/posts/welcome.md`)
```markdown
---
title: Welcome to Diversity Includes Disability
date: 2026-07-04
summary: Why we build for and by disabled people — and what to expect from this space.
---

## Our commitment

Body content starts at h2 (the page renders the h1 from `title`)...

\`\`\`ts
const inclusive = true;   // highlighted at build by Shiki — zero client JS
\`\`\`
```

## State of the Art

| Old approach | Current (2026) approach | Impact |
|--------------|-------------------------|--------|
| `getHighlighter` (shiki ≤1 / shikiji) | `createHighlighter` (shiki 4.3.1) | Import name change; cache as singleton |
| `<svelte:component this={C}/>` | `const C = ...; <C/>` (Svelte 5) | `<svelte:component>` deprecated in runes mode |
| `svelte-preprocess` for markdown | `mdsvex` preprocessor | mdsvex is the maintained Svelte-5 path |
| Runtime Prism/highlight.js | Shiki at build | No client JS; required by BLOG-03 |
| `$app/stores` `$page` | `$app/state` `page` (Kit 2.12+) | Runes-native; either works, `$app/state` preferred |

**Deprecated / avoid:** shiki `getHighlighter`; `<svelte:component>`; `+page.server.ts` for component-returning loads; Tailwind addition; any runtime highlighter.

## Open Questions

1. **Exact org mission wording.** Live site exposes no mission prose. → Ship authored placeholder (above), clearly flagged; request org-approved copy before Phase 6 launch.
2. **Shiki theme vs. dual site themes.** Site has Premium/Accessible themes but Shiki emits a single code theme. → Recommend one accessible-contrast Shiki theme (e.g. `github-dark` or `github-light`) styled to sit inside both themes; a per-theme code theme is possible (dual-theme Shiki + CSS vars) but adds complexity — defer unless requested.
3. **Donation platform URL.** Real donate target unknown (FORM-04, Phase 4). → Placeholder link-out now.
4. **Post image handling under base path.** If sample posts embed images, decide `static/` + `{base}` convention now to avoid rework. → Recommend `static/blog/<slug>/` and reference from an mdsvex layout that injects `base`.

## Validation Architecture

> `workflow.nyquist_validation: true` in config.json → this section is REQUIRED.

### Test Framework
| Property | Value |
|----------|-------|
| Unit framework | Vitest 4.1.9 (jsdom env; existing `test:unit` runs `src/lib/theme`) |
| E2E / a11y framework | Playwright 1.61.1 (existing `smoke` + `test:theme` configs) |
| Config files | `playwright.theme.config.ts` (exists); reuse/extend for shell + content specs |
| Quick run | `npm run test:unit` (Vitest, fast) |
| Full suite | `npm run test:unit && npm run build && npm run smoke` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test type | Automated command | File exists? |
|--------|----------|-----------|-------------------|--------------|
| BLOG-02 | posts.ts globs, filters drafts, sorts newest-first | unit | `vitest run src/lib/posts.test.ts` | ❌ Wave 0 |
| BLOG-01 | every post prerenders to static HTML | build+e2e | `npm run build` (strict) + Playwright GET each `/blog/<slug>/` | ❌ Wave 0 |
| BLOG-03 | no runtime highlighter shipped | build-artifact | node scan: assert no `shiki`/`codeToHtml` in `build/_app/**/*.js` | ❌ Wave 0 |
| A11Y-02 | skip link moves focus into `<main>` | e2e | Playwright: focus skip link → Enter → `expect(main).toBeFocused()` | ❌ Wave 0 |
| A11Y-03 | one h1/page + ordered landmarks | e2e | Playwright: assert exactly one `h1`, one `main`/`header`/`footer`, no skipped heading levels | ❌ Wave 0 |
| A11Y-04 | keyboard nav, visible focus, ESC closes menu, ≥24px targets | e2e | Playwright: Tab order, `aria-expanded` toggles, Escape returns focus, boundingBox ≥24px | ❌ Wave 0 |
| PAGE-08 | all 7 pages reachable via header/footer nav | e2e | Playwright: click each nav item → URL + h1 assertion | ❌ Wave 0 |
| PAGE-06 | deep-link/refresh a post resolves (with base) | e2e | Playwright against `preview` with `BASE_PATH` set → GET `/base/blog/<slug>/` = 200 + content | ❌ Wave 0 |
| PAGE-02/03 | real bio + four service names present | e2e (content) | Playwright: assert service strings + bio keywords render | ❌ Wave 0 |

### Sampling rate
- **Per task commit:** `npm run test:unit` (posts.ts logic) + `svelte-check`.
- **Per wave merge:** `npm run build` (strict prerender gate) + relevant Playwright spec.
- **Phase gate:** `npm run test:unit && npm run build && npm run smoke` green (with `BASE_PATH` set for the deploy-path deep-link spec) before `/gsd:verify-work`. NOTE: full axe/Lighthouse WCAG audit is Phase 6 (A11Y-01) — Phase 3 validates *structure* (landmarks, focus, keyboard), not full conformance.

### Wave 0 gaps
- [ ] `src/lib/posts.test.ts` — glob/sort/draft-filter (BLOG-02); use a fixtures dir or mock `import.meta.glob`.
- [ ] `tests/shell.spec.ts` (Playwright) — skip-link focus, landmarks, heading order, nav keyboard/ESC/aria, target size (A11Y-02/03/04, PAGE-08).
- [ ] `tests/blog.spec.ts` — index lists title/date/summary; each `[slug]` prerenders + deep-links under base (BLOG-01, PAGE-06).
- [ ] `scripts/assert-no-shiki-chunk.mjs` (or a Vitest test) — scan `build/_app` for `shiki`/`codeToHtml` (BLOG-03).
- [ ] `src/lib/posts/*.md` sample fixtures (≥2) + `src/lib/data/events.ts` sample data.
- [ ] Framework installs: `npm i -D mdsvex@0.12.7 shiki@4.3.1 rehype-slug@6.0.0` (blocks 03-02).

## Sources

### Primary (HIGH confidence)
- npm registry `npm view` (2026-07-04): mdsvex 0.12.7, shiki 4.3.1 (latest; `next`=0.9.4 old), rehype-slug 6.0.0, rehype-autolink-headings 7.1.0 — exact live versions.
- SvelteKit docs — Page options (`prerender`, `entries()`/EntryGenerator signature, link crawling, `trailingSlash`): https://svelte.dev/docs/kit/page-options
- Embedded STACK.md (CLAUDE.md) — verified version matrix + "What NOT to Use" for this exact project.
- Live DID site (four service names + `emanrimawi@gmail.com` + footer): https://www.diversityincludesdisability.org/
- Project files read: REQUIREMENTS.md, ROADMAP.md, STATE.md, PROJECT.md, package.json, svelte.config.js, +layout.svelte, +layout.ts, +page.svelte, about/+page.svelte, ThemeToggle.svelte, theme.svelte.ts, app.html, base.css, theme-accessible.css.

### Secondary (MEDIUM confidence — verified against official patterns)
- mdsvex+Shiki build-time config (escapeSvelte from mdsvex, createHighlighter singleton, `{@html}` return): fatihnayebi.com/blog/build-time-syntax-highlighting-in-sveltekit ; lucasmelin.com/blog/2026/Jan/20/shiki-mdsvex ; johnhooks.io/projects/highlighter
- `[slug]` prerender via `entries()` + `import.meta.glob`: github.com/sveltejs/kit/discussions/11977 ; amandaguthrie.dev/post/svelte-prerender-dynamic-paths-for-ssg
- Eman Rimawi-Doster bio facts (double amputee 2014, NYLPI Access-A-Ride, Exec Dir Harlem ILC + DID, lupus, adaptive clothing line): livingwithamplitude.com ; nylpi.org ; thecity.nyc ; americanprogress.org

### Tertiary (LOW confidence — flagged for org confirmation)
- Org mission prose — no explicit statement on the live site; authored from real facts, MUST be org-confirmed.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions verified live on npm; compatibility from CLAUDE.md matrix.
- Architecture (mdsvex/Shiki/entries/shell): HIGH — official SvelteKit docs + multiple corroborating config sources; escapeSvelte/createHighlighter confirmed.
- Accessibility patterns: HIGH — WCAG 2.2 SC references (2.4.1/2.4.7/2.4.11/2.5.8) map to concrete token-based implementations.
- Real DID content: MEDIUM — services + email + bio facts HIGH; mission prose authored (LOW until org-confirmed).

**Research date:** 2026-07-04
**Valid until:** ~2026-08-03 for library versions (fast-moving: re-check shiki/mdsvex before install); content facts stable.
