import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ToggleBadge } from './ToggleBadge.js';

describe('ToggleBadge', () => {
  it('renders the label text', () => {
    render(<ToggleBadge checked={false} onCheckedChange={() => {}} label="Auto-apply" />);
    expect(screen.getByText('Auto-apply')).toBeTruthy();
  });

  it('renders with accessible switch role', () => {
    render(<ToggleBadge checked={false} onCheckedChange={() => {}} label="Auto-apply" />);
    expect(screen.getByRole('switch')).toBeTruthy();
  });

  it('reflects checked state via aria-checked', () => {
    render(<ToggleBadge checked={true} onCheckedChange={() => {}} label="Auto-apply" />);
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true');
  });

  it('reflects unchecked state via aria-checked', () => {
    render(<ToggleBadge checked={false} onCheckedChange={() => {}} label="Auto-apply" />);
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('false');
  });

  it('fires onCheckedChange when clicked', () => {
    const onChange = vi.fn();
    render(<ToggleBadge checked={false} onCheckedChange={onChange} label="Auto-apply" />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('does not fire onCheckedChange when disabled', () => {
    const onChange = vi.fn();
    render(<ToggleBadge checked={false} onCheckedChange={onChange} label="Auto-apply" disabled />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('applies data-testid to the wrapper', () => {
    const { container } = render(
      <ToggleBadge
        checked={false}
        onCheckedChange={() => {}}
        label="Auto-apply"
        data-testid="my-toggle-badge"
      />,
    );
    expect(container.querySelector('[data-testid="my-toggle-badge"]')).toBeTruthy();
  });

  it('applies toggle-badge class to the wrapper', () => {
    const { container } = render(
      <ToggleBadge checked={false} onCheckedChange={() => {}} label="Auto-apply" />,
    );
    expect(container.querySelector('.toggle-badge')).toBeTruthy();
  });

  it('applies toggle--badge modifier to the inner Toggle', () => {
    const { container } = render(
      <ToggleBadge checked={false} onCheckedChange={() => {}} label="Auto-apply" />,
    );
    expect(container.querySelector('.toggle--badge')).toBeTruthy();
  });

  it('always passes disabled prop to Toggle (WS7: no over-cautious spread)', () => {
    // When disabled is explicitly false, the switch must still be interactive.
    const onChange = vi.fn();
    render(
      <ToggleBadge
        checked={false}
        onCheckedChange={onChange}
        label="Auto-apply"
        disabled={false}
      />,
    );
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledOnce();
  });
});
