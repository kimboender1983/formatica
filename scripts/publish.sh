#!/bin/bash
set -e

# Formatica — publish all packages to npm
# Usage: ./scripts/publish.sh [patch|minor|major]
#   Default: patch (0.2.0 → 0.2.1)
#   minor: 0.2.0 → 0.3.0
#   major: 0.2.0 → 1.0.0

BUMP="${1:-patch}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT"

# Get current version
CURRENT=$(node -e "console.log(require('./packages/core/package.json').version)")
echo "Current version: $CURRENT"

# Calculate new version
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"
case "$BUMP" in
    major) MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0 ;;
    minor) MINOR=$((MINOR + 1)); PATCH=0 ;;
    patch) PATCH=$((PATCH + 1)) ;;
    *) echo "Usage: $0 [patch|minor|major]"; exit 1 ;;
esac
NEW="$MAJOR.$MINOR.$PATCH"
echo "New version: $NEW"
echo ""

# Confirm
read -p "Publish @formatica/{core,vue,react}@$NEW to npm? [y/N] " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

# Bump versions in all packages
echo "Bumping versions to $NEW..."
sed -i '' "s/\"version\": \"$CURRENT\"/\"version\": \"$NEW\"/" \
    packages/core/package.json \
    packages/vue/package.json \
    packages/react/package.json

# Build
echo "Building..."
yarn build

# Run tests
echo "Running tests..."
yarn test --run
yarn workspace @formatica/core test
yarn workspace @formatica/react test

echo ""
echo "All tests passed. Publishing..."
echo ""

# Publish in order (core first — vue and react depend on it)
echo "Publishing @formatica/core@$NEW..."
cd packages/core && npm publish --access public
cd "$ROOT"

echo "Publishing @formatica/vue@$NEW..."
cd packages/vue && npm publish --access public
cd "$ROOT"

echo "Publishing @formatica/react@$NEW..."
cd packages/react && npm publish --access public
cd "$ROOT"

# Commit and push
echo ""
echo "Committing and pushing..."
git add -A
git commit -m "v$NEW"
git push

echo ""
echo "Published @formatica/{core,vue,react}@$NEW"
