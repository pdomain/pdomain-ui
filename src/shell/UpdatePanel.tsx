/**
 * UpdatePanel — in-app update control.
 *
 * Shows current vs. latest version, changelog link, Update & Restart button,
 * and a policy selector (notify / auto / manual).
 *
 * Also exports a tiny `<UpdateBadge available />` for the AppShell header.
 *
 * No hex colors — all styling uses `var(--token)` references.
 */
import * as React from 'react';
import type { UpdateInfo, UpdatePolicy } from './types.js';
import { UPDATE_PANEL, UPDATE_BADGE, UPDATE_APPLY_BUTTON } from '../testids/index.js';

export interface UpdatePanelProps {
  /** Info from `useUpdateCheck`. Null renders the panel in "no info" state. */
  info: UpdateInfo | null | undefined;
  /** Current policy value. */
  policy: UpdatePolicy;
  /** Called when the user changes the policy selector. */
  onPolicyChange: (policy: UpdatePolicy) => void;
  /** Called when the user clicks "Update & Restart". */
  onApply: () => void;
  /** Optional CSS class. */
  className?: string;
}

/**
 * Presentational update panel: current/latest versions, changelog link,
 * Update & Restart button (visible only when `update_available`), and
 * the policy selector.
 */
export function UpdatePanel({
  info,
  policy,
  onPolicyChange,
  onApply,
  className,
}: UpdatePanelProps): React.ReactElement {
  return (
    <section
      data-testid={UPDATE_PANEL}
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
        Updates
      </h3>

      {/* Version info */}
      {info ? (
        <dl
          style={{
            margin: 0,
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: 'var(--space-1) var(--space-3)',
            fontSize: 'var(--text-sm)',
          }}
        >
          <dt style={{ color: 'var(--fg-muted)' }}>Current</dt>
          <dd style={{ margin: 0 }}>{info.current}</dd>
          <dt style={{ color: 'var(--fg-muted)' }}>Latest</dt>
          <dd style={{ margin: 0 }}>{info.latest}</dd>
        </dl>
      ) : (
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--fg-subtle)' }}>
          No update info available.
        </p>
      )}

      {/* Changelog link */}
      {info?.changelog_url && (
        <a
          href={info.changelog_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 'var(--text-sm)', color: 'var(--accent)' }}
        >
          Changelog
        </a>
      )}

      {/* Update & Restart button */}
      {info?.update_available && (
        <button
          data-testid={UPDATE_APPLY_BUTTON}
          onClick={onApply}
          style={{
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: 'var(--accent)',
            color: 'var(--accent-ink)',
            fontWeight: 'var(--font-semibold)',
            fontSize: 'var(--text-sm)',
            cursor: 'pointer',
            alignSelf: 'flex-start',
          }}
        >
          Update &amp; Restart
        </button>
      )}

      {/* Policy selector */}
      <label
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-1)',
          fontSize: 'var(--text-xs)',
          color: 'var(--fg-muted)',
        }}
      >
        Update policy
        <select
          value={policy}
          onChange={(e) => onPolicyChange(e.target.value as UpdatePolicy)}
          style={{
            padding: 'var(--space-1) var(--space-2)',
            borderRadius: 'var(--radius-xs)',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--fg)',
            fontSize: 'var(--text-sm)',
          }}
        >
          <option value="notify">Notify (default)</option>
          <option value="auto">Auto-update on launch</option>
          <option value="manual">Manual only</option>
        </select>
      </label>
    </section>
  );
}

export interface UpdateBadgeProps {
  /** Whether an update is available. False renders nothing. */
  available: boolean;
  /** Optional CSS class. */
  className?: string;
}

/**
 * Tiny badge rendered in the AppShell header when an update is available.
 * Returns null when `available` is false.
 */
export function UpdateBadge({ available, className }: UpdateBadgeProps): React.ReactElement | null {
  if (!available) return null;
  return (
    <span
      data-testid={UPDATE_BADGE}
      className={className}
      aria-label="Update available"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0 var(--space-2)',
        borderRadius: 'var(--radius-full)',
        background: 'var(--accent)',
        color: 'var(--accent-ink)',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--font-semibold)',
        lineHeight: '1.5',
        userSelect: 'none',
      }}
    >
      Update
    </span>
  );
}
