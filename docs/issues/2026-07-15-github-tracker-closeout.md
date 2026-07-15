---
Status: retired
Owner: CT
Created: 2026-07-15
Last verified: 2026-07-15
Kind: issue
Level: I1
---

# GitHub issue tracker closeout — 53 resolved issues migrated to the repo

## Agent Index

- **Kind:** issue
- **Status:** retired
- **Level:** I1
- **Last verified:** 2026-07-15
- **Resolution:** Resolved
- **Severity:** Low — historical record, no live defect
- **Affected version:** `@pdomain/pdomain-ui` through 2026-05-25
- **Read when:** looking up what a now-deleted `pdomain/pdomain-ui` GitHub issue
  number referred to, or confirming that a past audit finding was resolved.
- **Search terms:** github issues, closeout, audit, retired issues, tracker
  migration, issue ledger.
- **Relates to:** [decisions](../context/decisions.md),
  [issues README](./README.md)

## Summary

This ledger records the 53 closed issues from the `pdomain/pdomain-ui` GitHub
tracker, which were migrated into the repository and then deleted from GitHub on
2026-07-15. Every issue was already closed and its work already shipped. The
durable behavior lives in the code, tests, and `docs/architecture/`; this doc
keeps the issue numbers, titles, and outcomes citable after the GitHub records
are gone.

The 53 issues break down as 28 fixed bugs (mostly the May 2026 audit sweep), 16
implemented features and one spec, and 9 completed chores or tasks.

## Impact

- No live impact. All 53 issues were resolved before this migration.
- The `pdomain/pdomain-ui` GitHub tracker now holds zero issues.
- Anyone following an old issue link (for example `#25`) finds it here instead.

## Environment / versions

```
Repo:        pdomain/pdomain-ui
Issues:      #1–#56 (closed subset; #16, #51, #52 never existed)
Closed span: 2026-05-21 .. 2026-05-25
Migrated:    2026-07-15
Backup:      full body + comments captured before deletion
```

## Evidence

The migrated issues, with outcome.

Outcome key: **Fixed** (bug resolved), **Implemented** (feature or spec
shipped), **Done** (chore or task completed). `kind` is the GitHub `kind:` label
where one was set, else `task`.

