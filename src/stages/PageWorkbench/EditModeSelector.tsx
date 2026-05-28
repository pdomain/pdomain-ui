import * as React from 'react';
import { Segmented } from '../../primitives/Segmented.js';
import type { SegmentedOption } from '../../primitives/Segmented.js';
import { Icon } from '../../icons/Icon.js';

// ─── Types ───────────────────────────────────────────────────────────────────

/**
 * The PageWorkbench overlay edit modes surfaced by EditModeSelector.
 * Matches `OverlayMode` in ArtifactViewer (including 'words' for word-bbox overlay).
 */
export type EditMode = 'view' | 'split' | 'illust' | 'rotate' | 'words';

export interface EditModeSelectorProps {
  /** Currently active mode (controlled). */
  mode: EditMode;
  /** Called with the newly selected mode when the user activates a segment. */
  onModeChange: (mode: EditMode) => void;
  /** Optional testid forwarded to the root element. */
  'data-testid'?: string;
}

// ─── Option definitions ───────────────────────────────────────────────────────

const OPTIONS: SegmentedOption[] = [
  { value: 'view', label: 'View', icon: <Icon name="eye" size={12} /> },
  { value: 'split', label: 'Split', icon: <Icon name="grip" size={12} /> },
  { value: 'illust', label: 'Illustration', icon: <Icon name="image" size={12} /> },
  { value: 'rotate', label: 'Rotate', icon: <Icon name="arrowR" size={12} /> },
];

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * EditModeSelector — PageWorkbench segmented mode picker (Phase 2 M2).
 *
 * Thin wrapper over the `Segmented` primitive that enumerates the four
 * PageWorkbench overlay edit modes: View, Split, Illustration, and Rotate.
 * Each option carries a design-system icon (Eye / GripVertical / Image / ArrowRight).
 *
 * Controlled: callers must supply `mode` and `onModeChange`.
 *
 * Inherits ARIA `role="group"` with child `role="radio"` semantics and
 * arrow-key navigation from `Segmented`. The outer `ref` attaches to the
 * root wrapper span; ARIA semantics live on the inner `Segmented` track.
 */
export const EditModeSelector = React.forwardRef<HTMLSpanElement, EditModeSelectorProps>(
  ({ mode, onModeChange, ...rest }, ref) => {
    const handleChange = React.useCallback(
      (val: string) => {
        onModeChange(val as EditMode);
      },
      [onModeChange],
    );

    const testidProps = 'data-testid' in rest ? { 'data-testid': rest['data-testid'] } : {};

    return (
      <span ref={ref} className="edit-mode-selector" {...testidProps}>
        <Segmented options={OPTIONS} value={mode} onChange={handleChange} size="sm" />
      </span>
    );
  },
);

EditModeSelector.displayName = 'EditModeSelector';
