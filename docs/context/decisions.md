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

### 2026-07-13 — Keep application behavior outside shared UI modules

- **Decision:** Stage and cross-app modules own typed presentation,
  accessibility, slots, tests, and package contracts. Consumers own stores,
  routes, loading, mutation, backend policy, and state machines.
- **Rationale:** This keeps pdomain-ui reusable across applications and avoids
  embedding stage vocabulary or orchestration in shared components.
- **Evidence:** `src/stages/`, the six common-module subpaths,
  `docs/architecture/stage-component-library.md`, and
  `docs/architecture/cross-app-common-ui-modules.md`.
- **Remaining work:** Narrow the PGDP backlog and resolve LabelerCanvas's inert
  mutation contract.

### 2026-07-13 — Use focused composition slots

- **Decision:** Prefer typed data props with narrow composition slots. A shared
  template may own stable regions and defaults when that is the shipped API.
- **Rationale:** The implemented PipelineTemplate is clearer and more coherent
  than the obsolete proposal to expose every visual region as a slot.
- **Evidence:** `src/templates/PipelineTemplate.tsx`, its tests, the reviewed
  port-plan, and `docs/architecture/design-system-composition.md`.
- **Remaining work:** None for the retired proposal; future template changes
  follow the implemented composition model.

### 2026-07-13 — Put suite utilities in one shell-owned dock

- **Decision:** Settings, keybinds, and jobs share one non-modal UtilityDock
  owned by AppShell. Injected settings panels remain typed; header actions stay
  application-level; the settings-modal API is compatibility-only.
- **Rationale:** One mutually exclusive dock preserves main interaction and
  supports overlay or persisted pinned presentation without reviving template
  right-panel slots.
- **Evidence:** `src/shell/AppShell.tsx`, UtilityDock and SettingsPanel tests,
  and `docs/architecture/shell-utility-dock.md`.
- **Remaining work:** Prove consumer migrations and decide only on demonstrated
  demand for settings deep links or a richer color picker.

### 2026-07-13 — Keep theme truth in runtime CSS

- **Decision:** Runtime token and primitive CSS files are authoritative. Keep a
  small semantic color palette, add reusable structural scales, and resolve
  token colors before painting Konva canvases.
- **Rationale:** This prevents phantom tokens, stale documentation mirrors, and
  CSS-variable strings reaching non-DOM renderers.
- **Evidence:** `theme/tokens.css`, `theme/primitives.css`,
  `src/canvas/resolveToken.ts`, and
  `docs/architecture/theme-and-component-quality.md`.
- **Remaining work:** Fix the recorded CropCard/CoverPlaceholder residuals and
  decide whether mounted canvases must repaint on live theme changes.
