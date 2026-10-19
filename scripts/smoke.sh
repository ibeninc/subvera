#!/usr/bin/env bash
#
# Route smoke test against the production build. Run `npm run build` first.
# Starts `next start` on a spare port, checks every route answers with the right status and <title>,
# checks the old routes still redirect, then stops the server.
#
# It proves the routes render. It doesn't click through flows: that's the browser check each
# feature in feature_list.json lists under "verification".

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PORT="${SMOKE_PORT:-3100}"
BASE="http://localhost:$PORT"
LOG="$(mktemp -t subvera-smoke.XXXXXX)"

if [ ! -f .next/BUILD_ID ]; then
  echo "No production build in .next. Run \`npm run build\` first." >&2
  exit 1
fi

npx next start -p "$PORT" >"$LOG" 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true; rm -f "$LOG"' EXIT

for _ in $(seq 1 60); do
  curl -s -o /dev/null "$BASE/" && break
  sleep 0.5
done

FAILED=0

# path | expected status | text that must appear in <title>
check() {
  local path="$1" status="$2" title="$3" body code
  body="$(mktemp)"
  code="$(curl -s -o "$body" -w '%{http_code}' "$BASE$path")"
  if [ "$code" != "$status" ]; then
    echo "FAIL $path: status $code, expected $status"
    FAILED=1
  elif ! grep -q "<title>[^<]*$title" "$body"; then
    echo "FAIL $path: <title> doesn't contain \"$title\""
    FAILED=1
  else
    echo "ok   $path ($code, \"$title\")"
  fi
  rm -f "$body"
}

# path | where it should redirect to
check_redirect() {
  local path="$1" target="$2" location
  location="$(curl -s -o /dev/null -w '%{redirect_url}' "$BASE$path")"
  if [ "$location" != "$BASE$target" ]; then
    echo "FAIL $path: redirects to \"$location\", expected $target"
    FAILED=1
  else
    echo "ok   $path -> $target"
  fi
}

check /                  200 "Umbilical document review"
check /sign-in           200 "Sign in"
check /reviews           200 "Reviews"
check /reviews/new       200 "New review"
check /reviews/r-104     200 "Findings"
check /archive           200 "Archive"
check /archive/r-102     200 "Archived report"
check /members           200 "Members"
check /settings          200 "Settings"
check /no-such-page      404 "404"

check_redirect /dashboard /reviews
check_redirect /documents /reviews
check_redirect /reports   /archive

if [ "$FAILED" != 0 ]; then
  echo "Smoke test failed. Server log:"
  tail -n 40 "$LOG"
  exit 1
fi
echo "Smoke test passed."
