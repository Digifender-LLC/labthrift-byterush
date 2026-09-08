#!/usr/bin/env bash
# Packages a deploy-ready artifact tarball for the Tech Dose (ByteRush)
# Cloudflare Worker: the static export output plus everything Wrangler
# needs to deploy it, without node_modules or repo history.
#
# Usage:
#   npm run build   # produces ./out (must run first; cf:package does this for you)
#   ./scripts/package-artifact.sh
#
# Output: tech-dose-cloudflare-<git-sha>.tar.gz in the repo root.
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -d "out" ]; then
  echo "error: ./out not found. Run 'npm run build' first (output: 'export')." >&2
  exit 1
fi

sha="$(git rev-parse --short HEAD 2>/dev/null || echo "nogit")"
name="tech-dose-cloudflare-${sha}"
staging="$(mktemp -d)/${name}"

mkdir -p "$staging"
cp -R out "$staging/out"
cp wrangler.jsonc "$staging/"
cp DEPLOY.md "$staging/" 2>/dev/null || true
cp package.json "$staging/"

tar -czf "${name}.tar.gz" -C "$(dirname "$staging")" "${name}"
rm -rf "$(dirname "$staging")"

echo "Wrote $(pwd)/${name}.tar.gz"
