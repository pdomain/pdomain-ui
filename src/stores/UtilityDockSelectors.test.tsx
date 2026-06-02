/**
 * Selector-hook tests for useDockPinned / useDockWidth.
 * Mirrors the useTheme/useFontScale selector pattern in StoreContexts.tsx.
 */
import * as React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { createUIPrefsStore } from './createUIPrefsStore.js';
import { UIPrefsStoreProvider, useDockPinned, useDockWidth } from './index.js';
import type { UIPrefs, UIPrefsConfig } from '../shell/types.js';

function makeConfig(prefs: Partial<UIPrefs> = {}): UIPrefsConfig {
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

function Probe() {
  const pinned = useDockPinned();
  const width = useDockWidth();
  return (
    <div>
      <span data-testid="pinned">{String(pinned)}</span>
      <span data-testid="width">{width}</span>
    </div>
  );
}

describe('useDockPinned / useDockWidth', () => {
  it('defaults to false / 420 when prefs are unset', async () => {
    const store = createUIPrefsStore(makeConfig());
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
    render(
      <UIPrefsStoreProvider value={store}>
        <Probe />
      </UIPrefsStoreProvider>,
    );
    expect(screen.getByTestId('pinned').textContent).toBe('false');
    expect(screen.getByTestId('width').textContent).toBe('420');
  });

  it('reflects persisted values from the store', async () => {
    const store = createUIPrefsStore(makeConfig({ dockPinned: true, dockWidth: 500 }));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
    render(
      <UIPrefsStoreProvider value={store}>
        <Probe />
      </UIPrefsStoreProvider>,
    );
    expect(screen.getByTestId('pinned').textContent).toBe('true');
    expect(screen.getByTestId('width').textContent).toBe('500');
  });

  it('useDockPinned throws outside a provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Probe />)).toThrow(/UIPrefsStoreProvider/);
    spy.mockRestore();
  });
});
