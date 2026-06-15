import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SearchField, ShortcutSearchField } from './SearchField.js';

describe('SearchField', () => {
  it('calls onValueChange and clears with Escape', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onClear = vi.fn();
    render(
      <SearchField
        value="abc"
        onValueChange={onValueChange}
        onClear={onClear}
        ariaLabel="Search records"
      />,
    );

    await user.type(screen.getByRole('searchbox', { name: 'Search records' }), 'd');
    await user.keyboard('{Escape}');

    expect(onValueChange).toHaveBeenCalled();
    expect(onClear).toHaveBeenCalledOnce();
  });

  it('renders shortcut button and calls onShortcutClick', async () => {
    const user = userEvent.setup();
    const onShortcutClick = vi.fn();
    render(
      <ShortcutSearchField
        value=""
        onValueChange={() => undefined}
        ariaLabel="Quick search"
        shortcutLabel="Mod K"
        onShortcutClick={onShortcutClick}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Focus search Mod K' }));
    expect(onShortcutClick).toHaveBeenCalledOnce();
  });

  it('focuses the input when the shortcut button is clicked without a callback', async () => {
    const user = userEvent.setup();
    render(
      <ShortcutSearchField
        value=""
        onValueChange={() => undefined}
        ariaLabel="Quick search"
        shortcutLabel="Mod K"
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Focus search Mod K' }));
    expect(screen.getByRole('searchbox', { name: 'Quick search' })).toHaveFocus();
  });
});
