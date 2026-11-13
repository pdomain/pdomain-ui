---
kind: architecture
status: built
owner: CT
created: 2026-07-13
last_verified: 2026-11-12
verified_against:
  - "package.json"
  - "src/records/index.ts"
  - "src/source-intake/index.ts"
  - "src/viewport/index.ts"
  - "src/settings/index.ts"
  - "src/status/index.ts"
  - "src/workbench/index.ts"
  - "src/workbench/WorkbenchLayout.tsx"
  - "src/index.ts"
---

# Cross-app common UI modules

## Agent Index

- **Kind:** architecture
- **Status:** built
- **Read when:** using records, source intake, viewport, settings, status, or workbench modules.
- **Search terms:** records, source-intake, viewport, settings, status, workbench, package subpaths.

## Six subpaths provide seven presentation families

Six public subpaths provide seven presentation families: records, list-toolbar controls, source intake, viewport, settings, operation status, and workbench layout.

Records also contains the list-toolbar controls.

Each family owns typed props, slots, accessibility, tests, stories, and package contracts.

Records, source-intake, settings, and status components own loading, error, or empty presentation where their APIs define those states.

Viewport and workbench remain layout and interaction surfaces.

Consumers own loading, mutation, policies, and state machines.

## The settings kit and workbench layout are public

The settings family exports `SettingsCard`, `SettingsRow`, `SettingsValue`, `SettingSlider`, `SettingsAsyncSection`, `PreferencePathRow`, `StatusActionRow`, and `GuidancePanel`.

`WorkbenchLayout` exports with `InspectorPanel` and `DetailPanelShell`.

Consumers can import every settings component from `./settings` or the root barrel.

`@pdomain/pdomain-ui/primitives` re-exports only `SettingsCard`, `SettingsRow`, `SettingsValue`, and `SettingSlider`.

`package.json` publishes `./settings` and `./workbench`.

`WorkbenchLayout` requires a `viewer` slot.

Optional slots are `header`, `toolbar`, `navigation`, `inspector`, and `footer`.

Navigation defaults to `16rem`.

The inspector defaults to `22rem`.

The layout picks one of four grids from which of those side slots are present.

The four grids are viewer only, navigation plus viewer, viewer plus inspector, or all three.

`SettingsInheritanceBanner` is not part of this kit.

These components are also absent: `StageLifecycleBanner`, `ReviewFilterToolbar`, `ReviewPageGrid`, `InlineReviewEditorShell`, `GatePanel`, `ConfirmAdvancePanel`, and `ArtifactTree`.

The [roadmap](../plans/2026-06-14-pgdp-common-component-backlog.md) tracks them.

`FilterToolbar`, `ThumbGrid`, `Thumbnail`, `TextReviewPane`, `QualityBanner`, `BuildPackagePanel`, and `RunAllDirtyPanel` already ship.

`HierarchyTreePanel` is a block tree, not a file tree of pack artifacts.

## Settings controls preserve caller-owned values and accessibility

`SettingsRow` supplies label, description, and error associations to its
control slot. It preserves explicit accessible names and descriptions and
propagates disabled state. For cloned controls, a row error forces
`aria-invalid=true`. Render-function controls receive the invalid flag and
apply their own markup. The consumer still owns the setting value and update.

`SettingSlider` is controlled. It clamps values to the configured bounds,
provides unit-aware value text, and handles arrow, Home, and End keys. Focused
settings tests cover integer stepping, clamp boundaries, associations, disabled
controls, and default unit text. Decimal-step and Home/End acceptance remain
unverified by dedicated assertions; those remaining audits stay in the roadmap.

## How the shipped modules differ from the design

Implementation review refined the design. It did not redirect it.

- Selectable record actions use grid semantics.
- Source removal requires text labels.
- Source intake restored its selected-source label API.
- WorkbenchLayout uses slot-aware pinned grid areas.

The June 2026 backlog asked the workbench shell for a controls panel and a sidecar.

The shipped slots that cover those roles are `toolbar`, `navigation`, and `inspector`.

No second workbench shell exists.

## Decisions that govern these modules

- Use public subpaths for coherent module families.
- Keep modules presentation-only and typed.
- Require tests, stories, Vite entries, package exports, and contract tests.
- Promote only patterns shared across stages or consumer applications.

## Code, tests, and history for these modules

- Former sources: the June 15 cross-app common-module spec and plan
- Code/tests: `src/records/`, `src/source-intake/`, `src/viewport/`,
  `src/settings/`, `src/status/`, `src/workbench/`,
  `src/workbench/WorkbenchLayout.tsx`, `src/workbench/WorkbenchLayout.test.tsx`,
  `tests/build.contract.test.ts`
- Checked 2026-11-12 by reading `package.json`, `src/settings/index.ts`,
  `src/workbench/WorkbenchLayout.tsx`, and `src/index.ts`. The test suite was
  not re-run for this documentation pass.
- History: commit `ed0f56f` and June 15 review-fix commits

Settings contract evidence: `src/settings/SettingsRow.tsx`,
`src/settings/SettingSlider.tsx`, and `src/settings/SettingsKit.test.tsx`;
implementation/refinement commits `ed0f56f7` and `cfbdd6f2`. Source and test
inspection on 2026-11-13 does not establish adoption in other applications.
