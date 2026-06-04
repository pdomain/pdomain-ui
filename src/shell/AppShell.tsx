/**
 * AppShell — top-level 5-zone CSS grid layout wrapper for pdomain-* SPAs.
 *
 * Grid template:
 *   "header header header header"
 *   "rail   drawer  main   right"
 *
 * Columns: var(--shell-rail-w, 64px) | var(--shell-drawer-w, 0px) | 1fr | var(--shell-right-w, 0px)
 * Rows:    var(--shell-header-h, 0px) | 1fr
 *
 * When `header` is undefined (the default), AppShell renders its own built-in
 * AppShellHeader: app icon + app name + spacer + headerActions + LauncherSlot + SettingsSlot.
 * Pass a custom `header` node as an escape hatch for apps that need full control.
 *
 * Optional zone slots (rail, drawer, rightPanel) render their wrapper divs only
 * when content is provided — absent zones collapse via CSS variable defaults.
 *
 * NOTE: The `drawer` and `rightPanel` props are @deprecated (OQ-12). AppShell is
 * converging to a 3-zone shell (header + rail + main). See `AppShellProps` in
 * `types.ts` for full migration guidance. Both props remain functional for back-compat.
 *
 * Provides AppShellContext so nested components can call useAppShell().
 * Provides UtilityDockContext so nested components can call useUtilityDock().
 * Provides SettingsModalContext for back-compat; it now delegates to the utility dock.
 * UIPrefsApplicator applies UIPrefs changes to the DOM (data-density, zoom, data-theme).
 *
 * Settings now renders via UtilityDock (right-side dock). SettingsModal is deprecated;
 * AppShell no longer renders it directly. The SettingsModalContext shim ensures that
 * existing consumers calling useSettingsModal().openModal()/openPanel() still work.
 *
 * Issue #19 additions:
 *   - headerActions prop — app-specific header controls before launcher + gear
 *   - settingsPanels prop — app-injected panels in the shared SettingsModal / dock
 *   - SettingsModalContext provided here with open/activePanel state
 *   - UtilityDock rendered inside the provider tree (outside the grid, replaces SettingsModal)
 */
import * as React from 'react';
import { useStore } from 'zustand';
import { AppShellContext } from './AppShellContext.js';
import { UIPrefsStoreProvider } from '../stores/StoreContexts.js';
import { createUIPrefsStore } from '../stores/createUIPrefsStore.js';
import { LauncherSlot } from './LauncherSlot.js';
import { SettingsSlot } from './SettingsSlot.js';
import { UIPrefsApplicator } from './UIPrefsApplicator.js';
import { TopNav } from './TopNav.js';
import { SettingsModalContext } from './SettingsModalContext.js';
import { UtilityDockContext } from './UtilityDockContext.js';
import type { DockSurface, UtilityDockContextValue } from './UtilityDockContext.js';
import { UtilityDock } from './UtilityDock.js';
import { useShortcutsContext } from '../hooks/ShortcutsContext.js';
import type { AppShellProps, AppShellContextValue } from './types.js';

// ─── Built-in header ──────────────────────────────────────────────────────────

interface AppShellHeaderProps {
  appIconUrl?: string;
  appDisplayName: string;
  headerActions?: React.ReactNode;
  /** When true, LauncherSlot is rendered inside this header. */
  showLauncher: boolean;
}

function AppShellHeader({
  appIconUrl,
  appDisplayName,
  headerActions,
  showLauncher,
}: AppShellHeaderProps) {
  return (
    <TopNav>
      {appIconUrl && (
        <img
          src={appIconUrl}
          alt=""
          width={20}
          height={20}
          style={{ borderRadius: 4, flexShrink: 0 }}
        />
      )}
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--ink-1)',
          letterSpacing: '-0.01em',
          whiteSpace: 'nowrap',
        }}
      >
        {appDisplayName}
      </span>
      <div style={{ flex: 1 }} />
      {headerActions}
      {showLauncher && <LauncherSlot />}
      <SettingsSlot />
    </TopNav>
  );
}

AppShellHeader.displayName = 'AppShellHeader';

// ─── AppShell ─────────────────────────────────────────────────────────────────

