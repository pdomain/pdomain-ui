import { Button } from '../primitives/Button.js';
import { cn } from '../primitives/cn.js';
import type { SourceKindOption } from './types.js';

export interface SourceKindSelectorProps {
  kinds: readonly SourceKindOption[];
  activeKind: string;
  onActiveKindChange(this: void, kind: string): void;
  ariaLabel: string;
}

export function SourceKindSelector({
  kinds,
  activeKind,
  onActiveKindChange,
  ariaLabel,
}: SourceKindSelectorProps) {
  return (
    <div className={cn('pdui-source-kind-selector')} role="group" aria-label={ariaLabel}>
      {kinds.map((kind) => (
        <Button
          key={kind.id}
          className="pdui-source-kind-selector__button"
          type="button"
          variant="outline"
          aria-pressed={kind.id === activeKind}
          disabled={kind.disabled}
          onClick={() => onActiveKindChange(kind.id)}
        >
          {kind.icon ? (
            <span className="pdui-source-kind-selector__icon" aria-hidden="true">
              {kind.icon}
            </span>
          ) : null}
          <span className="pdui-source-kind-selector__text">
            <span className="pdui-source-kind-selector__label">{kind.label}</span>
            {kind.description ? (
              <span className="pdui-source-kind-selector__description">{kind.description}</span>
            ) : null}
          </span>
        </Button>
      ))}
    </div>
  );
}
