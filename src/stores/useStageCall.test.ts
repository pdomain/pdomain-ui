/**
 * useStageCall tests — covering #166 (original) and #23 (warming retry fix).
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useStageCall } from './useStageCall.js';

describe('useStageCall (#166)', () => {
  it('starts idle', () => {
    const { result } = renderHook(() => useStageCall('stage1', 'page1'));
    expect(result.current.status).toBe('idle');
    expect(result.current.result).toBeNull();
    expect(result.current.isWarming).toBe(false);
  });

  it('is a stub (no-op) when submit is not provided', () => {
    const { result } = renderHook(() => useStageCall('s', 'p'));
    act(() => {
      result.current.run({});
    });
    expect(result.current.status).toBe('idle');
  });

  it('goes pending then done when submit resolves', async () => {
    const submit = vi.fn(() => Promise.resolve({ text: 'result' }));
    const { result } = renderHook(() => useStageCall('stage1', 'p1', { submit }));
    await act(() => {
      result.current.run({});
      return Promise.resolve();
    });
    expect(result.current.status).toBe('done');
    expect(result.current.result).toEqual({ text: 'result' });
  });

  it('goes error when submit rejects with non-503', async () => {
    const submit = vi.fn(() => Promise.reject(new Error('fail')));
    const { result } = renderHook(() => useStageCall('stage1', 'p1', { submit }));
    await act(() => {
      result.current.run({});
      return Promise.resolve();
    });
    expect(result.current.status).toBe('error');
  });

  it('goes warming when submit rejects with 503-like error', async () => {
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- the hook reads status and retryAfter from the rejected object
    const submit = vi.fn(() => Promise.reject({ status: 503, retryAfter: 1000 }));
    const { result } = renderHook(() => useStageCall('stage1', 'p1', { submit }));
    await act(() => {
      result.current.run({});
      return Promise.resolve();
    });
    expect(result.current.status).toBe('warming');
    expect(result.current.isWarming).toBe(true);
    expect(result.current.retryAt).toBeGreaterThan(Date.now() - 100);
  });
});

describe('useStageCall warming retry (#23)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('exposes retriesRemaining = maxRetries initially', () => {
    const submit = vi.fn(() => Promise.resolve({}));
    const { result } = renderHook(() => useStageCall('s', 'p', { submit, maxRetries: 3 }));
    expect(result.current.retriesRemaining).toBe(3);
  });

  it('warming→retry→success: automatically retries after retryAfter ms and resolves', async () => {
    let callCount = 0;
    const submit = vi.fn(() => {
      callCount++;
      if (callCount === 1) {
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- the hook reads status and retryAfter from the rejected object
        return Promise.reject({ status: 503, retryAfter: 2000 });
      }
      return Promise.resolve({ text: 'ok' });
    });

    const { result } = renderHook(() => useStageCall('stage1', 'p1', { submit, maxRetries: 3 }));

    // Trigger initial call — goes warming.
    await act(async () => {
      result.current.run({ key: 'val' });
      await Promise.resolve();
    });

    expect(result.current.status).toBe('warming');
    expect(result.current.isWarming).toBe(true);
    expect(result.current.retriesRemaining).toBe(2);

    // Advance timers by retryAfter to trigger the automatic retry.
    await act(async () => {
      vi.advanceTimersByTime(2000);
      await Promise.resolve();
    });

    // After retry resolves, status should be done.
    expect(result.current.status).toBe('done');
    expect(result.current.result).toEqual({ text: 'ok' });
    expect(result.current.isWarming).toBe(false);
    expect(result.current.retryAt).toBeNull();
    expect(submit).toHaveBeenCalledTimes(2);
    // Original params are preserved on retry.
    expect(submit).toHaveBeenNthCalledWith(2, 'stage1', 'p1', { key: 'val' });
  });

  it('warming→retry→fail: exhausts retries and goes error', async () => {
    const submit = vi.fn(
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- the hook reads status and retryAfter from the rejected object
      () => Promise.reject({ status: 503, retryAfter: 500 }),
    );

    const { result } = renderHook(() => useStageCall('stage1', 'p1', { submit, maxRetries: 2 }));

    // Initial call — 1st 503.
    await act(async () => {
      result.current.run({});
      await Promise.resolve();
    });

    expect(result.current.status).toBe('warming');
    expect(result.current.retriesRemaining).toBe(1);

    // Advance to trigger retry 1 — 2nd 503.
    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });

    expect(result.current.status).toBe('warming');
    expect(result.current.retriesRemaining).toBe(0);

    // Advance to trigger retry 2 — retries exhausted → error.
    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.isWarming).toBe(false);
    expect(result.current.retryAt).toBeNull();
    expect(submit).toHaveBeenCalledTimes(3); // initial + 2 retries
  });

  it('fresh run() resets retry counter and cancels pending timer', async () => {
    let callCount = 0;
    const submit = vi.fn(() => {
      callCount++;
      if (callCount <= 2) {
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- the hook reads status and retryAfter from the rejected object
        return Promise.reject({ status: 503, retryAfter: 5000 });
      }
      return Promise.resolve({ text: 'fresh' });
    });

    const { result } = renderHook(() => useStageCall('stage1', 'p1', { submit, maxRetries: 1 }));

    // First call → warming.
    await act(async () => {
      result.current.run({ attempt: 1 });
      await Promise.resolve();
    });

    expect(result.current.status).toBe('warming');
    expect(result.current.retriesRemaining).toBe(0);

    // User triggers fresh run before the timer fires.
    await act(async () => {
      result.current.run({ attempt: 2 });
      await Promise.resolve();
    });

    // retriesRemaining reset to maxRetries (1) by fresh run, then consumed by 2nd 503.
    expect(result.current.status).toBe('warming');
    expect(result.current.retriesRemaining).toBe(0);

    // The old 5 s timer for attempt 1 must NOT fire — it was cancelled.
    // Advance by 5000 ms; the new timer for attempt 2 also fires → success.
    await act(async () => {
      vi.advanceTimersByTime(5000);
      await Promise.resolve();
    });

    expect(result.current.status).toBe('done');
    // submit call count: initial-1, initial-2, retry-for-2 = 3
    expect(submit).toHaveBeenCalledTimes(3);
  });

  it('unmount cancels the pending retry timer (no setState after unmount)', async () => {
    const submit = vi.fn(
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- the hook reads status and retryAfter from the rejected object
      () => Promise.reject({ status: 503, retryAfter: 1000 }),
    );

    const { result, unmount } = renderHook(() =>
      useStageCall('stage1', 'p1', { submit, maxRetries: 3 }),
    );

    await act(async () => {
      result.current.run({});
      await Promise.resolve();
    });

    expect(result.current.status).toBe('warming');

    // Unmount — the retry timer should be cancelled.
    unmount();

    // No error thrown when timer would have fired (setState after unmount would warn).
    await act(async () => {
      vi.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    // submit was only called once (no retry after unmount).
    expect(submit).toHaveBeenCalledTimes(1);
  });

  it('uses default retryAfter of 5000ms when not provided in 503 error', async () => {
    let callCount = 0;
    const submit = vi.fn(() => {
      callCount++;
      if (callCount === 1) {
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- the hook reads status and retryAfter from the rejected object
        return Promise.reject({ status: 503 }); // no retryAfter field
      }
      return Promise.resolve({ text: 'default-delay' });
    });

    const { result } = renderHook(() => useStageCall('stage1', 'p1', { submit, maxRetries: 1 }));

    await act(async () => {
      result.current.run({});
      await Promise.resolve();
    });

    expect(result.current.status).toBe('warming');

    // Should not retry yet at 4999ms.
    act(() => {
      vi.advanceTimersByTime(4999);
    });
    expect(submit).toHaveBeenCalledTimes(1);

    // Should retry at 5000ms.
    await act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
    });

    expect(result.current.status).toBe('done');
    expect(submit).toHaveBeenCalledTimes(2);
  });
});
