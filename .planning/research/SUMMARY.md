# Project Research Summary

**Project:** Diversity Includes Disability — Website
**Domain:** Accessible premium disability-advocacy nonprofit website (static SvelteKit → GitHub Pages, dual Premium/Accessible theme, Threlte 3D hero, markdown blog)
**Researched:** 2026-07-04
**Confidence:** HIGH

## Executive Summary

This is a static, prerendered SvelteKit content site for Eman Rimawi's disability-advocacy nonprofit, deployed to GitHub Pages under a project sub-path (`/diversityincludesdisability_one/`). The defining trait is a **dual, fully-designed theme toggle** — a Premium theme (Threlte/Three.js 3D hero + polished motion) and an Accessible theme (WCAG 2.2 AA+, high-contrast, reduced-motion, keyboard-first, no WebGL) — where the accessible mode is a *peer* design, not a stripped-down fallback. Experts build exactly this kind of site with `adapter-static` + full prerendering, an attribute-driven CSS-custom-property token system for the two themes, a no-flash inline theme script in `app.html`, mdsvex for markdown content, and a third-party form backend since there is no server. All stack versions were verified live against npm on 2026-07-04 (Svelte 5.56, SvelteKit 2.69, adapter-static 3.0.10, Threlte 8 / Three 0.185, mdsvex 0.12.7).

A key grounding finding reshapes scope: the **live DID site is a minimal Wix single-pager** (Home + "About Me") that surfaces real, portable brand material — Eman's bio, the mission, and four real services (Intersectional DEI trainings, Disability Consulting, Modeling for Representation, Speaker/Panelist). Everything else the PROJECT scopes (a dedicated Programs page, Get Involved/Donate, Blog/News, Events, Contact form, newsletter, accessibility statement) does **not** exist today. So this build is an **expansion**, not a mirror: port the authentic voice and four services as real copy, and author/placeholder the rest — benchmarked against scope.org.uk's best-in-class accessibility posture (WCAG 2.2, honest known-issues list, and pointedly *no* overlay widget).

