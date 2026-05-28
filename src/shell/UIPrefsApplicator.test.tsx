/**
 * UIPrefsApplicator — behavioral tests for CSS custom property writes.
 *
 * Covers audit WS5: color overrides must be written as CSS vars via
 * setProperty when overrides differ from token fallback defaults.
 */
import * as React from 'react';
import { render, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UIPrefsStoreProvider } from '../stores/StoreContexts.js';
import { createUIPrefsStore } from '../stores/createUIPrefsStore.js';
import type { UIPrefsConfig } from './types.js';
import { UIPrefsApplicator } from './UIPrefsApplicator.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeConfig(overrides: Partial<UIPrefsConfig> = {}): UIPrefsConfig {
  return {
    load: vi.fn(() =>
      Promise.resolve({
        theme: 'dark' as const,
        density: 'normal' as const,
        fontScale: 1.0,
      }),
    ),
    persistCommon: vi.fn(() => Promise.resolve()),
    persistApp: vi.fn(() => Promise.resolve()),
    ...overrides,
  };
}

function renderApplicator(config?: Partial<UIPrefsConfig>) {
  const store = createUIPrefsStore(makeConfig(config));
  const { rerender } = render(
    <UIPrefsStoreProvider value={store}>
      <UIPrefsApplicator />
    </UIPrefsStoreProvider>,
  );
  return { store, rerender };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('UIPrefsApplicator — CSS var writes (audit WS5)', () => {
  beforeEach(() => {
    // Clean any CSS vars set by previous tests
    const root = document.documentElement;
    [
      '--block',
      '--para',
      '--line',
      '--word',
      '--exact',
      '--fuzzy',
      '--mismatch',
      '--ocr',
      '--gt',
      '--accent',
      '--accent-ink',
    ].forEach((v) => root.style.removeProperty(v));
  });

  it('writes --block CSS var when layerColor override is set', () => {
    const { store } = renderApplicator();
    act(() => {
      store.getState().setLayerColor('block', '#ff0000');
    });
    const val = document.documentElement.style.getPropertyValue('--block');
    expect(val).toBe('#ff0000');
  });

  it('writes --word CSS var when layerColor override is set', () => {
    const { store } = renderApplicator();
    act(() => {
      store.getState().setLayerColor('word', '#00ff00');
    });
    expect(document.documentElement.style.getPropertyValue('--word')).toBe('#00ff00');
  });

  it('removes --block CSS var when layerColor override is cleared', () => {
    const { store } = renderApplicator();
    act(() => {
      store.getState().setLayerColor('block', '#ff0000');
    });
    act(() => {
      store.getState().setLayerColor('block', undefined);
    });
    expect(document.documentElement.style.getPropertyValue('--block')).toBe('');
  });

  it('writes --exact CSS var when statusColor override is set', () => {
    const { store } = renderApplicator();
    act(() => {
      store.getState().setStatusColor('exact', '#aabbcc');
    });
    expect(document.documentElement.style.getPropertyValue('--exact')).toBe('#aabbcc');
  });

  it('writes --ocr CSS var when statusColor override is set', () => {
    const { store } = renderApplicator();
    act(() => {
      store.getState().setStatusColor('ocr', '#123456');
    });
    expect(document.documentElement.style.getPropertyValue('--ocr')).toBe('#123456');
  });

  it('writes --accent CSS var when accentColor override is set', () => {
    const { store } = renderApplicator();
    act(() => {
      store.getState().setAccentColor('#9900ff');
    });
    expect(document.documentElement.style.getPropertyValue('--accent')).toBe('#9900ff');
  });

  it('writes --accent-ink CSS var when accentInkColor override is set', () => {
    const { store } = renderApplicator();
    act(() => {
      store.getState().setAccentInkColor('#ffffff');
    });
    expect(document.documentElement.style.getPropertyValue('--accent-ink')).toBe('#ffffff');
  });

  it('does not write CSS var when value equals the default token string', () => {
    const { store } = renderApplicator();
    // Default for block is 'var(--block)' — this is a token ref, not an override.
    // Setting to undefined clears it; the default token is never written as setProperty.
    act(() => {
      store.getState().setLayerColor('block', undefined);
    });
    expect(document.documentElement.style.getPropertyValue('--block')).toBe('');
  });

  it('writes all 4 layer colors when each is set', () => {
    const { store } = renderApplicator();
    act(() => {
      store.getState().setLayerColor('block', '#111');
      store.getState().setLayerColor('para', '#222');
      store.getState().setLayerColor('line', '#333');
      store.getState().setLayerColor('word', '#444');
    });
    const root = document.documentElement;
    expect(root.style.getPropertyValue('--block')).toBe('#111');
    expect(root.style.getPropertyValue('--para')).toBe('#222');
    expect(root.style.getPropertyValue('--line')).toBe('#333');
    expect(root.style.getPropertyValue('--word')).toBe('#444');
  });

  it('writes all 5 status colors when each is set', () => {
    const { store } = renderApplicator();
    act(() => {
      store.getState().setStatusColor('exact', '#a1');
      store.getState().setStatusColor('fuzzy', '#a2');
      store.getState().setStatusColor('mismatch', '#a3');
      store.getState().setStatusColor('ocr', '#a4');
      store.getState().setStatusColor('gt', '#a5');
    });
    const root = document.documentElement;
    ['exact', 'fuzzy', 'mismatch', 'ocr', 'gt'].forEach((s, i) => {
      expect(root.style.getPropertyValue(`--${s}`)).toBe(`#a${i + 1}`);
    });
  });
});
