/**
 * SettingsSlot — gear button that toggles the shared utility-dock settings surface.
 *
 * After M5: calls useUtilityDock().toggle('settings') to open/close the dock.
 * Reflects open state via aria-expanded.
 * The testid `settings-slot-trigger` is preserved as a Playwright contract.
 *
 * Icon imported from src/icons to respect the no-direct-lucide rule.
 */
import * as React from 'react';
import { Settings } from '../icons/lucide.js';
import { useUtilityDock } from './UtilityDockContext.js';

export function SettingsSlot() {
  const { active, toggle } = useUtilityDock();

  return (
    <button
      type="button"
      aria-label="Settings and preferences"
      aria-expanded={active === 'settings'}
      data-testid="settings-slot-trigger"
      onClick={() => toggle('settings')}
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
      <Settings size={15} aria-hidden />
    </button>
  );
}

SettingsSlot.displayName = 'SettingsSlot';
