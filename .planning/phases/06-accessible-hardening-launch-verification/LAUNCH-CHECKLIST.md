# Launch checklist — deployed-URL verification

Live URL: **https://www.diversityincludesdisability.org** (custom domain at the site ROOT — `static/CNAME`, `deploy.yml` builds with `BASE_PATH=''`). There is no `/diversityincludesdisability_one/` sub-path any more; `_app` assets live directly under `/_app/`.

Run the local gates first (section A), push, wait for the "Deploy to GitHub Pages" Actions run to go green, then walk section B against the live site. Every item has the exact command and the expected result. Tick each one only when it actually passed.

## A. Local gates (before pushing)

All of these run against a local production build. On Windows, do NOT rely on Playwright's managed `webServer` (it hangs at teardown); build, start a preview on the private port yourself, and restart that preview after every rebuild (it caches the file list at startup and would otherwise 404 the new hashed chunks).

```bash
MSYS_NO_PATHCONV=1 npm run build          # BASE_PATH unset = root build, like deploy.yml
npx vite preview --port 4197 --strictPort  # in a second terminal; leave it running
```

- [ ] **Build succeeds at the root base path** — `npm run build` exits 0, `build/CNAME` exists, `build/404.html` exists, and there is NO `build/diversityincludesdisability_one/` directory.
- [ ] **`.nojekyll` present** — `ls -a build/.nojekyll` (adapter-static writes it; the official Pages Actions path does not run Jekyll anyway).
- [ ] **Unit tests** — `npm run test:unit` → all Vitest files pass.
- [ ] **Type check** — `npm run check` → 0 NEW errors. (Known pre-existing: 1 error in `tests/deploy.smoke.spec.ts` about `process` needing `@types/node`, plus 5 Svelte warnings in the premium scene / home page.)
- [ ] **Bundle guards** — `npm run test:no-three && npm run test:no-shiki && npm run test:no-secret` → all three print OK (WebGL-free home bundle, no Shiki at runtime, no committed form key).
- [ ] **Accessibility gate** — `npm run test:a11y -- --workers=1` (with the 4197 preview running) → all tests pass: axe WCAG 2.2 AA (tags wcag2a/wcag2aa/wcag21a/wcag21aa/wcag22aa) on every route in both themes, the branded 404 in both themes, the capability proofs (zero canvas / zero poster / 0 motion token in Accessible; poster + no three chunk in Premium under reduced motion), and the statement/footer-link checks.
- [ ] **Shell / theme / content e2e** — `npm run test:theme` (or the same specs pointed at the 4197 preview) → all pass, including the 8-item primary nav assertion and the heading-order check.
- [ ] **Smoke + deploy script against the local preview** — `BASE_URL=http://localhost:4197 npm run smoke` and `BASE_URL=http://localhost:4197 npm run verify:deploy` → 5 smoke tests pass, script prints `ALL DEPLOY CHECKS PASSED`.

## B. Deployed build (after the Actions deploy is green)

- [ ] **Root is live and HTML** — `curl -sI https://www.diversityincludesdisability.org/ | grep -i content-type` → `content-type: text/html`.
- [ ] **Correct base path** — `curl -s https://www.diversityincludesdisability.org/ | grep -oE '/_app/immutable/[^"]+' | head -3` → paths start with `/_app/` (NOT `/diversityincludesdisability_one/_app/`).
- [ ] **`_app` assets return 200** — take one path from the previous step: `curl -sI "https://www.diversityincludesdisability.org<path>"` → `HTTP/2 200`.
- [ ] **Deep links resolve on a hard load** — `curl -sI https://www.diversityincludesdisability.org/about/` and `curl -sI https://www.diversityincludesdisability.org/accessibility/` → both 200 with `content-type: text/html`.
- [ ] **Accessibility statement content is prerendered** — `curl -s https://www.diversityincludesdisability.org/accessibility/ | grep -c 'Accessibility statement'` → at least 1.
- [ ] **Branded 404 renders** — in a browser open `https://www.diversityincludesdisability.org/nope/`: you see the org name, "404", the explanation, and the "Return home / About & Mission / Contact" links inside our header and footer — NOT GitHub's raw 404 page. (`curl -s .../nope/ | grep -c __sveltekit` → 1 proves the fallback is our shell.)
- [ ] **Automated deployed-URL harness** — `BASE_URL=https://www.diversityincludesdisability.org npm run verify:deploy` → `ALL DEPLOY CHECKS PASSED`.
- [ ] **Automated deployed smoke** — `BASE_URL=https://www.diversityincludesdisability.org npm run smoke` → 5 passed (root HTML, no 4xx + `_app` asset, `/about/` deep link, `/accessibility/` deep link, branded 404 with its "Error page" nav).
- [ ] **Footer link works live** — from the home page, the footer "Accessibility statement" link opens `/accessibility/`; the page shows Conformance target, How we test, Two themes, Known issues, and a working `mailto:diversityincludesdisability@gmail.com` link. Hard-reload on `/accessibility/` still resolves.
- [ ] **Theme toggle live** — switch themes on the live site; the choice survives a reload; in Premium on a capable desktop the home hero animates, and with OS reduced-motion on it shows the still poster instead.

## C. Human-only checks (automation cannot do these)

- [ ] **Keyboard, both themes** — Tab from the top: first stop is "Skip to main content" and Enter moves focus into the page; every link, button, form field and the theme toggle is reachable with a visible focus ring; on a phone-width window the Menu button opens with Enter/Space, Escape closes it and returns focus; no keyboard trap anywhere (including the Contact form and the Creative page's video controls).
- [ ] **Screen reader, Accessible theme** (NVDA on Windows or VoiceOver on macOS) — on Home, About, Programs, Contact: navigate by headings (one H1 per page, sensible outline) and by landmarks (banner, navigation, main, contentinfo); the theme toggle announces its pressed state and "… theme enabled"; each Contact field's label is announced and a submit error is announced.
- [ ] **Screen reader, Premium theme, Home** — the 3D canvas is NOT announced (decorative); H1, lede and CTAs read normally.
- [ ] **Creative page media** — the runway photo alt text is signed off by Eman, and captions/transcripts for the two clips are scheduled (the statement's Known issues list must be updated when either lands).
