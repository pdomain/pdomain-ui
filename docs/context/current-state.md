---
Status: active
Owner: CT
Created: 2026-07-13
Last verified: 2026-11-12
Kind: context
---

# Current state

## Agent Index

- **Kind:** context
- **Status:** active
- **Read when:** starting pdomain-ui work or checking current risks and active documentation.
- **Search terms:** current state, active work, risks, docgraph migration.

## What matters now

Shipped behavior is the architecture list in the [docs index](../README.md). The release gate is local `make ci`, recorded in [Release and CI pipeline](../architecture/release-and-ci-pipeline.md).

On 2026-11-07, `make ci AI=1` passed formatting, lint with one existing
`react-hooks/incompatible-library` warning, TypeScript and Python checks,
2,903 unit tests, build, 279 package tests, and code generation. Theme checks
skipped comparison because neither the isolated worktree nor the main checkout
has the adjacent design-system mirror.

## In-flight work

Open items are the [roadmap](../plans/2026-06-14-pgdp-common-component-backlog.md).
The docs index points at that same list. No plan was fully implemented, so
none was retired. Shipped settings, workbench, and slot-primitive behavior
was copied into the architecture docs on 2026-11-12.

## Risks

- `ComputeTargetPanel` gates rendering on `info.mode`, contrary to the
  deploy-mode constraint in `AGENTS.md`.

- The lint-deviation register now matches the source; several suppressions still
  lack local rationale and need review when those areas change.

- The dependency updater cannot parse the current object-form codegen pins;
  `make update-pdomain-deps` needs a script fix before use.
- The historical security review is stale; verify each finding against current
  code before acting on it.
- Missing-section and orphan findings remain advisory during conformance
  migration and are tracked by `docgraph check`.
- CropCard's empty-overlay guard and CoverPlaceholder's inline RGBA values are
  known audit residuals.
- LabelerCanvas exposes a mutation-shaped API without mutation behavior.
  Live-theme repaint behavior for mounted Konva canvases needs an owner decision.
- Consumer-level migration to ArtifactViewer and the utility dock is not proven
  by this repository alone.
