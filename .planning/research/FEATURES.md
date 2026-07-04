# Feature Research

**Domain:** Disability-advocacy nonprofit website (Diversity Includes Disability) with a dual Premium/Accessible theme
**Researched:** 2026-07-04
**Confidence:** HIGH (both reference sites fetched; accessibility features mapped to WCAG 2.2; overlay anti-pattern verified across multiple 2025-2026 sources)

## Reference Grounding

### Real DID site — https://www.diversityincludesdisability.org/ (fetched 2026-07-04)
Currently a minimal Wix single-pager. Actual content on the live site:
- **Pages:** Home, "About Me". A "Log In" element (Wix member area, effectively unused).
- **Founder:** Eman Rimawi (© 2024 "Eman Rimawi-Doster | Powered by Wix").
- **Four services** (the real "programs"), listed on the home page rather than a dedicated page:
  1. Intersectional Disability Equity and Inclusion trainings and facilitation
  2. Disability Consulting
  3. Modeling for Representation
  4. Speaker and Panelist services
- **Contact:** email `emanrimawi@gmail.com`, labeled "Let's Connect".
- **Social:** Facebook, Twitter/X, LinkedIn, Instagram (icons appear twice).
- **Not present today (must be built per PROJECT.md):** Blog/News, Events, donate/ways-to-give, volunteer/get-involved, newsletter signup, dedicated Programs & Services page.

Implication: our build is an **expansion**, not a mirror. We port the real voice/brand (Eman, the four services, intersectional-disability framing) and add the standard nonprofit sections the PROJECT scopes (Home, About/Mission, Programs & Services, Get Involved/Donate, Blog/News, Events, Contact).

### Accessibility benchmark — https://www.scope.org.uk/ + /accessibility (fetched 2026-07-04)
- **IA:** Home, About us, Advice and support, Campaigns, Get involved, News and stories, Accessibility (top-level nav item — accessibility is treated as a first-class destination).
- **Skip links present:** "Skip to main content", "Skip to search", "Skip to navigation".
- **Donate:** prominent "Donate now", plus a lottery/Jackpot Draw, charity shops, fundraising.
- **Get involved:** membership, volunteering roles, research panel, events, partnerships.
- **News and stories:** real-life stories + org news (the blog pattern).
- **Newsletter:** prominent "receive all the latest news" email signup.
- **Contact:** helpline phone, live chat, email, separate supporter-care line.
- **Accessibility statement (`/accessibility`, last updated Nov 2025):** targets **WCAG 2.2 AAA**, **re-tested every 6 months**, transparently **lists known unresolved issues** (donate journey, header menus not closing on tab-off, heading structure, inaccessible linked PDFs), and — critically — **offers NO overlay/toolbar**. Instead it points users to native customization (AbilityNet "My Computer, My Way", W3C "Better Web Browsing"). This is the modern best-practice posture.

## Feature Landscape

### Table Stakes (Users Expect These)

