#!/usr/bin/env bash
set -euo pipefail
BASE_URL="${BASE_URL:-https://wolfwdavid.github.io/diversityincludesdisability_one}"
echo "Verifying $BASE_URL"

# DEPLOY-01: root is live and HTML
curl -sfI "$BASE_URL/" | grep -qi 'content-type: text/html'

# DEPLOY-03: deep link survives a hard GET / refresh
curl -sfI "$BASE_URL/about/" >/dev/null

# DEPLOY-03: unknown path serves our SPA 404 fallback (GitHub returns a 404 status
# and serves adapter-static's fallback 404.html — the SvelteKit shell that boots the
# client router, which then renders our branded 404 page after hydration).
# The static shell is JS-hydrated, so the branded text is NOT in the raw HTML; the
# load-bearing static proof is that the fallback is OUR app shell wired to the correct
# base path (__sveltekit base config + /diversityincludesdisability_one/_app preloads).
# The client-rendered branded body is asserted by the Playwright smoke (tests/deploy.smoke.spec.ts).
FALLBACK=$(curl -s "$BASE_URL/definitely-not-a-page-xyz/")
echo "$FALLBACK" | grep -qi 'diversityincludesdisability_one/_app'
echo "$FALLBACK" | grep -q '__sveltekit'

# DEPLOY-04 + DEPLOY-02: an _app asset actually loads (proves .nojekyll + base path)
ASSET=$(curl -s "$BASE_URL/" | grep -oE '/diversityincludesdisability_one/_app/immutable/[^"]+\.(js|css)' | head -1)
test -n "$ASSET"
curl -sfI "$BASE_URL${ASSET#/diversityincludesdisability_one}" >/dev/null

echo "ALL DEPLOY CHECKS PASSED"
