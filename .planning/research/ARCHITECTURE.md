# Architecture Research

**Domain:** SvelteKit static site (adapter-static → GitHub Pages) with dual full themes (Premium 3D + Accessible WCAG 2.2 AA+), markdown blog, static-host forms
**Researched:** 2026-07-04
**Confidence:** HIGH (SvelteKit static + no-flash theme + capability gating verified against current docs/community; MEDIUM only on exact Threlte 8 `@threlte/extras` runes-mode edge cases — pin versions)

## Standard Architecture

The whole site is **prerendered to static HTML/CSS/JS at build time** and served by GitHub Pages. There is no server at request time, which forces three hard architectural rules that shape everything below:

1. **No-flash theming cannot use cookies + SSR** (there is no request-time server). It must use an **inline blocking script in `app.html`** that reads `localStorage` and stamps `data-theme` on `<html>` *before first paint*.
2. **Forms and donations are third-party** (Formspree/Netlify-style POST endpoint; donate is a link-out). The app never holds secrets.
3. **The 3D hero must be a lazy, client-only island** — it cannot exist in the prerendered HTML payload and must never block first paint or the accessible experience.

### System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│  BUILD TIME (Vite + SvelteKit + adapter-static)                        │
│  content/*.md ──mdsvex/glob──▶ +page/+layout load ──▶ prerender ──▶    │
│  static HTML per route + hashed JS/CSS chunks + poster images          │
└───────────────────────────────┬──────────────────────────────────────┘
                                 │  git push → GitHub Actions → Pages
                                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│  RUNTIME (browser only — GitHub Pages is a dumb file host)             │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │ app.html  ── inline no-flash script: set <html data-theme> ──▶  │   │
│  └────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │  +layout    │  │  Route      │  │  Design     │  │  Content    │   │
│  │  (shell:    │  │  pages ×7   │  │  tokens     │  │  as data    │   │
│  │  skip-link, │  │  (Home,     │  │  (CSS vars, │  │  (md posts, │   │
│  │  nav, foot, │  │  About …)   │  │  data-theme │  │  events,    │   │
│  │  theme UI)  │  │             │  │  scoped)    │  │  nav copy)  │   │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘   │
│         │  subscribe      │  read tokens   │                │          │
│  ┌──────┴─────────────────┴────────────────┴────────────────┴──────┐  │
│  │  theme.svelte.ts  (rune store: mode + resolved capabilities)     │  │
│  │  ↕ localStorage    ↕ matchMedia(prefers-reduced-motion / -data)  │  │
│  └──────┬──────────────────────────────────────────────────────────┘  │
│         │  gate: premium && webgl && !reduced-motion && !low-power     │
│  ┌──────┴──────────────────────────────────────────────────────────┐  │
│  │  HeroMount.svelte  ── renders <img> poster FIRST ──────────────▶ │  │
│  │      └─ if allowed: await import('./HeroScene.svelte') (Threlte) │  │
│  │           swap poster → <Canvas> WebGL island (client-only)      │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `app.html` inline script | Stamp `data-theme` + `data-motion` on `<html>` before paint; zero-flash | Tiny synchronous IIFE, no imports |
| `+layout.svelte` (shell) | Skip-link, `<header>`/`<nav>`/`<main>`/`<footer>` landmarks, theme toggle UI, focus management | Svelte 5 component, one per site |
| `theme.svelte.ts` (store) | Single source of truth for `mode` (premium/accessible) + resolved capability flags; syncs localStorage & `data-*` attrs | Rune-based module store (`$state`, `$derived`) |
| Design tokens | All motion/contrast/type/spacing values as CSS custom properties, swapped by `[data-theme]` | Plain CSS files, no JS |
| Route pages ×7 | Compose content-as-data + primitives into each page; theme-agnostic markup | `+page.svelte` + `+page.ts` load |
| Content-as-data | Decouple copy/posts/events from presentation so both themes render identical content | `.md` (mdsvex) + `.ts`/`.json` data modules |
| `HeroMount.svelte` | Poster-first hero wrapper; owns the capability gate + dynamic import handshake | Client-only island |
| `HeroScene.svelte` | The actual Threlte/WebGL scene; never imported statically | `@threlte/core` Canvas, code-split chunk |
| `capabilities.ts` | Pure detection: WebGL, reduced-motion, low-power, save-data | Framework-free functions |
| Form components | POST to third-party endpoint; progressive-enhancement, honeypot | `<form action>` + `fetch` fallback |

## Recommended Project Structure

```
diversityincludesdisability_one/
├── .github/workflows/deploy.yml   # Actions: build + deploy to Pages
├── static/
│   ├── .nojekyll                  # REQUIRED: stop Pages mangling _app/ dirs
│   ├── theme-init.js              # (optional) external no-flash script
│   └── posters/hero-*.webp        # 3D fallback poster images (both themes)
├── content/
│   ├── blog/*.md                  # mdsvex posts (frontmatter + body)
│   └── events/*.md  OR  events.ts # structured event data
├── src/
│   ├── app.html                   # inline no-flash script lives here
│   ├── app.css                    # imports token layers in cascade order
│   ├── lib/
│   │   ├── styles/
│   │   │   ├── reset.css
│   │   │   ├── tokens/
│   │   │   │   ├── base.css           # :root shared primitives
│   │   │   │   ├── theme-premium.css  # [data-theme="premium"] overrides
│   │   │   │   └── theme-accessible.css# [data-theme="accessible"] overrides
│   │   │   └── typography.css
│   │   ├── stores/
│   │   │   └── theme.svelte.ts     # mode + capability rune store
│   │   ├── three/
│   │   │   ├── capabilities.ts     # WebGL/reduced-motion/low-power detect
│   │   │   ├── HeroMount.svelte    # poster-first gate + dynamic import
│   │   │   └── HeroScene.svelte    # Threlte Canvas (code-split target)
│   │   ├── components/
│   │   │   ├── primitives/         # Button, Card, Link, Heading (token-driven)
│   │   │   ├── layout/             # Header, Nav, Footer, SkipLink
│   │   │   ├── ThemeToggle.svelte
│   │   │   └── forms/              # ContactForm, VolunteerForm
│   │   ├── content/
│   │   │   ├── posts.ts            # import.meta.glob loader + sort/filter
│   │   │   └── nav.ts              # site nav + page copy as data
│   │   └── util/                   # a11y helpers, focus-trap, formatDate
│   └── routes/
│       ├── +layout.ts             # prerender=true, trailingSlash='always'
│       ├── +layout.svelte         # global shell
│       ├── +page.svelte           # Home (mounts HeroMount)
│       ├── about/+page.svelte
│       ├── programs/+page.svelte
│       ├── get-involved/+page.svelte   # donate link-out + VolunteerForm
│       ├── blog/+page.ts +page.svelte  # index (list from posts.ts)
│       ├── blog/[slug]/+page.ts +page.svelte  # entries prerendered
│       ├── events/+page.svelte
│       └── contact/+page.svelte        # ContactForm
├── svelte.config.js               # adapter-static + paths.base + mdsvex
└── vite.config.ts
```

### Structure Rationale

- **`content/` outside `src/`:** Copy/posts/events are data, not code. Keeping them separate lets a non-dev edit markdown without touching components and makes the "content-as-data" contract explicit — both themes consume the same source.
- **`lib/three/` is a quarantine zone:** Nothing in `three/` may be imported by a `+page.svelte` statically. Only `HeroMount` is referenced, and it reaches `HeroScene` via `await import()`. This is the physical boundary that keeps WebGL out of the accessible/first-paint path.
- **`lib/styles/tokens/` split by theme file:** Each theme is a *complete* design (motion + contrast + typography + spacing). One file per theme makes each theme auditable as a coherent whole, and the `[data-theme]` selector scoping means switching is a single attribute change with zero JS re-render of styles.
- **`primitives/` are token-only:** Components read `var(--…)` and never hardcode colors/spacing, so a primitive automatically becomes correct in both themes.

## Architectural Patterns

### Pattern 1: Attribute-driven dual-theme via CSS custom properties

**What:** Every design decision is a CSS variable defined in `:root` (base) and overridden under `[data-theme="premium"]` / `[data-theme="accessible"]`. Themes differ across *all* axes, not just color:

```css
/* tokens/base.css — shared primitives + variable contract */
:root {
  --font-sans: system-ui, sans-serif;
  --focus-ring: 3px solid var(--color-focus);
}
/* tokens/theme-premium.css */
[data-theme="premium"] {
  --color-bg: #0b0b12;  --color-fg: #f5f5ff;   /* rich, lower-contrast dramatic */
  --font-display: "Editorial", serif;          /* expressive type */
  --space-scale: 1.25;   --motion-duration: 320ms;  --motion-ease: cubic-bezier(.2,.8,.2,1);
  --radius: 18px;
}
/* tokens/theme-accessible.css */
[data-theme="accessible"] {
  --color-bg: #ffffff;  --color-fg: #1a1a1a;   /* >= 7:1 AAA-leaning contrast */
  --font-display: var(--font-sans);            /* legible, no decorative faces */
  --space-scale: 1.5;    --motion-duration: 0ms;    --motion-ease: linear; /* generous spacing, still */
  --radius: 4px;
}
/* Reduced-motion is a hard override regardless of theme */
@media (prefers-reduced-motion: reduce) { :root { --motion-duration: 0ms; } }
```

**When to use:** Whenever two (or more) coherent, switchable designs must share one component tree.
**Trade-offs:** + Instant switch, no re-render, works with prerender, one markup path. − Requires discipline: components must never hardcode values; needs a lint/review gate.

### Pattern 2: No-flash theme resolution (static-host safe)

**What:** Because there is no request-time server, the *only* way to avoid a wrong-theme flash is a synchronous inline script in `app.html` that runs before the body renders. It also honors reduced-motion and a `prefers-color-scheme`/low-power default.

```html
<!-- app.html, in <head> before %sveltekit.head% -->
<script>
  (function () {
    try {
      var stored = localStorage.getItem('did-theme');       // 'premium' | 'accessible'
      var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      var saveData = navigator.connection && navigator.connection.saveData;
      // Default policy: honor explicit choice; else default to ACCESSIBLE
      // when reduced-motion / save-data signals are present, else premium.
      var mode = stored || ((reduce || saveData) ? 'accessible' : 'premium');
      var d = document.documentElement;
      d.setAttribute('data-theme', mode);
      d.setAttribute('data-motion', reduce ? 'reduce' : 'ok');
    } catch (e) { document.documentElement.setAttribute('data-theme', 'accessible'); }
  })();
