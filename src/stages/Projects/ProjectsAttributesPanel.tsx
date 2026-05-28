/**
 * ProjectsAttributesPanel — thin wrapper around the AttributesPanel primitive
 * with projects-specific default sections.
 *
 * Design source:
 *   docs/templates/design_handoff_pdomain_ui/final/projects/projects.jsx lines 157-285
 *
 * Collapsible 2-column attributes panel for the projects detail pane:
 *   Bibliographic / PGDP project / Format & content / Project comments.
 *
 * When `sections` is omitted, default sections are derived from the `project`
 * shape and rendered via the underlying AttributesPanel primitive.
 * When `sections` is provided, they are rendered directly (overriding defaults).
 */
import * as React from 'react';
import { AttributesPanel } from '../../primitives/AttributesPanel.js';
import { PROJECTS_ATTRIBUTES_PANEL } from '../../testids/index.js';

// ─── Types ────────────────────────────────────────────────────────────────────

/** A single field row inside an AttributesPanelSection. */
export interface AttributesPanelField {
  /** Unique field key within this section. */
  id: string;
  /** Display label (left column). */
  label: string;
  /** Display value (right column). */
  value: string;
  /** Render the value in monospace font. */
  mono?: boolean;
}

/** A section displayed in the panel (used for custom-sections override). */
export interface AttributesPanelSection {
  /** Unique section key. */
  id: string;
  /** Section heading label. */
  label: string;
  /** Fields to display in a 2-column grid. */
  fields: AttributesPanelField[];
  /** Spans all columns (e.g. comments section). */
  fullWidth?: boolean;
}

/**
 * Minimal project shape accepted by ProjectsAttributesPanel.
 *
 * All fields are optional so consumers can pass partial data and get sane
 * placeholder-free sections.
 */
export interface ProjectSummary {
  /** Displayed in the Bibliographic "Title" field. */
  title?: string;
  /**
   * Bibliographic metadata key–value pairs (Language, Author, Edition, …).
   * Merged with the title field when building the default Bibliographic section.
   */
  bibliographic?: Record<string, string>;
  /**
   * PGDP project metadata key–value pairs (Project ID, Difficulty, Genre, …).
   */
  pgdp?: Record<string, string>;
  /**
   * Format & content metadata key–value pairs (Page format, Illustrations, …).
   */
  format?: Record<string, string>;
  /** Long-form prose shown in the Project comments section body. */
  comments?: string;
}

export interface ProjectsAttributesPanelProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  /**
   * The project data to display.
   * When `sections` is omitted, default sections are derived from this shape.
   */
  project: ProjectSummary;
  /**
   * Override the default 4 sections entirely.
   * When provided, rendered directly instead of delegating to the underlying
   * AttributesPanel primitive's built-in sections.
   */
  sections?: AttributesPanelSection[];
  /**
   * Called when a field value changes.
   * Signature: `(sectionId: string, fieldId: string, value: string) => void`.
   */
  onChange?: (sectionId: string, fieldId: string, value: string) => void;
}

// ─── Custom sections renderer ─────────────────────────────────────────────────

