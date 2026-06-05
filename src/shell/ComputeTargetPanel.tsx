/**
 * ComputeTargetPanel — device picker for compute-target selection.
 *
 * Local-deploy-mode-gated: returns null when `info.mode !== "local"`.
 * Renders the available device list (CPU + GPU VRAM), unavailable NVIDIA
 * hardware, persistent CPU override controls, and a CUDA setup guide link.
 *
 * No hex colors — all styling uses `var(--token)` references.
 */
import * as React from 'react';
import type { DeviceInfo } from './types.js';
import { COMPUTE_TARGET_PANEL, COMPUTE_DEVICE_OPTION } from '../testids/index.js';

export interface ComputeTargetPanelProps {
  /** Device info from `useDeviceInfo`. Null/undefined renders nothing. */
  info: DeviceInfo | null | undefined;
  /** Called with the device id when the user selects a device. */
  onSelect: (deviceId: string) => void;
  /** Clears a persisted compute target override for a scope. */
  onClear?: (scope: 'app' | 'suite') => void;
  /** Override URL for CUDA setup guidance. */
  cudaDocsUrl?: string;
  /** Optional CSS class. */
  className?: string;
}

const DEFAULT_CUDA_DOCS_URL = 'https://pytorch.org/get-started/locally/';

function isUnavailableNvidia(device: DeviceInfo['available'][number]): boolean {
  return device.available === false && device.kind === 'nvidia';
}

function isUsableCuda(device: DeviceInfo['available'][number]): boolean {
  return device.available !== false && (device.kind === 'cuda' || device.id.startsWith('cuda:'));
}

/**
 * Presentational panel: device list, VRAM, current device, effective source.
 * Hidden when `info.mode !== "local"`.
 */
export function ComputeTargetPanel({
  info,
  onSelect,
  onClear,
  cudaDocsUrl,
  className,
}: ComputeTargetPanelProps): React.ReactElement | null {
  if (!info || info.mode !== 'local') return null;

  const current = info.current ?? null;
  const effectiveSource = info.effective_source ?? 'auto';
  const unavailableNvidiaDevices = info.available.filter(isUnavailableNvidia);
  const showCudaGuide = info.available.some(isUsableCuda) || unavailableNvidiaDevices.length > 0;
  const cudaGuideUrl = cudaDocsUrl ?? info.cuda_docs_url ?? DEFAULT_CUDA_DOCS_URL;
  const cudaGuideIsExternal = /^https?:\/\//i.test(cudaGuideUrl);
  const isAppForcedCpu = current === 'cpu' && effectiveSource === 'app';

  return (
    <section
      data-testid={COMPUTE_TARGET_PANEL}
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        padding: 'var(--space-4)',
        color: 'var(--fg)',
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--fg-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Compute target
      </h3>

      {/* Device list — native radio group for valid ARIA ownership */}
      <fieldset
        style={{
          border: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}
      >
        <legend style={{ display: 'none' }}>Select compute device</legend>
        {info.available.map((device) => {
          const isCurrent = device.id === current;
          if (isUnavailableNvidia(device)) {
            return (
              <div
                key={device.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-1)',
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--fg)',
                }}
              >
                <span style={{ fontWeight: 'var(--font-semibold)' }}>{device.label}</span>
                {device.reason && (
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-subtle)' }}>
                    {device.reason}
                  </span>
                )}
              </div>
            );
          }

          return (
            <label
              key={device.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-1)',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-sm)',
                border: isCurrent ? '1px solid var(--accent)' : '1px solid var(--border)',
                background: isCurrent ? 'var(--accent-subtle)' : 'var(--surface)',
                color: 'var(--fg)',
                cursor: 'pointer',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <input
                  type="radio"
                  name="compute-device"
                  data-testid={COMPUTE_DEVICE_OPTION(device.id)}
                  value={device.id}
                  checked={isCurrent}
                  onChange={() => onSelect(device.id)}
                />
                <span style={{ fontWeight: isCurrent ? 'var(--font-semibold)' : undefined }}>
                  {device.label}
                </span>
              </span>
              {device.vram_total_mb != null && (
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-subtle)' }}>
                  {device.vram_total_mb} MB VRAM
                  {device.vram_free_mb != null && ` (${device.vram_free_mb} MB free)`}
                </span>
              )}
            </label>
          );
        })}
      </fieldset>

      {/* Current device + effective source */}
      <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--fg-subtle)' }}>
        Active: <strong style={{ color: 'var(--fg)' }}>{current ?? 'auto'}</strong>
        {effectiveSource && <span> (via {effectiveSource})</span>}
      </p>

      {isAppForcedCpu && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-subtle)' }}>
            CPU forced for this app
          </span>
          {onClear && (
            <button
              type="button"
              onClick={() => onClear('app')}
              style={{
                padding: 'var(--space-1) var(--space-2)',
                fontSize: 'var(--text-xs)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--surface)',
                color: 'var(--fg-muted)',
                cursor: 'pointer',
              }}
            >
              Reset to auto
            </button>
          )}
        </div>
      )}

      {/* Force-CPU shortcut — only when a non-CPU device is currently selected */}
      {current !== null && current !== 'cpu' && (
        <button
          type="button"
          onClick={() => onSelect('cpu')}
          style={{
            padding: 'var(--space-1) var(--space-2)',
            fontSize: 'var(--text-xs)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xs)',
            background: 'var(--surface)',
            color: 'var(--fg-muted)',
            cursor: 'pointer',
            alignSelf: 'flex-start',
          }}
        >
          Force CPU
        </button>
      )}

      {showCudaGuide && (
        <a
          href={cudaGuideUrl}
          target={cudaGuideIsExternal ? '_blank' : undefined}
          rel={cudaGuideIsExternal ? 'noopener noreferrer' : undefined}
          style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)' }}
        >
          CUDA setup guide
        </a>
      )}
    </section>
  );
}
