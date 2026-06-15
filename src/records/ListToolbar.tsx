import type { ReactNode } from 'react';
import { cn } from '../primitives/cn.js';

export interface ListToolbarProps {
  search?: ReactNode;
  filters?: ReactNode;
  sort?: ReactNode;
  resultCount?: ReactNode;
  actions?: ReactNode;
  density?: 'compact' | 'comfortable';
  className?: string;
}

export function ListToolbar({
  search,
  filters,
  sort,
  resultCount,
  actions,
  density = 'comfortable',
  className,
}: ListToolbarProps) {
  return (
    <div className={cn('pdui-list-toolbar', className)} role="toolbar" data-density={density}>
      {search ? <div className="pdui-list-toolbar__search">{search}</div> : null}
      {filters ? <div className="pdui-list-toolbar__filters">{filters}</div> : null}
      {sort ? <div className="pdui-list-toolbar__sort">{sort}</div> : null}
      {resultCount ? (
        <div className="pdui-list-toolbar__result-count">{resultCount}</div>
      ) : null}
      <div className="pdui-list-toolbar__spacer" aria-hidden="true" />
      {actions ? <div className="pdui-list-toolbar__actions">{actions}</div> : null}
    </div>
  );
}
