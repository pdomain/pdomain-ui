import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useUpdateCheck } from './useUpdateCheck.js';

const mockUpdateInfo = {
  current: '0.9.0',
  latest: '0.10.0',
  update_available: true,
  changelog_url: 'https://example.com/changelog',
  channel: 'stable',
};

describe('useUpdateCheck', () => {
  it('flags update available (notify policy)', async () => {
    const { result } = renderHook(() =>
      useUpdateCheck({
        fetchUpdate: vi.fn().mockResolvedValue(mockUpdateInfo),
        policy: 'notify',
      }),
    );
    await waitFor(() => expect(result.current.info?.update_available).toBe(true));
  });

  it('manual policy does not auto-check', () => {
    const fetchUpdate = vi.fn();
    renderHook(() => useUpdateCheck({ fetchUpdate, policy: 'manual' }));
    expect(fetchUpdate).not.toHaveBeenCalled();
  });

  it('auto policy does auto-check on mount', async () => {
    const fetchUpdate = vi.fn().mockResolvedValue({ ...mockUpdateInfo, update_available: false });
    renderHook(() => useUpdateCheck({ fetchUpdate, policy: 'auto' }));
    await waitFor(() => expect(fetchUpdate).toHaveBeenCalled());
  });

  it('checkNow triggers a fetch even in manual policy', async () => {
    const fetchUpdate = vi.fn().mockResolvedValue(mockUpdateInfo);
    const { result } = renderHook(() => useUpdateCheck({ fetchUpdate, policy: 'manual' }));
    expect(fetchUpdate).not.toHaveBeenCalled();
    await result.current.checkNow();
    expect(fetchUpdate).toHaveBeenCalledOnce();
    await waitFor(() => expect(result.current.info?.current).toBe('0.9.0'));
  });

  it('applyAndRestart calls applyUpdate', async () => {
    const applyUpdate = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useUpdateCheck({
        fetchUpdate: vi.fn().mockResolvedValue(mockUpdateInfo),
        applyUpdate,
        policy: 'notify',
      }),
    );
    await waitFor(() => expect(result.current.info).not.toBeNull());
    await result.current.applyAndRestart();
    expect(applyUpdate).toHaveBeenCalledOnce();
  });

  it('auto policy calls applyUpdate when update_available is true', async () => {
    const applyUpdate = vi.fn().mockResolvedValue(undefined);
    renderHook(() =>
      useUpdateCheck({
        fetchUpdate: vi.fn().mockResolvedValue(mockUpdateInfo),
        applyUpdate,
        policy: 'auto',
      }),
    );
    await waitFor(() => expect(applyUpdate).toHaveBeenCalledOnce());
  });

  it('loading is true initially then false', async () => {
    const { result } = renderHook(() =>
      useUpdateCheck({
        fetchUpdate: vi.fn().mockResolvedValue(mockUpdateInfo),
        policy: 'notify',
      }),
    );
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
  });
});
