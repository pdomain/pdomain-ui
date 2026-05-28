/**
 * LineBlockRow — rows-mode line block (INTERNAL).
 *
 * Renders a card with each word as a compact horizontal WordRow entry.
 * Falls back to displaying `line.text` when `line.words` is absent.
 *
 * NOT exported from the PageWorkbench barrel — internal to OcrTextPanel.
 */
import * as React from 'react';
import { WordRow } from './WordRow.js';
import type { OcrLine } from './OcrTextPanel.js';

export interface LineBlockRowProps {
  line: OcrLine;
  onWordEdit?: (wordId: string) => void;
}

/**
 * LineBlockRow — rows-mode view of a single OCR line.
 */
export function LineBlockRow({ line, onWordEdit }: LineBlockRowProps): React.ReactElement {
  const hasWords = line.words != null && line.words.length > 0;

  return (
    <div
      className="line-block-row"
      style={{
        borderRadius: 9,
        border: '1px solid var(--border-1)',
        background: 'var(--bg-surface)',
        overflow: 'hidden',
      }}
    >
      {/* Line header */}
      <div
        className="line-block-row__header"
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
        <div style={{ padding: 4 }}>
          {line.words!.map((word) => (
            <WordRow
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