export function AppShell({
  appId,
  appDisplayName,
  appIconUrl,
  header,
  headerActions,
  rail,
  drawer,
  main,
  rightPanel,
  footer,
  launcherSlot = 'header',
  uiPrefsConfig,
  deployMode = 'local',
  settingsPanels,
  jobs,
  children,
}: AppShellProps & { children?: React.ReactNode }) {
  // Stable store instance: created once per AppShell mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const uiPrefsStore = React.useMemo(() => createUIPrefsStore(uiPrefsConfig), []);

  // Read bindings from the nearest ShortcutsProvider (or the no-op default, which
  // has allBindings: []). This feeds the keybinds dock surface so it is non-empty
  // whenever shortcuts are registered.
  const { allBindings } = useShortcutsContext();

  const ctx: AppShellContextValue = React.useMemo(
    () => ({ appId, appDisplayName, appIconUrl, deployMode, launcherSlot }),
    [appId, appDisplayName, appIconUrl, deployMode, launcherSlot],
  );

  // ── Utility dock state ──────────────────────────────────────────────────
  // `active` is ephemeral; `pinned`/`width` are persisted via UIPrefs.
  const [dockActive, setDockActive] = React.useState<DockSurface | null>(null);
  const dockPinned = useStore(uiPrefsStore, (s) => s.prefs.dockPinned ?? false);
  const dockWidth = useStore(uiPrefsStore, (s) => s.prefs.dockWidth ?? 420);
  const setDockPinned = useStore(uiPrefsStore, (s) => s.setDockPinned);
  const setDockWidth = useStore(uiPrefsStore, (s) => s.setDockWidth);

  // Stable callbacks — deps are only the stable state setters (never recreated).
  const dockOpen = React.useCallback((s: DockSurface) => setDockActive(s), []);
  const dockClose = React.useCallback(() => setDockActive(null), []);
  const dockToggle = React.useCallback(
    (s: DockSurface) => setDockActive((c) => (c === s ? null : s)),
    [],
  );

  const utilityDockCtx = React.useMemo<UtilityDockContextValue>(
    () => ({
      active: dockActive,
      pinned: dockPinned,
      width: dockWidth,
      open: dockOpen,
      close: dockClose,
      toggle: dockToggle,
      setPinned: setDockPinned,
      setWidth: setDockWidth,
    }),
    [
      dockActive,
      dockPinned,
      dockWidth,
      dockOpen,
      dockClose,
      dockToggle,
      setDockPinned,
      setDockWidth,
    ],
  );

  // ── SettingsModal back-compat shim ──────────────────────────────────────
  // openModal → open('settings'); openPanel(id) → open('settings') + select sub-panel id.
  // The shim state `shimSettingsPanel` is passed to UtilityDock as initialSettingsPanel
  // so that openPanel(id) causes the dock to show that sub-panel.
  const [shimSettingsPanel, setShimSettingsPanel] = React.useState('appearance');

  // Stable shim callbacks — close over only stable setters.
  const shimOpenModal = React.useCallback(() => dockOpen('settings'), [dockOpen]);
  // Per spec: closeModal closes unconditionally regardless of which surface is active.
  const shimCloseModal = React.useCallback(() => dockClose(), [dockClose]);
  const shimOpenPanel = React.useCallback(
    (panelId: string) => {
      setShimSettingsPanel(panelId);
      dockOpen('settings');
    },
    [dockOpen],
  );

  const settingsModalCtx = React.useMemo(
    () => ({
      open: dockActive === 'settings',
      activePanel: shimSettingsPanel,
      openModal: shimOpenModal,
      closeModal: shimCloseModal,
      openPanel: shimOpenPanel,
    }),
    [dockActive, shimSettingsPanel, shimOpenModal, shimCloseModal, shimOpenPanel],
  );

  // When pinned, the utility dock drives --shell-right-w so main reflows.
  // When not pinned (overlay) or closed, leave the existing rightPanel logic alone.
  const shellRightWStyle: React.CSSProperties =
    dockPinned && dockActive !== null ? { ['--shell-right-w' as string]: `${dockWidth}px` } : {};

  // Determine the resolved header content.
  // When `header` is undefined, use the built-in AppShellHeader.
  // LauncherSlot is only injected into the built-in header when launcherSlot='header'.
  const resolvedHeader: React.ReactNode =
    header !== undefined ? (
      header
    ) : (
      <AppShellHeader
        appIconUrl={appIconUrl}
        appDisplayName={appDisplayName}
        headerActions={headerActions}
        showLauncher={launcherSlot === 'header'}
      />
    );

  const drawerColumn =
    drawer !== undefined ? 'var(--shell-drawer-w, 320px)' : 'var(--shell-drawer-w, 0px)';
  const rightColumn =
    rightPanel !== undefined ? 'var(--shell-right-w, 520px)' : 'var(--shell-right-w, 0px)';

  return (
    <UIPrefsStoreProvider value={uiPrefsStore}>
      <AppShellContext.Provider value={ctx}>
        <UtilityDockContext.Provider value={utilityDockCtx}>
          <SettingsModalContext.Provider value={settingsModalCtx}>
            <UIPrefsApplicator />
            <div
              data-testid="app-shell"
              style={{
                display: 'grid',
                gridTemplateAreas: footer
                  ? '"header header header header" "rail drawer main right" "footer footer footer footer"'
                  : '"header header header header" "rail drawer main right"',
                gridTemplateColumns: `var(--shell-rail-w, 64px) ${drawerColumn} 1fr ${rightColumn}`,
                gridTemplateRows: footer
                  ? 'var(--shell-header-h, 56px) 1fr var(--shell-footer-h, auto)'
                  : 'var(--shell-header-h, 56px) 1fr',
                height: '100%',
                width: '100%',
                overflow: 'hidden',
                ...shellRightWStyle,
              }}
            >
              {/* Header zone — always rendered (built-in or custom) */}
              <header
                data-testid="app-shell-header"
                style={{ gridArea: 'header' }}
                className="min-w-0 overflow-hidden"
              >
                {resolvedHeader}
              </header>

              {/* Rail zone — when launcherSlot='rail', LauncherSlot is appended here */}
              <nav
                data-testid="app-shell-rail"
                aria-label="App rail"
                style={{ gridArea: 'rail' }}
                className="min-w-0 overflow-hidden"
              >
                {rail}
                {launcherSlot === 'rail' && <LauncherSlot />}
              </nav>

              {/* Drawer zone */}
              <aside
                data-testid="app-shell-drawer"
                aria-label="Drawer"
                style={{ gridArea: 'drawer' }}
                className="min-w-0 overflow-hidden"
              >
                {drawer}
              </aside>

              {/* Main content zone (required) */}
              <main
                data-testid="app-shell-main"
                style={{ gridArea: 'main' }}
                className="min-w-0 min-h-0 overflow-hidden"
              >
                {main}
              </main>

              {/* Right panel zone */}
              <aside
                data-testid="app-shell-right"
                aria-label="Right panel"
                style={{ gridArea: 'right' }}
                className="min-w-0 overflow-hidden"
              >
                {rightPanel}
              </aside>

              {/* Footer zone (issue #14) — only rendered when footer prop is provided */}
              {footer !== undefined && (
                <div
                  data-testid="app-shell-footer"
                  style={{ gridArea: 'footer' }}
                  className="min-w-0 overflow-hidden"
                >
                  {footer}
                </div>
              )}
            </div>

            {/* Utility dock — rendered outside the grid so it overlays / docks the right edge.
                Conditional render (not just early-return in the child) ensures UtilityDock
                truly mounts/unmounts on open/close, so useState(initialSettingsPanel) always
                picks up the current prop value without needing an effect-sync. */}
            {dockActive !== null && (
              <UtilityDock
                {...(settingsPanels !== undefined ? { settingsPanels } : {})}
                initialSettingsPanel={shimSettingsPanel}
                bindings={allBindings}
                {...(jobs?.activeJobs !== undefined ? { activeJobs: jobs.activeJobs } : {})}
                {...(jobs?.onJobOpen !== undefined ? { onJobOpen: jobs.onJobOpen } : {})}
                {...(jobs?.onJobPauseResume !== undefined
                  ? { onJobPauseResume: jobs.onJobPauseResume }
                  : {})}
                {...(jobs?.onJobCancel !== undefined ? { onJobCancel: jobs.onJobCancel } : {})}
                {...(jobs?.onJobDelete !== undefined ? { onJobDelete: jobs.onJobDelete } : {})}
                {...(jobs?.onViewAll !== undefined ? { onJobsViewAll: jobs.onViewAll } : {})}
              />
            )}

            {/* children slot — for context consumers rendered outside the grid zones */}
            {children}
          </SettingsModalContext.Provider>
        </UtilityDockContext.Provider>
      </AppShellContext.Provider>
    </UIPrefsStoreProvider>
  );
}

AppShell.displayName = 'AppShell';
