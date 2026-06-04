/**
 * pdomain-ui/shell subpath export.
 *
 * Re-exports all public shell API:
 *   - AppShell component + context hook
 *   - LauncherSlot + LauncherTile
 *   - SuiteSiblingsProvider + useSuiteSiblingsContext (M8.4)
 *     (consumer alias `useSuiteSiblings` lives in @pdomain/pdomain-ui/stores)
 *   - Sub-shell layout primitives (Breadcrumb, TopNav, Drawer, Rail, RightPanel)
 *   - All shell types (AppShellProps, NavItem, UIPrefsConfig, etc.)
 */

// ─── Types ────────────────────────────────────────────────────────────────────
export type {
  AppShellProps,
  AppShellContextValue,
  NavItem,
  UIPrefsConfig,
  UIPrefs,
  SuiteApp,
  InstalledApp,
  LaunchResult,
  SettingsPanelDescriptor,
  AppShellJobsProps,
} from './types.js';

// ─── AppShell ─────────────────────────────────────────────────────────────────
export { AppShell } from './AppShell.js';
export { useAppShell } from './AppShellContext.js';

// ─── LauncherSlot + LauncherTile ──────────────────────────────────────────────
export { LauncherSlot } from './LauncherSlot.js';
export { LauncherTile } from './LauncherTile.js';
export type { LauncherTileProps } from './LauncherTile.js';

// ─── ShortcutsHelpButton ──────────────────────────────────────────────────────
export { ShortcutsHelpButton } from './ShortcutsHelpButton.js';

// ─── SettingsSlot + SettingsModal + AppearancePanel ───────────────────────────
export { SettingsSlot } from './SettingsSlot.js';
export { SettingsModal } from './SettingsModal.js';
export type { SettingsModalProps } from './SettingsModal.js';
export { AppearancePanel } from './AppearancePanel.js';
export { SettingsModalContext, useSettingsModal } from './SettingsModalContext.js';
export type { SettingsModalContextValue } from './SettingsModalContext.js';

// ─── UIPrefsApplicator ────────────────────────────────────────────────────────
export { UIPrefsApplicator } from './UIPrefsApplicator.js';

// ─── UIPrefsConfig factory ────────────────────────────────────────────────────
export { createApiUIPrefsConfig } from './createApiUIPrefsConfig.js';

// ─── SuiteSiblings API config factory ─────────────────────────────────────────
export { createApiSuiteSiblingsConfig } from './createApiSuiteSiblingsConfig.js';
export type { ApiSuiteSiblingsOptions } from './createApiSuiteSiblingsConfig.js';

// ─── SuiteSiblings (M8.4) ─────────────────────────────────────────────────────
export { SuiteSiblingsContext, useSuiteSiblingsContext } from './SuiteSiblingsContext.js';
export type { SuiteSiblingsContextValue } from './SuiteSiblingsContext.js';

export { SuiteSiblingsProvider } from './SuiteSiblingsProvider.js';
export type { SuiteSiblingsProviderProps } from './SuiteSiblingsProvider.js';

// ─── Sub-shell layout primitives ──────────────────────────────────────────────
export { Breadcrumb } from './Breadcrumb.js';
export type { BreadcrumbProps } from './Breadcrumb.js';

export { TopNav } from './TopNav.js';
export type { TopNavProps } from './TopNav.js';

export { Drawer } from './Drawer.js';
export type { DrawerProps } from './Drawer.js';

export { Rail } from './Rail.js';
export type { RailProps } from './Rail.js';

export { RightPanel } from './RightPanel.js';
export type { RightPanelProps } from './RightPanel.js';

// ─── JobsPill (OQ-5 shell molecule) ───────────────────────────────────────────
export { JobsPill } from './JobsPill.js';
export type { JobsPillProps, ActiveJob } from './JobsPill.js';

// ─── JobRow (OQ-5 shell molecule) ─────────────────────────────────────────────
export { JobRow } from './JobRow.js';
export type { JobRowProps, Job, JobStatus } from './JobRow.js';

// ─── AppHeader (OQ-5 shell molecule) ──────────────────────────────────────────
export { AppHeader } from './AppHeader.js';
export type { AppHeaderProps } from './AppHeader.js';

// ─── JobsDrawer (OQ-5 shell molecule) ─────────────────────────────────────────
export { JobsDrawer } from './JobsDrawer.js';
export type { JobsDrawerProps, JobsDrawerMode, JobToast } from './JobsDrawer.js';

// ─── Utility dock (right-side panels) ─────────────────────────────────────────
export { UtilityDockContext, useUtilityDock } from './UtilityDockContext.js';
export type { UtilityDockContextValue, DockSurface } from './UtilityDockContext.js';
export { UtilityDock } from './UtilityDock.js';
export type { UtilityDockProps } from './UtilityDock.js';
export { SettingsPanel } from './SettingsPanel.js';
export type { SettingsPanelProps } from './SettingsPanel.js';
export { JobsPanelBody } from './JobsPanelBody.js';
export type { JobsPanelBodyProps } from './JobsPanelBody.js';

// ─── Compute-target panel ──────────────────────────────────────────────────────
export { ComputeTargetPanel } from './ComputeTargetPanel.js';
export type { ComputeTargetPanelProps } from './ComputeTargetPanel.js';

// ─── Update panel + badge ──────────────────────────────────────────────────────
export { UpdatePanel, UpdateBadge } from './UpdatePanel.js';
export type { UpdatePanelProps, UpdateBadgeProps } from './UpdatePanel.js';

// ─── Device API config factory ────────────────────────────────────────────────
export { createApiDeviceConfig } from './createApiDeviceConfig.js';
export type { ApiDeviceOptions } from './createApiDeviceConfig.js';

// ─── Update API config factory ────────────────────────────────────────────────
export { createApiUpdateConfig } from './createApiUpdateConfig.js';
export type { ApiUpdateOptions } from './createApiUpdateConfig.js';

// ─── Device + update types ────────────────────────────────────────────────────
export type { DeviceInfo, DeviceEntry, DevicePutBody, UpdateInfo, UpdatePolicy } from './types.js';
