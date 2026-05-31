#!/usr/bin/env bash
# scripts/update-pdomain-deps.sh — bump pdomain-* codegen inputs to registry latest.
#
# pdomain-ui SPECIAL CASE: pdomain-ui does not import sibling pdomain-* code at runtime.
# It consumes pdomain-book-tools and pdomain-ops ONLY as codegen inputs: pinned
# wheel versions → fetch wheels → emit JSON Schema → generate TS types into
# src/types/generated/.
#
# The version pins live in codegen.versions.json, NOT pyproject.toml or
# package.json.
#
# What this does:
#   1. For each codegen sibling (pdomain-book-tools, pdomain-ops):
#      a. Reads codegen.versions.json for the current pinned version.
#      b. Queries pdomain-index-pip (PEP 503) for the latest version.
#      c. If latest > current, updates codegen.versions.json.
#   2. If any version changed, runs make codegen to regenerate TS types.
#   3. Leaves the diff staged (codegen.versions.json + regenerated output).
#      Does NOT commit.
#   4. Idempotent: prints "✓ <name> already at X" for each sibling at latest.
#
# Usage: make update-pdomain-deps   (or ./scripts/update-pdomain-deps.sh directly)
set -euo pipefail

# ─── Config ──────────────────────────────────────────────────────────────────
CODEGEN_SIBLINGS=(pdomain-book-tools pdomain-ops)
PD_INDEX_PIP="https://pdomain.github.io/pdomain-index-pip"
# ─────────────────────────────────────────────────────────────────────────────

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSIONS_JSON="$REPO_ROOT/codegen.versions.json"

say() { echo "[update-pdomain-deps] $*"; }

# ─── Validate codegen.versions.json exists ───────────────────────────────────
if [[ ! -f "$VERSIONS_JSON" ]]; then
  echo "ERROR: $VERSIONS_JSON not found." >&2
  exit 1
fi

# ─── Step 1: Query pdomain-index-pip and bump each sibling ────────────────────────
ANY_CHANGED=false

for sibling in "${CODEGEN_SIBLINGS[@]}"; do
  # Read current pinned version
  current=$(python3 -c "
import json, sys
with open('$VERSIONS_JSON') as f:
  d = json.load(f)
v = d.get('$sibling', '')
if not v:
  print('ERROR: $sibling not found in codegen.versions.json', file=sys.stderr)
  sys.exit(1)
print(v)
" 2>&1) || {
    echo "ERROR: failed to read $sibling from $VERSIONS_JSON" >&2
    exit 1
  }

  say "→ current $sibling = $current"

  # Query pdomain-index-pip for latest version
  index_url="$PD_INDEX_PIP/simple/$sibling/"
  say "→ querying $index_url"

  html=$(curl -sSf "$index_url" 2>&1) || {
    echo "ERROR: could not fetch $index_url" >&2
    echo "       Network issue or $sibling not yet seeded in pdomain-index-pip." >&2
    echo "       No changes made." >&2
    exit 1
  }

  # Parse: extract all href filenames, pull version segment, find max.
  # Handles both wheel (<name>-<ver>-py3-none-any.whl) and sdist (<name>-<ver>.tar.gz).
  pkg_norm="${sibling//-/_}"
  latest=$(
    echo "$html" \
      | grep -oP 'href="[^"]*"' \
      | sed 's/href="//;s/"//' \
      | grep -oP "${pkg_norm}-[0-9][^/\"#]*" \
      | sed "s/${pkg_norm}-//" \
      | python3 -c "
import sys, re
vers = []
for line in sys.stdin:
  line = line.strip()
  # strip trailing filename junk: everything from first non-version char
  m = re.match(r'^([0-9]+(?:\.[0-9]+)*(?:[._-]?(?:a|b|rc|alpha|beta|dev)[0-9]*)?).*', line)
  if m:
    vers.append(m.group(1))
if vers:
  from packaging.version import Version
  print(str(max(Version(v) for v in vers)))
"
  )

  if [[ -z "$latest" ]]; then
    echo "ERROR: pdomain-index-pip returned a page for $sibling but no wheel/sdist found." >&2
    echo "       Index may not be seeded yet. No changes made." >&2
    exit 1
  fi

  say "   latest $sibling = $latest"

  # Check if already at latest
  is_latest=$(python3 -c "
from packaging.version import Version
cur = Version('$current')
lat = Version('$latest')
print('yes' if lat <= cur else 'no')
" 2>&1) || {
    echo "ERROR: failed to compare versions ($current vs $latest)" >&2
    exit 1
  }

  if [[ "$is_latest" == "yes" ]]; then
    say "   ✓ $sibling already at $current — skipping"
    continue
  fi

  say "   pinning $sibling: $current → $latest"

  # Update the version in codegen.versions.json
  python3 -c "
import json

with open('$VERSIONS_JSON') as f:
  d = json.load(f)

d['$sibling'] = '$latest'

with open('$VERSIONS_JSON', 'w') as f:
  json.dump(d, f, indent=2)
  f.write('\n')
"

  ANY_CHANGED=true
done

# ─── Step 2: Re-run codegen if anything changed ──────────────────────────────
if [[ "$ANY_CHANGED" == "false" ]]; then
  say "✓ all codegen inputs already at latest — no codegen needed"
  exit 0
fi

say "→ updated $VERSIONS_JSON"
say "→ running make codegen (fetch wheels → emit JSON → generate TS)"
make -C "$REPO_ROOT" codegen

# ─── Step 3: Stage the diff for human review ─────────────────────────────────
say "→ staging codegen.versions.json and generated types"
git -C "$REPO_ROOT" add codegen.versions.json src/types/generated/

say ""
say "── diff summary ──────────────────────────────────────────────"
git -C "$REPO_ROOT" diff --stat --cached -- \
  codegen.versions.json \
  src/types/generated/ \
  2>/dev/null || true
say "──────────────────────────────────────────────────────────────"
say "Review the diff above, then commit:"
say "  git diff --cached -- codegen.versions.json src/types/generated/"
say "  git commit -m 'chore: bump codegen inputs to registry latest'"
