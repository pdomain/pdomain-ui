---
kind: spec
status: superseded
owner: CT
created: 2026-05-22
last_verified: 2026-07-13
promotes_to: docs/architecture/shell-utility-dock.md
disposition: supersede-then-retire
---

# Shared app-settings modal and AppShell header-actions slot

> **Status**: Draft
> **Last updated**: 2026-05-22
> **Spec-Issue**: pdomain/pdomain-ui#9

## TL;DR

pdomain-ui gains a shared `SettingsModal` — a tabbed dialog opened by the header gear
— with a built-in "Appearance" panel owning all `UIPrefs` and a `settingsPanels`
prop for app-injected panels. `AppShell` also gains a `headerActions` slot and a
`useSettingsModal()` hook for programmatic open (resolving
`pdomain-ocr-labeler-spa#405`). The current gear → Radix Popover is replaced.

## Context

Every pdomain-* SPA needs the same shape of surface: a theme / `UIPrefs` control plus
app-specific configuration. Today the results are scattered and inconsistent:

- `pdomain-ui` `AppShell` exposes a built-in `SettingsSlot` — a gear opening a Radix
  Popover that exposes only `theme`, `density`, and `fontScale`. The remaining
  `UIPrefs` fields (`layerColors`, `statusColors`, `accentColor`,
  `accentInkColor`) have no UI at all.
- `AppShell` exposes `header / rail / drawer / main / rightPanel / footer` slots
  but no slot for app-specific header controls.
