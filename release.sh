#!/usr/bin/env bash
set -Eeuo pipefail

# ============================================================
# Cloud 107 — Release Orchestrator
#
# Platforms:
#   Web
#   Windows x64      EXE + MSI
#   Windows ARM64    EXE + MSI
#   Linux x64        DEB
#   Linux ARM64      DEB
#   WSL x64          TAR
#   WSL ARM64        TAR
#   Android ARM64    APK
#
# Usage:
#   ./release.sh 0.1.0
#
# The actual platform builds are performed by GitHub Actions
# on appropriate runners/build environments.
# ============================================================

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

VERSION="${1:-}"

if [[ -z "$VERSION" ]]; then
    VERSION="$(node -p "require('./package.json').version")"
fi

TAG="v${VERSION}"

echo
echo "=================================================="
echo " Cloud 107 Release"
echo "=================================================="
echo
echo "Version : $VERSION"
echo "Tag     : $TAG"
echo

# ------------------------------------------------------------
# Requirements
# ------------------------------------------------------------

command -v git >/dev/null 2>&1 || {
    echo "ERROR: git is required."
    exit 1
}

command -v node >/dev/null 2>&1 || {
    echo "ERROR: node is required."
    exit 1
}

command -v npm >/dev/null 2>&1 || {
    echo "ERROR: npm is required."
    exit 1
}

# ------------------------------------------------------------
# Repository validation
# ------------------------------------------------------------

[[ -f package.json ]] || {
    echo "ERROR: package.json not found."
    exit 1
}

[[ -f package-lock.json ]] || {
    echo "ERROR: package-lock.json not found."
    exit 1
}

PROJECT_NAME="$(node -p "require('./package.json').name")"

if [[ "$PROJECT_NAME" != "cloud107" ]]; then
    echo "ERROR: package.json name is '$PROJECT_NAME'."
    echo "Expected: cloud107"
    exit 1
fi

# ------------------------------------------------------------
# Working tree
# ------------------------------------------------------------

echo "[1/7] Checking Git state..."

if [[ -n "$(git status --porcelain)" ]]; then
    echo
    echo "ERROR: Working tree is not clean."
    echo
    git status --short
    echo
    echo "Commit or stash changes before creating a release."
    exit 1
fi

# ------------------------------------------------------------
# Dependency verification
# ------------------------------------------------------------

echo
echo "[2/7] Verifying npm lockfile..."

npm ci

# ------------------------------------------------------------
# Validation
# ------------------------------------------------------------

echo
echo "[3/7] Running lint..."

npm run lint

echo
echo "[4/7] Running tests..."

npm run test

echo
echo "[5/7] Building web application..."

npm run build

[[ -d dist ]] || {
    echo "ERROR: dist/ was not produced."
    exit 1
}

# ------------------------------------------------------------
# Web artifact
# ------------------------------------------------------------

echo
echo "[6/7] Preparing web artifact..."

rm -rf release
mkdir -p release/web

tar \
    -czf \
    "release/web/Cloud107-${VERSION}-web.tar.gz" \
    -C dist .

# ------------------------------------------------------------
# Release metadata
# ------------------------------------------------------------

echo
echo "[7/7] Creating release metadata..."

mkdir -p release/checksums

cat > release/RELEASE-MANIFEST.json <<EOF
{
  "name": "Cloud107",
  "version": "${VERSION}",
  "tag": "${TAG}",
  "architectures": {
    "windows": [
      "x64",
      "arm64"
    ],
    "linux": [
      "x64",
      "arm64"
    ],
    "wsl": [
      "x64",
      "arm64"
    ],
    "android": [
      "arm64"
    ]
  },
  "artifacts": [
    "Cloud107-${VERSION}-web.tar.gz",
    "Cloud107-${VERSION}-windows-x64.exe",
    "Cloud107-${VERSION}-windows-x64.msi",
    "Cloud107-${VERSION}-windows-arm64.exe",
    "Cloud107-${VERSION}-windows-arm64.msi",
    "cloud107_${VERSION}_amd64.deb",
    "cloud107_${VERSION}_arm64.deb",
    "Cloud107-${VERSION}-wsl-x64.tar",
    "Cloud107-${VERSION}-wsl-arm64.tar",
    "Cloud107-${VERSION}-android-arm64.apk"
  ]
}
EOF

# ------------------------------------------------------------
# Git tag
# ------------------------------------------------------------

echo
echo "Checking release tag..."

if git rev-parse "$TAG" >/dev/null 2>&1; then
    echo "Tag already exists: $TAG"
else
    git tag -a "$TAG" -m "Cloud107 ${TAG}"
    echo "Created tag: $TAG"
fi

# ------------------------------------------------------------
# Push
# ------------------------------------------------------------

echo
echo "=================================================="
echo " Release preparation complete"
echo "=================================================="
echo
echo "Web artifact:"
echo "  release/web/Cloud107-${VERSION}-web.tar.gz"
echo
echo "Release matrix:"
echo
echo "  Windows x64"
echo "    .exe"
echo "    .msi"
echo
echo "  Windows ARM64"
echo "    .exe"
echo "    .msi"
echo
echo "  Linux x64"
echo "    .deb"
echo
echo "  Linux ARM64"
echo "    .deb"
echo
echo "  WSL x64"
echo "    .tar"
echo
echo "  WSL ARM64"
echo "    .tar"
echo
echo "  Android ARM64"
echo "    .apk"
echo
echo "=================================================="
echo
echo "The tag is ready."
echo
echo "Push it to GitHub with:"
echo
echo "  git push origin main --tags"
echo