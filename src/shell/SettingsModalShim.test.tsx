/**
 * Back-compat shim tests — useSettingsModal() now drives the utility dock.
 * openModal → open('settings'); openPanel(id) → open('settings') + select id.
 */
import * as React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppShell } from './AppShell.js';
import { useSettingsModal } from './SettingsModalContext.js';
import { useUtilityDock } from './UtilityDockContext.js';
import type { UIPrefsConfig } from './types.js';

function makeConfig(): UIPrefsConfig {
  return {
    load: vi.fn(() => Promise.resolve({ theme: 'dark' as const, density: 'normal' as const, fontScale: 1.0 })),
    persistCommon: vi.fn(() => Promise.resolve()),
    persistApp: vi.fn(() => Promise.resolve()),
  };
}

function Probe() {
  const { openModal, openPanel } = useSettingsModal();
  const dock = useUtilityDock();
  return (
    <div>
      <button data-testid="open-modal" onClick={openModal} />
      <button data-testid="open-export" onClick={() => openPanel('export')} />
      <span data-testid="active">{dock.active ?? 'none'}</span>
    </div>
  );
}

async function renderShell() {
  await act(async () => {
    render(
      <AppShell
        appId="t"
        appDisplayName="Test"
        appIconUrl=""
        uiPrefsConfig={makeConfig()}
        settingsPanels={[{ id: 'export', label: 'Export', content: <div>export body</div> }]}
        main={<Probe />}
      />,
    );
    await new Promise((r) => setTimeout(r, 0));
  });
}

describe('useSettingsModal back-compat shim', () => {
  it('openModal() opens the settings dock surface', async () => {
    await renderShell();
    fireEvent.click(screen.getByTestId('open-modal'));
    expect(screen.getByTestId('active').textContent).toBe('settings');
    expect(screen.getByTestId('settings-panel')).toBeTruthy();
  });

  it('openPanel(id) opens settings and selects the sub-panel', async () => {
    await renderShell();
    fireEvent.click(screen.getByTestId('open-export'));
    expect(screen.getByTestId('active').textContent).toBe('settings');
    expect(screen.getByTestId('settings-modal-panel-export')).toBeTruthy();
  });
});
