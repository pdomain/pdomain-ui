---
kind: plan
status: implemented
owner: CT
created: 2026-06-02
last_verified: 2026-07-13
---

# Right-side Utility Panels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the three transient suite-chrome overlays (centered SettingsModal, ShortcutsCheatsheet dialog, JobsPill hover popover) with a single shell-owned right-side utility dock that shows one surface at a time, defaults to a non-modal slide-over, and can be pinned into a resizable right column.

**Architecture:** A new `SlideOverPanel` primitive renders a right-docked, scrim-free, non-modal panel with a header (title + pin toggle + ✕), Esc-to-close, focus-return, and a pin-only left-edge resize handle. AppShell owns dock state (`active`/`pinned`/`width`) via a new `UtilityDockContext`, persists `pinned`+`width` through the existing `createUIPrefsStore` common-prefs channel, and renders a `UtilityDock` outside the grid that switches on `active` between `SettingsPanel`, `ShortcutsCheatsheetBody`, and `JobsPanelBody`. When pinned, AppShell drives `--shell-right-w` so main reflows; the deprecated `rightPanel` grid prop is untouched. `useSettingsModal()` survives as a back-compat shim delegating to the dock.

**Tech Stack:** TypeScript, React, Vite, Vitest (jsdom), Zustand store factories, Storybook.

---

## Conventions for every task

- Tests are co-located beside source as `*.test.tsx` / `*.test.ts` (e.g. `src/primitives/SlideOverPanel.test.tsx`). Some legacy suites also live under `tests/` — new tests go beside the source.
- Run a single test file with `pnpm exec vitest run <path>`.
- Run the full pipeline with `make ci AI=1` (install + lint + typecheck + test + build). `AI=1` writes verbose output to `.ci-ai.log` and prints a pass/fail summary.
- Hard constraints (enforced by ESLint / `tsc`): **no `class-variance-authority`**, **no hex literals** in component styles (use `var(--token)`), **no direct `lucide-react` imports** outside `src/icons/` (import icons from `../icons/lucide.js`), **stores are factories not singletons**, strict TS (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`).
- `src/testids/index.ts` is a Playwright-driver contract: only **add** ids, never rename existing ones.
- Conventional-commit messages; commit after each green step. Use `make ci AI=1` before the milestone-boundary commits (the ones that say "milestone commit").
- All new testids used in this plan: `slide-over-panel`, `slide-over-panel-close`, `slide-over-panel-pin`, `slide-over-panel-resize`, `utility-dock`, `settings-panel`, `shortcuts-cheatsheet-body`, `jobs-panel-body`. Sub-panel tab/panel testids reuse the existing `settings-modal-tab-<id>` / `settings-modal-panel-<id>` helpers so consumer drivers keep working.

---

## M1 — Dock state foundation

State lives in two places: persisted `dockPinned`/`dockWidth` in the UIPrefs store, and ephemeral `active` in the new dock context.

### Task 1.1 — Extend `UIPrefs` type with `dockPinned` + `dockWidth`

- [ ] Edit `src/shell/types.ts`. Add two optional fields to the `UIPrefs` interface (after `accentInkColor`, before `app`):

```typescript
  /** Accent foreground override. When absent `--accent-ink` is used. */
  accentInkColor?: string;
  /** Whether the right-side utility dock is pinned (docked column vs. overlay). Default false. */
  dockPinned?: boolean;
  /** Pinned utility-dock width in px. Clamped to [320, 640]. Default 420. */
  dockWidth?: number;
  /** App-specific arbitrary preferences. */
  app?: Record<string, unknown>;
```

- [ ] `pnpm exec vitest run src/stores/UIPrefsStore.test.ts` — expect PASS (no behavior change yet; this is a type-only edit that must not break existing tests).
- [ ] Commit: `feat(types): add dockPinned/dockWidth to UIPrefs`

### Task 1.2 — Failing test: `setDockPinned` / `setDockWidth` store actions

- [ ] Append to `src/stores/UIPrefsStore.test.ts`, inside the top-level area after the existing `describe('createUIPrefsStore (#164)', ...)` block:

```typescript
describe('createUIPrefsStore — utility dock prefs', () => {
  it('setDockPinned() updates prefs.dockPinned and calls persistCommon', async () => {
    const config = makeConfig();
    const store = createUIPrefsStore(config);
    await new Promise((r) => setTimeout(r, 0));
    store.getState().setDockPinned(true);
    expect(store.getState().prefs.dockPinned).toBe(true);
    expect(config.persistCommon).toHaveBeenCalledWith(
      expect.objectContaining({ dockPinned: true }),
    );
  });

  it('setDockWidth() updates prefs.dockWidth and calls persistCommon', async () => {
    const config = makeConfig();
    const store = createUIPrefsStore(config);
    await new Promise((r) => setTimeout(r, 0));
    store.getState().setDockWidth(500);
    expect(store.getState().prefs.dockWidth).toBe(500);
    expect(config.persistCommon).toHaveBeenCalledWith(
      expect.objectContaining({ dockWidth: 500 }),
    );
  });

  it('setDockWidth() clamps below 320 up to 320', async () => {
    const store = createUIPrefsStore(makeConfig());
    await new Promise((r) => setTimeout(r, 0));
    store.getState().setDockWidth(100);
    expect(store.getState().prefs.dockWidth).toBe(320);
  });

  it('setDockWidth() clamps above 640 down to 640', async () => {
    const store = createUIPrefsStore(makeConfig());
    await new Promise((r) => setTimeout(r, 0));
    store.getState().setDockWidth(9999);
    expect(store.getState().prefs.dockWidth).toBe(640);
  });
});
```

- [ ] `pnpm exec vitest run src/stores/UIPrefsStore.test.ts` — expect FAIL (`setDockPinned`/`setDockWidth` do not exist).

### Task 1.3 — Implement `setDockPinned` / `setDockWidth` in the store

- [ ] Edit `src/stores/createUIPrefsStore.ts`. First, extend `commonPrefs()` so the new fields flow through `persistCommon`. Replace the body of `commonPrefs` (currently the function declared near the top of the file) with:

```typescript
function commonPrefs(prefs: UIPrefs): Omit<UIPrefs, 'app'> {
  // Build a new object without the `app` key.
  const out: Omit<UIPrefs, 'app'> = {
    theme: prefs.theme,
    density: prefs.density,
    fontScale: prefs.fontScale,
  };
  if (prefs.layerColors !== undefined) out.layerColors = prefs.layerColors;
  if (prefs.statusColors !== undefined) out.statusColors = prefs.statusColors;
  if (prefs.accentColor !== undefined) out.accentColor = prefs.accentColor;
  if (prefs.accentInkColor !== undefined) out.accentInkColor = prefs.accentInkColor;
  if (prefs.dockPinned !== undefined) out.dockPinned = prefs.dockPinned;
  if (prefs.dockWidth !== undefined) out.dockWidth = prefs.dockWidth;
  return out;
}
```

- [ ] In the `UIPrefsStoreState` interface (same file), add two action signatures after `setAccentInkColor`:

```typescript
  /** Set the accent ink (foreground on accent) color override and persist. */
  setAccentInkColor: (color: string | undefined) => void;

  // ── Utility dock prefs ─────────────────────────────────────────────────────
  /** Set whether the utility dock is pinned and persist. */
  setDockPinned: (pinned: boolean) => void;
  /** Set the pinned utility-dock width (clamped to [320, 640]) and persist. */
  setDockWidth: (px: number) => void;
```

- [ ] In the returned store object, add the two implementations after the existing `setAccentInkColor` setter (before `getLayerColor`):

```typescript
      setDockPinned: (pinned) => {
        _editedKeys.add('dockPinned');
        const prefs = { ...get().prefs, dockPinned: pinned };
        set({ prefs });
        handlePersist(config.persistCommon(commonPrefs(prefs)));
      },

      setDockWidth: (px) => {
        _editedKeys.add('dockWidth');
        const dockWidth = Math.min(640, Math.max(320, px));
        const prefs = { ...get().prefs, dockWidth };
        set({ prefs });
        handlePersist(config.persistCommon(commonPrefs(prefs)));
      },
```

- [ ] In the load-merge selective-merge branch (the `else` block inside `config.load().then(...)`), add `dockPinned`/`dockWidth` preservation so late server loads don't clobber edits. After the existing `const aiSrc = ...` line, add:

```typescript
          const dpSrc = _editedKeys.has('dockPinned') ? current : serverPrefs;
          const dwSrc = _editedKeys.has('dockWidth') ? current : serverPrefs;
```

  and after the existing `if (aiSrc.accentInkColor !== undefined) ...` line inside the `merged` construction, add:

```typescript
          if (dpSrc.dockPinned !== undefined) merged.dockPinned = dpSrc.dockPinned;
          if (dwSrc.dockWidth !== undefined) merged.dockWidth = dwSrc.dockWidth;
```

- [ ] `pnpm exec vitest run src/stores/UIPrefsStore.test.ts` — expect PASS.
- [ ] Commit: `feat(stores): setDockPinned/setDockWidth actions with width clamp`

### Task 1.4 — Failing test: `useDockPinned` / `useDockWidth` selector hooks

- [ ] Create `src/stores/UtilityDockSelectors.test.tsx`:

```typescript
/**
 * Selector-hook tests for useDockPinned / useDockWidth.
 * Mirrors the useTheme/useFontScale selector pattern in StoreContexts.tsx.
 */
import * as React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { createUIPrefsStore } from './createUIPrefsStore.js';
import { UIPrefsStoreProvider, useDockPinned, useDockWidth } from './index.js';
import type { UIPrefs, UIPrefsConfig } from '../shell/types.js';

function makeConfig(prefs: Partial<UIPrefs> = {}): UIPrefsConfig {
  return {
    load: vi.fn(() =>
      Promise.resolve({
        theme: 'dark' as const,
        density: 'normal' as const,
        fontScale: 1.0,
        ...prefs,
      }),
    ),
    persistCommon: vi.fn(() => Promise.resolve()),
    persistApp: vi.fn(() => Promise.resolve()),
  };
}

function Probe() {
  const pinned = useDockPinned();
  const width = useDockWidth();
  return (
    <div>
      <span data-testid="pinned">{String(pinned)}</span>
      <span data-testid="width">{width}</span>
    </div>
  );
}

describe('useDockPinned / useDockWidth', () => {
  it('defaults to false / 420 when prefs are unset', async () => {
    const store = createUIPrefsStore(makeConfig());
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
    render(
      <UIPrefsStoreProvider value={store}>
        <Probe />
      </UIPrefsStoreProvider>,
    );
    expect(screen.getByTestId('pinned').textContent).toBe('false');
    expect(screen.getByTestId('width').textContent).toBe('420');
  });

  it('reflects persisted values from the store', async () => {
    const store = createUIPrefsStore(makeConfig({ dockPinned: true, dockWidth: 500 }));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
    render(
      <UIPrefsStoreProvider value={store}>
        <Probe />
      </UIPrefsStoreProvider>,
    );
    expect(screen.getByTestId('pinned').textContent).toBe('true');
    expect(screen.getByTestId('width').textContent).toBe('500');
  });

  it('useDockPinned throws outside a provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Probe />)).toThrow(/UIPrefsStoreProvider/);
    spy.mockRestore();
  });
});
```

- [ ] `pnpm exec vitest run src/stores/UtilityDockSelectors.test.tsx` — expect FAIL (`useDockPinned`/`useDockWidth` are not exported).

### Task 1.5 — Implement `useDockPinned` / `useDockWidth` selectors

- [ ] Edit `src/stores/StoreContexts.tsx`. After the existing `useAccentColor()` function (the last hook in the UIPrefs section), add:

```typescript
export function useDockPinned() {
  const store = React.useContext(UIPrefsStoreContext);
  if (!store) throw new Error('useDockPinned() must be used inside <UIPrefsStoreProvider>');
  return useStore(store, (s) => s.prefs.dockPinned ?? false);
}

export function useDockWidth() {
  const store = React.useContext(UIPrefsStoreContext);
  if (!store) throw new Error('useDockWidth() must be used inside <UIPrefsStoreProvider>');
  return useStore(store, (s) => s.prefs.dockWidth ?? 420);
}
```

- [ ] Edit `src/stores/index.ts`. Add the two hooks to the existing context-bound hooks re-export block (the `export { useSelection, ... } from './StoreContexts.js';` list):

```typescript
export {
  useSelection,
  useViewport,
  useWorklist,
  useUIPrefs,
  useTheme,
  useDensity,
  useFontScale,
  useLayerColor,
  useStatusColor,
  useAccentColor,
  useDockPinned,
  useDockWidth,
} from './StoreContexts.js';
```

- [ ] `pnpm exec vitest run src/stores/UtilityDockSelectors.test.tsx` — expect PASS.
- [ ] Commit: `feat(stores): useDockPinned/useDockWidth selector hooks`

### Task 1.6 — Failing test: `UtilityDockContext` + `useUtilityDock()`

- [ ] Create `src/shell/UtilityDockContext.test.tsx`:

```typescript
/**
 * UtilityDockContext tests — verifies the context value shape, mutual
 * exclusion of `active`, toggle behavior, and the throw-outside-provider guard.
 */
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UtilityDockContext, useUtilityDock } from './UtilityDockContext.js';
import type { UtilityDockContextValue, DockSurface } from './UtilityDockContext.js';

