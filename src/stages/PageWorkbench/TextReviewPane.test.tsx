/**
 * Tests for TextReviewPane — collapsible bottom text pane (Phase 2 M2).
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { TextReviewPane } from './TextReviewPane.js';
import { TEXT_REVIEW_PANE, TEXT_REVIEW_PANE_TOGGLE } from '../../testids/index.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderPane(props: Partial<React.ComponentProps<typeof TextReviewPane>> = {}) {
  const onOpenChange = props.onOpenChange ?? vi.fn();
  return render(
    <TextReviewPane text="Hello world" open={true} onOpenChange={onOpenChange} {...props} />,
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TextReviewPane', () => {
  it('renders header with default title "Text review"', () => {
    renderPane({ open: true });
    expect(screen.getByText('Text review')).toBeTruthy();
  });

  it('renders header with custom title', () => {
    renderPane({ open: true, title: 'OCR output' });
    expect(screen.getByText('OCR output')).toBeTruthy();
  });

  it('aria-expanded is true when open', () => {
    renderPane({ open: true });
    const btn = screen.getByTestId(TEXT_REVIEW_PANE_TOGGLE);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
  });

  it('aria-expanded is false when closed', () => {
    renderPane({ open: false });
    const btn = screen.getByTestId(TEXT_REVIEW_PANE_TOGGLE);
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  it('clicking toggle calls onOpenChange with the opposite value (open → close)', () => {
    const onOpenChange = vi.fn();
    renderPane({ open: true, onOpenChange });
    fireEvent.click(screen.getByTestId(TEXT_REVIEW_PANE_TOGGLE));
    expect(onOpenChange).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('clicking toggle calls onOpenChange with the opposite value (closed → open)', () => {
    const onOpenChange = vi.fn();
    renderPane({ open: false, onOpenChange });
    fireEvent.click(screen.getByTestId(TEXT_REVIEW_PANE_TOGGLE));
    expect(onOpenChange).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('content section has hidden attribute when open=false', () => {
    renderPane({ open: false });
    // The content div id is generated via React.useId(); find via aria-controls.
    const toggleBtn = screen.getByTestId(TEXT_REVIEW_PANE_TOGGLE);
    const contentId = toggleBtn.getAttribute('aria-controls');
    expect(contentId).not.toBeNull();
    const content = contentId ? document.getElementById(contentId) : null;
    expect(content).not.toBeNull();
    expect(content?.hasAttribute('hidden')).toBe(true);
  });

  it('content section does not have hidden attribute when open=true', () => {
    renderPane({ open: true });
    // The content div id is generated via React.useId(); find via aria-controls.
    const toggleBtn = screen.getByTestId(TEXT_REVIEW_PANE_TOGGLE);
    const contentId = toggleBtn.getAttribute('aria-controls');
    expect(contentId).not.toBeNull();
    const content = contentId ? document.getElementById(contentId) : null;
    expect(content).not.toBeNull();
    expect(content?.hasAttribute('hidden')).toBe(false);
  });

  it('string text renders inside a <pre> element', () => {
    renderPane({ open: true, text: 'Sample OCR text' });
    const pre = document.querySelector('.text-review-pane__pre');
    expect(pre).not.toBeNull();
    expect(pre?.textContent).toBe('Sample OCR text');
  });

  it('ReactNode text renders as-is (not wrapped in <pre>)', () => {
    const { container } = render(
      <TextReviewPane
        text={<span data-testid="rich-content">Rich content</span>}
        open={true}
        onOpenChange={vi.fn()}
      />,
    );
    expect(screen.getByTestId('rich-content')).toBeTruthy();
    // Should NOT be inside a pre
    const pre = container.querySelector('pre');
    expect(pre).toBeNull();
  });

  it('forwards data-testid to outer section', () => {
    renderPane({ open: true, 'data-testid': 'custom-id' });
    const section = document.querySelector('[data-testid="custom-id"]');
    expect(section?.tagName.toLowerCase()).toBe('section');
  });

  it('falls back to TEXT_REVIEW_PANE testid when data-testid is omitted', () => {
    renderPane({ open: true });
    expect(screen.getByTestId(TEXT_REVIEW_PANE)).toBeTruthy();
  });

  it('outer section has data-open=true when open', () => {
    renderPane({ open: true });
    const section = screen.getByTestId(TEXT_REVIEW_PANE);
    expect(section.getAttribute('data-open')).toBe('true');
  });

  it('outer section has data-open=false when closed', () => {
    renderPane({ open: false });
    const section = screen.getByTestId(TEXT_REVIEW_PANE);
    expect(section.getAttribute('data-open')).toBe('false');
  });
});
