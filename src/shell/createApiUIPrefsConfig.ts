/**
 * createApiUIPrefsConfig — builds a UIPrefsConfig backed by the pdomain-*
 * standard `/api/ui-prefs` REST contract.
 *
 * Contract
 * ────────
 * GET  {url}
 *   → 200 application/json   body: UIPrefs
 *   → 404 (first launch)     treated as "no saved prefs" — returns defaults
 *   → any error              returns defaults (resilient)
 *
 * PATCH {url}
 *   body: application/json   partial UIPrefs object
 *   → 200                    success (response body ignored)
 *   → error                  silently swallowed (prefs are best-effort)
 *
 * Usage
 * ─────
 * ```ts
 * import { createApiUIPrefsConfig } from '@pdomain/pdomain-ui/shell';
 *
 * <AppShell
 *   uiPrefsConfig={createApiUIPrefsConfig('/api/ui-prefs')}
 *   ...
 * />
 * ```
 *
 * This replaces the localStorage shim that pdomain-ocr-labeler-spa used in
 * App.tsx (GAP-1 / GAP-2 from issue #5).
 */

import type { UIPrefs, UIPrefsConfig } from './types.js';

/** Default prefs returned when the backend has no saved state. */
const DEFAULT_PREFS: UIPrefs = {
  theme: 'dark',
  density: 'normal',
  fontScale: 1.0,
};

/**
 * Create a UIPrefsConfig that loads from and persists to a pdomain-*-standard
 * `/api/ui-prefs` REST endpoint.
 *
 * @param url - Absolute or relative URL for the prefs endpoint.
 *              Defaults to `'/api/ui-prefs'`.
 */
export function createApiUIPrefsConfig(
  url = '/api/ui-prefs',
  opts: { onPersistError?: (error: unknown) => void } = {},
): UIPrefsConfig {
  const { onPersistError } = opts;
  return {
    async load(): Promise<UIPrefs> {
      try {
        const res = await fetch(url);
        if (!res.ok) return { ...DEFAULT_PREFS };
        const data = (await res.json()) as UIPrefs;
        return data;
      } catch {
        return { ...DEFAULT_PREFS };
      }
    },

    ...(onPersistError !== undefined ? { onPersistError } : {}),

    async persistCommon(prefs: Omit<UIPrefs, 'app'>): Promise<void> {
      try {
        const res = await fetch(url, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(prefs),
        });
        if (!res.ok) throw new Error(`persist failed: ${res.status}`);
      } catch (err: unknown) {
        if (onPersistError) onPersistError(err);
      }
    },

    async persistApp(appPrefs: Record<string, unknown>): Promise<void> {
      try {
        const res = await fetch(url, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ app: appPrefs }),
        });
        if (!res.ok) throw new Error(`persist failed: ${res.status}`);
      } catch (err: unknown) {
        if (onPersistError) onPersistError(err);
      }
    },
  };
}
