import type { ReactNode } from 'react';

export interface SourceKindOption {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

interface SelectedSourceBase {
  id: string;
  kind: 'file' | 'folder' | 'archive' | 'path' | 'other';
  meta?: ReactNode;
}

export type SelectedSource =
  | (SelectedSourceBase & {
      label: string | number;
      labelText?: string;
    })
  | (SelectedSourceBase & {
      label: ReactNode;
      labelText: string;
    });

export interface DirectoryEntry {
  name: string;
  path: string;
  kind: 'directory' | 'file';
  disabled?: boolean;
}
