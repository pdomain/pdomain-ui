/**
 * useUpdateCheck — stub-friendly hook for in-app update checking.
 *
 * Behavior by policy:
 *   "notify" — auto-checks on mount; exposes `info` for the panel to show
 *              an "Update & Restart" button.
 *   "auto"   — auto-checks on mount; if `update_available`, calls `applyUpdate`
 *              automatically (app restarts without user interaction).
 *   "manual" — does NOT auto-check; user must call `checkNow()`.
 *
 * All side-effects are injected so tests can supply fakes without patching `fetch`.
 *
 * HTTP contract:
 *   GET  /api/suite/update  → UpdateInfo
 *   POST /api/suite/update  → { restart_required: true }
 */
import * as React from 'react';
import type { UpdateInfo, UpdatePolicy } from '../shell/types.js';

export interface UseUpdateCheckOptions {
  /** Async function that fetches update info from the server. */
  fetchUpdate?: () => Promise<UpdateInfo>;
  /** Async function that triggers the `uv tool upgrade` path on the server. */
  applyUpdate?: () => Promise<unknown>;
  /** Update policy controlling auto-check behavior. */
  policy?: UpdatePolicy;
}

export interface UpdateCheckState {
  info: UpdateInfo | null;
  loading: boolean;
  error: unknown;
  /** Manually trigger an update check (works even in "manual" policy). */
  checkNow: () => Promise<void>;
  /** Apply the update (POST /api/suite/update) then restart the window. */
  applyAndRestart: () => Promise<void>;
}

export function useUpdateCheck(options: UseUpdateCheckOptions = {}): UpdateCheckState {
  const { fetchUpdate, applyUpdate, policy = 'notify' } = options;

  const [info, setInfo] = React.useState<UpdateInfo | null>(null);
  const [loading, setLoading] = React.useState(policy !== 'manual');
  const [error, setError] = React.useState<unknown>(null);

  // Ref pattern: avoid re-triggers on function identity change
  const fetchUpdateRef = React.useRef(fetchUpdate);
  fetchUpdateRef.current = fetchUpdate;

  const applyUpdateRef = React.useRef(applyUpdate);
  applyUpdateRef.current = applyUpdate;

  const doFetch = React.useCallback(async () => {
    const fn = fetchUpdateRef.current;
    if (!fn) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fn();
      setInfo(data);
    } catch (err: unknown) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-check on mount for notify and auto policies
  React.useEffect(() => {
    if (policy === 'manual') return;
    void doFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally mount-only; policy and doFetch are stable

  // For "auto" policy: apply update automatically when available
  const autoApplied = React.useRef(false);
  React.useEffect(() => {
    if (policy !== 'auto') return;
    if (!info?.update_available) return;
    if (autoApplied.current) return;
    autoApplied.current = true;
    const fn = applyUpdateRef.current;
    if (fn) {
      void fn();
    }
  }, [policy, info]);

  const checkNow = React.useCallback(async () => {
    await doFetch();
  }, [doFetch]);

  const applyAndRestart = React.useCallback(async () => {
    const fn = applyUpdateRef.current;
    if (!fn) return;
    try {
      await fn();
    } catch (err: unknown) {
      setError(err);
    }
  }, []);

  return { info, loading, error, checkNow, applyAndRestart };
}
