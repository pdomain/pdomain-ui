/**
 * ProjectsDrawer — suite-wide projects list molecule.
 *
 * OQ-12 decision: ProjectsDrawer is a NEW suite-wide molecule that templates
 * embed. It is NOT an AppShell zone. Every pd-* SPA can drop it in wherever
 * it needs a projects-selection rail.
 *
 * Target path: src/templates/ProjectsDrawer.tsx
 * Subpath export: @pdomain/pdomain-ui/templates
 *
 * Slot-based API — consumers supply:
 *  - `projects`: typed array of ProjectsDrawerProject
 *  - `selectedId`: the currently-selected project id (or null)
 *  - `onSelect`: called with the project id when a row is clicked
 *  - `onCreateProject` (optional): called when the default "New project" button is clicked
 *  - `createSlot` (optional): replaces the default "New project" button entirely
 *  - `defaultTab` (optional): 'active' | 'archived' — which tab is shown initially
 *
 * Design source: docs/templates/design_handoff_pdomain_ui/final/projects/projects.jsx
 * — ProjectsPage left-rail section, extracted as a standalone molecule.
 */
import * as React from 'react';
import { Badge, type BadgeTone } from '../primitives/Badge.js';
import { Button } from '../primitives/Button.js';
import { cn } from '../primitives/cn.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProjectStatus = 'queued' | 'running' | 'review' | 'ready' | 'submitted' | 'error';

export interface ProjectsDrawerProject {
  /** Unique project id (slug). */
  id: string;
  /** Book title. */
  title: string;
  /** Author name (used for avatar initials). */
  author: string;
  /** Total page count. */
  pages: number;
  /** Total number of pipeline stages. */
  totalStages: number;
  /** Zero-based index of the current pipeline stage. */
  currentStage: number;
  /** Pipeline / job status. */
  status: ProjectStatus;
  /** Human-readable disk size string, e.g. "28.4 MB". */
  size: string;
  /** Human-readable relative updated time, e.g. "2h ago" or "running". */
  updatedRel: string;
  /** Number of flagged pages, if any. */
  flagged?: number;
  /** When true, the project is archived. */
  archived?: boolean;
  /** Human-readable archived date string, e.g. "May 02, 2026". */
  archivedOn?: string;
}

export type ProjectsDrawerTab = 'active' | 'archived';

export interface ProjectsDrawerProps {
  /** All projects (active + archived). */
  projects: ProjectsDrawerProject[];
  /** Id of the currently-selected project, or null for no selection. */
  selectedId: string | null;
  /** Called with project id when a row is clicked. */
  onSelect: (id: string) => void;
  /** Called when the default "New project" button is clicked. */
  onCreateProject?: () => void;
  /**
   * Custom ReactNode to replace the default "New project" button.
   * When provided, `onCreateProject` is ignored.
   */
  createSlot?: React.ReactNode;
  /** Which tab is initially active. Defaults to 'active'. */
  defaultTab?: ProjectsDrawerTab;
  className?: string;
}

// ─── Status → badge tone mapping ──────────────────────────────────────────────

const STATUS_TONE: Record<ProjectStatus | 'archived', BadgeTone> = {
  queued: 'neutral',
  running: 'running',
  review: 'review',
  ready: 'clean',
  submitted: 'neutral',
  error: 'failed',
  archived: 'neutral',
};

const STATUS_LABEL: Record<ProjectStatus | 'archived', string> = {
  queued: 'queued',
  running: 'running',
  review: 'review',
  ready: 'ready',
  submitted: 'submitted',
  error: 'error',
  archived: 'archived',
};

// ─── Mini pipeline progress strip ─────────────────────────────────────────────

interface PipelineMiniProps {
  total: number;
  current: number;
  status: ProjectStatus;
}

function PipelineMini({ total, current, status }: PipelineMiniProps) {
  const color =
    status === 'error'
      ? 'var(--mismatch)'
      : status === 'running'
        ? 'var(--ocr)'
        : status === 'review'
          ? 'var(--fuzzy)'
          : 'var(--exact)';

  return (
    <div
      aria-hidden="true"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        height: 8,
      }}
    >
      {Array.from({ length: total }).map((_, i) => {
        const done = i < current;
        const here = i === current;
        return (
          <span
            key={i}
            style={{
              width: here ? 8 : 4,
              height: here ? 8 : 4,
              borderRadius: 99,
              background: done || here ? color : 'var(--border-2)',
              opacity: done && !here ? 0.7 : 1,
            }}
          />
        );
      })}
    </div>
  );
}

// ─── ProjectsDrawer ───────────────────────────────────────────────────────────

