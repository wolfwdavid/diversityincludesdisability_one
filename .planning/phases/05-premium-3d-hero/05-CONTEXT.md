# Phase 5: Premium 3D Hero - Context

**Gathered:** 2026-07-06
**Status:** Ready for planning

<domain>
## Phase Boundary

The Premium home hero renders a performant Threlte 3D showpiece that is lazy-loaded only when Premium AND WebGL AND motion-ok AND not-low-power, shows a static poster first in all other cases, never blocks first paint, and disposes cleanly on navigation. Built last on purpose — Phases 1–4 already deliver a complete, accessible, deployed site, so the hero can never block launch.

Requirements: HERO-01, HERO-02, HERO-03, HERO-04, A11Y-05.

</domain>

<decisions>
## Implementation Decisions

### 3D Scene Concept — "Living Constellation"
- **D-01:** The showpiece is a **constellation of spheres**: ~40 varied glowing orbs (different sizes, subtle texture variation, individual drift paths) forming one connected system. The metaphor — many different bodies/minds forming one community — is deliberately abstract; NO literal disability iconography (no puzzle pieces, no wheelchair symbols — both are semiotically risky for this org).
- **D-02:** **Periwinkle monochrome** color treatment: all orbs in shades of the Premium accent (`#7aa2ff` → `#a9c2ff`) with white-hot cores, on the Premium navy (`#0f1020`). The hero must read as engineered into the locked Premium design system.
- **D-03:** **Proximity-based living connections**: faint lines fade in when orbs drift near each other and dissolve as they part. The network is alive — connections keep forming.
- **D-04:** **Moderate density (~40 orbs)** on desktop; reduce to **~20 orbs on small screens**.

### Motion & Interactivity
- **D-05:** Base motion: **slow 3D drift + gentle breathe** — orbs drift on slow individual paths, whole field rotates almost imperceptibly, orbs subtly pulse/glow. Full cycle ~20–30s. Contemplative, never distracting from the text.
- **D-06:** Pointer: **subtle parallax tilt only** — the whole constellation tilts a few degrees toward the cursor. No per-orb cursor reactions. Degrades to nothing on touch.
- **D-07:** Scroll: **gentle fade + RAF pause** — constellation fades as it leaves the viewport and rendering pauses (aligns with HERO-04 perf rules). No scroll-jacking, no parallax recede.
- **D-08:** Energy: **contemplative & calm** — slow, weighty, dignified. Elegance over spectacle. Matches the editorial serif identity and the org's gravitas.
- **D-09:** Reduced-motion visitors get 3D **fully disabled** (poster only) — carried forward from Phase 2 (THEME-05 scope decision); this phase's capability gate is where no-WebGL/low-power detection finally lands (deferred here from Phase 2 by logged decision).

### Hero Composition
- **D-10:** **Full-bleed background**: the constellation fills the entire hero region behind the existing h1/mission/CTAs. The text is real DOM (already shipped in Phase 3) and stays exactly as-is semantically.
- **D-11:** Legibility: **exclusion zone + scrim** — orbs are steered away from the text column (field concentrates toward edges) AND a soft radial darkening sits behind the text block. Guaranteed WCAG AA contrast at all times, at all viewport sizes.
- **D-12:** Premium hero height: **~85svh near-full-screen** with a sliver of the next section visible to invite scroll. **Accessible mode keeps today's compact text hero unchanged.**
- **D-13:** **Premium mobile gets the 3D**, scaled down: ~20 orbs, no parallax (no pointer), DPR clamp ≤2 already limits cost. The capability gate excludes weak devices anyway.

