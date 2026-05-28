/**
 * Context-bound hook tests — covering #163, #164.
 */
import * as React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  SelectionStoreProvider,
  ViewportStoreProvider,
  WorklistStoreProvider,
  UIPrefsStoreProvider,
  useSelection,
  useViewport,
  useWorklist,
  useUIPrefs,
  useTheme,
  useDensity,
  useLayerColor,
  useStatusColor,
  useAccentColor,
} from './StoreContexts.js';
import { createSelectionStore } from './createSelectionStore.js';
import { createViewportStore } from './createViewportStore.js';
import { createWorklistStore } from './createWorklistStore.js';
import { createUIPrefsStore } from './createUIPrefsStore.js';
import type { UIPrefsConfig } from '../shell/types.js';

function noop(): UIPrefsConfig {
  return {
    load: vi.fn(() =>
      Promise.resolve({ theme: 'dark' as const, density: 'normal' as const, fontScale: 1.0 }),
    ),
    persistCommon: vi.fn(() => Promise.resolve()),
    persistApp: vi.fn(() => Promise.resolve()),
  };
}

// ─── SelectionStore context hooks ─────────────────────────────────────────────

function SelectionReadout() {
  const s = useSelection();
  return <span data-testid="sel-count">{s.ids.size}</span>;
}

describe('useSelection (#163)', () => {
  it('reads ids.size from the store', () => {
    const store = createSelectionStore();
    render(
      <SelectionStoreProvider value={store}>
        <SelectionReadout />
      </SelectionStoreProvider>,
    );
    expect(screen.getByTestId('sel-count').textContent).toBe('0');
  });

  it('re-renders when store updates', () => {
    const store = createSelectionStore();
    render(
      <SelectionStoreProvider value={store}>
        <SelectionReadout />
      </SelectionStoreProvider>,
    );
    act(() => {
      store.getState().select('w1');
    });
    expect(screen.getByTestId('sel-count').textContent).toBe('1');
  });

  it('throws outside provider', () => {
    const original = console.error;
    console.error = () => {
      /* suppress React error boundary output */
    };
    expect(() => render(<SelectionReadout />)).toThrow();
    console.error = original;
  });
});

// ─── ViewportStore context hooks ──────────────────────────────────────────────

function ViewportReadout() {
  const v = useViewport();
  return <span data-testid="vp-scale">{v.scale}</span>;
}

describe('useViewport (#163)', () => {
  it('reads scale from the store', () => {
    const store = createViewportStore();
    render(
      <ViewportStoreProvider value={store}>
        <ViewportReadout />
      </ViewportStoreProvider>,
    );
    expect(screen.getByTestId('vp-scale').textContent).toBe('1');
  });

  it('re-renders when scale changes', () => {
    const store = createViewportStore();
    render(
      <ViewportStoreProvider value={store}>
        <ViewportReadout />
      </ViewportStoreProvider>,
    );
    act(() => {
      store.getState().setScale(2.5);
    });
    expect(screen.getByTestId('vp-scale').textContent).toBe('2.5');
  });
});

// ─── WorklistStore context hooks ──────────────────────────────────────────────

function WorklistReadout() {
  const w = useWorklist();
  return <span data-testid="wl-filter">{w.filter}</span>;
}

describe('useWorklist (#163)', () => {
  it('reads filter from the store', () => {
    const store = createWorklistStore();
    render(
      <WorklistStoreProvider value={store}>
        <WorklistReadout />
      </WorklistStoreProvider>,
    );
    expect(screen.getByTestId('wl-filter').textContent).toBe('');
  });

  it('re-renders when filter changes', () => {
    const store = createWorklistStore();
    render(
      <WorklistStoreProvider value={store}>
        <WorklistReadout />
      </WorklistStoreProvider>,
    );
    act(() => {
      store.getState().setFilter('foo');
    });
    expect(screen.getByTestId('wl-filter').textContent).toBe('foo');
  });
});

// ─── UIPrefsStore context hooks ───────────────────────────────────────────────

