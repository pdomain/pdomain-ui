/**
 * LauncherSlot — reads useSuiteSiblings and renders one LauncherTile per installed
 * sibling. Hides itself (returns null) when zero siblings are available or while
 * loading with no siblings yet loaded.
 *
 * The `launcherSlot` prop on `<AppShell>` controls where this component appears:
 *   'header' — rendered inside the header zone
 *   'rail'   — appended at the bottom of the rail zone
 *   'off'    — not rendered at all (AppShell omits it)
 *
 * Placement is the responsibility of the AppShell — this component has no
 * opinion about position; it simply renders its tiles or nothing.
 */
import * as React from 'react';
import { useSuiteSiblingsContext } from './SuiteSiblingsContext.js';
import { LauncherTile } from './LauncherTile.js';

export function LauncherSlot() {
  const ctx = useSuiteSiblingsContext();

  if (!ctx || ctx.error !== null || ctx.siblings.length === 0) {
    return null;
  }

  return (
    <div data-testid="launcher-slot" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {ctx.siblings.map((sibling) => (
        <LauncherTile key={sibling.id} sibling={sibling} />
      ))}
    </div>
  );
}

LauncherSlot.displayName = 'LauncherSlot';
