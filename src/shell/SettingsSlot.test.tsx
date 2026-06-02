/**
 * SettingsSlot tests — verifies gear button toggles the utility dock settings surface.
 *
 * After M5: SettingsSlot no longer calls useSettingsModal().openModal(). It
 * calls useUtilityDock().toggle('settings') to open/close the shared dock.
 * Tests verify the button renders, wires to the dock context, and reflects
 * open state via aria-expanded.
 */
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SettingsSlot } from './SettingsSlot.js';
import { UtilityDockContext } from './UtilityDockContext.js';
import type { UtilityDockContextValue } from './UtilityDockContext.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeCtx(overrides?: Partial<UtilityDockContextValue>): UtilityDockContextValue {
  return {
    active: null,
    pinned: false,
    width: 420,
    open: vi.fn(),
    close: vi.fn(),
    toggle: vi.fn(),
    setPinned: vi.fn(),
    setWidth: vi.fn(),
    ...overrides,
  };
}

function Wrapper({
  children,
  ctx = makeCtx(),
}: {
  children: React.ReactNode;
  ctx?: UtilityDockContextValue;
}) {
  return <UtilityDockContext.Provider value={ctx}>{children}</UtilityDockContext.Provider>;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('SettingsSlot', () => {
  it('renders a button with data-testid="settings-slot-trigger"', () => {
    render(
      <Wrapper>
        <SettingsSlot />
      </Wrapper>,
    );
    expect(screen.getByTestId('settings-slot-trigger')).toBeTruthy();
  });

  it('button aria-label matches settings/preferences', () => {
    render(
      <Wrapper>
        <SettingsSlot />
      </Wrapper>,
    );
    const ariaLabel = screen.getByTestId('settings-slot-trigger').getAttribute('aria-label') ?? '';
    expect(ariaLabel.toLowerCase()).toMatch(/settings|preferences/);
  });

  it('clicking the gear calls toggle("settings")', () => {
    const toggle = vi.fn();
    render(
      <Wrapper ctx={makeCtx({ toggle })}>
        <SettingsSlot />
      </Wrapper>,
    );
    fireEvent.click(screen.getByTestId('settings-slot-trigger'));
    expect(toggle).toHaveBeenCalledWith('settings');
  });

  it('reflects open state via aria-expanded when settings is active', () => {
    render(
      <Wrapper ctx={makeCtx({ active: 'settings' })}>
        <SettingsSlot />
      </Wrapper>,
    );
    expect(screen.getByTestId('settings-slot-trigger').getAttribute('aria-expanded')).toBe('true');
  });

  it('aria-expanded is false when a different surface is active', () => {
    render(
      <Wrapper ctx={makeCtx({ active: 'keybinds' })}>
        <SettingsSlot />
      </Wrapper>,
    );
    expect(screen.getByTestId('settings-slot-trigger').getAttribute('aria-expanded')).toBe('false');
  });

  it('does NOT render a popover or inline controls', () => {
    render(
      <Wrapper>
        <SettingsSlot />
      </Wrapper>,
    );
    expect(screen.queryByTestId('settings-slot-popover')).toBeNull();
    expect(screen.queryByTestId('settings-theme-dark')).toBeNull();
  });
});
