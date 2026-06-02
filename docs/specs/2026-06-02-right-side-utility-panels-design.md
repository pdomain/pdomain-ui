# Right-side utility panels (Settings / Keybinds / Jobs)

- **Status:** Approved design — pending implementation plan
- **Date:** 2026-06-02
- **Repo:** pdomain-ui (+ consumer migration: pdomain-ocr-simple-gui, pdomain-prep-for-pgdp, pdomain-ocr-labeler-spa)
- **Supersedes (presentation only):** `docs/specs/2026-05-22-shared-settings-modal-design.md` — Settings moves from a centered modal to a right-side panel. The `settingsPanels` API and Appearance panel are preserved.

## Problem

Three suite-chrome surfaces are currently surfaced as transient overlays:

- **Settings** — a centered tabbed `SettingsModal` (gear in the header), with a `settingsPanels` prop for app-injected panels and a built-in Appearance panel.
- **Keyboard shortcuts** — a `ShortcutsCheatsheet` opened from `ShortcutsHelpButton`.
- **Jobs** — a `JobsPill` hover popover plus a `JobsDrawer`.

We want all three to be **proper right-side panels** instead of hover/popover/modal surfaces.

## Constraints / context

- **OQ-12** converged AppShell to a 3-zone shell (header + rail + main); the `drawer` and `rightPanel` grid-zone props are deprecated (kept only for back-compat). Right-side *template* content is meant to live in templates, not shell zones.
- These three surfaces are **suite chrome** (header-triggered, app-agnostic), so they belong to the **shell**, not a template. This design adds a new shell-owned right-side **utility dock** rather than reviving the deprecated grid `rightPanel` prop. When pinned, the dock drives `--shell-right-w` dynamically from the shell — it does not use the deprecated `rightPanel` slot.
- No CVA, no hex literals (all colors `var(--token)`), icons only from `src/icons/`, stores are factories, strict TS. (See repo CLAUDE.md.)

## Decisions

1. **Layout:** overlay **slide-over** from the right by default — floats over main's right portion.
2. **No blocking scrim on any panel.** Main stays fully interactive while a panel is open.
3. **Close semantics:** Esc, the panel's ✕ button, or toggling the active trigger. **Outside-click never closes** (so clicking into main to keep working is safe).
4. **Pin mode:** a pin toggle switches the dock from slide-over (overlay) to **pinned** — a real right column that shrinks main and is **resizable** by dragging its left edge. Pin state is **dock-level**.
5. **Panel model:** **one panel at a time** on the right edge (mutual exclusion). Settings + Keybinds share the dock; Jobs is its own logical surface with its own trigger and state — but it occupies the same single right-edge dock, so opening Jobs closes Settings/Keybinds and vice-versa.
6. **Settings:** replace the centered modal with a right-side `SettingsPanel`. Keep the `settingsPanels` prop + Appearance panel so consuming apps need no API changes — only the container moves. `useSettingsModal()` remains as a back-compat shim.
7. **Jobs:** the `JobsPill` hover popover is removed; the pill click opens the Jobs panel. `JobsDrawer` content (job rows) is reused as the panel body.
8. **Keybinds:** `ShortcutsCheatsheet` becomes the Keybinds panel body; `ShortcutsHelpButton` becomes a dock trigger.
9. **Scope:** build in pdomain-ui, then migrate all three consuming SPAs in the same effort.

## Architecture

### New primitive: `SlideOverPanel` (`src/primitives/`)

A right-docked overlay panel.

