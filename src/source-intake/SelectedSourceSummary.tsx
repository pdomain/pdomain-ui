import * as React from 'react';
import { Button } from '../primitives/Button.js';
import { cn } from '../primitives/cn.js';
import type { SelectedSource } from './types.js';

export interface SelectedSourceSummaryProps {
  sources: readonly SelectedSource[];
  onRemove?(this: void, sourceId: string): void;
  maxVisible?: number;
}

function getTextFromNode(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (Array.isArray(node)) return node.map(getTextFromNode).join('');
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return getTextFromNode(node.props.children);
  }
  return '';
}

function getRemoveLabel(source: SelectedSource) {
  const labelText = getTextFromNode(source.label).trim();
  return labelText === '' ? 'Remove source' : `Remove ${labelText}`;
}

export function SelectedSourceSummary({
  sources,
  onRemove,
  maxVisible,
}: SelectedSourceSummaryProps) {
  const visibleLimit = maxVisible === undefined ? sources.length : Math.max(0, maxVisible);
  const visibleSources = sources.slice(0, visibleLimit);
  const hiddenCount = Math.max(0, sources.length - visibleSources.length);

  return (
    <div className={cn('pdui-selected-source-summary')}>
      {visibleSources.map((source) => (
        <div key={source.id} className="pdui-selected-source-summary__item">
          <div className="pdui-selected-source-summary__body">
            <div className="pdui-selected-source-summary__label">{source.label}</div>
            <div className="pdui-selected-source-summary__details">
              <span className="pdui-selected-source-summary__kind">{source.kind}</span>
              {source.meta ? (
                <span className="pdui-selected-source-summary__meta">{source.meta}</span>
              ) : null}
            </div>
          </div>
          {onRemove ? (
            <Button
              className="pdui-selected-source-summary__remove"
              type="button"
              variant="ghost"
              size="sm"
              aria-label={getRemoveLabel(source)}
              onClick={() => onRemove(source.id)}
            >
              Remove
            </Button>
          ) : null}
        </div>
      ))}
      {hiddenCount > 0 ? (
        <div className="pdui-selected-source-summary__more">{hiddenCount} more selected</div>
      ) : null}
    </div>
  );
}
