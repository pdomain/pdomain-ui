import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TableHeader } from './TableHeader.js';

const columns = [
  { id: 'page', label: 'Page', sortable: true },
  { id: 'status', label: 'Status', sortable: false },
  { id: 'flags', label: 'Flags', sortable: true },
];

describe('TableHeader', () => {
  it('renders all column labels', () => {
    render(<TableHeader columns={columns} />);
    expect(screen.getByText('Page')).toBeTruthy();
    expect(screen.getByText('Status')).toBeTruthy();
    expect(screen.getByText('Flags')).toBeTruthy();
  });

  it('renders with table-header class', () => {
    const { container } = render(<TableHeader columns={columns} />);
    expect(container.querySelector('.table-header')).toBeTruthy();
  });

  it('calls onSort when a sortable column header is clicked', () => {
    const onSort = vi.fn();
    render(<TableHeader columns={columns} onSort={onSort} />);
    fireEvent.click(screen.getByText('Page'));
    expect(onSort).toHaveBeenCalledWith('page', expect.any(String));
  });

  it('does not call onSort for non-sortable columns', () => {
    const onSort = vi.fn();
    render(<TableHeader columns={columns} onSort={onSort} />);
    fireEvent.click(screen.getByText('Status'));
    expect(onSort).not.toHaveBeenCalled();
  });

  it('shows ascending indicator for active sorted column (asc)', () => {
    const { container } = render(<TableHeader columns={columns} sortKey="page" sortDir="asc" />);
    expect(container.querySelector('[data-sort="asc"]')).toBeTruthy();
  });

  it('shows descending indicator for active sorted column (desc)', () => {
    const { container } = render(<TableHeader columns={columns} sortKey="page" sortDir="desc" />);
    expect(container.querySelector('[data-sort="desc"]')).toBeTruthy();
  });

  it('forwards className', () => {
    const { container } = render(<TableHeader columns={columns} className="extra" />);
    expect(container.querySelector('.extra')).toBeTruthy();
  });

  it('sets aria-sort="ascending" on sorted column (WS6)', () => {
    render(<TableHeader columns={columns} sortKey="page" sortDir="asc" onSort={() => {}} />);
    const pageCell = screen.getByText('Page').closest('[role="columnheader"]');
    expect(pageCell?.getAttribute('aria-sort')).toBe('ascending');
  });

  it('sets aria-sort="descending" on sorted column (WS6)', () => {
    render(<TableHeader columns={columns} sortKey="page" sortDir="desc" onSort={() => {}} />);
    const pageCell = screen.getByText('Page').closest('[role="columnheader"]');
    expect(pageCell?.getAttribute('aria-sort')).toBe('descending');
  });

  it('sets aria-sort="none" on sortable but unsorted column (WS6)', () => {
    render(<TableHeader columns={columns} sortKey="page" sortDir="asc" onSort={() => {}} />);
    const flagsCell = screen.getByText('Flags').closest('[role="columnheader"]');
    expect(flagsCell?.getAttribute('aria-sort')).toBe('none');
  });

  it('triggers onSort via Enter key on sortable column (WS6 keyboard)', async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    render(<TableHeader columns={columns} onSort={onSort} />);
    const pageCell = screen.getByText('Page').closest('[role="columnheader"]') as HTMLElement;
    pageCell.focus();
    await user.keyboard('{Enter}');
    expect(onSort).toHaveBeenCalledWith('page', expect.any(String));
  });

  it('triggers onSort via Space key on sortable column (WS6 keyboard)', async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    render(<TableHeader columns={columns} onSort={onSort} />);
    const pageCell = screen.getByText('Page').closest('[role="columnheader"]') as HTMLElement;
    pageCell.focus();
    await user.keyboard(' ');
    expect(onSort).toHaveBeenCalledWith('page', expect.any(String));
  });
});