| # | Kind | Outcome | Closed | Title |
|---|---|---|---|---|
| #1 | task | Done | 2026-05-22 | bug: SettingsSlot font-scale slider jumps and dismisses popover during drag |
| #2 | task | Done | 2026-05-22 | feat: add Playwright e2e tests targeting Storybook build |
| #3 | task | Done | 2026-05-25 | Add PD_NPM_DISPATCH_TOKEN secret to enable auto-publish to pd-index-npm |
| #4 | feature-request | Implemented | 2026-05-22 | feat(canvas): expose pointer-events slot for multi-mode drag interception |
| #5 | feature-request | Implemented | 2026-05-22 | feat(shell): AppShell uiPrefs load/persist via /api/ui-prefs backend route |
| #6 | feature-request | Implemented | 2026-05-22 | feat(shell): SuiteSiblingsProvider fetchInstalled/postLaunch — pd-ocr-ops /api/suite/* contract |
| #7 | feature-request | Implemented | 2026-05-22 | icons: add Square, Keyboard, LayoutList, List, GitBranch, PanelRightClose, FolderOpen + --overlay-scrim token |
| #8 | chore | Done | 2026-05-22 | chore: document all lint-rule suppressions (lint-deviations.md) |
| #9 | spec | Implemented | 2026-05-22 | spec: shared app-settings modal and AppShell header-actions slot |
| #10 | feature-request | Implemented | 2026-05-21 | Publish KanbanBoard/KanbanColumn/PageChip + fix alpha transitive deps |
| #11 | chore | Done | 2026-05-25 | Set PD_NPM_DISPATCH_TOKEN secret so release.yml auto-dispatches registry publish |
| #12 | feature-request | Implemented | 2026-05-22 | feat(canvas): expose Konva image-node ref for consumer Transformer attachment |
| #13 | feature-request | Implemented | 2026-05-22 | feat(canvas): selection-slot layer should be listening=true with click forwarding |
| #14 | feature-request | Implemented | 2026-05-22 | feat(shell): AppShell footer slot for status/footer bar |
| #15 | task | Done | 2026-05-22 | pd-ui export drift breaks pd-ocr-simple-gui frontend build |
| #17 | feature | Implemented | 2026-05-22 | shared-settings-modal: ColorField primitive |
| #18 | feature | Implemented | 2026-05-22 | shared-settings-modal: widen UIPrefsConfig.persistCommon + store color setters |
| #19 | feature | Implemented | 2026-05-22 | shared-settings-modal: SettingsModal + built-in AppearancePanel |
| #20 | feature | Implemented | 2026-05-23 | shared-settings-modal: AppShell headerActions + settingsPanels + useSettingsModal |
| #21 | feature | Implemented | 2026-05-25 | shared-settings-modal: rewire SettingsSlot to the modal, remove Popover |
| #22 | bug | Fixed | 2026-05-25 | [audit][high] Malformed OCR word boxes can crash canvas rendering |
| #23 | bug | Fixed | 2026-05-25 | [audit][high] useStageCall enters warming state but never retries |
| #24 | bug | Fixed | 2026-05-25 | [audit][high] Release checkout exposes a write-scoped token to install/build steps |
| #25 | bug | Fixed | 2026-05-25 | [audit][high] Codegen executes remotely fetched Python wheels without hash verification |
| #26 | bug | Fixed | 2026-05-23 | [audit][high] Release tag name is interpolated directly into shell |
| #27 | bug | Fixed | 2026-05-24 | [audit][high] make ci is not clean-checkout reproducible |
| #28 | bug | Fixed | 2026-05-25 | [audit][high] Published /testids subpath is an empty public contract |
| #29 | bug | Fixed | 2026-05-25 | [audit][high] Unverified OCR/page metadata can force huge Konva canvas allocation |
| #30 | bug | Fixed | 2026-05-25 | [audit][medium] launcherSlot does not control launcher placement or visibility |
| #31 | bug | Fixed | 2026-05-25 | [audit][medium] Sibling launches open tabs with opener access |
| #32 | bug | Fixed | 2026-05-25 | [audit][medium] Settings popover cannot be dismissed by outside click |
| #33 | bug | Fixed | 2026-05-25 | [audit][medium] Job config dialog ignores Radix close events |
| #34 | bug | Fixed | 2026-05-25 | [audit][medium] Canvas can show a stale page image after src changes or fails |
| #35 | bug | Fixed | 2026-05-25 | [audit][medium] Drag throttling is ineffective and can flood renders |
| #36 | bug | Fixed | 2026-05-25 | [audit][medium] useLongJob shows stale job state when job ID clears or changes |
| #37 | bug | Fixed | 2026-05-25 | [audit][medium] UI prefs load can overwrite edits made during hydration |
| #38 | bug | Fixed | 2026-05-25 | [audit][medium] Preference persist failures are silently ignored |
| #39 | bug | Fixed | 2026-05-25 | [audit][medium] Worklist Enter can select an out-of-range index after filtering |
| #40 | chore | Done | 2026-05-25 | [audit][medium] Release workflow uses mutable third-party action tags |
| #41 | bug | Fixed | 2026-05-25 | [audit][medium] Release publishes without running package/codegen/test gates |
| #42 | bug | Fixed | 2026-05-25 | [audit][medium] Storybook E2E server depends on undeclared npx serve |
| #43 | bug | Fixed | 2026-05-25 | [audit][medium] Vulnerable dev dependency esbuild@0.21.5 |
| #44 | bug | Fixed | 2026-05-25 | [audit][medium] Vulnerable dev dependency vite@5.4.21 |
| #45 | bug | Fixed | 2026-05-25 | [audit][medium] Vulnerable dev dependency uuid@9.0.1 |
| #46 | bug | Fixed | 2026-05-25 | [audit][medium] Shell docs and barrel disagree on hook exports |
| #47 | bug | Fixed | 2026-05-25 | [audit][low] Settings segmented controls expose no selected state to assistive tech |
| #48 | bug | Fixed | 2026-05-25 | [audit][low] Field errors are not associated with their inputs |
| #49 | bug | Fixed | 2026-05-25 | [audit][low] Shell string used for git status path |
| #50 | bug | Fixed | 2026-05-25 | [audit][low] Story coverage gate exempts exported public worklist components |
| #53 | feature-request | Implemented | 2026-05-24 | Move react-konva to peerDependencies at ^19.0.0; update react/react-dom peer range to ^19 |
| #54 | feature-request | Implemented | 2026-05-23 | LauncherTile: add noopener,noreferrer to window.open _blank call |
| #55 | chore | Done | 2026-05-24 | Add ci.yml workflow (push/PR) — no CI currently runs on main |
| #56 | task | Done | 2026-05-25 | Run make format once + wire format-check into make ci |

Before deletion, the full body and comment text of each issue was captured to a
migration backup held outside the repo. This ledger and the architecture docs
are the durable in-repo record; they keep issue numbers, titles, and outcomes,
not the full original bodies. The durable design that these issues produced is
recorded in
`docs/architecture/` — for example the canvas and shell slots
(`canvas-and-shell-extension-points.md`), the settings modal and shared UI
modules (`design-system-composition.md`, `cross-app-common-ui-modules.md`), the
Kanban board (`kanban-board.md`), and the codegen contract
(`codegen-contract.md`).

## Root-cause hypotheses

Not applicable. This is a closeout record, not a defect report. Each listed
issue carried its own root-cause analysis while open; that analysis was resolved
before closure.

## Defects to fix

None. All 53 issues are closed. Open follow-up work, where any remains, lives in
`docs/context/intent-map.md`, not in this retired ledger.

## Next steps

None for this ledger. It is a terminal record. New issues follow the convention
in [README.md](./README.md).

## What is NOT broken

- The shipped behavior. Every feature and fix in this list is in the codebase
  and covered by tests.
- The architecture docs. They remain the source of truth for durable behavior;
  this ledger only points back to them.

## Resolution

**Resolved — migrated and deleted.** The 53 issues were captured from GitHub,
recorded here, and then permanently deleted from the `pdomain/pdomain-ui`
tracker on 2026-07-15. See the tombstone in
[decisions.md](../context/decisions.md).
