---
Status: active
Owner: CT
Created: 2026-07-13
Last verified: 2026-07-13
Kind: context
---

# Decisions

## Agent Index

- **Kind:** context
- **Status:** active
- **Read when:** checking durable documentation and lifecycle decisions.
- **Search terms:** decisions, retirement, tombstone, architecture promotion.

### 2026-07-13 — Retire the JobStatusPip archive spec

- **Context:** The archived spec described an implemented component and had no
  inbound references.
- **Decision:** Delete `docs/archive/specs/2026-05-21-job-status-pip.md` after
  promoting current behavior to `docs/architecture/job-status-pip.md`.
- **Rationale:** Architecture, code, and tests now preserve the durable API and
  terminology; keeping a second retired copy would create competing truth.
- **Evidence:** `src/primitives/JobStatusPip.tsx`,
  `src/primitives/JobStatusPip.test.tsx`, commits `dee0279` and `780c950`, and
  the docgraph neighbor check with no inbound references.
- **Remaining work:** Resolve the recorded risk that caller props can override
  the default test id if a non-configurable contract is required.

### 2026-07-13 — Retire the kanban archive spec

- **Context:** The archived spec described a shipped component family and had
  no modeled inbound references.
- **Decision:** Delete `docs/archive/specs/2026-05-21-kanban-board.md` after
  promoting current behavior to `docs/architecture/kanban-board.md`.
- **Rationale:** The architecture record keeps the durable controlled-state,
  virtualization, drag, selection, and accessibility decisions. LogViewer now
  links to that record.
- **Evidence:** `src/primitives/kanban/`,
  `src/primitives/kanban/KanbanBoard.test.tsx`, commit `84dcb62`, and the
  docgraph neighbor check with no inbound references.
- **Remaining work:** Consumer-level pointer, keyboard, large-column, and
  announcement verification remains valuable because unit tests mock the
  virtualizer.
