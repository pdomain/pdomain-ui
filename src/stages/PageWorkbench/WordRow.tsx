/**
 * WordRow — compact inline word span (INTERNAL).
 *
 * Renders word text with a ConfPip at the end and optional flag badges
 * in a compact horizontal row layout. Clicking fires `onClick`.
 *
 * NOT exported from the PageWorkbench barrel — internal to OcrTextPanel.
 */
import * as React from 'react';
import { Badge } from '../../primitives/index.js';
import { ConfPip } from './ConfPip.js';
import type { OcrWord } from './OcrTextPanel.js';

export interface WordRowProps {
  word: OcrWord;
  onClick?: () => void;
}

/**
 * WordRow — row-density word entry for OCR text review.
 */
export function WordRow({ word, onClick }: WordRowProps): React.ReactElement {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      className="word-row"
      role={onClick != null ? 'button' : undefined}
      tabIndex={onClick != null ? 0 : undefined}
      aria-label={onClick != null ? `Edit word: ${word.text}` : undefined}
      onClick={onClick}
      onKeyDown={onClick != null ? handleKeyDown : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '4px 8px',
        borderRadius: 5,
        cursor: onClick != null ? 'pointer' : undefined,
      }}
    >
      {/* Word text */}
      <span
        style={{
          flex: 1,
          fontSize: 13,
          color: 'var(--ink-1)',
          fontFamily: 'var(--book-font, Georgia, serif)',
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {word.text}
      </span>

      {/* Flag badges (compact) */}
      {word.flags != null && word.flags.length > 0 && (
        <span style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
          {word.flags.map((flag) => (
            <Badge key={flag} tone="neutral">
              {flag}
            </Badge>
          ))}
        </span>
      )}

      {/* Confidence pip at far right */}
      <ConfPip confidence={word.confidence} />
    </div>
  );
}
