/**
 * LineBlockCard — cards-mode line block (INTERNAL).
 *
 * Renders a card containing a line's words as a grid of WordCard tiles.
 * Falls back to displaying `line.text` when `line.words` is absent.
 *
 * NOT exported from the PageWorkbench barrel — internal to OcrTextPanel.
 */
import * as React from 'react';
import { WordCard } from './WordCard.js';
import type { OcrLine } from './OcrTextPanel.js';

export interface LineBlockCardProps {
  line: OcrLine;
  onWordEdit?: (wordId: string) => void;
}

/**
 * LineBlockCard — cards-mode view of a single OCR line.
 */
export function LineBlockCard({ line, onWordEdit }: LineBlockCardProps): React.ReactElement {
  const hasWords = line.words != null && line.words.length > 0;

  return (
    <div
      className="line-block-card"
      style={{
        borderRadius: 9,
        border: '1px solid var(--border-1)',
        background: 'var(--bg-surface)',
        overflow: 'hidden',
      }}
    >
      {/* Line header */}
      <div
        className="line-block-card__header"
        style={{
          padding: '6px 12px',
          borderBottom: '1px solid var(--border-1)',
          fontSize: 11,
          color: 'var(--ink-3)',
          background: 'var(--bg-raised)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span
          style={{
            padding: '1px 7px',
            borderRadius: 99,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-2)',
            fontSize: 10.5,
            fontWeight: 600,
            color: 'var(--ink-2)',
          }}
        >
          {line.id}
        </span>
        {line.blockId != null && (
          <span style={{ color: 'var(--ink-4)', fontSize: 10.5 }}>{line.blockId}</span>
        )}
      </div>

      {/* Content */}
      {hasWords ? (
        <div
          style={{
            padding: 10,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
            gap: 8,
          }}
        >
          {line.words!.map((word) => (
            <WordCard
              key={word.id}
              word={word}
              {...(onWordEdit != null
                ? {
                    onClick: () => {
                      onWordEdit(word.id);
                    },
                  }
                : {})}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            padding: '8px 12px',
            fontSize: 13,
            color: 'var(--ink-2)',
            fontFamily: 'var(--book-font, Georgia, serif)',
          }}
        >
          {line.text}
        </div>
      )}
    </div>
  );
}
