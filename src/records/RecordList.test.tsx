import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createPortal } from 'react-dom';
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

interface PortaledActionProps {
  onAction: () => void;
}

function PortaledAction({ onAction }: PortaledActionProps) {
  return createPortal(
    <button type="button" onClick={onAction}>
      Portal action
    </button>,
    document.body,
  );
}

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

  it('does not activate a row when a portaled action handles click or keyboard input', async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn<(row: ProjectRow) => void>();
    const onAction = vi.fn<() => void>();
    render(
      <RecordList
        items={rows}
        getKey={(row) => row.id}
        renderPrimary={(row) => row.name}
        renderActions={() => <PortaledAction onAction={onAction} />}
        onActivate={onActivate}
      />,
    );

    const action = screen.getAllByRole('button', { name: 'Portal action' })[0]!;
    await user.click(action);
    action.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(onAction).toHaveBeenCalled();
    expect(onActivate).not.toHaveBeenCalled();
  });

  it('marks selected rows and disabled rows', () => {
    render(
      <RecordList
        ariaLabel="Projects"
        items={rows}
        getKey={(row) => row.id}
        renderPrimary={(row) => row.name}
        selection={{
          selectedKeys: new Set(['b']),
          isItemDisabled: (row) => row.id === 'a',
        }}
      />,
    );

    expect(screen.getByRole('listbox', { name: 'Projects' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Beta/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: /Alpha/ })).toHaveAttribute('aria-disabled', 'true');
  });

  it('uses grid semantics when selectable rows include actions', async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn<(row: ProjectRow) => void>();
    const onAction = vi.fn<() => void>();
    render(
      <RecordList
        ariaLabel="Selectable projects"
        items={rows}
        getKey={(row) => row.id}
        renderPrimary={(row) => row.name}
        renderMeta={(row) => row.meta}
        renderStatus={(row) => row.status}
        renderActions={() => (
          <button type="button" onClick={onAction}>
            Row action
          </button>
        )}
        selection={{
          selectedKeys: new Set(['b']),
        }}
        onActivate={onActivate}
      />,
    );

    expect(screen.getByRole('grid', { name: 'Selectable projects' })).toBeInTheDocument();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.getByRole('row', { name: /Beta/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('row', { name: /Alpha/ })).not.toHaveAttribute('aria-selected');
    expect(screen.getAllByRole('gridcell')).toHaveLength(6);

    await user.click(screen.getAllByRole('button', { name: 'Row action' })[0]!);

    expect(onAction).toHaveBeenCalledOnce();
    expect(onActivate).not.toHaveBeenCalled();
  });

  it('guards action Enter and Space without blocking unrelated keydown propagation', async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn<(row: ProjectRow) => void>();
    const onDocumentKeyDown = vi.fn<(event: KeyboardEvent) => void>();
    document.addEventListener('keydown', onDocumentKeyDown);

    try {
      render(
        <RecordList
          items={rows}
          getKey={(row) => row.id}
          renderPrimary={(row) => row.name}
          renderActions={() => <button type="button">Row action</button>}
          onActivate={onActivate}
        />,
      );

      const action = screen.getAllByRole('button', { name: 'Row action' })[0]!;
      action.focus();
      await user.keyboard('{Enter}');
      await user.keyboard(' ');
      await user.keyboard('{Escape}');

      expect(onActivate).not.toHaveBeenCalled();
      expect(onDocumentKeyDown).toHaveBeenCalledTimes(1);
    } finally {
      document.removeEventListener('keydown', onDocumentKeyDown);
    }
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

  it('wraps empty content in the root layout shell without list semantics', () => {
    render(
      <RecordList
        className="custom-record-list"
        density="compact"
        items={[]}
        getKey={(row: ProjectRow) => row.id}
        renderPrimary={(row) => row.name}
        empty={<span>No rows</span>}
      />,
    );

    const shell = screen.getByText('No rows').closest('.pdui-record-list');
    expect(shell).toHaveClass('custom-record-list');
    expect(shell).toHaveAttribute('data-density', 'compact');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