function makeCtx(overrides?: Partial<UtilityDockContextValue>): UtilityDockContextValue {
  return {
    active: null,
    pinned: false,
    width: 420,
    open: vi.fn(),
    close: vi.fn(),
    toggle: vi.fn(),
    setPinned: vi.fn(),
    setWidth: vi.fn(),
    ...overrides,
  };
}

function Probe() {
  const dock = useUtilityDock();
  return <span data-testid="active">{dock.active ?? 'none'}</span>;
}

describe('useUtilityDock', () => {
  it('reads the active surface from context', () => {
    const ctx = makeCtx({ active: 'settings' as DockSurface });
    render(
      <UtilityDockContext.Provider value={ctx}>
        <Probe />
      </UtilityDockContext.Provider>,
    );
    expect(screen.getByTestId('active').textContent).toBe('settings');
  });

  it('throws when used outside an AppShell provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Probe />)).toThrow(/AppShell/);
    spy.mockRestore();
  });

  it('exposes open/close/toggle/setPinned/setWidth callbacks', () => {
    const open = vi.fn();
    const toggle = vi.fn();
    const ctx = makeCtx({ open, toggle });
    function Caller() {
      const dock = useUtilityDock();
      return (
        <div>
          <button data-testid="open" onClick={() => dock.open('jobs')} />
          <button data-testid="toggle" onClick={() => dock.toggle('keybinds')} />
        </div>
      );
    }
    render(
      <UtilityDockContext.Provider value={ctx}>
        <Caller />
      </UtilityDockContext.Provider>,
    );
    fireEvent.click(screen.getByTestId('open'));
    fireEvent.click(screen.getByTestId('toggle'));
    expect(open).toHaveBeenCalledWith('jobs');
    expect(toggle).toHaveBeenCalledWith('keybinds');
  });
});
```

- [ ] `pnpm exec vitest run src/shell/UtilityDockContext.test.tsx` — expect FAIL (module does not exist).

### Task 1.7 — Implement `UtilityDockContext` + `useUtilityDock()`

- [ ] Create `src/shell/UtilityDockContext.ts`:

```typescript
/**
 * UtilityDockContext — the shell-owned right-side utility dock.
 *
 * One surface is visible at a time (`active`). Settings + Keybinds + Jobs all
 * share the single right edge, so `active` gives mutual exclusion for free.
 * `pinned` + `width` are backed by UIPrefs (persisted); `active` is ephemeral.
 *
 * Provided by <AppShell>. `useUtilityDock()` throws if used outside one.
 */
import * as React from 'react';

/** The three suite-chrome surfaces that share the right-edge dock. */
export type DockSurface = 'settings' | 'keybinds' | 'jobs';

export interface UtilityDockContextValue {
  /** The currently-open surface, or null when the dock is closed. */
  active: DockSurface | null;
  /** Whether the dock is pinned (docked column) vs. overlay (slide-over). */
  pinned: boolean;
  /** Current dock width in px (used when pinned and for the slide-over width). */
  width: number;
  /** Open a surface (replaces any currently-open surface). */
  open: (surface: DockSurface) => void;
  /** Close the dock entirely. */
  close: () => void;
  /** Open the surface if closed/other; close it if it is already active. */
  toggle: (surface: DockSurface) => void;
  /** Set pinned state (persisted via UIPrefs). */
  setPinned: (pinned: boolean) => void;
  /** Set width in px (persisted + clamped via UIPrefs). */
  setWidth: (px: number) => void;
}

export const UtilityDockContext = React.createContext<UtilityDockContextValue | null>(null);

/**
 * Returns the utility-dock context value. Must be called from a component
 * rendered inside an `<AppShell>` — throws if the context is missing.
 */
export function useUtilityDock(): UtilityDockContextValue {
  const ctx = React.useContext(UtilityDockContext);
  if (ctx === null) {
    throw new Error('useUtilityDock() must be used inside an <AppShell>');
  }
  return ctx;
}
```

- [ ] `pnpm exec vitest run src/shell/UtilityDockContext.test.tsx` — expect PASS.
- [ ] Commit: `feat(shell): UtilityDockContext + useUtilityDock hook`

---

## M2 — `SlideOverPanel` primitive

A right-docked, non-modal, scrim-free overlay panel. It is **not** built on Radix Dialog (Radix Dialog traps focus and renders a modal overlay; the spec requires non-modal + no scrim + outside-click never closes). It is a plain portal-free absolutely-positioned panel rendered by `UtilityDock` inside AppShell's subtree.

### Task 2.1 — Failing test: render, title, close button, Esc

- [ ] Create `src/primitives/SlideOverPanel.test.tsx`:

```typescript
/**
 * SlideOverPanel tests — non-modal right-docked overlay panel.
 *
 * Covers: render + title + ✕, Esc closes, ✕ closes, outside-click does NOT
 * close, no scrim / main stays interactive, focus returns to trigger on close,
 * pin toggle, resize handle (pinned only) updates + clamps width.
 */
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SlideOverPanel } from './SlideOverPanel.js';

