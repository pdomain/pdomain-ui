/**
 * createUIPrefsStore tests — covering #164.
 */
import { describe, it, expect, vi } from 'vitest';
import { createUIPrefsStore } from './createUIPrefsStore.js';
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

describe('createUIPrefsStore (#164)', () => {
  it('returns a new store each call', () => {
    const a = createUIPrefsStore(makeConfig());
    const b = createUIPrefsStore(makeConfig());
    expect(a).not.toBe(b);
  });

  it('initial state has loading=true', () => {
    const store = createUIPrefsStore(makeConfig());
    expect(store.getState().loading).toBe(true);
  });

  it('hydrates prefs after load() resolves', async () => {
    const config = makeConfig({ theme: 'light', density: 'compact' });
    const store = createUIPrefsStore(config);
    // Wait for the promise to resolve
    await new Promise((r) => setTimeout(r, 0));
    expect(store.getState().prefs.theme).toBe('light');
    expect(store.getState().prefs.density).toBe('compact');
    expect(store.getState().loading).toBe(false);
  });

  it('setTheme() updates prefs.theme and calls persistCommon', async () => {
    const config = makeConfig();
    const store = createUIPrefsStore(config);
    await new Promise((r) => setTimeout(r, 0));
    store.getState().setTheme('light');
    expect(store.getState().prefs.theme).toBe('light');
    expect(config.persistCommon).toHaveBeenCalledWith(expect.objectContaining({ theme: 'light' }));
  });

  it('setDensity() updates prefs.density and calls persistCommon', async () => {
    const config = makeConfig();
    const store = createUIPrefsStore(config);
    await new Promise((r) => setTimeout(r, 0));
    store.getState().setDensity('compact');
    expect(store.getState().prefs.density).toBe('compact');
    expect(config.persistCommon).toHaveBeenCalledWith(
      expect.objectContaining({ density: 'compact' }),
    );
  });

  it('setAppPref() updates app prefs and calls persistApp', async () => {
    const config = makeConfig();
    const store = createUIPrefsStore(config);
    await new Promise((r) => setTimeout(r, 0));
    store.getState().setAppPref('show_diff', true);
    expect(store.getState().prefs.app?.['show_diff']).toBe(true);
    expect(config.persistApp).toHaveBeenCalledWith(expect.objectContaining({ show_diff: true }));
  });

  it('getLayerColor() returns CSS var fallback when no override', async () => {
    const store = createUIPrefsStore(makeConfig());
    await new Promise((r) => setTimeout(r, 0));
    expect(store.getState().getLayerColor('block')).toBe('var(--block)');
    expect(store.getState().getLayerColor('word')).toBe('var(--word)');
  });

  it('getLayerColor() returns override when set in prefs', async () => {
    const config = makeConfig({ layerColors: { block: '#ff0000' } });
    const store = createUIPrefsStore(config);
    await new Promise((r) => setTimeout(r, 0));
    expect(store.getState().getLayerColor('block')).toBe('#ff0000');
  });

  it('getStatusColor() returns CSS var fallback when no override', async () => {
    const store = createUIPrefsStore(makeConfig());
    await new Promise((r) => setTimeout(r, 0));
    expect(store.getState().getStatusColor('exact')).toBe('var(--exact)');
    expect(store.getState().getStatusColor('mismatch')).toBe('var(--mismatch)');
  });

  it('getAccentColor() returns CSS var fallbacks by default — fg=var(--accent-ink), bg=var(--accent)', async () => {
    const store = createUIPrefsStore(makeConfig());
    await new Promise((r) => setTimeout(r, 0));
    const { fg, bg } = store.getState().getAccentColor();
    // fg is the INK color (text drawn ON the accent bg) → --accent-ink
    // bg is the ACCENT background color → --accent
    expect(fg).toBe('var(--accent-ink)');
    expect(bg).toBe('var(--accent)');
  });

  it('getAccentColor() returns override when set — fg=accentInkColor, bg=accentColor (WS4)', async () => {
    // accentInkColor is the ink/text color to draw ON the accent bg → fg
    // accentColor    is the accent background              → bg
    const config = makeConfig({ accentColor: '#ff6600', accentInkColor: '#ffffff' });
    const store = createUIPrefsStore(config);
    await new Promise((r) => setTimeout(r, 0));
    const { fg, bg } = store.getState().getAccentColor();
    expect(fg).toBe('#ffffff'); // accentInkColor → fg
    expect(bg).toBe('#ff6600'); // accentColor    → bg
  });

  it('survives load() failure and sets loading=false', async () => {
    const config: UIPrefsConfig = {
      load: vi.fn(() => Promise.reject(new Error('network error'))),
      persistCommon: vi.fn(() => Promise.resolve()),
      persistApp: vi.fn(() => Promise.resolve()),
    };
    const store = createUIPrefsStore(config);
    await new Promise((r) => setTimeout(r, 0));
    expect(store.getState().loading).toBe(false);
    // Prefs kept at defaults
    expect(store.getState().prefs.theme).toBe('dark');
  });
});

// ─── Hydration-race tests (issue #37) ─────────────────────────────────────────

