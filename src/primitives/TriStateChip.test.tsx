import { fireEvent, render, screen } from '@testing-library/react';
import { createElement, createRef, type ComponentType } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { TriStateChip } from './TriStateChip.js';

describe('TriStateChip', () => {
  it('reflects off, on, and mixed values via aria-pressed', () => {
    const { rerender } = render(<TriStateChip value="off">Mode</TriStateChip>);
    expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('false');

    rerender(<TriStateChip value="on">Mode</TriStateChip>);
    expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('true');

    rerender(<TriStateChip value="mixed">Mode</TriStateChip>);
    expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('mixed');
  });

  it('renders tri-state data attributes and marker span', () => {
    render(
      <TriStateChip value="mixed" data-testid="tri">
        Mode
      </TriStateChip>,
    );

    const chip = screen.getByTestId('tri');
    expect(chip.getAttribute('data-tristate')).toBe('');
    expect(chip.getAttribute('data-tristate-value')).toBe('mixed');
    expect(chip.querySelector('.tri-dot')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('cycles off to on to mixed to off on click', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <TriStateChip value="off" onChange={onChange}>
        Mode
      </TriStateChip>,
    );

    fireEvent.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenLastCalledWith('on');

    rerender(
      <TriStateChip value="on" onChange={onChange}>
        Mode
      </TriStateChip>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenLastCalledWith('mixed');

    rerender(
      <TriStateChip value="mixed" onChange={onChange}>
        Mode
      </TriStateChip>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenLastCalledWith('off');
  });

  it('cycles on Enter and Space keydown while preventing default', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <TriStateChip value="off" onChange={onChange}>
        Mode
      </TriStateChip>,
    );

    const enter = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    });
    screen.getByRole('button').dispatchEvent(enter);
    expect(enter.defaultPrevented).toBe(true);
    expect(onChange).toHaveBeenLastCalledWith('on');

    rerender(
      <TriStateChip value="on" onChange={onChange}>
        Mode
      </TriStateChip>,
    );
    const space = new KeyboardEvent('keydown', {
      key: ' ',
      bubbles: true,
      cancelable: true,
    });
    screen.getByRole('button').dispatchEvent(space);
    expect(space.defaultPrevented).toBe(true);
    expect(onChange).toHaveBeenLastCalledWith('mixed');
  });

  it('forwards data-testid, className, and ref to the root div', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <TriStateChip ref={ref} value="on" className="extra" data-testid="tri">
        Mode
      </TriStateChip>,
    );

    const chip = screen.getByTestId('tri');
    expect(chip.tagName).toBe('DIV');
    expect(ref.current).toBe(chip);
    expect(chip.classList.contains('chip3')).toBe(true);
    expect(chip.classList.contains('all')).toBe(true);
    expect(chip.classList.contains('extra')).toBe(true);
  });

  it('adds the some class for mixed values', () => {
    render(
      <TriStateChip value="mixed" data-testid="tri">
        Mode
      </TriStateChip>,
    );

    expect(screen.getByTestId('tri').classList.contains('some')).toBe(true);
  });

  it('keeps component-owned state and accessibility props invariant', () => {
    const UnsafeTriStateChip = TriStateChip as ComponentType<Record<string, unknown>>;

    render(
      createElement(
        UnsafeTriStateChip,
        {
          value: 'mixed',
          role: 'checkbox',
          tabIndex: -1,
          'aria-pressed': 'true',
          'data-testid': 'tri',
          'data-tristate': 'custom',
          'data-tristate-value': 'off',
        },
        'Mode',
      ),
    );

    const chip = screen.getByTestId('tri');
    expect(chip.getAttribute('role')).toBe('button');
    expect(chip.getAttribute('tabindex')).toBe('0');
    expect(chip.getAttribute('aria-pressed')).toBe('mixed');
    expect(chip.getAttribute('data-tristate')).toBe('');
    expect(chip.getAttribute('data-tristate-value')).toBe('mixed');
  });
});
