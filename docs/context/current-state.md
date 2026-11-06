---
Status: active
Owner: CT
Created: 2026-07-13
Last verified: 2026-11-06
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

On 2026-07-13, `make ci AI=1` passed lint, formatting, type checking, 2,894 unit tests, build, 279 package-contract tests, code generation, and the theme check. This pass did not re-run that suite.

## In-flight work

Open items are the [remaining-work list](../README.md#remaining-work). No plan was fully implemented, so none was retired.

## Risks

- `docs/process/lint-deviations.md` remains active but needs a catalog refresh.
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
