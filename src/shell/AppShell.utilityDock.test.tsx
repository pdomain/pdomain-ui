/**
 * AppShell utility-dock integration tests.
 *
 * AppShell owns dock state (active/pinned/width), provides UtilityDockContext,
 * renders UtilityDock outside the grid, and sets --shell-right-w only when
 * pinned. `pinned`/`width` come from UIPrefs; `active` is ephemeral.
 */
import * as React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppShell } from './AppShell.js';
import { useUtilityDock } from './UtilityDockContext.js';
import type { UIPrefsConfig } from './types.js';

function makeConfig(prefs: Partial<{ dockPinned: boolean; dockWidth: number }> = {}): UIPrefsConfig {
  return {
    load: vi.fn(() =>
      Promise.resolve({ theme: 'dark' as const, density: 'normal' as const, fontScale: 1.0, ...prefs }),
    ),
    persistCommon: vi.fn(() => Promise.resolve()),
    persistApp: vi.fn(() => Promise.resolve()),
  };
}

/** Test harness: a button inside AppShell that drives the dock context. */
function DockControls() {
  const dock = useUtilityDock();
  return (
    <div>
      <button data-testid="open-settings" onClick={() => dock.open('settings')} />
      <button data-testid="toggle-jobs" onClick={() => dock.toggle('jobs')} />
      <button data-testid="pin" onClick={() => dock.setPinned(!dock.pinned)} />
      <span data-testid="active">{dock.active ?? 'none'}</span>
      <span data-testid="pinned">{String(dock.pinned)}</span>
    </div>
  );
}

async function renderShell(config: UIPrefsConfig = makeConfig()) {
  let result!: ReturnType<typeof render>;
  await act(async () => {
    result = render(
      <AppShell appId="t" appDisplayName="Test" appIconUrl="" uiPrefsConfig={config} main={<DockControls />} />,
    );
    await new Promise((r) => setTimeout(r, 0));
  });
  return result;
}

describe('AppShell — utility dock', () => {
  it('provides UtilityDockContext to descendants', async () => {
    await renderShell();
    expect(screen.getByTestId('active').textContent).toBe('none');
  });

  it('open(surface) sets active and renders the dock', async () => {
    await renderShell();
    fireEvent.click(screen.getByTestId('open-settings'));
    expect(screen.getByTestId('active').textContent).toBe('settings');
    expect(screen.getByTestId('utility-dock')).toBeTruthy();
  });

  it('toggle(surface) opens then closes the same surface', async () => {
    await renderShell();
    fireEvent.click(screen.getByTestId('toggle-jobs'));
    expect(screen.getByTestId('active').textContent).toBe('jobs');
    fireEvent.click(screen.getByTestId('toggle-jobs'));
    expect(screen.getByTestId('active').textContent).toBe('none');
  });

  it('opening a second surface swaps it (mutual exclusion)', async () => {
    await renderShell();
    fireEvent.click(screen.getByTestId('open-settings'));
    fireEvent.click(screen.getByTestId('toggle-jobs'));
    expect(screen.getByTestId('active').textContent).toBe('jobs');
    expect(screen.getAllByTestId('utility-dock').length).toBe(1);
  });

  it('does NOT set --shell-right-w when open but not pinned', async () => {
    await renderShell();
    fireEvent.click(screen.getByTestId('open-settings'));
    const shell = screen.getByTestId('app-shell');
    expect(shell.style.getPropertyValue('--shell-right-w')).toBe('');
  });

  it('sets --shell-right-w to the dock width when pinned', async () => {
    await renderShell(makeConfig({ dockPinned: true, dockWidth: 500 }));
    fireEvent.click(screen.getByTestId('open-settings'));
    const shell = screen.getByTestId('app-shell');
    expect(shell.style.getPropertyValue('--shell-right-w')).toBe('500px');
    expect(screen.getByTestId('pinned').textContent).toBe('true');
  });
});
