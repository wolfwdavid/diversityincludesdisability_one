---
phase: 06-accessible-hardening-launch-verification
plan: 02
status: complete (automation); human live-URL checkpoint (Task 3) NOT run — see "Left for a human"
commit: 764cc0b
requirements: [A11Y-06]
---

# 06-02 Summary — accessibility statement, branded 404, launch verification

## What shipped

- `src/routes/accessibility/+page.svelte` — prerendered statement (single H1, five H2 sections): **Conformance target** (WCAG 2.2 level AA, both themes, Accessible is the target), **How we test** (axe-core on every page in both themes before each release; automated keyboard checks; a manual keyboard + screen-reader walk-through before each release), **Two themes**, **Known issues** (the two runway clips on `/creative/` have no captions/transcript yet — WCAG 1.2.2; Creative photo alt text is a draft pending the founder's sign-off; otherwise no AA failures in the latest automated checks), **Get help or report a problem** (`mailto:diversityincludesdisability@gmail.com`). Dated 25 September 2026. Plain, short copy; no claims beyond what was run.
- `Footer.svelte` — "Accessibility statement" link (`{base}/accessibility`) on every page. NOT added to `nav.ts`; primary nav stays at 8 items (`shell.spec.ts` still green).
- `e2e/accessibility-statement.a11y.spec.ts` — asserts H1, the four required H2s, "WCAG" / "2.2" / "level AA", the mailto link, the captions known-issue, the footer link on `/`, `/about/`, `/contact/`, and that the link is absent from the primary nav.
- `/accessibility/` added to the axe and capability route sets; the branded 404 is axe-scanned in both themes too.
- `src/routes/+error.svelte` — logo image now decorative (`alt=""`, the H1 carries the name), status in `<strong>`, clearer 404 vs generic copy, and `<nav aria-label="Error page">` with Home / About & Mission / Contact links (44px targets). Still exactly one H1; landmarks inherited from the layout.
- `scripts/verify-deploy.sh` — `/accessibility/` must return HTML, its prerendered body must contain "Accessibility statement", and its own `_app` asset must return 200. `set -euo pipefail` and the final `ALL DEPLOY CHECKS PASSED` kept.
- `tests/deploy.smoke.spec.ts` — new `DEPLOY: /accessibility/ deep-link resolves`; the existing 404 test additionally expects the "Error page" nav's "Return home" link.
- `LAUNCH-CHECKLIST.md` — root-domain URLs (`https://www.diversityincludesdisability.org`), local gates, deployed-URL checks with exact commands/expected output, and the human-only checks.

## Test results (local)

| Command | Result |
|---|---|
| `npm run test:a11y -- --workers=1` (root build, preview :4197) | 29 passed |
| Existing e2e (theme/shell/content/forms/blog/premium specs) against preview :4197 | 45 passed |
| `BASE_URL=http://localhost:4197 npm run smoke` | 5 passed |
| `BASE_URL=http://localhost:4197 npm run verify:deploy` | ALL DEPLOY CHECKS PASSED |
| Sub-path harness (`BASE_PATH=/diversityincludesdisability_one` build + preview :4198): `blog.base.spec.ts` + `npm run smoke` | 1 + 5 passed |
| `npm run check` | 1 pre-existing error (`@types/node` in `tests/deploy.smoke.spec.ts`), 5 pre-existing warnings, nothing new |
| `npm run build` (root) | passes |

## Deviations from the plan

- Live URL / base path are the custom-domain ROOT, not `/diversityincludesdisability_one`; the checklist and harness are root-based (the sub-path harness was still exercised once on a private port to prove the 404 + deep links under a base path).
- Help contact is `diversityincludesdisability@gmail.com` (the plan's `emanrimawi@gmail.com` is stale).
- The plan's "Known issues" placeholder ("no known failures") was replaced by the real open items (uncaptioned clips, alt text pending sign-off) plus the honest "no AA failures in the latest automated checks" line. The statement says checks run "before each release" rather than "in CI": `deploy.yml` does not run `test:a11y`.
- `npm run test:base` was not run through its own config (it pins port 4174, which sibling projects squat, and uses the managed webServer that hangs on Windows); the same spec was run against a self-managed sub-path preview on 4198 instead.
- Not run against the live site: nothing was pushed (per instructions).

## Left for a human (Task 3 checkpoint, not executed)

1. Push `main`; wait for the "Deploy to GitHub Pages" run to finish green.
2. `BASE_URL=https://www.diversityincludesdisability.org npm run verify:deploy` → `ALL DEPLOY CHECKS PASSED`.
3. `BASE_URL=https://www.diversityincludesdisability.org npm run smoke` → 5 passed.
4. In a browser: footer "Accessibility statement" link opens `/accessibility/` with conformance target, known issues and a working mailto; `https://www.diversityincludesdisability.org/nope/` shows OUR branded 404 (org name, "Return home / About & Mission / Contact"), not GitHub's; hard-reload on `/accessibility/` still resolves.
5. Walk `LAUNCH-CHECKLIST.md` sections B and C and tick each item.
6. When captions/transcripts or the alt-text sign-off land, update the statement's Known issues list and its date.
