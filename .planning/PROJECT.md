# Diversity Includes Disability — Website

## What This Is

A modern, premium website for **Diversity Includes Disability** (Eman Rimawi's disability-advocacy nonprofit), built in SvelteKit and deployed to GitHub Pages. It ships as a single site with **two complete, user-togglable experiences**: a **Premium** theme (a striking 3D hero showpiece plus polished 2D motion) and an **Accessible** theme (WCAG 2.2 AA+, modeled on the accessibility of scope.org.uk — high contrast, reduced motion, keyboard-first, screen-reader friendly, no WebGL dependency). The two modes differ in more than motion: contrast, typography, and spacing change so each is a distinct, coherent design.

## Core Value

Every visitor — regardless of ability, device, or assistive technology — gets a first-class experience of the org's mission. The accessible mode is not a degraded fallback; it is a peer.

## Requirements

### Validated

- [x] Static build (SvelteKit static adapter) deployable to GitHub Pages — *Validated in Phase 1: Foundation & Static Deploy. Live at https://wolfwdavid.github.io/diversityincludesdisability_one/ with DEPLOY-01..04 verified against the live URL (base path, .nojekyll, prerender, 404 deep-link fallback, CI deploy on push to main).*

### Active

- [ ] Dual-theme toggle (Premium ↔ Accessible) that persists across visits and pages
- [ ] Accessible mode meets WCAG 2.2 AA+ (Scope-benchmark: contrast, keyboard, SR, focus)
- [ ] `prefers-reduced-motion` / no-WebGL / low-power are always honored
- [ ] Premium mode: one performant 3D hero showpiece (Three.js/Threlte)
- [ ] Full-site content mirrored from diversityincludesdisability.org (real copy)
- [ ] Pages: Home, About/Mission, Programs & Services, Get Involved/Donate, Blog/News, Events, Contact
- [ ] Blog/News driven by markdown content (static, no server)
- [ ] Contact / Volunteer forms functional on a static host (third-party form backend)
- [ ] Donate path (link-out to the org's existing donation platform — no server-side payments)

### Out of Scope

- Server-side rendering / backend APIs — GitHub Pages is a static host
- On-site payment processing — donations link out to an existing platform (PCI/compliance, static host)
- User accounts / auth — not needed for a content/advocacy site
- CMS admin UI — content is markdown/data files in the repo for v1
- Storing any credentials or private Notion source data in the repo (org is 501c3-pending; sensitive source material must never be committed raw)

## Context

- **Organization:** Diversity Includes Disability, founded by Eman Rimawi; disability advocacy. Currently 501(c)(3)-pending — treat any private/source material (e.g., Notion exports) as sensitive; never commit raw credentials.
- **Content reference (brand + copy):** https://www.diversityincludesdisability.org/
- **Accessibility benchmark:** https://www.scope.org.uk/ — a best-in-class accessible nonprofit site to model interaction, contrast, and semantics against.
- **Prior related work:** A separate grant-tracker tool was built for this org in a sibling directory; this website project is independent of it.
- **Design intelligence:** Use the `ui-ux-pro-max` skill during UI/design phases.
- **Orchestration:** Ultracode multi-agent enabled — favor parallel research and adversarial verification.

## Constraints

- **Tech stack**: SvelteKit + static adapter — required for GitHub Pages static hosting.
- **3D**: Three.js via Threlte (Svelte-native) — must be lazy-loaded and never block accessible mode or first paint.
- **Hosting**: GitHub Pages, repo `diversityincludesdisability_one` — dictates static build + correct base path.
- **Accessibility**: WCAG 2.2 AA+ is a hard floor for the accessible theme; the toggle and reduced-motion handling are non-negotiable.
- **Performance**: Premium 3D must degrade gracefully; low-power / no-WebGL devices must never get a broken hero.
- **Privacy/Legal**: 501c3-pending — no raw credentials or private source data committed.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| SvelteKit + static adapter | Svelte-native, great DX, static export fits GitHub Pages | — Pending |
| Threlte for the 3D hero | Svelte-idiomatic Three.js wrapper; keeps 3D componentized + lazy | — Pending |
| Two full themes (not just motion) | Accessible mode as a true peer design, not a stripped fallback | — Pending |
| 3D scoped to one hero showpiece | Maximum wow with controllable perf/a11y cost | — Pending |
| Mirror real DID content | Launchable real site, not a demo | — Pending |
| Forms via third-party backend (e.g. Formspree) | GitHub Pages has no server; still need working contact/volunteer | — Pending |
| Donate = link-out | No server-side payments on a static host | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-04 after Phase 1 (Foundation & Static Deploy) completion — site live on GitHub Pages*
