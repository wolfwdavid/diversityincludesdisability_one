# Roadmap: Diversity Includes Disability — Website

## Overview

A static, prerendered SvelteKit site for Eman Rimawi's disability-advocacy nonprofit, deployed to GitHub Pages under a repo sub-path, shipping two complete peer experiences: a Premium theme (Threlte 3D hero + polished motion) and an Accessible theme (WCAG 2.2 AA+, no WebGL). The journey is strictly dependency-ordered to de-risk the highest-probability failures first: prove a blank page ships to the Pages sub-path (base path / `.nojekyll` / deep-link 404) before any features exist; build both theme token sets and the no-flash toggle before pages so accessibility can never become a subtracted fallback; compose the seven-page accessible content site; add forms and the donate link-out; build the 3D hero **last on purpose** so a fully working accessible site exists without it; and finish with an independent WCAG 2.2 AA+ verification and honest accessibility statement against the deployed build.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Static Deploy** - Prove a blank SvelteKit page ships live to the GitHub Pages sub-path with correct base path, `.nojekyll`, and deep-link 404 handling
- [ ] **Phase 2: Design System & Dual Theme** - Two complete peer themes (Premium + Accessible) as token sets, with a no-flash, persistent, accessible toggle
- [ ] **Phase 3: App Shell, Content Pipeline & Pages** - The full seven-page accessible site with real DID content and a markdown-driven blog, standing alone without forms or 3D
- [ ] **Phase 4: Forms & Donate** - Accessible contact/volunteer forms via a static-host backend plus a safe donate link-out
- [ ] **Phase 5: Premium 3D Hero** - A lazy, capability-gated, poster-first Threlte 3D hero that never blocks or breaks any other experience
- [ ] **Phase 6: Accessible Hardening & Launch Verification** - Independent WCAG 2.2 AA+ verification of the deployed build and a published, honest accessibility statement

## Phase Details

### Phase 1: Foundation & Static Deploy
**Goal**: A blank/skeleton SvelteKit site builds fully static (adapter-static) and is live on GitHub Pages under the repo sub-path, with correct base path, `.nojekyll`, deep-link 404 fallback, and a CI deploy pipeline — all verified against the deployed URL, not just locally.
**Depends on**: Nothing (first phase)
**Requirements**: DEPLOY-01, DEPLOY-02, DEPLOY-03, DEPLOY-04
**Success Criteria** (what must be TRUE):
  1. Visiting the live GitHub Pages URL under the repo sub-path loads the skeleton page with no broken styles or 404 assets.
  2. Refreshing or deep-linking to any route on the deployed site resolves (no hard 404) via the configured 404 fallback.
  3. The `_app/` assets are served in production (not silently dropped by Jekyll) — page CSS/JS load and execute.
  4. A push to the main branch triggers the GitHub Actions workflow that rebuilds and redeploys the static site automatically.
**Plans**: 3 plans (waves 1 → 2 → 3)

Plans:
- [x] 01-01-scaffold-static-config-PLAN.md — Scaffold SvelteKit (minimal+TS) + adapter-static (`base` via `BASE_PATH`, `prerender=true`, `trailingSlash:'always'`, `fallback:'404.html'`, `strict:true`), `static/.nojekyll`, base-safe skeleton `/` + `/about`, privacy `.gitignore`; `npm run build` green
- [x] 01-02-ci-deploy-and-smoke-infra-PLAN.md — GitHub Actions `deploy.yml` (Node 22, `BASE_PATH` from repo name, Pages permissions + concurrency, upload-artifact→deploy-pages) + Wave 0 live-URL smoke harness (Playwright config/spec + `verify-deploy.sh` curl matrix)
- [x] 01-03-deploy-and-live-verify-PLAN.md — Push repo, one-time Pages Source: GitHub Actions, then verify DEPLOY-01..04 green against the live URL (curl matrix + Playwright smoke)

### Phase 2: Design System & Dual Theme
**Goal**: Two complete, peer-designed themes (Premium and Accessible) exist as CSS-custom-property token sets, and a visitor can toggle between them with no flash of the wrong theme, persistence across visits, accessible-first defaulting, and a keyboard/SR-friendly toggle. Designing both token sets up front structurally prevents the accessible-as-fallback anti-pattern.
**Depends on**: Phase 1
**Requirements**: THEME-01, THEME-02, THEME-03, THEME-04, THEME-05, THEME-06
**Success Criteria** (what must be TRUE):
  1. A visitor can switch between Premium and Accessible themes from a control on any page, and the two look distinctly different across contrast, typography, spacing, and motion — not just motion removed.
  2. The chosen theme persists across page navigation and across return visits.
  3. No flash of the wrong theme occurs on load — the correct theme is applied before first paint.
  4. A first-time visitor whose signals indicate reduced-motion, no-WebGL, or low-power lands on the Accessible theme by default.
  5. The theme toggle is fully keyboard-operable, announces its state to assistive tech, and preserves focus after switching.
