/**
 * LauncherSlot tests — covering #159.
 */
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LauncherSlot } from './LauncherSlot.js';
import { SuiteSiblingsContext } from './SuiteSiblingsContext.js';
import type { InstalledApp, LaunchResult } from './types.js';

function makeSibling(id: string): InstalledApp {
  return {
    id,
    displayName: `App ${id}`,
    iconUrl: `/icons/${id}.svg`,
    launchUrl: `http://localhost:3000/${id}`,
  };
}

function wrapper(
  siblings: InstalledApp[],
  launch: (id: string) => Promise<LaunchResult> = vi.fn(),
  loading = false,
  error: unknown = null,
) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <SuiteSiblingsContext.Provider value={{ siblings, launch, loading, error }}>
        {children}
      </SuiteSiblingsContext.Provider>
    );
  };
}

describe('LauncherSlot (#159)', () => {
  it('renders nothing when siblings is empty', () => {
    render(<LauncherSlot />, { wrapper: wrapper([]) });
    expect(screen.queryByTestId('launcher-slot')).toBeNull();
  });

  it('renders launcher-slot when at least one sibling exists', () => {
    render(<LauncherSlot />, { wrapper: wrapper([makeSibling('a')]) });
    expect(screen.getByTestId('launcher-slot')).toBeTruthy();
  });

  it('renders one LauncherTile per sibling', () => {
    render(<LauncherSlot />, {
      wrapper: wrapper([makeSibling('a'), makeSibling('b')]),
    });
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(2);
  });

  it('renders nothing while loading (no siblings yet)', () => {
    render(<LauncherSlot />, { wrapper: wrapper([], vi.fn(), true) });
    expect(screen.queryByTestId('launcher-slot')).toBeNull();
  });
});
