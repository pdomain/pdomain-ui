/**
 * ProjectSettingsTemplate — project-scoped settings page template.
 *
 * Design source: `ProjectSettingsTemplate` in
 * docs/templates/design_handoff_pdomain_ui/final/pipeline/pipeline-template.jsx
 * (lines 339–394).
 *
 * Layout:
 *   ┌─────────────────────────────────────────────────────┐
 *   │  ProjectInfoBand (inSettings)                       │
 *   ├──────────────┬──────────────────────────────────────┤
 *   │  Left rail   │  Right pane (children slot)          │
 *   │  (8-item     │                                      │
 *   │   settings   │                                      │
 *   │   nav)       │                                      │
 *   └──────────────┴──────────────────────────────────────┘
 *
 * Slots:
 *   - `theme`        — forwarded to the root div as data-theme
 *   - `project`      — ProjectData bag (title, author, id, pages, ingested, size)
 *   - `currentGroup` — active group id (one of the 8 ProjectSettingsGroup values)
 *   - `children`     — right-pane content; defaults to a placeholder stripe
 *
 * Note on inline nav: Issue #357 is shipping `SettingsNav` to
 * `src/templates/SettingsNav.tsx` in parallel. To avoid a hard dependency on
 * the not-yet-merged component, the 8-item left-rail nav is defined inline
 * here. After both branches merge, a follow-up refactor can swap the inline
 * nav for the extracted SettingsNav component.
 *
 * Constraints:
 *   - No hex literals — all colors via var(--token).
 *   - No CVA.
 *   - No direct lucide-react imports.
 */
import * as React from 'react';
import { ProjectInfoBand } from './PipelineTemplate.js';
import type { PipelineProject as ProjectData } from './PipelineTemplate.js';
import { SettingsNav, PROJECT_SETTINGS_GROUPS } from './SettingsNav.js';
import {
  PROJECT_SETTINGS_TEMPLATE,
  PROJECT_SETTINGS_NAV,
  PROJECT_SETTINGS_CONTENT,
} from '../testids/index.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** The 8 project-settings group identifiers. */
export type ProjectSettingsGroup =
  | 'general'
  | 'bib'
  | 'pgdp'
  | 'format'
  | 'defaults'
  | 'members'
  | 'storage'
  | 'danger';

// ---------------------------------------------------------------------------
// Default right-pane placeholder (no children supplied)
// ---------------------------------------------------------------------------

function SettingsContentPlaceholder() {
  return (
    <div
      style={{
        flex: 1,
        minHeight: 320,
        border: '1px dashed var(--border-2)',
        borderRadius: 10,
        background:
          'repeating-linear-gradient(135deg, transparent 0 14px, color-mix(in oklab, var(--border-1) 35%, transparent) 14px 15px)',
        display: 'grid',
        placeItems: 'center',
        color: 'var(--ink-3)',
      }}
    >
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div
          style={{
            fontSize: 11,
            color: 'var(--ink-4)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontFamily: 'var(--mono-font, monospace)',
          }}
        >
          content slot · settings group
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>
          Settings group content renders here.
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ProjectSettingsTemplateProps {
  /**
   * Design-system theme override.
   * Applied as `data-theme` on the root element.
   * Defaults to the inherited theme from the ancestor context.
   */
  theme?: 'dark' | 'light';
  /** Project identity data displayed in the ProjectInfoBand. */
  project?: ProjectData;
  /**
   * Currently active settings group.
   * One of the 8 standard project-settings groups.
   */
  currentGroup?: ProjectSettingsGroup;
  /**
   * Right-pane content slot.
   * Defaults to a striped placeholder when omitted.
   */
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Sample project (used when no project prop is supplied)
// ---------------------------------------------------------------------------

const SAMPLE_PROJECT: ProjectData = {
  title: 'Belloc — Survivals & New Arrivals',
  author: 'Hilaire Belloc',
  id: 'belloc-survivals',
  pages: 232,
  ingested: '12 min ago',
  size: '2.1 GB',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Project-scoped settings page template.
 *
 * Composes:
 *   - `ProjectInfoBand` (in settings mode) — project identity header
 *   - 8-item left-rail nav (inline; see note on SettingsNav in file header)
 *   - Right-pane slot for settings group content
 *
 * @example
 * ```tsx
 * <ProjectSettingsTemplate
 *   project={myProject}
 *   currentGroup="bib"
 * >
 *   <BibliographicSettingsForm />
 * </ProjectSettingsTemplate>
 * ```
 */
export function ProjectSettingsTemplate({
  theme,
  project = SAMPLE_PROJECT,
  currentGroup = 'general',
  children,
}: ProjectSettingsTemplateProps): React.ReactElement {
  return (
    <div
      data-testid={PROJECT_SETTINGS_TEMPLATE}
      data-theme={theme}
      style={{
        height: '100%',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-page)',
        color: 'var(--ink-1)',
      }}
    >
      {/* Project identity header — "Close settings" button variant */}
      <ProjectInfoBand project={project} inSettings />

      {/* Two-column body: nav rail + content pane */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '240px 1fr',
          minHeight: 0,
        }}
      >
        {/* ── Left rail ─────────────────────────────────────────────────── */}
        <div
          data-testid={PROJECT_SETTINGS_NAV}
          style={{
            borderRight: '1px solid var(--border-1)',
            background: 'var(--bg-surface)',
            padding: '14px 12px',
          }}
        >
          <SettingsNav
            groups={PROJECT_SETTINGS_GROUPS}
            currentGroup={currentGroup}
            onGroupChange={() => {
              // Navigation is controlled by the consuming app via route changes.
              // Provide a no-op here; apps wrap ProjectSettingsTemplate in a router.
            }}
            label="Project settings"
          />
        </div>

        {/* ── Right pane ─────────────────────────────────────────────────── */}
        <div
          data-testid={PROJECT_SETTINGS_CONTENT}
          style={{
            overflow: 'auto',
            padding: '20px 28px',
          }}
        >
          {children !== undefined ? children : <SettingsContentPlaceholder />}
        </div>
      </div>
    </div>
  );
}

ProjectSettingsTemplate.displayName = 'ProjectSettingsTemplate';

// Re-export project data type so consumers can type their project bags correctly
export type { ProjectData };
