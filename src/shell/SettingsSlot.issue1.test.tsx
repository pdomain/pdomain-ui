/**
 * Tests for issue #1 (historical): SettingsSlot font-scale slider jumping.
 *
 * Issue #1 was about the Radix Popover dismissing during slider drag reflow.
 * After issue #19, the Popover was replaced by a Dialog-based SettingsModal.
 * After M5, the SettingsSlot now calls useUtilityDock().toggle('settings') to
 * open the shared utility dock — SettingsModal is no longer directly involved.
 *
 * These tests verify that the gear trigger calls toggle('settings') and that
 * there is no popover. The font-scale slider now lives in the SettingsPanel
 * inside the utility dock.
 */
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SettingsSlot } from './SettingsSlot.js';
import { UtilityDockContext } from './UtilityDockContext.js';
import type { UtilityDockContextValue } from './UtilityDockContext.js';

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

describe('SettingsSlot — popover superseded by utility dock (#1 → #19 → M5)', () => {
  it('gear trigger calls toggle("settings") — font-scale is now in the dock panel, not a Popover', () => {
    const toggle = vi.fn();
    render(
      <Wrapper ctx={makeCtx({ toggle })}>
        <SettingsSlot />
      </Wrapper>,
    );

    fireEvent.click(screen.getByTestId('settings-slot-trigger'));
    expect(toggle).toHaveBeenCalledWith('settings');
  });

  it('no popover element rendered by SettingsSlot (moved to utility dock)', () => {
    render(
      <Wrapper>
        <SettingsSlot />
      </Wrapper>,
    );

    expect(screen.queryByTestId('settings-slot-popover')).toBeNull();
  });

  it('gear trigger still calls toggle after multiple interactions', () => {
    const toggle = vi.fn();
    render(
      <Wrapper ctx={makeCtx({ toggle })}>
        <SettingsSlot />
      </Wrapper>,
    );

    fireEvent.click(screen.getByTestId('settings-slot-trigger'));
    fireEvent.click(screen.getByTestId('settings-slot-trigger'));
    fireEvent.click(screen.getByTestId('settings-slot-trigger'));

    expect(toggle).toHaveBeenCalledTimes(3);
  });
});
