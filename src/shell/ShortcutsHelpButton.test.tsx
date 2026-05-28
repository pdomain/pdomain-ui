/**
 * Tests for ShortcutsHelpButton.
 */
import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ShortcutsHelpButton } from './ShortcutsHelpButton.js';
import { ShortcutsProvider } from '../hooks/ShortcutsContext.js';

describe('ShortcutsHelpButton', () => {
  it('renders with correct aria-label and testid', () => {
    render(
      <ShortcutsProvider>
        <ShortcutsHelpButton />
      </ShortcutsProvider>,
    );

    const btn = screen.getByTestId('shortcuts-help-button');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('aria-label', 'Keyboard shortcuts');
  });

  it('clicking the button opens the cheatsheet', async () => {
    render(
      <ShortcutsProvider>
        <ShortcutsHelpButton />
      </ShortcutsProvider>,
    );

    expect(screen.queryByTestId('shortcuts-cheatsheet')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('shortcuts-help-button'));

    await waitFor(() => {
      expect(screen.getByTestId('shortcuts-cheatsheet')).toBeInTheDocument();
    });
  });

  it('renders without crashing when no ShortcutsProvider is mounted (no-op click)', () => {
    // Should not throw even without a provider.
    expect(() => {
      render(<ShortcutsHelpButton />);
    }).not.toThrow();

    const btn = screen.getByTestId('shortcuts-help-button');
    // Click is a no-op (default context openCheatsheet is noop), should not throw.
    expect(() => {
      fireEvent.click(btn);
    }).not.toThrow();
  });
});
