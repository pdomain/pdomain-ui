---
kind: architecture
status: built
owner: CT
created: 2026-07-15
last_verified: 2026-07-15
---

# Release and CI pipeline

## Agent Index

- **Kind:** architecture
- **Status:** built
- **Read when:** changing `.github/workflows/`, release gating, workflow
  permissions, action pins, or the publish path to the npm registry.
- **Search terms:** release, ci, github actions, least privilege, sha pinning,
  persist-credentials, gated publish, provenance, attestation.

## CI gates every pull request with least privilege

`.github/workflows/ci.yml` runs on pull requests to `master` with
`permissions: contents: read` and no other scopes. It splits into four jobs:
lint-check (Prettier + ESLint), typecheck (`tsc --noEmit`, strict), unit-test
(sharded Vitest), and build-package (Vite build plus the `dist`/package
contract tests and a pack dry-run). The build-package job is what keeps the
published `/testids` subpath and pack contents from silently drifting, because
the pack contract tests assert them.

`codegen-check` and `theme-check` are intentionally excluded from GitHub-hosted
CI: both need resources outside the checkout (the self-hosted pip registry and
the workspace-level design-system directory). The committed
`src/types/generated/` snapshot is what CI typechecks; run those two checks
locally before tagging.

## Release isolates write credentials from install and build

`.github/workflows/release.yml` triggers on a `v*` tag push and defaults to
`permissions: {}`. Two jobs split the work so elevated credentials never touch
untrusted code:

- **build** runs with `contents: read` and checks out with
  `persist-credentials: false`, so the write-scoped `GITHUB_TOKEN` is never
  stored in the git credential helper. `pnpm install` and the Vite build cannot
  read it even if a dependency lifecycle script is compromised. This job runs
  the full gate — lint, typecheck, test, `pnpm audit --audit-level=high`,
  build, pack, and a pack-content check — then uploads the tarball as an
  artifact.
- **publish** needs `build` first and is the only job with
  `contents: write`, `id-token: write`, and `attestations: write`. It attests
  provenance, creates the GitHub Release, and dispatches the
  `pdomain-index-npm` publish. It runs no install or build step under those
  elevated scopes.

The tag-to-version check reads the tag through the `GITHUB_REF_NAME`
environment variable under `set -euo pipefail` and compares it to
`package.json`; the tag string is never interpolated directly into a shell
command.

## Third-party actions are pinned by commit SHA

Every non-first-party action is pinned to a full commit SHA with the version in
a trailing comment, for example
`actions/checkout@9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0 # v6.0.2`. A moved or
compromised tag cannot change what runs. Weekly SHA refreshes across workspace
repos are tracked outside this repo (see `docs/context/intent-map.md`).

## Evidence

- Code: `.github/workflows/ci.yml`, `.github/workflows/release.yml`,
  `.github/workflows/dep-refresh.yml`
- Tests: the `dist`/package contract tests run in the `build-package` CI job
  and the release `build` job (pack-content check)
- Verified: 2026-07-15, by reading the current workflow files
- History: this record promotes the durable outcomes of the May 2026 release/CI
  audit fixes (former `pdomain/pdomain-ui` issues #24, #26, #27, #28, #40, #41,
  #50, #55), retired in `docs/context/decisions.md`.
