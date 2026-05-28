import * as React from 'react';
import { cn } from './cn.js';

export type BannerTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

export interface BannerProps {
  /** Tone drives border + background tinting. Default: 'neutral'. */
  tone?: BannerTone;
  /** Primary headline content (left-aligned). */
  headline?: React.ReactNode;
  /** Optional supporting subtext beneath the headline. */
  subtext?: React.ReactNode;
  /** Optional left-side ornament (icon, status dot, progress ring). */
  leadingSlot?: React.ReactNode;
  /** Optional right-aligned actions slot (buttons, links). */
  actions?: React.ReactNode;
  /** Optional bottom-area slot for inline progress bars, etc. */
  footer?: React.ReactNode;
  /** Override aria-role; default 'status' (or 'alert' for tone='danger'). */
  role?: React.AriaRole;
  /** Optional aria-live (defaults: tone=danger→assertive, else polite). */
  'aria-live'?: 'off' | 'polite' | 'assertive';
  className?: string;
  'data-testid'?: string;
  /** Free-content body when slot layout is insufficient. */
  children?: React.ReactNode;
}

/**
 * Banner — generic, tone-aware banner shell with slots.
 *
 * Consumers control state-machine externally; the primitive owns layout
 * and tone rendering only. Tone drives CSS token usage via `data-tone`.
 *
 * Tone-to-token mapping (via CSS on [data-tone]):
 *   info    → var(--ocr)
 *   success → var(--exact)
 *   warning → var(--fuzzy)
 *   danger  → var(--mismatch)
 *   neutral → default surface
 *
 * ARIA: role defaults to 'status', but tone='danger' → 'alert'.
 * aria-live mirrors: 'assertive' for danger, 'polite' otherwise.
 */
export function Banner({
  tone = 'neutral',
  headline,
  subtext,
  leadingSlot,
  actions,
  footer,
  role,
  'aria-live': ariaLive,
  className,
  'data-testid': dataTestId,
  children,
}: BannerProps): React.ReactElement {
  const isDanger = tone === 'danger';
  const resolvedRole: React.AriaRole = role ?? (isDanger ? 'alert' : 'status');
  const resolvedAriaLive: 'off' | 'polite' | 'assertive' =
    ariaLive ?? (isDanger ? 'assertive' : 'polite');

  // WS6: use <div> not <section> — <section> creates a landmark per ARIA spec,
  // which pollutes the page outline when banners appear inline inside content.
  // An explicit role= attribute on <div> gives the same semantics without the landmark.
  return (
    <div
      className={cn('banner', className)}
      data-tone={tone}
      role={resolvedRole}
      aria-live={resolvedAriaLive}
      {...(dataTestId !== undefined ? { 'data-testid': dataTestId } : {})}
    >
      {leadingSlot != null ? <span className="banner__leading">{leadingSlot}</span> : null}
      <div className="banner__body">
        {headline != null ? <div className="banner__headline">{headline}</div> : null}
        {subtext != null ? <div className="banner__subtext">{subtext}</div> : null}
        {children}
        {footer != null ? <div className="banner__footer">{footer}</div> : null}
      </div>
      {actions != null ? <div className="banner__actions">{actions}</div> : null}
    </div>
  );
}

Banner.displayName = 'Banner';
