import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useDeviceInfo } from './useDeviceInfo.js';

const mockDeviceInfo = {
  mode: 'local' as const,
  available: [{ id: 'cpu', label: 'CPU' }],
  current: 'cpu',
  effective_source: 'auto',
};

describe('useDeviceInfo', () => {
  it('loads device info via injected fetcher', async () => {
    const { result } = renderHook(() =>
      useDeviceInfo({
        fetchDevice: () => Promise.resolve(mockDeviceInfo),
      }),
    );
    await waitFor(() => expect(result.current.info?.current).toBe('cpu'));
  });

  it('loading is true initially, false after fetch', async () => {
    const { result } = renderHook(() =>
      useDeviceInfo({
        fetchDevice: () => Promise.resolve(mockDeviceInfo),
      }),
    );
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it('setDevice calls putDevice with correct args', async () => {
    const putDevice = vi.fn().mockResolvedValue({
      ...mockDeviceInfo,
      effective_source: 'app',
    });
    const { result } = renderHook(() =>
      useDeviceInfo({
        fetchDevice: () => Promise.resolve(mockDeviceInfo),
        putDevice,
      }),
    );
    await waitFor(() => expect(result.current.info).not.toBeNull());
    await result.current.setDevice('app', 'cpu');
    expect(putDevice).toHaveBeenCalledWith({ scope: 'app', device: 'cpu' });
  });

  it('clearDevice updates info from the API response', async () => {
    const updated = {
      mode: 'local' as const,
      available: [{ id: 'cpu', label: 'CPU' }],
      current: 'cpu',
      effective_source: 'auto',
    };
    const clearDevice = vi.fn(() => Promise.resolve(updated));
    const { result } = renderHook(() =>
      useDeviceInfo({
        fetchDevice: () => Promise.resolve(mockDeviceInfo),
        putDevice: vi.fn(),
        clearDevice,
      }),
    );

    await waitFor(() => expect(result.current.info?.current).toBe('cpu'));
    await act(async () => {
      await result.current.clearDevice('app');
    });

    expect(clearDevice).toHaveBeenCalledWith('app');
    expect(result.current.info?.effective_source).toBe('auto');
  });

  it('error state is set on fetch failure', async () => {
    const { result } = renderHook(() =>
      useDeviceInfo({
        fetchDevice: () => Promise.reject(new Error('network error')),
      }),
    );
    await waitFor(() => expect(result.current.error).not.toBeNull());
  });
});
