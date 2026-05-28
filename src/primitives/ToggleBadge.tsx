import * as React from 'react';
import { Toggle } from './Toggle.js';

export interface ToggleBadgeProps {
  /** Current on/off state. */
  checked: boolean;
  /** Called with the new boolean state when the user toggles. */
  onCheckedChange: (next: boolean) => void;
  /** Text label rendered adjacent to the mini switch. */
  label: string;
  /** Prevents interaction and dims the control. */
  disabled?: boolean;
  /** Optional testid forwarded to the outer wrapper span. */
  'data-testid'?: string;
}

/**
 * ToggleBadge — mini inline labeled switch for table rows.
 *
 * Composed on top of `Toggle` (Radix Switch under the hood). Renders the
 * switch in compact "badge" mode alongside a monospace uppercase label.
 * Suitable for Scannos rule tables, Hyphen Join threshold rows, and any
 * inline auto-apply toggle scenario.
 *
 * Styling: `.toggle-badge` wrapper; `.toggle--badge` modifier shrinks the
 * switch; label rendered via Toggle's built-in `label` prop.
 */
export function ToggleBadge({
  checked,
  onCheckedChange,
  label,
  disabled,
  'data-testid': testId,
}: ToggleBadgeProps): React.ReactElement {
  return (
    <span className="toggle-badge" {...(testId !== undefined ? { 'data-testid': testId } : {})}>
      {/* WS7: spread disabled only when it is a boolean (not undefined).
          This satisfies exactOptionalPropertyTypes while still allowing
          disabled={false} to explicitly enable the toggle. */}
      <Toggle
        checked={checked}
        onCheckedChange={onCheckedChange}
        label={label}
        className="toggle--badge"
        {...(disabled !== undefined ? { disabled } : {})}
      />
    </span>
  );
}

ToggleBadge.displayName = 'ToggleBadge';
