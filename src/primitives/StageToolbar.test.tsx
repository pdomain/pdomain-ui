import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StageToolbar } from './StageToolbar.js';

// Helper: render with at least one slot so the toolbar is not empty
function renderWithSlot(props: React.ComponentProps<typeof StageToolbar> = {}) {
  const merged = { leftSlot: <span>Left</span>, ...props };
  return render(<StageToolbar {...merged} />);
}

describe('StageToolbar', () => {
  it('returns null (renders nothing) when all slots are omitted (WS7 empty guard)', () => {
    const { container } = render(<StageToolbar />);
    // An empty role=toolbar with no interactive children is invalid ARIA.
    // The component should return null rather than render an empty landmark.
    expect(container.firstChild).toBeNull();
  });

  it('renders the left slot when provided', () => {
    render(<StageToolbar leftSlot={<span>Left Content</span>} />);
    expect(screen.getByText('Left Content')).toBeTruthy();
    const wrapper = screen.getByText('Left Content').closest('.stage-toolbar__left');
    expect(wrapper).not.toBeNull();
  });

  it('renders the center slot when provided', () => {
    render(<StageToolbar centerSlot={<span>Center Content</span>} />);
    expect(screen.getByText('Center Content')).toBeTruthy();
    const wrapper = screen.getByText('Center Content').closest('.stage-toolbar__center');
    expect(wrapper).not.toBeNull();
  });

  it('renders the right slot when provided', () => {
    render(<StageToolbar rightSlot={<span>Right Content</span>} />);
    expect(screen.getByText('Right Content')).toBeTruthy();
    const wrapper = screen.getByText('Right Content').closest('.stage-toolbar__right');
    expect(wrapper).not.toBeNull();
  });

  it('omits the left wrapper div when leftSlot is not provided', () => {
    const { container } = render(
      <StageToolbar centerSlot={<span>Center</span>} rightSlot={<span>Right</span>} />,
    );
    expect(container.querySelector('.stage-toolbar__left')).toBeNull();
    expect(container.querySelector('.stage-toolbar__center')).not.toBeNull();
    expect(container.querySelector('.stage-toolbar__right')).not.toBeNull();
  });

  it('omits the center wrapper div when centerSlot is not provided', () => {
    const { container } = render(
      <StageToolbar leftSlot={<span>Left</span>} rightSlot={<span>Right</span>} />,
    );
    expect(container.querySelector('.stage-toolbar__center')).toBeNull();
    expect(container.querySelector('.stage-toolbar__left')).not.toBeNull();
    expect(container.querySelector('.stage-toolbar__right')).not.toBeNull();
  });

  it('omits the right wrapper div when rightSlot is not provided', () => {
    const { container } = render(
      <StageToolbar leftSlot={<span>Left</span>} centerSlot={<span>Center</span>} />,
    );
    expect(container.querySelector('.stage-toolbar__right')).toBeNull();
    expect(container.querySelector('.stage-toolbar__left')).not.toBeNull();
    expect(container.querySelector('.stage-toolbar__center')).not.toBeNull();
  });

  it('renders all three slots with correct wrapper classes when all provided', () => {
    const { container } = render(
      <StageToolbar
        leftSlot={<span>L</span>}
        centerSlot={<span>C</span>}
        rightSlot={<span>R</span>}
      />,
    );
    expect(container.querySelector('.stage-toolbar__left')).not.toBeNull();
    expect(container.querySelector('.stage-toolbar__center')).not.toBeNull();
    expect(container.querySelector('.stage-toolbar__right')).not.toBeNull();
  });

  it('has role="toolbar"', () => {
    renderWithSlot();
    expect(screen.getByRole('toolbar')).toBeTruthy();
  });

  it('uses default aria-label when none is provided', () => {
    renderWithSlot();
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.getAttribute('aria-label')).toBe('Stage toolbar');
  });

  it('uses provided aria-label', () => {
    renderWithSlot({ 'aria-label': 'Source toolbar' });
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.getAttribute('aria-label')).toBe('Source toolbar');
  });

  it('applies data-sticky="true" when sticky prop is true', () => {
    renderWithSlot({ sticky: true });
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.getAttribute('data-sticky')).toBe('true');
  });

  it('does not apply data-sticky when sticky is false', () => {
    renderWithSlot({ sticky: false });
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.getAttribute('data-sticky')).toBeNull();
  });

  it('does not apply data-sticky when sticky is omitted', () => {
    renderWithSlot();
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.getAttribute('data-sticky')).toBeNull();
  });

  it('forwards data-testid', () => {
    renderWithSlot({ 'data-testid': 'my-toolbar' });
    expect(screen.getByTestId('my-toolbar')).toBeTruthy();
  });

  it('composes className with the root class', () => {
    renderWithSlot({ className: 'extra-class' });
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.classList.contains('stage-toolbar')).toBe(true);
    expect(toolbar.classList.contains('extra-class')).toBe(true);
  });
});
