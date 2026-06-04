import { describe, it, expect, vi } from 'vitest';
import { createApiDeviceConfig } from './createApiDeviceConfig.js';

describe('createApiDeviceConfig', () => {
  it('fetchDevice calls the device endpoint', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => ({
        mode: 'local',
        available: [{ id: 'cpu', label: 'CPU' }],
        current: 'cpu',
        effective_source: 'auto',
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const cfg = createApiDeviceConfig();
    const result = await cfg.fetchDevice();

    expect(mockFetch).toHaveBeenCalledWith('/api/suite/device');
    expect(result.mode).toBe('local');
    expect(result.current).toBe('cpu');

    vi.unstubAllGlobals();
  });

  it('putDevice calls PUT with JSON body', async () => {
    const mockResponse = {
      mode: 'local',
      available: [{ id: 'cpu', label: 'CPU' }],
      current: 'cpu',
      effective_source: 'app',
    };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => mockResponse,
    });
    vi.stubGlobal('fetch', mockFetch);

    const cfg = createApiDeviceConfig();
    const result = await cfg.putDevice({ scope: 'app', device: 'cpu' });

    expect(mockFetch).toHaveBeenCalledWith('/api/suite/device', expect.objectContaining({
      method: 'PUT',
    }));
    expect(result.effective_source).toBe('app');

    vi.unstubAllGlobals();
  });

  it('respects custom deviceUrl option', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => ({ mode: 'local', available: [], current: null, effective_source: null }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const cfg = createApiDeviceConfig({ deviceUrl: '/custom/device' });
    await cfg.fetchDevice();

    expect(mockFetch).toHaveBeenCalledWith('/custom/device');
    vi.unstubAllGlobals();
  });
});