- Absolutely positioned against the right edge, slides in; renders over main's right portion.
- **No scrim**, **non-modal** — does not trap focus, does not block pointer events on main.
- `role="dialog"` + `aria-label` (the active surface's title); a header bar with the title, a **pin toggle**, and a **✕ close**.
- **Esc closes**; on close, focus returns to the trigger that opened it.
- Width comes from a CSS variable / prop; default ≈ `420px`.
- A **left-edge resize handle** is active when pinned (drag to resize).

### New shell context: `UtilityDockContext` + `useUtilityDock()` (`src/shell/`)

State held by AppShell:

```
type DockSurface = 'settings' | 'keybinds' | 'jobs';
interface UtilityDockContextValue {
  active: DockSurface | null;
  pinned: boolean;
  width: number;
  open(surface: DockSurface): void;
  close(): void;
  toggle(surface: DockSurface): void;   // open if closed/other; close if already active
  setPinned(pinned: boolean): void;
  setWidth(px: number): void;
}
```

A single `active` value gives mutual exclusion for free. `useUtilityDock()` throws if used outside `<AppShell>`.

### `UtilityDock` renderer

Rendered by AppShell outside the grid (like `SettingsModal` is today). Switches on `active` and renders the matching surface body inside `SlideOverPanel`:

- `settings` → `SettingsPanel` (Appearance + injected `settingsPanels`)
- `keybinds` → `ShortcutsCheatsheet`
- `jobs` → job-row list (reused from `JobsDrawer` / `JobRow`)

When `pinned`, AppShell sets `--shell-right-w` to the dock width so main reflows; when unpinned, `--shell-right-w` stays `0` and the panel overlays.

### Surfaces

- **`SettingsPanel`** — wraps the existing Appearance panel + `settingsPanels`. Sub-panel selection (the old `activePanel`) is preserved within the Settings surface.
- **Keybinds** — `ShortcutsCheatsheet` as-is.
- **Jobs** — job-row list extracted/reused from `JobsDrawer`.

### Jobs data path

Each surface receives its data through a dedicated channel:

- **Settings** — `AppShell settingsPanels` prop forwarded to `UtilityDock` → `SettingsPanel`.
- **Keybinds** — `useShortcutsContext().allBindings` read by `AppShell`, forwarded as `UtilityDock bindings`.
- **Jobs** — `AppShell jobs` prop (type `AppShellJobsProps`) forwarded to `UtilityDock` as individual props → `JobsPanelBody`.

`AppShellJobsProps` shape (all members optional; omitting `jobs` entirely gives the empty-state):

```ts
interface AppShellJobsProps {
  activeJobs?: Job[];
  onJobOpen?: (jobId: string) => void;
  onJobPauseResume?: (jobId: string) => void;
  onJobCancel?: (jobId: string) => void;
  onViewAll?: () => void;
}
```

The consuming app provides live job data via `<AppShell jobs={{ activeJobs, onJobOpen, ... }} />`.

## Behavior

- Click a trigger → opens its surface. Click the **active** trigger again → closes (toggle). Esc / ✕ → close. Outside-click → no-op.
- Pin toggle flips overlay ↔ docked-column; width persists.
- Triggers reflect open state via `aria-expanded`.
- Opening a different surface while the dock is open swaps the body in place without changing pin/width.

## State & persistence

- `pinned` and `width` persist via the UIPrefs store (`createUIPrefsStore`) so they survive reload. Width is clamped (min ≈ 320px, max ≈ 640px).
- `active` is ephemeral session state (not persisted).

## Triggers / header

- `SettingsSlot` (gear) → `toggle('settings')`.
- `ShortcutsHelpButton` (⌨) → `toggle('keybinds')`.
- `JobsPill` → `toggle('jobs')`; `hoverPopover` defaults off and the inline popover markup is removed.

## Back-compat & migration

- `useSettingsModal()` / `openModal()` / `openPanel(id)` keep working: `openModal` → `open('settings')`; `openPanel(id)` → `open('settings')` + select sub-panel `id`. `SettingsModalContext` is retained or aliased so existing consumers compile unchanged.
- `JobsPill`'s `hoverPopover` prop is retained for one release but defaults to `false`; `AppHeader`'s `jobsHoverPopover` likewise.
- **Consumer migration** (same effort): bump pdomain-ui, drop `jobsHoverPopover`/modal-specific wiring, confirm `make ci` green per repo for `pdomain-ocr-simple-gui`, `pdomain-prep-for-pgdp`, `pdomain-ocr-labeler-spa`.

## Testing

New tests:

- `SlideOverPanel`: open/close, Esc closes, ✕ closes, focus returns to trigger, **no scrim / main remains interactive**, outside-click does **not** close.
- `UtilityDock`: mutual exclusion (opening one closes another), toggle behavior, pin toggle drives `--shell-right-w`, resize updates + persists width, width clamping.
- `SettingsPanel`: parity with the prior modal panels (Appearance + injected `settingsPanels`, sub-panel selection).
- Jobs-as-panel and Keybinds-as-panel content rendering.

Updated tests/stories:

- `JobsPill` (no hover popover), `AppHeader`, `SettingsSlot`, `ShortcutsHelpButton`, `AppShell`, plus the `useSettingsModal` shim.
- Stories for all three surfaces in dock form (slide-over + pinned variants).

## Non-goals

- No change to template-owned right-side content (e.g. word-view inspectors) — the deprecated grid `rightPanel` prop is untouched.
- No multi-panel / split right edge — strictly one surface at a time.
- No new job orchestration behavior — Jobs panel is a presentation change only.

## Risks / open items

- Resize handle + non-modal overlay must not interfere with main-content pointer interactions (canvas drag, etc.) — verify in consumers, especially the labeler/canvas surfaces.
- Pinned column reflow must coexist with apps that already set `--shell-right-w` via the deprecated `rightPanel` prop; document precedence (utility dock wins while open+pinned).
