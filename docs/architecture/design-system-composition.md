---
kind: architecture
status: built
owner: CT
created: 2026-07-13
last_verified: 2026-07-13
---

# Design-system composition

## Agent Index

- **Kind:** architecture
- **Status:** built
- **Read when:** porting design handoffs or changing shared templates, icons, tokens, or composition APIs.
- **Search terms:** design handoff, PipelineTemplate, slots, icon strategy, token reconciliation.

## Current behavior

The library accepts design handoffs after reviewing their identifiers, tokens,
icons, and reuse candidates. Shared components use typed data props and focused
composition slots. Consumers retain deployment logic and stage orchestration.

`PipelineTemplate` owns ProjectInfoBand, StageStrip, project and stage data, and
default tab maps. Its main extension points are `tabsSlot`, `children`, and
focused controls. It does not provide a slot for every visual region.

## Concrete deviations

The original design proposed `header`, `stageStrip`, `tabs`, `body`, and
`bulkBar` slots. It also said templates should avoid pipeline configuration.
The shipped template instead owns several pipeline regions and typed
configuration. The reviewed port-plan also reshaped the provisional issue
decomposition.

## Durable decisions

- Reconcile a design handoff before porting it.
- Prefer named lucide exports; add typed bespoke glyphs only for domain gaps.
- Treat runtime theme files as token truth and avoid unnecessary aliases.
- Prefer typed data plus narrow slots over configuration-heavy or all-slot APIs.
- Keep application orchestration outside shared components.

## Evidence

- Former sources: the May 24 design-handoff spec, implementation plan, and
  reviewed port-plan research
- Code/tests: `src/templates/PipelineTemplate.tsx`,
  `src/templates/PipelineTemplate.test.tsx`, `src/icons/`
- History: commits `8e60ec8`, `c4a8e04`, and the May 24 template/molecule batches
