/**
 * TextReviewPane — collapsible bottom text pane for PageWorkbench.
 *
 * Phase 2 M2 — spec §6.2 PageWorkbench row, line 348.
 *
 * Shows extracted / OCR text when open (target total height 280px);
 * collapses to a 44px header strip when closed.  All open/closed sizing
 * is done in CSS — no JS-based measurement.
 */

import React from 'react';
import { Icon } from '../../icons/Icon.js';
import { TEXT_REVIEW_PANE, TEXT_REVIEW_PANE_TOGGLE } from '../../testids/index.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TextReviewPaneProps {
  /** Extracted / OCR text content.
   *  When a string, rendered inside a `<pre>` for whitespace preservation.
   *  When a ReactNode, rendered as-is for rich / formatted content. */
  text: string | React.ReactNode;

  /** Whether the pane is currently open (content visible). */
  open: boolean;

  /** Called when the user toggles open/closed. */
  onOpenChange: (open: boolean) => void;

  /** Header label shown in the 44px strip. Defaults to "Text review". */
  title?: string;

  /** Forwarded to the outer `<section>` element. */
  'data-testid'?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Bottom-anchored collapsible pane for displaying OCR/extracted text.
 *
 * @example
 *   <TextReviewPane text={ocrText} open={open} onOpenChange={setOpen} />
 *
 * @example
 *   <TextReviewPane
 *     text={<FormattedText words={words} />}
 *     open={open}
 *     onOpenChange={setOpen}
 *     title="OCR output"
 *   />
 */
export function TextReviewPane({
  text,
  open,
  onOpenChange,
  title,
  'data-testid': testId,
}: TextReviewPaneProps): React.ReactElement {
  const label = title ?? 'Text review';
  const outerTestId = testId ?? TEXT_REVIEW_PANE;
  // Use React.useId() to generate a unique id per instance, avoiding duplicate
  // id="text-review-content" when multiple TextReviewPane instances exist on a page.
  const contentId = React.useId();

  return (
    <section className="text-review-pane" data-open={open} data-testid={outerTestId}>
      <header className="text-review-pane__header">
        <button
          type="button"
          className="text-review-pane__toggle"
          onClick={() => {
            onOpenChange(!open);
          }}
          aria-expanded={open}
          aria-controls={contentId}
          data-testid={TEXT_REVIEW_PANE_TOGGLE}
        >
          <Icon name={open ? 'chevD' : 'chevU'} size={16} />
          <span className="text-review-pane__title">{label}</span>
        </button>
      </header>

      <div
        id={contentId}
        className="text-review-pane__content"
        {...(!open ? { hidden: true } : {})}
      >
        {typeof text === 'string' ? <pre className="text-review-pane__pre">{text}</pre> : text}
      </div>
    </section>
  );
}
