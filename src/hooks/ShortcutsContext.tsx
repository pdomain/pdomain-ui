/**
 * ShortcutsContext — registry for screen-scoped keyboard shortcut bindings.
 *
 * Screens call `useShortcuts(bindings)` which auto-registers bindings into
 * the nearest ShortcutsProvider (if one is mounted). The provider holds the
 * union of all mounted screens' bindings and renders the shared
 * `<ShortcutsCheatsheet>` so consumers don't need to own that state.
 *
 * Provider also installs:
 *   - `?`        → open cheatsheet
 *   - `Escape`   → close cheatsheet (while open)
 *
 * No-provider safety: if no provider is mounted, registration is a no-op and
 * `useShortcutsContext()` returns a stable no-op value. `useShortcuts` still
 * does its normal window keydown handling in either case.
 *
 * This module also exports a context-aware `useShortcuts` that composes the
 * core hook with provider registration. `hooks/index.ts` re-exports this
 * version so consumers get context integration for free.
 */

import * as React from 'react';
import { ShortcutsCheatsheet } from '../primitives/ShortcutsCheatsheet.js';
import {
  useShortcuts as useShortcutsCore,
  type ShortcutBinding,
  type UseShortcutsOptions,
} from './useShortcuts.js';

// ─── Context value ────────────────────────────────────────────────────────────

export interface ShortcutsContextValue {
  /** Register a set of bindings under a stable id. Called on mount. */
  register: (id: string, bindings: ShortcutBinding[]) => void;
  /** Remove a previously-registered set. Called on unmount. */
  unregister: (id: string) => void;
  /** Open the global cheatsheet dialog. */
  openCheatsheet: () => void;
  /** Close the global cheatsheet dialog. */
  closeCheatsheet: () => void;
  /** Whether the cheatsheet is currently open. */
  isOpen: boolean;
  /** Union of all currently-mounted screens' bindings. */
  allBindings: ShortcutBinding[];
}

// ─── No-op default ────────────────────────────────────────────────────────────

const noop = () => undefined;

const DEFAULT_CTX: ShortcutsContextValue = {
  register: noop,
  unregister: noop,
  openCheatsheet: noop,
  closeCheatsheet: noop,
  isOpen: false,
  allBindings: [],
};

export const ShortcutsContext = React.createContext<ShortcutsContextValue>(DEFAULT_CTX);

// ─── Hook ─────────────────────────────────────────────────────────────────────

/** Read the shortcuts context. Returns the no-op default when no provider is mounted. */
export function useShortcutsContext(): ShortcutsContextValue {
  return React.useContext(ShortcutsContext);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export interface ShortcutsProviderProps {
  children: React.ReactNode;
}

// ─── Context-aware useShortcuts ───────────────────────────────────────────────

/**
 * Context-aware version of `useShortcuts`.
 *
 * Behaves identically to the core hook (attaches window keydown listener) and
 * additionally registers bindings into a mounted `ShortcutsProvider` so they
 * appear in the global cheatsheet for as long as this hook's component is
 * mounted.
 *
 * Pass `opts.register = false` to opt out of cheatsheet registration while
 * keeping the keydown handling.
 *
 * Safe to call without a provider — registration is a no-op.
 */
export function useShortcuts(bindings: ShortcutBinding[], opts?: UseShortcutsOptions): void {
  // Stable id for this hook instance.
  const id = React.useId();

  const { register, unregister } = useShortcutsContext();
  const shouldRegister = opts?.register !== false;

  // Register on mount; unregister on unmount.
  // bindings updates are handled by the second effect below.
  React.useEffect(() => {
    if (!shouldRegister) return undefined;
    register(id, bindings);
    return () => {
      unregister(id);
    };
    // Mount / unmount only — bindings updates handled separately.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, shouldRegister, register, unregister]);

  // Re-register whenever bindings changes so allBindings stays current.
  // Skipped on the very first render to avoid double-registering with mount.
  // Unregister before re-registering to avoid stale bindings in allBindings
  // during the interval between the old and new registration (audit WS5).
  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!shouldRegister) return;
    unregister(id);
    register(id, bindings);
    // Intentionally omit register/unregister/id/shouldRegister — stable refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindings]);

  // Core keydown handling (unchanged behavior).
  useShortcutsCore(bindings, opts);
}

export function ShortcutsProvider({ children }: ShortcutsProviderProps): React.ReactElement {
  // Map from registration id → bindings array.
  const [registry, setRegistry] = React.useState<Map<string, ShortcutBinding[]>>(() => new Map());
  const [isOpen, setIsOpen] = React.useState(false);

  const openCheatsheet = React.useCallback(() => setIsOpen(true), []);
  const closeCheatsheet = React.useCallback(() => setIsOpen(false), []);

  const register = React.useCallback((id: string, bindings: ShortcutBinding[]) => {
    setRegistry((prev) => {
      const next = new Map(prev);
      next.set(id, bindings);
      return next;
    });
  }, []);

  const unregister = React.useCallback((id: string) => {
    setRegistry((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  // Flatten all registered bindings in registration order.
  const allBindings = React.useMemo<ShortcutBinding[]>(() => {
    const out: ShortcutBinding[] = [];
    for (const bindings of registry.values()) {
      for (const b of bindings) {
        out.push(b);
      }
    }
    return out;
  }, [registry]);

  // Global `?` key → open cheatsheet (plain key, so editable-guard will skip it in inputs).
  // Global `Escape` → close while open.
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      // Editable guard: skip plain-key bindings in input/textarea/contenteditable.
      const target = e.target;
      const inEditable =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if (e.key === '?' && !inEditable && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setIsOpen(true);
        return;
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const value = React.useMemo<ShortcutsContextValue>(
    () => ({ register, unregister, openCheatsheet, closeCheatsheet, isOpen, allBindings }),
    [register, unregister, openCheatsheet, closeCheatsheet, isOpen, allBindings],
  );

  return (
    <ShortcutsContext.Provider value={value}>
      {children}
      <ShortcutsCheatsheet open={isOpen} onClose={closeCheatsheet} bindings={allBindings} />
    </ShortcutsContext.Provider>
  );
}
