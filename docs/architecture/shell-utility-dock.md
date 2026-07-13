---
kind: architecture
status: built
owner: CT
created: 2026-07-13
last_verified: 2026-07-13
---

# Shell utility dock

## Agent Index

- **Kind:** architecture
- **Status:** built
- **Read when:** changing AppShell settings, jobs, keybinds, or right-side utility presentation.
- **Search terms:** UtilityDock, SettingsPanel, SettingsModal shim, AppShell, settingsPanels.

## Current behavior

AppShell owns one right-side utility dock for settings, keybinds, and jobs. It
opens as a non-modal overlay or a persisted, resizable pinned column. One
surface is active at a time. Settings always includes Appearance and accepts
typed app panels through `settingsPanels`; `headerActions` remains app-level.

`useSettingsModal` is a compatibility shim that opens the settings dock.
SettingsModal remains temporarily exported but is not the shell's current
presentation path.

## Concrete deviations

The original settings design specified a centered modal and direct
`useSettingsModal` control. UtilityDock and SettingsPanel supersede that
presentation. Jobs later added `onJobDelete`; deprecated JobsPill popover props
remain inert.

## Durable decisions

- Keep suite-chrome utility surfaces in AppShell, not templates.
- Keep the dock non-modal and mutually exclusive.
- Persist pin and width through the UI-preferences store.
- Keep app settings panels typed and application behavior consumer-owned.

## Evidence

- Docs: `docs/specs/2026-05-22-shared-settings-modal-design.md`,
  `docs/specs/2026-06-02-right-side-utility-panels-design.md`,
  `docs/plans/2026-06-02-right-side-utility-panels.md`
- Code/tests: `src/shell/AppShell.tsx`, `src/shell/UtilityDock.tsx`,
  `src/shell/SettingsPanel.tsx`, `src/shell/SettingsModalShim.test.tsx`,
  `src/shell/AppShell.utilityDock.test.tsx`
- History: June 2 utility-dock implementation commits and `7bf0082`