- `pdomain-ocr-labeler-spa` ships theme as an inline `ThemeChips` widget and OCR
  config as a standalone `OCRConfigModal`; there is no unified settings surface.
  It documents the gap: `ui-prefs.ts` GAP-5 ("Cannot use pdomain-ui
  `createUIPrefsStore`"), `dialog-store.ts` GAP-6.
- `pdomain-ocr-labeler-spa#405`: the issue-401 HeaderBar deprecation left
  `OCRConfigModal` with no user-facing trigger. CT decided (2026-05-21) to
  resolve #405 by the labeler adopting this shared settings surface rather than
  a one-off gear button. #405 is blocked on this spec.

This spec covers only the `pdomain-ui` surface. Apps migrating onto it
(`pdomain-ocr-labeler-spa#405`, `pdomain-prep-for-pgdp`) are separate follow-up issues.

## Constraints

- **No CVA, no hex literals, no direct `lucide-react` imports** outside
  `src/icons/` — repo-wide ESLint rules.
- **Stores are factories.** `UIPrefs` state stays in `createUIPrefsStore`; the
  modal consumes it through existing context hooks.
- **Deploy-mode-agnostic.** `pdomain-ui` never branches on hosted-vs-local.
- **Strict TypeScript** (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`).
- **Port-not-copy.** The `ColorField` primitive is designed fresh against
  `pdomain-ui` conventions, informed by — not copied from — labeler-spa pickers.
- Behavior-heavy primitives use Radix; the modal builds on the existing
  Radix-dialog-based `Dialog` primitive.
- App panels own their own state and data fetching; `pdomain-ui` renders their
  `content` node and nothing more.

## Decision

### Components

- **`SettingsModal`** — new component on the `Dialog` primitive. A left vertical
  tab-nav lists panels; the right pane renders the active panel's content. The
  built-in "Appearance" panel is always the first tab.
- **`AppearancePanel`** — built-in, owned by `pdomain-ui`. Controls for `theme`,
  `density`, `fontScale` (the current Popover controls) plus `layerColors`,
  `statusColors`, `accentColor` / `accentInkColor`, wired to `createUIPrefsStore`.
- **`ColorField`** — new small primitive (`src/primitives/`): a labeled swatch +
  native color input with a "reset to token default" affordance. Used by
  `AppearancePanel` for the color overrides.
- **`SettingsSlot`** — the gear button is retained but now opens `SettingsModal`.
  The Radix Popover and its inline controls are removed.

### `AppShell` prop additions

```ts
interface AppShellProps {
  // ...existing...
  /** App-specific controls rendered in the header top-right, before the
   *  launcher and settings gear. */
  headerActions?: React.ReactNode;
  /** App-specific settings panels injected into the shared SettingsModal,
   *  appended after the built-in Appearance panel. */
  settingsPanels?: SettingsPanelDescriptor[];
}

interface SettingsPanelDescriptor {
  /** Stable id; used for tab testids and programmatic openPanel(). */
  id: string;
  /** Tab label. */
  label: string;
  /** Optional tab icon node. */
  icon?: React.ReactNode;
  /** Panel body. App owns its state. */
  content: React.ReactNode;
}
```

Header layout becomes: `[icon] [name] [spacer] [headerActions] [LauncherSlot]
[SettingsSlot gear]`.

### Programmatic open

`AppShell` provides modal state via context, surfaced by a `useSettingsModal()`
hook:

```ts
function useSettingsModal(): {
  open: boolean;
  openModal: () => void;
  closeModal: () => void;
  /** Open the modal with a specific panel active. */
  openPanel: (panelId: string) => void;
};
```

This is how `pdomain-ocr-labeler-spa#405` is resolved: the labeler registers an `ocr`
panel via `settingsPanels` and calls `openPanel('ocr')` from wherever the old
HeaderBar trigger lived.

### `UIPrefsConfig` contract change

`persistCommon` widens to persist every non-`app` `UIPrefs` field so color
overrides survive:

```ts
// before: persistCommon: (prefs: Pick<UIPrefs,'theme'|'density'|'fontScale'>) => Promise<void>
persistCommon: (prefs: Omit<UIPrefs, 'app'>) => Promise<void>;
```

`createUIPrefsStore` gains `setLayerColor`, `setStatusColor`, `setAccentColor`
(and `-Ink`) setters that mutate `prefs` and call the widened `persistCommon`.
Consumer adapters (`createApiUIPrefsConfig`, labeler-spa, prep-for-pgdp) update
their `persistCommon` implementation to accept the wider object.

## Contract / Acceptance

- `AppShell` accepts `headerActions` and renders it in the header before the
  launcher; absent → nothing rendered, layout unchanged.
- `AppShell` accepts `settingsPanels`; each descriptor becomes a tab in
  `SettingsModal` after the Appearance tab.
- The header gear (`settings-slot-trigger`) opens `SettingsModal`; the Radix
  Popover no longer exists.
- `SettingsModal` renders a tab per panel; clicking a tab switches the content
  pane; Escape and the close control dismiss it.
- `AppearancePanel` reads and writes `theme`, `density`, `fontScale`, layer /
  status / accent colors through `createUIPrefsStore`; color edits call the
  widened `persistCommon`; "reset" clears an override back to the token default.
- `useSettingsModal().openPanel(id)` opens the modal with panel `id` active;
  `openModal` / `closeModal` toggle without changing the active panel.
- testids: `settings-modal`, `settings-modal-close`, `settings-modal-tab-<id>`,
  `settings-modal-panel-<id>`, `settings-appearance-theme-*`,
  `settings-appearance-density-*`, `settings-appearance-font-scale-slider`,
  `settings-appearance-color-<key>`; gear keeps `settings-slot-trigger`.
- Vitest covers: modal open/close via gear and via hook, tab switching,
  `headerActions` render, Appearance panel store wiring (including color
  reset), `settingsPanels` injection and `openPanel` targeting.
- `make ci AI=1` passes (lint, typecheck, test, build).

## Trade-offs considered

- **Panel injection — descriptor array vs render-prop / children.** Chosen:
  descriptor array (`settingsPanels`). It is declarative, testable without
  rendering, lets `pdomain-ui` own a consistent tab layout, and makes `openPanel(id)`
  trivial. A render-prop / `<SettingsPanel>` children API is more flexible but
  pushes layout responsibility onto each app and complicates programmatic open.
- **Modal vs keeping the Popover.** Chosen: replace the Popover with the modal —
  one surface, no divergence. Keeping both means two code paths and an
  inconsistent UX for the same prefs.
- **Layout — left tab-nav vs stacked sections.** Chosen: left tab-nav + content
  pane. Stacked sections are simpler but become a long scroll once several app
  panels are injected.
- **Universal panel scope — full `UIPrefs` vs popover-parity.** Chosen: full
  `UIPrefs` in v1, which requires the new `ColorField` primitive. Popover-parity
  (theme/density/font only) would ship sooner but leave 5 `UIPrefs` fields
  permanently UI-less and force a near-term follow-up.

## Consequences

- `pdomain-ocr-labeler-spa#405` is unblocked: the labeler injects an OCR panel and
  triggers it via `useSettingsModal().openPanel('ocr')`.
- The `SettingsSlot` Popover and its tests are removed; the gear and its testid
  are retained.
- `UIPrefsConfig.persistCommon` is a breaking signature change for consumers;
  `createApiUIPrefsConfig` and both SPA adapters update in lockstep.
- A new `ColorField` primitive enters `pdomain-ui`'s public surface.
- GAP-5 / GAP-6 in `pdomain-ocr-labeler-spa` are addressed once the labeler migrates
  onto `AppShell` + this modal (its own follow-up).
- The work decomposes into roughly: `ColorField` primitive; `UIPrefsConfig` /
  store widening; `SettingsModal` + `AppearancePanel`; `AppShell`
  `headerActions` + `settingsPanels` + `useSettingsModal`; `SettingsSlot`
  rewire and Popover removal.

## Open questions

- Should `ColorField` use the native `<input type="color">` or a richer
  Radix-free swatch popover? v1 assumes native input; revisit if design review
  rejects the native picker chrome.
- Should app panels be able to contribute a header-actions button themselves, or
  is `headerActions` strictly app-level? v1: `headerActions` is app-level only.
- Does `SettingsModal` need deep-linking (URL-addressable panel)? Out of scope
  for v1; `openPanel` covers the labeler's need.

## References

- pdomain/pdomain-ui#9 — this spec's issue.
- pdomain/pdomain-ocr-labeler-spa#405 — OCR-config trigger, blocked on this.
- `pdomain-ui/src/shell/AppShell.tsx`, `src/shell/SettingsSlot.tsx`,
  `src/shell/types.ts` — current shell surface.
- `pdomain-ui/src/stores/createUIPrefsStore.ts` — `UIPrefs` store factory.
- `pdomain-ui/src/primitives/Dialog.tsx` — Radix-dialog primitive the modal builds on.
- `pdomain-ocr-labeler-spa/frontend/src/components/OCRConfigModal.tsx` — the app panel
  the labeler will inject.
- `docs/specs/2026-05-16-cross-cut-design.md` §6 — AppShell contract origin.

## Adversarial Review

**Stage / sources:** Post-implementation supersession review against AppShell,
UtilityDock, SettingsPanel, settings tests, repository history, and the
right-side utility-panel design. **Accepted findings / residual risk:** the
centered-modal presentation is materially obsolete; SettingsSlot now toggles
UtilityDock and `useSettingsModal` is compatibility-only. Preserve Appearance,
`settingsPanels`, `headerActions`, and preference persistence in
`docs/architecture/shell-utility-dock.md`; richer color input and settings
deep-linking remain deferred pending concrete demand.
