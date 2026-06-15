import type { ReactNode } from 'react';

export interface SourceKindOption {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface SelectedSource {
  id: string;
  label: ReactNode;
  kind: 'file' | 'folder' | 'archive' | 'path' | 'other';
  meta?: ReactNode;
}

export interface DirectoryEntry {
  name: string;
  path: string;
  kind: 'directory' | 'file';
  disabled?: boolean;
}