export const ProjectsDrawer = React.forwardRef<HTMLDivElement, ProjectsDrawerProps>(
  function ProjectsDrawer(
    {
      projects,
      selectedId,
      onSelect,
      onCreateProject,
      createSlot,
      defaultTab = 'active',
      className,
    },
    ref,
  ) {
    const [tab, setTab] = React.useState<ProjectsDrawerTab>(defaultTab);

    const activeProjects = projects.filter((p) => !p.archived);
    const archivedProjects = projects.filter((p) => p.archived);
    const visibleProjects = tab === 'archived' ? archivedProjects : activeProjects;

    return (
      <div
        ref={ref}
        data-testid="projects-drawer"
        className={cn('projects-drawer', className)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-1)',
        }}
      >
        {/* Create-project slot */}
        <div style={{ padding: '16px 16px 12px' }}>
          {createSlot !== undefined ? (
            createSlot
          ) : (
            <Button variant="primary" full onClick={onCreateProject}>
              New project
            </Button>
          )}
        </div>

        {/* Active / Archived tab strip */}
        <div
          role="tablist"
          aria-label="Project filter"
          style={{
            padding: '0 12px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {(
            [
              { id: 'active' as const, label: 'Active', count: activeProjects.length },
              { id: 'archived' as const, label: 'Archived', count: archivedProjects.length },
            ] satisfies Array<{ id: ProjectsDrawerTab; label: string; count: number }>
          ).map((t) => {
            const on = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={on}
                tabIndex={on ? 0 : -1}
                onClick={() => setTab(t.id)}
                style={{
                  flex: 1,
                  height: 28,
                  borderRadius: 6,
                  cursor: 'pointer',
                  background: on ? 'var(--bg-raised)' : 'transparent',
                  border: '1px solid ' + (on ? 'var(--border-2)' : 'transparent'),
                  color: on ? 'var(--ink-1)' : 'var(--ink-3)',
                  fontSize: 12,
                  fontWeight: on ? 600 : 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                {t.label}
                <span
                  data-testid={`tab-${t.id}-count`}
                  style={{
                    fontSize: 10,
                    padding: '1px 5px',
                    borderRadius: 4,
                    background: on
                      ? 'color-mix(in srgb, var(--accent) 18%, transparent)'
                      : 'var(--bg-sunk)',
                    color: on ? 'var(--accent)' : 'var(--ink-4)',
                    fontFamily: 'var(--mono-font)',
                  }}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Project rows */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            borderTop: '1px solid var(--border-1)',
          }}
        >
          {visibleProjects.length === 0 ? (
            <div
              data-testid="projects-drawer-empty"
              style={{
                padding: '32px 20px',
                textAlign: 'center',
                color: 'var(--ink-4)',
                fontSize: 12,
                fontFamily: 'var(--ui-font)',
              }}
            >
              No {tab} projects.
            </div>
          ) : (
            visibleProjects.map((p) => {
              const statusKey: ProjectStatus | 'archived' = p.archived ? 'archived' : p.status;
              const tone = STATUS_TONE[statusKey];
              const label = STATUS_LABEL[statusKey];
              const isSel = p.id === selectedId;

              return (
                <div
                  key={p.id}
                  data-testid="project-row"
                  data-selected={isSel ? 'true' : 'false'}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect(p.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelect(p.id);
                    }
                  }}
                  style={{
                    padding: '10px 16px',
                    background: isSel ? 'var(--bg-raised)' : 'transparent',
                    borderLeft: isSel ? '2px solid var(--accent)' : '2px solid transparent',
                    opacity: p.archived ? 0.9 : 1,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  {/* Row header: title + status badge */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: isSel ? 600 : 500,
                        color: p.archived ? 'var(--ink-2)' : 'var(--ink-1)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {p.title}
                    </span>
                    <Badge tone={tone} mono>
                      {label}
                    </Badge>
                  </div>

                  {/* Row meta: id · pages · size · updated */}
                  <div
                    style={{
                      fontSize: 10.5,
                      color: 'var(--ink-4)',
                      fontFamily: 'var(--mono-font)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span>{p.id}</span>
                    <span style={{ color: 'var(--border-3)' }}>·</span>
                    <span>{p.pages}p</span>
                    <span style={{ color: 'var(--border-3)' }}>·</span>
                    <span>{p.size}</span>
                    <span style={{ flex: 1 }} />
                    <span>
                      {p.archived ? `archived ${p.archivedOn?.split(',')[0] ?? ''}` : p.updatedRel}
                    </span>
                  </div>

                  {/* Mini pipeline progress strip */}
                  <PipelineMini total={p.totalStages} current={p.currentStage} status={p.status} />
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  },
);

ProjectsDrawer.displayName = 'ProjectsDrawer';
