---
kind: architecture
status: built
owner: CT
created: 2026-07-13
last_verified: 2026-07-13
---

# Cross-app common UI modules

## Agent Index

- **Kind:** architecture
- **Status:** built
- **Read when:** using records, source intake, viewport, settings, status, or workbench modules.
- **Search terms:** records, source-intake, viewport, settings, status, workbench, package subpaths.

## Current behavior

Six public subpaths provide seven presentation families: records also contains
list-toolbar controls, alongside source intake, viewport, settings, operation
status, and workbench layout.

Each family owns typed props, slots, accessibility, tests, stories, and package
contracts. Records, source-intake, settings, and status components own loading,
error, or empty presentation where their APIs define those states. Viewport and
workbench remain layout and interaction surfaces.

Consumers own loading, mutation, policies, and state machines.

## Concrete deviations

Implementation review refined rather than redirected the design. Selectable
record actions use grid semantics. Source removal requires text labels. Source
intake restored its selected-source label API. WorkbenchLayout uses slot-aware
pinned grid areas.

## Durable decisions

- Use public subpaths for coherent module families.
- Keep modules presentation-only and typed.
- Require tests, stories, Vite entries, package exports, and contract tests.
- Promote only patterns shared across stages or consumer applications.

## Evidence

- Former sources: the June 15 cross-app common-module spec and plan
- Code/tests: `src/records/`, `src/source-intake/`, `src/viewport/`,
  `src/settings/`, `src/status/`, `src/workbench/`, `tests/build.contract.test.ts`
- History: commit `ed0f56f` and June 15 review-fix commits
