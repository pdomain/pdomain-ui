/**
 * createUIPrefsStore — Zustand store factory for UI preferences.
 *
 * Returns a fresh store per call. Apps instantiate one per AppShell, passing
 * the load/persist callbacks from their pdomain-ops backend integration.
 *
 * The store calls `config.load()` once on construction to hydrate from the
 * backend; `config.persistCommon` fires on any non-app pref change;
 * `config.persistApp` fires on app-specific prefs changes.
 *
 * Hooks:
 *   useTheme()          → 'dark' | 'light'
 *   useDensity()        → 'compact' | 'normal' | 'comfortable'
 *   useFontScale()      → number (0.8–1.4)
 *   useLayerColor(layer) → string (CSS var fallback when not overridden)
 *   useStatusColor(status) → string
 *   useAccentColor()    → { fg: string; bg: string }
 *   useUIPrefs()        → UIPrefs
 */
import { createStore } from 'zustand/vanilla';
import type { UIPrefs, UIPrefsConfig } from '../shell/types.js';

// ─── Default CSS token fallbacks ──────────────────────────────────────────────

const LAYER_TOKEN_DEFAULTS: Record<'block' | 'para' | 'line' | 'word', string> = {
  block: 'var(--block)',
  para: 'var(--para)',
  line: 'var(--line)',
  word: 'var(--word)',
};

const STATUS_TOKEN_DEFAULTS: Record<'exact' | 'fuzzy' | 'mismatch' | 'ocr' | 'gt', string> = {
  exact: 'var(--exact)',
  fuzzy: 'var(--fuzzy)',
  mismatch: 'var(--mismatch)',
  ocr: 'var(--ocr)',
  gt: 'var(--gt)',
};

// ─── Helper: extract the Omit<UIPrefs,'app'> slice for persistCommon ─────────

function commonPrefs(prefs: UIPrefs): Omit<UIPrefs, 'app'> {
  // Build a new object without the `app` key.
  const out: Omit<UIPrefs, 'app'> = {
    theme: prefs.theme,
    density: prefs.density,
    fontScale: prefs.fontScale,
  };
  if (prefs.layerColors !== undefined) out.layerColors = prefs.layerColors;
  if (prefs.statusColors !== undefined) out.statusColors = prefs.statusColors;
  if (prefs.accentColor !== undefined) out.accentColor = prefs.accentColor;
  if (prefs.accentInkColor !== undefined) out.accentInkColor = prefs.accentInkColor;
  return out;
}

// ─── Store state ──────────────────────────────────────────────────────────────

export interface UIPrefsStoreState {
  /** Current preferences (reflects last successful load). */
  prefs: UIPrefs;
  /** True while the initial load() call is in-flight. */
  loading: boolean;
  /**
   * The last persist error, or null when no unacknowledged error exists.
   * Set whenever persistCommon or persistApp rejects; cleared on the next
   * successful persist or by calling clearPersistError() explicitly.
   *
   * Added in issue #38 to surface failures that were previously swallowed.
   */
  persistError: unknown;

  /** Update theme and persist common prefs. */
  setTheme: (theme: UIPrefs['theme']) => void;
  /** Update density and persist common prefs. */
  setDensity: (density: UIPrefs['density']) => void;
  /** Update font scale (clamped to [0.8, 1.4]) and persist common prefs. */
  setFontScale: (scale: number) => void;
  /** Update an app-specific pref and persist. */
  setAppPref: (key: string, value: unknown) => void;

  // ── Color setters (issue #18) ──────────────────────────────────────────────
  /** Set a layer color override and persist. Pass undefined to clear. */
  setLayerColor: (layer: 'block' | 'para' | 'line' | 'word', color: string | undefined) => void;
  /** Set a status color override and persist. Pass undefined to clear. */
  setStatusColor: (
    status: 'exact' | 'fuzzy' | 'mismatch' | 'ocr' | 'gt',
    color: string | undefined,
  ) => void;
  /** Set the accent color override and persist. */
  setAccentColor: (color: string | undefined) => void;
  /** Set the accent ink (foreground on accent) color override and persist. */
  setAccentInkColor: (color: string | undefined) => void;

