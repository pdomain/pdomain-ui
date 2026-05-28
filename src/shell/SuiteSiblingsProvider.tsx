/**
 * SuiteSiblingsProvider — wraps AppShell with the sibling discovery context.
 *
 * Accepts callbacks:
 *   fetchInstalled() → Promise<InstalledApp[]>   — reads /api/suite/installed
 *   postLaunch(id)   → Promise<LaunchResult>     — calls /api/suite/launch
 *
 * Calls fetchInstalled() on mount. The useSuiteSiblings() hook (exported from
 * /stores) reads from this context.
 *
 * Covers issue #165.
 */
import * as React from 'react';
import { SuiteSiblingsContext } from './SuiteSiblingsContext.js';
import type { InstalledApp, LaunchResult } from './types.js';

export interface SuiteSiblingsProviderProps {
  /** Config object with the two fetch callbacks. */
  value: {
    fetchInstalled: () => Promise<InstalledApp[]>;
    postLaunch: (id: string) => Promise<LaunchResult>;
  };
  children: React.ReactNode;
}

export function SuiteSiblingsProvider({ value, children }: SuiteSiblingsProviderProps) {
  const { fetchInstalled, postLaunch } = value;

  const [siblings, setSiblings] = React.useState<InstalledApp[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<unknown>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchInstalled()
      .then((apps) => {
        if (!cancelled) {
          setSiblings(apps);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const launch = React.useCallback(
    (id: string): Promise<LaunchResult> => postLaunch(id),
    [postLaunch],
  );

  return (
    <SuiteSiblingsContext.Provider value={{ siblings, launch, loading, error }}>
      {children}
    </SuiteSiblingsContext.Provider>
  );
}

SuiteSiblingsProvider.displayName = 'SuiteSiblingsProvider';
