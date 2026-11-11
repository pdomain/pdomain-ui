---
kind: process
status: active
owner: CT
created: 2026-05-17
last_verified: 2026-11-10
---

# Documentation index

## Agent Index

- **Kind:** process
- **Status:** active
- **Read when:** locating current design, intent, plans, process, or usage guidance.
- **Search terms:** docs index, remaining work, architecture, context, plans, issues.

Current behavior belongs in `architecture/`. Active intent belongs in `specs/`,
`plans/`, and `research/`. `context/` summarizes current state, unresolved
intent, and durable decisions.

Retirement promotes current truth and preserves residual intent. It also
repairs links, records a tombstone, and deletes the old doc by default. Use the
archive only as a last resort.

## Current architecture

- [Accordion trigger slots](architecture/accordion-trigger-slots.md)
- [Canvas and shell extension points](architecture/canvas-and-shell-extension-points.md)
- [Generated type contract](architecture/codegen-contract.md)
- [Cross-app common UI modules](architecture/cross-app-common-ui-modules.md)
- [Design-system composition](architecture/design-system-composition.md)
- [JobStatusPip](architecture/job-status-pip.md)
- [Kanban board](architecture/kanban-board.md)
- [Release and CI pipeline](architecture/release-and-ci-pipeline.md)
- [Shell utility dock](architecture/shell-utility-dock.md)
- [Stage component library](architecture/stage-component-library.md)
- [Theme and component quality](architecture/theme-and-component-quality.md)

## Authored context

- [Current state](context/current-state.md)
- [Intent map](context/intent-map.md)
- [Decisions and retirement tombstones](context/decisions.md)

## Remaining work

Shipped behavior is the architecture list above. These items are still open.

- The PGDP common-component backlog is partial. The settings kit and `WorkbenchLayout` are in the tree. `package.json` has no `./stages/Projects` export. The inheritance banner, stage-settings audit, review foundation, gate and pack panels, and two-image compare modes are absent. [Plan](plans/2026-06-14-pgdp-common-component-backlog.md). Source: [gap analysis](research/2026-06-14-pgdp-design-handoff-gap-analysis.md).
- `Field` has no help slot. [Spec](specs/2026-05-21-field-field-row.md).
- LogViewer has no component. Continued demand needs an owner decision. [Spec](specs/2026-05-21-log-viewer.md).
- Key sequences such as `g p` stay deferred until a consumer names one. [Plan](plans/2026-07-21-shortcut-sequences-conditional.md). [Issue](issues/2026-07-15-useshortcuts-chord-sequences.md).
- The dep-refresh auto-land spec targets the GitHub workflows deleted in `0aa42b5` (2026-09-13). It needs an owner decision. [Spec](specs/2026-07-16-dep-refresh-auto-land-design.md).
- CropCard's empty overlay guard, CoverPlaceholder's inline RGBA values, LabelerCanvas's inert mutation contract, and live theme repaint are recorded and still open. [Intent map](context/intent-map.md).

## Decisions

- [Slot-based stage primitives](decisions/2026-05-25-slot-based-stage-primitives.md)

## Process

- New durable prose uses `writing-docs:write-readably`; existing prose uses
  `writing-docs:edit-for-readability`.
- [Lint deviations](process/lint-deviations.md)
- [Issue reports](issues/README.md) — the `docs/issues/` convention and template

## Usage

- [Consumer bootstrap](usage/consumer-bootstrap.md)

## Repository guidance

- [Project README](../README.md)
- [Agent entrypoint](../AGENTS.md)
- [Claude and workspace guidance](../CLAUDE.md)
- [Codex context](../CODEX.md)
- [Repository conventions](../CONVENTIONS.md)
- [Docgraph governance](../DOCGRAPH.md)
- [Changelog](../CHANGELOG.md)
