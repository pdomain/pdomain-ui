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

function makeConfig(
  prefs: Partial<{ dockPinned: boolean; dockWidth: number }> = {},
): UIPrefsConfig {
  return {
    load: vi.fn(() =>
      Promise.resolve({
        theme: 'dark' as const,
        density: 'normal' as const,
        fontScale: 1.0,
        ...prefs,
      }),
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
      <button data-testid="toggle-keybinds" onClick={() => dock.toggle('keybinds')} />
      <button data-testid="close" onClick={() => dock.close()} />
      <button data-testid="pin" onClick={() => dock.setPinned(true)} />
      <button data-testid="unpin" onClick={() => dock.setPinned(false)} />
      <span data-testid="active">{dock.active ?? 'none'}</span>
      <span data-testid="pinned">{String(dock.pinned)}</span>
      <span data-testid="width">{String(dock.width)}</span>
    </div>
  );
}

async function renderShell(config: UIPrefsConfig = makeConfig()) {
  let result!: ReturnType<typeof render>;
  await act(async () => {
    result = render(
      <AppShell
        appId="t"
        appDisplayName="Test"
        appIconUrl=""
        uiPrefsConfig={config}
        main={<DockControls />}
      />,
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

describe('AppShell — utility dock (M4 review fixes)', () => {
  it('pinned drives --shell-right-w; unpin clears it; close while pinned also clears it', async () => {
    // Start unpinned, default width (420)
    await renderShell(makeConfig({ dockPinned: false, dockWidth: 420 }));
    const shell = screen.getByTestId('app-shell');

    // Open a surface then pin → CSS variable should be set
    fireEvent.click(screen.getByTestId('open-settings'));
    fireEvent.click(screen.getByTestId('pin'));
    expect(shell.style.getPropertyValue('--shell-right-w')).toBe('420px');

    // Unpin → variable should clear
    fireEvent.click(screen.getByTestId('unpin'));
    expect(shell.style.getPropertyValue('--shell-right-w')).toBe('');

    // Re-pin and then close → closed while pinned, variable should clear (dockActive === null)
    fireEvent.click(screen.getByTestId('pin'));
    expect(shell.style.getPropertyValue('--shell-right-w')).toBe('420px');
    fireEvent.click(screen.getByTestId('close'));
    expect(shell.style.getPropertyValue('--shell-right-w')).toBe('');
  });

  it('mutual exclusion: opening keybinds replaces settings', async () => {
    await renderShell();

    // Open settings first
    fireEvent.click(screen.getByTestId('open-settings'));
    expect(screen.getByTestId('active').textContent).toBe('settings');
    // Settings body present
    expect(screen.getByTestId('utility-dock')).toBeTruthy();

    // Toggle keybinds → settings replaced, keybinds active
    fireEvent.click(screen.getByTestId('toggle-keybinds'));
    expect(screen.getByTestId('active').textContent).toBe('keybinds');
    // Only one dock panel at a time
    expect(screen.getAllByTestId('utility-dock').length).toBe(1);
  });
});

describe('AppShell — utility dock focus return on close', () => {
  it('returns focus to the trigger button when close() unmounts the dock', async () => {
    // Regression guard: SlideOverPanel must restore focus on unmount-while-open.
    // AppShell conditionally renders UtilityDock (`{dockActive !== null && <UtilityDock/>}`),
    // so close() unmounts the entire dock tree while SlideOverPanel's open prop is still true.
    await renderShell();

    const openBtn = screen.getByTestId('open-settings');
    // Explicitly focus the trigger so triggerRef is captured on dock open.
    openBtn.focus();
    expect(document.activeElement).toBe(openBtn);

    // Open the dock — SlideOverPanel mounts with open=true, captures triggerRef.
    fireEvent.click(openBtn);
    expect(screen.getByTestId('active').textContent).toBe('settings');
    // Focus has moved into the panel.
    expect(document.activeElement).not.toBe(openBtn);

    // Close the dock — sets dockActive to null, unmounting UtilityDock (and SlideOverPanel).
    // The cleanup effect must fire and restore focus to openBtn.
    fireEvent.click(screen.getByTestId('close'));
    expect(screen.getByTestId('active').textContent).toBe('none');
    expect(document.activeElement).toBe(openBtn);
  });
});
