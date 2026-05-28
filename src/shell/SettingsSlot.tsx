/**
 * SettingsSlot — gear button that opens the shared SettingsModal.
 *
 * The Radix Popover from M7 is replaced: the gear now calls
 * useSettingsModal().openModal() to open the full tabbed dialog.
 * The testid `settings-slot-trigger` is preserved as a Playwright contract.
 *
 * Icon imported from src/icons to respect the no-direct-lucide rule.
 */
import * as React from 'react';
import { Settings } from '../icons/lucide.js';
import { useSettingsModal } from './SettingsModalContext.js';

export function SettingsSlot() {
  const { openModal } = useSettingsModal();

  return (
    <button
      type="button"
      aria-label="Settings and preferences"
      data-testid="settings-slot-trigger"
      onClick={openModal}
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
