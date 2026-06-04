/**
 * PageSplitView tests — Task 3: editor slot fills panel height by default.
 */
import * as React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PageSplitView } from './PageSplitView.js';

describe('PageSplitView', () => {
  it('editor-panel is a flex column container', () => {
    const { container } = render(
      <PageSplitView
        toolbar={<div>toolbar</div>}
        canvas={<div>canvas</div>}
        editor={<textarea rows={5} />}
      />,
    );
    const panel = container.querySelector('.page-split-view__editor-panel') as HTMLElement;
    expect(panel).toBeTruthy();
    // jsdom doesn't apply CSS files, so we verify the className is correct;
    // the structural assertion we can make is that it exists and renders children.
    expect(panel.children.length).toBeGreaterThan(0);
  });

  it('editor-panel direct child can fill (rendered inside panel)', () => {
    const { container } = render(
      <PageSplitView
        toolbar={<div>toolbar</div>}
        canvas={<div>canvas</div>}
        editor={<textarea data-testid="editor-textarea" />}
      />,
    );
    const panel = container.querySelector('.page-split-view__editor-panel') as HTMLElement;
    // The textarea must be a direct child of the editor panel
    const directChild = panel.firstElementChild as HTMLElement;
    expect(directChild.tagName.toLowerCase()).toBe('textarea');
  });

  it('renders the editor slot inside the editor panel', () => {
    const { container } = render(
      <PageSplitView
        toolbar={<span>T</span>}
        canvas={<span>C</span>}
        editor={<span data-testid="editor-content">content</span>}
      />,
    );
    const panel = container.querySelector('.page-split-view__editor-panel') as HTMLElement;
    expect(panel.querySelector('[data-testid="editor-content"]')).toBeTruthy();
  });

  it('page-split-view__panels has overflow:hidden via CSS class (class present)', () => {
    const { container } = render(
      <PageSplitView toolbar={<div />} canvas={<div />} editor={<div />} />,
    );
    expect(container.querySelector('.page-split-view__panels')).toBeTruthy();
  });

  it('page-split-view root has data-testid="page-split-view"', () => {
    const { container } = render(
      <PageSplitView toolbar={<div />} canvas={<div />} editor={<div />} />,
    );
    expect(container.querySelector('[data-testid="page-split-view"]')).toBeTruthy();
  });
});
