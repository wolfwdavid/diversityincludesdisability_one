# DID Website (_one) — Machine-Move Handoff (Windows → Mac)

**Written:** 2026-07-11 (before switching from the Windows box to a Mac)
**Repo:** `diversityincludesdisability_one` — github.com/wolfwdavid/diversityincludesdisability_one
**Live:** https://wolfwdavid.github.io/diversityincludesdisability_one/

This doc lives **inside the repo** so it survives the machine move via `git`. If you're reading it on the Mac, everything below is current as of the last push (`9f2ef29`).

---

## TL;DR — where things stand

- **Phases 1–5: COMPLETE, verified, and LIVE.** Dual-theme (Accessible + Premium 3D "Living Constellation" hero) SvelteKit site on GitHub Pages.
- **Phase 6 (Accessible Hardening & Launch Verification): PLANNED, not yet executed.** 2 plans, 2 waves, checker-clean. This is the **last phase**.
- Everything is committed **and pushed** to `origin/main`. Nothing is stranded on the Windows machine.

## The one command to resume (on the Mac)

```
/clear
```
then, **from inside the repo directory** (see path note below):
```
/gsd:execute-phase 6
```

⚠️ **Phase 6 is NOT fully autonomous.** Both waves stop at human checkpoints only you can clear:
- **Wave 1 (06-01):** after the automated axe WCAG 2.2 AA scan passes, it pauses for a **manual screen-reader + keyboard walkthrough** across both themes.
- **Wave 2 (06-02):** after building the `/accessibility/` statement page + hardened 404, it pauses for **live deployed-URL sign-off**.

On Mac, VoiceOver (Cmd+F5) is the built-in screen reader for the Wave 1 checkpoint.

---

## Mac setup checklist (first time on the new machine)

1. **Clone (or pull) the repo:**
   ```
   git clone https://github.com/wolfwdavid/diversityincludesdisability_one.git
   cd diversityincludesdisability_one
   ```
2. **Reinstall dependencies** (node_modules does NOT transfer and is gitignored):
   ```
   npm install
   ```
3. **Sanity-check the build:**
   ```
   npm run build      # must exit 0
   npm run check      # svelte-check — one KNOWN non-blocker: @types/node/process error in tests/deploy.smoke.spec.ts (see .planning deferred-items)
   ```
4. **Confirm git identity + auth** for pushes (GitHub login is `wolfwdavid`, NOT the HF `WolfDavid`). Use a PAT or `gh auth login`.

## Path note

- Windows path was: `C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\diversityincludesdisability_one`
- On Mac it'll be wherever you clone it (e.g. `~/Websites/diversityincludesdisability_one`). **Always run GSD commands from inside this repo dir** — NOT from a parent "Rimawi" folder (that's a grant-tracker workspace with no `.planning`; running GSD there scaffolds/errors against the wrong project — this bit us twice on Windows).

## Mac-specific gotchas (vs the Windows notes in memory)

- **Playwright `webServer` teardown hang was a WINDOWS-only bug** (a passing 308ms test reported "1 passed (32.1m)"). On macOS the managed `webServer` config generally works — you can likely drop the Windows workaround of self-managed `vite preview` on a private port. If E2E still hangs at teardown, fall back to the private-port pattern documented in `04-02-SUMMARY.md`.
- **Sibling port squatting still applies:** other `diversityincludesdisability_*` repos share Playwright preview ports 4173/4174 with `reuseExistingServer:!CI`. If a sibling `npm run dev/preview` is open, it can cause false E2E pass/fail. Phase 6's a11y config uses port **4175** to reduce collisions; still, close sibling preview servers before running.
- **Line endings:** repo files were authored on Windows (some CRLF). Set `git config core.autocrlf input` on the Mac so you don't get spurious whole-file diffs.
- **GitHub Pages deploy quirk (platform-independent, will recur on Mac):** `actions/deploy-pages@v4` sometimes fails with an empty "Deployment failed, try again later" even when the build passes. Fix that worked repeatedly:
  ```
  gh api -X PUT repos/wolfwdavid/diversityincludesdisability_one/pages -f build_type=workflow
  gh workflow run "Deploy to GitHub Pages" --ref main
  ```
  Manual lever if CLI fails: repo Settings → Pages → Source = GitHub Actions.

---

## Outstanding USER TODOs (not code — need you / Eman)

These gate a real public "launch" but do NOT block Phase 6's accessibility verification:

1. **Web3Forms access key** — generate at web3forms.com using `emanrimawi@gmail.com`; the key is **emailed to that inbox** (needs Eman's inbox access). Swap the placeholder in `src/lib/config.ts` (`WEB3FORMS_ACCESS_KEY`). There's a guard test `npm run test:no-secret` that fails if a real UUID-shaped key is committed — keep the key in env/local, not committed.
2. **Donate URL** — currently a placeholder in `src/lib/config.ts` (`DONATE_URL`/`DONATE_PLATFORM_NAME`); fiscal-sponsor-gated, decide later.
3. **Domain cutover decision** — still on the `wolfwdavid.github.io/...` sub-path.

## What Phase 6 will deliver (so you know what "done" looks like)

- **06-01 (req A11Y-01):** `@axe-core/playwright` WCAG 2.2 AA scan, 7 routes × both themes (`wcag22aa` tags, zero violations), reduced-motion + zero-WebGL capability checks, fix any findings.
- **06-02 (req A11Y-06):** Scope-style `/accessibility/` statement page (conformance target, test cadence, honest known-issues list, mailto help contact), footer-linked (NOT primary nav — `shell.spec` asserts exactly 7 nav items), hardened branded 404, extended deployed-URL harness + `LAUNCH-CHECKLIST.md`.

After Phase 6 verifies + deploys clean, the v1 milestone is complete → consider `/gsd:complete-milestone`.
