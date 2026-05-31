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
 * Provides SettingsModalContext so nested components can call useSettingsModal().
 * UIPrefsApplicator applies UIPrefs changes to the DOM (data-density, zoom, data-theme).
 *
 * Issue #19 additions:
 *   - headerActions prop — app-specific header controls before launcher + gear
 *   - settingsPanels prop — app-injected panels in the shared SettingsModal
 *   - SettingsModalContext provided here with open/activePanel state
 *   - SettingsModal rendered inside the provider tree (outside the grid, same as children)
 */
import * as React from 'react';
import { AppShellContext } from './AppShellContext.js';
import { UIPrefsStoreProvider } from '../stores/StoreContexts.js';
import { createUIPrefsStore } from '../stores/createUIPrefsStore.js';
import { LauncherSlot } from './LauncherSlot.js';
import { SettingsSlot } from './SettingsSlot.js';
import { UIPrefsApplicator } from './UIPrefsApplicator.js';
import { TopNav } from './TopNav.js';
import { SettingsModalContext } from './SettingsModalContext.js';
import { SettingsModal } from './SettingsModal.js';
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
  children,
}: AppShellProps & { children?: React.ReactNode }) {
  // Stable store instance: created once per AppShell mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const uiPrefsStore = React.useMemo(() => createUIPrefsStore(uiPrefsConfig), []);

  const ctx: AppShellContextValue = React.useMemo(
    () => ({ appId, appDisplayName, appIconUrl, deployMode, launcherSlot }),
    [appId, appDisplayName, appIconUrl, deployMode, launcherSlot],
  );

  // ── SettingsModal state ──────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = React.useState(false);
  const [activePanel, setActivePanel] = React.useState('appearance');

  const settingsModalCtx = React.useMemo(
    () => ({
      open: modalOpen,
      activePanel,
      openModal: () => {
        setModalOpen(true);
      },
      closeModal: () => {
        setModalOpen(false);
      },
      openPanel: (panelId: string) => {
        setActivePanel(panelId);
        setModalOpen(true);
      },
    }),
    [modalOpen, activePanel],
  );

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

  return (
    <UIPrefsStoreProvider value={uiPrefsStore}>
      <AppShellContext.Provider value={ctx}>
        <SettingsModalContext.Provider value={settingsModalCtx}>
          <UIPrefsApplicator />
          <div
            data-testid="app-shell"
            style={{
              display: 'grid',
              gridTemplateAreas: footer
                ? '"header header header header" "rail drawer main right" "footer footer footer footer"'
                : '"header header header header" "rail drawer main right"',
              gridTemplateColumns:
                'var(--shell-rail-w, 64px) var(--shell-drawer-w, 0px) 1fr var(--shell-right-w, 0px)',
              gridTemplateRows: footer
                ? 'var(--shell-header-h, 56px) 1fr var(--shell-footer-h, auto)'
                : 'var(--shell-header-h, 56px) 1fr',
              height: '100%',
              width: '100%',
              overflow: 'hidden',
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

          {/* SettingsModal — rendered outside the grid so it portal-overlays correctly */}
          {settingsPanels !== undefined ? (
            <SettingsModal settingsPanels={settingsPanels} />
          ) : (
            <SettingsModal />
          )}

          {/* children slot — for context consumers rendered outside the grid zones */}
          {children}
        </SettingsModalContext.Provider>
      </AppShellContext.Provider>
    </UIPrefsStoreProvider>
  );
}

AppShell.displayName = 'AppShell';
