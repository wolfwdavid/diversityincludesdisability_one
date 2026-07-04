# Pitfalls Research

**Domain:** SvelteKit static site on GitHub Pages — dual accessible/premium theme, Threlte 3D hero, markdown blog, static-host forms, disability-advocacy nonprofit
**Researched:** 2026-07-04
**Confidence:** HIGH (SvelteKit/Pages/theme facts verified against official docs + issue tracker; a11y and Threlte from established practice)

> Phase names used below map to the anticipated roadmap: **Foundation** (scaffold + adapter-static + deploy), **Design System & Theme** (tokens + toggle + no-flash), **Content & Blog** (pages + markdown), **Accessible Theme Hardening** (WCAG 2.2 AA+), **Premium 3D Hero** (Threlte), **Forms & Donate**, **Launch Verification**. If numbering differs, match by name.

---

## Critical Pitfalls

### Pitfall 1: Base path breaks every asset and internal link on the project page

**What goes wrong:**
The repo is `diversityincludesdisability_one`, so unless a custom domain is attached, the site serves from `https://<user>.github.io/diversityincludesdisability_one/` — a **sub-path**, not root. If `paths.base` is unset (or links are hardcoded with a leading `/`), CSS, JS, images, and nav links resolve against the domain root (`/assets/...`) and 404. The site looks fine on `localhost` (which serves from `/`) and is completely broken on Pages. This is the single most common GitHub Pages + SvelteKit failure.

