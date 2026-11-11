---
Status: active
Owner: CT
Created: 2026-07-13
Last verified: 2026-11-10
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

On 2026-11-10, `make ci AI=1` passed formatting, lint with one existing
`react-hooks/incompatible-library` warning, TypeScript and Python checks,
2,915 unit tests, build, 279 package tests, and code generation. Theme checks
skipped comparison because the isolated worktree has no adjacent design-system
mirror.

## In-flight work

Open items are the [remaining-work list](../README.md#remaining-work). The active-device plan and spec were implemented and retired on 2026-11-10. No other plan is fully implemented.

## Risks

- The lint-deviation register now matches the source; several suppressions still
  lack local rationale and need review when those areas change.

- Codegen pins trail the registry. On 2026-11-10 the pins were
  `pdomain-book-tools` 0.28.0 and `pdomain-ops` 0.11.2; the index listed 0.30.1
  and 0.12.0. `make update-pdomain-deps` now performs that bump when wanted.
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
