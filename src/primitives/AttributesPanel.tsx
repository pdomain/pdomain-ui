/**
 * AttributesPanel — PGDP-level project attributes panel.
 *
 * Collapsible sections in a 2-column reflow grid.
 * Ported from docs/templates/design_handoff_pdomain_ui/final/projects/projects.jsx
 *
 * Design notes:
 * - Uses CSS custom properties only (no hex literals per spec §4).
 * - All sections are collapsible; defaults to all open.
 * - The comments section spans all columns (long-form prose).
 * - sectionActions slot lets consumers override the default "Edit" button
 *   per section key ('bib' | 'pgdp' | 'fmt' | 'comments').
 * - children replaces the default comments body text (acts as a comments slot).
 */
import * as React from 'react';
import { cn } from './cn.js';

// ─── Types ────────────────────────────────────────────────────────────────────

/** The minimal shape AttributesPanel needs from a project record. */
export interface AttributesPanelProject {
  id: string;
  title: string;
  author: string;
}

export type AttributesPanelSectionKey = 'bib' | 'pgdp' | 'fmt' | 'comments';

export interface AttributesPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The project to display. At minimum: { id, title, author }. */
  project: AttributesPanelProject;
  /**
   * Override action slot per section.
   * Keys correspond to section key strings: 'bib' | 'pgdp' | 'fmt' | 'comments'.
   * If omitted for a section, the default "Edit" button renders.
   */
  sectionActions?: Partial<Record<AttributesPanelSectionKey, React.ReactNode>>;
  /**
   * Replaces the default comments body text.
   * When provided, rendered inside the "Project comments" collapsed body.
   */
  children?: React.ReactNode;
}

// ─── Section header (collapse toggle + action slot) ───────────────────────────

interface CollapseHeaderProps {
  label: string;
  count?: string;
  isOpen: boolean;
  onToggle: () => void;
  actionSlot?: React.ReactNode;
}

const CollapseHeader = ({ label, count, isOpen, onToggle, actionSlot }: CollapseHeaderProps) => (
  <div
    role="button"
    tabIndex={0}
    aria-expanded={isOpen}
    onClick={onToggle}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onToggle();
      }
    }}
    className="ap-section-header"
  >
    <span className="ap-section-header__left">
      <span
        className="ap-section-header__chev"
        aria-hidden="true"
        style={{
          display: 'inline-flex',
          transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
          transition: 'transform .15s',
        }}
      >
        &#8964;
      </span>
      <span className="label ap-section-header__label">{label}</span>
      {count != null ? <span className="mono ap-section-header__count">{count}</span> : null}
    </span>
    {/* Prevent toggle propagation from the action slot */}
    {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
    <span className="ap-section-header__actions" onClick={(e) => e.stopPropagation()}>
      {actionSlot}
    </span>
  </div>
);

// ─── AttributesPanel ─────────────────────────────────────────────────────────

export const AttributesPanel = React.forwardRef<HTMLDivElement, AttributesPanelProps>(
  function AttributesPanel({ project, sectionActions, children, className, ...props }, ref) {
    const [open, setOpen] = React.useState<Record<AttributesPanelSectionKey, boolean>>({
      bib: true,
      pgdp: true,
      fmt: true,
      comments: true,
    });

    const toggle = (k: AttributesPanelSectionKey) =>
      setOpen((prev) => ({ ...prev, [k]: !prev[k] }));

    const groups: Array<{
      key: AttributesPanelSectionKey;
      label: string;
      fields: Array<[string, string, boolean?]>;
    }> = [
      {
        key: 'bib',
        label: 'Bibliographic',
        fields: [
          ['Title', project.title],
          ['Author', project.author],
          ['Language', 'English'],
          ['Original year', '1815'],
          ['Edition', 'John Murray, London — 1816 stereotype'],
          ['Source archive', 'archive.org · ' + project.id + '-1816'],
        ],
      },
      {
        key: 'pgdp',
        label: 'PGDP project',
        fields: [
          ['Project ID', project.id, true],
          ['Difficulty', 'B1 · Beginners welcome'],
          ['Genre', 'Fiction · Classic'],
          ['Forum category', 'Literature · 19th century'],
          ['Round', 'P1 (initial proofread)'],
          ['Format version', 'pgdp-format-2024.3'],
        ],
      },
      {
        key: 'fmt',
        label: 'Format & content',
        fields: [
          ['Page format', 'smooth-reading'],
          ['Illustrations', '12 figures · grayscale'],
          ['Footnotes', 'numbered, per-page'],
          ['Word lists', '+ 38 custom · derives from book'],
          ['Special chars', '— œ æ · long-s preserved'],
          ['PG submission', 'queued · awaiting cleared P3'],
        ],
      },
    ];

    // Default "Edit" button rendered in each section header.
    // WS1: correct class names — design-system uses .btn.ghost.sm not BEM modifiers
    const defaultEditButton = (
      <button className="btn ghost sm ap-section-header__edit" type="button">
        Edit
      </button>
    );

    return (
      <div ref={ref} className={cn('ap', className)} {...props}>
        {groups.map((g) => (
          <div key={g.key} className="ap-section ap-section--col">
            <CollapseHeader
              label={g.label}
              count={`${g.fields.length} fields`}
              isOpen={open[g.key]}
              onToggle={() => toggle(g.key)}
              actionSlot={sectionActions?.[g.key] ?? defaultEditButton}
            />
            {open[g.key] ? (
              <div className="ap-section__body">
                {g.fields.map(([fieldKey, fieldVal, mono], i) => (
                  <div key={i} className="ap-field-row">
                    <span className="ap-field-row__key">{fieldKey}</span>
                    <span className={cn('ap-field-row__value', mono === true ? 'mono' : undefined)}>
                      {fieldVal}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}

        {/* Project comments — long-form prose, spans all columns */}
        <div className="ap-section ap-section--full">
          <CollapseHeader
            label="Project comments"
            isOpen={open.comments}
            onToggle={() => toggle('comments')}
            actionSlot={sectionActions?.comments ?? defaultEditButton}
          />
          {open.comments ? (
            <div className="ap-comments__body">
              {children ?? (
                <p className="ap-comments__default">
                  Preserve em-dashes; long-s is already transcribed as &#x27;s&#x27;. Footnote
                  anchors use the form <span className="mono ap-comments__code">[Note 12]</span> at
                  the call site and <span className="mono ap-comments__code">[Footnote 12: …]</span>{' '}
                  at the bottom of the page. Italic for ship names and foreign phrases; small-caps
                  for chapter openings; preserve original spelling and punctuation throughout.
                </p>
              )}
            </div>
          ) : null}
        </div>
      </div>
    );
  },
);

AttributesPanel.displayName = 'AttributesPanel';