**Why it happens:**
`kit.paths.base` must be set to `/diversityincludesdisability_one` for production, but dev serves from root, so the bug is invisible locally. Developers also instinctively write `href="/about"` and `src="/logo.png"` instead of using the `base` helper. A second trap (kit issue #11554): `<a href="{base}/page">` where a *relative* href gets appended to the current deep URL, producing `/repo/blog/blog/post` on nested routes.

**How to avoid:**
- Set `paths.base` from an env var so local and CI differ cleanly:
  `paths: { base: process.env.BASE_PATH || '' }` and set `BASE_PATH=/diversityincludesdisability_one` in the GitHub Actions build step.
- Never write root-absolute internal URLs. Import `base` from `$app/paths` and prefix every internal link/asset: `href="{base}/about"`, `src="{base}/logo.png"`. For markup in `app.html`, use `%sveltekit.assets%`.
- Decide early: if the org attaches a custom domain (e.g. the real `.org`), base becomes `''` and a `CNAME` file is needed in `static/`. Pick one path model in Foundation and encode it in CI so it can't drift.
- Test the *built* output, not dev: `npm run build && npm run preview` and click through, ideally with base set.

**Warning signs:**
Works on `localhost:5173` but unstyled/blank on Pages; DevTools Network shows 404s for `/_app/...`; nav links 404 only after navigating one level deep.

**Phase to address:** Foundation (encode base + CI env), verified in Launch Verification.

---

### Pitfall 2: Missing `.nojekyll` — GitHub silently drops the entire `_app` directory

**What goes wrong:**
GitHub Pages runs Jekyll by default, and Jekyll **ignores files and folders beginning with an underscore**. SvelteKit emits all hashed JS/CSS into `_app/`. Without `.nojekyll`, Pages serves the HTML but 404s every `_app/*` file — a fully unstyled, non-interactive page that builds and deploys "successfully."

**Why it happens:**
The failure is server-side on GitHub's end; the build and deploy both report success. Nothing local reproduces it.

**How to avoid:**
Place an empty `.nojekyll` file in `static/` (adapter-static copies `static/` verbatim to the output root). If using the official `actions/deploy-pages` flow, confirm the artifact contains `.nojekyll` at its root. Verify the deployed URL loads `_app/` assets with HTTP 200.

**Warning signs:**
Deployed site is unstyled and dead; `_app/immutable/...` returns 404 on production only; view-source shows correct HTML referencing files that don't load.

**Phase to address:** Foundation.

---

### Pitfall 3: Deep-link 404 on refresh / shared URLs (SPA fallback vs. full prerender)

**What goes wrong:**
A visitor refreshes `/blog/some-post` or opens a shared deep link and gets GitHub's generic 404. GitHub Pages has no server to route unknown paths to the app. If a route wasn't prerendered (or a dynamic route exists), Pages can't serve it.

**Why it happens:**
adapter-static prerenders only pages it can crawl from links. Any route not reachable by crawl, or any client-only dynamic route, produces no HTML file. Refreshing that URL asks Pages for a file that doesn't exist.

**How to avoid:**
- This is a **content site** — prerender everything. Set `export const prerender = true` in the root `+layout.ts`, and ensure `<a>` links (not JS-only navigation) connect every page so the crawler finds them. Blog posts must be enumerated via `entries()` or reachable links so each gets its own HTML file.
- Configure the adapter `fallback: '404.html'` as a safety net so unknown/edge paths render the app shell instead of GitHub's raw 404 (GitHub Pages serves `404.html` for missing paths). Even fully prerendered, ship a branded `404.html`.
- Avoid `trailingSlash` surprises: pick a policy and keep asset/link references consistent, or nested-index files won't resolve on Pages.

**Warning signs:**
Home works but refresh on any sub-page 404s; blog posts reachable by clicking but not by direct URL; social-share links to deep pages break.

**Phase to address:** Content & Blog (prerender coverage), Foundation (fallback + 404 page).

---

### Pitfall 4: "Accessible mode is a degraded fallback" anti-pattern

**What goes wrong:**
The team builds the Premium theme first, then bolts on the accessible theme as "Premium minus animations." Result: accessible mode inherits Premium's DOM/semantics, has thinner content, feels second-class, and quietly fails WCAG because the accessible variant was never designed — only subtracted. This directly violates the project's Core Value ("the accessible mode is not a degraded fallback; it is a peer").

**Why it happens:**
Motion-only theming is the easy mental model (`prefers-reduced-motion` → turn things off). But PROJECT.md requires the themes to differ in **contrast, typography, and spacing** — two coherent designs — which cannot emerge from subtraction.

**How to avoid:**
- Design both themes as first-class token sets in the **Design System & Theme** phase, before either is implemented. Model the accessible theme on scope.org.uk semantics/contrast, not on the Premium DOM.
- Keep semantics identical across themes (same landmarks, headings, labels); only tokens and the presence of the 3D layer differ. The 3D hero is *additive* in Premium, never load-bearing for content.
- Author real content once (theme-agnostic markup) and theme it via CSS custom properties, so accessible mode is never "missing" copy.
- Success criterion: accessible mode must pass WCAG 2.2 AA+ **on its own**, evaluated independently — not "good enough because Premium is the real one."

**Warning signs:**
Accessible theme PRs are diffs that only remove animation; a11y work is scheduled *after* Premium is "done"; accessible mode has fewer sections or placeholder copy; contrast tokens are Premium colors "toned down."

**Phase to address:** Design System & Theme (design both up front), Accessible Theme Hardening (independent WCAG pass).

---

### Pitfall 5: Flash of wrong theme + hydration mismatch on persisted theme

**What goes wrong:**
Theme is read in `onMount`/effect, so the statically prerendered HTML ships with the default theme and the user's persisted choice snaps in after hydration — a visible flash. Worse, with adapter-static the prerendered HTML has theme A but the client immediately renders theme B, producing a Svelte **hydration mismatch** (state_hydration warnings, mis-applied classes, occasionally broken interactivity).

**Why it happens:**
Prerendered pages are generated at build time with no knowledge of the visitor's `localStorage`. Any theme decision made during/after hydration is too late — the server HTML is already painted.

**How to avoid:**
- Apply the theme with a tiny **blocking inline script in `app.html`** that runs before first paint, setting a class/`data-theme` on `<html>` from `localStorage` (falling back to `prefers-color-scheme` / `prefers-reduced-motion`). This is the verified standard SvelteKit pattern.
- Drive all theme styling off that root attribute via CSS custom properties, so no component needs JS to render the correct theme. Keep the prerendered DOM theme-neutral (colors come from the root attribute), so there is nothing to mismatch.
- Persist the toggle to `localStorage` on change and update the root attribute directly; never make the initial paint depend on a Svelte lifecycle hook.

**Warning signs:**
Theme "pops" ~100–300ms after load; console shows hydration/`state_hydration_mismatch` warnings; toggling then reloading briefly shows the old theme.

**Phase to address:** Design System & Theme.

---

### Pitfall 6: `prefers-reduced-motion` not actually honored (animation still runs)

**What goes wrong:**
The site claims to respect reduced motion, but Threlte's render loop, GSAP/JS tweens, scroll-driven effects, and autoplaying transitions keep running because `prefers-reduced-motion` was only wired into CSS `@media` blocks — not into the JS animation layer or the 3D loop. Users with vestibular disorders get motion the toggle promised to kill. PROJECT.md marks this "non-negotiable."

**Why it happens:**
Developers assume the CSS media query covers everything. But WebGL frames, `requestAnimationFrame` loops, and JS libraries ignore CSS. Reduced motion must be checked in JS too, and re-checked when the user changes the OS setting live.

**How to avoid:**
- Single source of truth: a reactive `prefersReducedMotion` store fed by `window.matchMedia('(prefers-reduced-motion: reduce)')` **with a change listener**, plus the manual Accessible-theme choice. Both CSS and JS/Threlte read it.
- In reduced-motion state: don't mount the Threlte render loop at all (render a static poster image), disable autoplay, and swap page transitions for instant/opacity-only.
- Provide a global CSS guard as backstop: `@media (prefers-reduced-motion: reduce) { *, ::before, ::after { animation-duration: .01ms !important; transition-duration: .01ms !important; } }`.
- Accessible theme should imply reduced motion regardless of OS setting.

**Warning signs:**
3D hero still spins with OS "reduce motion" on; changing the OS setting requires a reload to take effect; only CSS transitions stop but canvas/scroll effects continue.

**Phase to address:** Accessible Theme Hardening (policy) + Premium 3D Hero (loop honors it).

---

### Pitfall 7: 3D hero is invisible or hostile to assistive tech

**What goes wrong:**
A `<canvas>` is an opaque pixel buffer — screen readers get nothing, keyboard users can get trapped focusing inside interactive WebGL, and the "hero message" conveyed visually in 3D is entirely absent for AT users. If the hero also carries the page's primary heading/CTA inside the canvas, SR users lose the page's point.

**Why it happens:**
3D wow is designed visually; the accessibility layer of the canvas is forgotten. Threlte/Three render to canvas with no inherent semantics.

**How to avoid:**
- Never put content-critical text/CTAs *in* the canvas. The real `<h1>`, tagline, and primary CTA are normal DOM elements layered over/beside the canvas and fully in the accessibility tree.
- Mark the canvas decorative: `aria-hidden="true"` on the canvas/container, `role="presentation"`, and keep it out of the tab order (`tabindex="-1"`, no focusable WebGL controls in the primary flow).
- Provide a meaningful static alternative (poster image with real `alt`, or the DOM hero) that stands alone when the canvas is absent.
- In Accessible theme, the canvas isn't rendered at all — the DOM hero *is* the hero.

**Warning signs:**
Screen reader announces nothing over the hero or reads "canvas"; Tab key disappears into the 3D area; the h1 lives inside the WebGL scene; turning off the canvas leaves an empty hero.

**Phase to address:** Premium 3D Hero, verified in Accessible Theme Hardening.

---

### Pitfall 8: Threlte/Three bundle bloat blocks LCP and first paint

**What goes wrong:**
Three.js (~150KB+ gzipped) plus Threlte gets bundled into the main entry and ships to **every** visitor — including Accessible-theme, mobile, and no-WebGL users who never see 3D. The hero canvas becomes the LCP element and the heavy JS delays interactivity. Lighthouse performance and Core Web Vitals tank on the exact low-power devices this project promises to serve.

**Why it happens:**
Importing Threlte components statically at the top of a route pulls Three into the initial chunk. The constraint in PROJECT.md ("must be lazy-loaded and never block accessible mode or first paint") is easy to state and easy to violate with a single static import.

**How to avoid:**
- **Dynamic import** the entire 3D scene: gate it behind `if (premium && webglSupported && !reducedMotion)` and `await import('./HeroScene.svelte')` (or `{#await}`), so Three never enters the initial chunk.
- Render an instant, lightweight DOM/poster hero first; hydrate 3D lazily (idle/intersection) *after* paint. The LCP element should be the poster/heading, not the canvas.
- Confirm code-splitting in the build output: Three should appear in a **separate chunk** loaded only in Premium. Set a bundle-size budget in Launch Verification.
- Consider `IntersectionObserver`/`requestIdleCallback` so the scene only initializes when the hero is on-screen and the main thread is free.

**Warning signs:**
`_app` initial JS is many hundreds of KB; Three appears in the main chunk; Lighthouse flags large JS / high TBT even in Accessible mode; LCP is the canvas.

**Phase to address:** Premium 3D Hero (lazy architecture), enforced by budget in Launch Verification.

---

### Pitfall 9: WebGL context leaks and jank on route change / low-power meltdown

**What goes wrong:**
Navigating away from the hero doesn't dispose the Three.js renderer, geometries, materials, and textures, nor cancel the `requestAnimationFrame` loop. WebGL contexts leak (browsers cap at ~16 — you get "too many contexts" and a lost hero), memory climbs on SPA navigation, and the render loop keeps burning CPU/GPU/battery on a page the user left. On low-power/mobile, an uncapped devicePixelRatio and heavy scene cause thermal throttling and a stuttering or crashing tab.

**Why it happens:**
SvelteKit client navigation doesn't destroy the whole page; without explicit cleanup the loop and GPU resources persist. Three.js requires manual `.dispose()`; it is not garbage-collected automatically.

**How to avoid:**
- On component teardown (`onDestroy`), cancel the RAF loop, call `renderer.dispose()`, dispose geometries/materials/textures, and drop references. Threlte's lifecycle helps but verify disposal. Pause the loop when the tab is hidden (`visibilitychange`) and when the hero scrolls out of view.
- Clamp `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`, cap frame rate, and keep the scene lean (few draw calls). Provide a low-power path (static poster) for `deviceMemory`/`hardwareConcurrency` below a threshold or when the WebGL context is lost.
- Handle `webglcontextlost` by falling back to the poster rather than showing a frozen canvas.

**Warning signs:**
Memory grows each time you visit/leave the hero; console warns of lost/too-many WebGL contexts after navigating; fans spin / phone heats; FPS degrades the longer the tab is open.

**Phase to address:** Premium 3D Hero.

---

### Pitfall 10: No genuine WebGL / capability fallback

**What goes wrong:**
The Premium hero assumes WebGL exists. On browsers/devices with WebGL disabled, blocklisted GPUs, or hardened privacy configs, the canvas stays blank or throws, leaving a broken empty hero — the exact "broken hero on no-WebGL device" the constraints forbid.

**Why it happens:**
Feature detection is skipped; "every modern browser has WebGL" is assumed. It isn't universally true (enterprise lockdowns, older Android, some privacy browsers, GPU denylists).

**How to avoid:**
- Detect capability before mounting: try to acquire a `webgl2`/`webgl` context; if null, render the DOM/poster hero and never import Three. Combine with the reduced-motion and Premium/Accessible checks into one "should we render 3D?" gate.
- The poster hero must be a complete, attractive hero on its own — treat it as the baseline, with 3D as progressive enhancement.

**Warning signs:**
Blank rectangle where the hero should be on some devices; errors like "Failed to create WebGL context"; hero only tested on the dev's own GPU.

**Phase to address:** Premium 3D Hero.

---

### Pitfall 11: Focus loss, focus traps, and skip-link gaps

**What goes wrong:**
Keyboard/SR users can't navigate: no skip-link to bypass nav, focus lost after theme toggle or route change (dumped to `<body>` top), a focus trap inside a modal/menu or the 3D area, or focus outlines stripped globally (`outline: none`) for aesthetics. These are the most common automated-and-manual WCAG 2.2 failures.

**Why it happens:**
SPA navigation doesn't move focus like a full page load; toggles re-render subtrees and drop focus; designers remove focus rings; menus/dialogs don't manage a focus loop or Escape.

**How to avoid:**
- Add a visible "Skip to main content" link as the first focusable element, targeting `<main id="main">`.
- On client navigation, move focus to the new page's `<h1>`/main and announce it (SvelteKit's `afterNavigate` + a focus target / live region). Never rely on the browser's default.
- Theme toggle must keep focus on the toggle button after switching (don't re-mount the button's ancestor in a way that loses focus).
- Provide `:focus-visible` styles everywhere; never global `outline: none`. Any menu/dialog must trap focus *intentionally*, loop with Tab, and close/return focus on Escape.

