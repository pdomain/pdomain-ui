import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Progress } from './Progress.js';

describe('Progress', () => {
  it('renders with the .progress class and role=progressbar', () => {
    render(<Progress data-testid="prog" />);
    const el = screen.getByTestId('prog');
    expect(el.classList.contains('progress')).toBe(true);
    expect(el.getAttribute('role')).toBe('progressbar');
  });

  it('sets aria-valuenow', () => {
    render(<Progress value={42} data-testid="prog" />);
    expect(screen.getByTestId('prog').getAttribute('aria-valuenow')).toBe('42');
  });

  it('adds status class t-running for status="running"', () => {
    render(<Progress status="running" data-testid="prog" />);
    expect(screen.getByTestId('prog').classList.contains('t-running')).toBe(true);
  });

  it('adds status class t-done for status="done"', () => {
    render(<Progress status="done" data-testid="prog" />);
    expect(screen.getByTestId('prog').classList.contains('t-done')).toBe(true);
  });

  it('adds status class t-errored for status="errored"', () => {
    render(<Progress status="errored" data-testid="prog" />);
    expect(screen.getByTestId('prog').classList.contains('t-errored')).toBe(true);
  });

  it('sets fill width based on value', () => {
    render(<Progress value={60} data-testid="prog" />);
    const fill = screen.getByTestId('prog').querySelector('.fill') as HTMLElement;
    expect(fill.style.width).toBe('60%');
  });

  it('clamps value to 0-100', () => {
    render(<Progress value={150} data-testid="prog" />);
    expect(screen.getByTestId('prog').getAttribute('aria-valuenow')).toBe('100');
  });

  it('renders label when provided', () => {
    render(<Progress value={50} label="50/100" data-testid="prog" />);
    expect(screen.getByText('50/100')).toBeTruthy();
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Progress ref={ref} />);
    expect(ref.current?.classList.contains('progress')).toBe(true);
  });

  it('accepts aria-label for screen reader description (WS6)', () => {
    render(<Progress value={50} aria-label="OCR progress" data-testid="prog" />);
    expect(screen.getByTestId('prog').getAttribute('aria-label')).toBe('OCR progress');
  });

  it('has aria-live polite for ongoing updates (WS6)', () => {
    render(<Progress status="running" data-testid="prog" />);
    const el = screen.getByTestId('prog');
    expect(el.getAttribute('aria-live')).toBe('polite');
  });
});
