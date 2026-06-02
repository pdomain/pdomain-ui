/**
 * UtilityDock tests — switches on the dock context's `active` value and renders
 * the matching surface body inside a SlideOverPanel. Closed when active is null.
 */
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { act } from '@testing-library/react';
import { createUIPrefsStore } from '../stores/createUIPrefsStore.js';
import { UIPrefsStoreProvider } from '../stores/index.js';
import { UtilityDock } from './UtilityDock.js';
import { UtilityDockContext } from './UtilityDockContext.js';
import type { UtilityDockContextValue, DockSurface } from './UtilityDockContext.js';
import type { UIPrefsConfig } from './types.js';

function makeConfig(): UIPrefsConfig {
  return {
    load: vi.fn(() => Promise.resolve({ theme: 'dark' as const, density: 'normal' as const, fontScale: 1.0 })),
    persistCommon: vi.fn(() => Promise.resolve()),
    persistApp: vi.fn(() => Promise.resolve()),
  };
}

function makeCtx(overrides?: Partial<UtilityDockContextValue>): UtilityDockContextValue {
  return {
    active: null,
    pinned: false,
    width: 420,
    open: vi.fn(),
    close: vi.fn(),
    toggle: vi.fn(),
    setPinned: vi.fn(),
    setWidth: vi.fn(),
    ...overrides,
  };
}

async function renderDock(ctx: UtilityDockContextValue, props?: React.ComponentProps<typeof UtilityDock>) {
  const store = createUIPrefsStore(makeConfig());
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });
  return render(
    <UIPrefsStoreProvider value={store}>
      <UtilityDockContext.Provider value={ctx}>
        <UtilityDock {...props} />
      </UtilityDockContext.Provider>
    </UIPrefsStoreProvider>,
  );
}

describe('UtilityDock', () => {
  it('renders nothing when active is null', async () => {
    await renderDock(makeCtx({ active: null }));
    expect(screen.queryByTestId('utility-dock')).toBeNull();
    expect(screen.queryByTestId('slide-over-panel')).toBeNull();
  });

  it('renders the Settings surface when active is settings', async () => {
    await renderDock(makeCtx({ active: 'settings' as DockSurface }));
    expect(screen.getByTestId('utility-dock')).toBeTruthy();
    expect(screen.getByTestId('settings-panel')).toBeTruthy();
    expect(screen.getByText('Settings')).toBeTruthy();
  });

  it('renders the Keybinds surface when active is keybinds', async () => {
    await renderDock(makeCtx({ active: 'keybinds' as DockSurface }), {
      bindings: [{ keys: 's', label: 'Save', handler: () => undefined }],
    });
    expect(screen.getByTestId('shortcuts-cheatsheet-body')).toBeTruthy();
  });

  it('renders the Jobs surface when active is jobs', async () => {
    await renderDock(makeCtx({ active: 'jobs' as DockSurface }), {
      activeJobs: [{ id: 'j1', project: 'belloc', phase: 'OCR', pct: 40, status: 'running', cancelable: true }],
    });
    expect(screen.getByTestId('jobs-panel-body')).toBeTruthy();
  });

  it('the panel ✕ calls the context close()', async () => {
    const close = vi.fn();
    await renderDock(makeCtx({ active: 'settings' as DockSurface, close }));
    fireEvent.click(screen.getByTestId('slide-over-panel-close'));
    expect(close).toHaveBeenCalledOnce();
  });

  it('the pin toggle calls context setPinned with the inverted value', async () => {
    const setPinned = vi.fn();
    await renderDock(makeCtx({ active: 'settings' as DockSurface, pinned: false, setPinned }));
    fireEvent.click(screen.getByTestId('slide-over-panel-pin'));
    expect(setPinned).toHaveBeenCalledWith(true);
  });
});