**Warning signs:**
Tab from the top doesn't offer "skip"; after clicking a nav link, Tab starts over from the browser chrome; toggling theme drops you to page top; you can Tab "behind" an open menu; focus rings invisible.

**Phase to address:** Accessible Theme Hardening (with skip-link scaffolded in Foundation layout).

---

### Pitfall 12: Theme toggle not announced / not operable by AT

**What goes wrong:**
The toggle is a `<div>` with a click handler (not keyboard-operable), or a real button whose state change isn't announced, so SR users don't know a mode exists, can't activate it, or don't hear that it switched. For a project whose headline feature is the accessible toggle, this is a credibility-defining failure.

**Why it happens:**
Custom-styled toggles get built as divs; state (Premium/Accessible, on/off) isn't exposed via ARIA; no live announcement on change.

**How to avoid:**
- Use a native `<button>` (or a proper switch with `role="switch"` + `aria-checked`), with a clear accessible name ("Switch to accessible theme").
- Announce the change via an `aria-live="polite"` region ("Accessible theme enabled"). Keep focus on the control after toggling.
- Ensure it's reachable in the tab order early (in the header) and works with Enter/Space.

**Warning signs:**
Toggle can't be reached or activated by keyboard; SR announces "clickable" with no name/state; switching modes is silent to AT.

