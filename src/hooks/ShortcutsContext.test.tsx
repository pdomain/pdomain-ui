/**
 * Tests for ShortcutsContext, ShortcutsProvider, and the context-aware
 * useShortcuts hook.
 */
import * as React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, renderHook, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { ShortcutsProvider, useShortcuts, useShortcutsContext } from './ShortcutsContext.js';
import type { ShortcutBinding } from './useShortcuts.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeBinding(
  keys: string,
  handler: () => void,
  overrides: Partial<ShortcutBinding> = {},
): ShortcutBinding {
  return { keys, label: 'Test binding', handler, ...overrides };
}

function keyDown(opts: KeyboardEventInit): void {
  fireEvent.keyDown(window, opts);
}

/** Renders a component that calls useShortcuts with the given bindings. */
function UseShortcutsChild({
  bindings,
  opts,
}: {
  bindings: ShortcutBinding[];
  opts?: Parameters<typeof useShortcuts>[1];
}) {
  useShortcuts(bindings, opts);
  return <div data-testid="child" />;
}

/** Reads allBindings from context and renders their labels. */
function BindingsList() {
  const { allBindings } = useShortcutsContext();
  return (
    <ul>
      {allBindings.map((b) => (
        <li key={b.keys} data-testid={`binding-${b.keys}`}>
          {b.label}
        </li>
      ))}
    </ul>
  );
}

// ─── Registration ─────────────────────────────────────────────────────────────

describe('ShortcutsProvider — registration', () => {
  it('allBindings contains bindings from mounted components', () => {
    const handlerA = vi.fn();
    const handlerB = vi.fn();

    render(
      <ShortcutsProvider>
        <UseShortcutsChild bindings={[makeBinding('a', handlerA, { label: 'Action A' })]} />
        <UseShortcutsChild bindings={[makeBinding('b', handlerB, { label: 'Action B' })]} />
        <BindingsList />
      </ShortcutsProvider>,
    );

    expect(screen.getByTestId('binding-a')).toBeInTheDocument();
    expect(screen.getByTestId('binding-b')).toBeInTheDocument();
  });

  it('unmounting a component removes its bindings from allBindings', () => {
    const handlerA = vi.fn();
    const handlerB = vi.fn();

    function App({ showB }: { showB: boolean }) {
      return (
        <ShortcutsProvider>
          <UseShortcutsChild bindings={[makeBinding('a', handlerA, { label: 'Action A' })]} />
          {showB && (
            <UseShortcutsChild bindings={[makeBinding('b', handlerB, { label: 'Action B' })]} />
          )}
          <BindingsList />
        </ShortcutsProvider>
      );
    }

    const { rerender } = render(<App showB={true} />);
    expect(screen.getByTestId('binding-b')).toBeInTheDocument();

    rerender(<App showB={false} />);
    expect(screen.queryByTestId('binding-b')).not.toBeInTheDocument();
    // Component A is still registered.
    expect(screen.getByTestId('binding-a')).toBeInTheDocument();
  });
});

// ─── openCheatsheet / closeCheatsheet ─────────────────────────────────────────

describe('ShortcutsProvider — cheatsheet open/close', () => {
  it('openCheatsheet causes cheatsheet dialog to appear', async () => {
    function Trigger() {
      const { openCheatsheet } = useShortcutsContext();
      return <button onClick={openCheatsheet}>Open</button>;
    }

    render(
      <ShortcutsProvider>
        <Trigger />
      </ShortcutsProvider>,
    );

    expect(screen.queryByTestId('shortcuts-cheatsheet')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Open'));
    await waitFor(() => {
      expect(screen.getByTestId('shortcuts-cheatsheet')).toBeInTheDocument();
    });
  });

  it('closeCheatsheet hides the dialog', async () => {
    function Trigger() {
      const { openCheatsheet, closeCheatsheet } = useShortcutsContext();
      return (
        <>
          <button data-testid="open" onClick={openCheatsheet}>
            Open
          </button>
          <button data-testid="close" onClick={closeCheatsheet}>
            Close
          </button>
        </>
      );
    }

    render(
      <ShortcutsProvider>
        <Trigger />
      </ShortcutsProvider>,
    );

    fireEvent.click(screen.getByTestId('open'));
    await waitFor(() => {
      expect(screen.getByTestId('shortcuts-cheatsheet')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('close'));
    await waitFor(() => {
      expect(screen.queryByTestId('shortcuts-cheatsheet')).not.toBeInTheDocument();
    });
  });
});

// ─── ? key handler ────────────────────────────────────────────────────────────

describe('ShortcutsProvider — ? key', () => {
  it('pressing ? opens the cheatsheet', async () => {
    render(
      <ShortcutsProvider>
        <div />
      </ShortcutsProvider>,
    );
    expect(screen.queryByTestId('shortcuts-cheatsheet')).not.toBeInTheDocument();

    act(() => {
      keyDown({ key: '?' });
    });

    await waitFor(() => {
      expect(screen.getByTestId('shortcuts-cheatsheet')).toBeInTheDocument();
    });
  });

  it('? does NOT open when target is an input', () => {
    render(
      <ShortcutsProvider>
        <input data-testid="inp" />
      </ShortcutsProvider>,
    );

    const input = screen.getByTestId('inp');
    input.focus();

    act(() => {
      fireEvent.keyDown(input, { key: '?' });
    });

    // Dialog should still be absent.
    expect(screen.queryByTestId('shortcuts-cheatsheet')).not.toBeInTheDocument();
  });
});

// ─── Provider-absent safety ───────────────────────────────────────────────────

describe('useShortcuts — provider absent', () => {
  it('does not throw when no ShortcutsProvider is mounted', () => {
    const handler = vi.fn();
    expect(() => {
      renderHook(() => useShortcuts([makeBinding('x', handler)]));
    }).not.toThrow();
  });

  it('still fires keydown handler even without a provider', () => {
    const handler = vi.fn();
    renderHook(() => useShortcuts([makeBinding('y', handler)]));
    keyDown({ key: 'y' });
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

// ─── opts.register = false ────────────────────────────────────────────────────

describe('useShortcuts — opts.register = false', () => {
  it('opts.register:false keeps keydown working but omits binding from allBindings', () => {
    const handler = vi.fn();

    render(
      <ShortcutsProvider>
        <UseShortcutsChild
          bindings={[makeBinding('z', handler, { label: 'Secret action' })]}
          opts={{ register: false }}
        />
        <BindingsList />
      </ShortcutsProvider>,
    );

    // The binding should NOT appear in allBindings (hidden from cheatsheet).
    expect(screen.queryByTestId('binding-z')).not.toBeInTheDocument();

    // But the keydown handler should still fire.
    act(() => {
      keyDown({ key: 'z' });
    });
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

// ─── Existing useShortcuts tests still pass (backward compat) ─────────────────

describe('useShortcuts — backward compat (core behaviour via context version)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fires handler when matching key is pressed (no provider)', () => {
    const handler = vi.fn();
    renderHook(() => useShortcuts([makeBinding('j', handler)]));
    keyDown({ key: 'j' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does NOT fire when enabled:false', () => {
    const handler = vi.fn();
    renderHook(() => useShortcuts([makeBinding('j', handler)], { enabled: false }));
    keyDown({ key: 'j' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('removes the event listener on unmount', () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useShortcuts([makeBinding('x', handler)]));
    unmount();
    keyDown({ key: 'x' });
    expect(handler).not.toHaveBeenCalled();
  });
});
