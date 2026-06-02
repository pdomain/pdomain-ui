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

describe('SlideOverPanel — pin + resize', () => {
  it('pin toggle calls onTogglePin with the inverted value', () => {
    const onTogglePin = vi.fn();
    render(
      <SlideOverPanel
        open
        title="Settings"
        onClose={vi.fn()}
        pinned={false}
        onTogglePin={onTogglePin}
      >
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
      <SlideOverPanel
        open
        title="Settings"
        onClose={vi.fn()}
        pinned
        width={420}
        onResize={onResize}
      >
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
      <SlideOverPanel
        open
        title="Settings"
        onClose={vi.fn()}
        pinned
        width={420}
        onResize={onResize}
      >
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
