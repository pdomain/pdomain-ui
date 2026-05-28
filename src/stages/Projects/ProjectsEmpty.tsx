/**
 * ProjectsEmpty — first-time hero empty state for the Projects landing.
 *
 * Standalone composable export. Can be embedded directly inside a custom
 * landing variant without requiring ProjectsLandingTemplate.
 *
 * Ported from `final/projects/projects.jsx` lines 656–723.
 *
 * All props are optional; defaults match the design-source copy.
 */

import React from 'react';
import { Button } from '../../primitives/Button.js';
import {
  PROJECTS_EMPTY,
  PROJECTS_EMPTY_PRIMARY_CTA,
  PROJECTS_EMPTY_SECONDARY_CTA,
} from '../../testids/index.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProjectsEmptyAction {
  label: string;
  onClick: () => void;
}

export interface ProjectsEmptyProps {
  /** Hero heading. Defaults to "No projects yet". */
  title?: string;
  /** Descriptive body copy below the heading. */
  description?: string;
  /** Primary CTA. Defaults to label "Create new project" with no-op onClick. */
  primaryAction?: ProjectsEmptyAction;
  /**
   * Optional secondary CTA. When omitted the button is not rendered at all —
   * this is intentional (single-primary-action story).
   */
  secondaryAction?: ProjectsEmptyAction;
}

// ─── Default copy ─────────────────────────────────────────────────────────────

const DEFAULT_TITLE = 'No projects yet';
const DEFAULT_DESCRIPTION =
  'A project bundles a book’s pages, settings, and pipeline state — everything needed to assemble a PGDP-ready package. Start by uploading a folder of scans, or paste a source URL from archive.org / Google Books.';
const DEFAULT_PRIMARY_LABEL = 'Create new project';

// ─── Decorative icon stack ────────────────────────────────────────────────────

function PageStack(): React.ReactElement {
  return (
    <div
      aria-hidden="true"
      className="projects-empty__stack"
      style={{ width: 140, height: 100, flexShrink: 0 }}
    >
      {([0, 1, 2] as const).map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 30 + i * 14,
            top: 14 - i * 6,
            width: 78,
            height: 100 - i * 4,
            borderRadius: 4,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-2)',
            boxShadow: 'var(--shadow-sm)',
            opacity: 1 - i * 0.18,
            transform: `rotate(${(i - 1) * 4}deg)`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 12,
              backgroundImage:
                'repeating-linear-gradient(to bottom, var(--border-1) 0 1px, transparent 1px 8px)',
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProjectsEmpty({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  primaryAction,
  secondaryAction,
}: ProjectsEmptyProps): React.ReactElement {
  const primaryLabel = primaryAction?.label ?? DEFAULT_PRIMARY_LABEL;
  const primaryClick = primaryAction?.onClick;

  return (
    <div
      data-testid={PROJECTS_EMPTY}
      style={{
        height: '100%',
        display: 'grid',
        placeItems: 'center',
        padding: '48px 24px',
      }}
    >
      <div
        style={{
          maxWidth: 560,
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <PageStack />

        <div>
          <h2
            style={{
              margin: 0,
              fontSize: '1.375rem',
              fontWeight: 600,
              letterSpacing: '-0.015em',
              color: 'var(--ink-1)',
            }}
          >
            {title}
          </h2>
          <p
            style={{
              marginTop: 8,
              marginBottom: 0,
              fontSize: 'var(--text-sm)',
              color: 'var(--ink-3)',
              lineHeight: 1.55,
              maxWidth: 440,
              marginInline: 'auto',
            }}
          >
            {description}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Button
            variant="primary"
            size="lg"
            data-testid={PROJECTS_EMPTY_PRIMARY_CTA}
            {...(primaryClick !== undefined ? { onClick: primaryClick } : {})}
          >
            {primaryLabel}
          </Button>

          {secondaryAction !== undefined && (
            <Button
              variant="ghost"
              size="lg"
              data-testid={PROJECTS_EMPTY_SECONDARY_CTA}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

ProjectsEmpty.displayName = 'ProjectsEmpty';
