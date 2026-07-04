#!/usr/bin/env bash
set -euo pipefail
BASE_URL="${BASE_URL:-https://wolfwdavid.github.io/diversityincludesdisability_one}"
echo "Verifying $BASE_URL"

# DEPLOY-01: root is live and HTML
curl -sfI "$BASE_URL/" | grep -qi 'content-type: text/html'

# DEPLOY-03: deep link survives a hard GET / refresh
curl -sfI "$BASE_URL/about/" >/dev/null

# DEPLOY-03: unknown path serves our 404 fallback body (GitHub returns 404 status, our HTML)
curl -s "$BASE_URL/definitely-not-a-page-xyz/" | grep -qi 'diversity includes disability'

# DEPLOY-04 + DEPLOY-02: an _app asset actually loads (proves .nojekyll + base path)
ASSET=$(curl -s "$BASE_URL/" | grep -oE '/diversityincludesdisability_one/_app/immutable/[^"]+\.(js|css)' | head -1)
test -n "$ASSET"
curl -sfI "$BASE_URL${ASSET#/diversityincludesdisability_one}" >/dev/null

echo "ALL DEPLOY CHECKS PASSED"