Nonprofit/advocacy content features every visitor assumes exist.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Clear top-nav IA (Home, About/Mission, Programs, Get Involved/Donate, News, Events, Contact) | Standard nonprofit orientation; PROJECT scopes these pages | LOW | Persistent header + footer nav; current page indicated with `aria-current="page"` |
| Mission / About page with founder story | Advocacy orgs are trusted through their people; Eman is the brand | LOW | Port real DID voice; photo with real alt text |
| Programs & Services page | The 4 real services are the org's core offer | LOW | Promote the home-page service list into its own structured page |
| Get Involved / Donate path (link-out) | Every nonprofit needs an ask; static host = no on-site payments | LOW | Button links out to org's existing donation platform (PROJECT decision). No PCI scope |
| Contact page + working form | Baseline for a service org; "Let's Connect" already the brand phrase | MEDIUM | Third-party backend (Formspree/Web3Forms) — static host has no server. Accessible form (labels, error text, `aria-describedby`) |
| Blog / News (markdown-driven) | Advocacy = ongoing voice; Scope leads with "News and stories" | MEDIUM | Static markdown → routes at build; list + detail; RSS optional |
| Events listing | Trainings/speaking/panels are event-shaped; PROJECT scopes an Events page | MEDIUM | Static data file; upcoming/past; each event a landmark region |
| Newsletter signup | Standard retention/asks; Scope features it prominently | LOW | Embed provider form (Mailchimp/Buttondown) or route through form backend |
| Social links (FB, X, LinkedIn, IG) | Already on the live site | LOW | In footer; icons need accessible names, not just glyphs |
| Responsive mobile layout | Majority mobile traffic | LOW | SvelteKit + CSS; test at 320px |
| **Skip-to-content link** | WCAG 2.4.1 Bypass Blocks; Scope has three | LOW | First focusable element; visible on focus |
| **Keyboard-operable everything** | WCAG 2.1.1; non-negotiable floor | MEDIUM | All interactive elements reachable + operable; no keyboard traps (2.1.2); menus must close on tab-off (Scope's own known bug — we avoid it) |
| **Visible focus indicators** | WCAG 2.4.7 + 2.2's 2.4.11 Focus Not Obscured | LOW-MED | Never `outline:none` without replacement; sticky headers must not cover focused elements |
| **Semantic HTML + ARIA landmarks** | Screen-reader navigation; SR users jump by landmark | MEDIUM | One `<main>`, `<nav>`, `<header>`, `<footer>`; headings in order (Scope lists heading structure as a known defect — we get it right) |
| **Text alternatives / alt-text discipline** | WCAG 1.1.1; foundational | LOW-MED | Meaningful alt for content images, `alt=""` for decorative; process discipline, not a feature toggle |
| **Color contrast AA (4.5:1 text / 3:1 UI)** | WCAG 1.4.3 + 1.4.11 | MEDIUM | Enforce in BOTH themes; Premium theme still must pass AA |
| **`prefers-reduced-motion` honored** | WCAG 2.3.3; PROJECT hard requirement | MEDIUM | Reduced/no motion path; 3D hero must not run under reduced-motion |
| **Accessibility statement page** | Legal + trust norm; Scope makes it a top-nav item | LOW | State target (WCAG 2.2 AA+), test cadence, known issues, contact-for-help. Model Scope's honesty |

### Differentiators (Competitive Advantage)

Where this site beats a typical nonprofit template — aligned with PROJECT Core Value ("accessible mode is a peer, not a degraded fallback").

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Dual full-design theme toggle (Premium ↔ Accessible)** | Two coherent designs, not one with motion stripped; embodies "diversity includes disability" in the product itself | HIGH | Persist choice (localStorage) across pages/visits; themes differ in contrast, type, spacing, motion. NOT a third-party overlay (see anti-features) |
| **Premium 3D hero showpiece (Threlte/Three.js)** | "Wow" that funds attention/credibility for the org | HIGH | Lazy-loaded, single showpiece; must degrade on no-WebGL/low-power; never blocks first paint or accessible mode |
| **Accessibility as a first-class, self-authored implementation** | Modeled on Scope's WCAG-2.2 posture; a disability org whose own site is exemplary is the strongest possible proof point | HIGH | Native semantics + real testing, not a widget. This IS the org's mission made tangible |
| **WCAG 2.2-specific conformance (beyond 2.1)** | Most sites still target 2.1; hitting 2.2 AA is current-best | MEDIUM | New-in-2.2 AA criteria to honor: 2.4.11 Focus Not Obscured, 2.5.7 Dragging Movements (provide non-drag alternatives), 2.5.8 Target Size 24×24px min, 3.2.6 Consistent Help, 3.3.7 Redundant Entry, 3.3.8 Accessible Authentication |
| **High-contrast / theme respects `prefers-contrast` + `forced-colors`** | Works with Windows High Contrast / Forced Colors users automatically | MEDIUM | Test under `forced-colors: active`; don't fight the OS |
| **Transparent "known issues" in accessibility statement** | Scope does this; signals genuine (not performative) commitment | LOW | Living list; builds trust more than a perfect-sounding claim |
| **Real story-led content (Eman's voice, intersectional framing)** | Authentic advocacy vs generic charity copy | LOW | Editorial, not technical |
| **Text resize to 200% without loss (reflow)** | WCAG 1.4.4 + 1.4.10; relative units | LOW-MED | Use rem/em; test 400% reflow at 320px |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Third-party accessibility overlay/widget (accessiBe, UserWay, etc.)** | Looks like an instant "make it accessible" button; ironic appeal for a disability org | Verified harmful: 25% of 2024 digital-a11y lawsuits hit overlay sites; FTC fined accessiBe $1M (Jan 2025) for deceptive claims; overlays fix only 20-40% of issues, conflict with users' own AT, and blind users install extensions to *block* them. 1000+ experts signed against them. Scope deliberately uses none | Build accessibility into the source (our differentiator). Our theme toggle is a native, self-authored design mode — NOT an overlay. Point users to native OS/browser tools like Scope does |
| **On-site payment processing / donation checkout** | "Keep donors on our site" | PCI/compliance burden; impossible on a static GitHub Pages host; PROJECT explicitly out-of-scope | Link out to the org's existing donation platform |
| **User accounts / login / member area** | The live Wix site has a vestigial "Log In" | No server, no auth on static host; nothing to gate; adds attack surface & a11y surface for zero value | Omit entirely. Newsletter covers "stay connected" |
| **CMS admin UI** | "Let Eman edit without code" | Needs a backend; PROJECT out-of-scope for v1 | Markdown/data files in repo; revisit a headless/git-based CMS post-launch |
| **Auto-playing hero video/audio or carousel** | "Engaging" | WCAG 2.2.2 violation risk; hostile under reduced-motion; hurts perf and the 3D budget | Single controllable 3D showpiece (Premium) / static hero (Accessible); user-initiated motion only |
| **Chatbot / live-chat widget** | Scope has a helpline chat | Third-party widgets are frequent a11y offenders and add weight; org is a small nonprofit without staffing to answer | Contact form + clear email; add later only if staffed |
| **Cookie-heavy analytics / consent wall** | "Measure everything" | Consent banners are a top keyboard/SR trap; GDPR overhead | Cookieless/privacy-first analytics (e.g. Plausible) or none for v1 |
| **PDF-only content** | Reuse existing training decks | Scope lists old PDFs as a known SR-accessibility defect | Author content as HTML; if a PDF is unavoidable, tag it and provide an HTML equivalent |

## Feature Dependencies

```
Static SvelteKit build (adapter-static, correct base path)
    └──enables──> all pages (Home, About, Programs, Get Involved, News, Events, Contact)
                      └──requires──> Layout shell (header nav + skip link + footer)
                                         └──requires──> Semantic landmarks + heading order
                                                            └──enables──> Screen-reader nav

Dual-theme toggle (persisted)
    ├──requires──> Design-token system (two themes: contrast/type/spacing/motion)
    ├──requires──> prefers-reduced-motion + prefers-contrast media handling
    └──gates──> Premium 3D hero (only in Premium theme, motion-allowed, WebGL present)
                    └──requires──> Threlte lazy-load + no-WebGL/low-power fallback

Blog/News + Events
    └──requires──> Markdown/data content pipeline (build-time)

Contact + Volunteer + Newsletter forms
    └──requires──> Third-party form backend (no server)
                       └──requires──> Accessible form pattern (labels, aria-describedby, error summary)

Accessibility statement page ──documents──> the whole a11y implementation (write last, keep living)

Accessibility overlay ──CONFLICTS with──> native accessibility implementation (never combine)
Premium 3D hero ──CONFLICTS with──> reduced-motion / no-WebGL (must yield to them)
```

### Dependency Notes
- **Layout shell must land before content pages:** skip link, landmarks, and heading discipline are structural — retrofitting them across N pages is expensive.
- **Theme-token system precedes the toggle AND the 3D hero:** both themes are defined by tokens (contrast/type/spacing/motion); the 3D hero is gated on the Premium token set + motion + WebGL.
- **Reduced-motion/contrast handling is a hard gate on the 3D hero:** the hero is a *dependent* of the theme system, never a sibling that can override it.
- **Forms depend on a chosen backend early:** the accessible-error pattern differs slightly per provider (Formspree vs Web3Forms), so pick before building the Contact/Volunteer/Newsletter forms.
- **Accessibility statement depends on everything else:** it honestly documents the real implementation and known gaps, so it is authored near the end and kept living.
- **Overlay conflicts with the entire approach:** adopting one would undermine the self-authored a11y that is the project's core differentiator — mutually exclusive by design.

## MVP Definition

### Launch With (v1)
- [ ] Static SvelteKit shell: header nav + **skip-to-content** + footer, semantic landmarks, ordered headings — the accessible spine
- [ ] Seven pages: Home, About/Mission, Programs & Services, Get Involved/Donate, Blog/News, Events, Contact — PROJECT-scoped IA
- [ ] Dual-theme toggle (Premium ↔ Accessible), persisted — the Core Value made real
- [ ] Accessible theme meeting **WCAG 2.2 AA+** (contrast, keyboard, focus, SR) — hard floor
- [ ] `prefers-reduced-motion` / no-WebGL / low-power always honored — non-negotiable
- [ ] One Premium 3D hero (Threlte), lazy + gracefully degrading — the "wow"
- [ ] Blog/News + Events from markdown/data — ongoing advocacy voice
- [ ] Contact + Volunteer forms via third-party backend, accessible pattern — the org's "Let's Connect"
- [ ] Donate = link-out to existing platform — the ask without PCI scope
- [ ] Accessibility statement page (target, test cadence, known issues, contact) — trust + legal
- [ ] Newsletter signup — retention
- [ ] Real DID content (Eman's story, the 4 services) + social links — authentic, launchable

### Add After Validation (v1.x)
- [ ] RSS feed for Blog/News — once there's a publishing rhythm
- [ ] Impact/stats section (Scope-style) — once the org has metrics to show
- [ ] `forced-colors`/Windows High Contrast explicit tuning pass — after core AA is verified
- [ ] Automated a11y CI (axe/pa11y in the build) — lock in conformance as content grows

### Future Consideration (v2+)
- [ ] Git-based / headless CMS so Eman edits without code — when non-technical editing is needed
- [ ] Recurring/event registration or ticketing — only if events grow beyond listings
- [ ] Multilingual content — if the audience warrants
- [ ] Semi-annual accessibility audit cadence like Scope's — as the org matures

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Accessible spine (skip link, landmarks, headings, keyboard, focus) | HIGH | MEDIUM | P1 |
| Seven-page IA + real content | HIGH | MEDIUM | P1 |
| Dual-theme toggle (persisted) | HIGH | HIGH | P1 |
| WCAG 2.2 AA+ accessible theme | HIGH | HIGH | P1 |
| Reduced-motion / no-WebGL handling | HIGH | MEDIUM | P1 |
| Donate link-out | HIGH | LOW | P1 |
| Contact/Volunteer accessible forms | HIGH | MEDIUM | P1 |
| Accessibility statement page | MEDIUM | LOW | P1 |
| Premium 3D hero | MEDIUM | HIGH | P1 (headline differentiator) |
| Blog/News (markdown) | MEDIUM | MEDIUM | P1 |
| Events listing | MEDIUM | MEDIUM | P2 |
| Newsletter signup | MEDIUM | LOW | P2 |
| Text resize/reflow to 200-400% | HIGH | LOW | P2 (falls out of good tokens) |
| RSS / impact stats / forced-colors pass | LOW-MED | LOW-MED | P3 |
| Overlay widget | NEGATIVE | LOW | Never (anti-feature) |

## Accessibility Deep-Dive (WCAG 2.2-mapped, Scope-benchmarked)

The accessible theme's concrete checklist, each item tied to a success criterion:

| Area | WCAG 2.2 SC | What we do | Complexity |
|------|-------------|------------|------------|
| Skip links | 2.4.1 Bypass Blocks (A) | "Skip to main content" as first focusable, visible on focus (Scope ships three) | LOW |
| Keyboard operable | 2.1.1 (A), 2.1.2 No Keyboard Trap (A) | Everything reachable + operable; menus close on tab-off (Scope's own known bug — we avoid) | MEDIUM |
| Focus visible | 2.4.7 (AA) | Strong visible focus ring in both themes; never bare `outline:none` | LOW |
| Focus not obscured | 2.4.11 (AA, new in 2.2) | Sticky header/toggle must not cover the focused element | MEDIUM |
| Landmarks + headings | 1.3.1 Info & Relationships (A) | Single `<main>`, `<nav>`, `<header>`, `<footer>`; strict heading order (Scope lists heading structure as a defect) | MEDIUM |
| Text alternatives | 1.1.1 (A) | Meaningful alt on content images; `alt=""` on decorative; icon buttons get accessible names | LOW-MED |
| Contrast (text) | 1.4.3 (AA) | ≥4.5:1 body, ≥3:1 large — enforced in BOTH themes incl. Premium | MEDIUM |
| Contrast (non-text/UI) | 1.4.11 (AA) | ≥3:1 for controls, focus rings, meaningful graphics | MEDIUM |
| Reduced motion | 2.3.3 (AAA, but PROJECT-mandated) | `prefers-reduced-motion` disables 3D + transitions | MEDIUM |
| No motion trap / autoplay | 2.2.2 (A) | No autoplay carousels/video; motion is user-initiated | LOW |
| Reflow | 1.4.10 (AA) | No 2-D scroll at 320px / 400% zoom | LOW-MED |
| Text spacing | 1.4.12 (AA) | Layout survives user-overridden spacing | LOW |
| Target size | 2.5.8 (AA, new in 2.2) | Interactive targets ≥24×24px (esp. the theme toggle, nav, social icons) | LOW |
| Dragging alternative | 2.5.7 (AA, new in 2.2) | Any slider/drag has a click/tap alternative | LOW |
| Consistent help | 3.2.6 (A, new in 2.2) | Contact/help in the same place site-wide | LOW |
| Accessible forms | 1.3.1, 3.3.1 Error Identification, 3.3.2 Labels, 3.3.3 Error Suggestion | Explicit `<label>`, `aria-describedby` errors, focus-managed error summary, no CAPTCHA cognitive-test barrier (3.3.8) | MEDIUM |
| Forced colors / high contrast | 1.4.3/1.4.11 + Windows HC | Test under `forced-colors: active`; respect `prefers-contrast` | MEDIUM (v1.x tuning) |
| Language | 3.1.1 (A) | `lang="en"` on `<html>` | LOW |
| Accessibility statement | (norm/legal) | Target, test cadence, honest known-issues list, help contact — Scope-modeled | LOW |

**Key stance (from evidence):** Scope achieves best-in-class accessibility with **zero overlay/toolbar** — native semantics + regular testing + honest reporting. Our dual-theme toggle is a *native design mode*, categorically different from a bolt-on overlay widget. Do not conflate the two, and never add a third-party a11y widget.

## Competitor Feature Analysis

| Feature | Scope (benchmark) | Live DID (Wix) | Our Approach |
|---------|-------------------|----------------|--------------|
| IA breadth | Full (7+ sections, Accessibility in top nav) | Minimal (Home, About Me) | Full 7-page IA + Accessibility statement page |
| Accessibility method | Native, WCAG 2.2 AAA target, 6-mo retest, no overlay | None evident (Wix defaults) | Native WCAG 2.2 AA+, dual-theme, no overlay |
| Donate | On-site + lottery + shops | None | Link-out (static host) |
| Blog/News | "News and stories" story-led | None | Markdown-driven |
| Events | Event finder | None | Static Events listing |
| Newsletter | Prominent signup | None | Provider-embedded signup |
| Forms | Server-backed | Wix form | Third-party backend, accessible pattern |
| Visual "wow" | Conventional CMS design | Wix template | Premium 3D hero (Threlte), gracefully degrading |
| Accessibility statement | Yes, honest known-issues list | No | Yes, Scope-modeled honesty |

## Sources

- https://www.diversityincludesdisability.org/ — live content, IA, services, contact, social (fetched 2026-07-04) [HIGH]
- https://www.scope.org.uk/ — IA, donate, get-involved, news, newsletter, skip links (fetched 2026-07-04) [HIGH]
- https://www.scope.org.uk/accessibility — WCAG 2.2 AAA target, 6-month retest, known-issues transparency, no-overlay stance, native-customization guidance (fetched 2026-07-04) [HIGH]
- https://www.w3.org/TR/WCAG22/ and https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/ — WCAG 2.2 new AA criteria (2.4.11, 2.5.7, 2.5.8, 3.2.6, 3.3.7, 3.3.8) [HIGH]
- https://www.levelaccess.com/blog/wcag-2-2-aa-summary-and-checklist-for-website-owners/ — 2026 AA checklist [MEDIUM]
- https://www.accessibility.works/blog/avoid-accessibility-overlay-tools-toolbar-plugins/ + https://titancms.com/Blog/Accessibility-Overlays-in-2025-A-Shortcut-Companies-Should-Continue-to-Avoid — overlay lawsuits, FTC $1M accessiBe settlement (Jan 2025), 20-40% coverage, expert opposition [MEDIUM, multi-source corroborated]

---
*Feature research for: disability-advocacy nonprofit website with dual Premium/Accessible theme*
*Researched: 2026-07-04*
