/**
 * ProjectsLandingTemplate — projects root page template.
 *
 * Merges the design's `ProjectsPage` (left-rail + detail pane) and
 * `ProjectsEmpty` (first-time hero) into a single component with a
 * discriminated-union `state` prop (OQ-11 decision).
 *
 * State variants:
 *   state='populated'  → left-rail ProjectsDrawer + right-pane selected project detail
 *   state='empty'      → centered hero with Create CTA
 *
 * Slots:
 *   theme         — 'dark' | 'light'  (applied as data-theme on root element)
 *   defaultTab    — 'activity' | 'attributes' | 'manage' (which detail tab opens first)
 *   selectedId    — id of the currently-selected project (populated state only)
 *   controlsSlot  — node rendered in the breadcrumb controls area (filter/sort bar)
 *   createSlot    — replaces the default "Create new project" CTA button (both states)
 *
 * Design source:
 *   docs/templates/design_handoff_pdomain_ui/final/projects/projects.jsx
 *   — ProjectsPage (populated) + ProjectsEmpty (empty)
 *
 * Dependencies:
 *   ProjectsDrawer (#356)     — left-rail molecule
 *   AttributesPanel (#343)    — attributes tab body
 *   Badge, Button             — primitives
 *   Icon (dispatcher shim)    — icons
 */
import * as React from 'react';
import { ProjectsDrawer } from './ProjectsDrawer.js';
import type { ProjectsDrawerProject, ProjectsDrawerTab } from './ProjectsDrawer.js';
import { CoverPlaceholder } from './PipelineTemplate.js';
import { AttributesPanel } from '../primitives/AttributesPanel.js';
import { Badge } from '../primitives/Badge.js';
import { Button } from '../primitives/Button.js';
import { Icon } from '../icons/Icon.js';
import type { BadgeTone } from '../primitives/Badge.js';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Detail-pane tab ids. */
export type ProjectsDetailTab = 'activity' | 'attributes' | 'manage';

/** Status → badge tone mapping (shared with ProjectsDrawer). */
type StatusKey = ProjectsDrawerProject['status'] | 'archived';

const STATUS_TONE: Record<StatusKey, BadgeTone> = {
  queued: 'neutral',
  running: 'running',
  review: 'review',
  ready: 'clean',
  submitted: 'neutral',
  error: 'failed',
  archived: 'neutral',
};

const STATUS_LABEL: Record<StatusKey, string> = {
  queued: 'queued',
  running: 'running',
  review: 'review',
  ready: 'ready',
  submitted: 'submitted',
  error: 'error',
  archived: 'archived',
};

// ─── Shared props ─────────────────────────────────────────────────────────────

interface ProjectsLandingSharedProps {
  /**
   * Theme token override. When provided, sets `data-theme` on the root element.
   * Consumers should normally let the parent AppShell handle theming; this prop
   * exists for Storybook isolation.
   */
  theme?: 'dark' | 'light';
  /** Node rendered in the breadcrumb / controls bar area. */
  controlsSlot?: React.ReactNode;
}

// ─── Populated state props ────────────────────────────────────────────────────

export interface ProjectsLandingTemplatePopulatedProps extends ProjectsLandingSharedProps {
  state: 'populated';
  /** All projects to display in the left rail. */
  projects: ProjectsDrawerProject[];
  /** Id of the selected project. When null/undefined, no project is highlighted. */
  selectedId: string | null | undefined;
  /** Called with the project id when a row in the drawer is clicked. */
  onSelect: (id: string) => void;
  /** Called when the "New project" drawer button is clicked. */
  onCreateProject?: () => void;
  /** Called when the "Open project" (or "Open read-only") button is clicked. */
  onOpenProject?: (id: string) => void;
  /**
   * Replaces the default "New project" button in the drawer.
   * When provided, `onCreateProject` is ignored for the drawer button.
   */
  createSlot?: React.ReactNode;
  /** Which drawer tab opens first. Defaults to 'active'. */
  drawerDefaultTab?: ProjectsDrawerTab;
  /** Which detail-pane tab opens first. Defaults to 'activity'. */
  defaultTab?: ProjectsDetailTab;
}

// ─── Empty state props ────────────────────────────────────────────────────────

