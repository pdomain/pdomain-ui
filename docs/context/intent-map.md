---
Status: active
Owner: CT
Created: 2026-07-13
Last verified: 2026-07-13
Kind: context
---

# Intent map

## Agent Index

- **Kind:** context
- **Status:** active
- **Read when:** deciding what remains active, deferred, rejected, or blocked.
- **Search terms:** intent, active bets, deferred work, owner decisions, legacy sweep.

## Active bets

- Complete or deliberately narrow the remaining PGDP common-component backlog.
- Decide whether to implement the Field help slot described in the active spec.
- Keep `writing-docs` plugin routing and lint-deviation governance active.
- Fix CropCard's empty flag-overlay guard; the current React-element check is
  always true. Source: the former May 28 audit, promoted to
  [theme and component quality](../architecture/theme-and-component-quality.md).
- Replace CoverPlaceholder's remaining inline RGBA foreground and shadow values
  with theme tokens. Source: the component-audit remediation design.
- Verify UtilityDock behavior in `pdomain-ocr-simple-gui`,
  `pdomain-prep-for-pgdp`, and `pdomain-ocr-labeler-spa`, especially canvas
  interaction, pinned reflow, and resize behavior. Current evidence covers only
  the pdomain-ui implementation and unit tests. Source: the former utility
  design, promoted to [shell utility dock](../architecture/shell-utility-dock.md).

## Deferred work

- Implement LogViewer only after an owner confirms the draft still matches a
  current consumer need.
- Run a separate required-section conformance migration for advisory findings.
- Revisit a richer ColorField picker or URL-addressable settings panels only
  after a consumer demonstrates the need. Source: the former shared-settings
  spec; current truth is [shell utility dock](../architecture/shell-utility-dock.md).
- Remove AppShell's deprecated `drawer` and `rightPanel` compatibility surface
  only after downstream consumers migrate. Current code retains both for
  compatibility. Source: the right-side utility-panel design § Constraints.
- Remove the SettingsModal shim/export and inert JobsPill/AppHeader compatibility
  props after their compatibility window and consumer migration complete.
  Current shell code still exports the shim and accepts ignored legacy props.
  Source: `docs/architecture/shell-utility-dock.md`.
- Migrate consumers to the records, source-intake, viewport, settings, status,
  and workbench subpaths after app-specific integration plans validate each
  boundary. Current evidence proves package exports and library tests, not
  adoption. Source: the former common-module spec's migration notes; current
  truth is [cross-app common UI](../architecture/cross-app-common-ui-modules.md).
- Migrate the labeler accordion wrapper to `AccordionTrigger` slots and validate
  interactive trailing-content keyboard behavior in the consumer. Current
  repository tests prove the shared slots but not labeler adoption. Source: the
  former Accordion spec's consumer follow-up; current truth is
  [Accordion trigger slots](../architecture/accordion-trigger-slots.md).
- Split `theme/primitives.css` only if continued growth makes the single file
  unwieldy; preserve one runtime entry and the existing sync gate. Current
  practice still uses one authoritative primitive stylesheet. Source: the
  component-audit remediation plan's CSS coordination guidance.

## Rejected directions

- Do not retain implemented component specs in `docs/archive/` after their
  durable behavior is captured in architecture and decisions.
- Do not let injected settings panels own shell header actions; `headerActions`
  stays app-level. Source: the superseded shared-settings-modal design.
- Do not centralize stage-local stores in `src/stores/`; keep that surface for
  suite-wide state. Source: the former Phase 2 catalog OQ-P2-2; current truth is
  [stage component architecture](../architecture/stage-component-library.md).
- Do not add brand/info token aliases without a new token RFC. Source: the
  component-audit remediation design § Out of scope / open questions.

## Blocked (waiting on)

None.

## Needs owner decision

- Confirm whether continued consumer demand justifies implementing the draft
  LogViewer contract.
- Decide whether to close the consumer-canary prefs direction: the proposed
  `system` theme and local persistence adapter never shipped, and the utility
  dock superseded the shared centered-modal direction.
- Decide whether the remaining PGDP backlog should stay one plan or split into
  smaller active specs.
- Decide whether LabelerCanvas should implement drag-to-create and handle
  mutation or remove/narrow its inert `onBlocksChange` contract. Source: the
  Phase 2 stage-component catalog.
- Confirm whether the labeler SPA migrated its annotation chrome to
  ArtifactViewer or still needs a cross-repository migration issue. Source:
  the Phase 2 catalog OQ-P2-3.
- Decide whether mounted Konva canvases must repaint immediately on a live
  theme change; if so, add an explicit theme-change subscription. Source: the
  component-audit remediation design § Out of scope / open questions.
- Adjudicate SourcePageWorkbench's retained but unused `beforeImageUrl`: either
  implement the promised compare contract or remove/narrow the prop. Current
  code explicitly discards it, while later PGDP backlog work proposes compare
  modes. Source: the Phase 2 stage-component catalog and component-audit design.

## Legacy-unverified sweep

- **can-retire (completed 2026-07-13):** the former JobStatusPip and kanban
  archive specs. Implementation and tests are proven. Durable behavior is in
  [JobStatusPip architecture](../architecture/job-status-pip.md) and
  [kanban architecture](../architecture/kanban-board.md). Link-impact checks
  found no inbound references before deletion.
- **still-active:** `docs/specs/2026-05-21-field-field-row.md`,
  `docs/plans/2026-06-14-pgdp-common-component-backlog.md`,
  `docs/process/lint-deviations.md` and
  `docs/research/2026-06-14-pgdp-design-handoff-gap-analysis.md`.
- **needs-owner-review:** `docs/specs/2026-05-21-log-viewer.md`; the former May
  22 security review was stale and has been closed into the decisions context.
- **retired (completed 2026-07-13):** the former design-handoff research, plan,
  and specs; component-audit spec and plan; shared-settings-modal spec;
  utility-panel spec and plan; cross-app-module spec and plan; and
  Accordion-slot spec and plan. Current truth is in
  [design-system composition](../architecture/design-system-composition.md),
  [theme and component quality](../architecture/theme-and-component-quality.md),
  [shell utility dock](../architecture/shell-utility-dock.md),
  [stage component library](../architecture/stage-component-library.md),
  [cross-app common UI modules](../architecture/cross-app-common-ui-modules.md),
  and [Accordion trigger slots](../architecture/accordion-trigger-slots.md).
  Every deleted path and retained residual is recorded in the grouped
  [decisions tombstones](decisions.md).