**Phase to address:** Accessible Theme Hardening (toggle spec in Design System & Theme).

---

### Pitfall 13: Contrast regressions and token drift between the two themes

**What goes wrong:**
Because two full themes exist, a color/spacing token gets added or tweaked in Premium but not mirrored in Accessible (or vice versa), silently dropping the Accessible theme below its AA+ contrast floor, or leaving one theme visually broken. Over time the two token sets diverge and every component must be re-checked.

**Why it happens:**
Duplicated theme definitions with no shared contract; contrast checked once at design time, not on change; hardcoded hex values sneak into components bypassing tokens.

**How to avoid:**
- Single token schema, two value sets: define the *same* semantic token names (`--color-text`, `--color-surface`, `--focus-ring`, `--space-*`, `--font-*`) for both themes; components reference only semantic tokens, never raw hex. This prevents structural drift and duplicated components (see Pitfall 14).
- Automate contrast: a check (script/test or CI axe run) that verifies every text/background token pair in the Accessible theme meets AA+ (and re-run on token changes).
- Lint against raw color literals in components.

**Warning signs:**
Components with inline hex; one theme updated in a PR without the other; contrast only spot-checked manually; accessible theme "looks off" after a Premium tweak.

**Phase to address:** Design System & Theme (token contract), enforced in Launch Verification (contrast CI).

