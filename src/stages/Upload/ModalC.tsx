/**
 * ModalC — Upload stage desktop right-side sheet.
 *
 * 4-step wizard: Name / Source / Review / Upload.
 * Composed as a Radix Dialog configured as a right-side sheet via the
 * `.dialog--sheet-right` CSS modifier class. All colors are token-based.
 *
 * Props:
 *   - open / onOpenChange — controlled by parent.
 *   - step — currently active step ('name' | 'source' | 'review' | 'upload').
 *   - onStepChange — invoked when user clicks a rail item.
 *   - stepContent — Record<Step, ReactNode>; parent provides per-step body.
 *
 * Left rail:
 *   - Active item: aria-current="step" + accent background.
 *   - Past steps: check icon rendered (token-colored).
 *   - Future steps: step number (disabled-style color).
 *
 * a11y:
 *   - Rail items: role="button", tabIndex=0, aria-current for active.
 *   - Dialog title is always rendered for screen readers.
 *
 * Constraints (pdomain-ui CLAUDE.md):
 *   - No CVA.
 *   - No hex literals — all colors are var(--token).
 *   - No direct lucide-react imports (Check is imported from ../../icons/index.js).
 *   - exactOptionalPropertyTypes — no spread of optional props without conditional.
 */

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '../../primitives/Dialog.js';
import { Check } from '../../icons/index.js';
import {
  UPLOAD_MODAL_C,
  UPLOAD_MODAL_C_RAIL,
  uploadModalCStepTestId,
} from '../../testids/index.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UploadStep = 'name' | 'source' | 'review' | 'upload';

const ORDERED_STEPS: UploadStep[] = ['name', 'source', 'review', 'upload'];

const STEP_LABELS: Record<UploadStep, string> = {
  name: 'Name',
  source: 'Source',
  review: 'Review',
  upload: 'Upload',
};

export interface ModalCProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Controlled active step. */
  step: UploadStep;
  /** Invoked when the user clicks a rail item. */
  onStepChange: (step: UploadStep) => void;
  /** Parent supplies per-step body content. */
  stepContent: Record<UploadStep, React.ReactNode>;
  'data-testid'?: string;
}

// ─── Rail item ────────────────────────────────────────────────────────────────

interface RailItemProps {
  step: UploadStep;
  index: number;
  isCurrent: boolean;
  isPast: boolean;
  onClick: () => void;
}

const RailItem: React.FC<RailItemProps> = ({ step, index, isCurrent, isPast, onClick }) => {
  const isFuture = !isCurrent && !isPast;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Future steps are not navigable — suppress Enter/Space
    if (isFuture) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const handleClick = () => {
    // Future steps are not navigable — suppress click
    if (isFuture) return;
    onClick();
  };

  return (
    <div
      role="button"
      tabIndex={isFuture ? -1 : 0}
      data-step={step}
      data-testid={uploadModalCStepTestId(step)}
      aria-current={isCurrent ? 'step' : undefined}
      aria-disabled={isFuture ? true : undefined}
      className={[
        'modal-c__rail-item',
        isCurrent ? 'modal-c__rail-item--current' : '',
        isPast ? 'modal-c__rail-item--past' : '',
        isFuture ? 'modal-c__rail-item--future' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {/* Step indicator circle */}
      <div
        className={[
          'modal-c__rail-indicator',
          isCurrent ? 'modal-c__rail-indicator--current' : '',
          isPast ? 'modal-c__rail-indicator--past' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-hidden="true"
      >
        {isPast ? <Check size={11} strokeWidth={3} /> : <span>{index + 1}</span>}
      </div>

      {/* Step label */}
      <div className="modal-c__rail-label">
        <span className="modal-c__rail-label-text">{STEP_LABELS[step]}</span>
      </div>
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

export const ModalC: React.FC<ModalCProps> = ({
  open,
  onOpenChange,
  step,
  onStepChange,
  stepContent,
  'data-testid': testId = UPLOAD_MODAL_C,
}) => {
  const currentIndex = ORDERED_STEPS.indexOf(step);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid={testId}
        className="dialog--sheet-right modal-c"
        aria-describedby="modal-c-desc"
      >
        {/* ── Left rail ─────────────────────────────────────────────────── */}
        <nav data-testid={UPLOAD_MODAL_C_RAIL} className="modal-c__rail" aria-label="Upload steps">
          <div className="modal-c__rail-heading" aria-hidden="true">
            New project
          </div>

          {ORDERED_STEPS.map((s, i) => (
            <RailItem
              key={s}
              step={s}
              index={i}
              isCurrent={s === step}
              isPast={i < currentIndex}
              onClick={() => {
                onStepChange(s);
              }}
            />
          ))}
        </nav>

        {/* ── Right content area ────────────────────────────────────────── */}
        <div className="modal-c__content">
          {/* Header */}
          <DialogHeader className="modal-c__content-header">
            <DialogTitle className="modal-c__content-title">{STEP_LABELS[step]}</DialogTitle>
            <DialogClose asChild>
              <button type="button" aria-label="Close" className="modal-c__close">
                ✕
              </button>
            </DialogClose>
          </DialogHeader>

          {/* Accessible description (visually hidden; DialogDescription would suppress Radix warning) */}
          <p id="modal-c-desc" className="sr-only">
            Upload wizard step {currentIndex + 1} of {ORDERED_STEPS.length}: {STEP_LABELS[step]}
          </p>

          {/* Step body — parent-supplied slot */}
          <div className="modal-c__content-body">{stepContent[step]}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

ModalC.displayName = 'ModalC';
