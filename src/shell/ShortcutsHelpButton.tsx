/**
 * ShortcutsHelpButton — ghost icon button that opens the keybinds dock surface.
 *
 * After M5: calls useUtilityDock().toggle('keybinds') to open/close the dock
 * keybinds panel. Reflects open state via aria-expanded.
 * Lives beside SettingsSlot in the AppShell header.
 *
 * Sizing / visual treatment mirrors SettingsSlot (30×30px, border-radius 6,
 * var(--border-2) border, var(--bg-raised) background).
 *
 * Icon: `Keyboard` from src/icons/lucide (already exported).
 */
import * as React from 'react';
import { Keyboard } from '../icons/lucide.js';
import { useUtilityDock } from './UtilityDockContext.js';

export function ShortcutsHelpButton(): React.ReactElement {
  const { active, toggle } = useUtilityDock();

  return (
    <button
      type="button"
      aria-label="Keyboard shortcuts"
      aria-expanded={active === 'keybinds'}
      data-testid="shortcuts-help-button"
      onClick={() => toggle('keybinds')}
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
