/**
 * BulkBar — Source-stage sticky bottom bulk action bar.
 *
 * Appears when items are selected; shows selected count, optional Clear button,
 * role-assignment actions (Page / Cover / Back / Blank / Duplicate), and a
 * danger Remove action.
 *
 * Sticky-bottom positioning is via the `.bulk-action-bar` CSS class; consumers
 * may override via their own layout if needed.
 */
import * as React from 'react';
import { Button } from '../../primitives/Button.js';

export type BulkAction = 'page' | 'cover' | 'back' | 'blank' | 'duplicate' | 'remove';

export interface BulkBarProps {
  /** Number of currently selected items. */
  selectedCount: number;
  /** Fired when the user clicks a role-action or Remove button. */
  onAction: (action: BulkAction) => void;
  /** Optional clear-selection callback — renders a "Clear" button on the left when present. */
  onClear?: () => void;
  'data-testid'?: string;
}

export const BulkBar = React.forwardRef<HTMLDivElement, BulkBarProps>(function BulkBar(
  { selectedCount, onAction, onClear, 'data-testid': testId },
  ref,
) {
  return (
    <div ref={ref} className="bulk-action-bar" data-testid={testId}>
      <span className="bulk-action-bar__count">{selectedCount} selected</span>
      {onClear !== undefined ? (
        <Button variant="ghost" onClick={onClear} data-testid="bulk-bar-clear">
          Clear
        </Button>
      ) : null}
      <div className="bulk-action-bar__actions" aria-label="Bulk actions">
        <Button onClick={() => onAction('page')}>Page</Button>
        <Button onClick={() => onAction('cover')}>Cover</Button>
        <Button onClick={() => onAction('back')}>Back</Button>
        <Button onClick={() => onAction('blank')}>Blank</Button>
        <Button onClick={() => onAction('duplicate')}>Duplicate</Button>
        <Button variant="danger" onClick={() => onAction('remove')}>
          Remove
        </Button>
      </div>
    </div>
  );
});

BulkBar.displayName = 'BulkBar';
