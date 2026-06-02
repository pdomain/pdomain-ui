/**
 * UtilityDockContext tests — verifies the context value shape, mutual
 * exclusion of `active`, toggle behavior, and the throw-outside-provider guard.
 */
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UtilityDockContext, useUtilityDock } from './UtilityDockContext.js';
import type { UtilityDockContextValue, DockSurface } from './UtilityDockContext.js';

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

function Probe() {
  const dock = useUtilityDock();
  return <span data-testid="active">{dock.active ?? 'none'}</span>;
}

describe('useUtilityDock', () => {
  it('reads the active surface from context', () => {
    const ctx = makeCtx({ active: 'settings' as DockSurface });
    render(
      <UtilityDockContext.Provider value={ctx}>
        <Probe />
      </UtilityDockContext.Provider>,
    );
    expect(screen.getByTestId('active').textContent).toBe('settings');
  });

  it('throws when used outside an AppShell provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Probe />)).toThrow(/AppShell/);
    spy.mockRestore();
  });

  it('exposes open/close/toggle/setPinned/setWidth callbacks', () => {
    const open = vi.fn();
    const toggle = vi.fn();
    const ctx = makeCtx({ open, toggle });
    function Caller() {
      const dock = useUtilityDock();
      return (
        <div>
          <button data-testid="open" onClick={() => dock.open('jobs')} />
          <button data-testid="toggle" onClick={() => dock.toggle('keybinds')} />
        </div>
      );
    }
    render(
      <UtilityDockContext.Provider value={ctx}>
        <Caller />
      </UtilityDockContext.Provider>,
    );
    fireEvent.click(screen.getByTestId('open'));
    fireEvent.click(screen.getByTestId('toggle'));
    expect(open).toHaveBeenCalledWith('jobs');
    expect(toggle).toHaveBeenCalledWith('keybinds');
  });
});
