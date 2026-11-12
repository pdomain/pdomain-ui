/**
 * PipelineTemplate — locked per-project Pipeline page template.
 *
 * Design source: docs/templates/design_handoff_pdomain_ui/final/pipeline/pipeline-template.jsx
 * Port plan: Table 5 row "PipelineTemplate"
 *
 * Two primary slots:
 *   - `tabsSlot`  — the per-stage tab band; defaults to `TabsBand` built from the
 *                   default tabs for the current stage.
 *   - `children`  — the per-tab content body; defaults to `PipelineEmptySlot`.
 *
 * Additional slots / props:
 *   - `trail`     — breadcrumb items array (label, mono?). Defaults to
 *                   [{ label: 'Projects' }, { label: project.id, mono: true }].
 *   - `controls`  — node rendered in the breadcrumb controls area (sort / filter / etc).
 *   - `project`   — project descriptor (title, author, id, pages, ingested, size, status?).
 *   - `stage`     — active pipeline stage id (e.g. 'threshold').
 *   - `stages`    — ordered pipeline stage list; pass PIPELINE_STAGES from StageStrip.
 *   - `currentTab`— initially-active tab id. Defaults to first non-overview tab.
 *   - `theme`     — 'dark' | 'light'. Applied as data-theme attribute.
 *
 * Constraints:
 *   - No hex literals — all colors via var(--token).
 *   - No CVA — variants via CSS class modifiers.
 *   - No direct lucide-react imports — icons via ../icons/.
 */
import * as React from 'react';
import { Badge } from '../primitives/Badge.js';
import { Button } from '../primitives/Button.js';
import { Separator } from '../primitives/Separator.js';
import { Icon } from '../icons/Icon.js';
import { TabsBand } from './TabsBand.js';
import { StageStrip } from './StageStrip.js';
import type { StageDef } from './StageStrip.js';
import type { TabsBandItem } from './TabsBand.js';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** Breadcrumb trail item. */
export interface TrailItem {
  /** Display label. */
  label: string;
  /** When true, renders in monospace. */
  mono?: boolean;
}

