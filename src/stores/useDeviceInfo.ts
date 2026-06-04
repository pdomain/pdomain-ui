/**
 * useDeviceInfo — stub-friendly hook for compute-device info and selection.
 *
 * Fetches the current device state from `/api/suite/device` on mount and
 * exposes a `setDevice` action for device-scope changes.
 *
 * The hook follows the stub-friendly pattern of `useLongJob`/`useStageCall`:
 * all side-effects are injected via the options object so tests can supply
 * fakes without mocking `fetch`.
 *
 * HTTP contract:
 *   GET /api/suite/device  → DeviceInfo
 *   PUT /api/suite/device  body: DevicePutBody → DeviceInfo
 */
import * as React from 'react';
import type { DeviceInfo, DevicePutBody } from '../shell/types.js';

export interface UseDeviceInfoOptions {
  /** Async function that fetches device info. */
  fetchDevice?: () => Promise<DeviceInfo>;
  /** Async function that updates the device preference. */
  putDevice?: (body: DevicePutBody) => Promise<DeviceInfo>;
}

export interface DeviceInfoState {
  info: DeviceInfo | null;
  loading: boolean;
  error: unknown;
  /** Set the preferred device. */
  setDevice: (scope: 'app' | 'suite', device: string) => Promise<void>;
}

export function useDeviceInfo(options: UseDeviceInfoOptions = {}): DeviceInfoState {
  const { fetchDevice, putDevice } = options;

  const [info, setInfo] = React.useState<DeviceInfo | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<unknown>(null);

  // Use a ref so the fetch is only triggered once on mount, and is not
  // re-triggered when the caller passes a new function reference each render.
  const fetchDeviceRef = React.useRef(fetchDevice);
  fetchDeviceRef.current = fetchDevice;

  const putDeviceRef = React.useRef(putDevice);
  putDeviceRef.current = putDevice;

  React.useEffect(() => {
    const fn = fetchDeviceRef.current;
    if (!fn) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fn()
      .then((data) => {
        if (!cancelled) {
          setInfo(data);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally mount-only; fetchDevice updates via ref

  const setDevice = React.useCallback(
    async (scope: 'app' | 'suite', device: string) => {
      const fn = putDeviceRef.current;
      if (!fn) return;
      try {
        const updated = await fn({ scope, device });
        setInfo(updated);
      } catch (err: unknown) {
        setError(err);
      }
    },
    [],
  );

  return { info, loading, error, setDevice };
}
