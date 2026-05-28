/**
 * LauncherTile tests — covering #159.
 */
import * as React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LauncherTile } from './LauncherTile.js';
import { SuiteSiblingsContext } from './SuiteSiblingsContext.js';
import type { InstalledApp, LaunchResult } from './types.js';

function sibling(overrides?: Partial<InstalledApp>): InstalledApp {
  return {
    id: 'sibling-app',
    displayName: 'Sibling App',
    iconUrl: '/icons/sibling-app.svg',
    launchUrl: 'http://localhost:3001',
    ...overrides,
  };
}

function wrapWithContext(launch: (id: string) => Promise<LaunchResult>, children: React.ReactNode) {
  return (
    <SuiteSiblingsContext.Provider
      value={{ siblings: [sibling()], launch, loading: false, error: null }}
    >
      {children}
    </SuiteSiblingsContext.Provider>
  );
}

describe('LauncherTile (#159)', () => {
  it('renders sibling displayName', () => {
    const launch = vi.fn(
      (): Promise<LaunchResult> =>
        Promise.resolve({ kind: 'opened' as const, url: 'http://localhost:3001' }),
    );
    render(wrapWithContext(launch, <LauncherTile sibling={sibling()} />));
    expect(screen.getByText('Sibling App')).toBeTruthy();
  });

  it('calls launch(id) when clicked', async () => {
    const launch = vi.fn(
      (): Promise<LaunchResult> =>
        Promise.resolve({
          kind: 'opened',
          url: 'http://localhost:3001',
        }),
    );
    render(wrapWithContext(launch, <LauncherTile sibling={sibling()} />));
    await act(() => {
      fireEvent.click(screen.getByRole('button'));
      return Promise.resolve();
    });
    expect(launch).toHaveBeenCalledWith('sibling-app');
  });

  it('calls window.open with url on "opened" result', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const launch = vi.fn(
      (): Promise<LaunchResult> =>
        Promise.resolve({
          kind: 'opened',
          url: 'http://localhost:3001',
        }),
    );
    render(wrapWithContext(launch, <LauncherTile sibling={sibling()} />));
    await act(() => {
      fireEvent.click(screen.getByRole('button'));
      return Promise.resolve();
    });
    expect(openSpy).toHaveBeenCalledWith('http://localhost:3001', '_blank', 'noopener,noreferrer');
    openSpy.mockRestore();
  });

  it('shows requires-host-config label on that result', async () => {
    const launch = vi.fn(
      (): Promise<LaunchResult> =>
        Promise.resolve({
          kind: 'requires-host-config',
          siblingId: 'sibling-app',
        }),
    );
    render(wrapWithContext(launch, <LauncherTile sibling={sibling()} />));
    await act(() => {
      fireEvent.click(screen.getByRole('button'));
      return Promise.resolve();
    });
    expect(screen.getByTestId('launcher-tile-requires-config')).toBeTruthy();
  });
});