/** Project descriptor passed to PipelineTemplate and ProjectInfoBand. */
export interface PipelineProject {
  title: string;
  author: string;
  id: string;
  pages: number;
  ingested: string;
  size: string;
  /** Stage/status label shown in Badge. Defaults to 'review'. */
  status?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Default tabs per stage (matches design STAGE_TABS)
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_STAGE_TABS: Record<string, TabsBandItem[]> = {
  source: [
    { id: 'overview', name: 'Overview', icon: <Icon name="package" size={13} /> },
    { id: 'files', name: 'Files', icon: <Icon name="folder" size={13} />, count: 387 },
    { id: 'workbench', name: 'Page workbench', icon: <Icon name="image" size={13} /> },
    { id: 'settings', name: 'Stage settings', icon: <Icon name="wrench" size={13} /> },
  ],
  ocr: [
    { id: 'overview', name: 'Overview', icon: <Icon name="package" size={13} /> },
    { id: 'pages', name: 'Pages', icon: <Icon name="file" size={13} />, count: 232 },
    { id: 'recognition', name: 'Recognition', icon: <Icon name="sparkles" size={13} /> },
    { id: 'workbench', name: 'Page workbench', icon: <Icon name="image" size={13} /> },
    { id: 'settings', name: 'Stage settings', icon: <Icon name="wrench" size={13} /> },
  ],
  text_review: [
    { id: 'overview', name: 'Overview', icon: <Icon name="package" size={13} /> },
    { id: 'pages', name: 'Pages', icon: <Icon name="file" size={13} />, count: 232 },
    { id: 'queue', name: 'Review queue', icon: <Icon name="eye" size={13} />, count: 31 },
    { id: 'comments', name: 'Comments', icon: <Icon name="fileText" size={13} /> },
    { id: 'workbench', name: 'Page workbench', icon: <Icon name="image" size={13} /> },
    { id: 'settings', name: 'Stage settings', icon: <Icon name="wrench" size={13} /> },
  ],
  build_package: [
    { id: 'overview', name: 'Overview', icon: <Icon name="package" size={13} /> },
    { id: 'manifest', name: 'Manifest', icon: <Icon name="fileText" size={13} /> },
    { id: 'preflight', name: 'Pre-flight', icon: <Icon name="checkCircle" size={13} /> },
    { id: 'settings', name: 'Stage settings', icon: <Icon name="wrench" size={13} /> },
  ],
  hyphen_join: [
    { id: 'overview', name: 'Overview', icon: <Icon name="package" size={13} /> },
    { id: 'queue', name: 'Undecided', icon: <Icon name="eye" size={13} />, count: 7 },
    { id: 'joined', name: 'Auto-joined', icon: <Icon name="check" size={13} />, count: 42 },
    { id: 'mismatch', name: 'Mismatch', icon: <Icon name="alert" size={13} />, count: 3 },
    { id: 'workbench', name: 'Page workbench', icon: <Icon name="image" size={13} /> },
    { id: 'settings', name: 'Stage settings', icon: <Icon name="wrench" size={13} /> },
  ],
};

const DEFAULT_TABS: TabsBandItem[] = [
  { id: 'overview', name: 'Overview', icon: <Icon name="package" size={13} /> },
  { id: 'pages', name: 'Pages', icon: <Icon name="file" size={13} />, count: 232 },
  { id: 'workbench', name: 'Page workbench', icon: <Icon name="image" size={13} /> },
  { id: 'settings', name: 'Stage settings', icon: <Icon name="wrench" size={13} /> },
];

/** Returns the canonical tab list for a given stage id. */
export function getTabsForStage(stageId: string): TabsBandItem[] {
  return DEFAULT_STAGE_TABS[stageId] ?? DEFAULT_TABS;
}

// ─────────────────────────────────────────────────────────────────────────────
// CoverPlaceholder
// ─────────────────────────────────────────────────────────────────────────────

export interface CoverPlaceholderProps {
  author: string;
  size?: number;
}

/**
 * Initials-based book-cover placeholder.
 * Derives a deterministic hue from the author string and renders
 * a gradient slab in book-aspect-ratio (1 : 1.35) with 2-letter initials.
 * All colors via CSS custom properties — no hex in component code.
 */
export function CoverPlaceholder({ author, size = 56 }: CoverPlaceholderProps) {
  const initials = author
    .split(' ')
    .map((w) => w[0] ?? '')
    .slice(0, 2)
    .join('');
  // Deterministic hue 0-359 from author string
  const hue = [...author].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const hue2 = (hue + 30) % 360;

  return (
    <div
      data-testid="cover-placeholder"
      aria-hidden="true"
      style={{
        width: size,
        height: Math.round(size * 1.35),
        borderRadius: 4,
        background: `linear-gradient(160deg, oklch(0.62 0.07 ${hue}), oklch(0.42 0.06 ${hue2}))`,
        color: 'var(--cover-ink)',
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        fontFamily: 'var(--mono-font)',
        fontWeight: 600,
        fontSize: Math.round(size * 0.28),
        letterSpacing: '0.04em',
        boxShadow: 'var(--shadow-cover-inset)',
      }}
    >
      {initials}
    </div>
  );
}

CoverPlaceholder.displayName = 'CoverPlaceholder';

// ─────────────────────────────────────────────────────────────────────────────
// ProjectInfoBand
// ─────────────────────────────────────────────────────────────────────────────

export interface ProjectInfoBandProps {
  project: PipelineProject;
  /** When true, button flips to "Close settings" primary variant. */
  inSettings?: boolean;
  /** Called when the Project settings / Close settings button is clicked. */
  onSettingsToggle?: () => void;
  /** Called when "Run all stale" is clicked. */
  onRunAll?: () => void;
}

/**
 * Project info band — cover + title + status badge + meta + settings toggle.
 * Shown at the top of PipelineTemplate and ProjectSettingsTemplate.
 *
 * Design source: `ProjectInfoBand` in pipeline-template.jsx (lines 106-150).
 */
export function ProjectInfoBand({
  project,
  inSettings = false,
  onSettingsToggle,
  onRunAll,
}: ProjectInfoBandProps) {
  return (
    <div
      data-testid="pipeline-project-info"
      style={{
        padding: '20px 28px',
        background: 'var(--bg-page)',
        borderBottom: '1px solid var(--border-1)',
        display: 'flex',
        gap: 18,
        alignItems: 'flex-start',
        flexShrink: 0,
      }}
    >
      <CoverPlaceholder author={project.author} size={56} />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: '-0.015em',
              color: 'var(--ink-1)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              margin: 0,
            }}
          >
            {project.title}
          </h1>
          <Badge tone={project.status === 'review' ? 'review' : 'neutral'} mono>
            {project.status ?? 'review'}
          </Badge>
        </div>

