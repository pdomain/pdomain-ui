/**
 * useLongJob tests — covering #166, #36.
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useLongJob } from './useLongJob.js';

describe('useLongJob (#166)', () => {
  it('starts idle', () => {
    const { result } = renderHook(() => useLongJob(null));
    expect(result.current.status).toBe('idle');
    expect(result.current.progress).toBeNull();
    expect(result.current.events).toEqual([]);
  });

  it('is a stub (no-op) when pollFn is not provided', () => {
    const { result } = renderHook(() => useLongJob('job-1'));
    expect(result.current.status).toBe('idle');
  });

  it('polls and returns done status', async () => {
    const pollFn = vi.fn(() =>
      Promise.resolve({
        status: 'done' as const,
        progress: 1.0,
        events: [{ type: 'complete', ts: 1000 }],
      }),
    );
    const { result } = renderHook(() => useLongJob('job-1', { pollFn, pollIntervalMs: 100 }));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(result.current.status).toBe('done');
    expect(result.current.progress).toBe(1.0);
    expect(result.current.events).toHaveLength(1);
  });

  it('sets error when pollFn throws', async () => {
    const pollFn = vi.fn(() => Promise.reject(new Error('fail')));
    const { result } = renderHook(() => useLongJob('job-1', { pollFn }));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(result.current.status).toBe('error');
  });

  it('cancel() calls cancelFn and sets status=cancelled', async () => {
    const cancelFn = vi.fn(() => Promise.resolve());
    const pollFn = vi.fn(() => Promise.resolve({ status: 'running' as const, progress: 0.5 }));
    const { result } = renderHook(() =>
      useLongJob('job-1', { pollFn, cancelFn, pollIntervalMs: 5000 }),
    );
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    await act(async () => {
      result.current.cancel();
      await new Promise((r) => setTimeout(r, 20));
    });
    expect(cancelFn).toHaveBeenCalledWith('job-1');
    expect(result.current.status).toBe('cancelled');
  });

  it('cancel() sets status=error when cancelFn rejects (WS5)', async () => {
    // When cancelFn rejects, status should become 'error', not remain 'running'.
    const cancelFn = vi.fn(() => Promise.reject(new Error('cancel failed')));
    const pollFn = vi.fn(() => Promise.resolve({ status: 'running' as const, progress: 0.5 }));
    const { result } = renderHook(() =>
      useLongJob('job-1', { pollFn, cancelFn, pollIntervalMs: 5000 }),
    );
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    await act(async () => {
      result.current.cancel();
      await new Promise((r) => setTimeout(r, 20));
    });
    expect(cancelFn).toHaveBeenCalledWith('job-1');
    expect(result.current.status).toBe('error');
  });
});

describe('useLongJob stale-state fixes (#36)', () => {
  it('resets to idle when jobId clears (null) mid-poll', async () => {
    const pollFn = vi.fn(() =>
      Promise.resolve({
        status: 'running' as const,
        progress: 0.4,
        events: [{ type: 'progress', ts: 1000 }],
      }),
    );
    let jobId: string | null = 'job-1';
    const { result, rerender } = renderHook(() =>
      useLongJob(jobId, { pollFn, pollIntervalMs: 5000 }),
    );
    // Let first poll settle.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(result.current.status).toBe('running');
    expect(result.current.progress).toBe(0.4);
    expect(result.current.events).toHaveLength(1);

    // Clear the job ID — state must reset to idle.
    jobId = null;
    act(() => {
      rerender();
    });
    expect(result.current.status).toBe('idle');
    expect(result.current.progress).toBeNull();
    expect(result.current.events).toEqual([]);
  });

  it('resets to idle when pollFn is removed', async () => {
    const pollFn = vi.fn(() =>
      Promise.resolve({
        status: 'running' as const,
        progress: 0.6,
      }),
    );
    let options: { pollFn?: typeof pollFn; pollIntervalMs: number } = {
      pollFn,
      pollIntervalMs: 5000,
    };
    const { result, rerender } = renderHook(() => useLongJob('job-1', options));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(result.current.status).toBe('running');

    // Remove pollFn — state must reset.
    options = { pollIntervalMs: 5000 };
    act(() => {
      rerender();
    });
    expect(result.current.status).toBe('idle');
    expect(result.current.progress).toBeNull();
    expect(result.current.events).toEqual([]);
  });

  it('clears previous job state when jobId changes to a new job', async () => {
    let callCount = 0;
    const pollFn = vi.fn(() => {
      callCount += 1;
      if (callCount <= 1) {
        // First job returns running with progress.
        return Promise.resolve({
          status: 'running' as const,
          progress: 0.8,
          events: [
            { type: 'step', ts: 1 },
            { type: 'step', ts: 2 },
          ],
        });
      }
      // New job starts fresh.
      return Promise.resolve({
        status: 'pending' as const,
        progress: null,
        events: [],
      });
    });

    let jobId = 'job-A';
    const { result, rerender } = renderHook(() =>
      useLongJob(jobId, { pollFn, pollIntervalMs: 5000 }),
    );
    // Let first poll settle.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(result.current.status).toBe('running');
    expect(result.current.progress).toBe(0.8);
    expect(result.current.events).toHaveLength(2);

    // Switch to a different job ID — state must reset before new poll arrives.
    jobId = 'job-B';
    act(() => {
      rerender();
      // Immediately after rerender (before any async poll resolves), state is idle.
    });
    // After synchronous rerender the state has been reset.
    expect(result.current.status).toBe('idle');
    expect(result.current.progress).toBeNull();
    expect(result.current.events).toEqual([]);

    // Wait for new poll to resolve with the new job's response.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(result.current.status).toBe('pending');
    expect(result.current.progress).toBeNull();
    expect(result.current.events).toEqual([]);
  });
});
