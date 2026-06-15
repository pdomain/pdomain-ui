import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DataTable } from './DataTable.js';

interface PageRow {
  id: string;
  name: string;
  status: string;
}

const rows: PageRow[] = [
  { id: '1', name: 'Page 1', status: 'done' },
  { id: '2', name: 'Page 2', status: 'running' },
];

const PageDataTable = DataTable<PageRow>;

describe('DataTable', () => {
  it('renders headers and cells', () => {
    render(
      <PageDataTable
        ariaLabel="Pages"
        items={rows}
        getKey={(row) => row.id}
        columns={[
          { id: 'name', header: 'Name', cell: (row) => row.name },
          { id: 'status', header: 'Status', cell: (row) => row.status },
        ]}
      />,
    );

    expect(screen.getByRole('table', { name: 'Pages' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Page 1' })).toBeInTheDocument();
  });

  it('activates rows with click and keyboard', async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn();
    render(
      <PageDataTable
        items={rows}
        getKey={(row) => row.id}
        columns={[{ id: 'name', header: 'Name', cell: (row) => row.name }]}
        onActivate={onActivate}
      />,
    );

    const row = screen.getByRole('row', { name: /Page 1/ });
    await user.click(row);
    row.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(onActivate).toHaveBeenCalledTimes(3);
  });

  it('does not activate rows when a nested control is used', async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn();
    const onOpen = vi.fn();
    render(
      <PageDataTable
        items={rows}
        getKey={(row) => row.id}
        columns={[
          {
            id: 'name',
            header: 'Name',
            cell: (row) => (
              <button type="button" onClick={onOpen}>
                Open {row.name}
              </button>
            ),
          },
        ]}
        onActivate={onActivate}
      />,
    );

    const button = screen.getByRole('button', { name: 'Open Page 1' });
    await user.click(button);
    button.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(onOpen).toHaveBeenCalled();
    expect(onActivate).not.toHaveBeenCalled();
  });

  it('updates sort when sortable header is clicked', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(
      <PageDataTable
        items={rows}
        getKey={(row) => row.id}
        columns={[{ id: 'name', header: 'Name', cell: (row) => row.name, sortKey: 'name' }]}
        sort={{ key: 'name', direction: 'asc' }}
        onSortChange={onSortChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Sort by Name' }));
    expect(onSortChange).toHaveBeenCalledWith({ key: 'name', direction: 'desc' });
  });

  it('renders loading, error and empty states with the root className', () => {
    const { rerender } = render(
      <PageDataTable
        className="custom-data-table"
        items={[]}
        getKey={(row) => row.id}
        columns={[{ id: 'name', header: 'Name', cell: (row) => row.name }]}
        loading
      />,
    );

    expect(screen.getByRole('status')).toHaveClass('pdui-data-table', 'custom-data-table');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    rerender(
      <PageDataTable
        className="custom-data-table"
        items={[]}
        getKey={(row) => row.id}
        columns={[{ id: 'name', header: 'Name', cell: (row) => row.name }]}
        error="Could not load pages"
      />,
    );

    expect(screen.getByRole('alert')).toHaveClass('pdui-data-table', 'custom-data-table');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    rerender(
      <PageDataTable
        className="custom-data-table"
        items={[]}
        getKey={(row) => row.id}
        columns={[{ id: 'name', header: 'Name', cell: (row) => row.name }]}
        empty={<span>No pages</span>}
      />,
    );

    expect(screen.getByText('No pages').closest('.pdui-data-table')).toHaveClass(
      'custom-data-table',
    );
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('marks selected and disabled rows without activating disabled rows', async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn();
    render(
      <PageDataTable
        items={rows}
        getKey={(row) => row.id}
        columns={[{ id: 'name', header: 'Name', cell: (row) => row.name }]}
        selection={{
          selectedKeys: new Set(['2']),
          isItemDisabled: (row) => row.id === '1',
        }}
        onActivate={onActivate}
      />,
    );

    const disabledRow = screen.getByRole('row', { name: /Page 1/ });
    const selectedRow = screen.getByRole('row', { name: /Page 2/ });

    expect(selectedRow).toHaveAttribute('aria-selected', 'true');
    expect(disabledRow).toHaveAttribute('aria-disabled', 'true');

    await user.click(disabledRow);

    expect(onActivate).not.toHaveBeenCalled();
  });
});
