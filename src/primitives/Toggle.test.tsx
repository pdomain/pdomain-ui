import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Toggle } from './Toggle.js';

describe('Toggle', () => {
  it('renders with accessible role switch', () => {
    render(<Toggle checked={false} onCheckedChange={() => {}} />);
    expect(screen.getByRole('switch')).toBeTruthy();
  });

  it('reflects checked state via aria-checked', () => {
    render(<Toggle checked={true} onCheckedChange={() => {}} />);
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true');
  });

  it('reflects unchecked state via aria-checked', () => {
    render(<Toggle checked={false} onCheckedChange={() => {}} />);
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('false');
  });

  it('calls onCheckedChange when clicked', () => {
    const onChange = vi.fn();
    render(<Toggle checked={false} onCheckedChange={onChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('does not call onCheckedChange when disabled', () => {
    const onChange = vi.fn();
    render(<Toggle checked={false} onCheckedChange={onChange} disabled />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders optional label', () => {
    render(<Toggle checked={false} onCheckedChange={() => {}} label="Enable feature" />);
    expect(screen.getByText('Enable feature')).toBeTruthy();
  });

  it('forwards className', () => {
    const { container } = render(
      <Toggle checked={false} onCheckedChange={() => {}} className="custom" />,
    );
    expect(container.querySelector('.custom')).toBeTruthy();
  });

  it('forwards data-testid to the switch DOM element', () => {
    render(<Toggle checked={false} onCheckedChange={() => {}} data-testid="my-toggle" />);
    expect(screen.getByTestId('my-toggle')).toBeTruthy();
    expect(screen.getByTestId('my-toggle').getAttribute('role')).toBe('switch');
  });

  it('forwards aria-label to the switch DOM element', () => {
    render(<Toggle checked={false} onCheckedChange={() => {}} aria-label="Enable notifications" />);
    expect(screen.getByRole('switch', { name: 'Enable notifications' })).toBeTruthy();
  });

  it('forwards arbitrary data-* attributes to the switch DOM element', () => {
    render(<Toggle checked={false} onCheckedChange={() => {}} data-analytics-id="toggle-42" />);
    expect(screen.getByRole('switch').getAttribute('data-analytics-id')).toBe('toggle-42');
  });
});