---

### Pitfall 14: Duplicated components per theme instead of token-driven single components

**What goes wrong:**
Teams create `HeroPremium.svelte` and `HeroAccessible.svelte`, `CardPremium`/`CardAccessible`, etc. Content and behavior get copy-pasted; a copy fix lands in one and not the other; accessibility improvements made to one variant don't reach the other. Maintenance cost doubles and the themes drift in behavior, not just looks.

**Why it happens:**
It seems simpler to fork a component than to parameterize it. The only *legitimately* forked concern here is the 3D hero (canvas vs. DOM), and that leaks into everything else.

**How to avoid:**
- One component per UI concept, styled entirely by theme tokens/`data-theme`. The **only** conditional split is "render the Threlte canvas layer or not" in the hero — everything else is one component.
- Content lives once (markdown/data), rendered by shared components. Themes change appearance via CSS custom properties, not by swapping component trees.

**Warning signs:**
`*Premium.svelte` / `*Accessible.svelte` pairs beyond the hero; the same copy edited in two files; a11y fix requested "in the other version too."

**Phase to address:** Design System & Theme.

---

### Pitfall 15: Committing credentials / private 501c3-pending source data

**What goes wrong:**
Notion exports, form-backend API keys, org private material, or donation-platform secrets get committed to a public repo. The org is 501(c)(3)-**pending**; leaking private source material or credentials is a legal/reputational hazard and, once pushed, effectively permanent in git history.

