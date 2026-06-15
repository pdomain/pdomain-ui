import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RecordGrid } from './RecordGrid.js';

interface ProjectRow {
  id: string;
  title: string;
}

const rows: ProjectRow[] = [
  { id: 'a', title: 'Alpha' },
  { id: 'b', title: 'Beta' },
];

const ProjectRecordGrid = RecordGrid<ProjectRow>;

describe('RecordGrid', () => {
  it('renders cards in a grid', () => {
    render(
      <ProjectRecordGrid
        ariaLabel="Projects"
        items={rows}
        getKey={(row) => row.id}
        renderCard={(row) => <article>{row.title}</article>}
      />,
    );

    expect(screen.getByRole('list', { name: 'Projects' })).toHaveAttribute('data-layout', 'grid');
    expect(screen.getByText('Alpha')).toBeInTheDocument();
  });

  it('activates cards with keyboard', async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn();
    render(
      <ProjectRecordGrid
        items={rows}
        getKey={(row) => row.id}
        renderCard={(row) => row.title}
        onActivate={onActivate}
      />,
    );

    const item = screen.getByRole('listitem', { name: /Alpha/ });
    item.focus();
    await user.keyboard('{Enter}');

    expect(onActivate).toHaveBeenCalledWith(rows[0]);
  });

  it('does not use selectable attributes on plain list items', () => {
    render(
      <ProjectRecordGrid items={rows} getKey={(row) => row.id} renderCard={(row) => row.title} />,
    );

    expect(screen.getByRole('listitem', { name: /Alpha/ })).not.toHaveAttribute('aria-selected');
  });

  it('uses grid semantics when selection is present', () => {
    render(
      <ProjectRecordGrid
        ariaLabel="Selectable projects"
        items={rows}
        getKey={(row) => row.id}
        renderCard={(row) => <button type="button">Open {row.title}</button>}
        selection={{
          selectedKeys: new Set(['b']),
        }}
      />,
    );

    expect(screen.getByRole('grid', { name: 'Selectable projects' })).toHaveAttribute(
      'data-layout',
      'grid',
    );
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    expect(screen.getByRole('row', { name: /Beta/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getAllByRole('gridcell')).toHaveLength(2);
  });

  it('does not activate cards when a nested control is used', async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn();
    const onOpen = vi.fn();
    render(
      <ProjectRecordGrid
        items={rows}
        getKey={(row) => row.id}
        renderCard={(row) => (
          <button type="button" onClick={onOpen}>
            Open {row.title}
          </button>
        )}
        onActivate={onActivate}
      />,
    );

    const button = screen.getByRole('button', { name: 'Open Alpha' });
    await user.click(button);
    button.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(onOpen).toHaveBeenCalled();
    expect(onActivate).not.toHaveBeenCalled();
  });

  it('marks selected and disabled cards without activating disabled cards', async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn();
    render(
      <ProjectRecordGrid
        items={rows}
        getKey={(row) => row.id}
        renderCard={(row) => row.title}
        selection={{
          selectedKeys: new Set(['b']),
          isItemDisabled: (row) => row.id === 'a',
        }}
        onActivate={onActivate}
      />,
    );

    const disabledCard = screen.getByRole('row', { name: /Alpha/ });
    const selectedCard = screen.getByRole('row', { name: /Beta/ });

    expect(selectedCard).toHaveAttribute('aria-selected', 'true');
    expect(disabledCard).toHaveAttribute('aria-disabled', 'true');

    await user.click(disabledCard);

    expect(onActivate).not.toHaveBeenCalled();
  });
});
