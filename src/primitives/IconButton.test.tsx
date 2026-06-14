import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { IconButton } from './IconButton.js';

// Minimal icon stub — avoids lucide-react import in test file (ESLint rule)
const FakeIcon = () => <svg data-testid="fake-icon" aria-hidden="true" />;

describe('IconButton', () => {
  it('renders a <button> element', () => {
    render(<IconButton aria-label="Close" icon={<FakeIcon />} />);
    const btn = screen.getByRole('button', { name: /close/i });
    expect(btn.tagName).toBe('BUTTON');
  });

  it('has the .icon-btn class', () => {
    render(<IconButton aria-label="Close" icon={<FakeIcon />} />);
    const btn = screen.getByRole('button', { name: /close/i });
    expect(btn.classList.contains('icon-btn')).toBe(true);
  });

  it('requires aria-label (accessible name is the aria-label)', () => {
    render(<IconButton aria-label="Delete item" icon={<FakeIcon />} />);
    // getByRole with name asserts the accessible name resolves correctly
    expect(screen.getByRole('button', { name: 'Delete item' })).toBeTruthy();
  });

  it('renders the icon as a child inside the button', () => {
    render(<IconButton aria-label="Search" icon={<FakeIcon />} />);
    const btn = screen.getByRole('button', { name: /search/i });
    expect(btn.querySelector('[data-testid="fake-icon"]')).toBeTruthy();
  });

  it('does NOT expose the icon to the a11y tree (icon is aria-hidden via wrapper)', () => {
    render(<IconButton aria-label="Search" icon={<FakeIcon />} />);
    const btn = screen.getByRole('button', { name: /search/i });
    // The icon wrapper should be aria-hidden so only aria-label is exposed
    const wrapper = btn.querySelector('.icon-btn__icon');
    expect(wrapper?.getAttribute('aria-hidden')).toBe('true');
  });

  it('forwards ref to the underlying <button>', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<IconButton ref={ref} aria-label="Close" icon={<FakeIcon />} />);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('BUTTON');
  });

  it('merges custom className onto the button', () => {
    render(<IconButton aria-label="Close" icon={<FakeIcon />} className="extra" />);
    const btn = screen.getByRole('button', { name: /close/i });
    expect(btn.classList.contains('icon-btn')).toBe(true);
    expect(btn.classList.contains('extra')).toBe(true);
  });

  it('forwards data-testid to the button', () => {
    render(<IconButton aria-label="Close" icon={<FakeIcon />} data-testid="close-btn" />);
    expect(screen.getByTestId('close-btn')).toBeTruthy();
  });

  it('is disabled when disabled prop is provided', () => {
    render(<IconButton aria-label="Close" icon={<FakeIcon />} disabled />);
    const btn = screen.getByRole('button', { name: /close/i });
    expect(btn).toBeDisabled();
  });

  it('passes type="button" by default', () => {
    render(<IconButton aria-label="Close" icon={<FakeIcon />} />);
    const btn = screen.getByRole('button', { name: /close/i });
    // Default type is button (no form submission side-effects)
    expect(btn.getAttribute('type')).toBe('button');
  });

  it('accepts size prop and applies size class', () => {
    render(<IconButton aria-label="Close" icon={<FakeIcon />} size="sm" />);
    const btn = screen.getByRole('button', { name: /close/i });
    expect(btn.classList.contains('sm')).toBe(true);
  });

  it('does not apply size class when size="md" (md is default)', () => {
    render(<IconButton aria-label="Close" icon={<FakeIcon />} size="md" />);
    const btn = screen.getByRole('button', { name: /close/i });
    expect(btn.classList.contains('md')).toBe(false);
  });

  it('accepts size="lg" and applies size class', () => {
    render(<IconButton aria-label="Close" icon={<FakeIcon />} size="lg" />);
    const btn = screen.getByRole('button', { name: /close/i });
    expect(btn.classList.contains('lg')).toBe(true);
  });
});
