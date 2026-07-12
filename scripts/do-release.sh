#!/usr/bin/env bash
# do-release.sh — pre-flight, bump package.json, tag, and push.
#
# Uses `pnpm version --no-git-tag-version` to update package.json, then:
#   1. Verifies repo state (clean tree / on main / up-to-date with origin).
#   2. Runs the full pre-flight (`make ci`).
#   3. Commits the package.json version bump.
#   4. Creates an annotated tag vMAJOR.MINOR.PATCH.
#   5. Pushes main + tag to origin.
#
# Version is always three-component SemVer derived from the most recent v* tag.
# Defaults to BUMP=minor.
#
# Escape hatches:
#   FORCE=1     skip the three repo-state guards (dirty tree / branch / origin
#               sync). The pre-flight still runs.
#   SKIP_PUSH=1 create the tag locally but don't push. Dry-run.

set -eu

BUMP=${BUMP:-minor}
FORCE=${FORCE:-0}
SKIP_PUSH=${SKIP_PUSH:-0}

if [ "$BUMP" != "major" ] && [ "$BUMP" != "minor" ] && [ "$BUMP" != "patch" ]; then
    echo "ERROR: BUMP must be one of: major, minor, patch (got: $BUMP)" >&2
    exit 2
fi

# ---------------------------------------------------------------------------
# Repo-state guards (skippable with FORCE=1)
# ---------------------------------------------------------------------------
if [ "$FORCE" != "1" ]; then
    if [ -n "$(git status --porcelain)" ]; then
        echo "ERROR: Working tree is dirty. Commit or stash changes first." >&2
        echo "   (Set FORCE=1 to override -- pre-flight still runs.)" >&2
        exit 1
    fi

    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    if [ "$CURRENT_BRANCH" != "master" ]; then
        echo "ERROR: Not on master (current branch: $CURRENT_BRANCH)." >&2
        echo "   Switch to master before tagging. (Set FORCE=1 to override.)" >&2
        exit 1
    fi

    git fetch origin master --quiet
    LOCAL=$(git rev-parse master)
    REMOTE=$(git rev-parse origin/master)
    BASE=$(git merge-base master origin/master)
    if [ "$LOCAL" != "$REMOTE" ]; then
        if [ "$LOCAL" = "$BASE" ]; then
            echo "ERROR: Local master is behind origin/master. Pull first." >&2
            echo "   (Set FORCE=1 to override.)" >&2
            exit 1
        elif [ "$REMOTE" = "$BASE" ]; then
            echo "INFO: Local master is ahead of origin/master (will be pushed)."
        else
            echo "ERROR: master and origin/master have diverged." >&2
            exit 1
        fi
    fi
else
    echo "WARNING: FORCE=1 -- skipping repo-state guards. Pre-flight still runs."
fi

# ---------------------------------------------------------------------------
# Compute next version (always three-component SemVer)
# ---------------------------------------------------------------------------
LATEST=$(git tag --list 'v*' --sort=-version:refname | head -1)
if [ -z "$LATEST" ]; then LATEST="v0.0.0"; fi

VER_NO_V=${LATEST#v}
# Strip any pre-release suffix (e.g. 0.1.0-alpha.1 -> 0.1.0)
VER_CORE=$(echo "$VER_NO_V" | sed 's/[-+].*//')
MAJOR=$(echo "$VER_CORE" | awk -F. '{print ($1 == "" ? 0 : $1)}')
MINOR=$(echo "$VER_CORE" | awk -F. '{print ($2 == "" ? 0 : $2)}')
PATCH=$(echo "$VER_CORE" | awk -F. '{print ($3 == "" ? 0 : $3)}')

if [ "$BUMP" = "major" ]; then
    MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0
elif [ "$BUMP" = "minor" ]; then
    MINOR=$((MINOR + 1)); PATCH=0
else
    PATCH=$((PATCH + 1))
fi

VERSION="v$MAJOR.$MINOR.$PATCH"
VERSION_NO_V="$MAJOR.$MINOR.$PATCH"

if git rev-parse -q --verify "refs/tags/$VERSION" >/dev/null; then
    echo "ERROR: Tag $VERSION already exists. Aborting." >&2
    exit 1
fi

echo "Latest tag: $LATEST"
echo "Next tag:   $VERSION (bump=$BUMP)"

# ---------------------------------------------------------------------------
# Pre-flight (NEVER skipped, even with FORCE=1)
# ---------------------------------------------------------------------------
echo ""
echo "Running pre-flight: make ci"
echo ""
if ! make ci; then
    echo "" >&2
    echo "ERROR: Pre-flight (make ci) failed. No version bump or tag created." >&2
    exit 1
fi

# ---------------------------------------------------------------------------
# Bump package.json (no git tag — we tag manually below)
# ---------------------------------------------------------------------------
echo ""
echo "Bumping package.json to $VERSION_NO_V..."
pnpm version --no-git-tag-version "$VERSION_NO_V"

# Commit the version bump
git add package.json pnpm-lock.yaml 2>/dev/null || git add package.json
git commit -m "chore: release $VERSION

Co-Authored-By: ConcaveTrillion <concavetrillion@gmail.com>"

# ---------------------------------------------------------------------------
# Tag
# ---------------------------------------------------------------------------
echo "Creating annotated tag $VERSION..."
git tag -a "$VERSION" -m "Release $VERSION"

if [ "$SKIP_PUSH" = "1" ]; then
    echo "INFO: SKIP_PUSH=1 -- tag created locally but not pushed."
    echo "   To push and release later:"
    echo "     git push origin master --follow-tags"
    exit 0
fi

# ---------------------------------------------------------------------------
# Push
# ---------------------------------------------------------------------------
echo "Pushing master + tag to origin..."
git push origin master --follow-tags

echo ""
echo "Released $VERSION."
echo "   Repo: https://github.com/pdomain/pdomain-ui"
echo "   Tag:  https://github.com/pdomain/pdomain-ui/releases/tag/$VERSION"
