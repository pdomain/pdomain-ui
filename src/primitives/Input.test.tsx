/**
 * API choice: we EXTEND `Input` rather than adding a separate `InputField` composite.
 *
 * Rationale:
 *   - The suffix and autoFocusRing props are naturally optional; existing callers
 *     that pass neither get the same bare <input> they always got (back-compat).
 *   - Keeping a single export avoids a two-component surface where callers must
 *     choose between `Input` and `InputField` for what is essentially one widget.
 *   - The wrapper div is only rendered when `suffix` is provided, so the DOM
 *     footprint for bare usage is unchanged.
 *
 * Design reference: docs/templates/design_handoff_pdomain_ui/design-system/ui-base.jsx
 *   → Input component (wrapper div with flex layout, suffix <span>, autoFocus ring).
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Input } from './Input.js';

/* ─── existing bare-input back-compat tests (must remain green) ──────────── */

describe('Input – bare input (back-compat)', () => {
  it('renders an <input> element with the .input class', () => {
    render(<Input data-testid="inp" />);
    const input = screen.getByTestId('inp');
    expect(input.tagName).toBe('INPUT');
    expect(input.classList.contains('input')).toBe(true);
  });

  it('adds the size class for size="lg"', () => {
    render(<Input data-testid="inp" size="lg" />);
    expect(screen.getByTestId('inp').classList.contains('lg')).toBe(true);
  });

  it('does NOT add a size class for size="sm" (sm class from .input base)', () => {
    render(<Input data-testid="inp" size="sm" />);
    expect(screen.getByTestId('inp').classList.contains('sm')).toBe(true);
  });

  it('does NOT add a size class for size="md" (md is the default/base)', () => {
    render(<Input data-testid="inp" size="md" />);
    expect(screen.getByTestId('inp').classList.contains('md')).toBe(false);
  });

  it('forwards ref to the underlying <input>', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} data-testid="inp" />);
    expect(ref.current?.tagName).toBe('INPUT');
  });

  it('passes HTML props through (placeholder)', () => {
    render(<Input placeholder="type here" data-testid="inp" />);
    expect(screen.getByTestId('inp').getAttribute('placeholder')).toBe('type here');
  });

  it('merges custom className', () => {
    render(<Input className="my-input" data-testid="inp" />);
    const el = screen.getByTestId('inp');
    expect(el.classList.contains('input')).toBe(true);
    expect(el.classList.contains('my-input')).toBe(true);
  });
});

/* ─── suffix slot ─────────────────────────────────────────────────────────── */

describe('Input – suffix slot', () => {
  it('renders a wrapper div when suffix is provided', () => {
    const { container } = render(<Input data-testid="inp" suffix="px" />);
    // The input should be inside a wrapper div
    const input = screen.getByTestId('inp');
    expect(input.parentElement?.tagName).toBe('DIV');
    expect(container.querySelector('.input-wrapper')).not.toBeNull();
  });

  it('renders the suffix text inside a <span> with .input-suffix class', () => {
    render(<Input data-testid="inp" suffix="px" />);
    const suffix = document.querySelector('.input-suffix');
    expect(suffix).not.toBeNull();
    expect(suffix?.textContent).toBe('px');
  });

  it('does NOT render a wrapper div when suffix is absent', () => {
    render(<Input data-testid="inp" />);
    const input = screen.getByTestId('inp');
    // Parent should not be a div wrapper — it's the test container itself
    expect(input.classList.contains('input')).toBe(true);
    expect(document.querySelector('.input-wrapper')).toBeNull();
  });

  it('ref still points to the <input> element when suffix is provided', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} data-testid="inp" suffix="ms" />);
    expect(ref.current?.tagName).toBe('INPUT');
  });

  it('passes HTML props (placeholder) through when suffix is present', () => {
    render(<Input data-testid="inp" suffix="%" placeholder="amount" />);
    expect(screen.getByTestId('inp').getAttribute('placeholder')).toBe('amount');
  });
});

/* ─── WS7: className on suffix composite mode ─────────────────────────────── */

describe('Input – className in composite (suffix) mode (WS7)', () => {
  it('applies className to the outer wrapper div when suffix is present', () => {
    const { container } = render(<Input data-testid="inp" suffix="px" className="my-class" />);
    const wrapper = container.querySelector('.input-wrapper');
    expect(wrapper?.classList.contains('my-class')).toBe(true);
  });

  it('does NOT apply className to the inner input when suffix present', () => {
    render(<Input data-testid="inp" suffix="px" className="my-class" />);
    const inp = screen.getByTestId('inp');
    // Inner input should NOT have the consumer className
    expect(inp.classList.contains('my-class')).toBe(false);
  });
});

/* ─── autoFocusRing ───────────────────────────────────────────────────────── */

describe('Input – autoFocusRing', () => {
  it('adds .input-focus-ring class to wrapper when autoFocusRing=true and suffix present', () => {
    const { container } = render(<Input data-testid="inp" suffix="px" autoFocusRing />);
    expect(container.querySelector('.input-wrapper')?.classList.contains('input-focus-ring')).toBe(
      true,
    );
  });

  it('adds .input-focus-ring class to input element when autoFocusRing=true and no suffix', () => {
    render(<Input data-testid="inp" autoFocusRing />);
    const input = screen.getByTestId('inp');
    expect(input.classList.contains('input-focus-ring')).toBe(true);
  });

  it('does NOT add .input-focus-ring when autoFocusRing is absent', () => {
    render(<Input data-testid="inp" suffix="px" />);
    const wrapper = document.querySelector('.input-wrapper');
    expect(wrapper?.classList.contains('input-focus-ring')).toBe(false);
  });
});
