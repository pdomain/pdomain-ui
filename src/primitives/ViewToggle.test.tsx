import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ViewToggle } from './ViewToggle.js';

describe('ViewToggle', () => {
  it('renders List and Thumbnails options', () => {
    render(<ViewToggle mode="list" onChange={() => {}} />);
    expect(screen.getByText('List')).toBeTruthy();
    expect(screen.getByText('Thumbnails')).toBeTruthy();
  });

  it('marks active option with --active class', () => {
    render(<ViewToggle mode="thumb" onChange={() => {}} />);
    const thumbBtn = screen.getByText('Thumbnails').closest('[data-id]');
    expect(thumbBtn?.classList.contains('view-toggle__option--active')).toBe(true);
  });

  it('does not mark inactive option with --active class', () => {
    render(<ViewToggle mode="thumb" onChange={() => {}} />);
    const listBtn = screen.getByText('List').closest('[data-id]');
    expect(listBtn?.classList.contains('view-toggle__option--active')).toBe(false);
  });

  it('calls onChange with "list" when List clicked', () => {
    const onChange = vi.fn();
    render(<ViewToggle mode="thumb" onChange={onChange} />);
    fireEvent.click(screen.getByText('List'));
    expect(onChange).toHaveBeenCalledWith('list');
  });

  it('calls onChange with "thumb" when Thumbnails clicked', () => {
    const onChange = vi.fn();
    render(<ViewToggle mode="list" onChange={onChange} />);
    fireEvent.click(screen.getByText('Thumbnails'));
    expect(onChange).toHaveBeenCalledWith('thumb');
  });

  it('defaults to "list" mode when mode not provided', () => {
    render(<ViewToggle onChange={() => {}} />);
    const listBtn = screen.getByText('List').closest('[data-id]');
    expect(listBtn?.classList.contains('view-toggle__option--active')).toBe(true);
  });

  it('forwards className', () => {
    const { container } = render(<ViewToggle onChange={() => {}} className="custom" />);
    expect(container.querySelector('.custom')).toBeTruthy();
  });

  it('ArrowRight moves focus to next option (WS6 arrow nav)', async () => {
    const user = userEvent.setup();
    render(<ViewToggle mode="list" onChange={() => {}} />);
    const listBtn = screen.getByText('List').closest('button') as HTMLButtonElement;
    listBtn.focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement?.textContent).toContain('Thumbnails');
  });

  it('ArrowLeft moves focus to previous option (WS6 arrow nav)', async () => {
    const user = userEvent.setup();
    render(<ViewToggle mode="thumb" onChange={() => {}} />);
    const thumbBtn = screen.getByText('Thumbnails').closest('button') as HTMLButtonElement;
    thumbBtn.focus();
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement?.textContent).toContain('List');
  });

  it('active option has tabIndex=0, inactive has tabIndex=-1 (WS6)', () => {
    render(<ViewToggle mode="list" onChange={() => {}} />);
    const listBtn = screen.getByText('List').closest('button') as HTMLButtonElement;
    const thumbBtn = screen.getByText('Thumbnails').closest('button') as HTMLButtonElement;
    expect(listBtn.getAttribute('tabindex')).toBe('0');
    expect(thumbBtn.getAttribute('tabindex')).toBe('-1');
  });
});