</script>
```

**When to use:** Any prerendered/static site with persisted theme. **Do not** attempt cookie+SSR here — it silently fails on a static host.
**Trade-offs:** + Zero flash, no dependency. − Logic is duplicated once (tiny) between this script and the rune store; keep the key name and policy in a shared constant conceptually.

### Pattern 3: Poster-first, capability-gated 3D island (dynamic import)

**What:** The hero always renders a static poster image in the prerendered HTML. Only after mount, only if the gate passes, is the Threlte scene dynamically imported and swapped in. WebGL never enters the accessible path or the initial JS.

```svelte
<!-- HeroMount.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { theme } from '$lib/stores/theme.svelte';
  import { canRun3D } from '$lib/three/capabilities';
  let Scene = $state<null | typeof import('./HeroScene.svelte').default>(null);

  onMount(async () => {
    if (theme.mode === 'premium' && theme.motion === 'ok' && canRun3D()) {
      const mod = await import('./HeroScene.svelte');   // separate chunk, loaded on demand
      Scene = mod.default;
    }
  });
</script>

{#if Scene}
  <Scene />
{:else}
  <img src="{base}/posters/hero-{theme.mode}.webp" alt="" aria-hidden="true" width="1600" height="900" />
{/if}
```

```ts
// capabilities.ts — pure, framework-free
export function canRun3D(): boolean {
  if (typeof window === 'undefined') return false;                 // SSR/prerender guard
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const conn = (navigator as any).connection;
  if (conn?.saveData) return false;
  if ((navigator.hardwareConcurrency ?? 8) <= 2) return false;     // low-power heuristic
  if ((navigator as any).deviceMemory && (navigator as any).deviceMemory <= 2) return false;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));    // real WebGL probe
  } catch { return false; }
}
```

**When to use:** Any heavy client-only visual (WebGL/canvas/video) on a site that must stay fast and accessible.
**Trade-offs:** + First paint and accessible mode never pay for WebGL; graceful on every device. − Two hero representations (poster + scene) to keep visually aligned; poster art must be produced per theme.

### Pattern 4: Content-as-data markdown pipeline

**What:** Blog posts are `.md` files compiled by **mdsvex**; the index is built by eager `import.meta.glob` over frontmatter, and each `[slug]` page is prerendered from the entries. Structured page copy, nav, and events live as typed `.ts`/`.json` so both themes render identical content.

```ts
// lib/content/posts.ts
const files = import.meta.glob('/content/blog/*.md', { eager: true });
export const posts = Object.entries(files)
  .map(([path, mod]: any) => ({ slug: path.split('/').pop()!.replace('.md',''), ...mod.metadata }))
  .filter(p => p.published)
  .sort((a, b) => +new Date(b.date) - +new Date(a.date));
