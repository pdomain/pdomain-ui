/**
 * AppShell #20 — headerActions + settingsPanels + useSettingsModal
 *
 * Tests the AppShell-level prop wiring introduced in issue #20:
 *   - headerActions?: ReactNode rendered in header before launcher + gear
 *   - settingsPanels?: SettingsPanelDescriptor[] injected into Settings dock
 *   - useSettingsModal() hook: open / openModal / closeModal / openPanel(id)
 *   - SettingsModalContext provided by AppShell to all descendants
 *
 * After the M4 utility-dock migration, Settings renders inside the right-side
 * UtilityDock (SettingsPanel body) rather than the centered SettingsModal dialog.
 * Tests updated to assert the dock while preserving all behavior intent.
 * The `settings-modal-tab-*` and `settings-modal-panel-*` testids are preserved.
 */
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppShell } from '../../src/shell/AppShell.js';
import { useSettingsModal } from '../../src/shell/SettingsModalContext.js';
import type {
  AppShellProps,
  UIPrefsConfig,
  SettingsPanelDescriptor,
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

// ─── headerActions prop ────────────────────────────────────────────────────────

describe('AppShell #20 — headerActions prop', () => {
  it('renders headerActions content in the header', () => {
    render(
      <AppShell
        {...minimalProps()}
        headerActions={<button data-testid="export-btn">Export</button>}
      />,
    );
    expect(screen.getByTestId('export-btn')).toBeTruthy();
  });

  it('headerActions appear before the launcher and gear', () => {
    render(
      <AppShell
        {...minimalProps()}
        headerActions={<button data-testid="custom-action">Action</button>}
      />,
    );
    const header = screen.getByTestId('app-shell-header');
    const action = screen.getByTestId('custom-action');
    const gear = screen.getByTestId('settings-slot-trigger');

    // Both are inside the header
    expect(header.contains(action)).toBe(true);
    expect(header.contains(gear)).toBe(true);

    // action appears before gear in DOM order
    const position = action.compareDocumentPosition(gear);
    // DOCUMENT_POSITION_FOLLOWING = 4
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('omitting headerActions leaves header layout unchanged', () => {
    render(<AppShell {...minimalProps()} />);
    // Header still renders launcher + gear with no crash
    expect(screen.getByTestId('settings-slot-trigger')).toBeTruthy();
  });

  it('headerActions accepts any ReactNode (multiple elements)', () => {
    render(
      <AppShell
        {...minimalProps()}
        headerActions={
          <>
            <button data-testid="btn-a">A</button>
            <button data-testid="btn-b">B</button>
          </>
        }
      />,
    );
    expect(screen.getByTestId('btn-a')).toBeTruthy();
    expect(screen.getByTestId('btn-b')).toBeTruthy();
  });
});

// ─── settingsPanels prop ──────────────────────────────────────────────────────

describe('AppShell #20 — settingsPanels prop', () => {
  it('injected panels appear as tabs in Settings dock after Appearance', () => {
    const panels: SettingsPanelDescriptor[] = [
      { id: 'ocr', label: 'OCR Config', content: <div>OCR</div> },
    ];
    render(<AppShell {...minimalProps({ settingsPanels: panels })} />);

    fireEvent.click(screen.getByTestId('settings-slot-trigger'));

    // Appearance tab always first
    expect(screen.getByTestId('settings-modal-tab-appearance')).toBeTruthy();
    // Injected tab present
    expect(screen.getByTestId('settings-modal-tab-ocr')).toBeTruthy();
  });

  it('multiple injected panels produce multiple tabs', () => {
    const panels: SettingsPanelDescriptor[] = [
      { id: 'ocr', label: 'OCR', content: <div>OCR</div> },
      { id: 'export', label: 'Export', content: <div>Export</div> },
    ];
    render(<AppShell {...minimalProps({ settingsPanels: panels })} />);

    fireEvent.click(screen.getByTestId('settings-slot-trigger'));

    expect(screen.getByTestId('settings-modal-tab-appearance')).toBeTruthy();
    expect(screen.getByTestId('settings-modal-tab-ocr')).toBeTruthy();
    expect(screen.getByTestId('settings-modal-tab-export')).toBeTruthy();
  });

  it('clicking an injected tab shows its content', () => {
    const panels: SettingsPanelDescriptor[] = [
      {
        id: 'ocr',
        label: 'OCR Config',
        content: <div data-testid="ocr-content">OCR panel body</div>,
      },
    ];
    render(<AppShell {...minimalProps({ settingsPanels: panels })} />);

    fireEvent.click(screen.getByTestId('settings-slot-trigger'));
    fireEvent.click(screen.getByTestId('settings-modal-tab-ocr'));

    expect(screen.getByTestId('settings-modal-panel-ocr')).toBeTruthy();
    expect(screen.getByTestId('ocr-content')).toBeTruthy();
  });

  it('omitting settingsPanels renders only the Appearance tab', () => {
    render(<AppShell {...minimalProps()} />);

    fireEvent.click(screen.getByTestId('settings-slot-trigger'));

    expect(screen.getByTestId('settings-modal-tab-appearance')).toBeTruthy();
    expect(screen.getByTestId('settings-modal-panel-appearance')).toBeTruthy();
  });
});

// ─── useSettingsModal() hook ──────────────────────────────────────────────────

function OpenModalBtn() {
  const { openModal } = useSettingsModal();
  return (
    <button data-testid="hook-open" onClick={openModal}>
      open
    </button>
  );
}

function CloseModalBtn() {
  const { closeModal } = useSettingsModal();
  return (
    <button data-testid="hook-close" onClick={closeModal}>
      close
    </button>
  );
}

function OpenPanelBtn({ id }: { id: string }) {
  const { openPanel } = useSettingsModal();
  return (
    <button
      data-testid="hook-open-panel"
      onClick={() => {
        openPanel(id);
      }}
    >
      open panel
    </button>
  );
}

function ReadOpenState() {
  const { open } = useSettingsModal();
  return <span data-testid="open-state">{open ? 'open' : 'closed'}</span>;
}

describe('AppShell #20 — useSettingsModal() hook', () => {
  it('open is false initially', () => {
    render(<AppShell {...minimalProps()} main={<ReadOpenState />} />);
    expect(screen.getByTestId('open-state').textContent).toBe('closed');
  });

  it('openModal() opens the settings dock', () => {
    render(<AppShell {...minimalProps()} main={<OpenModalBtn />} />);
    fireEvent.click(screen.getByTestId('hook-open'));
    // Dock is open and settings panel is rendered
    expect(screen.getByTestId('utility-dock')).toBeTruthy();
    expect(screen.getByTestId('settings-panel')).toBeTruthy();
  });

  it('closeModal() closes the dock after openModal()', () => {
    render(
      <AppShell
        {...minimalProps()}
        main={
          <>
            <OpenModalBtn />
            <CloseModalBtn />
          </>
        }
      />,
    );
    fireEvent.click(screen.getByTestId('hook-open'));
    expect(screen.getByTestId('utility-dock')).toBeTruthy();
    fireEvent.click(screen.getByTestId('hook-close'));
    expect(screen.queryByTestId('utility-dock')).toBeNull();
  });

  it('openPanel(id) opens the dock with that panel active', () => {
    const panels: SettingsPanelDescriptor[] = [
      {
        id: 'ocr',
        label: 'OCR',
        content: <div data-testid="ocr-body">ocr body</div>,
      },
    ];
    render(
      <AppShell {...minimalProps({ settingsPanels: panels })} main={<OpenPanelBtn id="ocr" />} />,
    );

    fireEvent.click(screen.getByTestId('hook-open-panel'));

    expect(screen.getByTestId('utility-dock')).toBeTruthy();
    expect(screen.getByTestId('settings-modal-panel-ocr')).toBeTruthy();
    expect(screen.getByTestId('ocr-body')).toBeTruthy();
  });

  it('openPanel(appearance) opens to the built-in Appearance tab', () => {
    render(<AppShell {...minimalProps()} main={<OpenPanelBtn id="appearance" />} />);

    fireEvent.click(screen.getByTestId('hook-open-panel'));

    expect(screen.getByTestId('utility-dock')).toBeTruthy();
    expect(screen.getByTestId('settings-modal-panel-appearance')).toBeTruthy();
  });

  it('useSettingsModal throws when used outside AppShell', () => {
    const originalError = console.error;
    console.error = vi.fn();

    function OrphanConsumer() {
      useSettingsModal();
      return null;
    }

    expect(() => render(<OrphanConsumer />)).toThrow();
    console.error = originalError;
  });

  it('SettingsModalContext is provided to children (main slot)', () => {
    render(<AppShell {...minimalProps()} main={<ReadOpenState />} />);
    // If context were missing, ReadOpenState would throw; just verifying it renders
    expect(screen.getByTestId('open-state')).toBeTruthy();
  });
});
