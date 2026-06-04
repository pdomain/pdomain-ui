/**
 * AppShell reflow tests — Task 4: main content area must have min-width:0
 * so content reflows when the pinned dock narrows the main column.
 */
import * as React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AppShell } from './AppShell.js';

// Minimal UIPrefsConfig stub
const stubPrefsConfig = {
  load: () => Promise.resolve({ theme: 'dark' as const, density: 'normal' as const, fontScale: 1 }),
  persistCommon: () => Promise.resolve(),
  persistApp: () => Promise.resolve(),
};

describe('AppShell reflow under pinned dock', () => {
  it('app-shell-main element has data-testid="app-shell-main"', () => {
    const { container } = render(
      <AppShell appId="test" appDisplayName="Test" uiPrefsConfig={stubPrefsConfig}>
        <div>content</div>
      </AppShell>,
    );
    const main = container.querySelector('[data-testid="app-shell-main"]') as HTMLElement;
    expect(main).toBeTruthy();
  });

  it('app-shell-main has min-w-0 class (Tailwind) for reflow', () => {
    const { container } = render(
      <AppShell appId="test" appDisplayName="Test" uiPrefsConfig={stubPrefsConfig}>
        <div>content</div>
      </AppShell>,
    );
    const main = container.querySelector('[data-testid="app-shell-main"]') as HTMLElement;
    // Tailwind min-w-0 class ensures min-width:0px — verified via className
    expect(main.className).toContain('min-w-0');
  });
});
