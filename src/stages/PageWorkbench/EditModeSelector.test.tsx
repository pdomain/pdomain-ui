/**
 * EditModeSelector unit tests.
 *
 * Tests:
 *   - Renders all 4 mode options
 *   - Clicking each option fires onModeChange with the correct value
 *   - data-testid forwarded to root wrapper element
 *   - ARIA radiogroup semantics (inner role="group" + role="radio" buttons)
 *   - Active option has aria-checked="true"; inactive options have aria-checked="false"
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { EditModeSelector } from './EditModeSelector.js';
import type { EditMode } from './EditModeSelector.js';

describe('EditModeSelector', () => {
  it('renders all four mode options', () => {
    render(<EditModeSelector mode="view" onModeChange={vi.fn()} />);
    expect(screen.getByRole('radio', { name: /view/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /split/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /illustration/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /rotate/i })).toBeInTheDocument();
  });

  it('marks the active mode as aria-checked="true"', () => {
    render(<EditModeSelector mode="split" onModeChange={vi.fn()} />);
    expect(screen.getByRole('radio', { name: /split/i })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: /view/i })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('radio', { name: /illustration/i })).toHaveAttribute(
      'aria-checked',
      'false',
    );
    expect(screen.getByRole('radio', { name: /rotate/i })).toHaveAttribute('aria-checked', 'false');
  });

  it.each<EditMode>(['view', 'split', 'illust', 'rotate'])(
    'clicking "%s" fires onModeChange with "%s"',
    async (mode) => {
      const onModeChange = vi.fn();
      const labels: Record<EditMode, RegExp> = {
        view: /view/i,
        split: /split/i,
        illust: /illustration/i,
        rotate: /rotate/i,
        words: /words/i,
      };

      render(<EditModeSelector mode="view" onModeChange={onModeChange} />);

      await userEvent.click(screen.getByRole('radio', { name: labels[mode] }));
      expect(onModeChange).toHaveBeenCalledWith(mode);
    },
  );

  it('forwards data-testid to the root wrapper element', () => {
    const { container } = render(
      <EditModeSelector mode="view" onModeChange={vi.fn()} data-testid="edit-mode-selector" />,
    );
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute('data-testid', 'edit-mode-selector');
  });

  it('inner Segmented track has ARIA role="radiogroup" semantics', () => {
    render(<EditModeSelector mode="view" onModeChange={vi.fn()} />);
    // Segmented renders a div[role="radiogroup"] containing the radio buttons
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });
});
