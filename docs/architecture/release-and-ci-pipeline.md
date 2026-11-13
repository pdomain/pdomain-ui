---
kind: architecture
status: built
owner: CT
created: 2026-07-15
last_verified: 2026-11-06
---

# Release and CI pipeline

## Agent Index

- **Kind:** architecture
- **Status:** built
- **Read when:** changing the local release script, the `just ci` gate, or how a tag becomes a GitHub Release asset.
- **Search terms:** release, just ci, do-release, GitHub Release, local gate, tarball.

## The gate runs on the releasing machine

Commit `0aa42b5` (2026-09-13) deleted `.github/workflows/`. That commit removed the CI, dep-refresh, nightly, release, and index-regen workflows. Its message records that branch protection is off. This repository has no workflow files. Checks and releases run through the local just recipes below.

`just ci` is the gate. The recipe runs `install`, `lint-check`, `format-check`, `typecheck`, `py-static-check`, `test-unit`, `build`, `test-package`, `codegen-check`, `theme-check`, `knip`, and `docgraph check --strict`, in that order. `codegen-check` downloads pinned primary wheels from GitHub Releases and resolves their transitive dependencies through the self-hosted pip index at `https://pdomain.github.io/pdomain-index-pip/simple/`. `theme-check` compares `theme/tokens.css` and `theme/primitives.css` with `../docs/design-system/`. When that sibling directory is absent, the check exits 0.

## A release builds the tarball and uploads it

`just release-patch`, `just release-minor`, and `just release-major` call `scripts/do-release.sh`. The script stops when the tree is dirty, the branch is not `master`, or `master` is behind or diverged from `origin/master`. `FORCE=1` skips those three guards. The gate still runs.

The script runs `just ci`, bumps `package.json` with `pnpm version --no-git-tag-version`, commits that bump, and creates an annotated `vMAJOR.MINOR.PATCH` tag. `SKIP_PUSH=1` stops after the local tag. Otherwise the script pushes `master` and the tag, deletes `dist/`, builds the library, packs a tarball into `dist/`, and creates the GitHub Release with that tarball. The self-hosted npm registry is generated from release assets, so a release without the tarball publishes nothing a consumer can install.

The release version comes from the highest local `v*` tag, not from the current
package version. The chosen patch, minor, or major increment applies to that tag.
The script refuses an already-existing local candidate tag. Before publication,
compare live remote tags as well; tags and release assets must remain immutable.

The branch and tag are pushed before the post-tag rebuild, pack, and GitHub
Release creation. A failure after that push can leave a tag without an asset;
release-page success alone does not establish npm-registry availability. Verify
the tarball and coordinate the separate registry publication before telling
consumers that the new version is installable.

Publishing that registry is a separate command in `pdomain-index-npm`: `./scripts/publish-index.sh`.

## Evidence

- Current code: `justfile` recipe `ci`, `scripts/do-release.sh`
- Tests: `just ci` runs `test-unit` and then `test-package` after `build`. `test-package` is the package and pack contract tests.
- Removed: `.github/workflows/` in commit `0aa42b5` (2026-09-13). The parent of that commit still has the earlier workflow description.
- Historical verification: 2026-11-06 by reading `Makefile`, `scripts/do-release.sh`, and `git log -- .github`. That review did not re-run the suite.

Source inspection on 2026-11-13 checked the tag-derived version and post-push
artifact boundary against `scripts/do-release.sh`; no release was executed.