### Poster Image Strategy
- **D-14:** The poster is a **high-quality still of the actual constellation scene** — poster and live scene are visually identical, so gate-failed visitors see the same art (static) and the load-in feels like "the stars begin to move."
- **D-15:** **Accessible theme gets NO hero image** — it stays exactly as it is today: calm, text-first, fast. The constellation is Premium's identity; Accessible's identity is clarity. (Honors the "peer design, not subtracted fallback" principle — this is a deliberate design difference, not a removal.)
- **D-16:** Poster production: **captured during dev and committed** — build the scene, screenshot a beautiful frame at 2x, optimize (AVIF/WebP + fallback), commit to `static/`. No build-time render pipeline.
- **D-17:** Premium load transition: **slow ~800ms crossfade** from poster to live scene.

### Claude's Discretion
- Exact orb material/shader (standard vs custom glow), light setup, and star-glint accents
- Precise drift/breathe animation curves and connection-distance threshold
- Exclusion-zone implementation technique (spawn-region constraints vs steering forces)
- Scrim gradient values (as long as AA contrast over the scrim is verifiable)
- Poster capture composition and file format specifics
- How the ~85svh hero responds to very short/landscape-mobile viewports

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Capability gate & theming (locked upstream)
- `.planning/phases/02-design-system-dual-theme/02-RESEARCH.md` — Signal-detection architecture; the Phase-2 decision that no-WebGL/low-power detection is DEFERRED TO THIS PHASE's hero-mount gate (never a theme switch)
- `src/lib/theme/theme.svelte.ts` — The runes theme store the gate must read (`current === 'premium'`)
- `src/lib/styles/theme-premium.css` — Locked Premium tokens the scene must use (`--color-accent #7aa2ff`, `--color-bg #0f1020`, motion primitives)

### Hero region (locked upstream)
- `src/routes/+page.svelte` — The existing Phase-3 hero markup (h1/mission/CTAs) this phase wraps; text must remain intact and readable
- `.planning/phases/03-app-shell-content-pipeline-pages/03-RESEARCH.md` — base-path/asset gotchas for the poster image under the sub-path deploy

### Project-level
- `.planning/ROADMAP.md` (Phase 5 section) — the 3 prescribed plans (05-01 capabilities.ts + posters, 05-02 HeroMount, 05-03 HeroScene) and success criteria
- `.planning/STATE.md` — Phase-5 research flag: `@threlte/extras` runes-mode edge cases are the MEDIUM-confidence area needing focused research

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/theme/theme.svelte.ts` — theme store; the mount gate composes `theme.current === 'premium'` with capability checks
- Premium token set (`theme-premium.css`) — the scene's entire palette/motion language comes from these custom properties
- `e2e/` Playwright harness + private-port pattern — extend for hero gate/poster tests (NOTE: managed `webServer` hangs at teardown on this Windows box — use self-managed preview, documented in 04-02-SUMMARY.md)
- `scripts/assert-no-shiki-chunk.mjs` pattern — mirror it for a "no three.js in the initial bundle" assertion (HERO-04: never blocks first paint)

### Established Patterns
- Threlte 8 / Three 0.185 are the planned stack (PROJECT.md) but are NOT yet installed — this phase installs them; keep them out of the entry chunk via dynamic `await import()`
- All internal asset URLs must be base-prefixed (`$app/paths`) for the sub-path deploy — applies to the poster image
- Static prerender (adapter-static, strict) — the hero component must be SSR-safe (no window access at module top level; the 3D mounts client-side only)

### Integration Points
- `src/routes/+page.svelte` hero `<section>` — HeroMount wraps/backs this region; text nodes stay as-is
- Capability gate reads: theme store + `matchMedia('(prefers-reduced-motion: reduce)')` + WebGL context probe + low-power heuristics (deferred here from Phase 2)

</code_context>

<specifics>
## Specific Ideas

- "The stars begin to move" — the poster-to-3D crossfade should feel like the still image waking up, not a content swap
- The constellation metaphor: varied orbs, one living system — community without literal iconography
- Premium hero = showpiece moment (~85svh); Accessible hero = untouched clarity. Two peer identities, per the project's core principle.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 05-premium-3d-hero*
*Context gathered: 2026-07-06*
