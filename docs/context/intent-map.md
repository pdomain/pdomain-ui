---
Status: active
Owner: CT
Created: 2026-07-13
Last verified: 2026-11-12
Kind: context
---

# Intent map

## Agent Index

- **Kind:** context
- **Status:** active
- **Read when:** deciding what remains active, deferred, rejected, or blocked.
- **Search terms:** intent, active bets, deferred work, owner decisions, legacy sweep.

## Active bets

The ordered list is the [roadmap](../plans/2026-06-14-pgdp-common-component-backlog.md).
Active library work there is the unbuilt review, gate, artifact, and compare
components. The Field help slot is shipped.

Keep `writing-docs` plugin routing and lint-deviation governance active.
[Lint deviations](../process/lint-deviations.md).

## Deferred work

Deferred consumer and compatibility work is the roadmap section
[Deferred until a consumer asks](../plans/2026-06-14-pgdp-common-component-backlog.md#deferred-until-a-consumer-asks).

One documentation task stays here rather than on that product list. Run a
separate required-section conformance migration for advisory findings.

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

The questions, with their specs, are in the roadmap section
[Owner decisions](../plans/2026-06-14-pgdp-common-component-backlog.md#owner-decisions).

They cover dep-refresh auto-land after commit `0aa42b5`, LogViewer demand,
the unshipped consumer-canary prefs, LabelerCanvas `onBlocksChange`,
labeler ArtifactViewer adoption, live Konva theme repaint, and
`SourcePageWorkbench` `beforeImageUrl`.

The roadmap stays one plan. Split a component into its own spec when someone
starts building it.

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
