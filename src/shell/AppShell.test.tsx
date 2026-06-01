/**
 * AppShell tests — covering #157 (types/context), #158 (grid skeleton).
 * Updated for built-in header (always rendered) and UIPrefsApplicator.
 */
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AppShell } from './AppShell.js';
import { useAppShell } from './AppShellContext.js';
import type { AppShellProps } from './types.js';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function noopPrefsConfig(): AppShellProps['uiPrefsConfig'] {
  return {
    load: () =>
      Promise.resolve({ theme: 'dark' as const, density: 'normal' as const, fontScale: 1.0 }),
    persistCommon: () => Promise.resolve(),
    persistApp: () => Promise.resolve(),
  };
}

function minimalProps(overrides?: Partial<AppShellProps>): AppShellProps {
  return {
    appId: 'test-app',
    appDisplayName: 'Test App',
    appIconUrl: '/icon.svg',
    main: <div data-testid="slot-main">main</div>,
    uiPrefsConfig: noopPrefsConfig(),
    ...overrides,
  };
}

// ─── Context consumer helper ──────────────────────────────────────────────────

function ContextReadout() {
  const ctx = useAppShell();
  return (
    <div>
      <span data-testid="ctx-appId">{ctx.appId}</span>
      <span data-testid="ctx-deployMode">{ctx.deployMode}</span>
      <span data-testid="ctx-launcherSlot">{ctx.launcherSlot}</span>
      <span data-testid="ctx-appDisplayName">{ctx.appDisplayName}</span>
    </div>
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AppShell — grid skeleton (#158)', () => {
  it('renders main slot content', () => {
    render(<AppShell {...minimalProps()} />);
    expect(screen.getByTestId('slot-main')).toBeTruthy();
  });

  it('renders the shell root with data-testid="app-shell"', () => {
    render(<AppShell {...minimalProps()} />);
    expect(screen.getByTestId('app-shell')).toBeTruthy();
  });

  it('always renders the header zone (built-in header by default)', () => {
    render(<AppShell {...minimalProps()} />);
    expect(screen.getByTestId('app-shell-header')).toBeTruthy();
  });

  it('renders built-in header with appDisplayName when no custom header provided', () => {
    render(<AppShell {...minimalProps({ appDisplayName: 'My Suite App' })} />);
    expect(screen.getByText('My Suite App')).toBeTruthy();
  });

  it('renders custom header content when header prop is provided', () => {
    render(
      <AppShell {...minimalProps({ header: <div data-testid="custom-header">custom</div> })} />,
    );
    expect(screen.getByTestId('custom-header')).toBeTruthy();
  });

  it('renders rail slot when provided', () => {
    render(<AppShell {...minimalProps({ rail: <div data-testid="slot-rail">rail</div> })} />);
    expect(screen.getByTestId('slot-rail')).toBeTruthy();
  });

  it('renders drawer slot when provided', () => {
    render(<AppShell {...minimalProps({ drawer: <div data-testid="slot-drawer">drawer</div> })} />);
    expect(screen.getByTestId('slot-drawer')).toBeTruthy();
  });

  it('renders rightPanel slot when provided', () => {
    render(
      <AppShell {...minimalProps({ rightPanel: <div data-testid="slot-rightPanel">rp</div> })} />,
    );
    expect(screen.getByTestId('slot-rightPanel')).toBeTruthy();
  });

  it('reserves default grid width for rightPanel when provided', () => {
    render(
      <AppShell {...minimalProps({ rightPanel: <div data-testid="slot-rightPanel">rp</div> })} />,
    );
    expect(screen.getByTestId('app-shell').style.gridTemplateColumns).toContain(
      'var(--shell-right-w, 520px)',
    );
  });

  it('built-in header renders the settings gear button', () => {
    render(<AppShell {...minimalProps()} />);
    expect(screen.getByTestId('settings-slot-trigger')).toBeTruthy();
  });
});

describe('AppShell — context (#157)', () => {
  it('provides deployMode default of "local" to descendants', () => {
    render(
      <AppShell {...minimalProps()}>
        <ContextReadout />
      </AppShell>,
    );
    expect(screen.getByTestId('ctx-deployMode').textContent).toBe('local');
  });

  it('provides deployMode "hosted" when prop set', () => {
    render(
      <AppShell {...minimalProps({ deployMode: 'hosted' })}>
        <ContextReadout />
      </AppShell>,
    );
    expect(screen.getByTestId('ctx-deployMode').textContent).toBe('hosted');
  });

  it('provides appId to descendants', () => {
    render(
      <AppShell {...minimalProps({ appId: 'my-app' })}>
        <ContextReadout />
      </AppShell>,
    );
    expect(screen.getByTestId('ctx-appId').textContent).toBe('my-app');
  });

  it('provides launcherSlot default of "header" to descendants', () => {
    render(
      <AppShell {...minimalProps()}>
        <ContextReadout />
      </AppShell>,
    );
    expect(screen.getByTestId('ctx-launcherSlot').textContent).toBe('header');
  });

  it('provides launcherSlot "off" when prop set', () => {
    render(
      <AppShell {...minimalProps({ launcherSlot: 'off' })}>
        <ContextReadout />
      </AppShell>,
    );
    expect(screen.getByTestId('ctx-launcherSlot').textContent).toBe('off');
  });

  it('provides appDisplayName to descendants', () => {
    render(
      <AppShell {...minimalProps({ appDisplayName: 'My App' })}>
        <ContextReadout />
      </AppShell>,
    );
    expect(screen.getByTestId('ctx-appDisplayName').textContent).toBe('My App');
  });
});
