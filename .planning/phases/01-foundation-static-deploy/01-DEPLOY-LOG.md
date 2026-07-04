# 01 — Deploy & Live-Verify Log (DEPLOY-01..04)

**Live URL:** https://wolfwdavid.github.io/diversityincludesdisability_one/
**Verified:** 2026-07-04
**Verified with:** curl matrix (`scripts/verify-deploy.sh`) + Playwright/Chromium smoke (`tests/deploy.smoke.spec.ts`, chromium installed locally) + a Chromium `innerText` dump of the client-rendered 404.

## GitHub Actions — Deploy runs

| Run | Trigger (sha) | Conclusion | URL |
|-----|---------------|-----------|-----|
| 28720512888 | first deploy after Pages Source set to "GitHub Actions" (`c3e5106`) | success | https://github.com/wolfwdavid/diversityincludesdisability_one/actions/runs/28720512888 |
| **28721178698** | **redeploy — branded `+error.svelte` + harness fixes (`4391d4f`)** | **success** | **https://github.com/wolfwdavid/diversityincludesdisability_one/actions/runs/28721178698** |

Run **28721178698** is the run of record for this log (it contains the branded 404). Pages served the new build (asset hash flipped `start.DPDLWy6y.js` → `start.CTjrlf59.js`, confirming the redeploy propagated). A push to `main` re-triggering this workflow is DEPLOY-01, demonstrated twice above.

## Curl matrix — verbatim output

```
$ BASE_URL="https://wolfwdavid.github.io/diversityincludesdisability_one" bash scripts/verify-deploy.sh
Verifying https://wolfwdavid.github.io/diversityincludesdisability_one
ALL DEPLOY CHECKS PASSED
verify_exit=0
```

Status-code matrix (independent confirmation):

```
root   /            -> 200
about  /about/      -> 200
404    /nope-xyz/   -> 404 (SPA fallback shell — 404.html served with a 404 status, correct)
asset  /diversityincludesdisability_one/_app/immutable/entry/start.CTjrlf59.js -> 200
```

Root / About prerendered branding (from `curl`, no JS):

```
$ curl -s <root>/  | grep title/h1  ->  <title>Diversity Includes Disability</title> · <h1>Diversity Includes Disability</h1>
$ curl -s <base>/about/ | grep title/h1 -> <title>About — Diversity Includes Disability</title> · <h1>About</h1>
```

## Playwright smoke — verbatim output

```
$ BASE_URL="https://wolfwdavid.github.io/diversityincludesdisability_one" npm run smoke
Running 4 tests using 1 worker
  ✓  1 tests\deploy.smoke.spec.ts:9:1 › DEPLOY-01: root serves the built HTML (378ms)
  ✓  2 tests\deploy.smoke.spec.ts:15:1 › DEPLOY-02/04: no request 4xxs and an _app asset loads (700ms)
  ✓  3 tests\deploy.smoke.spec.ts:24:1 › DEPLOY-03: deep-link /about/ resolves on a hard load (210ms)
  ✓  4 tests\deploy.smoke.spec.ts:30:1 › DEPLOY-03: unknown path serves our branded 404 fallback (361ms)
  4 passed (2.8s)
```

Chromium `innerText` dump of the client-rendered 404 (the branded body that `curl` cannot see, because the fallback is a JS-hydrated SPA shell):

```
HTTP status of fallback 404.html: 404
rendered <title>: Page not found — Diversity Includes Disability
rendered <h1>  : Diversity Includes Disability
rendered body  : Diversity Includes Disability | 404: Not Found | The page you were looking for could not be found. | Return home
```

This is OUR branded page rendered by the client router — not SvelteKit's bare default "404 Not Found", and not GitHub's raw "There isn't a GitHub Pages site here" chrome.

## DEPLOY-01..04 — requirement → evidence

| Req | Requirement | Evidence | Verdict |
|-----|-------------|----------|---------|
| **DEPLOY-01** | Push to `main` triggers a CI workflow that rebuilds + redeploys | Two green "Deploy to GitHub Pages" runs on two separate `main` pushes (28720512888 @ c3e5106, 28721178698 @ 4391d4f), both `conclusion: success` | ✅ PASS |
| **DEPLOY-02** | Live sub-path loads the skeleton with styles/JS, no broken assets | root → 200 `text/html`; `_app/immutable/entry/start.CTjrlf59.js` → 200 `application/javascript`; Playwright "no request 4xxs" assertion green (networkidle) | ✅ PASS |
| **DEPLOY-03** | Deep links resolve; unknown paths render OUR branded 404 | `/about/` hard-load → 200 + `<h1>About</h1>` (curl + Playwright); unknown path → 404.html SPA fallback that client-renders our branded page (`<h1>Diversity Includes Disability</h1>`, "404: Not Found", "Return home"); Playwright branded-404 assertion green | ✅ PASS |
| **DEPLOY-04** | `_app/` assets served in production (`.nojekyll` + base path), not dropped by Jekyll | `_app/immutable` asset re-fetched → 200; base-prefixed `/diversityincludesdisability_one/_app/...` URLs present in root, about, and the 404 shell; `static/.nojekyll` shipped in 01-01 | ✅ PASS |

## Notes / harness corrections made during verification

Two harness bugs (scaffolded but never run in 01-02) surfaced when first run live and were fixed (see 01-03-SUMMARY.md "Deviations"):

1. **`playwright.config.ts` / `deploy.smoke.spec.ts` — sub-path baseURL bug.** A leading-slash `page.goto('/')` against a sub-path `baseURL` (no trailing slash) resolved to the origin root `https://wolfwdavid.github.io/`, hitting GitHub's raw 404. Fixed by normalizing `baseURL` to a trailing slash and using relative goto paths. This produced the false "There isn't a GitHub Pages site here" body on the first live run.
2. **`scripts/verify-deploy.sh` — over-assertion on the JS-hydrated fallback.** The 404 check grepped the *static* fallback HTML for client-rendered branding text that only appears after JS hydration. Fixed to assert the fallback serves OUR app shell wired to the correct base path (`__sveltekit` base config + `/diversityincludesdisability_one/_app` preloads); the client-rendered branded body is asserted by Playwright.

Also added `src/routes/+error.svelte` (a minimal org-branded error boundary) so the unmatched-path fallback renders our name rather than SvelteKit's bare default — the "branded" half of DEPLOY-03. Phase 6 (`06-02`) later refines this into the final accessibility-hardened 404.
