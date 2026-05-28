/**
 * AppHeader — opinionated top chrome for all pd-* SPAs.
 *
 * Ported from docs/templates/design_handoff_pdomain_ui/design-system/template.jsx
 * per OQ-5 decision: port into src/shell/ composing existing JobsPill.
 *
 * Three-column layout:
 *   Left:   app icon (accent square) + app name
 *   Center: search box with ⌘K hint
 *   Right:  JobsPill + bell (with unread badge) + user (initials + username + chevron)
 *
 * All colors are var(--token) only — no hex literals.
 */

import * as React from 'react';
import { Bell, ChevronDown, Search } from '../icons/lucide.js';
import { JobsPill } from './JobsPill.js';
import type { ActiveJob } from './JobsPill.js';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface AppHeaderProps {
  /** Application name displayed in the left glyph area. Required — pass your app name. */
  appName?: string;
  /** Single uppercase letter used in the app icon square. Defaults to first char of appName. */
  appInitial?: string;
  /** Placeholder text inside the search box. */
  searchPlaceholder?: string;
  /** Currently-running background jobs forwarded to JobsPill. */
  activeJobs?: ActiveJob[];
  /** Force the JobsPill popover open (for Storybook artboards / testing). */
  jobsOpen?: boolean;
  /** Username shown in the right-hand user area. */
  username?: string;
  /** Two-letter initials shown in the avatar circle. */
  initials?: string;
  /** Unread notification count. Badge hidden when 0. */
  unread?: number;
  /** Called when the search area is clicked. */
  onSearchClick?: () => void;
  /** Called when the bell button is clicked. */
  onBellClick?: () => void;
  /** Called when the user area is clicked. */
  onUserClick?: () => void;
  /** Extra CSS class applied to the <header> element. */
  className?: string;
  /** App-specific controls rendered in the right cluster, before JobsPill. */
  actions?: React.ReactNode;
}

// ─── AppHeader ────────────────────────────────────────────────────────────────

export function AppHeader({
  appName = '',
  appInitial,
  searchPlaceholder = 'Search…',
  activeJobs = [],
  jobsOpen = false,
  username = '',
  initials = '',
  unread = 0,
  onSearchClick,
  onBellClick,
  onUserClick,
  className,
  actions,
}: AppHeaderProps) {
  const letter = appInitial ?? (appName.length > 0 ? appName.charAt(0).toLowerCase() : '');

  return (
    <header
      data-testid="app-header"
      className={className}
      style={{
        height: 52,
        flex: '0 0 auto',
        background: 'var(--bg-page)',
        borderBottom: '1px solid var(--border-1)',
        display: 'grid',
        gridTemplateColumns: '1fr minmax(280px, 520px) 1fr',
        alignItems: 'center',
        padding: '0 20px',
        gap: 20,
      }}
    >
      {/* ── Left: app icon + app name ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          minWidth: 0,
        }}
      >
        <div
          aria-hidden
          style={{
            width: 26,
            height: 26,
            borderRadius: 6,
            background: 'var(--accent)',
            color: 'var(--accent-ink)',
            display: 'grid',
            placeItems: 'center',
            fontFamily: 'var(--mono-font)',
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: '-0.02em',
            flexShrink: 0,
          }}
        >
          {letter}
        </div>
        <span
          style={{
            color: 'var(--ink-1)',
            fontWeight: 600,
            fontSize: 14,
            letterSpacing: '-0.005em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {appName}
        </span>
      </div>

      {/* ── Center: search box ── */}
      <button
        type="button"
        data-testid="app-header-search"
        aria-label="Search"
        onClick={onSearchClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          height: 32,
          padding: '0 12px',
          background: 'var(--bg-sunk)',
          border: '1px solid var(--border-2)',
          borderRadius: 6,
          color: 'var(--ink-3)',
          cursor: 'pointer',
          width: '100%',
          textAlign: 'left',
          fontFamily: 'var(--ui-font)',
        }}
      >
        <Search size={14} aria-hidden />
        <span
          style={{
            flex: 1,
            fontSize: 12.5,
            color: 'var(--ink-3)',
            fontFamily: 'var(--ui-font)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {searchPlaceholder}
        </span>
        {/* ⌘K hint — intentional text node, not a KeyCap, because KeyCap
            uses keys: string | string[] not free-text; and this is decorative. */}
        <span
          aria-hidden
          style={{
            fontFamily: 'var(--mono-font)',
            fontSize: 10.5,
            color: 'var(--ink-4)',
            border: '1px solid var(--border-2)',
            borderRadius: 4,
            padding: '1px 5px',
            whiteSpace: 'nowrap',
          }}
        >
          ⌘K
        </span>
      </button>

      {/* ── Right: JobsPill + bell + user ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          justifyContent: 'flex-end',
          minWidth: 0,
        }}
      >
        {actions}

        <JobsPill activeJobs={activeJobs} open={jobsOpen} />

        {/* Bell button */}
        <button
          type="button"
          data-testid="app-header-bell"
          aria-label={unread > 0 ? `Notifications — ${unread} unread` : 'Notifications'}
          onClick={onBellClick}
          style={{
            position: 'relative',
            width: 30,
            height: 30,
            borderRadius: 6,
            background: 'transparent',
            border: '1px solid transparent',
            color: 'var(--ink-2)',
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <Bell size={16} aria-hidden />
          {unread > 0 ? (
            <span
              data-testid="app-header-unread-badge"
              aria-hidden
              style={{
                position: 'absolute',
                top: 4,
                right: 5,
                minWidth: 14,
                height: 14,
                padding: '0 4px',
                background: 'var(--accent)',
                color: 'var(--accent-ink)',
                borderRadius: 99,
                fontSize: 9,
                fontWeight: 700,
                display: 'grid',
                placeItems: 'center',
                border: '2px solid var(--bg-page)',
                fontFamily: 'var(--mono-font)',
                lineHeight: 1,
              }}
            >
              {unread}
            </span>
          ) : null}
        </button>

        {/* User area */}
        <button
          type="button"
          data-testid="app-header-user"
          aria-label={`User menu — ${username}`}
          onClick={onUserClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            background: 'transparent',
            border: 'none',
            padding: 0,
            flexShrink: 0,
          }}
        >
          <div
            data-testid="app-header-avatar"
            aria-hidden
            style={{
              width: 26,
              height: 26,
              borderRadius: 99,
              background: 'var(--bg-raised)',
              border: '1px solid var(--border-2)',
              color: 'var(--ink-2)',
              fontSize: 10.5,
              fontWeight: 600,
              display: 'grid',
              placeItems: 'center',
              fontFamily: 'var(--ui-font)',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <span
            style={{
              fontSize: 12.5,
              color: 'var(--ink-2)',
              fontWeight: 500,
              whiteSpace: 'nowrap',
            }}
          >
            {username}
          </span>
          <ChevronDown size={12} aria-hidden style={{ color: 'var(--ink-4)' }} />
        </button>
      </div>
    </header>
  );
}

AppHeader.displayName = 'AppHeader';