describe('SlideOverPanel — basics', () => {
  it('renders the title and body when open', () => {
    render(
      <SlideOverPanel open title="Settings" onClose={vi.fn()}>
        <p>body content</p>
      </SlideOverPanel>,
    );
    expect(screen.getByTestId('slide-over-panel')).toBeTruthy();
    expect(screen.getByText('Settings')).toBeTruthy();
    expect(screen.getByText('body content')).toBeTruthy();
  });

  it('renders nothing when open is false', () => {
    render(
      <SlideOverPanel open={false} title="Settings" onClose={vi.fn()}>
        <p>body content</p>
      </SlideOverPanel>,
    );
    expect(screen.queryByTestId('slide-over-panel')).toBeNull();
  });

  it('has role="dialog" and aria-label set to the title', () => {
    render(
      <SlideOverPanel open title="Jobs" onClose={vi.fn()}>
        <p>body</p>
      </SlideOverPanel>,
    );
    const panel = screen.getByTestId('slide-over-panel');
    expect(panel.getAttribute('role')).toBe('dialog');
    expect(panel.getAttribute('aria-label')).toBe('Jobs');
    expect(panel.getAttribute('aria-modal')).toBe('false');
  });

  it('clicking ✕ calls onClose', () => {
    const onClose = vi.fn();
    render(
      <SlideOverPanel open title="Settings" onClose={onClose}>
        <p>body</p>
      </SlideOverPanel>,
    );
    fireEvent.click(screen.getByTestId('slide-over-panel-close'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('pressing Escape calls onClose', () => {
    const onClose = vi.fn();
    render(
      <SlideOverPanel open title="Settings" onClose={onClose}>
        <p>body</p>
      </SlideOverPanel>,
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
```

- [ ] `pnpm exec vitest run src/primitives/SlideOverPanel.test.tsx` — expect FAIL (module does not exist).

### Task 2.2 — Implement `SlideOverPanel` (render + Esc + ✕)

- [ ] Create `src/primitives/SlideOverPanel.tsx`:

```typescript
/**
 * SlideOverPanel — right-docked, non-modal overlay panel.
 *
 * Unlike the Dialog primitive (Radix, modal, scrim, focus-trap), SlideOverPanel
 * is deliberately NON-modal: no scrim, main content stays fully interactive,
 * and outside-click never closes. Close happens only via Esc, the ✕ button, or
 * the owner toggling state. On close, focus returns to the element that was
 * focused before open (the trigger).
 *
 * Width comes from the `width` prop (px). A left-edge resize handle is rendered
 * only when `pinned` is true; dragging it calls `onResize(px)` with the live
 * width. All colors are var(--token) only — no hex literals.
 */
import * as React from 'react';
import { X, Pin, PinOff } from '../icons/lucide.js';

export interface SlideOverPanelProps {
  /** Whether the panel is open. When false, renders nothing. */
  open: boolean;
  /** Accessible title shown in the header and used as aria-label. */
  title: string;
  /** Close handler — called by Esc and the ✕ button. */
  onClose: () => void;
  /** Panel body. */
  children: React.ReactNode;
  /** Pinned (docked column) vs. overlay. Controls the resize handle + style. */
  pinned?: boolean;
  /** Called when the pin toggle is clicked, with the new pinned value. */
  onTogglePin?: (pinned: boolean) => void;
  /** Width in px. Defaults to 420. */
  width?: number;
  /** Called with the live width (px) while the resize handle is dragged. Pinned only. */
  onResize?: (px: number) => void;
}

const PANEL_DEFAULT_WIDTH = 420;
const WIDTH_MIN = 320;
const WIDTH_MAX = 640;

export function SlideOverPanel({
  open,
  title,
  onClose,
  children,
  pinned = false,
  onTogglePin,
  width = PANEL_DEFAULT_WIDTH,
  onResize,
}: SlideOverPanelProps): React.ReactElement | null {
  // Remember the element focused before open so we can restore it on close.
  const triggerRef = React.useRef<Element | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement;
      // Move focus into the panel for keyboard users (non-trapping).
      panelRef.current?.focus();
    } else if (triggerRef.current instanceof HTMLElement) {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [open]);

  // Esc closes (window-level, only while open).
  React.useEffect(() => {
    if (!open) return undefined;
    function onKeyDown(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  // Left-edge resize drag (pinned only). Width grows as the pointer moves left.
  const onResizePointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!pinned || onResize === undefined) return;
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = width;
      function onMove(ev: PointerEvent): void {
        const delta = startX - ev.clientX;
        const next = Math.min(WIDTH_MAX, Math.max(WIDTH_MIN, startWidth + delta));
        onResize?.(next);
      }
      function onUp(): void {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      }
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [pinned, onResize, width],
  );

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      data-testid="slide-over-panel"
      role="dialog"
      aria-modal="false"
      aria-label={title}
      tabIndex={-1}
      style={{
        position: 'absolute',
        top: 'var(--shell-header-h, 56px)',
        right: 0,
        bottom: 0,
        width,
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border-1)',
        boxShadow: pinned ? 'none' : 'var(--shadow-overlay)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 40,
        outline: 'none',
      }}
    >
      {/* Left-edge resize handle — pinned only */}
      {pinned ? (
        <div
          data-testid="slide-over-panel-resize"
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize panel"
          onPointerDown={onResizePointerDown}
          style={{
            position: 'absolute',
            left: -3,
            top: 0,
            bottom: 0,
            width: 6,
            cursor: 'ew-resize',
            background: 'transparent',
          }}
        />
      ) : null}

      {/* Header: title + pin toggle + ✕ */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          padding: '12px 14px',
          borderBottom: '1px solid var(--border-2)',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-1)' }}>{title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            type="button"
            data-testid="slide-over-panel-pin"
            aria-label={pinned ? 'Unpin panel' : 'Pin panel'}
            aria-pressed={pinned}
            onClick={() => onTogglePin?.(!pinned)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              padding: 0,
              border: '1px solid var(--border-2)',
              borderRadius: 5,
              background: pinned ? 'var(--bg-raised)' : 'transparent',
              color: pinned ? 'var(--ink-1)' : 'var(--ink-3)',
              cursor: 'pointer',
            }}
          >
            {pinned ? <PinOff size={14} aria-hidden /> : <Pin size={14} aria-hidden />}
          </button>
          <button
            type="button"
            data-testid="slide-over-panel-close"
            aria-label="Close panel"
            onClick={onClose}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              padding: 0,
              border: '1px solid var(--border-2)',
              borderRadius: 5,
              background: 'transparent',
              color: 'var(--ink-3)',
              cursor: 'pointer',
            }}
          >
            <X size={14} aria-hidden />
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>{children}</div>
    </div>
  );
}

SlideOverPanel.displayName = 'SlideOverPanel';
```

- [ ] Confirm `Pin`, `PinOff`, and `X` are exported from `src/icons/lucide.ts`. Run `pnpm exec vitest run src/primitives/SlideOverPanel.test.tsx`. If it fails with a missing-icon import error, add the missing icon(s) to `src/icons/lucide.ts` by re-exporting from `lucide-react` in the same style as the existing icons there (e.g. `export { Pin, PinOff } from 'lucide-react';`), then re-run. `X` is already used by JobsDrawer so it exists.
- [ ] `pnpm exec vitest run src/primitives/SlideOverPanel.test.tsx` — expect PASS.
- [ ] Commit: `feat(primitives): SlideOverPanel render + Esc + close`

### Task 2.3 — Failing test: no scrim / main interactive + outside-click does not close

- [ ] Append to `src/primitives/SlideOverPanel.test.tsx`:

```typescript
describe('SlideOverPanel — non-modal behavior', () => {
  it('renders no scrim / overlay element', () => {
    render(
      <SlideOverPanel open title="Settings" onClose={vi.fn()}>
        <p>body</p>
      </SlideOverPanel>,
    );
    // Dialog primitive scrim uses the .dialog-overlay class; SlideOverPanel must not render one.
    expect(document.querySelector('.dialog-overlay')).toBeNull();
    // aria-modal is explicitly false so AT does not treat the rest of the page as inert.
    expect(screen.getByTestId('slide-over-panel').getAttribute('aria-modal')).toBe('false');
  });

  it('clicking outside the panel does NOT close it', () => {
    const onClose = vi.fn();
    render(
      <div>
        <button data-testid="outside">main button</button>
        <SlideOverPanel open title="Settings" onClose={onClose}>
          <p>body</p>
        </SlideOverPanel>
      </div>,
    );
    fireEvent.pointerDown(screen.getByTestId('outside'));
    fireEvent.click(screen.getByTestId('outside'));
    expect(onClose).not.toHaveBeenCalled();
    // Outside button is still clickable (main remains interactive).
    expect(screen.getByTestId('outside')).toBeTruthy();
  });
});
```

- [ ] `pnpm exec vitest run src/primitives/SlideOverPanel.test.tsx` — expect PASS (the implementation from Task 2.2 already satisfies these — there is no scrim element and no outside-click listener). This task documents and locks the non-modal contract; if it fails, the implementation regressed.
- [ ] Commit: `test(primitives): lock SlideOverPanel non-modal / outside-click contract`

### Task 2.4 — Failing test: focus returns to trigger on close

- [ ] Append to `src/primitives/SlideOverPanel.test.tsx`:

```typescript
describe('SlideOverPanel — focus return', () => {
  it('returns focus to the previously-focused trigger when closed', () => {
    function Harness() {
      const [open, setOpen] = React.useState(false);
      return (
        <div>
          <button data-testid="trigger" onClick={() => setOpen(true)}>
            open
          </button>
          <SlideOverPanel open={open} title="Settings" onClose={() => setOpen(false)}>
            <p>body</p>
          </SlideOverPanel>
        </div>
      );
    }
    render(<Harness />);
    const trigger = screen.getByTestId('trigger');
    trigger.focus();
    expect(document.activeElement).toBe(trigger);
    fireEvent.click(trigger); // opens
    fireEvent.keyDown(window, { key: 'Escape' }); // closes
    expect(document.activeElement).toBe(trigger);
  });
});
```

- [ ] `pnpm exec vitest run src/primitives/SlideOverPanel.test.tsx` — expect PASS (Task 2.2 already restores focus via `triggerRef`). If it fails, fix the focus-return effect.
- [ ] Commit: `test(primitives): lock SlideOverPanel focus-return contract`

### Task 2.5 — Failing test: pin toggle + resize updates + clamps width

- [ ] Append to `src/primitives/SlideOverPanel.test.tsx`:

```typescript
describe('SlideOverPanel — pin + resize', () => {
  it('pin toggle calls onTogglePin with the inverted value', () => {
    const onTogglePin = vi.fn();
    render(
      <SlideOverPanel open title="Settings" onClose={vi.fn()} pinned={false} onTogglePin={onTogglePin}>
        <p>body</p>
      </SlideOverPanel>,
    );
    fireEvent.click(screen.getByTestId('slide-over-panel-pin'));
    expect(onTogglePin).toHaveBeenCalledWith(true);
  });

  it('does NOT render a resize handle when not pinned', () => {
    render(
      <SlideOverPanel open title="Settings" onClose={vi.fn()} pinned={false}>
        <p>body</p>
      </SlideOverPanel>,
    );
    expect(screen.queryByTestId('slide-over-panel-resize')).toBeNull();
  });

  it('renders a resize handle when pinned and reports dragged width', () => {
    const onResize = vi.fn();
    render(
      <SlideOverPanel open title="Settings" onClose={vi.fn()} pinned width={420} onResize={onResize}>
        <p>body</p>
      </SlideOverPanel>,
    );
    const handle = screen.getByTestId('slide-over-panel-resize');
    expect(handle).toBeTruthy();
    // Start drag at x=1000, move left to x=900 → +100px → 520.
    fireEvent.pointerDown(handle, { clientX: 1000 });
    fireEvent(window, new PointerEvent('pointermove', { clientX: 900 }));
    expect(onResize).toHaveBeenLastCalledWith(520);
    fireEvent(window, new PointerEvent('pointerup', {}));
  });

  it('clamps resize within [320, 640]', () => {
    const onResize = vi.fn();
    render(
      <SlideOverPanel open title="Settings" onClose={vi.fn()} pinned width={420} onResize={onResize}>
        <p>body</p>
      </SlideOverPanel>,
    );
    const handle = screen.getByTestId('slide-over-panel-resize');
    fireEvent.pointerDown(handle, { clientX: 1000 });
    // Move far right (shrink past min) → clamps to 320.
    fireEvent(window, new PointerEvent('pointermove', { clientX: 1500 }));
    expect(onResize).toHaveBeenLastCalledWith(320);
    // Move far left (grow past max) → clamps to 640.
    fireEvent(window, new PointerEvent('pointermove', { clientX: 200 }));
    expect(onResize).toHaveBeenLastCalledWith(640);
    fireEvent(window, new PointerEvent('pointerup', {}));
  });
});
```

- [ ] `pnpm exec vitest run src/primitives/SlideOverPanel.test.tsx` — expect PASS (Task 2.2 implements pin toggle + clamped resize). If the `PointerEvent` constructor is unavailable in jsdom, fall back to `new Event('pointermove')` with `Object.defineProperty(ev, 'clientX', { value })` — but verify first; jsdom in this repo supports `PointerEvent`.
- [ ] Commit: `test(primitives): lock SlideOverPanel pin + resize-clamp contract`

---

## M3 — Surface bodies

Extract content-only bodies from the existing modal/dialog/drawer components so both the legacy components and the new dock can render the same content.

### Task 3.1 — Failing test: `SettingsPanel` body (Appearance + injected panels + sub-panel selection)

- [ ] Create `src/shell/SettingsPanel.test.tsx`:

```typescript
/**
 * SettingsPanel tests — the dock body for the Settings surface.
 *
 * Parity with the prior SettingsModal panels: Appearance is always first,
 * app-injected settingsPanels follow, and sub-panel selection switches the
 * rendered content. Reuses the existing settings-modal-tab-<id> /
 * settings-modal-panel-<id> testids so consumer Playwright drivers keep working.
 */
import * as React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { createUIPrefsStore } from '../stores/createUIPrefsStore.js';
import { UIPrefsStoreProvider } from '../stores/index.js';
import { SettingsPanel } from './SettingsPanel.js';
import type { UIPrefsConfig } from './types.js';

function makeConfig(): UIPrefsConfig {
  return {
    load: vi.fn(() => Promise.resolve({ theme: 'dark' as const, density: 'normal' as const, fontScale: 1.0 })),
    persistCommon: vi.fn(() => Promise.resolve()),
    persistApp: vi.fn(() => Promise.resolve()),
  };
}

async function renderPanel(props: React.ComponentProps<typeof SettingsPanel>) {
  const store = createUIPrefsStore(makeConfig());
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });
  return render(
    <UIPrefsStoreProvider value={store}>
      <SettingsPanel {...props} />
    </UIPrefsStoreProvider>,
  );
}

describe('SettingsPanel', () => {
  it('renders the built-in Appearance tab first and active by default', async () => {
    await renderPanel({ activePanel: 'appearance', onSelectPanel: vi.fn() });
    expect(screen.getByTestId('settings-modal-tab-appearance')).toBeTruthy();
    expect(screen.getByTestId('settings-modal-panel-appearance')).toBeTruthy();
  });

  it('renders app-injected panels after Appearance', async () => {
    await renderPanel({
      activePanel: 'appearance',
      onSelectPanel: vi.fn(),
      settingsPanels: [{ id: 'export', label: 'Export', content: <div>export body</div> }],
    });
    expect(screen.getByTestId('settings-modal-tab-export')).toBeTruthy();
  });

  it('clicking a tab calls onSelectPanel with that id', async () => {
    const onSelectPanel = vi.fn();
    await renderPanel({
      activePanel: 'appearance',
      onSelectPanel,
      settingsPanels: [{ id: 'export', label: 'Export', content: <div>export body</div> }],
    });
    fireEvent.click(screen.getByTestId('settings-modal-tab-export'));
    expect(onSelectPanel).toHaveBeenCalledWith('export');
  });

  it('renders the active sub-panel content when activePanel is an injected id', async () => {
    await renderPanel({
      activePanel: 'export',
      onSelectPanel: vi.fn(),
      settingsPanels: [{ id: 'export', label: 'Export', content: <div>export body</div> }],
    });
    expect(screen.getByTestId('settings-modal-panel-export')).toBeTruthy();
    expect(screen.getByText('export body')).toBeTruthy();
  });

  it('falls back to appearance when activePanel does not match any panel', async () => {
    await renderPanel({ activePanel: 'nope', onSelectPanel: vi.fn() });
    expect(screen.getByTestId('settings-modal-panel-appearance')).toBeTruthy();
  });
});
```

- [ ] `pnpm exec vitest run src/shell/SettingsPanel.test.tsx` — expect FAIL (module does not exist).

### Task 3.2 — Implement `SettingsPanel`

- [ ] Create `src/shell/SettingsPanel.tsx`. This is the content-only body (no Dialog wrapper, no ✕ — the dock header owns the close). It is a controlled component: the dock owns `activePanel` and supplies `onSelectPanel`.

```typescript
/**
 * SettingsPanel — content-only Settings body rendered inside the utility dock.
 *
 * Parity with the prior SettingsModal: a left vertical tab nav (Appearance
 * first, then app-injected settingsPanels) + a right content pane showing the
 * active sub-panel. Controlled: the dock owns the active sub-panel id and
 * passes it in via `activePanel`; tab clicks call `onSelectPanel`.
 *
 * Reuses the existing settings-modal-tab-<id> / settings-modal-panel-<id>
 * testids so consumer Playwright drivers continue to work after the modal→dock
 * migration. No ✕ here — the SlideOverPanel header owns close.
 */
import * as React from 'react';
import { AppearancePanel } from './AppearancePanel.js';
import type { SettingsPanelDescriptor } from './types.js';

interface PanelEntry {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

export interface SettingsPanelProps {
  /** The currently-active sub-panel id. */
  activePanel: string;
  /** Called when a tab is clicked, with the selected sub-panel id. */
  onSelectPanel: (panelId: string) => void;
  /** App-injected panels, appended after the built-in Appearance panel. */
  settingsPanels?: SettingsPanelDescriptor[];
}

export function SettingsPanel({
  activePanel,
  onSelectPanel,
  settingsPanels,
}: SettingsPanelProps): React.ReactElement {
  const tablistId = React.useId();

  const panels: PanelEntry[] = [
    { id: 'appearance', label: 'Appearance', content: <AppearancePanel /> },
    ...(settingsPanels ?? []),
  ];

  const resolvedActive = panels.some((p) => p.id === activePanel) ? activePanel : 'appearance';

  return (
    <div
      data-testid="settings-panel"
      style={{ display: 'flex', flexDirection: 'row', gap: 0, height: '100%', minHeight: 0 }}
    >
      {/* Left tab nav */}
      <nav
        aria-label="Settings panels"
        style={{
          width: 148,
          flexShrink: 0,
          borderRight: '1px solid var(--border-2)',
          display: 'flex',
          flexDirection: 'column',
          paddingRight: 8,
        }}
      >
        <div
          role="tablist"
          aria-label="Settings panels"
          aria-orientation="vertical"
          id={tablistId}
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          {panels.map((panel, idx) => {
            const isActive = panel.id === resolvedActive;
            return (
              <button
                key={panel.id}
                type="button"
                role="tab"
                id={`${tablistId}-tab-${panel.id}`}
                aria-selected={isActive}
                aria-controls={`${tablistId}-panel-${panel.id}`}
                tabIndex={isActive ? 0 : -1}
                data-testid={`settings-modal-tab-${panel.id}`}
                onClick={() => {
                  onSelectPanel(panel.id);
                }}
                onKeyDown={(e) => {
                  const last = panels.length - 1;
                  let next = idx;
                  if (e.key === 'ArrowDown') next = idx === last ? 0 : idx + 1;
                  else if (e.key === 'ArrowUp') next = idx === 0 ? last : idx - 1;
                  else if (e.key === 'Home') next = 0;
                  else if (e.key === 'End') next = last;
                  else return;
                  e.preventDefault();
                  onSelectPanel(panels[next]?.id ?? panel.id);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  border: 'none',
                  background: isActive ? 'var(--bg-raised)' : 'transparent',
                  color: isActive ? 'var(--ink-1)' : 'var(--ink-3)',
                  fontFamily: 'var(--ui-font)',
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  borderRadius: 6,
                  margin: '1px 0',
                  textAlign: 'left',
                }}
              >
                {panel.icon}
                <span>{panel.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Active panel content */}
      <div
        role="tabpanel"
        id={`${tablistId}-panel-${resolvedActive}`}
        aria-labelledby={`${tablistId}-tab-${resolvedActive}`}
        data-testid={`settings-modal-panel-${resolvedActive}`}
        style={{ flex: 1, overflowY: 'auto', paddingLeft: 16, minWidth: 0 }}
      >
        {panels.find((p) => p.id === resolvedActive)?.content}
      </div>
    </div>
  );
}

SettingsPanel.displayName = 'SettingsPanel';
```

- [ ] `pnpm exec vitest run src/shell/SettingsPanel.test.tsx` — expect PASS.
- [ ] Commit: `feat(shell): SettingsPanel dock body`

### Task 3.3 — Failing test: `ShortcutsCheatsheetBody`

- [ ] Create `src/primitives/ShortcutsCheatsheetBody.test.tsx`:

```typescript
/**
 * ShortcutsCheatsheetBody tests — the content-only cheatsheet for the dock.
 * Same grouped-by-`group` rendering as ShortcutsCheatsheet, minus the Dialog.
 */
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ShortcutsCheatsheetBody } from './ShortcutsCheatsheetBody.js';
import type { ShortcutBinding } from '../hooks/useShortcuts.js';

const bindings: ShortcutBinding[] = [
  { keys: 'g', label: 'Go to page', group: 'Navigation', handler: () => undefined },
  { keys: 's', label: 'Save', group: 'Editing', handler: () => undefined },
  { keys: '?', label: 'Help', handler: () => undefined },
];

describe('ShortcutsCheatsheetBody', () => {
  it('renders the body wrapper testid', () => {
    render(<ShortcutsCheatsheetBody bindings={bindings} />);
    expect(screen.getByTestId('shortcuts-cheatsheet-body')).toBeTruthy();
  });

  it('renders each binding label', () => {
    render(<ShortcutsCheatsheetBody bindings={bindings} />);
    expect(screen.getByText('Go to page')).toBeTruthy();
    expect(screen.getByText('Save')).toBeTruthy();
    expect(screen.getByText('Help')).toBeTruthy();
  });

  it('groups by the group field with ungrouped under General', () => {
    render(<ShortcutsCheatsheetBody bindings={bindings} />);
    expect(screen.getByText('Navigation')).toBeTruthy();
    expect(screen.getByText('Editing')).toBeTruthy();
    expect(screen.getByText('General')).toBeTruthy();
  });
});
```

- [ ] `pnpm exec vitest run src/primitives/ShortcutsCheatsheetBody.test.tsx` — expect FAIL (module does not exist).

### Task 3.4 — Implement `ShortcutsCheatsheetBody` and refactor `ShortcutsCheatsheet` to reuse it

- [ ] Create `src/primitives/ShortcutsCheatsheetBody.tsx` (extracted from `ShortcutsCheatsheet.tsx`, content-only):

```typescript
/**
 * ShortcutsCheatsheetBody — content-only keyboard-shortcut reference.
 *
 * Renders all bindings grouped by their `group` field (ungrouped → "General").
 * Extracted from ShortcutsCheatsheet so both the legacy Dialog and the utility
 * dock render identical content. Uses the design-system .shortcuts__* classes.
 */
import * as React from 'react';
import { KeyCap } from './KeyCap.js';
import { formatShortcut } from '../hooks/useShortcuts.js';
import type { ShortcutBinding } from '../hooks/useShortcuts.js';

export interface ShortcutsCheatsheetBodyProps {
  bindings: ShortcutBinding[];
}

const DEFAULT_GROUP = 'General';

function groupBindings(bindings: ShortcutBinding[]): Map<string, ShortcutBinding[]> {
  const map = new Map<string, ShortcutBinding[]>();
  for (const binding of bindings) {
    const g = binding.group ?? DEFAULT_GROUP;
    let arr = map.get(g);
    if (arr === undefined) {
      arr = [];
      map.set(g, arr);
    }
    arr.push(binding);
  }
  return map;
}

export function ShortcutsCheatsheetBody({
  bindings,
}: ShortcutsCheatsheetBodyProps): React.ReactElement {
  const grouped = groupBindings(bindings);
  return (
    <div className="shortcuts__grid" data-testid="shortcuts-cheatsheet-body">
      {Array.from(grouped.entries()).map(([group, items]) => (
        <section key={group} className="shortcuts__group">
          <div className="shortcuts__title">{group}</div>
          <div className="shortcuts__rows">
            {items.map((binding) => (
              <div key={binding.keys} className="shortcuts__row">
                <span className="shortcuts__label">{binding.label}</span>
                <KeyCap keys={formatShortcut(binding.keys)} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

ShortcutsCheatsheetBody.displayName = 'ShortcutsCheatsheetBody';
```

- [ ] Refactor `src/primitives/ShortcutsCheatsheet.tsx` to reuse the body. Replace the `groupBindings` function and the inline `.shortcuts__grid` JSX with a render of `<ShortcutsCheatsheetBody bindings={bindings} />`. The new file:

```typescript
/**
 * ShortcutsCheatsheet — presentational keyboard shortcut reference dialog.
 *
 * Thin Dialog wrapper around ShortcutsCheatsheetBody (the shared content).
 * Retained for back-compat; the utility dock renders ShortcutsCheatsheetBody
 * directly.
 */
import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './Dialog.js';
import { ShortcutsCheatsheetBody } from './ShortcutsCheatsheetBody.js';
import type { ShortcutBinding } from '../hooks/useShortcuts.js';

export interface ShortcutsCheatsheetProps {
  open: boolean;
  onClose: () => void;
  bindings: ShortcutBinding[];
}

export function ShortcutsCheatsheet({
  open,
  onClose,
  bindings,
}: ShortcutsCheatsheetProps): React.ReactElement {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent data-testid="shortcuts-cheatsheet">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
        </DialogHeader>
        <ShortcutsCheatsheetBody bindings={bindings} />
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] `pnpm exec vitest run src/primitives/ShortcutsCheatsheetBody.test.tsx` — expect PASS.
- [ ] `pnpm exec vitest run src/primitives/ShortcutsCheatsheet.test.tsx` — expect PASS (existing test still passes; it asserts the `shortcuts-cheatsheet` testid and grouped labels, both still present). If that test file does not exist, skip this sub-step.
- [ ] Commit: `refactor(primitives): extract ShortcutsCheatsheetBody, reuse in dialog`

### Task 3.5 — Failing test: `JobsPanelBody`

- [ ] Create `src/shell/JobsPanelBody.test.tsx`:

```typescript
/**
 * JobsPanelBody tests — the dock body for the Jobs surface.
 * Reuses the JobRow list extracted from JobsDrawer.
 */
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { JobsPanelBody } from './JobsPanelBody.js';
import type { Job } from './JobRow.js';

const jobs: Job[] = [
  { id: 'j1', project: 'belloc', phase: 'OCR', pct: 40, status: 'running', cancelable: true },
  { id: 'j2', project: 'chesterton', phase: 'Ingest', pct: 100, status: 'done', cancelable: false },
];

describe('JobsPanelBody', () => {
  it('renders the body wrapper testid', () => {
    render(<JobsPanelBody activeJobs={jobs} />);
    expect(screen.getByTestId('jobs-panel-body')).toBeTruthy();
  });

  it('renders a JobRow per active job', () => {
    render(<JobsPanelBody activeJobs={jobs} />);
    expect(screen.getAllByTestId('job-row').length).toBe(2);
  });

  it('renders an empty state when there are no jobs', () => {
    render(<JobsPanelBody activeJobs={[]} />);
    expect(screen.queryByTestId('job-row')).toBeNull();
    expect(screen.getByText(/no active jobs/i)).toBeTruthy();
  });

  it('forwards onJobOpen to JobRow', () => {
    const onJobOpen = vi.fn();
    render(<JobsPanelBody activeJobs={jobs} onJobOpen={onJobOpen} />);
    // JobRow exposes an Open affordance; clicking the first row's open button fires the callback.
    const openButtons = screen.getAllByRole('button', { name: /open/i });
    fireEvent.click(openButtons[0]!);
    expect(onJobOpen).toHaveBeenCalledWith('j1');
  });

  it('forwards onViewAll via the View all jobs button', () => {
    const onViewAll = vi.fn();
    render(<JobsPanelBody activeJobs={jobs} onViewAll={onViewAll} />);
    fireEvent.click(screen.getByTestId('jobs-panel-body-view-all'));
    expect(onViewAll).toHaveBeenCalledOnce();
  });
});
```

- [ ] `pnpm exec vitest run src/shell/JobsPanelBody.test.tsx` — expect FAIL (module does not exist). Before implementing, open `src/shell/JobRow.tsx` to confirm the Open button's accessible name; if it is not matched by `/open/i`, adjust the `onJobOpen` test to target the JobRow's actual open affordance (e.g. by testid). Verify, don't guess.

### Task 3.6 — Implement `JobsPanelBody`

- [ ] Create `src/shell/JobsPanelBody.tsx` (the JobRow list extracted from JobsDrawer's expanded body, plus a View-all footer; no drawer chrome — the dock header owns close):

```typescript
/**
 * JobsPanelBody — content-only Jobs body rendered inside the utility dock.
 *
 * Reuses <JobRow> for each active job (the same list JobsDrawer renders in its
 * expanded mode) plus a "View all jobs" footer. No drawer chrome / dismiss /
 * collapse — the SlideOverPanel header owns close. All colors var(--token).
 */
import * as React from 'react';
import { ArrowRight } from '../icons/lucide.js';
import { JobRow } from './JobRow.js';
import type { Job, JobRowProps } from './JobRow.js';

export interface JobsPanelBodyProps {
  /** Currently active jobs. */
  activeJobs?: Job[];
  /** Called with job.id when a row's Open button is clicked. */
  onJobOpen?: JobRowProps['onOpen'];
  /** Called with job.id when a row's Pause/Resume button is clicked. */
  onJobPauseResume?: JobRowProps['onPauseResume'];
  /** Called with job.id when a row's Cancel button is clicked. */
  onJobCancel?: JobRowProps['onCancel'];
  /** Called when the "View all jobs" footer is clicked. */
  onViewAll?: () => void;
}

export function JobsPanelBody({
  activeJobs = [],
  onJobOpen,
  onJobPauseResume,
  onJobCancel,
  onViewAll,
}: JobsPanelBodyProps): React.ReactElement {
  const [hoveredId, setHoveredId] = React.useState<string | undefined>(undefined);

  return (
    <div
      data-testid="jobs-panel-body"
      style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}
    >
      {activeJobs.length === 0 ? (
        <div style={{ padding: '14px 4px', fontSize: 12, color: 'var(--ink-3)' }}>
          No active jobs. Background ingest, OCR runs, and exports will appear here.
        </div>
      ) : (
        <>
          {activeJobs.map((job) => (
            <div
              key={job.id}
              onMouseEnter={() => {
                setHoveredId(job.id);
              }}
              onMouseLeave={() => {
                setHoveredId(undefined);
              }}
            >
              <JobRow
                job={job}
                hovered={hoveredId === job.id}
                {...(onJobOpen !== undefined ? { onOpen: onJobOpen } : {})}
                {...(onJobPauseResume !== undefined ? { onPauseResume: onJobPauseResume } : {})}
                {...(onJobCancel !== undefined ? { onCancel: onJobCancel } : {})}
              />
            </div>
          ))}
          <button
            type="button"
            data-testid="jobs-panel-body-view-all"
            onClick={onViewAll}
            style={{
              marginTop: 8,
              padding: '8px 4px',
              background: 'transparent',
              border: 0,
              borderTopWidth: 1,
              borderTopStyle: 'solid',
              borderTopColor: 'var(--border-1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>View all jobs</span>
            <ArrowRight size={12} aria-hidden style={{ color: 'var(--ink-3)' }} />
          </button>
        </>
      )}
    </div>
  );
}

JobsPanelBody.displayName = 'JobsPanelBody';
```

- [ ] `pnpm exec vitest run src/shell/JobsPanelBody.test.tsx` — expect PASS.
- [ ] Commit: `feat(shell): JobsPanelBody dock body reusing JobRow`

---

## M4 — `UtilityDock` renderer + AppShell integration

### Task 4.1 — Failing test: `UtilityDock` renders the active surface inside `SlideOverPanel`

- [ ] Create `src/shell/UtilityDock.test.tsx`:

```typescript
/**
 * UtilityDock tests — switches on the dock context's `active` value and renders
 * the matching surface body inside a SlideOverPanel. Closed when active is null.
 */
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { act } from '@testing-library/react';
import { createUIPrefsStore } from '../stores/createUIPrefsStore.js';
import { UIPrefsStoreProvider } from '../stores/index.js';
import { UtilityDock } from './UtilityDock.js';
import { UtilityDockContext } from './UtilityDockContext.js';
import type { UtilityDockContextValue, DockSurface } from './UtilityDockContext.js';
import type { UIPrefsConfig } from './types.js';

function makeConfig(): UIPrefsConfig {
  return {
    load: vi.fn(() => Promise.resolve({ theme: 'dark' as const, density: 'normal' as const, fontScale: 1.0 })),
    persistCommon: vi.fn(() => Promise.resolve()),
    persistApp: vi.fn(() => Promise.resolve()),
  };
}

function makeCtx(overrides?: Partial<UtilityDockContextValue>): UtilityDockContextValue {
  return {
    active: null,
    pinned: false,
    width: 420,
    open: vi.fn(),
    close: vi.fn(),
    toggle: vi.fn(),
    setPinned: vi.fn(),
    setWidth: vi.fn(),
    ...overrides,
  };
}

async function renderDock(ctx: UtilityDockContextValue, props?: React.ComponentProps<typeof UtilityDock>) {
  const store = createUIPrefsStore(makeConfig());
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });
  return render(
    <UIPrefsStoreProvider value={store}>
      <UtilityDockContext.Provider value={ctx}>
        <UtilityDock {...props} />
      </UtilityDockContext.Provider>
    </UIPrefsStoreProvider>,
  );
}

describe('UtilityDock', () => {
  it('renders nothing when active is null', async () => {
    await renderDock(makeCtx({ active: null }));
    expect(screen.queryByTestId('utility-dock')).toBeNull();
    expect(screen.queryByTestId('slide-over-panel')).toBeNull();
  });

  it('renders the Settings surface when active is settings', async () => {
    await renderDock(makeCtx({ active: 'settings' as DockSurface }));
    expect(screen.getByTestId('utility-dock')).toBeTruthy();
    expect(screen.getByTestId('settings-panel')).toBeTruthy();
    expect(screen.getByText('Settings')).toBeTruthy();
  });

  it('renders the Keybinds surface when active is keybinds', async () => {
    await renderDock(makeCtx({ active: 'keybinds' as DockSurface }), {
      bindings: [{ keys: 's', label: 'Save', handler: () => undefined }],
    });
    expect(screen.getByTestId('shortcuts-cheatsheet-body')).toBeTruthy();
  });

  it('renders the Jobs surface when active is jobs', async () => {
    await renderDock(makeCtx({ active: 'jobs' as DockSurface }), {
      activeJobs: [{ id: 'j1', project: 'belloc', phase: 'OCR', pct: 40, status: 'running', cancelable: true }],
    });
    expect(screen.getByTestId('jobs-panel-body')).toBeTruthy();
  });

  it('the panel ✕ calls the context close()', async () => {
    const close = vi.fn();
    await renderDock(makeCtx({ active: 'settings' as DockSurface, close }));
    fireEvent.click(screen.getByTestId('slide-over-panel-close'));
    expect(close).toHaveBeenCalledOnce();
  });

  it('the pin toggle calls context setPinned with the inverted value', async () => {
    const setPinned = vi.fn();
    await renderDock(makeCtx({ active: 'settings' as DockSurface, pinned: false, setPinned }));
    fireEvent.click(screen.getByTestId('slide-over-panel-pin'));
    expect(setPinned).toHaveBeenCalledWith(true);
  });
});
```

- [ ] `pnpm exec vitest run src/shell/UtilityDock.test.tsx` — expect FAIL (module does not exist).

### Task 4.2 — Implement `UtilityDock`

- [ ] Create `src/shell/UtilityDock.tsx`. It owns the Settings sub-panel selection state (the old `activePanel`), reads dock state from `useUtilityDock()`, and renders the active surface inside `SlideOverPanel`.

```typescript
/**
 * UtilityDock — renders the active utility-dock surface inside a SlideOverPanel.
 *
 * Rendered by AppShell outside the grid (like SettingsModal was). Reads dock
 * state from useUtilityDock() and switches on `active`:
 *   settings → SettingsPanel   keybinds → ShortcutsCheatsheetBody   jobs → JobsPanelBody
 *
 * Owns the Settings sub-panel selection (the old SettingsModal activePanel).
 * Close / pin / resize are wired to the dock context. No scrim, non-modal.
 */
import * as React from 'react';
import { SlideOverPanel } from '../primitives/SlideOverPanel.js';
import { ShortcutsCheatsheetBody } from '../primitives/ShortcutsCheatsheetBody.js';
import { SettingsPanel } from './SettingsPanel.js';
import { JobsPanelBody } from './JobsPanelBody.js';
import { useUtilityDock } from './UtilityDockContext.js';
import type { SettingsPanelDescriptor } from './types.js';
import type { ShortcutBinding } from '../hooks/useShortcuts.js';
import type { Job, JobRowProps } from './JobRow.js';

const SURFACE_TITLES: Record<'settings' | 'keybinds' | 'jobs', string> = {
  settings: 'Settings',
  keybinds: 'Keyboard shortcuts',
  jobs: 'Jobs',
};

export interface UtilityDockProps {
  /** App-injected settings panels (forwarded to SettingsPanel). */
  settingsPanels?: SettingsPanelDescriptor[];
  /** Keyboard bindings for the Keybinds surface. */
  bindings?: ShortcutBinding[];
  /** Active jobs for the Jobs surface. */
  activeJobs?: Job[];
  /** Forwarded to JobsPanelBody / JobRow. */
  onJobOpen?: JobRowProps['onOpen'];
  onJobPauseResume?: JobRowProps['onPauseResume'];
  onJobCancel?: JobRowProps['onCancel'];
  onJobsViewAll?: () => void;
  /** Controlled initial Settings sub-panel (e.g. when openPanel(id) was called). */
  initialSettingsPanel?: string;
}

export function UtilityDock({
  settingsPanels,
  bindings = [],
  activeJobs = [],
  onJobOpen,
  onJobPauseResume,
  onJobCancel,
  onJobsViewAll,
  initialSettingsPanel,
}: UtilityDockProps): React.ReactElement | null {
  const { active, pinned, width, close, setPinned, setWidth } = useUtilityDock();
  const [settingsSubPanel, setSettingsSubPanel] = React.useState('appearance');

  // When the dock requests a specific settings sub-panel (via openPanel(id)),
  // adopt it. The shim sets initialSettingsPanel before opening.
  React.useEffect(() => {
    if (initialSettingsPanel !== undefined) {
      setSettingsSubPanel(initialSettingsPanel);
    }
  }, [initialSettingsPanel]);

  if (active === null) return null;

  let body: React.ReactNode;
  if (active === 'settings') {
    body = (
      <SettingsPanel
        activePanel={settingsSubPanel}
        onSelectPanel={setSettingsSubPanel}
        {...(settingsPanels !== undefined ? { settingsPanels } : {})}
      />
    );
  } else if (active === 'keybinds') {
    body = <ShortcutsCheatsheetBody bindings={bindings} />;
  } else {
    body = (
      <JobsPanelBody
        activeJobs={activeJobs}
        {...(onJobOpen !== undefined ? { onJobOpen } : {})}
        {...(onJobPauseResume !== undefined ? { onJobPauseResume } : {})}
        {...(onJobCancel !== undefined ? { onJobCancel } : {})}
        {...(onJobsViewAll !== undefined ? { onViewAll: onJobsViewAll } : {})}
      />
    );
  }

  return (
    <div data-testid="utility-dock">
      <SlideOverPanel
        open
        title={SURFACE_TITLES[active]}
        onClose={close}
        pinned={pinned}
        onTogglePin={setPinned}
        width={width}
        onResize={setWidth}
      >
        {body}
      </SlideOverPanel>
    </div>
  );
}

UtilityDock.displayName = 'UtilityDock';
```

- [ ] `pnpm exec vitest run src/shell/UtilityDock.test.tsx` — expect PASS.
- [ ] Commit: `feat(shell): UtilityDock renderer switching on active surface`

### Task 4.3 — Failing test: AppShell owns dock state, provides context, drives `--shell-right-w` only when pinned

- [ ] Create `src/shell/AppShell.utilityDock.test.tsx`:

```typescript
/**
 * AppShell utility-dock integration tests.
 *
 * AppShell owns dock state (active/pinned/width), provides UtilityDockContext,
 * renders UtilityDock outside the grid, and sets --shell-right-w only when
 * pinned. `pinned`/`width` come from UIPrefs; `active` is ephemeral.
 */
import * as React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppShell } from './AppShell.js';
import { useUtilityDock } from './UtilityDockContext.js';
import type { UIPrefsConfig } from './types.js';

function makeConfig(prefs: Partial<{ dockPinned: boolean; dockWidth: number }> = {}): UIPrefsConfig {
  return {
    load: vi.fn(() =>
      Promise.resolve({ theme: 'dark' as const, density: 'normal' as const, fontScale: 1.0, ...prefs }),
    ),
    persistCommon: vi.fn(() => Promise.resolve()),
    persistApp: vi.fn(() => Promise.resolve()),
  };
}

/** Test harness: a button inside AppShell that drives the dock context. */
function DockControls() {
  const dock = useUtilityDock();
  return (
    <div>
      <button data-testid="open-settings" onClick={() => dock.open('settings')} />
      <button data-testid="toggle-jobs" onClick={() => dock.toggle('jobs')} />
      <button data-testid="pin" onClick={() => dock.setPinned(!dock.pinned)} />
      <span data-testid="active">{dock.active ?? 'none'}</span>
      <span data-testid="pinned">{String(dock.pinned)}</span>
    </div>
  );
}

async function renderShell(config: UIPrefsConfig = makeConfig()) {
  let result!: ReturnType<typeof render>;
  await act(async () => {
    result = render(
      <AppShell appId="t" appDisplayName="Test" appIconUrl="" uiPrefsConfig={config} main={<DockControls />} />,
    );
    await new Promise((r) => setTimeout(r, 0));
  });
  return result;
}

describe('AppShell — utility dock', () => {
  it('provides UtilityDockContext to descendants', async () => {
    await renderShell();
    expect(screen.getByTestId('active').textContent).toBe('none');
  });

  it('open(surface) sets active and renders the dock', async () => {
    await renderShell();
    fireEvent.click(screen.getByTestId('open-settings'));
    expect(screen.getByTestId('active').textContent).toBe('settings');
    expect(screen.getByTestId('utility-dock')).toBeTruthy();
  });

  it('toggle(surface) opens then closes the same surface', async () => {
    await renderShell();
    fireEvent.click(screen.getByTestId('toggle-jobs'));
    expect(screen.getByTestId('active').textContent).toBe('jobs');
    fireEvent.click(screen.getByTestId('toggle-jobs'));
    expect(screen.getByTestId('active').textContent).toBe('none');
  });

  it('opening a second surface swaps it (mutual exclusion)', async () => {
    await renderShell();
    fireEvent.click(screen.getByTestId('open-settings'));
    fireEvent.click(screen.getByTestId('toggle-jobs'));
    expect(screen.getByTestId('active').textContent).toBe('jobs');
    expect(screen.getAllByTestId('utility-dock').length).toBe(1);
  });

  it('does NOT set --shell-right-w when open but not pinned', async () => {
    await renderShell();
    fireEvent.click(screen.getByTestId('open-settings'));
    const shell = screen.getByTestId('app-shell');
    expect(shell.style.getPropertyValue('--shell-right-w')).toBe('');
  });

  it('sets --shell-right-w to the dock width when pinned', async () => {
    await renderShell(makeConfig({ dockPinned: true, dockWidth: 500 }));
    fireEvent.click(screen.getByTestId('open-settings'));
    const shell = screen.getByTestId('app-shell');
    expect(shell.style.getPropertyValue('--shell-right-w')).toBe('500px');
    expect(screen.getByTestId('pinned').textContent).toBe('true');
  });
});
```

- [ ] `pnpm exec vitest run src/shell/AppShell.utilityDock.test.tsx` — expect FAIL (AppShell does not provide the dock context yet).

### Task 4.4 — Implement AppShell dock integration

- [ ] Edit `src/shell/AppShell.tsx`. Add imports near the existing shell imports:

```typescript
import { UtilityDockContext } from './UtilityDockContext.js';
import type { DockSurface, UtilityDockContextValue } from './UtilityDockContext.js';
import { UtilityDock } from './UtilityDock.js';
import { useStore } from 'zustand';
```

- [ ] Inside the `AppShell` function body, after the `uiPrefsStore` is created (the `React.useMemo(() => createUIPrefsStore(...))` line) and before the `ctx` memo, add dock state. `pinned`/`width` are read from the store (persisted); `active` is local ephemeral state; pin/width writes go through the store actions:

```typescript
  // ── Utility dock state ──────────────────────────────────────────────────
  // `active` is ephemeral; `pinned`/`width` are persisted via UIPrefs.
  const [dockActive, setDockActive] = React.useState<DockSurface | null>(null);
  const dockPinned = useStore(uiPrefsStore, (s) => s.prefs.dockPinned ?? false);
  const dockWidth = useStore(uiPrefsStore, (s) => s.prefs.dockWidth ?? 420);
  const setDockPinned = useStore(uiPrefsStore, (s) => s.setDockPinned);
  const setDockWidth = useStore(uiPrefsStore, (s) => s.setDockWidth);

  const utilityDockCtx = React.useMemo<UtilityDockContextValue>(
    () => ({
      active: dockActive,
      pinned: dockPinned,
      width: dockWidth,
      open: (surface) => {
        setDockActive(surface);
      },
      close: () => {
        setDockActive(null);
      },
      toggle: (surface) => {
        setDockActive((cur) => (cur === surface ? null : surface));
      },
      setPinned: setDockPinned,
      setWidth: setDockWidth,
    }),
    [dockActive, dockPinned, dockWidth, setDockPinned, setDockWidth],
  );
```

- [ ] Keep the existing `settingsModalCtx`, but rewire it to delegate to the dock (back-compat shim). Track a settings sub-panel for `openPanel(id)`. Add this state and replace the `settingsModalCtx` memo:

```typescript
  // SettingsModal back-compat shim — delegates to the utility dock.
  // openModal → open('settings'); openPanel(id) → open('settings') + select sub-panel id.
  const [shimSettingsPanel, setShimSettingsPanel] = React.useState('appearance');
  const settingsModalCtx = React.useMemo(
    () => ({
      open: dockActive === 'settings',
      activePanel: shimSettingsPanel,
      openModal: () => {
        setDockActive('settings');
      },
      closeModal: () => {
        setDockActive((cur) => (cur === 'settings' ? null : cur));
      },
      openPanel: (panelId: string) => {
        setShimSettingsPanel(panelId);
        setDockActive('settings');
      },
    }),
    [dockActive, shimSettingsPanel],
  );
```

- [ ] Drive `--shell-right-w` only when pinned. Set a CSS variable on the grid container when `dockPinned` is true. Add this near the `drawerColumn` / `rightColumn` consts:

```typescript
  // When pinned, the utility dock drives --shell-right-w so main reflows.
  // When not pinned (overlay) or closed, leave the existing rightPanel logic alone.
  const shellRightWStyle: React.CSSProperties =
    dockPinned && dockActive !== null ? { ['--shell-right-w' as string]: `${dockWidth}px` } : {};
```

- [ ] Apply `shellRightWStyle` to the grid `<div data-testid="app-shell">` by spreading it into that element's `style` object (merge with the existing inline style — the spread goes last so it can set `--shell-right-w`):

```typescript
          <div
            data-testid="app-shell"
            style={{
              display: 'grid',
              gridTemplateAreas: footer
                ? '"header header header header" "rail drawer main right" "footer footer footer footer"'
                : '"header header header header" "rail drawer main right"',
              gridTemplateColumns: `var(--shell-rail-w, 64px) ${drawerColumn} 1fr ${rightColumn}`,
              gridTemplateRows: footer
                ? 'var(--shell-header-h, 56px) 1fr var(--shell-footer-h, auto)'
                : 'var(--shell-header-h, 56px) 1fr',
              height: '100%',
              width: '100%',
              overflow: 'hidden',
              ...shellRightWStyle,
            }}
          >
```

- [ ] Wrap the provider tree with `UtilityDockContext.Provider` and render `<UtilityDock>` outside the grid (alongside the existing `SettingsModal` render). Replace the `<SettingsModalContext.Provider value={settingsModalCtx}>` opening and the SettingsModal render block. The structure becomes: `UtilityDockContext.Provider` wrapping `SettingsModalContext.Provider`. After the grid `</div>`, render the dock and keep `SettingsModal` only as the back-compat path (see note below):

This is a structural change to the JSX returned by `AppShell`, not new code. Concretely:

1. The outermost wrapper inside the return was `<AppShellContext.Provider>` → `<SettingsModalContext.Provider>`. Add `<UtilityDockContext.Provider value={utilityDockCtx}>` as a new wrapper **between** `AppShellContext.Provider` and `SettingsModalContext.Provider` (so the dock context is in scope for everything the settings shim and the grid see).
2. Leave the existing grid `<div data-testid="app-shell" style={{ ... }}>...</div>` (with the `...shellRightWStyle` spread already added in the previous bullet) and all its header/rail/drawer/main/right/footer zones **exactly as they are** — do not touch their markup.
3. **Delete** the existing `{settingsPanels !== undefined ? (<SettingsModal settingsPanels={settingsPanels} />) : (<SettingsModal />)}` block — AppShell no longer renders SettingsModal.
4. In its place (after the grid `</div>`, before `{children}`), render `<UtilityDock>`.

The resulting provider/render skeleton:

```typescript
    <UIPrefsStoreProvider value={uiPrefsStore}>
      <AppShellContext.Provider value={ctx}>
        <UtilityDockContext.Provider value={utilityDockCtx}>
          <SettingsModalContext.Provider value={settingsModalCtx}>
            <UIPrefsApplicator />
            {/* the existing grid <div data-testid="app-shell"> ... </div> stays verbatim,
                with the ...shellRightWStyle spread already added in the previous bullet */}

            {/* Utility dock — rendered outside the grid so it overlays / docks the right edge. */}
            <UtilityDock
              {...(settingsPanels !== undefined ? { settingsPanels } : {})}
              initialSettingsPanel={shimSettingsPanel}
            />

            {/* children slot — for context consumers rendered outside the grid zones */}
            {children}
          </SettingsModalContext.Provider>
        </UtilityDockContext.Provider>
      </AppShellContext.Provider>
    </UIPrefsStoreProvider>
```

  **Note on `SettingsModal`:** remove the old `<SettingsModal ... />` render from AppShell (Settings now lives in the dock). Keep the `SettingsModal` component file + export for one release as deprecated (see Task 4.5). The `SettingsModalContext` is retained for the shim.

- [ ] Update the AppShell file's top doc comment to note that Settings is now rendered via `UtilityDock` and `SettingsModal` is deprecated.
- [ ] `pnpm exec vitest run src/shell/AppShell.utilityDock.test.tsx` — expect PASS.
- [ ] `pnpm exec vitest run tests/shell/SettingsModal.test.tsx src/shell/AppShell.test.tsx` — expect PASS or, if a test asserted the old centered `settings-modal` rendered by AppShell, update it to assert the dock (`settings-panel` inside `utility-dock`). Read the failing assertions first; fix them to match the new dock behavior, preserving intent.
- [ ] Commit: `feat(shell): AppShell owns utility dock, drives --shell-right-w when pinned`

### Task 4.5 — Deprecation note on `SettingsModal` + back-compat shim test

- [ ] Edit `src/shell/SettingsModal.tsx`: add `@deprecated` to the top doc comment — "Deprecated since the right-side utility panels change: Settings now renders via `UtilityDock`/`SettingsPanel`. `SettingsModal` is retained for one release for any consumer that mounted it directly; AppShell no longer renders it."
- [ ] Create `src/shell/SettingsModalShim.test.tsx` verifying the shim delegates to the dock:

```typescript
/**
 * Back-compat shim tests — useSettingsModal() now drives the utility dock.
 * openModal → open('settings'); openPanel(id) → open('settings') + select id.
 */
import * as React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppShell } from './AppShell.js';
import { useSettingsModal } from './SettingsModalContext.js';
import { useUtilityDock } from './UtilityDockContext.js';
import type { UIPrefsConfig } from './types.js';

function makeConfig(): UIPrefsConfig {
  return {
    load: vi.fn(() => Promise.resolve({ theme: 'dark' as const, density: 'normal' as const, fontScale: 1.0 })),
    persistCommon: vi.fn(() => Promise.resolve()),
    persistApp: vi.fn(() => Promise.resolve()),
  };
}

function Probe() {
  const { openModal, openPanel } = useSettingsModal();
  const dock = useUtilityDock();
  return (
    <div>
      <button data-testid="open-modal" onClick={openModal} />
      <button data-testid="open-export" onClick={() => openPanel('export')} />
      <span data-testid="active">{dock.active ?? 'none'}</span>
    </div>
  );
}

async function renderShell() {
  await act(async () => {
    render(
      <AppShell
        appId="t"
        appDisplayName="Test"
        appIconUrl=""
        uiPrefsConfig={makeConfig()}
        settingsPanels={[{ id: 'export', label: 'Export', content: <div>export body</div> }]}
        main={<Probe />}
      />,
    );
    await new Promise((r) => setTimeout(r, 0));
  });
}

describe('useSettingsModal back-compat shim', () => {
  it('openModal() opens the settings dock surface', async () => {
    await renderShell();
    fireEvent.click(screen.getByTestId('open-modal'));
    expect(screen.getByTestId('active').textContent).toBe('settings');
    expect(screen.getByTestId('settings-panel')).toBeTruthy();
  });

  it('openPanel(id) opens settings and selects the sub-panel', async () => {
    await renderShell();
    fireEvent.click(screen.getByTestId('open-export'));
    expect(screen.getByTestId('active').textContent).toBe('settings');
    expect(screen.getByTestId('settings-modal-panel-export')).toBeTruthy();
  });
});
```

- [ ] `pnpm exec vitest run src/shell/SettingsModalShim.test.tsx` — expect PASS.
- [ ] Commit: `docs(shell): deprecate SettingsModal; test useSettingsModal dock shim`

---

## M5 — Header triggers rewire

### Task 5.1 — Failing test: `SettingsSlot` toggles the dock

- [ ] Edit `src/shell/SettingsSlot.test.tsx`. The existing `makeCtx` builds a `SettingsModalContextValue`; the slot now uses `useUtilityDock().toggle('settings')`. Rewrite the helpers + tests to wrap with `UtilityDockContext` and assert `toggle('settings')`:

```typescript
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SettingsSlot } from './SettingsSlot.js';
import { UtilityDockContext } from './UtilityDockContext.js';
import type { UtilityDockContextValue } from './UtilityDockContext.js';

function makeCtx(overrides?: Partial<UtilityDockContextValue>): UtilityDockContextValue {
  return {
    active: null,
    pinned: false,
    width: 420,
    open: vi.fn(),
    close: vi.fn(),
    toggle: vi.fn(),
    setPinned: vi.fn(),
    setWidth: vi.fn(),
    ...overrides,
  };
}

function Wrapper({ children, ctx = makeCtx() }: { children: React.ReactNode; ctx?: UtilityDockContextValue }) {
  return <UtilityDockContext.Provider value={ctx}>{children}</UtilityDockContext.Provider>;
}

describe('SettingsSlot', () => {
  it('renders a button with data-testid="settings-slot-trigger"', () => {
    render(<Wrapper><SettingsSlot /></Wrapper>);
    expect(screen.getByTestId('settings-slot-trigger')).toBeTruthy();
  });

  it('button aria-label matches settings/preferences', () => {
    render(<Wrapper><SettingsSlot /></Wrapper>);
    const ariaLabel = screen.getByTestId('settings-slot-trigger').getAttribute('aria-label') ?? '';
    expect(ariaLabel.toLowerCase()).toMatch(/settings|preferences/);
  });

  it('clicking the gear calls toggle("settings")', () => {
    const toggle = vi.fn();
    render(<Wrapper ctx={makeCtx({ toggle })}><SettingsSlot /></Wrapper>);
    fireEvent.click(screen.getByTestId('settings-slot-trigger'));
    expect(toggle).toHaveBeenCalledWith('settings');
  });

  it('reflects open state via aria-expanded', () => {
    render(<Wrapper ctx={makeCtx({ active: 'settings' })}><SettingsSlot /></Wrapper>);
    expect(screen.getByTestId('settings-slot-trigger').getAttribute('aria-expanded')).toBe('true');
  });
});
```

- [ ] `pnpm exec vitest run src/shell/SettingsSlot.test.tsx` — expect FAIL.

### Task 5.2 — Rewire `SettingsSlot`

- [ ] Edit `src/shell/SettingsSlot.tsx`: replace `useSettingsModal()` with `useUtilityDock()`, call `toggle('settings')` on click, and add `aria-expanded`:

```typescript
import * as React from 'react';
import { Settings } from '../icons/lucide.js';
import { useUtilityDock } from './UtilityDockContext.js';

export function SettingsSlot() {
  const { active, toggle } = useUtilityDock();
  return (
    <button
      type="button"
      aria-label="Settings and preferences"
      aria-expanded={active === 'settings'}
      data-testid="settings-slot-trigger"
      onClick={() => toggle('settings')}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '30px',
        height: '30px',
        padding: 0,
        border: '1px solid var(--border-2)',
        borderRadius: '6px',
        background: 'var(--bg-raised)',
        color: 'var(--ink-2)',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background .12s, color .12s',
      }}
    >
      <Settings size={15} aria-hidden />
    </button>
  );
}

SettingsSlot.displayName = 'SettingsSlot';
```

- [ ] `pnpm exec vitest run src/shell/SettingsSlot.test.tsx` — expect PASS.
- [ ] Check `src/shell/SettingsSlot.issue1.test.tsx` still passes (`pnpm exec vitest run src/shell/SettingsSlot.issue1.test.tsx`); if it wrapped with `SettingsModalContext`, update its wrapper to `UtilityDockContext` preserving intent.
- [ ] Commit: `feat(shell): SettingsSlot toggles utility dock settings surface`

### Task 5.3 — Failing test: `ShortcutsHelpButton` toggles keybinds

- [ ] Edit `src/shell/ShortcutsHelpButton.test.tsx` (read it first to mirror its existing structure). Wrap with `UtilityDockContext` and assert `toggle('keybinds')` + `aria-expanded`:

```typescript
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ShortcutsHelpButton } from './ShortcutsHelpButton.js';
import { UtilityDockContext } from './UtilityDockContext.js';
import type { UtilityDockContextValue } from './UtilityDockContext.js';

function makeCtx(overrides?: Partial<UtilityDockContextValue>): UtilityDockContextValue {
  return {
    active: null, pinned: false, width: 420,
    open: vi.fn(), close: vi.fn(), toggle: vi.fn(), setPinned: vi.fn(), setWidth: vi.fn(),
    ...overrides,
  };
}

describe('ShortcutsHelpButton', () => {
  it('renders the trigger', () => {
    render(<UtilityDockContext.Provider value={makeCtx()}><ShortcutsHelpButton /></UtilityDockContext.Provider>);
    expect(screen.getByTestId('shortcuts-help-button')).toBeTruthy();
  });

  it('clicking calls toggle("keybinds")', () => {
    const toggle = vi.fn();
    render(<UtilityDockContext.Provider value={makeCtx({ toggle })}><ShortcutsHelpButton /></UtilityDockContext.Provider>);
    fireEvent.click(screen.getByTestId('shortcuts-help-button'));
    expect(toggle).toHaveBeenCalledWith('keybinds');
  });

  it('reflects open state via aria-expanded', () => {
    render(<UtilityDockContext.Provider value={makeCtx({ active: 'keybinds' })}><ShortcutsHelpButton /></UtilityDockContext.Provider>);
    expect(screen.getByTestId('shortcuts-help-button').getAttribute('aria-expanded')).toBe('true');
  });
});
```

- [ ] `pnpm exec vitest run src/shell/ShortcutsHelpButton.test.tsx` — expect FAIL.

### Task 5.4 — Rewire `ShortcutsHelpButton`

- [ ] Edit `src/shell/ShortcutsHelpButton.tsx`: replace `useShortcutsContext().openCheatsheet` with `useUtilityDock()`, call `toggle('keybinds')`, add `aria-expanded`:

```typescript
import * as React from 'react';
import { Keyboard } from '../icons/lucide.js';
import { useUtilityDock } from './UtilityDockContext.js';

export function ShortcutsHelpButton(): React.ReactElement {
  const { active, toggle } = useUtilityDock();
  return (
    <button
      type="button"
      aria-label="Keyboard shortcuts"
      aria-expanded={active === 'keybinds'}
      data-testid="shortcuts-help-button"
      onClick={() => toggle('keybinds')}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '30px',
        height: '30px',
        padding: 0,
        border: '1px solid var(--border-2)',
        borderRadius: '6px',
        background: 'var(--bg-raised)',
        color: 'var(--ink-2)',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background .12s, color .12s',
      }}
    >
      <Keyboard size={15} aria-hidden />
    </button>
  );
}

ShortcutsHelpButton.displayName = 'ShortcutsHelpButton';
```

- [ ] `pnpm exec vitest run src/shell/ShortcutsHelpButton.test.tsx` — expect PASS.
- [ ] **Wire the dock's bindings to the ShortcutsContext.** The Keybinds surface needs `allBindings`. In `src/shell/AppShell.tsx`, read `useShortcutsContext().allBindings` and pass it to `<UtilityDock bindings={...} />`. Add `import { useShortcutsContext } from '../hooks/ShortcutsContext.js';` and inside the component: `const { allBindings } = useShortcutsContext();` then add `bindings={allBindings}` to the `<UtilityDock>` render. (Safe without a ShortcutsProvider — `useShortcutsContext` returns a no-op default with `allBindings: []`.)
- [ ] `pnpm exec vitest run src/shell/AppShell.utilityDock.test.tsx` — expect PASS (still green).
- [ ] Commit: `feat(shell): ShortcutsHelpButton toggles keybinds dock surface`

### Task 5.5 — Failing test: `JobsPill` toggles jobs + popover removed + hoverPopover defaults false

- [ ] Edit `src/shell/JobsPill.test.tsx` (read it first). Update expectations: `hoverPopover` defaults to `false`; the inline popover markup is gone; clicking the pill calls `onClick`. The pill keeps `onClick` as its public prop (AppHeader passes `onJobsClick`); the dock wiring lives in the consumer/AppHeader, not JobsPill itself. Add/adjust:

```typescript
describe('JobsPill — popover removed', () => {
  it('does not render the inline popover even on hover (hoverPopover defaults false)', () => {
    render(<JobsPill activeJobs={[{ id: 'j', title: 'T', phase: 'p', pct: 1, project: 'x' }]} />);
    // hover would previously open jobs-pill-popover; that markup no longer exists.
    expect(screen.queryByTestId('jobs-pill-popover')).toBeNull();
  });

  it('calls onClick when the pill is clicked', () => {
    const onClick = vi.fn();
    render(<JobsPill activeJobs={[]} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: /jobs/i }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('still renders the count badge when there are active jobs', () => {
    render(<JobsPill activeJobs={[{ id: 'j', title: 'T', phase: 'p', pct: 1, project: 'x' }]} />);
    expect(screen.getByTestId('jobs-pill-count')).toBeTruthy();
  });
});
```

  Remove or update any existing test that asserted the popover opened on hover or via the `open` prop. Read the existing JobsPill test and delete the popover-open assertions, preserving the idle/running/count assertions.

- [ ] `pnpm exec vitest run src/shell/JobsPill.test.tsx` — expect FAIL.

### Task 5.6 — Rewire `JobsPill` (drop popover, flip `hoverPopover` default)

- [ ] Edit `src/shell/JobsPill.tsx`:
  - Change the default in the destructure to `hoverPopover = false`.
  - Remove the popover markup entirely: delete the `popoverStyle` const and the whole `{show ? (<div data-testid="jobs-pill-popover" ...>...</div>) : null}` block, and the surrounding wrapper's `onMouseEnter`/`onMouseLeave` + `hover` state used only for the popover. Keep the outer `<div>` wrapper only if still needed for layout; otherwise render the `<button>` directly.
  - The `open` and `onViewAll` props are now unused by JobsPill's own render. Keep `open` in the props interface for one release (deprecated, ignored) so consumers compile; mark it `@deprecated`. Remove `onViewAll` from JobsPill (the View-all action now lives in `JobsPanelBody`); if removing it would break `AppHeader`'s pass-through, keep it as an accepted-but-unused `@deprecated` prop instead. Verify against `AppHeader.tsx` usage before deciding — prefer keeping both as deprecated no-ops to avoid a breaking prop removal this release.
  - The button keeps `aria-expanded` but it should reflect nothing meaningful now (the pill no longer owns open state). Set `aria-haspopup` off (remove it) since there is no popover. Keep `data-testid="jobs-pill-count"` and `data-testid="jobs-pill-pulse"`.

  Resulting button (no popover, no hover state):

```typescript
export function JobsPill({
  activeJobs = [],
  open: _open = false,
  onClick,
  onViewAll: _onViewAll,
  hoverPopover: _hoverPopover = false,
  className,
}: JobsPillProps) {
  const isActive = activeJobs.length > 0;
  return (
    <button
      type="button"
      className={className}
      aria-label={isActive ? `Jobs – ${activeJobs.length} active` : 'Jobs'}
      style={pillButtonStyle(isActive)}
      onClick={onClick}
    >
      {isActive ? (
        <span data-testid="jobs-pill-pulse" aria-hidden="true" style={pulseDotStyle} />
      ) : (
        <Package size={13} aria-hidden="true" />
      )}
      Jobs
      {isActive ? (
        <span data-testid="jobs-pill-count" aria-hidden="true" style={countBadgeStyle}>
          {activeJobs.length}
        </span>
      ) : null}
    </button>
  );
}
```

  Update the props doc: mark `open`, `onViewAll`, `hoverPopover` as `@deprecated` (retained one release, ignored). Remove the now-unused `ArrowRight` import and `popoverStyle`. Keep `pillButtonStyle`, `pulseDotStyle`, `countBadgeStyle`.

- [ ] `pnpm exec vitest run src/shell/JobsPill.test.tsx` — expect PASS.
- [ ] Commit: `feat(shell): JobsPill drops hover popover; click-only, hoverPopover defaults false`

### Task 5.7 — `AppHeader` default flip + jobs click wiring

- [ ] Edit `src/shell/AppHeader.tsx`: change the destructure default to `jobsHoverPopover = false` and mark the `jobsHoverPopover` prop `@deprecated` in the props interface ("retained one release; the hover popover was removed"). The `onJobsClick` pass-through stays — consumers wire it to `toggle('jobs')`.
- [ ] Read `src/shell/AppHeader.test.tsx` (if present) and update any assertion that depended on the popover opening on hover or `jobsOpen`. If `AppHeader.test.tsx` does not exist, skip.
- [ ] `pnpm exec vitest run src/shell/AppHeader.test.tsx` — expect PASS (or skip if no file).
- [ ] Commit: `feat(shell): AppHeader jobsHoverPopover defaults false`

---

## M6 — Exports + stories + docs

### Task 6.1 — Failing test: new testid constants exist

- [ ] Create `src/testids/utilityDock.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  SLIDE_OVER_PANEL,
  SLIDE_OVER_PANEL_CLOSE,
  SLIDE_OVER_PANEL_PIN,
  SLIDE_OVER_PANEL_RESIZE,
  UTILITY_DOCK,
  SETTINGS_PANEL,
  SHORTCUTS_CHEATSHEET_BODY,
  JOBS_PANEL_BODY,
} from './index.js';

describe('utility dock testids', () => {
  it('exposes stable string constants', () => {
    expect(SLIDE_OVER_PANEL).toBe('slide-over-panel');
    expect(SLIDE_OVER_PANEL_CLOSE).toBe('slide-over-panel-close');
    expect(SLIDE_OVER_PANEL_PIN).toBe('slide-over-panel-pin');
    expect(SLIDE_OVER_PANEL_RESIZE).toBe('slide-over-panel-resize');
    expect(UTILITY_DOCK).toBe('utility-dock');
    expect(SETTINGS_PANEL).toBe('settings-panel');
    expect(SHORTCUTS_CHEATSHEET_BODY).toBe('shortcuts-cheatsheet-body');
    expect(JOBS_PANEL_BODY).toBe('jobs-panel-body');
  });
});
```

- [ ] `pnpm exec vitest run src/testids/utilityDock.test.ts` — expect FAIL.

### Task 6.2 — Add testid constants

- [ ] Edit `src/testids/index.ts`. Add a new section (after the `SettingsSlot / SettingsModal` section). Do **not** rename any existing id:

```typescript
// ─── Utility dock (right-side panels) ─────────────────────────────────────────

/** Root of the SlideOverPanel primitive (right-docked, non-modal). */
export const SLIDE_OVER_PANEL = 'slide-over-panel' as const;
/** Close (✕) button in the SlideOverPanel header. */
export const SLIDE_OVER_PANEL_CLOSE = 'slide-over-panel-close' as const;
/** Pin toggle in the SlideOverPanel header. */
export const SLIDE_OVER_PANEL_PIN = 'slide-over-panel-pin' as const;
/** Left-edge resize handle (rendered only when pinned). */
export const SLIDE_OVER_PANEL_RESIZE = 'slide-over-panel-resize' as const;
/** Wrapper rendered by AppShell around the active dock surface. */
export const UTILITY_DOCK = 'utility-dock' as const;
/** Settings dock body (left tab nav + active sub-panel). */
export const SETTINGS_PANEL = 'settings-panel' as const;
/** Keybinds dock body (grouped cheatsheet). */
export const SHORTCUTS_CHEATSHEET_BODY = 'shortcuts-cheatsheet-body' as const;
/** Jobs dock body (JobRow list + View all footer). */
export const JOBS_PANEL_BODY = 'jobs-panel-body' as const;
```

- [ ] `pnpm exec vitest run src/testids/utilityDock.test.ts` — expect PASS.
- [ ] Commit: `feat(testids): add utility-dock testid constants`

### Task 6.3 — Barrel exports

- [ ] Edit `src/primitives/index.ts`. After the existing `ShortcutsCheatsheet` export block, add:

```typescript
export { SlideOverPanel } from './SlideOverPanel.js';
export type { SlideOverPanelProps } from './SlideOverPanel.js';

export { ShortcutsCheatsheetBody } from './ShortcutsCheatsheetBody.js';
export type { ShortcutsCheatsheetBodyProps } from './ShortcutsCheatsheetBody.js';
```

- [ ] Edit `src/shell/index.ts`. After the existing `SettingsModalContext` export block, add:

```typescript
// ─── Utility dock (right-side panels) ─────────────────────────────────────────
export { UtilityDockContext, useUtilityDock } from './UtilityDockContext.js';
export type { UtilityDockContextValue, DockSurface } from './UtilityDockContext.js';
export { UtilityDock } from './UtilityDock.js';
export type { UtilityDockProps } from './UtilityDock.js';
export { SettingsPanel } from './SettingsPanel.js';
export type { SettingsPanelProps } from './SettingsPanel.js';
export { JobsPanelBody } from './JobsPanelBody.js';
export type { JobsPanelBodyProps } from './JobsPanelBody.js';
```

- [ ] Edit `src/index.ts` (root barrel). Add re-exports so the root surface includes the new API. After the existing primitives `ShortcutsCheatsheet` re-export, add:

```typescript
export { SlideOverPanel, ShortcutsCheatsheetBody } from './primitives/index.js';
export type { SlideOverPanelProps, ShortcutsCheatsheetBodyProps } from './primitives/index.js';
```

  and in the shell re-export area add `useUtilityDock`, `UtilityDock`, `SettingsPanel`, `JobsPanelBody`, `UtilityDockContext` (value) plus the `UtilityDockContextValue`/`DockSurface`/`UtilityDockProps`/`SettingsPanelProps`/`JobsPanelBodyProps` types, following the existing root-barrel grouping. Read the current shell-section structure of `src/index.ts` and mirror it exactly.

- [ ] Create `src/shell/UtilityDockExports.test.ts` to lock the public surface:

```typescript
import { describe, it, expect } from 'vitest';
import * as shell from './index.js';
import * as root from '../index.js';
import * as primitives from '../primitives/index.js';

describe('utility dock public exports', () => {
  it('shell barrel exports the dock API', () => {
    expect(typeof shell.useUtilityDock).toBe('function');
    expect(typeof shell.UtilityDock).toBe('function');
    expect(typeof shell.SettingsPanel).toBe('function');
    expect(typeof shell.JobsPanelBody).toBe('function');
  });
  it('primitives barrel exports SlideOverPanel + ShortcutsCheatsheetBody', () => {
    expect(typeof primitives.SlideOverPanel).toBe('function');
    expect(typeof primitives.ShortcutsCheatsheetBody).toBe('function');
  });
  it('root barrel re-exports the dock API', () => {
    expect(typeof root.useUtilityDock).toBe('function');
    expect(typeof root.SlideOverPanel).toBe('function');
  });
});
```

- [ ] `pnpm exec vitest run src/shell/UtilityDockExports.test.ts` — expect PASS.
- [ ] Commit: `feat: barrel-export SlideOverPanel/UtilityDock/useUtilityDock + bodies`

### Task 6.4 — Stories for the three surfaces (slide-over + pinned)

- [ ] Create `src/primitives/SlideOverPanel.stories.tsx`:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { SlideOverPanel } from './SlideOverPanel.js';

const meta: Meta<typeof SlideOverPanel> = {
  title: 'Primitives/SlideOverPanel',
  component: SlideOverPanel,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Overlay: Story = {
  args: {
    open: true,
    title: 'Settings',
    pinned: false,
    width: 420,
    children: <p style={{ color: 'var(--ink-2)' }}>Slide-over body content.</p>,
  },
};

export const Pinned: Story = {
  args: {
    open: true,
    title: 'Settings',
    pinned: true,
    width: 480,
    children: <p style={{ color: 'var(--ink-2)' }}>Pinned column body content (resize handle on the left edge).</p>,
  },
};
```

- [ ] Create `src/shell/UtilityDock.stories.tsx` rendering each surface in overlay + pinned via a wrapping `UtilityDockContext.Provider` and a `UIPrefsStoreProvider`. Cover `settings`, `keybinds`, `jobs`, each in `Overlay` and `Pinned`. Use the `args`/`StoryObj` pattern and `tags:['autodocs']`. Build a small decorator that provides a fixed `UtilityDockContextValue` (active set per story, `pinned` per story) and a hydrated `createUIPrefsStore` (call `load` returning defaults). Model the providers on `src/shell/SettingsSlot.stories.tsx` and the test harnesses in this plan. Each story sets `active` to the surface under test.

  Minimum stories: `SettingsOverlay`, `SettingsPinned`, `KeybindsOverlay`, `KeybindsPinned`, `JobsOverlay`, `JobsPinned`.

- [ ] `pnpm exec vitest run src/shell/UtilityDock.test.tsx src/primitives/SlideOverPanel.test.tsx` — expect PASS (stories don't run under vitest, but confirm nothing regressed).
- [ ] Commit: `docs(stories): SlideOverPanel + UtilityDock surface stories`

### Task 6.5 — Update `JobsPill` stories (drop popover-open variants)

- [ ] Edit `src/shell/JobsPill.stories.tsx`: remove `RunningWithPopover`, `IdlePopoverOpen`, and the `open: true` arg from `MultipleJobs` (it no longer opens a popover). Keep `Idle`, `Running`, `MultipleJobs` (without `open`), `HighCount`. Add a short doc comment noting the hover popover was removed in favor of the utility dock.
- [ ] If `src/shell/ShortcutsHelpButton.stories.tsx` or `src/shell/SettingsSlot.stories.tsx` render inside a `SettingsModalContext`/`ShortcutsContext` provider that no longer matches the trigger's new dependency (`useUtilityDock`), update their decorators to wrap with `UtilityDockContext.Provider` so the stories still render. Read each story first.
- [ ] Commit: `docs(stories): drop JobsPill popover variants; wire dock context in trigger stories`

### Task 6.6 — Milestone gate: full CI

- [ ] `make ci AI=1` — expect PASS (install + lint + typecheck + test + build). If lint flags the unused `_open`/`_onViewAll`/`_hoverPopover` params, prefix-underscore should satisfy `no-unused-vars`; if not, add a targeted `eslint-disable-next-line` or drop them per the project's lint config (read `.ci-ai.log` for the exact rule).
- [ ] `pnpm codegen:check` is **not** required here (no codegen inputs changed — `codegen.versions.json` untouched). Skip unless `make ci` includes it; this change touches no generated types.
- [ ] Commit: `chore: right-side utility panels — CI green`

---

## M7 — pdomain-ui release gating

### Task 7.1 — Verify and stage the release

- [ ] `make ci AI=1` — confirm green on the final tree.
- [ ] Bump intent: this is an additive, mostly back-compat change with one behavioral shift (Settings/Keybinds/Jobs presentation; `SettingsModal` no longer auto-rendered by AppShell). Target a **minor** bump for the pre-1.0 alpha line. Do **not** run `make release-minor` yet.
- [ ] **Release authorization note (do not skip):** `make release-minor` bumps the version, runs CI, commits, tags, **and pushes + publishes to `pdomain-index-npm`**. Per workspace policy, publishing requires **explicit CT authorization**. Until then:
  - Leave the change committed locally on the worktree branch; do not push, do not publish.
  - Consumers can validate against the unreleased change via **local-dev mode** — see `/workspaces/ocr-container/docs/process/local-dev.md` (`make local-dev` flips a repo to local-editable sibling resolution; `make local-check` shows current mode). This lets `pdomain-ocr-simple-gui` / `pdomain-prep-for-pgdp` / `pdomain-ocr-labeler-spa` build against the local `pdomain-ui` checkout before any registry publish.
- [ ] When CT authorizes: `make release-minor` (publishes). Record the published version for M8 consumer bumps.

---

## M8 — Consumer migration (CROSS-REPO — dispatch to each repo's own agent)

> These tasks are **not** executed by the pdomain-ui agent. Each is a dispatch instruction for the named sibling repo's full-power agent (worktree isolation, per workspace policy). The pdomain-ui agent only authors these instructions. All three are FastAPI + React SPAs whose existing **SPA serving contract tests** (`test_routes_root.py` / `test_spa_fallback.py` / `test_static_mounts.py`) plus their Playwright e2e satisfy browser-level verification — pdomain-ui itself is a Vitest/jsdom library and ships no browser milestone.

### Task 8.1 — `pdomain-ocr-simple-gui`

- [ ] Dispatch the `pdomain-ocr-simple-gui` agent (isolation: worktree). Instruction:
  - Bump `@pdomain/pdomain-ui` to the newly published version (edit `package.json`; or use `make update-pdomain-deps`; or `make local-dev` if validating pre-release).
  - Drop any `jobsHoverPopover` prop passed to `AppHeader`/`JobsPill` (it now defaults false and is deprecated). Drop any direct `<SettingsModal>` mount — Settings renders via the dock automatically inside `AppShell`. If the app called `useSettingsModal().openModal()`/`openPanel(id)`, those still work (shim → dock) and need no change.
  - If the app wires the jobs pill, point its click at the dock: `onJobsClick={() => useUtilityDock().toggle('jobs')}` (or via the AppHeader `onJobsClick` prop).
  - Run `make ci` (includes the SPA serving contract tests + frontend build/test) and confirm green. The contract tests satisfy browser verification; no new browser milestone needed.
  - Commit locally on a worktree branch; do not push/publish; return path + branch.

### Task 8.2 — `pdomain-prep-for-pgdp`

- [ ] Dispatch the `pdomain-prep-for-pgdp` agent (isolation: worktree). Same instruction set as Task 8.1, adapted to this repo:
  - Bump `@pdomain/pdomain-ui`; drop `jobsHoverPopover` and any modal-specific wiring; keep `useSettingsModal` calls (shim).
  - Note this repo uses the deprecated `rightPanel` grid prop in places — confirm the pinned dock (`--shell-right-w`) coexists; per spec, the utility dock wins while open+pinned. Verify no visual collision in the app's right-side template content.
  - `make ci` green (includes `test_spa_fallback.py` + frontend). Commit locally; return path + branch.

### Task 8.3 — `pdomain-ocr-labeler-spa`

- [ ] Dispatch the `pdomain-ocr-labeler-spa` agent (isolation: worktree). Same instruction set, adapted:
  - Bump `@pdomain/pdomain-ui` (or `codegen.versions.json`/local-dev as that repo does it); drop `jobsHoverPopover`/modal wiring; keep `useSettingsModal` shim calls.
  - This repo has the canvas/labeler surface — explicitly verify the non-modal overlay + left-edge resize handle do not interfere with canvas drag/pan (spec Risks item). Exercise via the repo's Playwright e2e.
  - `make ci` green (includes `test_static_mounts.py` + frontend + Playwright). Commit locally; return path + branch.

### Task 8.4 — Close-out

- [ ] After all three consumers are green locally, report the set of worktree paths + branches to CT for the rebase → ff-only land sequence (workspace merge policy). Publishing of `pdomain-ui` and consumer dep-bumps land only with CT authorization.

---

## Definition of done

- [ ] M1–M6 complete; `make ci AI=1` green on the pdomain-ui worktree.
- [ ] New testids added (none renamed); `/testids` constants exported and tested.
- [ ] `SlideOverPanel`, `UtilityDock`, `useUtilityDock`, `SettingsPanel`, `JobsPanelBody`, `ShortcutsCheatsheetBody` exported from the appropriate barrels (+ root).
- [ ] `useSettingsModal()` shim verified to delegate to the dock; `SettingsModal` deprecated, no longer auto-rendered by AppShell.
- [ ] Stories cover all three surfaces in slide-over + pinned; `JobsPill` popover stories removed.
- [ ] M7 release gated on explicit CT authorization; M8 consumer migrations dispatched to sibling agents with browser verification via their existing SPA-contract/Playwright suites.
