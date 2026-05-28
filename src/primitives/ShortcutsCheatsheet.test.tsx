/**
 * Tests for ShortcutsCheatsheet component.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShortcutsCheatsheet } from './ShortcutsCheatsheet.js';
import type { ShortcutBinding } from '../hooks/useShortcuts.js';

const BINDINGS: ShortcutBinding[] = [
  { keys: 'j', label: 'Next page', group: 'Navigation', handler: vi.fn() },
  { keys: 'k', label: 'Previous page', group: 'Navigation', handler: vi.fn() },
  { keys: 'mod+s', label: 'Save edits', handler: vi.fn() }, // ungrouped → "General"
  { keys: '?', label: 'Show shortcuts', group: 'Help', handler: vi.fn() },
];

describe('ShortcutsCheatsheet', () => {
  it('renders nothing visible when open=false', () => {
    render(<ShortcutsCheatsheet open={false} onClose={vi.fn()} bindings={BINDINGS} />);
    // The dialog should not be visible.
    expect(screen.queryByTestId('shortcuts-cheatsheet')).toBeNull();
  });

  it('renders the dialog with title when open=true', () => {
    render(<ShortcutsCheatsheet open={true} onClose={vi.fn()} bindings={BINDINGS} />);
    expect(screen.getByText('Keyboard shortcuts')).toBeInTheDocument();
  });

  it('renders the testid on the dialog content', () => {
    render(<ShortcutsCheatsheet open={true} onClose={vi.fn()} bindings={BINDINGS} />);
    expect(screen.getByTestId('shortcuts-cheatsheet')).toBeInTheDocument();
  });

  it('renders all binding labels', () => {
    render(<ShortcutsCheatsheet open={true} onClose={vi.fn()} bindings={BINDINGS} />);
    expect(screen.getByText('Next page')).toBeInTheDocument();
    expect(screen.getByText('Previous page')).toBeInTheDocument();
    expect(screen.getByText('Save edits')).toBeInTheDocument();
    expect(screen.getByText('Show shortcuts')).toBeInTheDocument();
  });

  it('renders group headers', () => {
    render(<ShortcutsCheatsheet open={true} onClose={vi.fn()} bindings={BINDINGS} />);
    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Help')).toBeInTheDocument();
    // Ungrouped binding falls under "General"
    expect(screen.getByText('General')).toBeInTheDocument();
  });

  it('renders key tokens for each binding', () => {
    render(<ShortcutsCheatsheet open={true} onClose={vi.fn()} bindings={BINDINGS} />);
    // 'j' → 'J'; key caps rendered as .key spans
    const keyCaps = document.querySelectorAll('.key');
    const texts = Array.from(keyCaps).map((el) => el.textContent);
    expect(texts).toContain('J');
    expect(texts).toContain('K');
    expect(texts).toContain('?');
  });

  it('calls onClose when dialog is closed by user', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<ShortcutsCheatsheet open={true} onClose={onClose} bindings={BINDINGS} />);
    // Press Escape to close Radix Dialog.
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
});