/** Simple collapsible section renderer used for the custom-sections override path. */
const CustomSectionsRenderer = ({
  sections,
  comments,
  onChange,
}: {
  sections: AttributesPanelSection[];
  comments?: string;
  onChange?: ProjectsAttributesPanelProps['onChange'];
}) => {
  const initialOpen = React.useMemo(() => {
    const init: Record<string, boolean> = {};
    for (const s of sections) {
      init[s.id] = true;
    }
    return init;
  }, [sections]);

  const [open, setOpen] = React.useState<Record<string, boolean>>(initialOpen);

  const toggle = (id: string) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="pap-custom-sections">
      {sections.map((section) => {
        const headerId = `pap-sec-hdr-${section.id}`;
        const bodyId = `pap-sec-body-${section.id}`;
        return (
          <div
            key={section.id}
            className={`ap-section${section.fullWidth === true ? ' ap-section--full' : ' ap-section--col'}`}
          >
            {/* Section header */}
            <div
              id={headerId}
              role="button"
              tabIndex={0}
              aria-expanded={open[section.id] ?? true}
              aria-controls={bodyId}
              onClick={() => toggle(section.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggle(section.id);
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
                    transform: (open[section.id] ?? true) ? 'rotate(0deg)' : 'rotate(-90deg)',
                    transition: 'transform .15s',
                  }}
                >
                  &#8964;
                </span>
                <span className="label ap-section-header__label">{section.label}</span>
                {section.fields.length > 0 ? (
                  <span className="mono ap-section-header__count">
                    {section.fields.length} fields
                  </span>
                ) : null}
              </span>
              {/* Prevent toggle propagation from action slot */}
              {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
              <span className="ap-section-header__actions" onClick={(e) => e.stopPropagation()}>
                <button className="btn ghost sm ap-section-header__edit" type="button">
                  Edit
                </button>
              </span>
            </div>

            {/* Section body */}
            {(open[section.id] ?? true) ? (
              <div id={bodyId} className="ap-section__body" aria-labelledby={headerId}>
                {section.id === 'comments' && section.fields.length === 0 ? (
                  <div className="ap-comments__body">
                    {comments !== undefined ? (
                      <p className="ap-comments__default">{comments}</p>
                    ) : null}
                  </div>
                ) : (
                  section.fields.map((field, i) => (
                    <div key={field.id} className="ap-field-row" data-index={i}>
                      <span className="ap-field-row__key">{field.label}</span>
                      <span
                        className={
                          field.mono === true ? 'mono ap-field-row__value' : 'ap-field-row__value'
                        }
                      >
                        {field.value}
                      </span>
                      {onChange !== undefined ? (
                        <input
                          className="sr-only"
                          aria-label={field.label}
                          defaultValue={field.value}
                          onChange={(e) => onChange(section.id, field.id, e.target.value)}
                        />
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

// ─── ProjectsAttributesPanel ─────────────────────────────────────────────────

/**
 * Thin wrapper around the `AttributesPanel` primitive with projects-specific
 * default sections.
 *
 * - When `sections` is omitted: derives Bibliographic / PGDP project /
 *   Format & content / Project comments from the `project` shape and
 *   delegates to the underlying `AttributesPanel` primitive.
 * - When `sections` is provided: renders them directly via the wrapper's
 *   own section renderer (primitive not used for section structure).
 */
export const ProjectsAttributesPanel = React.forwardRef<
  HTMLDivElement,
  ProjectsAttributesPanelProps
>(function ProjectsAttributesPanel({ project, sections, onChange, className, ...props }, ref) {
  if (sections !== undefined) {
    // Custom sections path — render via the wrapper's own section renderer.
    return (
      <div
        ref={ref}
        data-testid={PROJECTS_ATTRIBUTES_PANEL}
        className={className !== undefined ? `ap ${className}` : 'ap'}
        {...props}
      >
        <CustomSectionsRenderer
          sections={sections}
          {...(project.comments !== undefined ? { comments: project.comments } : {})}
          {...(onChange !== undefined ? { onChange } : {})}
        />
      </div>
    );
  }

  // Default path — delegate to the underlying AttributesPanel primitive.
  // Derive the minimal project shape the primitive requires.
  const bibExtra = project.bibliographic ?? {};
  const pgdpExtra = project.pgdp ?? {};
  const primitiveProject = {
    id: pgdpExtra['Project ID'] ?? '',
    title: project.title ?? '',
    author: bibExtra['Author'] ?? '',
  };

  return (
    <div
      ref={ref}
      data-testid={PROJECTS_ATTRIBUTES_PANEL}
      className={className !== undefined ? `pap-root ${className}` : 'pap-root'}
      {...props}
    >
      <AttributesPanel project={primitiveProject}>
        {project.comments !== undefined ? (
          <p className="ap-comments__default">{project.comments}</p>
        ) : undefined}
      </AttributesPanel>
    </div>
  );
});

ProjectsAttributesPanel.displayName = 'ProjectsAttributesPanel';
