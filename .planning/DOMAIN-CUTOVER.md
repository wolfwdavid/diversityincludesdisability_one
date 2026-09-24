# Domain cutover — www.diversityincludesdisability.org → GitHub Pages

Status 2026-09-24 (evening): DONE. Site is live on the custom domain, HTTPS enforced.

## What was changed (all on 2026-09-24)
1. DNS zone at Wix (edited through the Wix MCP, `PATCH /domains/v1/dns-zones/diversityincludesdisability.org`; the
   OAuth session was accepted despite the docs saying API-key only):
   - apex A  → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
   - apex AAAA → 2606:50c0:8000::153, 2606:50c0:8001::153, 2606:50c0:8002::153, 2606:50c0:8003::153
   - www CNAME → wolfwdavid.github.io
   - removed: Wix apex A (185.230.63.171/.186/.107) and www CNAME → cdn3.wixdns.net
   - untouched: NS (ns2/ns3.wixdns.net), SOA. No MX/TXT existed.
2. GitHub Pages (`gh api -X PUT .../pages`): cname=www.diversityincludesdisability.org, then https_enforced=true once
   the cert reached state=approved (covers www + apex, expires 2026-12-23, GitHub auto-renews).
3. Repo commit e4e1f76: static/CNAME, deploy.yml BASE_PATH '', Playwright/smoke/verify-deploy.sh defaults →
   https://www.diversityincludesdisability.org, root-relative `_app` asset checks. Deploy run 36059705304 green.

## Verified (curl against GitHub's IP directly, so independent of resolver caches)
- https://www.diversityincludesdisability.org/ , /about/ , /creative/ → 200 text/html, server=GitHub.com
- unknown path → 404 with our SvelteKit fallback shell (`__sveltekit` present)
- /_app/immutable/… asset → 200 (root base path correct)
- http://www → 301 https://www ; apex http/https → 301 https://www
- old https://wolfwdavid.github.io/diversityincludesdisability_one/about/ → 301 to the new domain (GitHub does this
  automatically once a CNAME is set; deep links carry over)
- Public resolvers (8.8.8.8, Wix authoritative ns2.wixdns.net) already return the GitHub records. Local machines may
  keep the old Wix answer for up to 1 h (old TTL 3600) — that is a cache, not a problem.

## Rollback (if ever needed)
Same PATCH with additions/deletions swapped: re-add apex A 185.230.63.171/.186/.107 and www CNAME cdn3.wixdns.net,
delete the GitHub A/AAAA/CNAME; `gh api -X PUT .../pages -f cname=""`; revert e4e1f76. The Wix site itself was not
deleted, only unreachable.

## Follow-ups (not blocking)
- Optional takeover protection: GitHub → Settings → Pages → "Verified domains" → add diversityincludesdisability.org,
  put the TXT it shows into the Wix zone (`_github-pages-challenge-wolfwdavid` host). No public API for this step.
- The Wix Premium plan for site "Diversity Includes D" now only pays for the domain registration. Eman can downgrade
  the site plan but must KEEP the domain (and its auto-renew) at Wix.
- `did:theme` localStorage key is no longer shared with sibling wolfwdavid.github.io projects (comment updated).
- Local `npm run test:deploy` / verify-deploy.sh will report the old site until the local resolver cache expires.
