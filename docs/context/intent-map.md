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
- Keep the writing-style process and lint-deviation governance active.
- Fix CropCard's empty flag-overlay guard; the current React-element check is
  always true. Source: `docs/specs/2026-05-28-component-audit-remediation-design.md`.
- Replace CoverPlaceholder's remaining inline RGBA foreground and shadow values
  with theme tokens. Source: the component-audit remediation design.
- Verify UtilityDock behavior in `pdomain-ocr-simple-gui`,
  `pdomain-prep-for-pgdp`, and `pdomain-ocr-labeler-spa`, especially canvas
  interaction, pinned reflow, and resize behavior. Current evidence covers the
  pdomain-ui implementation and unit tests only. Source:
  `docs/specs/2026-06-02-right-side-utility-panels-design.md`.

## Deferred work

- Implement LogViewer only after an owner confirms the draft still matches a
  current consumer need.
- Run a separate required-section conformance migration for advisory findings.
- Revisit a richer ColorField picker or URL-addressable settings panels only
  after a consumer demonstrates the need. Source:
  `docs/specs/2026-05-22-shared-settings-modal-design.md` § Open questions.
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
  adoption. Source:
  `docs/specs/2026-06-15-cross-app-common-ui-modules-design.md` § Migration Notes.
- Migrate the labeler accordion wrapper to `AccordionTrigger` slots and validate
  interactive trailing-content keyboard behavior in the consumer. Current
  repository tests prove the shared slots but not labeler adoption. Source:
  `docs/specs/2026-06-16-accordion-trigger-slots-design.md` § Consumer follow-up.
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
  suite-wide state. Source:
  `docs/specs/2026-05-24-design-handoff-stages-phase-2.md` OQ-P2-2.
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
  archive specs; implementation and tests are proven, durable behavior is in
  [JobStatusPip architecture](../architecture/job-status-pip.md) and
  [kanban architecture](../architecture/kanban-board.md), and link-impact checks
  found no inbound references before deletion.
- **still-active:** `docs/specs/2026-05-21-field-field-row.md`,
  `docs/plans/2026-06-14-pgdp-common-component-backlog.md`,
  `docs/process/lint-deviations.md`, `docs/process/writing-style.md`, and
  `docs/research/2026-06-14-pgdp-design-handoff-gap-analysis.md`.
- **needs-owner-review:** `docs/specs/2026-05-21-log-viewer.md` and the stale
  `docs/research/2026-05-22-deep-code-security-review.md`.
- **superseded:** `docs/specs/2026-05-22-shared-settings-modal-design.md`;
  the right-side utility-panel design replaces its presentation model.
- **can-retire:** the implemented design-handoff design and research,
  component-audit design and plan, utility-panel design and plan,
  cross-app-module design and plan, and accordion-slot design and plan. Their
  metadata now declares the evidence-backed lifecycle state; formal promotion
  and retirement of those live-path documents is separate work.
