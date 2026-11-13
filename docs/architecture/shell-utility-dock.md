---
kind: architecture
status: built
owner: CT
created: 2026-07-13
last_verified: 2026-11-07
verified_against:
  - "src/shell/AppShell.tsx"
  - "src/shell/UtilityDock.tsx"
  - "src/shell/SettingsModal.tsx"
  - "src/shell/UtilityDockContext.ts"
---

# Shell utility dock

## Agent Index

- **Kind:** architecture
- **Status:** built
- **Read when:** changing AppShell settings, jobs, keybinds, or right-side utility presentation.
- **Search terms:** UtilityDock, SettingsPanel, SettingsModal shim, AppShell, settingsPanels.

## Current behavior

AppShell owns one right-side utility dock for settings, keybinds, and jobs. It
opens as either a non-modal overlay or a persisted, resizable pinned column.
Only one surface is active at a time.

Settings always includes Appearance and accepts typed app panels through
`settingsPanels`. `headerActions` remains app-level.

`useSettingsModal` is a compatibility shim that opens the settings dock.
SettingsModal remains temporarily exported, but the shell does not currently
use it as its presentation path.

## Dock interaction and compatibility remain separate contracts

The active utility surface is ephemeral. Pin state and width persist through
the consumer-configured UI-preferences store. Width defaults to 420 pixels and
is clamped between 320 and 640 pixels. Resizing is available only while pinned.

The dock has no scrim and does not close on an outside click. Escape closes it
unless a nested handler prevents the event's default action. Closing returns
focus to the opening trigger. Focused AppShell and SlideOverPanel tests cover
these interaction boundaries.

Deprecated `drawer` and `rightPanel` slots still render, and standalone
`SettingsModal` remains exported. The deprecated JobsPill `open`, `onViewAll`,
and `hoverPopover` props and AppHeader `jobsOpen`/`jobsHoverPopover` props are
inert. Removing them or migrating downstream consumers remains deferred.

## Concrete deviations

The original settings design specified a centered modal and direct
`useSettingsModal` control. UtilityDock and SettingsPanel supersede that
presentation. Jobs later added `onJobDelete`. Deprecated JobsPill popover props
remain inert.

## Durable decisions

- Keep suite-chrome utility surfaces in AppShell, not templates.
- Keep the dock non-modal and mutually exclusive.
- Persist pin and width through the UI-preferences store.
- Keep app settings panels typed and application behavior consumer-owned.

## Evidence

- Former sources: the May 22 shared-settings-modal spec and the June 2
  right-side utility-panel spec and plan
- Code/tests: `src/shell/AppShell.tsx`, `src/shell/UtilityDock.tsx`,
  `src/shell/SettingsPanel.tsx`, `src/shell/SettingsModalShim.test.tsx`,
  `src/shell/AppShell.utilityDock.test.tsx`
- History: `78d1c1a7`, `2efe9039`, `71697ef7`, and `00850f8c` implement and
  refine the dock; `7dca0c6d` and `b9c456c9` cover panel interaction; `7bf0082`
  adds the job-delete contract.
- Additional evidence: `src/primitives/SlideOverPanel.tsx`,
  `SlideOverPanel.test.tsx`, `src/shell/AppShell.deprecated.test.tsx`, and
  `src/shell/JobsPill.test.tsx`, inspected on 2026-11-13.
