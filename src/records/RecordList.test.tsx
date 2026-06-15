import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RecordList } from './RecordList.js';

interface ProjectRow {
  id: string;
  name: string;
  meta: string;
  status: string;
}

const rows: ProjectRow[] = [
  { id: 'a', name: 'Alpha', meta: '12 pages', status: 'ready' },
  { id: 'b', name: 'Beta', meta: '4 pages', status: 'running' },
];

describe('RecordList', () => {
  it('renders primary, secondary, meta, status and actions', () => {
    render(
      <RecordList
        ariaLabel="Projects"
        items={rows}
        getKey={(row) => row.id}
        renderPrimary={(row) => row.name}
        renderSecondary={(row) => `Project ${row.id}`}
        renderMeta={(row) => row.meta}
        renderStatus={(row) => row.status}
        renderActions={(row) => <button type="button">Open {row.name}</button>}
      />,
    );

    expect(screen.getByRole('list', { name: 'Projects' })).toBeInTheDocument();
    expect(screen.getByRole('listitem', { name: /Alpha/ })).toHaveTextContent('12 pages');
    expect(screen.getByRole('button', { name: 'Open Alpha' })).toBeInTheDocument();
  });

  it('activates rows with click, Enter and Space', async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn<(row: ProjectRow) => void>();
    render(
      <RecordList
        items={rows}
        getKey={(row) => row.id}
        renderPrimary={(row) => row.name}
        onActivate={onActivate}
      />,
    );

    const alpha = screen.getByRole('listitem', { name: /Alpha/ });
    await user.click(alpha);
    alpha.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(onActivate).toHaveBeenCalledTimes(3);
    expect(onActivate).toHaveBeenNthCalledWith(1, rows[0]);
  });

  it('does not activate a row when an action is clicked', async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn<(row: ProjectRow) => void>();
    const onAction = vi.fn();
    render(
      <RecordList
        items={rows}
        getKey={(row) => row.id}
        renderPrimary={(row) => row.name}
        renderActions={() => (
          <button type="button" onClick={onAction}>
            Row action
          </button>
        )}
        onActivate={onActivate}
      />,
    );

    await user.click(screen.getAllByRole('button', { name: 'Row action' })[0]!);

    expect(onAction).toHaveBeenCalledOnce();
    expect(onActivate).not.toHaveBeenCalled();
  });

  it('marks selected rows and disabled rows', () => {
    render(
      <RecordList
        items={rows}
        getKey={(row) => row.id}
        renderPrimary={(row) => row.name}
        selection={{
          selectedKeys: new Set(['b']),
          isItemDisabled: (row) => row.id === 'a',
        }}
      />,
    );

    expect(screen.getByRole('listitem', { name: /Beta/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('listitem', { name: /Alpha/ })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('renders loading, error and empty states', () => {
    const { rerender } = render(
      <RecordList
        items={[]}
        getKey={(row: ProjectRow) => row.id}
        renderPrimary={(row) => row.name}
        loading
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Loading');

    rerender(
      <RecordList
        items={[]}
        getKey={(row: ProjectRow) => row.id}
        renderPrimary={(row) => row.name}
        error="Could not load projects"
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load projects');

    rerender(
      <RecordList
        items={[]}
        getKey={(row: ProjectRow) => row.id}
        renderPrimary={(row) => row.name}
        empty={<span>No rows</span>}
      />,
    );
    expect(screen.getByText('No rows')).toBeInTheDocument();
  });
});
