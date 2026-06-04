/**
 * AppShell type contract.
 *
 * Matches the surface defined in spec §6 of 2026-05-16-cross-cut-design.md.
 * `SuiteApp`, `InstalledApp`, `UIPrefs` live in /types once pdomain-ops codegen
 * lands (M4 re-enable). Until then they are defined here as minimal local types
 * used only within the shell and stores subpaths.
 */
import type * as React from 'react';
import type { Job, JobRowProps } from './JobRow.js';

// ─── Suite types (local stubs — will be replaced by codegen from pdomain-ops) ───

/** An app that is part of the pdomain-suite (registered in pdomain-suite.json). */
export interface SuiteApp {
  id: string;
  displayName: string;
  iconUrl?: string;
  url?: string;
}

/** An app that is currently installed and running on this machine. */
export interface InstalledApp extends SuiteApp {
  pid?: number;
  launchUrl: string;
}

/** User interface preferences stored in the per-app prefs file. */
export interface UIPrefs {
  theme: 'dark' | 'light';
  density: 'compact' | 'normal' | 'comfortable';
  /** Font scale multiplier applied via CSS zoom. Range [0.8, 1.4]. Default 1.0. */
  fontScale: number;
  /** Layer colors keyed by layer name. Falls back to CSS token defaults when absent. */
  layerColors?: Partial<Record<'block' | 'para' | 'line' | 'word', string>>;
  /** Status colors keyed by status name. Falls back to CSS token defaults when absent. */
  statusColors?: Partial<Record<'exact' | 'fuzzy' | 'mismatch' | 'ocr' | 'gt', string>>;
  /** Accent override (optional). When absent, the CSS `--accent` token is used. */
  accentColor?: string;
  /** Accent foreground override. When absent `--accent-ink` is used. */
  accentInkColor?: string;
  /** Whether the right-side utility dock is pinned (docked column vs. overlay). Default false. */
  dockPinned?: boolean;
  /** Pinned utility-dock width in px. Clamped to [320, 640]. Default 420. */
  dockWidth?: number;
  /** App-specific arbitrary preferences. */
  app?: Record<string, unknown>;
}

// ─── UIPrefsConfig ────────────────────────────────────────────────────────────

/** Callbacks wired into createUIPrefsStore. */
export interface UIPrefsConfig {
  /** Async loader; called once on first subscribe. */
  load: () => Promise<UIPrefs>;
  /**
   * Called when any non-app pref changes (theme, density, fontScale,
   * layerColors, statusColors, accentColor, accentInkColor).
   *
   * Widened from `Pick<UIPrefs, 'theme' | 'density' | 'fontScale'>` to
   * `Omit<UIPrefs, 'app'>` in issue #18 so color overrides persist.
   */
  persistCommon: (prefs: Omit<UIPrefs, 'app'>) => Promise<void>;
  /** Called when app-specific prefs change. */
  persistApp: (appPrefs: Record<string, unknown>) => Promise<void>;
  /**
   * Optional error hook called whenever a persist operation fails (quota
   * exceeded, network 5xx, etc.). Receives the thrown error.
   *
   * The store also surfaces the last error as `persistError` state so that
   * React components can read it via `useUIPrefs().persistError`. The error
   * is cleared on the next successful persist or when `clearPersistError()`
   * is called explicitly.
   *
   * If not provided, errors are still stored in `persistError` state; they
   * are never silently dropped (#38).
   */
  onPersistError?: (error: unknown) => void;
}

// ─── NavItem ──────────────────────────────────────────────────────────────────

/** A single entry in the application navigation. */
export interface NavItem {
  id: string;
  label: string;
  /** Icon node to render in the rail / nav. */
  icon?: React.ReactNode;
  /** Optional click handler. */
  onClick?: () => void;
  /** Mark as currently active. */
  active?: boolean;
  /** Optional href for anchor-based nav. */
  href?: string;
}

// ─── LaunchResult ─────────────────────────────────────────────────────────────

export type LaunchResult =
  | { kind: 'opened'; url: string }
  | { kind: 'requires-host-config'; siblingId: string };

// ─── SettingsPanelDescriptor ──────────────────────────────────────────────────

/**
 * Describes an app-specific panel injected into the shared `SettingsModal`.
 * The panel is appended after the built-in Appearance panel.
 */
export interface SettingsPanelDescriptor {
  /** Stable id — used for tab testids and programmatic `openPanel(id)`. */
  id: string;
  /** Tab label. */
  label: string;
  /** Optional tab icon node. */
  icon?: React.ReactNode;
  /** Panel body. The app owns its own state; pdomain-ui renders this node as-is. */
  content: React.ReactNode;
}

// ─── AppShellJobsProps ────────────────────────────────────────────────────────

/**
 * Live jobs data forwarded from `AppShell` to the Jobs utility-dock surface.
 *
 * Pass this as the `jobs` prop on `<AppShell>` to populate the right-side
 * Jobs panel. All members are optional — omitting `jobs` entirely (or any
 * member) leaves the panel in its empty-state behavior.
 *
 * Data-flow: `AppShell.jobs` → `UtilityDock` props → `JobsPanelBody` props.
 * Compare: Settings via `settingsPanels`, Keybinds via `useShortcutsContext().allBindings`.
 */
