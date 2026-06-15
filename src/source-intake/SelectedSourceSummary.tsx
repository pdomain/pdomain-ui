import { Button } from '../primitives/Button.js';
import { cn } from '../primitives/cn.js';
import type { SelectedSource } from './types.js';

export interface SelectedSourceSummaryProps {
  sources: readonly SelectedSource[];
  onRemove?(this: void, sourceId: string): void;
  maxVisible?: number;
}

function getRemoveLabel(source: SelectedSource) {
  if (source.labelText !== undefined) return `Remove ${source.labelText}`;
  if (typeof source.label === 'string' || typeof source.label === 'number') {
    return `Remove ${source.label}`;
  }
  throw new Error('SelectedSource.labelText is required when label is not text.');
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