export interface ProjectsLandingTemplateEmptyProps extends ProjectsLandingSharedProps {
  state: 'empty';
  /** Called when the "Create new project" CTA is clicked. */
  onCreateProject?: () => void;
  /**
   * Replaces the default "Create new project" CTA.
   * When provided, `onCreateProject` is ignored.
   */
  createSlot?: React.ReactNode;
  /** Called when the "Paste source URL" secondary button is clicked. */
  onPasteUrl?: () => void;
  /** Called when the "Import a .pgdp-prep archive" link button is clicked. */
  onImportArchive?: () => void;
  /** Called when the "Open the format style guide" link button is clicked. */
  onOpenStyleGuide?: () => void;
}

export type ProjectsLandingTemplateProps =
  ProjectsLandingTemplatePopulatedProps | ProjectsLandingTemplateEmptyProps;

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Mini 23-dot pipeline progress strip (ported from projects.jsx). */
interface PipelineMiniProps {
  total: number;
  current: number;
  status: ProjectsDrawerProject['status'];
  height?: number;
}

function PipelineMini({ total, current, status, height = 8 }: PipelineMiniProps) {
  const color =
    status === 'error'
      ? 'var(--mismatch)'
      : status === 'running'
        ? 'var(--ocr)'
        : status === 'review'
          ? 'var(--fuzzy)'
          : 'var(--exact)';
  return (
    <div aria-hidden="true" style={{ display: 'flex', alignItems: 'center', gap: 2, height }}>
      {Array.from({ length: total }).map((_, i) => {
        const done = i < current;
        const here = i === current;
        return (
          <span
            key={i}
            style={{
              width: here ? height : Math.max(4, height - 2),
              height: here ? height : Math.max(4, height - 2),
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

// CoverPlaceholder is imported from PipelineTemplate (deduplicated — WS3/WS7)

/** Tiny sort/filter controls strip (ported from projects.jsx). */
function ProjectsControls() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Button variant="ghost" size="sm" iconRight={<Icon name="chevD" size={12} />}>
        Sort: Recent
      </Button>
      <Button variant="ghost" size="sm" iconRight={<Icon name="chevD" size={12} />}>
        All status
      </Button>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          height: 24,
          padding: '0 8px',
          width: 240,
          background: 'var(--bg-sunk)',
          border: '1px solid var(--border-2)',
          borderRadius: 5,
          color: 'var(--ink-3)',
          fontSize: 11.5,
        }}
      >
        <Icon name="search" size={12} />
        <span style={{ flex: 1, fontFamily: 'var(--ui-font)' }}>Filter projects…</span>
      </div>
    </div>
  );
}

// ─── Populated layout ─────────────────────────────────────────────────────────

interface PopulatedLayoutProps {
  props: ProjectsLandingTemplatePopulatedProps;
}

function PopulatedLayout({ props }: PopulatedLayoutProps) {
  const {
    projects,
    selectedId,
    onSelect,
    onCreateProject,
    onOpenProject,
    createSlot,
    drawerDefaultTab,
    defaultTab = 'activity',
    controlsSlot,
  } = props;

  const tabId = React.useId();
  const [tab, setTab] = React.useState<ProjectsDetailTab>(defaultTab);

  // When selectedId changes externally, reset to defaultTab
  const prevSelectedId = React.useRef(selectedId);
  React.useEffect(() => {
    if (prevSelectedId.current !== selectedId) {
      prevSelectedId.current = selectedId;
      setTab(defaultTab);
    }
  }, [selectedId, defaultTab]);

  // No fallback to projects[0] — if no matching project, show empty-state prompt.
  const selected = projects.find((p) => p.id === selectedId);

  if (selected === undefined) {
    // No matching project selected — show "select a project" prompt instead of
    // silently falling back to projects[0] (WS5 fix).
    return (
      <>
        {controlsSlot !== undefined ? (
          <div
            data-testid="projects-controls"
            style={{
              padding: '8px 16px',
              borderBottom: '1px solid var(--border-1)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {controlsSlot}
          </div>
        ) : (
          <div
            style={{
              padding: '8px 16px',
              borderBottom: '1px solid var(--border-1)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ProjectsControls />
          </div>
        )}
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '320px 1fr',
            overflow: 'hidden',
          }}
        >
          <ProjectsDrawer
            projects={projects}
            selectedId={null}
            onSelect={onSelect}
            {...(onCreateProject !== undefined ? { onCreateProject } : {})}
            {...(createSlot !== undefined ? { createSlot } : {})}
            {...(drawerDefaultTab !== undefined ? { defaultTab: drawerDefaultTab } : {})}
          />
          <div
            data-testid="projects-no-selection"
            style={{
              display: 'grid',
              placeItems: 'center',
              color: 'var(--ink-3)',
              fontSize: 13,
            }}
          >
            Select a project to view details.
          </div>
        </div>
      </>
    );
  }

  const statusKey: StatusKey = selected.archived ? 'archived' : selected.status;
  const statusTone = STATUS_TONE[statusKey];
  const statusLabel = STATUS_LABEL[statusKey];

  const progressPct = Math.round((selected.currentStage / selected.totalStages) * 100);

  const stats: Array<{ label: string; value: string | number; sub?: string; toneVar?: string }> = [
    { label: 'pages', value: selected.pages },
    { label: 'on disk', value: selected.size },
    ...(selected.flagged != null
      ? [
          {
            label: 'flagged',
            value: selected.flagged,
            toneVar: 'var(--fuzzy)' as string,
            sub: 'awaiting review',
          },
        ]
      : [{ label: 'flagged', value: '—', sub: 'none' }]),
    {
      label: 'progress',
      value: `${progressPct}%`,
      sub: `${selected.currentStage + 1}/${selected.totalStages} stages`,
    },
    { label: 'created', value: selected.updatedRel },
    { label: 'updated', value: selected.updatedRel },
  ];

  const DETAIL_TABS: Array<{ id: ProjectsDetailTab; label: string; count?: string }> = [
    { id: 'activity', label: 'Recent activity', count: 'last 3' },
    { id: 'attributes', label: 'Attributes' },
    { id: 'manage', label: 'Manage' },
  ];

  const manageActions = selected.archived
    ? [
        {
          icon: 'refresh' as const,
          title: 'Restore project',
          desc: 'Unarchive and make the project editable again. Intermediate artifacts will be regenerated on demand.',
          meta: 'unzip in place',
          cta: 'Restore',
          danger: false,
        },
        {
          icon: 'download' as const,
          title: 'Save a copy…',
          desc: 'Download the archived zip to a different location. The original archive remains here.',
          meta: `${selected.size} · choose destination`,
          cta: 'Save copy',
          danger: false,
        },
        {
          icon: 'trash' as const,
          title: 'Delete project',
          desc: 'Permanently remove everything: pages, settings, package, and history. Only archived projects can be deleted.',
          meta: 'cannot be undone',
          cta: 'Delete permanently',
          danger: true,
        },
      ]
    : [
        {
          icon: 'sparkles' as const,
          title: 'Clean intermediate artifacts',
          desc: 'Drop stage outputs that can be re-derived automatically (crops, OCR, dewarped images). Final package is preserved.',
          meta: 'reclaim 1.62 GB',
          cta: 'Clean',
          danger: false,
        },
        {
          icon: 'archive' as const,
          title: 'Archive project',
          desc: 'Zip the project in place and mark it read-only. Stays in this list under Archived.',
          meta: '→ 24.8 MB zipped · stays here',
          cta: 'Archive',
          danger: false,
        },
        {
          icon: 'download' as const,
          title: 'Save a copy…',
          desc: 'Download a zip of the full project to a different location. The original remains untouched.',
          meta: '~24.8 MB · choose destination',
          cta: 'Save copy',
          danger: false,
        },
        {
          icon: 'trash' as const,
          title: 'Delete project',
          desc: 'Cleans intermediate artifacts and archives the project. Run delete again from the archived state to remove it permanently.',
          meta: 'step 1 of 2 · → archived',
          cta: 'Delete…',
          danger: false,
        },
      ];

  return (
    <>
      {/* Breadcrumb controls bar */}
      {controlsSlot !== undefined ? (
        <div
          data-testid="projects-controls"
          style={{
            padding: '8px 16px',
            borderBottom: '1px solid var(--border-1)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {controlsSlot}
        </div>
      ) : (
        <div
          style={{
            padding: '8px 16px',
            borderBottom: '1px solid var(--border-1)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ProjectsControls />
        </div>
      )}

      {/* Two-column body: left rail + right detail */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          overflow: 'hidden',
        }}
      >
        {/* Left rail — ProjectsDrawer molecule */}
        <ProjectsDrawer
          projects={projects}
          selectedId={selectedId ?? null}
          onSelect={onSelect}
          {...(onCreateProject !== undefined ? { onCreateProject } : {})}
          {...(createSlot !== undefined ? { createSlot } : {})}
          {...(drawerDefaultTab !== undefined ? { defaultTab: drawerDefaultTab } : {})}
        />

        {/* Right pane — selected project detail */}
        <div data-testid="projects-detail" style={{ padding: '32px 40px', overflow: 'auto' }}>
          {/* Header: cover + title + status + open button */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            <CoverPlaceholder author={selected.author} size={88} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 10,
                }}
              >
                <h1
                  style={{
                    fontSize: 24,
                    fontWeight: 600,
                    letterSpacing: '-0.02em',
                    color: 'var(--ink-1)',
                    margin: 0,
                  }}
                >
                  {selected.title}
                </h1>
                <Badge tone={statusTone} mono>
                  {statusLabel}
                </Badge>
              </div>
              <div style={{ marginTop: 4, fontSize: 13, color: 'var(--ink-3)' }}>
                {selected.author}
                {' · '}
                <span style={{ fontFamily: 'var(--mono-font)' }}>{selected.id}</span>
              </div>
            </div>
            <Button
              data-testid="projects-open-btn"
              variant="primary"
              iconRight={<Icon name="arrowR" size={14} />}
              onClick={() => onOpenProject?.(selected.id)}
            >
              {selected.archived ? 'Open (read-only)' : 'Open project'}
            </Button>
          </div>

          {/* Stats grid */}
          <div
            data-testid="projects-stats-grid"
            style={{
              marginTop: 24,
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: 1,
              background: 'var(--border-1)',
              border: '1px solid var(--border-1)',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            {stats.map((stat, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--bg-surface)',
                  padding: '14px 14px 12px',
                }}
              >
                <div className="label" style={{ color: 'var(--ink-3)' }}>
                  {stat.label}
                </div>
                <div
                  className="mono"
                  style={{
                    marginTop: 6,
                    fontSize: 18,
                    fontWeight: 600,
                    color: stat.toneVar ?? 'var(--ink-1)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {stat.value}
                </div>
                {stat.sub != null ? (
                  <div
                    className="mono"
                    style={{
                      marginTop: 2,
                      fontSize: 10.5,
                      color: 'var(--ink-4)',
                    }}
                  >
                    {stat.sub}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {/* Pipeline progress */}
          <div data-testid="projects-pipeline" style={{ marginTop: 24 }}>
            <div className="label" style={{ marginBottom: 8, color: 'var(--ink-3)' }}>
              Pipeline
            </div>
            <div
              style={{
                padding: '14px 16px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-1)',
                borderRadius: 8,
              }}
            >
              <PipelineMini
                total={selected.totalStages}
                current={selected.currentStage}
                status={selected.status}
                height={12}
              />
              <div
                className="mono"
                style={{
                  marginTop: 10,
                  fontSize: 11.5,
                  color: 'var(--ink-3)',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>
                  stage {selected.currentStage + 1}/{selected.totalStages}
                  {selected.archived ? ' · final' : ''}
                </span>
                <span
                  style={{
                    color: selected.flagged != null ? 'var(--fuzzy)' : 'var(--ink-4)',
                  }}
                >
                  {selected.flagged != null ? `${selected.flagged} pages flagged` : ''}
                  {selected.archived ? ` archived ${selected.archivedOn ?? ''}` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Tabbed detail: Activity / Attributes / Manage */}
          <div style={{ marginTop: 28 }}>
            {/* Tab strip */}
            <div
              data-testid="projects-tab-strip"
              role="tablist"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                borderBottom: '1px solid var(--border-1)',
              }}
            >
              {DETAIL_TABS.map((t) => {
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    id={`${tabId}-tab-${t.id}`}
                    data-tab={t.id}
                    aria-selected={active}
                    aria-controls={`${tabId}-panel-${t.id}`}
                    tabIndex={active ? 0 : -1}
                    onClick={() => setTab(t.id)}
                    style={{
                      position: 'relative',
                      background: 'transparent',
                      border: 0,
                      padding: '10px 14px',
                      cursor: 'pointer',
                      color: active ? 'var(--ink-1)' : 'var(--ink-3)',
                      fontSize: 12.5,
                      fontWeight: active ? 600 : 500,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    {t.label}
                    {t.count != null ? (
                      <span
                        className="mono"
                        style={{
                          fontSize: 10,
                          padding: '1px 6px',
                          borderRadius: 4,
                          background: active
                            ? 'color-mix(in srgb, var(--accent) 18%, transparent)'
                            : 'var(--bg-raised)',
                          color: active ? 'var(--accent)' : 'var(--ink-3)',
                        }}
                      >
                        {t.count}
                      </span>
                    ) : null}
                    {active ? (
                      <span
                        aria-hidden="true"
                        style={{
                          position: 'absolute',
                          left: 10,
                          right: 10,
                          bottom: -1,
                          height: 2,
                          background: 'var(--accent)',
                          borderRadius: '2px 2px 0 0',
                        }}
                      />
                    ) : null}
                  </button>
                );
              })}
              <span style={{ flex: 1 }} />
              {tab === 'activity' ? (
                <button
                  type="button"
                  style={{
                    fontSize: 11.5,
                    color: 'var(--ink-3)',
                    textDecoration: 'none',
                    padding: '6px 10px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    background: 'transparent',
                    border: 0,
                  }}
                >
                  View all activity
                  <Icon name="arrowR" size={11} />
                </button>
              ) : null}
            </div>

            {/* Tab body */}
            <div
              data-testid="projects-tab-body"
              role="tabpanel"
              id={`${tabId}-panel-${tab}`}
              aria-labelledby={`${tabId}-tab-${tab}`}
            >
              {tab === 'activity' ? (
                <div
                  style={{
                    marginTop: 12,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-1)',
                    borderRadius: 8,
                    padding: '4px 0',
                  }}
                >
                  {(
                    [
                      ['ocr', 'completed · 412 pages · 6m 12s', 'May 21, 18:30'],
                      ['spellcheck', '4 dictionary mismatches', 'May 21, 17:08'],
                      ['text_review', 'awaiting input · 18 pages flagged', 'May 21, 16:55'],
                    ] as Array<[string, string, string]>
                  ).map(([stage, desc, when], i) => (
                    <div
                      key={i}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '120px 1fr 140px',
                        gap: 12,
                        padding: '10px 16px',
                        borderTop: i === 0 ? 0 : '1px solid var(--border-1)',
                        alignItems: 'center',
                      }}
                    >
                      <span
                        className="mono"
                        style={{
                          fontSize: 11.5,
                          color: 'var(--ink-2)',
                          fontWeight: 600,
                        }}
                      >
                        {stage}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{desc}</span>
                      <span
                        className="mono"
                        style={{
                          fontSize: 11,
                          color: 'var(--ink-4)',
                          textAlign: 'right',
                        }}
                      >
                        {when}
                      </span>
                    </div>
                  ))}
                  <div
                    style={{
                      padding: '10px 16px',
                      borderTop: '1px solid var(--border-1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                      + earlier entries
                    </span>
                    <Button variant="ghost" size="sm" iconRight={<Icon name="arrowR" size={11} />}>
                      Open activity log
                    </Button>
                  </div>
                </div>
              ) : null}

              {tab === 'attributes' ? (
                <AttributesPanel
                  project={{ id: selected.id, title: selected.title, author: selected.author }}
                />
              ) : null}

              {tab === 'manage' ? (
                <div
                  style={{
                    marginTop: 12,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-1)',
                    borderRadius: 8,
                    padding: '4px 0',
                  }}
                >
                  {manageActions.map((a, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '28px 1fr 200px 150px',
                        gap: 14,
                        padding: '14px 16px',
                        alignItems: 'center',
                        borderTop: i === 0 ? 0 : '1px solid var(--border-1)',
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          background: a.danger
                            ? 'color-mix(in oklab, var(--mismatch) 10%, transparent)'
                            : 'var(--bg-raised)',
                          color: a.danger ? 'var(--mismatch)' : 'var(--ink-2)',
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      >
                        <Icon name={a.icon} size={14} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: 'var(--ink-1)',
                          }}
                        >
                          {a.title}
                        </div>
                        <div
                          style={{
                            marginTop: 2,
                            fontSize: 12,
                            color: 'var(--ink-3)',
                            lineHeight: 1.45,
                          }}
                        >
                          {a.desc}
                        </div>
                      </div>
                      <div
                        className="mono"
                        style={{
                          fontSize: 11,
                          color: a.danger ? 'var(--mismatch)' : 'var(--ink-4)',
                          textAlign: 'right',
                        }}
                      >
                        {a.meta}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                        }}
                      >
                        <Button variant={a.danger ? 'danger' : 'ghost'} size="sm">
                          {a.cta}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Empty layout ─────────────────────────────────────────────────────────────

interface EmptyLayoutProps {
  props: ProjectsLandingTemplateEmptyProps;
}

function EmptyLayout({ props }: EmptyLayoutProps) {
  const {
    onCreateProject,
    createSlot,
    controlsSlot,
    onPasteUrl,
    onImportArchive,
    onOpenStyleGuide,
  } = props;
  return (
    <>
      {/* Controls bar (same chrome as populated) */}
      {controlsSlot !== undefined ? (
        <div
          data-testid="projects-controls"
          style={{
            padding: '8px 16px',
            borderBottom: '1px solid var(--border-1)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {controlsSlot}
        </div>
      ) : (
        <div
          style={{
            padding: '8px 16px',
            borderBottom: '1px solid var(--border-1)',
          }}
        >
          <ProjectsControls />
        </div>
      )}

      {/* Hero area */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          placeItems: 'center',
          padding: '48px 24px',
        }}
      >
        <div
          data-testid="projects-empty-hero"
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
          {/* Iconographic page stack (no AI-generated SVGs) */}
          <div aria-hidden="true" style={{ position: 'relative', width: 140, height: 100 }}>
            {[0, 1, 2].map((i) => (
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

          {/* Headline + description */}
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: '-0.015em',
                color: 'var(--ink-1)',
                margin: 0,
              }}
            >
              No projects yet
            </h1>
            <p
              style={{
                marginTop: 8,
                fontSize: 13.5,
                color: 'var(--ink-3)',
                lineHeight: 1.55,
                maxWidth: 440,
                marginInline: 'auto',
              }}
            >
              A project bundles a book&#39;s pages, settings, and pipeline state — everything needed
              to assemble a PGDP-ready package. Start by uploading a folder of scans, or paste a
              source URL from archive.org / Google Books.
            </p>
          </div>

          {/* Primary CTAs */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {createSlot !== undefined ? (
              createSlot
            ) : (
              <>
                <Button
                  variant="primary"
                  size="lg"
                  icon={<Icon name="plus" size={16} />}
                  onClick={onCreateProject}
                >
                  Create new project
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  icon={<Icon name="link" size={16} />}
                  onClick={onPasteUrl}
                >
                  Paste source URL
                </Button>
              </>
            )}
          </div>

          {/* Tertiary links */}
          <div
            style={{
              marginTop: 12,
              paddingTop: 20,
              borderTop: '1px solid var(--border-1)',
              width: '100%',
              fontSize: 12,
              color: 'var(--ink-3)',
              display: 'flex',
              justifyContent: 'center',
              gap: 18,
            }}
          >
            <button
              type="button"
              onClick={onImportArchive}
              style={{
                color: 'var(--ink-3)',
                background: 'transparent',
                border: 0,
                cursor: 'pointer',
                fontSize: 12,
                textDecoration: 'none',
                padding: 0,
              }}
            >
              Import a .pgdp-prep archive
            </button>
            <span style={{ color: 'var(--border-2)' }}>·</span>
            <button
              type="button"
              onClick={onOpenStyleGuide}
              style={{
                color: 'var(--ink-3)',
                background: 'transparent',
                border: 0,
                cursor: 'pointer',
                fontSize: 12,
                textDecoration: 'none',
                padding: 0,
              }}
            >
              Open the format style guide
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── ProjectsLandingTemplate ──────────────────────────────────────────────────

/**
 * Root projects-page template.
 *
 * Discriminated by `state`:
 *   - `'populated'` → left-rail ProjectsDrawer + right detail pane
 *   - `'empty'`     → centered hero with create CTA
 *
 * Mount inside a parent `<AppShell>` for full suite chrome (header, nav, etc.).
 * The template owns only the content zone below the header.
 */
export const ProjectsLandingTemplate = React.forwardRef<
  HTMLDivElement,
  ProjectsLandingTemplateProps
>(function ProjectsLandingTemplate(props, ref) {
  const themeAttr =
    props.theme !== undefined ? ({ 'data-theme': props.theme } as Record<string, string>) : {};

  return (
    <div
      ref={ref}
      data-testid="projects-landing"
      {...themeAttr}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--bg-page)',
        overflow: 'hidden',
      }}
    >
      {props.state === 'populated' ? (
        <PopulatedLayout props={props} />
      ) : (
        <EmptyLayout props={props} />
      )}
    </div>
  );
});

ProjectsLandingTemplate.displayName = 'ProjectsLandingTemplate';
