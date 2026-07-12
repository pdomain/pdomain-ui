/**
 * SuiteSiblingsProvider + useSuiteSiblings tests — covering #165.
 */
import * as React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SuiteSiblingsProvider } from './SuiteSiblingsProvider.js';
import { useSuiteSiblingsContext } from './SuiteSiblingsContext.js';
import type { InstalledApp, LaunchResult } from './types.js';

function makeSibling(id: string): InstalledApp {
  return {
    id,
    displayName: `App ${id}`,
    iconUrl: `/icons/${id}.svg`,
    launchUrl: `http://localhost:3000/${id}`,
  };
}

function Readout() {
  const ctx = useSuiteSiblingsContext();
  if (!ctx) return <span data-testid="no-ctx">no context</span>;
  return (
    <div>
      <span data-testid="loading">{ctx.loading ? 'y' : 'n'}</span>
      <span data-testid="count">{ctx.siblings.length}</span>
    </div>
  );
}

describe('SuiteSiblingsProvider (#165)', () => {
  it('starts with loading=true', () => {
    const fetchInstalled = vi.fn((): Promise<InstalledApp[]> => new Promise(() => undefined));
    const postLaunch = vi.fn((): Promise<LaunchResult> =>
      Promise.resolve({ kind: 'opened' as const, url: '' }),
    );
    render(
      <SuiteSiblingsProvider value={{ fetchInstalled, postLaunch }}>
        <Readout />
      </SuiteSiblingsProvider>,
    );
    expect(screen.getByTestId('loading').textContent).toBe('y');
  });

  it('populates siblings after fetchInstalled resolves', async () => {
    const fetchInstalled = vi.fn(() => Promise.resolve([makeSibling('a'), makeSibling('b')]));
    const postLaunch = vi.fn((): Promise<LaunchResult> =>
      Promise.resolve({ kind: 'opened' as const, url: '' }),
    );
    render(
      <SuiteSiblingsProvider value={{ fetchInstalled, postLaunch }}>
        <Readout />
      </SuiteSiblingsProvider>,
    );
    await act(() => Promise.resolve());
    expect(screen.getByTestId('count').textContent).toBe('2');
    expect(screen.getByTestId('loading').textContent).toBe('n');
  });

  it('handles fetchInstalled failure gracefully (loading=false, siblings=[])', async () => {
    const fetchInstalled = vi.fn(() => Promise.reject(new Error('fail')));
    const postLaunch = vi.fn((): Promise<LaunchResult> =>
      Promise.resolve({ kind: 'opened' as const, url: '' }),
    );
    render(
      <SuiteSiblingsProvider value={{ fetchInstalled, postLaunch }}>
        <Readout />
      </SuiteSiblingsProvider>,
    );
    await act(() => Promise.resolve());
    expect(screen.getByTestId('count').textContent).toBe('0');
    expect(screen.getByTestId('loading').textContent).toBe('n');
  });

  it('launch() calls postLaunch with the sibling id', async () => {
    const postLaunch = vi.fn((): Promise<LaunchResult> =>
      Promise.resolve({
        kind: 'opened' as const,
        url: 'http://localhost:3001',
      }),
    );
    const fetchInstalled = vi.fn(() => Promise.resolve([makeSibling('a')]));

    function LaunchTrigger() {
      const ctx = useSuiteSiblingsContext();
      return (
        <button
          data-testid="launch-btn"
          onClick={() => {
            void ctx?.launch('a');
          }}
        >
          launch
        </button>
      );
    }

    render(
      <SuiteSiblingsProvider value={{ fetchInstalled, postLaunch }}>
        <LaunchTrigger />
      </SuiteSiblingsProvider>,
    );
    await act(() => Promise.resolve());

    await act(() => {
      screen.getByTestId('launch-btn').click();
      return Promise.resolve();
    });

    expect(postLaunch).toHaveBeenCalledWith('a');
  });
});