The risk profile is well-understood and front-loadable. The highest-probability failure is deployment infrastructure — base-path/`.nojekyll`/deep-link-404 mistakes that pass locally but break on Pages — so the roadmap must prove a blank page ships to the sub-path *first*. The second cluster is the accessibility mission itself: the anti-pattern of building Premium then subtracting to get "accessible" must be structurally prevented by designing both token sets up front, and third-party accessibility overlays (accessiBe/UserWay) must be categorically banned (FTC-fined, lawsuit-magnet, and antithetical to the org's mission). The third cluster is 3D fragility — Three.js must be a lazy, capability-gated, poster-first island that never enters the initial/accessible bundle and disposes cleanly. Legal privacy (501c3-pending) means no credentials or raw Notion source data ever land in the public repo.

## Key Findings

### Recommended Stack

A Svelte 5 (runes) / SvelteKit 2 toolchain compiled to fully static output by `@sveltejs/adapter-static`, deployed via the official GitHub Actions Pages workflow. Threlte 8 wraps Three.js declaratively for the single 3D hero; mdsvex compiles markdown blog/news posts at build time with Shiki for zero-runtime-JS syntax highlighting. Forms POST to a third-party backend (Web3Forms recommended, Formspree alternative) since Pages has no server. Testing/a11y gating is Playwright + `@axe-core/playwright` (WCAG scans across *both* themes) plus Lighthouse CI budgets. All versions were verified live against the npm registry on 2026-07-04. Full detail in [STACK.md](./STACK.md).

**Core technologies:**
- **Svelte 5.56 / SvelteKit 2.69**: UI + app framework — runes are the 2026 model and are required by Threlte 8; Kit's prerender + adapter-static give the static output Pages needs.
- **@sveltejs/adapter-static 3.0.10**: static export — the only correct adapter for a no-server Pages deploy; emits `.nojekyll` and supports `fallback: '404.html'`.
- **@threlte/core 8.5 / @threlte/extras 9.21 / three 0.185**: Svelte-native 3D — declarative `<Canvas>`/`<T>`, keeps the scene lazy-loadable and componentized (peer: svelte ≥5, three ≥0.160).
- **mdsvex 0.12.7 + shiki 4.3 + rehype-slug**: markdown content pipeline — `.md`/`.svx` posts with frontmatter, build-time highlighting, auto heading anchors.
- **Web3Forms (service)**: static-host form backend — client-side POST with a public access key; no server, honeypot spam protection.
- **Playwright + axe-core + Lighthouse CI**: the WCAG 2.2 AA and perf/bundle gate, run against both themes.

**Critical version notes:** Svelte 5 is mandatory (Threlte 8 refuses Svelte 4); pin Vite 7.3.6 for a battle-tested combo (Vite 8 is peer-supported but newer); Node 22 LTS in CI.

### Expected Features

The live site is a Wix one-pager, so we port real content (Eman's bio, mission, four services, social links) and add the standard nonprofit sections the PROJECT scopes, benchmarked against scope.org.uk. Full detail in [FEATURES.md](./FEATURES.md).

**Must have (table stakes):**
- Seven-page IA (Home, About/Mission, Programs & Services, Get Involved/Donate, Blog/News, Events, Contact) with persistent nav + footer.
- The accessible spine: skip-to-content link, semantic landmarks, ordered headings, keyboard-operable everything, visible focus, AA contrast in *both* themes.
- Accessible contact/volunteer form via third-party backend; donate as a labeled link-out (no on-site payments).
- Markdown-driven Blog/News; static Events listing; newsletter signup; accessibility statement page (Scope-style honest known-issues).

**Should have (competitive differentiators):**
- **Dual full-design theme toggle** (Premium ↔ Accessible), persisted — the Core Value made tangible; themes differ in contrast, type, spacing, and motion (not just motion).
- **Premium 3D hero** (Threlte) — the headline "wow", lazy and gracefully degrading.
- **Accessibility as first-class self-authored implementation** hitting WCAG 2.2-specific criteria (2.4.11 Focus Not Obscured, 2.5.8 Target Size 24px, 3.2.6 Consistent Help, etc.), not a widget.

**Defer (v1.x / v2+):**
- RSS feed, impact/stats section, explicit forced-colors tuning pass, automated a11y CI hardening (v1.x).
- Git-based/headless CMS for non-dev editing, event registration/ticketing, multilingual (v2+).

**Anti-features (never build):** third-party accessibility overlay/widget (harmful, FTC-fined, lawsuit magnet), on-site payment checkout, user accounts/login, autoplay hero video/carousel, chatbot widget, cookie-consent-heavy analytics, PDF-only content.

### Architecture Approach

The entire site is prerendered to static HTML/CSS/JS at build time; GitHub Pages is a dumb file host, which forces three hard rules: **no-flash theming must use an inline blocking script in `app.html`** (no cookies/SSR), **forms/donate are third-party** (app holds no secrets), and **the 3D hero must be a lazy, client-only island** that never enters the prerendered payload or the accessible path. Themes are attribute-driven: every design decision is a CSS custom property, overridden under `[data-theme="premium"]` / `[data-theme="accessible"]`, so switching is a single attribute change with zero JS re-render. `lib/three/` is a physical quarantine zone — only `HeroMount` is statically referenced, and it reaches `HeroScene` via `await import()` behind a capability gate. Full detail in [ARCHITECTURE.md](./ARCHITECTURE.md).

**Major components:**
1. **`app.html` inline no-flash script** — stamps `data-theme`/`data-motion` on `<html>` before first paint from localStorage + media queries; defaults assistive users to Accessible.
2. **`theme.svelte.ts` rune store + design-token CSS** — single source of truth for mode + capability flags; two complete peer token files drive all styling via `var(--token)`.
3. **`+layout.svelte` shell + token-driven primitives** — skip-link, landmarks, Header/Nav/Footer, ThemeToggle; one component per concept (never `*Premium`/`*Accessible` forks except the hero).
4. **Content-as-data pipeline** — mdsvex blog posts via `import.meta.glob`, typed nav/events data; both themes render identical content.
5. **`HeroMount` → `HeroScene` capability-gated island** — renders poster `<img>` first, dynamically imports Threlte only if `premium && webgl && !reduced-motion && !low-power`.

**Recommended dependency-ordered build sequence (the phase spine):** (1) scaffold + static deploy skeleton — prove a blank page ships to the sub-path first; (2) design-token system, both themes as peers; (3) theme store + no-flash script + toggle; (4) app shell + primitives; (5) content pipeline (can parallel 3–4); (6) the 7 route pages; (7) forms; (8) 3D hero island *last on purpose* (steps 1–7 stand alone as a complete accessible site); (9) a11y verification pass.

### Critical Pitfalls

Top pitfalls from [PITFALLS.md](./PITFALLS.md) (16 documented). These are the ones that most shape the roadmap:

1. **Base path + `.nojekyll` break the whole deploy** — repo is `diversityincludesdisability_one`, so the site serves from a sub-path. Root-absolute `/asset` links 404 in production but "work" locally; missing `.nojekyll` makes Pages/Jekyll silently drop the `_app/` dir. Avoid: `paths.base` from `BASE_PATH` env in CI, prefix every link/asset with `base` from `$app/paths`, ship `static/.nojekyll`, and test the *built* output.
2. **Deep-link 404 on refresh/share** — unprerendered routes have no HTML file. Avoid: `prerender = true` sitewide, enumerate blog slugs via `entries()`, `fallback: '404.html'`, `trailingSlash: 'always'`.
3. **"Accessible mode as degraded fallback" anti-pattern** — building Premium then subtracting motion silently fails WCAG and violates the Core Value. Avoid: design both token sets up front as peers; identical semantics across themes; accessible mode must pass WCAG 2.2 AA+ *independently*.
4. **3D bundle bloat / WebGL fragility** — a single static Threlte import ships ~150KB+ to every user incl. accessible/mobile, kills LCP, and breaks on no-WebGL/low-power devices. Avoid: poster-first dynamic import behind a capability gate, dispose renderer/geometries on teardown, clamp DPR ≤2, pause RAF when hidden/off-screen, handle `webglcontextlost`.
5. **Flash of wrong theme + hydration mismatch** — reading theme in `onMount` paints the wrong theme first. Avoid: the inline pre-paint `app.html` script + CSS-custom-property styling only.
6. **Committing credentials / private 501c3-pending data** — org is 501c3-pending; leaked Notion exports or API keys are permanent in public git history. Avoid: `.gitignore` `.env*`/exports up front, extract only public copy, use only public form endpoint IDs, secrets in Actions.
7. **No overlay widgets** — accessiBe/UserWay are FTC-fined and lawsuit-associated; the native theme toggle is categorically different and the *only* correct approach.

## Implications for Roadmap

Based on combined research, the suggested phase structure follows the architecture's dependency-ordered build sequence. Pitfall phase-names already anticipate this mapping.

### Phase 1: Foundation (scaffold + static deploy skeleton)
**Rationale:** The hardest, highest-probability failures are deployment infra (base path, `.nojekyll`, deep-link 404). De-risk them first by proving a blank page ships to the Pages sub-path before any features exist.
**Delivers:** SvelteKit + adapter-static configured (`paths.base` via `BASE_PATH`, `prerender=true`, `trailingSlash:'always'`, `fallback:'404.html'`, `static/.nojekyll`), GitHub Actions `deploy.yml`, `.gitignore` for secrets/exports, a deployed blank/skeleton page verified live under the sub-path.
**Addresses:** Static build requirement; layout shell scaffold (skip-link placeholder).
**Avoids:** Pitfalls 1, 2, 3 (partial), 15 (credential hygiene).

### Phase 2: Design System & Theme
**Rationale:** Both themes are token sets, and the theme system gates the 3D hero — it must exist before pages or hero. Designing both up front structurally prevents the "accessible-as-fallback" anti-pattern.
**Delivers:** `reset.css` + `tokens/base.css` + `theme-premium.css` + `theme-accessible.css` (both complete peers), `app.html` no-flash inline script, `theme.svelte.ts` rune store, accessible `ThemeToggle` (native button, `aria-live` announcement, focus retained).
**Uses:** CSS custom properties, Svelte 5 runes (from STACK.md).
**Implements:** Attribute-driven dual-theme pattern; no-flash theme resolution.
**Avoids:** Pitfalls 4, 5, 12, 13, 14.

### Phase 3: App Shell, Content Pipeline & Pages
**Rationale:** With tokens + store in place, build the token-driven shell/primitives, wire mdsvex content-as-data (can parallel the shell), then compose the 7 route pages. Layout landmarks must land before content pages (retrofitting across 7 pages is expensive).
**Delivers:** `+layout.svelte` shell (landmarks, skip-link, Header/Nav/Footer), token-only primitives, mdsvex blog pipeline (`posts.ts` glob, `[slug]` prerender), events/nav data, all seven pages with real DID content (Eman's bio, four services, social links) plus authored/placeholder Programs, Get Involved, Blog, Events.
**Addresses:** Seven-page IA, Blog/News, Events, real content (table stakes).
**Avoids:** Pitfalls 3 (deep-link coverage), 14; delivers the accessible spine.

### Phase 4: Forms & Donate
**Rationale:** Depends on primitives; isolates the third-party backend choice and its privacy/accessibility handling.
**Delivers:** Accessible Contact + Volunteer forms (labels, `aria-describedby` errors, focus-managed confirmation, honeypot), Web3Forms/Formspree backend, newsletter signup, donate link-out (`rel="noopener noreferrer"`, URL in config, no embedded checkout), privacy note.
**Uses:** Web3Forms (from STACK.md).
**Avoids:** Pitfalls 15, 16.

### Phase 5: Premium 3D Hero
**Rationale:** *Last on purpose* — steps 1–4 stand alone as a complete, accessible, deployed site. The hero is additive to Premium only and depends solely on the theme store for its gate.
**Delivers:** `capabilities.ts` (WebGL/reduced-motion/low-power/save-data detection), per-theme poster images, `HeroMount` (poster-first + dynamic import), `HeroScene` (Threlte, code-split), disposal + RAF pause + DPR clamp, `aria-hidden` decorative canvas with the real `<h1>`/CTA in the DOM.
**Uses:** Threlte 8 / Three 0.185 (from STACK.md).
**Implements:** Poster-first capability-gated 3D island pattern.
**Avoids:** Pitfalls 6, 7, 8, 9, 10.

### Phase 6: Accessible Theme Hardening & Launch Verification
**Rationale:** Accessibility must be verified independently and end-to-end against the deployed build, not assumed. The accessibility statement documents the real (honest) implementation, so it comes last.
**Delivers:** Independent WCAG 2.2 AA+ audit of the accessible theme (axe + Lighthouse both themes, manual SR + keyboard walkthrough, contrast CI, reduced-motion live-toggle + no-WebGL manual checks), branded 404 page, accessibility statement page (target, test cadence, known-issues list, help contact), deployed-URL verification of base path/deep links/`_app` 200s.
**Addresses:** Accessibility statement (table stakes), WCAG 2.2 AA+ floor.
**Avoids:** Verifies against all a11y and deploy pitfalls; runs the "Looks Done But Isn't" checklist.

### Phase Ordering Rationale

- **Infra-first** because base-path/`.nojekyll`/404 bugs are invisible locally and the most common Pages failures — prove the deploy pipeline before building on it.
- **Tokens before pages and hero** because both themes are defined by token sets and the hero is gated on the Premium token set + motion + WebGL; this ordering structurally prevents the accessible-as-fallback anti-pattern.
- **Shell/landmarks before content pages** because retrofitting semantics across 7 pages is expensive; content pipeline can parallel the shell.
- **3D hero last** because it is genuinely optional — a fully working, accessible, deployed site exists without it, so it can never block launch.
- **Verification as its own phase** because WCAG conformance and cross-theme axe/SR/keyboard passes are a deliverable, not a side effect, and the accessibility statement must honestly reflect the finished build.

### Research Flags

Phases likely needing deeper research (`/gsd:research-phase`) during planning:
- **Phase 5 (Premium 3D Hero):** The one MEDIUM-confidence area — `@threlte/extras` runes-mode edge cases (issue #1411) and the actual hero art/scene design need concrete decisions; capability-gate thresholds and disposal specifics benefit from a focused pass. Also the natural place to invoke the `ui-ux-pro-max` skill.
- **Phase 4 (Forms & Donate):** Light research — confirm the current Web3Forms vs Formspree free-tier limits (service pricing changes) and the exact accessible-error pattern for the chosen provider before building.

Phases with standard, well-documented patterns (can skip research-phase):
- **Phase 1 (Foundation):** adapter-static + Pages deploy is fully documented (official docs verified); config is known.
- **Phase 2 (Design System & Theme):** No-flash inline-script + CSS-custom-property theming is a verified standard pattern.
- **Phase 3 (Shell/Content/Pages):** mdsvex blog + SvelteKit routing are established; content is a porting exercise.
- **Phase 6 (Verification):** axe/Lighthouse/WCAG 2.2 checklist is well-defined (Scope-benchmarked).

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Every version verified live against npm registry 2026-07-04; Pages config verified against official SvelteKit docs. Only MEDIUM item: form-backend free-tier limits (services change). |
| Features | HIGH | Both reference sites (DID, Scope) fetched live; accessibility mapped to WCAG 2.2 SCs; overlay anti-pattern corroborated across multiple 2025-2026 sources. |
| Architecture | HIGH | Static + no-flash theme + capability gating verified against current docs/community; MEDIUM only on exact Threlte 8 `@threlte/extras` runes-mode edges (pin versions). |
| Pitfalls | HIGH | SvelteKit/Pages/theme facts verified against official docs + issue tracker; a11y and Threlte from established practice. |

**Overall confidence:** HIGH

### Gaps to Address

- **Threlte 8 `@threlte/extras` runes-mode edge cases (MEDIUM):** Pin exact versions and validate the extras helpers (OrbitControls, GLTF loaders) in runes mode at build time during Phase 5; keep the scene minimal to reduce surface.
- **Form-backend free-tier limits (MEDIUM):** Re-verify Web3Forms (~250 submissions/mo) vs Formspree (50/mo) current limits and deliverability before committing in Phase 4; both are drop-in client POSTs so the choice is low-risk to defer briefly.
- **`.nojekyll` auto-generation by adapter-static (MEDIUM):** Documented behavior but confirm in the generated `build/` output; belt-and-suspenders `static/.nojekyll` already planned in Phase 1.
- **Custom-domain decision:** If the org attaches the real `.org` domain, `base` becomes `''` and a `CNAME` is needed — pick one path model in Phase 1 so CI can't drift.
- **3D hero art direction:** The scene concept/assets are undefined; resolve during Phase 5 planning (invoke `ui-ux-pro-max`).

## Sources

### Primary (HIGH confidence)
- npm registry (`npm view` versions/peerDependencies), 2026-07-04 — exact live versions for the entire stack.
- https://svelte.dev/docs/kit/adapter-static — official GitHub Pages guidance (`fallback:'404.html'`, `paths.base`, `.nojekyll`, `trailingSlash`, Actions workflow).
- https://www.diversityincludesdisability.org/ — live brand/content, four services, contact, social (fetched 2026-07-04).
- https://www.scope.org.uk/ + /accessibility — IA, donate, newsletter, WCAG 2.2 AAA target, 6-month retest, honest known-issues, no-overlay stance (fetched 2026-07-04).
- https://www.w3.org/TR/WCAG22/ + new-in-2.2 — new AA criteria (2.4.11, 2.5.7, 2.5.8, 3.2.6, 3.3.7, 3.3.8).
- kit issue #4528 (base path 404), discussion #11554 (base-prefixed links); Jekyll underscore behavior; hydration-mismatch issues.
- https://threlte.xyz/blog/threlte-8/ — Threlte 8 / Svelte 5 alignment.

### Secondary (MEDIUM confidence)
- Form-backend comparison (Web3Forms vs Formspree free tiers) — splitforms.com, dev.to 2026 roundup (verify current limits before build).
- Overlay-harm sources — accessibility.works, titancms.com (FTC $1M accessiBe settlement Jan 2025, 20-40% coverage, expert opposition).
- Captain Codeman / JovianMoon / David W Parker — no-flash SvelteKit theme patterns (verified against static-host constraint).
- Joy of Code / gebna.gg — mdsvex blog pipeline patterns.
- Three.js disposal / WebGL context limits — established practice.

### Tertiary (LOW confidence)
- `@threlte/extras` Svelte 5 runes-mode support (issue #1411) — pin versions; verify at build time in Phase 5.

---
*Research completed: 2026-07-04*
*Ready for roadmap: yes*
