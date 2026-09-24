# Domain cutover runbook — www.diversityincludesdisability.org → GitHub Pages

Status 2026-09-24: PREP ONLY. Nothing changed on DNS or in the repo yet.

## Facts (verified 2026-09-24)
- Domain: diversityincludesdisability.org, registered/managed at Wix. Nameservers ns2/ns3.wixdns.net, so DNS lives in Wix.
- Today it serves Eman's OLD Wix site (apex A → 185.230.63.x, www CNAME → cdn3.wixdns.net). Flipping DNS REPLACES that site.
- GitHub Pages for wolfwdavid/diversityincludesdisability_one: custom domain not set (cname null), HTTPS enforced.
- Wix MCP added to ~/.claude.json as `wix-mcp-remote` (https://mcp.wix.com/mcp, HTTP, OAuth). Needs `/mcp` sign-in in a fresh session.
  Caveat: Wix's Domain DNS API is API-key-only per its docs; if the OAuth MCP cannot edit the zone, fall back to the
  API-key header config from https://dev.wix.com/docs/api-reference/articles/ai-tools/wix-mcp/about-the-wix-mcp
  (owner creates the key in Wix account settings; never paste it into chat or commit it), or edit records in the Wix dashboard.

## Decisions needed from the owner
1. Leave Wix for the apex (www.diversityincludesdisability.org points at GitHub Pages) — or a subdomain first (e.g. new.…org) as a soft launch?
2. Go/no-go moment for the DNS flip (old Wix site goes dark at that moment; propagation up to 24-48 h).

## Steps (apex cutover)
1. GitHub → Settings → Pages → verified domains: add diversityincludesdisability.org, add the TXT record Wix-side, verify (takeover protection).
2. DNS at Wix (zone for diversityincludesdisability.org):
   - apex A: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
   - apex AAAA: 2606:50c0:8000::153, 2606:50c0:8001::153, 2606:50c0:8002::153, 2606:50c0:8003::153
   - www CNAME: wolfwdavid.github.io
   - remove the Wix A/CNAME records for apex and www.
3. Repo (one commit, push only once DNS is in place):
   - `static/CNAME` containing `www.diversityincludesdisability.org`
   - `.github/workflows/deploy.yml`: BASE_PATH → '' (site moves from sub-path to root)
   - `playwright.config.ts` + `tests/deploy.smoke.spec.ts`: default BASE_URL → https://www.diversityincludesdisability.org
   - `src/app.html` theme key comment (origin no longer shared)
4. `gh api -X PUT repos/wolfwdavid/diversityincludesdisability_one/pages -f cname=www.diversityincludesdisability.org`, wait for the cert, then enforce HTTPS.
5. Verify: https://www.diversityincludesdisability.org/ and /creative/ 200 over HTTPS, apex redirects to www, deep-link hard refresh works, e2e green with BASE_URL set.
