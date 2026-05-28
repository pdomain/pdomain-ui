/**
 * SuiteSiblings context — provides sibling app data and launch callable
 * to all descendants inside a SuiteSiblingsProvider.
 *
 * The context value is populated by useSuiteSiblings's internal state,
 * which reads from the fetchInstalled callback supplied to SuiteSiblingsProvider.
 */
import * as React from 'react';
import type { InstalledApp, LaunchResult } from './types.js';

export interface SuiteSiblingsContextValue {
  siblings: InstalledApp[];
  launch: (id: string) => Promise<LaunchResult>;
  loading: boolean;
  /** Non-null when fetchInstalled() rejected; null while loading or on success. */
  error: unknown;
}

export const SuiteSiblingsContext = React.createContext<SuiteSiblingsContextValue | null>(null);

/**
 * Returns the SuiteSiblings context. Must be used inside a <SuiteSiblingsProvider>.
 * Returns null instead of throwing — LauncherSlot/LauncherTile handle the null case
 * gracefully (hide when no context is present).
 */
export function useSuiteSiblingsContext(): SuiteSiblingsContextValue | null {
  return React.useContext(SuiteSiblingsContext);
}
