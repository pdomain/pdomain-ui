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
