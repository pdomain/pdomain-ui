/**
 * SettingsPanel — content-only Settings body rendered inside the utility dock.
 *
 * Parity with the prior SettingsModal: a left vertical tab nav (Appearance
 * first, then app-injected settingsPanels) + a right content pane showing the
 * active sub-panel. Controlled: the dock owns the active sub-panel id and
 * passes it in via `activePanel`; tab clicks call `onSelectPanel`.
 *
 * Reuses the existing settings-modal-tab-<id> / settings-modal-panel-<id>
 * testids so consumer Playwright drivers continue to work after the modal→dock
 * migration. No ✕ here — the SlideOverPanel header owns close.
 */
import * as React from 'react';
import { AppearancePanel } from './AppearancePanel.js';
import type { SettingsPanelDescriptor } from './types.js';

interface PanelEntry {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

export interface SettingsPanelProps {
  /** The currently-active sub-panel id. */
  activePanel: string;
  /** Called when a tab is clicked, with the selected sub-panel id. */
  onSelectPanel: (panelId: string) => void;
  /** App-injected panels, appended after the built-in Appearance panel. */
  settingsPanels?: SettingsPanelDescriptor[];
}

export function SettingsPanel({
  activePanel,
  onSelectPanel,
  settingsPanels,
}: SettingsPanelProps): React.ReactElement {
  const tablistId = React.useId();

  const panels: PanelEntry[] = [
    { id: 'appearance', label: 'Appearance', content: <AppearancePanel /> },
    ...(settingsPanels ?? []),
  ];

  const resolvedActive = panels.some((p) => p.id === activePanel) ? activePanel : 'appearance';

  return (
    <div
      data-testid="settings-panel"
      style={{ display: 'flex', flexDirection: 'row', gap: 0, height: '100%', minHeight: 0 }}
    >
      {/* Left tab nav */}
      <nav
        aria-label="Settings panels"
        style={{
          width: 148,
          flexShrink: 0,
          borderRight: '1px solid var(--border-2)',
          display: 'flex',
          flexDirection: 'column',
          paddingRight: 8,
        }}
      >
        <div
          role="tablist"
          aria-label="Settings panels"
          aria-orientation="vertical"
          id={tablistId}
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          {panels.map((panel, idx) => {
            const isActive = panel.id === resolvedActive;
            return (
              <button
                key={panel.id}
                type="button"
                role="tab"
                id={`${tablistId}-tab-${panel.id}`}
                aria-selected={isActive}
                aria-controls={`${tablistId}-panel-${panel.id}`}
                tabIndex={isActive ? 0 : -1}
                data-testid={`settings-modal-tab-${panel.id}`}
                onClick={() => {
                  onSelectPanel(panel.id);
                }}
                onKeyDown={(e) => {
                  const last = panels.length - 1;
                  let next = idx;
                  if (e.key === 'ArrowDown') next = idx === last ? 0 : idx + 1;
                  else if (e.key === 'ArrowUp') next = idx === 0 ? last : idx - 1;
                  else if (e.key === 'Home') next = 0;
                  else if (e.key === 'End') next = last;
                  else return;
                  e.preventDefault();
                  onSelectPanel(panels[next]?.id ?? panel.id);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  border: 'none',
                  background: isActive ? 'var(--bg-raised)' : 'transparent',
                  color: isActive ? 'var(--ink-1)' : 'var(--ink-3)',
                  fontFamily: 'var(--ui-font)',
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  borderRadius: 6,
                  margin: '1px 0',
                  textAlign: 'left',
                }}
              >
                {panel.icon}
                <span>{panel.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Active panel content */}
      <div
        role="tabpanel"
        id={`${tablistId}-panel-${resolvedActive}`}
        aria-labelledby={`${tablistId}-tab-${resolvedActive}`}
        data-testid={`settings-modal-panel-${resolvedActive}`}
        style={{ flex: 1, overflowY: 'auto', paddingLeft: 16, minWidth: 0 }}
      >
        {panels.find((p) => p.id === resolvedActive)?.content}
      </div>
    </div>
  );
}

SettingsPanel.displayName = 'SettingsPanel';
