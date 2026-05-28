import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { StatusPip } from './StatusPip.js';

describe('StatusPip', () => {
  it('renders with the .pip class', () => {
    render(<StatusPip status="exact" />);
    const el = screen.getByTestId('status-pip-exact');
    expect(el.classList.contains('pip')).toBe(true);
  });

  it('sets data-testid based on status', () => {
    render(<StatusPip status="mismatch" />);
    expect(screen.getByTestId('status-pip-mismatch')).toBeTruthy();
  });

  it('applies color: var(--exact) for status="exact"', () => {
    render(<StatusPip status="exact" />);
    const el = screen.getByTestId('status-pip-exact');
    expect(el.style.color).toBe('var(--exact)');
  });

  it('applies color: var(--fuzzy) for status="fuzzy"', () => {
    render(<StatusPip status="fuzzy" />);
    const el = screen.getByTestId('status-pip-fuzzy');
    expect(el.style.color).toBe('var(--fuzzy)');
  });

  it('applies color: var(--mismatch) for status="mismatch"', () => {
    render(<StatusPip status="mismatch" />);
    expect(screen.getByTestId('status-pip-mismatch').style.color).toBe('var(--mismatch)');
  });

  it('applies color: var(--ocr) for status="ocr" (WS4 fix: was --fuzzy)', () => {
    render(<StatusPip status="ocr" />);
    expect(screen.getByTestId('status-pip-ocr').style.color).toBe('var(--ocr)');
  });

  it('applies color: var(--gt) for status="gt" (WS4 fix: was --accent)', () => {
    render(<StatusPip status="gt" />);
    expect(screen.getByTestId('status-pip-gt').style.color).toBe('var(--gt)');
  });

  it('renders a label when provided', () => {
    render(<StatusPip status="exact" label="Match" />);
    expect(screen.getByText('Match')).toBeTruthy();
  });

  it('does NOT render a label span when no label provided', () => {
    render(<StatusPip status="exact" />);
    // Should just have the pip + dot, no extra text
    const el = screen.getByTestId('status-pip-exact');
    expect(el.querySelectorAll('span')).toHaveLength(1); // only the dot
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<StatusPip status="exact" ref={ref} />);
    expect(ref.current?.classList.contains('pip')).toBe(true);
  });

  it('merges custom className', () => {
    render(<StatusPip status="exact" className="extra" />);
    const el = screen.getByTestId('status-pip-exact');
    expect(el.classList.contains('pip')).toBe(true);
    expect(el.classList.contains('extra')).toBe(true);
  });

  it('decorative dot is aria-hidden (WS6)', () => {
    render(<StatusPip status="exact" />);
    const el = screen.getByTestId('status-pip-exact');
    const dot = el.querySelector('.dot');
    expect(dot?.getAttribute('aria-hidden')).toBe('true');
  });
});
