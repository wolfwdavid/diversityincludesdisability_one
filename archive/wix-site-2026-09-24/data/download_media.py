"""Download every Wix Media Manager original plus page-referenced assets that live outside it."""
import csv
import json
import os
import subprocess
from concurrent.futures import ThreadPoolExecutor

os.chdir(os.path.dirname(os.path.abspath(__file__)))
os.makedirs("media", exist_ok=True)
os.makedirs("media-page-refs", exist_ok=True)

rows = [r for r in csv.reader(open("data/media-manager-files.tsv", encoding="utf-8"), delimiter="\t") if r]


def src_url(r):
    return r[4] if len(r) > 4 else f"https://static.wixstatic.com/media/{r[0]}"


def fetch(r):
    out = os.path.join("media", r[0])
    want = int(r[1])
    if os.path.exists(out) and os.path.getsize(out) == want:
        return (r[0], "cached", want, want)
    p = subprocess.run(
        ["curl", "-sSL", "--retry", "3", "--max-time", "300", "-o", out, src_url(r)],
        capture_output=True, text=True,
    )
    got = os.path.getsize(out) if os.path.exists(out) else -1
    return (r[0], "ok" if p.returncode == 0 else "ERR " + p.stderr.strip(), got, want)


with ThreadPoolExecutor(8) as ex:
    res = list(ex.map(fetch, rows))
bad = [x for x in res if not x[1].startswith(("ok", "cached")) or x[2] != x[3]]
print("media manager files:", len(res), "problems:", len(bad))
for b in bad[:20]:
    print("  ", b)
print("bytes on disk:", sum(os.path.getsize(os.path.join("media", f)) for f in os.listdir("media")))

# Assets the pages reference that are NOT in the Media Manager (Wix stock, app images, service cover)
have = {r[0] for r in rows}
ref = json.load(open("media-referenced.json"))
extra = [m for m in ref if m not in have and not m.startswith("video/")]
print("page-referenced ids not in Media Manager:", len(extra))


def fetch_extra(m):
    out = os.path.join("media-page-refs", m.split("/")[-1])
    p = subprocess.run(
        ["curl", "-sSL", "--retry", "3", "--max-time", "120", "-o", out, f"https://static.wixstatic.com/media/{m}"],
        capture_output=True, text=True,
    )
    return (m, p.returncode, os.path.getsize(out) if os.path.exists(out) else -1)


with ThreadPoolExecutor(8) as ex:
    res2 = list(ex.map(fetch_extra, extra))
ok2 = [r for r in res2 if r[1] == 0 and r[2] > 0]
print("extra fetched:", len(ok2), "of", len(res2))
for r in res2:
    if r not in ok2:
        print("  failed:", r)
json.dump({"mediaManager": res, "pageRefsOutsideMediaManager": res2}, open("data/download-report.json", "w"), indent=1)