describe('createUIPrefsStore — hydration race (#37)', () => {
  /**
   * Helper: create a store with a controllable load() that resolves
   * only when `resolve()` is called.
   */
  function makeDeferred(serverPrefs: Partial<UIPrefs> = {}) {
    let resolve!: (value: UIPrefs) => void;
    const promise = new Promise<UIPrefs>((res) => {
      resolve = res;
    });
    const config: UIPrefsConfig = {
      load: vi.fn(() => promise),
      persistCommon: vi.fn(() => Promise.resolve()),
      persistApp: vi.fn(() => Promise.resolve()),
    };
    const serverValues: UIPrefs = {
      theme: 'dark',
      density: 'normal',
      fontScale: 1.0,
      ...serverPrefs,
    };
    return { config, store: createUIPrefsStore(config), resolve: () => resolve(serverValues) };
  }

  it('load-then-edit: server value applied, then edit sticks', async () => {
    const { store, resolve } = makeDeferred({ theme: 'light' });
    // Load resolves first
    resolve();
    await new Promise((r) => setTimeout(r, 0));
    expect(store.getState().prefs.theme).toBe('light');
    // Now user edits
    store.getState().setTheme('dark');
    expect(store.getState().prefs.theme).toBe('dark');
    expect(store.getState().loading).toBe(false);
  });

  it('edit-then-load (late): user edit wins over server value', async () => {
    const { store, resolve } = makeDeferred({ theme: 'light' });
    // User edits before load resolves
    store.getState().setTheme('dark');
    expect(store.getState().prefs.theme).toBe('dark');
    // Load arrives late — must NOT clobber the edit
    resolve();
    await new Promise((r) => setTimeout(r, 0));
    expect(store.getState().prefs.theme).toBe('dark');
    expect(store.getState().loading).toBe(false);
  });

  it('edit-then-load: unedited keys are updated from server', async () => {
    const { store, resolve } = makeDeferred({ theme: 'light', density: 'compact' });
    // User edits only theme before load resolves
    store.getState().setTheme('dark');
    // Load arrives with density: 'compact' — that should be applied
    resolve();
    await new Promise((r) => setTimeout(r, 0));
    // theme was edited by user — keep user's value
    expect(store.getState().prefs.theme).toBe('dark');
    // density was NOT edited — server value should apply
    expect(store.getState().prefs.density).toBe('compact');
  });

  it('multiple edits before load: all edited keys survive', async () => {
    const { store, resolve } = makeDeferred({ theme: 'light', density: 'compact', fontScale: 1.2 });
    store.getState().setTheme('dark');
    store.getState().setDensity('comfortable');
    // fontScale not edited
    resolve();
    await new Promise((r) => setTimeout(r, 0));
    expect(store.getState().prefs.theme).toBe('dark');
    expect(store.getState().prefs.density).toBe('comfortable');
    // fontScale not edited — server value wins
    expect(store.getState().prefs.fontScale).toBe(1.2);
  });

  it('reset path: after hydration, setTheme always wins', async () => {
    const { store, resolve } = makeDeferred({ theme: 'light' });
    resolve();
    await new Promise((r) => setTimeout(r, 0));
    expect(store.getState().prefs.theme).toBe('light');
    // Set to dark, then set back to light — final value should always be what the setter says
    store.getState().setTheme('dark');
    expect(store.getState().prefs.theme).toBe('dark');
    store.getState().setTheme('light');
    expect(store.getState().prefs.theme).toBe('light');
  });

  it('setAppPref edit before load: app pref survives hydration', async () => {
    const { store, resolve } = makeDeferred({ theme: 'light' });
    store.getState().setAppPref('zoom', 2);
    resolve();
    await new Promise((r) => setTimeout(r, 0));
    // app prefs edited — keep user value
    expect(store.getState().prefs.app?.['zoom']).toBe(2);
    // theme was not edited before load — server value applies
    expect(store.getState().prefs.theme).toBe('light');
  });
});

describe('createUIPrefsStore — utility dock prefs', () => {
  it('setDockPinned() updates prefs.dockPinned and calls persistCommon', async () => {
    const config = makeConfig();
    const store = createUIPrefsStore(config);
    await new Promise((r) => setTimeout(r, 0));
    store.getState().setDockPinned(true);
    expect(store.getState().prefs.dockPinned).toBe(true);
    expect(config.persistCommon).toHaveBeenCalledWith(
      expect.objectContaining({ dockPinned: true }),
    );
  });

  it('setDockWidth() updates prefs.dockWidth and calls persistCommon', async () => {
    const config = makeConfig();
    const store = createUIPrefsStore(config);
    await new Promise((r) => setTimeout(r, 0));
    store.getState().setDockWidth(500);
    expect(store.getState().prefs.dockWidth).toBe(500);
    expect(config.persistCommon).toHaveBeenCalledWith(expect.objectContaining({ dockWidth: 500 }));
  });

  it('setDockWidth() clamps below 320 up to 320', async () => {
    const store = createUIPrefsStore(makeConfig());
    await new Promise((r) => setTimeout(r, 0));
    store.getState().setDockWidth(100);
    expect(store.getState().prefs.dockWidth).toBe(320);
  });

  it('setDockWidth() clamps above 640 down to 640', async () => {
    const store = createUIPrefsStore(makeConfig());
    await new Promise((r) => setTimeout(r, 0));
    store.getState().setDockWidth(9999);
    expect(store.getState().prefs.dockWidth).toBe(640);
  });
});
