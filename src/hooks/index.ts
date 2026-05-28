/**
 * @pdomain/pdomain-ui — hooks barrel
 *
 * Keyboard shortcut infrastructure and shared hooks.
 *
 * `useShortcuts` exported here is the context-aware version from
 * ShortcutsContext — it auto-registers bindings into a mounted
 * ShortcutsProvider in addition to its normal keydown handling.
 */

// ─── Core shortcut types + formatShortcut helper ──────────────────────────────
// NOTE: useShortcuts is intentionally NOT re-exported from useShortcuts.ts here.
// The context-aware version below replaces it for public consumers.
export { formatShortcut } from './useShortcuts.js';
export type { ShortcutBinding, UseShortcutsOptions } from './useShortcuts.js';

// ─── Context-aware useShortcuts + ShortcutsProvider ───────────────────────────
export {
  useShortcuts,
  ShortcutsContext,
  ShortcutsProvider,
  useShortcutsContext,
} from './ShortcutsContext.js';
export type { ShortcutsContextValue, ShortcutsProviderProps } from './ShortcutsContext.js';
