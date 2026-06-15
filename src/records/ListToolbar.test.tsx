import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ListToolbar } from './ListToolbar.js';
import { SortSelect } from './SortSelect.js';

describe('ListToolbar and SortSelect', () => {
  it('lays out named toolbar regions', () => {
    render(
      <ListToolbar
        search={<input aria-label="Search" />}
        filters={<button type="button">All</button>}
        resultCount={<span>2 results</span>}
        actions={<button type="button">New</button>}
      />,
    );

    expect(screen.getByRole('toolbar')).toHaveTextContent('2 results');
    expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument();
  });

  it('changes sort value', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <SortSelect
        ariaLabel="Sort projects"
        value="name"
        onValueChange={onValueChange}
        options={[
          { value: 'name', label: 'Name' },
          { value: 'date', label: 'Date' },
        ]}
      />,
    );

    await user.selectOptions(screen.getByLabelText('Sort projects'), 'date');
    expect(onValueChange).toHaveBeenCalledWith('date');
  });
});
