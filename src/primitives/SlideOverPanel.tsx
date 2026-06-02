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
