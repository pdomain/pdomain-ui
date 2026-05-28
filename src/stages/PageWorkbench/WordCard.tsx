/**
 * WordCard — clickable word tile (INTERNAL).
 *
 * Renders a word's text with a ConfPip confidence indicator and optional
 * flag badges. Clicking the card fires `onClick`.
 *
 * NOT exported from the PageWorkbench barrel — internal to OcrTextPanel.
 */
import * as React from 'react';
import { Badge } from '../../primitives/index.js';
import { ConfPip } from './ConfPip.js';
import type { OcrWord } from './OcrTextPanel.js';

export interface WordCardProps {
  word: OcrWord;
  onClick?: () => void;
}

/**
 * WordCard — card-density word tile for OCR text review.
 */
export function WordCard({ word, onClick }: WordCardProps): React.ReactElement {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      className="word-card"
      role={onClick != null ? 'button' : undefined}
      tabIndex={onClick != null ? 0 : undefined}
      aria-label={onClick != null ? `Edit word: ${word.text}` : undefined}
      onClick={onClick}
      onKeyDown={onClick != null ? handleKeyDown : undefined}
      style={{
        position: 'relative',
        borderRadius: 7,
        border: '1px solid var(--border-1)',
        background: 'var(--bg-surface)',
        padding: 7,
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        cursor: onClick != null ? 'pointer' : undefined,
      }}
    >
      {/* Header row: word id + confidence pip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <ConfPip confidence={word.confidence} />
      </div>

      {/* Word text */}
      <div
        style={{
          borderRadius: 4,
          padding: '4px 6px',
          background: 'var(--bg-raised)',
          border: '1px solid var(--border-2)',
          fontSize: 13,
          color: 'var(--ink-1)',
          textAlign: 'center',
          fontFamily: 'var(--book-font, Georgia, serif)',
          minHeight: 24,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        {word.text}
      </div>

      {/* Flag badges */}
      {word.flags != null && word.flags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {word.flags.map((flag) => (
            <Badge key={flag} tone="neutral">
              {flag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
