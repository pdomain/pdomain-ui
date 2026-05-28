/**
 * useLongJob — stub-friendly hook for long-running job tracking.
 *
 * Per spec §6, this hook uses SSE in hosted mode and polling fallback in
 * local mode. Phase 1 ships a polling stub that can be wired to real
 * pdomain-ops job routes.
 *
 * @note SSE transport is deferred to Phase 2. Current implementation uses
 * polling only. To migrate: replace the poll loop with an EventSource
 * listener; the `status`, `progress`, and `events` contract is identical.
 *
 * Transport contract URL:
 *   GET /api/jobs/<jobId>          → { status, progress, events }
 *   POST /api/jobs/<jobId>/cancel  → { ok: true }
 *
 * The deployMode is read from useAppShell() when available; the hook
 * accepts it directly to avoid the mandatory-context requirement.
 *
 * Covers issue #166. Stale-state fix: #36.
 */
import * as React from 'react';

export type LongJobStatus = 'idle' | 'pending' | 'running' | 'done' | 'error' | 'cancelled';

export interface LongJobEvent {
  type: string;
  payload?: unknown;
  ts: number;
}

export interface LongJobState {
  status: LongJobStatus;
  /** 0–1 progress fraction, or null when not reported. */
  progress: number | null;
  events: LongJobEvent[];
  /** Call to request cancellation. No-op when no pollFn is wired. */
  cancel: () => void;
}

export interface UseLongJobOptions {
  /**
   * Async function that fetches job state. When undefined the hook is a stub.
   * Expected return shape: { status, progress?, events? }
   */
  pollFn?: (jobId: string) => Promise<{
    status: LongJobStatus;
    progress?: number | null;
    events?: LongJobEvent[];
  }>;
  /**
   * Async function that requests cancellation.
   * When undefined, cancel() is a no-op.
   */
  cancelFn?: (jobId: string) => Promise<void>;
  /** Polling interval in ms (default 2000). Used only in local mode. */
  pollIntervalMs?: number;
}

export function useLongJob(jobId: string | null, options: UseLongJobOptions = {}): LongJobState {
  const { pollFn, cancelFn, pollIntervalMs = 2000 } = options;

  const [status, setStatus] = React.useState<LongJobStatus>('idle');
  const [progress, setProgress] = React.useState<number | null>(null);
  const [events, setEvents] = React.useState<LongJobEvent[]>([]);

  React.useEffect(() => {
    // When jobId clears or pollFn is absent, reset to idle so no stale fields
    // from a previous job leak into the next render (#36).
    if (!jobId || !pollFn) {
      setStatus('idle');
      setProgress(null);
      setEvents([]);
      return;
    }

    // Reset eagerly when a new job ID is provided so callers never see the
    // previous job's progress/events before the first poll settles (#36).
    setStatus('idle');
    setProgress(null);
    setEvents([]);

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    async function poll() {
      if (cancelled) return;
      try {
        const res = await pollFn!(jobId!);
        if (!cancelled) {
          setStatus(res.status);
          setProgress(res.progress ?? null);
          setEvents(res.events ?? []);
          if (res.status !== 'done' && res.status !== 'error' && res.status !== 'cancelled') {
            timeoutId = setTimeout(() => {
              void poll();
            }, pollIntervalMs);
          }
        }
      } catch {
        if (!cancelled) setStatus('error');
      }
    }

    void poll();

    return () => {
      cancelled = true;
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, [jobId, pollFn, pollIntervalMs]);

  const cancel = React.useCallback(() => {
    if (!jobId || !cancelFn) return;
    cancelFn(jobId).then(
      () => {
        setStatus('cancelled');
      },
      () => {
        setStatus('error');
      },
    );
  }, [jobId, cancelFn]);

  return { status, progress, events, cancel };
}
