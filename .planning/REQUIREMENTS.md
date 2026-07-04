# Requirements: Diversity Includes Disability — Website

**Defined:** 2026-07-04
**Core Value:** Every visitor — regardless of ability, device, or assistive technology — gets a first-class experience of the org's mission. The accessible mode is a peer, not a fallback.

## v1 Requirements

### Deployment & Foundation

- [x] **DEPLOY-01**: Site builds fully static (adapter-static) and deploys to GitHub Pages via GitHub Actions
- [x] **DEPLOY-02**: All assets and internal links resolve under the repo sub-path (correct `base` path) — styles/links never break on Pages
- [x] **DEPLOY-03**: Every route is prerendered and deep links / refreshes resolve (404 fallback configured)
- [x] **DEPLOY-04**: `.nojekyll` is emitted so `_app` assets are served by Pages

### Theme System

- [ ] **THEME-01**: Visitor can toggle between a Premium theme and an Accessible theme from any page
- [ ] **THEME-02**: The chosen theme persists across pages and across return visits
- [ ] **THEME-03**: The two themes differ across motion, contrast, typography, and spacing (two complete designs, not one with motion removed)
- [ ] **THEME-04**: No flash of the wrong theme on load (theme applied before first paint)
- [ ] **THEME-05**: On first visit the default honors `prefers-reduced-motion` / no-WebGL / low-power by loading the Accessible theme
- [ ] **THEME-06**: The theme toggle is keyboard-operable, announced to assistive tech, and preserves focus on switch

### Accessibility

- [ ] **A11Y-01**: Accessible theme meets WCAG 2.2 AA on every page (automated axe scan passes)
- [ ] **A11Y-02**: A skip-to-content link is present on every page
- [ ] **A11Y-03**: Correct semantic landmarks and heading order on every page
- [ ] **A11Y-04**: All interactive elements are keyboard-operable with visible focus (incl. 2.4.11 focus-not-obscured, 2.5.8 target size ≥24px)
- [ ] **A11Y-05**: Reduced-motion is genuinely honored — animation and 3D are disabled, not merely softened
- [ ] **A11Y-06**: A published accessibility statement page (Scope-style, with an honest known-issues list)

### Pages & Content

- [ ] **PAGE-01**: Home page with hero, mission summary, and primary calls to action
- [ ] **PAGE-02**: About / Mission page with Eman Rimawi's real bio and the org's mission
- [ ] **PAGE-03**: Programs & Services page covering the four real services (trainings, consulting, modeling, speaking)
- [ ] **PAGE-04**: Get Involved / Donate page with volunteer info and a donate link-out
- [ ] **PAGE-05**: Events page listing events (structure ready for real events)
- [ ] **PAGE-06**: Blog / News index plus individual post pages
- [ ] **PAGE-07**: Contact page with an accessible contact form
- [ ] **PAGE-08**: Consistent, responsive, accessible navigation (header/nav + footer) across all pages

### Blog Content Pipeline

- [ ] **BLOG-01**: Blog posts are authored as markdown and rendered as static pages
- [ ] **BLOG-02**: Blog index lists posts with title, date, and summary
- [ ] **BLOG-03**: Rich/code content is rendered at build time (no runtime highlighter shipped)

### Forms & Donate

- [ ] **FORM-01**: Contact form submits via a static-host-compatible backend (e.g. Web3Forms) with clear success/error states
- [ ] **FORM-02**: Volunteer / get-involved form submits and confirms
- [ ] **FORM-03**: Forms are fully accessible (associated labels, errors announced, keyboard-navigable)
- [ ] **FORM-04**: Donate is a clearly-labeled external link-out (`rel="noopener"`), never an embedded checkout

### Premium 3D Hero

- [ ] **HERO-01**: The Premium home hero renders a performant 3D showpiece (Threlte)
- [ ] **HERO-02**: 3D is lazy-loaded only when Premium AND WebGL AND motion-ok AND not-low-power
- [ ] **HERO-03**: A static poster image replaces the 3D in all other cases (accessible / no-WebGL / reduced-motion)
- [ ] **HERO-04**: 3D never blocks first paint and disposes cleanly on navigation (no memory leak)

## v2 Requirements

### Enhancements

- **NEWS-01**: Newsletter signup integration
- **EVNT-02**: Dynamic events feed / calendar integration
- **I18N-01**: Multi-language support
- **SRCH-01**: Site search

## Out of Scope

| Feature | Reason |
|---------|--------|
| Server-side rendering / backend APIs | GitHub Pages is a static host |
| On-site payment processing | PCI/compliance + no server; donations link out |
| User accounts / authentication | Not needed for a content/advocacy site |
| CMS admin UI | Content is markdown/data files in the repo for v1 |
| Third-party accessibility overlay widgets | Verified harmful + legally risky (accessiBe/UserWay); native theme is the correct approach |
| Committing credentials / private Notion source | Org is 501c3-pending; sensitive source must never be in a public repo |

## Traceability

Every v1 requirement maps to exactly one phase (no orphans, no duplicates).

| Requirement | Phase | Status |
|-------------|-------|--------|
| DEPLOY-01 | Phase 1 | Complete |
| DEPLOY-02 | Phase 1 | Complete |
| DEPLOY-03 | Phase 1 | Complete |
| DEPLOY-04 | Phase 1 | Complete |
| THEME-01 | Phase 2 | Pending |
| THEME-02 | Phase 2 | Pending |
| THEME-03 | Phase 2 | Pending |
| THEME-04 | Phase 2 | Pending |
| THEME-05 | Phase 2 | Pending |
| THEME-06 | Phase 2 | Pending |
| PAGE-01 | Phase 3 | Pending |
| PAGE-02 | Phase 3 | Pending |
| PAGE-03 | Phase 3 | Pending |
| PAGE-04 | Phase 3 | Pending |
| PAGE-05 | Phase 3 | Pending |
| PAGE-06 | Phase 3 | Pending |
| PAGE-07 | Phase 3 | Pending |
| PAGE-08 | Phase 3 | Pending |
| BLOG-01 | Phase 3 | Pending |
| BLOG-02 | Phase 3 | Pending |
| BLOG-03 | Phase 3 | Pending |
| A11Y-02 | Phase 3 | Pending |
| A11Y-03 | Phase 3 | Pending |
| A11Y-04 | Phase 3 | Pending |
| FORM-01 | Phase 4 | Pending |
| FORM-02 | Phase 4 | Pending |
| FORM-03 | Phase 4 | Pending |
| FORM-04 | Phase 4 | Pending |
| HERO-01 | Phase 5 | Pending |
| HERO-02 | Phase 5 | Pending |
| HERO-03 | Phase 5 | Pending |
| HERO-04 | Phase 5 | Pending |
| A11Y-05 | Phase 5 | Pending |
| A11Y-01 | Phase 6 | Pending |
| A11Y-06 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 35 total (source list enumerates 35; prior "31" count was an error — corrected during roadmap creation)
- Mapped to phases: 35 ✓
- Unmapped: 0

Per-phase counts: Phase 1 = 4, Phase 2 = 6, Phase 3 = 14, Phase 4 = 4, Phase 5 = 5, Phase 6 = 2.

---
*Requirements defined: 2026-07-04*
*Last updated: 2026-07-04 after roadmap creation (traceability populated, coverage count corrected 31 → 35)*
