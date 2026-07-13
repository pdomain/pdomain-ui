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

### 2026-07-13 — Retired: stale security research

- **Old paths:** `docs/research/2026-05-22-deep-code-security-review.md`.
- **Outcome:** Deleted as stale point-in-time research.
- **Superseded by:** `docs/context/decisions.md` and current code/tests.
- **Evidence:** The migration review found that each historical finding needs
  fresh verification before action.
- **Rationale kept:** Current security decisions belong in this append-only
  ledger rather than an unverified scan report.
- **Remaining work:** Re-run focused security review when current risk or owner
  demand justifies it.

### 2026-07-13 — Retired: design-handoff research, plan, and spec

- **Old paths:** `docs/research/2026-05-24-design-handoff-port-plan.md`,
  `docs/plans/2026-05-24-pd-ui-design-handoff.md`, and
  `docs/specs/2026-05-24-pd-ui-design-handoff-design.md`.
- **Outcome:** Implemented and deleted after promotion.
- **Superseded by:** `docs/architecture/design-system-composition.md`.
- **Evidence:** PipelineTemplate, template tests, icon exports, the reviewed
  port decisions, and May 24 implementation history.
- **Rationale kept:** The replacement records recon-first porting, icon/token
  policy, and the actual focused-slot composition model.
- **Remaining work:** Consumer migrations remain consumer-repository work.

### 2026-07-13 — Retired: Phase 2 stage-component catalog

- **Old paths:** `docs/specs/2026-05-24-design-handoff-stages-phase-2.md`.
- **Outcome:** Implemented catalog deleted after promotion.
- **Superseded by:** `docs/architecture/stage-component-library.md`.
- **Evidence:** Stage exports/tests and May 24-25 M1-M12 implementation history.
- **Rationale kept:** The replacement records stage ownership, promotion rules,
  ArtifactViewer, and known partial contracts.
- **Remaining work:** Intent-map tracks LabelerCanvas mutation, labeler adoption,
  and SourcePageWorkbench comparison adjudication.

### 2026-07-13 — Retired: component-audit remediation spec and plan

- **Old paths:** `docs/specs/2026-05-28-component-audit-remediation-design.md`
  and `docs/plans/2026-05-28-component-audit-remediation-plan.md`.
- **Outcome:** Broadly implemented audit artifacts deleted after promotion.
- **Superseded by:** `docs/architecture/theme-and-component-quality.md`.
- **Evidence:** May 28 workstream history, runtime theme files, canvas token
  resolution, code/tests, and the conformance red-team.
- **Rationale kept:** The replacement records token, CSS, canvas,
  accessibility, and verification policy.
- **Remaining work:** Intent-map retains CropCard, CoverPlaceholder, live canvas
  theming, and conditional stylesheet-split work.

### 2026-07-13 — Retired: settings-modal and utility-dock specs and plan

- **Old paths:** `docs/specs/2026-05-22-shared-settings-modal-design.md`,
  `docs/specs/2026-06-02-right-side-utility-panels-design.md`, and
  `docs/plans/2026-06-02-right-side-utility-panels.md`.
- **Outcome:** The modal spec was superseded; the utility spec and plan were
  implemented. All three were deleted after promotion.
- **Superseded by:** `docs/architecture/shell-utility-dock.md`.
- **Evidence:** AppShell, UtilityDock, SettingsPanel, compatibility tests, and
  June 2 implementation history.
- **Rationale kept:** The replacement records shell ownership, non-modal dock
  behavior, persistence, panel injection, and compatibility boundaries.
- **Remaining work:** Intent-map tracks three-consumer verification and eventual
  removal of deprecated shell surfaces and props.

### 2026-07-13 — Retired: cross-app common-module spec and plan

- **Old paths:** `docs/specs/2026-06-15-cross-app-common-ui-modules-design.md`
  and `docs/plans/2026-06-15-cross-app-common-ui-modules.md`.
- **Outcome:** Implemented and deleted after promotion.
- **Superseded by:** `docs/architecture/cross-app-common-ui-modules.md`.
- **Evidence:** Six package subpaths, component tests/stories, package contract
  tests, and June 15 implementation history.
- **Rationale kept:** The replacement records the presentation-only boundary,
  export policy, and implementation refinements.
- **Remaining work:** Consumer adoption is deferred in intent-map.

### 2026-07-13 — Retired: Accordion trigger-slot spec and plan

- **Old paths:** `docs/specs/2026-06-16-accordion-trigger-slots-design.md` and
  `docs/plans/2026-06-16-accordion-trigger-slots.md`.
- **Outcome:** Implemented and deleted after promotion.
- **Superseded by:** `docs/architecture/accordion-trigger-slots.md`.
- **Evidence:** Accordion implementation, focused tests, CSS, and commits
  `7c3c755`, `4909693`, and `b28b3d3`.
- **Rationale kept:** The replacement records additive slot order, chevron
  behavior, and event ownership.
- **Remaining work:** Intent-map retains labeler adoption and consumer keyboard
  validation.
