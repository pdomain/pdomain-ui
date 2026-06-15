import type { ReactNode } from 'react';

export type RecordDensity = 'compact' | 'comfortable';
export type RecordTone = 'neutral' | 'info' | 'warning' | 'danger';

export interface RecordSelectionState<T> {
  selectedKeys: ReadonlySet<string>;
  onSelectedKeysChange?: (keys: ReadonlySet<string>) => void;
  isItemDisabled?: (item: T) => boolean;
}

export interface EmptyStateProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  tone?: RecordTone;
  className?: string;
}
