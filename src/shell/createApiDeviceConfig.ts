/**
 * createApiDeviceConfig — builds the fetchDevice/putDevice callbacks
 * that useDeviceInfo needs, backed by the pdomain-ops standard
 * `/api/suite/device` REST contract.
 *
 * Contract
 * ────────
 * GET  /api/suite/device
 *   → 200 application/json   body: DeviceInfo
 *
 * PUT  /api/suite/device
 *   body: application/json   { scope: "app"|"suite", device: string }
 *   → 200 application/json   body: DeviceInfo
 *
 * Usage
 * ─────
 * ```ts
 * import { useDeviceInfo, createApiDeviceConfig } from '@pdomain/pdomain-ui/stores';
 * import { ComputeTargetPanel } from '@pdomain/pdomain-ui/shell';
 *
 * const deviceApi = createApiDeviceConfig();
 * const { info, setDevice } = useDeviceInfo(deviceApi);
 * ```
 */

import type { DeviceInfo, DevicePutBody } from './types.js';

export interface ApiDeviceOptions {
  /** Defaults to `'/api/suite/device'`. */
  deviceUrl?: string;
}

/**
 * Create the fetchDevice/putDevice pair backed by the pdomain-ops
 * `/api/suite/device` REST endpoint.
 */
export function createApiDeviceConfig(opts: ApiDeviceOptions = {}): {
  fetchDevice: () => Promise<DeviceInfo>;
  putDevice: (body: DevicePutBody) => Promise<DeviceInfo>;
} {
  const deviceUrl = opts.deviceUrl ?? '/api/suite/device';

  return {
    async fetchDevice(): Promise<DeviceInfo> {
      const res = await fetch(deviceUrl);
      if (!res.ok) throw new Error(`GET ${deviceUrl} → ${res.status}`);
      return (await res.json()) as DeviceInfo;
    },

    async putDevice(body: DevicePutBody): Promise<DeviceInfo> {
      const res = await fetch(deviceUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`PUT ${deviceUrl} → ${res.status}`);
      return (await res.json()) as DeviceInfo;
    },
  };
}
