/**
 * AdvancedParams tests.
 *
 * Covers: 3 rows render; slider/number sync; reset restores default; data-testid forwards.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdvancedParams, GRAYSCALE_PARAMS_DEFAULT } from './AdvancedParams.js';

const defaultParams = { ...GRAYSCALE_PARAMS_DEFAULT };

describe('AdvancedParams', () => {
  it('renders 3 rows when defaultOpen=true', () => {
    render(<AdvancedParams params={defaultParams} onChange={() => undefined} defaultOpen={true} />);
    // Labels should be visible
    expect(screen.getByText('Sampler radius')).toBeTruthy();
    expect(screen.getByText('Gamma')).toBeTruthy();
    expect(screen.getByText('Output range')).toBeTruthy();
  });

  it('forwards data-testid to root element', () => {
    const { container } = render(
      <AdvancedParams
        params={defaultParams}
        onChange={() => undefined}
        defaultOpen={true}
        data-testid="test-ap"
      />,
    );
    expect(container.querySelector('[data-testid="test-ap"]')).toBeTruthy();
  });

  it('slider change calls onChange with new samplerRadius', () => {
    const onChange = vi.fn();
    render(<AdvancedParams params={defaultParams} onChange={onChange} defaultOpen={true} />);
    const slider = screen.getByTestId('advanced-params-slider-samplerRadius');
    fireEvent.change(slider, { target: { valueAsNumber: 16 } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ samplerRadius: 16 }));
  });

  it('number input change calls onChange with new gamma', () => {
    const onChange = vi.fn();
    render(<AdvancedParams params={defaultParams} onChange={onChange} defaultOpen={true} />);
    const slider = screen.getByTestId('advanced-params-slider-gamma');
    fireEvent.change(slider, { target: { valueAsNumber: 2.5 } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ gamma: 2.5 }));
  });

  it('reset samplerRadius button restores default', () => {
    const onChange = vi.fn();
    const customParams = { ...defaultParams, samplerRadius: 20 };
    render(<AdvancedParams params={customParams} onChange={onChange} defaultOpen={true} />);
    const resetBtn = screen.getByTestId('advanced-params-reset-samplerRadius');
    fireEvent.click(resetBtn);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        samplerRadius: GRAYSCALE_PARAMS_DEFAULT.samplerRadius,
      }),
    );
  });

  it('reset gamma button restores default', () => {
    const onChange = vi.fn();
    const customParams = { ...defaultParams, gamma: 2.0 };
    render(<AdvancedParams params={customParams} onChange={onChange} defaultOpen={true} />);
    const resetBtn = screen.getByTestId('advanced-params-reset-gamma');
    fireEvent.click(resetBtn);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ gamma: GRAYSCALE_PARAMS_DEFAULT.gamma }),
    );
  });

  it('reset outputRange button restores default', () => {
    const onChange = vi.fn();
    const customParams = { ...defaultParams, outputRange: [10, 240] as [number, number] };
    render(<AdvancedParams params={customParams} onChange={onChange} defaultOpen={true} />);
    const resetBtn = screen.getByTestId('advanced-params-reset-outputRange');
    fireEvent.click(resetBtn);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        outputRange: GRAYSCALE_PARAMS_DEFAULT.outputRange,
      }),
    );
  });

  it('outputMin number input calls onChange with new min', () => {
    const onChange = vi.fn();
    render(<AdvancedParams params={defaultParams} onChange={onChange} defaultOpen={true} />);
    const minInput = screen.getByTestId('advanced-params-slider-outputMin');
    fireEvent.change(minInput, { target: { valueAsNumber: 20 } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ outputRange: [20, 255] }));
  });

  it('outputMax number input calls onChange with new max', () => {
    const onChange = vi.fn();
    render(<AdvancedParams params={defaultParams} onChange={onChange} defaultOpen={true} />);
    const maxInput = screen.getByTestId('advanced-params-slider-outputMax');
    fireEvent.change(maxInput, { target: { valueAsNumber: 230 } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ outputRange: [0, 230] }));
  });
});

// ── TDD: range aria-label (WS6) ──────────────────────────────────────────────

describe('AdvancedParams — range inputs have aria-label', () => {
  it('samplerRadius range input has an aria-label', () => {
    render(<AdvancedParams params={defaultParams} onChange={vi.fn()} defaultOpen={true} />);
    const slider = screen.getByTestId('advanced-params-slider-samplerRadius');
    expect(slider).toHaveAttribute('aria-label');
    expect(slider.getAttribute('aria-label')).not.toBe('');
  });

  it('gamma range input has an aria-label', () => {
    render(<AdvancedParams params={defaultParams} onChange={vi.fn()} defaultOpen={true} />);
    const slider = screen.getByTestId('advanced-params-slider-gamma');
    expect(slider).toHaveAttribute('aria-label');
  });
});