        {/* Meta row */}
        <div
          className="mono"
          style={{
            marginTop: 4,
            fontSize: 11.5,
            color: 'var(--ink-3)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <span>{project.id}</span>
          <span style={{ color: 'var(--border-3)' }} aria-hidden>
            ·
          </span>
          <span>{project.author}</span>
          <span style={{ color: 'var(--border-3)' }} aria-hidden>
            ·
          </span>
          <span>{project.pages} pages</span>
          <span style={{ color: 'var(--border-3)' }} aria-hidden>
            ·
          </span>
          <span>ingested {project.ingested}</span>
          <span style={{ color: 'var(--border-3)' }} aria-hidden>
            ·
          </span>
          <span>{project.size}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          flex: '0 0 auto',
          alignItems: 'center',
        }}
      >
        <Button
          {...(inSettings ? { variant: 'primary' as const } : {})}
          size="md"
          icon={<Icon name={inSettings ? 'x' : 'wrench'} size={14} />}
          {...(onSettingsToggle !== undefined ? { onClick: onSettingsToggle } : {})}
        >
          {inSettings ? 'Close settings' : 'Project settings'}
        </Button>
        {!inSettings ? (
          <>
            <Separator orientation="vertical" style={{ height: 22 }} />
            <Button
              variant="primary"
              size="md"
              iconRight={<Icon name="arrowR" size={14} />}
              onClick={onRunAll}
            >
              Run all stale
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}

ProjectInfoBand.displayName = 'ProjectInfoBand';

// ─────────────────────────────────────────────────────────────────────────────
// PipelineEmptySlot
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Default content placeholder for the `children` slot.
 * Striped dashed container indicating where per-tab content lands.
 */
export function PipelineEmptySlot() {
  return (
    <div
      data-testid="pipeline-empty-slot"
      style={{ padding: 24, flex: 1, minHeight: 0, display: 'flex' }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 480,
          border: '1px dashed var(--border-2)',
          borderRadius: 10,
          background:
            'repeating-linear-gradient(135deg, transparent 0 14px, color-mix(in oklab, var(--border-1) 35%, transparent) 14px 15px)',
          display: 'grid',
          placeItems: 'center',
          color: 'var(--ink-3)',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div
            className="mono"
            style={{
              fontSize: 11,
              color: 'var(--ink-4)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            content slot · per-tab
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>
            Overview / Pages / Step settings content lands here.
          </div>
        </div>
      </div>
    </div>
  );
}

PipelineEmptySlot.displayName = 'PipelineEmptySlot';

// ─────────────────────────────────────────────────────────────────────────────
// PipelineTemplate — main component
// ─────────────────────────────────────────────────────────────────────────────

export interface PipelineTemplateProps {
  /**
   * Color theme. When set, applies `data-theme` on the root element so the
   * design-system tokens switch between dark (default) and light palettes.
   * @default 'dark'
   */
  theme?: 'dark' | 'light';

  /**
   * Breadcrumb trail items rendered in the sub-header band.
   * Defaults to [{ label: 'Projects' }, { label: project.id, mono: true }].
   */
  trail?: TrailItem[];

  /** Project descriptor (title, author, id, pages, etc.). */
  project: PipelineProject;

  /**
   * Ordered pipeline stage descriptors (typically PIPELINE_STAGES from StageStrip).
   */
  stages: StageDef[];

  /**
   * Currently active stage id (e.g. 'threshold').
   * Used to look up default tabs and forward to StageStrip.
   */
  stage: string;

  /**
   * Id of the initially active tab within the tabs slot.
   * Defaults to the first non-overview tab for the current stage.
   */
  currentTab?: string;

  /**
   * Override for the tabs band.
   * When provided, replaces the default `<TabsBand>` built from getTabsForStage(stage).
   * Pass `null` to render no tabs band at all.
   */
  tabsSlot?: React.ReactNode;

  /**
   * Per-tab content body.
   * When omitted, renders `<PipelineEmptySlot>`.
   */
  children?: React.ReactNode;

  /**
   * Controls rendered in the breadcrumb band (sort / filter dropdowns, search, etc.).
   * Defaults to Sort-Recent + Find-page ghost buttons.
   */
  controls?: React.ReactNode;

  /** Called when the stage strip's Prev button is clicked. */
  onStagePrev?: () => void;
  /** Called when the stage strip's Next button is clicked. */
  onStageNext?: () => void;
  /** Called when a stage dot/pill is clicked. */
  onStageClick?: (stageId: string) => void;
  /** Called when the Project settings toggle is clicked. */
  onSettingsToggle?: () => void;
  /** Called when Run all stale is clicked. */
  onRunAll?: () => void;
  /** Called when tab changes (forwarded to internal TabsBand unless tabsSlot overrides). */
  onTabChange?: (tabId: string) => void;

  /** Flagged page count forwarded to StageStrip. */
  flagged?: number;
  /** Stale / dirty page count forwarded to StageStrip. */
  dirty?: number;
  /** When true, the current stage dot pulses (forwarded to StageStrip). */
  running?: boolean;
}

/**
 * PipelineTemplate — the primary per-project pipeline page template.
 *
 * Composes AppHeader + breadcrumb band + ProjectInfoBand + StageStrip +
 * tab band (tabsSlot) + content body (children) into the full per-project
 * pipeline layout.
 *
 * Usage:
 * ```tsx
 * <PipelineTemplate
 *   project={myProject}
 *   stages={PIPELINE_STAGES}
 *   stage="threshold"
 *   onStageNext={() => ...}
 *   onStagePrev={() => ...}
 * >
 *   <ThresholdOverviewTab />
 * </PipelineTemplate>
 * ```
 */
export function PipelineTemplate({
  theme,
  trail,
  project,
  stages,
  stage,
  currentTab,
  tabsSlot,
  children,
  controls,
  onStagePrev,
  onStageNext,
  onStageClick,
  onSettingsToggle,
  onRunAll,
  onTabChange,
  flagged,
  dirty,
  running = false,
}: PipelineTemplateProps) {
  // Derive active tab: caller-provided → first non-overview → first tab
  const defaultTabs = getTabsForStage(stage);
  const activeTab =
    currentTab ??
    defaultTabs.find((t) => t.id !== 'overview')?.id ??
    defaultTabs[0]?.id ??
    'overview';

  // Breadcrumb trail
  const resolvedTrail: TrailItem[] = trail ?? [
    { label: 'Projects' },
    { label: project.id, mono: true },
  ];

  // Controls default
  const resolvedControls = controls ?? (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Button variant="ghost" size="sm" iconRight={<Icon name="chevD" size={12} />}>
        Sort: Recent
      </Button>
      <Button variant="ghost" size="sm" icon={<Icon name="search" size={13} />}>
        Find page
      </Button>
    </div>
  );

  // Tabs slot default
  const resolvedTabs =
    tabsSlot !== undefined ? (
      tabsSlot
    ) : (
      <TabsBand
        items={defaultTabs}
        current={activeTab}
        {...(onTabChange !== undefined ? { onTabChange } : {})}
      />
    );

  return (
    <div
      data-testid="pipeline-template"
      data-theme={theme}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-page)',
        overflow: 'hidden',
      }}
    >
      {/* ── Sub-header: breadcrumb band ── */}
      <div
        style={{
          padding: '0 28px',
          height: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-1)',
          flexShrink: 0,
        }}
      >
        {/* Breadcrumb */}
        <nav
          data-testid="pipeline-breadcrumb"
          aria-label="Breadcrumb"
          style={{ flex: 1, minWidth: 0 }}
        >
          <ol
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              listStyle: 'none',
              margin: 0,
              padding: 0,
            }}
          >
            {resolvedTrail.map((item, i) => (
              <React.Fragment key={item.label}>
                {i > 0 ? (
                  <li aria-hidden="true" style={{ color: 'var(--ink-4)', fontSize: 12 }}>
                    /
                  </li>
                ) : null}
                <li
                  className={item.mono ? 'mono' : undefined}
                  style={{
                    fontSize: 12,
                    color: i === resolvedTrail.length - 1 ? 'var(--ink-1)' : 'var(--ink-3)',
                    fontWeight: i === resolvedTrail.length - 1 ? 500 : 400,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.label}
                </li>
              </React.Fragment>
            ))}
          </ol>
        </nav>

        {/* Controls slot */}
        <div data-testid="pipeline-controls" style={{ flexShrink: 0 }}>
          {resolvedControls}
        </div>
      </div>

      {/* ── Project info band ── */}
      <ProjectInfoBand
        project={project}
        {...(onSettingsToggle !== undefined ? { onSettingsToggle } : {})}
        {...(onRunAll !== undefined ? { onRunAll } : {})}
      />

      {/* ── Stage strip ── */}
      <div data-testid="pipeline-stage-strip" style={{ flexShrink: 0 }}>
        <StageStrip
          stages={stages}
          current={stage}
          running={running}
          {...(flagged !== undefined ? { flagged } : {})}
          {...(dirty !== undefined ? { dirty } : {})}
          {...(onStageClick !== undefined ? { onStageClick } : {})}
          {...(onStagePrev !== undefined ? { onPrev: onStagePrev } : {})}
          {...(onStageNext !== undefined ? { onNext: onStageNext } : {})}
        />
      </div>

      {/* ── Tabs slot ── */}
      <div data-testid="pipeline-tabs" style={{ flexShrink: 0 }}>
        {resolvedTabs}
      </div>

      {/* ── Body slot ── */}
      <div
        data-testid="pipeline-body"
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children !== undefined ? children : <PipelineEmptySlot />}
      </div>
    </div>
  );
}

PipelineTemplate.displayName = 'PipelineTemplate';
