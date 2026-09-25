---
phase: 06-accessible-hardening-launch-verification
plan: 01
status: complete (automation); human checkpoint (Task 3) NOT run — see "Left for a human"
commit: f5f7f54
requirements: [A11Y-01]
---

# 06-01 Summary — axe WCAG 2.2 AA gate + capability proofs

## What shipped

- `@axe-core/playwright@4.13.0` + `axe-core@4.13.0` as devDependencies (current release; the plan's 4.12.1 pin predates it).
- `playwright.a11y.config.ts` — `testMatch **/*.a11y.spec.ts`, private port **4197** (`PLAYWRIGHT_A11Y_PORT` overrides), `reuseExistingServer: true` so it attaches to a self-managed preview (Playwright's managed webServer hangs at teardown on Windows). Header comment documents the local flow and the restart-after-rebuild rule.
- `npm run test:a11y` script.
- `e2e/a11y-axe.a11y.spec.ts` — AxeBuilder with tags `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa`, both themes seeded via `localStorage 'did:theme'`, on `/`, `/about/`, `/creative/`, `/programs/`, `/get-involved/`, `/events/`, `/blog/`, `/blog/welcome/`, `/blog/our-accessibility-commitment/`, `/contact/` (plus `/accessibility/` and the branded 404 added by 06-02). No `.exclude(`, no disabled rules anywhere. Each scan is preceded by a hydration guard: zero 4xx responses, zero page errors, and the theme toggle's `aria-pressed` must reflect the seeded theme (the prerendered HTML is scannable even when the JS bundle 404s, which would make a green scan meaningless for client-rendered parts).
- `e2e/a11y-capability.a11y.spec.ts` — Accessible theme: zero `<canvas>` and zero poster on every route; `--motion-duration` resolves to `0s`. Premium + `reducedMotion: 'reduce'`: poster visible, zero canvas, no `@threlte` / `THREE.WebGLRenderer` in any downloaded JS.

## Site fix driven by the gate

- **Real violation found and fixed at the root**: `color-contrast` on `/blog/welcome/` in BOTH themes — Shiki's `github-dark` comment colour `#6a737d` on `#24292e` is 3.04:1 (WCAG 1.4.3 needs 4.5:1). `svelte.config.js` now uses `github-dark-high-contrast`, whose every token foreground clears 4.5:1 on its block background (checked programmatically against the theme's token table; the one dark foreground it defines carries its own light background). `npm run test:no-shiki` still passes (highlighting stays build-time).

## Test results (local, root build on preview port 4197)

| Command | Result |
|---|---|
| `npm run test:a11y -- --workers=1` (after 06-02) | **29 passed** (22 axe page×theme + 2 axe 404×theme + 3 capability + 2 statement) |
| `npm run test:unit` | 3 files / 9 tests passed |
| `npm run test:no-three` / `test:no-shiki` / `test:no-secret` | all OK |
| `npm run build` (BASE_PATH unset) | passes, root layout, `.nojekyll` + `404.html` + `CNAME` present |
| `npm run check` | 1 error, 5 warnings — ALL pre-existing (`tests/deploy.smoke.spec.ts` `process` needs `@types/node`; Svelte warnings in premium scene files and `+page.svelte`). No new diagnostics. |

## Deviations from the plan

- Route set is 10 (not 7): `/creative/` exists now, and both blog posts are scanned so the mdsvex/Shiki path is covered (that is what caught the contrast defect).
- Port 4197 instead of 4175 (squatted by a sibling project); `reuseExistingServer` is unconditional (Windows teardown hang).
- axe 4.13.0 instead of the 4.12.1 pin.
- Gotcha recorded: `vite preview` caches its file list at startup, so after a rebuild the old preview serves new HTML whose hashed chunks 404 — always restart the preview after `npm run build`. The hydration guard in the axe spec fails loudly in exactly this case.

## Left for a human (Task 3 checkpoint, not executed)

Run against a local build+preview (both themes, toggle via the theme button):

1. Keyboard: Tab from the top — first stop is "Skip to main content", Enter moves focus into `<main>`; every link/button/field and the theme toggle is reachable with a visible focus ring; at phone width the Menu button opens with Enter/Space, Escape closes it and returns focus to the button; no keyboard trap (Contact form, Creative video controls included).
2. Screen reader (NVDA or VoiceOver), Accessible theme, on Home / About / Programs / Contact: one H1 per page and a sensible heading outline (H key); banner / navigation / main / contentinfo landmarks announced; theme toggle announces pressed state and "… theme enabled"; each Contact field's label is announced and a submit error is announced.
3. Screen reader, Premium theme, Home: the 3D canvas is NOT announced; H1, lede and CTAs read normally.
4. Record any finding as page + element + expected vs actual.