**Why it happens:**
Convenience — pasting a Formspree/Notion key into a config file, or dumping a Notion export into the repo to mine copy. Public GitHub repo + no secret scanning discipline.

**How to avoid:**
- No secrets in the repo, ever. Third-party form backends (Formspree/Basin/etc.) use a **public form endpoint ID** that's safe to expose — but confirm anything you paste is the public endpoint, not an admin/API key. Any true secret goes in GitHub Actions **secrets**, never committed.
- Add a `.gitignore` for `.env*`, Notion exports, and source dumps up front; enable GitHub secret scanning / a pre-commit secret check.
- Extract only the public-facing *copy* from private sources into clean markdown/data files; never commit the raw private export.
- Per user's operating contract: keep credentials out of code and commit messages.

**Warning signs:**
`.env` or `*.notion`/export files staged; API keys in `svelte.config`/committed JSON; a Notion export folder in the tree; secret-scanning alert.

**Phase to address:** Foundation (gitignore + scanning), ongoing in Forms & Donate.

---

### Pitfall 16: Static-host form privacy & donation link-out handling

**What goes wrong:**
Contact/volunteer submissions (potentially disclosing disability, personal circumstances) flow through a third-party backend with no privacy notice, no consent, spam-flooded (no honeypot/captcha), or silently failing with no user confirmation. Separately, the Donate link-out opens the payment platform without `rel="noopener"`, or is implemented as an embedded form (implying on-site payment the static host can't secure).

**Why it happens:**
Forms on static hosts *must* use an external service, and privacy/consent/UX get skipped as "not code." Donate links get `target="_blank"` without the security `rel`. Out-of-scope on-site payments creep in via an embedded widget.

**How to avoid:**
- Treat submissions as sensitive: add a short privacy note near the form (what's collected, where it goes, that a third-party processor is used), and collect only what's needed. Choose a form backend with a defensible privacy posture.
- Confirm success/failure to the user (visible message + focus move to it for AT); add spam mitigation (honeypot field / provider spam filter) rather than a captcha that harms accessibility.
- Donate is a **link-out only**: a plain accessible `<a href="{donationUrl}">` (or `target="_blank" rel="noopener noreferrer"` if opening new tab), clearly labeled that it goes to an external platform. No embedded payment form (out of scope: PCI on a static host).
- Keep the donation URL in a config/data file so it's easy to update without hunting through components.

**Warning signs:**
Form with no privacy text; submissions vanish with no confirmation; spam pouring into the org inbox; `target="_blank"` without `rel="noopener"`; any embedded checkout on-site.

**Phase to address:** Forms & Donate.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Static import of Threlte/Three in a route | Simpler code, one import | Three ships to all users incl. Accessible/mobile; kills LCP; violates a hard constraint | Never |
| Hardcoded `/`-absolute internal links | Works on localhost immediately | 404s on Pages sub-path; base-path bugs everywhere | Never — use `base` |
| Fork components per theme (`*Premium`/`*Accessible`) | Fast first draft | Copy drift, doubled a11y maintenance | Only the 3D hero split |
| Theme applied in `onMount` | Quick to write | Flash + hydration mismatch | Never — inline app.html script |
| CSS-only `prefers-reduced-motion` | Covers transitions cheaply | JS/WebGL motion still runs; fails the promise | Never as sole mechanism |
| Skip disposing Three resources | Less cleanup code | Context leaks, memory growth, battery drain | Never |
| Raw hex colors in components | Fast styling | Token drift, contrast regressions | Never — semantic tokens only |
| Pasting Notion export into repo for copy | Convenient content source | Leaks private 501c3-pending data permanently | Never |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| GitHub Pages | No `.nojekyll` → `_app/` dropped | Ship `.nojekyll` in `static/`; verify assets 200 |
| GitHub Pages | Base path unset for project repo | `paths.base` from `BASE_PATH` env in CI |
| adapter-static | Assuming SSR/dynamic routes work | `prerender = true` sitewide; `fallback: '404.html'`; enumerate blog entries |
| Formspree/Basin (forms) | Committing an admin/API key | Use public endpoint ID only; secrets in Actions, never committed |
| Donation platform | Embedded checkout / missing `rel` | Link-out only, `rel="noopener noreferrer"`, labeled external |
| Threlte/Three | Static import + no dispose | Dynamic import behind capability gate; dispose on destroy |
| Custom domain (optional) | Base path + missing CNAME mismatch | If custom domain: `base=''` + `CNAME` in `static/`; pick one model in Foundation |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Three in main chunk | Huge initial JS, high TBT even in Accessible | Dynamic import + separate chunk + budget | Immediately, all low-power/mobile users |
| Canvas as LCP element | Poor LCP, slow "hero appears" | Poster/DOM hero first, 3D hydrates after paint | First load, especially mobile |
| Uncapped devicePixelRatio | Retina/mobile thermal throttle, stutter | Clamp DPR ≤2, cap FPS, lean scene | High-DPI phones/tablets |
| RAF loop never paused | Battery drain, jank on hidden tab | Pause on `visibilitychange` / out-of-view | Long sessions, background tabs |
| Unoptimized hero/blog images | Slow LCP, wasted bandwidth | Responsive sizes, modern formats, lazy below-fold | Content growth / mobile data |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Committing form/API secrets to public repo | Key abuse, spam, cost | Public endpoint IDs only; Actions secrets; secret scanning |
| Committing private Notion/501c3 source | Legal/reputational, permanent in history | `.gitignore` exports; extract only public copy |
| `target="_blank"` without `rel="noopener"` | Reverse-tabnabbing on donate/external links | `rel="noopener noreferrer"` on all external links |
| No form spam mitigation | Inbox flooding, possible abuse of endpoint | Honeypot + provider spam filter (not inaccessible captcha) |
| Sensitive submissions, no privacy notice | Users disclose disability info unknowingly | Privacy note + minimal data collection |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Accessible theme as afterthought | Disabled users get a lesser site (mission failure) | Peer theme designed up front, independent WCAG pass |
| Silent form submit | User unsure if message sent | Visible success/error + focus moved to it |
| Toggle unclear/hidden | Users never discover Accessible mode | Prominent, labeled toggle in header, announced |
| Flash of wrong theme | Jarring, feels broken | Inline pre-paint theme script |
| Broken/blank hero on no-WebGL | Looks broken on first impression | Complete poster/DOM hero baseline |

## "Looks Done But Isn't" Checklist

- [ ] **Deployment:** Test the *built + deployed* Pages URL (not just `localhost`) — assets, deep-link refresh, and 404 page all verified with base path applied.
- [ ] **`.nojekyll`:** Present in output root; `_app/*` returns 200 on production.
- [ ] **Reduced motion:** OS `reduce` toggle *live* stops CSS **and** WebGL/JS motion without reload.
- [ ] **3D hero:** Disable WebGL in the browser — poster hero still complete; SR announces the DOM hero, not "canvas"; Tab doesn't get trapped.
- [ ] **Route-change memory:** Navigate to/from hero 10× — memory flat, no "too many WebGL contexts."
- [ ] **Theme toggle:** Keyboard-operable, announced via live region, focus retained, choice persists across pages and reload with no flash.
- [ ] **Contrast:** Every Accessible-theme text/background token pair passes AA+ (automated).
- [ ] **Blog deep links:** Every post reachable by direct URL and survives refresh (each has its own HTML file).
- [ ] **Forms:** Success/failure announced; privacy note present; spam mitigation active; no secret committed.
- [ ] **Donate:** Link-out only, labeled external, `rel="noopener noreferrer"`, URL in config.
- [ ] **axe + manual SR pass:** Both themes pass automated axe *and* a manual screen-reader + keyboard-only walkthrough.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Base path wrong post-deploy | LOW | Set `BASE_PATH` in CI, replace absolute links with `base`, redeploy |
| Missing `.nojekyll` | LOW | Add file to `static/`, redeploy |
| Deep-link 404s | LOW–MEDIUM | Add `prerender=true`, `fallback:'404.html'`, enumerate blog entries |
| Committed secret/private data | HIGH | Rotate key immediately; purge history (filter-repo/BFG); force-push; assume leaked |
| Accessible theme built as fallback | HIGH | Redesign accessible token set + independent WCAG audit; refactor forked components to token-driven |
| Three in main bundle | MEDIUM | Convert to dynamic import behind capability gate; add bundle budget |
| WebGL leaks | MEDIUM | Add dispose + RAF cancel on destroy; pause on hidden/out-of-view |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Base path breaks assets/links | Foundation | Deployed Pages URL loads all assets + deep links (Launch Verification) |
| Missing `.nojekyll` | Foundation | `_app/*` returns 200 on production |
| Deep-link 404 | Foundation + Content & Blog | Direct-URL + refresh on every route/post |
| Accessible-as-fallback anti-pattern | Design System & Theme + Accessible Hardening | Independent WCAG 2.2 AA+ pass |
| Flash / hydration mismatch on theme | Design System & Theme | No console hydration warnings; no flash on reload |
| Reduced motion not honored | Accessible Hardening + 3D Hero | Live OS toggle stops all motion incl. canvas |
| 3D invisible/hostile to AT | 3D Hero | SR + keyboard walkthrough; canvas `aria-hidden` |
| Three bundle bloat / LCP | 3D Hero | Bundle budget; Three in separate chunk; Lighthouse |
| WebGL leaks / low-power meltdown | 3D Hero | Repeated navigation memory test; DPR clamp; low-power poster |
| No WebGL fallback | 3D Hero | WebGL-disabled browser shows complete poster hero |
| Focus loss / traps / skip link | Foundation (layout) + Accessible Hardening | Keyboard-only navigation audit |
| Toggle not announced/operable | Design System & Theme + Accessible Hardening | SR announces name/state; keyboard operable |
| Contrast / token drift | Design System & Theme | Automated contrast check in CI |
| Duplicated per-theme components | Design System & Theme | Only hero forks; component inventory review |
| Committed credentials/private data | Foundation (ongoing) | `.gitignore` + secret scanning; history clean |
| Form privacy / donate link-out | Forms & Donate | Privacy note, confirmation, `rel="noopener"`, no embedded checkout |

## Sources

- SvelteKit adapter-static docs — prerender, `fallback`, base path (https://svelte.dev/docs/kit/adapter-static) — HIGH
- kit issue #4528 (base path 404) and discussion #11554 (base-prefixed links) — HIGH
- Jekyll underscore-directory behavior / `.nojekyll` requirement for GitHub Pages — HIGH
- Captain Codeman, "Implementing Dark Mode in SvelteKit" (inline app.html pre-paint script; onMount pitfall) — HIGH
- Svelte hydration-mismatch issues #11509 / kit #12209; runtime warnings docs — HIGH
- WCAG 2.2 AA success criteria (focus, contrast, keyboard, reduced motion); scope.org.uk as benchmark (PROJECT.md) — HIGH
- Three.js disposal / WebGL context limits — established practice — MEDIUM-HIGH
- PROJECT.md constraints (lazy 3D, dual-theme peer, 501c3-pending, forms/donate scope) — HIGH

---
*Pitfalls research for: SvelteKit static a11y dual-theme + Threlte nonprofit site*
*Researched: 2026-07-04*
