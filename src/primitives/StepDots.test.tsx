import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createRef } from 'react';
import { StepDots } from './StepDots.js';

const steps = ['Name', 'Source', 'Options'];

describe('StepDots', () => {
  it('renders all step labels', () => {
    render(<StepDots steps={steps} current={0} />);
    expect(screen.getByText('Name')).toBeTruthy();
    expect(screen.getByText('Source')).toBeTruthy();
    expect(screen.getByText('Options')).toBeTruthy();
  });

  it('shows step numbers for pending steps', () => {
    render(<StepDots steps={steps} current={0} />);
    // steps after active should show numbers 2 and 3
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('renders connectors between steps (n-1 connectors)', () => {
    const { container } = render(<StepDots steps={steps} current={0} />);
    const connectors = container.querySelectorAll('.step-connector');
    expect(connectors).toHaveLength(2);
  });

  it('applies step-dot--active class to the current step', () => {
    const { container } = render(<StepDots steps={steps} current={1} />);
    const dots = container.querySelectorAll('.step-dot');
    expect(dots[1]?.classList.contains('step-dot--active')).toBe(true);
  });

  it('applies step-dot--done class to steps before current', () => {
    const { container } = render(<StepDots steps={steps} current={2} />);
    const dots = container.querySelectorAll('.step-dot');
    expect(dots[0]?.classList.contains('step-dot--done')).toBe(true);
    expect(dots[1]?.classList.contains('step-dot--done')).toBe(true);
  });

  it('applies step-dot--pending class to steps after current', () => {
    const { container } = render(<StepDots steps={steps} current={0} />);
    const dots = container.querySelectorAll('.step-dot');
    expect(dots[1]?.classList.contains('step-dot--pending')).toBe(true);
    expect(dots[2]?.classList.contains('step-dot--pending')).toBe(true);
  });

  it('calls onStepClick with step index when a step is clicked', () => {
    const onStepClick = vi.fn();
    const { container } = render(<StepDots steps={steps} current={0} onStepClick={onStepClick} />);
    const items = container.querySelectorAll('.step-item');
    fireEvent.click(items[2] as Element);
    expect(onStepClick).toHaveBeenCalledWith(2);
  });

  it('does not throw when onStepClick is not provided', () => {
    const { container } = render(<StepDots steps={steps} current={0} />);
    const items = container.querySelectorAll('.step-item');
    expect(() => fireEvent.click(items[1] as Element)).not.toThrow();
  });

  it('uses role=tablist on the container', () => {
    const { container } = render(<StepDots steps={steps} current={0} />);
    const root = container.querySelector('.step-dots');
    expect(root?.getAttribute('role')).toBe('tablist');
  });

  it('uses aria-selected=true on the active step', () => {
    const { container } = render(<StepDots steps={steps} current={1} />);
    const items = container.querySelectorAll('.step-item');
    expect(items[1]?.getAttribute('aria-selected')).toBe('true');
    expect(items[0]?.getAttribute('aria-selected')).toBe('false');
    expect(items[2]?.getAttribute('aria-selected')).toBe('false');
  });

  it('forwards ref to the root div', () => {
    const ref = createRef<HTMLDivElement>();
    render(<StepDots steps={steps} current={0} ref={ref} />);
    expect(ref.current?.classList.contains('step-dots')).toBe(true);
  });

  it('merges extra className onto root', () => {
    const { container } = render(<StepDots steps={steps} current={0} className="extra-class" />);
    expect(container.querySelector('.step-dots')?.classList.contains('extra-class')).toBe(true);
  });

  it('renders with a single step (no connectors)', () => {
    const { container } = render(<StepDots steps={['Only']} current={0} />);
    expect(container.querySelectorAll('.step-connector')).toHaveLength(0);
    expect(screen.getByText('Only')).toBeTruthy();
  });
});
