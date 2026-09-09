#!/bin/bash
set -euo pipefail

PROJECT="${EKIP_PROJECT_DIR:-/Users/uzma/Downloads/EKIP CURRENT}"
API_URL="${EKIP_API_URL:-http://localhost:4000}"
FRONTEND_URL="${EKIP_FRONTEND_URL:-http://localhost:5173}"

echo "EKIP deployment verification"
echo "Project:  $PROJECT"
echo "API:      $API_URL"
echo "Frontend: $FRONTEND_URL"
echo

echo "1/5 Frontend production build"
cd "$PROJECT"
npm run build

echo
echo "2/5 Backend production build"
cd "$PROJECT/backend"
npm run build

echo
echo "3/5 Backend tests"
npm test

echo
echo "4/5 API liveness/readiness"
curl --fail --silent --show-error "$API_URL/api/health"
echo
curl --fail --silent --show-error "$API_URL/api/ready"
echo

echo
echo "5/5 Runtime verifier"
EKIP_API_URL="$API_URL" \
EKIP_FRONTEND_URL="$FRONTEND_URL" \
npm run verify:runtime

echo
echo "EKIP deployment verification passed."
