---
Status: active
Owner: CT
Created: 2026-07-13
Last verified: 2026-07-13
Kind: context
---

# Current state

## Agent Index

- **Kind:** context
- **Status:** active
- **Read when:** starting pdomain-ui work or checking current risks and active documentation.
- **Search terms:** current state, active work, risks, docgraph migration.

## What matters now

The library baseline is green after the 2026-07-13 dependency-refresh fixes.
`make ci AI=1` passes lint, formatting, type checking, 2,894 unit tests, build,
279 package-contract tests, code generation, and the theme check.

Docgraph governance is active. Shipped behavior now lives in the
[JobStatusPip architecture](../architecture/job-status-pip.md) and
[kanban architecture](../architecture/kanban-board.md). The old archive specs
have no remaining role as current truth.

Current shared-library structure is also captured in
[design-system composition](../architecture/design-system-composition.md),
[theme and component quality](../architecture/theme-and-component-quality.md),
[the generated type contract](../architecture/codegen-contract.md),
[the shell utility dock](../architecture/shell-utility-dock.md),
[the stage component library](../architecture/stage-component-library.md),
[cross-app common UI modules](../architecture/cross-app-common-ui-modules.md),
and [Accordion trigger slots](../architecture/accordion-trigger-slots.md).

## In-flight work

- The PGDP common-component backlog remains active because several named
  surfaces are not implemented. See
  `docs/plans/2026-06-14-pgdp-common-component-backlog.md`.
- The Field/FieldRow spec remains active because the proposed help slot is not
  implemented. See `docs/specs/2026-05-21-field-field-row.md`.
- The LogViewer spec remains a draft with no implementation evidence. See
  `docs/specs/2026-05-21-log-viewer.md`.

## Risks

- `docs/process/lint-deviations.md` remains active but needs a catalog refresh.
- The historical security review is stale; verify each finding against current
  code before acting on it.
- Missing-section and orphan findings remain advisory during conformance
  migration and are tracked by `docgraph check`.
- CropCard's empty-overlay guard and CoverPlaceholder's inline RGBA values are
  known audit residuals.
- LabelerCanvas exposes mutation-shaped API without mutation behavior, and
  live-theme repaint behavior for mounted Konva canvases needs an owner decision.
- Consumer-level migration to ArtifactViewer and the utility dock is not proven
  by this repository alone.
