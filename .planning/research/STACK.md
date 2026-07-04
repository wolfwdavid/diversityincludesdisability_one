# Stack Research

**Domain:** Accessible premium nonprofit website — static SvelteKit + 3D hero, GitHub Pages
**Researched:** 2026-07-04
**Confidence:** HIGH (all versions verified live against the npm registry on 2026-07-04; GitHub Pages config verified against official SvelteKit docs)

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Svelte** | `5.56.4` | UI framework | Svelte 5 is stable; **runes** (`$state`, `$derived`, `$effect`, `$props`) are the current reactivity model. Required by Threlte 8 and the whole 2026 ecosystem. |
| **SvelteKit** | `2.69.1` | App framework / router / prerender | Current stable major. Its prerender pipeline + `adapter-static` produce the fully static output GitHub Pages needs. |
| **@sveltejs/adapter-static** | `3.0.10` | Static site export | The *only* correct adapter for a no-server GitHub Pages deploy. Emits plain HTML/CSS/JS and (importantly) writes a `.nojekyll` file into the build output automatically. |
| **@sveltejs/vite-plugin-svelte** | `7.1.2` | Svelte↔Vite integration | Peer-required by Kit 2.69; the version that supports Vite 7/8 + Svelte 5. |
| **Vite** | `7.3.6` (recommended pin) / `8.1.3` (latest, peer-supported) | Build tool / dev server | Kit 2.69 peer range is `^5 || ^6 || ^7 || ^8`. **Pin Vite 7.3.6** for a battle-tested combo; Vite 8 works but is newer — upgrade after the site is stable. |
| **Three.js** | `0.185.1` | WebGL 3D engine | Underlying renderer for the Premium hero. Threlte 8 peer-requires `three >=0.160`. |
| **@threlte/core** | `8.5.16` | Svelte-native Three.js wrapper | Declarative `<Canvas>`/`<T>` components; Svelte 5 runes-native (peer `svelte >=5`). Keeps the 3D scene as componentized, lazy-loadable Svelte code instead of imperative Three.js boilerplate. |
| **@threlte/extras** | `9.21.0` | Threlte helpers | `<OrbitControls>`, `useGltf`/`<GLTF>`, `<Float>`, `<Environment>`, `useProgress` loaders — everything a single hero showpiece needs without hand-rolling loaders. |
| **mdsvex** | `0.12.7` | Markdown → Svelte content pipeline | The de-facto Svelte markdown preprocessor. Peer supports Svelte 5 (`^5.0.0-next.120`). Lets blog/news posts be `.md`/`.svx` files with frontmatter, using Svelte components inline. Static, no server. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **shiki** | `4.3.1` | Build-time syntax highlighting for mdsvex | Wire into mdsvex `highlight` so code blocks are highlighted at build (zero client JS). Use instead of shipping highlight.js/Prism at runtime. |
| **rehype-slug** | `6.0.0` | Auto heading IDs (mdsvex rehype plugin) | Anchor links / in-page nav for blog posts. Pair with `rehype-autolink-headings` if you want visible anchors. |
| **@tailwindcss/vite** + **tailwindcss** | `4.3.2` / `4.3.2` | Styling (Tailwind v4, CSS-first) | Recommended for the two-theme system. Tailwind v4 uses a Vite plugin + CSS `@theme` (no `tailwind.config.js`). Drive both themes via CSS custom properties + a `[data-theme]` selector. **Optional** — plain CSS custom properties alone are fully sufficient and lighter. |
| **@fontsource/*** (or `@fontsource-variable/*`) | latest | Self-hosted fonts | Self-host brand fonts instead of hotlinking Google Fonts (privacy + perf + no third-party request; matters for a disability-advocacy org). |
| **@sveltejs/enhanced-img** | `0.11.0` | Build-time responsive images | Auto-generate responsive/AVIF/WebP `<img>` for hero fallback + content images. Improves LCP on the accessible/low-power path. |
| **Web3Forms** *(service, not npm)* | Access-key API | Static-host contact/volunteer form backend | Client-side POST to `https://api.web3forms.com/submit` with an access key. No account, unlimited forms, ~250 submissions/mo free, built-in spam honeypot + hCaptcha option. Works on GitHub Pages. See "Form backend" note below. |

### Development Tools

| Tool | Version | Purpose | Notes |
|------|---------|---------|-------|
| **svelte-check** | `4.7.1` | Type/diagnostics for `.svelte` | Run in CI as a gate. |
| **TypeScript** | `5.x` (`^5.3.3`) | Types | Kit peer requires `^5.3.3 || ^6`. |
| **Vitest** | `4.1.9` | Unit tests | For utilities (theme store, WebGL/reduced-motion detection). |
| **vitest-browser-svelte** *(or @testing-library/svelte)* | latest | Component tests | Svelte team's current recommendation for Svelte 5 component testing is `vitest-browser-svelte` (real browser). `@testing-library/svelte` still works if you prefer jsdom. |
| **@playwright/test** | `1.61.1` | E2E + a11y automation | Drives the axe scans and keyboard-nav tests across both themes. |
| **@axe-core/playwright** + **axe-core** | `4.12.1` / `4.12.1` | Automated WCAG scans | Run axe against every page in **both** themes in CI. This is your WCAG 2.2 AA gate. |
| **@lhci/cli** (Lighthouse CI) | `0.15.1` | Perf + a11y + best-practices budgets | Assert Lighthouse a11y = 100 and perf budgets (esp. that the 3D bundle is lazy and off the critical path). |

## Installation

```bash
# Scaffold (new unified Svelte CLI — replaces `npm create svelte`)
npx sv create diversityincludesdisability_one
#   → choose: SvelteKit minimal, TypeScript, add: prettier, eslint, vitest, playwright, tailwindcss (optional), mdsvex

# Core static + 3D
npm install -D @sveltejs/adapter-static
npm install @threlte/core@8 @threlte/extras@9 three
npm install -D @types/three

# Markdown pipeline
npm install -D mdsvex shiki rehype-slug rehype-autolink-headings

# Styling (optional — Tailwind v4) + self-hosted fonts + images
npm install -D @tailwindcss/vite tailwindcss @sveltejs/enhanced-img
npm install @fontsource-variable/<your-font>

# Testing + a11y + perf (dev)
npm install -D @playwright/test @axe-core/playwright axe-core @lhci/cli vitest svelte-check
```

## GitHub Pages: the load-bearing config (verified against official docs)

This is where static SvelteKit deploys most often break. All four items below are required.

**1. `svelte.config.js` — adapter + base path**
```js
import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';

export default {
  extensions: ['.svelte', '.svx'],
  preprocess: [mdsvex({ extensions: ['.svx', '.md'] })],
  kit: {
    adapter: adapter({ fallback: '404.html' }),   // GitHub Pages custom 404 / SPA fallback
    paths: { base: process.env.BASE_PATH ?? '' },  // set by CI to '/<repo-name>'
    prerender: { handleHttpError: 'warn' }
  }
};
```

**2. Base-path handling in code (the #1 gotcha).** Because the repo is `diversityincludesdisability_one` (not `<user>.github.io`), the site is served from `https://<user>.github.io/diversityincludesdisability_one/`. Every internal link and asset **must** be prefixed with `base`:
```svelte
<script>import { base } from '$app/paths';</script>
<a href="{base}/about">About</a>
<img src="{base}/logo.svg" alt="Diversity Includes Disability">
```
Root-relative `/about` and `/logo.svg` will 404 on Pages. Use the `base` import (and `assets`/the `asset()` helper for static files). Verify locally with `BASE_PATH=/diversityincludesdisability_one npm run build && npm run preview`.

**3. `.nojekyll`.** SvelteKit emits `_app/…` directories; GitHub Pages' Jekyll would strip underscore-prefixed folders. Two facts:
- When deploying via the **official GitHub Actions path** (`upload-pages-artifact` + `deploy-pages@v5`), Jekyll does **not** run, so this is largely moot.
- `adapter-static` also writes a `.nojekyll` into the build output automatically (MEDIUM confidence — confirm in the generated `build/` dir). Belt-and-suspenders: add an empty `static/.nojekyll` so it's guaranteed regardless of deploy method.

**4. `trailingSlash`.** Set `export const trailingSlash = 'always';` (in `src/routes/+layout.js`) so Pages serves `about/index.html` cleanly and relative links resolve. Prevents subtle 404s on refresh.

**5. GitHub Actions deploy** (`.github/workflows/deploy.yml`, per official docs):
```yaml
name: Deploy to GitHub Pages
on: { push: { branches: [main] } }
permissions: { contents: read, pages: write, id-token: write }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run build
        env: { BASE_PATH: '/${{ github.event.repository.name }}' }
      - uses: actions/upload-pages-artifact@v3
        with: { path: 'build/' }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages }
    steps:
      - uses: actions/deploy-pages@v5
```
Enable **Settings → Pages → Source: GitHub Actions** in the repo. Prerender all routes (they're content pages), so the whole site is HTML.

## 3D hero: lazy-load + graceful-degradation strategy

The hero must **never** block first paint, ship WebGL to the accessible theme, or break on low-power/no-WebGL devices.

- **Gate before import.** Only mount the 3D hero when *all* are true: theme === "premium" **and** WebGL is supported **and** `!matchMedia('(prefers-reduced-motion: reduce)').matches` **and** not `navigator.connection?.saveData`. Otherwise render a static `<enhanced-img>` poster.
- **Dynamic import.** Load Threlte + the scene via `{#await import('$lib/hero/Scene.svelte')}` (or `onMount` dynamic import) so `three` (~150KB+) is a separate lazy chunk, out of the critical path and never in the initial/accessible bundle.
- **Client-only.** Threlte's `<Canvas>` is browser-only; guard with `import { browser } from '$app/environment'` and mount after hydration. Prerendered HTML ships the poster; JS swaps in the canvas.
- **Cleanup + pause.** Use Threlte's `useTask` frame loop; pause rendering when the hero scrolls out of view (IntersectionObserver) to save battery.
- **Lighthouse budget** in `@lhci/cli` asserts the three.js chunk is not render-blocking and perf stays green.

## Theme toggle + persistence (no library needed)

- **State:** a runes module (`export const theme = $state(...)`) or a small `$state`-backed store in `$lib`. Two values: `premium` | `accessible`.
- **Apply:** set `data-theme="…"` on `<html>`; drive contrast, type scale, spacing, and motion entirely from CSS custom properties per `[data-theme]`. (This satisfies the PROJECT.md requirement that themes differ in more than motion.)
- **Persist:** `localStorage`. On first visit, seed from `prefers-contrast`/`prefers-reduced-motion` so assistive users get the accessible theme by default.
- **No-FOUC:** inline a tiny blocking `<script>` in `app.html` that reads `localStorage`/media queries and sets `data-theme` before first paint. This is the standard dark-mode-toggle pattern and avoids a flash.
- **Respect OS always:** even in Premium, `prefers-reduced-motion` disables the 3D/motion (per constraints).

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Threlte 8 | Raw Three.js in `onMount` | Only if you need a Three.js feature Threlte doesn't wrap; you lose Svelte reactivity + declarative cleanup. |
| mdsvex | Markdown loaded via `import.meta.glob` + `marked`/`markdown-it` | If you want *pure data* posts with no inline Svelte components; simpler but loses component-in-markdown power. |
| Web3Forms | Formspree (`50/mo` free) | Choose Formspree if email **deliverability** is critical (older, warmed IPs) or you want a submissions dashboard. Both are drop-in client POSTs; identical GitHub Pages compatibility. |
| Tailwind v4 (CSS-first) | Plain CSS custom properties + `@layer` | For a two-theme token system, hand-written CSS variables are lighter and arguably clearer. Tailwind is optional convenience, not required. |
| Shiki (build-time) | Prism/highlight.js (runtime) | Never prefer runtime highlighting here — it ships JS and hurts the a11y/perf budget. |
| Vite 7.3.6 (pinned) | Vite 8.1.3 (latest) | Move to Vite 8 once the toolchain (vite-plugin-svelte, vitest) has settled on it; peer-supported today. |
| `@sveltejs/enhanced-img` | `@unpic/svelte` / hand-authored `<picture>` | Enhanced-img is build-time and SvelteKit-native; use unpic only if serving from an external image CDN (not the case on Pages). |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `@sveltejs/adapter-auto` / `adapter-node` / `adapter-vercel` | Assume a Node/serverless host; produce non-static output that GitHub Pages can't serve. | `@sveltejs/adapter-static` with `fallback: '404.html'`. |
| Any SSR / `+page.server.js` / form actions / API routes | No server on GitHub Pages — these fail or silently don't run. | Prerender everything; use a third-party form backend (Web3Forms). |
| Netlify/Vercel/Cloudflare **Forms** or Pages Functions | Host-specific; do nothing on GitHub Pages. | Web3Forms / Formspree client POST. |
| `@react-three/fiber` / three-via-React | React stack; incompatible with a Svelte codebase. | Threlte. |
| Contentlayer | React-centric and effectively unmaintained; no Svelte story. | mdsvex. |
| highlight.js / PrismJS at runtime | Ships highlighting JS to the client, bloats bundle, hurts perf/a11y score. | Shiki at build time inside mdsvex. |
| Svelte 3/4 stores-first patterns, `svelte-preprocess` for markdown, Sapper | Superseded. Svelte 5 uses **runes**; Sapper is dead. | Runes + mdsvex + `vite-plugin-svelte`. |
| Tailwind v3 `tailwind.config.js` + PostCSS setup | v4 is CSS-first via `@tailwindcss/vite`; v3 tutorials will misconfigure a new build. | Tailwind v4 (`@tailwindcss/vite`) **or** plain CSS vars. |
| Hotlinked Google Fonts `<link>` | Third-party request, privacy/GDPR concern, extra RTT/CLS. | Self-host via `@fontsource-variable/*`. |
| Loading `three`/Threlte in the root layout or eagerly | Puts ~150KB+ of WebGL on the critical path and into the accessible bundle. | Dynamic `import()` gated behind theme + capability checks. |
| Shipping the 3D hero without a WebGL/reduced-motion/save-data gate | Breaks low-power/no-WebGL devices — violates a hard project constraint. | Capability-gated mount + static poster fallback. |

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `@sveltejs/kit@2.69.1` | `svelte@^4 || ^5`, `vite@^5\|\|^6\|\|^7\|\|^8`, `@sveltejs/vite-plugin-svelte@^7`, `typescript@^5.3.3` | Verified via `npm view` peerDependencies. |
| `@threlte/core@8.5.16` | `svelte >=5`, `three >=0.160` | Svelte 5 required — do not pair with Svelte 4. |
| `@threlte/extras@9.21.0` | `@threlte/core@8` | Keep core 8 / extras 9 majors aligned. |
| `mdsvex@0.12.7` | `svelte@^5` (peer allows `^5.0.0-next.120`) | Works with Svelte 5.56; register `.svx`/`.md` in `extensions`. |
| `adapter-static@3.0.10` | `@sveltejs/kit@^2` | Correct pairing for Kit 2.x. |
| `vitest@4.1.9` | `vite@^6 \|\| ^7 \|\| ^8` | Aligns with recommended Vite 7 pin. |
| Node runtime | `>=20`; **use Node 22 LTS** | Official Actions example uses Node 20; 22 LTS is the safer forward choice. |

## Sources

- npm registry (`npm view <pkg> version` / `dist-tags` / `peerDependencies`), 2026-07-04 — **HIGH** confidence, live exact versions for every package above.
- https://svelte.dev/docs/kit/adapter-static — official GitHub Pages guidance: `fallback: '404.html'`, `paths.base = process.env.BASE_PATH`, `.nojekyll`, `trailingSlash`, and the full Actions workflow (`upload-pages-artifact` + `deploy-pages@v5`, `BASE_PATH=/${{ github.event.repository.name }}`). **HIGH**.
- Threlte peer deps via npm (`svelte >=5`, `three >=0.160`) — **HIGH**.
- Form-backend comparison (Web3Forms vs Formspree free tiers, static-host compatibility): splitforms.com, dev.to "Best Form Backend for Static Sites 2026" — **MEDIUM** (service pricing/limits change; verify current free tier before build).
- `.nojekyll` auto-generation by adapter-static — **MEDIUM** (documented behavior; confirm in generated `build/` output).

---
*Stack research for: accessible premium SvelteKit static site with 3D hero on GitHub Pages*
*Researched: 2026-07-04*
