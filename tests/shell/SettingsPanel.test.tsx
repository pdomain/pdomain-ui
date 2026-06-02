/**
 * SettingsPanel tests — keyboard focus management and tab navigation.
 *
 * Tests:
 *  1. ArrowDown on active tab calls onSelectPanel with next id AND moves DOM focus.
 *  2. ArrowUp wraps from first to last tab.
 *  3. ArrowDown wraps from last to first tab.
 *  4. Home moves focus to first tab.
 *  5. End moves focus to last tab.
 *  6. Clicking a tab calls onSelectPanel.
 *  7. The outer <nav> has no aria-label (removed redundant label — item #3).
 *
 * SettingsPanel always renders the built-in AppearancePanel which requires a
 * UIPrefsStoreProvider. The `renderSettings` helper wraps with a minimal store.
 */
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SettingsPanel } from '../../src/shell/SettingsPanel.js';
import { UIPrefsStoreProvider } from '../../src/stores/StoreContexts.js';
import { createUIPrefsStore } from '../../src/stores/createUIPrefsStore.js';
import type { SettingsPanelDescriptor } from '../../src/shell/types.js';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeStore() {
  return createUIPrefsStore({
    load: () =>
      Promise.resolve({ theme: 'dark' as const, density: 'normal' as const, fontScale: 1 }),
    persistCommon: vi.fn().mockResolvedValue(undefined),
    persistApp: vi.fn().mockResolvedValue(undefined),
  });
}

function makePanels(): SettingsPanelDescriptor[] {
  return [
    { id: 'alpha', label: 'Alpha', content: <div>Alpha content</div> },
    { id: 'beta', label: 'Beta', content: <div>Beta content</div> },
  ];
}

interface RenderOpts {
  activePanel: string;
  onSelectPanel: (id: string) => void;
  settingsPanels?: SettingsPanelDescriptor[];
}

function renderSettings({ activePanel, onSelectPanel, settingsPanels }: RenderOpts) {
  const store = makeStore();
  return render(
    <UIPrefsStoreProvider value={store}>
      <SettingsPanel
        activePanel={activePanel}
        onSelectPanel={onSelectPanel}
        {...(settingsPanels !== undefined ? { settingsPanels } : {})}
      />
    </UIPrefsStoreProvider>,
  );
}

// ─── 1. ArrowDown moves DOM focus + calls onSelectPanel ───────────────────────

describe('SettingsPanel — keyboard: ArrowDown', () => {
  it('ArrowDown on active tab calls onSelectPanel with next id AND moves focus', () => {
    const onSelectPanel = vi.fn();
    renderSettings({
      activePanel: 'appearance',
      onSelectPanel,
      settingsPanels: makePanels(),
    });

    const appearanceTab = screen.getByTestId('settings-modal-tab-appearance');
    appearanceTab.focus();
    fireEvent.keyDown(appearanceTab, { key: 'ArrowDown' });

    // onSelectPanel called with the next tab id
    expect(onSelectPanel).toHaveBeenCalledWith('alpha');

    // DOM focus moved to the alpha tab button
    const alphaTab = screen.getByTestId('settings-modal-tab-alpha');
    expect(document.activeElement).toBe(alphaTab);
  });

  it('ArrowDown on last tab wraps to first tab (appearance)', () => {
    const onSelectPanel = vi.fn();
    renderSettings({
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

// ─── 2. ArrowUp moves DOM focus + calls onSelectPanel ────────────────────────

describe('SettingsPanel — keyboard: ArrowUp', () => {
  it('ArrowUp on first tab wraps to last tab', () => {
    const onSelectPanel = vi.fn();
    renderSettings({
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

  it('ArrowUp moves focus to previous tab', () => {
    const onSelectPanel = vi.fn();
    renderSettings({
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

// ─── 3. Home/End move focus ───────────────────────────────────────────────────

describe('SettingsPanel — keyboard: Home/End', () => {
  it('Home moves focus to the first tab (appearance)', () => {
    const onSelectPanel = vi.fn();
    renderSettings({
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

  it('End moves focus to the last tab', () => {
    const onSelectPanel = vi.fn();
    renderSettings({
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

// ─── 4. Click calls onSelectPanel ─────────────────────────────────────────────

describe('SettingsPanel — click', () => {
  it('clicking a tab calls onSelectPanel with the tab id', () => {
    const onSelectPanel = vi.fn();
    renderSettings({
      activePanel: 'appearance',
      onSelectPanel,
      settingsPanels: makePanels(),
    });

    fireEvent.click(screen.getByTestId('settings-modal-tab-alpha'));
    expect(onSelectPanel).toHaveBeenCalledWith('alpha');
  });
});

// ─── 5. No redundant aria-label on <nav> ─────────────────────────────────────

describe('SettingsPanel — a11y: no redundant nav aria-label', () => {
  it('outer <nav> does not have aria-label (tablist owns the label)', () => {
    renderSettings({ activePanel: 'appearance', onSelectPanel: vi.fn() });

    const panel = screen.getByTestId('settings-panel');
    const nav = panel.querySelector('nav');
    expect(nav).not.toBeNull();
    expect(nav?.getAttribute('aria-label')).toBeNull();
  });
});
