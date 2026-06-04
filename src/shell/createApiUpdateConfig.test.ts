import { describe, it, expect, vi } from 'vitest';
import { createApiUpdateConfig } from './createApiUpdateConfig.js';

describe('createApiUpdateConfig', () => {
  it('fetchUpdate calls the update endpoint', async () => {
    const mockBody = {
      current: '0.9.0',
      latest: '0.10.0',
      update_available: true,
      changelog_url: 'https://example.com/changelog',
      channel: 'stable',
    };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => mockBody,
    });
    vi.stubGlobal('fetch', mockFetch);

    const cfg = createApiUpdateConfig();
    const result = await cfg.fetchUpdate();

    expect(mockFetch).toHaveBeenCalledWith('/api/suite/update');
    expect(result.update_available).toBe(true);
    expect(result.current).toBe('0.9.0');

    vi.unstubAllGlobals();
  });

  it('applyUpdate calls POST to the update endpoint', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => ({ restart_required: true }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const cfg = createApiUpdateConfig();
    const result = await cfg.applyUpdate();

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/suite/update',
      expect.objectContaining({
        method: 'POST',
      }),
    );
    expect(result.restart_required).toBe(true);

    vi.unstubAllGlobals();
  });

  it('respects custom updateUrl option', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => ({
        current: '1.0.0',
        latest: '1.0.0',
        update_available: false,
        changelog_url: '',
        channel: 'stable',
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const cfg = createApiUpdateConfig({ updateUrl: '/custom/update' });
    await cfg.fetchUpdate();

    expect(mockFetch).toHaveBeenCalledWith('/custom/update');
    vi.unstubAllGlobals();
  });
});