**Plans**: 3 plans (waves 1 -> 2 -> 3)

Plans:
- [x] 02-01-tokens-dual-theme-css-PLAN.md - reset.css + tokens/base.css + theme-premium.css + theme-accessible.css (two complete peer token sets, concrete contrast-verified values) + Phase-2 test harness (Vitest jsdom + local-preview Playwright); THEME-03
- [x] 02-02-no-flash-init-and-store-PLAN.md - app.html blocking inline theme-init script (namespaced did:theme + reduced-motion/contrast defaulting) + theme.svelte.ts SSR-safe runes store; THEME-02, THEME-04, THEME-05
- [x] 02-03-accessible-theme-toggle-PLAN.md - ThemeToggle.svelte (native aria-pressed button, aria-live announcement, focus retained) mounted in +layout.svelte; THEME-01, THEME-06

### Phase 3: App Shell, Content Pipeline & Pages
**Goal**: The token-driven app shell (landmarks, skip-link, Header/Nav/Footer), the mdsvex markdown content pipeline, and all seven route pages with real DID content are built and deployed — a complete, accessible, navigable site that stands on its own without forms or the 3D hero. Shell/landmarks land before content so semantics aren't retrofitted across seven pages.
**Depends on**: Phase 2
**Requirements**: PAGE-01, PAGE-02, PAGE-03, PAGE-04, PAGE-05, PAGE-06, PAGE-07, PAGE-08, BLOG-01, BLOG-02, BLOG-03, A11Y-02, A11Y-03, A11Y-04
**Success Criteria** (what must be TRUE):
  1. A visitor can reach all seven pages (Home, About/Mission, Programs & Services, Get Involved/Donate, Events, Blog/News, Contact) via a consistent, responsive header/nav and footer.
  2. The About and Programs pages show Eman Rimawi's real bio and the four real services (trainings, consulting, modeling, speaking); remaining pages carry authored/placeholder content in the org's voice.
  3. The Blog/News index lists posts with title, date, and summary, and each post opens as its own statically rendered page with build-time-highlighted rich content (no runtime highlighter shipped).
  4. Every page exposes a working skip-to-content link, correct semantic landmarks, and ordered headings.
  5. All interactive elements on every page are keyboard-operable with a visible focus indicator and targets ≥24px.
**Plans**: 5 plans (waves 1 → 2 → 3)

Plans:
- [x] 03-01-app-shell-landmarks-nav-PLAN.md — [wave 1] `+layout.svelte` shell: skip-link → `main#main-content[tabindex=-1]`, header/nav/main/footer landmarks, responsive keyboard-operable Header/Footer (relocated ThemeToggle), token-only `app.css`, five route stubs, shell E2E spec (PAGE-08, A11Y-02/03/04)
- [x] 03-02-mdsvex-shiki-content-pipeline-PLAN.md — [wave 2] mdsvex+Shiki build-time pipeline in `svelte.config.js`, `posts.ts` glob index, universal `blog/[slug]/+page.ts` + `entries()` prerender + `<Content/>` render, no-shiki-chunk scan, 2 sample posts (BLOG-01/02/03)
- [x] 03-03-home-about-programs-content-PLAN.md — [wave 2] Home static hero placeholder + CTAs, About with real Eman Rimawi bio + flagged mission, Programs with the four real services (PAGE-01/02/03)
- [x] 03-04-getinvolved-events-contact-PLAN.md — [wave 2] Get Involved + safe donate link-out, Events data module + empty-state, accessible Contact form scaffold (no backend) (PAGE-04/05/07)
- [x] 03-05-blog-index-a11y-hardening-PLAN.md — [wave 3] Blog/News index (posts.ts-driven) + site-wide heading-order/focus/target-size pass + full-suite Phase gate (PAGE-06, A11Y-03/04)

