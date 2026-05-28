/**
 * NavGroup Vitest tests (Phase 2 M7).
 */

import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NavGroup } from './NavGroup.js';
import {
  SCANNO_NAV_GROUP,
  SCANNO_NAV_GROUP_COUNT,
  scannoNavGroupTestId,
} from '../../testids/index.js';

describe('NavGroup', () => {
  it('renders label', () => {
    render(
      <NavGroup label="Punctuation" expanded onToggle={() => {}}>
        <li>Item A</li>
      </NavGroup>,
    );
    expect(screen.getByText('Punctuation')).toBeInTheDocument();
  });

  it('renders children when expanded', () => {
    render(
      <NavGroup label="Punctuation" expanded onToggle={() => {}}>
        <li>Item A</li>
      </NavGroup>,
    );
    expect(screen.getByText('Item A')).toBeVisible();
  });

  it('does not render children when collapsed', () => {
    render(
      <NavGroup label="Punctuation" expanded={false} onToggle={() => {}}>
        <li>Item A</li>
      </NavGroup>,
    );
    expect(screen.queryByText('Item A')).toBeNull();
  });

  it('fires onToggle when header button is clicked', async () => {
    const onToggle = vi.fn();
    render(
      <NavGroup label="Punctuation" expanded onToggle={onToggle}>
        <li>Item A</li>
      </NavGroup>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('button has correct aria-expanded when expanded', () => {
    render(
      <NavGroup label="Punctuation" expanded onToggle={() => {}}>
        <li>Item A</li>
      </NavGroup>,
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });

  it('button has correct aria-expanded when collapsed', () => {
    render(
      <NavGroup label="Punctuation" expanded={false} onToggle={() => {}}>
        <li>Item A</li>
      </NavGroup>,
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders count badge when count prop is provided', () => {
    render(
      <NavGroup label="Punctuation" count={7} expanded onToggle={() => {}}>
        <li>Item A</li>
      </NavGroup>,
    );
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('does not render count badge when count is absent', () => {
    render(
      <NavGroup label="Punctuation" expanded onToggle={() => {}}>
        <li>Item A</li>
      </NavGroup>,
    );
    // No element with an explicit count digit should exist
    expect(screen.queryByTestId(SCANNO_NAV_GROUP_COUNT)).toBeNull();
  });

  it('applies default testid from SCANNO_NAV_GROUP constant', () => {
    render(
      <NavGroup label="Punctuation" expanded onToggle={() => {}}>
        <li>Item A</li>
      </NavGroup>,
    );
    expect(screen.getByTestId(SCANNO_NAV_GROUP)).toBeInTheDocument();
  });

  it('applies custom testid via data-testid prop', () => {
    const custom = scannoNavGroupTestId('custom-id');
    render(
      <NavGroup label="Punctuation" expanded onToggle={() => {}} data-testid={custom}>
        <li>Item A</li>
      </NavGroup>,
    );
    expect(screen.getByTestId(custom)).toBeInTheDocument();
  });
});
