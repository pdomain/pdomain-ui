import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useDeviceInfo } from './useDeviceInfo.js';

describe('useDeviceInfo', () => {
  it('loads device info via injected fetcher', async () => {
    const { result } = renderHook(() =>
      useDeviceInfo({
        fetchDevice: async () => ({
          mode: 'local',
          available: [{ id: 'cpu', label: 'CPU' }],
          current: 'cpu',
          effective_source: 'auto',
        }),
      }),
    );
    await waitFor(() => expect(result.current.info?.current).toBe('cpu'));
  });

  it('loading is true initially, false after fetch', async () => {
    const { result } = renderHook(() =>
      useDeviceInfo({
        fetchDevice: async () => ({
          mode: 'local',
          available: [{ id: 'cpu', label: 'CPU' }],
          current: 'cpu',
          effective_source: 'auto',
        }),
      }),
    );
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it('setDevice calls putDevice with correct args', async () => {
    const putDevice = vi.fn().mockResolvedValue({
      mode: 'local',
      available: [{ id: 'cpu', label: 'CPU' }],
      current: 'cpu',
      effective_source: 'app',
    });
    const { result } = renderHook(() =>
      useDeviceInfo({
        fetchDevice: async () => ({
          mode: 'local',
          available: [{ id: 'cpu', label: 'CPU' }],
          current: 'cpu',
          effective_source: 'auto',
        }),
        putDevice,
      }),
    );
    await waitFor(() => expect(result.current.info).not.toBeNull());
    await result.current.setDevice('app', 'cpu');
    expect(putDevice).toHaveBeenCalledWith({ scope: 'app', device: 'cpu' });
  });

  it('error state is set on fetch failure', async () => {
    const { result } = renderHook(() =>
      useDeviceInfo({
        fetchDevice: async () => {
          throw new Error('network error');
        },
      }),
    );
    await waitFor(() => expect(result.current.error).not.toBeNull());
  });
});
