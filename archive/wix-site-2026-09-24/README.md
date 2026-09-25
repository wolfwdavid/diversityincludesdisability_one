# Archive of the old Wix site (captured 2026-09-24)

Snapshot of https://www.diversityincludesdisability.org/ as served by Wix on the day the
domain was moved to this GitHub Pages site. Kept so nothing from the Wix era is lost if it is
needed again. Nothing here is wired into the live site.

## What is in this folder (small files, committed)

| Path | Contents |
|---|---|
| `pages-text/*.md` | Readable text of every public page (headings, paragraphs, links, image descriptions). Start here. |
| `pages-html/*.html` | Raw server-rendered HTML of each page, exactly as Wix served it (large, JS-heavy, for reference only). |
| `data/media-manager-files.tsv` | Manifest of all 121 files in the Wix Media Manager: id, size in bytes, type, original file name, (URL for non-images). |
| `data/media-referenced-by-pages.json` | The 63 media ids the public pages actually used. |
| `data/bookings-services.json` | The 5 Wix Bookings services (name, type, price, duration, location, page slugs). |
| `data/donation-campaigns.json` | The one Wix Donations campaign definition (amounts, frequencies). |
| `data/download_media.py` | Script that fetched the media from `static.wixstatic.com` using the manifest. |

Pages captured: home, about, about-1, services, service-page, book-online, events,
projects-6, copy-of-art-writing-performing-oh-my, fullscreen-page, thank-you-page,
donation-thank-you-page. Member-only and checkout pages (account-settings, my-bookings,
cart, checkout, booking-form, popups) were empty shells and were not kept.

Wix Events was not installed; the Events page was a hand-written list, so its content is in
`pages-text/events.md`.

## Media (large files, in a GitHub Release)

The originals are too large for the Pages repo (every deploy would re-download them), so they
are attached to the release **`wix-archive-2026-09-24`** on
https://github.com/wolfwdavid/diversityincludesdisability_one/releases :

| Asset | Contents |
|---|---|
| `wix-media-originals.zip` (~320 MB) | All 121 Media Manager files at original resolution, named `<original name>__<id>.<ext>`, plus the manifest. Includes the 17 ODERA editorial shots, the runway/fashion sets, event flyers, presentation photos and the OPRAK flyer PDF. |
| `wix-page-assets.zip` (~17 MB) | 13 images the pages used that were not in the Media Manager (Wix app/theme images). Three Wix stock-library photos (`11062b_…`) were not retrievable and were not Eman's content. |

Sizes in the manifest were verified byte-for-byte against the downloads.

## What was deliberately NOT exported

Customer and member data: bookings, contacts, members, invoices, donations received,
chat transcripts. This repo is public. If those are ever needed they must be exported from
the Wix dashboard by the account owner and kept private.

## Restoring / reusing

- Text and images can be lifted straight into `src/routes/*` and `static/`.
- To put the Wix site back on the domain, see `.planning/DOMAIN-CUTOVER.md` (rollback section);
  the Wix site itself was not deleted.
