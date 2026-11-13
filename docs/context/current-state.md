---
Status: active
Owner: CT
Created: 2026-07-13
Last verified: 2026-11-13
Kind: context
---

# Current state

## Agent Index

- **Kind:** context
- **Status:** active
- **Read when:** starting pdomain-ui work or checking current risks and active documentation.
- **Search terms:** current state, active work, risks, docgraph migration.

## What matters now

Shipped behavior is the architecture list in the [docs index](../README.md). The release gate is local `make ci`, recorded in [Release and CI pipeline](../architecture/release-and-ci-pipeline.md).

On 2026-11-07, `make ci AI=1` passed on master: formatting, lint with one
existing `react-hooks/incompatible-library` warning, TypeScript and Python
checks, 2,903 unit tests, build, 279 package tests, and code generation.
Theme checks skipped comparison because neither the isolated worktree nor the
main checkout has the adjacent design-system mirror.

On 2026-11-11, `make ci AI=1` exited 0 on `night-audit-residuals`. It passed
the same gates with 2,920 unit tests and 279 package tests. Theme checks
skipped comparison because no design-system mirror exists beside that checkout.

## In-flight work

Open items are the [roadmap](../plans/2026-06-14-pgdp-common-component-backlog.md).
The docs index points at that same list. The active-device issue, plan, and
spec were implemented and retired on 2026-11-10. The PGDP backlog plan is
not fully implemented, so it stays. Shipped settings, workbench, and
slot-primitive behavior was copied into the architecture docs on 2026-11-12.

## Risks

- The lint-deviation register matches the source. Since 2026-11-11 every
  remaining suppression states its reason on the directive or beside it.

- Codegen pins match the registry checked on 2026-11-13:
  `pdomain-book-tools` 0.31.0 and `pdomain-ops` 0.12.2.
  `make update-pdomain-deps` performs that bump.
- `typescript` stays at 6.0.3. typescript-eslint 8.72.2 accepts
  `>=4.8.4 <6.1.0`, and TypeScript 7.0.2 ships no API for that parser yet.
- The historical security review is stale; verify each finding against current
  code before acting on it.
- Missing-section and orphan findings remain advisory during conformance
  migration and are tracked by `docgraph check`.
- LabelerCanvas exposes a mutation-shaped API without mutation behavior.
  Live-theme repaint behavior for mounted Konva canvases needs an owner decision.
- Consumer-level migration to ArtifactViewer and the utility dock is not proven
  by this repository alone.
