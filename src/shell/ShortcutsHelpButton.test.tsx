/**
 * Tests for ShortcutsHelpButton.
 *
 * After M5: ShortcutsHelpButton calls useUtilityDock().toggle('keybinds')
 * instead of useShortcutsContext().openCheatsheet(). Reflects open state
 * via aria-expanded.
 */
import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShortcutsHelpButton } from './ShortcutsHelpButton.js';
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

describe('ShortcutsHelpButton', () => {
  it('renders the trigger with correct testid', () => {
    render(
      <UtilityDockContext.Provider value={makeCtx()}>
        <ShortcutsHelpButton />
      </UtilityDockContext.Provider>,
    );
    expect(screen.getByTestId('shortcuts-help-button')).toBeTruthy();
  });

  it('renders with aria-label "Keyboard shortcuts"', () => {
    render(
      <UtilityDockContext.Provider value={makeCtx()}>
        <ShortcutsHelpButton />
      </UtilityDockContext.Provider>,
    );
    const btn = screen.getByTestId('shortcuts-help-button');
    expect(btn.getAttribute('aria-label')).toBe('Keyboard shortcuts');
  });

  it('clicking calls toggle("keybinds")', () => {
    const toggle = vi.fn();
    render(
      <UtilityDockContext.Provider value={makeCtx({ toggle })}>
        <ShortcutsHelpButton />
      </UtilityDockContext.Provider>,
    );
    fireEvent.click(screen.getByTestId('shortcuts-help-button'));
    expect(toggle).toHaveBeenCalledWith('keybinds');
  });

  it('reflects open state via aria-expanded when keybinds is active', () => {
    render(
      <UtilityDockContext.Provider value={makeCtx({ active: 'keybinds' })}>
        <ShortcutsHelpButton />
      </UtilityDockContext.Provider>,
    );
    expect(screen.getByTestId('shortcuts-help-button').getAttribute('aria-expanded')).toBe('true');
  });

  it('aria-expanded is false when a different surface is active', () => {
    render(
      <UtilityDockContext.Provider value={makeCtx({ active: 'settings' })}>
        <ShortcutsHelpButton />
      </UtilityDockContext.Provider>,
    );
    expect(screen.getByTestId('shortcuts-help-button').getAttribute('aria-expanded')).toBe('false');
  });
});
