/**
 * ComputeTargetPanel — device picker for compute-target selection.
 *
 * Local-deploy-mode-gated: returns null when `info.mode !== "local"`.
 * Renders the available device list (CPU + GPU VRAM), a "force CPU" shortcut,
 * the current device and its effective source, and a CUDA install docs link.
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
  /** Optional CSS class. */
  className?: string;
}

/**
 * Presentational panel: device list, VRAM, current device, effective source.
 * Hidden when `info.mode !== "local"`.
 */
export function ComputeTargetPanel({
  info,
  onSelect,
  className,
}: ComputeTargetPanelProps): React.ReactElement | null {
  if (!info || info.mode !== 'local') return null;

  const current = info.current ?? null;
  const effectiveSource = info.effective_source ?? 'auto';

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

      {/* Device list */}
      <ul
        role="listbox"
        aria-label="Select compute device"
        style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}
      >
        {info.available.map((device) => {
          const isCurrent = device.id === current;
          return (
            <li key={device.id}>
              <button
                data-testid={COMPUTE_DEVICE_OPTION(device.id)}
                role="option"
                aria-selected={isCurrent}
                aria-current={isCurrent ? 'true' : undefined}
                onClick={() => onSelect(device.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 'var(--space-1)',
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-sm)',
                  border: isCurrent
                    ? '1px solid var(--accent)'
                    : '1px solid var(--border)',
                  background: isCurrent ? 'var(--accent-subtle)' : 'var(--surface)',
                  color: 'var(--fg)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontWeight: isCurrent ? 'var(--font-semibold)' : undefined }}>
                  {device.label}
                </span>
                {device.vram_total_mb != null && (
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-subtle)' }}>
                    {device.vram_total_mb} MB VRAM
                    {device.vram_free_mb != null && ` (${device.vram_free_mb} MB free)`}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Current device + effective source */}
      <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--fg-subtle)' }}>
        Active:{' '}
        <strong style={{ color: 'var(--fg)' }}>{current ?? 'auto'}</strong>
        {effectiveSource && (
          <span> (via {effectiveSource})</span>
        )}
      </p>

      {/* Force-CPU shortcut */}
      {current !== 'cpu' && (
        <button
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

      {/* CUDA install link */}
      <a
        href="https://pytorch.org/get-started/locally/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)' }}
      >
        Speed this up → CUDA install docs
      </a>
    </section>
  );
}
