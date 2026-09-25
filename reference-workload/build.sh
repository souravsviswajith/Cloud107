#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

rm -rf dist
mkdir -p dist

node_modules/.bin/esbuild server.ts \
  --bundle \
  --platform=node \
  --format=cjs \
  --target=node22 \
  --outfile=dist/server.cjs

cat > dist/sea-config.json <<EOF
{
  "main": "${ROOT_DIR}/dist/server.cjs",
  "output": "${ROOT_DIR}/dist/reference-service.blob",
  "disableExperimentalSEAWarning": true
}
EOF

node --experimental-sea-config dist/sea-config.json
cp "$(command -v node)" dist/reference-service

npx --no-install postject dist/reference-service NODE_SEA_BLOB dist/reference-service.blob \
  --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2

chmod +x dist/reference-service
rm -f dist/server.cjs dist/sea-config.json dist/reference-service.blob

echo "Built dist/reference-service"
