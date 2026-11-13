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
#      c. If the newest universal wheel is newer, records its version and SHA-256.
#   2. If any version changed, writes codegen.versions.json and runs just codegen
#      to regenerate TS types.
#   3. Leaves the diff staged (codegen.versions.json + regenerated output).
#      Does NOT commit.
#   4. Idempotent: prints "✓ <name> already at X" for each sibling at latest.
#
# Usage: just update-pdomain-deps   (or ./scripts/update-pdomain-deps.sh directly)
set -euo pipefail

# ─── Config ──────────────────────────────────────────────────────────────────
CODEGEN_SIBLINGS=(pdomain-book-tools pdomain-ops)
PD_INDEX_PIP="https://pdomain.github.io/pdomain-index-pip"
# ─────────────────────────────────────────────────────────────────────────────

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# CODEGEN_VERSIONS_PATH is the same test override codegen-fetch.mjs honors.
VERSIONS_JSON="${CODEGEN_VERSIONS_PATH:-$REPO_ROOT/codegen.versions.json}"

readonly READ_PIN_PY='
import json
import sys

path, package = sys.argv[1:3]
with open(path) as handle:
    entry = json.load(handle).get(package)
version = entry if isinstance(entry, str) else (entry or {}).get("version")
if not version:
    sys.exit(f"{package} has no version in {path}")
print(version)
'

readonly SELECT_WHEEL_PY='
import re
import sys

from packaging.version import InvalidVersion, Version

package, current = sys.argv[1:3]
wheel_name = re.compile(rf"^{re.escape(package)}-(.+)-py3-none-any\.whl$")
newest = None
for href in re.findall(r"href=\"([^\"]*)\"", sys.stdin.read()):
    url, _, fragment = href.partition("#")
    match = wheel_name.match(url.rsplit("/", 1)[-1])
    if match is None:
        continue
    try:
        version = Version(match.group(1))
    except InvalidVersion:
        continue
    if newest is None or version > newest[0]:
        newest = (version, match.group(1), fragment)
if newest is None:
    sys.exit(f"no universal wheel listed for {package}")
version, version_text, fragment = newest
if version <= Version(current):
    print(version_text, "-", "current")
    sys.exit(0)
digest = re.fullmatch(r"sha256=([0-9a-f]{64})", fragment)
if digest is None:
    sys.exit(f"no sha256 listed for {package} {version_text}")
print(version_text, digest.group(1), "newer")
'

readonly WRITE_PINS_PY='
import json
import os
import sys

path, *updates = sys.argv[1:]
with open(path) as handle:
    pins = json.load(handle)
for index in range(0, len(updates), 3):
    package, version, digest = updates[index : index + 3]
    wheel_prefix = package.replace("-", "_")
    wheel = f"{wheel_prefix}-{version}-py3-none-any.whl"
    pins[package] = {"version": version, "sha256": {wheel: digest}}
with open(f"{path}.tmp", "w") as handle:
    json.dump(pins, handle, indent=2)
    handle.write("\n")
os.replace(f"{path}.tmp", path)
'

say() { echo "[update-pdomain-deps] $*"; }

pin_python() { uv run --quiet --project "$REPO_ROOT" python -c "$@"; }

# ─── Validate codegen.versions.json exists ───────────────────────────────────
if [[ ! -f "$VERSIONS_JSON" ]]; then
  echo "ERROR: $VERSIONS_JSON not found." >&2
  exit 1
fi

# ─── Step 1: Query pdomain-index-pip for each sibling ────────────────────────
# Pins are collected here and written after every sibling succeeds, so a failed
# lookup leaves codegen.versions.json untouched.
PENDING_PINS=()

for sibling in "${CODEGEN_SIBLINGS[@]}"; do
  current=$(pin_python "$READ_PIN_PY" "$VERSIONS_JSON" "$sibling") || {
    echo "ERROR: failed to read $sibling from $VERSIONS_JSON" >&2
    exit 1
  }

  say "→ current $sibling = $current"

  index_url="$PD_INDEX_PIP/simple/$sibling/"
  say "→ querying $index_url"

  html=$(curl -sSf "$index_url" 2>&1) || {
    echo "ERROR: could not fetch $index_url" >&2
    echo "       Network issue or $sibling not yet seeded in pdomain-index-pip." >&2
    echo "       No changes made." >&2
    exit 1
  }

  selection=$(printf '%s' "$html" | pin_python "$SELECT_WHEEL_PY" "${sibling//-/_}" "$current") || {
    echo "ERROR: could not choose a wheel for $sibling from $index_url." >&2
    echo "       No changes made." >&2
    exit 1
  }
  read -r latest digest status <<<"$selection"

  say "   latest $sibling = $latest"

  if [[ "$status" == "current" ]]; then
    say "   ✓ $sibling already at $current — skipping"
    continue
  fi

  say "   pinning $sibling: $current → $latest"
  PENDING_PINS+=("$sibling" "$latest" "$digest")
done

# ─── Step 2: Write pins and re-run codegen if anything changed ───────────────
if [[ ${#PENDING_PINS[@]} -eq 0 ]]; then
  say "✓ all codegen inputs already at latest — no codegen needed"
  exit 0
fi

pin_python "$WRITE_PINS_PY" "$VERSIONS_JSON" "${PENDING_PINS[@]}"

say "→ updated $VERSIONS_JSON"
say "→ running just codegen (fetch wheels → emit JSON → generate TS)"
just --justfile "$REPO_ROOT/justfile" codegen

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