  // ── Derived helpers (stable references; computed inline for simplicity) ────
  /** Returns the CSS color for the given layer (override or token fallback). */
  getLayerColor: (layer: 'block' | 'para' | 'line' | 'word') => string;
  /** Returns the CSS color for the given status (override or token fallback). */
  getStatusColor: (status: 'exact' | 'fuzzy' | 'mismatch' | 'ocr' | 'gt') => string;
  /** Returns the accent fg/bg colors (override or token fallback). */
  getAccentColor: () => { fg: string; bg: string };

  /** Clear the last persist error (e.g., after displaying it to the user). */
  clearPersistError: () => void;
}

export function createUIPrefsStore(config: UIPrefsConfig) {
  // Track which top-level pref keys the user has explicitly set while a load
  // is in-flight. Keys here will not be overwritten when the async load resolves.
  // This prevents a late-arriving server response from clobbering local edits.
  //
  // We use a module-scoped (per-store-instance) Set that is closed over by the
  // store initialiser. The load() .then() callback checks this set before
  // merging; setters always add their key to the set immediately.
  const _editedKeys = new Set<string>();

  const store = createStore<UIPrefsStoreState>()((set, get) => {
    // Bootstrap: load prefs async after creation.
    config
      .load()
      .then((serverPrefs) => {
        // Merge: apply server values only for keys the user has NOT edited.
        // If _editedKeys is empty (no edits during load) this is equivalent to
        // a wholesale replace. If any keys were edited, preserve those.
        if (_editedKeys.size === 0) {
          // Fast path: no local edits — apply server prefs wholesale.
          set({ prefs: serverPrefs, loading: false });
        } else {
          // Selective merge: user edits win; server fills everything else.
          // Under exactOptionalPropertyTypes, we cannot assign `T | undefined`
          // to an optional field directly. Each optional field is handled
          // with explicit presence checks so TypeScript can narrow correctly.
          const current = get().prefs;

          const theme = _editedKeys.has('theme') ? current.theme : serverPrefs.theme;
          const density = _editedKeys.has('density') ? current.density : serverPrefs.density;
          const fontScale = _editedKeys.has('fontScale')
            ? current.fontScale
            : serverPrefs.fontScale;

          const lcSrc = _editedKeys.has('layerColors') ? current : serverPrefs;
          const scSrc = _editedKeys.has('statusColors') ? current : serverPrefs;
          const acSrc = _editedKeys.has('accentColor') ? current : serverPrefs;
          const aiSrc = _editedKeys.has('accentInkColor') ? current : serverPrefs;
          const appSrc = _editedKeys.has('app') ? current : serverPrefs;

          const merged: UIPrefs = { theme, density, fontScale };
          if (lcSrc.layerColors !== undefined) merged.layerColors = lcSrc.layerColors;
          if (scSrc.statusColors !== undefined) merged.statusColors = scSrc.statusColors;
          if (acSrc.accentColor !== undefined) merged.accentColor = acSrc.accentColor;
          if (aiSrc.accentInkColor !== undefined) merged.accentInkColor = aiSrc.accentInkColor;
          if (appSrc.app !== undefined) merged.app = appSrc.app;

          set({ prefs: merged, loading: false });
        }
      })
      .catch(() => {
        // Load failure is non-fatal: keep defaults (or any edits already applied).
        set({ loading: false });
      });

    /**
     * Shared persist-error handler for all setter operations.
     * Catches both sync throws and async rejections, then:
     *   1. Stores the error in `persistError` state.
     *   2. Calls config.onPersistError if provided.
     * Clears `persistError` to null on success.
     */
    function handlePersist(promise: Promise<void>): void {
      promise
        .then(() => {
          // Clear any previous error on success.
          if (get().persistError !== null) {
            set({ persistError: null });
          }
        })
        .catch((err: unknown) => {
          set({ persistError: err });
          config.onPersistError?.(err);
        });
    }

    return {
      prefs: { theme: 'dark', density: 'normal', fontScale: 1.0 },
      loading: true,
      persistError: null,

      setTheme: (theme) => {
        _editedKeys.add('theme');
        const prefs = { ...get().prefs, theme };
        set({ prefs });
        handlePersist(config.persistCommon(commonPrefs(prefs)));
      },

      setDensity: (density) => {
        _editedKeys.add('density');
        const prefs = { ...get().prefs, density };
        set({ prefs });
        handlePersist(config.persistCommon(commonPrefs(prefs)));
      },

      setFontScale: (scale) => {
        _editedKeys.add('fontScale');
        const fontScale = Math.min(1.4, Math.max(0.8, scale));
        const prefs = { ...get().prefs, fontScale };
        set({ prefs });
        handlePersist(config.persistCommon(commonPrefs(prefs)));
      },

      setAppPref: (key, value) => {
        _editedKeys.add('app');
        const prev = get().prefs.app ?? {};
        const app = { ...prev, [key]: value };
        const prefs = { ...get().prefs, app };
        set({ prefs });
        handlePersist(config.persistApp(app));
      },

      setLayerColor: (layer, color) => {
        _editedKeys.add('layerColors');
        const prev = get().prefs.layerColors ?? {};
        const layerColors: UIPrefs['layerColors'] = { ...prev };
        if (color !== undefined) {
          layerColors[layer] = color;
        } else {
          delete layerColors[layer];
        }
        const prefs = { ...get().prefs, layerColors };
        set({ prefs });
        handlePersist(config.persistCommon(commonPrefs(prefs)));
      },

      setStatusColor: (status, color) => {
        _editedKeys.add('statusColors');
        const prev = get().prefs.statusColors ?? {};
        const statusColors: UIPrefs['statusColors'] = { ...prev };
        if (color !== undefined) {
          statusColors[status] = color;
        } else {
          delete statusColors[status];
        }
        const prefs = { ...get().prefs, statusColors };
        set({ prefs });
        handlePersist(config.persistCommon(commonPrefs(prefs)));
      },

      setAccentColor: (color) => {
        _editedKeys.add('accentColor');
        const prefs: UIPrefs = { ...get().prefs };
        if (color !== undefined) {
          prefs.accentColor = color;
        } else {
          delete prefs.accentColor;
        }
        set({ prefs });
        handlePersist(config.persistCommon(commonPrefs(prefs)));
      },

      setAccentInkColor: (color) => {
        _editedKeys.add('accentInkColor');
        const prefs: UIPrefs = { ...get().prefs };
        if (color !== undefined) {
          prefs.accentInkColor = color;
        } else {
          delete prefs.accentInkColor;
        }
        set({ prefs });
        handlePersist(config.persistCommon(commonPrefs(prefs)));
      },

      getLayerColor: (layer) => {
        const override = get().prefs.layerColors?.[layer];
        return override ?? LAYER_TOKEN_DEFAULTS[layer];
      },

      getStatusColor: (status) => {
        const override = get().prefs.statusColors?.[status];
        return override ?? STATUS_TOKEN_DEFAULTS[status];
      },

      getAccentColor: () => {
        const prefs = get().prefs;
        // fg = ink/text color to draw ON the accent background → accentInkColor
        // bg = accent background color                        → accentColor
        return {
          fg: prefs.accentInkColor ?? 'var(--accent-ink)',
          bg: prefs.accentColor ?? 'var(--accent)',
        };
      },

      clearPersistError: () => {
        set({ persistError: null });
      },
    };
  });

  return store;
}

export type UIPrefsStore = ReturnType<typeof createUIPrefsStore>;