function ThemeReadout() {
  const theme = useTheme();
  return <span data-testid="theme">{theme}</span>;
}

function DensityReadout() {
  const density = useDensity();
  return <span data-testid="density">{density}</span>;
}

function LayerColorReadout({ layer }: { layer: 'block' | 'para' | 'line' | 'word' }) {
  const color = useLayerColor(layer);
  return <span data-testid={`layer-${layer}`}>{color}</span>;
}

function StatusColorReadout({ status }: { status: 'exact' | 'fuzzy' | 'mismatch' | 'ocr' | 'gt' }) {
  const color = useStatusColor(status);
  return <span data-testid={`status-${status}`}>{color}</span>;
}

function AccentReadout() {
  const { fg, bg } = useAccentColor();
  return (
    <div>
      <span data-testid="accent-fg">{fg}</span>
      <span data-testid="accent-bg">{bg}</span>
    </div>
  );
}

describe('useTheme / useDensity / useLayerColor / useStatusColor / useAccentColor (#164)', () => {
  it('useTheme returns dark by default', async () => {
    const store = createUIPrefsStore(noop());
    render(
      <UIPrefsStoreProvider value={store}>
        <ThemeReadout />
      </UIPrefsStoreProvider>,
    );
    await act(() => Promise.resolve());
    expect(screen.getByTestId('theme').textContent).toBe('dark');
  });

  it('useDensity returns normal by default', async () => {
    const store = createUIPrefsStore(noop());
    render(
      <UIPrefsStoreProvider value={store}>
        <DensityReadout />
      </UIPrefsStoreProvider>,
    );
    await act(() => Promise.resolve());
    expect(screen.getByTestId('density').textContent).toBe('normal');
  });

  it('useLayerColor returns CSS var by default', async () => {
    const store = createUIPrefsStore(noop());
    render(
      <UIPrefsStoreProvider value={store}>
        <LayerColorReadout layer="block" />
      </UIPrefsStoreProvider>,
    );
    await act(() => Promise.resolve());
    expect(screen.getByTestId('layer-block').textContent).toBe('var(--block)');
  });

  it('useStatusColor returns CSS var by default', async () => {
    const store = createUIPrefsStore(noop());
    render(
      <UIPrefsStoreProvider value={store}>
        <StatusColorReadout status="exact" />
      </UIPrefsStoreProvider>,
    );
    await act(() => Promise.resolve());
    expect(screen.getByTestId('status-exact').textContent).toBe('var(--exact)');
  });

  it('useAccentColor returns CSS var fallbacks by default', async () => {
    const store = createUIPrefsStore(noop());
    render(
      <UIPrefsStoreProvider value={store}>
        <AccentReadout />
      </UIPrefsStoreProvider>,
    );
    await act(() => Promise.resolve());
    // fg = ink/text on accent bg → --accent-ink; bg = accent background → --accent (WS4 fix)
    expect(screen.getByTestId('accent-fg').textContent).toBe('var(--accent-ink)');
    expect(screen.getByTestId('accent-bg').textContent).toBe('var(--accent)');
  });

  it('useTheme re-renders when setTheme called', async () => {
    const store = createUIPrefsStore(noop());
    render(
      <UIPrefsStoreProvider value={store}>
        <ThemeReadout />
      </UIPrefsStoreProvider>,
    );
    await act(() => Promise.resolve());
    act(() => {
      store.getState().setTheme('light');
    });
    expect(screen.getByTestId('theme').textContent).toBe('light');
  });

  it('useUIPrefs returns the whole prefs object', async () => {
    const store = createUIPrefsStore(noop());
    function PrefsReadout() {
      const s = useUIPrefs();
      return <span data-testid="prefs-loading">{s.loading ? 'y' : 'n'}</span>;
    }
    render(
      <UIPrefsStoreProvider value={store}>
        <PrefsReadout />
      </UIPrefsStoreProvider>,
    );
    await act(() => Promise.resolve());
    // After hydration loading=false
    expect(screen.getByTestId('prefs-loading').textContent).toBe('n');
  });
});