export interface AppShellJobsProps {
  /** Currently active jobs rendered in the Jobs panel. */
  activeJobs?: Job[];
  /** Called with job.id when a row's Open button is clicked. */
  onJobOpen?: JobRowProps['onOpen'];
  /** Called with job.id when a row's Pause/Resume button is clicked. */
  onJobPauseResume?: JobRowProps['onPauseResume'];
  /** Called with job.id when a row's Cancel button is clicked. */
  onJobCancel?: JobRowProps['onCancel'];
  /** Permanently delete a finished/failed run. */
  onJobDelete?: JobRowProps['onJobDelete'];
  /** Called when the "View all jobs" footer link is clicked. */
  onViewAll?: () => void;
}

// ─── AppShell props ───────────────────────────────────────────────────────────

/**
 * Props for `<AppShell>` — the top-level layout wrapper for every pdomain-* SPA.
 *
 * Grid zones:
 *   "header header header header"
 *   "rail   drawer  main   right"
 *
 * All zone props are `ReactNode` slot fills. Absent optional zones collapse
 * to zero width/height without shifting others.
 */
export interface AppShellProps {
  /** Stable app identifier matching pdomain-suite.json (e.g. 'pdomain-ocr-labeler-spa'). */
  appId: string;
  /** Human-readable name shown in the header. */
  appDisplayName: string;
  /** URL of the app's icon (SVG or raster). */
  appIconUrl: string;
  /** Content for the top header zone. */
  header?: React.ReactNode;
  /**
   * App-specific controls rendered in the header top-right, before the
   * launcher and settings gear.
   */
  headerActions?: React.ReactNode;
  /** Content for the 64px wide left rail zone. */
  rail?: React.ReactNode;
  /**
   * Content for the collapsible drawer zone.
   *
   * @deprecated OQ-12: AppShell is converging to a 3-zone shell (header + rail + main).
   * Templates own their own interior layouts; the preferred pattern is to embed a
   * `<ProjectsDrawer>` molecule (or equivalent) directly inside `main` rather than
   * wiring it through AppShell's layout grid. The `drawer` prop is retained for
   * back-compat with `pdomain-ocr-labeler-spa` and `pdomain-prep-for-pgdp` until those apps
   * migrate. Breaking removal is deferred to a future spec after migration is complete.
   */
  drawer?: React.ReactNode;
  /** Content for the main content area (required). */
  main: React.ReactNode;
  /**
   * Content for the right panel zone.
   *
   * @deprecated OQ-12: AppShell is converging to a 3-zone shell (header + rail + main).
   * Templates own their own interior layouts; the preferred pattern is to embed a
   * right-panel molecule directly inside `main` rather than wiring it through
   * AppShell's layout grid. The `rightPanel` prop is retained for back-compat with
   * `pdomain-ocr-labeler-spa` and `pdomain-prep-for-pgdp` until those apps migrate. Breaking
   * removal is deferred to a future spec after migration is complete.
   */
  rightPanel?: React.ReactNode;
  /**
   * Content for the footer zone below the main content area.
   * When provided, a full-width footer row is added to the CSS grid below
   * the rail/drawer/main/right row. When absent, no footer row is reserved.
   */
  footer?: React.ReactNode;
  /**
   * Where to inject the suite launcher.
   * - `'header'` (default) — launcher tiles appear inside the header zone.
   * - `'rail'`   — launcher tiles are appended at the bottom of the rail.
   * - `'off'`    — launcher is not rendered.
   */
  launcherSlot?: 'header' | 'rail' | 'off';
  /** UIPrefs load/persist callbacks (wired into createUIPrefsStore). */
  uiPrefsConfig: UIPrefsConfig;
  /**
   * Deployment context. Default `'local'`.
   * `'hosted'` gates local-only affordances (desktop shortcuts, etc.).
   * pdomain-ui itself never branches on this for real logic — adapters live in pdomain-ops.
   */
  deployMode?: 'local' | 'hosted';
  /**
   * App-specific settings panels injected into the shared SettingsModal,
   * appended after the built-in Appearance panel.
   */
  settingsPanels?: SettingsPanelDescriptor[];
  /**
   * Live jobs data forwarded to the right-side Jobs utility-dock surface.
   *
   * When omitted, the Jobs panel shows its empty state ("No active jobs").
   * All members of `AppShellJobsProps` are individually optional.
   */
  jobs?: AppShellJobsProps;
}

// ─── AppShell context value ────────────────────────────────────────────────────

/** Value exposed via `useAppShell()` to all descendants inside an AppShell. */
export interface AppShellContextValue {
  appId: string;
  appDisplayName: string;
  appIconUrl: string;
  deployMode: 'local' | 'hosted';
  launcherSlot: 'header' | 'rail' | 'off';
}
