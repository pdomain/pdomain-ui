/**
 * SettingsPanel tests — the dock body for the Settings surface.
 *
 * Parity with the prior SettingsModal panels: Appearance is always first,
 * app-injected settingsPanels follow, and sub-panel selection switches the
 * rendered content. Reuses the existing settings-modal-tab-<id> /
 * settings-modal-panel-<id> testids so consumer Playwright drivers keep working.
 */
import * as React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { createUIPrefsStore } from '../stores/createUIPrefsStore.js';
import { UIPrefsStoreProvider } from '../stores/index.js';
import { SettingsPanel } from './SettingsPanel.js';
import type { UIPrefsConfig } from './types.js';

function makeConfig(): UIPrefsConfig {
  return {
    load: vi.fn(() =>
      Promise.resolve({ theme: 'dark' as const, density: 'normal' as const, fontScale: 1.0 }),
    ),
    persistCommon: vi.fn(() => Promise.resolve()),
    persistApp: vi.fn(() => Promise.resolve()),
  };
}

async function renderPanel(props: React.ComponentProps<typeof SettingsPanel>) {
  const store = createUIPrefsStore(makeConfig());
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });
  return render(
    <UIPrefsStoreProvider value={store}>
      <SettingsPanel {...props} />
    </UIPrefsStoreProvider>,
  );
}

describe('SettingsPanel', () => {
  it('renders the built-in Appearance tab first and active by default', async () => {
    await renderPanel({ activePanel: 'appearance', onSelectPanel: vi.fn() });
    expect(screen.getByTestId('settings-modal-tab-appearance')).toBeTruthy();
    expect(screen.getByTestId('settings-modal-panel-appearance')).toBeTruthy();
  });

  it('renders app-injected panels after Appearance', async () => {
    await renderPanel({
      activePanel: 'appearance',
      onSelectPanel: vi.fn(),
      settingsPanels: [{ id: 'export', label: 'Export', content: <div>export body</div> }],
    });
    expect(screen.getByTestId('settings-modal-tab-export')).toBeTruthy();
  });

  it('clicking a tab calls onSelectPanel with that id', async () => {
    const onSelectPanel = vi.fn();
    await renderPanel({
      activePanel: 'appearance',
      onSelectPanel,
      settingsPanels: [{ id: 'export', label: 'Export', content: <div>export body</div> }],
    });
    fireEvent.click(screen.getByTestId('settings-modal-tab-export'));
    expect(onSelectPanel).toHaveBeenCalledWith('export');
  });

  it('renders the active sub-panel content when activePanel is an injected id', async () => {
    await renderPanel({
      activePanel: 'export',
      onSelectPanel: vi.fn(),
      settingsPanels: [{ id: 'export', label: 'Export', content: <div>export body</div> }],
    });
    expect(screen.getByTestId('settings-modal-panel-export')).toBeTruthy();
    expect(screen.getByText('export body')).toBeTruthy();
  });

  it('falls back to appearance when activePanel does not match any panel', async () => {
    await renderPanel({ activePanel: 'nope', onSelectPanel: vi.fn() });
    expect(screen.getByTestId('settings-modal-panel-appearance')).toBeTruthy();
  });
});
