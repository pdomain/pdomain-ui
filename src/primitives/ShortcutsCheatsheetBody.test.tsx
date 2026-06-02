/**
 * ShortcutsCheatsheetBody tests — the content-only cheatsheet for the dock.
 * Same grouped-by-`group` rendering as ShortcutsCheatsheet, minus the Dialog.
 */
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ShortcutsCheatsheetBody } from './ShortcutsCheatsheetBody.js';
import type { ShortcutBinding } from '../hooks/useShortcuts.js';

const bindings: ShortcutBinding[] = [
  { keys: 'g', label: 'Go to page', group: 'Navigation', handler: () => undefined },
  { keys: 's', label: 'Save', group: 'Editing', handler: () => undefined },
  { keys: '?', label: 'Help', handler: () => undefined },
];

describe('ShortcutsCheatsheetBody', () => {
  it('renders the body wrapper testid', () => {
    render(<ShortcutsCheatsheetBody bindings={bindings} />);
    expect(screen.getByTestId('shortcuts-cheatsheet-body')).toBeTruthy();
  });

  it('renders each binding label', () => {
    render(<ShortcutsCheatsheetBody bindings={bindings} />);
    expect(screen.getByText('Go to page')).toBeTruthy();
    expect(screen.getByText('Save')).toBeTruthy();
    expect(screen.getByText('Help')).toBeTruthy();
  });

  it('groups by the group field with ungrouped under General', () => {
    render(<ShortcutsCheatsheetBody bindings={bindings} />);
    expect(screen.getByText('Navigation')).toBeTruthy();
    expect(screen.getByText('Editing')).toBeTruthy();
    expect(screen.getByText('General')).toBeTruthy();
  });
});
