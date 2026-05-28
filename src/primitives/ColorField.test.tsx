/**
 * ColorField primitive tests (#17).
 *
 * Labeled swatch + native color input with a "reset to token default" affordance.
 * Design constraints:
 *   - No hex literals in component code (CSS custom properties only).
 *   - No CVA.
 *   - No direct lucide-react imports (icons via src/icons/).
 *   - Follows Field/Input pattern from primitives/.
 */
import * as React from 'react';
import { createRef } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColorField } from './ColorField.js';

describe('ColorField (#17)', () => {
  it('renders a labeled color input', () => {
    render(<ColorField id="layer-block" label="Block layer" value="#ff0000" onChange={vi.fn()} />);
    expect(screen.getByLabelText('Block layer')).toBeInTheDocument();
    // color inputs don't have a named accessible role — find by type
    const colorInput = document.querySelector('input[type="color"]');
    expect(colorInput).not.toBeNull();
  });

  it('renders the label text', () => {
    render(<ColorField id="accent" label="Accent" value="#00ff00" onChange={vi.fn()} />);
    expect(screen.getByText('Accent')).toBeInTheDocument();
  });

  it('calls onChange when the color input changes', () => {
    const onChange = vi.fn();
    render(<ColorField id="accent" label="Accent" value="#00ff00" onChange={onChange} />);
    const colorInput = document.querySelector('input[type="color"]') as HTMLInputElement;
    fireEvent.change(colorInput, { target: { value: '#0000ff' } });
    expect(onChange).toHaveBeenCalledWith('#0000ff');
  });

  it('shows a reset button when a defaultValue is provided and value differs from it', () => {
    render(
      <ColorField
        id="accent"
        label="Accent"
        value="#ff0000"
        onChange={vi.fn()}
        defaultValue="#00ff00"
      />,
    );
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  it('does not show a reset button when value matches defaultValue', () => {
    render(
      <ColorField
        id="accent"
        label="Accent"
        value="#00ff00"
        onChange={vi.fn()}
        defaultValue="#00ff00"
      />,
    );
    expect(screen.queryByRole('button', { name: /reset/i })).toBeNull();
  });

  it('does not show a reset button when no defaultValue is provided', () => {
    render(<ColorField id="accent" label="Accent" value="#00ff00" onChange={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /reset/i })).toBeNull();
  });

  it('calls onChange with defaultValue when reset button is clicked', () => {
    const onChange = vi.fn();
    render(
      <ColorField
        id="accent"
        label="Accent"
        value="#ff0000"
        onChange={onChange}
        defaultValue="#00ff00"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(onChange).toHaveBeenCalledWith('#00ff00');
  });

  it('renders a color swatch reflecting the current value', () => {
    const { container } = render(
      <ColorField id="accent" label="Accent" value="#ff6600" onChange={vi.fn()} />,
    );
    // The swatch element should have style reflecting the current value
    const swatch = container.querySelector('.color-field-swatch');
    expect(swatch).not.toBeNull();
  });

  it('forwards className to the root element', () => {
    const { container } = render(
      <ColorField
        id="accent"
        label="Accent"
        value="#ff6600"
        onChange={vi.fn()}
        className="custom-class"
      />,
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('accepts an optional aria-label for the color input', () => {
    render(
      <ColorField
        id="accent"
        label="Accent"
        value="#ff6600"
        onChange={vi.fn()}
        inputAriaLabel="Choose accent color"
      />,
    );
    const colorInput = document.querySelector('input[type="color"]') as HTMLInputElement;
    expect(colorInput.getAttribute('aria-label')).toBe('Choose accent color');
  });

  it('forwards ref to the native color input element (WS5)', () => {
    const ref = createRef<HTMLInputElement>();
    render(<ColorField id="accent" label="Accent" value="#ff6600" onChange={vi.fn()} ref={ref} />);
    const colorInput = document.querySelector('input[type="color"]') as HTMLInputElement;
    expect(ref.current).toBe(colorInput);
  });
});
