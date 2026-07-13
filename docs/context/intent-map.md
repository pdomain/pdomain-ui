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

## Deferred work

- Implement LogViewer only after an owner confirms the draft still matches a
  current consumer need.
- Run a separate required-section conformance migration for advisory findings.

## Rejected directions

- Do not retain implemented component specs in `docs/archive/` after their
  durable behavior is captured in architecture and decisions.

## Blocked (waiting on)

None.

## Needs owner decision

- Confirm whether the unimplemented LogViewer remains wanted.
- Decide whether the remaining PGDP backlog should stay one plan or split into
  smaller active specs.

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
