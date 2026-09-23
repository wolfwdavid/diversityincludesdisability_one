# Paused 2026-09-23 — Eman media intake

## Publish status (2026-09-23, end of session)
- Owner asked to push. The assistant's `git push` was blocked by its permission classifier, so the owner runs it:
  ```
  cd Websites/Eman/diversityincludesdisability_one
  git push origin main
  ```
- That push triggers `.github/workflows/deploy.yml` → GitHub Pages. Watch it with `gh run watch`, then check
  https://wolfwdavid.github.io/diversityincludesdisability_one/about/ — the portrait sits under the founder heading, the two clips under "Watch".
- If the deploy step fails with an empty "Deployment failed, try again later", re-assert Pages then re-run:
  `gh api -X PUT repos/wolfwdavid/diversityincludesdisability_one/pages -f build_type=workflow` and
  `gh workflow run "Deploy to GitHub Pages" --ref main`.
- Commits waiting to go out: c295ba6 (media intake) and 0063bff (About page wiring).


## What was done this session
- Created `content/media/eman/` with `originals/` (untouched sources) and `web/` (ffmpeg derivatives).
- Imported 1 runway photo (screenshot) and 2 phone videos; see `content/media/eman/MANIFEST.md` for names, sizes, and caveats.
- Committed locally on `main`. **Not pushed**: the repo publishes to GitHub Pages and the photo is of a real person; push only after Eman OKs it.

## Update, same day: wired into the About page
- Photo cropped (border + "18/20" badge removed → 985×943) and written as `static/about/eman-runway.{avif,webp,jpg}`; clips copied to `static/about/eman-clip-{1,2}.mp4`.
- `src/routes/about/+page.svelte`: `<figure>` portrait under the founder heading (draft alt text, flagged in a comment) + a new "Watch" section with two `<video controls preload="metadata">` elements and MP4 download fallbacks.
- Verified: svelte-check (only the pre-existing `@types/node` error), `BASE_PATH=/diversityincludesdisability_one npm run build`, preview on private port 4191 → `/about/` 200, all 5 assets 200 with correct MIME types, screenshot reviewed in Premium theme.
- Build gotcha on Windows Git Bash: set `MSYS_NO_PATHCONV=1` or the BASE_PATH gets rewritten to a Windows path and svelte.config.js rejects it.
- STILL NOT PUSHED. Still open before publishing: Eman's consent + photographer credit, alt-text sign-off, captions/transcripts for both clips (WCAG 1.2.2 — Phase 6 axe run will not catch missing captions, review by hand), and higher-res video if it exists.

## State of the repo otherwise
- Unchanged since 2026-07-11 (`docs: add Windows-to-Mac machine-move handoff for Phase 6 resume`).
- Phases 1–5 complete and live; Phase 6 (Accessible Hardening & WCAG launch verify) planned, 2 plans / 2 waves, not executed. See `MAC-HANDOFF.md` and `STATE.md`.

## To resume
1. `cd Websites/Eman/diversityincludesdisability_one` (run GSD from here, not from `Websites/Rimawi/`).
2. Read `content/media/eman/MANIFEST.md`, then decide placement (About portrait vs Media section).
3. Get Eman's answers: publish consent, photographer credit, higher-res originals, alt text.
4. Crop the runway screenshot (drop the dark border and the "18/20" badge), regenerate the webp, and copy chosen `web/` files into `static/` when wiring them into a route.
5. Either fold the media wiring into Phase 6 or add a small phase via `/gsd:add-phase`, then `/gsd:execute-phase`.
6. Push once Eman has signed off.
