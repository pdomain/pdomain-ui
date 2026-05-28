/**
 * AppShell #30 — launcherSlot controls placement and visibility.
 *
 * Regression tests for the audit finding that launcherSlot='off' still
 * showed the launcher and launcherSlot='rail' never moved it.
 *
 * Three behaviours are tested:
 *   'header' (default) — LauncherSlot appears inside the header zone
 *   'rail'             — LauncherSlot appears inside the rail zone (not header)
 *   'off'              — LauncherSlot is not rendered at all
 */
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppShell } from '../../src/shell/AppShell.js';
import { SuiteSiblingsContext } from '../../src/shell/SuiteSiblingsContext.js';
import type {
  AppShellProps,
  UIPrefsConfig,
  InstalledApp,
  LaunchResult,
} from '../../src/shell/types.js';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makePrefsConfig(overrides?: Partial<UIPrefsConfig>): UIPrefsConfig {
  return {
    load: () =>
      Promise.resolve({
        theme: 'dark' as const,
        density: 'normal' as const,
        fontScale: 1.0,
      }),
    persistCommon: vi.fn().mockResolvedValue(undefined),
    persistApp: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function minimalProps(overrides?: Partial<AppShellProps>): AppShellProps {
  return {
    appId: 'test-app',
    appDisplayName: 'Test App',
    appIconUrl: '/icon.svg',
    main: <div data-testid="slot-main">main</div>,
    uiPrefsConfig: makePrefsConfig(),
    ...overrides,
  };
}

function makeSibling(id: string): InstalledApp {
  return {
    id,
    displayName: `App ${id}`,
    iconUrl: `/icons/${id}.svg`,
    launchUrl: `http://localhost:3000/${id}`,
  };
}

/**
 * Wraps <AppShell> with a SuiteSiblingsContext so LauncherSlot has siblings
 * to render. Without siblings LauncherSlot always returns null regardless of
 * placement — we need at least one sibling to exercise the positioning logic.
 */
function renderWithSiblings(
  props: AppShellProps,
  siblings: InstalledApp[] = [makeSibling('app-b')],
  launch: (id: string) => Promise<LaunchResult> = vi.fn(),
) {
  return render(
    <SuiteSiblingsContext.Provider value={{ siblings, launch, loading: false, error: null }}>
      <AppShell {...props} />
    </SuiteSiblingsContext.Provider>,
  );
}

// ─── launcherSlot='header' (default) ─────────────────────────────────────────

describe("AppShell #30 — launcherSlot='header' (default)", () => {
  it('renders launcher-slot when launcherSlot is omitted (defaults to header)', () => {
    renderWithSiblings(minimalProps());
    expect(screen.getByTestId('launcher-slot')).toBeTruthy();
  });

  it('launcher-slot is inside the header zone when launcherSlot=header', () => {
    renderWithSiblings(minimalProps({ launcherSlot: 'header' }));
    const header = screen.getByTestId('app-shell-header');
    const launcher = screen.getByTestId('launcher-slot');
    expect(header.contains(launcher)).toBe(true);
  });

  it('launcher-slot is NOT inside the rail zone when launcherSlot=header', () => {
    renderWithSiblings(
      minimalProps({ launcherSlot: 'header', rail: <div data-testid="rail-content">rail</div> }),
    );
    const rail = screen.getByTestId('app-shell-rail');
    const launcher = screen.getByTestId('launcher-slot');
    expect(rail.contains(launcher)).toBe(false);
  });
});

// ─── launcherSlot='rail' ──────────────────────────────────────────────────────

describe("AppShell #30 — launcherSlot='rail'", () => {
  it('renders launcher-slot when launcherSlot=rail', () => {
    renderWithSiblings(minimalProps({ launcherSlot: 'rail' }));
    expect(screen.getByTestId('launcher-slot')).toBeTruthy();
  });

  it('launcher-slot is inside the rail zone when launcherSlot=rail', () => {
    renderWithSiblings(minimalProps({ launcherSlot: 'rail' }));
    const rail = screen.getByTestId('app-shell-rail');
    const launcher = screen.getByTestId('launcher-slot');
    expect(rail.contains(launcher)).toBe(true);
  });

  it('launcher-slot is NOT inside the header zone when launcherSlot=rail', () => {
    renderWithSiblings(minimalProps({ launcherSlot: 'rail' }));
    const header = screen.getByTestId('app-shell-header');
    const launcher = screen.getByTestId('launcher-slot');
    expect(header.contains(launcher)).toBe(false);
  });

  it('rail content is preserved alongside launcher when launcherSlot=rail', () => {
    renderWithSiblings(
      minimalProps({
        launcherSlot: 'rail',
        rail: <div data-testid="rail-content">nav items</div>,
      }),
    );
    const rail = screen.getByTestId('app-shell-rail');
    expect(rail.contains(screen.getByTestId('rail-content'))).toBe(true);
    expect(rail.contains(screen.getByTestId('launcher-slot'))).toBe(true);
  });
});

// ─── launcherSlot='off' ───────────────────────────────────────────────────────

describe("AppShell #30 — launcherSlot='off'", () => {
  it('does not render launcher-slot when launcherSlot=off', () => {
    renderWithSiblings(minimalProps({ launcherSlot: 'off' }));
    expect(screen.queryByTestId('launcher-slot')).toBeNull();
  });

  it('header still renders (without launcher) when launcherSlot=off', () => {
    renderWithSiblings(minimalProps({ launcherSlot: 'off' }));
    expect(screen.getByTestId('app-shell-header')).toBeTruthy();
    expect(screen.getByTestId('settings-slot-trigger')).toBeTruthy();
  });

  it('rail zone has no launcher when launcherSlot=off', () => {
    renderWithSiblings(
      minimalProps({
        launcherSlot: 'off',
        rail: <div data-testid="rail-content">nav</div>,
      }),
    );
    const rail = screen.getByTestId('app-shell-rail');
    expect(rail.contains(screen.getByTestId('rail-content'))).toBe(true);
    expect(screen.queryByTestId('launcher-slot')).toBeNull();
  });
});

// ─── no siblings — LauncherSlot always hides regardless of placement ──────────

describe('AppShell #30 — no siblings baseline', () => {
  it('no launcher-slot rendered when siblings is empty even with launcherSlot=header', () => {
    renderWithSiblings(minimalProps({ launcherSlot: 'header' }), []);
    expect(screen.queryByTestId('launcher-slot')).toBeNull();
  });

  it('no launcher-slot rendered when siblings is empty even with launcherSlot=rail', () => {
    renderWithSiblings(minimalProps({ launcherSlot: 'rail' }), []);
    expect(screen.queryByTestId('launcher-slot')).toBeNull();
  });
});
