# Paused 2026-09-23 — Eman media intake

## What was done this session
- Created `content/media/eman/` with `originals/` (untouched sources) and `web/` (ffmpeg derivatives).
- Imported 1 runway photo (screenshot) and 2 phone videos; see `content/media/eman/MANIFEST.md` for names, sizes, and caveats.
- Committed locally on `main`. **Not pushed**: the repo publishes to GitHub Pages and the photo is of a real person; push only after Eman OKs it.

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
