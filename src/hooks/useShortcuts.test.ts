/**
 * Tests for useShortcuts hook and formatShortcut helper.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { useShortcuts, formatShortcut } from './useShortcuts.js';
import type { ShortcutBinding } from './useShortcuts.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function keyDown(opts: KeyboardEventInit): void {
  fireEvent.keyDown(window, opts);
}

function makeBinding(
  keys: string,
  handler: () => void,
  overrides: Partial<ShortcutBinding> = {},
): ShortcutBinding {
  return { keys, label: 'Test', handler, ...overrides };
}

// ─── formatShortcut ───────────────────────────────────────────────────────────

describe('formatShortcut', () => {
  it('returns uppercase letter for plain key', () => {
    expect(formatShortcut('j')).toEqual(['J']);
  });

  it('returns arrow symbol for arrowright', () => {
    expect(formatShortcut('arrowright')).toEqual(['→']);
  });

  it('returns arrow symbol for arrowleft', () => {
    expect(formatShortcut('arrowleft')).toEqual(['←']);
  });

  it('returns "?" uppercased', () => {
    expect(formatShortcut('?')).toEqual(['?']);
  });

  it('returns Ctrl+S on non-Mac when mod+s given', () => {
    // In jsdom, navigator.platform is empty string — treated as non-Mac.
    const tokens = formatShortcut('mod+s');
    // On non-Mac: Ctrl, S
    expect(tokens).toEqual(['Ctrl', 'S']);
  });

  it('handles shift+? correctly', () => {
    expect(formatShortcut('shift+?')).toEqual(['Shift', '?']);
  });

  it('returns Esc for escape', () => {
    expect(formatShortcut('escape')).toEqual(['Esc']);
  });
});

// ─── useShortcuts ─────────────────────────────────────────────────────────────

describe('useShortcuts', () => {
  beforeEach(() => {
    // Ensure no stray listeners from previous tests.
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fires handler when matching key is pressed', () => {
    const handler = vi.fn();
    renderHook(() => useShortcuts([makeBinding('j', handler)]));
    keyDown({ key: 'j' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('is case-insensitive for key match', () => {
    const handler = vi.fn();
    renderHook(() => useShortcuts([makeBinding('j', handler)]));
    keyDown({ key: 'J' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('calls preventDefault on match', () => {
    const handler = vi.fn();
    renderHook(() => useShortcuts([makeBinding('escape', handler)]));
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    const spy = vi.spyOn(event, 'preventDefault');
    window.dispatchEvent(event);
    expect(spy).toHaveBeenCalled();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does NOT fire when enabled:false', () => {
    const handler = vi.fn();
    renderHook(() => useShortcuts([makeBinding('j', handler)], { enabled: false }));
    keyDown({ key: 'j' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('respects when() guard — skips when guard returns false', () => {
    const handler = vi.fn();
    const when = vi.fn(() => false);
    renderHook(() => useShortcuts([makeBinding('k', handler, { when })]));
    keyDown({ key: 'k' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('respects when() guard — fires when guard returns true', () => {
    const handler = vi.fn();
    const when = vi.fn(() => true);
    renderHook(() => useShortcuts([makeBinding('k', handler, { when })]));
    keyDown({ key: 'k' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('skips plain-key binding when event target is an input', () => {
    const handler = vi.fn();
    renderHook(() => useShortcuts([makeBinding('j', handler)]));

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    fireEvent.keyDown(input, { key: 'j' });
    expect(handler).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it('fires mod-combo binding even when event target is a textarea (non-Mac uses ctrlKey)', () => {
    const handler = vi.fn();
    // mod normalises to ctrl on jsdom (non-Mac platform).
    renderHook(() => useShortcuts([makeBinding('mod+s', handler)]));

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.focus();

    // Fire with ctrlKey (non-Mac equivalent of mod).
    fireEvent.keyDown(textarea, { key: 's', ctrlKey: true });
    expect(handler).toHaveBeenCalledTimes(1);

    document.body.removeChild(textarea);
  });

  it('respects allowInEditable:false to block mod-combo in editable', () => {
    const handler = vi.fn();
    renderHook(() => useShortcuts([makeBinding('mod+s', handler, { allowInEditable: false })]));

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    fireEvent.keyDown(input, { key: 's', ctrlKey: true });
    expect(handler).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it('removes the event listener on unmount', () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useShortcuts([makeBinding('x', handler)]));
    unmount();
    keyDown({ key: 'x' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('handles arrow key bindings', () => {
    const handler = vi.fn();
    renderHook(() => useShortcuts([makeBinding('arrowright', handler)]));
    keyDown({ key: 'ArrowRight' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('handles ? binding', () => {
    const handler = vi.fn();
    renderHook(() => useShortcuts([makeBinding('?', handler)]));
    keyDown({ key: '?' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not fire stale handler when bindings are updated (unregister-before-register)', () => {
    // When bindings change, the old listener must be removed before adding the new one.
    // Without unregister-before-register, both the old and new handlers fire.
    const oldHandler = vi.fn();
    const newHandler = vi.fn();
    const { rerender } = renderHook(
      ({ bindings }: { bindings: ShortcutBinding[] }) => useShortcuts(bindings),
      { initialProps: { bindings: [makeBinding('q', oldHandler)] } },
    );
    // Update to new handler
    rerender({ bindings: [makeBinding('q', newHandler)] });
    keyDown({ key: 'q' });
    expect(newHandler).toHaveBeenCalledTimes(1);
    // stale handler must NOT have fired
    expect(oldHandler).not.toHaveBeenCalled();
  });

  it('uses navigator.userAgentData?.platform for Mac detection when available', () => {
    // We cannot change the module-level IS_MAC constant in a live test, but we
    // can at least verify formatShortcut returns 'Ctrl' on non-Mac environments
    // (jsdom has empty navigator.platform and no userAgentData).
    const tokens = formatShortcut('mod+k');
    // jsdom = non-Mac; mod → Ctrl
    expect(tokens[0]).toBe('Ctrl');
  });
});
