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
        sort={
          <select aria-label="Sort">
            <option>Name</option>
          </select>
        }
        resultCount={<span>2 results</span>}
        actions={<button type="button">New</button>}
      />,
    );

    const toolbar = screen.getByRole('toolbar');

    expect(toolbar).toHaveClass('pdui-list-toolbar');
    expect(toolbar.querySelector('.pdui-list-toolbar__search')).toContainElement(
      screen.getByLabelText('Search'),
    );
    expect(toolbar.querySelector('.pdui-list-toolbar__filters')).toContainElement(
      screen.getByRole('button', { name: 'All' }),
    );
    expect(toolbar.querySelector('.pdui-list-toolbar__sort')).toContainElement(
      screen.getByLabelText('Sort'),
    );
    expect(toolbar.querySelector('.pdui-list-toolbar__result-count')).toHaveTextContent(
      '2 results',
    );
    expect(toolbar.querySelector('.pdui-list-toolbar__actions')).toContainElement(
      screen.getByRole('button', { name: 'New' }),
    );
    expect(toolbar).toHaveTextContent('2 results');
    expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument();
  });

  it('marks compact density on the toolbar root', () => {
    render(<ListToolbar density="compact" search={<input aria-label="Search" />} />);

    expect(screen.getByRole('toolbar')).toHaveAttribute('data-density', 'compact');
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
