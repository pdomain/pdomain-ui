import { cn } from '../primitives/cn.js';
import type { EmptyStateProps } from './types.js';

export function EmptyState({
  title,
  description,
  icon,
  action,
  tone = 'neutral',
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('pdui-empty-state', className)} data-tone={tone} role="status">
      {icon ? <div className="pdui-empty-state__icon">{icon}</div> : null}
      <div className="pdui-empty-state__body">
        <div className="pdui-empty-state__title">{title}</div>
        {description ? <div className="pdui-empty-state__description">{description}</div> : null}
      </div>
      {action ? <div className="pdui-empty-state__action">{action}</div> : null}
    </div>
  );
}