```

```ts
// routes/blog/[slug]/+page.ts
export const entries = () => posts.map(p => ({ slug: p.slug }));   // tells prerenderer every slug
export const prerender = true;
export async function load({ params }) {
  const post = await import(`../../../../content/blog/${params.slug}.md`);
  return { content: post.default, meta: post.metadata };
}
```

**When to use:** Static blogs where authors want rich content and occasional inline components.
**Trade-offs:** + Author-friendly, versioned in git, Svelte components in prose. − mdsvex preprocessor adds build config; verify Svelte 5 compatibility and pin the version (see Anti-Patterns).

## Data Flow

### Theme + capability flow (runtime)

```
page load
   ↓
app.html inline script → reads localStorage + matchMedia → sets <html data-theme/data-motion>   (before paint, no flash)
   ↓
theme.svelte.ts hydrates from the same attributes → exposes { mode, motion, capabilities }
   ↓ (subscribe)
ThemeToggle click → theme.setMode('accessible') → writes <html data-theme> + localStorage
   ↓                                                        ↓
CSS [data-theme] cascade re-resolves ALL tokens      HeroMount re-evaluates gate → unmounts Scene if now accessible
   ↓
every component restyles instantly (no JS re-render)
```

### Content flow (build → runtime)

```
content/blog/*.md ──mdsvex──▶ posts.ts (glob, frontmatter) ──▶ blog index (list)
                                        └──▶ [slug]/+page.ts entries() ──▶ prerender each post to HTML
content/events + nav.ts ──▶ typed data ──▶ page components (theme-agnostic markup)
```

### Form flow (no server)

```
user submits ContactForm
   ↓ (progressive enhancement: native <form action> works without JS)
fetch POST → third-party endpoint (Formspree/Web3Forms) → success/error state
   ↓
honeypot + client validation; NO secrets in repo (endpoint id is public-safe)
```

## Build & Deploy Data Flow (GitHub Pages)

```
git push main
   ↓
GitHub Actions (.github/workflows/deploy.yml)
   ↓  npm ci → npm run build  (vite build → adapter-static → build/)
   ↓  BASE_PATH env = "/diversityincludesdisability_one"  (feeds paths.base)
   ↓  actions/upload-pages-artifact (build/) → actions/deploy-pages
   ↓
GitHub Pages serves static files under /diversityincludesdisability_one/
```

Required static-host settings (all non-negotiable):

| Setting | Value | Why |
|---------|-------|-----|
| `adapter-static` | `fallback: '404.html'` (or none, fully prerendered) | Static output; 404.html enables SPA-style deep links on Pages |
| `kit.paths.base` | `process.env.BASE_PATH ?? ''` = `/<repo>` in prod | Pages serves under `/repo/`; all asset URLs must use `base` |
| `+layout.ts` | `export const prerender = true` | Prerender the entire site |
| `trailingSlash` | `'always'` | Prevents Pages redirect breakage on nested routes |
| `static/.nojekyll` | empty file | Stops Jekyll from stripping `_app/` (underscore) directories |
| All internal links/assets | prefix with `base` from `$app/paths` | Otherwise 404 under the subpath |

## Scaling Considerations

This is a static content site; "scale" is content volume and build time, not concurrent users (Pages/CDN absorbs traffic).

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Launch / dozens of posts | Eager `import.meta.glob` + full prerender is ideal; nothing to change |
| Hundreds of posts | Prerender stays fine; paginate the blog index; consider lazy `glob` for body content |
| Editors want a UI | Introduce a git-based headless CMS (Decap/Sveltia) writing to `content/` — data contract unchanged |

### Scaling Priorities

1. **First bottleneck: 3D asset weight / GPU on mid devices** — keep the scene a single showpiece, cap DPR, dispose on unmount; the capability gate already sheds low-power clients.
2. **Second bottleneck: build time as posts grow** — switch heavy per-post body loading from eager to lazy glob; index reads frontmatter only.

## Anti-Patterns

### Anti-Pattern 1: Cookie/SSR theme detection on a static host

**What people do:** Copy a "SvelteKit dark-mode with cookies + `handle` hook" tutorial.
**Why it's wrong:** There is no request-time server on GitHub Pages — the hook never runs, so you get a guaranteed wrong-theme flash.
**Do this instead:** Inline `localStorage` script in `app.html` (Pattern 2).

### Anti-Pattern 2: Statically importing the Threlte scene

**What people do:** `import HeroScene from '$lib/three/HeroScene.svelte'` in `+page.svelte`.
**Why it's wrong:** Three.js is pulled into the initial bundle, ships to accessible users, and can break prerender (WebGL touches `window`). First paint pays for it.
**Do this instead:** Poster-first `HeroMount` with `await import()` behind the capability gate (Pattern 3). Keep `lib/three/` a no-static-import quarantine.

### Anti-Pattern 3: Hardcoding colors/spacing/motion in components

**What people do:** `color:#111; transition:.3s` inside a component.
**Why it's wrong:** It defeats the dual-theme model — the value won't switch between Premium and Accessible, silently breaking contrast/motion promises.
**Do this instead:** Everything is `var(--token)`; add a review/lint gate against raw hex and literal durations.

### Anti-Pattern 4: Forgetting `base` on links/assets

**What people do:** `<a href="/about">` / `<img src="/logo.png">`.
**Why it's wrong:** Under the `/repo/` subpath these 404 in production but "work" locally — a classic deploy-only break.
**Do this instead:** `import { base } from '$app/paths'` and prefix, or use relative links; test a production build with the base path set.

### Anti-Pattern 5: Treating accessible mode as the "off" state of premium

**What people do:** Build premium, then strip motion for accessible.
**Why it's wrong:** PROJECT.md requires accessible mode to be a *peer* design (its own type, spacing, contrast). A stripped fallback fails the Scope-benchmark intent.
**Do this instead:** Author `theme-accessible.css` as a complete, first-class token set; design both in parallel.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Form backend (Formspree / Web3Forms / Netlify Forms) | `<form action>` POST + `fetch` progressive enhancement | Endpoint id is public-safe; add honeypot + client validation; no secrets in repo |
| Donation platform | Plain external link-out (`rel="noopener"`) | No on-site payments (PCI/static-host constraint) |
| GitHub Pages | Actions build → Pages artifact | Base path + `.nojekyll` + prerender are load-bearing |
| Fonts | Self-host in `static/` (both theme faces) | Avoids third-party FOUC/privacy; subset for perf |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `theme store` ↔ `app.html` script | Shared `<html data-*>` attributes + localStorage key | Keep key name/policy identical; script is the pre-hydration writer, store is the runtime owner |
| `HeroMount` ↔ `HeroScene` | `await import()` only | The one seam that keeps WebGL out of first paint/accessible mode |
| `content/*` ↔ pages | Typed data modules + mdsvex `metadata` | Presentation-free content so both themes render it |
| primitives ↔ tokens | `var(--token)` only | Components never read the theme store for styling — CSS cascade does the work |

## Dependency-Ordered Build Sequence

Each step depends on the ones above it; this is the suggested phase spine.

1. **Scaffold + static deploy skeleton** — SvelteKit, `adapter-static`, `paths.base` via `BASE_PATH`, `+layout.ts` prerender, `trailingSlash:'always'`, `static/.nojekyll`, Actions `deploy.yml`. *Prove a blank page ships to Pages under the subpath first — de-risks the hardest infra last-mile.*
2. **Design-token system** — `reset.css`, `tokens/base.css`, `theme-premium.css`, `theme-accessible.css`, typography; both themes authored as complete peers.
3. **Theme store + no-flash script + toggle** — `app.html` inline script, `theme.svelte.ts`, `ThemeToggle`. Depends on tokens (2) existing to switch between.
4. **App shell + primitives** — skip-link, landmarks, Header/Nav/Footer, token-driven Button/Card/Link/Heading. Depends on tokens (2) + store (3).
5. **Content pipeline** — mdsvex config, `content/blog/*.md`, `posts.ts` glob, `nav.ts`/events data. Independent of 3D; can parallel 3–4.
6. **The 7 route pages** — Home/About/Programs/Get-Involved/Blog(+[slug])/Events/Contact, composed from primitives (4) + content (5).
7. **Forms** — Contact + Volunteer with third-party POST + progressive enhancement. Depends on primitives (4).
8. **3D hero island** — `capabilities.ts`, per-theme posters, `HeroMount`, `HeroScene` (Threlte). *Last on purpose* — it is optional to a fully working, accessible, deployed site (steps 1–7 stand alone). Depends only on the theme store (3) for the gate.
9. **A11y verification pass** — axe/Lighthouse, keyboard + SR walkthrough, contrast audit of accessible theme against WCAG 2.2 AA+, reduced-motion/no-WebGL manual checks.

## Sources

- [SvelteKit adapter-static docs (static site generation, prerender, base path)](https://svelte.dev/docs/kit/adapter-static) — HIGH
- [metonym/sveltekit-gh-pages (minimal GH Pages deploy reference)](https://github.com/metonym/sveltekit-gh-pages) — HIGH
- [SSR Theme Switching Without Flash in SvelteKit (JovianMoon)](https://jovianmoon.io/posts/ssr-theme-no-flash) — MEDIUM (verified against static-host constraint)
- [Dark Mode in SvelteKit with and without JS (David W Parker)](https://www.davidwparker.com/posts/dark-mode-in-sveltekit-with-and-without-javascript) — MEDIUM
- [Threlte 8 announcement (Svelte 5 alignment)](https://threlte.xyz/blog/threlte-8/) — HIGH
- [@threlte/extras on Svelte 5 runes mode (issue #1411)](https://github.com/threlte/threlte/issues/1411) — MEDIUM (pin versions; verify extras runes support at build time)
- [Build a SvelteKit Markdown Blog (Joy of Code / mdsvex)](https://joyofcode.xyz/sveltekit-markdown-blog) — MEDIUM
- [Static SvelteKit blog without mdsvex (glob + gray-matter alternative)](https://gebna.gg/blog/blog-from-scratch-using-sveltekit) — MEDIUM
- [WCAG 2.2 AA benchmark reference — scope.org.uk](https://www.scope.org.uk/) — per PROJECT.md

---
*Architecture research for: SvelteKit dual-theme static advocacy site → GitHub Pages*
*Researched: 2026-07-04*