### Phase 4: Forms & Donate
**Goal**: Visitors can contact the org and volunteer through fully accessible forms that submit via a static-host-compatible backend with clear success/error states, and can reach the org's existing donation platform via a safe external link-out — no server, no embedded checkout, no committed secrets.
**Depends on**: Phase 3
**Requirements**: FORM-01, FORM-02, FORM-03, FORM-04
**Success Criteria** (what must be TRUE):
  1. A visitor can submit the contact form and the volunteer/get-involved form and receives a clear success or error confirmation.
  2. Both forms have associated labels, are keyboard-navigable, and announce errors to assistive tech.
  3. The donate action is a clearly-labeled external link (`rel="noopener noreferrer"`) to the org's existing platform — never an embedded checkout.
**Plans**: 2 plans (waves 1 -> 2)

Plans:
- [ ] 04-01-accessible-forms-web3forms-PLAN.md — [wave 1] Shared `submitToWeb3Forms()` + pure validation util (+unit test) + focus-managed `FormStatus`; wire contact form (drop per-field role=alert, add aria-invalid + one form-level status region, honeypot `botcheck`); volunteer form section on /get-involved; route-mocked E2E (FORM-01/02/03)
- [ ] 04-02-donate-linkout-secret-scan-PLAN.md — [wave 2] Config-driven external donate link-out (`rel="noopener noreferrer"` + new-tab cue + privacy note, reads `DONATE_URL` from `config.ts`) + `scripts/assert-no-secret.mjs` static scan wired as `test:no-secret` (FORM-04)

### Phase 5: Premium 3D Hero
**Goal**: The Premium home hero renders a performant Threlte 3D showpiece that is lazy-loaded only when Premium AND WebGL AND motion-ok AND not-low-power, shows a static poster first in all other cases, never blocks first paint, and disposes cleanly on navigation. Built last on purpose — Phases 1–4 already deliver a complete, accessible, deployed site, so the hero can never block launch.
**Depends on**: Phase 2 (theme store gate) and Phase 3 (home page)
**Requirements**: HERO-01, HERO-02, HERO-03, HERO-04, A11Y-05
**Success Criteria** (what must be TRUE):
  1. In Premium mode with WebGL, motion allowed, and adequate power, the home hero renders a performant 3D showpiece.
  2. In Accessible mode, or on no-WebGL / reduced-motion / low-power devices, a static poster image replaces the 3D, and the hero heading and CTA remain fully present and readable.
  3. The 3D never blocks first paint (poster shows first; Three.js loads only when the capability gate passes) and disposes cleanly on navigation with no memory growth.
  4. Reduced-motion visitors get animation and 3D fully disabled, not merely softened.
**Plans**: TBD (~3 plans)

Plans:
- [ ] 05-01: `capabilities.ts` (WebGL / reduced-motion / low-power / save-data detection) + per-theme poster images
- [ ] 05-02: `HeroMount` (poster-first + gated `await import()`) with the real `<h1>`/CTA in the DOM, canvas `aria-hidden`
- [ ] 05-03: `HeroScene` (Threlte, code-split) + disposal, RAF pause when hidden, DPR clamp ≤2, `webglcontextlost` handling

### Phase 6: Accessible Hardening & Launch Verification
**Goal**: The accessible theme is independently verified to meet WCAG 2.2 AA+ end-to-end against the deployed build (not assumed), and a published accessibility statement honestly documents the finished implementation, its test cadence, and known issues. Verification is its own phase because conformance is a deliverable, not a side effect.
**Depends on**: Phases 3, 4, and 5 (all feature phases)
**Requirements**: A11Y-01, A11Y-06
**Success Criteria** (what must be TRUE):
  1. Automated axe scans pass WCAG 2.2 AA on every page in the Accessible theme, corroborated by a manual screen-reader and keyboard walkthrough across both themes.
  2. A published accessibility statement page states the conformance target, test cadence, an honest known-issues list, and a help contact (Scope-style).
  3. The deployed site verifies clean end-to-end: correct base path, deep links resolve, `_app` assets return 200, and a branded 404 page renders.
**Plans**: TBD (~2 plans)

Plans:
- [ ] 06-01: axe + Lighthouse across both themes, manual SR + keyboard walkthrough, contrast + reduced-motion + no-WebGL checks; fix findings
- [ ] 06-02: Accessibility statement page + branded 404; final deployed-URL verification checklist

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Static Deploy | 3/3 | Complete | 2026-07-04 |
| 2. Design System & Dual Theme | 0/3 | Planned | - |
| 3. App Shell, Content Pipeline & Pages | 0/5 | Planned | - |
| 4. Forms & Donate | 0/2 | Planned | - |
| 5. Premium 3D Hero | 0/3 | Not started | - |
| 6. Accessible Hardening & Launch Verification | 0/2 | Not started | - |
