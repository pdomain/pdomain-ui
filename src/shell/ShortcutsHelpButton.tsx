/**
 * ShortcutsHelpButton — ghost icon button that opens the global shortcuts cheatsheet.
 *
 * Lives beside SettingsSlot in the AppShell header. Calls
 * `openCheatsheet()` from the nearest ShortcutsProvider. Safe to render
 * without a provider — the button renders but clicks are no-ops.
 *
 * Sizing / visual treatment mirrors SettingsSlot (30×30px, border-radius 6,
 * var(--border-2) border, var(--bg-raised) background).
 *
 * Icon: `Keyboard` from src/icons/lucide (already exported).
 */
import * as React from 'react';
import { Keyboard } from '../icons/lucide.js';
import { useShortcutsContext } from '../hooks/ShortcutsContext.js';

export function ShortcutsHelpButton(): React.ReactElement {
  const { openCheatsheet } = useShortcutsContext();

  return (
    <button
      type="button"
      aria-label="Keyboard shortcuts"
      data-testid="shortcuts-help-button"
      onClick={openCheatsheet}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '30px',
        height: '30px',
        padding: 0,
        border: '1px solid var(--border-2)',
        borderRadius: '6px',
        background: 'var(--bg-raised)',
        color: 'var(--ink-2)',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background .12s, color .12s',
      }}
    >
      <Keyboard size={15} aria-hidden />
    </button>
  );
}

ShortcutsHelpButton.displayName = 'ShortcutsHelpButton';
