/**
 * UtilityDockContext — the shell-owned right-side utility dock.
 *
 * One surface is visible at a time (`active`). Settings + Keybinds + Jobs all
 * share the single right edge, so `active` gives mutual exclusion for free.
 * `pinned` + `width` are backed by UIPrefs (persisted); `active` is ephemeral.
 *
 * Provided by <AppShell>. `useUtilityDock()` throws if used outside one.
 */
import * as React from 'react';

/** The three suite-chrome surfaces that share the right-edge dock. */
export type DockSurface = 'settings' | 'keybinds' | 'jobs';

export interface UtilityDockContextValue {
  /** The currently-open surface, or null when the dock is closed. */
  active: DockSurface | null;
  /** Whether the dock is pinned (docked column) vs. overlay (slide-over). */
  pinned: boolean;
  /** Current dock width in px (used when pinned and for the slide-over width). */
  width: number;
  /** Open a surface (replaces any currently-open surface). */
  open: (surface: DockSurface) => void;
  /** Close the dock entirely. */
  close: () => void;
  /** Open the surface if closed/other; close it if it is already active. */
  toggle: (surface: DockSurface) => void;
  /** Set pinned state (persisted via UIPrefs). */
  setPinned: (pinned: boolean) => void;
  /** Set width in px (persisted + clamped via UIPrefs). */
  setWidth: (px: number) => void;
}

export const UtilityDockContext = React.createContext<UtilityDockContextValue | null>(null);

/**
 * Returns the utility-dock context value. Must be called from a component
 * rendered inside an `<AppShell>` — throws if the context is missing.
 */
export function useUtilityDock(): UtilityDockContextValue {
  const ctx = React.useContext(UtilityDockContext);
  if (ctx === null) {
    throw new Error('useUtilityDock() must be used inside an <AppShell>');
  }
  return ctx;
}
