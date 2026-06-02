/**
 * SettingsPanel tests — the dock body for the Settings surface.
 *
 * Parity with the prior SettingsModal panels: Appearance is always first,
 * app-injected settingsPanels follow, and sub-panel selection switches the
 * rendered content. Reuses the existing settings-modal-tab-<id> /
 * settings-modal-panel-<id> testids so consumer Playwright drivers keep working.
 *
 * Also covers:
 *  - Keyboard nav: ArrowDown/ArrowUp/Home/End call onSelectPanel AND move DOM focus.
 *  - a11y: outer <nav> has no aria-label (tablist owns the label).
 */
import * as React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { createUIPrefsStore } from '../stores/createUIPrefsStore.js';
import { UIPrefsStoreProvider } from '../stores/index.js';
import { SettingsPanel } from './SettingsPanel.js';
import type { UIPrefsConfig, SettingsPanelDescriptor } from './types.js';

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

function makePanels(): SettingsPanelDescriptor[] {
  return [
    { id: 'alpha', label: 'Alpha', content: <div>Alpha content</div> },
    { id: 'beta', label: 'Beta', content: <div>Beta content</div> },
  ];
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

// ─── Keyboard: ArrowDown ─────────────────────────────────────────────────────

describe('SettingsPanel — keyboard: ArrowDown', () => {
  it('ArrowDown on active tab calls onSelectPanel with next id AND moves focus', async () => {
    const onSelectPanel = vi.fn();
    await renderPanel({
      activePanel: 'appearance',
      onSelectPanel,
      settingsPanels: makePanels(),
    });

    const appearanceTab = screen.getByTestId('settings-modal-tab-appearance');
    appearanceTab.focus();
    fireEvent.keyDown(appearanceTab, { key: 'ArrowDown' });

    expect(onSelectPanel).toHaveBeenCalledWith('alpha');
    const alphaTab = screen.getByTestId('settings-modal-tab-alpha');
    expect(document.activeElement).toBe(alphaTab);
  });

  it('ArrowDown on last tab wraps to first tab (appearance)', async () => {
    const onSelectPanel = vi.fn();
    await renderPanel({
      activePanel: 'beta',
      onSelectPanel,
      settingsPanels: makePanels(),
    });

    const betaTab = screen.getByTestId('settings-modal-tab-beta');
    betaTab.focus();
    fireEvent.keyDown(betaTab, { key: 'ArrowDown' });

    expect(onSelectPanel).toHaveBeenCalledWith('appearance');
    const appearanceTab = screen.getByTestId('settings-modal-tab-appearance');
    expect(document.activeElement).toBe(appearanceTab);
  });
});

// ─── Keyboard: ArrowUp ──────────────────────────────────────────────────────

describe('SettingsPanel — keyboard: ArrowUp', () => {
  it('ArrowUp on first tab wraps to last tab', async () => {
    const onSelectPanel = vi.fn();
    await renderPanel({
      activePanel: 'appearance',
      onSelectPanel,
      settingsPanels: makePanels(),
    });

    const appearanceTab = screen.getByTestId('settings-modal-tab-appearance');
    appearanceTab.focus();
    fireEvent.keyDown(appearanceTab, { key: 'ArrowUp' });

    expect(onSelectPanel).toHaveBeenCalledWith('beta');
    const betaTab = screen.getByTestId('settings-modal-tab-beta');
    expect(document.activeElement).toBe(betaTab);
  });

  it('ArrowUp moves focus to previous tab', async () => {
    const onSelectPanel = vi.fn();
    await renderPanel({
      activePanel: 'alpha',
      onSelectPanel,
      settingsPanels: makePanels(),
    });

    const alphaTab = screen.getByTestId('settings-modal-tab-alpha');
    alphaTab.focus();
    fireEvent.keyDown(alphaTab, { key: 'ArrowUp' });

    expect(onSelectPanel).toHaveBeenCalledWith('appearance');
    const appearanceTab = screen.getByTestId('settings-modal-tab-appearance');
    expect(document.activeElement).toBe(appearanceTab);
  });
});

// ─── Keyboard: Home/End ──────────────────────────────────────────────────────

describe('SettingsPanel — keyboard: Home/End', () => {
  it('Home moves focus to the first tab (appearance)', async () => {
    const onSelectPanel = vi.fn();
    await renderPanel({
      activePanel: 'beta',
      onSelectPanel,
      settingsPanels: makePanels(),
    });

    const betaTab = screen.getByTestId('settings-modal-tab-beta');
    betaTab.focus();
    fireEvent.keyDown(betaTab, { key: 'Home' });

    expect(onSelectPanel).toHaveBeenCalledWith('appearance');
    expect(document.activeElement).toBe(screen.getByTestId('settings-modal-tab-appearance'));
  });

  it('End moves focus to the last tab', async () => {
    const onSelectPanel = vi.fn();
    await renderPanel({
      activePanel: 'appearance',
      onSelectPanel,
      settingsPanels: makePanels(),
    });

    const appearanceTab = screen.getByTestId('settings-modal-tab-appearance');
    appearanceTab.focus();
    fireEvent.keyDown(appearanceTab, { key: 'End' });

    expect(onSelectPanel).toHaveBeenCalledWith('beta');
    expect(document.activeElement).toBe(screen.getByTestId('settings-modal-tab-beta'));
  });
});

// ─── a11y: no redundant nav aria-label ──────────────────────────────────────

describe('SettingsPanel — a11y: no redundant nav aria-label', () => {
  it('outer <nav> does not have aria-label (tablist owns the label)', async () => {
    await renderPanel({ activePanel: 'appearance', onSelectPanel: vi.fn() });

    const panel = screen.getByTestId('settings-panel');
    const nav = panel.querySelector('nav');
    expect(nav).not.toBeNull();
    expect(nav?.getAttribute('aria-label')).toBeNull();
  });
});
