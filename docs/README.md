---
kind: process
status: active
owner: CT
created: 2026-05-17
last_verified: 2026-07-13
---

# Documentation index

## Agent Index

- **Kind:** process
- **Status:** active
- **Read when:** locating current design, intent, plans, process, or usage guidance.
- **Search terms:** docs index, architecture, context, plans, specs, process, usage.

Current behavior belongs in `architecture/`. Active intent belongs in `specs/`,
`plans/`, and `research/`. `context/` summarizes current state, unresolved
intent, and durable decisions. Retirement promotes current truth, preserves
residual intent, repairs links, records a tombstone, and deletes the old doc by
default. Archive is a last resort.

## Current architecture

- [Accordion trigger slots](architecture/accordion-trigger-slots.md)
- [Canvas and shell extension points](architecture/canvas-and-shell-extension-points.md)
- [Cross-app common UI modules](architecture/cross-app-common-ui-modules.md)
- [Design-system composition](architecture/design-system-composition.md)
- [JobStatusPip](architecture/job-status-pip.md)
- [Kanban board](architecture/kanban-board.md)
- [Shell utility dock](architecture/shell-utility-dock.md)
- [Stage component library](architecture/stage-component-library.md)
- [Theme and component quality](architecture/theme-and-component-quality.md)

## Authored context

- [Current state](context/current-state.md)
- [Intent map](context/intent-map.md)
- [Decisions and retirement tombstones](context/decisions.md)

## Active design and execution

### Specifications

- [Field / FieldRow](specs/2026-05-21-field-field-row.md) — active and partially implemented
- [LogViewer](specs/2026-05-21-log-viewer.md) — draft; continued demand needs owner confirmation

### Plans

- [PGDP common-component backlog](plans/2026-06-14-pgdp-common-component-backlog.md)

### Research

- [PGDP design-handoff gap analysis](research/2026-06-14-pgdp-design-handoff-gap-analysis.md)

## Decisions

- [Slot-based stage primitives](decisions/2026-05-25-slot-based-stage-primitives.md)

## Process

- [Writing style](process/writing-style.md)
- [Lint deviations](process/lint-deviations.md)

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
