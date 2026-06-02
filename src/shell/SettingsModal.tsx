/**
 * @deprecated since the right-side utility panels change (M4): Settings now renders
 * via `UtilityDock`/`SettingsPanel`. `SettingsModal` is retained for one release for
 * any consumer that mounted it directly; AppShell no longer renders it.
 *
 * SettingsModal — tabbed dialog (built on the Dialog primitive) with:
 *  - Left vertical tab nav listing all panels
 *  - Right content pane rendering the active panel
 *  - Built-in "Appearance" tab always first
 *  - App-injected panels appended after Appearance
 *
 * testids (spec §Contract):
 *   settings-modal                 — the dialog content node
 *   settings-modal-close           — close button
 *   settings-modal-tab-<id>        — each tab button
 *   settings-modal-panel-<id>      — active panel wrapper
 *
 * Controlled externally via SettingsModalContext (open + activePanel state
 * live in AppShell). NOTE: SettingsModalContext now delegates to the utility dock shim.
 */
import * as React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogClose } from '../primitives/Dialog.js';
import { AppearancePanel } from './AppearancePanel.js';
import { useSettingsModal } from './SettingsModalContext.js';
import type { SettingsPanelDescriptor } from './types.js';

// ─── Internal panel descriptor ────────────────────────────────────────────────

interface PanelEntry {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

// ─── SettingsModal ────────────────────────────────────────────────────────────

export interface SettingsModalProps {
  /** App-injected panels, appended after the built-in Appearance panel. */
  settingsPanels?: SettingsPanelDescriptor[];
}

export function SettingsModal({ settingsPanels }: SettingsModalProps) {
  const { open, activePanel, closeModal, openPanel } = useSettingsModal();
  const tablistId = React.useId();

  // Build the full panel list: Appearance is always first.
  const panels: PanelEntry[] = [
    { id: 'appearance', label: 'Appearance', content: <AppearancePanel /> },
    ...(settingsPanels ?? []),
  ];

  // Ensure we always have a valid active panel id.
  const resolvedActive = panels.some((p) => p.id === activePanel) ? activePanel : 'appearance';

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) closeModal();
      }}
    >
      <DialogContent
        data-testid="settings-modal"
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: 'min(760px, 92vw)',
          height: 'min(560px, 88vh)',
          padding: 0,
          overflow: 'hidden',
          gap: 0,
        }}
      >
        {/* ── Hidden title for a11y ──────────────────────────────────── */}
        <DialogTitle
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            overflow: 'hidden',
            clip: 'rect(0,0,0,0)',
          }}
        >
          Settings
        </DialogTitle>

        {/* ── Left tab nav ──────────────────────────────────────────── */}
        <nav
          aria-label="Settings panels"
          style={{
            width: '168px',
            flexShrink: 0,
            background: 'var(--bg-sunk)',
            borderRight: '1px solid var(--border-2)',
            display: 'flex',
            flexDirection: 'column',
            padding: '12px 0',
            overflowY: 'auto',
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
                    openPanel(panel.id);
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
                    const tabs = document.querySelectorAll<HTMLElement>(
                      `[id^="${tablistId}-tab-"]`,
                    );
                    const target = tabs[next];
                    if (target) {
                      target.focus();
                      openPanel(panels[next]?.id ?? panel.id);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    border: 'none',
                    background: isActive ? 'var(--bg-raised)' : 'transparent',
                    color: isActive ? 'var(--ink-1)' : 'var(--ink-3)',
                    fontFamily: 'var(--ui-font)',
                    fontSize: '12px',
                    fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                    borderRadius: '6px',
                    margin: '1px 6px',
                    textAlign: 'left',
                    transition: 'background .1s, color .1s',
                  }}
                >
                  {panel.icon}
                  <span>{panel.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* ── Right content pane ────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Panel header with close button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-2)',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--ink-1)',
              }}
            >
              {panels.find((p) => p.id === resolvedActive)?.label ?? 'Settings'}
            </span>
            <DialogClose asChild>
              <button
                type="button"
                aria-label="Close settings"
                data-testid="settings-modal-close"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  padding: 0,
                  border: '1px solid var(--border-2)',
                  borderRadius: '5px',
                  background: 'transparent',
                  color: 'var(--ink-3)',
                  cursor: 'pointer',
                  fontSize: '16px',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </DialogClose>
          </div>

          {/* Active panel content */}
          <div
            role="tabpanel"
            id={`${tablistId}-panel-${resolvedActive}`}
            aria-labelledby={`${tablistId}-tab-${resolvedActive}`}
            data-testid={`settings-modal-panel-${resolvedActive}`}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
            }}
          >
            {panels.find((p) => p.id === resolvedActive)?.content}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

SettingsModal.displayName = 'SettingsModal';
